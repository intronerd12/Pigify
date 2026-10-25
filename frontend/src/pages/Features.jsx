import { createElement } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CloudSun,
  Cpu,
  Eye,
  Layers,
  Radio,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ThermometerSnowflake,
  Users,
} from 'lucide-react'
import MarketingFooter from '../components/marketing/MarketingFooter'
import MarketingHeader from '../components/marketing/MarketingHeader'
import './Landing.css'
import './MarketingPages.css'

const CORE_SWINE_FEATURES = [
  {
    title: 'YOLOv8 Symptom Detection',
    description: 'Applies trained YOLOv8 object detection to locate visible lesions, rashes, and skin discoloration on pig photos.',
    icon: Layers,
    badge: 'YOLOv8',
    tag: 'OBJECT DETECTION',
    bullets: [
      'Bounding box localization',
      'Confidence score for detections',
      'Trained on pig symptom photos',
    ],
  },
  {
    title: 'Skin Symptom Identification',
    description: 'Aims to help recognize visible signs associated with common swine conditions to support early observation.',
    icon: ShieldCheck,
    badge: 'Symptoms',
    tag: 'IMAGE ANALYSIS',
    bullets: [
      'Visible rash and redness',
      'Dermal lesions and spots',
      'Assists visual inspection',
    ],
  },
  {
    title: 'Severity Rating',
    description: 'Suggests a severity level—Mild, Moderate, or Severe—based on detected signs to help gauge urgency.',
    icon: BarChart3,
    badge: '3 Levels',
    tag: 'SEVERITY',
    bullets: [
      'Mild, Moderate, or Severe rating',
      'Preliminary observation suggestion',
      'Guidance on when to consult a vet',
    ],
  },
  {
    title: 'Care & Observation Guidance',
    description: 'Provides initial advice such as pen observation, clean bedding, and consulting a veterinarian.',
    icon: ShieldAlert,
    badge: 'Guidance',
    tag: 'CARE REMINDERS',
    bullets: [
      'Pen separation reminder',
      'Observation checklist',
      'Encourages veterinary advice',
    ],
  },
  {
    title: 'Scan History & Records',
    description: 'Maintains a log of previous scans with dates and images so farmers can track health over time.',
    icon: Activity,
    badge: 'Records',
    tag: 'HISTORY',
    bullets: [
      'Saved photos and results',
      'Review past scan dates',
      'Useful reference for visiting vets',
    ],
  },
  {
    title: 'Environment Data Viewing',
    description: 'Displays temperature and humidity data to help farmers stay aware of pen comfort conditions.',
    icon: CloudSun,
    badge: 'Environment',
    tag: 'CONDITIONS',
    bullets: [
      'Current temperature reading',
      'Relative humidity levels',
      'Heat stress awareness',
    ],
  },
]

const EXTENSIONS = [
  {
    title: 'Web & Mobile Interface',
    description: 'Accessible from both mobile browsers and desktop computers for flexible use on the farm.',
    icon: ScanLine,
    tag: 'PLATFORM',
  },
  {
    title: 'Disease Map',
    description: 'Displays reported disease cases on a map so farmers can stay informed about local health trends.',
    icon: Cpu,
    tag: 'MAP VIEW',
  },
  {
    title: 'Community Forum',
    description: 'Enables farmers to ask questions, share observations, and discuss farming practices with peers.',
    icon: Users,
    tag: 'COMMUNITY',
  },
]

function Features() {
  return (
    <div className="pro-landing mk-page">
      <MarketingHeader />

      <main className="mk-main">
        {/* ================================================================
            1. HERO SECTION
            ================================================================ */}
        <section className="mk-hero">
          <div className="container-pro mk-hero-grid">
            <div className="mk-hero-copy">
              <div className="mk-kicker">
                <span className="mk-kicker-dot" />
                <span>SYSTEM FEATURES // BACKYARD SWINE HEALTH MONITORING</span>
              </div>

              <h1 className="mk-title">
                Features developed for
                <span className="accent"> backyard swine health monitoring</span>
              </h1>

              <p className="mk-subtitle">
                Pigify combines YOLOv8 object detection, severity rating, and simple record keeping
                into a web and mobile application to help backyard pig raisers monitor their herd.
              </p>

              <div className="mk-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Start a Scan</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="lp-btn-secondary">
                  <Layers size={16} />
                  <span>How It Works</span>
                </Link>
              </div>
            </div>

            <aside className="mk-card">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-card-head">
                  <Cpu size={16} />
                  <span>SYSTEM OVERVIEW</span>
                </div>
                <h3>Built for small-scale raisers</h3>
                <p>
                  Backyard farming often lacks quick access to specialized equipment. These features provide
                  a practical tool to support daily pig observation and health tracking.
                </p>

                <ul className="mk-feature-list">
                  <li>
                    <CheckCircle2 size={16} />
                    <span>YOLOv8 deep learning object detection</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Visible skin lesion and symptom detection</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Historical scan logs for review</span>
                  </li>
                </ul>
              </div>

              <div className="mk-metric-strip">
                <div className="mk-metric">
                  <span className="value">YOLOv8</span>
                  <span className="label">Model</span>
                </div>
                <div className="mk-metric">
                  <span className="value">Web &amp; Mobile</span>
                  <span className="label">Platform</span>
                </div>
                <div className="mk-metric">
                  <span className="value">3 Levels</span>
                  <span className="label">Severity</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ================================================================
            2. 6 CORE SWINE CLINICAL FEATURES
            ================================================================ */}
        <section className="mk-section mk-section-alt">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <ShieldCheck size={12} />
                <span>CORE MODULES</span>
              </div>
              <h2>Main features of the monitoring system</h2>
              <p>
                Tools to help smallholder farmers detect visible symptoms, categorize severity, and maintain herd records.
              </p>
            </div>

            <div className="mk-grid-3">
              {CORE_SWINE_FEATURES.map(({ title, description, icon, badge, tag, bullets }) => (
                <article key={title} className="mk-info-card">
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="mk-info-top">
                    <div className="mk-info-icon">{createElement(icon, { size: 20 })}</div>
                    <span className="mk-info-tag">{tag}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        color: 'var(--accent-emerald, #10b981)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      {badge}
                    </span>
                  </div>

                  <p>{description}</p>

                  <ul className="mk-info-bullets">
                    {bullets.map((b, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={12} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            3. EXTENSION CAPABILITIES
            ================================================================ */}
        <section className="mk-section">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <Sparkles size={12} />
                <span>ADDITIONAL TOOLS</span>
              </div>
              <h2>Additional system modules</h2>
              <p>
                Supporting features including community discussions, disease maps, and environmental readings.
              </p>
            </div>

            <div className="mk-grid-3">
              {EXTENSIONS.map(({ title, description, icon, tag }) => (
                <article key={title} className="mk-info-card">
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="mk-info-top">
                    <div className="mk-info-icon">{createElement(icon, { size: 20 })}</div>
                    <span className="mk-info-tag">{tag}</span>
                  </div>

                  <h3>{title}</h3>
                  <p>{description}</p>

                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <Link
                      to="/home"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--accent-rose, #f43f5e)',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Open in workspace</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            4. CALL TO ACTION BAND
            ================================================================ */}
        <section className="mk-section mk-section-alt">
          <div className="container-pro">
            <div className="mk-cta">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-kicker" style={{ marginBottom: '12px' }}>
                  <Radio size={12} />
                  <span>START MONITORING</span>
                </div>
                <h3>Ready to check your pigs?</h3>
                <p>
                  Start scanning pig photos, tracking symptoms over time, and keeping records for your farm.
                </p>
              </div>

              <div className="mk-cta-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Start a Scan</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="lp-btn-secondary">
                  <span>How It Works</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default Features
