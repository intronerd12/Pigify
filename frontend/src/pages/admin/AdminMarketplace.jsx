import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Filter,
  Plus,
  Package,
  AlertTriangle,
  Stethoscope,
  Pill,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import './Admin.css';

function AdminMarketplace() {
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const PRODUCTS = useMemo(
    () => [
      {
        id: 1,
        name: 'Amitraz 12.5% Acaricide Spray',
        category: 'Ectoparasiticide',
        price: 480,
        stock: 45,
        unit: '1000ml Bottle',
        indication: 'Targeted eradication of Sarcoptic Mange (Sarcoptes scabiei var. suis) and lice',
        status: 'In Stock',
        protocol: 'Dilute 1:500 in clean water; spray ear folds and sty posts thoroughly',
      },
      {
        id: 2,
        name: 'Povidone Iodine 10% Dermal Wash',
        category: 'Antiseptic',
        price: 320,
        stock: 80,
        unit: '500ml Bottle',
        indication: 'Topical disinfection for Exudative Epidermitis (Greasy Pig Disease) & abrasions',
        status: 'In Stock',
        protocol: 'Apply directly to washed crusty dermis after gentle warm-water cleansing',
      },
      {
        id: 3,
        name: 'Oxytetracycline 200mg/ml LA',
        category: 'Antimicrobial',
        price: 650,
        stock: 35,
        unit: '100ml Vial',
        indication: 'Broad-spectrum deep systemic therapy for severe bacterial skin & respiratory infections',
        status: 'Prescription Req.',
        protocol: 'Deep intramuscular injection; observe 28-day meat withdrawal period',
      },
      {
        id: 4,
        name: 'Agricultural Hydrated Lime (Sty Grade)',
        category: 'Biosecurity Reagent',
        price: 190,
        stock: 120,
        unit: '25kg Sack',
        indication: 'Pen floor whitewashing, moisture absorption, and pathogen spore elimination',
        status: 'In Stock',
        protocol: 'Dust dry concrete pen floors or prepare whitewash slurry for pen walls',
      },
      {
        id: 5,
        name: 'Oral Electrolyte & Heat Stress Salts',
        category: 'Supportive Care',
        price: 240,
        stock: 65,
        unit: '1kg Pouch',
        indication: 'Rehydration and heat stress mitigation during high Temperature-Humidity Index (THI)',
        status: 'In Stock',
        protocol: 'Mix 20g per 10 liters of drinking water during hot noon periods',
      },
      {
        id: 6,
        name: 'Virkon S Broad-Spectrum Disinfectant',
        category: 'Biosecurity Reagent',
        price: 1450,
        stock: 18,
        unit: '5kg Tub',
        indication: 'Hospital-grade viral and bacterial barrier footbath at backyard pen entrances',
        status: 'Low Stock',
        protocol: '1% solution (10g per 1L); change footbaths every 48 hours or when soiled',
      },
      {
        id: 7,
        name: 'Sterile Veterinary Syringe Kit',
        category: 'Administration Tools',
        price: 380,
        stock: 90,
        unit: 'Box of 50 (16G/18G)',
        indication: 'Single-use hygienic medication and vitamin administration',
        status: 'In Stock',
        protocol: 'Use distinct needle per pig to prevent blood-borne pathogen cross-contamination',
      },
      {
        id: 8,
        name: 'Iron Dextran 100mg Injectable',
        category: 'Supportive Care',
        price: 420,
        stock: 50,
        unit: '100ml Vial',
        indication: 'Prevention of secondary anemia and immune suppression in suckling piglets',
        status: 'In Stock',
        protocol: 'Administer 1ml IM behind ear on day 3 of piglet life',
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = PRODUCTS;

    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.indication.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (filterCategory) {
      result = result.filter((p) => p.category === filterCategory);
    }

    return result;
  }, [PRODUCTS, query, filterCategory]);

  const categories = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.category))), [PRODUCTS]);

  return (
    <div className="admin-shell-page">
      {/* Hero Header */}
      <section className="admin-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="admin-hero-badge">Veterinary Inventory</span>
            <span className="admin-meta-tag">
              <span className="telemetry-pulse" />
              BIOSECURITY DISPENSARY ACTIVE
            </span>
          </div>
          <h1 className="admin-hero-title">
            <ShieldCheck size={26} color="#34d399" />
            Biosecurity Dispensary & Inventory
          </h1>
          <p className="admin-hero-sub">
            Essential veterinary supplies, topical antiseptic washes, acaricide sprays, and pen sanitization reagents for backyard swine sties.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('New inventory batch registration requires authorized veterinary sign-off.')}
          className="admin-btn-primary"
        >
          <Plus size={16} />
          <span>Add Supply Batch</span>
        </button>
      </section>

      {/* KPI Stats */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Active Formulations</div>
            <div className="admin-kpi-value">{PRODUCTS.length}</div>
            <div className="admin-kpi-sub">Across 5 clinical categories</div>
          </div>
          <div className="admin-kpi-icon" style={{ backgroundColor: '#10b981' }}>
            <Pill size={22} color="#fff" />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Total Units on Hand</div>
            <div className="admin-kpi-value">
              {PRODUCTS.reduce((sum, p) => sum + p.stock, 0)}
            </div>
            <div className="admin-kpi-sub">Ready for smallholder dispatch</div>
          </div>
          <div className="admin-kpi-icon" style={{ backgroundColor: '#3b82f6' }}>
            <Package size={22} color="#fff" />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Low Stock Alerts</div>
            <div className="admin-kpi-value" style={{ color: '#fbbf24' }}>
              {PRODUCTS.filter((p) => p.stock < 25).length}
            </div>
            <div className="admin-kpi-sub">Reorder required soon</div>
          </div>
          <div className="admin-kpi-icon" style={{ backgroundColor: '#f59e0b' }}>
            <AlertTriangle size={22} color="#fff" />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div>
            <div className="admin-kpi-label">Prescription Guard</div>
            <div className="admin-kpi-value">Active</div>
            <div className="admin-kpi-sub">Antimicrobial stewardship on</div>
          </div>
          <div className="admin-kpi-icon" style={{ backgroundColor: '#8b5cf6' }}>
            <Stethoscope size={22} color="#fff" />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="si-toolbar" style={{ marginBottom: '24px' }}>
        <div className="si-toolbar-group">
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search medication, reagent, or pathogen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--admin-border-subtle)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#15223c',
              border: '1px solid var(--admin-border-subtle)',
              color: '#cbd5e1',
              fontSize: '0.84rem',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(query || filterCategory) && (
            <button
              onClick={() => {
                setQuery('');
                setFilterCategory('');
              }}
              className="admin-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filtered.length === 0 ? (
          <div className="si-empty-card" style={{ gridColumn: '1 / -1' }}>
            <div className="si-empty-title">No veterinary products matched your query</div>
            <div className="si-empty-desc">Try clearing the search or category filter.</div>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="admin-card"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}>
                    {item.category}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: item.stock < 25 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: item.stock < 25 ? '#fbbf24' : '#34d399',
                    border: item.stock < 25 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                  }}>
                    {item.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>
                  {item.name}
                </h3>

                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.45', margin: '0 0 14px 0' }}>
                  {item.indication}
                </p>

                <div style={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--admin-border-subtle)',
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  marginBottom: '14px',
                }}>
                  <strong style={{ color: '#38bdf8' }}>Protocol:</strong> {item.protocol}
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--admin-border-subtle)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Unit / Price</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--admin-font-mono)' }}>
                      PHP {item.price}{' '}
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>/ {item.unit}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Stock</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: item.stock < 25 ? '#fbbf24' : '#ffffff', fontFamily: 'var(--admin-font-mono)' }}>
                      {item.stock} units
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminMarketplace;
