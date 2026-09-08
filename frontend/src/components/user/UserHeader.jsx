import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import BrandMark from '../BrandMark'
import ThemeToggle from '../ThemeToggle'
import { BRAND_NAME } from '../../config/brand'
import './UserHeader.css'

const USER_NAV_ITEMS = [
  { path: '/home', label: 'Dashboard' },
  { path: '/ai-analysis', label: 'AI Scanner' },
  { path: '/overview', label: 'Herd Analytics' },
  { path: '/sorting-grading', label: 'Severity Grading' },
  { path: '/environment', label: 'Farm Environment' },
  { path: '/community', label: 'Community' },
]

function UserHeader({ showDashboardLink = false, dashboardTo = '/home', rightSlot = null }) {
  return (
    <header className="user-header-shell">
      <div className="container-pro user-header-inner">
        <Link to="/home" className="user-header-brand" aria-label={`${BRAND_NAME} dashboard`}>
          <BrandMark size={40} />
          <div className="user-header-brand-copy">
            <span className="user-header-brand-name">{BRAND_NAME}</span>
            <span className="user-header-brand-tag">Swine Clinical Intelligence</span>
          </div>
        </Link>

        <nav className="user-header-nav" aria-label="User navigation">
          {USER_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `user-header-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="user-header-actions">
          {/* Unique Interactive Theme Toggle */}
          <ThemeToggle />

          {rightSlot}

          {showDashboardLink ? (
            <Link to={dashboardTo} className="user-header-dashboard-link">
              Dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default UserHeader
