// Bug.jsx - Represents a single bug in the game

import React from "react";

function Bug({ squashed, onSquash }) {
  return (
    <div
      style={{
        display: "inline-block",
        margin: "10px",
        cursor: squashed ? "default" : "pointer",
        opacity: squashed ? 0.5 : 1,
        transition: "opacity 0.2s"
      }}
      onClick={squashed ? undefined : onSquash}
      aria-label={squashed ? "Squashed bug" : "Unsquashed bug"}
    >
      <img
        src="/bug.png"
        alt={squashed ? "Squashed bug" : "Bug"}
        style={{
          width: 48,
          height: 48,
          filter: squashed ? "grayscale(100%) blur(1px)" : "none",
          transition: "filter 0.2s"
        }}
      />
      {squashed && (
        <div style={{ color: "red", fontWeight: "bold", fontSize: 12, textAlign: "center" }}>
          SQUASHED
        </div>
      )}
    </div>
  );
}

export default Bug;