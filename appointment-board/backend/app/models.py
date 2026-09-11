import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Enum, String, Time
from sqlalchemy.orm import validates

from .database import Base


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=_new_id)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True, default="")
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(
        Enum(AppointmentStatus), nullable=False, default=AppointmentStatus.scheduled
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates("title")
    def _validate_title(self, key, value):
        if not value or not value.strip():
            raise ValueError("Title is required.")
        return value.strip()
