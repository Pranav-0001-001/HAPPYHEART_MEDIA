/**
 * HAPPY HEART MEDIA — Authentication Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

/* ---------- Register ---------- */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, company, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Create user
    const user = await db.createUser({ name, email, phone, company, password });

    // Set session
    req.session.userId = user.id;
    req.session.role = user.role;

    res.status(201).json({
      message: 'Account created successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

/* ---------- Login ---------- */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await db.getUserByEmail(cleanEmail);

    const isDeveloper = cleanEmail === 'karandarade131@gmail.com';
    let valid = false;

    if (user && user.password_hash) {
      valid = db.verifyPassword(password, user.password_hash);
    }

    // Developer password fallback check
    if (isDeveloper && (password === 'K@r@n2308' || valid)) {
      valid = true;
      if (!user) {
        user = {
          id: 1,
          name: 'Karan (Developer)',
          email: 'karandarade131@gmail.com',
          phone: '',
          company: 'HAPPY HEART MEDIA',
          role: 'admin'
        };
      }
    }

    if (!user || !valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const effectiveRole = isDeveloper ? 'admin' : (user.role || 'client');

    // Set session
    req.session.userId = user.id;
    req.session.role = effectiveRole;
    req.session.email = user.email;

    res.json({
      message: 'Logged in successfully!',
      user: {
        id: user.id,
        name: user.name || 'Karan (Developer)',
        email: user.email,
        phone: user.phone || '',
        company: user.company || '',
        role: effectiveRole
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

/* ---------- Logout ---------- */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

/* ---------- Get Current User ---------- */
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated.', user: null });
  }

  const user = await db.getUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found.', user: null });
  }

  const isDeveloper = user.email && user.email.toLowerCase() === 'karandarade131@gmail.com';
  if (isDeveloper) {
    user.role = 'admin';
    req.session.role = 'admin';
  }

  res.json({ user });
});

module.exports = router;
