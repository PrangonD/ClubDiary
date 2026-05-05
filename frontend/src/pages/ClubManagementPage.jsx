// Club Management CRUD Page - Admin only
import { useEffect, useState } from "react";
import { API } from "../api";
import { confirmAlert, errorAlert, successAlert } from "../utils/alerts";
import ClubForm from "../components/ClubForm";
import ClubList from "../components/ClubList";

export default function ClubManagementPage() {
  const [clubs, setClubs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Load clubs from API
  const loadClubs = async (nextPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get(`/clubs?page=${nextPage}&limit=100`);
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

  useEffect(() => {
    loadClubs(1);
  }, []);

  // Handle create club form submission
  const handleCreateClub = async (formData) => {
    setFormLoading(true);
    try {
      await API.post("/clubs", formData);
      successAlert("Club created successfully");
      setShowCreateModal(false);
      loadClubs(1);
    } catch (err) {
      errorAlert("Failed to create club", err.response?.data?.message || "");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit club form submission
  const handleUpdateClub = async (formData) => {
    if (!editingClub) return;
    setFormLoading(true);
    try {
      await API.put(`/clubs/${editingClub._id}`, formData);
      successAlert("Club updated successfully");
      setShowEditModal(false);
      setEditingClub(null);
      loadClubs(page);
    } catch (err) {
      errorAlert("Failed to update club", err.response?.data?.message || "");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete club
  const handleDeleteClub = async (club) => {
    const confirmed = await confirmAlert(
      "Delete Club?",
      `Are you sure you want to delete "${club.name}"? This action cannot be undone.`,
      "Delete",
    );
    if (!confirmed) return;

    try {
      await API.delete(`/clubs/${club._id}`);
      successAlert("Club deleted successfully");
      loadClubs(page);
    } catch (err) {
      errorAlert("Failed to delete club", err.response?.data?.message || "");
    }
  };

  // Handle edit button click
  const handleEditClick = (club) => {
    setEditingClub(club);
    setShowEditModal(true);
  };

  // Handle modal cancellation
  const handleCancelCreate = () => {
    setShowCreateModal(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingClub(null);
  };

  // Filter clubs based on search and category
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || club.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["All", ...new Set(clubs.map((club) => club.category))];

  return (
    <div className="card page">
      <div className="page-header-with-action">
        <div>
          <h2 className="page-title">Club Management</h2>
          <p className="page-subtitle">
            Create, edit, and manage all university clubs
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="create-btn"
        >
          + Create Club
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by club name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clubs List */}
      <ClubList
        clubs={filteredClubs}
        loading={loading}
        error={error}
        onEdit={handleEditClick}
        onDelete={handleDeleteClub}
        onRetry={() => loadClubs(page)}
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pager">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => loadClubs(page - 1)}
          >
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => loadClubs(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCancelCreate}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Club</h2>
              <button
                type="button"
                className="modal-close"
                onClick={handleCancelCreate}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ClubForm
                club={null}
                onSubmit={handleCreateClub}
                onCancel={handleCancelCreate}
                isLoading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {showEditModal && editingClub && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Club</h2>
              <button
                type="button"
                className="modal-close"
                onClick={handleCancelEdit}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ClubForm
                club={editingClub}
                onSubmit={handleUpdateClub}
                onCancel={handleCancelEdit}
                isLoading={formLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
