import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { auth, logout } = useAuth();
  const role = auth.user?.role;
  const canAdmin = role === "Admin" || role === "President";
  const links = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/events", label: "Events" },
    { to: "/blog", label: "Blog" },
    { to: "/discussion", label: "Discussion" },
    ...(canAdmin ? [{ to: "/admin", label: "Admin" }] : []),
    ...(canAdmin ? [{ to: "/analytics", label: "Analytics" }] : [])
  ];

  if (!auth.user) {
    return (
      <nav className="nav nav--guest guest-top-nav">
        <Link to="/login">Sign In</Link>
        <Link to="/register">Get Started</Link>
      </nav>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Club Diary</h2>
        <p>Workspace</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/profile" className="nav-user-pill">
          <span className="nav-user-name">{auth.user.name}</span>
        </NavLink>
        <button type="button" className="nav-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
