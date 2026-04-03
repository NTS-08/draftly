@echo off
REM Draftly - Push to GitHub Script (Windows)
REM This script will help you push your code to GitHub

echo.
echo ================================
echo Draftly - GitHub Push Script
echo ================================
echo.

REM Step 1: Initialize Git
echo Step 1: Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo Error initializing Git
    pause
    exit /b 1
)
echo Done: Git initialized
echo.

REM Step 2: Add all files
echo Step 2: Adding files to Git...
git add .
if %errorlevel% neq 0 (
    echo Error adding files
    pause
    exit /b 1
)
echo Done: Files added
echo.

REM Step 3: Create initial commit
echo Step 3: Creating initial commit...
git commit -m "Initial commit: Draftly collaborative document editor"
if %errorlevel% neq 0 (
    echo Error creating commit
    pause
    exit /b 1
)
echo Done: Initial commit created
echo.

REM Step 4: Rename branch to main
echo Step 4: Renaming branch to main...
git branch -M main
echo Done: Branch renamed to main
echo.

REM Step 5: Add remote origin
echo Step 5: Adding remote origin...
echo.
echo IMPORTANT: You need to create a GitHub repository first!
echo.
echo 1. Go to https://github.com/new
echo 2. Repository name: draftly (or your preferred name)
echo 3. Description: Real-time collaborative document editor
echo 4. Choose Public or Private
echo 5. DO NOT initialize with README, .gitignore, or license
echo 6. Click 'Create repository'
echo.
set /p REPO_URL="Enter your GitHub repository URL (e.g., https://github.com/username/draftly.git): "

if "%REPO_URL%"=="" (
    echo No URL provided. Exiting...
    pause
    exit /b 1
)

git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo Error adding remote origin
    pause
    exit /b 1
)
echo Done: Remote origin added
echo.

REM Step 6: Push to GitHub
echo Step 6: Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ================================
    echo SUCCESS! Your code is now on GitHub!
    echo ================================
    echo.
    echo Next steps:
    echo 1. Visit your repository: %REPO_URL%
    echo 2. Deploy your app: See QUICK_DEPLOY.md
    echo 3. Share with others!
) else (
    echo.
    echo Push failed. Common issues:
    echo 1. Check your GitHub credentials
    echo 2. Make sure the repository exists
    echo 3. Verify the repository URL is correct
    echo.
    echo Try running: git push -u origin main
)

echo.
pause
