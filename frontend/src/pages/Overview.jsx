import React from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  CloudSun,
  Cpu,
  Layers,
  MessageSquare,
  Radio,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import UserHeader from '../components/user/UserHeader'
import './Landing.css'
import './MarketingPages.css'

const OVERVIEW_METRICS = [
  { label: 'Vision Model', val: 'YOLOv8 / v11', sub: 'Multi-scale segmentation' },
  { label: 'Inference Speed', val: '< 1.8s', sub: 'Real-time pen processing' },
  { label: 'Lesion Classes', val: '14 Indexed', sub: 'Dermatitis, pox, scabies' },
  { label: 'Detection mAP', val: '98.5%', sub: 'Validated under field daylight' },
]

const WORKFLOW_STEPS = [
  { num: '01', title: 'Capture', desc: 'Photograph pig skin surface under ambient daylight with smartphone camera.' },
  { num: '02', title: 'Segment', desc: 'YOLO neural model isolates lesion boundaries, diamond shapes, and rash patches.' },
  { num: '03', title: 'Stratify', desc: 'Calculates affected area and stratifies into Mild, Moderate, or Acute Quarantine.' },
  { num: '04', title: 'Contain', desc: 'Receive immediate pen isolation protocols and veterinary treatment summaries.' },
]

const CAPABILITIES = [
  {
    icon: ScanLine,
    title: 'Computer Vision Dermis Inference',
    desc: 'Real-time deep neural boundary segmentation of swine skin lesions and dermatitis.',
    tag: 'YOLOv8 VISION',
  },
  {
    icon: ShieldCheck,
    title: 'Pathology Classification',
    desc: 'Automated multi-condition detection for Erysipelas, Sarcoptic Mange, Swine Pox, and Greasy Pig.',
    tag: '14 CONDITIONS',
  },
  {
    icon: BarChart3,
    title: 'Symptom Severity Grading',
    desc: 'Clinical triage stratification into Mild (Monitor), Moderate (Isolate), or Severe (Veterinary Alert).',
    tag: 'TRIAGE ENGINE',
  },
  {
    icon: Activity,
    title: 'Epidemiological Herd Trends',
    desc: 'Track infection rates, pen spread velocity, and recovery histories across your backyard herd.',
    tag: 'HERD HEALTH',
  },
  {
    icon: CloudSun,
    title: 'Pen Microclimate Telemetry',
    desc: 'Correlate ambient temperature, pen humidity, and ammonia index with skin flare-ups.',
    tag: 'BIOSECURITY',
  },
  {
    icon: ShieldAlert,
    title: 'Biosecurity Outbreak Containment',
    desc: 'Immediate quarantine guidance to halt disease transmission to healthy pen mates.',
    tag: 'EARLY DEFENSE',
  },
]

function Overview() {
  return (
    <div className="pro-landing mk-page">
      <UserHeader />

      <main className="mk-main">
        {/* ================================================================
            1. HERO OVERVIEW
            ================================================================ */}
        <section className="mk-hero">
          <div className="container-pro mk-hero-grid">
            <div className="mk-hero-copy">
              <div className="mk-kicker">
                <span className="mk-kicker-dot" />
                <span>CLINICAL HERD ANALYTICS // PIGIFY SWINE TELEMETRY</span>
              </div>

              <h1 className="mk-title">
                Intelligent swine disease
                <span className="accent"> &amp; symptom monitoring</span>
              </h1>

              <p className="mk-subtitle">
                Pigify transforms backyard pig farming with deep learning-powered swine skin scanning,
                lesion segmentation, severity stratification, and early biosecurity containment.
              </p>

              <div className="mk-actions">
                <Link to="/ai-analysis" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Start Swine Analysis</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/community" className="lp-btn-secondary">
                  <MessageSquare size={16} />
                  <span>Farmer Community</span>
                </Link>
              </div>
            </div>

            <aside className="mk-card">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-card-head">
                  <ShieldCheck size={16} />
                  <span>HERD TELEMETRY CONSOLE</span>
                </div>
                <h3>Active backyard biosecurity standards</h3>
                <p>
                  Monitor and triage swine skin conditions in real time to prevent contagious disease outbreaks across outdoor farm pens.
                </p>

                <ul className="mk-feature-list">
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Real-time bounding box segmentation of swine skin lesions</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Automatic Mild, Moderate, or Acute Quarantine triage</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Pen-level epidemiological telemetry and infection logs</span>
                  </li>
                </ul>
              </div>

              <div className="mk-metric-strip">
                {OVERVIEW_METRICS.slice(0, 3).map((m) => (
                  <div key={m.label} className="mk-metric">
                    <span className="value">{m.val}</span>
                    <span className="label">{m.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* ================================================================
            2. HOW IT WORKS 4-STAGE PIPELINE
            ================================================================ */}
        <section className="mk-section mk-section-alt">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <Cpu size={12} />
                <span>CLINICAL PIPELINE</span>
              </div>
              <h2>How swine diagnostics flow from pen to action</h2>
              <p>
                Engineered for practical on-farm use: fast photo intake, automated neural inference, and actionable containment guidance.
              </p>
            </div>

            <div className="mk-grid-4">
              {WORKFLOW_STEPS.map((step) => (
                <article key={step.num} className="mk-info-card">
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="mk-info-top">
                    <span className="mk-step-id">STAGE {step.num}</span>
                    <span className="mk-info-tag">CLINICAL</span>
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            3. KEY CLINICAL CAPABILITIES
            ================================================================ */}
        <section className="mk-section">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <Sparkles size={12} />
                <span>INTELLIGENCE SUITE</span>
              </div>
              <h2>Key diagnostic capabilities</h2>
              <p>
                Purpose-built computer vision tools to identify skin symptoms early, prevent transmission, and protect herd health.
              </p>
            </div>

            <div className="mk-grid-3">
              {CAPABILITIES.map(({ icon, title, desc, tag }) => (
                <article key={title} className="mk-info-card">
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="mk-info-top">
                    <div className="mk-info-icon">{React.createElement(icon, { size: 20 })}</div>
                    <span className="mk-info-tag">{tag}</span>
                  </div>

                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            4. GET STARTED CTA
            ================================================================ */}
        <section className="mk-section mk-section-alt">
          <div className="container-pro">
            <div className="mk-cta">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-kicker" style={{ marginBottom: '12px' }}>
                  <Radio size={12} />
                  <span>READY TO COMMENCE</span>
                </div>
                <h3>Ready to analyze swine skin health?</h3>
                <p>
                  Upload or capture a photograph of your pig to receive real-time lesion segmentation, symptom classification, and containment guidance.
                </p>
              </div>

              <div className="mk-cta-actions">
                <Link to="/ai-analysis" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Upload &amp; Analyze</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/community" className="lp-btn-secondary">
                  <span>View Community Cases</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="container-pro lp-footer-bottom" style={{ borderTop: 'none', paddingTop: '16px' }}>
          <span>(c) {new Date().getFullYear()} {BRAND_NAME}. {BRAND_TAGLINE}.</span>
          <div className="lp-footer-legal">
            <Link to="/about">About</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/features">Features</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Overview