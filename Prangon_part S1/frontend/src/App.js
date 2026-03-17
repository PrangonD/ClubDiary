import React, { useState, useEffect } from 'react';
import './App.css';

const CATEGORIES = ['All', 'Technology', 'Arts', 'Sports', 'Science', 'Music', 'Literature'];

function App() {
  const [clubs, setClubs]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null); // selected club for detail view

  // Fetch clubs whenever search or category changes
  useEffect(() => {
    fetchClubs();
  }, [search, category]);

  // Fetch stats once on load
  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchClubs() {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/clubs?';
      if (search)              url += `search=${search}&`;
      if (category !== 'All')  url += `category=${category}`;

      const res  = await fetch(url);
      const data = await res.json();
      setClubs(data.data);
    } catch (err) {
      console.log('Error fetching clubs:', err);
    }
    setLoading(false);
  }

  async function fetchStats() {
    try {
      const res  = await fetch('http://localhost:5000/api/stats');
      const data = await res.json();
      setStats(data.data);
    } catch (err) {
      console.log('Error fetching stats:', err);
    }
  }

  // Show detail page if a club is selected
  if (selected) {
    return <ClubDetail club={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-badge">✦ Club Diary</div>
        <h1 className="hero-title">Find Your <span>Community</span></h1>
        <p className="hero-sub">Discover clubs that match your passion.</p>

        {/* Search */}
        <div className="search-bar">
          <span>🔍</span>
          <input
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}>✕</button>}
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats">
            <div className="stat"><span className="stat-num">{stats.totalClubs}</span><span className="stat-lbl">Clubs</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">{stats.totalMembers}</span><span className="stat-lbl">Members</span></div>
          </div>
        )}
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── CLUB GRID ── */}
      <div className="main">
        {loading && <p className="center-text">Loading clubs...</p>}

        {!loading && clubs.length === 0 && (
          <div className="empty">
            <p>😕 No clubs found. Try a different search.</p>
          </div>
        )}

        {!loading && clubs.length > 0 && (
          <div className="grid">
            {clubs.map((club) => (
              <ClubCard key={club._id} club={club} onClick={() => setSelected(club)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CLUB CARD COMPONENT ──────────────────────────────────
function ClubCard({ club, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <img
        className="card-img"
        src={club.coverImage || 'https://via.placeholder.com/400x200'}
        alt={club.name}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200'; }}
      />
      <div className="card-body">
        <span className="card-category">{club.category}</span>
        <h3 className="card-name">{club.name}</h3>
        <p className="card-desc">{club.description}</p>
        <div className="card-tags">
          {club.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
        <div className="card-footer">
          <span>👥 {club.memberCount} members</span>
          <span>📅 {club.meetingSchedule}</span>
        </div>
        <button className="card-btn">View Details →</button>
      </div>
    </div>
  );
}

// ── CLUB DETAIL COMPONENT ────────────────────────────────
function ClubDetail({ club, onBack }) {
  return (
    <div className="detail">
      <button className="back-btn" onClick={onBack}>← Back</button>

      <img
        className="detail-img"
        src={club.coverImage || 'https://via.placeholder.com/800x300'}
        alt={club.name}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/800x300'; }}
      />

      <div className="detail-body">
        <span className="card-category">{club.category}</span>
        <h1 className="detail-name">{club.name}</h1>
        <p className="detail-desc">{club.description}</p>

        <div className="detail-stats">
          <div className="detail-stat"><strong>{club.memberCount}</strong><span>Members</span></div>
          <div className="detail-stat"><strong>📅</strong><span>{club.meetingSchedule}</span></div>
          {club.contactEmail && (
            <div className="detail-stat"><strong>✉️</strong><span>{club.contactEmail}</span></div>
          )}
        </div>

        <div className="card-tags" style={{ marginTop: 16 }}>
          {club.tags?.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>

        {club.contactEmail && (
          <a href={`mailto:${club.contactEmail}`} className="contact-btn">
            ✉️ Contact Club
          </a>
        )}
      </div>
    </div>
  );
}

export default App;
