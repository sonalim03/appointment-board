from datetime import date, time, timedelta

from sqlalchemy.orm import Session

from . import models


def seed_if_empty(db: Session):
    if db.query(models.Appointment).count() > 0:
        return

    today = date.today()
    tomorrow = today + timedelta(days=1)

    samples = [
        dict(
            title="Design review with Priya",
            description="Walk through the new onboarding screens.",
            date=today,
            start_time=time(10, 0),
            end_time=time(10, 30),
            status=models.AppointmentStatus.scheduled,
        ),
        dict(
            title="Client call - Meridian Corp",
            description="Quarterly check-in and renewal discussion.",
            date=today,
            start_time=time(13, 0),
            end_time=time(14, 0),
            status=models.AppointmentStatus.scheduled,
        ),
        dict(
            title="Standup",
            description="Daily sync with the engineering team.",
            date=today,
            start_time=time(9, 0),
            end_time=time(9, 15),
            status=models.AppointmentStatus.completed,
        ),
        dict(
            title="Vendor demo",
            description="Cancelled - vendor rescheduling for next month.",
            date=tomorrow,
            start_time=time(11, 0),
            end_time=time(12, 0),
            status=models.AppointmentStatus.cancelled,
        ),
        dict(
            title="1:1 with Arjun",
            description="Monthly career conversation.",
            date=tomorrow,
            start_time=time(15, 30),
            end_time=time(16, 0),
            status=models.AppointmentStatus.scheduled,
        ),
    ]

    for data in samples:
        db.add(models.Appointment(**data))
    db.commit()
