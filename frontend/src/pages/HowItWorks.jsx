import { createElement, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Layers,
  Radio,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import MarketingFooter from '../components/marketing/MarketingFooter'
import MarketingHeader from '../components/marketing/MarketingHeader'
import './Landing.css'
import './MarketingPages.css'

const WORKFLOW_STAGES = [
  {
    step: '01',
    id: 'Stage 01',
    title: 'Image Acquisition',
    description: 'Farmers take a clear photo of the pig using a smartphone or upload an existing image from their device.',
    icon: Camera,
    tag: 'PHOTO INPUT',
    stats: 'Phone or Web',
    bullets: ['Natural daylight recommended', 'Focus on visible skin areas', 'Direct upload or camera snap'],
  },
  {
    step: '02',
    id: 'Stage 02',
    title: 'YOLOv8 Detection',
    description: 'The trained YOLOv8 model processes the image to identify visible skin signs such as lesions, redness, or patches.',
    icon: Cpu,
    tag: 'MODEL ANALYSIS',
    stats: 'YOLOv8 Model',
    bullets: ['Object detection model', 'Bounding box localization', 'Confidence score calculation'],
  },
  {
    step: '03',
    id: 'Stage 03',
    title: 'Severity Assessment',
    description: 'The system provides a suggested severity level (Mild, Moderate, or Severe) to help farmers understand the general condition.',
    icon: BarChart3,
    tag: 'SEVERITY RATING',
    stats: 'Mild/Mod/Severe',
    bullets: ['Visual symptom indicator', 'Preliminary severity rating', 'Observation priority'],
  },
  {
    step: '04',
    id: 'Stage 04',
    title: 'Record & Consultation',
    description: 'The scan result is saved to the history log, accompanied by basic care advice and a recommendation to consult a veterinarian.',
    icon: ShieldCheck,
    tag: 'HEALTH LOG',
    stats: 'Saved to Log',
    bullets: ['Recorded in scan history', 'Basic care reminders', 'Prompt to consult a veterinarian'],
  },
]

const CLINICAL_PILLARS = [
  {
    title: 'Farmer Record Keeping',
    description: 'Enables farmers to keep a digital record of pig health observations and track symptoms over time.',
    icon: RefreshCw,
    tag: 'RECORDS',
  },
  {
    title: 'Pen Health History',
    description: 'Helps farmers review past scans across different pens to observe if symptoms are appearing in other pigs.',
    icon: ClipboardList,
    tag: 'PEN HISTORY',
  },
  {
    title: 'Clear Visual Feedback',
    description: 'Displays bounding boxes on the uploaded image so farmers can clearly see which areas were flagged.',
    icon: CheckCircle2,
    tag: 'VISUAL OUTPUT',
  },
]

const LESION_SIMULATION_DATA = [
  {
    condition: 'Erysipelas (Diamond Skin Signs)',
    confidence: 'Sample Detection',
    severity: 'Moderate',
    severityType: 'warning',
    pen: 'Pen B-12',
    swineId: 'Sample #0482',
    treatment: 'Separate the pig from others in the pen and consult a veterinarian for diagnosis.',
    top: '38%',
    left: '52%',
    width: '120px',
    height: '90px',
  },
  {
    condition: 'Sarcoptic Mange Signs',
    confidence: 'Sample Detection',
    severity: 'Mild',
    severityType: 'info',
    pen: 'Pen A-04',
    swineId: 'Sample #0319',
    treatment: 'Clean pen bedding, monitor itching or crusted skin, and ask a vet about treatment options.',
    top: '46%',
    left: '32%',
    width: '100px',
    height: '75px',
  },
  {
    condition: 'Skin Irritation & Dermatitis',
    confidence: 'Sample Detection',
    severity: 'Severe',
    severityType: 'danger',
    pen: 'Pen C-08',
    swineId: 'Sample #0651',
    treatment: 'Observe closely, separate the pig if needed, and contact a veterinarian as soon as possible.',
    top: '30%',
    left: '42%',
    width: '135px',
    height: '95px',
  },
]

function HowItWorks() {
  const [activeSim, setActiveSim] = useState(0)
  const currentSim = LESION_SIMULATION_DATA[activeSim]

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
                <span>MONITORING WORKFLOW // STEP-BY-STEP PROCESS</span>
              </div>

              <h1 className="mk-title">
                From photo capture
                <span className="accent"> to symptom review</span>
              </h1>

              <p className="mk-subtitle">
                Pigify provides a straightforward process for backyard pig raisers to photograph their pigs,
                check for visible skin signs of disease, and keep track of their observations over time.
              </p>

              <div className="mk-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Start a Scan</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/features" className="lp-btn-secondary">
                  <Layers size={16} />
                  <span>View All Features</span>
                </Link>
              </div>
            </div>

            <aside className="mk-card">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-card-head">
                  <BarChart3 size={16} />
                  <span>WORKFLOW OUTLINE</span>
                </div>
                <h3>Designed for backyard pig farming</h3>
                <p>
                  By applying trained YOLOv8 models to photos taken on mobile phones or webcams,
                  Pigify helps small-scale farmers spot skin symptoms and maintain health records.
                </p>

                <ul className="mk-feature-list">
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Upload or camera photo input</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>YOLOv8 bounding box symptom localization</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Suggested severity: Mild, Moderate, or Severe</span>
                  </li>
                </ul>
              </div>

              <div className="mk-metric-strip">
                <div className="mk-metric">
                  <span className="value">4 Steps</span>
                  <span className="label">Workflow</span>
                </div>
                <div className="mk-metric">
                  <span className="value">YOLOv8</span>
                  <span className="label">Model</span>
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
            2. STEP-BY-STEP DIAGNOSTIC WORKFLOW PIPELINE
            ================================================================ */}
        <section className="mk-section mk-section-alt">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <Cpu size={12} />
                <span>STEP-BY-STEP PROCESS</span>
              </div>
              <h2>The four steps of the Pigify workflow</h2>
              <p>
                From photo capture to reviewing results and saving health logs, here is how the monitoring process is structured.
              </p>
            </div>

            <div className="mk-grid-4">
              {WORKFLOW_STAGES.map(({ step, id, title, description, icon, tag, stats, bullets }) => (
                <article key={id} className="mk-info-card">
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="mk-info-top">
                    <span className="mk-step-id">{id}</span>
                    <span className="mk-info-tag">{tag}</span>
                  </div>

                  <div className="mk-info-icon">{createElement(icon, { size: 20 })}</div>

                  <h3>{title}</h3>
                  <p>{description}</p>

                  <ul className="mk-info-bullets">
                    {bullets.map((b, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={12} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <span className="mk-step-latency">{stats}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            3. INTERACTIVE SIMULATION HUD
            ================================================================ */}
        <section className="mk-section">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <Radio size={12} />
                <span>SAMPLE PREVIEW</span>
              </div>
              <h2>Example scan result display</h2>
              <p>
                This demonstration shows how detected skin signs are marked with bounding boxes and accompanied by preliminary observation advice.
              </p>
            </div>

            <div className="swine-showcase-section">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div className="swine-showcase-grid">
                {/* Simulated Viewport */}
                <div className="lp-scanner-viewport" style={{ height: '360px' }}>
                  <img
                    src="/landing/swine-scan-subject.jpg"
                    alt="Pig Subject Example"
                    className="lp-viewport-subject"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="lp-viewport-overlay" />
                  <div className="lp-viewport-grid" />
                  <div className="lp-viewport-laser" />

                  {/* Dynamic Bounding Box */}
                  <div
                    className="lp-target-bbox"
                    style={{
                      top: currentSim.top,
                      left: currentSim.left,
                      width: currentSim.width,
                      height: currentSim.height,
                    }}
                  >
                    <div className="lp-bbox-tag">
                      <span className="lp-bbox-dot" />
                      <span>{currentSim.condition.toUpperCase()} // SAMPLE</span>
                    </div>
                    <div className="lp-lesion-hotspot" />
                    <div className="lp-bbox-corners" />
                  </div>

                  <div className="lp-viewport-meta">
                    <span>PEN: {currentSim.pen}</span>
                    <span>SUBJECT: {currentSim.swineId}</span>
                    <span>SEVERITY: {currentSim.severity}</span>
                  </div>
                </div>

                {/* Telemetry Panel */}
                <div className="swine-showcase-telemetry">
                  <div className="mk-card-head">
                    <Activity size={15} />
                    <span>SELECT SAMPLE TO PREVIEW</span>
                  </div>

                  {/* Selector Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {LESION_SIMULATION_DATA.map((sim, idx) => (
                      <button
                        key={sim.condition}
                        type="button"
                        onClick={() => setActiveSim(idx)}
                        className={`lp-btn-${activeSim === idx ? 'primary' : 'secondary'}`}
                        style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                      >
                        <span>{sim.condition.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Observed Symptom</span>
                    <span className="swine-telemetry-val highlight">{currentSim.condition}</span>
                  </div>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Detection Model</span>
                    <span className="swine-telemetry-val">YOLOv8 Detection</span>
                  </div>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Suggested Severity</span>
                    <span className="swine-telemetry-val" style={{ color: currentSim.severityType === 'danger' ? '#f43f5e' : currentSim.severityType === 'warning' ? '#f59e0b' : '#06b6d4' }}>
                      {currentSim.severity}
                    </span>
                  </div>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Recommended Step</span>
                    <span className="swine-telemetry-val" style={{ fontSize: '0.82rem' }}>
                      {currentSim.treatment}
                    </span>
                  </div>

                  <Link to="/home" className="lp-btn-primary" style={{ marginTop: '8px' }}>
                    <ScanLine size={16} />
                    <span>Open the Scanner</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            4. CLINICAL PILLARS & FEEDBACK LOOP
            ================================================================ */}
        <section className="mk-section mk-section-alt">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <ShieldCheck size={12} />
                <span>PRACTICAL APPROACH</span>
              </div>
              <h2>Designed for backyard farm monitoring</h2>
              <p>
                How Pigify organizes image analysis and health tracking to assist small-scale pig raisers.
              </p>
            </div>

            <div className="mk-grid-3">
              {CLINICAL_PILLARS.map(({ title, description, icon, tag }) => (
                <article key={title} className="mk-info-card">
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="mk-info-top">
                    <div className="mk-info-icon">{createElement(icon, { size: 20 })}</div>
                    <span className="mk-info-tag">{tag}</span>
                  </div>

                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            5. CTA BAND
            ================================================================ */}
        <section className="mk-section">
          <div className="container-pro">
            <div className="mk-cta">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-kicker" style={{ marginBottom: '12px' }}>
                  <Sparkles size={12} />
                  <span>START MONITORING</span>
                </div>
                <h3>Ready to check your pigs?</h3>
                <p>
                  Upload or take a photo to see how symptom detection and health record keeping work.
                </p>
              </div>

              <div className="mk-cta-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Start a Scan</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/features" className="lp-btn-secondary">
                  <span>Explore Features</span>
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

export default HowItWorks
