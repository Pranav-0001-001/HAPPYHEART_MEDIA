/**
 * HAPPY HEART MEDIA — Submissions Routes
 * POST   /api/submissions         — create new submission (auth required)
 * GET    /api/submissions         — list submissions (user: own only, admin: all)
 * GET    /api/submissions/:id     — get single submission (owner or admin)
 * PATCH  /api/submissions/:id/status — update status (admin only)
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

/* ---------- Middleware: Require Auth ---------- */
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to perform this action.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

/* ---------- Create Submission ---------- */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { service, title, description, timeline, links, budget, clientName, clientCompany, clientEmail, clientPhone, preferredContact } = req.body;

    // Validation
    if (!service || !title || !description || !timeline || !clientName || !clientEmail) {
      return res.status(400).json({ error: 'Required fields: service, title, description, timeline, clientName, clientEmail.' });
    }

    const submission = await db.createSubmission(req.session.userId, {
      service,
      title,
      description,
      timeline,
      links,
      budget,
      clientName,
      clientCompany,
      clientEmail,
      clientPhone,
      preferredContact
    });

    res.status(201).json({
      message: 'Project submitted successfully!',
      submission
    });
  } catch (err) {
    console.error('Create submission error:', err);
    res.status(500).json({ error: 'Server error while creating submission.' });
  }
});

/* ---------- List Submissions ---------- */
router.get('/', requireAuth, async (req, res) => {
  try {
    let submissions;

    if (req.session.role === 'admin') {
      // Admin sees ALL submissions
      submissions = await db.getAllSubmissions();
    } else {
      // Regular user sees only their own
      submissions = await db.getSubmissionsByUser(req.session.userId);
    }

    res.json({ submissions });
  } catch (err) {
    console.error('List submissions error:', err);
    res.status(500).json({ error: 'Server error while fetching submissions.' });
  }
});

/* ---------- Get Single Submission ---------- */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const submission = await db.getSubmissionById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    // Only allow owner or admin to view
    if (submission.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to view this submission.' });
    }

    res.json({ submission });
  } catch (err) {
    console.error('Get submission error:', err);
    res.status(500).json({ error: 'Server error while fetching submission.' });
  }
});

/* ---------- Update Status (Admin Only) ---------- */
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const existing = await db.getSubmissionById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const updated = await db.updateSubmissionStatus(req.params.id, status);
    res.json({ message: 'Status updated.', submission: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Server error while updating status.' });
  }
});

module.exports = router;
