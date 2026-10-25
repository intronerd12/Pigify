import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ScanLine,
  BarChart3,
  SlidersHorizontal,
  MapPin,
  ThermometerSnowflake,
  Users2,
  Settings,
  LogOut,
} from 'lucide-react'
import BrandMark from '../BrandMark'
import ThemeToggle from '../ThemeToggle'
import { BRAND_NAME } from '../../config/brand'
import { supabase } from '../../utils/supabase'
import { getUserSettings } from '../../utils/userSettings'
import './UserHeader.css'

export const USER_NAV_ITEMS = [
  {
    path: '/home',
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Farm Dashboard',
  },
  {
    path: '/ai-analysis',
    label: 'AI Scanner',
    shortLabel: 'Scanner',
    icon: ScanLine,
    description: 'Pig Photo Symptom Scanner',
  },
  {
    path: '/overview',
    label: 'Herd Analytics',
    shortLabel: 'Analytics',
    icon: BarChart3,
    description: 'Herd Health History & Metrics',
  },
  {
    path: '/sorting-grading',
    label: 'Severity Grading',
    shortLabel: 'Grading',
    icon: SlidersHorizontal,
    description: 'Severity Levels & Records',
  },
  {
    path: '/disease-map',
    label: 'Disease Map & PVO',
    shortLabel: 'Disease Map',
    icon: MapPin,
    description: 'Disease Map & Farm Awareness',
  },
  {
    path: '/environment',
    label: 'Farm Environment',
    shortLabel: 'Environment',
    icon: ThermometerSnowflake,
    description: 'Temperature & Humidity',
  },
  {
    path: '/community',
    label: 'Community',
    shortLabel: 'Community',
    icon: Users2,
    description: 'Discussion & Tips',
  },
]

const PREFETCH_MAP = {
  '/home': () => import('../../pages/Home'),
  '/ai-analysis': () => import('../../pages/AiAnalysis'),
  '/overview': () => import('../../pages/Overview'),
  '/sorting-grading': () => import('../../pages/SortingGrading'),
  '/disease-map': () => import('../../pages/DiseaseMap'),
  '/environment': () => import('../../pages/Environment'),
  '/community': () => import('../../pages/CommunityForum'),
  '/profile': () => import('../../pages/UserProfile'),
}

const prefetchTimers = {}
const prefetchRoute = (path) => {
  if (prefetchTimers[path]) return
  prefetchTimers[path] = setTimeout(() => {
    const loader = PREFETCH_MAP[path]
    if (loader) {
      try {
        loader().catch(() => {})
      } catch (_err) {
        void _err
      }
    }
  }, 160)
}

const cancelPrefetch = (path) => {
  if (prefetchTimers[path]) {
    clearTimeout(prefetchTimers[path])
    delete prefetchTimers[path]
  }
}

function UserHeader({ showDashboardLink = false, dashboardTo = '/home', rightSlot = null }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [settings, setSettings] = useState(() => getUserSettings(null))
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const u = localStorage.getItem('user')
      if (u) {
        const parsed = JSON.parse(u)
        setCurrentUser(parsed)
        const userKey = parsed.id || parsed.userId || parsed.email
        setSettings(getUserSettings(userKey))
      }
    } catch {}

    const handleSettingsUpdated = (e) => {
      if (e?.detail?.settings) {
        setSettings(e.detail.settings)
      }
    }

    window.addEventListener('pigify:settings-updated', handleSettingsUpdated)
    return () => window.removeEventListener('pigify:settings-updated', handleSettingsUpdated)
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch {}
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navMode = settings?.navDisplayMode || 'words'
  const brandMode = settings?.brandDisplayMode || 'both'
  const showAiBadge = settings?.showAiBadge !== false

  return (
    <header className={`user-header-shell${settings?.density === 'compact' ? ' density-compact' : ''}`}>
      <div className="user-header-inner">
        {/* Brand Lockup: Responsive to user setting (Both, Icon only, or Word only) */}
        <Link
          to="/home"
          className={`user-header-brand brand-mode-${brandMode}`}
          aria-label={`${BRAND_NAME} dashboard`}
          title={`${BRAND_NAME} Backyard Swine Health Monitoring Platform`}
          onMouseEnter={() => prefetchRoute('/home')}
          onMouseLeave={() => cancelPrefetch('/home')}
          onTouchStart={() => prefetchRoute('/home')}
        >
          {brandMode !== 'word' && (
            <div className="user-header-brand-icon-wrap">
              <BrandMark size={brandMode === 'icon' ? 32 : 28} />
            </div>
          )}
          {brandMode !== 'icon' && (
            <span className="user-header-brand-title">{BRAND_NAME}</span>
          )}
        </Link>

        <div className="user-header-divider" aria-hidden="true" />

        {/* Center Navigation Dock: Responsive to user setting (Words, Icons only, or Both) */}
        <nav
          className={`user-header-nav nav-mode-${navMode}`}
          aria-label="User navigation"
        >
          {USER_NAV_ITEMS.map((item) => {
            const IconComponent = item.icon
            const iconSize = navMode === 'icons' ? 20 : 14
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={`${item.label} • ${item.description}`}
                onMouseEnter={() => prefetchRoute(item.path)}
                onMouseLeave={() => cancelPrefetch(item.path)}
                onTouchStart={() => prefetchRoute(item.path)}
                className={({ isActive }) =>
                  `user-header-link${isActive ? ' active' : ''}${navMode === 'icons' ? ' icon-only' : ''}`
                }
              >
                {navMode !== 'words' && (
                  <IconComponent size={iconSize} className="user-header-nav-icon" />
                )}
                {navMode !== 'icons' && (
                  <span className="user-header-nav-text">
                    {navMode === 'both' ? (item.shortLabel || item.label) : item.label}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="user-header-divider" aria-hidden="true" />

        {/* Right Utility & Profile Cluster */}
        <div className="user-header-actions">
          {/* Live AI Core Engine Pill (User Toggleable) */}
          {showAiBadge && (
            <div className="user-header-engine-pill" title="YOLO Swine Lesion Model Engine Online">
              <span className="user-header-engine-dot" />
              <span className="user-header-engine-text">AI ONLINE</span>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {rightSlot ? (
            rightSlot
          ) : currentUser ? (
            <div className="user-header-profile-group">
              {/* Profile Pill linked to User Page / Settings */}
              <Link
                to="/profile"
                className="user-header-user-pill"
                title="Open Profile, Settings & Header Appearance"
                onMouseEnter={() => prefetchRoute('/profile')}
              >
                <div className="user-header-user-avatar">
                  {String(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="user-header-user-name">
                  {currentUser.name ? currentUser.name.split(' ')[0] : 'Operator'}
                </span>
                <Settings size={12} className="user-header-settings-indicator" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="user-header-logout-btn"
                title="Sign out of Pigify"
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
          ) : null}

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
