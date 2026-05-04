// Feature 5/8 (Sprint 1/2) - Club Explorer Dashboard + Join Request UI - Owners: PRANGON, Prapty
import { useEffect, useState } from "react";
import { API } from "../api";
import { errorAlert, successAlert } from "../utils/alerts";

export default function DashboardPage() {
  const [clubs, setClubs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadClubs = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get(`/clubs?page=${nextPage}&limit=6`);
      setClubs(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load clubs");
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const { data } = await API.get("/memberships/mine?page=1&limit=5");
      setRequests(data.items || []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    loadClubs(1);
    loadRequests();
  }, []);

  const applyJoin = async (clubId) => {
    try {
      await API.post("/memberships/join", { clubId });
      successAlert("Join request submitted");
      loadRequests();
    } catch (err) {
      errorAlert("Request failed", err.response?.data?.message || "");
    }
  };

  return (
    <div className="card dashboard-card page">
      <div className="page-hero">
        <h2 className="page-title">Club Explorer Dashboard</h2>
        <p className="page-subtitle">Browse clubs, submit join requests, and track your request statuses.</p>
      </div>

      <div className="section-head">
        <h3>Available Clubs</h3>
        <span className="stat-pill">{clubs.length} clubs on this page</span>
      </div>

      {error && (
        <div className="error-card">
          <p className="error">{error}</p>
          <button type="button" onClick={() => loadClubs(page)}>
            Retry
          </button>
        </div>
      )}

      {loading && <p className="lead-muted">Loading clubs...</p>}
      {!loading && clubs.length === 0 && <p className="empty-state">No clubs available yet.</p>}

      <div className="soft-grid">
      {clubs.map((club) => (
        <div key={club._id} className="club-card">
          <div className="club-cover" />
          <div className="club-body">
            <div className="club-meta">
              <strong>{club.name}</strong>
              <span className="club-category">{club.category}</span>
            </div>
            <p className="lead-muted">{club.description}</p>
            <p className="meta-text">Members: {club.membersCount || club.memberCount || 0}</p>
            <button type="button" className="btn-pill" onClick={() => applyJoin(club._id)}>
              Join
            </button>
          </div>
        </div>
      ))}
      </div>

      <div className="pager">
        <button type="button" disabled={page <= 1} onClick={() => loadClubs(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button type="button" disabled={page >= totalPages} onClick={() => loadClubs(page + 1)}>
          Next
        </button>
      </div>

      <div className="section-card">
      <h3>My Join Requests</h3>
      {requests.length === 0 && <p className="lead-muted">No requests yet.</p>}
      {requests.map((r) => (
        <div key={r._id} className="row">
          <span>
            {r.club?.name} <span className={`status status-${r.status}`}>{r.status}</span>
          </span>
          <small>{new Date(r.createdAt).toLocaleString()}</small>
        </div>
      ))}
      </div>
    </div>
  );
}
