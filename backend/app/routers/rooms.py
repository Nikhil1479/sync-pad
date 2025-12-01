from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.room import RoomCreate, RoomResponse
from app.services.room_service import RoomService

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("", response_model=dict)
async def create_room(
    room_data: RoomCreate = RoomCreate(),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new collaborative editing room.

    Returns the room ID that can be used to join the room.
    """
    room = await RoomService.create_room(db, room_data)
    return {
        "roomId": room.id,
        "code": room.code,
        "language": room.language
    }


@router.get("/{room_id}")
async def get_room(
    room_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get room details by ID.
    """
    room = await RoomService.get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    return {
        "roomId": room.id,
        "code": room.code,
        "language": room.language,
        "created_at": room.created_at
    }
