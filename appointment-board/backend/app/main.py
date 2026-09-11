from datetime import date as date_type
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, SessionLocal, engine, get_db
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Appointment Board API", version="1.0.0")

# Wide-open CORS: this is a take-home project meant to be run locally by a
# reviewer, not a production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/api/appointments", response_model=list[schemas.AppointmentOut])
def read_appointments(
    date: Optional[date_type] = None,
    status: Optional[models.AppointmentStatus] = None,
    db: Session = Depends(get_db),
):
    return crud.list_appointments(db, date=date, status=status)


@app.post(
    "/api/appointments",
    response_model=schemas.AppointmentOut,
    status_code=201,
    responses={409: {"model": schemas.ErrorResponse}, 422: {"model": schemas.ErrorResponse}},
)
def create_appointment(payload: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_appointment(db, payload)
    except crud.SlotConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@app.put(
    "/api/appointments/{appointment_id}",
    response_model=schemas.AppointmentOut,
    responses={
        404: {"model": schemas.ErrorResponse},
        409: {"model": schemas.ErrorResponse},
        422: {"model": schemas.ErrorResponse},
    },
)
def update_appointment(
    appointment_id: str, payload: schemas.AppointmentUpdate, db: Session = Depends(get_db)
):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    try:
        return crud.update_appointment(db, appointment, payload)
    except crud.SlotConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.patch(
    "/api/appointments/{appointment_id}/complete",
    response_model=schemas.AppointmentOut,
    responses={404: {"model": schemas.ErrorResponse}, 422: {"model": schemas.ErrorResponse}},
)
def complete_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    try:
        return crud.set_status(db, appointment, models.AppointmentStatus.completed)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.patch(
    "/api/appointments/{appointment_id}/cancel",
    response_model=schemas.AppointmentOut,
    responses={404: {"model": schemas.ErrorResponse}, 422: {"model": schemas.ErrorResponse}},
)
def cancel_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    try:
        return crud.set_status(db, appointment, models.AppointmentStatus.cancelled)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.get("/api/health")
def health():
    return {"status": "ok"}
