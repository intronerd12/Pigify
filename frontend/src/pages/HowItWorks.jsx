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
    description: 'Farmers capture high-definition photographs of pig skin, lesions, or rashes using any smartphone camera in natural pen lighting.',
    icon: Camera,
    tag: 'PEN ACQUISITION',
    stats: 'Instant Capture',
    bullets: ['Automatic framing guidance', 'Backyard pen daylight compensation', 'Multi-angle lesion capture'],
  },
  {
    step: '02',
    id: 'Stage 02',
    title: 'YOLO Lesion Segmentation',
    description: 'State-of-the-art YOLOv8 and YOLOv11 deep learning models process the dermal surface, isolating lesion boundaries and classifying disease signatures.',
    icon: Cpu,
    tag: 'YOLO INFERENCE',
    stats: '< 1.8s Latency',
    bullets: ['Sub-second boundary masking', '14 Swine disease classes', 'Bounding box confidence calculation'],
  },
  {
    step: '03',
    id: 'Stage 03',
    title: 'Severity Stratification',
    description: 'The diagnostic core calculates total affected skin surface ratio and stratifies into Mild (Monitor), Moderate (Isolate), or Severe (Acute Quarantine).',
    icon: BarChart3,
    tag: 'TRIAGE ENGINE',
    stats: 'Mild/Mod/Severe',
    bullets: ['Dermal spread quantification', 'Contagion transmission risk index', 'Automated veterinary priority ranking'],
  },
  {
    step: '04',
    id: 'Stage 04',
    title: 'Biosecurity Action Protocol',
    description: 'Smallholders receive clear, actionable pen quarantine protocols, safe treatment guidance, and exportable veterinary summary logs.',
    icon: ShieldCheck,
    tag: 'HERD BIOSECURITY',
    stats: 'Early Containment',
    bullets: ['Instant pen isolation advice', 'Targeted antimicrobial guidance', 'Exportable clinical PDF report'],
  },
]

const CLINICAL_PILLARS = [
  {
    title: 'Backyard Farmer Feedback Loop',
    description: 'Field diagnostic confirmations and treatment outcomes submitted by farmers continuously refine model precision for backyard conditions.',
    icon: RefreshCw,
    tag: 'ACTIVE LEARNING',
  },
  {
    title: 'Herd-Wide Epidemiological Tracking',
    description: 'Automated summaries reveal infection prevalence, symptom velocity, and historical recovery timelines by individual pen.',
    icon: ClipboardList,
    tag: 'PEN TELEMETRY',
  },
  {
    title: 'Explainable Diagnostic Metrics',
    description: 'Every scan result features clear boundary boxes, class confidence percentages, and transparent clinical score factors.',
    icon: CheckCircle2,
    tag: 'TRANSPARENCY',
  },
]

const LESION_SIMULATION_DATA = [
  {
    condition: 'Erysipelas (Diamond Skin Disease)',
    confidence: '98.7%',
    severity: 'Moderate [Stage 2]',
    severityType: 'warning',
    pen: 'Pen B-12',
    swineId: 'SW-0482',
    treatment: 'Immediate penicillin administration & isolate from pen herd.',
    top: '38%',
    left: '52%',
    width: '120px',
    height: '90px',
  },
  {
    condition: 'Sarcoptic Mange (Scabies)',
    confidence: '97.4%',
    severity: 'Mild [Stage 1]',
    severityType: 'info',
    pen: 'Pen A-04',
    swineId: 'SW-0319',
    treatment: 'Apply acaricide spray or injectable ivermectin; sanitize bedding.',
    top: '46%',
    left: '32%',
    width: '100px',
    height: '75px',
  },
  {
    condition: 'Swine Pox & Dermatitis',
    confidence: '99.1%',
    severity: 'Severe [Stage 3]',
    severityType: 'danger',
    pen: 'Pen C-08',
    swineId: 'SW-0651',
    treatment: 'Strict pen isolation; prevent lice transmission, supportive hydration.',
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
                <span>DIAGNOSTIC PIPELINE // REAL-TIME SWINE DERMIS INFERENCE</span>
              </div>

              <h1 className="mk-title">
                A clear pipeline from
                <span className="accent"> image scan to health decision</span>
              </h1>

              <p className="mk-subtitle">
                Pigify removes guesswork from backyard swine disease management. Every step in our computer vision
                pipeline is optimized so small-scale farmers can detect infections early, isolate sick pigs,
                and prevent devastating herd-wide outbreaks.
              </p>

              <div className="mk-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Start Live Swine Scan</span>
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
                  <span>CLINICAL TRIAGE FLOW</span>
                </div>
                <h3>Engineered for early herd protection</h3>
                <p>
                  By standardizing image acquisition and leveraging YOLO neural segmentation, Pigify turns any
                  smartphone camera into an on-farm diagnostic tool for backyard swine herds.
                </p>

                <ul className="mk-feature-list">
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Rapid on-device or edge image preprocessing</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Lesion boundary localization with sub-second inference</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Explainable severity grades: Mild, Moderate, or Acute Quarantine</span>
                  </li>
                </ul>
              </div>

              <div className="mk-metric-strip">
                <div className="mk-metric">
                  <span className="value">4 Stages</span>
                  <span className="label">Pipeline</span>
                </div>
                <div className="mk-metric">
                  <span className="value">&lt; 1.8s</span>
                  <span className="label">Analysis</span>
                </div>
                <div className="mk-metric">
                  <span className="value">0.05%</span>
                  <span className="label">False Alert</span>
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
                <span>STEP-BY-STEP BREAKDOWN</span>
              </div>
              <h2>The four-stage swine diagnostic workflow</h2>
              <p>
                From pen-side image capture to actionable biosecurity containment, every phase is engineered
                to be intuitive for smallholders while maintaining clinical diagnostic rigor.
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
                <span>SIMULATION BENCHMARK</span>
              </div>
              <h2>Interactive lesion segmentation preview</h2>
              <p>
                See how Pigify's vision models detect swine dermatological conditions, establish bounding boxes,
                and generate clinical treatment protocols in real time.
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
                    alt="Swine Clinical Subject"
                    className="lp-viewport-subject"
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
                      <span>{currentSim.condition.toUpperCase()} // {currentSim.confidence}</span>
                    </div>
                    <div className="lp-lesion-hotspot" />
                    <div className="lp-bbox-corners" />
                  </div>

                  <div className="lp-viewport-meta">
                    <span>PEN: {currentSim.pen}</span>
                    <span>SUBJECT: {currentSim.swineId}</span>
                    <span>STATUS: {currentSim.severity}</span>
                  </div>
                </div>

                {/* Telemetry Panel */}
                <div className="swine-showcase-telemetry">
                  <div className="mk-card-head">
                    <Activity size={15} />
                    <span>SELECT CONDITION TO SIMULATE</span>
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
                    <span className="swine-telemetry-label">Classified Pathology</span>
                    <span className="swine-telemetry-val highlight">{currentSim.condition}</span>
                  </div>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Neural Confidence</span>
                    <span className="swine-telemetry-val">{currentSim.confidence} YOLOv8</span>
                  </div>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Assessed Risk Level</span>
                    <span className="swine-telemetry-val" style={{ color: currentSim.severityType === 'danger' ? '#f43f5e' : currentSim.severityType === 'warning' ? '#f59e0b' : '#06b6d4' }}>
                      {currentSim.severity}
                    </span>
                  </div>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Action Protocol</span>
                    <span className="swine-telemetry-val" style={{ fontSize: '0.82rem' }}>
                      {currentSim.treatment}
                    </span>
                  </div>

                  <Link to="/home" className="lp-btn-primary" style={{ marginTop: '8px' }}>
                    <ScanLine size={16} />
                    <span>Launch Live Diagnostic Scanner</span>
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
                <span>FIELD VALIDATION</span>
              </div>
              <h2>Continuous learning &amp; biosecurity governance</h2>
              <p>
                How Pigify maintains diagnostic reliability across backyard environments through structured farmer feedback loops and telemetry logging.
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
                  <span>COMMENCE SCANNING</span>
                </div>
                <h3>Ready to test the diagnostic pipeline?</h3>
                <p>
                  Access the live operator workspace to capture swine photographs, run instant lesion segmentation, and receive clinical biosecurity reports.
                </p>
              </div>

              <div className="mk-cta-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Launch Live Scanner</span>
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
