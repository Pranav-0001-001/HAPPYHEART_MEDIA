/**
 * HAPPY HEART MEDIA — Developer & Admin Orders JavaScript
 * Features:
 * - Developer & Admin session validation & 1-click Dev login
 * - Tab switching (Orders, Analytics, Dev Tools)
 * - Real-time search, status filtering, and sorting
 * - Order status updating & order deletion
 * - Demo test order seeding
 * - Order modal view & brief printing
 * - Exporting orders to JSON & CSV
 */

const API_BASE_URL = window.API_BASE_URL || '';
let allSubmissions = [];
let activeStatusFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenuAdmin();
  initAdminTabs();
  initAdminLoginForm();
  verifyAdminAccess();
});

/* ---------- Verify Admin Access ---------- */
async function verifyAdminAccess() {
  const loading = document.getElementById('adminLoading');
  const denied = document.getElementById('adminDenied');
  const dashboard = document.getElementById('adminDashboard');

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
    const data = await res.json();

    const isDev = data.user && (data.user.role === 'admin' || data.user.email.toLowerCase() === 'karandarade131@gmail.com');

    if (!isDev) {
      if (loading) loading.style.display = 'none';
      if (denied) denied.style.display = 'block';
      if (dashboard) dashboard.style.display = 'none';
      return;
    }

    // Admin verified
    if (loading) loading.style.display = 'none';
    if (denied) denied.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';

    const userLabel = document.getElementById('adminUserName');
    if (userLabel) {
      userLabel.textContent = `${data.user.name} • ${data.user.email}`;
    }

    // Load submissions
    await loadSubmissions();

    // Init controls
    initAdminControls();

    // Init logout
    initAdminLogout();

  } catch (err) {
    if (loading) loading.style.display = 'none';
    if (denied) denied.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
  }
}

/* ---------- Secure Developer Sign-in ---------- */
function initAdminLoginForm() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('adminLoginSubmitBtn');
    const errBox = document.getElementById('adminLoginError');
    const email = document.getElementById('adminEmailInput').value.trim();
    const password = document.getElementById('adminPasswordInput').value;

    if (errBox) {
      errBox.style.display = 'none';
      errBox.textContent = '';
    }

    btn.disabled = true;
    btn.textContent = '⏳ Verifying credentials...';

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        btn.textContent = '✓ Access Granted! Loading...';
        setTimeout(() => {
          verifyAdminAccess();
        }, 400);
      } else {
        if (errBox) {
          errBox.textContent = data.error || 'Invalid credentials.';
          errBox.style.display = 'block';
        }
        btn.disabled = false;
        btn.textContent = '🔓 Authenticate & Access Orders';
      }
    } catch (err) {
      if (errBox) {
        errBox.textContent = 'Network error during authentication.';
        errBox.style.display = 'block';
      }
      btn.disabled = false;
      btn.textContent = '🔓 Authenticate & Access Orders';
    }
  });
}

/* ---------- Tab Switching inside Admin ---------- */
function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = tab.getAttribute('data-target');
      document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = 'none';
      });

      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = 'block';
      }

      if (targetId === 'analyticsTab') {
        renderAnalytics();
      } else if (targetId === 'devtoolsTab') {
        renderDevTools();
      }
    });
  });
}

/* ---------- Load Submissions ---------- */
async function loadSubmissions() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/submissions`, { credentials: 'include' });
    const data = await res.json();
    allSubmissions = data.submissions || [];
    
    updateStats();
    applyAdminFilters();
    renderAnalytics();
    renderDevTools();
  } catch (err) {
    console.error('Failed to load submissions:', err);
  }
}

/* ---------- Update Stats ---------- */
function updateStats() {
  const total = allSubmissions.length;
  const newCount = allSubmissions.filter(s => s.status === 'New Request').length;
  const progressCount = allSubmissions.filter(s => s.status === 'In Progress').length;
  const completedCount = allSubmissions.filter(s => s.status === 'Completed').length;
  const holdCount = allSubmissions.filter(s => s.status === 'On Hold').length;

  const statTotal = document.getElementById('statTotal');
  const statNew = document.getElementById('statNew');
  const statProgress = document.getElementById('statProgress');
  const statCompleted = document.getElementById('statCompleted');
  const statHold = document.getElementById('statHold');
  const ordersTabCount = document.getElementById('ordersTabCount');

  if (statTotal) statTotal.textContent = total;
  if (statNew) statNew.textContent = newCount;
  if (statProgress) statProgress.textContent = progressCount;
  if (statCompleted) statCompleted.textContent = completedCount;
  if (statHold) statHold.textContent = holdCount;
  if (ordersTabCount) ordersTabCount.textContent = total;
}

/* ---------- Render Submissions List ---------- */
function renderSubmissions(submissions) {
  const container = document.getElementById('adminSubmissionsList');
  if (!container) return;

  if (submissions.length === 0) {
    container.innerHTML = `
      <div class="admin-empty">
        <div class="admin-empty-icon">📋</div>
        <h3>No matching orders found</h3>
        <p>Try adjusting your search criteria or click "⚡ Add Demo Order" to generate a sample order.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = submissions.map(sub => {
    const statusClass = getStatusClass(sub.status);
    const dateObj = new Date(sub.created_at);
    const createdDate = isNaN(dateObj.getTime()) ? 'Recent' : dateObj.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const cleanPhone = (sub.client_phone || '').replace(/[^0-9]/g, '');
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

    return `
      <div class="admin-submission-card" data-status="${escapeHtml(sub.status)}" data-id="${sub.id}">
        <div class="admin-sub-toprow">
          <div class="admin-sub-ticket-wrap">
            <span class="admin-sub-ticket">${escapeHtml(sub.ticket_id)}</span>
            <button class="admin-copy-btn" onclick="copyTicket('${escapeHtml(sub.ticket_id)}', this)" title="Copy Ticket ID">📋 Copy</button>
            <span class="admin-sub-status ${statusClass}">${escapeHtml(sub.status)}</span>
          </div>
          <span class="admin-sub-date">📅 ${createdDate}</span>
        </div>

        <h3 class="admin-sub-title">${escapeHtml(sub.title)}</h3>
        <div class="admin-sub-desc">${escapeHtml(sub.description)}</div>

        <div class="admin-sub-meta-grid">
          <div class="admin-sub-meta-item">
            <span class="meta-label">Client Name</span>
            <strong>${escapeHtml(sub.client_name)}</strong>
          </div>
          <div class="admin-sub-meta-item">
            <span class="meta-label">Company / Brand</span>
            <strong>${escapeHtml(sub.client_company || 'Individual Client')}</strong>
          </div>
          <div class="admin-sub-meta-item">
            <span class="meta-label">Service Required</span>
            <strong style="color:var(--gold-primary);">${escapeHtml(sub.service)}</strong>
          </div>
          <div class="admin-sub-meta-item">
            <span class="meta-label">Budget Estimate</span>
            <strong>${escapeHtml(sub.budget || 'Not specified')}</strong>
          </div>
          <div class="admin-sub-meta-item">
            <span class="meta-label">Target Timeline</span>
            <strong>${escapeHtml(sub.timeline)}</strong>
          </div>
          <div class="admin-sub-meta-item">
            <span class="meta-label">Contact Channels</span>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
              <a href="mailto:${escapeHtml(sub.client_email)}" class="contact-link-badge contact-mail">✉️ ${escapeHtml(sub.client_email)}</a>
              ${waLink ? `<a href="${waLink}" target="_blank" class="contact-link-badge contact-wa">💬 WhatsApp</a>` : ''}
            </div>
          </div>
          ${sub.links ? `
            <div class="admin-sub-meta-item" style="grid-column: 1 / -1;">
              <span class="meta-label">Project Attachments / Links</span>
              <strong><a href="${escapeHtml(sub.links)}" target="_blank" style="color:var(--gold-primary); word-break:break-all;">🔗 ${escapeHtml(sub.links)}</a></strong>
            </div>
          ` : ''}
        </div>

        <div class="admin-sub-actions">
          <div class="admin-action-group">
            <label style="font-size:0.8rem; color:var(--text-dim,#777); font-weight:700;">Status:</label>
            <select class="admin-status-select" data-sub-id="${sub.id}">
              <option value="New Request" ${sub.status === 'New Request' ? 'selected' : ''}>New Request</option>
              <option value="In Progress" ${sub.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${sub.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="On Hold" ${sub.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
              <option value="Cancelled" ${sub.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="admin-update-btn" onclick="updateOrderStatus(${sub.id}, this)">Update</button>
          </div>

          <div class="admin-action-group">
            <button class="admin-btn-outline" onclick="openOrderModal(${sub.id})">🔍 View Brief</button>
            <button class="admin-btn-outline" onclick="printOrderBrief(${sub.id})">🖨️ Print</button>
            <button class="admin-btn-outline admin-btn-delete" onclick="deleteOrder(${sub.id})">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ---------- Update Order Status ---------- */
async function updateOrderStatus(subId, btn) {
  const card = btn.closest('.admin-submission-card');
  const select = card.querySelector('.admin-status-select');
  const newStatus = select.value;

  btn.textContent = '⏳ Saving...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE_URL}/api/submissions/${subId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      const sub = allSubmissions.find(s => s.id === subId);
      if (sub) sub.status = newStatus;

      card.setAttribute('data-status', newStatus);
      const statusBadge = card.querySelector('.admin-sub-status');
      if (statusBadge) {
        statusBadge.textContent = newStatus;
        statusBadge.className = `admin-sub-status ${getStatusClass(newStatus)}`;
      }

      updateStats();
      btn.textContent = '✓ Saved';
      setTimeout(() => {
        btn.textContent = 'Update';
        btn.disabled = false;
      }, 1500);
    } else {
      btn.textContent = '✗ Error';
      btn.disabled = false;
    }
  } catch (err) {
    btn.textContent = '✗ Error';
    btn.disabled = false;
  }
}

/* ---------- Delete Order ---------- */
async function deleteOrder(subId) {
  const sub = allSubmissions.find(s => s.id === subId);
  const ticket = sub ? sub.ticket_id : `Order #${subId}`;

  if (!confirm(`Are you sure you want to delete ${ticket}? This action cannot be undone.`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/submissions/${subId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      allSubmissions = allSubmissions.filter(s => s.id !== subId);
      updateStats();
      applyAdminFilters();
      renderAnalytics();
      renderDevTools();
    } else {
      alert('Failed to delete order.');
    }
  } catch (err) {
    alert('Network error while deleting order.');
  }
}

/* ---------- Seed Demo Order ---------- */
async function seedDemoOrder() {
  const btn = document.getElementById('seedDemoOrderBtn') || document.getElementById('devQuickOrderSeed');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Generating...';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/submissions/demo-seed`, {
      method: 'POST',
      credentials: 'include'
    });

    if (res.ok) {
      await loadSubmissions();
    } else {
      alert('Could not seed demo order.');
    }
  } catch (err) {
    alert('Error generating demo order.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '⚡ Add Demo Order';
    }
  }
}

/* ---------- Copy Ticket ID ---------- */
function copyTicket(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }).catch(() => {});
}

/* ---------- Filters & Search ---------- */
function initAdminControls() {
  const searchInput = document.getElementById('adminSearch');
  const serviceFilter = document.getElementById('adminServiceFilter');
  const sortFilter = document.getElementById('adminSortFilter');
  const statusPills = document.querySelectorAll('.status-pill-btn');
  const refreshBtn = document.getElementById('refreshOrdersBtn');
  const seedBtn = document.getElementById('seedDemoOrderBtn');
  const devSeedBtn = document.getElementById('devQuickOrderSeed');
  const exportJsonBtn = document.getElementById('exportOrdersJsonBtn');
  const exportCsvBtn = document.getElementById('exportOrdersCsvBtn');
  const modalCloseBtn = document.getElementById('closeOrderModalBtn');
  const modalOverlay = document.getElementById('orderModalOverlay');

  if (searchInput) searchInput.addEventListener('input', applyAdminFilters);
  if (serviceFilter) serviceFilter.addEventListener('change', applyAdminFilters);
  if (sortFilter) sortFilter.addEventListener('change', applyAdminFilters);

  statusPills.forEach(pill => {
    pill.addEventListener('click', () => {
      statusPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeStatusFilter = pill.getAttribute('data-status');
      applyAdminFilters();
    });
  });

  if (refreshBtn) refreshBtn.addEventListener('click', loadSubmissions);
  if (seedBtn) seedBtn.addEventListener('click', seedDemoOrder);
  if (devSeedBtn) devSeedBtn.addEventListener('click', seedDemoOrder);
  if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportOrdersJSON);
  if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportOrdersCSV);

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }
}

function filterByStatus(status) {
  activeStatusFilter = status;
  const statusPills = document.querySelectorAll('.status-pill-btn');
  statusPills.forEach(p => {
    if (p.getAttribute('data-status') === status) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  applyAdminFilters();
}

function applyAdminFilters() {
  const searchInput = document.getElementById('adminSearch');
  const serviceFilter = document.getElementById('adminServiceFilter');
  const sortFilter = document.getElementById('adminSortFilter');

  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const serviceVal = serviceFilter ? serviceFilter.value : 'all';
  const sortVal = sortFilter ? sortFilter.value : 'newest';

  let filtered = allSubmissions.filter(sub => {
    // Status
    if (activeStatusFilter !== 'all' && sub.status !== activeStatusFilter) return false;

    // Service
    if (serviceVal !== 'all' && sub.service !== serviceVal) return false;

    // Query
    if (query) {
      const haystack = [
        sub.ticket_id, sub.title, sub.description,
        sub.client_name, sub.client_email, sub.client_company,
        sub.client_phone, sub.service, sub.budget, sub.timeline
      ].filter(Boolean).join(' ').toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  // Sorting
  if (sortVal === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortVal === 'oldest') {
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortVal === 'client') {
    filtered.sort((a, b) => (a.client_name || '').localeCompare(b.client_name || ''));
  }

  renderSubmissions(filtered);
}

/* ---------- Analytics Tab ---------- */
function renderAnalytics() {
  const servicesList = document.getElementById('analyticsServicesList');
  const budgetList = document.getElementById('analyticsBudgetList');
  const timelineList = document.getElementById('analyticsTimelineList');

  if (!servicesList || !budgetList || !timelineList) return;

  // Counts by Service
  const serviceCounts = {};
  const budgetCounts = {};
  const timelineCounts = {};

  allSubmissions.forEach(s => {
    serviceCounts[s.service] = (serviceCounts[s.service] || 0) + 1;
    const b = s.budget || 'Unspecified';
    budgetCounts[b] = (budgetCounts[b] || 0) + 1;
    const t = s.timeline || 'Flexible';
    timelineCounts[t] = (timelineCounts[t] || 0) + 1;
  });

  servicesList.innerHTML = Object.entries(serviceCounts).map(([svc, count]) => `
    <div class="breakdown-row">
      <span>${escapeHtml(svc)}</span>
      <strong style="color:var(--gold-primary);">${count} orders</strong>
    </div>
  `).join('') || '<div class="breakdown-row">No orders recorded yet</div>';

  budgetList.innerHTML = Object.entries(budgetCounts).map(([budget, count]) => `
    <div class="breakdown-row">
      <span>${escapeHtml(budget)}</span>
      <strong style="color:#86efac;">${count} projects</strong>
    </div>
  `).join('') || '<div class="breakdown-row">No budget data available</div>';

  timelineList.innerHTML = Object.entries(timelineCounts).map(([time, count]) => `
    <div class="breakdown-row">
      <span>${escapeHtml(time)}</span>
      <strong style="color:#93c5fd;">${count} requests</strong>
    </div>
  `).join('') || '<div class="breakdown-row">No timeline data available</div>';
}

/* ---------- Dev Tools Tab ---------- */
function renderDevTools() {
  const jsonViewer = document.getElementById('rawJsonViewer');
  if (jsonViewer) {
    jsonViewer.textContent = JSON.stringify(allSubmissions, null, 2);
  }
}

/* ---------- Export Helpers ---------- */
function exportOrdersJSON() {
  const blob = new Blob([JSON.stringify(allSubmissions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `happyheart-orders-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportOrdersCSV() {
  if (allSubmissions.length === 0) {
    alert('No orders to export.');
    return;
  }

  const headers = ['Ticket ID', 'Status', 'Service', 'Title', 'Client Name', 'Company', 'Email', 'Phone', 'Budget', 'Timeline', 'Created At'];
  const rows = allSubmissions.map(s => [
    `"${s.ticket_id || ''}"`,
    `"${s.status || ''}"`,
    `"${s.service || ''}"`,
    `"${(s.title || '').replace(/"/g, '""')}"`,
    `"${(s.client_name || '').replace(/"/g, '""')}"`,
    `"${(s.client_company || '').replace(/"/g, '""')}"`,
    `"${s.client_email || ''}"`,
    `"${s.client_phone || ''}"`,
    `"${s.budget || ''}"`,
    `"${s.timeline || ''}"`,
    `"${s.created_at || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `happyheart-orders-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Modal View & Printing ---------- */
function openOrderModal(subId) {
  const sub = allSubmissions.find(s => s.id === subId);
  if (!sub) return;

  const content = document.getElementById('orderModalContent');
  const overlay = document.getElementById('orderModalOverlay');
  if (!content || !overlay) return;

  const dateStr = new Date(sub.created_at).toLocaleString();

  content.innerHTML = `
    <div style="margin-bottom:16px;">
      <span class="admin-sub-ticket">${escapeHtml(sub.ticket_id)}</span>
      <span class="admin-sub-status ${getStatusClass(sub.status)}" style="margin-left:8px;">${escapeHtml(sub.status)}</span>
    </div>
    <h2 style="font-size:1.4rem; color:#fff; margin-bottom:12px;">${escapeHtml(sub.title)}</h2>
    
    <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.06); margin-bottom:16px;">
      <h4 style="color:var(--gold-primary); font-size:0.88rem; margin-bottom:8px; text-transform:uppercase;">Project Requirements Brief</h4>
      <p style="color:#ddd; line-height:1.65; white-space:pre-wrap; font-size:0.92rem;">${escapeHtml(sub.description)}</p>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.88rem; margin-bottom:20px;">
      <div><span style="color:#777;">Client:</span> <strong>${escapeHtml(sub.client_name)}</strong></div>
      <div><span style="color:#777;">Company:</span> <strong>${escapeHtml(sub.client_company || 'N/A')}</strong></div>
      <div><span style="color:#777;">Email:</span> <strong>${escapeHtml(sub.client_email)}</strong></div>
      <div><span style="color:#777;">Phone:</span> <strong>${escapeHtml(sub.client_phone || 'N/A')}</strong></div>
      <div><span style="color:#777;">Service:</span> <strong style="color:var(--gold-primary);">${escapeHtml(sub.service)}</strong></div>
      <div><span style="color:#777;">Budget:</span> <strong>${escapeHtml(sub.budget || 'N/A')}</strong></div>
      <div><span style="color:#777;">Timeline:</span> <strong>${escapeHtml(sub.timeline)}</strong></div>
      <div><span style="color:#777;">Submitted On:</span> <strong>${dateStr}</strong></div>
    </div>

    ${sub.links ? `
      <div style="margin-bottom:20px; font-size:0.88rem;">
        <span style="color:#777;">Reference Links:</span><br>
        <a href="${escapeHtml(sub.links)}" target="_blank" style="color:var(--gold-primary); word-break:break-all;">${escapeHtml(sub.links)}</a>
      </div>
    ` : ''}

    <div style="display:flex; justify-content:space-between; gap:10px; margin-top:24px; border-top:1px solid rgba(255,255,255,0.08); padding-top:16px;">
      <a href="mailto:${escapeHtml(sub.client_email)}?subject=Regarding Your Order ${escapeHtml(sub.ticket_id)}&body=Hi ${encodeURIComponent(sub.client_name)},%0D%0A%0D%0AThank you for choosing HAPPY HEART MEDIA." class="btn btn-gold btn-sm">✉️ Email Client</a>
      <button class="btn btn-secondary btn-sm" onclick="printOrderBrief(${sub.id})">🖨️ Print Full Brief</button>
    </div>
  `;

  overlay.classList.add('active');
}

function printOrderBrief(subId) {
  const sub = allSubmissions.find(s => s.id === subId);
  if (!sub) return;

  const printWin = window.open('', '', 'width=800,height=600');
  printWin.document.write(`
    <html>
      <head>
        <title>Order Brief — ${sub.ticket_id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          h1 { color: #b8922e; margin-bottom: 4px; }
          .badge { background: #eee; padding: 4px 10px; border-radius: 4px; font-size: 14px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; border: 1px solid #ddd; padding: 16px; border-radius: 8px; }
          .box { background: #f9f9f9; border-left: 4px solid #b8922e; padding: 14px 18px; margin: 20px 0; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>HAPPY HEART MEDIA — Order Brief</h1>
        <div><strong>Ticket ID:</strong> ${sub.ticket_id} &nbsp;|&nbsp; <strong>Status:</strong> ${sub.status} &nbsp;|&nbsp; <strong>Date:</strong> ${new Date(sub.created_at).toLocaleString()}</div>
        
        <h2>${sub.title}</h2>
        <div class="box">${sub.description}</div>

        <div class="grid">
          <div><strong>Client Name:</strong> ${sub.client_name}</div>
          <div><strong>Company / Brand:</strong> ${sub.client_company || 'Individual'}</div>
          <div><strong>Email:</strong> ${sub.client_email}</div>
          <div><strong>Phone / WhatsApp:</strong> ${sub.client_phone || 'N/A'}</div>
          <div><strong>Service:</strong> ${sub.service}</div>
          <div><strong>Budget:</strong> ${sub.budget || 'Not specified'}</div>
          <div><strong>Timeline:</strong> ${sub.timeline}</div>
          <div><strong>Links:</strong> ${sub.links || 'None'}</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}

/* ---------- Logout ---------- */
function initAdminLogout() {
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
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
