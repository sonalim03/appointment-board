from datetime import date as date_type
from datetime import time as time_type
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from .models import AppointmentStatus


class AppointmentBase(BaseModel):
    title: str
    description: Optional[str] = ""
    date: date_type
    start_time: time_type
    end_time: time_type

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title is required.")
        return v.strip()

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, v: time_type, info):
        start = info.data.get("start_time")
        if start is not None and v <= start:
            raise ValueError("End time must be after start time.")
        return v


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(AppointmentBase):
    """Full update used by the edit form (title/date/time/description)."""

    pass


class AppointmentOut(AppointmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: AppointmentStatus


class ErrorResponse(BaseModel):
    detail: str
