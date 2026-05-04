// Feature 10/11/12 (Sprint 2/3/5) - Event management, calendar view, attendance UI - Owners: PRANGON, MUNEEM
import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, startOfWeek as startW, endOfWeek } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { confirmAlert, errorAlert, successAlert } from "../utils/alerts";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function rangeFor(view, pivot) {
  const d = pivot || new Date();
  if (view === "week") {
    return { start: startW(d), end: endOfWeek(d) };
  }
  return { start: startOfMonth(d), end: endOfMonth(d) };
}

export default function EventsPage() {
  const { auth } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", date: "", clubId: "" });
  const [attendance, setAttendance] = useState({ eventId: "", userId: "", scanCode: "SIMULATED-SCAN" });
  const [attendanceOptions, setAttendanceOptions] = useState({ events: [], users: [] });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [calendarView, setCalendarView] = useState("month");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canManage = ["Admin", "President"].includes(auth.user?.role);

  const loadData = async () => {
    setError("");
    try {
      const [{ data: clubRes }] = await Promise.all([API.get("/clubs?page=1&limit=100")]);
      setClubs(clubRes.items || []);
      if (clubRes.items?.[0]) setForm((old) => ({ ...old, clubId: old.clubId || clubRes.items[0]._id }));

      const r = rangeFor(calendarView, calendarDate);
      const query = new URLSearchParams({ start: r.start.toISOString(), end: r.end.toISOString(), page: "1", limit: "300" });
      const { data: eventRes } = await API.get(`/events?${query.toString()}`);
      setEvents(eventRes.items || []);

      if (canManage) {
        const { data: options } = await API.get("/attendance/options");
        setAttendanceOptions(options);
        setAttendance((prev) => ({
          ...prev,
          eventId: prev.eventId || options.events?.[0]?._id || "",
          userId: prev.userId || options.users?.[0]?._id || ""
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load events data");
    }
  };

  useEffect(() => {
    loadData();
  }, [calendarView, calendarDate, canManage]);

  const createEvent = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await API.post("/events", form);
      setForm({ ...form, title: "", description: "" });
      successAlert("Event created");
      loadData();
    } catch (err) {
      errorAlert("Could not create event", err.response?.data?.message || "");
    }
  };

  const deleteEvent = async (eventId) => {
    const ok = await confirmAlert("Delete event?", "This action cannot be undone.", "Delete");
    if (!ok) return;
    try {
      await API.delete(`/events/${eventId}`);
      successAlert("Event deleted");
      loadData();
    } catch (err) {
      errorAlert("Could not delete event", err.response?.data?.message || "");
    }
  };

  const recordAttendance = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await API.post("/attendance/scan", attendance);
      successAlert("Attendance saved");
    } catch (err) {
      errorAlert("Could not save attendance", err.response?.data?.message || "");
    }
  };

  const calendarEvents = useMemo(
    () =>
      events.map((ev) => ({
        id: ev._id,
        title: `${ev.title} (${ev.club?.name || "Club"})`,
        start: new Date(ev.date),
        end: new Date(ev.date),
        allDay: false,
        resource: ev
      })),
    [events]
  );

  return (
    <div className="card page">
      <div className="page-hero">
        <h2 className="page-title">Events and Calendar</h2>
        <p className="page-subtitle">Plan activities, monitor upcoming sessions, and track attendance in one place.</p>
      </div>
      {error && <p className="error">{error}</p>}
      {message && <p className="notice">{message}</p>}

      {canManage && (
        <button type="button" className="fab-create" onClick={() => setShowCreateModal(true)}>
          + Create Event
        </button>
      )}

      <div className="events-grid">
      <div className="section-card calendar-panel">
      <div className="calendar-toolbar">
        <button type="button" onClick={() => setCalendarView("month")} className={calendarView === "month" ? "active" : ""}>
          Month
        </button>
        <button type="button" onClick={() => setCalendarView("week")} className={calendarView === "week" ? "active" : ""}>
          Week
        </button>
      </div>

      <div className="calendar-wrap">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 420 }}
          view={calendarView}
          onView={(v) => setCalendarView(v)}
          date={calendarDate}
          onNavigate={(d) => setCalendarDate(d)}
        />
      </div>
      </div>

      <div className="section-card upcoming-panel">
      <h3>Upcoming Events</h3>
      <div className="upcoming-list">
      {events.length === 0 && <p className="empty-state">No events found for this date range.</p>}
      {events.map((event) => (
        <div key={event._id} className="event-item-card">
          <div className="event-item-head">
            <strong>{event.title}</strong>
            <span className="event-date-badge">{new Date(event.date).toLocaleString()}</span>
          </div>
          <span className="meta-text">Club: {event.club?.name}</span>
          <div className="event-item-actions">
            {canManage && (
              <button type="button" className="mini-action mini-action-danger" onClick={() => deleteEvent(event._id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
      </div>
      </div>
      </div>

      {canManage && (
        <form className="section-card" onSubmit={recordAttendance}>
          <h3>Attendance Tracking (simulated scan)</h3>
          <select value={attendance.eventId} onChange={(e) => setAttendance({ ...attendance, eventId: e.target.value })} required>
            <option value="">Select event</option>
            {attendanceOptions.events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title} ({new Date(e.date).toLocaleDateString()})
              </option>
            ))}
          </select>
          <select value={attendance.userId} onChange={(e) => setAttendance({ ...attendance, userId: e.target.value })} required>
            <option value="">Select member</option>
            {attendanceOptions.users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          <input value={attendance.scanCode} onChange={(e) => setAttendance({ ...attendance, scanCode: e.target.value })} />
          <button type="submit">Save Attendance</button>
        </form>
      )}

      {canManage && showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <form className="section-card" onSubmit={(e) => createEvent(e).then(() => setShowCreateModal(false))}>
              <h3>Create Event</h3>
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <select value={form.clubId} onChange={(e) => setForm({ ...form, clubId: e.target.value })} required>
                {clubs.map((club) => (
                  <option key={club._id} value={club._id}>
                    {club.name}
                  </option>
                ))}
              </select>
              <div className="button-row">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
