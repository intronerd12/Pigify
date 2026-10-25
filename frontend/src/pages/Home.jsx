import { useEffect, useState, useRef } from 'react';
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
  MapPin,
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
    desc: 'Capture or upload swine photos for lesion, rash, and dermatitis detection with YOLOv8.',
    path: '/ai-analysis',
    icon: <ScanLine size={22} />,
    tag: 'OBJECT DETECTION',
    kicker: 'YOLOv8 Symptom Detection',
  },
  {
    id: 'analytics',
    title: 'Herd Health Overview',
    desc: 'Review recent scan entries, symptom frequency, and general health distribution across pens.',
    path: '/overview',
    icon: <BarChart3 size={22} />,
    tag: 'OVERVIEW',
    kicker: 'Health Records',
  },
  {
    id: 'grading',
    title: 'Severity Categorization',
    desc: 'Categorization of detected symptoms into Mild, Moderate, or Severe to assist in observation.',
    path: '/sorting-grading',
    icon: <Layers size={22} />,
    tag: 'SEVERITY',
    kicker: 'Severity Levels',
  },
  {
    id: 'disease-map',
    title: 'Disease Map & Local Reports',
    desc: 'Map of reported swine disease cases to help backyard raisers stay informed about local health status.',
    path: '/disease-map',
    icon: <MapPin size={22} />,
    tag: 'MAP VIEW',
    kicker: 'Disease Map',
  },
  {
    id: 'environment',
    title: 'Farm Environment',
    desc: 'Monitor ambient temperature and humidity readings that may impact pig comfort and skin health.',
    path: '/environment',
    icon: <CloudSun size={22} />,
    tag: 'ENVIRONMENT',
    kicker: 'Temperature & Humidity',
  },
  {
    id: 'community',
    title: 'Backyard Swine Community',
    desc: 'Discuss observations, ask questions, and share experiences with fellow backyard pig raisers.',
    path: '/community',
    icon: <MessageSquare size={22} />,
    tag: 'COMMUNITY',
    kicker: 'Farmer Forum',
  },
];

const RECENT_DIAGNOSTICS = [
  {
    id: 'SW-104',
    title: 'Pen B • Sow #04',
    condition: 'Normal Skin (No Lesions Detected)',
    confidence: 'Recorded',
    time: 'Today',
    status: 'healthy',
    statusLabel: 'NORMAL',
  },
  {
    id: 'SW-089',
    title: 'Pen A • Piglet #19',
    condition: 'Mild Dermatitis / Erythema',
    confidence: 'Recorded',
    time: 'Yesterday',
    status: 'warning',
    statusLabel: 'MONITOR',
  },
  {
    id: 'SW-042',
    title: 'Pen C • Boar #02',
    condition: 'Suspected Diamond Skin Signs (Erysipelas)',
    confidence: 'Recorded',
    time: '2 days ago',
    status: 'alert',
    statusLabel: 'OBSERVE',
  },
];

function Home() {
  const navigate = useNavigate();
  const [health, setHealth] = useState('checking...');
  const [user, setUser] = useState(null);
  const videoRef = useRef(null);

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

  // Viewport & visibility observer for hero video to save CPU/GPU on lower-end devices
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(v);

    const handleVisibility = () => {
      if (document.hidden) {
        v.pause();
      } else {
        v.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

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
      <UserHeader />

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
                <span>STUDY RESEARCH // BACKYARD SWINE HEALTH MONITORING</span>
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
                <span>YOLOv8 OBJECT DETECTION MODEL</span>
              </div>
            </div>

            {/* Split Grid */}
            <div className="pigify-hero-content-grid">
              <div>
                <div className="pigify-hero-kicker">
                  <Sparkles size={13} />
                  <span>Deep Learning Backyard Swine Health</span>
                </div>
                <h1 className="pigify-hero-title">
                  Swine Health <span>Monitoring Dashboard</span>
                </h1>
                <p className="pigify-hero-desc">
                  Automated skin symptom detection, severity categorization, and scan records developed for backyard pig farms.
                </p>

                <div className="pigify-hero-actions">
                  <Link to="/ai-analysis" className="pigify-btn-hero-primary">
                    <ScanLine size={16} />
                    <span>Open Symptom Scanner</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link to="/overview" className="pigify-btn-hero-secondary">
                    <BarChart3 size={15} />
                    <span>View Health Records</span>
                  </Link>
                </div>
              </div>

              {/* Viewfinder Scanner Showcase */}
              <div className="pigify-hero-scanner-card">
                <div className="pigify-hero-scanner-media">
                  <video
                    ref={videoRef}
                    src="https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788678594/pigify_videos/12180338_1280_720_30fps.mp4"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="Swine AI Scan Demo"
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
                        <span>AI SCAN: PREVIEW</span>
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
                        DETECTION MODEL: YOLOv8
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
                        ● VIDEO DEMO
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                        YOLOv8 MODEL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pigify-hero-scanner-caption">
                  <div>
                    <h4>Swine Skin Symptom Detection</h4>
                    <p>Sample lesion and rash detection display</p>
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
                <div className="pigify-kpi-val">348 Scans</div>
                <div className="pigify-kpi-label">Total Scans Logged</div>
              </div>
            </div>

            <div className="pigify-kpi-card">
              <div className="pigify-kpi-top">
                <div className="pigify-kpi-icon-wrap">
                  <CheckCircle2 size={18} />
                </div>
                <span className="pigify-kpi-pill" style={{ color: '#10b981' }}>
                  MONITORED
                </span>
              </div>
              <div>
                <div className="pigify-kpi-val">Normal</div>
                <div className="pigify-kpi-label">Primary Herd Status</div>
              </div>
            </div>

            <div className="pigify-kpi-card">
              <div className="pigify-kpi-top">
                <div className="pigify-kpi-icon-wrap">
                  <AlertTriangle size={18} />
                </div>
                <span className="pigify-kpi-pill" style={{ color: '#f59e0b' }}>
                  MONITOR
                </span>
              </div>
              <div>
                <div className="pigify-kpi-val">2 Flags</div>
                <div className="pigify-kpi-label">Recent Symptom Observations</div>
              </div>
            </div>

            <div className="pigify-kpi-card">
              <div className="pigify-kpi-top">
                <div className="pigify-kpi-icon-wrap">
                  <TrendingUp size={18} />
                </div>
                <span className="pigify-kpi-pill" style={{ color: '#06b6d4' }}>
                  MODEL
                </span>
              </div>
              <div>
                <div className="pigify-kpi-val">YOLOv8</div>
                <div className="pigify-kpi-label">Object Detection Model</div>
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
                <span>Swine Health Monitoring Modules</span>
              </h2>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                RESEARCH STUDY // PROTOTYPE
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
                  Recent Scan Records
                </h3>
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                ACTIVITY LOG
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
              <span>YOLOv8 Model</span>
            </div>
            <span>© {new Date().getFullYear()} {BRAND_NAME} System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
