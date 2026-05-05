import { Route, Routes, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import EventsPage from "./pages/EventsPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import DiscussionPage from "./pages/DiscussionPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BlogPage from "./pages/BlogPage";

export default function App() {
  const { auth } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isLoggedIn = Boolean(auth.user);

  if (!isLoggedIn && isAuthPage) {
    return (
      <div className="auth-shell">
        <header className="auth-shell-header">
          <div>
            <h1 className="logo">Club Diary</h1>
            <p className="logo-sub">Modern club management workspace</p>
          </div>
          <NavBar />
        </header>
        <main className="auth-shell-main">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell saas-shell">
      <NavBar />
      <div className="saas-main">
        <header className="topbar">
          <p className="topbar-label">Modern club management workspace</p>
        </header>
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blog"
                element={
                  <ProtectedRoute>
                    <BlogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["Admin", "President"]}>
                    <AdminPanelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discussion"
                element={
                  <ProtectedRoute>
                    <DiscussionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute roles={["Admin", "President"]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
