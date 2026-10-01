/**
 * HAPPY HEART MEDIA - APPLICATION JAVASCRIPT
 * "Websites That Work. Ads That Grow."
 * Instagram: @HAPPYHEART_MEDIA
 *
 * Updated: Backend API integration + session auth
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check Auth State & Update Nav
  initAuthState();

  // Navigation Mobile Menu
  initMobileMenu();

  // Drawer (Client Portal)
  initSubmissionsDrawer();

  // Dynamic Ambient Glow & Scroll Progress
  initAmbientBackground();
  initScrollProgress();

  // Desktop Luxury Cursor Spotlight
  initCursorSpotlight();

  // Scroll Reveal Animations
  initScrollReveal();

  // Animated Number Counters
  initStatCounters();

  // 3D Card Interactive Perspective Tilt
  init3DCardTilt();

  // Floating Back to Top Button
  initBackToTop();

  // Live Activity Toast Notifications
  initLiveActivityToasts();

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
   0. AUTH STATE MANAGEMENT
   ========================================================================== */
let currentUser = null;

async function initAuthState() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.user) {
      currentUser = data.user;
    }
  } catch (err) {
    // API not available (static serving) or not logged in
    currentUser = null;
  }
  updateNavAuthUI();
}

function updateNavAuthUI() {
  // Update the Client Portal button and add login/logout to nav
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  // Remove existing auth buttons if any
  const existingAuth = navActions.querySelector('.nav-auth-btn');
  if (existingAuth) existingAuth.remove();

  const existingAdminLink = navActions.querySelector('.nav-admin-link');
  if (existingAdminLink) existingAdminLink.remove();

  if (currentUser) {
    const isDev = currentUser.role === 'admin' || (currentUser.email && currentUser.email.toLowerCase() === 'karandarade131@gmail.com');
    // Show admin link for authenticated developer / admin users
    if (isDev) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.className = 'btn btn-gold btn-sm nav-admin-link';
      adminLink.innerHTML = '🛡️ Orders';
      adminLink.style.cssText = 'font-size: 0.76rem; font-weight: 800; padding: 5px 10px;';
      navActions.insertBefore(adminLink, navActions.firstChild);
    }

    // Show logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-secondary btn-sm nav-auth-btn';
    logoutBtn.innerHTML = `👋 ${escapeHtml(currentUser.name.split(' ')[0])}`;
    logoutBtn.style.cssText = 'font-size: 0.74rem; cursor: pointer; padding: 5px 10px;';
    logoutBtn.title = `Logged in as ${currentUser.email} — Click to log out`;
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
      currentUser = null;
      window.location.reload();
    });
    navActions.insertBefore(logoutBtn, navActions.querySelector('.menu-toggle'));
  } else {
    // Show login button
    const loginBtn = document.createElement('a');
    loginBtn.href = 'auth.html';
    loginBtn.className = 'btn btn-secondary btn-sm nav-auth-btn';
    loginBtn.textContent = '🔑 Login';
    loginBtn.style.cssText = 'font-size: 0.74rem; padding: 5px 10px;';
    navActions.insertBefore(loginBtn, navActions.querySelector('.menu-toggle'));
  }

  // Update submission counter from server if logged in
  if (currentUser) {
    fetchSubmissionsCount();
  }
}

async function fetchSubmissionsCount() {
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      const data = await res.json();
      const counter = document.getElementById('submissionCounter');
      if (counter) {
        counter.textContent = (data.submissions || []).length;
      }
    }
  } catch (e) {}
}

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

  // Auto-fill fields from logged-in user
  if (currentUser) {
    const nameField = document.getElementById('clientName');
    const emailField = document.getElementById('clientEmail');
    const phoneField = document.getElementById('clientPhone');
    const companyField = document.getElementById('clientCompany');

    if (nameField && !nameField.value) nameField.value = currentUser.name || '';
    if (emailField && !emailField.value) emailField.value = currentUser.email || '';
    if (phoneField && !phoneField.value) phoneField.value = currentUser.phone || '';
    if (companyField && !companyField.value) companyField.value = currentUser.company || '';
  }

  // Show login prompt if not authenticated
  showAuthPromptIfNeeded();

  // Form Submission
  form.addEventListener('submit', async (e) => {
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

    // If user is logged in, submit to API
    if (currentUser) {
      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: selectedService,
            title: projectTitle,
            description: projectDescription,
            timeline: projectTimeline,
            links: projectLinks,
            budget: projectBudget,
            clientName,
            clientCompany,
            clientEmail,
            clientPhone,
            preferredContact
          })
        });

        const result = await res.json();

        if (res.ok) {
          const submissionData = {
            id: result.submission.ticket_id,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            service: selectedService,
            title: projectTitle,
            description: projectDescription,
            timeline: projectTimeline,
            links: projectLinks,
            budget: projectBudget,
            clientName,
            clientCompany,
            clientEmail,
            clientPhone,
            preferredContact,
            status: 'New Request'
          };

          openSuccessModal(submissionData);
          fetchSubmissionsCount();

          form.reset();
          if (radioCards[0]) radioCards[0].click();
          if (budgetPills[1]) budgetPills[1].click();

          // Re-fill user details
          if (currentUser) {
            const nameField = document.getElementById('clientName');
            const emailField = document.getElementById('clientEmail');
            const phoneField = document.getElementById('clientPhone');
            const companyField = document.getElementById('clientCompany');
            if (nameField) nameField.value = currentUser.name || '';
            if (emailField) emailField.value = currentUser.email || '';
            if (phoneField) phoneField.value = currentUser.phone || '';
            if (companyField) companyField.value = currentUser.company || '';
          }
        } else {
          alert(result.error || 'Failed to submit. Please try again.');
        }
      } catch (err) {
        alert('Network error. Please check your connection and try again.');
      }
    } else {
      // Not logged in — redirect to auth page
      window.location.href = 'auth.html?redirect=submit-work.html';
    }
  });
}

function showAuthPromptIfNeeded() {
  if (currentUser) return;

  const form = document.getElementById('projectIntakeForm');
  if (!form) return;

  // Insert a login prompt banner at the top of the form
  const existingPrompt = document.getElementById('authPromptBanner');
  if (existingPrompt) return;

  const banner = document.createElement('div');
  banner.id = 'authPromptBanner';
  banner.style.cssText = `
    background: linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.04));
    border: 1px solid rgba(212,168,67,0.25);
    border-radius: 14px;
    padding: 18px 22px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  `;
  banner.innerHTML = `
    <div style="font-size: 0.9rem; color: var(--text-main, #f1f1f1);">
      <strong>🔑 Sign in to submit your project</strong>
      <div style="font-size: 0.82rem; color: var(--text-muted, #888); margin-top: 3px;">
        Create a free account to submit and privately track your project requirements.
      </div>
    </div>
    <a href="auth.html?redirect=submit-work.html" class="btn btn-gold btn-sm" style="white-space: nowrap;">
      Sign In / Register →
    </a>
  `;
  form.insertBefore(banner, form.firstChild);
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
    // Hide clear button when using API (submissions are server-managed)
    if (currentUser) {
      clearBtn.style.display = 'none';
    }
  }
}

async function renderSubmissionsList() {
  const container = document.getElementById('submissionsListContainer');
  if (!container) return;

  // If logged in, fetch from API
  if (currentUser) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px 10px; color: var(--text-dim);">
        <p style="font-size: 0.85rem;">Loading your submissions...</p>
      </div>
    `;

    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      const submissions = data.submissions || [];

      if (submissions.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 10px; color: var(--text-dim);">
            <p style="font-size: 2rem; margin-bottom: 8px;">📋</p>
            <p style="font-weight: 700; color: var(--text-muted);">No submissions found</p>
            <p style="font-size: 0.85rem; margin-top: 4px;">Submit a project on the "Give Us Work" page to see it here.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = submissions.map(item => `
        <div class="submission-card">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="font-weight:800; color:var(--gold-dark); font-size:0.9rem;">${escapeHtml(item.ticket_id)}</span>
            <span style="font-size:0.75rem; background:#ecfdf5; color:#065f46; padding:2px 8px; border-radius:9999px; font-weight:700;">${escapeHtml(item.status || 'New')}</span>
          </div>
          <h4 style="font-size:0.98rem; margin-bottom:4px; color:var(--text-main);">${escapeHtml(item.title)}</h4>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:8px;">${escapeHtml((item.description || '').substring(0, 100))}${(item.description || '').length > 100 ? '...' : ''}</p>
          <div style="font-size:0.78rem; color:var(--text-dim); margin-bottom:10px;">
            ${escapeHtml(item.service)} • ${escapeHtml(item.budget)} • ${escapeHtml(item.timeline)}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); padding-top:8px;">
            <span style="font-size:0.76rem; color:var(--text-dim);">By: ${escapeHtml(item.client_name)}</span>
            <span style="font-size:0.76rem; color:var(--text-dim);">${new Date(item.created_at + 'Z').toLocaleDateString()}</span>
          </div>
        </div>
      `).join('');

      // Update counter
      const counter = document.getElementById('submissionCounter');
      if (counter) counter.textContent = submissions.length;

    } catch (err) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--text-dim);">
          <p style="font-weight: 700; color: #fca5a5;">Failed to load submissions</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Please check your connection and try again.</p>
        </div>
      `;
    }
  } else {
    // Not logged in — show login prompt in drawer
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-dim);">
        <p style="font-size: 2rem; margin-bottom: 8px;">🔑</p>
        <p style="font-weight: 700; color: var(--text-muted);">Sign in to view submissions</p>
        <p style="font-size: 0.85rem; margin-top: 4px; margin-bottom: 16px;">Log in to your account to view and track your project submissions.</p>
        <a href="auth.html" class="btn btn-gold btn-sm" style="display: inline-block;">Sign In / Register</a>
      </div>
    `;
  }
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
  if (!string) return '';
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}

/* ==========================================================================
   6. AMBIENT BACKGROUND & SCROLL PROGRESS
   ========================================================================== */
function initAmbientBackground() {
  if (!document.querySelector('.ambient-orbs-container')) {
    const orbsContainer = document.createElement('div');
    orbsContainer.className = 'ambient-orbs-container';
    orbsContainer.setAttribute('aria-hidden', 'true');
    orbsContainer.innerHTML = `
      <div class="ambient-orb ambient-orb-1"></div>
      <div class="ambient-orb ambient-orb-2"></div>
      <div class="ambient-orb ambient-orb-3"></div>
    `;
    document.body.prepend(orbsContainer);
  }
}

function initScrollProgress() {
  let bar = document.querySelector('.scroll-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }

  const updateBar = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight > 0) {
      const scrolled = (scrollTop / scrollHeight) * 100;
      bar.style.width = `${Math.min(scrolled, 100)}%`;
    }
  };

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
}

/* ==========================================================================
   7. LUXURY MOUSE SPOTLIGHT (DESKTOP)
   ========================================================================== */
function initCursorSpotlight() {
  if (window.innerWidth < 1024 || !window.matchMedia('(hover: hover)').matches) return;

  let spotlight = document.querySelector('.cursor-spotlight');
  if (!spotlight) {
    spotlight = document.createElement('div');
    spotlight.className = 'cursor-spotlight';
    spotlight.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spotlight);
  }

  let rafId = null;
  let mouseX = -500, mouseY = -500;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        spotlight.style.left = `${mouseX}px`;
        spotlight.style.top = `${mouseY}px`;
        spotlight.style.opacity = '1';
        rafId = null;
      });
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
}

/* ==========================================================================
   8. SCROLL REVEAL (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveal() {
  const elementsToReveal = document.querySelectorAll(`
    .section-header,
    .card-service,
    .home-showcase-card,
    .home-stats-strip .stat-item,
    .portfolio-item-card,
    .instagram-spotlight-card,
    .insta-tile,
    .faq-card,
    .intake-box,
    .page-intro-header,
    section > .container > div[style*="grid"] > div,
    section > .container > div[style*="linear-gradient"],
    .footer-grid > div
  `);

  if (!elementsToReveal.length) return;

  // Stagger delays within sibling groups
  document.querySelectorAll('.services-grid-3, .portfolio-grid-3, .insta-preview-grid, .home-stats-strip, .footer-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, index) => {
      const delayClass = `delay-${Math.min((index + 1) * 100, 500)}`;
      child.classList.add(delayClass);
    });
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  elementsToReveal.forEach(el => {
    el.classList.add('reveal-init');
    observer.observe(el);
  });
}

/* ==========================================================================
   9. ANIMATED NUMBER COUNTERS
   ========================================================================== */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-num');
  if (!statNumbers.length) return;

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(stat => counterObserver.observe(stat));
}

function animateCounter(el) {
  const rawText = el.textContent.trim();
  const match = rawText.match(/([<+]?\s*)(\d+(\.\d+)?)(\s*[%+x]?)/);
  if (!match) return;

  const prefix = match[1] || '';
  const targetNum = parseFloat(match[2]);
  const suffix = match[4] || '';
  const isDecimal = match[2].includes('.');

  const duration = 1600;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentVal = targetNum * easeOut;

    el.textContent = `${prefix}${isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = rawText; // Ensure exact final text
    }
  }

  requestAnimationFrame(update);
}

/* ==========================================================================
   10. 3D CARD PERSPECTIVE TILT (DESKTOP)
   ========================================================================== */
function init3DCardTilt() {
  if (window.innerWidth < 1024 || !window.matchMedia('(hover: hover)').matches) return;

  const tiltCards = document.querySelectorAll('.home-showcase-card, .card-service, .instagram-spotlight-card');

  tiltCards.forEach(card => {
    let ticking = false;

    card.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((centerY - y) / centerY) * 7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
        ticking = false;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ==========================================================================
   11. FLOATING BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  let btn = document.getElementById('backToTopBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'backToTopBtn';
    btn.className = 'back-to-top-btn';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('title', 'Back to top');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    `;
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   12. LIVE ACTIVITY NOTIFICATION TOASTS
   ========================================================================== */
function initLiveActivityToasts() {
  let container = document.getElementById('activityToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'activityToastContainer';
    container.className = 'activity-toast-container';
    document.body.appendChild(container);
  }

  const activities = [
    { icon: '🚀', title: 'New Web Project Brief', text: 'E-commerce platform inquiry submitted in Client Portal' },
    { icon: '📈', title: 'Ad Performance Milestone', text: 'Client ad campaign reached 4.8x ROAS on Meta Ads' },
    { icon: '⚡', title: 'Rapid Delivery', text: 'Custom High-Converting Landing Page deployed in 48h' },
    { icon: '📸', title: 'Social Branding', text: 'New Growth Case Study published on @HAPPYHEART_MEDIA' },
    { icon: '💼', title: 'Full Growth Suite', text: 'New business onboarded for complete Web & Ad scaling' }
  ];

  let currentIndex = 0;

  function showNextToast() {
    const item = activities[currentIndex];
    currentIndex = (currentIndex + 1) % activities.length;

    const toast = document.createElement('div');
    toast.className = 'activity-toast';
    toast.innerHTML = `
      <div class="activity-toast-icon">${item.icon}</div>
      <div class="activity-toast-content">
        <div class="activity-toast-title">${item.title}</div>
        <div>${item.text}</div>
      </div>
    `;

    container.innerHTML = '';
    container.appendChild(toast);

    // Trigger animation in next frame
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after 5.5s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode === container) {
          container.removeChild(toast);
        }
      }, 400);
    }, 5500);
  }

  // Show first toast after 4.5 seconds, then every 16 seconds
  setTimeout(() => {
    showNextToast();
    setInterval(showNextToast, 16000);
  }, 4500);
}
