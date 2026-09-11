import { useState } from "react";

const emptyForm = { title: "", description: "", date: "", start_time: "", end_time: "" };

export default function AppointmentModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?.id);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    if (!form.title.trim()) return "Title is required.";
    if (!form.date) return "Date is required.";
    if (!form.start_time || !form.end_time) return "Start and end time are required.";
    if (form.end_time <= form.start_time) return "End time must be after start time.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description?.trim() || "",
        date: form.date,
        start_time: withSeconds(form.start_time),
        end_time: withSeconds(form.end_time),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "Edit appointment" : "Add appointment"}</h2>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Client call"
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details"
            />
          </div>

          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          <div className="field field-row">
            <div>
              <label htmlFor="start_time">Start time</label>
              <input
                id="start_time"
                type="time"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="end_time">End time</label>
              <input
                id="end_time"
                type="time"
                value={form.end_time}
                onChange={(e) => set("end_time", e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// <input type="time"> gives "HH:MM"; the API expects "HH:MM:SS".
function withSeconds(value) {
  return value.length === 5 ? `${value}:00` : value;
}
