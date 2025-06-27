// Game.jsx - Main game interface for bug squashing

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Bug from "./Bug";

const BACKEND_URL = "http://localhost:4000";

function Game() {
  const { sessionId } = useParams();
  const [bugCount, setBugCount] = useState(0);
  const [squashed, setSquashed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrophy, setShowTrophy] = useState(false);
  const socketRef = useRef(null);

  // Fetch initial session state
  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/session/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setBugCount(data.bugCount);
          setSquashed(data.squashed);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
  }, [sessionId]);

  // Set up Socket.IO connection
  useEffect(() => {
    if (!sessionId) return;
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-session", sessionId);
    });

    socket.on("session-update", (data) => {
      setBugCount(data.bugCount);
      setSquashed(data.squashed);
    });

    socket.on("show-trophy", () => {
      setShowTrophy(true);
    });

    socket.on("error", (msg) => {
      setError(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const handleSquash = (bugIndex) => {
    if (squashed.includes(bugIndex) || showTrophy) return;
    socketRef.current.emit("squash-bug", { sessionId, bugIndex });
  };

  if (loading) return <div>Loading game...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h2>Bug Bash Game</h2>
      <div style={{ display: "flex", flexWrap: "wrap", maxWidth: 600 }}>
        {Array.from({ length: bugCount }).map((_, i) => (
          <Bug
            key={i}
            squashed={squashed.includes(i)}
            onSquash={() => handleSquash(i)}
          />
        ))}
      </div>
      {showTrophy && (
        <div style={{ marginTop: 30 }}>
          <img
            src="/trophy.png"
            alt="Trophy"
            style={{ width: 120, display: "block", margin: "0 auto" }}
          />
          <h3 style={{ textAlign: "center", color: "gold" }}>All bugs squashed!</h3>
        </div>
      )}
    </div>
  );
}

export default Game;