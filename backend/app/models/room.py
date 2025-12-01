from sqlalchemy import Column, String, Text, DateTime, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base
import uuid
from datetime import datetime


class Room(Base):
    """Room model for storing collaborative editing rooms."""

    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    code = Column(Text, default="# Start coding here...\n")
    language = Column(String(50), default="python")
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(),
                        onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Room(id={self.id}, language={self.language})>"
