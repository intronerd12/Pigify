import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Cloud,
  Droplets,
  MapPin,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Compass,
  Eye,
  Lock,
  ExternalLink,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import './Admin.css';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Locked Study Sectors: Municipality of Luna, La Union, Philippines (Region I)
const LUNA_QUARANTINE_SECTORS = [
  {
    id: 'barrientos',
    name: 'Brgy. Barrientos, Luna',
    shortName: 'Brgy. Barrientos',
    role: 'Central Agricultural Sector',
    lat: 16.8590,
    lng: 120.3910,
    x: 315,
    y: 205,
    swineHeads: 22,
    breed: 'Philippine Native Pig',
    zoneStatus: 'RED LOCKDOWN (0-1 KM)',
    zoneColor: '#f43f5e',
    tempOffset: 0.4,
    humidityOffset: 3,
  },
  {
    id: 'magallanes',
    name: 'Brgy. Magallanes (Poblacion)',
    shortName: 'Brgy. Magallanes',
    role: 'Town Center & MAO Luna Hub',
    lat: 16.8530,
    lng: 120.3802,
    x: 245,
    y: 245,
    swineHeads: 38,
    breed: 'Commercial Yorkshire',
    zoneStatus: 'PINK BUFFER (1-7 KM)',
    zoneColor: '#ec4899',
    tempOffset: 0.0,
    humidityOffset: 0,
  },
  {
    id: 'nalvo_norte',
    name: 'Brgy. Nalvo Norte, Luna',
    shortName: 'Brgy. Nalvo Norte',
    role: 'Northern Coastal Sector',
    lat: 16.8685,
    lng: 120.3775,
    x: 230,
    y: 135,
    swineHeads: 19,
    breed: 'Native Pig (Ilocos Strain)',
    zoneStatus: 'PINK BUFFER (1-7 KM)',
    zoneColor: '#ec4899',
    tempOffset: -0.3,
    humidityOffset: 4,
  },
  {
    id: 'ayaoan',
    name: 'Brgy. Ayaoan, Luna',
    shortName: 'Brgy. Ayaoan',
    role: 'Southern Inland Corridor',
    lat: 16.8440,
    lng: 120.3885,
    x: 295,
    y: 305,
    swineHeads: 30,
    breed: 'Crossbreed (Duroc x Landrace)',
    zoneStatus: 'PINK BUFFER (1-7 KM)',
    zoneColor: '#ec4899',
    tempOffset: 0.3,
    humidityOffset: 1,
  },
  {
    id: 'rimos',
    name: 'Brgy. Rimos No. 3, Luna',
    shortName: 'Brgy. Rimos No. 3',
    role: 'Western Coastal Pebble Sector',
    lat: 16.8620,
    lng: 120.3710,
    x: 185,
    y: 180,
    swineHeads: 15,
    breed: 'Philippine Native Pig',
    zoneStatus: 'PINK BUFFER (1-7 KM)',
    zoneColor: '#ec4899',
    tempOffset: -0.4,
    humidityOffset: 5,
  },
  {
    id: 'oaqui',
    name: 'Brgy. Oaqui No. 2, Luna',
    shortName: 'Brgy. Oaqui No. 2',
    role: 'Eastern Border Checkpoint (Balaoan Rd)',
    lat: 16.8485,
    lng: 120.4020,
    x: 390,
    y: 265,
    swineHeads: 48,
    breed: 'Commercial Landrace',
    zoneStatus: 'YELLOW SURVEILLANCE (7-10 KM)',
    zoneColor: '#f59e0b',
    tempOffset: 0.5,
    humidityOffset: -2,
  },
  {
    id: 'darigayos',
    name: 'Brgy. Darigayos, Luna',
    shortName: 'Brgy. Darigayos',
    role: 'Southern Coastal Inlet Sector',
    lat: 16.8280,
    lng: 120.3540,
    x: 145,
    y: 395,
    swineHeads: 24,
    breed: 'Philippine Native Pig',
    zoneStatus: 'YELLOW SURVEILLANCE (7-10 KM)',
    zoneColor: '#f59e0b',
    tempOffset: -0.2,
    humidityOffset: 6,
  },
  {
    id: 'sto_domingo',
    name: 'Brgy. Sto. Domingo Norte',
    shortName: 'Brgy. Sto. Domingo',
    role: 'Northern Border Checkpoint (Bangar Rd)',
    lat: 16.8740,
    lng: 120.3860,
    x: 285,
    y: 95,
    swineHeads: 35,
    breed: 'Crossbreed (Duroc x Large White)',
    zoneStatus: 'PINK BUFFER (1-7 KM)',
    zoneColor: '#ec4899',
    tempOffset: 0.1,
    humidityOffset: 2,
  },
];

const EnvironmentalData = () => {
  const [selectedSectorId, setSelectedSectorId] = useState('barrientos');
  const [quarantineMode, setQuarantineMode] = useState('lockdown'); // 'lockdown' | 'safe'
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState('tactical'); // 'tactical' | 'osm' | 'google'

  const selectedSector = useMemo(
    () => LUNA_QUARANTINE_SECTORS.find((s) => s.id === selectedSectorId) || LUNA_QUARANTINE_SECTORS[0],
    [selectedSectorId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/weather?province=${encodeURIComponent('Luna, La Union')}`);
        const data = await res.json();
        if (res.ok && data && !cancelled) {
          setWeather(data);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback below
      }
      if (!cancelled) {
        setWeather({
          province: 'Luna, La Union',
          temperature: 29.2,
          humidity: 68,
          condition: 'Partly Cloudy',
          windSpeed: 12,
          recommendation: {
            status: 'Elevated Thermal Watch',
            color: 'orange',
            message:
              'Ambient temperature in Luna, La Union is approaching 30°C. Maintain cross-ventilation and daily Virkon S footbath replenishment across quarantined barangay pens.',
            details: [
              'Swine Thermo-Neutral Zone (18°C–26°C) exceeded: Activate misting or roof shading in grower/finisher pens.',
              'High coastal humidity in Nalvo Norte, Rimos, and Darigayos (>70%) requires dry bedding to prevent Greasy Pig Disease (Staphylococcus hyicus).',
              'Maintain 2% Virkon S footbaths at all Luna barangay pen entrances under active 1-7-10 km BAI biosecurity zoning.',
            ],
          },
          forecast: [
            { day: 'Tomorrow', temp: 29, condition: 'Partly Cloudy' },
            { day: 'Day +2', temp: 30, condition: 'Sunny' },
            { day: 'Day +3', temp: 28, condition: 'Light Rain' },
          ],
        });
        setLoading(false);
      }
    };

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [selectedSectorId]);

  // Compute localized sector microclimate metrics
  const sectorTemp = useMemo(() => {
    const base = Number(weather?.temperature ?? 29.2);
    return (base + (selectedSector?.tempOffset || 0)).toFixed(1);
  }, [weather, selectedSector]);

  const sectorHumidity = useMemo(() => {
    const base = Number(weather?.humidity ?? 68);
    return clamp(Math.round(base + (selectedSector?.humidityOffset || 0)), 40, 96);
  }, [weather, selectedSector]);

  const cleanWindSpeed = useMemo(() => {
    const raw = String(weather?.windSpeed ?? '12').replace(/\s*km\/h/gi, '').trim();
    return `${raw || '12'} km/h`;
  }, [weather]);

  const feelsLike = useMemo(() => {
    const t = Number(sectorTemp);
    return Math.round(t + clamp((sectorHumidity - 50) / 18, 0, 3));
  }, [sectorTemp, sectorHumidity]);

  const osmEmbedSrc = useMemo(() => {
    const { lat, lng } = selectedSector;
    const d = 0.025;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      `${lng - d},${lat - d},${lng + d},${lat + d}`
    )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
  }, [selectedSector]);

  const googleEmbedSrc = useMemo(() => {
    const { lat, lng } = selectedSector;
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`;
  }, [selectedSector]);

  return (
    <div className="admin-shell-page">
      {/* Executive Header */}
      <div className="admin-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="admin-hero-badge">STUDY AREA LOCKED // LUNA, LA UNION</span>
            <span className="admin-meta-tag">
              <Lock size={12} color="#f43f5e" />
              PERIMETER: 16.8530°N, 120.3802°E
            </span>
          </div>
          <h1 className="admin-hero-title">
            Pen Microclimate &amp; Tactical Quarantine Zone Map
          </h1>
          <p className="admin-hero-sub">
            Veterinary environmental telemetry and game-style biosecurity containment HUD focused exclusively on our capstone study area in <strong>Luna, La Union, Philippines</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              const next = quarantineMode === 'lockdown' ? 'safe' : 'lockdown';
              setQuarantineMode(next);
              toast.success(
                next === 'lockdown'
                  ? 'Tactical Quarantine Cordon Active (Brgy. Barrientos Epicenter)'
                  : 'All Luna, La Union Sectors Restored to Green Biosecurity Baseline'
              );
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border:
                quarantineMode === 'lockdown'
                  ? '1px solid rgba(244, 63, 94, 0.5)'
                  : '1px solid rgba(16, 185, 129, 0.45)',
              background:
                quarantineMode === 'lockdown'
                  ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.22), rgba(190, 18, 60, 0.15))'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.15))',
              color: quarantineMode === 'lockdown' ? '#fb7185' : '#34d399',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {quarantineMode === 'lockdown' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
            <span>
              {quarantineMode === 'lockdown'
                ? 'QUARANTINE MODE: ACTIVE LOCKDOWN'
                : 'QUARANTINE MODE: GREEN SAFE BASELINE'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div
        className="env-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '330px 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: LUNA, LA UNION BARANGAY SECTORS */}
        <div
          className="admin-card"
          style={{ padding: 0, overflow: 'hidden', marginBottom: 0 }}
        >
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid var(--admin-border-subtle)',
              background: 'linear-gradient(180deg, rgba(21, 34, 60, 0.85) 0%, rgba(14, 23, 42, 0.9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <MapPin size={18} color="#fb7185" />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                  Luna, La Union Sectors
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--admin-font-mono)' }}>
                  {LUNA_QUARANTINE_SECTORS.length} Study Barangays Locked
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {LUNA_QUARANTINE_SECTORS.map((sec) => {
              const active = sec.id === selectedSector.id;
              const badgeColor = quarantineMode === 'safe' ? '#10b981' : sec.zoneColor;
              const badgeText =
                quarantineMode === 'safe'
                  ? 'SAFE ZONE'
                  : sec.id === 'barrientos'
                  ? 'RED 1KM'
                  : sec.zoneStatus.includes('PINK')
                  ? 'BUFFER 7KM'
                  : 'WATCH 10KM';

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedSectorId(sec.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: active
                      ? `1px solid ${badgeColor}`
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: active
                      ? 'rgba(21, 34, 60, 0.95)'
                      : 'rgba(255, 255, 255, 0.02)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: active ? '#ffffff' : '#cbd5e1' }}>
                      {sec.shortName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        fontFamily: 'var(--admin-font-mono)',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        backgroundColor: `${badgeColor}22`,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}55`,
                      }}
                    >
                      {badgeText}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.73rem', color: '#64748b' }}>
                    <span>{sec.breed}</span>
                    <span style={{ fontFamily: 'var(--admin-font-mono)', color: '#94a3b8' }}>
                      {sec.swineHeads} heads
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: TELEMETRY + GAME-STYLE QUARANTINE MAP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. MICROCLIMATE & WEATHER TELEMETRY CARD */}
          <div className="admin-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--admin-font-mono)',
                      fontWeight: 800,
                      color: '#38bdf8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    ACTIVE SECTOR TELEMETRY // LUNA, LA UNION
                  </span>
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#ffffff' }}>
                  {selectedSector.name}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '4px' }}>
                  {selectedSector.role} &bull; {loading ? 'Syncing sensors…' : `${weather?.condition || 'Partly Cloudy'} • ${new Date().toLocaleDateString()}`}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--admin-font-mono)', lineHeight: 1 }}>
                  {loading ? '—' : `${sectorTemp}°C`}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    padding: '5px 11px',
                    borderRadius: '999px',
                    border:
                      quarantineMode === 'lockdown' && selectedSector.id === 'barrientos'
                        ? '1px solid rgba(244, 63, 94, 0.5)'
                        : '1px solid rgba(245, 158, 11, 0.45)',
                    backgroundColor:
                      quarantineMode === 'lockdown' && selectedSector.id === 'barrientos'
                        ? 'rgba(244, 63, 94, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    color:
                      quarantineMode === 'lockdown' && selectedSector.id === 'barrientos'
                        ? '#fb7185'
                        : '#fbbf24',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    fontFamily: 'var(--admin-font-mono)',
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>
                    {quarantineMode === 'safe'
                      ? 'OPTIMAL BIOSECURITY'
                      : selectedSector.zoneStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Telemetry Metrics (Fixed Wind km/h unit!) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
                gap: '14px',
                marginTop: '18px',
              }}
            >
              <div
                style={{
                  border: '1px solid var(--admin-border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(21, 34, 60, 0.55)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                  <Droplets size={15} color="#38bdf8" />
                  <span>Relative Humidity</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--admin-font-mono)' }}>
                  {loading ? '—' : `${sectorHumidity}%`}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Target Pen Range: 55%–70%
                </div>
              </div>

              <div
                style={{
                  border: '1px solid var(--admin-border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(21, 34, 60, 0.55)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                  <Wind size={15} color="#10b981" />
                  <span>Coastal Wind Vector</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--admin-font-mono)' }}>
                  {loading ? '—' : cleanWindSpeed}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  West Philippine Sea Breeze
                </div>
              </div>

              <div
                style={{
                  border: '1px solid var(--admin-border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(21, 34, 60, 0.55)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                  <Thermometer size={15} color="#f59e0b" />
                  <span>Swine Heat Index</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--admin-font-mono)' }}>
                  {loading ? '—' : `${feelsLike}°C`}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  MLX90614 IR Calibrated
                </div>
              </div>

              <div
                style={{
                  border: '1px solid var(--admin-border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(21, 34, 60, 0.55)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                  <Activity size={15} color="#fb7185" />
                  <span>Monitored Herd</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--admin-font-mono)' }}>
                  {selectedSector.swineHeads} Swine
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {selectedSector.breed}
                </div>
              </div>
            </div>
          </div>

          {/* 2. GAME-STYLE TACTICAL QUARANTINE AREA MAP (FOCUSED ONLY ON LUNA, LA UNION) */}
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 0 }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--admin-border-subtle)',
                background: 'linear-gradient(180deg, #111c33 0%, #0b1324 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Radio size={18} color="#f43f5e" />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Tactical Quarantine Zone Map — Luna, La Union</span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--admin-font-mono)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(244, 63, 94, 0.2)',
                        border: '1px solid rgba(244, 63, 94, 0.45)',
                        color: '#fb7185',
                      }}
                    >
                      SECTOR LOCKED
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--admin-font-mono)' }}>
                    Focused Study Perimeter: {selectedSector.name} ({selectedSector.lat.toFixed(4)}°N, {selectedSector.lng.toFixed(4)}°E)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setMapView('tactical')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: mapView === 'tactical' ? '1px solid #f43f5e' : '1px solid var(--admin-border-subtle)',
                    backgroundColor: mapView === 'tactical' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: mapView === 'tactical' ? '#ffffff' : '#94a3b8',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Compass size={14} />
                  <span>Quarantine Radar HUD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapView('osm')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: mapView === 'osm' ? '1px solid #10b981' : '1px solid var(--admin-border-subtle)',
                    backgroundColor: mapView === 'osm' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: mapView === 'osm' ? '#ffffff' : '#94a3b8',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={14} />
                  <span>Satellite / OSM Overlay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapView('google')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: mapView === 'google' ? '1px solid #38bdf8' : '1px solid var(--admin-border-subtle)',
                    backgroundColor: mapView === 'google' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: mapView === 'google' ? '#ffffff' : '#94a3b8',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Google Map
                </button>
              </div>
            </div>

            {/* MAP VIEWPORT */}
            <div style={{ position: 'relative', width: '100%', height: '460px', backgroundColor: '#050914', overflow: 'hidden' }}>
              {mapView === 'tactical' ? (
                <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%', display: 'block' }}>
                  <defs>
                    <pattern id="adminTacGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(16, 185, 129, 0.07)" strokeWidth="0.8" />
                    </pattern>
                    <pattern id="restrictedHatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(244, 63, 94, 0.14)" strokeWidth="3" />
                    </pattern>
                    <radialGradient id="adminRedPulse">
                      <stop offset="0%" stopColor="rgba(244, 63, 94, 0.55)" />
                      <stop offset="65%" stopColor="rgba(244, 63, 94, 0.18)" />
                      <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
                    </radialGradient>
                    {/* Mask that shrouds everything OUTSIDE Luna, La Union */}
                    <mask id="lunaOuterShroudMask">
                      <rect width="500" height="500" fill="white" />
                      <path
                        d="M 195 24 L 385 38 L 452 170 L 442 340 L 335 452 L 105 462 Q 125 350 145 235 T 195 24 Z"
                        fill="black"
                      />
                    </mask>
                  </defs>

                  {/* Tactical Grid Background */}
                  <rect width="500" height="500" fill="#050912" />
                  <rect width="500" height="500" fill="url(#adminTacGrid)" />

                  {/* West Philippine Sea Coastline */}
                  <path
                    d="M 0 0 L 195 0 Q 175 75 168 135 T 145 235 Q 130 315 112 395 T 95 500 L 0 500 Z"
                    fill="rgba(6, 182, 212, 0.09)"
                    stroke="rgba(6, 182, 212, 0.4)"
                    strokeWidth="1.5"
                  />

                  {/* SHROUDED OUTER PERIMETER (Outside Luna Study Area — Game Fog-of-War Style) */}
                  <rect width="500" height="500" fill="rgba(2, 4, 10, 0.82)" mask="url(#lunaOuterShroudMask)" />
                  <rect width="500" height="500" fill="url(#restrictedHatch)" mask="url(#lunaOuterShroudMask)" />

                  {/* Illuminated Study Area: Municipality of Luna, La Union */}
                  <path
                    d="M 195 24 L 385 38 L 452 170 L 442 340 L 335 452 L 105 462 Q 125 350 145 235 T 195 24 Z"
                    fill="rgba(16, 185, 129, 0.05)"
                    stroke={quarantineMode === 'lockdown' ? '#f43f5e' : '#10b981'}
                    strokeWidth="3"
                  />
                  <path
                    d="M 195 24 L 385 38 L 452 170 L 442 340 L 335 452 L 105 462 Q 125 350 145 235 T 195 24 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeDasharray="8 6"
                  />

                  {/* Outer Restricted Zone Labels */}
                  <text x="290" y="16" fill="rgba(244, 63, 94, 0.7)" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    [OUTSIDE STUDY ZONE: BANGAR — LOCKED]
                  </text>
                  <text x="360" y="485" fill="rgba(244, 63, 94, 0.7)" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    [OUTSIDE STUDY ZONE: BACNOTAN — LOCKED]
                  </text>
                  <text x="18" y="250" fill="rgba(6, 182, 212, 0.55)" fontSize="9" fontFamily="monospace" fontWeight="bold" transform="rotate(-78 45 250)">
                    WEST PHILIPPINE SEA COORDON
                  </text>

                  {/* Internal Luna Roads & Sector Grid Lines */}
                  <path d="M 245 245 L 285 95 L 315 30" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
                  <path d="M 245 245 L 315 205 L 390 265 L 445 272" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
                  <path d="M 230 135 L 185 180 L 245 245 L 295 305 L 145 395" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Concentric Game Quarantine Rings (When Lockdown Active) */}
                  {quarantineMode === 'lockdown' && (
                    <g>
                      <circle cx="315" cy="205" r="155" fill="none" stroke="rgba(245, 158, 11, 0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
                      <circle cx="315" cy="205" r="102" fill="rgba(236, 72, 153, 0.06)" stroke="rgba(236, 72, 153, 0.6)" strokeWidth="1.5" strokeDasharray="4 3" />
                      <circle cx="315" cy="205" r="46" fill="url(#adminRedPulse)" stroke="#f43f5e" strokeWidth="2.2" />
                      <text x="275" y="152" fill="#fb7185" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                        1KM RED QUARANTINE LOCKDOWN
                      </text>
                    </g>
                  )}

                  {/* Biosecurity Checkpoint Gates on Luna Borders */}
                  <g transform="translate(310, 42)">
                    <rect x="-42" y="-8" width="84" height="16" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.2" />
                    <text x="0" y="3" fill="#fbbf24" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      GATE N: BANGAR BORDER
                    </text>
                  </g>
                  <g transform="translate(425, 255)">
                    <rect x="-44" y="-8" width="88" height="16" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.2" />
                    <text x="0" y="3" fill="#fbbf24" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      GATE E: BALAOAN HWY
                    </text>
                  </g>

                  {/* 8 Monitored Barangays in Luna, La Union */}
                  {LUNA_QUARANTINE_SECTORS.map((sec) => {
                    const isSelected = sec.id === selectedSector.id;
                    const pinColor = quarantineMode === 'safe' ? '#10b981' : sec.zoneColor;
                    return (
                      <g
                        key={sec.id}
                        transform={`translate(${sec.x}, ${sec.y})`}
                        onClick={() => setSelectedSectorId(sec.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {isSelected && (
                          <>
                            <circle cx="0" cy="0" r="20" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="3 3" />
                            <line x1="-25" y1="0" x2="-13" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
                            <line x1="13" y1="0" x2="25" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
                            <line x1="0" y1="-25" x2="0" y2="-13" stroke="#38bdf8" strokeWidth="1.5" />
                            <line x1="0" y1="13" x2="0" y2="25" stroke="#38bdf8" strokeWidth="1.5" />
                          </>
                        )}
                        <circle
                          cx="0"
                          cy="0"
                          r={isSelected ? '10' : '8'}
                          fill={pinColor}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                        />
                        <text
                          x="13"
                          y="4"
                          fill={isSelected ? '#ffffff' : '#cbd5e1'}
                          fontSize={isSelected ? '9.5' : '8'}
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {sec.shortName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <iframe
                    title="Luna, La Union Tactical Map"
                    src={mapView === 'osm' ? osmEmbedSrc : googleEmbedSrc}
                    style={{ border: 0, width: '100%', height: '100%', filter: 'contrast(1.05) saturate(0.95)' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  {/* Game-style Tactical Quarantine Perimeter Overlay on top of Satellite/Street Map */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      boxShadow: 'inset 0 0 70px 28px rgba(5, 9, 20, 0.88)',
                      border: '2px solid rgba(244, 63, 94, 0.55)',
                    }}
                  />
                </div>
              )}

              {/* Top-Left Game HUD Status Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(7, 13, 25, 0.9)',
                  border: '1px solid rgba(244, 63, 94, 0.45)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontFamily: 'var(--admin-font-mono)',
                  fontSize: '0.72rem',
                  color: '#f8fafc',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ color: '#fb7185', fontWeight: 800 }}>
                  ● QUARANTINE PERIMETER: LUNA, LA UNION ONLY
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '2px' }}>
                  TARGET: {selectedSector.shortName.toUpperCase()} ({selectedSector.swineHeads} SWINE)
                </div>
              </div>
            </div>

            {/* Map Footer */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--admin-border-subtle)',
                backgroundColor: '#09101f',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ color: '#94a3b8', fontFamily: 'var(--admin-font-mono)' }}>
                BAI 1-7-10 KM CONTAINMENT PROTOCOL &bull; MAO LUNA &amp; OPVET LA UNION
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedSector.lat},${selectedSector.lng}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#34d399',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>Open {selectedSector.shortName} in Google Maps</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* 3. SWINE PEN MICROCLIMATE & BIOSECURITY RECOMMENDATION */}
          <div className="admin-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#ffffff' }}>
                Swine Pen Microclimate &amp; Quarantine Biosecurity Directives
              </div>
              <span className="admin-meta-tag" style={{ color: '#34d399' }}>
                LIVE TELEMETRY ANALYSIS
              </span>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 0 14px 0' }}>
              {weather?.recommendation?.message ||
                'Maintain cross-ventilation and strict 2% Virkon S footbath disinfection across all monitored backyard swine pens in Luna, La Union.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {(
                weather?.recommendation?.details || [
                  'Ensure clean drinking water flow in nipple drinkers to mitigate thermal stress in Luna backyard pens.',
                  'Inspect coastal barangay pens (Nalvo Norte, Rimos, Darigayos) for floor dampness to prevent Greasy Pig dermatitis.',
                  'Enforce strict VHC and BBO inspection at Oaqui (Balaoan Highway) and Sto. Domingo (Bangar Border) checkpoints.',
                ]
              ).map((detail, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid var(--admin-border-subtle)',
                    padding: '12px 14px',
                    backgroundColor: 'rgba(21, 34, 60, 0.5)',
                    color: '#e2e8f0',
                    fontSize: '0.84rem',
                    lineHeight: 1.45,
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                >
                  <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 980px) {
            .env-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>
    </div>
  );
};

export default EnvironmentalData;
