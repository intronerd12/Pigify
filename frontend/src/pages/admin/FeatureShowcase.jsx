import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Thermometer,
  Eye,
  FileCheck,
  Stethoscope,
  Microscope,
  Info,
  Sparkles,
} from 'lucide-react';
import './Admin.css';

/**
 * FeatureShowcase (Tabs Page)
 * Interactive Architectural Showcase for Pigify:
 * Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms
 */
const FeatureShowcase = () => {
  const [activeTab, setActiveTab] = useState('ai-model');

  const tabDefs = [
    { id: 'ai-model', label: 'AI Detection Engine', icon: <Cpu size={16} /> },
    { id: 'severity-triage', label: 'Clinical Triage Matrix', icon: <Activity size={16} /> },
    { id: 'swine-pathology', label: 'Swine Pathology Profiles', icon: <Microscope size={16} /> },
    { id: 'quarantine-protocols', label: 'Biosecurity Protocols', icon: <ShieldCheck size={16} /> },
    { id: 'surveillance', label: 'Epidemiological Telemetry', icon: <Eye size={16} /> },
    { id: 'microclimate', label: 'Heat Stress & THI', icon: <Thermometer size={16} /> },
  ];

  const features = {
    'ai-model': {
      title: 'Deep Learning Vision Architecture',
      subtitle: 'Dual YOLOv8 & YOLOv11 detectors calibrated for swine dermatological and behavioral symptoms',
      badge: 'Edge + Cloud Dual Model',
      highlights: [
        'Sub-150ms field inference on modest backyard mobile devices',
        'Multi-lesion bounding box regression with precision coordinates',
        'Continuous active learning pipeline with expert vet validation',
        'Calibrated confidence thresholds (85%–99%) preventing false quarantine alerts'
      ],
      sections: [
        {
          heading: 'Real-Time Edge Localization',
          items: [
            'YOLOv8n / YOLOv11s object detection tuned for swine pen environments',
            'Localized bounding boxes identifying skin erythema, crusts, and papules',
            'Resilient to pen shadow variations, mud splatters, and dim sty lighting',
            'Offline image caching with opportunistic cloud sync when back online'
          ]
        },
        {
          heading: 'Dermatological Segmentation',
          items: [
            'Automated lesion surface area ratio calculation (Lesion Area / Dermis Area)',
            'Multi-spectral skin tone normalization for local native breeds and white pigs',
            'Texture blemish analysis distinguishing harmless dirt from pathogen crusts',
            'Automated rejection of non-swine subjects with guided camera reticle'
          ]
        },
        {
          heading: 'Continuous Retraining Pipeline',
          items: [
            'Field-contributed verified samples ingested via secure Supabase telemetry',
            'Semi-supervised pseudo-labeling with confidence gates > 92%',
            'Municipal veterinary officer feedback loop for misclassified cases',
            'Versioned model checkpoint registry with automated mAP regression testing'
          ]
        },
        {
          heading: 'Validated Datasets & Benchmarks',
          items: [
            'Curated smallholder swine farm photographic repository (5,000+ labeled images)',
            'Clinical diagnostic ground truth verified by licensed swine practitioners',
            'Synthetic augmentations: extreme angles, low lux, motion blur, and wet pens',
            'Benchmark mAP@0.5 score: 94.7% across primary target skin conditions'
          ]
        }
      ]
    },

    'severity-triage': {
      title: '5-Tier Clinical Severity Triage System',
      subtitle: 'Standardized veterinary classification routing backyard pigs from routine care to emergency quarantine',
      badge: 'Veterinary Validated',
      highlights: [
        'Objective triage eliminating smallholder subjective guesswork',
        'Direct linkage between severity grade and automated pen quarantine action',
        'Color-coded operational badges utilized across all admin tables and mobile alerts',
        'Automated notification thresholds for contagious systemic indications'
      ],
      sections: [
        {
          heading: 'Grade A — Healthy Baseline (Clear)',
          items: [
            'Lesion Coverage: 0% abnormal dermal surface',
            'Clinical Status: Healthy, intact skin, clear eyes, normal posture',
            'Pen Action: Standard hygiene and routine feeding maintenance',
            'Re-scan Cadence: Weekly herd biosecurity check'
          ]
        },
        {
          heading: 'Grade B — Mild / Localized (Low Concern)',
          items: [
            'Lesion Coverage: < 5% localized superficial abrasion or minor papules',
            'Clinical Status: Mild surface redness, no systemic lethargy or fever',
            'Pen Action: Clean pen bedding, apply antiseptic wash, monitor feeding',
            'Re-scan Cadence: 48-hour follow-up scan'
          ]
        },
        {
          heading: 'Grade C — Moderate / Watchlist (Elevated)',
          items: [
            'Lesion Coverage: 5% – 15% clustered lesions, early exudate or pruritus',
            'Clinical Status: Persistent scratching, rubbing against sty posts, mild discomfort',
            'Pen Action: Initiate barrier pen nursing, spray topical acaricide or antiseptic',
            'Re-scan Cadence: Daily monitoring until resolution'
          ]
        },
        {
          heading: 'Grade D & E — Severe / Critical (Quarantine Alert)',
          items: [
            'Lesion Coverage: > 15% extensive dark crusting, pustules, or systemic distress',
            'Clinical Status: Severe Exudative Epidermitis or generalized Pox, fever risk',
            'Pen Action: Immediate physical isolation in designated quarantine pen',
            'Veterinary Escalation: Automated alert dispatch to municipal livestock officer'
          ]
        }
      ]
    },

    'swine-pathology': {
      title: 'Backyard Swine Pathology & Etiology',
      subtitle: 'Target deep learning diagnostic classes common to backyard and smallholder sties',
      badge: 'Pathogen Profiling',
      highlights: [
        'Differentiates superficially similar skin infections with high confidence',
        'Etiology-specific smallholder advice (bacterial vs viral vs ectoparasitic)',
        'Built-in safety alerts flagging possible reportable hemorrhagic diseases',
        'Clinical reference descriptions formatted for smallholder comprehension'
      ],
      sections: [
        {
          heading: 'Exudative Epidermitis (Greasy Pig Disease)',
          items: [
            'Etiology: Staphylococcus hyicus (opportunistic bacterial invasion)',
            'Primary Symptoms: Brown greasy, sticky exudative crusts, non-pruritic',
            'High-Risk Group: Piglets aged 1 to 10 weeks; worsened by rough sty floors',
            'Management: Soap & warm water cleansing, topical iodine, antimicrobial treatment'
          ]
        },
        {
          heading: 'Swine Pox (Suipoxvirus)',
          items: [
            'Etiology: Suipoxvirus transmitted mechanically by biting swine lice (Haematopinus suis)',
            'Primary Symptoms: Circular red macules turning to umbilicated pustules and dark scabs',
            'High-Risk Group: Weaners and growing pigs in humid, unhygienic bedding',
            'Management: Vector control (lice eradication), pen disinfection, supportive care'
          ]
        },
        {
          heading: 'Sarcoptic Mange (Scabies)',
          items: [
            'Etiology: Sarcoptes scabiei var. suis (burrowing mite ectoparasite)',
            'Primary Symptoms: Intense pruritus, ear-shaking, thickened crusting around ears and flanks',
            'High-Risk Group: All age classes, highly contagious via direct snout-to-body contact',
            'Management: Acaricide spray (Amitraz) or injectable ivermectin; sanitize pens'
          ]
        },
        {
          heading: 'Porcine Dermatitis & Nephropathy (PDNS)',
          items: [
            'Etiology: Systemic immune-complex disease associated with PCV2 infection',
            'Primary Symptoms: Distinct irregular purple-red blotches on perineum, hindquarters and legs',
            'Differential Flag: Visual similarities to African Swine Fever (ASF) trigger vet inspection',
            'Management: Immediate veterinary consultation and comprehensive biosecurity audit'
          ]
        }
      ]
    },

    'quarantine-protocols': {
      title: 'Backyard Pen Biosecurity & Protocols',
      subtitle: 'Actionable containment guidelines designed for resource-limited smallholder sties',
      badge: 'Biosecurity Protocols',
      highlights: [
        'Tailored specifically to smallholder sties without high-tech air filtration',
        'Cost-effective disinfection using readily available agricultural lime and iodine',
        'Step-by-step quarantine procedure preventing spillover to neighbor pens',
        'Antimicrobial stewardship preventing unauthorized antibiotic overuse'
      ],
      sections: [
        {
          heading: 'Physical Pen Quarantine Barrier',
          items: [
            'Maintain minimum 3-meter physical buffer zone between quarantined and healthy pens',
            'Erect temporary solid plastic or wooden dividers to halt nose-to-nose contact',
            'Restrict farm foot traffic: tend to sick animals strictly LAST in daily chore routines',
            'Prohibit sharing of feed shovels, manure scrapers, or water hoses without disinfection'
          ]
        },
        {
          heading: 'Sanitation & Disinfection',
          items: [
            'Implement agricultural hydrated lime whitewashing on pen concrete floors and walls',
            'Place shallow footbaths with fresh disinfectant at every pen entry point',
            'Thoroughly remove organic manure and soiled rice-hull bedding before spraying',
            'Sunlight exposure: open pen shutters where possible to leverage UV drying'
          ]
        },
        {
          heading: 'Fomite & Vector Control',
          items: [
            'Eradicate lice and fly vectors which mechanically vector Swine Pox between litters',
            'Store pig feeds in elevated sealed barrels to prevent rodent contamination',
            'Wash and disinfect transport cages before introducing newly bought weaners',
            'Clean water reservoirs weekly to eliminate biofilm harboring Staphylococcus'
          ]
        },
        {
          heading: 'Veterinary Notification Triggers',
          items: [
            'Sudden multiple pig mortalities within 24 hours',
            'High fever (>40.5°C / 105°F) paired with purple skin cyanosis',
            'Hemorrhagic diarrhea or bleeding from snout/rectum (mandatory reportable event)',
            'Non-responsiveness to standard 72-hour supportive antimicrobial care'
          ]
        }
      ]
    },

    'surveillance': {
      title: 'Epidemiological Telemetry & Herd Surveillance',
      subtitle: 'Real-time spatial-temporal monitoring tracking swine symptom clusters across backyard farms',
      badge: 'Surveillance Analytics',
      highlights: [
        'Geospatial mapping of backyard farms by barangay and municipality',
        'Outbreak cluster detection warning neighboring smallholders before spread occurs',
        'Longitudinal disease progression tracking individual pigs over multi-week scans',
        'Exportable veterinary audit summaries for local municipal agricultural offices'
      ],
      sections: [
        {
          heading: 'Cluster Outbreak Warnings',
          items: [
            'Automated spatial radius calculation flagging multiple Grade D/E cases within 1 km',
            'Alert banners pushed to registered backyard raisers in identical barangays',
            'Early quarantine containment before localized outbreaks become regional epidemics',
            'Trend analysis correlating seasonal rainfalls with sudden mange flare-ups'
          ]
        },
        {
          heading: 'Individual Swine Progression',
          items: [
            'Digital timeline linking repeat scans of individual ear-notched or numbered pigs',
            'Visual recovery curve: tracking lesion reduction following antibiotic treatment',
            'Recurrence detection: alert if skin symptoms reappear within 30 days of clearance',
            'Audit log recording timestamp, operator identity, device model, and GPS coordinate'
          ]
        },
        {
          heading: 'Municipal Reporting & Compliance',
          items: [
            'One-click PDF generation of comprehensive backyard herd health audit reports',
            'Standardized reporting formats accepted by municipal veterinary health inspectors',
            'Anonymized epidemiological statistics for academic research and capstone defense',
            'Historical herd census tracking total herd capacity versus active pen occupancy'
          ]
        },
        {
          heading: 'Veterinary Tele-Consultation',
          items: [
            'Secure transmission of annotated lesion photos directly to attending veterinarians',
            'Two-way clinical messaging between smallholder pig raisers and field experts',
            'Prescription and treatment verification tracking safe withdrawal periods',
            'Emergency hotline integration for rapid-response veterinary dispatch'
          ]
        }
      ]
    },

    'microclimate': {
      title: 'Pen Microclimate & Heat Stress (THI)',
      subtitle: 'Environmental stress analysis correlating ambient pen temperature and humidity with dermal infection rates',
      badge: 'Environmental THI',
      highlights: [
        'Pigs lack functional sweat glands, making them extraordinarily vulnerable to heat stress',
        'High humidity + heat dramatically increases bacterial multiplication on swine skin',
        'Real-time calculation of Swine Temperature-Humidity Index (THI)',
        'Actionable pen cooling advice for smallholders without expensive misting equipment'
      ],
      sections: [
        {
          heading: 'Swine Heat Stress Thresholds (THI)',
          items: [
            'THI < 74: Normal comfort zone — optimal immune function and skin recovery',
            'THI 74 – 78: Alert level — pigs show increased respiration and decreased appetite',
            'THI 79 – 83: Danger level — severe panting, immunosuppression, elevated skin disease risk',
            'THI > 84: Emergency — acute heat prostration, risk of death, extreme disease vulnerability'
          ]
        },
        {
          heading: 'Humidity & Dermatological Correlation',
          items: [
            'Relative Humidity > 80% creates damp skin maceration, accelerating Greasy Pig Disease',
            'Wet bedding harbors pathogenic bacteria and provides ideal conditions for mite breeding',
            'High ammonia vapors from unventilated manure irritate swine eyes and mucosal barriers',
            'Dry, dusty winter pens aggravate respiratory stress and skin micro-abrasions'
          ]
        },
        {
          heading: 'Backyard Pen Heat Mitigation Advice',
          items: [
            'Install reflective thatch or shade netting over corrugated iron roofs to lower pen temp 3-5°C',
            'Provide clean, shallow wallowing troughs with daily water changes to avoid foul water',
            'Increase cross-ventilation by removing solid wall planks at pig level during hot noon hours',
            'Add oral rehydration electrolytes and vitamin C to drinking water during peak heat days'
          ]
        },
        {
          heading: 'Predictive Weather Integration',
          items: [
            'Integration with Open-Meteo local forecasts for Philippine provinces',
            '3-day ahead warning for impending heat waves or typhoon moisture surges',
            'Proactive notification advising smallholders to disinfect sties before humidity peaks',
            'Pen density reduction alerts when forecasted temperatures exceed safety thresholds'
          ]
        }
      ]
    }
  };

  const currentFeature = features[activeTab] || features['ai-model'];

  return (
    <div className="admin-shell-page">
      {/* Hero */}
      <section className="admin-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="admin-hero-badge">Capstone Study Framework</span>
            <span className="admin-meta-tag">
              <span className="telemetry-pulse" />
              PIGIFY: DL-BASED SWINE MONITORING
            </span>
          </div>
          <h1 className="admin-hero-title">
            <Layers size={26} color="#34d399" />
            System Architecture & Pathology Tabs
          </h1>
          <p className="admin-hero-sub">
            Technical and clinical capability matrix for <strong>PIGIFY: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms</strong>. Explore each interactive pillar below.
          </p>
        </div>
      </section>

      {/* Interactive Tabs Navigation */}
      <div className="admin-tabs-nav">
        {tabDefs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab-btn ${isActive ? 'active' : ''}`}
              type="button"
            >
              <span style={{ color: isActive ? '#34d399' : '#94a3b8' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Main Card */}
      <div className="admin-card" style={{ border: '1px solid rgba(16, 185, 129, 0.25)' }}>
        <div className="admin-card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 className="admin-card-title" style={{ fontSize: '1.4rem' }}>
                {currentFeature.title}
              </h2>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                {currentFeature.badge}
              </span>
            </div>
            <p className="admin-card-desc" style={{ fontSize: '0.92rem', color: '#94a3b8' }}>
              {currentFeature.subtitle}
            </p>
          </div>
        </div>

        {/* Highlights Bar */}
        <div style={{
          padding: '16px 18px',
          borderRadius: '12px',
          backgroundColor: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.18)',
          marginBottom: '26px'
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#34d399',
            letterSpacing: '0.08em',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} /> Core Architectural Highlights
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {currentFeature.highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deep Dive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {currentFeature.sections.map((sec, idx) => (
            <div
              key={idx}
              style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: 'var(--admin-bg-elevated)',
                border: '1px solid var(--admin-border-subtle)',
                boxShadow: 'var(--admin-shadow-sm)'
              }}
            >
              <h3 style={{
                fontSize: '0.98rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '14px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }} />
                {sec.heading}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sec.items.map((it, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '0.85rem',
                      color: '#94a3b8',
                      lineHeight: '1.45',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <span style={{ color: '#34d399', fontWeight: 'bold' }}>›</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Alert / Biosecurity Context */}
        <div style={{
          marginTop: '26px',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <Info size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <strong style={{ color: '#ffffff' }}>Backyard Farm Operations Notice:</strong> All deep learning classification outputs, severity triage designations, and biosecurity protocols in Pigify are intended to assist smallholder raisers in early symptom detection. Confirmed systemic or reportable disease signals require verification by an authorized municipal veterinary officer.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
