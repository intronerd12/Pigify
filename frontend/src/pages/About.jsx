import { createElement, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Crown,
  Database,
  Eye,
  Layers,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import MarketingFooter from '../components/marketing/MarketingFooter'
import MarketingHeader from '../components/marketing/MarketingHeader'
import './Landing.css'
import './MarketingPages.css'

const PILLARS = [
  {
    title: 'Diagnostic Transparency',
    description: 'Every lesion detection and severity score is backed by measurable bounding box indicators and explainable confidence vectors.',
    icon: ShieldCheck,
    tag: 'EXPLAINABLE AI',
  },
  {
    title: 'Backyard Pen Speed',
    description: 'Engineered for real-world small farm pens, with mobile inference under 1.8s for immediate on-site swine triage.',
    icon: Activity,
    tag: '< 1.8S INFERENCE',
  },
  {
    title: 'Continuous Retraining',
    description: 'Field diagnostic logs from smallholders continually refine model precision across diverse lighting and pen environments.',
    icon: TrendingUp,
    tag: 'ACTIVE LEARNING',
  },
  {
    title: 'Biosecurity Impact',
    description: 'Early symptom recognition halts disease transmission across outdoor pens and significantly reduces swine mortality.',
    icon: Radio,
    tag: 'HERD BIOSECURITY',
  },
]

const PIPELINE = [
  {
    id: 'Stage 01',
    title: 'Image Acquisition & Pen Logging',
    description: 'Farmers capture swine skin photos on mobile devices with pen context, age group, and observed symptom markers.',
    latency: 'Instant Upload',
  },
  {
    id: 'Stage 02',
    title: 'YOLO Lesion Segmentation',
    description: 'Deep neural networks identify lesion boundaries, erythema patches, diamond skin marks, and parasitic scabies.',
    latency: '1.4s Inference',
  },
  {
    id: 'Stage 03',
    title: 'Severity Stratification',
    description: 'The engine classifies findings into Mild (Monitor), Moderate (Isolate), or Severe (Acute Veterinary Care).',
    latency: 'Automated Scoring',
  },
  {
    id: 'Stage 04',
    title: 'Biosecurity Containment',
    description: 'Immediate containment guidelines, quarantine protocols, and exportable veterinary summary reports are generated.',
    latency: 'Live Protocol',
  },
]

const TEAM_MEMBERS = [
  {
    name: 'Adora, Joenabelle',
    role: 'Member',
    description: 'Supports swine dermatological dataset curation, annotation pipelines, and validation checks to keep training inputs clinically sound.',
    imgSrc: '/About%20us/adora,%20joanabel.jpg',
    fbLink: 'https://www.facebook.com/aeri.elle.0#',
  },
  {
    name: 'Bumatay, Axel Jillian',
    role: 'Leader',
    description: 'Leads project architecture, coordinates deep learning model integration, and drives technical delivery for backyard swine monitoring.',
    isLeader: true,
    imgSrc: '/About%20us/axel%20bumatay.jpg',
    fbLink: 'https://www.facebook.com/axeljilian.bumatay.5#',
  },
  {
    name: 'Danque, John Michael',
    role: 'Member',
    description: 'Contributes to computer vision workflow execution, bounding box validation, and clinical triaging accuracy under field conditions.',
    imgSrc: '/About%20us/john%20michael%20danque.jpg',
    fbLink: 'https://www.facebook.com/john.michael.danque.2024',
  },
  {
    name: 'Landas, Davimher',
    role: 'Member',
    description: 'Supports system implementation, testing across varied mobile devices, and refining the farm-friendly user interface.',
    imgSrc: '/About%20us/landas,%20davimher.jpg',
    fbLink: 'https://www.facebook.com/davimher.landas#',
  },
]

const DATASET_SAMPLES = [
  {
    src: '/landing/swine-health-scan.jpg',
    title: 'Veterinary Skin Lesion Inspection',
    tag: 'CLINICAL DERMIS',
    stats: '98.8% Lesion Boundary Accuracy',
  },
  {
    src: '/landing/swine-biosecurity-pen.jpg',
    title: 'Backyard Swine Pen Surveillance',
    tag: 'HERD BIOSECURITY',
    stats: 'Automated Multi-Subject Tracking',
  },
  {
    src: '/landing/swine-scan-subject.jpg',
    title: 'Lateral Dorsal Telemetry Scan',
    tag: 'YOLOv8 INFERENCE',
    stats: 'Real-Time Erythema Segmentation',
  },
]

function TeamPhoto({ src, alt, className }) {
  const [hasError, setHasError] = useState(false)

  return (
    <img
      src={hasError ? '/landing/swine-scan-subject.jpg' : src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}

function About() {
  const [selectedMember, setSelectedMember] = useState(null)
  const [activeSample, setActiveSample] = useState(0)

  return (
    <div className="pro-landing mk-page">
      <MarketingHeader />

      <main className="mk-main">
        {/* ================================================================
            1. HERO COMMAND SECTION
            ================================================================ */}
        <section className="mk-hero">
          <div className="container-pro mk-hero-grid">
            <div className="mk-hero-copy">
              <div className="mk-kicker">
                <span className="mk-kicker-dot" />
                <span>STUDY ARCHITECTURE // BACKYARD SWINE BIOSECURITY</span>
              </div>

              <h1 className="mk-title">
                Deep learning swine disease &amp; symptom monitoring for
                <span className="accent"> backyard farms</span>
              </h1>

              <p className="mk-subtitle">
                Pigify was engineered for small-scale swine producers and backyard farmers who need accessible,
                accurate, and early disease detection. We pair high-performance YOLO computer vision with rapid
                skin lesion segmentation to safeguard herd health and prevent devastating biosecurity outbreaks.
              </p>

              <div className="mk-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Launch Live Scanner</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="lp-btn-secondary">
                  <Layers size={16} />
                  <span>Diagnostic Workflow</span>
                </Link>
              </div>
            </div>

            <aside className="mk-card">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-card-head">
                  <ShieldCheck size={16} />
                  <span>RESEARCH INITIATIVE</span>
                </div>
                <h3>Engineered for backyard farm resilience</h3>
                <p>
                  Small-scale pig farming represents the livelihood of thousands of rural families. Pigify provides an
                  accessible clinical standard to detect contagious skin symptoms before they spread throughout the pen.
                </p>

                <ul className="mk-feature-list">
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Real-time bounding box detection of swine skin lesions &amp; dermatitis</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Mild / Moderate / Severe symptom stratification and quarantine alerts</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Historical health traceability for localized veterinary intervention</span>
                  </li>
                </ul>
              </div>

              <div className="mk-metric-strip">
                <div className="mk-metric">
                  <span className="value">YOLOv8/11</span>
                  <span className="label">Vision Engine</span>
                </div>
                <div className="mk-metric">
                  <span className="value">&lt; 1.8s</span>
                  <span className="label">Latency</span>
                </div>
                <div className="mk-metric">
                  <span className="value">98.5%</span>
                  <span className="label">mAP Precision</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ================================================================
            2. RESEARCH PILLARS
            ================================================================ */}
        <section className="mk-section mk-section-alt">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <Sparkles size={12} />
                <span>CORE METHODOLOGY</span>
              </div>
              <h2>What defines our research approach</h2>
              <p>
                Our study focuses on accessibility, diagnostic precision under variable farm conditions,
                and actionable disease containment protocols for backyard pig farmers.
              </p>
            </div>

            <div className="mk-grid-4">
              {PILLARS.map(({ title, description, icon, tag }) => (
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
            3. DIAGNOSTIC PIPELINE
            ================================================================ */}
        <section className="mk-section">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <Cpu size={12} />
                <span>CLINICAL PIPELINE</span>
              </div>
              <h2>Swine skin pathology &amp; disease detection pipeline</h2>
              <p>
                From raw pen photography to multi-class neural inference, each step is optimized for speed,
                robustness against low lighting, and practical farmer usability.
              </p>
            </div>

            <div className="mk-timeline">
              <div className="mk-timeline-track">
                {PIPELINE.map((item) => (
                  <article key={item.id} className="mk-step">
                    <div className="lp-card-reticle top-left" />
                    <div className="lp-card-reticle bottom-right" />

                    <div className="mk-step-header">
                      <span className="mk-step-id">{item.id}</span>
                      <span className="mk-step-latency">{item.latency}</span>
                    </div>

                    <div className="mk-step-icon">
                      <Layers size={18} />
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            4. SWINE DIAGNOSTIC SHOWCASE SECTION
            ================================================================ */}
        <section className="mk-section mk-section-alt">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <Database size={12} />
                <span>CLINICAL BENCHMARK</span>
              </div>
              <h2>Swine visual telemetry &amp; biosecurity dataset</h2>
              <p>
                Rigorous multi-condition dataset validation across diverse backyard swine pens, natural lighting conditions,
                and critical dermatological pathologies.
              </p>
            </div>

            <div className="swine-showcase-section">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div className="swine-showcase-grid">
                <div className="swine-showcase-media">
                  <img
                    src={DATASET_SAMPLES[activeSample].src}
                    alt={DATASET_SAMPLES[activeSample].title}
                    className="swine-showcase-img"
                  />
                  <div className="swine-showcase-overlay" />
                  <div className="swine-showcase-badge-bar">
                    <span className="swine-showcase-badge-tag">{DATASET_SAMPLES[activeSample].tag}</span>
                    <span>{DATASET_SAMPLES[activeSample].stats}</span>
                  </div>
                </div>

                <div className="swine-showcase-telemetry">
                  <div className="mk-card-head">
                    <Eye size={15} />
                    <span>SAMPLE {activeSample + 1} OF {DATASET_SAMPLES.length}</span>
                  </div>
                  <h3>{DATASET_SAMPLES[activeSample].title}</h3>
                  <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.65, margin: 0 }}>
                    Trained on high-resolution swine dermatological markers including Erysipelas diamond lesions,
                    swine pox papules, sarcoptic mange patches, and systemic erythema indicators.
                  </p>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Model Backbone</span>
                    <span className="swine-telemetry-val highlight">YOLOv8 + YOLOv11 Ensemble</span>
                  </div>
                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Mean Average Precision</span>
                    <span className="swine-telemetry-val highlight">98.5% mAP@0.50</span>
                  </div>
                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Inference Processing</span>
                    <span className="swine-telemetry-val">&lt; 1.8s Edge Optimized</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    {DATASET_SAMPLES.map((sample, idx) => (
                      <button
                        key={sample.title}
                        type="button"
                        onClick={() => setActiveSample(idx)}
                        className={`lp-video-dot ${activeSample === idx ? 'active' : ''}`}
                        aria-label={`View sample ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            5. RESEARCH TEAM SECTION
            ================================================================ */}
        <section className="mk-section">
          <div className="container-pro">
            <div className="mk-section-head">
              <div className="mk-kicker">
                <ShieldCheck size={12} />
                <span>PROJECT CONTRIBUTORS</span>
              </div>
              <h2>Our Research Team</h2>
              <p>
                A dedicated multidisciplinary team developing Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms.
              </p>
            </div>

            <div className="mk-team-grid">
              {TEAM_MEMBERS.map((member) => (
                <article
                  key={member.name}
                  className={`mk-team-card${member.isLeader ? ' is-leader' : ''}`}
                  onClick={() => setSelectedMember(member)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedMember(member)
                  }}
                >
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <TeamPhoto src={member.imgSrc} alt={member.name} className="mk-team-photo" />

                  <div className="mk-team-top">
                    <span className="mk-team-role">{member.role}</span>
                    {member.isLeader && (
                      <span className="mk-leader-badge">
                        <Crown size={13} />
                        <span>Group Leader</span>
                      </span>
                    )}
                  </div>

                  <h3>{member.name}</h3>
                  <p>{member.description}</p>

                  <span className="mk-team-cta">
                    <span>View Profile</span>
                    <ArrowRight size={13} />
                  </span>
                </article>
              ))}
            </div>

            {selectedMember && (
              <div className="mk-modal-backdrop" onClick={() => setSelectedMember(null)}>
                <div className="mk-modal" onClick={(e) => e.stopPropagation()}>
                  <TeamPhoto src={selectedMember.imgSrc} alt={selectedMember.name} className="mk-modal-photo" />
                  <div className="mk-team-top" style={{ marginTop: '6px' }}>
                    <span className="mk-team-role">{selectedMember.role}</span>
                    {selectedMember.isLeader && (
                      <span className="mk-leader-badge">
                        <Crown size={13} />
                        <span>Group Leader</span>
                      </span>
                    )}
                  </div>
                  <h3 className="mk-modal-title">{selectedMember.name}</h3>
                  <p className="mk-modal-desc">{selectedMember.description}</p>
                  <div className="mk-modal-actions">
                    <a
                      href={selectedMember.fbLink}
                      target="_blank"
                      rel="noreferrer"
                      className="lp-btn-primary"
                    >
                      <span>Connect on Facebook</span>
                      <ArrowRight size={14} />
                    </a>
                    <button
                      type="button"
                      className="lp-btn-secondary"
                      onClick={() => setSelectedMember(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================
            6. CALL TO ACTION BAND
            ================================================================ */}
        <section className="mk-section">
          <div className="container-pro">
            <div className="mk-cta">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div>
                <div className="mk-kicker" style={{ marginBottom: '12px' }}>
                  <Radio size={12} />
                  <span>EARLY INTERVENTION</span>
                </div>
                <h3>Ready to protect your backyard swine herd?</h3>
                <p>
                  Experience instant swine skin lesion scanning, severity scoring, and outbreak containment alerts engineered for smallholder pig farming.
                </p>
              </div>

              <div className="mk-cta-actions">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={16} />
                  <span>Start Live Swine Scan</span>
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

export default About
