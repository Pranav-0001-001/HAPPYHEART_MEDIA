/**
 * HAPPY HEART MEDIA — Database Layer
 * Dual Storage Engine:
 * 1. Firebase Cloud Firestore (Primary online cloud storage when credentials present)
 * 2. JSON File Storage (Fallback local storage when offline or configuring)
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { db: firestore, isFirebaseConfigured } = require('./firebase-config');

const DB_PATH = path.join(__dirname, 'happyheart_data.json');

/* ---------- In-Memory / File Store ---------- */
let store = {
  users: [],
  submissions: [],
  _nextUserId: 1,
  _nextSubmissionId: 1
};

function loadLocalStore() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      store = JSON.parse(raw);
    }
  } catch (err) {
    console.error('⚠️ Failed to load local database:', err.message);
  }
}

function saveLocalStore() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Failed to save local database:', err.message);
  }
}

// Load local fallback on startup
loadLocalStore();

/* ---------- Admin Seed ---------- */
async function seedAdmin() {
  const adminEmail = 'admin@happyheartmedia.com';
  const hash = bcrypt.hashSync('HHM@admin2026', 10);

  if (isFirebaseConfigured && firestore) {
    try {
      const snapshot = await firestore.collection('users').where('email', '==', adminEmail).get();
      if (snapshot.empty) {
        const adminDoc = {
          id: 1,
          name: 'HAPPY HEART MEDIA',
          email: adminEmail,
          phone: '',
          company: 'HAPPY HEART MEDIA',
          password_hash: hash,
          role: 'admin',
          created_at: new Date().toISOString()
        };
        await firestore.collection('users').doc('user_1').set(adminDoc);
        console.log('✅ Admin account seeded in Firebase Firestore: admin@happyheartmedia.com');
      }
    } catch (err) {
      console.error('⚠️ Firebase Admin seed error:', err.message);
    }
  } else {
    const existing = store.users.find(u => u.role === 'admin');
    if (!existing) {
      const admin = {
        id: store._nextUserId++,
        name: 'HAPPY HEART MEDIA',
        email: adminEmail,
        phone: '',
        company: 'HAPPY HEART MEDIA',
        password_hash: hash,
        role: 'admin',
        created_at: new Date().toISOString()
      };
      store.users.push(admin);
      saveLocalStore();
      console.log('✅ Admin account seeded in local storage: admin@happyheartmedia.com');
    }
  }
}

// Trigger initial admin seed
seedAdmin();

/* ---------- User Operations ---------- */

async function getNextId(collectionName) {
  if (isFirebaseConfigured && firestore) {
    const counterRef = firestore.collection('counters').doc(collectionName);
    const doc = await counterRef.get();
    let currentId = 1;
    if (doc.exists) {
      currentId = (doc.data().value || 0) + 1;
    }
    await counterRef.set({ value: currentId });
    return currentId;
  } else {
    if (collectionName === 'users') return store._nextUserId++;
    if (collectionName === 'submissions') return store._nextSubmissionId++;
    return Date.now();
  }
}

async function createUser({ name, email, phone, company, password }) {
  const hash = bcrypt.hashSync(password, 10);
  const id = await getNextId('users');
  
  const user = {
    id,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    company: company || '',
    password_hash: hash,
    role: 'client',
    created_at: new Date().toISOString()
  };

  if (isFirebaseConfigured && firestore) {
    await firestore.collection('users').doc(`user_${id}`).set(user);
  } else {
    store.users.push(user);
    saveLocalStore();
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    role: user.role,
    created_at: user.created_at
  };
}

async function getUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase();

  if (isFirebaseConfigured && firestore) {
    const snapshot = await firestore.collection('users').where('email', '==', cleanEmail).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  } else {
    return store.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }
}

async function getUserById(id) {
  if (!id) return null;

  if (isFirebaseConfigured && firestore) {
    const doc = await firestore.collection('users').doc(`user_${id}`).get();
    if (!doc.exists) return null;
    const user = doc.data();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      role: user.role,
      created_at: user.created_at
    };
  } else {
    const user = store.users.find(u => u.id === Number(id));
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      role: user.role,
      created_at: user.created_at
    };
  }
}

function verifyPassword(plaintext, hash) {
  return bcrypt.compareSync(plaintext, hash);
}

/* ---------- Submission Operations ---------- */

function generateTicketId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HHM-${year}-${rand}`;
}

async function createSubmission(userId, data) {
  const ticketId = generateTicketId();
  const id = await getNextId('submissions');

  const submission = {
    id,
    ticket_id: ticketId,
    user_id: Number(userId),
    service: data.service,
    title: data.title,
    description: data.description,
    timeline: data.timeline,
    links: data.links || '',
    budget: data.budget || '',
    client_name: data.clientName,
    client_company: data.clientCompany || '',
    client_email: data.clientEmail,
    client_phone: data.clientPhone || '',
    preferred_contact: data.preferredContact || 'WhatsApp',
    status: 'New Request',
    created_at: new Date().toISOString()
  };

  if (isFirebaseConfigured && firestore) {
    await firestore.collection('submissions').doc(`sub_${id}`).set(submission);
  } else {
    store.submissions.push(submission);
    saveLocalStore();
  }

  return submission;
}

async function getSubmissionById(id) {
  const numericId = Number(id);

  if (isFirebaseConfigured && firestore) {
    const doc = await firestore.collection('submissions').doc(`sub_${numericId}`).get();
    if (!doc.exists) return null;
    return doc.data();
  } else {
    return store.submissions.find(s => s.id === numericId) || null;
  }
}

async function getSubmissionsByUser(userId) {
  const numericUserId = Number(userId);

  if (isFirebaseConfigured && firestore) {
    const snapshot = await firestore.collection('submissions').where('user_id', '==', numericUserId).get();
    const subs = [];
    snapshot.forEach(doc => subs.push(doc.data()));
    return subs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    return store.submissions
      .filter(s => s.user_id === numericUserId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

async function getAllSubmissions() {
  if (isFirebaseConfigured && firestore) {
    const snapshot = await firestore.collection('submissions').get();
    const subs = [];
    snapshot.forEach(doc => subs.push(doc.data()));

    // Fetch user details for each
    const usersSnapshot = await firestore.collection('users').get();
    const usersMap = {};
    usersSnapshot.forEach(doc => {
      const u = doc.data();
      usersMap[u.id] = u;
    });

    return subs.map(s => ({
      ...s,
      user_name: usersMap[s.user_id] ? usersMap[s.user_id].name : s.client_name || 'Unknown',
      user_email: usersMap[s.user_id] ? usersMap[s.user_id].email : s.client_email || 'Unknown'
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    return store.submissions
      .map(s => {
        const user = store.users.find(u => u.id === s.user_id);
        return {
          ...s,
          user_name: user ? user.name : 'Unknown',
          user_email: user ? user.email : 'Unknown'
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

async function updateSubmissionStatus(id, status) {
  const numericId = Number(id);

  if (isFirebaseConfigured && firestore) {
    const ref = firestore.collection('submissions').doc(`sub_${numericId}`);
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update({ status });
    const updated = await ref.get();
    return updated.data();
  } else {
    const sub = store.submissions.find(s => s.id === numericId);
    if (sub) {
      sub.status = status;
      saveLocalStore();
    }
    return sub || null;
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  verifyPassword,
  createSubmission,
  getSubmissionById,
  getSubmissionsByUser,
  getAllSubmissions,
  updateSubmissionStatus,
  generateTicketId,
  seedAdmin,
  isFirebaseConfigured
};
