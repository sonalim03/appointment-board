import { formatDayHeading, formatTime, groupByDate } from "../utils.js";

export default function AgendaList({ appointments, onEdit, onComplete, onCancel }) {
  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <h3>No appointments here yet</h3>
        <p>Add one, or try a different date or status filter.</p>
      </div>
    );
  }

  const groups = groupByDate(appointments);

  return (
    <>
      {groups.map(([date, items]) => (
        <div className="day-group" key={date}>
          <div className="day-heading">{formatDayHeading(date)}</div>
          {items.map((appt) => (
            <div className={`row status-${appt.status}`} key={appt.id}>
              <div className="row-time">
                {formatTime(appt.start_time)}
                <br />
                {formatTime(appt.end_time)}
              </div>
              <div className="row-rail" />
              <div className="row-body">
                <h4>{appt.title}</h4>
                {appt.description && <p>{appt.description}</p>}
                {appt.status === "completed" && (
                  <span className="status-tag completed">Completed</span>
                )}
                {appt.status === "cancelled" && (
                  <span className="status-tag cancelled">Cancelled</span>
                )}
              </div>
              {appt.status === "scheduled" && (
                <div className="row-actions">
                  <button type="button" onClick={() => onEdit(appt)}>
                    Edit
                  </button>
                  <button type="button" className="primary" onClick={() => onComplete(appt)}>
                    Complete
                  </button>
                  <button type="button" className="danger" onClick={() => onCancel(appt)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
