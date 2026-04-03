# How to Get Firebase Service Account Key

## Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)

2. Select your project: **draftly-abe2c**

3. Click the **gear icon** (⚙️) next to "Project Overview" → **Project settings**

4. Go to the **"Service accounts"** tab

5. Click **"Generate new private key"** button

6. Click **"Generate key"** in the confirmation dialog

7. A JSON file will be downloaded (e.g., `draftly-abe2c-firebase-adminsdk-xxxxx.json`)

8. **Rename** the downloaded file to: `serviceAccountKey.json`

9. **Move** the file to the `backend` folder of this project:
   ```
   backend/
   ├── serviceAccountKey.json  ← Place it here
   ├── server.js
   └── package.json
   ```

10. **IMPORTANT**: The file is already in `.gitignore` to keep it secure. Never commit this file to Git!

## Verify Setup:

After placing the file, restart your backend server:

```bash
cd backend
npm run dev
```

You should see:
```
Firebase Admin initialized successfully
Server running on port 3001
```

If you see an error, check that:
- The file is named exactly `serviceAccountKey.json`
- The file is in the `backend` folder
- The JSON file is valid (not corrupted)

## Enable Firestore:

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (e.g., us-central)
5. Click **"Enable"**

## Enable Authentication:

1. In Firebase Console, go to **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable:
   - ✅ Email/Password
   - ✅ Google
   - ✅ GitHub (optional)

## Test the Setup:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to: `http://localhost:5173/login`
4. Try signing up with email/password
5. Try signing in with Google

Done! 🎉
