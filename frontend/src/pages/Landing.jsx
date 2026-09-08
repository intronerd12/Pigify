import React, { createElement, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Cpu,
  Eye,
  Layers,
  Play,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import MarketingFooter from '../components/marketing/MarketingFooter'
import MarketingHeader from '../components/marketing/MarketingHeader'
import './Landing.css'

// Interactive showcase carousel data - Pigify swine disease & skin scanning content
const VIDEO_SLIDES = [
  {
    type: 'video',
    title: 'Pig Disease & Skin Health Scanning',
    description: 'Real-time AI scanning for swine skin lesions, rashes, erysipelas, and disease symptoms with instant severity scoring.',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676636/pigify_videos/15098476_1280_720_60fps.mp4',
    link: '/how-it-works',
    buttonText: 'Learn Our Process',
    icon: '🐖',
    tag: 'LIVE LESION RECOGNITION',
  },
  {
    type: 'video',
    title: 'Backyard Swine Health Monitoring',
    description: 'Automated early detection system for swine disease prevention and herd management across outdoor pens.',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676649/pigify_videos/13693034-hd_1280_720_25fps.mp4',
    link: '/features',
    buttonText: 'Explore Features',
    icon: '✨',
    tag: 'HERD BIOSECURITY',
  },
  {
    type: 'video',
    title: 'Swine Symptom & Lesion Detection',
    description: 'Computer vision analysis detecting swine rash, dermatological lesions, and parasitic infections in seconds.',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788678594/pigify_videos/12180338_1280_720_30fps.mp4',
    link: '/home',
    buttonText: 'Try AI Scanner',
    icon: '🔍',
    tag: 'CLINICAL INFERENCE',
  },
  {
    type: 'video',
    title: 'Pigify Herd Health & Diagnostics',
    description: 'Deep learning skin health analytics and automated severity assessment tailored specifically for backyard pig farms.',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788678601/pigify_videos/13693036-hd_1280_720_25fps.mp4',
    link: '/about',
    buttonText: 'About Pigify',
    icon: '🩺',
    tag: 'PEN TELEMETRY',
  },
]

const QUICK_LINKS = [
  {
    to: '/about',
    title: 'About Pigify',
    description: 'A deep learning-based swine disease and symptom monitoring system for backyard farms.',
    icon: ShieldCheck,
    tag: 'SYSTEM ARCHITECTURE',
  },
  {
    to: '/how-it-works',
    title: 'How It Works',
    description: 'A step-by-step pipeline from image capture to disease detection, severity score, and health report.',
    icon: Layers,
    tag: 'DIAGNOSTIC PIPELINE',
  },
  {
    to: '/features',
    title: 'Features',
    description: 'Explore skin symptom segmentation, disease classification, herd trend analytics, and farm controls.',
    icon: Sparkles,
    tag: 'CLINICAL CAPABILITIES',
  },
  {
    to: '/home',
    title: 'Live Scanner Workspace',
    description: 'Go straight to the operator interface to capture images and scan pig health in real time.',
    icon: ScanLine,
    tag: 'OPERATOR CONSOLE',
  },
]

const WORKFLOW = [
  {
    step: '01',
    title: 'Capture',
    description: 'Take a clear photo of pig skin, lesions, or rash using your mobile or camera device.',
    icon: Camera,
    stats: '1.8s avg',
    label: 'IMAGE ACQUISITION',
  },
  {
    step: '02',
    title: 'Scan & Detect',
    description: 'AI model scans for skin lesions, erythema, parasite marks, and general disease indicators.',
    icon: Cpu,
    stats: '98.5% confidence',
    label: 'YOLOv8 INFERENCE',
  },
  {
    step: '03',
    title: 'Diagnose',
    description: 'Receive symptom classification, health risk level, affected dermal surface, and treatment guidance.',
    icon: BarChart3,
    stats: 'Mild/Moderate/Severe',
    label: 'SEVERITY SCORING',
  },
  {
    step: '04',
    title: 'Action',
    description: 'Save diagnostics, generate vet reports, and isolate affected swine for herd safety.',
    icon: ShieldCheck,
    stats: 'Early Prevention',
    label: 'BIOSECURITY CONTAIN',
  },
]

const MODULES = [
  {
    title: 'Skin Disease Detection',
    description: 'Detect skin lesions, scabies, swine pox, erysipelas, and dermatological conditions.',
    icon: ShieldCheck,
    badge: 'Core AI',
    bullets: ['Lesion Boundary Segmentation', 'Erysipelas & Swine Pox', 'Parasitic Mange Identification'],
  },
  {
    title: 'General Health Diagnostics',
    description: 'Identify early warning signs of systemic swine illness and viral/bacterial infections.',
    icon: Activity,
    badge: 'Analytics',
    bullets: ['Fever Flush & Erythema Index', 'Lethargy Clinical Markers', 'Systemic Anomaly Warnings'],
  },
  {
    title: 'Herd Disease Tracking',
    description: 'Track infection rates, herd health trends, and treatment history across pens.',
    icon: BarChart3,
    badge: 'Reports',
    bullets: ['Pen-Level Infection Logs', 'Historical Trend Analytics', 'Veterinary PDF Summaries'],
  },
  {
    title: 'Environmental Factors',
    description: 'Connect farm temperature and humidity with skin health risks and infection outbreaks.',
    icon: CloudSun,
    badge: 'Integration',
    bullets: ['Pen Humidity & Ammonia Index', 'Heat Stress Correlation', 'Biosecurity Flare Alerts'],
  },
]

function Landing() {
  const [activeVideoSlide, setActiveVideoSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRefs = useRef([])

  // Auto-advance video slider when playing
  useEffect(() => {
    if (!isPlaying) return undefined
    const intervalId = window.setInterval(() => {
      setActiveVideoSlide((prev) => (prev + 1) % VIDEO_SLIDES.length)
    }, 6500)
    return () => window.clearInterval(intervalId)
  }, [isPlaying])

  const goToVideoSlide = (index) => {
    const nextIndex = (index + VIDEO_SLIDES.length) % VIDEO_SLIDES.length
    setActiveVideoSlide(nextIndex)
    setIsPlaying(true)
  }

  const toggleVideoPlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Control play/pause of video elements
  useEffect(() => {
    VIDEO_SLIDES.forEach((_, idx) => {
      const v = videoRefs.current[idx]
      if (!v) return
      try {
        if (idx === activeVideoSlide && isPlaying) {
          v.play().catch(() => {})
        } else {
          v.pause()
        }
      } catch (_err) {
        void _err
      }
    })
  }, [activeVideoSlide, isPlaying])

  return (
    <div className="pro-landing">
      {/* Sticky Top Nav with Theme Switcher */}
      <MarketingHeader />

      <main>
        {/* ================================================================
            1. HERO COMMAND OVERVIEW - CLINICAL SWINE DIAGNOSTICS
            ================================================================ */}
        <section id="overview" className="lp-hero" aria-label="Pigify Swine Telemetry Overview">
          <div className="container-pro lp-hero-grid">
            {/* Left Column: Hero Narrative */}
            <div className="lp-hero-copy">
              <div className="lp-kicker">
                <span className="lp-kicker-dot" />
                <span>PIGIFY BIOMETRICS // SWINE LESION TELEMETRY V4.2</span>
              </div>

              <h1 className="lp-title">
                Early disease detection for
                <span className="lp-title-gradient"> swine & backyard herd health</span>
              </h1>

              <p className="lp-subtitle">
                Move from manual visual inspection to rapid, deep learning-driven swine skin scanning,
                lesion segmentation, severity stratification (Mild / Moderate / Severe), and early outbreak prevention.
              </p>

              {/* Action Buttons */}
              <div className="lp-hero-cta">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={18} />
                  <span>Start Live Swine Scan</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="lp-btn-secondary">
                  <Layers size={17} />
                  <span>Diagnostic Workflow</span>
                </Link>
                <Link to="/login" className="lp-btn-ghost">
                  <span>Farm Login</span>
                </Link>
              </div>

              {/* Trust & Telemetry Strip */}
              <div className="lp-trust-strip">
                <div className="lp-trust-card">
                  <span className="lp-trust-value">98.5%</span>
                  <span className="lp-trust-label">AI Accuracy</span>
                </div>
                <div className="lp-trust-card">
                  <span className="lp-trust-value">&lt; 1.8s</span>
                  <span className="lp-trust-label">Inference Latency</span>
                </div>
                <div className="lp-trust-card">
                  <span className="lp-trust-value">14 Conditions</span>
                  <span className="lp-trust-label">Lesion Classes</span>
                </div>
                <div className="lp-trust-card">
                  <span className="lp-trust-value">Real-Time</span>
                  <span className="lp-trust-label">Pen Biosecurity</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Tech Diagnostic Telemetry HUD Console */}
            <aside className="lp-hero-panel" aria-label="Live Diagnostic Telemetry HUD">
              {/* Corner reticle decorations */}
              <div className="lp-hud-reticle top-left" />
              <div className="lp-hud-reticle top-right" />
              <div className="lp-hud-reticle bottom-left" />
              <div className="lp-hud-reticle bottom-right" />

              <div className="lp-panel-top">
                <div className="lp-panel-header-line">
                  <span className="lp-panel-badge">DIAGNOSTIC OUTPUT // NODE #04</span>
                  <div className="lp-live-badge">
                    <span className="lp-live-indicator" />
                    <span>OPERATIONAL</span>
                  </div>
                </div>
                <h2>Pig Skin Health Telemetry</h2>
                <p>Real-time computer vision inference with bounding box lesion segmentation.</p>
              </div>

              {/* Simulated Scanner Viewport with Real Swine Side-View Subject */}
              <div className="lp-scanner-viewport">
                <img
                  src="/landing/swine-scan-subject.jpg"
                  alt="Swine Subject Getting Scanned - Side View"
                  className="lp-viewport-subject"
                />
                <div className="lp-viewport-overlay" />
                <div className="lp-viewport-grid" />
                <div className="lp-viewport-laser" />

                {/* Target Box on Swine Dorsal Flank */}
                <div className="lp-target-bbox">
                  <div className="lp-bbox-tag">
                    <span className="lp-bbox-dot" />
                    <span>ERYSIPELAS LESION // 98.7%</span>
                  </div>
                  <div className="lp-lesion-hotspot" />
                  <div className="lp-bbox-corners" />
                </div>

                <div className="lp-viewport-meta">
                  <span>PEN: B-12</span>
                  <span>SWINE ID: #0482</span>
                  <span>LOC: DORSAL DERMIS</span>
                </div>
              </div>

              {/* Diagnostic Metric Matrix */}
              <div className="lp-metric-grid">
                <div className="lp-metric">
                  <span className="lp-metric-title">STATUS</span>
                  <strong className="lp-metric-val danger">LESION DETECTED</strong>
                  <small className="lp-metric-sub">Erysipelas symptom match</small>
                </div>
                <div className="lp-metric">
                  <span className="lp-metric-title">RISK LEVEL</span>
                  <strong className="lp-metric-val warning">MODERATE [STAGE 2]</strong>
                  <small className="lp-metric-sub">Recommend pen isolation</small>
                </div>
                <div className="lp-metric">
                  <span className="lp-metric-title">CONFIDENCE</span>
                  <strong className="lp-metric-val success">98.7% YOLOv8</strong>
                  <small className="lp-metric-sub">Multiclass verification</small>
                </div>
                <div className="lp-metric">
                  <span className="lp-metric-title">ACTION PROTOCOL</span>
                  <strong className="lp-metric-val info">ISOLATE &amp; TREAT</strong>
                  <small className="lp-metric-sub">Antimicrobial administration</small>
                </div>
              </div>

              <div className="lp-panel-footer">
                <Link to="/home" className="lp-panel-action-btn">
                  <ScanLine size={15} />
                  <span>Launch Live Scanner Workspace</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* ================================================================
            2. VIDEO SHOWCASE SECTION
            ================================================================ */}
        <section
          className="lp-video-hero"
          aria-label="Pigify Swine Disease Scanning Showcase"
        >
          <div className="lp-video-container">
            <div className="lp-video-wrapper">
              {/* High-tech animated laser scanline */}
              <div className="lp-video-scanline" />

              {/* Background Video Elements */}
              {VIDEO_SLIDES.map((slide, index) => (
                <video
                  key={slide.video}
                  ref={(el) => (videoRefs.current[index] = el)}
                  className={`lp-video-element ${activeVideoSlide === index ? 'active' : ''}`}
                  src={slide.video}
                  playsInline
                  muted
                  loop
                  preload="auto"
                  aria-hidden={activeVideoSlide === index ? 'false' : 'true'}
                />
              ))}

              {/* Play button overlay */}
              <button
                type="button"
                className={`lp-video-play-btn ${isPlaying ? 'playing' : ''}`}
                onClick={toggleVideoPlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {!isPlaying ? <Play size={24} fill="currentColor" /> : <span className="lp-pause-icon">⏸</span>}
              </button>

              {/* Video content overlay with navigation */}
              <div className="lp-video-content">
                <div className="lp-video-tag-row">
                  <span className="lp-slide-icon">{VIDEO_SLIDES[activeVideoSlide].icon}</span>
                  <span className="lp-video-tag">{VIDEO_SLIDES[activeVideoSlide].tag}</span>
                </div>
                <h2>{VIDEO_SLIDES[activeVideoSlide].title}</h2>
                <p>{VIDEO_SLIDES[activeVideoSlide].description}</p>
                <Link
                  to={VIDEO_SLIDES[activeVideoSlide].link}
                  className="lp-video-nav-btn"
                >
                  <span>{VIDEO_SLIDES[activeVideoSlide].buttonText}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Slider controls */}
            <div className="lp-video-controls">
              <button
                type="button"
                className="lp-video-btn"
                onClick={() => goToVideoSlide(activeVideoSlide - 1)}
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="lp-video-dots">
                {VIDEO_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`lp-video-dot ${activeVideoSlide === index ? 'active' : ''}`}
                    onClick={() => goToVideoSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-pressed={activeVideoSlide === index ? 'true' : 'false'}
                  />
                ))}
              </div>

              <button
                type="button"
                className="lp-video-btn"
                onClick={() => goToVideoSlide(activeVideoSlide + 1)}
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================
            3. EXPLORE THE PIGIFY PLATFORM (QUICK HUBS)
            ================================================================ */}
        <section className="lp-section">
          <div className="container-pro">
            <div className="lp-section-head">
              <div className="lp-kicker">
                <Sparkles size={13} />
                <span>PLATFORM HUBS</span>
              </div>
              <h2>Explore the Pigify platform</h2>
              <p>Jump to the tools your backyard farm team uses most often for swine health monitoring.</p>
            </div>

            <div className="lp-link-grid">
              {QUICK_LINKS.map(({ to, title, description, icon, tag }) => (
                <Link
                  to={to}
                  key={title}
                  className="lp-link-card"
                >
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="lp-link-top">
                    <span className="lp-link-icon">
                      {createElement(icon, { size: 20 })}
                    </span>
                    <span className="lp-link-tag">{tag}</span>
                  </div>

                  <h3>{title}</h3>
                  <p>{description}</p>

                  <span className="lp-link-cta">
                    <span>Open page</span>
                    <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            4. DIAGNOSTIC WORKFLOW PIPELINE
            ================================================================ */}
        <section
          id="workflow"
          className="lp-section lp-section-alt"
        >
          <div className="container-pro">
            <div className="lp-section-head">
              <div className="lp-kicker">
                <Cpu size={13} />
                <span>CLINICAL PIPELINE</span>
              </div>
              <h2>How backyard farm diagnostics flow</h2>
              <p>
                Built for real-world swine management: scan quickly, standardize skin disease detection, and keep historical herd health data organized.
              </p>
            </div>

            <div className="lp-workflow-grid">
              {WORKFLOW.map(({ step, title, description, icon, stats, label }) => (
                <article
                  key={title}
                  className="lp-flow-card"
                >
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="lp-flow-header">
                    <span className="lp-flow-step">{step}</span>
                    <span className="lp-flow-label">{label}</span>
                  </div>

                  <div className="lp-flow-icon">
                    {createElement(icon, { size: 20 })}
                  </div>

                  <h3>{title}</h3>
                  <p>{description}</p>

                  {stats && (
                    <div className="lp-flow-stat-wrap">
                      <span className="lp-flow-stat">{stats}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            5. CORE SWINE HEALTH MODULES
            ================================================================ */}
        <section
          id="modules"
          className="lp-section"
        >
          <div className="container-pro">
            <div className="lp-section-head">
              <div className="lp-kicker">
                <ShieldCheck size={13} />
                <span>DIAGNOSTIC SUITE</span>
              </div>
              <h2>Core swine health modules</h2>
              <p>Purpose-built tools to reduce swine mortality, prevent disease outbreaks, and improve backyard farm productivity.</p>
            </div>

            <div className="lp-module-grid">
              {MODULES.map(({ title, description, icon, badge, bullets }) => (
                <article
                  key={title}
                  className="lp-module-card"
                >
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div className="lp-module-top">
                    <div className="lp-module-icon">
                      {createElement(icon, { size: 22 })}
                    </div>
                    {badge && <span className="lp-module-badge">{badge}</span>}
                  </div>

                  <h3>{title}</h3>
                  <p>{description}</p>

                  <ul className="lp-module-bullets">
                    {bullets.map((b, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={13} />
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
            6. CALL TO ACTION BAND
            ================================================================ */}
        <section className="lp-cta-band">
          <div className="container-pro">
            <div className="lp-cta-content">
              <div className="lp-card-reticle top-left" />
              <div className="lp-card-reticle bottom-right" />

              <div className="lp-cta-text">
                <div className="lp-kicker">
                  <Radio size={13} />
                  <span>BIOSECURITY DEFENSE</span>
                </div>
                <h2>Ready to protect your swine herd?</h2>
                <h3 className="lp-cta-lead">Give your backyard farm a professional AI disease monitoring standard.</h3>
                <p>Sign in to start scanning pig skin health, tracking symptoms, and preventing herd disease outbreaks.</p>
              </div>

              <div className="lp-cta-actions">
                <Link to="/login" className="lp-btn-primary">
                  <span>Go to login</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/home" className="lp-btn-secondary">
                  <ScanLine size={16} />
                  <span>Launch Live Scanner</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* High-Tech Marketing Footer with Telemetry */}
      <MarketingFooter />
    </div>
  )
}

export default Landing
