export function formatDayHeading(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(hhmmss) {
  const [h, m] = hhmmss.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m), 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function groupByDate(appointments) {
  const groups = new Map();
  for (const appt of appointments) {
    if (!groups.has(appt.date)) groups.set(appt.date, []);
    groups.get(appt.date).push(appt);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}
