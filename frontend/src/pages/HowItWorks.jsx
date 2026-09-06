import { createElement, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Camera, CheckCircle2, ClipboardList, Cpu, DollarSign, RefreshCw } from 'lucide-react'
import MarketingFooter from '../components/marketing/MarketingFooter'
import MarketingHeader from '../components/marketing/MarketingHeader'
import './Landing.css'
import './MarketingPages.css'

const WORKFLOW = [
  {
    id: 'Stage 01',
    title: 'Capture',
    description: 'Farmers capture pig skin images with clear framing using mobile or camera devices.',
    icon: Camera,
  },
  {
    id: 'Stage 02',
    title: 'Analyze',
    description: 'Deep learning models identify skin lesion boundaries, rash patterns, and disease indicators in real time.',
    icon: Cpu,
  },
  {
    id: 'Stage 03',
    title: 'Diagnose',
    description: 'The engine returns disease classification, severity score (Mild/Moderate/Severe), and confidence metrics.',
    icon: BarChart3,
  },
  {
    id: 'Stage 04',
    title: 'Action & Treat',
    description: 'Recommended veterinary treatment guidance supports fast isolation and herd disease prevention.',
    icon: DollarSign,
  },
]

const DELIVERY = [
  {
    title: 'Backyard Farmer Feedback Loop',
    description: 'Field diagnostic logs from farmers help refine swine disease detection accuracy.',
    icon: RefreshCw,
  },
  {
    title: 'Herd Health Reporting',
    description: 'Summaries show disease prevalence, symptom trends, and health history by pen or herd.',
    icon: ClipboardList,
  },
  {
    title: 'Diagnostic Transparency',
    description: 'Each scan output includes clear visual bounding boxes and explainable severity scores.',
    icon: CheckCircle2,
  },
]

const MARKETING_BOX_BACKGROUNDS = [
  '/landing/slider/slide-01.jpg',
  '/landing/slider/slide-02.jpg',
  '/landing/slider/slide-03.jpg',
  '/landing/slider/slide-04.jpg',
  '/landing/slider/slide-05.jpg',
  '/landing/slider/slide-06.jpg',
]

function HowItWorks() {
  const wallpapers = useMemo(
    () => Array.from({ length: 4 }, () => ({ src: '/wallpaper-dragon/wallpaper-10.jpg', label: 'Wallpaper Dragon 10' })),
    []
  )

  return (
    <div className="pro-landing mk-page">
      <MarketingHeader />

      <main className="mk-main">
        <section
          className="mk-hero df-parallax-surface df-parallax-dark"
          style={{ '--df-bg-image': `url(${wallpapers[0].src})` }}
        >
          <div className="container-pro mk-hero-grid">
            <div>
              <span className="mk-kicker">How Pigify Works</span>
              <h1 className="mk-title">
                A clear pipeline from
                <span className="accent"> image scan to health decision</span>
              </h1>
              <p className="mk-subtitle">
                Pigify removes guesswork from swine health monitoring. Every stage in the diagnostic pipeline is structured so
                backyard pig farmers can act early before diseases spread.
              </p>
              <div className="mk-actions">
                <Link to="/features" className="lp-btn-primary">
                  View all modules
                  <ArrowRight size={16} />
                </Link>
                <Link to="/about" className="lp-btn-secondary">
                  Learn about the study
                </Link>
              </div>
            </div>

            <aside className="mk-card">
              <div className="mk-card-head">
                <BarChart3 size={16} />
                Health outcomes
              </div>
              <h3>Designed for early swine disease detection</h3>
              <p>
                The workflow balances speed and diagnostic accuracy so each herd health decision is traceable and actionable.
              </p>
              <div className="mk-metric-strip">
                <div className="mk-metric">
                  <span className="value">4 steps</span>
                  <span className="label">Diagnostic pipeline</span>
                </div>
                <div className="mk-metric">
                  <span className="value">Backyard</span>
                  <span className="label">Farm optimized</span>
                </div>
                <div className="mk-metric">
                  <span className="value">Feedback loop</span>
                  <span className="label">Continuous learning</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section
          className="mk-section df-parallax-surface df-parallax-light"
          style={{ '--df-bg-image': `url(${wallpapers[1].src})` }}
        >
          <div className="container-pro">
            <div className="mk-section-head">
              <h2>Core diagnostic workflow stages</h2>
              <p>From image capture to health recommendation, each stage is optimized for backyard farm usage.</p>
            </div>

            <div className="mk-timeline">
              <div className="mk-timeline-track">
                {WORKFLOW.map(({ id, title, description, icon }, index) => (
                  <article
                    key={id}
                    className="mk-step"
                    style={{ '--mk-box-bg-image': `url(${MARKETING_BOX_BACKGROUNDS[index % MARKETING_BOX_BACKGROUNDS.length]})` }}
                  >
                    <div className="mk-box-bg" aria-hidden="true" />
                    <span className="mk-step-id">{id}</span>
                    <div className="mk-info-icon">{createElement(icon, { size: 18 })}</div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="mk-section df-parallax-surface df-parallax-dark"
          style={{ '--df-bg-image': `url(${wallpapers[2].src})` }}
        >
          <div className="container-pro">
            <div className="mk-section-head">
              <h2>What you get after each pig scan</h2>
              <p>Outputs are built to support immediate farm isolation and long-term swine herd health tracking.</p>
            </div>
            <div className="mk-grid-3">
              {DELIVERY.map(({ title, description, icon }, index) => (
                <article
                  key={title}
                  className="mk-info-card"
                  style={{ '--mk-box-bg-image': `url(${MARKETING_BOX_BACKGROUNDS[(index + 2) % MARKETING_BOX_BACKGROUNDS.length]})` }}
                >
                  <div className="mk-box-bg" aria-hidden="true" />
                  <div className="mk-info-icon">{createElement(icon, { size: 18 })}</div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mk-section df-parallax-surface df-parallax-light"
          style={{ '--df-bg-image': `url(${wallpapers[3].src})` }}
        >
          <div className="container-pro">
            <div className="mk-cta">
              <div>
                <h3>Ready to monitor your backyard farm herd?</h3>
                <p>Sign in and start scanning pig skin health with production-ready diagnostic reporting.</p>
              </div>
              <Link to="/login" className="lp-btn-primary">
                Go to Login
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default HowItWorks
