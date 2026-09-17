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

const PREFETCH_MAP = {
  '/home': () => import('../../pages/Home'),
  '/ai-analysis': () => import('../../pages/AiAnalysis'),
  '/overview': () => import('../../pages/Overview'),
  '/sorting-grading': () => import('../../pages/SortingGrading'),
  '/environment': () => import('../../pages/Environment'),
  '/community': () => import('../../pages/CommunityForum'),
}

const prefetchRoute = (path) => {
  const loader = PREFETCH_MAP[path]
  if (loader) {
    try {
      loader().catch(() => {})
    } catch (_err) {
      void _err
    }
  }
}

function UserHeader({ showDashboardLink = false, dashboardTo = '/home', rightSlot = null }) {
  return (
    <header className="user-header-shell">
      <div className="container-pro user-header-inner">
        <Link
          to="/home"
          className="user-header-brand"
          aria-label={`${BRAND_NAME} dashboard`}
          onMouseEnter={() => prefetchRoute('/home')}
          onTouchStart={() => prefetchRoute('/home')}
        >
          <BrandMark size={40} />
          <div className="user-header-brand-copy">
            <span className="user-header-brand-name">{BRAND_NAME}</span>
            <span className="user-header-brand-tag">Swine Health Study</span>
          </div>
        </Link>

        <nav className="user-header-nav" aria-label="User navigation">
          {USER_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => prefetchRoute(item.path)}
              onTouchStart={() => prefetchRoute(item.path)}
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
