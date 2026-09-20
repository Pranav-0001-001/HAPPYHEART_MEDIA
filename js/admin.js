/**
 * HAPPY HEART MEDIA — Admin Dashboard JavaScript
 * Handles admin-only submission viewing, filtering, and status updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenuAdmin();
  verifyAdminAccess();
});

let allSubmissions = [];

/* ---------- Verify Admin Access ---------- */
async function verifyAdminAccess() {
  const loading = document.getElementById('adminLoading');
  const denied = document.getElementById('adminDenied');
  const dashboard = document.getElementById('adminDashboard');

  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();

    if (!data.user || data.user.role !== 'admin') {
      loading.style.display = 'none';
      denied.style.display = 'block';
      return;
    }

    // Show dashboard
    loading.style.display = 'none';
    dashboard.style.display = 'block';

    document.getElementById('adminUserName').textContent = data.user.name + ' • ' + data.user.email;

    // Load submissions
    await loadSubmissions();

    // Init filters
    initAdminFilters();

    // Init logout
    initAdminLogout();

  } catch (err) {
    loading.style.display = 'none';
    denied.style.display = 'block';
  }
}

/* ---------- Load Submissions ---------- */
async function loadSubmissions() {
  try {
    const res = await fetch('/api/submissions');
    const data = await res.json();
    allSubmissions = data.submissions || [];
    updateStats();
    renderSubmissions(allSubmissions);
  } catch (err) {
    console.error('Failed to load submissions:', err);
  }
}

/* ---------- Stats ---------- */
function updateStats() {
  document.getElementById('statTotal').textContent = allSubmissions.length;
  document.getElementById('statNew').textContent = allSubmissions.filter(s => s.status === 'New Request').length;
  document.getElementById('statProgress').textContent = allSubmissions.filter(s => s.status === 'In Progress').length;
  document.getElementById('statCompleted').textContent = allSubmissions.filter(s => s.status === 'Completed').length;
}

/* ---------- Render Submissions ---------- */
function renderSubmissions(submissions) {
  const container = document.getElementById('adminSubmissionsList');
  if (!container) return;

  if (submissions.length === 0) {
    container.innerHTML = `
      <div class="admin-empty">
        <div class="admin-empty-icon">📋</div>
        <h3>No submissions found</h3>
        <p>Client submissions will appear here once they submit project requirements.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = submissions.map(sub => {
    const statusClass = getStatusClass(sub.status);
    const createdDate = new Date(sub.created_at + 'Z').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <div class="admin-submission-card" data-status="${escapeHtml(sub.status)}" data-id="${sub.id}">
        <div class="admin-sub-toprow">
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <span class="admin-sub-ticket">${escapeHtml(sub.ticket_id)}</span>
            <span class="admin-sub-status ${statusClass}">${escapeHtml(sub.status)}</span>
          </div>
          <span class="admin-sub-date">${createdDate}</span>
        </div>

        <h3 class="admin-sub-title">${escapeHtml(sub.title)}</h3>
        <p class="admin-sub-desc">${escapeHtml(sub.description)}</p>

        <div class="admin-sub-meta-grid">
          <div class="admin-sub-meta-item"><strong>Service:</strong> ${escapeHtml(sub.service)}</div>
          <div class="admin-sub-meta-item"><strong>Budget:</strong> ${escapeHtml(sub.budget || 'Not specified')}</div>
          <div class="admin-sub-meta-item"><strong>Timeline:</strong> ${escapeHtml(sub.timeline)}</div>
          <div class="admin-sub-meta-item"><strong>Client:</strong> ${escapeHtml(sub.client_name)}</div>
          <div class="admin-sub-meta-item"><strong>Email:</strong> ${escapeHtml(sub.client_email)}</div>
          <div class="admin-sub-meta-item"><strong>Phone:</strong> ${escapeHtml(sub.client_phone || 'N/A')}</div>
          <div class="admin-sub-meta-item"><strong>Company:</strong> ${escapeHtml(sub.client_company || 'Individual')}</div>
          <div class="admin-sub-meta-item"><strong>Contact Via:</strong> ${escapeHtml(sub.preferred_contact || 'WhatsApp')}</div>
          ${sub.links ? `<div class="admin-sub-meta-item"><strong>Links:</strong> <a href="${escapeHtml(sub.links)}" target="_blank" style="color:var(--gold-primary);">${escapeHtml(sub.links)}</a></div>` : ''}
          ${sub.user_name ? `<div class="admin-sub-meta-item"><strong>Account:</strong> ${escapeHtml(sub.user_name)} (${escapeHtml(sub.user_email)})</div>` : ''}
        </div>

        <div class="admin-sub-actions">
          <select class="admin-status-select" data-sub-id="${sub.id}">
            <option value="New Request" ${sub.status === 'New Request' ? 'selected' : ''}>New Request</option>
            <option value="In Progress" ${sub.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${sub.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="On Hold" ${sub.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
            <option value="Cancelled" ${sub.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <button class="admin-update-btn" onclick="updateStatus(${sub.id}, this)">Update Status</button>
        </div>
      </div>
    `;
  }).join('');
}

/* ---------- Update Status ---------- */
async function updateStatus(subId, btn) {
  const card = btn.closest('.admin-submission-card');
  const select = card.querySelector('.admin-status-select');
  const newStatus = select.value;

  btn.textContent = '⏳ Updating...';
  btn.disabled = true;

  try {
    const res = await fetch(`/api/submissions/${subId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      // Update local data
      const sub = allSubmissions.find(s => s.id === subId);
      if (sub) sub.status = newStatus;

      card.setAttribute('data-status', newStatus);
      const statusBadge = card.querySelector('.admin-sub-status');
      statusBadge.textContent = newStatus;
      statusBadge.className = `admin-sub-status ${getStatusClass(newStatus)}`;

      updateStats();
      btn.textContent = '✓ Updated';
      setTimeout(() => {
        btn.textContent = 'Update Status';
        btn.disabled = false;
      }, 1500);
    } else {
      btn.textContent = '✗ Failed';
      btn.disabled = false;
    }
  } catch (err) {
    btn.textContent = '✗ Error';
    btn.disabled = false;
  }
}

/* ---------- Filters ---------- */
function initAdminFilters() {
  const searchInput = document.getElementById('adminSearch');
  const statusFilter = document.getElementById('adminStatusFilter');
  const serviceFilter = document.getElementById('adminServiceFilter');

  const applyFilters = () => {
    const query = (searchInput.value || '').toLowerCase().trim();
    const statusVal = statusFilter.value;
    const serviceVal = serviceFilter.value;

    const filtered = allSubmissions.filter(sub => {
      // Status filter
      if (statusVal !== 'all' && sub.status !== statusVal) return false;

      // Service filter
      if (serviceVal !== 'all' && sub.service !== serviceVal) return false;

      // Search query
      if (query) {
        const searchable = [
          sub.ticket_id, sub.title, sub.description,
          sub.client_name, sub.client_email, sub.client_company,
          sub.service, sub.budget, sub.user_name, sub.user_email
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      return true;
    });

    renderSubmissions(filtered);
  };

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  serviceFilter.addEventListener('change', applyFilters);
}

/* ---------- Logout ---------- */
function initAdminLogout() {
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
      window.location.href = 'auth.html';
    });
  }
}

/* ---------- Helpers ---------- */
function getStatusClass(status) {
  switch (status) {
    case 'New Request': return 'status-new';
    case 'In Progress': return 'status-progress';
    case 'Completed':   return 'status-completed';
    case 'On Hold':     return 'status-hold';
    case 'Cancelled':   return 'status-cancelled';
    default:            return 'status-new';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function initMobileMenuAdmin() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }
}
