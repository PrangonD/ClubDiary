// Feature 15/19 (Sprint 5) - Budget Tracking + Basic Analytics UI - Owner: PRANGON (feature 19)
import { useEffect, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from "chart.js";
import { API } from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({ start: "", end: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.start) params.set("start", filters.start);
      if (filters.end) params.set("end", filters.end);
      const { data } = await API.get(`/analytics?${params.toString()}`);
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const chartData = useMemo(() => {
    if (!analytics) return null;
    return {
      labels: ["Members", "Events", "Fees", "Expenses"],
      datasets: [
        {
          label: "Club Stats",
          data: [analytics.members, analytics.events, analytics.finances.totalFees, analytics.finances.totalExpenses],
          backgroundColor: ["#60a5fa", "#34d399", "#f59e0b", "#f87171"]
        }
      ]
    };
  }, [analytics]);

  const trendData = useMemo(() => {
    if (!analytics) return null;
    const labels = Array.from(new Set([
      ...(analytics.trends?.expensesByMonth || []).map((x) => x._id),
      ...(analytics.trends?.feesByMonth || []).map((x) => x._id)
    ])).sort();
    const expenseMap = Object.fromEntries((analytics.trends?.expensesByMonth || []).map((x) => [x._id, x.total]));
    const feeMap = Object.fromEntries((analytics.trends?.feesByMonth || []).map((x) => [x._id, x.total]));

    return {
      labels,
      datasets: [
        {
          label: "Fees",
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.18)",
          pointRadius: 4,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
          data: labels.map((k) => Number(feeMap[k] || 0))
        },
        {
          label: "Expenses",
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.18)",
          pointRadius: 4,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
          data: labels.map((k) => Number(expenseMap[k] || 0))
        }
      ]
    };
  }, [analytics]);

  const trendOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { position: "top" }
      }
    }),
    []
  );

  return (
    <div className="card page">
      <div className="page-hero">
        <h2 className="page-title">Analytics Dashboard</h2>
        <p className="page-subtitle">Track membership, activity, and finances with quick filters and trend charts.</p>
      </div>

      <div className="filters section-card">
        <input type="date" value={filters.start} onChange={(e) => setFilters((s) => ({ ...s, start: e.target.value }))} />
        <input type="date" value={filters.end} onChange={(e) => setFilters((s) => ({ ...s, end: e.target.value }))} />
        <button type="button" onClick={load}>
          Apply Filters
        </button>
      </div>

      {loading && <p className="lead-muted">Loading analytics...</p>}
      {error && (
        <div className="error-card">
          <p className="error">{error}</p>
          <button type="button" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {analytics && (
        <>
          <p className="lead-muted">{analytics.cached ? "Showing cached result (45s cache)." : "Live result."}</p>
          <div className="analytics-kpis">
            <div className="kpi"><span className="meta-text">Approved Members</span><strong>{analytics.members}</strong></div>
            <div className="kpi"><span className="meta-text">Total Events</span><strong>{analytics.events}</strong></div>
            <div className="kpi"><span className="meta-text">Total Fees</span><strong>{analytics.finances.totalFees}</strong></div>
            <div className="kpi"><span className="meta-text">Total Expenses</span><strong>{analytics.finances.totalExpenses}</strong></div>
            <div className="kpi"><span className="meta-text">Budget Balance</span><strong>{analytics.finances.budgetBalance}</strong></div>
          </div>
          {analytics.finances.overspending && (
            <p className="error">Overspending alert: over budget by {analytics.finances.overspendingAmount}</p>
          )}

          <h3>Budget Tracking</h3>
          <div className="progress">
            <div
              className="progressFill"
              style={{
                width: `${
                  analytics.finances.totalFees === 0
                    ? 0
                    : Math.min((analytics.finances.totalExpenses / analytics.finances.totalFees) * 100, 100)
                }%`
              }}
            />
          </div>

          <div className="section-card">{chartData && <Bar data={chartData} />}</div>
          <div className="section-card">{trendData && trendData.labels.length > 0 && <Line data={trendData} options={trendOptions} />}</div>
        </>
      )}
    </div>
  );
}
