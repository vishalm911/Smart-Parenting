# Firebase Setup Guide for SpaceECE

This guide will walk you through setting up Firebase for your SpaceECE project from scratch.

---

## 📋 Table of Contents

1. [Create Firebase Project](#step-1-create-firebase-project)
2. [Enable Authentication](#step-2-enable-authentication)
3. [Create Firestore Database](#step-3-create-firestore-database)
4. [Set Up Storage](#step-4-set-up-storage)
5. [Get Configuration Keys](#step-5-get-configuration-keys)
6. [Update Your App](#step-6-update-your-app)
7. [Set Security Rules](#step-7-set-security-rules)
8. [Create Collections](#step-8-create-collections)
9. [Test Your Setup](#step-9-test-your-setup)

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Sign in with your Google account

### 1.2 Create New Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: **`SpaceECE`**
3. Click **Continue**
4. **Google Analytics**: You can enable it (optional but recommended)
5. Choose or create Analytics account
6. Click **Create project**
7. Wait for project creation (takes 30-60 seconds)
8. Click **Continue** when ready

✅ **Project Created!**

---

## Step 2: Enable Authentication

### 2.1 Navigate to Authentication
1. In the Firebase Console sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**

### 2.2 Enable Email/Password Authentication
1. Click on the **"Sign-in method"** tab
2. Find **"Email/Password"** in the list
3. Click on it
4. Toggle **Enable** to ON
5. Click **Save**

### 2.3 Enable Google Sign-In (Optional)
1. Still in **"Sign-in method"** tab
2. Find **"Google"** in the list
3. Click on it
4. Toggle **Enable** to ON
5. Enter **Project support email** (your email)
6. Click **Save**

✅ **Authentication Enabled!**

---

## Step 3: Create Firestore Database

### 3.1 Navigate to Firestore
1. In the Firebase Console sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**

### 3.2 Choose Security Mode
1. Select **"Start in test mode"** (we'll add proper rules later)
2. Click **Next**

### 3.3 Choose Location
1. Select your preferred location (e.g., `us-central`, `asia-south1`, `europe-west1`)
   - **Note**: This cannot be changed later!
   - Choose the location closest to your users
2. Click **Enable**
3. Wait for database creation (30-60 seconds)

✅ **Firestore Database Created!**

---

## Step 4: Set Up Storage

### 4.1 Navigate to Storage
1. In the Firebase Console sidebar, click **"Build"** → **"Storage"**
2. Click **"Get started"**

### 4.2 Set Security Rules
1. Select **"Start in test mode"** (we'll add proper rules later)
2. Click **Next**

### 4.3 Choose Location
1. Use the same location as your Firestore (already selected)
2. Click **Done**
3. Wait for storage setup

✅ **Storage Enabled!**

---

## Step 5: Get Configuration Keys

### 5.1 Register Web App
1. Go back to **Project Overview** (click home icon in sidebar)
2. Click the **Web icon** (`</>`) under "Get started by adding Firebase to your app"
3. Enter app nickname: **`SpaceECE Web App`**
4. **Check** "Also set up Firebase Hosting" (optional)
5. Click **Register app**

### 5.2 Copy Configuration
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "spaceece-xxxxx.firebaseapp.com",
  projectId: "spaceece-xxxxx",
  storageBucket: "spaceece-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**Copy these values!** You'll need them in the next step.

### 5.3 Click Continue to Console

✅ **Configuration Keys Obtained!**

---

## Step 6: Update Your App

### 6.1 Update `.env` File
1. Open your project folder: `c:\Users\LOQ\Downloads\SpaceECEindia\YogashWork\spaceece`
2. Open the `.env` file
3. Replace the placeholder values with your real Firebase config:

```env
# SpaceECE Firebase Configuration
# Replace with your actual Firebase credentials

VITE_FIREBASE_API_KEY=AIzaSyC...  # Replace with your apiKey
VITE_FIREBASE_AUTH_DOMAIN=spaceece-xxxxx.firebaseapp.com  # Replace
VITE_FIREBASE_PROJECT_ID=spaceece-xxxxx  # Replace
VITE_FIREBASE_STORAGE_BUCKET=spaceece-xxxxx.appspot.com  # Replace
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012  # Replace
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456  # Replace
```

4. **Save the file**
5. **Restart your dev server**:
   - Stop the current server (Ctrl+C in terminal)
   - Run: `npm run dev`

✅ **App Connected to Firebase!**

---

## Step 7: Set Security Rules

### 7.1 Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Cognitive games - readable by all, writable by admins only
    match /cognitive_games/{gameId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Creativity activities
    match /creativity_activities/{activityId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Emotion activities
    match /emotion_activities/{activityId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Cognitive scores - users can read their own, admins can read all
    match /cognitive_scores/{scoreId} {
      allow read: if isAuthenticated() && 
                     (resource.data.childId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    // Emotion scores
    match /emotion_scores/{scoreId} {
      allow read: if isAuthenticated() && 
                     (resource.data.childId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    // Drawings
    match /drawings/{drawingId} {
      allow read: if isAuthenticated() && 
                     (resource.data.childId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                               (resource.data.childId == request.auth.uid || isAdmin());
    }
    
    // Uploaded assets - admin only
    match /uploaded_assets/{assetId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Allow all other collections for now (development)
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

3. Click **Publish**

### 7.2 Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Replace the default rules with these:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return request.auth != null && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Drawings - users can upload their own, admins can manage all
    match /drawings/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }
    
    // Assets - admin only
    match /coloring-template/{fileName} {
      allow read: if isAuthenticated();
      allow write, delete: if isAdmin();
    }
    
    match /story-scene/{fileName} {
      allow read: if isAuthenticated();
      allow write, delete: if isAdmin();
    }
    
    match /character/{fileName} {
      allow read: if isAuthenticated();
      allow write, delete: if isAdmin();
    }
    
    match /prop/{fileName} {
      allow read: if isAuthenticated();
      allow write, delete: if isAdmin();
    }
  }
}
```

3. Click **Publish**

✅ **Security Rules Set!**

---

## Step 8: Create Collections

### Method 1: Using Firebase Console (Manual)

#### 8.1 Create `cognitive_games` Collection
1. Go to **Firestore Database** → **Data** tab
2. Click **"Start collection"**
3. Collection ID: `cognitive_games`
4. Click **Next**
5. Add first document:
   - Document ID: **Auto-ID**
   - Fields:
     ```
     type: "memory" (string)
     title: "Memory Match - Animals" (string)
     description: "Match pairs of animal cards" (string)
     ageGroup: "5-7" (string)
     difficulty: "easy" (string)
     contentData: {} (map)
     pointsReward: 100 (number)
     xpReward: 50 (number)
     active: true (boolean)
     createdBy: "admin" (string)
     createdAt: [Click "Add field" → Select "timestamp" → Use current]
     ```
6. Click **Save**

#### 8.2 Create `creativity_activities` Collection
1. Click **"Start collection"**
2. Collection ID: `creativity_activities`
3. Add first document:
   - Document ID: **Auto-ID**
   - Fields:
     ```
     type: "coloring" (string)
     title: "Color the Elephant" (string)
     description: "A fun elephant coloring page" (string)
     ageGroup: "5-7" (string)
     templateUrl: "" (string)
     thumbnailUrl: "" (string)
     category: "animals" (string)
     active: true (boolean)
     createdBy: "admin" (string)
     createdAt: [timestamp]
     ```
4. Click **Save**

#### 8.3 Create `emotion_activities` Collection
1. Click **"Start collection"**
2. Collection ID: `emotion_activities`
3. Add first document:
   - Document ID: **Auto-ID**
   - Fields:
     ```
     type: "recognition" (string)
     title: "Happy Face" (string)
     scenarioText: "This person is feeling happy!" (string)
     imageUrl: "" (string)
     choices: [] (array - leave empty for now)
     emotionTag: "empathy" (string)
     ageGroup: "5-7" (string)
     pointsReward: 25 (number)
     active: true (boolean)
     createdBy: "admin" (string)
     createdAt: [timestamp]
     ```
4. Click **Save**

#### 8.4 Create Empty Collections (will be auto-created when data is added)
These will be created automatically when users interact with the app:
- `cognitive_scores`
- `emotion_scores`
- `drawings`
- `uploaded_assets`
- `users`

### Method 2: Using Admin Panel (After Login)

Once you have Firebase connected and you log in as admin:

1. Go to **Admin Panel** (click "Admin Panel" in header)
2. Go to **Cognitive Games**
3. Click **"Add New Game"**
4. Fill in the form and submit
5. Repeat for other content types

✅ **Collections Created!**

---

## Step 9: Test Your Setup

### 9.1 Test Authentication

1. Open your app: http://localhost:5173
2. Click **"Get Started"** or **"Login"**
3. Click **"Sign up"** tab
4. Enter:
   - Name: Test Child
   - Email: test@example.com
   - Password: test123
5. Click **"Create Account"**

**Expected Result**: You should be redirected to the dashboard

### 9.2 Check Firebase Console

1. Go to **Authentication** → **Users** tab
2. You should see your new user listed!

### 9.3 Test Admin Access

1. Go to **Firestore Database** → **users** collection
2. Find your user document
3. Click to edit
4. Add field: `role` = `admin` (string)
5. Save

Now refresh your app and you should see the "Admin Panel" button!

### 9.4 Test Admin Panel

1. Click **"Admin Panel"** in the header
2. Try creating a game in **Cognitive Games**
3. Try uploading an asset in **Asset Uploader**
4. Check **Analytics** to see data

✅ **Everything Working!**

---

## 🔧 Troubleshooting

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Double-check your `.env` file has the correct `VITE_FIREBASE_API_KEY`

### Issue: "Missing or insufficient permissions"
**Solution**: 
1. Check Firestore Rules are published
2. Make sure you're logged in
3. For admin features, make sure your user has `role: 'admin'` in Firestore

### Issue: App shows "White Screen"
**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Verify `.env` file is correct
4. Restart dev server: `npm run dev`

### Issue: Images won't upload
**Solution**:
1. Check Storage rules are published
2. Verify Storage is enabled in Firebase Console
3. Check file size (max 10MB by default)

---

## 📚 Next Steps

### 1. Set Up Email Templates
- Go to **Authentication** → **Templates**
- Customize email verification and password reset emails

### 2. Enable Hosting (Optional)
- Go to **Hosting** in Firebase Console
- Follow the setup guide to deploy your app

### 3. Set Up Analytics
- Go to **Analytics** to view user behavior
- Set up custom events for tracking

### 4. Backup Your Data
- Go to **Firestore Database** → **Import/Export**
- Set up automated backups

---

## 🎯 Quick Reference

### Firebase Console URLs
- Main Console: https://console.firebase.google.com/
- Your Project: https://console.firebase.google.com/project/YOUR-PROJECT-ID

### Important Files in Your Project
- `.env` - Firebase configuration
- `src/services/firebase/config.ts` - Firebase initialization
- `firestore.rules` - Database security rules (in your project)
- `storage.rules` - Storage security rules (in your project)

### Useful Firebase CLI Commands
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy hosting
firebase deploy --only hosting
```

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Storage enabled
- [ ] Configuration keys copied to `.env`
- [ ] Dev server restarted
- [ ] Firestore security rules published
- [ ] Storage security rules published
- [ ] Collections created
- [ ] Test user created
- [ ] Admin role assigned
- [ ] Admin panel tested

---

## 🆘 Need Help?

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: https://stackoverflow.com/questions/tagged/firebase

---

**Congratulations! Your Firebase setup is complete!** 🎉

You can now use all the features of SpaceECE with real Firebase backend!
