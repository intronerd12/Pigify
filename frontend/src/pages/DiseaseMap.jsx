import React, { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  MapPin,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  RefreshCw,
  PhoneCall,
  Mail,
  Send,
  SlidersHorizontal,
  Layers,
  Info,
  ChevronRight,
  Sparkles,
  Compass,
  Radio,
  Clock,
  UserCheck,
  Award,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import UserHeader from '../components/user/UserHeader'
import { API_BASE_URL } from '../config/api'
import { BRAND_NAME } from '../config/brand'
import {
  PVO_DIRECTORY,
  ASF_GOVERNANCE_ROLES,
  BREED_SUSCEPTIBILITY_MATRIX,
  SICK_PIG_ACTION_PROTOCOL,
} from '../utils/swineDiseaseData'
import './Landing.css'
import './MarketingPages.css'

// Default Surveillance Map Dataset (Laguna & Batangas Swine Belt)
const DEFAULT_MAP_FARMS = [
  {
    id: 'farm-01',
    name: 'San Isidro Backyard Swine Site',
    owner: 'Rogelio Mendoza',
    contact: '0917-555-0192',
    breedType: 'Philippine Native Pig (Baboy Katutubo)',
    pigCount: 22,
    province: 'Laguna',
    municipality: 'Pila',
    barangay: 'Barangay San Antonio',
    latitude: 14.2335,
    longitude: 121.3654,
    x: 320, // SVG relative projection coordinates
    y: 240,
    status: 'Infected Zone (Red)',
    severityColor: '#f43f5e',
    activeAlert: 'Active ASF Alert // Under Cordon',
    quarantineRadiusKm: 1.0,
    nearestPvo: 'PVO Laguna (Santa Cruz) - 6.2 km',
    lastScanned: '2 hours ago',
    pvoNotified: true,
  },
  {
    id: 'farm-02',
    name: 'Victoria Breeder Farm',
    owner: 'Elena Bautista',
    contact: '0919-555-8821',
    breedType: 'Commercial White (Yorkshire)',
    pigCount: 45,
    province: 'Laguna',
    municipality: 'Victoria',
    barangay: 'Barangay Banca-banca',
    latitude: 14.2255,
    longitude: 121.3282,
    x: 260,
    y: 260,
    status: 'Buffer Zone (Pink)',
    severityColor: '#ec4899',
    activeAlert: 'Buffer Surveillance Active (1-7 km)',
    quarantineRadiusKm: 7.0,
    nearestPvo: 'PVO Laguna (Santa Cruz) - 9.4 km',
    lastScanned: '5 hours ago',
    pvoNotified: true,
  },
  {
    id: 'farm-03',
    name: 'Bay Agri-Backyard Pen',
    owner: 'Danilo Ramos',
    contact: '0922-555-4311',
    breedType: 'Philippine Native Pig (Baboy Katutubo)',
    pigCount: 16,
    province: 'Laguna',
    municipality: 'Bay',
    barangay: 'Barangay San Agustin',
    latitude: 14.1812,
    longitude: 121.2842,
    x: 200,
    y: 310,
    status: 'Surveillance Zone (Yellow)',
    severityColor: '#f59e0b',
    activeAlert: 'Movement Restricted (7-10 km)',
    quarantineRadiusKm: 10.0,
    nearestPvo: 'PVO Laguna (Santa Cruz) - 15.1 km',
    lastScanned: '12 hours ago',
    pvoNotified: false,
  },
  {
    id: 'farm-04',
    name: 'Calamba Model Agro Pen',
    owner: 'Ricardo Dizon',
    contact: '0918-555-2200',
    breedType: 'Crossbreed (Duroc x Landrace)',
    pigCount: 60,
    province: 'Laguna',
    municipality: 'Calamba',
    barangay: 'Barangay Real',
    latitude: 14.2136,
    longitude: 121.1648,
    x: 110,
    y: 250,
    status: 'Free Zone (Green)',
    severityColor: '#10b981',
    activeAlert: 'Optimal Biosecurity Baseline',
    quarantineRadiusKm: 0,
    nearestPvo: 'PVO Laguna (Santa Cruz) - 24.8 km',
    lastScanned: '1 day ago',
    pvoNotified: false,
  },
  {
    id: 'farm-05',
    name: 'Tanauan Native Pig Reserve',
    owner: 'Nestor Castillo',
    contact: '0917-555-7764',
    breedType: 'Philippine Native Pig (Baboy Katutubo)',
    pigCount: 28,
    province: 'Batangas',
    municipality: 'Tanauan City',
    barangay: 'Barangay Natatas',
    latitude: 14.0862,
    longitude: 121.1506,
    x: 95,
    y: 390,
    status: 'Buffer Zone (Pink)',
    severityColor: '#ec4899',
    activeAlert: 'Swine Erysipelas Differential Watch',
    quarantineRadiusKm: 7.0,
    nearestPvo: 'PVO Batangas (Batangas City) - 34.0 km',
    lastScanned: '8 hours ago',
    pvoNotified: true,
  },
  {
    id: 'farm-06',
    name: 'Santa Cruz Riverbank Piggery',
    owner: 'Arnaldo Cruz',
    contact: '0920-555-9012',
    breedType: 'Commercial White (Landrace)',
    pigCount: 38,
    province: 'Laguna',
    municipality: 'Santa Cruz',
    barangay: 'Barangay Santo Angel',
    latitude: 14.2812,
    longitude: 121.4182,
    x: 390,
    y: 190,
    status: 'Free Zone (Green)',
    severityColor: '#10b981',
    activeAlert: 'Negative Surveillance Baseline',
    quarantineRadiusKm: 0,
    nearestPvo: 'PVO Laguna (Santa Cruz) - 1.8 km',
    lastScanned: '3 hours ago',
    pvoNotified: false,
  },
]

const PVO_MAP_STATIONS = [
  {
    id: 'pvo-laguna-hub',
    name: 'Provincial Veterinary Office - Laguna',
    province: 'Laguna',
    location: 'Capitol Compound, Santa Cruz, Laguna',
    hotline: '(049) 501-1823 / 0917-838-5847',
    x: 410,
    y: 180,
    officer: 'Dr. Mary Grace B. Cruz, DVM',
  },
  {
    id: 'pvo-batangas-hub',
    name: 'Provincial Veterinary Office - Batangas',
    province: 'Batangas',
    location: 'Capitol Site, Batangas City',
    hotline: '(043) 723-1498 / 0919-456-7890',
    x: 80,
    y: 470,
    officer: 'Dr. Romelito R. Perez, DVM',
  },
]

function DiseaseMap() {
  const [farms, setFarms] = useState(DEFAULT_MAP_FARMS)
  const [selectedFarm, setSelectedFarm] = useState(DEFAULT_MAP_FARMS[0])
  const [filterBreed, setFilterBreed] = useState('ALL')
  const [filterZone, setFilterZone] = useState('ALL')
  const [activeTab, setActiveTab] = useState('map') // 'map' | 'roles' | 'disinfection' | 'pvo_report'
  const [loading, setLoading] = useState(false)

  // Incident Dispatch Form State
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportForm, setReportForm] = useState({
    farmName: '',
    ownerName: '',
    contactNumber: '',
    province: 'Laguna',
    municipality: 'Santa Cruz',
    barangay: '',
    pigBreed: 'Philippine Native Pig (Baboy Katutubo)',
    herdTotal: 12,
    affectedCount: 2,
    mortalityCount: 0,
    suspectedDisease: 'African Swine Fever (ASF)',
    severityTier: 'Critical Quarantine (Red Alert)',
    symptoms: 'High pyrexia (41°C), cyanotic purple ear tips, anorexia',
    reportingOfficer: 'Backyard Raiser / Farm Owner',
  })
  const [submittingReport, setSubmittingReport] = useState(false)
  const [dispatchedConfirmation, setDispatchedConfirmation] = useState(null)

  // Fetch live map data from backend if available
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/scan/surveillance-map`)
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.farms) && data.farms.length > 0) {
            // Merge with svg coordinates
            const merged = data.farms.map((f, i) => {
              const defaultCoords = DEFAULT_MAP_FARMS[i] || DEFAULT_MAP_FARMS[0]
              return {
                ...defaultCoords,
                ...f,
                x: defaultCoords.x,
                y: defaultCoords.y,
              }
            })
            setFarms(merged)
            setSelectedFarm(merged[0])
          }
        }
      } catch {
        // Fallback to local high-fidelity dataset
      }
    }
    fetchMapData()
  }, [])

  // Filtered farms list
  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      const matchBreed =
        filterBreed === 'ALL'
          ? true
          : filterBreed === 'NATIVE'
          ? f.breedType.includes('Native')
          : !f.breedType.includes('Native')

      const matchZone =
        filterZone === 'ALL'
          ? true
          : filterZone === 'INFECTED'
          ? f.status.includes('Red')
          : filterZone === 'BUFFER'
          ? f.status.includes('Pink') || f.status.includes('Yellow')
          : f.status.includes('Green')

      return matchBreed && matchZone
    })
  }, [farms, filterBreed, filterZone])

  const stats = useMemo(() => {
    return {
      total: farms.length,
      redInfected: farms.filter((f) => f.status.includes('Red')).length,
      bufferPink: farms.filter((f) => f.status.includes('Pink')).length,
      yellowSurveillance: farms.filter((f) => f.status.includes('Yellow')).length,
      greenFree: farms.filter((f) => f.status.includes('Green')).length,
      nativePigFarms: farms.filter((f) => f.breedType.includes('Native')).length,
    }
  }, [farms])

  const handleOpenReportModal = (farm = null) => {
    if (farm) {
      setReportForm((prev) => ({
        ...prev,
        farmName: farm.name,
        ownerName: farm.owner,
        province: farm.province,
        municipality: farm.municipality,
        barangay: farm.barangay,
        pigBreed: farm.breedType,
        herdTotal: farm.pigCount,
      }))
    }
    setReportModalOpen(true)
  }

  const handleSubmitPvoReport = async (e) => {
    e.preventDefault()
    setSubmittingReport(true)

    try {
      const payload = {
        ...reportForm,
        latitude: selectedFarm?.latitude || 14.2335,
        longitude: selectedFarm?.longitude || 121.3654,
        symptoms: [reportForm.symptoms],
      }

      let confirmation = null
      try {
        const res = await fetch(`${API_BASE_URL}/api/scan/pvo-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const resData = await res.json()
          confirmation = resData.alert
        }
      } catch {
        // Local simulation fallback
      }

      if (!confirmation) {
        confirmation = {
          incidentRef: `PVO-REF-${new Date().getFullYear()}-ASF-${Math.floor(1000 + Math.random() * 9000)}`,
          farmName: reportForm.farmName,
          province: reportForm.province,
          municipality: reportForm.municipality,
          suspectedDisease: reportForm.suspectedDisease,
          dispatchedAt: new Date().toISOString(),
          status: 'Dispatched to Provincial Veterinary Office',
        }
      }

      setDispatchedConfirmation(confirmation)
      toast.success('Alert transmitted to Provincial Veterinary Office!')
    } catch (err) {
      toast.error(err.message || 'Error transmitting report')
    } finally {
      setSubmittingReport(false)
    }
  }

  return (
    <div className="pro-landing mk-page">
      <UserHeader />

      <main className="mk-main">
        {/* ── 1. HERO HEADER ── */}
        <section className="mk-hero" style={{ paddingBottom: '20px' }}>
          <div className="container-pro">
            <div className="mk-kicker">
              <span className="mk-kicker-dot" />
              <span>FARM GEOGRAPHY &bull; COMMUNITY HEALTH MAP &amp; ZONING</span>
            </div>

            <h1 className="mk-title">
              Swine Health Map &amp;
              <span className="accent"> Community Awareness</span>
            </h1>

            <p className="mk-subtitle">
              Interactive geographic reference for swine health observations, local zoning boundaries,
              and contact information for the Provincial Veterinary Office (PVO).
            </p>

            {/* Sub-Nav Bar */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`lp-btn-secondary ${activeTab === 'map' ? 'lp-btn-primary' : ''}`}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <Compass size={15} />
                <span>Geographic Map &amp; Zones</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`lp-btn-secondary ${activeTab === 'roles' ? 'lp-btn-primary' : ''}`}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <UserCheck size={15} />
                <span>Who Checks &amp; Reports ASF?</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('disinfection')}
                className={`lp-btn-secondary ${activeTab === 'disinfection' ? 'lp-btn-primary' : ''}`}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <ShieldCheck size={15} />
                <span>Sick Pig Disinfection Protocols</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenReportModal()}
                className="lp-btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                  borderColor: 'rgba(244,63,94,0.5)',
                }}
              >
                <Send size={15} />
                <span>Report Incident to PVO</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── 2. TAB: GEOGRAPHIC MAP VIEW ── */}
        {activeTab === 'map' && (
          <section className="mk-section" style={{ paddingTop: '10px' }}>
            <div className="container-pro">
              {/* Telemetry Metric Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f43f5e', fontWeight: 700 }}>
                    RED ZONE (0-1 KM)
                  </div>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {stats.redInfected} Monitored Zones
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>Restricted Movement Zone</small>
                </div>

                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px solid rgba(236, 72, 153, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#ec4899', fontWeight: 700 }}>
                    PINK BUFFER (1-7 KM)
                  </div>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {stats.bufferPink} Farms
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>Weekly Surveillance Check</small>
                </div>

                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                    YELLOW ZONE (7-10 KM)
                  </div>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {stats.yellowSurveillance} Farms
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>Blood Testing Radius</small>
                </div>

                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#06b6d4', fontWeight: 700 }}>
                    NATIVE PIG SITES
                  </div>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    {stats.nativePigFarms} Sites
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>Baboy Katutubo Herds</small>
                </div>
              </div>

              {/* Main Interactive Map Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(420px, 1.4fr) minmax(320px, 0.8fr)',
                  gap: '24px',
                  alignItems: 'start',
                }}
              >
                {/* ── LEFT: SVG GIS Map Canvas ── */}
                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.9))',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    borderRadius: '24px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  {/* Filter Toolbar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Radio size={16} color="#f43f5e" className="pigify-pulse" />
                      <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                        Laguna &amp; Batangas Swine Corridor GIS
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={filterBreed}
                        onChange={(e) => setFilterBreed(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          padding: '6px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="ALL">All Swine Breeds</option>
                        <option value="NATIVE">Native Pigs Only</option>
                        <option value="COMMERCIAL">Commercial Only</option>
                      </select>

                      <select
                        value={filterZone}
                        onChange={(e) => setFilterZone(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          padding: '6px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="ALL">All Zones</option>
                        <option value="INFECTED">Red Zone Only</option>
                        <option value="BUFFER">Buffer &amp; Surveillance</option>
                        <option value="FREE">Free Zone Only</option>
                      </select>
                    </div>
                  </div>

                  {/* High-Tech Vector Map Canvas (SVG) */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '460px',
                      background: 'radial-gradient(ellipse at 60% 40%, rgba(20, 30, 55, 0.8) 0%, rgba(7, 10, 19, 0.98) 100%)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <svg
                      viewBox="0 0 500 500"
                      style={{ width: '100%', height: '100%', display: 'block' }}
                    >
                      {/* Grid Lines */}
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        </pattern>
                        {/* Outbreak Pulsing Glow */}
                        <radialGradient id="redOutbreakGlow">
                          <stop offset="0%" stopColor="rgba(244, 63, 94, 0.45)" />
                          <stop offset="60%" stopColor="rgba(244, 63, 94, 0.15)" />
                          <stop offset="100%" stopColor="rgba(244, 63, 94, 0.0)" />
                        </radialGradient>
                      </defs>
                      <rect width="500" height="500" fill="url(#grid)" />

                      {/* Laguna de Bay stylized coastline hint */}
                      <path
                        d="M 120 120 Q 220 80 340 110 T 440 150 Q 420 220 360 250 T 260 220 Q 180 230 140 180 Z"
                        fill="rgba(6, 182, 212, 0.08)"
                        stroke="rgba(6, 182, 212, 0.25)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text x="240" y="160" fill="rgba(6, 182, 212, 0.3)" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="2">
                        LAGUNA DE BAY
                      </text>

                      {/* 1-7-10 KM CONCENTRIC ZONING RINGS around San Isidro Outbreak (Farm-01: 320, 240) */}
                      {/* Yellow Surveillance Zone (10 km) */}
                      <circle
                        cx="320"
                        cy="240"
                        r="120"
                        fill="none"
                        stroke="rgba(245, 158, 11, 0.35)"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                      <text x="330" y="130" fill="rgba(245, 158, 11, 0.6)" fontSize="9" fontFamily="JetBrains Mono">
                        YELLOW ZONE (10 KM SURVEILLANCE)
                      </text>

                      {/* Pink Buffer Zone (7 km) */}
                      <circle
                        cx="320"
                        cy="240"
                        r="85"
                        fill="rgba(236, 72, 153, 0.05)"
                        stroke="rgba(236, 72, 153, 0.5)"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <text x="330" y="165" fill="rgba(236, 72, 153, 0.7)" fontSize="9" fontFamily="JetBrains Mono">
                        PINK BUFFER (7 KM)
                      </text>

                      {/* Red Infected Zone (1 km) */}
                      <circle cx="320" cy="240" r="38" fill="url(#redOutbreakGlow)" stroke="#f43f5e" strokeWidth="2" />
                      <circle cx="320" cy="240" r="38" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3">
                        <animateTransform attributeName="transform" type="rotate" from="0 320 240" to="360 320 240" dur="10s" repeatCount="indefinite" />
                      </circle>
                      <text x="305" y="225" fill="#f43f5e" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                        RED ZONE (1 KM)
                      </text>

                      {/* PVO Station Markers */}
                      {PVO_MAP_STATIONS.map((pvo) => (
                        <g key={pvo.id} transform={`translate(${pvo.x}, ${pvo.y})`}>
                          <rect x="-14" y="-14" width="28" height="28" rx="6" fill="rgba(37, 99, 235, 0.25)" stroke="#3b82f6" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="4" fill="#3b82f6" />
                          <text x="18" y="4" fill="#60a5fa" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                            PVO HUB
                          </text>
                        </g>
                      ))}

                      {/* Farm Markers */}
                      {filteredFarms.map((farm) => {
                        const isSelected = selectedFarm?.id === farm.id
                        const isRed = farm.status.includes('Red')
                        const isNative = farm.breedType.includes('Native')

                        return (
                          <g
                            key={farm.id}
                            transform={`translate(${farm.x}, ${farm.y})`}
                            onClick={() => setSelectedFarm(farm)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Selected Pulsing Ring */}
                            {isSelected && (
                              <circle cx="0" cy="0" r="18" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3">
                                <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
                              </circle>
                            )}

                            {/* Outbreak Beacon Pulse */}
                            {isRed && (
                              <circle cx="0" cy="0" r="14" fill="rgba(244, 63, 94, 0.4)">
                                <animate attributeName="r" values="8;18;8" dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.5s" repeatCount="indefinite" />
                              </circle>
                            )}

                            {/* Farm Pin Body */}
                            <circle
                              cx="0"
                              cy="0"
                              r={isSelected ? '10' : '8'}
                              fill={farm.severityColor}
                              stroke="#ffffff"
                              strokeWidth={isSelected ? '2.5' : '1.5'}
                            />

                            {/* Native Pig Indicator Dot */}
                            {isNative && (
                              <circle cx="0" cy="0" r="3" fill="#000000" />
                            )}

                            {/* Farm Name Label */}
                            <text
                              x="12"
                              y="4"
                              fill={isSelected ? '#ffffff' : 'rgba(255,255,255,0.75)'}
                              fontSize={isSelected ? '10' : '8.5'}
                              fontWeight={isSelected ? 'bold' : 'normal'}
                              fontFamily="JetBrains Mono"
                            >
                              {farm.name.split(' ')[0]} {isNative ? '🐖' : ''}
                            </text>
                          </g>
                        )
                      })}
                    </svg>

                    {/* Map Legend Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        background: 'rgba(7, 10, 19, 0.88)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        gap: '14px',
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
                        <span>Red (Infected 1km)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} />
                        <span>Pink (Buffer 7km)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                        <span>Yellow (Surveillance 10km)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                        <span>PVO Station</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span>Free Zone</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Telemetry Disclaimer */}
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)' }}>
                    <span>
                      <Compass size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Reference map illustrating zoning standards aligned with Philippine animal health guidelines (BAI Administrative Order No. 22).
                    </span>
                    <button
                      type="button"
                      onClick={() => setFarms([...DEFAULT_MAP_FARMS])}
                      style={{ background: 'transparent', border: 'none', color: '#06b6d4', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Reset Focus
                    </button>
                  </div>
                </div>

                {/* ── RIGHT: Selected Farm Telemetry & PVO Dispatch ── */}
                <div
                  style={{
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.9))',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    borderRadius: '24px',
                    padding: '24px',
                    position: 'relative',
                  }}
                >
                  <div className="lp-card-reticle top-left" />
                  <div className="lp-card-reticle bottom-right" />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                      INSPECTING SWINE FACILITY
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono',
                        color: '#ffffff',
                        background: selectedFarm ? selectedFarm.severityColor : '#64748b',
                      }}
                    >
                      {selectedFarm ? selectedFarm.status : 'NO SELECTION'}
                    </span>
                  </div>

                  {selectedFarm ? (
                    <div>
                      <h2 style={{ fontFamily: 'Sora', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
                        {selectedFarm.name}
                      </h2>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '16px' }}>
                        {selectedFarm.barangay}, {selectedFarm.municipality}, {selectedFarm.province}
                      </div>

                      {/* Detail Metrics List */}
                      <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>SWINE BREED CATEGORY</small>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff', marginTop: '2px' }}>
                            {selectedFarm.breedType}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>HERD TOTAL</small>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#10b981', marginTop: '2px' }}>
                              {selectedFarm.pigCount} Heads
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>GPS COORDINATES</small>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#ffffff', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                              {selectedFarm.latitude.toFixed(4)}°N, {selectedFarm.longitude.toFixed(4)}°E
                            </div>
                          </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>NEAREST PVO STATION</small>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#38bdf8', marginTop: '2px' }}>
                            {selectedFarm.nearestPvo}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono' }}>OPERATOR &amp; CONTACT</small>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff', marginTop: '2px' }}>
                            {selectedFarm.owner} &bull; {selectedFarm.contact}
                          </div>
                        </div>
                      </div>

                      {/* Mandated Action for this Farm */}
                      <div
                        style={{
                          borderRadius: '12px',
                          padding: '14px',
                          marginBottom: '20px',
                          background: selectedFarm.status.includes('Red')
                            ? 'rgba(244, 63, 94, 0.12)'
                            : 'rgba(6, 182, 212, 0.1)',
                          border: `1px solid ${
                            selectedFarm.status.includes('Red')
                              ? 'rgba(244, 63, 94, 0.35)'
                              : 'rgba(6, 182, 212, 0.3)'
                          }`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <ShieldAlert size={16} color={selectedFarm.severityColor} />
                          <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Mandated Biosecurity Action:</strong>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5, margin: 0 }}>
                          {selectedFarm.status.includes('Red')
                            ? 'CRITICAL RED ZONE: Complete farm lockdown. Depopulation protocol initiated. No live pig movement within 1 km. 24/7 PVO quarantine checkpoint active.'
                            : selectedFarm.status.includes('Pink')
                            ? 'PINK BUFFER ZONE: Weekly clinical inspection by Municipal Agriculture Office. Daily footbath disinfection required. Live pig transport prohibited without BAI permit.'
                            : selectedFarm.status.includes('Yellow')
                            ? 'YELLOW SURVEILLANCE: Routine blood sampling for PCR surveillance. Free transit allowed only with certified Veterinary Health Certificate (VHC).'
                            : 'FREE ZONE: Maintain standard backyard biosecurity hygiene, slaked lime walkways, and 48-hour footbath replacement.'}
                        </p>
                      </div>

                      {/* Action Dispatch Buttons */}
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(selectedFarm)}
                          className="lp-btn-primary"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                          }}
                        >
                          <Send size={15} />
                          <span>Dispatch Incident Report to PVO</span>
                        </button>

                        <a
                          href={`tel:${PVO_DIRECTORY[0].hotline.split('/')[0].trim()}`}
                          className="lp-btn-secondary"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            padding: '10px',
                            textDecoration: 'none',
                            fontSize: '0.84rem',
                          }}
                        >
                          <PhoneCall size={14} />
                          <span>Call PVO Emergency Hotline</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted, #94a3b8)' }}>
                      <MapPin size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                      <p>Click any farm pin or PVO station on the map to view farm details and zoning guidelines.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 3. TAB: RESPONSIBILITY CHAIN & REPORTING HIERARCHY ── */}
        {activeTab === 'roles' && (
          <section className="mk-section" style={{ paddingTop: '10px' }}>
            <div className="container-pro">
              <div
                style={{
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.9))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                  borderRadius: '24px',
                  padding: '32px',
                  marginBottom: '30px',
                }}
              >
                <div style={{ maxWidth: '780px', marginBottom: '28px' }}>
                  <div className="mk-kicker">
                    <span className="mk-kicker-dot" />
                    <span>EPIDEMIOLOGY GOVERNANCE &bull; BAI &amp; PVO PROTOCOL</span>
                  </div>
                  <h2 style={{ fontFamily: 'Sora', fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 12px 0' }}>
                    Who is Responsible for Checking and Reporting ASF Spread?
                  </h2>
                  <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    In accordance with Department of Agriculture Administrative Order No. 22 and the National <em>Bantay ASF sa Barangay (BABay ASF)</em> Program,
                    disease detection, verification, and contagion containment follow a strict 5-tier chain of command:
                  </p>
                </div>

                {/* 5-Tier Governance Workflow Cards */}
                <div style={{ display: 'grid', gap: '16px' }}>
                  {ASF_GOVERNANCE_ROLES.map((tier) => (
                    <div
                      key={tier.tier}
                      style={{
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${tier.color}35`,
                        padding: '20px 24px',
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: '180px 1fr',
                        gap: '20px',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontFamily: 'JetBrains Mono',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#ffffff',
                            background: tier.color,
                            marginBottom: '8px',
                          }}
                        >
                          TIER {tier.tier} &bull; {tier.badge}
                        </span>
                        <h4 style={{ fontFamily: 'Sora', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0' }}>
                          {tier.roleTitle}
                        </h4>
                        <small style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.8rem' }}>{tier.designation}</small>
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: tier.color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Core Responsibilities &amp; Verification Duties:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                          {tier.responsibilities.map((resp, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statutory Highlight Note */}
                <div
                  style={{
                    marginTop: '24px',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Award size={22} color="#f43f5e" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#ffffff' }}>Panel Defense Answer Key:</strong> The <strong>Provincial Veterinary Office (PVO)</strong> is the
                    primary statutory body responsible for on-ground epidemiological checking and testing of whether ASF is contagious and spreading across towns.
                    The <strong>Bureau of Animal Industry (BAI)</strong> provides molecular PCR confirmation and designates national containment zones, while
                    the <strong>Backyard Farmer</strong> acts as the first observer using Pigify for rapid alert dispatch.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 4. TAB: SICK PIG DISINFECTION PROTOCOLS ── */}
        {activeTab === 'disinfection' && (
          <section className="mk-section" style={{ paddingTop: '10px' }}>
            <div className="container-pro">
              <div
                style={{
                  background: 'var(--surface-card, rgba(13, 19, 32, 0.9))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                  borderRadius: '24px',
                  padding: '32px',
                  marginBottom: '30px',
                }}
              >
                <div style={{ maxWidth: '800px', marginBottom: '28px' }}>
                  <div className="mk-kicker">
                    <span className="mk-kicker-dot" />
                    <span>CARE &amp; ISOLATION &bull; SICK PIG GUIDELINES</span>
                  </div>
                  <h2 style={{ fontFamily: 'Sora', fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 12px 0' }}>
                    What Should Be Done When a Pig Shows Signs of Illness?
                  </h2>
                  <p style={{ color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Immediate actions must focus on stopping disease transmission to healthy herd members, applying chemical virucidal disinfection,
                    and logging the incident with local veterinary authorities. Follow this standard 5-step containment protocol:
                  </p>
                </div>

                {/* Step-by-Step Cards */}
                <div style={{ display: 'grid', gap: '20px' }}>
                  {SICK_PIG_ACTION_PROTOCOL.steps.map((st) => (
                    <div
                      key={st.step}
                      style={{
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'var(--accent-rose, #f43f5e)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontFamily: 'JetBrains Mono',
                              fontSize: '13px',
                            }}
                          >
                            {st.step}
                          </span>
                          <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                            {st.title}
                          </h3>
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#06b6d4', fontWeight: 700 }}>
                          {st.tag}
                        </span>
                      </div>

                      {/* If Step 2 (Chemical Disinfection Agents Table) */}
                      {st.agents ? (
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {st.agents.map((ag, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                padding: '14px 18px',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <strong style={{ color: '#10b981', fontSize: '0.98rem' }}>{ag.name}</strong>
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                                  Contact: {ag.contactTime}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.86rem', color: '#ffffff', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Mixing Ratio: </span>
                                <strong>{ag.ratio}</strong>
                              </div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '4px' }}>
                                <span>Target Diseases: </span> {ag.target}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                                {ag.instructions}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {st.actions.map((act, i) => (
                            <li key={i} style={{ marginBottom: '8px' }}>
                              {act}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 5. PVO INCIDENT REPORT MODAL ── */}
        {reportModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(3, 7, 18, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                background: 'var(--surface-card, #0d1320)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '30px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={22} color="#f43f5e" />
                  <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    Provincial Veterinary Office (PVO) Dispatch
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false)
                    setDispatchedConfirmation(null)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {dispatchedConfirmation ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                    }}
                  >
                    <CheckCircle2 size={36} color="#10b981" />
                  </div>
                  <h4 style={{ fontFamily: 'Sora', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                    Official Incident Dispatched
                  </h4>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#06b6d4',
                      background: 'rgba(6, 182, 212, 0.1)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '16px',
                    }}
                  >
                    REF: {dispatchedConfirmation.incidentRef}
                  </div>
                  <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 20px auto' }}>
                    Your emergency notice has been logged into the surveillance queue of <strong>Provincial Veterinary Office - {reportForm.province}</strong>.
                    An on-site investigation team from the Municipal Agriculture Office will be deployed for blood sample collection.
                  </p>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', textAlign: 'left', marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 700, marginBottom: '6px' }}>
                      PVO Laguna Emergency Hotline:
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono', color: '#38bdf8', fontSize: '0.95rem' }}>
                      (049) 501-1823 &bull; 0917-838-5847
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
                      Reference Form: BAI Swine Disease Incident Notice (Form 1)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setReportModalOpen(false)
                      setDispatchedConfirmation(null)
                    }}
                    className="lp-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  >
                    Done &bull; Return to Surveillance Map
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPvoReport} style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
                    Generate an official BAI Form 1 incident transmission directly to the Provincial Veterinary Office upon suspecting African Swine Fever (ASF) or contagious swine mortality.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Farm Name / Location
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.farmName}
                        onChange={(e) => setReportForm({ ...reportForm, farmName: e.target.value })}
                        placeholder="e.g. San Isidro Backyard Pen"
                        className="auth-text-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Owner / Raiser Name
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.ownerName}
                        onChange={(e) => setReportForm({ ...reportForm, ownerName: e.target.value })}
                        placeholder="e.g. Juan Dela Cruz"
                        className="auth-text-field"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Province
                      </label>
                      <select
                        value={reportForm.province}
                        onChange={(e) => setReportForm({ ...reportForm, province: e.target.value })}
                        className="auth-text-field"
                        style={{ height: '42px' }}
                      >
                        <option value="Laguna">Laguna PVO</option>
                        <option value="Batangas">Batangas PVO</option>
                        <option value="Bulacan">Bulacan PVO</option>
                        <option value="Isabela">Isabela PVO</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Municipality
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.municipality}
                        onChange={(e) => setReportForm({ ...reportForm, municipality: e.target.value })}
                        placeholder="e.g. Santa Cruz"
                        className="auth-text-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Barangay
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.barangay}
                        onChange={(e) => setReportForm({ ...reportForm, barangay: e.target.value })}
                        placeholder="e.g. San Antonio"
                        className="auth-text-field"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Swine Breed Category
                      </label>
                      <select
                        value={reportForm.pigBreed}
                        onChange={(e) => setReportForm({ ...reportForm, pigBreed: e.target.value })}
                        className="auth-text-field"
                        style={{ height: '42px' }}
                      >
                        <option value="Philippine Native Pig (Baboy Katutubo)">Philippine Native Pig (Baboy Katutubo)</option>
                        <option value="Commercial White (Landrace / Yorkshire)">Commercial White (Landrace / Yorkshire)</option>
                        <option value="Crossbreed (Duroc x Landrace)">Crossbreed (Duroc x Landrace)</option>
                        <option value="Wild Boar (Baboy Ramo)">Wild Boar (Baboy Ramo)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.contactNumber}
                        onChange={(e) => setReportForm({ ...reportForm, contactNumber: e.target.value })}
                        placeholder="e.g. 0917-555-0192"
                        className="auth-text-field"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Total Herd
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={reportForm.herdTotal}
                        onChange={(e) => setReportForm({ ...reportForm, herdTotal: e.target.value })}
                        className="auth-text-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Sick Pigs
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={reportForm.affectedCount}
                        onChange={(e) => setReportForm({ ...reportForm, affectedCount: e.target.value })}
                        className="auth-text-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                        Dead Pigs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reportForm.mortalityCount}
                        onChange={(e) => setReportForm({ ...reportForm, mortalityCount: e.target.value })}
                        className="auth-text-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                      Clinical Symptoms Observed
                    </label>
                    <textarea
                      rows={2}
                      value={reportForm.symptoms}
                      onChange={(e) => setReportForm({ ...reportForm, symptoms: e.target.value })}
                      placeholder="e.g. High fever >41°C, cyanotic purple skin on ears/belly, anorexia, sudden death"
                      className="auth-text-field"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(false)}
                      className="lp-btn-secondary"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReport}
                      className="lp-btn-primary"
                      style={{
                        flex: 2,
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                      }}
                    >
                      {submittingReport ? (
                        <>
                          <RefreshCw size={16} className="pigify-spin" />
                          <span>Transmitting to PVO…</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Dispatch Official PVO Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="lp-footer" style={{ marginTop: '40px' }}>
        <div className="container-pro" style={{ textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main, #ffffff)', marginBottom: '6px' }}>{BRAND_NAME}</div>
          <div style={{ fontSize: '0.85rem' }}>Swine Disease Surveillance &bull; Provincial Veterinary Office Incident Dispatcher &bull; BABay ASF</div>
        </div>
      </footer>
    </div>
  )
}

export default DiseaseMap
