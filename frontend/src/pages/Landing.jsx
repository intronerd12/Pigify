import React, { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Cpu,
  Layers,
  Play,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import MarketingFooter from '../components/marketing/MarketingFooter'
import MarketingHeader from '../components/marketing/MarketingHeader'
import './Landing.css'

// Interactive showcase carousel data - Pigify swine skin & disease scanning content
const VIDEO_SLIDES = [
  {
    type: 'video',
    title: 'Pig Disease & Skin Health Scanning',
    description: 'Real-time AI scanning for swine skin lesions, rash, erysipelas, and disease symptoms',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676636/pigify_videos/15098476_1280_720_60fps.mp4',
    link: '/how-it-works',
    buttonText: 'Learn Our Process',
    icon: '🐖'
  },
  {
    type: 'video',
    title: 'Livestock Herd Health Monitoring',
    description: 'Automated early detection system for swine disease prevention and farm management',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676649/pigify_videos/13693034-hd_1280_720_25fps.mp4',
    link: '/features',
    buttonText: 'Explore Features',
    icon: '✨'
  },
  {
    type: 'video',
    title: 'Pigify Diagnostic Workflow',
    description: 'Comprehensive skin health analytics and automated disease severity assessment',
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676636/pigify_videos/15098476_1280_720_60fps.mp4',
    link: '/about',
    buttonText: 'About Pigify',
    icon: '🩺'
  },
]

const SLIDES = [
  { src: '/landing/slider/slide-01.jpg', alt: 'Swine herd health inspection', label: 'Field disease scanning', link: '/features' },
  { src: '/landing/slider/slide-02.jpg', alt: 'Pig skin symptom check', label: 'Consistent diagnostic scoring', link: '/how-it-works' },
  { src: '/landing/slider/slide-03.jpg', alt: 'Swine skin lesion analysis', label: 'Real-time health confidence', link: '/features' },
  { src: '/landing/slider/slide-04.jpg', alt: 'Pig farm inspection image', label: 'Farmer-friendly workflows', link: '/how-it-works' },
  { src: '/landing/slider/slide-05.jpg', alt: 'Healthy swine herd sample', label: 'Herd status indicators', link: '/about' },
  { src: '/landing/slider/slide-06.jpg', alt: 'Swine health monitor', label: 'Veterinary report ready', link: '/features' },
]

const QUICK_LINKS = [
  {
    to: '/about',
    title: 'About Pigify',
    description: 'How we built a practical AI scanning system for swine general disease and skin health monitoring.',
    icon: ShieldCheck,
  },
  {
    to: '/how-it-works',
    title: 'How It Works',
    description: 'A clear pipeline from image capture to disease detection, severity score, and health report.',
    icon: Layers,
  },
  {
    to: '/features',
    title: 'Features',
    description: 'Explore skin symptom segmentation, disease classification, trend analytics, and farm controls.',
    icon: Sparkles,
  },
  {
    to: '/home',
    title: 'Live Workspace',
    description: 'Go straight to the scanner interface to capture images and analyze pig skin health.',
    icon: ScanLine,
  },
]

const WORKFLOW = [
  {
    title: 'Capture',
    description: 'Take a clear photo of pig skin, lesions, or rash using your mobile or camera device.',
    icon: Camera,
    stats: '1.8s avg',
  },
  {
    title: 'Scan & Detect',
    description: 'AI model scans for skin lesions, erythema, parasite marks, and general disease indicators.',
    icon: Cpu,
    stats: '98.5% confidence',
  },
  {
    title: 'Diagnose',
    description: 'Receive symptom classification, health risk level, and treatment guidance.',
    icon: BarChart3,
    stats: 'Mild/Moderate/Severe',
  },
  {
    title: 'Action',
    description: 'Save diagnostics, generate vet reports, and isolate affected swine for herd safety.',
    icon: Wallet,
    stats: 'Early Prevention',
  },
]

const MODULES = [
  {
    title: 'Skin Disease Detection',
    description: 'Detect skin lesions, scabies, swine pox, erysipelas, and dermatological conditions.',
    icon: ShieldCheck,
    badge: 'Core',
  },
  {
    title: 'General Health Diagnostics',
    description: 'Identify early warning signs of systemic swine illness and viral/bacterial infections.',
    icon: Wallet,
    badge: 'Analytics',
  },
  {
    title: 'Herd Disease Tracking',
    description: 'Track infection rates, herd health trends, and treatment history across pens.',
    icon: BarChart3,
    badge: 'Reports',
  },
  {
    title: 'Environmental Factors',
    description: 'Connect farm temperature and humidity with skin health risks and infection outbreaks.',
    icon: CloudSun,
    badge: 'Integration',
  },
]

const SECTION_BOX_BACKGROUNDS = [
  '/landing/slider/slide-01.jpg',
  '/landing/slider/slide-02.jpg',
  '/landing/slider/slide-03.jpg',
  '/landing/slider/slide-04.jpg',
  '/landing/slider/slide-05.jpg',
  '/landing/slider/slide-06.jpg',
]

function Landing() {
  const [activeVideoSlide, setActiveVideoSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRefs = useRef([])
  const wallpapers = useMemo(
    () => Array.from({ length: 2 }, () => ({ src: '/wallpaper-dragon/wallpaper-10.jpg', label: 'Wallpaper Dragon 10' })),
    []
  )

  // Auto-advance video slider when playing
  useEffect(() => {
    if (!isPlaying) return undefined
    const intervalId = window.setInterval(() => {
      setActiveVideoSlide((prev) => (prev + 1) % VIDEO_SLIDES.length)
    }, 6000)
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

  // control play/pause of video elements
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
      <MarketingHeader />

      <main style={{ background: 'linear-gradient(180deg, #fdf2f8 0%, #FBE3E3 50%)' }}>
        {/* Video slider section */}
        <section
          className="lp-video-hero df-parallax-surface df-parallax-dark"
          aria-label="Dragon fruit showcase"
          style={{ '--df-bg-image': `url(${wallpapers[0].src})` }}
        >
          <div className="lp-video-container">
            <div className="lp-video-wrapper">
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
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {!isPlaying && <Play size={32} fill="white" />}
                {isPlaying && <span style={{ fontSize: '24px' }}>▶️</span>}
              </button>

              {/* Video content overlay with navigation */}
              <div className="lp-video-content">
                <span className="lp-slide-icon">{VIDEO_SLIDES[activeVideoSlide].icon}</span>
                <h2>{VIDEO_SLIDES[activeVideoSlide].title}</h2>
                <p>{VIDEO_SLIDES[activeVideoSlide].description}</p>
                <Link 
                  to={VIDEO_SLIDES[activeVideoSlide].link}
                  className="lp-video-nav-btn"
                >
                  {VIDEO_SLIDES[activeVideoSlide].buttonText}
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

        <section
          id="overview"
          className="lp-hero df-parallax-surface df-parallax-dark"
          style={{ '--df-bg-image': `url(${wallpapers[1].src})`, color: '#fff' }}
        >
          <div className="container-pro lp-hero-grid">
            <div className="lp-hero-copy">
              <span className="lp-kicker" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>AI Swine Disease & Skin Health Intelligence Platform</span>
              <h1 className="lp-title" style={{ color: '#fff' }}>
                Early disease detection for
                <span style={{ color: '#fff' }}> swine & livestock health</span>
              </h1>
              <p className="lp-subtitle" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                Move from manual visual inspection to rapid, AI-driven swine skin scanning, disease classification,
                lesion severity scoring, and outbreak prevention in one streamlined platform.
              </p>
              <div className="lp-hero-cta">
                <Link to="/login" className="lp-btn-primary">
                  Start scanning pigs
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/how-it-works"
                  className="lp-btn-secondary"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    color: '#fff',
                  }}
                >
                  View diagnostic workflow
                </Link>
              </div>
              <div className="lp-trust-strip">
                <div className="lp-trust-card" style={{ background: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}>
                  <span className="lp-trust-value">Skin Scan</span>
                  <span className="lp-trust-label">Lesion detection</span>
                </div>
                <div className="lp-trust-card" style={{ background: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}>
                  <span className="lp-trust-value">98.5%</span>
                  <span className="lp-trust-label">AI accuracy</span>
                </div>
                <div className="lp-trust-card" style={{ background: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}>
                  <span className="lp-trust-value">Real-time</span>
                  <span className="lp-trust-label">Vet insights</span>
                </div>
              </div>
            </div>

            <aside className="lp-hero-panel" aria-label="Diagnostic snapshot" style={{ background: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
              <div className="lp-panel-top">
                <span className="lp-panel-badge" style={{ background: '#D81B60', color: '#fff' }}>Diagnostic Output</span>
                <h2 style={{ color: '#0f1728' }}>Pig Skin Health Snapshot</h2>
                <p style={{ color: '#6b7280' }}>Designed for rapid, reliable farm decisions and veterinary monitoring.</p>
              </div>
              <div className="lp-metric-grid">
                <div className="lp-metric">
                  <span style={{ color: '#6b7280' }}>Status</span>
                  <strong style={{ color: '#D81B60' }}>Normal</strong>
                  <small style={{ color: '#9ca3af' }}>No active lesions</small>
                </div>
                <div className="lp-metric">
                  <span style={{ color: '#6b7280' }}>Risk Level</span>
                  <strong style={{ color: '#D81B60' }}>Low</strong>
                  <small style={{ color: '#9ca3af' }}>Clear skin barrier</small>
                </div>
                <div className="lp-metric">
                  <span style={{ color: '#6b7280' }}>Confidence</span>
                  <strong style={{ color: '#D81B60' }}>99.2%</strong>
                  <small style={{ color: '#9ca3af' }}>YOLO scan score</small>
                </div>
                <div className="lp-metric">
                  <span style={{ color: '#6b7280' }}>Action</span>
                  <strong style={{ color: '#D81B60' }}>Monitor</strong>
                  <small style={{ color: '#9ca3af' }}>Routine check</small>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Removed old image slider - replaced by video hero above */}

        <section
          className="lp-section df-parallax-surface df-parallax-light"
        >
          <div className="container-pro">
            <div className="lp-section-head">
              <h2>Explore the platform</h2>
              <p>Jump to the pages your team uses most often, with clear purpose and faster onboarding.</p>
            </div>

            <div className="lp-link-grid">
              {QUICK_LINKS.map(({ to, title, description, icon }, index) => (
                <Link
                  to={to}
                  key={title}
                  className="lp-link-card"
                  style={{ '--lp-box-bg-image': `url(${SECTION_BOX_BACKGROUNDS[index % SECTION_BOX_BACKGROUNDS.length]})` }}
                >
                  <div className="lp-box-bg" aria-hidden="true" />
                  <span className="lp-link-icon">
                    {createElement(icon, { size: 18 })}
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="lp-link-cta">
                    Open page
                    <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="lp-section lp-section-alt df-parallax-surface df-parallax-light"
        >
          <div className="container-pro">
            <div className="lp-section-head">
              <h2>How operations flow</h2>
              <p>
                Built for real-world usage: scan quickly, standardize decisions, and keep historical quality data
                organized.
              </p>
            </div>

            <div className="lp-workflow-grid">
              {WORKFLOW.map(({ title, description, icon, stats }, index) => (
                <article
                  key={title}
                  className="lp-flow-card"
                  style={{ '--lp-box-bg-image': `url(${SECTION_BOX_BACKGROUNDS[(index + 2) % SECTION_BOX_BACKGROUNDS.length]})` }}
                >
                  <div className="lp-box-bg" aria-hidden="true" />
                  <span className="lp-flow-step">0{index + 1}</span>
                  <div className="lp-flow-icon">
                    {createElement(icon, { size: 18 })}
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  {stats && <span className="lp-flow-stat">{stats}</span>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="modules"
          className="lp-section df-parallax-surface df-parallax-light"
        >
          <div className="container-pro">
            <div className="lp-section-head">
              <h2>Core intelligence modules</h2>
              <p>Each module is purpose-built to reduce guesswork and increase consistency across your team.</p>
            </div>

            <div className="lp-module-grid">
              {MODULES.map(({ title, description, icon, badge }, index) => (
                <article
                  key={title}
                  className="lp-module-card"
                  style={{ '--lp-box-bg-image': `url(${SECTION_BOX_BACKGROUNDS[(index + 1) % SECTION_BOX_BACKGROUNDS.length]})` }}
                >
                  <div className="lp-box-bg" aria-hidden="true" />
                  {badge && <span className="lp-module-badge">{badge}</span>}
                  <div className="lp-module-icon" style={{ color: '#EC6565' }}>
                    {createElement(icon, { size: 20 })}
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="lp-cta-band df-parallax-surface df-parallax-light"
        >
          <div className="container-pro lp-cta-content">
            <div>
              <span className="lp-kicker" style={{ color: '#EC6565' }}>Ready to deploy?</span>
              <h2>Give your grading process a professional standard.</h2>
              <p>Sign in to start scanning, benchmarking, and improving every batch.</p>
            </div>
            <Link to="/login" className="lp-btn-primary">
              Go to login
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default Landing

