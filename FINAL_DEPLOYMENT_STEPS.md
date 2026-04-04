# Final Deployment Steps for Draftly

## Current Status
✅ Backend deployed on Render: https://draftly1.onrender.com
✅ Frontend deployed on Netlify: https://draftly-08.netlify.app
✅ Code updated to use API_URL constant instead of hardcoded localhost

## Issue Fixed
The 404 errors were caused by the frontend trying to connect to `http://localhost:3001` instead of the deployed Render backend. All hardcoded URLs have been replaced with the `API_URL` constant from `firebase/config.js`.

## Steps to Complete Deployment

### 1. Fix Render Backend Firebase Key (CRITICAL)
The backend is running but in LIMITED mode due to Firebase private key format error.

**Go to Render Dashboard:**
1. Visit https://dashboard.render.com/
2. Click on your `draftly1` service
3. Go to "Environment" tab
4. Find `FIREBASE_PRIVATE_KEY` and click "Edit"
5. Delete the current value
6. Paste this (with actual line breaks, not \n):

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDsExQ3Jo5/0ckL
WjljlItKpW3l0/UKRtrGw56gF0elIU2tDrQOWOi03Sf4IPkkxtF0ev27u95ml9hN
EjomC+a3Uu7ddcgZwjAxLUM+iPnFC7jhZ+bskdUultTMHQclDwsCa2jaeQ/dBpBV
66m35LF/Fj5cHVN5ymWDZLtOZrwFaVUBS4CAOfGAmS8aKNAHioVAiI1hdf0Ezz0N
AKnEOAovKHJYmMRWn+nLV1IW70I/KxxMiolQd7UoWDmZ7ZgNWepgLRje8L+eBoL0
9mk0QDJmtdmuO2CNlZ5xshS7V/BW8h+z3zUiKq8vAKDnYB8iUVVGoHoNErOjPk0x
KWdEUoZDAgMBAAECggEAXDcXrnNhNoy7+7NCt6NOxdnZE+23ykvjKcFANUjis55O
uUsFCpWwUPYSpto6eCMxrk5czviT539o/rIgBLyhYvsCU3+uqmEwcgU8PzFCX7Y0
gdgUXFSa8Zf5h8HPCKrXohpS2wRvLediei2UHkE3FG2b7l+GPAzTmn++quF2kKXU
YmzIAgAm2gI7aYv+ce/QuDC0HTBGR8kjhS2EvWpMOthG8C3WEPHtAv1IO0XEYBv2
6xV0vD9TdTRxnxY5hi3KUCh3ixp34RS7t7ikxlXrzMA+z7skXfEKPicuVo7Q+bK5
5uatD528F2j2hUq09WbAuvkYEZIN9kExya3+ZKJAAQKBgQD+cuV2jHEVUSPne+rJ
77qzDXl86p765DWIKO41sf+Cr07wwktXHokcfKO2ON80pr1pkREofgReNDQ4VQoF
EUpvzxEveKSTmBupwfMqHWjnoKzxyt1AvBeK98GXYUMVdCn1gES0SR2D+PuRqzmp
4ny81N3P4hAhnWV9j25ZvJ5BCQKBgQDtg4HGSNKxCzUQx8Sp9CYxzKUFcf75PyqN
tS6DpE95DEjZLrwVjSEP+nBL8R9qqBroa/2KPrrc1A/G1XNT+wb+bWa29sHm8pdc
RlQ90cYmljv9fQc0DCiN4me5iNR1rkPPELe+YoshuDWPaZP0m7adOiRk8P0ilGpU
pJzkYkH76wKBgD/JM8bFLDAI2DRWdyRKSYZLUXJEKriAbv8EK7sgNQpgwixOuK5N
RFf00uGCXkoHpqIJMMDy3ktzUMfyYYGltQBUa114I+GwFvc2XKvpFXxDZjdzAIYS
4OAAffJh+nwtU7tsfUyoq5KC3yXEQ79XvKdlwXk0lZCnsWKJi0NJqm5pAoGARufk
nTpuU9ZhsDHDP22Y3XMXrMl8chJudMGrMjeiViPZt6ShF9n7DdcZIULJu0CWT961
YUka5gQU9aoRdPfS/a/RYzvFZVn03+JLEe2HN0vQevuRY/NhRAJcLuJvcvZkXfPC
tv6aRKXGr5q4ReUanlOWO+BJ4cHnAH/oKrI+uqMCgYEA3Od7fIdXxFRec0IDhmbN
hsAQoTDWdUntaUauPmPSzmcL8Mxqj91yxU3Zl26E+jG0ilD3RYEyLocfEJMooNmO
Kiwt/oxOYtts37PJQf8PYPFbRUGmPd5x4/Eh7hDG0p/Bmes7j2ij7tY9kWJvq86b
2S1iPCHPOsI3Zp/ORlrP3rk=
-----END PRIVATE KEY-----
```

7. Click "Save Changes"
8. Wait 1-2 minutes for auto-redeploy
9. Check logs - you should see: `✅ Firebase Admin initialized with environment variables (production mode)`

### 2. Push Code Changes to GitHub
Run these commands in your terminal:

```bash
git add frontend/src/pages/LandingPage.jsx frontend/src/pages/EditorPage.jsx frontend/src/components/NotificationBell.jsx
git commit -m "Fix: Replace hardcoded localhost URLs with API_URL constant"
git push
```

### 3. Update Netlify Environment Variable
1. Go to https://app.netlify.com/
2. Click on your `draftly-08` site
3. Go to "Site configuration" → "Environment variables"
4. Find `VITE_API_URL` and click "Edit"
5. Change value to: `https://draftly1.onrender.com`
6. Click "Save"

### 4. Redeploy Netlify Frontend
After updating the environment variable:
1. Go to "Deploys" tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait 2-3 minutes for build to complete

### 5. Add Netlify Domain to Firebase
1. Go to https://console.firebase.google.com/
2. Select project: `draftly-abe2c`
3. Go to "Authentication" → "Settings" → "Authorized domains"
4. Click "Add domain"
5. Add: `draftly-08.netlify.app`
6. Click "Add"

## Verification Steps

After completing all steps above:

1. **Test Backend Health:**
   - Visit: https://draftly1.onrender.com/api/health
   - Should see: `{"status":"ok","message":"Server is running"}`

2. **Test Frontend:**
   - Visit: https://draftly-08.netlify.app
   - Sign in with your account
   - Create a new document
   - Verify it saves and appears in your document list

3. **Test Real-time Collaboration:**
   - Open same document in two browser tabs
   - Type in one tab, should appear in the other

## Troubleshooting

### If backend still shows LIMITED mode:
- Check Render logs for Firebase error
- Verify FIREBASE_PRIVATE_KEY has actual line breaks (not `\n` text)
- Make sure all other Firebase env vars are set correctly

### If frontend shows 404 errors:
- Check browser console for exact URL being called
- Verify VITE_API_URL is set to `https://draftly1.onrender.com` in Netlify
- Make sure you redeployed after changing env var

### If authentication fails:
- Check Firebase Console → Authentication → Authorized domains
- Make sure `draftly-08.netlify.app` is in the list
- Check browser console for specific Firebase error

## Files Changed
- `frontend/.env` - Updated VITE_API_URL to Render URL
- `frontend/src/pages/LandingPage.jsx` - Replaced localhost with API_URL
- `frontend/src/pages/EditorPage.jsx` - Replaced localhost with API_URL
- `frontend/src/components/NotificationBell.jsx` - Replaced localhost with API_URL

## Next Steps After Deployment
Once everything is working:
1. Test all features (create, edit, share, delete documents)
2. Test on mobile devices
3. Consider setting up custom domain
4. Monitor Render logs for any errors
5. Set up Render auto-deploy from GitHub (optional)
