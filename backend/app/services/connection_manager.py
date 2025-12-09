from fastapi import WebSocket
from typing import Dict, Set, Optional
import asyncio
import json


class ConnectionManager:
    """Manages WebSocket connections for real-time collaboration."""

    def __init__(self):
        # room_id -> set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # room_id -> current code state (in-memory cache)
        self.room_states: Dict[str, str] = {}
        # room_id -> pending save task for debouncing
        self._save_tasks: Dict[str, asyncio.Task] = {}
        # room_id -> flag indicating if state is dirty (needs saving)
        self._dirty_rooms: Set[str] = set()
        # Debounce delay in seconds
        self.SAVE_DEBOUNCE_DELAY = 2.0

    async def connect(self, websocket: WebSocket, room_id: str) -> None:
        """Accept a new WebSocket connection and add it to the room."""
        await websocket.accept()

        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()

        self.active_connections[room_id].add(websocket)

        # Send current room state to the new connection
        if room_id in self.room_states:
            await websocket.send_json({
                "type": "init",
                "code": self.room_states[room_id]
            })

    def disconnect(self, websocket: WebSocket, room_id: str) -> None:
        """Remove a WebSocket connection from the room."""
        if room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)

            # Clean up empty rooms
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_room(
        self,
        room_id: str,
        message: dict,
        exclude: WebSocket | None = None
    ) -> None:
        """Broadcast a message to all connections in a room except the sender."""
        if room_id not in self.active_connections:
            return

        disconnected = set()

        for connection in self.active_connections[room_id]:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)

        # Clean up disconnected connections
        for conn in disconnected:
            self.active_connections[room_id].discard(conn)

    def update_room_state(self, room_id: str, code: str) -> None:
        """Update the in-memory code state for a room."""
        self.room_states[room_id] = code
        self._dirty_rooms.add(room_id)

    def get_room_state(self, room_id: str) -> str:
        """Get the current code state for a room."""
        return self.room_states.get(room_id, "# Start coding here...\n")

    def set_initial_state(self, room_id: str, code: str) -> None:
        """Set initial state for a room if not already set."""
        if room_id not in self.room_states:
            self.room_states[room_id] = code

    def get_connection_count(self, room_id: str) -> int:
        """Get the number of active connections in a room."""
        return len(self.active_connections.get(room_id, set()))

    def schedule_save(self, room_id: str, save_callback) -> None:
        """Schedule a debounced save for the room."""
        # Cancel any existing save task for this room
        if room_id in self._save_tasks:
            self._save_tasks[room_id].cancel()

        async def debounced_save():
            try:
                await asyncio.sleep(self.SAVE_DEBOUNCE_DELAY)
                if room_id in self._dirty_rooms:
                    code = self.room_states.get(room_id)
                    if code is not None:
                        await save_callback(room_id, code)
                        self._dirty_rooms.discard(room_id)
            except asyncio.CancelledError:
                pass  # Task was cancelled, new save scheduled
            except Exception as e:
                print(f"Error saving room {room_id}: {e}")
            finally:
                self._save_tasks.pop(room_id, None)

        self._save_tasks[room_id] = asyncio.create_task(debounced_save())

    async def force_save_room(self, room_id: str, save_callback) -> None:
        """Force immediate save of room state (used on disconnect)."""
        # Cancel any pending save
        if room_id in self._save_tasks:
            self._save_tasks[room_id].cancel()
            self._save_tasks.pop(room_id, None)

        if room_id in self._dirty_rooms:
            code = self.room_states.get(room_id)
            if code is not None:
                await save_callback(room_id, code)
                self._dirty_rooms.discard(room_id)


# Global connection manager instance
manager = ConnectionManager()
