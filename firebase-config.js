/**
 * HAPPY HEART MEDIA — Firebase Config & Initializer
 * Checks for serviceAccountKey.json or process.env variables to initialize Firebase Admin SDK.
 * If credentials are not yet present, provides a graceful fallback warning.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;
let isFirebaseConfigured = false;

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    isFirebaseConfigured = true;
    console.log('🔥 Firebase Cloud Firestore connected successfully via serviceAccountKey.json');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    db = admin.firestore();
    isFirebaseConfigured = true;
    console.log('🔥 Firebase Cloud Firestore connected successfully via environment variables');
  } else {
    console.log('ℹ️ Firebase credentials not found (serviceAccountKey.json or .env).');
    console.log('   Follow FIREBASE_SETUP.md to connect your live Firebase project.');
    console.log('   Falling back to local storage layer for now.');
  }
} catch (err) {
  console.error('⚠️ Firebase Initialization Error:', err.message);
  console.log('   Falling back to local storage layer.');
}

module.exports = {
  db,
  admin,
  isFirebaseConfigured
};
