# HAPPY HEART MEDIA Official Website
> *"Websites That Work. Ads That Grow."*

Welcome to the official freelance agency website for **HAPPY HEART MEDIA**. 

Built with a modern **Dark & Champagne Gold Theme**, it provides a bespoke experience for freelance web development and performance advertising services. It features an integrated client work intake portal, private client order tracking, cold-start handling for Render hosting, and decoupled static hosting readiness for Cloudflare Pages / Vercel.

---

## 🌟 Pages & Architecture

1. [`index.html`](index.html) — **Home**:
   - Hero value proposition with quick stats and official brand showcase.
   - 3-pillar service cards with aligned pricing and package breakdown.
   - 3-step project workflow ("Share Your Project Brief" → "I Build & Share Milestones" → "Review & Launch").
   - Hidden Testimonials / Case Studies section ready for verified client reviews.
   - Instagram spotlight with direct link to `@HAPPYHEART_MEDIA`.

2. [`services.html`](services.html) — **Services & Pricing**:
   - Transparent pricing tiers for Website Development ($399, $799, $1,399), Ads & Marketing ($450, $750, $1,200), and Full Growth Suite ($1,499).
   - "What's included" breakdowns with revision terms and ad spend disclosure.
   - "Start Your Project" direct CTA buttons.

3. [`portfolio.html`](portfolio.html) — **Portfolio & Case Studies**:
   - Filterable gallery (All, Websites, Ads & Marketing, Branding).
   - Real-world case study cards with performance metrics.

4. [`contact.html`](contact.html) — **Contact & FAQ**:
   - Direct communication channels: WhatsApp direct chat, Instagram DM (`@HAPPYHEART_MEDIA`), and direct email.
   - Interactive FAQ accordion addressing turnaround times, revisions, brief submission, and assets.

5. [`submit-work.html`](submit-work.html) — **Client Work Intake**:
   - 3-step project brief form with service selection, project specs & budget, and client contact details.
   - Generates reference tracking IDs (e.g. `HHM-2026-XXXX`).
   - 1-click WhatsApp delivery with pre-filled formatted brief.
   - Instant downloadable project brief (`.txt`).

6. [`auth.html`](auth.html) — **Client & Admin Authentication**:
   - Session-based user registration and login.
   - Password encryption using `bcrypt`.
   - Delayed 3-second server wake notification for free-tier spin-up.

7. [`privacy-policy.html`](privacy-policy.html) — **Privacy Policy (Draft)**:
   - Outlines collected data, storage security, usage purpose, and data deletion request instructions.

8. [`admin.html`](admin.html) — **Developer & Admin Dashboard**:
   - Real-time orders management, search, status filtering, order printing, and JSON/CSV export.

---

## ⚙️ Configuration (`js/config.js`)

Central configuration is stored in [`js/config.js`](js/config.js):
- **`API_BASE_URL`**: Leave as `''` (empty string) for monolithic hosting (Node serving static files). Set to your Render URL (e.g. `https://happyheart-media.onrender.com`) when hosting frontend on Cloudflare Pages.
- **`HHM_CONFIG.whatsappNumber`**: Your international WhatsApp phone number without `+` or spaces (e.g., `15551234567`).
- **`HHM_CONFIG.contactEmail`**: Your official contact email.

---

## 🛡️ Database & Security Architecture

### Backend Route Protection:
- All sensitive API endpoints under `/api/submissions` are strictly protected on the backend using `express-session`:
  - `GET /api/submissions`: Regular clients can only query their own submissions (`db.getSubmissionsByUser(userId)`). Admins query all.
  - `GET /api/submissions/:id`: Verifies ownership before returning brief details.
  - `PATCH /api/submissions/:id/status` & `DELETE /api/submissions/:id`: Strictly protected by `requireAdmin` middleware.
- Passwords are encrypted with `bcrypt` (10 salt rounds) before database storage.

### Row Level Security (RLS) & DB Access:
- The front-end makes **zero direct database calls** (no client-side database keys are exposed).
- All database operations are mediated exclusively by the Express backend running in Node.js on Render.
- If migrating to Supabase or direct client Firestore in the future, **Row Level Security (RLS)** must be enabled on the `users` and `submissions` tables/collections to enforce `auth.uid() = user_id`.

---

## 💚 Health Check & Cold-Start Keep-Alive

- **Health Route**: `GET /health` and `GET /api/health`
  - Runs a lightweight database connectivity query and returns uptime and timestamp.
  - Recommended: Set up a free uptime monitor (e.g. UptimeRobot, cron-job.org) to ping `https://happyheart-media.onrender.com/health` every 10–14 minutes to prevent Render free-tier instance sleeping and Supabase/database inactivity pausing.
- **Wake Route**: `GET /api/wake`
  - Polled automatically by [`js/cold-start.js`](js/cold-start.js) to display a smooth loading overlay if the backend is cold-booting.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm start
# Visit http://localhost:3000
```
