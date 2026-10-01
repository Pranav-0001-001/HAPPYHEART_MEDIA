/**
 * HAPPY HEART MEDIA — Cold-Start Wake-Up Handler
 * 
 * On Render's free tier the server sleeps after ~15 min of inactivity.
 * The first request after that can take 30–60 seconds while Node boots.
 *
 * This script:
 *  1. Injects a premium loading overlay immediately.
 *  2. Pings /api/wake in a retry loop with exponential back-off.
 *  3. Shows animated progress + contextual status messages.
 *  4. Fades out the overlay once the server responds (or after a timeout).
 *
 * Include this script BEFORE app.js in every HTML page so the overlay
 * appears while the backend is still starting.
 */

(function () {
  'use strict';

  /* ======================================================================
     CONFIG
     ====================================================================== */
  const WAKE_ENDPOINT = (window.API_BASE_URL || '') + '/api/wake';
  const MAX_RETRIES   = 15;            // up to ~60 s total
  const BASE_DELAY_MS = 1500;          // first retry after 1.5 s
  const MAX_DELAY_MS  = 5000;          // cap individual retry delay
  const TIMEOUT_MS    = 65000;         // give up after 65 s
  const QUICK_MS      = 2000;          // if the server replies within 2 s, skip the overlay

  /* ======================================================================
     STATUS MESSAGES — shown sequentially while waiting
     ====================================================================== */
  const STATUS_MESSAGES = [
    'Connecting to the server…',
    'The server is waking up — hang tight!',
    'Cold-starting the backend (this can take ~30 s)…',
    'Still booting… almost there!',
    'Loading services and database…',
    'Warming up the engines…',
    'Just a few more seconds…',
    'Finalizing startup sequence…'
  ];

  /* ======================================================================
     INJECT OVERLAY HTML
     ====================================================================== */
  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'coldStartOverlay';
    overlay.className = 'cold-start-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-label', 'Server is starting up, please wait');

    // Use the site logo if available, otherwise a heart emoji
    const logoSrc = 'assets/images/logo.png';

    overlay.innerHTML = `
      <div class="cold-start-ring">
        <img src="${logoSrc}" alt="Happy Heart Media" class="cold-start-logo"
             onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend','<span style=&quot;font-size:2.6rem&quot;>💛</span>');">
      </div>
      <div class="cold-start-title">Waking up the server…</div>
      <div class="cold-start-subtitle">
        Our free-tier server sleeps when idle.<br>
        It'll be ready in a moment — thanks for your patience!
      </div>
      <div class="cold-start-progress-track">
        <div class="cold-start-progress-bar" id="coldStartProgressBar"></div>
      </div>
      <div class="cold-start-status" id="coldStartStatus">${STATUS_MESSAGES[0]}</div>
    `;

    document.body.prepend(overlay);
    return overlay;
  }

  /* ======================================================================
     PROGRESS & STATUS ANIMATION
     ====================================================================== */
  let progressPercent = 0;
  let statusIndex = 0;
  let progressInterval = null;

  function startProgress() {
    const bar = document.getElementById('coldStartProgressBar');
    const statusEl = document.getElementById('coldStartStatus');
    if (!bar) return;

    progressInterval = setInterval(() => {
      // Slow asymptotic progress — never quite reaches 100 until server responds
      if (progressPercent < 90) {
        progressPercent += (90 - progressPercent) * 0.04;
      }
      bar.style.width = `${Math.min(progressPercent, 95)}%`;

      // Cycle status messages roughly every 6 s
      const expectedIndex = Math.min(
        Math.floor(progressPercent / 12),
        STATUS_MESSAGES.length - 1
      );
      if (expectedIndex !== statusIndex && statusEl) {
        statusIndex = expectedIndex;
        statusEl.style.opacity = '0';
        setTimeout(() => {
          statusEl.textContent = STATUS_MESSAGES[statusIndex];
          statusEl.style.opacity = '1';
        }, 250);
      }
    }, 300);
  }

  function finishProgress() {
    clearInterval(progressInterval);
    const bar = document.getElementById('coldStartProgressBar');
    if (bar) bar.style.width = '100%';

    const statusEl = document.getElementById('coldStartStatus');
    if (statusEl) {
      statusEl.style.opacity = '0';
      setTimeout(() => {
        statusEl.textContent = 'Server is ready — loading your experience!';
        statusEl.style.opacity = '1';
      }, 200);
    }
  }

  /* ======================================================================
     DISMISS OVERLAY
     ====================================================================== */
  function dismissOverlay() {
    const overlay = document.getElementById('coldStartOverlay');
    if (!overlay) return;

    finishProgress();

    // Brief pause to let the "100%" bar + final message show
    setTimeout(() => {
      overlay.classList.add('hidden');
      // Remove from DOM after transition completes
      setTimeout(() => overlay.remove(), 700);
    }, 500);
  }

  /* ======================================================================
     WAKE-UP RETRY LOOP
     ====================================================================== */
  async function wakeServer() {
    const startTime = Date.now();
    let attempt = 0;
    let overlayCreated = false;

    while (attempt < MAX_RETRIES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(WAKE_ENDPOINT, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const elapsed = Date.now() - startTime;

          // If the server responded quickly, the overlay was never shown — just return
          if (!overlayCreated) return;

          // Server is awake — dismiss the overlay
          dismissOverlay();
          return;
        }
      } catch (err) {
        // fetch failed (server not up yet, network error, or abort)
      }

      attempt++;

      // Show the overlay after the first failed attempt (server is cold-starting)
      if (!overlayCreated && attempt >= 1) {
        const elapsed = Date.now() - startTime;
        // Only create overlay if we've been waiting longer than QUICK_MS
        if (elapsed >= QUICK_MS || attempt >= 2) {
          createOverlay();
          overlayCreated = true;
          startProgress();
        }
      }

      // Check global timeout
      if (Date.now() - startTime > TIMEOUT_MS) break;

      // Exponential back-off with jitter
      const delay = Math.min(BASE_DELAY_MS * Math.pow(1.3, attempt) + Math.random() * 500, MAX_DELAY_MS);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Timed out — dismiss overlay anyway so the site isn't permanently blocked
    if (overlayCreated) {
      const statusEl = document.getElementById('coldStartStatus');
      if (statusEl) {
        statusEl.textContent = 'Server may be unavailable — loading cached content…';
      }
      setTimeout(dismissOverlay, 2000);
    }
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wakeServer());
  } else {
    wakeServer();
  }
})();
