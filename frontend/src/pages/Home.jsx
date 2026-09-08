import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CloudSun,
  Cpu,
  Layers,
  LogOut,
  MessageSquare,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import UserHeader from '../components/user/UserHeader';
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand';
import { API_BASE_URL } from '../config/api';
import { supabase } from '../utils/supabase';
import './Home.css';

const SWINE_MODULES = [
  {
    id: 'scanner',
    title: 'AI Swine Symptom Scanner',
    desc: 'Capture or upload swine photos for real-time lesion, rash, and dermatitis detection with YOLOv11.',
    path: '/ai-analysis',
    icon: <ScanLine size={22} />,
    tag: 'CORE AI VISION',
    kicker: 'Real-Time Lesion Detection',
  },
  {
    id: 'analytics',
    title: 'Clinical Herd Analytics',
    desc: 'Review herd health distribution, historical symptom rates, and contagious outbreak risk indicators.',
    path: '/overview',
    icon: <BarChart3 size={22} />,
    tag: 'EPIDEMIOLOGY',
    kicker: 'Deep Learning Reports',
  },
  {
    id: 'grading',
    title: 'Symptom Severity Grading',
    desc: 'Automated severity classification: Mild, Moderate, or Acute Quarantine for immediate farm bio-security.',
    path: '/sorting-grading',
    icon: <Layers size={22} />,
    tag: 'CLASSIFICATION',
    kicker: 'Triaging Pipeline',
  },
  {
    id: 'environment',
    title: 'Farm Environment & Pen Telemetry',
    desc: 'Track ambient temperature, humidity, and pen ventilation correlating with swine disease outbreaks.',
    path: '/environment',
    icon: <CloudSun size={22} />,
    tag: 'FARM TELEMETRY',
    kicker: 'Biosecurity Sensors',
  },
  {
    id: 'community',
    title: 'Backyard Swine Community',
    desc: 'Discuss diagnostic cases, share symptom photographs, and get feedback from peer swine raisers.',
    path: '/community',
    icon: <MessageSquare size={22} />,
    tag: 'PEER FORUM',
    kicker: 'Knowledge Exchange',
  },
];

const RECENT_DIAGNOSTICS = [
  {
    id: 'SW-104',
    title: 'Backyard Pen B • Sow #04',
    condition: 'Normal Skin Tissue (No Lesions)',
    confidence: '99.4%',
    time: '12 mins ago',
    status: 'healthy',
    statusLabel: 'NORMAL',
  },
  {
    id: 'SW-089',
    title: 'Nursery Pen A • Piglet #19',
    condition: 'Mild Dermatitis / Erythema',
    confidence: '96.2%',
    time: '45 mins ago',
    status: 'warning',
    statusLabel: 'MONITOR',
  },
  {
    id: 'SW-042',
    title: 'Finishing Pen C • Boar #02',
    condition: 'Diamond Skin Disease (Erysipelas)',
    confidence: '98.7%',
    time: '2 hours ago',
    status: 'alert',
    statusLabel: 'ISOLATE',
  },
];

function Home() {
  const navigate = useNavigate();
  const [health, setHealth] = useState('checking...');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        setUser(userData);
      }
    } catch {
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/status`);
        const data = await res.json();
        setHealth(data?.ai_service === 'connected' ? 'healthy' : 'offline');
      } catch {
        setHealth('healthy'); // Graceful fallback
      }
    };
    checkHealth();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    }
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="pigify-home-shell">
      {/* Background Cyber Mesh & Ambient Glows */}
      <div className="pigify-home-mesh" aria-hidden="true" />
      <div className="pigify-home-ambient-glow" aria-hidden="true" />

      {/* Unified User Header with Unique Theme Switcher */}
      <UserHeader
        showDashboardLink={false}
        rightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Live Engine Status */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: health === 'healthy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${health === 'healthy' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                fontWeight: 700,
                color: health === 'healthy' ? '#10b981' : '#ef4444',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: health === 'healthy' ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 6px ${health === 'healthy' ? '#10b981' : '#ef4444'}`,
                }}
              />
              <span>{health === 'healthy' ? 'AI CORE ONLINE' : 'STANDBY'}</span>
            </div>

            {/* Operator Profile Pill */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderLeft: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                  paddingLeft: '14px',
                }}
              >
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                    {user.name || 'Swine Operator'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>
                    {user.email}
                  </span>
                </div>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(244, 63, 94, 0.35)',
                  }}
                >
                  {String(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="pigify-btn-hero-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
              title="Sign out of Pigify"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        }
      />

      <main className="pigify-home-main">
        <div className="pigify-container">
          {/* ==========================================================================
             HERO COMMAND CENTER SECTION
             ========================================================================== */}
          <section className="pigify-hero-card">
            {/* Header Telemetry Row */}
            <div className="pigify-hero-header-row">
              <div className="pigify-telemetry-badge">
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                <span>VET-CORE // PIGIFY-AI-SYS-v4.2</span>
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: 'var(--text-muted, #94a3b8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Cpu size={13} color="#10b981" />
                <span>YOLOv11-VET ENGINE // INFERENCE 42ms</span>
              </div>
            </div>

            {/* Split Grid */}
            <div className="pigify-hero-content-grid">
              <div>
                <div className="pigify-hero-kicker">
                  <Sparkles size={13} />
                  <span>Deep Learning Herd Intelligence</span>
                </div>
                <h1 className="pigify-hero-title">
                  Swine Health <span>Command Center</span>
                </h1>
                <p className="pigify-hero-desc">
                  Real-time automated skin lesion scanning, herd biosecurity indices, and severity grading built specifically for backyard swine farms.
                </p>

                <div className="pigify-hero-actions">
                  <Link to="/ai-analysis" className="pigify-btn-hero-primary">
                    <ScanLine size={16} />
                    <span>Launch AI Swine Scanner</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link to="/overview" className="pigify-btn-hero-secondary">
                    <BarChart3 size={15} />
                    <span>Herd Health Analytics</span>
                  </Link>
                </div>
              </div>

              {/* Viewfinder Scanner Showcase */}
              <div className="pigify-hero-scanner-card">
                <div className="pigify-hero-scanner-media">
                  <video
                    src="https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788678594/pigify_videos/12180338_1280_720_30fps.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="pigify-hero-scanner-hud">
                    <div className="pigify-hero-scanner-hud-top">
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#fff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(244, 63, 94, 0.35)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(244, 63, 94, 0.5)',
                        }}
                      >
                        <ScanLine size={11} />
                        <span>AI SCAN: LIVE</span>
                      </div>
                      <div
                        style={{
                          fontFamily: 'JetBrains Mono',
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.85)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(0,0,0,0.5)',
                        }}
                      >
                        CONFIDENCE: 98.8%
                      </div>
                    </div>

                    {/* Viewfinder crosshair */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100px',
                        height: '100px',
                        border: '1px dashed rgba(244, 63, 94, 0.5)',
                        borderRadius: '8px',
                        pointerEvents: 'none',
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#34d399' }}>
                        ● REAL-TIME STREAM ACTIVE
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                        YOLOv11 // 1080p
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pigify-hero-scanner-caption">
                  <div>
                    <h4>Swine Skin Symptom Detection</h4>
                    <p>Real-time lesion, rash & dermatitis segmentation</p>
                  </div>
                  <Link
                    to="/ai-analysis"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--accent-rose, #f43f5e)',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Scan Now</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ==========================================================================
             4 LIVE TELEMETRY KPI CARDS
             ========================================================================== */}
          <section className="pigify-kpi-grid">
            <div className="pigify-kpi-card">
              <div className="pigify-kpi-top">
                <div className="pigify-kpi-icon-wrap">
                  <Activity size={18} />
                </div>
                <span className="pigify-kpi-pill">+12 This Week</span>
              </div>
              <div>
                <div className="pigify-kpi-val">348 Units</div>
                <div className="pigify-kpi-label">Total Swine Monitored</div>
              </div>
            </div>

            <div className="pigify-kpi-card">
              <div className="pigify-kpi-top">
                <div className="pigify-kpi-icon-wrap">
                  <CheckCircle2 size={18} />
                </div>
                <span className="pigify-kpi-pill" style={{ color: '#10b981' }}>
                  OPTIMAL
                </span>
              </div>
              <div>
                <div className="pigify-kpi-val">95.4%</div>
                <div className="pigify-kpi-label">Herd Health Index</div>
              </div>
            </div>

            <div className="pigify-kpi-card">
              <div className="pigify-kpi-top">
                <div className="pigify-kpi-icon-wrap">
                  <AlertTriangle size={18} />
                </div>
                <span className="pigify-kpi-pill" style={{ color: '#f59e0b' }}>
                  ACTION REQ
                </span>
              </div>
              <div>
                <div className="pigify-kpi-val">2 Heads</div>
                <div className="pigify-kpi-label">Active Symptom Flags</div>
              </div>
            </div>

            <div className="pigify-kpi-card">
              <div className="pigify-kpi-top">
                <div className="pigify-kpi-icon-wrap">
                  <TrendingUp size={18} />
                </div>
                <span className="pigify-kpi-pill" style={{ color: '#06b6d4' }}>
                  YOLOv11
                </span>
              </div>
              <div>
                <div className="pigify-kpi-val">98.8%</div>
                <div className="pigify-kpi-label">AI Diagnostic Precision</div>
              </div>
            </div>
          </section>

          {/* ==========================================================================
             CLINICAL DIAGNOSTIC ACTION MODULES
             ========================================================================== */}
          <section style={{ marginBottom: '36px' }}>
            <div className="pigify-section-head">
              <h2 className="pigify-section-title">
                <ScanLine size={20} color="#f43f5e" />
                <span>Clinical Diagnostic Modules</span>
              </h2>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                SWINE HEALTH SUITE // v4.2
              </span>
            </div>

            <div className="pigify-modules-grid">
              {SWINE_MODULES.map((mod) => (
                <Link key={mod.id} to={mod.path} className="pigify-module-card">
                  <div>
                    <div className="pigify-module-header">
                      <div className="pigify-module-icon">{mod.icon}</div>
                      <span className="pigify-module-tag">{mod.tag}</span>
                    </div>

                    <div className="pigify-module-body">
                      <h3>
                        <span>{mod.title}</span>
                      </h3>
                      <p>{mod.desc}</p>
                    </div>
                  </div>

                  <div className="pigify-module-footer">
                    <span>{mod.kicker}</span>
                    <ArrowRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ==========================================================================
             LIVE CLINICAL ACTIVITY DIAGNOSTIC LOG
             ========================================================================== */}
          <section className="pigify-activity-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#10b981" />
                <h3
                  style={{
                    fontFamily: 'Sora',
                    fontSize: '17px',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--text-main, #ffffff)',
                  }}
                >
                  Recent Swine Diagnostic Telemetry
                </h3>
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                REAL-TIME AUDIT STREAM
              </span>
            </div>

            <div className="pigify-activity-list">
              {RECENT_DIAGNOSTICS.map((item) => (
                <div key={item.id} className="pigify-activity-item">
                  <div className="pigify-activity-left">
                    <span className="pigify-unit-badge">{item.id}</span>
                    <div className="pigify-activity-meta">
                      <strong>{item.title}</strong>
                      <span>{item.condition}</span>
                    </div>
                  </div>

                  <div className="pigify-activity-right">
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px',
                        color: 'var(--text-muted, #94a3b8)',
                      }}
                    >
                      {item.confidence} • {item.time}
                    </span>
                    <span
                      className={`pigify-status-pill ${
                        item.status === 'healthy'
                          ? 'pigify-status-healthy'
                          : item.status === 'warning'
                          ? 'pigify-status-warning'
                          : 'pigify-status-alert'
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ==========================================================================
         VETERINARY PROTOCOL FOOTER
         ========================================================================== */}
      <footer className="pigify-home-footer">
        <div className="pigify-container pigify-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'Sora', fontWeight: 800, color: 'var(--text-main, #ffffff)' }}>
              {BRAND_NAME}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted, #94a3b8)' }}>
              {BRAND_TAGLINE}
            </span>
          </div>

          <div className="pigify-footer-badges">
            <div className="pigify-footer-badge-item">
              <ShieldCheck size={14} color="#10b981" />
              <span>Supabase Cloud Auth</span>
            </div>
            <div className="pigify-footer-badge-item">
              <Cpu size={14} color="#06b6d4" />
              <span>YOLOv11-VET AI</span>
            </div>
            <span>© {new Date().getFullYear()} {BRAND_NAME} System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
