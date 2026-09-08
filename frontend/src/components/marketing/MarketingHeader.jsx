import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import BrandMark from '../BrandMark'
import ThemeToggle from '../ThemeToggle'
import { BRAND_NAME } from '../../config/brand'
import './MarketingNav.css'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/features', label: 'Features' },
  { to: '/home', label: 'Live Scanner' },
]

function MarketingHeader() {
  return (
    <header className="lp-header-wrap">
      <div className="container-pro lp-header">
        {/* Brand Link */}
        <Link to="/" className="lp-brand" aria-label={`${BRAND_NAME} Home`}>
          <BrandMark size={38} />
          <div className="lp-brand-copy">
            <span className="lp-brand-name">{BRAND_NAME}</span>
            <span className="lp-brand-tag">Swine AI Telemetry</span>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <div className="lp-header-right">
          <nav className="lp-nav" aria-label="Primary Navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `lp-nav-link${isActive ? ' active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="lp-header-actions">
            <Link to="/login" className="lp-header-login-btn">
              <LogIn size={15} />
              <span>Login</span>
            </Link>

            {/* Global Theme Switcher */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

export default MarketingHeader
