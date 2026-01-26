# Deploying Star Bites to GitHub Pages

## Prerequisites

- GitHub repository for this project
- Firebase project (optional - app works without it using localStorage)

## Deployment Options

### Option 1: Automated Deployment with GitHub Actions (Recommended)

This repo includes a GitHub Actions workflow that automatically deploys on push to `main`.

#### Step 1: Push to GitHub

```bash
git init  # if not already a git repo
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

#### Step 2: Enable GitHub Pages

1. Go to your repo on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment", set Source to **GitHub Actions**

#### Step 3: Add Firebase Secrets (Required for Multiplayer)

If using Firebase for multiplayer functionality:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

#### Step 4: Trigger Deployment

Push any change to `main`, or manually trigger:
1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

### Option 2: Manual Deployment

#### Step 1: Build locally

```bash
# Set the base path to match your repo name
export VITE_BASE_PATH=/YOUR_REPO_NAME/

# Set Firebase config (optional)
export VITE_FIREBASE_API_KEY="your-api-key"
export VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"
export VITE_FIREBASE_PROJECT_ID="your-project"
export VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
export VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
export VITE_FIREBASE_APP_ID="1:123456789:web:abc123"

# Build
npm run build
```

#### Step 2: Deploy to gh-pages branch

```bash
# Install gh-pages if not already installed
npm install -g gh-pages

# Deploy dist folder to gh-pages branch
gh-pages -d dist
```

#### Step 3: Configure GitHub Pages

1. Go to **Settings** → **Pages**
2. Set Source to **Deploy from a branch**
3. Select branch: `gh-pages`, folder: `/ (root)`
4. Save

---

## Troubleshooting

### Blank page or 404 errors on routes

This is a known issue with SPAs on GitHub Pages. The app uses client-side routing which GitHub Pages doesn't natively support.

**Fix:** Add a 404.html that redirects to index.html. Create `public/404.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/'">
  </head>
  <body>
    Redirecting...
  </body>
</html>
```

Then add to the top of `src/main.jsx`:

```javascript
// Handle GitHub Pages SPA redirect
(function(){
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== location.href) {
    history.replaceState(null, null, redirect);
  }
})();
```

### Assets not loading

Make sure `VITE_BASE_PATH` matches your repo name exactly (including the slashes): `/repo-name/`

### Firebase not connecting

- Verify all secrets are set correctly in GitHub
- Check that your Firebase Realtime Database rules allow read/write access
- Confirm the database URL is correct (should end in `.firebaseio.com`)
