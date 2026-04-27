// js/app.js
// Main application entry point - orchestrates auth, navigation, CRUD
// Syllabus: Frontend Unit III - ES6 modules, async/await, Closures
// Syllabus: Frontend Unit IV - DOM manipulation, Event propagation & delegation
// Syllabus: Frontend Unit II - Variables, Scope, Event handling

import { authAPI, applicationsAPI, getToken, clearToken } from './api.js';
import {
  showAuth,
  showApp,
  showLoading,
  showToast,
  renderTable,
  updateSummaryCards,
  renderChart,
  renderPagination,
  escapeHTML,
} from './ui.js';

// ── App State ─────────────────────────────────────────────────
// Centralized state object (single source of truth)
const state = {
  currentUser: null,
  editId: null,         // null = adding new, string = editing existing
  currentPage: 1,
  totalPages: 1,
};

// ── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupEventListeners();
  checkAuth();
});

// Check if user is already logged in (token in localStorage)
const checkAuth = async () => {
  const token = getToken();
  if (!token) {
    showAuth();
    return;
  }

  try {
    const { user } = await authAPI.getMe();
    state.currentUser = user;
    showApp(user);
    loadDashboard();
  } catch {
    // Token expired or invalid — send back to login
    clearToken();
    showAuth();
  }
};

// ── Auth Handlers ─────────────────────────────────────────────

const handleLogin = async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging In...';
  btn.disabled = true;

  try {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { user } = await authAPI.login(email, password);
    state.currentUser = user;
    e.target.reset();
    showApp(user);
    loadDashboard();
    showToast(`Welcome back, ${user.name}!`);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = 'Log In';
    btn.disabled = false;
  }
};

const handleRegister = async (e) => {
  e.preventDefault();
  const btn = document.getElementById('signupBtn');
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing Up...';
  btn.disabled = true;

  try {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const { user } = await authAPI.register(name, email, password);
    state.currentUser = user;
    e.target.reset();
    showApp(user);
    loadDashboard();
    showToast(`Welcome, ${user.name}! Account created.`);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = 'Sign Up';
    btn.disabled = false;
  }
};

const handleLogout = (e) => {
  e.preventDefault();
  if (confirm('Are you sure you want to log out?')) {
    clearToken();
    state.currentUser = null;
    showAuth();
  }
};

// ── Data Loading ──────────────────────────────────────────────

// Load both stats (dashboard cards/chart) and the application list
const loadDashboard = async () => {
  try {
    const { data: stats } = await applicationsAPI.getStats();
    updateSummaryCards(stats);
    renderChart(stats);
  } catch (err) {
    showToast('Failed to load dashboard stats.', 'error');
  }
};

const loadApplications = async (page = 1) => {
  showLoading(true);
  try {
    const search = document.getElementById('searchInput')?.value || '';
    const status = document.getElementById('filterStatus')?.value || 'All';
    const sort   = document.getElementById('sortBy')?.value || 'date-desc';

    const response = await applicationsAPI.getAll({ search, status, sort, page, limit: 10 });

    state.currentPage = response.currentPage;
    state.totalPages  = response.totalPages;

    renderTable(response.data);
    renderPagination(state.currentPage, state.totalPages, (newPage) => {
      loadApplications(newPage);
    });

    // Also refresh dashboard stats when applications change
    await loadDashboard();
  } catch (err) {
    showToast('Failed to load applications.', 'error');
  } finally {
    showLoading(false);
  }
};

// ── Modal ─────────────────────────────────────────────────────

const openModal = (appId = null, appData = null) => {
  state.editId = appId;
  const modal = document.getElementById('appModal');
  const modalTitle = document.getElementById('modalTitle');

  if (appId && appData) {
    // Pre-fill form with existing data for editing
    document.getElementById('company').value = appData.company;
    document.getElementById('role').value = appData.role;
    document.getElementById('date').value = appData.date?.split('T')[0] ?? '';
    document.getElementById('status').value = appData.status;
    document.getElementById('notes').value = appData.notes || '';
    modalTitle.textContent = 'Edit Application';
  } else {
    document.getElementById('appForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    modalTitle.textContent = 'New Application';
  }

  modal.classList.remove('hidden');
};

const closeModal = () => {
  document.getElementById('appModal').classList.add('hidden');
  document.getElementById('appForm').reset();
  state.editId = null;
};

const handleFormSubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById('saveModalBtn');
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';
  btn.disabled = true;

  const applicationData = {
    company: document.getElementById('company').value.trim(),
    role:    document.getElementById('role').value.trim(),
    date:    document.getElementById('date').value,
    status:  document.getElementById('status').value,
    notes:   document.getElementById('notes').value.trim(),
  };

  try {
    if (state.editId) {
      await applicationsAPI.update(state.editId, applicationData);
      showToast('Application updated successfully!');
    } else {
      await applicationsAPI.create(applicationData);
      showToast('Application added successfully!');
    }
    closeModal();
    await loadApplications(state.currentPage);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = 'Save Application';
    btn.disabled = false;
  }
};

// ── Event Delegation for Table Actions ────────────────────────
// One listener on the table body handles all Edit + Delete clicks
// Syllabus: Frontend Unit IV - Event propagation and delegation

const handleTableAction = async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;

  if (action === 'edit') {
    try {
      // Fetch the full application data from the API
      const { data } = await applicationsAPI.getAll({ search: '', status: 'All' });
      const app = data.find((a) => a._id === id);
      if (app) openModal(id, app);
    } catch {
      showToast('Could not load application data.', 'error');
    }
  }

  if (action === 'delete') {
    if (confirm('Delete this application? This cannot be undone.')) {
      try {
        await applicationsAPI.delete(id);
        showToast('Application deleted.');
        await loadApplications(state.currentPage);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }
};

// ── Navigation ────────────────────────────────────────────────
// Syllabus: Frontend Unit IV - DOM traversal, Hash-based routing

const setupNavigation = () => {
  window.addEventListener('hashchange', handleHashChange);
  if (!window.location.hash) window.location.hash = 'dashboard';
  else handleHashChange();
};

const handleHashChange = () => {
  const validViews = ['dashboard', 'applications', 'reminders', 'settings'];
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  const targetView = validViews.includes(hash) ? hash : 'dashboard';

  // Update active nav link
  document.querySelectorAll('#sidebarNav .nav-item').forEach((nav) => {
    nav.classList.toggle('active', nav.dataset.view === targetView);
  });

  // Show/hide view sections
  document.querySelectorAll('.view-section').forEach((section) => {
    section.classList.toggle('hidden', section.id !== `view-${targetView}`);
  });

  // Update header text
  const titles = {
    dashboard:    ['Dashboard', "Welcome back! Here's your application overview."],
    applications: ['Applications', 'Manage and track all your job applications.'],
    reminders:    ['Reminders', 'Stay on top of your follow-ups and interviews.'],
    settings:     ['Settings', 'Configure your job tracker preferences.'],
  };
  const [title, desc] = titles[targetView] || titles.dashboard;
  document.getElementById('pageTitle').textContent  = title;
  document.getElementById('pageDesc').textContent   = desc;

  // Load data for the active view
  if (targetView === 'applications') loadApplications(1);
  if (targetView === 'dashboard') loadDashboard();
};

// ── Event Listeners ───────────────────────────────────────────

const setupEventListeners = () => {
  // Auth forms
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('signupForm')?.addEventListener('submit', handleRegister);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Auth tab switching
  document.getElementById('tabLogin')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tabSignup')?.addEventListener('click', () => switchAuthTab('signup'));

  // Modal
  document.getElementById('openAddModalBtn')?.addEventListener('click', () => openModal());
  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('appForm')?.addEventListener('submit', handleFormSubmit);

  // Close modal when clicking the dark overlay
  document.getElementById('appModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'appModal') closeModal();
  });

  // Table event delegation
  document.getElementById('tableBody')?.addEventListener('click', handleTableAction);

  // Search & filter — debounce search to avoid API call on every keystroke
  let searchTimeout;
  document.getElementById('searchInput')?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadApplications(1), 400);
  });
  document.getElementById('filterStatus')?.addEventListener('change', () => loadApplications(1));
  document.getElementById('sortBy')?.addEventListener('change', () => loadApplications(1));

  // Settings: clear all data
  document.getElementById('clearDataBtn')?.addEventListener('click', async () => {
    if (confirm('Delete ALL your applications? This cannot be undone.')) {
      showToast('This feature requires deleting each application individually via the API.', 'error');
    }
  });
};

// ── Auth Tab UI ───────────────────────────────────────────────

const switchAuthTab = (tab) => {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('signupForm').classList.toggle('hidden', isLogin);
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabSignup').classList.toggle('active', !isLogin);
  document.querySelector('.auth-header p').textContent = isLogin
    ? 'Welcome back! Please enter your details.'
    : 'Create an account to start tracking.';
};
