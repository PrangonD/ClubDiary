import { Link } from "react-router-dom";

export default function ClubList({
  clubs,
  loading,
  error,
  onEdit,
  onDelete,
  onRetry,
}) {
  if (loading) {
    return <div className="lead-muted">Loading clubs...</div>;
  }

  if (error) {
    return (
      <div className="error-card">
        <p className="error">{error}</p>
        <button type="button" onClick={onRetry} className="btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  if (!clubs || clubs.length === 0) {
    return (
      <div className="empty-state">
        <p>No clubs found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="clubs-table-container">
      <table className="clubs-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Members</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr key={club._id} className="club-row">
              <td className="club-name">
                <strong>{club.name}</strong>
              </td>
              <td className="club-category">
                <span className="category-badge">{club.category}</span>
              </td>
              <td className="club-description">
                <span className="desc-text">
                  {club.description || "(no description)"}
                </span>
              </td>
              <td className="club-members">
                <span className="member-count">
                  {club.membersCount || club.memberCount || 0}
                </span>
              </td>
              <td className="club-actions">
                <button
                  type="button"
                  onClick={() => onEdit(club)}
                  className="btn-icon btn-edit"
                  title="Edit club"
                >
                  <img
                    src="/assets/edit.png"
                    alt="Edit"
                    style={{ width: "18px", height: "18px" }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(club)}
                  className="btn-icon btn-delete"
                  title="Delete club"
                >
                  <img
                    src="/assets/delete.png"
                    alt="Delete"
                    style={{ width: "18px", height: "18px" }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => (window.location.href = `/clubs/${club._id}`)}
                  className="btn-icon btn-view"
                  title="View club"
                >
                  <img
                    src="/assets/view.png"
                    alt="View"
                    style={{ width: "18px", height: "18px" }}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
