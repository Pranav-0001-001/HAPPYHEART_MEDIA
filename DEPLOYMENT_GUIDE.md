# 🌐 Deployment Guide — HAPPY HEART MEDIA

Your project is ready to deploy! Here are the 2 fastest ways to deploy your website with full Node.js backend support:

---

## ⚡ Option 1: Vercel (Recommended — Instant & Free)

Since `vercel.json` is configured in your project, Vercel will deploy your website instantly:

1. **Push to GitHub** (Already done via `git push`).
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository `HAPPYHEART_MEDIA`.
4. Click **Deploy**.

Vercel will give you a live production URL like `https://happyheart-media.vercel.app`.

*(Optional: In Vercel Project Settings > Environment Variables, you can add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` for online Firestore integration!)*

---

## 🚀 Option 2: Render.com (Full Web Service)

1. Go to [Render](https://render.com/) and create a free account.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `HAPPYHEART_MEDIA`.
4. Render will automatically detect `render.yaml` and set the build command to `npm install` and start command to `node server.js`.
5. Click **Create Web Service**.

Your site will be live at `https://happyheart-media.onrender.com`.

---

## 🔐 Environment Variables for Production
In your Vercel or Render dashboard, add these environment variables for maximum security:

- `SESSION_SECRET`: A long random secret string.
- `FIREBASE_PROJECT_ID`: Your Firebase project ID (optional if using Firestore).
- `FIREBASE_CLIENT_EMAIL`: Your Firebase service account email.
- `FIREBASE_PRIVATE_KEY`: Your Firebase private key string.
