import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  User,
  Settings,
  Sparkles,
  LayoutDashboard,
  ScanLine,
  BarChart3,
  SlidersHorizontal,
  MapPin,
  ThermometerSnowflake,
  Users2,
  Check,
  Save,
  RotateCcw,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Eye,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react'
import UserHeader, { USER_NAV_ITEMS } from '../components/user/UserHeader'
import BrandMark from '../components/BrandMark'
import { BRAND_NAME } from '../config/brand'
import { getUserSettings, saveUserSettings } from '../utils/userSettings'
import './UserProfile.css'

const AVATAR_PALETTES = [
  { id: 'rose', name: 'Rose Red (Default)', gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' },
  { id: 'emerald', name: 'Emerald Clinical', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { id: 'indigo', name: 'Deep Indigo', gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
  { id: 'amber', name: 'Farm Amber', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
  { id: 'cyan', name: 'Optic Cyan', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)' },
]

function UserProfile() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [userKey, setUserKey] = useState(null)

  // Profile form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [farmSector, setFarmSector] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [avatarPalette, setAvatarPalette] = useState('rose')

  // Header display settings
  const [navDisplayMode, setNavDisplayMode] = useState('words') // 'words' | 'icons' | 'both'
  const [brandDisplayMode, setBrandDisplayMode] = useState('both') // 'both' | 'icon' | 'word'
  const [showAiBadge, setShowAiBadge] = useState(true)
  const [density, setDensity] = useState('comfortable') // 'comfortable' | 'compact'
  const [defaultTab, setDefaultTab] = useState('/home')

  useEffect(() => {
    try {
      const uStr = localStorage.getItem('user')
      if (!uStr) {
        navigate('/login')
        return
      }
      const u = JSON.parse(uStr)
      setCurrentUser(u)
      const key = u.id || u.userId || u.email
      setUserKey(key)

      // Initialize profile fields
      setName(u.name || 'Axel J. Bumatay')
      setEmail(u.email || 'researcher@pigify.com')
      setPhone(u.phone || '+63 917 849 2031')
      setFarmSector(u.farmSector || 'Laguna Backyard Swine Pen B-04')
      setRoleTitle(u.roleTitle || 'Backyard Swine Health Researcher')
      setAvatarPalette(u.avatarPalette || 'rose')

      // Load existing user preferences
      const saved = getUserSettings(key)
      setNavDisplayMode(saved.navDisplayMode || 'words')
      setBrandDisplayMode(saved.brandDisplayMode || 'both')
      setShowAiBadge(saved.showAiBadge !== false)
      setDensity(saved.density || 'comfortable')
      setDefaultTab(saved.defaultTab || '/home')
    } catch {
      navigate('/login')
    }
  }, [navigate])

  const handleApplyNavMode = (mode) => {
    setNavDisplayMode(mode)
    saveUserSettings(userKey, { navDisplayMode: mode })
    toast.success(`Header navigation set to: ${mode === 'words' ? 'Words / Text' : mode === 'icons' ? 'Logos / Icons Only' : 'Both (Logo + Word)'}`)
  }

  const handleApplyBrandMode = (mode) => {
    setBrandDisplayMode(mode)
    saveUserSettings(userKey, { brandDisplayMode: mode })
    toast.success(`Header brand style set to: ${mode === 'both' ? 'Both Logo + Word' : mode === 'icon' ? 'Logo Icon Only' : 'Wordmark Only'}`)
  }

  const handleToggleAiBadge = () => {
    const next = !showAiBadge
    setShowAiBadge(next)
    saveUserSettings(userKey, { showAiBadge: next })
    toast.success(`Live AI telemetry indicator ${next ? 'enabled' : 'hidden'}`)
  }

  const handleToggleDensity = (newDensity) => {
    setDensity(newDensity)
    saveUserSettings(userKey, { density: newDensity })
    toast.success(`Header density set to ${newDensity}`)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      farmSector: farmSector.trim(),
      roleTitle: roleTitle.trim(),
      avatarPalette,
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)

    // Save associated user settings
    saveUserSettings(userKey, {
      navDisplayMode,
      brandDisplayMode,
      showAiBadge,
      density,
      defaultTab,
    })

    toast.success('User profile & header settings saved successfully!')
  }

  const handleResetDefaults = () => {
    setNavDisplayMode('words')
    setBrandDisplayMode('both')
    setShowAiBadge(true)
    setDensity('comfortable')
    setDefaultTab('/home')

    saveUserSettings(userKey, {
      navDisplayMode: 'words',
      brandDisplayMode: 'both',
      showAiBadge: true,
      density: 'comfortable',
      defaultTab: '/home',
    })

    toast.success('Header settings reset to recommended defaults')
  }

  const selectedPaletteObj = AVATAR_PALETTES.find((p) => p.id === avatarPalette) || AVATAR_PALETTES[0]

  return (
    <div className="pigify-profile-shell">
      <UserHeader />

      <main className="pigify-profile-main">
        <div className="container-pro">
          {/* Hero Header */}
          <section className="profile-hero-section">
            <div className="profile-hero-chip">
              <Sparkles size={12} />
              <span>USER SETTINGS // PREFERENCES & HEADER CUSTOMIZATION</span>
            </div>
            <h1 className="profile-hero-title">
              User Profile & <span>Header Settings</span>
            </h1>
            <p className="profile-hero-desc">
              Personalize your operator profile, backyard farm sector, and customize the top navigation header between
              words, logos/icons, or combined lockups. Changes persist exclusively to your account.
            </p>
          </section>

          {/* Grid Layout: Left Column Settings, Right Column Overview */}
          <div className="profile-grid">
            {/* Left Column: Customizations & Form */}
            <div className="profile-grid-left">
              {/* ==============================================================
                  SECTION 1: HEADER NAVIGATION DISPLAY MODES (CORE REQUEST)
                  ============================================================== */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-icon-wrap">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="profile-card-title">Header Navigation Display Style</h2>
                    <p className="profile-card-subtitle">
                      Toggle whether page links display as full words, professional page logos/icons, or both.
                    </p>
                  </div>
                </div>

                <div className="profile-options-grid">
                  {/* Option 1: Words Only */}
                  <div
                    className={`profile-option-card${navDisplayMode === 'words' ? ' active' : ''}`}
                    onClick={() => handleApplyNavMode('words')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="profile-option-header">
                      <div className="profile-option-label-wrap">
                        <span className="profile-option-radio">
                          {navDisplayMode === 'words' && <Check size={12} />}
                        </span>
                        <span className="profile-option-title">Words / Text Only</span>
                      </div>
                      <span className="profile-badge-default">Standard</span>
                    </div>
                    <p className="profile-option-desc">
                      Displays full titles: Dashboard, AI Scanner, Herd Analytics, Severity Grading, etc.
                    </p>
                    <div className="profile-option-preview-box">
                      <span className="preview-pill active">Dashboard</span>
                      <span className="preview-pill">AI Scanner</span>
                      <span className="preview-pill">Herd Analytics</span>
                    </div>
                  </div>

                  {/* Option 2: Logos / Icons Only */}
                  <div
                    className={`profile-option-card${navDisplayMode === 'icons' ? ' active' : ''}`}
                    onClick={() => handleApplyNavMode('icons')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="profile-option-header">
                      <div className="profile-option-label-wrap">
                        <span className="profile-option-radio">
                          {navDisplayMode === 'icons' && <Check size={12} />}
                        </span>
                        <span className="profile-option-title">Logos / Icons Only</span>
                      </div>
                      <span className="profile-badge-pro">Minimalist</span>
                    </div>
                    <p className="profile-option-desc">
                      Replaces words with tailored vector icons. Maximum horizontal space savings with hover tooltips.
                    </p>
                    <div className="profile-option-preview-box">
                      <span className="preview-pill icon active" title="Dashboard">
                        <LayoutDashboard size={14} />
                      </span>
                      <span className="preview-pill icon" title="AI Scanner">
                        <ScanLine size={14} />
                      </span>
                      <span className="preview-pill icon" title="Herd Analytics">
                        <BarChart3 size={14} />
                      </span>
                      <span className="preview-pill icon" title="Severity Grading">
                        <SlidersHorizontal size={14} />
                      </span>
                      <span className="preview-pill icon" title="Disease Map">
                        <MapPin size={14} />
                      </span>
                    </div>
                  </div>

                  {/* Option 3: Both (Icon + Word) */}
                  <div
                    className={`profile-option-card${navDisplayMode === 'both' ? ' active' : ''}`}
                    onClick={() => handleApplyNavMode('both')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="profile-option-header">
                      <div className="profile-option-label-wrap">
                        <span className="profile-option-radio">
                          {navDisplayMode === 'both' && <Check size={12} />}
                        </span>
                        <span className="profile-option-title">Both (Logo + Word)</span>
                      </div>
                      <span className="profile-badge-featured">Hybrid</span>
                    </div>
                    <p className="profile-option-desc">
                      Combines each page's distinct logo icon alongside its descriptive title.
                    </p>
                    <div className="profile-option-preview-box">
                      <span className="preview-pill active">
                        <LayoutDashboard size={12} /> Dashboard
                      </span>
                      <span className="preview-pill">
                        <ScanLine size={12} /> AI Scanner
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Settings: Brand Style, Telemetry, and Density */}
                <div className="profile-subgroup">
                  <h3 className="profile-subgroup-title">Header Brand Lockup Style</h3>
                  <div className="profile-chips-row">
                    <button
                      type="button"
                      className={`profile-chip-btn${brandDisplayMode === 'both' ? ' active' : ''}`}
                      onClick={() => handleApplyBrandMode('both')}
                    >
                      <BrandMark size={16} /> Both (Icon + Pigify)
                    </button>
                    <button
                      type="button"
                      className={`profile-chip-btn${brandDisplayMode === 'icon' ? ' active' : ''}`}
                      onClick={() => handleApplyBrandMode('icon')}
                    >
                      <BrandMark size={16} /> Icon Only
                    </button>
                    <button
                      type="button"
                      className={`profile-chip-btn${brandDisplayMode === 'word' ? ' active' : ''}`}
                      onClick={() => handleApplyBrandMode('word')}
                    >
                      Pigify Wordmark Only
                    </button>
                  </div>
                </div>

                <div className="profile-subgroup-grid">
                  {/* AI Badge Toggle */}
                  <div className="profile-toggle-item">
                    <div>
                      <span className="profile-toggle-label">AI Engine Telemetry Badge</span>
                      <span className="profile-toggle-sub">Show live pulsating "AI ONLINE" indicator in header</span>
                    </div>
                    <button
                      type="button"
                      className={`profile-switch${showAiBadge ? ' on' : ''}`}
                      onClick={handleToggleAiBadge}
                      aria-label="Toggle AI badge"
                    >
                      <span className="profile-switch-handle" />
                    </button>
                  </div>

                  {/* Header Density */}
                  <div className="profile-toggle-item">
                    <div>
                      <span className="profile-toggle-label">Header Vertical Density</span>
                      <span className="profile-toggle-sub">Comfortable (56px) or Compact (50px)</span>
                    </div>
                    <div className="profile-density-toggle">
                      <button
                        type="button"
                        className={`profile-density-btn${density === 'comfortable' ? ' active' : ''}`}
                        onClick={() => handleToggleDensity('comfortable')}
                      >
                        Comfortable
                      </button>
                      <button
                        type="button"
                        className={`profile-density-btn${density === 'compact' ? ' active' : ''}`}
                        onClick={() => handleToggleDensity('compact')}
                      >
                        Compact
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==============================================================
                  SECTION 2: USER PROFILE & OPERATOR CREDENTIALS
                  ============================================================== */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-icon-wrap">
                    <User size={18} />
                  </div>
                  <div>
                    <h2 className="profile-card-title">Operator Profile & Credentials</h2>
                    <p className="profile-card-subtitle">
                      Update your researcher identity, pen assignment, and contact metadata.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="profile-form-grid">
                    <div className="profile-field">
                      <label className="profile-label">Operator Full Name</label>
                      <div className="profile-input-wrap">
                        <User size={14} className="profile-input-icon" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="profile-input"
                          placeholder="e.g. Axel J. Bumatay"
                          required
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label className="profile-label">Email Address</label>
                      <div className="profile-input-wrap">
                        <Mail size={14} className="profile-input-icon" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="profile-input"
                          placeholder="researcher@pigify.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label className="profile-label">Contact / Mobile Number</label>
                      <div className="profile-input-wrap">
                        <Phone size={14} className="profile-input-icon" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="profile-input"
                          placeholder="+63 917 849 2031"
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label className="profile-label">Assigned Backyard Sector / Pen</label>
                      <div className="profile-input-wrap">
                        <Building size={14} className="profile-input-icon" />
                        <input
                          type="text"
                          value={farmSector}
                          onChange={(e) => setFarmSector(e.target.value)}
                          className="profile-input"
                          placeholder="e.g. Laguna Backyard Swine Pen B-04"
                        />
                      </div>
                    </div>

                    <div className="profile-field full-width">
                      <label className="profile-label">System Role Title</label>
                      <div className="profile-input-wrap">
                        <ShieldCheck size={14} className="profile-input-icon" />
                        <input
                          type="text"
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
                          className="profile-input"
                          placeholder="Backyard Swine Health Researcher"
                        />
                      </div>
                    </div>

                    {/* Avatar Color Palette Selection */}
                    <div className="profile-field full-width">
                      <label className="profile-label">Avatar Accent Theme</label>
                      <div className="profile-avatar-palettes">
                        {AVATAR_PALETTES.map((pal) => (
                          <button
                            key={pal.id}
                            type="button"
                            className={`profile-palette-btn${avatarPalette === pal.id ? ' active' : ''}`}
                            onClick={() => setAvatarPalette(pal.id)}
                            title={pal.name}
                          >
                            <span
                              className="profile-palette-color"
                              style={{ background: pal.gradient }}
                            />
                            <span className="profile-palette-name">{pal.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="profile-actions-bar">
                    <button type="submit" className="profile-btn-primary">
                      <Save size={15} /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="profile-btn-secondary"
                    >
                      <RotateCcw size={14} /> Reset Defaults
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Visual Directory of Page Logos & Titles */}
            <div className="profile-grid-right">
              {/* Profile Card Preview */}
              <div className="profile-card profile-badge-preview-card">
                <div className="profile-badge-avatar" style={{ background: selectedPaletteObj.gradient }}>
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 className="profile-badge-name">{name || 'Operator Name'}</h3>
                <span className="profile-badge-role">{roleTitle || 'Swine Researcher'}</span>
                <span className="profile-badge-sector">{farmSector || 'Backyard Pen Sector'}</span>

                <div className="profile-badge-meta">
                  <div className="profile-badge-meta-item">
                    <span className="meta-label">Email</span>
                    <span className="meta-value">{email || '--'}</span>
                  </div>
                  <div className="profile-badge-meta-item">
                    <span className="meta-label">Status</span>
                    <span className="meta-value status-active">● Active Field User</span>
                  </div>
                </div>
              </div>

              {/* Visual Directory of Page Logos & Titles */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-icon-wrap">
                    <Palette size={18} />
                  </div>
                  <div>
                    <h3 className="profile-card-title">Professional Page Logos</h3>
                    <p className="profile-card-subtitle">
                      Dedicated vector icons semantically aligned with each study page.
                    </p>
                  </div>
                </div>

                <div className="profile-nav-directory">
                  {USER_NAV_ITEMS.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.path} className="profile-nav-item-row">
                        <div className="profile-nav-item-icon-box">
                          <Icon size={16} />
                        </div>
                        <div className="profile-nav-item-details">
                          <div className="profile-nav-item-title-row">
                            <span className="profile-nav-item-title">{item.label}</span>
                            <Link to={item.path} className="profile-nav-item-link" title={`Go to ${item.label}`}>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                          <p className="profile-nav-item-desc">{item.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Academic Capstone Study Credentials */}
              <div className="profile-card capstone-study-card">
                <div className="capstone-study-kicker">CAPSTONE STUDY CITATION</div>
                <h4 className="capstone-study-title">
                  Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms
                </h4>
                <p className="capstone-study-authors">
                  <strong>Authors:</strong> Axel J. Bumatay, John Carlo R. Adora, Ranzel B. Danque, Carl Justin V. Landas
                </p>
                <div className="capstone-study-tags">
                  <span className="study-tag">YOLOv8</span>
                  <span className="study-tag">YOLOv11</span>
                  <span className="study-tag">Backyard Swine</span>
                  <span className="study-tag">Biosecurity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UserProfile
