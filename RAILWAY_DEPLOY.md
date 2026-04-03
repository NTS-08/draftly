# Deploy Draftly on Railway

Railway detected your monorepo structure. Here's how to deploy both frontend and backend.

## Architecture

Your project has two separate apps:
- **Backend** (`/backend`) - Node.js + Express + Socket.IO
- **Frontend** (`/frontend`) - React + Vite

You need to deploy them as separate services on Railway.

---

## Step 1: Deploy Backend on Railway

### Via Railway Dashboard

1. **Go to [Railway](https://railway.app/)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `draftly` repository

3. **Configure Backend Service**
   - Railway will detect your repo
   - Click "Add Service" → "GitHub Repo"
   - In settings, configure:
     - **Service Name**: `draftly-backend`
     - **Root Directory**: `backend`
     - **Start Command**: `node server.js`

4. **Add Environment Variables**
   
   Go to Variables tab and add:
   
   ```
   PORT=3001
   FIREBASE_PROJECT_ID=draftly-abe2c
   ```
   
   **For Firebase Service Account** (get from `serviceAccountKey.json`):
   ```
   FIREBASE_TYPE=service_account
   FIREBASE_PRIVATE_KEY_ID=<from serviceAccountKey.json>
   FIREBASE_PRIVATE_KEY=<entire private_key with -----BEGIN/END-----, replace \n with actual newlines>
   FIREBASE_CLIENT_EMAIL=<from serviceAccountKey.json>
   FIREBASE_CLIENT_ID=<from serviceAccountKey.json>
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_CERT_URL=<from serviceAccountKey.json>
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://draftly-backend.up.railway.app`)

---

## Step 2: Deploy Frontend on Netlify (Recommended)

Railway is better for backend services. For frontend, use Netlify:

### Via Netlify Dashboard

1. **Go to [Netlify](https://app.netlify.com/)**

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Add Environment Variables**
   
   In Site settings → Environment variables:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyAywUnJ6Qunuwesa8Zuf1FDRFqb9TKOlnw
   VITE_FIREBASE_AUTH_DOMAIN=draftly-abe2c.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=draftly-abe2c
   VITE_FIREBASE_STORAGE_BUCKET=draftly-abe2c.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=749068512817
   VITE_FIREBASE_APP_ID=1:749068512817:web:8fe324948a61571b9eef10
   VITE_FIREBASE_MEASUREMENT_ID=G-6YQSMPKRMQ
   VITE_API_URL=https://draftly-backend.up.railway.app
   ```
   
   ⚠️ Replace `VITE_API_URL` with your actual Railway backend URL!

5. **Deploy**
   - Click "Deploy site"
   - Wait for deployment
   - Your app is live!

---

## Alternative: Deploy Frontend on Railway Too

If you want both on Railway:

### Add Frontend Service

1. **In Railway Dashboard**
   - Click "New Service" in your project
   - Select "GitHub Repo" (same repo)

2. **Configure Frontend Service**
   - **Service Name**: `draftly-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`

3. **Add Environment Variables**
   
   Same as Netlify (all VITE_* variables)

4. **Install serve package**
   
   Add to `frontend/package.json` dependencies:
   ```json
   "serve": "^14.2.0"
   ```

5. **Deploy**

---

## Step 3: Update Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `draftly-abe2c`
3. Go to Authentication → Settings → Authorized domains
4. Add your domains:
   - `your-app.netlify.app` (or Railway frontend URL)
   - `draftly-backend.up.railway.app`

---

## Step 4: Update CORS in Backend

Update `backend/server.js` CORS configuration:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.netlify.app',
    'https://your-frontend.up.railway.app'
  ],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://your-app.netlify.app',
      'https://your-frontend.up.railway.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
});
```

Commit and push changes to trigger redeployment.

---

## Troubleshooting

### Backend Issues

**"Railpack could not determine how to build"**
- Make sure you set **Root Directory** to `backend` in Railway settings
- The `nixpacks.toml` file should help Railway detect Node.js

**"Module not found"**
- Check that all dependencies are in `backend/package.json`
- Railway runs `npm install` automatically

**"Firebase initialization failed"**
- Verify all Firebase environment variables are set
- Check that `FIREBASE_PRIVATE_KEY` includes the full key with BEGIN/END markers
- Make sure newlines in private key are actual newlines, not `\n` strings

### Frontend Issues

**"Build failed"**
- Check that all environment variables are set
- Verify `VITE_API_URL` points to your Railway backend URL

**"Can't connect to backend"**
- Verify CORS is configured correctly in backend
- Check that backend is running (visit backend URL)
- Ensure `VITE_API_URL` is correct

### WebSocket Issues

**"WebSocket connection failed"**
- Railway supports WebSockets by default
- Check CORS configuration includes your frontend URL
- Verify Socket.IO is properly configured

---

## Railway CLI Alternative

You can also deploy using Railway CLI:

### Install Railway CLI

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
```

### Deploy Backend

```bash
cd backend
railway init
railway up
```

### Deploy Frontend

```bash
cd frontend
railway init
railway up
```

---

## Monitoring

### View Logs

**Railway:**
- Go to your service → Logs tab
- Real-time logs show all console output

**Netlify:**
- Go to Deploys → Select deployment → Logs

### Check Status

**Backend Health Check:**
```bash
curl https://your-backend.up.railway.app/api/health
```

Should return: `{"status":"ok","message":"Server is running"}`

---

## Cost

**Railway:**
- Free tier: $5 credit/month
- Enough for small projects
- Sleeps after inactivity (free tier)

**Netlify:**
- Free tier: 100GB bandwidth/month
- 300 build minutes/month
- No sleep/cold starts

---

## Recommended Setup

✅ **Backend**: Railway (good for Node.js + WebSockets)
✅ **Frontend**: Netlify (excellent for React/Vite, free SSL, CDN)

This combination gives you:
- Free hosting for both
- Reliable WebSocket support
- Fast CDN for frontend
- Easy deployment from Git

---

## Quick Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Netlify
- [ ] All environment variables set
- [ ] Firebase authorized domains updated
- [ ] CORS configured in backend
- [ ] Test authentication
- [ ] Test document creation
- [ ] Test real-time collaboration
- [ ] Test sharing functionality

---

## Need Help?

- Railway Docs: https://docs.railway.app/
- Netlify Docs: https://docs.netlify.com/
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for more options
