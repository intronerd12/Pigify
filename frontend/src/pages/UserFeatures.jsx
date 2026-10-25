import React from 'react'
import { BRAND_NAME } from '../config/brand'
import './Landing.css'

function UserFeatures() {
  return (
    <div className="app-shell" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff6fb 0%, #fff0f6 12%, #f3fbf8 46%, #eef8ff 100%)'
    }}>
      <header style={{
        backdropFilter: 'blur(14px)',
        background: 'rgba(255, 255, 255, 0.88)',
        borderBottom: '1px solid rgba(16, 25, 39, 0.08)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div className="container-pro" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '32px'
        }}>
          <a href="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>🌴 {BRAND_NAME}</div>
          </a>
          <nav style={{ display: 'flex', gap: '32px', flex: 1, alignItems: 'center' }}>
            {[
              { path: '/overview', label: 'Overview', icon: '🏠' },
              { path: '/user-features', label: 'Features', icon: '✨' },
              { path: '/ai-analysis', label: 'AI Analysis', icon: '🧪' },
              { path: '/marketplace', label: 'Marketplace', icon: '🛒' },
              { path: '/user-admin', label: 'Admin', icon: '⚙️' }
            ].map(item => {
              const isActive = window.location.pathname === item.path
              return (
                <a key={item.path} href={item.path} style={{
                  textDecoration: 'none',
                  color: isActive ? '#D81B60' : '#6b7280',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.95rem',
                  paddingBottom: '4px',
                  borderBottom: isActive ? '2px solid #D81B60' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              )
            })}
          </nav>
          <a href="/home" style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            textDecoration: 'none',
            color: '#000',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}>← Dashboard</a>
        </div>
      </header>
      <main>
        <section className="lp-hero page-hero-pro" style={{
          background: 'linear-gradient(135deg, #D81B60, #E85D93)',
          padding: '76px 0 22px',
          color: '#fff'
        }}>
          <div className="container-pro lp-hero-grid">
            <div className="lp-hero-copy">
              <span className="lp-kicker" style={{
                color: 'rgba(255, 255, 255, 0.95)',
                background: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}>System Capabilities</span>
              <h1 className="lp-title" style={{ color: '#fff' }}>
                Features for
                <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}> Backyard Swine Monitoring</span>
              </h1>
              <p className="lp-subtitle" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                The system combines deep learning image detection with health records to assist backyard pig farmers in noticing symptoms early.
              </p>
              <div className="lp-hero-cta">
                <a href="/ai-analysis" className="lp-btn-primary">Try Analyzer →</a>
                <a href="/home" className="lp-btn-secondary" style={{ background: 'rgba(255, 255, 255, 0.92)', color: '#223049' }}>Dashboard</a>
              </div>
            </div>
            <div className="lp-hero-image">
              <div style={{
                fontSize: '100px',
                textAlign: 'center',
                lineHeight: '1',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))'
              }}>🐖</div>
            </div>
          </div>
        </section>

        <section className="lp-section" style={{
          background: 'linear-gradient(180deg, #fff6fb 0%, #fff0f6 12%, #f3fbf8 46%, #eef8ff 100%)'
        }}>
          <div className="container-pro">
            <h2 className="section-title">Core Features</h2>
            <div className="lp-grid-3">
              {[
                {
                  icon: '🤖',
                  title: 'YOLOv8 Detection Model',
                  desc: 'Detects visible skin lesions, rashes, and discoloration using a trained YOLOv8 model'
                },
                {
                  icon: '📊',
                  title: 'Severity Assessment',
                  desc: 'Categorizes findings into Mild, Moderate, or Severe to give a preliminary sense of urgency'
                },
                {
                  icon: '🔍',
                  title: 'Photo Analysis',
                  desc: 'Processes uploaded photos and displays detected signs along with basic care recommendations'
                },
                {
                  icon: '💾',
                  title: 'Scan History',
                  desc: 'Keeps a record of past scans to help farmers track symptoms over time'
                },
                {
                  icon: '📱',
                  title: 'Mobile & Web Accessible',
                  desc: 'Accessible from phones, tablets, or computers for flexible use on the farm'
                },
                {
                  icon: '🔄',
                  title: 'Feedback & Updates',
                  desc: 'Allows farmers to review past results and record observations as health changes'
                }
              ].map((feat, i) => (
                <div key={i} className="guide-card-pro" style={{
                  padding: '32px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(253, 242, 248, 0.95))',
                  borderRadius: '12px',
                  border: '1px solid rgba(216, 27, 96, 0.12)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 14px 30px rgba(216, 27, 96, 0.08)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feat.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 12px 0' }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0', lineHeight: '1.6' }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-section-alt" style={{
          background: 'linear-gradient(180deg, #fff6fb 0%, #fff0f6 12%, #f3fbf8 46%, #eef8ff 100%)'
        }}>
          <div className="container-pro">
            <h2 className="section-title">Advanced Capabilities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Analytics Dashboard', items: ['Pass/fail trends', 'Defect distribution', 'Grade breakdown', 'Performance metrics'] },
                { title: 'Quality Metrics', items: ['Ripeness classification', 'Color analysis', 'Defect hotspots', 'Size estimation'] },
                { title: 'Admin Tools', items: ['Label corrections', 'Report generation', 'User management', 'System monitoring'] }
              ].map((section, i) => (
                <div key={i} className="guide-card-pro guide-card-soft" style={{
                  padding: '24px',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 16px 0' }}>{section.title}</h3>
                  <ul style={{ margin: '0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {section.items.map((item, j) => (
                      <li key={j} style={{ color: '#6b7280', fontSize: '0.95rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{
        background: 'linear-gradient(135deg, #D81B60, #B8105B)',
        padding: '32px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '48px'
      }}>
        <div className="container-pro" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>🛡️ {BRAND_NAME}</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>Swine Disease &amp; Symptom Monitoring System for Backyard Farms</p>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default UserFeatures
