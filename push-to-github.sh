#!/bin/bash

# Draftly - Push to GitHub Script
# This script will help you push your code to GitHub

echo "🚀 Draftly - GitHub Push Script"
echo "================================"
echo ""

# Step 1: Initialize Git
echo "Step 1: Initializing Git repository..."
git init
echo "✅ Git initialized"
echo ""

# Step 2: Add all files
echo "Step 2: Adding files to Git..."
git add .
echo "✅ Files added"
echo ""

# Step 3: Create initial commit
echo "Step 3: Creating initial commit..."
git commit -m "Initial commit: Draftly collaborative document editor

Features:
- Real-time collaborative editing
- User authentication (Email/Password, Google)
- Document sharing with notifications
- Auto-save functionality
- Modern, responsive UI
- Firebase integration
- Socket.IO real-time sync"
echo "✅ Initial commit created"
echo ""

# Step 4: Rename branch to main
echo "Step 4: Renaming branch to main..."
git branch -M main
echo "✅ Branch renamed to main"
echo ""

# Step 5: Add remote origin
echo "Step 5: Adding remote origin..."
echo ""
echo "⚠️  IMPORTANT: You need to create a GitHub repository first!"
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: draftly (or your preferred name)"
echo "3. Description: Real-time collaborative document editor"
echo "4. Choose Public or Private"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/draftly.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No URL provided. Exiting..."
    exit 1
fi

git remote add origin "$REPO_URL"
echo "✅ Remote origin added"
echo ""

# Step 6: Push to GitHub
echo "Step 6: Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your code is now on GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository: $REPO_URL"
    echo "2. Deploy your app: See QUICK_DEPLOY.md"
    echo "3. Share with others!"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "1. Check your GitHub credentials"
    echo "2. Make sure the repository exists"
    echo "3. Verify the repository URL is correct"
    echo ""
    echo "Try running: git push -u origin main"
fi
