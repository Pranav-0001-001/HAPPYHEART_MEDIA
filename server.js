/**
 * HAPPY HEART MEDIA — Express Server
 * "Websites That Work. Ads That Grow."
 * Instagram: @HAPPYHEART_MEDIA
 * 
 * Serves static frontend + REST API for authentication & submissions.
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
  console.log('========================================================');
  console.log('');
});
