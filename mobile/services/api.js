import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const ACTIVE_BACKEND_STORAGE_KEY = '@pigify_active_backend_url';

// ── Configuration & Candidates ────────────────────────────────────────────────
// Kept for backward compatibility and regex replacement in update-ngrok-url.js:
const ngrokUrl = '';

const envNgrokUrl =
  typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_NGROK_URL
    ? process.env.EXPO_PUBLIC_NGROK_URL
    : '';

const envApiUrl =
  typeof process !== 'undefined'
    ? (process?.env?.EXPO_PUBLIC_API_URL || process?.env?.EXPO_PUBLIC_BACKEND_URL || '')
    : '';

const renderUrl =
  typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_RENDER_URL
    ? process.env.EXPO_PUBLIC_RENDER_URL
    : 'https://dragon-backend.onrender.com';

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

/**
 * Dynamically extract developer workstation LAN IP from Expo Metro host
 * Works automatically when testing on physical phones via Expo Go over local Wi-Fi.
 */
const getMetroHost = () => {
  try {
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest2?.extra?.expoClient?.hostUri ||
      Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants?.manifest?.debuggerHost ||
      '';

    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5000`;
      }
    }
  } catch {
    // expo-constants unavailable or non-standard environment
  }
  return '';
};

const buildBaseCandidates = () => {
  const explicit = normalizeBaseUrl(envApiUrl);
  const tunnel = normalizeBaseUrl(envNgrokUrl || ngrokUrl);
  const metroLan = normalizeBaseUrl(getMetroHost());
  const cloud = normalizeBaseUrl(renderUrl);

  const urls = [];

  // 1. Explicit user override in .env (highest priority)
  if (explicit) {
    urls.push(explicit);
  }

  // 2. Active Tunnel (Ngrok) if active
  if (tunnel) {
    urls.push(tunnel);
  }

  // 3. Dynamic Metro LAN IP (Physical phones on Wi-Fi running Expo Go)
  if (metroLan) {
    urls.push(metroLan);
  }

  // 4. Platform-specific local loopback
  if (Platform.OS === 'android') {
    urls.push('http://10.0.2.2:5000'); // Android emulator host alias
    urls.push('http://localhost:5000');
  } else {
    urls.push('http://localhost:5000'); // iOS Simulator & Web
    urls.push('http://127.0.0.1:5000');
  }

  // 5. Cloud / Render Backend Fallback
  if (cloud) {
    urls.push(cloud);
  }

  return [...new Set(urls.filter(Boolean))];
};

let baseCandidates = buildBaseCandidates();
let activeBaseUrl = baseCandidates[0] || 'http://localhost:5000';
let userCustomUrl = null;

// Asynchronously load last verified working URL from storage
AsyncStorage.getItem(ACTIVE_BACKEND_STORAGE_KEY)
  .then((persisted) => {
    if (persisted && typeof persisted === 'string' && persisted.startsWith('http')) {
      const clean = normalizeBaseUrl(persisted);
      userCustomUrl = clean;
      activeBaseUrl = clean;
      if (!baseCandidates.includes(clean)) {
        baseCandidates.unshift(clean);
      }
    }
  })
  .catch(() => {});

const getBaseOrder = () => {
  const currentCandidates = buildBaseCandidates();
  if (userCustomUrl && !currentCandidates.includes(userCustomUrl)) {
    currentCandidates.unshift(userCustomUrl);
  }

  if (currentCandidates.join('|') !== baseCandidates.join('|')) {
    baseCandidates = currentCandidates;
    if (!baseCandidates.includes(activeBaseUrl)) {
      activeBaseUrl = baseCandidates[0] || '';
    }
  }

  return [...baseCandidates];
};

const shouldRetryResponse = (status) => status >= 500;

const buildApiUrlInternal = (baseUrl, path) => {
  if (!path) return baseUrl;
  if (/^https?:\/\//i.test(path)) return path;
  const safePath = String(path).startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${safePath}`;
};

export const buildApiUrl = (path = '') => buildApiUrlInternal(activeBaseUrl, path);
export const getActiveApiUrl = () => activeBaseUrl;
export const API_URL = activeBaseUrl;

/**
 * Manually set the active backend URL at runtime (e.g., from Developer Settings)
 */
export const setActiveApiUrl = async (newUrl, persist = true) => {
  const normalized = normalizeBaseUrl(newUrl);
  if (!normalized) return;

  activeBaseUrl = normalized;
  userCustomUrl = normalized;
  if (!baseCandidates.includes(normalized)) {
    baseCandidates.unshift(normalized);
  }

  if (persist) {
    try {
      await AsyncStorage.setItem(ACTIVE_BACKEND_STORAGE_KEY, normalized);
    } catch {}
  }
};

/**
 * Reset active backend to automatic discovery
 */
export const resetActiveApiUrl = async () => {
  userCustomUrl = null;
  baseCandidates = buildBaseCandidates();
  activeBaseUrl = baseCandidates[0] || 'http://localhost:5000';
  try {
    await AsyncStorage.removeItem(ACTIVE_BACKEND_STORAGE_KEY);
  } catch {}
};

/**
 * Get list of known environment presets for quick UI switching
 */
export const getBackendEnvironments = () => {
  const metro = normalizeBaseUrl(getMetroHost());
  const envExplicit = normalizeBaseUrl(envApiUrl);
  const cloud = normalizeBaseUrl(renderUrl);
  const tunnel = normalizeBaseUrl(envNgrokUrl || ngrokUrl);

  const options = [];

  if (metro) {
    options.push({ id: 'metro_lan', name: 'Auto LAN (Expo Metro)', url: metro, isCurrent: activeBaseUrl === metro });
  }

  if (envExplicit) {
    options.push({ id: 'env_explicit', name: 'Env Defined (.env)', url: envExplicit, isCurrent: activeBaseUrl === envExplicit });
  }

  if (Platform.OS === 'android') {
    options.push({ id: 'android_emu', name: 'Android Emulator (10.0.2.2:5000)', url: 'http://10.0.2.2:5000', isCurrent: activeBaseUrl === 'http://10.0.2.2:5000' });
  }

  options.push({ id: 'localhost', name: 'Localhost (5000)', url: 'http://localhost:5000', isCurrent: activeBaseUrl === 'http://localhost:5000' });

  if (tunnel) {
    options.push({ id: 'ngrok', name: 'Ngrok Tunnel', url: tunnel, isCurrent: activeBaseUrl === tunnel });
  }

  if (cloud) {
    options.push({ id: 'render', name: 'Render Cloud Backend', url: cloud, isCurrent: activeBaseUrl === cloud });
  }

  return options;
};

/**
 * Diagnostic health check against a target backend
 */
export const checkBackendHealth = async (urlToCheck) => {
  const target = normalizeBaseUrl(urlToCheck || activeBaseUrl);
  if (!target) return { ok: false, error: 'No backend URL defined' };

  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${target}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    const latency = Date.now() - start;
    let data = {};
    try {
      data = await response.json();
    } catch {}

    return {
      ok: response.ok,
      status: response.status,
      latency,
      components: data?.components || null,
      data,
      url: target,
    };
  } catch (err) {
    // Attempt fallback to root status endpoint
    try {
      const ping = await fetch(`${target}/`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const latency = Date.now() - start;
      const data = await ping.json().catch(() => ({}));
      return {
        ok: ping.ok,
        status: ping.status,
        latency,
        data,
        url: target,
      };
    } catch (fallbackErr) {
      return {
        ok: false,
        latency: Date.now() - start,
        error: err?.message || 'Connection failed',
        url: target,
      };
    }
  } finally {
    clearTimeout(timer);
  }
};

// ── Robust Core Fetcher with Fast Failover ──────────────────────────────────
export const apiFetch = async (path, options = {}, timeoutMs = 6000) => {
  const urls = getBaseOrder();
  if (!urls.length) {
    throw new Error('No API URL configured');
  }

  let lastError = null;

  for (let i = 0; i < urls.length; i += 1) {
    const baseUrl = urls[i];
    const isLast = i === urls.length - 1;

    // Fast failover (1800ms) for initial probes when multiple fallback candidates exist
    const effectiveTimeout = !isLast && urls.length > 1 ? Math.min(timeoutMs, 1800) : timeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), effectiveTimeout);

    try {
      const response = await fetch(buildApiUrlInternal(baseUrl, path), {
        ...options,
        signal: controller.signal,
      });

      if (response.ok || !shouldRetryResponse(response.status) || isLast) {
        if (activeBaseUrl !== baseUrl) {
          console.log('[api] switched active base URL to:', baseUrl);
          activeBaseUrl = baseUrl;
          AsyncStorage.setItem(ACTIVE_BACKEND_STORAGE_KEY, baseUrl).catch(() => {});
        }
        return response;
      }

      console.warn(`[api] ${baseUrl} returned ${response.status}, trying fallback...`);
      lastError = new Error(`API request failed with status ${response.status}`);
    } catch (error) {
      lastError = error;
      console.warn(`[api] ${baseUrl} request failed, trying fallback...`, error?.message || error);
      if (isLast) {
        throw error;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error('API request failed');
};

console.log('API candidates:', buildBaseCandidates().join(' | '));
console.log('API active URL:', activeBaseUrl);

// ── Application API Endpoints ────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const { signInWithSupabase } = require('./supabaseAuth');
  return await signInWithSupabase(email, password);
};

export const registerUser = async (name, email, password) => {
  const { signUpWithSupabase } = require('./supabaseAuth');
  return await signUpWithSupabase(name, email, password);
};

export const verifyEmail = async (email, code) => {
  try {
    const response = await apiFetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const socialLogin = async (payload) => {
  try {
    const response = await apiFetch('/api/auth/social-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getSessionStatus = async (token) => {
  try {
    const response = await apiFetch('/api/auth/session', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data?.message || 'Session check failed');
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await apiFetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Update failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadUserAvatar = async (userId, imageUri) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type,
    });

    const response = await apiFetch(`/api/users/${userId}/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Avatar upload failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
