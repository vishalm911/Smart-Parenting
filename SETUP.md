# 🚀 SpacECE — MongoDB Migration Setup Guide

## Project Structure
```
Smart-Parenting/
├── backend/          ← NEW: Node + Express + MongoDB server
├── src/              ← Frontend (Firebase replaced with axios)
│   ├── api/
│   │   └── client.js         ← NEW: axios instance
│   ├── firebase/             ← Updated (no Firebase SDK)
│   │   ├── authService.js    ← JWT based
│   │   ├── literacyService.js← axios calls
│   │   ├── firestoreService.js
│   │   ├── childProfileService.js
│   │   └── config.js         ← stub only
│   └── context/
│       └── AuthContext.jsx   ← JWT based
├── .env              ← VITE_API_URL set here
└── package.json      ← firebase removed, axios added
```

---

## STEP 1: MongoDB Setup

### Option A - Local MongoDB
```bash
# Mac
brew install mongodb-community && brew services start mongodb-community

# Ubuntu
sudo apt install mongodb && sudo systemctl start mongodb
```

### Option B - MongoDB Atlas (Cloud - Recommended)
1. Go to https://mongodb.com/cloud/atlas → Free account
2. Create cluster → Connect → Drivers → Copy connection string
3. Paste in backend/.env

---

## STEP 2: Backend Start karo

```bash
cd backend
npm install
cp .env.example .env

# .env mein fill karo:
# MONGODB_URI=mongodb://localhost:27017/spaceece
# JWT_SECRET=koi_bhi_lamba_random_string
# CLIENT_URL=http://localhost:5173

npm run dev
```

Terminal mein aana chahiye:
```
✅  MongoDB connected
🚀  Server running on http://localhost:5000
```

---

## STEP 3: Frontend Start karo

```bash
# Project root mein (backend folder se bahar)
npm install
npm run dev
```

---

## STEP 4: Test karo

Backend chalta ho tab run karo:
```bash
cd backend
node tests/api.test.js
```

---

## STEP 5: Production Deploy

- **Backend** → Railway.app / Render.com (free tier available)
- **Frontend** → Vercel / Netlify
- `.env` mein production URLs update karo
