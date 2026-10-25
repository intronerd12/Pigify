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
    title: 'Visual Detection',
    description: 'Bounding box detections highlight visible areas of concern so farmers can easily see what signs the model flagged.',
    icon: ShieldCheck,
    tag: 'OBJECT DETECTION',
  },
  {
    title: 'Backyard Farm Usability',
    description: 'Designed for practical use by small-scale farmers using standard smartphone cameras or computer webcams.',
    icon: Activity,
    tag: 'ACCESSIBLE',
  },
  {
    title: 'Health Record Keeping',
    description: 'Keeps an organized history of past scans to help farmers track symptoms over time and share findings with veterinarians.',
    icon: TrendingUp,
    tag: 'RECORDS',
  },
  {
    title: 'Early Observation',
    description: 'Encourages timely isolation and veterinary consultation before symptoms worsen or spread to other pigs in the pen.',
    icon: Radio,
    tag: 'EARLY MONITORING',
  },
]

const PIPELINE = [
  {
    id: 'Stage 01',
    title: 'Photo Capture & Pen Details',
    description: 'Farmers upload or capture a photo of the pig and record optional details such as pen number or notes.',
    latency: 'Photo Input',
  },
  {
    id: 'Stage 02',
    title: 'YOLOv8 Detection',
    description: 'The trained model analyzes the image to identify visible skin signs such as lesions, redness, or patches.',
    latency: 'Model Analysis',
  },
  {
    id: 'Stage 03',
    title: 'Severity Categorization',
    description: 'The system categorizes the finding into Mild, Moderate, or Severe to give a preliminary sense of urgency.',
    latency: 'Severity Rating',
  },
  {
    id: 'Stage 04',
    title: 'Record & Consultation',
    description: 'The scan is saved to the history log, accompanied by basic care advice and a reminder to consult a veterinarian.',
    latency: 'Saved to Log',
  },
]

const TEAM_MEMBERS = [
  {
    name: 'Adora, Joenabelle',
    role: 'Member',
    description: 'Contributes to swine dataset collection, image annotation, and documentation for the monitoring study.',
    imgSrc: '/About%20us/adora,%20joanabel.jpg',
    fbLink: 'https://www.facebook.com/aeri.elle.0#',
  },
  {
    name: 'Bumatay, Axel Jillian',
    role: 'Leader',
    description: 'Project leader responsible for system architecture, coordinating deep learning model integration, and full-stack development.',
    isLeader: true,
    imgSrc: '/About%20us/axel%20bumatay.jpg',
    fbLink: 'https://www.facebook.com/axeljilian.bumatay.5#',
  },
  {
    name: 'Danque, John Michael',
    role: 'Member',
    description: 'Contributes to dataset preparation, bounding box verification, and evaluating detection performance.',
    imgSrc: '/About%20us/john%20michael%20danque.jpg',
    fbLink: 'https://www.facebook.com/john.michael.danque.2024',
  },
  {
    name: 'Landas, Davimher',
    role: 'Member',
    description: 'Supports system implementation, testing across varied mobile devices, and user interface refinement.',
    imgSrc: '/About%20us/landas,%20davimher.jpg',
    fbLink: 'https://www.facebook.com/davimher.landas#',
  },
]

const DATASET_SAMPLES = [
  {
    src: '/landing/swine-health-scan.jpg',
    title: 'Skin Symptom Inspection',
    tag: 'SAMPLE SCAN',
    stats: 'Bounding Box Detection',
  },
  {
    src: '/landing/swine-biosecurity-pen.jpg',
    title: 'Backyard Pig Pen Setting',
    tag: 'FARM CONTEXT',
    stats: 'Field Photography',
  },
  {
    src: '/landing/swine-scan-subject.jpg',
    title: 'Pig Subject Image Scan',
    tag: 'YOLOv8 MODEL',
    stats: 'Symptom Localization',
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
      decoding="async"
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
                <span>STUDY OBJECTIVE // BACKYARD SWINE HEALTH MONITORING</span>
              </div>

              <h1 className="mk-title">
                Deep learning swine disease &amp; symptom monitoring for
                <span className="accent"> backyard farms</span>
              </h1>

              <p className="mk-subtitle">
                Pigify is developed as a research project to support small-scale backyard pig farmers.
                Using YOLOv8 deep learning models trained on pig images, the application analyzes photographs to detect
                visible skin symptoms, suggest a general severity level, and assist farmers in keeping records.
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
                  <ShieldCheck size={16} />
                  <span>RESEARCH PURPOSE</span>
                </div>
                <h3>Developed for backyard pig raisers</h3>
                <p>
                  Backyard pig farming is an important livelihood for many families. Pigify aims to provide
                  an accessible visual check to help farmers notice potential symptoms and seek veterinary advice in a timely manner.
                </p>

                <ul className="mk-feature-list">
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Bounding box detection for visible skin lesions and irritation</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Mild, Moderate, and Severe category suggestions</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} />
                    <span>Saved scan records to track pig health over time</span>
                  </li>
                </ul>
              </div>

              <div className="mk-metric-strip">
                <div className="mk-metric">
                  <span className="value">YOLOv8</span>
                  <span className="label">Model Architecture</span>
                </div>
                <div className="mk-metric">
                  <span className="value">Web &amp; Mobile</span>
                  <span className="label">Platform</span>
                </div>
                <div className="mk-metric">
                  <span className="value">3 Levels</span>
                  <span className="label">Severity Levels</span>
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
                <span>STUDY OBJECTIVES</span>
              </div>
              <h2>Focus of our research</h2>
              <p>
                Our study focuses on accessibility, practical usability in backyard pens,
                and providing timely symptom awareness for small-scale swine raisers.
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
                <span>MONITORING PIPELINE</span>
              </div>
              <h2>How image analysis works</h2>
              <p>
                From photo capture to object detection and result review, each step is organized to give
                clear, straightforward guidance to the farmer.
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
                <span>IMAGE ANALYSIS</span>
              </div>
              <h2>Sample symptom detections</h2>
              <p>
                Examples demonstrating how the YOLOv8 model localizes visible skin symptoms on pig photos.
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
                    loading="lazy"
                    decoding="async"
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
                    Trained on pig images displaying various dermatological symptoms including visible lesions,
                    erythema (redness), and skin irritation markers.
                  </p>

                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Model Architecture</span>
                    <span className="swine-telemetry-val highlight">YOLOv8 Detection</span>
                  </div>
                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Output Format</span>
                    <span className="swine-telemetry-val highlight">Bounding Box Coordinates</span>
                  </div>
                  <div className="swine-telemetry-item">
                    <span className="swine-telemetry-label">Analysis Target</span>
                    <span className="swine-telemetry-val">Visible Skin Symptoms</span>
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
                  <span>HEALTH MONITORING</span>
                </div>
                <h3>Ready to check your pigs?</h3>
                <p>
                  Upload or capture a photo to scan for visible skin symptoms, view suggested severity ratings, and save records for future reference.
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

export default About
