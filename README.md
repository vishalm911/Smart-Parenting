# SpacECE - Smart Parenting & Integrated Child Learning Platform

Welcome to **SpacECE**, a comprehensive, gamified early childhood learning platform built for parents, children, teachers, and admins. 

This repository houses a unified, single-application platform offering a responsive interface, premium glassmorphic visual aesthetics, and database integrations.

---

## 🚀 Key Features by Universe

### 1. Child Learning Portal
* **Math World** (Numeracy): Count fruits in the interactive garden, sort shapes by size, and solve comparison questions.
* **Puzzle World**: 3D geometric puzzles and color-matching matrices.
* **Number Adventure**: A visual map tracking math challenges.
* **Logic Island**: Interactive "Odd One Out" quizzes, logical sequence repeat patterns, and multiplication battles.
* **Reading World** (Literacy): Phonics puzzles, vocabulary spelling zones, and a reading dashboard.
* **Brain World** (Cognitive): Memory card matching and repeating sequence color tests.
* **Emotion World** (Emotional): Emoji mood check-ins, friendship empathy stories, and social choice scenarios.
* **Story Choice World**: Branching adventure stories with multiple endings depending on the choices made by the child.
* **Explore Map (Adventure Island)**: An interactive 2D island map plotting all learning zones. Accessible zones are unlocked dynamically as children earn XP.
* **Avatar Customizer**: Personalized child avatars using a wide list of explorer emojis.

### 2. Parent Dashboard & Analytics Portal
* **Child Profile Management**: Easily swap between multiple child profiles (up to 4 children) and edit their age group configurations.
* **Learning Analytics**: Visual charts mapping child progress across Math, Logic, Literacy, and Cognitive worlds.
* **Reports Generator**: Detailed performance summary metrics for parents to review.

### 3. Teacher & Admin Console
* **Class Trackers**: Manage active classes, review completion rates, and identify top performers.
* **System Operations**: Live feature flagging panel, audit logs, and templates for notification managers.

---

## 📁 Integrated Project Structure

```bash
├── functions/                     # Firebase Cloud Functions (index.js & package.json)
├── public/                        # Static assets, fallback logos
├── src/
│   ├── assets/                    # Image assets & theme media
│   ├── components/                # Components partitioned by feature
│   │   ├── auth/                  # Role selectors and login cards
│   │   ├── layout/                # Global Layout, PortalSidebar, PortalTopNavbar, PortalBottomNav
│   │   ├── shared/                # SpacECELogo and global buttons
│   │   ├── literacy/              # Phonics and story components
│   │   ├── analytics/             # Charts, metrics, and progress bars
│   │   └── animations/            # ConfettiEffect, FloatingElements, StarAnimation
│   ├── context/                   # Context states (AuthContext, UserContext, AppContext, ChildProfileContext, ThemeContext, NotificationContext)
│   ├── data/                      # Hardcoded activity data and vocab levels
│   ├── firebase/                  # Central config (config.js) and service helpers (services.js, literacyService.js)
│   ├── hooks/                     # Custom react hooks (useStreak, useDifficultyLadder, useGameState)
│   ├── pages/                     # Page components partitioned by access portal
│   │   ├── auth/                  # Authentication pages (ChildLogin, ParentLogin, TeacherLogin, AdminLogin, Register, etc.)
│   │   ├── parent/                # Parent portals (ParentDashboard, SwitchChild, ChildProfileManager, etc.)
│   │   ├── teacher/               # Teacher portals (TeacherDashboard, TeacherProfile, etc.)
│   │   ├── admin/                 # Admin consoles (AdminDashboard, SessionManagement, notification templates, etc.)
│   │   ├── settings/              # Shared settings pages (AccountSettings)
│   │   ├── cognitive-sel/         # Cognitive, Emotion, Creativity, and branching Story worlds
│   │   ├── literacy/              # Literacy, Phonics, Spelling, reading, and admin activities
│   │   ├── analytics/             # Charts, parent analytics dashboard, and reports pages
│   │   ├── Home.jsx               # Child portal main screen
│   │   ├── Adventure.jsx          # Child explore map screen
│   │   └── ...
│   ├── routes/                    # Router guards (ProtectedRoute, RoleRoute)
│   ├── theme/                     # Global styles and Material UI themes
│   ├── utils/                     # Helper functions and constants
│   ├── App.jsx                    # Root Router registering all routes
│   └── main.jsx                   # React application mount script
├── firestore.rules                # Unified database security access rules
├── vite.config.js                 # Local dev server configs
└── package.json                   # Project packages & builder scripts
```

---

## 🛠️ Installation & Execution

### 1. Setup Environment
Ensure that you have [Node.js](https://nodejs.org/) installed, and create a local `.env` file at the root:
```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_DEV_MODE="true"
```

### 2. Install Dependencies
Run the package installer:
```bash
npm install
```

### 3. Spin Up Development Server
Launch the local Vite server:
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

### 4. Build Production Bundle
To compile the application into optimized static assets (`dist/`):
```bash
npm run build
```

---

## 🔍 Codebase Quality & Verification
* **ESLint Purity**: Run `npm run lint` to verify that all code compiles cleanly with 0 warnings.
* **Component Purity**: The mathematical games utilize deterministic, idempotent shuffling algorithms to maintain pure React rendering cycles.
* **Context Bridging**: A global unified context bridges system states securely without duplicate Firebase app initializations.
