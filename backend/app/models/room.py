from sqlalchemy import Column, String, Text, DateTime
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
    # Use Python-side defaults for MySQL 5.5 compatibility
    # (MySQL 5.5 only allows one TIMESTAMP with CURRENT_TIMESTAMP)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Room(id={self.id}, language={self.language})>"
