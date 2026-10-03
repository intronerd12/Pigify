import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';
import { buildApiUrl } from './api';

export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };

const TIMEOUT_MS = 8000;

/**
 * Helper to execute fetch with a strict timeout so mobile never hangs or lags.
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Synchronize Supabase user token with Pigify backend profile.
 * Identical behavior to web AuthPro.jsx syncWithBackend.
 */
export async function syncWithBackend(supabaseToken, nameHint = '', emailHint = '') {
  try {
    const syncUrl = buildApiUrl('/api/auth/supabase-sync');
    const res = await fetchWithTimeout(
      syncUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseToken}`,
        },
        body: JSON.stringify({ name: nameHint }),
      },
      5000
    );

    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    if (res.ok && data?.id) {
      return {
        ...data,
        supabaseToken,
        token: supabaseToken,
      };
    }
  } catch (err) {
    console.warn('[supabaseAuth] Backend sync deferred or timed out:', err?.message || err);
  }

  // Resilient fallback profile matching web schema when backend is offline or cold-starting
  return {
    _id: 'usr_' + Date.now(),
    id: 'usr_' + Date.now(),
    name: nameHint || (emailHint ? emailHint.split('@')[0] : 'Pigify Operator'),
    email: emailHint,
    avatar: '',
    role: 'user',
    status: 'active',
    status_reason: '',
    supabaseToken,
    token: supabaseToken,
  };
}

/**
 * Sign in via Supabase Auth (Exact same client and credentials as Web AuthPro.jsx)
 */
export async function signInWithSupabase(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('email not confirmed')) {
        const err = new Error('Please confirm your email before signing in. Check your inbox.');
        err.needsVerification = true;
        err.email = cleanEmail;
        throw err;
      }
      if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
        throw new Error('Incorrect email or password. Please verify and try again.');
      }
      throw new Error(error.message || 'Login failed. Please verify your credentials.');
    }

    if (!data?.session) {
      throw new Error('Login failed — no session returned. Please try again.');
    }

    const nameHint = data.user?.user_metadata?.full_name || cleanEmail.split('@')[0];
    const syncedUser = await syncWithBackend(data.session.access_token, nameHint, cleanEmail);
    return syncedUser;
  } catch (err) {
    if (err.needsVerification) throw err;
    if (err.message && (err.message.includes('fetch failed') || err.message.includes('Network request failed'))) {
      throw new Error('Network error. Unable to reach authentication server. Please check your internet connection.');
    }
    throw err;
  }
}

/**
 * Register via Supabase Auth (Exact same client and credentials as Web AuthPro.jsx)
 */
export async function signUpWithSupabase(name, email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('user already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }

    // If email confirmation is required by Supabase:
    if (data?.user && !data?.session) {
      return {
        needsVerification: true,
        email: cleanEmail,
        message: 'Account created! Please check your email for the confirmation link.',
      };
    }

    // Immediate session if email confirmation is disabled:
    if (data?.session) {
      const synced = await syncWithBackend(data.session.access_token, cleanName, cleanEmail);
      return {
        user: synced,
        needsVerification: false,
      };
    }

    return {
      needsVerification: true,
      email: cleanEmail,
      message: 'Registration successful. Please verify your email.',
    };
  } catch (err) {
    if (err.message && (err.message.includes('fetch failed') || err.message.includes('Network request failed'))) {
      throw new Error('Network error during registration. Please check your internet connection.');
    }
    throw err;
  }
}

/**
 * Resend email confirmation via Supabase Auth
 */
export async function resendVerificationEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
    });

    if (error) {
      throw new Error(error.message || 'Failed to resend confirmation email.');
    }

    return true;
  } catch (err) {
    throw new Error(err?.message || 'Failed to resend verification email.');
  }
}

/**
 * Sign out via Supabase Auth
 */
export async function signOutSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[supabaseAuth] Supabase signOut error:', err?.message || err);
  }
}
