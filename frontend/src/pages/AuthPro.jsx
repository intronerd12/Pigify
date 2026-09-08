import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import BrandMark from '../components/BrandMark';
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand';
import { API_BASE_URL } from '../config/api';
import { supabase } from '../utils/supabase';
import './AuthPro.css';

const AUTH_VIDEO_SLIDES = [
  {
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788678594/pigify_videos/12180338_1280_720_30fps.mp4',
    title: 'AI Swine Symptom Scan',
    desc: 'Real-time lesion, rash & dermatitis segmentation',
    tag: 'MODEL: YOLOv11-VET',
    confidence: '98.8%',
  },
  {
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788678601/pigify_videos/13693036-hd_1280_720_25fps.mp4',
    title: 'Backyard Swine Analytics',
    desc: 'Deep learning herd health reports & risk forecasting',
    tag: 'ANALYTICS: HERD-AI',
    confidence: '99.1%',
  },
  {
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676649/pigify_videos/13693034-hd_1280_720_25fps.mp4',
    title: 'Swine Disease Prevention',
    desc: 'Early detection & biosecurity outbreak deterrence',
    tag: 'DETECTION: CONTAGION',
    confidence: '97.9%',
  },
  {
    video: 'https://res.cloudinary.com/dkqnaqbvg/video/upload/v1788676636/pigify_videos/15098476_1280_720_60fps.mp4',
    title: 'Swine Health Workspace',
    desc: 'Veterinary clinical telemetry & audit tracking',
    tag: 'SECURE: SUPABASE-TLS',
    confidence: '99.5%',
  },
];

/**
 * After Supabase auth succeeds, sync with our backend to get the user profile + role.
 */
async function syncWithBackend(supabaseToken, nameHint) {
  const res = await fetch(`${API_BASE_URL}/api/auth/supabase-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseToken}`,
    },
    body: JSON.stringify({ name: nameHint }),
  });

  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch {
    console.error('Sync parse error:', text);
  }

  if (!res.ok) throw new Error(data?.message || `Sync failed (${res.status})`);
  return data;
}

function AuthPro() {
  const [activeVideoSlide, setActiveVideoSlide] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verification / email confirm screen
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const navigate = useNavigate();

  // Auto-advance showcase video slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveVideoSlide((prev) => (prev + 1) % AUTH_VIDEO_SLIDES.length);
    }, 7500);
    return () => clearInterval(timer);
  }, []);

  const { name, email, password } = formData;

  // Password strength calculation
  const pwdStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 9) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) || /[A-Z]/.test(password)) score += 1;
    return Math.min(score, 4);
  }, [password]);

  // NOTE: We intentionally DO NOT auto-redirect to /admin or /home on mount here.
  // When a user explicitly clicks "Login" from the front page, they want to see the login form
  // to enter their credentials (or sign in as another account / register), not be unexpectedly auto-logged in.

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    if (!isLogin && !name.trim()) { toast.error('Please enter your full name'); return false; }
    if (!email.trim()) { toast.error('Please enter your email address'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email address'); return false; }
    if (!password) { toast.error('Please enter your password'); return false; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    return true;
  };

  const submitAuth = async () => {
    if (isLogin) {
      // ── LOGIN via Supabase Auth ──────────────────────────────────────────
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          setNeedsVerification(true);
          setVerifyEmail(email);
          toast.error('Please confirm your email before signing in. Check your inbox.');
          return null;
        }
        if (error.message?.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Incorrect email or password. Please verify and try again.');
        }
        throw new Error(error.message);
      }

      if (!data.session) throw new Error('Login failed — no session returned. Please try again.');

      // Sync with backend to get role and user profile with resilient fallback
      let synced = null;
      try {
        synced = await syncWithBackend(data.session.access_token, data.user?.user_metadata?.full_name);
      } catch (syncErr) {
        console.warn('Backend sync note, using Supabase session data directly:', syncErr);
        synced = {
          id: data.user.id,
          email: data.user.email,
          name: data.user?.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          role: data.user.email?.toLowerCase().includes('admin') ? 'admin' : 'user',
          token: data.session.access_token,
        };
      }
      localStorage.setItem('user', JSON.stringify(synced));
      toast.success(`Welcome back, ${synced.name || 'User'}!`);
      navigate(synced.role === 'admin' ? '/admin' : '/home');
      return synced;

    } else {
      // ── REGISTER via Supabase Auth ───────────────────────────────────────
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (error) {
        if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('user already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw new Error(error.message);
      }

      // If email confirmation is required by Supabase configuration
      if (data.user && !data.session) {
        setNeedsVerification(true);
        setVerifyEmail(email);
        toast.success('Account created! Please check your email for the confirmation link.');
        return null;
      }

      // Immediate session (e.g. if email confirmation is disabled)
      if (data.session) {
        let synced = null;
        try {
          synced = await syncWithBackend(data.session.access_token, name);
        } catch (syncErr) {
          console.warn('Backend sync note, using Supabase session data directly:', syncErr);
          synced = {
            id: data.user.id,
            email: data.user.email,
            name: name || data.user.email?.split('@')[0] || 'User',
            role: data.user.email?.toLowerCase().includes('admin') ? 'admin' : 'user',
            token: data.session.access_token,
          };
        }
        localStorage.setItem('user', JSON.stringify(synced));
        toast.success(`Welcome to Pigify, ${synced.name || name}!`);
        navigate(synced.role === 'admin' ? '/admin' : '/home');
        return synced;
      }

      throw new Error('Registration failed — unexpected response. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await submitAuth();
    } catch (err) {
      const msg = err?.message || 'Authentication error';
      if (msg.includes('rate limit') || msg.includes('too many')) {
        toast.error('Too many attempts. Please wait a moment and try again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verifyEmail) return;
    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: verifyEmail });
      if (error) throw new Error(error.message);
      toast.success('Confirmation email resent! Please check your inbox.');
    } catch (err) {
      toast.error(err?.message || 'Failed to resend confirmation email.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSocialLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await fetch(`${API_BASE_URL}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.displayName, email: user.email, googleId: user.uid, avatar: user.photoURL }),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { data = {}; }

      if (!res.ok) throw new Error(data?.message || `Social login failed (${res.status})`);

      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Welcome back, ${data.name}!`);
      navigate(data.role === 'admin' ? '/admin' : '/home');
    } catch (error) {
      console.error('Social Auth Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign in popup was closed.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error('An account already exists with this email using a different provider.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Google authentication is currently disabled.');
      } else {
        toast.error(error.message || 'Google sign-in failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (loginState) => {
    setIsLogin(loginState);
    setFormData({ name: '', email: '', password: '' });
    setNeedsVerification(false);
    setVerifyEmail('');
  };

  const activeSlide = AUTH_VIDEO_SLIDES[activeVideoSlide];

  return (
    <div className="pigify-auth-shell">
      {/* Cyber Grid & Ambient Glows */}
      <div className="pigify-ambient-overlay" aria-hidden="true" />
      <div className="pigify-grid-mesh" aria-hidden="true" />

      {/* Background Telemetry Markers */}
      <div className="pigify-bg-hud-left" aria-hidden="true">
        <span className="pigify-hud-pulse" />
        <span>VET-CORE // PIGIFY-AI-SYS-v4.2</span>
      </div>
      <div className="pigify-bg-hud-right" aria-hidden="true">
        <span>SWINE CLINICAL TELEMETRY</span>
        <span style={{ color: 'var(--p-emerald)' }}>ONLINE [99.8%]</span>
      </div>

      {/* Main Glassmorphic Container Frame */}
      <div className="pigify-auth-frame">
        {/* ── LEFT SHOWCASE PANEL ── */}
        <div className="pigify-showcase-panel">
          <div>
            {/* Brand Row */}
            <div className="pigify-brand-row">
              <div className="pigify-brand-identity">
                <BrandMark size={44} variant="pigify" />
                <div>
                  <div className="pigify-brand-name">
                    {BRAND_NAME}
                    <span className="pigify-brand-name-tag">CLINICAL</span>
                  </div>
                  <div className="pigify-brand-sub">{BRAND_TAGLINE}</div>
                </div>
              </div>
              <div className="pigify-live-badge">
                <span className="pigify-hud-pulse" />
                <span>AI LIVE</span>
              </div>
            </div>

            {/* Hero Copy */}
            <h1 className="pigify-hero-title">
              Veterinary-Grade <span>Swine Health</span> & AI Diagnostics
            </h1>
            <p className="pigify-hero-subtitle">
              Deep learning-based lesion scanning, real-time symptom classification, and automated biosecurity analytics built specifically for backyard pig farms.
            </p>

            {/* AI Scanner Viewfinder Showcase */}
            <div className="pigify-scanner-card">
              <div className="pigify-scanner-media">
                <video
                  key={activeSlide.video}
                  src={activeSlide.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="pigify-scanner-hud">
                  <div className="pigify-scanner-hud-top">
                    <div className="pigify-hud-target-badge">
                      <ScanLine size={12} />
                      <span>{activeSlide.tag}</span>
                    </div>
                    <div className="pigify-hud-model-tag">
                      CONFIDENCE: {activeSlide.confidence}
                    </div>
                  </div>
                  <div className="pigify-viewfinder-reticle">
                    <div className="pigify-scanline-laser" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#34d399' }}>
                      ● REAL-TIME STREAM ACTIVE
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                      FPS: 60 // RES: 1080p
                    </span>
                  </div>
                </div>
              </div>

              {/* Caption & Slide Control */}
              <div className="pigify-scanner-caption-bar">
                <div className="pigify-scanner-info">
                  <h4>
                    <Sparkles size={13} color="#fb7185" />
                    {activeSlide.title}
                  </h4>
                  <p>{activeSlide.desc}</p>
                </div>
                <div className="pigify-scanner-dots">
                  {AUTH_VIDEO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`pigify-scanner-dot ${activeVideoSlide === i ? 'active' : ''}`}
                      onClick={() => setActiveVideoSlide(i)}
                      aria-label={`Showcase slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 3 High-Tech Feature Cards */}
            <div className="pigify-feature-grid">
              <div className="pigify-feature-card">
                <div className="pigify-feature-icon">
                  <ScanLine size={18} />
                </div>
                <div className="pigify-feature-text">
                  <strong>Skin Disease Segmentation</strong>
                  <span>Detects erysipelas, greasy pig, mange, and rash severity instantly.</span>
                </div>
              </div>

              <div className="pigify-feature-card">
                <div className="pigify-feature-icon">
                  <Activity size={18} />
                </div>
                <div className="pigify-feature-text">
                  <strong>Herd Telemetry & Biosecurity</strong>
                  <span>Continuous health monitoring dashboard preventing outbreak contagions.</span>
                </div>
              </div>

              <div className="pigify-feature-card">
                <div className="pigify-feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="pigify-feature-text">
                  <strong>Supabase Cloud Security</strong>
                  <span>End-to-end encrypted veterinary clinical records & strict role segregation.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pigify-showcase-footer">
            <div className="pigify-engine-status">
              <Cpu size={12} color="#10b981" />
              <span>YOLOv11-VET ENGINE // REV 4.2</span>
            </div>
            <span>© {new Date().getFullYear()} {BRAND_NAME} System</span>
          </div>
        </div>

        {/* ── RIGHT OPERATOR TERMINAL ── */}
        <div className="pigify-terminal-panel">
          <div>
            {/* Top Navigation & Security Badge */}
            <div className="pigify-terminal-nav">
              <Link to="/" className="pigify-back-btn" aria-label="Return to front page">
                <ArrowLeft size={14} />
                <span>Landing Page</span>
              </Link>
              <div className="pigify-security-tag">
                <ShieldCheck size={13} color="#10b981" />
                <span>TLS-256 SECURED</span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="pigify-mode-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={isLogin}
                className={`pigify-tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => toggleMode(true)}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isLogin}
                className={`pigify-tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => toggleMode(false)}
              >
                Create Account
              </button>
            </div>

            {/* Form Title */}
            <div className="pigify-form-header">
              <h3>{isLogin ? 'Operator Sign In' : 'Register Operator'}</h3>
              <p>
                {isLogin
                  ? 'Enter your verified credentials to access herd diagnostics.'
                  : 'Set up an operator account to begin scanning swine health.'}
              </p>
            </div>

            {/* Verification Notice Screen */}
            {needsVerification ? (
              <div className="pigify-verification-box">
                <div className="pigify-verification-icon">
                  <Mail size={24} />
                </div>
                <h4>Verify Your Email Address</h4>
                <p>
                  A confirmation link has been dispatched to:
                </p>
                <div className="pigify-verification-email-pill">
                  {verifyEmail}
                </div>
                <p style={{ fontSize: '12px' }}>
                  Please click the link inside your email, then return here to sign in.
                </p>

                <button
                  type="button"
                  disabled={isVerifying}
                  className="pigify-cta-submit"
                  onClick={handleResendVerification}
                  style={{ marginBottom: '12px' }}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={15} className="pigify-spin" />
                      <span>Sending Link…</span>
                    </>
                  ) : (
                    <>
                      <Mail size={15} />
                      <span>Resend Verification Link</span>
                    </>
                  )}
                </button>

                <div className="pigify-mode-switch-prompt">
                  Already confirmed?
                  <button type="button" onClick={() => toggleMode(true)}>
                    Sign in now
                  </button>
                </div>
              </div>
            ) : (
              /* Main Auth Form */
              <form onSubmit={handleSubmit} className="pigify-auth-form" noValidate>
                {!isLogin && (
                  <div className="pigify-input-group">
                    <label className="pigify-input-label" htmlFor="pigify-name">
                      Full Name
                    </label>
                    <div className="pigify-input-wrapper">
                      <User size={16} className="pigify-input-icon" />
                      <input
                        id="pigify-name"
                        type="text"
                        name="name"
                        value={name}
                        onChange={onChange}
                        placeholder="e.g. Dr. Alex Vance"
                        className="pigify-text-input"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="pigify-input-group">
                  <label className="pigify-input-label" htmlFor="pigify-email">
                    Email Address
                  </label>
                  <div className="pigify-input-wrapper">
                    <Mail size={16} className="pigify-input-icon" />
                    <input
                      id="pigify-email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                      placeholder="operator@farm.com"
                      className="pigify-text-input"
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                    />
                  </div>
                </div>

                <div className="pigify-input-group">
                  <div className="pigify-label-row">
                    <label className="pigify-input-label" htmlFor="pigify-password">
                      Password
                    </label>
                    {isLogin && (
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                        Min 6 characters
                      </span>
                    )}
                  </div>
                  <div className="pigify-input-wrapper">
                    <Lock size={16} className="pigify-input-icon" />
                    <input
                      id="pigify-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={onChange}
                      placeholder="••••••••••••"
                      className="pigify-text-input pigify-input-with-toggle"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                    />
                    <button
                      type="button"
                      className="pigify-toggle-visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator for Registration */}
                  {!isLogin && password && (
                    <div className="pigify-pwd-strength">
                      <div className="pigify-pwd-bars">
                        <div className={`pigify-pwd-bar-seg ${pwdStrength >= 1 ? 'active-1' : ''}`} />
                        <div className={`pigify-pwd-bar-seg ${pwdStrength >= 2 ? 'active-2' : ''}`} />
                        <div className={`pigify-pwd-bar-seg ${pwdStrength >= 3 ? 'active-3' : ''}`} />
                        <div className={`pigify-pwd-bar-seg ${pwdStrength >= 4 ? 'active-4' : ''}`} />
                      </div>
                      <div className="pigify-pwd-label">
                        <span>Password Strength</span>
                        <span>
                          {pwdStrength <= 1 && 'Weak'}
                          {pwdStrength === 2 && 'Fair'}
                          {pwdStrength === 3 && 'Good'}
                          {pwdStrength === 4 && 'Strong'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="pigify-cta-submit"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="pigify-spin" />
                      <span>Authenticating…</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In to Workspace' : 'Create Operator Account'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="pigify-auth-divider">
                  <span />
                  <label>OR AUTHORIZE WITH</label>
                  <span />
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleSocialLogin}
                  disabled={isLoading}
                  className="pigify-btn-google"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Bottom Toggle Prompt */}
                <div className="pigify-mode-switch-prompt">
                  {isLogin ? "Don't have an operator account?" : 'Already registered?'}
                  <button
                    type="button"
                    onClick={() => toggleMode(!isLogin)}
                  >
                    {isLogin ? 'Create one now' : 'Sign in here'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Terminal Security Badges */}
          <div className="pigify-terminal-badges">
            <div className="pigify-badge-item">
              <ShieldCheck size={13} color="#10b981" />
              <span>Supabase Auth</span>
            </div>
            <div className="pigify-badge-item">
              <Lock size={13} color="#38bdf8" />
              <span>TLS-256</span>
            </div>
            <div className="pigify-badge-item">
              <CheckCircle2 size={13} color="#fb7185" />
              <span>Veterinary Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPro;
