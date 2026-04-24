// Feature 1 (Sprint 1) - Register UI - Owner: MUNEEM
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setBusy(true);
      await login(form, true);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={submit}>
        <h2 className="auth-title">Create an account</h2>
        <p className="lead-muted">New users are created as Student by default.</p>
        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "Creating account..." : "Register"}
        </button>
        <p className="auth-footnote">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
