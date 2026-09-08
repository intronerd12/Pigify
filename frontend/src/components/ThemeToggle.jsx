import React from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ showLabel = true, className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`pigify-theme-switch ${isDark ? 'is-dark' : 'is-light'} ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (Current: ${theme})`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {/* Corner calibration accents */}
      <span className="pts-corner pts-tl" aria-hidden="true" />
      <span className="pts-corner pts-br" aria-hidden="true" />

      {/* Pill track */}
      <div className="pts-track">
        {/* Sliding Thumb */}
        <div className="pts-thumb">
          {isDark ? (
            <Moon size={14} className="pts-icon-moon" />
          ) : (
            <Sun size={14} className="pts-icon-sun" />
          )}
        </div>

        {/* Backdrop Ambient Icons */}
        <div className="pts-icons-bg" aria-hidden="true">
          <Sun size={11} className="pts-bg-sun" />
          <Moon size={11} className="pts-bg-moon" />
        </div>
      </div>

      {/* Dynamic Telemetry Label */}
      {showLabel && (
        <span className="pts-label">
          {isDark ? (
            <>
              <span className="pts-dot" />
              <span>DARK</span>
            </>
          ) : (
            <>
              <span className="pts-dot pts-dot-light" />
              <span>LIGHT</span>
            </>
          )}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
