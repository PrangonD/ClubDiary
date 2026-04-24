// Feature 2 (Sprint 1) - Profile Management UI - Owner: Prapty
import { useEffect, useState } from "react";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { patchUser } = useAuth();
  const [form, setForm] = useState({ name: "", department: "", bio: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/profile")
      .then(({ data }) => {
        setForm({ name: data.name || "", department: data.department || "", bio: data.bio || "" });
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile");
      });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (form.name.length > 80) {
      setError("Name must be 80 characters or fewer");
      return;
    }
    if (form.department.length > 80 || form.bio.length > 500) {
      setError("Department or bio exceeds allowed length");
      return;
    }

    setSaving(true);
    try {
      const { data } = await API.put("/profile", form);
      patchUser({ name: data.user.name });
      setMessage("Profile updated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card page" onSubmit={submit}>
      <div className="page-hero">
        <h2 className="page-title">Profile Management</h2>
        <p className="page-subtitle">Keep your personal information and public bio up to date.</p>
      </div>
      {error && <p className="error">{error}</p>}
      {message && <p className="notice">{message}</p>}
      <div className="section-card">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
        <input
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="Department"
        />
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" />
      </div>
      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
