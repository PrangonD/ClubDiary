// Feature 20 (Sprint 4) - Discussion Forum UI - Owner: PRANGON
import { useEffect, useState } from "react";
import { API } from "../api";

export default function DiscussionPage() {
  const [clubs, setClubs] = useState([]);
  const [clubId, setClubId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [blocked, setBlocked] = useState("");
  const [sendError, setSendError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadClubs = async () => {
    const { data } = await API.get("/clubs?page=1&limit=100");
    setClubs(data.items || []);
    if (data.items?.[0]) setClubId(data.items[0]._id);
  };

  const loadMessages = async (id, nextPage = 1, merge = false) => {
    if (!id) return;
    setBlocked("");
    try {
      const { data } = await API.get(`/discussions/${id}?page=${nextPage}&limit=30`);
      setMessages((prev) => (merge ? [...data.items, ...prev] : data.items));
      setPage(data.page);
      setHasMore(data.page < data.totalPages);
    } catch (err) {
      setMessages([]);
      setBlocked(err.response?.data?.message || "Could not load discussion for this club.");
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    if (!clubId) return;
    loadMessages(clubId, 1, false);
    const timer = setInterval(() => loadMessages(clubId, 1, false), 8000);
    return () => clearInterval(timer);
  }, [clubId]);

  const send = async (e) => {
    e.preventDefault();
    setSendError("");
    if (!text.trim()) return;
    try {
      await API.post("/discussions", { clubId, text });
      setText("");
      loadMessages(clubId, 1, false);
    } catch (err) {
      setSendError(err.response?.data?.message || "Message could not be sent.");
    }
  };

  const loadOlder = () => {
    const next = page + 1;
    loadMessages(clubId, next, true);
  };

  return (
    <div className="card page">
      <div className="page-hero">
        <h2 className="page-title">Discussion Forum</h2>
        <p className="page-subtitle">Switch clubs, catch up on messages, and keep conversations organized.</p>
      </div>

      <div className="discussion-layout">
        <div className="section-card stack-md">
          <h3>Clubs</h3>
          {clubs.map((club) => (
            <button key={club._id} type="button" className="btn-pill" onClick={() => setClubId(club._id)}>
              {club.name}
            </button>
          ))}
        </div>

        <div className="section-card chat-panel">
          <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
            {clubs.map((club) => (
              <option key={club._id} value={club._id}>
                {club.name}
              </option>
            ))}
          </select>

          {blocked && <p className="error">{blocked}</p>}
          {hasMore && (
            <button type="button" onClick={loadOlder}>
              Load older messages
            </button>
          )}

          <div className="chatBox chat-messages">
            {messages.map((msg) => (
              <div key={msg._id} className="chat-message">
                <span className="chat-avatar">{(msg.createdBy?.name || "U").slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{msg.createdBy?.name || "User"}</strong>
                  <small className="meta-text"> {new Date(msg.createdAt).toLocaleTimeString()}</small>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form className="section-card" onSubmit={send}>
        {sendError && <p className="error">{sendError}</p>}
        <div className="chat-input-row">
          <input placeholder="Write a message..." value={text} onChange={(e) => setText(e.target.value)} required />
          <button type="button" className="icon-btn" title="Emoji">
            🙂
          </button>
          <button type="button" className="icon-btn" title="Attachment">
            📎
          </button>
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
