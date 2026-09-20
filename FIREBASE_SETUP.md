# 🔥 Firebase Setup Guide — HAPPY HEART MEDIA

To store all your user data and project submissions online in **Firebase Cloud Firestore**, follow these easy steps:

---

## Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and log in with your Google account.
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g. `happyheart-media`) and click **Continue**.
4. (Optional) Disable Google Analytics for simplicity, or keep it enabled, then click **Create Project**.

---

## Step 2: Enable Cloud Firestore Database
1. In the left navigation menu, click **Build** -> **Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your users (e.g., `nam5 (us-central)` or `asia-south1`).
4. Select **Start in test mode** (or **production mode** with standard read/write rules) and click **Create**.

---

## Step 3: Download Service Account Key JSON
1. In your Firebase Console, click the **Gear Icon ⚙️** next to *Project Overview* -> **Project settings**.
2. Navigate to the **Service accounts** tab.
3. Select **Node.js** as the Admin SDK configuration.
4. Click the **Generate new private key** button.
5. Click **Generate key** to download the JSON file.

---

## Step 4: Add Key File to Project
1. Rename the downloaded `.json` file to:
   ```text
   serviceAccountKey.json
   ```
2. Place this file inside your project root folder:
   ```text
   HAPPYHEART_MEDIA/
   ├── serviceAccountKey.json   <-- Put it here
   ├── server.js
   ├── db.js
   └── ...
   ```

---

## Step 5: Start Your Server
Run your server:
```bash
npm start
# OR double click start.bat
```

You will see the log output:
```text
🔥 Firebase Cloud Firestore connected successfully via serviceAccountKey.json
✅ Firestore Collections 'users' & 'submissions' initialized online!
```

All new registrations, logins, and project requests will now sync directly to your **Firebase Cloud Firestore database** online! 🚀
