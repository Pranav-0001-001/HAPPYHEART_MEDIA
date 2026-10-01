/**
 * HAPPY HEART MEDIA — Express Server
 * "Websites That Work. Ads That Grow."
 * Instagram: @HAPPYHEART_MEDIA
 * 
 * Serves static frontend + REST API for authentication & submissions.
 * Includes cold-start handling for Render free tier.
 */

const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');

// Initialize database (loads data + seeds admin on first run)
require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- Cold-Start Tracking ---------- */
const SERVER_BOOT_TIME = Date.now();

/* ---------- Middleware ---------- */

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'hhm-secret-key-change-in-production-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

/* ---------- Health Check & Keep-Alive ---------- */

// Health-check endpoint for uptime monitors (e.g., UptimeRobot, cron-job.org)
// Ping this every 10-14 minutes to prevent Render free-tier from sleeping.
app.get('/api/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - SERVER_BOOT_TIME) / 1000);
  res.status(200).json({
    status: 'ok',
    service: 'HAPPY HEART MEDIA',
    uptime: uptimeSeconds,
    bootedAt: new Date(SERVER_BOOT_TIME).toISOString(),
    timestamp: new Date().toISOString()
  });
});

// Wake-check endpoint — the frontend calls this on first load.
// Returns quickly so the loading overlay knows the server is alive.
app.get('/api/wake', (req, res) => {
  res.status(200).json({ awake: true, bootedAt: SERVER_BOOT_TIME });
});

/* ---------- API Routes ---------- */

app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

/* ---------- Static Files ---------- */

// Serve all static files (HTML, CSS, JS, assets)
app.use(express.static(path.join(__dirname), {
  extensions: ['html']
}));

/* ---------- Fallback ---------- */

app.use((req, res) => {
  // For non-API routes that don't match a static file, serve index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found.' });
  }
});

/* ---------- Start ---------- */

app.listen(PORT, () => {
  console.log('');
  console.log('========================================================');
  console.log('  🚀 HAPPY HEART MEDIA Server Running');
  console.log('  "Websites That Work. Ads That Grow."');
  console.log('  Instagram: @HAPPYHEART_MEDIA');
  console.log('========================================================');
  console.log(`  🌐 Local:   http://localhost:${PORT}`);
  console.log(`  📋 Admin:   http://localhost:${PORT}/admin.html`);
  console.log(`  🔑 Login:   http://localhost:${PORT}/auth.html`);
  console.log(`  💚 Health:  http://localhost:${PORT}/api/health`);
  console.log('========================================================');
  console.log('');

  /* ---------- Self-Ping Keep-Alive (Render Free Tier) ---------- */
  // Pings /api/health every 12 minutes to prevent the free instance from
  // sleeping after 15 minutes of inactivity. This is only active when
  // RENDER_EXTERNAL_URL is set (i.e., running on Render).
  // NOTE: One always-on free service fits within Render's 750 free hours/month.
  // For multiple services or guaranteed uptime, upgrade to Render's paid tier.
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    const KEEP_ALIVE_INTERVAL_MS = 12 * 60 * 1000; // 12 minutes
    setInterval(() => {
      fetch(`${RENDER_URL}/api/health`)
        .then(r => r.json())
        .then(data => console.log(`  💓 Keep-alive ping OK — uptime ${data.uptime}s`))
        .catch(err => console.warn(`  ⚠️ Keep-alive ping failed:`, err.message));
    }, KEEP_ALIVE_INTERVAL_MS);
    console.log(`  💓 Keep-alive: pinging ${RENDER_URL} every 12m`);
  }

  console.log('');
});
