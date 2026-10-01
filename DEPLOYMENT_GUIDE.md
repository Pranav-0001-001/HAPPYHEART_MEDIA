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

## 🧊 Handling Cold Starts on Render Free Tier

Render's free tier puts your server to **sleep after ~15 minutes of inactivity**. When the next visitor arrives, the server must cold-boot — which can take **30–60 seconds**. Without handling, your site looks broken.

This project includes three layers of protection:

### 1. ✨ "Waking Up the Server…" Loading Overlay

A premium animated loading screen (`js/cold-start.js`) is automatically shown to visitors while the backend starts. It includes:

- Animated pulsing gold ring + heartbeat logo
- Progress bar with asymptotic fill
- Contextual status messages ("Connecting…", "Waking up…", "Almost there…")
- Automatic dismissal once `/api/wake` responds
- **Smart detection**: If the server replies within 2 seconds (i.e., it was already awake), the overlay is never shown — zero visual impact.

### 2. 💓 Self-Ping Keep-Alive (Built-In)

The server itself pings `/api/health` every **12 minutes** via `setInterval` when running on Render (detected via `RENDER_EXTERNAL_URL`). This prevents the instance from sleeping as long as it's running.

> **Math check**: One always-on service × 24h × 31 days = **744 hours**, which fits within Render's **750 free hours/month**. However, this only works for **one** service — you won't fit multiple.

### 3. 🔔 External Uptime Monitor (Recommended)

For extra reliability, configure a **free uptime monitor** to ping your health endpoint:

| Service | Free Plan | Interval |
|---------|----------|----------|
| [UptimeRobot](https://uptimerobot.com/) | 50 monitors | Every 5 min |
| [cron-job.org](https://cron-job.org/) | Unlimited | Custom cron |
| [Freshping](https://freshping.io/) | 50 monitors | Every 1 min |

**Setup**: Create a monitor pointing to:
```
https://happyheart-media.onrender.com/api/health
```
Set the interval to **every 10–14 minutes**.

### 4. 💰 For Paying Clients: Render Paid Instance (Best Solution)

> **🏆 If you're deploying this for a paying client, the correct solution is Render's paid tier — not workarounds.**

Render's **Starter plan ($7/month)** gives you:
- ✅ **No sleeping** — server stays on 24/7
- ✅ **Zero cold starts** — instant response times
- ✅ **More RAM & CPU** — better performance under load
- ✅ **Custom domains with auto-SSL**
- ✅ **Persistent disk** for file storage

**How to upgrade**: In Render Dashboard → Your Service → Settings → Instance Type → Select "Starter" ($7/mo) or higher.

This is the professional, reliable solution you should recommend to any paying client rather than relying on free-tier workarounds with uptime monitors.

---

## 🔐 Environment Variables for Production

In your Vercel or Render dashboard, add these environment variables for maximum security:

- `SESSION_SECRET`: A long random secret string.
- `FIREBASE_PROJECT_ID`: Your Firebase project ID (optional if using Firestore).
- `FIREBASE_CLIENT_EMAIL`: Your Firebase service account email.
- `FIREBASE_PRIVATE_KEY`: Your Firebase private key string.

### Render-Specific Variables

- `RENDER_EXTERNAL_URL`: Automatically set by `render.yaml`. Used by the self-ping keep-alive system. If deploying manually (not via Blueprint), set this to your full Render URL (e.g., `https://happyheart-media.onrender.com`).

---

## 📡 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check — returns uptime, boot time, status |
| `/api/wake` | GET | Quick wake-check for the frontend overlay |
| `/api/auth/*` | Various | Authentication routes |
| `/api/submissions/*` | Various | Project submission routes |
