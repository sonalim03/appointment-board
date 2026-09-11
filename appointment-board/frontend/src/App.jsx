import { useCallback, useEffect, useState } from "react";

import {
  cancelAppointment,
  completeAppointment,
  createAppointment,
  fetchAppointments,
  updateAppointment,
} from "./api.js";
import AgendaList from "./components/AgendaList.jsx";
import AppointmentModal from "./components/AppointmentModal.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Toast from "./components/Toast.jsx";

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ date: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalState, setModalState] = useState(null); // null | {} (add) | appointment (edit)
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchAppointments({
        date: filters.date || undefined,
        status: filters.status || undefined,
      });
      setAppointments(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  function notify(message, type = "success") {
    setToast({ message, type });
  }

  async function handleSave(payload) {
    if (modalState?.id) {
      await updateAppointment(modalState.id, payload);
      notify("Appointment updated.");
    } else {
      await createAppointment(payload);
      notify("Appointment added.");
    }
    setModalState(null);
    load();
  }

  async function handleComplete(appt) {
    try {
      await completeAppointment(appt.id);
      notify(`Marked "${appt.title}" as completed.`);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  async function handleCancel(appt) {
    try {
      await cancelAppointment(appt.id);
      notify(`Cancelled "${appt.title}".`);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <div className="app">
      <Sidebar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({ date: "", status: "" })}
        onAdd={() => setModalState({})}
      />

      <main className="main">
        <div className="main-header">
          <h1>Appointments</h1>
          {!loading && !loadError && (
            <span className="result-count">
              {appointments.length} {appointments.length === 1 ? "result" : "results"}
            </span>
          )}
        </div>

        {loading && <p>Loading…</p>}
        {loadError && <div className="form-error">{loadError}</div>}
        {!loading && !loadError && (
          <AgendaList
            appointments={appointments}
            onEdit={setModalState}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        )}
      </main>

      {modalState !== null && (
        <AppointmentModal
          initial={modalState.id ? modalState : null}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
