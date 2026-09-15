import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Eye,
  Filter,
  Layers,
  MapPin,
  PieChart,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
} from 'lucide-react'
import UserHeader from '../components/user/UserHeader'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import './Landing.css'
import './MarketingPages.css'

const WEB_SCAN_HISTORY_KEY = 'web_scan_history_v1'

// Default farm baseline data for backyard pig farming
const BASELINE_PENS = [
  { penId: 'Pen A (Nursery)', population: 14, healthy: 13, mild: 1, severe: 0, status: 'Monitor', risk: 'Low', dominant: 'Mild Dermatitis' },
  { penId: 'Pen B (Grower)', population: 16, healthy: 14, mild: 1, severe: 1, status: 'Quarantine Alert', risk: 'Elevated', dominant: 'Diamond Skin (Erysipelas)' },
  { penId: 'Pen C (Finisher)', population: 12, healthy: 12, mild: 0, severe: 0, status: 'Optimal', risk: 'Minimal', dominant: 'Clear Dermis' },
  { penId: 'Pen D (Sow Breeding)', population: 8, healthy: 8, mild: 0, severe: 0, status: 'Optimal', risk: 'Minimal', dominant: 'Clear Dermis' },
  { penId: 'Pen E (Isolation Pen)', population: 3, healthy: 1, mild: 1, severe: 1, status: 'In Treatment', risk: 'Contained', dominant: 'Sarcoptic Mange' },
]

function Overview() {
  const [history, setHistory] = useState([])
  const [selectedPen, setSelectedPen] = useState('All')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  // Load scans from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WEB_SCAN_HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setHistory(parsed)
      }
    } catch {
      // Fallback
    }
  }, [])

  // Aggregate farmer metrics
  const totalSwine = 53
  const activeAlerts = 2
  const mildCases = 3
  const healthySwine = totalSwine - activeAlerts - mildCases
  const biosecurityScore = 92 // Out of 100

  // Filtered scans
  const displayScans = useMemo(() => {
    if (selectedPen === 'All') return history.slice(0, 8)
    return history.filter((s) => String(s.penId || '').includes(selectedPen)).slice(0, 8)
  }, [history, selectedPen])

  return (
    <div className="pro-landing mk-page">
      <UserHeader />

      <main className="mk-main">
        {/* ================================================================
            1. HERO COMMAND HEADER: FARMER HERD ANALYTICS
            ================================================================ */}
        <section className="mk-hero" style={{ paddingBottom: '24px' }}>
          <div className="container-pro">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <div className="mk-kicker">
                  <span className="mk-kicker-dot" />
                  <span>HERD HEALTH TELEMETRY // BACKYARD FARM SURVEILLANCE</span>
                </div>

                <h1 className="mk-title" style={{ marginTop: '14px' }}>
                  Backyard Swine
                  <span className="accent"> Herd Health Analytics</span>
                </h1>

                <p className="mk-subtitle">
                  Real-time epidemiological metrics, pen infection risk indicators, and quarantine triage summaries
                  designed for smallholder and backyard pig producers.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                <Link to="/ai-analysis" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Scan Swine Now</span>
                  <ArrowRight size={14} />
                </Link>
                <Link to="/sorting-grading" className="lp-btn-secondary">
                  <Layers size={16} />
                  <span>Severity Grading</span>
                </Link>
              </div>
            </div>

            {/* Time Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
              {['7d', '30d', '90d', 'All Time'].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedTimeRange(range)}
                  style={{
                    background: selectedTimeRange === range ? 'var(--accent-rose, #f43f5e)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedTimeRange === range ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                    border: `1px solid ${selectedTimeRange === range ? 'var(--accent-rose, #f43f5e)' : 'var(--border-subtle, rgba(255, 255, 255, 0.1))'}`,
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 3 Months' : 'Entire Herd History'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            2. TOP 4 FARMER HEALTH KPI CARDS
            ================================================================ */}
        <section className="mk-section" style={{ paddingTop: '0px', paddingBottom: '32px' }}>
          <div className="container-pro">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              {/* Card 1: Total Monitored Swine */}
              <div
                style={{
                  position: 'relative',
                  padding: '22px 24px',
                  borderRadius: '18px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  boxShadow: 'var(--shadow-card, 0 12px 30px rgba(0, 0, 0, 0.25))',
                }}
              >
                <div className="lp-card-reticle top-left" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                    TOTAL POPULATION
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={17} />
                  </div>
                </div>
                <div style={{ fontFamily: 'Sora', fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main, #ffffff)', lineHeight: 1 }}>
                  {totalSwine} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>heads</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <TrendingUp size={14} />
                  <span>5 backyard pens active</span>
                </div>
              </div>

              {/* Card 2: Healthy Clear Dermis */}
              <div
                style={{
                  position: 'relative',
                  padding: '22px 24px',
                  borderRadius: '18px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  boxShadow: 'var(--shadow-card, 0 12px 30px rgba(0, 0, 0, 0.25))',
                }}
              >
                <div className="lp-card-reticle top-left" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                    HEALTHY HERD RATIO
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={17} />
                  </div>
                </div>
                <div style={{ fontFamily: 'Sora', fontSize: '2.1rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
                  90.6%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginTop: '8px' }}>
                  {healthySwine} of {totalSwine} swine lesion-free
                </div>
              </div>

              {/* Card 3: Active Quarantine Alerts */}
              <div
                style={{
                  position: 'relative',
                  padding: '22px 24px',
                  borderRadius: '18px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  boxShadow: 'var(--shadow-card, 0 12px 30px rgba(0, 0, 0, 0.25))',
                }}
              >
                <div className="lp-card-reticle top-left" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                    QUARANTINE FLAGS
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={17} />
                  </div>
                </div>
                <div style={{ fontFamily: 'Sora', fontSize: '2.1rem', fontWeight: 800, color: '#f43f5e', lineHeight: 1 }}>
                  {activeAlerts} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>swine</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>Isolated in Pen B &amp; Pen E</span>
                </div>
              </div>

              {/* Card 4: Biosecurity Health Index */}
              <div
                style={{
                  position: 'relative',
                  padding: '22px 24px',
                  borderRadius: '18px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  boxShadow: 'var(--shadow-card, 0 12px 30px rgba(0, 0, 0, 0.25))',
                }}
              >
                <div className="lp-card-reticle top-left" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                    BIOSECURITY SCORE
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={17} />
                  </div>
                </div>
                <div style={{ fontFamily: 'Sora', fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main, #ffffff)', lineHeight: 1 }}>
                  {biosecurityScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted, #94a3b8)' }}>/ 100</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '8px' }}>
                  Standard backyard defense rating
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            3. SPLIT SECTION: PEN MONITORING TABLE + SYMPTOM DISTRIBUTION
            ================================================================ */}
        <section className="mk-section" style={{ paddingTop: '0px', paddingBottom: '36px' }}>
          <div className="container-pro">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.25fr) minmax(300px, 0.75fr)', gap: '24px' }}>
              {/* Left Box: Pen Health Surveillance Status */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  padding: '26px',
                  boxShadow: 'var(--shadow-card, 0 16px 40px rgba(0, 0, 0, 0.28))',
                }}
              >
                <div className="lp-card-reticle top-left" />
                <div className="lp-card-reticle bottom-right" />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                      Pen-by-Pen Outbreak Risk Matrix
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
                      Surveillance tracking for infection isolation across your backyard pens
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="var(--accent-rose, #f43f5e)" />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                      5 PENS MAPPED
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>PEN NAME</th>
                        <th style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>HEAD COUNT</th>
                        <th style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>DOMINANT CONDITION</th>
                        <th style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BASELINE_PENS.map((pen) => (
                        <tr
                          key={pen.penId}
                          style={{
                            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))',
                            transition: 'background 0.2s ease',
                          }}
                        >
                          <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                            {pen.penId}
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-muted, #94a3b8)' }}>
                            <span style={{ color: 'var(--text-main, #ffffff)', fontWeight: 700 }}>{pen.population}</span> ({pen.healthy} clear, {pen.mild + pen.severe} symp)
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-muted, #94a3b8)' }}>
                            {pen.dominant}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                fontFamily: 'JetBrains Mono',
                                background:
                                  pen.status === 'Optimal'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : pen.status === 'Monitor'
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : 'rgba(244, 63, 94, 0.15)',
                                color:
                                  pen.status === 'Optimal'
                                    ? '#10b981'
                                    : pen.status === 'Monitor'
                                    ? '#f59e0b'
                                    : '#f43f5e',
                                border: `1px solid ${
                                  pen.status === 'Optimal'
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : pen.status === 'Monitor'
                                    ? 'rgba(245, 158, 11, 0.3)'
                                    : 'rgba(244, 63, 94, 0.3)'
                                }`,
                              }}
                            >
                              {pen.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Box: Symptom Distribution Chart & Breakdown */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  padding: '26px',
                  boxShadow: 'var(--shadow-card, 0 16px 40px rgba(0, 0, 0, 0.28))',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div className="lp-card-reticle top-left" />
                <div className="lp-card-reticle bottom-right" />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <PieChart size={18} color="var(--accent-rose, #f43f5e)" />
                    <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                      Symptom Breakdown
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                    Distribution of skin conditions identified by YOLO across all pens:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Normal */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>Clear Dermis / Healthy</span>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>90.6% (48 heads)</span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: '90.6%', height: '100%', background: '#10b981', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Mild Dermatitis */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>Mild Dermatitis / Swine Pox</span>
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}>5.6% (3 heads)</span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: '5.6%', height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Erysipelas */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>Diamond Skin (Erysipelas)</span>
                        <span style={{ color: '#f43f5e', fontWeight: 800 }}>1.9% (1 head)</span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: '1.9%', height: '100%', background: '#f43f5e', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Sarcoptic Mange */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>Sarcoptic Mange (Mites)</span>
                        <span style={{ color: '#06b6d4', fontWeight: 800 }}>1.9% (1 head)</span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: '1.9%', height: '100%', background: '#06b6d4', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farmer Biosecurity Quick Advice */}
                <div
                  style={{
                    marginTop: '22px',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose, #f43f5e)', fontWeight: 700, fontSize: '0.84rem', marginBottom: '4px' }}>
                    <ShieldAlert size={15} />
                    <span>Farmer Biosecurity Notice</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.45, margin: 0 }}>
                    Pen B is currently under quarantine monitoring due to diamond lesion flags. Restrict cross-pen movement and sanitize rubber boots with disinfectant before entering Pen C.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            4. RECENT DIAGNOSTIC LOGS & AUDIT TRAIL
            ================================================================ */}
        <section className="mk-section mk-section-alt" style={{ padding: '36px 0' }}>
          <div className="container-pro">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                  Recent Swine Diagnostic Telemetry
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)' }}>
                  Audit log of recent photo scans, YOLO model classifications, and biosecurity actions
                </p>
              </div>

              <Link to="/sorting-grading" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-rose, #f43f5e)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>View Full Triage Log</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {displayScans.length === 0 ? (
              <div
                style={{
                  padding: '30px',
                  borderRadius: '16px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.8))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  textAlign: 'center',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                <div style={{ marginBottom: '8px' }}>No live scans recorded yet in local storage.</div>
                <Link to="/ai-analysis" className="lp-btn-primary" style={{ display: 'inline-flex', margin: '0 auto', fontSize: '0.85rem' }}>
                  <ScanLine size={15} />
                  <span>Run First Swine Scan</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {displayScans.map((scan, idx) => (
                  <div
                    key={scan.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '14px',
                      background: 'var(--surface-card, rgba(13, 19, 32, 0.8))',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {scan.imageUrl ? (
                        <img
                          src={scan.imageUrl}
                          alt="Swine Scan"
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #94a3b8)' }}>
                          <ScanLine size={20} />
                        </div>
                      )}

                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main, #ffffff)', fontSize: '0.92rem' }}>
                          {scan.condition || scan.details || 'Swine Dermis Inspection'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
                          {scan.penId || 'Pen B-12'} • {scan.swineId || 'Swine #0482'} • {new Date(scan.timestamp || Date.now()).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--accent-emerald, #10b981)', fontWeight: 700 }}>
                        {scan.confidence || '96.8%'}
                      </span>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          background:
                            scan.severity === 'Normal' || scan.status === 'healthy'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : scan.severity === 'Mild' || scan.status === 'warning'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(244, 63, 94, 0.15)',
                          color:
                            scan.severity === 'Normal' || scan.status === 'healthy'
                              ? '#10b981'
                              : scan.severity === 'Mild' || scan.status === 'warning'
                              ? '#f59e0b'
                              : '#f43f5e',
                        }}
                      >
                        {String(scan.severity || scan.grade || 'TIER A').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="container-pro lp-footer-bottom" style={{ borderTop: 'none', paddingTop: '16px' }}>
          <span>(c) {new Date().getFullYear()} {BRAND_NAME}. {BRAND_TAGLINE}.</span>
          <div className="lp-footer-legal">
            <Link to="/about">About Study</Link>
            <Link to="/how-it-works">Methodology</Link>
            <Link to="/features">Features</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Overview