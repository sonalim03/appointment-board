# The Appointment Board

A small full-stack app for a team to view, add, edit, complete, and cancel
appointments, with filtering by date and status and protection against
double-booking a time slot.

- **Backend:** FastAPI + SQLAlchemy (SQLite by default, swappable to
  Postgres/MySQL)
- **Frontend:** React + Vite, plain CSS (no UI kit)

## Project structure

```text
appointment-board/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app & routes
│   │   ├── models.py      # SQLAlchemy Appointment model
│   │   ├── schemas.py     # Pydantic request/response schemas + validation
│   │   ├── crud.py        # Business logic, incl. overlap checking
│   │   ├── database.py    # Engine/session setup
│   │   └── seed.py        # Sample appointments on first run
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js         # Fetch wrapper for the backend
│   │   ├── components/
│   │   └── index.css
│   └── package.json
├── screenshots/
│   ├── appointment-board.png
│   └── add-appointment.png
├── .gitignore
└── README.md
```

## Running it

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive docs are available at
`http://localhost:8000/docs`. On first run it seeds five sample appointments
(a mix of scheduled, completed, and cancelled) so the board is reviewable
immediately.

By default it uses a local `appointments.db` SQLite file — nothing to install.
To point it at Postgres or MySQL instead, set `DATABASE_URL` before starting
the server, e.g.:

```bash
export DATABASE_URL="postgresql+psycopg2://user:password@localhost:5432/appointments"
# pip install psycopg2-binary first
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173` and talks to the API at
`http://localhost:8000/api` by default. To change that, copy `.env.example`
to `.env` and set `VITE_API_URL`.

## How it works

- **Board view:** appointments are grouped by date and sorted by start time,
  agenda-style. Each row shows the time range, title, description, and a
  status marker.
- **Filters:** the sidebar lets you filter by a single date and/or status
  (scheduled / completed / cancelled). Filters are applied server-side via
  query parameters on `GET /api/appointments`.
- **Add / Edit:** a modal form collects title, description, date, start time,
  and end time. The same form and validation are used for both.
- **Complete / Cancel:** one-click actions on scheduled appointments. Once an
  appointment is cancelled or completed it can no longer be edited — it's
  either canceled or done. Cancelled appointments stay on the board with a
  "Cancelled" tag and struck-through title, as the task calls for.
- **Double-booking prevention:** before creating or editing an appointment,
  the backend checks for any other **non-cancelled** appointment on the same
  date whose time range overlaps the requested one
  (`existing.start < new.end AND new.start < existing.end`). If one is found,
  the API returns `409 Conflict` with a message naming the clashing
  appointment, which the form surfaces to the user. Cancelling an appointment
  frees its slot back up.
- **Validation:** title, date, start time, and end time are required; end
  time must be after start time. This is checked in the React form for fast
  feedback and re-checked by the API (Pydantic + the overlap check) so the
  rules hold regardless of what the client sends.
- **Messages:** a toast confirms successful actions ("Appointment added.",
  "Cancelled '…'."); form errors (missing fields, bad time range, slot
  conflicts) show inline above the form; a full-page load error is shown if
  the API is unreachable.

## Assumptions made

- **No login/auth.** The brief describes "a small team" board without
  mentioning accounts, so this is a single shared board with no user
  concept. Everyone who has the link can see and manage every appointment.
- **SQLite for local review**, with `DATABASE_URL` as the one-line switch to
  Postgres/MySQL, since the task lists both as acceptable and a reviewer
  shouldn't need a database server running just to try the app.
- **One resource type (time slots aren't tied to a specific person/room).**
  The brief says "team appointments" without describing multiple calendars
  or resources, so all appointments compete for the same shared timeline.
  Overlap is checked per calendar day.
- **Cancelled ≠ deletable.** The brief explicitly says cancelled appointments
  "remain visible and are clearly marked," so there's no destructive delete
  in the UI — cancel is a status change, not a removal.
- **Completed and cancelled appointments are locked.** Once an appointment is
  marked completed or cancelled, editing is disabled (no edit/complete/cancel
  buttons on those rows) since re-opening a finished appointment isn't part
  of the described flow.
- **Filtering by date is a single-day filter**, not a date range, matching
  "filter appointments by date" in the expected flow rather than a from/to
  range.

## API summary

| Method | Path                              | Purpose                                  |
| ------ | --------------------------------- | ----------------------------------------- |
| GET    | `/api/appointments?date=&status=` | List appointments, optionally filtered   |
| POST   | `/api/appointments`               | Create an appointment                    |
| PUT    | `/api/appointments/{id}`          | Edit an appointment                      |
| PATCH  | `/api/appointments/{id}/complete` | Mark as completed                        |
| PATCH  | `/api/appointments/{id}/cancel`   | Cancel                                   |

Full request/response schemas are in the auto-generated docs at `/docs` once
the backend is running.
