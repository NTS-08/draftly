# Quick Deploy Guide - Get Draftly Online in 15 Minutes

This is a simplified guide to get your app deployed quickly. For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Step 1: Prepare Your Code (2 minutes)

1. **Commit and push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

## Step 2: Deploy Frontend to Netlify (5 minutes)

1. **Go to [Netlify](https://app.netlify.com/)**
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Click "Show advanced" → "New variable" and add:
   ```
   VITE_FIREBASE_API_KEY = AIzaSyAywUnJ6Qunuwesa8Zuf1FDRFqb9TKOlnw
   VITE_FIREBASE_AUTH_DOMAIN = draftly-abe2c.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = draftly-abe2c
   VITE_FIREBASE_STORAGE_BUCKET = draftly-abe2c.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 749068512817
   VITE_FIREBASE_APP_ID = 1:749068512817:web:8fe324948a61571b9eef10
   VITE_FIREBASE_MEASUREMENT_ID = G-6YQSMPKRMQ
   VITE_API_URL = (leave empty for now, we'll add this after backend deployment)
   ```
6. Click "Deploy site"
7. **Save your Netlify URL** (e.g., `https://your-app.netlify.app`)

## Step 3: Deploy Backend to Render (5 minutes)

1. **Go to [Render](https://render.com/)**
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `draftly-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: Free
5. Click "Advanced" and add environment variables:
   
   **Get these from your serviceAccountKey.json file:**
   ```
   FIREBASE_TYPE = service_account
   FIREBASE_PROJECT_ID = (copy from serviceAccountKey.json)
   FIREBASE_PRIVATE_KEY_ID = (copy from serviceAccountKey.json)
   FIREBASE_PRIVATE_KEY = (copy entire private_key including -----BEGIN/END-----)
   FIREBASE_CLIENT_EMAIL = (copy from serviceAccountKey.json)
   FIREBASE_CLIENT_ID = (copy from serviceAccountKey.json)
   FIREBASE_AUTH_URI = https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI = https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_CERT_URL = https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_CERT_URL = (copy from serviceAccountKey.json)
   ```

6. Click "Create Web Service"
7. **Save your Render URL** (e.g., `https://draftly-backend.onrender.com`)

## Step 4: Connect Frontend to Backend (2 minutes)

1. Go back to **Netlify**
2. Go to Site settings → Environment variables
3. Edit `VITE_API_URL` and set it to your Render URL:
   ```
   VITE_API_URL = https://draftly-backend.onrender.com
   ```
4. Go to Deploys → Trigger deploy → Deploy site

## Step 5: Update Firebase Settings (1 minute)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `draftly-abe2c`
3. Go to Authentication → Settings → Authorized domains
4. Click "Add domain" and add your Netlify URL:
   ```
   your-app.netlify.app
   ```

## Done! 🎉

Your app is now live at: `https://your-app.netlify.app`

## Test Your Deployment

1. Visit your Netlify URL
2. Try signing up with email or Google
3. Create a new document
4. Share it with another email
5. Test real-time collaboration

## Troubleshooting

**Frontend loads but can't connect to backend:**
- Check that `VITE_API_URL` is set correctly in Netlify
- Verify your Render backend is running (check logs)

**Authentication doesn't work:**
- Make sure you added your domain to Firebase Authorized domains
- Check that all Firebase environment variables are set

**Backend crashes:**
- Check Render logs for errors
- Verify all Firebase environment variables are set correctly
- Make sure `FIREBASE_PRIVATE_KEY` includes the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

## Free Tier Limitations

- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Render**: Free tier sleeps after 15 minutes of inactivity (first request may be slow)

## Next Steps

- Set up a custom domain
- Enable automatic deployments on git push
- Set up monitoring and error tracking
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for advanced configuration

## Need Help?

Check the full [DEPLOYMENT.md](DEPLOYMENT.md) guide for detailed instructions and troubleshooting.
