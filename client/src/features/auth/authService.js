import axios from 'axios';

// Resolve API base URL robustly across environments (Vite/Render/legacy NEXT_* vars)
function resolveApiBase() {
  // 1) Vite envs
  const vite = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  let base = vite.VITE_API_URL || vite.NEXT_PUBLIC_API_URL || '';

  // 2) Window-injected env objects (if any)
  if (!base && typeof globalThis !== 'undefined') {
    const w = /** @type {any} */ (globalThis.window || {});
    base = w?.ENV?.VITE_API_URL || w?.ENV?.NEXT_PUBLIC_API_URL || '';
  }

  // 3) Normalize
  base = (base || '').toString().trim().replace(/\/$/, '');

  // 4) In the browser, prefer safe same-origin defaults and avoid using the client host as API
  try {
    const locOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    const locHost = locOrigin ? new URL(locOrigin).host : '';
    const baseHost = base ? new URL(base).host : '';

    // If we are on the production domain, force same-origin calls to avoid CORS and misconfigured envs
    if (locHost && /(^|\.)disagreement\.ai$/i.test(locHost)) {
      return locOrigin;
    }

    // If the configured base points to the client Render host, avoid it
    if (baseHost && /disagreement-ai-client\.onrender\.com$/i.test(baseHost)) {
      // Prefer same-origin when available, or fall back to relative so the runtime origin is used
      return locOrigin || '';
    }

    // If the configured base matches the current host, keep it
    if (base && baseHost && locHost && baseHost === locHost) {
      return base;
    }
  } catch (_) {
    // Ignore URL parsing issues and fall through
  }

  return base;
}

const API_BASE = resolveApiBase();
const API_URL = API_BASE ? `${API_BASE}/api/users/` : '/api/users/';
// Diagnostic: show where auth requests will go
try { console.log(`[authService] API base: ${API_BASE || '(relative origin)'}; URL prefix: ${API_URL}`); } catch (_) {}

// Register user
export const register = async (userData) => {
  const url = `${API_URL}register`;
  try {
    try { console.log('[authService] POST', url, { email: userData?.email }); } catch(_){}
    const response = await axios.post(url, userData, { withCredentials: false });
    if (response?.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (err) {
    try { console.error('[authService] register failed', err?.response?.status, err?.response?.data || err?.message); } catch(_){}
    throw err;
  }
};

// Login user
export const login = async (userData) => {
  const url = `${API_URL}login`;
  try {
    try { console.log('[authService] POST', url, { email: userData?.email }); } catch(_){}
    const response = await axios.post(url, userData, { withCredentials: false });
    if (response?.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (err) {
    try { console.error('[authService] login failed', err?.response?.status, err?.response?.data || err?.message); } catch(_){}
    throw err;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};

const authService = { register, login, logout };
export default authService;
