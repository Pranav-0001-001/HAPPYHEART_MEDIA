/**
 * HAPPY HEART MEDIA - APPLICATION JAVASCRIPT
 * "Websites That Work. Ads That Grow."
 * Instagram: @HAPPYHEART_MEDIA
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Submissions Storage & Counter
  initSubmissionsStorage();

  // Navigation Mobile Menu
  initMobileMenu();

  // Drawer (Client Portal)
  initSubmissionsDrawer();

  // Page Specific: Intake Form (submit-work.html)
  if (document.getElementById('projectIntakeForm')) {
    initIntakeForm();
  }

  // Page Specific: Portfolio Filter (portfolio.html)
  if (document.querySelector('.portfolio-tab')) {
    initPortfolioFilter();
  }

  // Page Specific: FAQ Accordion (contact.html)
  if (document.querySelector('.faq-card')) {
    initFaqAccordion();
  }
});

/* ==========================================================================
   1. NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }
}

/* ==========================================================================
   2. CLIENT WORK INTAKE FORM (SUBMIT-WORK.HTML)
   ========================================================================== */
function initIntakeForm() {
  const form = document.getElementById('projectIntakeForm');
  const radioCards = document.querySelectorAll('.service-radio-card');
  const budgetPills = document.querySelectorAll('.budget-choice-pill');
  const budgetInput = document.getElementById('selectedBudget');

  // Check URL parameters for pre-selected service
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam) {
    let targetCategory = 'Website Development';
    if (serviceParam === 'ads') targetCategory = 'Ads & Marketing';
    if (serviceParam === 'full') targetCategory = 'Full Growth Suite';

    radioCards.forEach(card => {
      if (card.getAttribute('data-val') === targetCategory) {
        radioCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      }
    });
  }

  // Service Selection
  radioCards.forEach(card => {
    card.addEventListener('click', () => {
      radioCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Budget Pills
  budgetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      budgetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      if (budgetInput) {
        budgetInput.value = pill.getAttribute('data-budget');
      }
    });
  });

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedService = document.querySelector('input[name="serviceCategory"]:checked')?.value || 'Website Development';
    const projectTitle = document.getElementById('projectTitle').value.trim();
    const projectDescription = document.getElementById('projectDescription').value.trim();
    const projectTimeline = document.getElementById('projectTimeline').value;
    const projectLinks = document.getElementById('projectLinks').value.trim();
    const projectBudget = budgetInput ? budgetInput.value : '$500 - $1,500';
    const clientName = document.getElementById('clientName').value.trim();
    const clientCompany = document.getElementById('clientCompany').value.trim() || 'Individual';
    const clientEmail = document.getElementById('clientEmail').value.trim();
    const clientPhone = document.getElementById('clientPhone').value.trim();
    const preferredContact = document.getElementById('preferredContact').value;

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `HHM-2026-${randomId}`;

    const submissionData = {
      id: ticketId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      service: selectedService,
      title: projectTitle,
      description: projectDescription,
      timeline: projectTimeline,
      links: projectLinks,
      budget: projectBudget,
      clientName: clientName,
      clientCompany: clientCompany,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      preferredContact: preferredContact,
      status: 'New Request'
    };

    // Save to LocalStorage
    saveSubmission(submissionData);

    // Show Confirmation Modal
    openSuccessModal(submissionData);

    // Reset Form
    form.reset();
    if (radioCards[0]) radioCards[0].click();
    if (budgetPills[1]) budgetPills[1].click();
  });
}

function openSuccessModal(data) {
  const modal = document.getElementById('successModal');
  const ticketDisplay = document.getElementById('modalTicketId');
  const whatsappBtn = document.getElementById('modalWhatsAppBtn');
  const downloadBtn = document.getElementById('modalDownloadBtn');
  const closeBtn = document.getElementById('closeModalBtn');

  if (ticketDisplay) ticketDisplay.textContent = data.id;

  // Format WhatsApp Brief Message
  const whatsappMessage = encodeURIComponent(
`🔥 *NEW PROJECT BRIEF - HAPPY HEART MEDIA* 🔥

*Project ID:* ${data.id}
*Client Name:* ${data.clientName}
*Brand/Company:* ${data.clientCompany}
*Service Requested:* ${data.service}
*Project Title:* ${data.title}
*Timeline:* ${data.timeline}
*Budget Bracket:* ${data.budget}

*Project Scope:*
${data.description}

*Reference Links:* ${data.links || 'None provided'}
*Email:* ${data.clientEmail}
*Phone/WhatsApp:* ${data.clientPhone}
*Preferred Contact:* ${data.preferredContact}

_Submitted via HAPPY HEART MEDIA Client Work Portal (Instagram: @HAPPYHEART_MEDIA)_`
  );

  if (whatsappBtn) {
    whatsappBtn.href = `https://wa.me/?text=${whatsappMessage}`;
  }

  if (downloadBtn) {
    downloadBtn.onclick = () => {
      downloadProjectBrief(data);
    };
  }

  if (modal) {
    modal.classList.add('active');
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.remove('active');
    };
  }

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  };
}

function downloadProjectBrief(data) {
  const briefText = `=====================================================
HAPPY HEART MEDIA - OFFICIAL PROJECT BRIEF
"Websites That Work. Ads That Grow."
Official Instagram: @HAPPYHEART_MEDIA
=====================================================

PROJECT ID: ${data.id}
DATE: ${data.date}
STATUS: ${data.status}

-----------------------------------------------------
CLIENT INFORMATION
-----------------------------------------------------
Name:              ${data.clientName}
Company/Brand:     ${data.clientCompany}
Email:             ${data.clientEmail}
Phone/WhatsApp:    ${data.clientPhone}
Preferred Channel: ${data.preferredContact}

-----------------------------------------------------
PROJECT SPECIFICATIONS
-----------------------------------------------------
Service:           ${data.service}
Title:             ${data.title}
Delivery Urgency:  ${data.timeline}
Budget Bracket:    ${data.budget}
Reference Links:   ${data.links || 'None provided'}

-----------------------------------------------------
SCOPE & REQUIREMENTS
-----------------------------------------------------
${data.description}

=====================================================
Direct Contact: Instagram @HAPPYHEART_MEDIA
=====================================================`;

  const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HAPPYHEART_MEDIA_Brief_${data.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   3. GLOBAL SUBMISSIONS STORAGE & DRAWER (CLIENT PORTAL)
   ========================================================================== */
const STORAGE_KEY = 'hhm_client_submissions';

function initSubmissionsStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const sampleSubmissions = [
      {
        id: 'HHM-2026-8940',
        date: 'Sep 3, 2026, 09:30 PM',
        service: 'Website Development',
        title: 'Modern Luxury Apparel Brand Storefront',
        description: 'Need a sleek, mobile-optimized online store with dark aesthetic, gold accents, smooth checkout, and Instagram feed integration.',
        timeline: 'Standard: 1 - 2 Weeks',
        links: 'https://figma.com/sample-apparel',
        budget: '$1,500 - $3,000',
        clientName: 'Alexander Vance',
        clientCompany: 'Vance Luxury Wear',
        clientEmail: 'alex@vancewear.com',
        clientPhone: '+1 (555) 234-8901',
        preferredContact: 'WhatsApp',
        status: 'In Progress'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSubmissions));
  }
  updateSubmissionsCount();
}

function getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveSubmission(submission) {
  const list = getSubmissions();
  list.unshift(submission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  updateSubmissionsCount();
  renderSubmissionsList();
}

function updateSubmissionsCount() {
  const list = getSubmissions();
  const counter = document.getElementById('submissionCounter');
  if (counter) {
    counter.textContent = list.length;
  }
}

function initSubmissionsDrawer() {
  const openBtn = document.getElementById('openDrawerBtn');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const drawer = document.getElementById('submissionsDrawer');
  const clearBtn = document.getElementById('clearSubmissionsBtn');

  if (openBtn && drawer) {
    openBtn.addEventListener('click', () => {
      renderSubmissionsList();
      drawer.classList.add('active');
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('active');
    });
  }

  if (drawer) {
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        drawer.classList.remove('active');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your local submission history?')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        updateSubmissionsCount();
        renderSubmissionsList();
      }
    });
  }
}

function renderSubmissionsList() {
  const container = document.getElementById('submissionsListContainer');
  if (!container) return;

  const submissions = getSubmissions();

  if (submissions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-dim);">
        <p style="font-size: 2rem; margin-bottom: 8px;">📋</p>
        <p style="font-weight: 700; color: var(--text-muted);">No submissions found</p>
        <p style="font-size: 0.85rem; margin-top: 4px;">Submit a project on the "Give Us Work" page to see it recorded here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = submissions.map(item => `
    <div class="submission-card">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span style="font-weight:800; color:var(--gold-dark); font-size:0.9rem;">${item.id}</span>
        <span style="font-size:0.75rem; background:#ecfdf5; color:#065f46; padding:2px 8px; border-radius:9999px; font-weight:700;">${item.status || 'New'}</span>
      </div>
      <h4 style="font-size:0.98rem; margin-bottom:4px; color:var(--text-main);">${escapeHtml(item.title)}</h4>
      <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:8px;">${escapeHtml(item.description.substring(0, 100))}${item.description.length > 100 ? '...' : ''}</p>
      <div style="font-size:0.78rem; color:var(--text-dim); margin-bottom:10px;">
        ${escapeHtml(item.service)} • ${escapeHtml(item.budget)} • ${escapeHtml(item.timeline)}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); padding-top:8px;">
        <span style="font-size:0.76rem; color:var(--text-dim);">By: ${escapeHtml(item.clientName)}</span>
        <button onclick='window.downloadSingleBrief(${JSON.stringify(item).replace(/'/g, "&#39;")})' style="background:none; border:none; color:var(--gold-primary); font-weight:700; font-size:0.8rem; cursor:pointer;">
          Download Brief ↓
        </button>
      </div>
    </div>
  `).join('');
}

window.downloadSingleBrief = function(data) {
  downloadProjectBrief(data);
};

/* ==========================================================================
   4. PORTFOLIO FILTER (PORTFOLIO.HTML)
   ========================================================================== */
function initPortfolioFilter() {
  const tabs = document.querySelectorAll('.portfolio-tab');
  const cards = document.querySelectorAll('.portfolio-item-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. FAQ ACCORDION (CONTACT.HTML)
   ========================================================================== */
function initFaqAccordion() {
  const faqCards = document.querySelectorAll('.faq-card');

  faqCards.forEach(card => {
    const trigger = card.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        faqCards.forEach(c => c.classList.remove('open'));
        if (!isOpen) {
          card.classList.add('open');
        }
      });
    }
  });
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
