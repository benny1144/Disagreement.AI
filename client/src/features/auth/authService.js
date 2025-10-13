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

  // 4) In the browser, choose the best base:
  try {
    const locOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    const locHost = locOrigin ? new URL(locOrigin).host : '';
    const baseHost = base ? new URL(base).host : '';

    const isClientRenderHost = (h) => /disagreement-ai-client\.onrender\.com$/i.test(h || '');
    const isProdDomain = (h) => /(^|\.)disagreement\.ai$/i.test(h || '');

    // If an explicit base is provided and it's NOT the client host, prefer it (even on disagreement.ai)
    if (base && baseHost && !isClientRenderHost(baseHost)) {
      return base;
    }

    // Avoid using the client Render host as API base
    if (base && baseHost && isClientRenderHost(baseHost)) {
      // Prefer same-origin when available, or fall back to relative so the runtime origin is used
      return locOrigin || '';
    }

    // If on the production domain and no reliable explicit base, use same-origin
    if (locHost && isProdDomain(locHost)) {
      return locOrigin;
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
const AXIOS_DEFAULTS = { withCredentials: false, timeout: 8000 };
// Diagnostic: show where auth requests will go
try { console.log(`[authService] API base: ${API_BASE || '(relative origin)'}; URL prefix: ${API_URL}`); } catch (_) {}

// Warn if running on disagreement.ai without explicit API base (likely no API under this host)
try {
  const loc = typeof window !== 'undefined' ? window.location : undefined;
  if (loc && /(^|\.)disagreement\.ai$/i.test(loc.host) && (!API_BASE || API_BASE === loc.origin)) {
    console.warn('[authService] No explicit API base configured. Using same-origin on disagreement.ai, which likely has no API proxy. Set VITE_API_URL to your backend base (e.g., https://your-backend.example.com).');
  }
} catch (_) {}

// One-time guard to prevent silent failures when API base isn't configured on disagreement.ai
let __apiGuardShown = false;
function shouldGuardApiBase() {
  try {
    const loc = typeof window !== 'undefined' ? window.location : undefined;
    return !!(loc && /(^|\.)disagreement\.ai$/i.test(loc.host) && (!API_BASE || API_BASE === loc.origin));
  } catch (_) {
    return false;
  }
}
async function probeHealth(url) {
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : undefined;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 1800) : undefined;
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: ctrl?.signal });
    return !!(res && res.ok);
  } catch (_) {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
async function ensureApiBaseReady() {
  if (!shouldGuardApiBase()) return;
  const ok = await probeHealth('/api/health');
  if (!ok) {
    if (!__apiGuardShown) {
      __apiGuardShown = true;
      try {
        console.warn('[authService] API base appears unconfigured for disagreement.ai. Set VITE_API_URL to your backend base (e.g., https://your-backend.example.com). Blocking auth requests to avoid hangs.');
      } catch (_) {}
    }
    const err = new Error('API not reachable at this origin. Set VITE_API_URL to your backend base and redeploy the client.');
    // @ts-ignore add a code for upstream handlers if they want
    err.code = 'API_BASE_UNCONFIGURED';
    throw err;
  }
}

// Register user
export const register = async (userData) => {
  const url = `${API_URL}register`;
  try {
    await ensureApiBaseReady();
    try { console.log('[authService] POST', url, { email: userData?.email }); } catch(_){}
    const response = await axios.post(url, userData, AXIOS_DEFAULTS);
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
    await ensureApiBaseReady();
    try { console.log('[authService] POST', url, { email: userData?.email }); } catch(_){}
    const response = await axios.post(url, userData, AXIOS_DEFAULTS);
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
