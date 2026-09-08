import React from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../BrandMark'
import { BRAND_NAME } from '../../config/brand'
import './MarketingNav.css'

const PLATFORM_LINKS = [
  { to: '/about', label: 'About Pigify' },
  { to: '/how-it-works', label: 'Diagnostic Pipeline' },
  { to: '/features', label: 'Clinical Features' },
  { to: '/home', label: 'Live Scanner Workspace' },
]

const ACCESS_LINKS = [
  { to: '/', label: 'Landing Overview' },
  { to: '/home', label: 'Operator Scanner' },
  { to: '/login', label: 'Farm Login / Portal' },
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
              <span className="lp-brand-tag">Swine AI Telemetry</span>
            </div>
          </Link>
          <p className="lp-footer-copy">
            Deep learning swine disease and symptom monitoring system engineered for backyard farms. Real-time skin lesion segmentation, herd outbreak analytics, and biosecurity containment.
          </p>
          <div className="lp-footer-meta">
            <span>Swine Lesion Vision</span>
            <span>Herd Telemetry</span>
            <span>Biosecurity Defense</span>
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
          <h3 className="lp-footer-heading">Diagnostic Telemetry</h3>
          <div className="lp-telemetry-box">
            <div className="lp-telemetry-status">
              <span className="lp-telemetry-dot" />
              <span>SYSTEM ONLINE // EDGE READY</span>
            </div>
            <div className="lp-telemetry-row">
              <span className="lp-tel-key">Vision Engine</span>
              <span className="lp-tel-val">YOLOv8-Swine v4.2</span>
            </div>
            <div className="lp-telemetry-row">
              <span className="lp-tel-key">Inference Latency</span>
              <span className="lp-tel-val">&lt; 1.8s Real-Time</span>
            </div>
            <div className="lp-telemetry-row">
              <span className="lp-tel-key">Conditions Indexed</span>
              <span className="lp-tel-val">14 Lesion Classes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container-pro lp-footer-bottom">
        <span>© {new Date().getFullYear()} {BRAND_NAME}. Swine Clinical Diagnostic Biosecurity. All rights reserved.</span>
        <div className="lp-footer-legal">
          <Link to="/about">Architecture</Link>
          <Link to="/features">Capabilities</Link>
          <Link to="/how-it-works">Safety Protocols</Link>
        </div>
      </div>
    </footer>
  )
}

export default MarketingFooter
