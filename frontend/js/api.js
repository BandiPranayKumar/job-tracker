// js/api.js
// Centralized API service module - all backend communication goes here
// Syllabus: Frontend Unit III - ES6+ modules, Promises, async/await
// Syllabus: Frontend Unit III - Fetch API (browser's built-in HTTP client)

const BASE_URL = 'http://localhost:5000/api';

// ── Token Management ──────────────────────────────────────────
// Store JWT in localStorage; attach to every protected request

export const getToken = () => localStorage.getItem('jt_token');

const saveToken = (token) => localStorage.setItem('jt_token', token);

export const clearToken = () => localStorage.removeItem('jt_token');

// ── Core Fetch Helper ──────────────────────────────────────────
// A reusable async function that wraps fetch with common config
// Throws an error if the response is not OK (4xx/5xx)

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // If a token exists, add it as a Bearer token in Authorization header
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  // If the response was not successful, throw with the server's message
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
};

// ── Auth API ──────────────────────────────────────────────────

export const authAPI = {
  // POST /api/auth/register
  register: async (name, email, password) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    saveToken(data.token);
    return data;
  },

  // POST /api/auth/login
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveToken(data.token);
    return data;
  },

  // GET /api/auth/me
  getMe: () => request('/auth/me'),
};

// ── Applications API ──────────────────────────────────────────

export const applicationsAPI = {
  // GET /api/applications  (with optional query params for search/filter/sort/page)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/applications${queryString ? '?' + queryString : ''}`);
  },

  // GET /api/applications/stats
  getStats: () => request('/applications/stats'),

  // POST /api/applications
  create: (applicationData) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    }),

  // PUT /api/applications/:id
  update: (id, applicationData) =>
    request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    }),

  // DELETE /api/applications/:id
  delete: (id) =>
    request(`/applications/${id}`, {
      method: 'DELETE',
    }),
};
