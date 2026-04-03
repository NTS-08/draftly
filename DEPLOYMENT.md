# Draftly Deployment Guide

This guide covers deploying both the frontend and backend of your Draftly application.

## Overview

Draftly consists of two parts:
- **Frontend**: React + Vite application
- **Backend**: Node.js + Express + Socket.IO server

## Table of Contents
1. [Frontend Deployment (Netlify - Recommended)](#frontend-deployment-netlify)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Backend Deployment (Railway)](#backend-deployment-railway)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Post-Deployment Configuration](#post-deployment-configuration)

---

## Frontend Deployment (Netlify)

### Prerequisites
- GitHub/GitLab account with your code pushed
- Netlify account (free tier available)

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

4. **Initialize Netlify**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter site name (e.g., `draftly-app`)
   - Build command: `npm run build`
   - Publish directory: `dist`

5. **Set Environment Variables**
   ```bash
   netlify env:set VITE_FIREBASE_API_KEY "your_api_key"
   netlify env:set VITE_FIREBASE_AUTH_DOMAIN "draftly-abe2c.firebaseapp.com"
   netlify env:set VITE_FIREBASE_PROJECT_ID "draftly-abe2c"
   netlify env:set VITE_FIREBASE_STORAGE_BUCKET "draftly-abe2c.firebasestorage.app"
   netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "749068512817"
   netlify env:set VITE_FIREBASE_APP_ID "your_app_id"
   netlify env:set VITE_FIREBASE_MEASUREMENT_ID "your_measurement_id"
   netlify env:set VITE_API_URL "https://your-backend-url.com"
   ```

6. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variables in Site settings → Environment variables
6. Click "Deploy site"

### Create netlify.toml (Optional but Recommended)

Create `frontend/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## Frontend Deployment (Vercel)

### Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend**
   ```bash
   cd frontend
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   Follow the prompts and set environment variables when asked.

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Via Vercel Dashboard

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables
6. Click "Deploy"

---

## Backend Deployment (Render)

### Prerequisites
- Render account (free tier available)
- Your code pushed to GitHub/GitLab

### Steps

1. **Go to [Render](https://render.com/)**

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `draftly-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: Free

3. **Add Environment Variables**
   - `PORT`: `3001` (or leave empty to use Render's default)
   - `FIREBASE_PROJECT_ID`: `draftly-abe2c`
   - Add Firebase service account as environment variables (see below)

4. **Firebase Service Account Setup**
   
   Instead of uploading `serviceAccountKey.json`, use environment variables:
   
   ```bash
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=draftly-abe2c
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@draftly-abe2c.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_CERT_URL=your_client_cert_url
   ```

5. **Update server.js to use environment variables**
   
   See the code modification section below.

6. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy

---

## Backend Deployment (Railway)

### Steps

1. **Go to [Railway](https://railway.app/)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Select the backend directory
   - Railway auto-detects Node.js

4. **Add Environment Variables**
   - Go to Variables tab
   - Add all Firebase environment variables (same as Render)

5. **Configure Start Command**
   - In Settings → Deploy
   - Start Command: `node server.js`
   - Root Directory: `backend`

6. **Deploy**
   - Railway automatically deploys on push

---

## Environment Variables Setup

### Frontend Environment Variables

Set these in your hosting platform (Netlify/Vercel):

```
VITE_FIREBASE_API_KEY=AIzaSyAywUnJ6Qunuwesa8Zuf1FDRFqb9TKOlnw
VITE_FIREBASE_AUTH_DOMAIN=draftly-abe2c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=draftly-abe2c
VITE_FIREBASE_STORAGE_BUCKET=draftly-abe2c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=749068512817
VITE_FIREBASE_APP_ID=1:749068512817:web:8fe324948a61571b9eef10
VITE_FIREBASE_MEASUREMENT_ID=G-6YQSMPKRMQ
VITE_API_URL=https://your-backend-url.onrender.com
```

### Backend Environment Variables

Set these in your hosting platform (Render/Railway):

```
PORT=3001
FIREBASE_PROJECT_ID=draftly-abe2c
```

Plus all Firebase service account credentials (see Render section above).

---

## Update Backend for Production

### Modify server.js to use environment variables for Firebase

Add this code to `backend/server.js` before Firebase initialization:

```javascript
// Initialize Firebase Admin
let firebaseInitialized = false;

try {
  // Try to use environment variables first (for production)
  if (process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized with environment variables');
  } else {
    // Fall back to service account file (for local development)
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized with service account file');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  // ... rest of error handling
}
```

---

## Post-Deployment Configuration

### 1. Update Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `draftly-abe2c`
3. Go to Authentication → Settings → Authorized domains
4. Add your deployed domains:
   - `your-app.netlify.app`
   - `your-app.vercel.app`
   - `your-custom-domain.com`

### 2. Update CORS in Backend

Update the CORS configuration in `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### 3. Update Socket.IO CORS

```javascript
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://your-app.netlify.app',
      'https://your-custom-domain.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
});
```

### 4. Update Frontend API URL

Make sure `VITE_API_URL` in your frontend environment variables points to your deployed backend URL.

---

## Custom Domain Setup

### Netlify Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

### Vercel Custom Domain

1. Go to Project settings → Domains
2. Add your domain
3. Configure DNS records as instructed

---

## Monitoring and Logs

### Netlify
- View logs in Site → Deploys → Deploy log
- Real-time logs: `netlify logs`

### Vercel
- View logs in Deployments → Select deployment → Logs

### Render
- View logs in Dashboard → Your service → Logs

### Railway
- View logs in Project → Service → Logs

---

## Troubleshooting

### Frontend Issues

**Build fails:**
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

**Firebase connection fails:**
- Verify all Firebase environment variables
- Check Firebase authorized domains
- Ensure API keys are correct

### Backend Issues

**Server won't start:**
- Check PORT environment variable
- Verify Firebase credentials
- Check logs for specific errors

**Socket.IO connection fails:**
- Verify CORS configuration
- Check WebSocket support on hosting platform
- Ensure frontend is using correct backend URL

**Database operations fail:**
- Verify Firebase service account credentials
- Check Firestore rules
- Ensure service account has proper permissions

---

## Quick Deployment Checklist

- [ ] Push code to GitHub/GitLab
- [ ] Set up frontend on Netlify/Vercel
- [ ] Set frontend environment variables
- [ ] Set up backend on Render/Railway
- [ ] Set backend environment variables
- [ ] Update Firebase authorized domains
- [ ] Update CORS configuration
- [ ] Test authentication
- [ ] Test document creation
- [ ] Test real-time collaboration
- [ ] Test sharing functionality
- [ ] Set up custom domain (optional)

---

## Recommended Stack

For the best experience, we recommend:
- **Frontend**: Netlify (excellent for React/Vite, free SSL, CDN)
- **Backend**: Render (free tier, good for Node.js + WebSockets)

This combination provides:
- Free hosting for both frontend and backend
- Automatic HTTPS
- Good performance
- Easy deployment from Git
- Reliable WebSocket support

---

## Need Help?

- Netlify Docs: https://docs.netlify.com/
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app/
- Firebase Docs: https://firebase.google.com/docs

---

## Production Optimization Tips

1. **Enable caching** in your hosting platform
2. **Compress assets** (most platforms do this automatically)
3. **Use environment-specific configs** for development vs production
4. **Set up monitoring** (Sentry, LogRocket, etc.)
5. **Configure CDN** for static assets
6. **Enable auto-scaling** if traffic grows
7. **Set up backup strategy** for Firestore data
8. **Implement rate limiting** on backend API
9. **Add health check endpoints** for monitoring
10. **Set up CI/CD** for automated deployments
