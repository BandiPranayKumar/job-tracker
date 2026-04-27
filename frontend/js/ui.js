// js/ui.js
// Pure UI helper functions - no API calls here
// Syllabus: Frontend Unit IV - DOM Manipulation, Dynamic styling, Event delegation
// Syllabus: Frontend Unit II - Functions, Arrow functions, Template literals

// ── Toast Notifications ──────────────────────────────────────
// Dynamically creates and removes notification banners

export const showToast = (message, type = 'success') => {
  // Remove any existing toast
  document.querySelector('.toast')?.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i>
    <span>${escapeHTML(message)}</span>
  `;
  document.body.appendChild(toast);

  // Trigger fade-in (small delay so CSS transition fires)
  requestAnimationFrame(() => toast.classList.add('show'));

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// ── Loading State ─────────────────────────────────────────────

export const showLoading = (show) => {
  const loadingState = document.getElementById('loadingState');
  const table = document.getElementById('applicationsTable');
  const emptyState = document.getElementById('emptyState');

  if (!loadingState) return;

  if (show) {
    loadingState.classList.remove('hidden');
    table?.classList.add('hidden');
    emptyState?.classList.add('hidden');
  } else {
    loadingState.classList.add('hidden');
  }
};

// ── Layout Switching ─────────────────────────────────────────

export const showAuth = () => {
  document.getElementById('appLayout').classList.add('hidden');
  document.getElementById('authLayout').classList.remove('hidden');
};

export const showApp = (user) => {
  document.getElementById('authLayout').classList.add('hidden');
  document.getElementById('appLayout').classList.remove('hidden');

  const profileImg = document.querySelector('.user-profile img');
  if (profileImg && user) {
    profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`;
    profileImg.title = user.name;
  }
};

// ── Status Badge HTML ─────────────────────────────────────────

export const getStatusBadge = (status) => {
  const map = {
    Applied:   'badge-applied',
    Interview: 'badge-interview',
    Offer:     'badge-offer',
    Rejected:  'badge-rejected',
  };
  return `<span class="badge ${map[status] || ''}">${escapeHTML(status)}</span>`;
};

// ── Table Rendering ───────────────────────────────────────────
// Syllabus: Frontend Unit IV - DOM traversal, Dynamic content

export const renderTable = (applications) => {
  const tableBody = document.getElementById('tableBody');
  const table = document.getElementById('applicationsTable');
  const emptyState = document.getElementById('emptyState');

  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (applications.length === 0) {
    table?.classList.add('hidden');
    emptyState?.classList.remove('hidden');
    return;
  }

  table?.classList.remove('hidden');
  emptyState?.classList.add('hidden');

  // Build all rows using template literals + ES6 map
  const rows = applications.map((app) => `
    <tr>
      <td>
        <div class="company-cell">
          <div class="company-avatar">${escapeHTML(app.company.charAt(0))}</div>
          <strong>${escapeHTML(app.company)}</strong>
        </div>
      </td>
      <td>${escapeHTML(app.role)}</td>
      <td>${formatDate(app.date)}</td>
      <td>${getStatusBadge(app.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit" data-action="edit" data-id="${app._id}">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-icon delete" title="Delete" data-action="delete" data-id="${app._id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.innerHTML = rows;
};

// ── Dashboard Stats Cards ─────────────────────────────────────

export const updateSummaryCards = (stats) => {
  const fields = ['Total', 'Applied', 'Interview', 'Offer', 'Rejected'];
  fields.forEach((key) => {
    const el = document.getElementById(`target-${key.toLowerCase()}`);
    if (el) el.textContent = stats[key] ?? 0;
  });
};

// ── Chart Rendering ───────────────────────────────────────────

let chartInstance = null;

export const renderChart = (stats) => {
  const canvas = document.getElementById('statusChart');
  if (!canvas) return;

  const values = [stats.Applied, stats.Interview, stats.Offer, stats.Rejected];

  if (chartInstance) {
    chartInstance.data.datasets[0].data = values;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
      datasets: [{
        data: values,
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 12 } },
        },
      },
    },
  });
};

// ── Pagination Controls ───────────────────────────────────────

export const renderPagination = (currentPage, totalPages, onPageChange) => {
  const container = document.getElementById('paginationContainer');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<div class="pagination">`;
  html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
    <i class="fa-solid fa-chevron-left"></i>
  </button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
    <i class="fa-solid fa-chevron-right"></i>
  </button>`;
  html += `</div>`;

  container.innerHTML = html;

  // Event delegation: one listener handles all page buttons
  container.querySelectorAll('.page-btn:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => onPageChange(parseInt(btn.dataset.page)));
  });
};

// ── Utilities ─────────────────────────────────────────────────

// Prevents XSS attacks by escaping user input before inserting into DOM
export const escapeHTML = (str) => {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[tag] || tag));
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};
