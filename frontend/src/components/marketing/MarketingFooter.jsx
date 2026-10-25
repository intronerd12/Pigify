import React from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../BrandMark'
import { BRAND_NAME } from '../../config/brand'
import './MarketingNav.css'

const PLATFORM_LINKS = [
  { to: '/about', label: 'About Pigify' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/features', label: 'Features' },
  { to: '/home', label: 'Scanner Workspace' },
]

const ACCESS_LINKS = [
  { to: '/', label: 'Overview' },
  { to: '/home', label: 'Scanner' },
  { to: '/login', label: 'Farm Login' },
]

function MarketingFooter() {
  return (
    <footer className="lp-footer">
      <div className="container-pro lp-footer-grid">
        {/* Brand & Purpose */}
        <div className="lp-footer-brand">
          <Link to="/" className="lp-brand" aria-label={`${BRAND_NAME} Home`}>
            <BrandMark size={38} />
            <div className="lp-brand-copy">
              <span className="lp-brand-name">{BRAND_NAME}</span>
              <span className="lp-brand-tag">Swine Health System</span>
            </div>
          </Link>
          <p className="lp-footer-copy">
            A deep learning-based swine disease and symptom monitoring system for backyard farms. Designed to assist smallholder pig farmers with visual symptom detection and health record keeping.
          </p>
          <div className="lp-footer-meta">
            <span>YOLOv8 Detection</span>
            <span>Backyard Swine Health</span>
            <span>Symptom Monitoring</span>
          </div>
        </div>

        {/* Platform Links */}
        <div className="lp-footer-links">
          <h3 className="lp-footer-heading">Platform</h3>
          {PLATFORM_LINKS.map((item) => (
            <Link key={item.to} to={item.to} className="lp-footer-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Access Links */}
        <div className="lp-footer-links">
          <h3 className="lp-footer-heading">Access</h3>
          {ACCESS_LINKS.map((item) => (
            <Link key={item.to} to={item.to} className="lp-footer-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Telemetry Status Console */}
        <div className="lp-footer-telemetry">
          <h3 className="lp-footer-heading">System Overview</h3>
          <div className="lp-telemetry-box">
            <div className="lp-telemetry-status">
              <span className="lp-telemetry-dot" />
              <span>SYSTEM ACTIVE</span>
            </div>
            <div className="lp-telemetry-row">
              <span className="lp-tel-key">Detection Model</span>
              <span className="lp-tel-val">YOLOv8</span>
            </div>
            <div className="lp-telemetry-row">
              <span className="lp-tel-key">Supported Platform</span>
              <span className="lp-tel-val">Web &amp; Mobile</span>
            </div>
            <div className="lp-telemetry-row">
              <span className="lp-tel-key">Severity Levels</span>
              <span className="lp-tel-val">Mild / Mod / Severe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container-pro lp-footer-bottom">
        <span>© {new Date().getFullYear()} {BRAND_NAME}. A deep learning-based swine disease and symptom monitoring system for backyard farms.</span>
        <div className="lp-footer-legal">
          <Link to="/about">About</Link>
          <Link to="/features">Features</Link>
          <Link to="/how-it-works">How It Works</Link>
        </div>
      </div>
    </footer>
  )
}

export default MarketingFooter
