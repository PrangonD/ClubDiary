import { Link } from "react-router-dom";

export default function ClubCard({ club, onJoin }) {
  return (
    <div className="club-card">
      {/* Top Cover Section */}
      <div className="club-cover">
        {/* Floating Badge */}
        <span className="category-badge">{club.category}</span>
      </div>

      {/* Card Body */}
      <div className="club-body">
        {/* Club Name */}
        <Link to={`/clubs/${club._id}`} className="club-name-link">
          <strong>{club.name}</strong>
        </Link>

        {/* Description */}
        <p className="lead-muted">{club.description}</p>

        {/* Card Footer */}
        <div className="club-footer">
          {/* Left side - Members count */}
          <span className="meta-text">
            Members: {club.membersCount || club.memberCount || 0}
          </span>

          {/* Right side - Join button */}
          <button
            type="button"
            className="btn-pill"
            onClick={() => onJoin(club._id)}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
