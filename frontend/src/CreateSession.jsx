// CreateSession.jsx - Form to create a new bug bash session

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateSession() {
  const [bugCount, setBugCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bugCount: Number(bugCount) }),
      });
      const data = await res.json();
      if (res.ok && data.sessionId) {
        navigate(`/session/${data.sessionId}`);
      } else {
        setError(data.error || "Failed to create session");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create a Bug Bash Session</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Number of bugs (1-100):{" "}
          <input
            type="number"
            min="1"
            max="100"
            value={bugCount}
            onChange={(e) => setBugCount(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Session"}
        </button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default CreateSession;