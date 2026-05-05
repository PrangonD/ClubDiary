import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import { errorAlert } from "../utils/alerts";
import MediaGallery from "../components/MediaGallery";
import MediaUpload from "../components/MediaUpload";

export default function ClubProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Fetch club data on component mount
  useEffect(() => {
    const fetchClub = async () => {
      if (!id) {
        setError("Club ID not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data } = await API.get(`/clubs/${id}`);
        setClub(data);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to load club details";
        setError(errorMessage);
        errorAlert("Error", errorMessage);

        // Redirect to clubs page if club not found
        if (err.response?.status === 404) {
          navigate("/clubs", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id, navigate]);

  const applyJoin = async () => {
    if (!club || joining) return;

    setJoining(true);
    try {
      await API.post("/memberships/join", { clubId: club._id });
      successAlert("Join request submitted successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to submit join request";
      errorAlert("Request failed", errorMessage);
    } finally {
      setJoining(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="card page">
        <div
          className="skeleton"
          style={{ height: "200px", marginBottom: "20px" }}
        ></div>
        <div
          className="skeleton"
          style={{ height: "150px", marginBottom: "20px" }}
        ></div>
        <div className="skeleton" style={{ height: "300px" }}></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card page">
        <div className="error-card">
          <h3>Unable to Load Club</h3>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => navigate("/clubs")}
            className="btn-secondary"
          >
            Back to Clubs
          </button>
        </div>
      </div>
    );
  }

  // Club not found
  if (!club) {
    return (
      <div className="card page">
        <div className="empty-state">
          <h3>Club Not Found</h3>
          <p>The club you're looking for doesn't exist or has been removed.</p>
          <button
            type="button"
            onClick={() => navigate("/clubs")}
            className="btn-primary"
          >
            Browse All Clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card page">
      {/* Club Header */}
      <div className="page-hero">
        <div className="club-header">
          <div className="club-info">
            <h1 className="club-title">{club.name}</h1>
            <div className="club-meta">
              <span className="category-badge">{club.category}</span>
              <span className="member-count">
                {club.membersCount || club.memberCount || 0} Members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Club Description */}
      <div className="section-card">
        <h3>About This Club</h3>
        <p className="club-description">
          {club.description || "No description available for this club."}
        </p>
      </div>

      {/* Club Statistics */}
      <div className="section-card">
        <h3>Club Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <strong>Total Members</strong>
            <span>{club.membersCount || club.memberCount || 0}</span>
          </div>
          <div className="stat-item">
            <strong>Total Events</strong>
            <span>{club.eventsCount || 0}</span>
          </div>
          <div className="stat-item">
            <strong>Active Discussions</strong>
            <span>{club.discussionsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="section-card">
        <div className="section-head">
          <h3>Upcoming Events</h3>
          <button className="btn-primary compact-btn">View All</button>
        </div>
        <div className="events-list">
          {club.events && club.events.length > 0 ? (
            club.events.map((event) => (
              <div key={event._id} className="event-item">
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p className="event-date">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="event-status">
                  {event.status || "Upcoming"}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No upcoming events scheduled.</p>
            </div>
          )}
        </div>
      </div>

      {/* Club Members Section */}
      <div className="section-card">
        <div className="section-head">
          <h3>Club Members</h3>
          <button className="btn-primary compact-btn">View All</button>
        </div>
        <div className="members-list">
          {club.members && club.members.length > 0 ? (
            club.members.slice(0, 6).map((member) => (
              <div key={member._id} className="member-item">
                <div className="member-avatar">
                  {member.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="member-info">
                  <strong>{member.name}</strong>
                  <span className="member-role">{member.role || "Member"}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No members have joined this club yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Discussions Section */}
      <div className="section-card">
        <div className="section-head">
          <h3>Recent Discussions</h3>
          <button className="btn-primary compact-btn">View All</button>
        </div>
        <div className="discussions-list">
          {club.discussions && club.discussions.length > 0 ? (
            club.discussions.map((discussion) => (
              <div key={discussion._id} className="discussion-item">
                <h4>{discussion.title}</h4>
                <p className="discussion-preview">
                  {discussion.content?.substring(0, 100)}...
                </p>
                <div className="discussion-meta">
                  <span>By {discussion.author?.name || "Anonymous"}</span>
                  <span>
                    {new Date(discussion.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No discussions started yet.</p>
            </div>
          )}
        </div>
      </div>
      {/* Media Gallery Section */}
      <MediaGallery clubId={id} />
      {/* Upload Modal */}
      {showUpload && (
        <MediaUpload
          clubId={id}
          onClose={() => setShowUpload(false)}
          onUploadSuccess={() => {}}
        />
      )}

      {/* Action Buttons */}
      <div className="button-row">
        <button className="btn-primary" onClick={applyJoin} disabled={joining}>
          {joining ? "Joining..." : "Join Club"}
        </button>
        <button className="btn-secondary">Contact Club</button>
        <button className="btn-secondary" onClick={() => navigate("/clubs")}>
          Back to Clubs
        </button>
      </div>
    </div>
  );
}
