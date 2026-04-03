# Environment Variables Setup

This project uses environment variables to keep sensitive configuration secure.

## Frontend Setup

1. Navigate to the `frontend` directory
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. The `.env` file is already configured with the correct values for this project
4. If you need to change the backend URL, update `VITE_API_URL` in `.env`

### Frontend Environment Variables

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

## Backend Setup

1. Navigate to the `backend` directory
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. The `.env` file is already configured with the correct values
4. You still need to add your Firebase service account key file (`serviceAccountKey.json`)

### Backend Environment Variables

- `PORT` - Server port (default: 3001)
- `FIREBASE_PROJECT_ID` - Firebase project ID

## Important Notes

- **Never commit `.env` files to version control** - they are already in `.gitignore`
- The `.env.example` files show the structure without sensitive values
- For production deployment, set environment variables through your hosting platform
- The `serviceAccountKey.json` file should also never be committed (already in `.gitignore`)

## Running the Application

After setting up environment variables:

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
node server.js
```

## Troubleshooting

If you see errors about missing environment variables:
1. Make sure `.env` files exist in both `frontend` and `backend` directories
2. Restart your development servers after creating/modifying `.env` files
3. Check that variable names match exactly (including `VITE_` prefix for frontend)
