# Quick Commands Reference

## Push to GitHub (First Time)

### Automated Script (Easiest)

**Windows:**
```bash
push-to-github.bat
```

**Mac/Linux:**
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

### Manual Commands

```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: Draftly collaborative document editor"

# 4. Rename branch to main
git branch -M main

# 5. Add remote (replace with your URL)
git remote add origin https://github.com/yourusername/draftly.git

# 6. Push to GitHub
git push -u origin main
```

## Update GitHub (After Changes)

```bash
# Add changes
git add .

# Commit with message
git commit -m "Your change description"

# Push to GitHub
git push
```

## Run Application Locally

### Backend
```bash
cd backend
node server.js
```

### Frontend
```bash
cd frontend
npm run dev
```

## Deploy to Production

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for deployment instructions.

## Common Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# View remote URL
git remote -v

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```

## Troubleshooting

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/yourusername/draftly.git
```

### "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### "Permission denied (publickey)"
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/yourusername/draftly.git
```

## Environment Setup

```bash
# Frontend
cd frontend
cp .env.example .env
# Edit .env with your values

# Backend
cd backend
cp .env.example .env
# Edit .env with your values
```

## Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

## Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output in: frontend/dist/
```

## Useful Links

- GitHub: https://github.com
- Netlify: https://netlify.com
- Render: https://render.com
- Firebase Console: https://console.firebase.google.com

## Need Help?

- [GITHUB_SETUP.md](GITHUB_SETUP.md) - Detailed GitHub setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [ENV_SETUP.md](ENV_SETUP.md) - Environment variables
