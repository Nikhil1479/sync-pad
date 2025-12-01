from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.room import Room
from app.schemas.room import RoomCreate
import uuid


class RoomService:
    """Service for room-related operations."""

    @staticmethod
    async def create_room(db: AsyncSession, room_data: RoomCreate) -> Room:
        """Create a new room."""
        room = Room(
            id=str(uuid.uuid4()),
            language=room_data.language or "python"
        )
        db.add(room)
        await db.commit()
        await db.refresh(room)
        return room

    @staticmethod
    async def get_room(db: AsyncSession, room_id: str) -> Room | None:
        """Get a room by ID."""
        result = await db.execute(select(Room).where(Room.id == room_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_room_code(db: AsyncSession, room_id: str, code: str) -> Room | None:
        """Update room code."""
        room = await RoomService.get_room(db, room_id)
        if room:
            room.code = code
            await db.commit()
            await db.refresh(room)
        return room

    @staticmethod
    async def get_or_create_room(db: AsyncSession, room_id: str) -> Room:
        """Get existing room or create new one with specified ID."""
        room = await RoomService.get_room(db, room_id)
        if not room:
            room = Room(id=room_id)
            db.add(room)
            await db.commit()
            await db.refresh(room)
        return room
