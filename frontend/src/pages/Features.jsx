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
    title: 'YOLO Lesion Segmentation',
    description: 'High-precision deep neural vision that detects dermal boundaries, erythema flush, diamond shapes, and rash patches in real time.',
    icon: Layers,
    badge: 'YOLOv8 / v11',
    tag: 'COMPUTER VISION',
    bullets: [
      'Sub-second bounding box segmentation',
      'Robust against outdoor dust and lighting',
      'Real-time polygon boundary masking',
    ],
  },
  {
    title: 'Multi-Class Pathology Classifier',
    description: 'Trained to recognize specific swine dermatological conditions to guide targeted intervention before symptoms escalate.',
    icon: ShieldCheck,
    badge: '14 Conditions',
    tag: 'DERMIS INFERENCE',
    bullets: [
      'Erysipelas (Diamond Skin Disease)',
      'Sarcoptic Mange & Parasitic Scabies',
      'Swine Pox & Exudative Epidermitis',
    ],
  },
  {
    title: 'Severity Stratification Engine',
    description: 'Quantifies total affected skin surface area and stratifies cases into clear triage levels: Mild, Moderate, or Acute Quarantine.',
    icon: BarChart3,
    badge: '3-Tier Triage',
    tag: 'CLINICAL TRIAGE',
    bullets: [
      'Affected dermal percentage calculation',
      'Contagion transmission risk index',
      'Automated priority flagging for vets',
    ],
  },
  {
    title: 'Biosecurity Quarantine Protocols',
    description: 'Generates instant, actionable containment guidelines to isolate infected animals and protect healthy pen mates.',
    icon: ShieldAlert,
    badge: 'Outbreak Contain',
    tag: 'PEN BIOSECURITY',
    bullets: [
      'Safe pen separation guidelines',
      'Targeted antimicrobial administration advice',
      'Disinfection & bedding cleanup protocols',
    ],
  },
  {
    title: 'Herd Epidemiological Analytics',
    description: 'Monitors infection transmission velocity, recovery trajectories, and historical symptom trends across backyard pens.',
    icon: Activity,
    badge: 'Trend Telemetry',
    tag: 'EPIDEMIOLOGY',
    bullets: [
      'Pen-level infection heatmaps',
      'Longitudinal recovery tracking',
      'Exportable veterinary audit summaries',
    ],
  },
  {
    title: 'Pen Microclimate Telemetry',
    description: 'Correlates ambient farm temperature, humidity, and ventilation with swine dermatological flare-ups and heat stress.',
    icon: CloudSun,
    badge: 'Sensor Fusion',
    tag: 'ENVIRONMENT',
    bullets: [
      'Ambient heat index correlation',
      'Humidity and ammonia risk markers',
      'Seasonal outbreak pattern forecasting',
    ],
  },
]

const EXTENSIONS = [
  {
    title: 'Live Mobile & Desktop Scanner',
    description: 'Intuitive camera scanner interface optimized for phones, tablets, or pen-mounted devices with offline caching.',
    icon: ScanLine,
    tag: 'FIELD OPERATOR',
  },
  {
    title: 'Active Learning Feedback Loop',
    description: 'Farmer-confirmed diagnostics and vet corrections continuously feed model retraining pipelines to elevate precision.',
    icon: Cpu,
    tag: 'MODEL EVOLUTION',
  },
  {
    title: 'Multi-Role Farm Governance',
    description: 'Role-based access separating smallholder operators, livestock inspectors, and veterinary consultants.',
    icon: Users,
    tag: 'ACCESS CONTROL',
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
                <span>PLATFORM CAPABILITIES // CLINICAL SWINE SUITE</span>
              </div>

              <h1 className="mk-title">
                Feature set built for
                <span className="accent"> backyard swine disease defense</span>
              </h1>

              <p className="mk-subtitle">
                Pigify combines advanced computer vision, automated severity grading, and practical farm biosecurity
                workflows into a unified platform so backyard pig farmers can detect, isolate, and treat infections with confidence.
              </p>

              <div className="mk-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Launch Live Scanner</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="lp-btn-secondary">
                  <Layers size={16} />
                  <span>See Diagnostic Process</span>
                </Link>
              </div>
            </div>

            <aside className="mk-card">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-card-head">
                  <Cpu size={16} />
                  <span>SYSTEM ARCHITECTURE</span>
                </div>
                <h3>Enterprise swine health intelligence</h3>
                <p>
                  Built from the ground up to address real challenges faced by smallholders: inconsistent lighting,
                  unruly animal movement, and lack of immediate on-site veterinary diagnostics.
                </p>

                <ul className="mk-feature-list">
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Real-time YOLOv8 / YOLOv11 neural inference</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>14 Verified swine skin lesion and disease classes</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Instant PDF health reports for local veterinarians</span>
                  </li>
                </ul>
              </div>

              <div className="mk-metric-strip">
                <div className="mk-metric">
                  <span className="value">14 Classes</span>
                  <span className="label">Lesion Index</span>
                </div>
                <div className="mk-metric">
                  <span className="value">98.5%</span>
                  <span className="label">mAP Score</span>
                </div>
                <div className="mk-metric">
                  <span className="value">Real-Time</span>
                  <span className="label">Pen Telemetry</span>
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
                <span>CORE CAPABILITIES</span>
              </div>
              <h2>Six pillars of backyard herd health monitoring</h2>
              <p>
                A comprehensive clinical suite engineered to halt disease spread, reduce mortality,
                and maintain high biosecurity standards across backyard swine pens.
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
                <span>ECOSYSTEM INTEGRATIONS</span>
              </div>
              <h2>Operational modules &amp; farmer workflows</h2>
              <p>
                Seamlessly connecting on-pen scanning with historical analytics, model retraining, and farm collaboration.
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
                      <span>Explore in workspace</span>
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
                  <span>FARM BIOSECURITY</span>
                </div>
                <h3>Ready to equip your farm with AI disease monitoring?</h3>
                <p>
                  Start scanning pig skin health, tracking symptom severity, and protecting your herd from contagious disease outbreaks.
                </p>
              </div>

              <div className="mk-cta-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Launch Live Scanner</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="lp-btn-secondary">
                  <span>Diagnostic Workflow</span>
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
