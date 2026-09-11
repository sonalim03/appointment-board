const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      body?.detail ||
      (Array.isArray(body?.detail) ? body.detail.map((d) => d.msg).join(", ") : null) ||
      "Something went wrong. Please try again.";
    throw new Error(typeof message === "string" ? message : "Something went wrong.");
  }
  return body;
}

export function fetchAppointments({ date, status } = {}) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(`/appointments${qs ? `?${qs}` : ""}`);
}

export function createAppointment(payload) {
  return request("/appointments", { method: "POST", body: JSON.stringify(payload) });
}

export function updateAppointment(id, payload) {
  return request(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function completeAppointment(id) {
  return request(`/appointments/${id}/complete`, { method: "PATCH" });
}

export function cancelAppointment(id) {
  return request(`/appointments/${id}/cancel`, { method: "PATCH" });
}
