from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RoomCreate(BaseModel):
    """Schema for creating a new room."""
    language: Optional[str] = "python"


class RoomResponse(BaseModel):
    """Schema for room response."""
    roomId: str
    code: str
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


class RoomCodeUpdate(BaseModel):
    """Schema for updating room code via WebSocket."""
    code: str
    cursor_position: Optional[int] = None


class AutocompleteRequest(BaseModel):
    """Schema for autocomplete request."""
    code: str
    cursorPosition: int
    language: str = "python"


class AutocompleteResponse(BaseModel):
    """Schema for autocomplete response."""
    suggestion: str
    insertPosition: int
