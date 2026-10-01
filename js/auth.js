/**
 * HAPPY HEART MEDIA — Auth Page JavaScript
 * Handles login/register forms on auth.html
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  checkExistingSession();

  // Tab switching
  initAuthTabs();

  // Mobile menu
  initMobileMenuAuth();

  // Form submissions
  initLoginForm();
  initRegisterForm();
});

/* ---------- Check Existing Session ---------- */
async function checkExistingSession() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.user) {
      // Already logged in — redirect appropriately
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'submit-work.html';
      }
    }
  } catch (err) {
    // Not logged in — stay on auth page
  }
}

/* ---------- Tab Switching ---------- */
function initAuthTabs() {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const heading = document.getElementById('authHeading');
  const subtext = document.getElementById('authSubtext');

  if (!loginTab || !registerTab) return;

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    heading.textContent = 'Welcome Back';
    subtext.textContent = 'Log in to submit & track your project requirements.';
    clearMessages();
  });

  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    heading.textContent = 'Create Your Account';
    subtext.textContent = 'Sign up to start submitting project requirements.';
    clearMessages();
  });

  // Check URL hash for pre-selection
  if (window.location.hash === '#register') {
    registerTab.click();
  }
}

/* ---------- Login Form ---------- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const quickFillBtn = document.getElementById('devQuickFillBtn');
  if (quickFillBtn) {
    quickFillBtn.addEventListener('click', () => {
      document.getElementById('loginEmail').value = 'admin@happyheartmedia.com';
      document.getElementById('loginPassword').value = 'HHM@admin2026';
      showSuccess('Developer credentials filled! Click "Sign In" or press Enter.');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const btn = document.getElementById('loginSubmitBtn');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showError('Please fill in all fields.');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Signing in...';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Login failed.');
        btn.disabled = false;
        btn.textContent = '🔓 Sign In';
        return;
      }

      showSuccess('Logged in! Redirecting...');

      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          // Redirect to the page they were trying to access, or submit-work
          const redirectTo = new URLSearchParams(window.location.search).get('redirect') || 'submit-work.html';
          window.location.href = redirectTo;
        }
      }, 800);
    } catch (err) {
      showError('Network error. Please try again.');
      btn.disabled = false;
      btn.textContent = '🔓 Sign In';
    }
  });
}

/* ---------- Register Form ---------- */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const btn = document.getElementById('registerSubmitBtn');
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const company = document.getElementById('regCompany').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!name || !email || !password) {
      showError('Name, email, and password are required.');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Creating account...';

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Registration failed.');
        btn.disabled = false;
        btn.textContent = '🚀 Create Account';
        return;
      }

      showSuccess('Account created! Redirecting...');

      setTimeout(() => {
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || 'submit-work.html';
        window.location.href = redirectTo;
      }, 800);
    } catch (err) {
      showError('Network error. Please try again.');
      btn.disabled = false;
      btn.textContent = '🚀 Create Account';
    }
  });
}

/* ---------- Message Helpers ---------- */
function showError(msg) {
  const el = document.getElementById('authError');
  if (el) {
    el.textContent = msg;
    el.classList.add('visible');
  }
}

function showSuccess(msg) {
  const el = document.getElementById('authSuccess');
  if (el) {
    el.textContent = msg;
    el.classList.add('visible');
  }
}

function clearMessages() {
  const err = document.getElementById('authError');
  const suc = document.getElementById('authSuccess');
  if (err) { err.classList.remove('visible'); err.textContent = ''; }
  if (suc) { suc.classList.remove('visible'); suc.textContent = ''; }
}

/* ---------- Mobile Menu ---------- */
function initMobileMenuAuth() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }
}
