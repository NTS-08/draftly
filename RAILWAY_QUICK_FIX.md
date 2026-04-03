# Railway Deployment - Quick Fix

## The Problem

Railway is looking at your root directory, but your app has two separate folders:
- `/backend` - Node.js server
- `/frontend` - React app

## The Solution

Deploy backend and frontend as **separate services**.

---

## Quick Steps

### 1. Deploy Backend on Railway

1. In Railway dashboard, configure:
   - **Root Directory**: `backend`
   - **Start Command**: `node server.js`

2. Add environment variables (from your `serviceAccountKey.json`):
   ```
   FIREBASE_PROJECT_ID=draftly-abe2c
   FIREBASE_PRIVATE_KEY=<your private key>
   FIREBASE_CLIENT_EMAIL=<your client email>
   FIREBASE_CLIENT_ID=<your client id>
   FIREBASE_PRIVATE_KEY_ID=<your private key id>
   FIREBASE_CLIENT_CERT_URL=<your cert url>
   ```

3. Deploy and copy your backend URL

### 2. Deploy Frontend on Netlify (Easier)

1. Go to Netlify → New site from Git
2. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

3. Add environment variables:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyAywUnJ6Qunuwesa8Zuf1FDRFqb9TKOlnw
   VITE_FIREBASE_AUTH_DOMAIN=draftly-abe2c.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=draftly-abe2c
   VITE_FIREBASE_STORAGE_BUCKET=draftly-abe2c.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=749068512817
   VITE_FIREBASE_APP_ID=1:749068512817:web:8fe324948a61571b9eef10
   VITE_FIREBASE_MEASUREMENT_ID=G-6YQSMPKRMQ
   VITE_API_URL=<your Railway backend URL>
   ```

4. Deploy!

---

## Why This Error Happened

Railway's Railpack couldn't find a `package.json` in the root directory because your project structure is:

```
draftly/
├── backend/          ← Has package.json
│   └── package.json
├── frontend/         ← Has package.json
│   └── package.json
└── README.md         ← Root has no package.json
```

Railway needs to know which folder to deploy. That's why you set **Root Directory** to `backend`.

---

## Alternative: Monorepo Setup

If you want to deploy from root, you'd need to restructure or use a monorepo tool like:
- Turborepo
- Nx
- Lerna

But the **separate services approach is simpler and recommended**.

---

## Full Guide

See [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) for complete instructions.
