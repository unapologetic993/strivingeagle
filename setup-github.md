# Striving Eagle - GitHub Setup Guide

## Quick Steps to Push to GitHub:

### 1. Install Git (if not already installed)
- Download from: https://git-scm.com/download/win
- Run the installer with default settings

### 2. Configure Git
```bash
git config --global user.name "unapologetic993"
git config --global user.email "your-email@example.com"
```

### 3. Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit - Striving Eagle website"
```

### 4. Connect to GitHub
```bash
git remote add origin https://github.com/unapologetic993/strivingeagle.git
git branch -M main
git push -u origin main
```

### 5. For Cloudflare Setup
- After pushing, go to Cloudflare Pages
- Connect your GitHub repository
- Deploy from the `main` branch
- Your domain: strivingeagle.pages.dev (or custom domain)

## Files Ready for Upload:
✅ All HTML files (index.html, admin/, etc.)
✅ CSS stylesheets
✅ JavaScript files
✅ Data files
✅ README files

The repository is ready for deployment!
