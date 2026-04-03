# Firebase Setup Instructions

## Backend Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode"
4. Select a location for your database

### 3. Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable the following sign-in methods:
   - Email/Password
   - Google
   - GitHub (optional)

### 4. Generate Service Account Key
1. In Firebase Console, go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Save the downloaded JSON file as `serviceAccountKey.json` in the `backend` folder
5. **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` to keep it secure

### 5. Update .env file (optional)
Create a `.env` file in the backend folder:
```
PORT=3001
```

## Frontend Setup

### 1. Get Firebase Web Configuration
1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### 2. Update Firebase Config
Open `frontend/src/firebase/config.js` and replace the configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Configure OAuth Providers (Optional)

#### For Google Sign-In:
- Already enabled by default in Firebase

#### For GitHub Sign-In:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
4. Copy Client ID and Client Secret
5. In Firebase Console > Authentication > Sign-in method > GitHub
6. Paste Client ID and Client Secret
7. Enable GitHub sign-in

## Firestore Security Rules

Update your Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Documents collection
    match /documents/{documentId} {
      // Allow read if user is owner or collaborator
      allow read: if request.auth != null && 
        (resource.data.owner == request.auth.uid || 
         request.auth.uid in resource.data.collaborators);
      
      // Allow create if authenticated
      allow create: if request.auth != null && 
        request.resource.data.owner == request.auth.uid;
      
      // Allow update if user is owner or collaborator
      allow update: if request.auth != null && 
        (resource.data.owner == request.auth.uid || 
         request.auth.uid in resource.data.collaborators);
      
      // Allow delete if user is owner
      allow delete: if request.auth != null && 
        resource.data.owner == request.auth.uid;
    }
  }
}
```

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

1. Navigate to `http://localhost:5173/login`
2. Try creating an account with email/password
3. Try signing in with Google
4. Create a new document and test real-time collaboration

## Troubleshooting

### "Firebase Admin not initialized"
- Make sure `serviceAccountKey.json` exists in the backend folder
- Verify the JSON file is valid

### "Invalid token" errors
- Check that Firebase config in frontend matches your project
- Verify authentication is enabled in Firebase Console

### CORS errors
- Make sure backend server is running on port 3001
- Check that CORS is properly configured in backend

### OAuth not working
- Verify OAuth providers are enabled in Firebase Console
- Check redirect URLs are correctly configured
- For GitHub, ensure OAuth app is set up correctly
