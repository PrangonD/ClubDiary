// Feature 17 (Sprint 3) - News/Blog UI - Owner: PRANGON
import { useEffect, useState } from "react";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { confirmAlert, errorAlert, successAlert } from "../utils/alerts";

const initialEdit = { id: "", title: "", content: "", clubId: "" };
const initialDraft = { title: "", content: "", clubId: "" };

export default function BlogPage() {
  const { auth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(initialEdit);
  const [draft, setDraft] = useState(initialDraft);
  const [createOpen, setCreateOpen] = useState(false);
  const canManage = ["Admin", "President"].includes(auth.user?.role);

  const load = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const [{ data: postRes }, { data: clubRes }] = await Promise.all([
        API.get(`/posts?page=${nextPage}&limit=6`),
        API.get("/clubs")
      ]);
      setPosts(postRes.items || []);
      setTotalPages(postRes.totalPages || 1);
      setPage(postRes.page || 1);
      setClubs(clubRes.items || []);
      if (clubRes.items?.[0]) {
        setDraft((s) => ({ ...s, clubId: s.clubId || clubRes.items[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const startEdit = (p) => {
    setEdit({ id: p._id, title: p.title, content: p.content, clubId: p.club?._id || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/posts/${edit.id}`, {
        title: edit.title,
        content: edit.content,
        clubId: edit.clubId
      });
      setEdit(initialEdit);
      successAlert("Post updated");
      load(page);
    } catch (err) {
      errorAlert("Could not update post", err.response?.data?.message || "");
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    try {
      await API.post("/posts", draft);
      setDraft((s) => ({ ...initialDraft, clubId: s.clubId }));
      setCreateOpen(false);
      successAlert("Post created");
      load(1);
    } catch (err) {
      errorAlert("Could not create post", err.response?.data?.message || "");
    }
  };

  const removePost = async (id) => {
    const ok = await confirmAlert("Delete post?", "This post will be removed permanently.", "Delete");
    if (!ok) return;
    try {
      await API.delete(`/posts/${id}`);
      successAlert("Post deleted");
      load(page);
    } catch (err) {
      errorAlert("Could not delete post", err.response?.data?.message || "");
    }
  };

  return (
    <div className="card page">
      <div className="page-hero">
        <h2 className="page-title">News and Blog</h2>
        <p className="page-subtitle">Read updates from clubs and manage posts with cleaner editorial controls.</p>
      </div>
      {error && <p className="error">{error}</p>}
      {loading && <p className="lead-muted">Loading posts...</p>}

      {canManage && edit.id && (
        <form className="section-card" onSubmit={saveEdit}>
          <h3>Edit Post</h3>
          <input value={edit.title} onChange={(e) => setEdit((s) => ({ ...s, title: e.target.value }))} required />
          <textarea value={edit.content} onChange={(e) => setEdit((s) => ({ ...s, content: e.target.value }))} required />
          <select value={edit.clubId} onChange={(e) => setEdit((s) => ({ ...s, clubId: e.target.value }))} required>
            <option value="">Select club</option>
            {clubs.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="row-actions">
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEdit(initialEdit)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {posts.map((p) => (
        <div key={p._id} className="row section-card">
          <div>
            <strong>{p.title}</strong>
            <p className="lead-muted">{p.club?.name} | {new Date(p.createdAt).toLocaleString()}</p>
            <p>{p.content}</p>
            <small>By {p.author?.name}</small>
          </div>
          {canManage && (
            <div className="row-actions">
              <button type="button" className="mini-action" title="Edit post" onClick={() => startEdit(p)}>
                Edit
              </button>
              <button type="button" className="mini-action mini-action-danger" title="Delete post" onClick={() => removePost(p._id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
      {!loading && posts.length === 0 && <p className="empty-state">No posts published yet.</p>}

      <div className="pager">
        <button type="button" disabled={page <= 1} onClick={() => load(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button type="button" disabled={page >= totalPages} onClick={() => load(page + 1)}>
          Next
        </button>
      </div>
      {canManage && (
        <button type="button" className="fab-create" onClick={() => setCreateOpen(true)}>
          + Create Post
        </button>
      )}
      {canManage && createOpen && (
        <div className="modal-backdrop" onClick={() => setCreateOpen(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <form className="section-card" onSubmit={createPost}>
              <h3>Create Post</h3>
              <input value={draft.title} onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))} required />
              <textarea value={draft.content} onChange={(e) => setDraft((s) => ({ ...s, content: e.target.value }))} required />
              <select value={draft.clubId} onChange={(e) => setDraft((s) => ({ ...s, clubId: e.target.value }))} required>
                {clubs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="button-row">
                <button type="submit">Publish</button>
                <button type="button" onClick={() => setCreateOpen(false)}>
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
