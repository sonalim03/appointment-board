const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function Sidebar({ filters, onChange, onClear, onAdd }) {
  const hasFilters = filters.date || filters.status;

  return (
    <aside className="sidebar">
      <div className="brand">
        The Board
        <span>Team appointments</span>
      </div>

      <div className="filter-group">
        <h3>Date</h3>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <h3>Status</h3>
        <div className="status-pills">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`status-pill ${filters.status === opt.value ? "active" : ""}`}
              onClick={() => onChange({ ...filters, status: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button type="button" className="clear-filters" onClick={onClear}>
          Clear filters
        </button>
      )}

      <button type="button" className="add-button" onClick={onAdd}>
        + Add appointment
      </button>
    </aside>
  );
}
