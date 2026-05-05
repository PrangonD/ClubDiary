const express = require("express");
const cors = require("cors");
const { getDbState } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const clubRoutes = require("./routes/clubRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const eventRoutes = require("./routes/eventRoutes");
const postRoutes = require("./routes/postRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(require("path").join(__dirname, "..", "uploads")),
);

app.get("/", (_req, res) => {
  res.json({ message: "Club Diary API running" });
});

app.get("/health", (_req, res) => {
  const db = getDbState();
  res.status(db.isConnected ? 200 : 503).json({
    status: db.isConnected ? "ok" : "degraded",
    db,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/media", mediaRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
