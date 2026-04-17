// src/components/ThemeToggle.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, changeTheme, THEMES } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="theme-toggle-wrap">
      {/* Theme options panel */}
      {open && (
        <div className="theme-panel">
          <p className="theme-panel-title">Choose Theme</p>
          <div className="theme-options">
            {Object.entries(THEMES).map(([key, { label, icon }]) => (
              <button
                key={key}
                className={`theme-option ${theme === key ? 'active' : ''}`}
                onClick={() => { changeTheme(key); setOpen(false); }}
              >
                <span className="theme-option-icon">{icon}</span>
                <span className="theme-option-label">{label}</span>
                {theme === key && <span className="theme-option-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        className="theme-fab"
        onClick={() => setOpen(!open)}
        title="Change Theme"
        aria-label="Change Theme"
      >
        {THEMES[theme]?.icon}
      </button>
    </div>
  );
}