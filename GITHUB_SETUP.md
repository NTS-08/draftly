# Push Draftly to GitHub

This guide will help you push your Draftly project to GitHub.

## Prerequisites

- Git installed on your computer
- GitHub account created at [github.com](https://github.com)

## Step 1: Initialize Git Repository (if not already done)

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

## Step 2: Create .gitignore (Already Done)

Your project already has `.gitignore` files that prevent sensitive files from being committed:
- `frontend/.env` - Your Firebase credentials
- `backend/.env` - Server configuration
- `backend/serviceAccountKey.json` - Firebase admin credentials
- `node_modules/` - Dependencies

## Step 3: Stage All Files

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Draftly collaborative document editor"
```

## Step 5: Create GitHub Repository

### Option A: Via GitHub Website

1. Go to [github.com](https://github.com)
2. Click the "+" icon in top right → "New repository"
3. Fill in:
   - Repository name: `draftly` (or your preferred name)
   - Description: `Real-time collaborative document editor built with React, Node.js, and Firebase`
   - Visibility: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"
5. Copy the repository URL (e.g., `https://github.com/yourusername/draftly.git`)

### Option B: Via GitHub CLI (if installed)

```bash
gh repo create draftly --public --source=. --remote=origin --push
```

## Step 6: Connect Local Repository to GitHub

```bash
# Add GitHub as remote origin (replace with your URL)
git remote add origin https://github.com/yourusername/draftly.git

# Verify remote was added
git remote -v
```

## Step 7: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If your default branch is 'master', use:
# git push -u origin master
```

## Step 8: Verify Upload

1. Go to your GitHub repository URL
2. Refresh the page
3. You should see all your files uploaded

## Important: What's NOT Uploaded (Protected by .gitignore)

These sensitive files are NOT uploaded to GitHub:
- ❌ `frontend/.env` - Contains Firebase API keys
- ❌ `backend/.env` - Contains server configuration
- ❌ `backend/serviceAccountKey.json` - Contains Firebase admin credentials
- ❌ `node_modules/` - Dependencies (can be reinstalled)

These files are safe to share:
- ✅ `frontend/.env.example` - Template without real credentials
- ✅ `backend/.env.example` - Template without real credentials
- ✅ All source code files
- ✅ Documentation files

## Troubleshooting

### Error: "remote origin already exists"

```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/yourusername/draftly.git
```

### Error: "failed to push some refs"

```bash
# Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: "src refspec main does not match any"

Your branch might be named 'master' instead of 'main':

```bash
# Check current branch name
git branch

# If it's 'master', push to master
git push -u origin master

# Or rename master to main
git branch -M main
git push -u origin main
```

## Future Updates

After initial push, to update GitHub with new changes:

```bash
# Stage changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

## Create README for GitHub

Your repository should have a README. Here's a suggested content:

```markdown
# Draftly

A real-time collaborative document editor built with React, Node.js, Firebase, and Socket.IO.

## Features

- 📝 Real-time collaborative editing
- 🔐 User authentication (Email/Password, Google)
- 👥 Share documents with collaborators
- 💾 Auto-save functionality
- 🎨 Clean, modern interface
- 📱 Responsive design

## Tech Stack

**Frontend:**
- React + Vite
- Firebase Authentication
- Quill Editor
- Yjs (CRDT)
- Socket.IO Client

**Backend:**
- Node.js + Express
- Socket.IO
- Firebase Admin SDK
- Firestore Database

## Setup

See [ENV_SETUP.md](ENV_SETUP.md) for environment configuration.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

## License

MIT
```

Save this as `README.md` in your project root, then:

```bash
git add README.md
git commit -m "Add README"
git push
```

## Next Steps

After pushing to GitHub:
1. ✅ Your code is backed up
2. ✅ You can deploy to Netlify/Vercel (they connect to GitHub)
3. ✅ You can collaborate with others
4. ✅ You have version control

Ready to deploy? See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for deployment instructions!
