from datetime import date as date_type
from typing import Optional

from sqlalchemy import and_
from sqlalchemy.orm import Session

from . import models, schemas


class SlotConflictError(Exception):
    """Raised when a requested time slot overlaps an existing appointment."""


def _overlaps(db: Session, date, start_time, end_time, exclude_id: Optional[str] = None):
    """
    Two ranges [s1, e1) and [s2, e2) overlap when s1 < e2 and s2 < e1.
    Cancelled appointments free up their slot, so they are excluded from the check.
    """
    query = db.query(models.Appointment).filter(
        models.Appointment.date == date,
        models.Appointment.status != models.AppointmentStatus.cancelled,
        models.Appointment.start_time < end_time,
        models.Appointment.end_time > start_time,
    )
    if exclude_id:
        query = query.filter(models.Appointment.id != exclude_id)
    return query.first()


def list_appointments(
    db: Session,
    date: Optional[date_type] = None,
    status: Optional[models.AppointmentStatus] = None,
):
    query = db.query(models.Appointment)
    if date is not None:
        query = query.filter(models.Appointment.date == date)
    if status is not None:
        query = query.filter(models.Appointment.status == status)
    return query.order_by(models.Appointment.date, models.Appointment.start_time).all()


def get_appointment(db: Session, appointment_id: str):
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id)
        .first()
    )


def create_appointment(db: Session, payload: schemas.AppointmentCreate):
    conflict = _overlaps(db, payload.date, payload.start_time, payload.end_time)
    if conflict:
        raise SlotConflictError(
            f"That slot overlaps '{conflict.title}' "
            f"({conflict.start_time.strftime('%H:%M')}-{conflict.end_time.strftime('%H:%M')})."
        )
    appointment = models.Appointment(**payload.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def update_appointment(
    db: Session, appointment: models.Appointment, payload: schemas.AppointmentUpdate
):
    if appointment.status == models.AppointmentStatus.cancelled:
        raise ValueError("Cancelled appointments cannot be edited.")

    conflict = _overlaps(
        db, payload.date, payload.start_time, payload.end_time, exclude_id=appointment.id
    )
    if conflict:
        raise SlotConflictError(
            f"That slot overlaps '{conflict.title}' "
            f"({conflict.start_time.strftime('%H:%M')}-{conflict.end_time.strftime('%H:%M')})."
        )

    for field, value in payload.model_dump().items():
        setattr(appointment, field, value)
    db.commit()
    db.refresh(appointment)
    return appointment


def set_status(db: Session, appointment: models.Appointment, status: models.AppointmentStatus):
    if appointment.status == models.AppointmentStatus.cancelled:
        raise ValueError("Cancelled appointments cannot be changed further.")
    if appointment.status == models.AppointmentStatus.completed and status != models.AppointmentStatus.completed:
        raise ValueError("Completed appointments cannot be reopened.")
    appointment.status = status
    db.commit()
    db.refresh(appointment)
    return appointment
