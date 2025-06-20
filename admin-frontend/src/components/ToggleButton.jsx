import React from "react";
import "./ToggleButton.css";

function ToggleButton({ checked, onToggle }) {
  return (
    <div>
      <button
        className={`toggle-btn ${checked ? "toggled" : ""}`}
        onClick={onToggle}
      >
        <div className="thumb"></div>
      </button>
    </div>
  );
}

export default ToggleButton;
