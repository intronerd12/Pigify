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
    title: 'Checking Pig Photos for Skin Symptoms',
    description: 'Pigify analyzes a photo of a pig and points out visible skin signs, such as lesions or redness, that may be linked to disease.',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676636/pigify_videos/15098476_1280_720_60fps.mp4',
    link: '/how-it-works',
    buttonText: 'See How It Works',
    icon: '🐖',
    tag: 'SYMPTOM DETECTION',
  },
  {
    type: 'video',
    title: 'Health Monitoring for Backyard Farms',
    description: 'The study focuses on small-scale backyard pig raisers who may not have regular access to a veterinarian.',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676649/pigify_videos/13693034-hd_1280_720_25fps.mp4',
    link: '/features',
    buttonText: 'View Features',
    icon: '✨',
    tag: 'BACKYARD FARMS',
  },
  {
    type: 'video',
    title: 'Deep Learning Image Analysis',
    description: 'Photos are processed by YOLOv8 object detection models that the team trained on pig images.',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788678594/pigify_videos/12180338_1280_720_30fps.mp4',
    link: '/home',
    buttonText: 'Open the Scanner',
    icon: '🔍',
    tag: 'YOLOv8 MODEL',
  },
  {
    type: 'video',
    title: 'Scan Records and Monitoring',
    description: 'Each scan result is saved so farmers can look back on the health condition of their pigs over time.',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788678601/pigify_videos/13693036-hd_1280_720_25fps.mp4',
    link: '/about',
    buttonText: 'About the Study',
    icon: '🩺',
    tag: 'SCAN HISTORY',
  },
]

const QUICK_LINKS = [
  {
    to: '/about',
    title: 'About Pigify',
    description: 'A deep learning-based swine disease and symptom monitoring system for backyard farms.',
    icon: ShieldCheck,
    tag: 'THE STUDY',
  },
  {
    to: '/how-it-works',
    title: 'How It Works',
    description: 'The steps from taking a photo of a pig to viewing the detected symptoms and suggested severity level.',
    icon: Layers,
    tag: 'PROCESS',
  },
  {
    to: '/features',
    title: 'Features',
    description: 'The modules included in the system: symptom detection, scan history, disease map, and environment monitoring.',
    icon: Sparkles,
    tag: 'SYSTEM MODULES',
  },
  {
    to: '/home',
    title: 'Scanner',
    description: 'Upload or capture a photo of a pig and let the system check it for visible symptoms.',
    icon: ScanLine,
    tag: 'SCAN A PIG',
  },
]

const WORKFLOW = [
  {
    step: '01',
    title: 'Capture',
    description: 'Take or upload a clear photo of the pig using a phone or computer.',
    icon: Camera,
    stats: 'Web or mobile',
    label: 'PHOTO INPUT',
  },
  {
    step: '02',
    title: 'Detect',
    description: 'The trained YOLOv8 model checks the photo for visible skin signs such as lesions or redness.',
    icon: Cpu,
    stats: 'YOLOv8 model',
    label: 'IMAGE ANALYSIS',
  },
  {
    step: '03',
    title: 'Review Result',
    description: 'View the detected signs, the model confidence score, a suggested severity level, and basic care guidance.',
    icon: BarChart3,
    stats: 'Mild/Moderate/Severe',
    label: 'SCAN RESULT',
  },
  {
    step: '04',
    title: 'Record & Consult',
    description: 'Save the result to your scan history and consult a veterinarian when signs of illness are found.',
    icon: ShieldCheck,
    stats: 'Saved to history',
    label: 'FOLLOW-UP',
  },
]

const MODULES = [
  {
    title: 'Symptom Detection',
    description: 'Checks pig photos for visible skin signs that may indicate disease.',
    icon: ShieldCheck,
    badge: 'Core',
    bullets: ['Photo upload or camera capture', 'YOLOv8 object detection', 'Suggested severity level'],
  },
  {
    title: 'Scan Results & History',
    description: 'Keeps a record of each scan so farmers can review past results.',
    icon: Activity,
    badge: 'Records',
    bullets: ['Saved scan images and results', 'Basic care guidance', 'Reminder to consult a veterinarian'],
  },
  {
    title: 'Disease Map',
    description: 'Shows reported swine disease cases on a map to give farmers awareness of nearby cases.',
    icon: BarChart3,
    badge: 'Map',
    bullets: ['Location-based case view', 'Disease information', 'Farm awareness'],
  },
  {
    title: 'Environment Monitoring',
    description: 'Displays temperature and humidity readings that can affect the comfort and health of pigs.',
    icon: CloudSun,
    badge: 'Environment',
    bullets: ['Temperature readings', 'Humidity readings', 'Heat stress reminders'],
  },
]

function Landing() {
  const [activeVideoSlide, setActiveVideoSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const videoSectionRef = useRef(null)
  const videoRef = useRef(null)

  // Pause/play based on section intersection with viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )
    if (videoSectionRef.current) {
      observer.observe(videoSectionRef.current)
    }
    return () => observer.disconnect()
  }, [])

  // Auto-advance video slider only when playing and visible in viewport
  useEffect(() => {
    if (!isPlaying || !isInView) return undefined
    const intervalId = window.setInterval(() => {
      setActiveVideoSlide((prev) => (prev + 1) % VIDEO_SLIDES.length)
    }, 6500)
    return () => window.clearInterval(intervalId)
  }, [isPlaying, isInView])

  // Pause on tab switch / minimize
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoRef.current?.pause()
      } else if (isPlaying && isInView) {
        videoRef.current?.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isPlaying, isInView])

  const goToVideoSlide = (index) => {
    const nextIndex = (index + VIDEO_SLIDES.length) % VIDEO_SLIDES.length
    setActiveVideoSlide(nextIndex)
    setIsPlaying(true)
  }

  const toggleVideoPlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Control active video element play/pause
  useEffect(() => {
    if (!videoRef.current) return
    try {
      if (isPlaying && isInView) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    } catch (_err) {
      void _err
    }
  }, [activeVideoSlide, isPlaying, isInView])

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
                <span>RESEARCH PROJECT // BACKYARD SWINE HEALTH MONITORING</span>
              </div>

              <h1 className="lp-title">
                Swine disease and symptom monitoring for
                <span className="lp-title-gradient"> backyard farms</span>
              </h1>

              <p className="lp-subtitle">
                Pigify uses deep learning to check photos of pigs for visible signs of disease. It is meant to help
                backyard farmers notice possible health problems earlier and decide when to consult a veterinarian.
              </p>

              {/* Action Buttons */}
              <div className="lp-hero-cta">
                <Link to="/home" className="lp-btn-primary">
                  <ScanLine size={18} />
                  <span>Start a Scan</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="lp-btn-secondary">
                  <Layers size={17} />
                  <span>How It Works</span>
                </Link>
                <Link to="/login" className="lp-btn-ghost">
                  <span>Log In</span>
                </Link>
              </div>

              {/* Study Summary Strip */}
              <div className="lp-trust-strip">
                <div className="lp-trust-card">
                  <span className="lp-trust-value">YOLOv8</span>
                  <span className="lp-trust-label">Detection Model</span>
                </div>
                <div className="lp-trust-card">
                  <span className="lp-trust-value">Web &amp; Mobile</span>
                  <span className="lp-trust-label">Photo Scanning</span>
                </div>
                <div className="lp-trust-card">
                  <span className="lp-trust-value">3 Levels</span>
                  <span className="lp-trust-label">Severity Rating</span>
                </div>
                <div className="lp-trust-card">
                  <span className="lp-trust-value">Saved</span>
                  <span className="lp-trust-label">Scan History</span>
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
                  <span className="lp-panel-badge">SAMPLE SCAN RESULT</span>
                  <div className="lp-live-badge">
                    <span className="lp-live-indicator" />
                    <span>EXAMPLE</span>
                  </div>
                </div>
                <h2>What a scan result looks like</h2>
                <p>An illustration of how detected skin signs are marked on a photo. Values shown are examples only.</p>
              </div>

              {/* Simulated Scanner Viewport with Real Swine Side-View Subject */}
              <div className="lp-scanner-viewport">
                <img
                  src="/landing/swine-scan-subject.jpg"
                  alt="Swine Subject Getting Scanned - Side View"
                  className="lp-viewport-subject"
                  loading="lazy"
                  decoding="async"
                />
                <div className="lp-viewport-overlay" />
                <div className="lp-viewport-grid" />
                <div className="lp-viewport-laser" />

                {/* Target Box on Swine Dorsal Flank */}
                <div className="lp-target-bbox">
                  <div className="lp-bbox-tag">
                    <span className="lp-bbox-dot" />
                    <span>SUSPECTED LESION // SAMPLE</span>
                  </div>
                  <div className="lp-lesion-hotspot" />
                  <div className="lp-bbox-corners" />
                </div>

                <div className="lp-viewport-meta">
                  <span>PEN: B-12</span>
                  <span>SAMPLE ID: #0482</span>
                  <span>AREA: SKIN SURFACE</span>
                </div>
              </div>

              {/* Diagnostic Metric Matrix */}
              <div className="lp-metric-grid">
                <div className="lp-metric">
                  <span className="lp-metric-title">STATUS</span>
                  <strong className="lp-metric-val danger">LESION DETECTED</strong>
                  <small className="lp-metric-sub">Visible skin symptom found</small>
                </div>
                <div className="lp-metric">
                  <span className="lp-metric-title">SUGGESTED SEVERITY</span>
                  <strong className="lp-metric-val warning">MODERATE</strong>
                  <small className="lp-metric-sub">Monitor and separate pen</small>
                </div>
                <div className="lp-metric">
                  <span className="lp-metric-title">DETECTION MODEL</span>
                  <strong className="lp-metric-val success">YOLOv8</strong>
                  <small className="lp-metric-sub">Object detection model</small>
                </div>
                <div className="lp-metric">
                  <span className="lp-metric-title">RECOMMENDED STEP</span>
                  <strong className="lp-metric-val info">ISOLATE &amp; OBSERVE</strong>
                  <small className="lp-metric-sub">Consult a veterinarian</small>
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
          ref={videoSectionRef}
          className="lp-video-hero"
          aria-label="Pigify Swine Disease Scanning Showcase"
        >
          <div className="lp-video-container">
            <div className="lp-video-wrapper">
              {/* High-tech animated laser scanline */}
              <div className="lp-video-scanline" />

              {/* Active Background Video Element (Loaded on demand when in viewport) */}
              {isInView && (
                <video
                  ref={videoRef}
                  key={VIDEO_SLIDES[activeVideoSlide].video}
                  className="lp-video-element active"
                  src={VIDEO_SLIDES[activeVideoSlide].video}
                  playsInline
                  muted
                  loop
                  preload="metadata"
                  aria-label={VIDEO_SLIDES[activeVideoSlide].title}
                />
              )}

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
                <span>MONITORING PIPELINE</span>
              </div>
              <h2>How backyard farm monitoring works</h2>
              <p>
                Designed for everyday backyard pig farming: take a photo, run image analysis for visible symptoms, and keep an organized record of findings.
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
                <span>SYSTEM MODULES</span>
              </div>
              <h2>Included system features</h2>
              <p>Features developed to help small-scale farmers notice symptoms early and maintain records for their pigs.</p>
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
                  <span>START MONITORING</span>
                </div>
                <h2>Ready to check your pigs?</h2>
                <h3 className="lp-cta-lead">A practical symptom checking and monitoring tool for backyard pig farming.</h3>
                <p>Sign in to scan pig photos, view detected skin signs, and keep records of your herd health over time.</p>
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
