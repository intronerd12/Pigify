import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Flame,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Thermometer,
  Wind,
  ScanLine,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import UserHeader from '../components/user/UserHeader'
import { API_BASE_URL } from '../config/api'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import './Landing.css'
import './MarketingPages.css'

const PEN_ZONES = [
  {
    id: 'nursery',
    name: 'Nursery & Piglet Pens',
    location: 'Sector A - East Shelter',
    swineCount: 14,
    targetTemp: '28°C - 32°C',
    targetHumidity: '60% - 70%',
    currentTemp: 29.4,
    currentHumidity: 64,
    ammoniaIndex: 'Low (0.04 ppm)',
    heatStressLevel: 'Optimal',
    status: 'Safe',
    riskCorrelation: 'Low risk of dermatitis; dry warm bedding prevents chilling and piglet skin abrasions.',
  },
  {
    id: 'grower',
    name: 'Grower Herd Pens',
    location: 'Sector B - Main Outdoor Pen',
    swineCount: 16,
    targetTemp: '20°C - 25°C',
    targetHumidity: '55% - 70%',
    currentTemp: 28.2,
    currentHumidity: 78,
    ammoniaIndex: 'Elevated (0.12 ppm)',
    heatStressLevel: 'Mild Heat Stress',
    status: 'Warning',
    riskCorrelation: 'High humidity (>75%) and damp concrete floor elevates greasy pig dermatitis and diamond skin risks.',
  },
  {
    id: 'finisher',
    name: 'Finisher Swine Pens',
    location: 'Sector C - South Shelter',
    swineCount: 12,
    targetTemp: '18°C - 24°C',
    targetHumidity: '50% - 65%',
    currentTemp: 26.5,
    currentHumidity: 62,
    ammoniaIndex: 'Normal (0.06 ppm)',
    heatStressLevel: 'Acceptable',
    status: 'Safe',
    riskCorrelation: 'Good cross-ventilation maintains clear dermis; skin parasite proliferation is minimized.',
  },
  {
    id: 'gestation',
    name: 'Sow Breeding Stalls',
    location: 'Sector D - Central Barn',
    swineCount: 8,
    targetTemp: '18°C - 22°C',
    targetHumidity: '55% - 70%',
    currentTemp: 25.1,
    currentHumidity: 60,
    ammoniaIndex: 'Normal (0.05 ppm)',
    heatStressLevel: 'Optimal',
    status: 'Safe',
    riskCorrelation: 'Shaded canopy and automated misting prevent heat-induced skin erythema.',
  },
  {
    id: 'isolation',
    name: 'Quarantine & Isolation Pen',
    location: 'Sector E - Perimeter Buffer',
    swineCount: 3,
    targetTemp: '22°C - 26°C',
    targetHumidity: '50% - 60%',
    currentTemp: 25.8,
    currentHumidity: 58,
    ammoniaIndex: 'Low (0.03 ppm)',
    heatStressLevel: 'Optimal',
    status: 'Quarantine Active',
    riskCorrelation: 'Strict 10-meter perimeter buffer prevents airborne contagion spread to healthy pens.',
  },
]

function Environment() {
  const [selectedZoneId, setSelectedZoneId] = useState(PEN_ZONES[0].id)
  const [weather, setWeather] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(false)

  const selectedZone = useMemo(
    () => PEN_ZONES.find((z) => z.id === selectedZoneId) || PEN_ZONES[0],
    [selectedZoneId]
  )

  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/weather?province=Laguna`)
        if (res.ok) {
          const data = await res.json()
          setWeather(data)
        }
      } catch {
        // Fallback weather simulation
        setWeather({
          temperature: 28.5,
          humidity: 68,
          description: 'Partly Cloudy',
          windSpeed: '12 km/h',
        })
      } finally {
        setLoadingWeather(false)
      }
    }
    fetchWeather()
  }, [])

  return (
    <div className="pro-landing mk-page">
      <UserHeader />

      <main className="mk-main">
        {/* ================================================================
            1. HERO COMMAND HEADER
            ================================================================ */}
        <section className="mk-hero" style={{ paddingBottom: '20px' }}>
          <div className="container-pro">
            <div className="mk-kicker">
              <span className="mk-kicker-dot" />
              <span>PEN MICROCLIMATE TELEMETRY // BIOSECURITY v1.0</span>
            </div>

            <h1 className="mk-title">
              Farm Environment &amp;
              <span className="accent"> Pen Microclimate</span>
            </h1>

            <p className="mk-subtitle">
              Monitor temperature, relative humidity, heat index, and pen ventilation across your backyard pens.
              Unbalanced ambient conditions strongly correlate with swine skin disease flare-ups and bacterial transmission.
            </p>
          </div>
        </section>

        {/* ================================================================
            2. ZONE SELECTOR BUTTONS
            ================================================================ */}
        <section className="mk-section" style={{ paddingTop: '0px', paddingBottom: '24px' }}>
          <div className="container-pro">
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              }}
            >
              {PEN_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: selectedZoneId === zone.id ? 'var(--accent-rose, #f43f5e)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedZoneId === zone.id ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                    border: `1px solid ${selectedZoneId === zone.id ? 'var(--accent-rose, #f43f5e)' : 'var(--border-subtle, rgba(255, 255, 255, 0.1))'}`,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <MapPin size={14} />
                  <span>{zone.name}</span>
                  {zone.status === 'Warning' && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            3. SELECTED ZONE TELEMETRY METRICS
            ================================================================ */}
        <section className="mk-section" style={{ paddingTop: '0px', paddingBottom: '36px' }}>
          <div className="container-pro">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.15fr) minmax(300px, 0.85fr)', gap: '24px' }}>
              {/* Left Box: Microclimate Telemetry Gauges */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  padding: '28px',
                  boxShadow: 'var(--shadow-card, 0 16px 40px rgba(0, 0, 0, 0.28))',
                }}
              >
                <div className="lp-card-reticle top-left" />
                <div className="lp-card-reticle bottom-right" />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                      {selectedZone.name} Telemetry
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
                      {selectedZone.location} • {selectedZone.swineCount} swine heads
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: selectedZone.status === 'Safe' ? '#10b981' : selectedZone.status === 'Warning' ? '#f59e0b' : '#f43f5e',
                      background: selectedZone.status === 'Safe' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: `1px solid ${selectedZone.status === 'Safe' ? '#10b98140' : '#f59e0b40'}`,
                    }}
                  >
                    {selectedZone.status.toUpperCase()}
                  </span>
                </div>

                {/* 4 Metric Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
                  {/* Temp */}
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>PEN TEMPERATURE</span>
                      <Thermometer size={16} color="#f43f5e" />
                    </div>
                    <div style={{ fontFamily: 'Sora', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main, #ffffff)' }}>
                      {selectedZone.currentTemp}°C
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
                      Target: {selectedZone.targetTemp}
                    </div>
                  </div>

                  {/* Humidity */}
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>RELATIVE HUMIDITY</span>
                      <Droplets size={16} color="#06b6d4" />
                    </div>
                    <div style={{ fontFamily: 'Sora', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main, #ffffff)' }}>
                      {selectedZone.currentHumidity}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
                      Target: {selectedZone.targetHumidity}
                    </div>
                  </div>

                  {/* Heat Stress Index */}
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>HEAT STRESS INDEX</span>
                      <Flame size={16} color="#f59e0b" />
                    </div>
                    <div style={{ fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 800, color: selectedZone.heatStressLevel.includes('Stress') ? '#f59e0b' : '#10b981', marginTop: '4px' }}>
                      {selectedZone.heatStressLevel}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
                      Panting / Flushing risk
                    </div>
                  </div>

                  {/* Ammonia Index */}
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>PEN VENTILATION / GAS</span>
                      <Wind size={16} color="#10b981" />
                    </div>
                    <div style={{ fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main, #ffffff)', marginTop: '4px' }}>
                      {selectedZone.ammoniaIndex}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
                      Airflow status
                    </div>
                  </div>
                </div>

                {/* Epidemiological Disease Risk Note */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose, #f43f5e)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                    <ShieldAlert size={16} />
                    <span>Microclimate Disease Risk Analysis</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5, margin: 0 }}>
                    {selectedZone.riskCorrelation}
                  </p>
                </div>
              </div>

              {/* Right Box: Farmer Actionable Environmental Best Practices */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  padding: '28px',
                  boxShadow: 'var(--shadow-card, 0 16px 40px rgba(0, 0, 0, 0.28))',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div className="lp-card-reticle top-left" />
                <div className="lp-card-reticle bottom-right" />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <ShieldCheck size={20} color="#10b981" />
                    <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                      Backyard Pen Biosecurity Rules
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5, margin: '0 0 18px 0' }}>
                    Research-proven environmental interventions to minimize swine skin lesion proliferation:
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.45 }}>
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Dry Bedding Replacement:</strong> Wet rice straw or sawdust fosters bacterial growth (Staphylococcus) causing greasy pig disease. Replace twice weekly.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.45 }}>
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Cross-Ventilation:</strong> Stagnant air with high ammonia levels damages porcine dermal barriers and nasal mucosa. Maintain open ridge pen ventilation.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.45 }}>
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Heat Stress Misting:</strong> When pen ambient temperatures exceed 28°C, pigs cannot sweat. Provide shade netting and sprinkler intervals on floor slats.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.45 }}>
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Footbath Sanitation:</strong> Refresh lime/iodine footbaths outside pen entryways to prevent moving erysipelas bacteria between pens on farmer boots.</span>
                    </li>
                  </ul>
                </div>

                <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                  <Link to="/ai-analysis" className="lp-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <ScanLine size={16} />
                    <span>Run Pen Dermis Inspection</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="container-pro lp-footer-bottom" style={{ borderTop: 'none', paddingTop: '16px' }}>
          <span>(c) {new Date().getFullYear()} {BRAND_NAME}. {BRAND_TAGLINE}.</span>
          <div className="lp-footer-legal">
            <Link to="/about">About Study</Link>
            <Link to="/how-it-works">Environmental Factors</Link>
            <Link to="/features">Features</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Environment
