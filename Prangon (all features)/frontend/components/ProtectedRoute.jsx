// Feature 3 (Sprint 2) - Role-Based Access Control in frontend routes - Owner: MUNEEM
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const { auth } = useAuth();
  if (!auth.token) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(auth.user?.role)) {
    return (
      <div className="card denied-message">
        <h2>Access restricted</h2>
        <p>Your role does not include this area. Contact an admin if you need access.</p>
      </div>
    );
  }
  return children;
}
