/**
 * Tiny fetch wrapper for the QIMA API.
 *
 * Dev:  VITE_API_URL empty → calls /api/... which Vite proxies to :5000
 * Prod: VITE_API_URL=https://api.qima.qa
 */
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const TOKEN_KEY = 'qima_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the server. Is the API running?', 0);
  }

  if (res.status === 204) return null;

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && auth) clearToken();
    throw new ApiError(payload.error || `Request failed (${res.status})`, res.status);
  }

  return payload;
}

/* ----------------------------------------------------------- public API --- */
export const api = {
  about: {
    getAll: (signal) => request('/about', { signal }),
    get: (key) => request(`/about/${key}`),
  },
  banners: {
    list: (signal) => request('/banners', { signal }),
  },
  team: {
    list: (signal) => request('/team', { signal }),
  },
  events: {
    list: (params = '', signal) => request(`/events${params}`, { signal }),
    grouped: (signal) => request('/events/grouped', { signal }),
  },
  gallery: {
    list: (signal) => request('/gallery', { signal }),
  },
  settings: {
    getAll: (signal) => request('/settings', { signal }),
  },
  contact: {
    send: (data) => request('/contact', { method: 'POST', body: data }),
  },
};

/* ------------------------------------------------------------ admin API --- */
export const adminApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me', { auth: true }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', auth: true, body: { currentPassword, newPassword } }),

  about: {
    list: () => request('/about'),
    save: (key, data) => request(`/about/${key}`, { method: 'PUT', auth: true, body: data }),
    saveAll: (sections) => request('/about', { method: 'PUT', auth: true, body: { sections } }),
    remove: (key) => request(`/about/${key}`, { method: 'DELETE', auth: true }),
  },
  banners: {
    list: () => request('/banners?all=true'),
    create: (data) => request('/banners', { method: 'POST', auth: true, body: data }),
    update: (id, data) => request(`/banners/${id}`, { method: 'PUT', auth: true, body: data }),
    toggle: (id) => request(`/banners/${id}/toggle`, { method: 'PATCH', auth: true }),
    remove: (id) => request(`/banners/${id}`, { method: 'DELETE', auth: true }),
  },
  team: {
    list: () => request('/team'),
    create: (data) => request('/team', { method: 'POST', auth: true, body: data }),
    update: (id, data) => request(`/team/${id}`, { method: 'PUT', auth: true, body: data }),
    remove: (id) => request(`/team/${id}`, { method: 'DELETE', auth: true }),
  },
  events: {
    list: () => request('/events'),
    create: (data) => request('/events', { method: 'POST', auth: true, body: data }),
    update: (id, data) => request(`/events/${id}`, { method: 'PUT', auth: true, body: data }),
    remove: (id) => request(`/events/${id}`, { method: 'DELETE', auth: true }),
  },
  gallery: {
    list: () => request('/gallery'),
    create: (data) => request('/gallery', { method: 'POST', auth: true, body: data }),
    update: (id, data) => request(`/gallery/${id}`, { method: 'PUT', auth: true, body: data }),
    remove: (id) => request(`/gallery/${id}`, { method: 'DELETE', auth: true }),
  },
  settings: {
    getAll: () => request('/settings'),
    saveAll: (settings) => request('/settings', { method: 'PUT', auth: true, body: { settings } }),
  },
  messages: {
    list: () => request('/contact', { auth: true }),
    markRead: (id) => request(`/contact/${id}/read`, { method: 'PATCH', auth: true }),
    remove: (id) => request(`/contact/${id}`, { method: 'DELETE', auth: true }),
  },
};

export default api;
