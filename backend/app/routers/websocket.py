from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import json
from app.database import get_db, async_session_maker
from app.services.connection_manager import manager
from app.services.room_service import RoomService

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for real-time code collaboration.

    Handles:
    - Connection establishment
    - Code updates broadcast to all room participants
    - Cursor position updates
    - Disconnection cleanup
    """
    # Get or create room and load initial state
    async with async_session_maker() as db:
        room = await RoomService.get_or_create_room(db, room_id)
        manager.set_initial_state(room_id, room.code)

    # Connect the WebSocket
    await manager.connect(websocket, room_id)

    # Notify others about new user
    await manager.broadcast_to_room(
        room_id,
        {
            "type": "user_joined",
            "users": manager.get_connection_count(room_id)
        },
        exclude=websocket
    )

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            message_type = message.get("type", "code_update")

            if message_type == "code_update":
                # Update in-memory state
                code = message.get("code", "")
                manager.update_room_state(room_id, code)

                # Persist to database periodically (simple approach)
                async with async_session_maker() as db:
                    await RoomService.update_room_code(db, room_id, code)

                # Broadcast to other users in the room
                await manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "code_update",
                        "code": code,
                        "cursorPosition": message.get("cursorPosition")
                    },
                    exclude=websocket
                )

            elif message_type == "cursor_update":
                # Broadcast cursor position to other users
                await manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "cursor_update",
                        "cursorPosition": message.get("cursorPosition"),
                        "userId": message.get("userId")
                    },
                    exclude=websocket
                )

            elif message_type == "ping":
                # Keep-alive ping
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        # Handle disconnection
        manager.disconnect(websocket, room_id)

        # Notify others about user leaving
        await manager.broadcast_to_room(
            room_id,
            {
                "type": "user_left",
                "users": manager.get_connection_count(room_id)
            }
        )

    except Exception as e:
        # Handle other errors
        manager.disconnect(websocket, room_id)
        print(f"WebSocket error: {e}")
