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

    if (res.status === 403) {
      if (data?.needsVerification || data?.message?.includes('verify your email')) {
        const err = new Error(data.message || 'Please verify your email address before signing in.');
        err.needsVerification = true;
        err.email = emailHint;
        throw err;
      }
      throw new Error(data?.message || 'Account access restricted.');
    }

    if (res.ok && data?.id) {
      return {
        ...data,
        supabaseToken,
        token: supabaseToken,
      };
    }
  } catch (err) {
    if (err?.needsVerification) throw err;
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
 * Sign in via Supabase Auth.
 * Enforces email verification: unverified non-Gmail users cannot log in.
 */
export async function signInWithSupabase(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const isGmail = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('email not confirmed')) {
        // Exclude Gmail from verification: attempt auto-confirm
        if (isGmail) {
          try {
            const autoConfirmUrl = buildApiUrl('/api/auth/auto-confirm');
            const autoRes = await fetchWithTimeout(
              autoConfirmUrl,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email: cleanEmail }),
              },
              4000
            );
            if (autoRes.ok) {
              const retryRes = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
              });
              if (retryRes.data?.session) {
                const nameHint = retryRes.data.user?.user_metadata?.full_name || cleanEmail.split('@')[0];
                return await syncWithBackend(retryRes.data.session.access_token, nameHint, cleanEmail);
              }
            }
          } catch (autoErr) {
            console.warn('[supabaseAuth] Gmail auto-confirm notice:', autoErr?.message);
          }
        }

        // For non-Gmail accounts: Email verification is required in database Supabase!
        const err = new Error('Please verify your email address before signing in. Check your inbox for the confirmation link.');
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

    // Verify confirmation status for non-Gmail users
    if (!isGmail && !data.user?.email_confirmed_at) {
      const err = new Error('Please verify your email address before signing in. Check your inbox for the confirmation link.');
      err.needsVerification = true;
      err.email = cleanEmail;
      throw err;
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
 * Register via Supabase Auth.
 * Gmail accounts are excluded and auto-confirmed.
 * Non-Gmail accounts require email verification before being allowed to log in.
 */
export async function signUpWithSupabase(name, email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();
  const isGmail = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');

  if (isGmail) {
    // 1. Gmail accounts: register with instant email verification bypass
    try {
      const regUrl = buildApiUrl('/api/auth/register');
      const resp = await fetchWithTimeout(
        regUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
        },
        6000
      );

      const regData = await resp.json().catch(() => ({}));
      if (resp.ok && regData?.success) {
        const signedIn = await signInWithSupabase(cleanEmail, password);
        return {
          user: signedIn,
          needsVerification: false,
        };
      } else if (resp.status === 400 && regData?.message) {
        const msg = regData.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw new Error(regData.message);
      }
    } catch (backendRegErr) {
      if (backendRegErr.message?.includes('already exists') || backendRegErr.message?.includes('already registered')) {
        throw backendRegErr;
      }
      console.warn('[supabaseAuth] Gmail direct register notice:', backendRegErr?.message);
    }
  }

  // 2. Non-Gmail accounts: Register in Supabase Auth requiring email confirmation.
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

    // Non-Gmail account requires email confirmation
    return {
      needsVerification: true,
      email: cleanEmail,
      message: 'Account created! Please check your email for the confirmation link to activate your account before logging in.',
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
