import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import UserHeader from '../components/user/UserHeader'
import { API_BASE_URL } from '../config/api'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import './Landing.css'
import './MarketingPages.css'
import './SortingGrading.css'

const HISTORY_STORAGE_KEY = 'web_scan_history_v1'
const SEVERITY_FILTERS = ['All', 'Normal', 'Mild', 'Moderate', 'Severe']

const parseUserMeta = () => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return {}
    const user = JSON.parse(raw)
    return {
      userId: String(user?._id || user?.id || user?.userId || '').trim(),
      userEmail: String(user?.email || '').trim().toLowerCase(),
      userName: String(user?.name || user?.fullName || user?.username || '').trim(),
    }
  } catch {
    return {}
  }
}

const parseHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function SortingGrading() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState('All')
  const [searchPen, setSearchPen] = useState('')
  const [selectedScan, setSelectedScan] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [scanToDelete, setScanToDelete] = useState(null)

  const loadData = useCallback(() => {
    setLoading(true)
    try {
      const local = parseHistory()
      setScans(local)
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredScans = useMemo(() => {
    return scans.filter((item) => {
      const itemSev = String(item.severity || item.grade || 'Normal').toLowerCase()
      const matchFilter =
        filterSeverity === 'All' ||
        (filterSeverity === 'Normal' && (itemSev.includes('normal') || itemSev.includes('healthy') || itemSev === 'a')) ||
        (filterSeverity === 'Mild' && (itemSev.includes('mild') || itemSev === 'b')) ||
        (filterSeverity === 'Moderate' && (itemSev.includes('moderate') || itemSev === 'c')) ||
        (filterSeverity === 'Severe' && (itemSev.includes('severe') || itemSev.includes('alert') || itemSev === 'd'))

      const matchPen =
        !searchPen.trim() ||
        String(item.penId || '').toLowerCase().includes(searchPen.toLowerCase()) ||
        String(item.swineId || '').toLowerCase().includes(searchPen.toLowerCase()) ||
        String(item.condition || '').toLowerCase().includes(searchPen.toLowerCase())

      return matchFilter && matchPen
    })
  }, [scans, filterSeverity, searchPen])

  const handleDeleteScan = (id) => {
    try {
      const updated = scans.filter((s) => s.id !== id && s.localScanId !== id)
      setScans(updated)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated))
      toast.success('Diagnostic record removed.')
      setDeleteModalOpen(false)
      setScanToDelete(null)
      if (selectedScan?.id === id) setSelectedScan(null)
    } catch {
      toast.error('Failed to remove record.')
    }
  }

  return (
    <div className="pro-landing mk-page">
      <UserHeader />

      <main className="mk-main">
        {/* ================================================================
            1. HERO COMMAND HEADER
            ================================================================ */}
        <section className="mk-hero" style={{ paddingBottom: '20px' }}>
          <div className="container-pro">
            <div className="mk-kicker">
              <span className="mk-kicker-dot" />
              <span>CLINICAL TRIAGE // BACKYARD SWINE PROTOCOL</span>
            </div>

            <h1 className="mk-title">
              Symptom Severity
              <span className="accent"> Grading &amp; Triage</span>
            </h1>

            <p className="mk-subtitle">
              Audit and filter all swine lesion scans classified by the YOLO deep learning model.
              Stratified into Mild, Moderate, or Acute Quarantine tiers for pen biosecurity.
            </p>
          </div>
        </section>

        {/* ================================================================
            2. FILTER & SEARCH CONTROLS
            ================================================================ */}
        <section className="mk-section" style={{ paddingTop: '0px', paddingBottom: '24px' }}>
          <div className="container-pro">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              }}
            >
              {/* Severity Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SEVERITY_FILTERS.map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFilterSeverity(sev)}
                    style={{
                      background: filterSeverity === sev ? 'var(--accent-rose, #f43f5e)' : 'rgba(255, 255, 255, 0.05)',
                      color: filterSeverity === sev ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                      border: `1px solid ${filterSeverity === sev ? 'var(--accent-rose, #f43f5e)' : 'var(--border-subtle, rgba(255, 255, 255, 0.1))'}`,
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {/* Search Pen/Swine Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  value={searchPen}
                  onChange={(e) => setSearchPen(e.target.value)}
                  placeholder="Filter by Pen ID or Swine #..."
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-main, #ffffff)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    minWidth: '220px',
                  }}
                />
                <button
                  type="button"
                  onClick={loadData}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                  }}
                  title="Reload scans"
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            3. SCANS GRID & DETAIL MODAL
            ================================================================ */}
        <section className="mk-section" style={{ paddingTop: '0px' }}>
          <div className="container-pro">
            {filteredScans.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  borderRadius: '20px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px dashed var(--border-subtle, rgba(255, 255, 255, 0.15))',
                  textAlign: 'center',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(244, 63, 94, 0.1)',
                    color: 'var(--accent-rose, #f43f5e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  <Layers size={24} />
                </div>
                <h3 style={{ fontFamily: 'Sora', fontSize: '1.2rem', color: 'var(--text-main, #ffffff)', margin: '0 0 6px 0' }}>
                  No Diagnostic Scans Found
                </h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto 18px auto' }}>
                  No scans match your current filter criteria. Run an AI scan to record a new swine health inspection.
                </p>
                <a
                  href="/ai-analysis"
                  className="lp-btn-primary"
                  style={{ display: 'inline-flex', padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  <ScanLine size={15} />
                  <span>Launch AI Scanner</span>
                </a>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '18px',
                }}
              >
                {filteredScans.map((scan) => {
                  const isHealthy =
                    String(scan.severity || '').toLowerCase().includes('normal') ||
                    String(scan.status || '').toLowerCase() === 'healthy'
                  const isMild =
                    String(scan.severity || '').toLowerCase().includes('mild') ||
                    String(scan.status || '').toLowerCase() === 'warning'
                  const isAlert = !isHealthy && !isMild

                  const badgeColor = isHealthy ? '#10b981' : isMild ? '#f59e0b' : '#f43f5e'
                  const badgeBg = isHealthy ? 'rgba(16, 185, 129, 0.15)' : isMild ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)'

                  return (
                    <div
                      key={scan.id || scan.localScanId}
                      style={{
                        position: 'relative',
                        borderRadius: '18px',
                        background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                        padding: '18px',
                        boxShadow: 'var(--shadow-card, 0 12px 30px rgba(0, 0, 0, 0.22))',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                      }}
                    >
                      <div className="lp-card-reticle top-left" />

                      {/* Header Row: Pen ID & Severity Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color="var(--accent-rose, #f43f5e)" />
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                            {scan.penId || 'Pen B-12'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>• {scan.swineId || 'Swine #0482'}</span>
                        </div>

                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontFamily: 'JetBrains Mono',
                            fontSize: '10px',
                            fontWeight: 800,
                            color: badgeColor,
                            background: badgeBg,
                            border: `1px solid ${badgeColor}40`,
                          }}
                        >
                          {String(scan.severity || scan.grade || 'TIER A').toUpperCase()}
                        </span>
                      </div>

                      {/* Subject Image Thumbnail + Condition Name */}
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        {scan.imageUrl ? (
                          <img
                            src={scan.imageUrl}
                            alt="Swine Subject"
                            style={{
                              width: '74px',
                              height: '74px',
                              borderRadius: '12px',
                              objectFit: 'cover',
                              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '74px',
                              height: '74px',
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-muted, #94a3b8)',
                            }}
                          >
                            <ScanLine size={24} />
                          </div>
                        )}

                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontFamily: 'Sora', fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                            {scan.condition || scan.details || 'Swine Dermis Inspection'}
                          </h4>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
                            <span>Confidence: <strong style={{ color: '#10b981' }}>{scan.confidence || '96.8%'}</strong></span>
                            {scan.affectedArea && <span>Area: <strong style={{ color: 'var(--text-main, #ffffff)' }}>{scan.affectedArea}</strong></span>}
                          </div>
                        </div>
                      </div>

                      {/* Biosecurity Action Recommendation */}
                      {scan.recommendation && (
                        <div
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                            fontSize: '0.78rem',
                            color: 'var(--text-muted, #94a3b8)',
                            lineHeight: 1.45,
                          }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--text-main, #ffffff)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ShieldAlert size={12} color="var(--accent-rose, #f43f5e)" />
                            <span>Action Protocol:</span>
                          </div>
                          {scan.recommendation}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.06))', fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>
                        <span>{new Date(scan.timestamp || Date.now()).toLocaleDateString()}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setScanToDelete(scan)
                            setDeleteModalOpen(true)
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && scanToDelete && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                borderRadius: '18px',
                background: 'var(--surface-card, rgba(13, 19, 32, 0.95))',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              <h3 style={{ fontFamily: 'Sora', fontSize: '1.15rem', color: 'var(--text-main, #ffffff)', margin: '0 0 8px 0' }}>
                Delete Diagnostic Record?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                Are you sure you want to remove the scan record for <strong>{scanToDelete.condition || 'Swine Scan'}</strong> in {scanToDelete.penId || 'Pen'}?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    background: 'transparent',
                    color: 'var(--text-muted, #94a3b8)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteScan(scanToDelete.id || scanToDelete.localScanId)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="lp-footer">
        <div className="container-pro lp-footer-bottom" style={{ borderTop: 'none', paddingTop: '16px' }}>
          <span>(c) {new Date().getFullYear()} {BRAND_NAME}. {BRAND_TAGLINE}.</span>
          <div className="lp-footer-legal">
            <a href="/about">About Study</a>
            <a href="/how-it-works">Triage Criteria</a>
            <a href="/features">Features</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default SortingGrading
