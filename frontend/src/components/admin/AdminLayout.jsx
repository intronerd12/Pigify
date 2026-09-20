import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ScanLine,
  Activity,
  LogOut,
  AlertTriangle,
  Brain,
  Layers,
  CloudSun,
  ShieldCheck,
  PackageCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BrandMark from '../BrandMark';
import { supabase } from '../../utils/supabase';
import { BRAND_NAME } from '../../config/brand';
import '../../pages/admin/Admin.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentUser = React.useMemo(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    }
    localStorage.removeItem('user');
    toast.success('Admin session ended');
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  const navGroups = [
    {
      group: 'Core Operations',
      items: [
        { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Overview Dashboard' },
        { path: '/admin/scans', icon: <ScanLine size={18} />, label: 'Herd Scan Telemetry', badge: 'Live' },
        { path: '/admin/ai-analysis', icon: <Sparkles size={18} />, label: 'Diagnostic Lab' },
      ]
    },
    {
      group: 'Study Framework',
      items: [
        { path: '/admin/features', icon: <Layers size={18} />, label: 'Pathology & System Tabs' },
        { path: '/admin/environment', icon: <CloudSun size={18} />, label: 'Pen Microclimate' },
        { path: '/admin/marketplace', icon: <ShieldCheck size={18} />, label: 'Biosecurity Dispensary' },
      ]
    },
    {
      group: 'Intelligence & Admin',
      items: [
        { path: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Epidemiological Trends' },
        { path: '/admin/users', icon: <Users size={18} />, label: 'Farm & User Directory' },
        { path: '/admin/api-health', icon: <Activity size={18} />, label: 'Inference & Node Health' },
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--admin-bg-base)', color: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{
        width: '270px',
        backgroundColor: '#0a101f',
        borderRight: '1px solid var(--admin-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--admin-shadow-lg)',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--admin-border-subtle)',
          background: 'linear-gradient(180deg, #0e172a 0%, #0a101f 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }} title="Pigify Admin Command">
              <BrandMark size={38} />
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>
                  {BRAND_NAME}
                </h1>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  letterSpacing: '0.05em'
                }}>
                  Admin
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                Swine Disease & Symptom Telemetry
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navGroups.map((grp, gIdx) => (
            <div key={grp.group} style={{ marginBottom: gIdx !== navGroups.length - 1 ? '20px' : '0' }}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                color: '#64748b',
                padding: '0 12px 6px 12px',
              }}>
                {grp.group}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {grp.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          color: active ? '#ffffff' : '#94a3b8',
                          backgroundColor: active ? '#15223c' : 'transparent',
                          border: active ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                          textDecoration: 'none',
                          fontWeight: active ? '600' : '500',
                          fontSize: '0.86rem',
                          borderRadius: '8px',
                          transition: 'all 0.15s ease',
                          gap: '10px',
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94a3b8';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: active ? '#10b981' : '#64748b' }}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            {item.badge}
                          </span>
                        ) : active ? (
                          <ChevronRight size={14} style={{ color: '#10b981', opacity: 0.8 }} />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Admin Footer & Status */}
        <div style={{
          padding: '16px 14px',
          borderTop: '1px solid var(--admin-border-subtle)',
          backgroundColor: '#070d19'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '8px 10px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="telemetry-pulse" />
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#34d399' }}>
                YOLO Engine Live
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--admin-font-mono)' }}>
              150ms
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              backgroundColor: '#15223c',
              border: '1px solid var(--admin-border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0
            }}>
              {(currentUser?.name || currentUser?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser?.name || 'Veterinary Admin'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser?.email || 'admin@pigify.com'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f43f5e',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              width: '100%',
              cursor: 'pointer',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '7px',
              backgroundColor: 'rgba(244, 63, 94, 0.06)',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.25)';
            }}
          >
            <LogOut size={14} />
            <span>End Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main style={{
        flex: 1,
        padding: '30px 36px',
        marginLeft: '270px',
        backgroundColor: 'var(--admin-bg-base)',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#0e172a',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            textAlign: 'center',
            border: '1px solid var(--admin-border-strong)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#f43f5e',
              border: '1px solid rgba(244, 63, 94, 0.3)'
            }}>
              <AlertTriangle size={30} />
            </div>

            <h3 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '10px'
            }}>
              Exit Pigify Admin?
            </h3>

            <p style={{
              color: '#94a3b8',
              marginBottom: '28px',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              You are about to log out of the Swine Disease Telemetry & Inference Command Center. Ongoing real-time alerts will require re-authentication.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: '11px',
                  backgroundColor: '#15223c',
                  border: '1px solid var(--admin-border-strong)',
                  borderRadius: '9px',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.88rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '11px',
                  backgroundColor: '#e11d48',
                  border: 'none',
                  borderRadius: '9px',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
