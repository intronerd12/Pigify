import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  RefreshCcw,
  ScanLine,
  Users,
  Clock3,
  CalendarClock,
  UserRound,
  MapPin,
  FileText,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  Filter,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import './ScannedItems.css';
import './Admin.css';

const AUTO_REFRESH_MS = 5000;

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatTimeOnly = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString();
};

const formatDateOnly = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString();
};

const getOperatorIdentity = (scan) => {
  const id = scan?.user?._id || scan?.user?.id || scan?.operatorEmail || scan?.operatorName || null;
  return id ? String(id) : null;
};

const getGradePill = (gradeRaw) => {
  const grade = String(gradeRaw || '').toUpperCase();
  if (grade === 'A') return { grade, label: 'Grade A', description: 'Healthy Baseline', className: 'si-grade si-grade-a' };
  if (grade === 'B') return { grade, label: 'Grade B', description: 'Mild Localized', className: 'si-grade si-grade-b' };
  if (grade === 'C') return { grade, label: 'Grade C', description: 'Moderate Watch', className: 'si-grade si-grade-c' };
  if (grade === 'D') return { grade, label: 'Grade D', description: 'Severe Action', className: 'si-grade si-grade-d' };
  if (grade === 'E') return { grade, label: 'Grade E', description: 'Quarantine Req.', className: 'si-grade si-grade-e' };
  return { grade: 'N/A', label: 'N/A', description: 'Unclassified', className: 'si-grade si-grade-na' };
};

const getSourceLabel = (sourceRaw) => {
  const source = String(sourceRaw || 'unspecified').trim().toLowerCase();
  if (source.includes('mobile')) return 'Mobile Pen Cam';
  if (source.includes('web')) return 'Web Diagnostic Lab';
  if (!source || source === 'unspecified') return 'Field Scanner';
  return sourceRaw;
};

const getSafeLocation = (locationValue) => {
  if (!locationValue) return 'Backyard Sty (Pen Area)';
  if (typeof locationValue === 'string') return locationValue;
  if (typeof locationValue === 'object') {
    const lat = locationValue.lat ?? locationValue.latitude;
    const lng = locationValue.lng ?? locationValue.longitude;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
  return 'Backyard Sty (Pen Area)';
};

const ScannedItems = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  const fetchScans = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [scansRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/scan`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/api/scan/stats`, { cache: 'no-store' }),
      ]);

      if (!scansRes.ok) {
        throw new Error('Failed to fetch scans');
      }

      const scansData = await scansRes.json();
      setScans(Array.isArray(scansData) ? scansData : []);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        setStats(null);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching scans:', error);
      if (!silent) {
        toast.error(error?.message || 'Error fetching scans');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
    const intervalId = setInterval(() => {
      fetchScans({ silent: true });
    }, AUTO_REFRESH_MS);

    return () => clearInterval(intervalId);
  }, [fetchScans]);

  const uniqueOperators = useMemo(
    () => new Set(scans.map((scan) => getOperatorIdentity(scan)).filter(Boolean)).size,
    [scans]
  );

  const gradeBreakdown = useMemo(() => {
    const seed = { A: 0, B: 0, C: 0, D: 0, E: 0, NA: 0 };
    scans.forEach((scan) => {
      const grade = String(scan?.grade || '').toUpperCase();
      if (grade === 'A' || grade === 'B' || grade === 'C' || grade === 'D' || grade === 'E') {
        seed[grade] += 1;
      } else {
        seed.NA += 1;
      }
    });
    return seed;
  }, [scans]);

  const sourceBreakdown = useMemo(() => {
    const bucket = {};
    scans.forEach((scan) => {
      const label = getSourceLabel(scan?.source || 'unspecified');
      bucket[label] = (bucket[label] || 0) + 1;
    });
    return Object.entries(bucket).sort((a, b) => b[1] - a[1]);
  }, [scans]);

  // Filtered scans
  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const grade = String(scan?.grade || '').toUpperCase();
      if (gradeFilter !== 'ALL' && grade !== gradeFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const condition = String(scan?.swine_condition || scan?.details || scan?.fruitType || '').toLowerCase();
      const operator = String(scan?.operatorName || scan?.user?.name || '').toLowerCase();
      const pen = String(scan?.pen_id || scan?.penId || '').toLowerCase();
      return condition.includes(q) || operator.includes(q) || pen.includes(q);
    });
  }, [scans, gradeFilter, searchQuery]);

  return (
    <div className="si-page admin-shell-page">
      {/* Hero Header */}
      <section className="si-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="admin-hero-badge">Swine Telemetry Feed</span>
            <span className="admin-meta-tag">
              <span className="telemetry-pulse" />
              AUTO-POLL 5S
            </span>
          </div>
          <h1 className="si-title">Herd Scan Telemetry</h1>
          <p className="si-subtitle">
            Centralized clinical log of all swine pen inspections, dermatological lesion detections, and severity triage classifications.
          </p>
          <div className="si-meta">
            <span>Last sync: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Connecting...'}</span>
            <span>·</span>
            <span>Total records: {scans.length}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchScans()}
          disabled={loading || refreshing}
          className="si-refresh-btn"
        >
          <RefreshCcw size={15} className={refreshing ? 'si-spin' : ''} />
          <span>{refreshing ? 'Polling...' : 'Sync Feed'}</span>
        </button>
      </section>

      {/* KPI Stats Grid */}
      {!loading && scans.length > 0 && (
        <section className="si-stats-grid">
          <article className="si-stat-card">
            <div className="si-stat-top">
              <span className="si-stat-label">Total Herd Scans</span>
              <span className="si-stat-icon">
                <ScanLine size={16} />
              </span>
            </div>
            <div className="si-stat-value">{stats?.total || scans.length}</div>
          </article>

          <article className="si-stat-card">
            <div className="si-stat-top">
              <span className="si-stat-label">Farm Operators</span>
              <span className="si-stat-icon">
                <Users size={16} />
              </span>
            </div>
            <div className="si-stat-value">{uniqueOperators}</div>
          </article>

          <article className="si-stat-card">
            <div className="si-stat-top">
              <span className="si-stat-label">Last Inspection</span>
              <span className="si-stat-icon">
                <Clock3 size={16} />
              </span>
            </div>
            <div className="si-stat-value si-stat-value-sm">
              {formatDateTime(scans[0]?.timestamp || scans[0]?.createdAt)}
            </div>
          </article>

          <article className="si-stat-card">
            <div className="si-stat-top">
              <span className="si-stat-label">Healthy Baseline %</span>
              <span className="si-stat-icon">
                <ShieldCheck size={16} />
              </span>
            </div>
            <div className="si-stat-value" style={{ color: '#34d399' }}>
              {scans.length > 0
                ? `${Math.round((gradeBreakdown.A / scans.length) * 100)}%`
                : '0%'}
            </div>
          </article>
        </section>
      )}

      {/* Filters & Triage Toolbar */}
      {!loading && scans.length > 0 && (
        <section className="si-toolbar">
          <div className="si-toolbar-group">
            <span className="si-toolbar-label">Triage Filter:</span>
            <div className="si-chip-row">
              {['ALL', 'A', 'B', 'C', 'D', 'E'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGradeFilter(g)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: gradeFilter === g ? '#15223c' : 'rgba(255,255,255,0.03)',
                    border: gradeFilter === g ? '1px solid #10b981' : '1px solid var(--admin-border-subtle)',
                    color: gradeFilter === g ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {g === 'ALL' ? 'All Grades' : `Grade ${g} (${gradeBreakdown[g] || 0})`}
                </button>
              ))}
            </div>
          </div>

          <div className="si-toolbar-group">
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search condition or pen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: '7px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--admin-border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="si-empty-card">
          <RefreshCcw size={28} className="si-spin" style={{ color: '#10b981', marginBottom: '14px' }} />
          <div className="si-empty-title">Loading swine diagnostic feed...</div>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="si-empty-card">
          <div className="si-empty-title">No matching scan telemetry records found</div>
          <div className="si-empty-desc">
            Scans performed on the mobile pen app or web diagnostic scanner will appear here with clinical symptoms, severity grading, and quarantine status.
          </div>
        </div>
      ) : (
        <div className="si-table-shell">
          <table className="si-table">
            <thead>
              <tr>
                <th>Timestamp & Pen</th>
                <th>Severity Triage</th>
                <th>Swine Condition & Clinical Notes</th>
                <th>Backyard Farm & Operator</th>
                <th>Location</th>
                <th>Telemetry Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan) => {
                const pill = getGradePill(scan.grade);
                const operatorName = scan?.user?.name || scan?.operatorName || 'Backyard Raiser';
                const operatorEmail = scan?.user?.email || scan?.operatorEmail || '-';

                // Display condition cleanly, fallback if legacy fruitType existed
                const rawCondition = scan?.swine_condition || scan?.details || scan?.fruitType || 'Healthy Dermis Baseline';
                const displayCondition = rawCondition.toLowerCase().includes('dragon') || rawCondition.toLowerCase().includes('fruit')
                  ? 'Swine Dermal Inspection (Healthy)'
                  : rawCondition;

                const scanNotes = scan?.details && scan?.details !== rawCondition
                  ? scan.details
                  : 'Clinical symptoms logged via deep learning vision model';

                const penLabel = scan?.pen_id || scan?.penId || 'Pen #1';
                const created = scan.timestamp || scan.createdAt;

                return (
                  <tr key={scan._id || scan.id || `${scan?.timestamp || ''}-${scan?.operatorEmail || ''}`}>
                    <td>
                      <div className="si-cell-stack">
                        <div className="si-cell-primary">
                          <CalendarClock size={13} style={{ color: '#64748b' }} />
                          <span>{formatDateOnly(created)}</span>
                          <span className="admin-pen-pill">{penLabel}</span>
                        </div>
                        <div className="si-cell-secondary" style={{ fontFamily: 'var(--admin-font-mono)' }}>
                          {formatTimeOnly(created)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="si-cell-stack">
                        <span className={pill.className}>
                          {pill.label}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {pill.description}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="si-cell-stack" style={{ maxWidth: '380px' }}>
                        <div className="si-cell-primary" style={{ color: '#e2e8f0' }}>
                          <Stethoscope size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
                          <span style={{ fontWeight: 700 }}>{displayCondition}</span>
                        </div>
                        <div className="si-cell-secondary si-notes">
                          {scanNotes}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="si-cell-stack">
                        <div className="si-cell-primary">
                          <UserRound size={13} style={{ color: '#64748b' }} />
                          {operatorName}
                        </div>
                        <div className="si-cell-secondary" style={{ fontSize: '0.75rem' }}>
                          {operatorEmail}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="si-cell-primary" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        <MapPin size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                        {getSafeLocation(scan.location)}
                      </div>
                    </td>
                    <td>
                      <span className="si-source-pill">
                        <Smartphone size={11} />
                        {getSourceLabel(scan.source)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScannedItems;
