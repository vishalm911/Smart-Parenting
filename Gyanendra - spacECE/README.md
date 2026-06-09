# SpacECE India Foundation — Web Platform

A full-stack early childhood education platform built with **React + Vite + Firebase**, serving four distinct user roles: **Child**, **Parent**, **Teacher**, and **Admin**.

---

## 📁 Architecture Overview

```
src/
├── App.jsx                    # Root component — mounts AppProvider + AppRouter
├── main.jsx                   # Vite entry point
├── index.css                  # Global design system & animation keyframes
│
├── firebase/                  # Firebase integration layer
│   ├── config.js              # Firebase app init, Auth, Firestore, Google provider
│   ├── authService.js         # loginWithEmail, registerWithEmail, loginWithGoogle, logout, onAuthChange
│   ├── firestoreService.js    # All Firestore CRUD: sessions, notifications, feature flags, templates
│   └── childProfileService.js # Child profile CRUD: create, read, update, delete, coins, avatars
│
├── context/                   # React Context providers (global state)
│   ├── AuthContext.jsx        # Firebase Auth state + child session (localStorage-backed)
│   ├── ChildProfileContext.jsx# Child profiles loaded from Firestore, active child tracking
│   ├── NotificationContext.jsx# Real-time notification subscription
│   └── AppContext.jsx         # Feature flags (Firebase-backed), sidebar state
│
├── routes/                    # React Router v7 routing
│   ├── AppRouter.jsx          # All routes + feature flag enforcement + maintenance mode
│   ├── ProtectedRoute.jsx     # Redirects unauthenticated users to /
│   └── RoleRoute.jsx          # Redirects users to their correct dashboard by role
│
├── layouts/                   # Shared UI shells
│   ├── AuthLayout.jsx         # Centered glassmorphism card for auth pages
│   ├── MainLayout.jsx         # Dashboard shell with Sidebar + TopNavbar
│   ├── TopNavbar.jsx          # Header with dynamic child stats, notifications, user menu
│   ├── Sidebar.jsx            # Navigation sidebar (role-aware)
│   └── BottomNav.jsx          # Mobile bottom navigation
│
├── pages/
│   ├── auth/                  # Authentication pages
│   │   ├── RoleSelector.jsx   # Landing role picker
│   │   ├── ChildLogin.jsx     # Profile picker (no Firebase Auth — localStorage session)
│   │   ├── ParentLogin.jsx    # Email + Google OAuth
│   │   ├── TeacherLogin.jsx   # Email + Google OAuth
│   │   ├── AdminLogin.jsx     # Email only (restricted)
│   │   ├── Register.jsx       # Email + Google OAuth (parent/teacher)
│   │   └── ForgotPassword.jsx # Firebase password reset
│   │
│   ├── child/                 # Child-role pages
│   │   ├── ChildDashboard.jsx # Stats (streak, stars, badges, coins) from Firebase profile
│   │   ├── ChildExplore.jsx   # Activity grid + StarRating modal + Reward modal
│   │   ├── ChildAwards.jsx    # Badge collection + ModalDialog for badge/milestone detail
│   │   └── ChildAvatar.jsx    # Avatar selector (persists to Firebase)
│   │
│   ├── parent/                # Parent-role pages
│   │   ├── ParentDashboard.jsx
│   │   ├── ChildProfileManager.jsx
│   │   └── SwitchChild.jsx
│   │
│   ├── teacher/               # Teacher-role pages
│   │   ├── TeacherDashboard.jsx
│   │   └── TeacherProfile.jsx
│   │
│   ├── admin/                 # Admin-role pages
│   │   ├── AdminDashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── SessionManagement.jsx  # Active sessions + Login History (getUserSessions)
│   │   ├── NotificationManager.jsx# Templates persisted in Firestore
│   │   └── FeatureFlags.jsx       # Flags stored in Firebase, changes propagate live
│   │
│   └── settings/
│       └── AccountSettings.jsx
│
├── components/
│   ├── auth/
│   │   ├── GoogleSignInButton.jsx  # Reusable Google OAuth button
│   │   └── PasswordField.jsx       # Password input with show/hide toggle
│   └── shared/
│       ├── ActivityCard.jsx        # Learning activity card (default + compact + featured)
│       ├── ModalDialog.jsx         # Reusable modal (confirm/success/warning/error/info)
│       ├── StarRating.jsx          # Interactive / read-only star rating (1–5)
│       ├── ProgressRing.jsx        # Circular SVG progress indicator
│       ├── SkeletonLoader.jsx      # Loading skeleton variants (table, card, list)
│       ├── LoadingSpinner.jsx      # Fullscreen or inline spinner
│       ├── Breadcrumb.jsx          # Route-aware breadcrumb navigation
│       ├── ErrorBoundary.jsx       # React error boundary
│       ├── SpacECELogo.jsx         # Animated brand logo
│       └── AgeGroupBadge.jsx       # Age-group chip
│
├── utils/
│   ├── helpers.js     # getGreeting, getInitials, getAvatarEmoji, formatDateTime, getPasswordStrength
│   └── constants.js   # ROLES enum, app-wide constants
│
└── theme/             # MUI theme configuration
```

---

## 🔥 Firebase Collections

| Collection | Document Structure | Used By |
|---|---|---|
| `user_accounts` | `uid, email, role, displayName, linked_child_profiles, is_active, created_at` | Auth, UserManagement |
| `child_profiles` | `parent_uid, name, avatar, age_group, coin_count, xp, stars, streak_days, badges[], level, created_at` | ChildProfileContext, ChildDashboard, ChildExplore, ChildAwards, ChildAvatar |
| `sessions` | `uid, login_time, logout_time, device_info{}` | AuthContext (create/end), SessionManagement |
| `notifications` | `child_id, parent_id, message, read_status, type, created_at` | NotificationContext, NotificationManager |
| `notification_templates` | `title, message, type, active, created_at, updated_at` | NotificationManager (full CRUD) |
| `feature_flags` | Single doc `global`: all flag key/booleans + `updated_at` | AppContext (real-time listener), FeatureFlags page |

---

## 🔐 Authentication Architecture

### Adult Users (Parent / Teacher / Admin)
- **Firebase Auth** — email+password or Google OAuth
- On sign-in: `onAuthStateChanged` fires → fetches `user_accounts` doc → sets `userRole`
- Session created in `sessions` collection on login; closed on logout

### Child Users
- **No Firebase Auth account** — children authenticate by selecting a profile on the `ChildLogin` page
- `loginAsChild(profile)` stores `spaceece_role=child` and `spaceece_child_id=<id>` in localStorage
- On page reload: `onAuthStateChanged` fires with `null` → `RealAuthProvider` detects `spaceece_role=child` in localStorage and preserves the child session
- `ProtectedRoute` checks `isAuthenticated = !!currentUser || userRole === 'child'`
- `ChildProfileContext` restores `activeChild` from `spaceece_child_id` via a Firestore fetch

---

## 🚩 Feature Flags

Stored in Firestore under `feature_flags/global`. Loaded at app start via `subscribeToFeatureFlags` (real-time listener). Changes made in the **Admin → Feature Flags** page are immediately persisted and propagate to all connected clients.

| Flag | Default | Effect when disabled |
|---|---|---|
| `enableChildDashboard` | `true` | Child Dashboard route shows "Feature Disabled" page |
| `enableTeacherDashboard` | `true` | Teacher Dashboard route shows "Feature Disabled" page |
| `enableAvatarCustomization` | `true` | Child Avatar route shows "Feature Disabled" page |
| `enableNotifications` | `true` | Used by NotificationContext (no notifications sent) |
| `enableCoinRewards` | `true` | Coin rewards logic can check this flag |
| `enableGoogleSignIn` | `true` | Register page shows/hides Google button |
| `maintenanceMode` | `false` | All non-admin protected routes show Maintenance page |

---

## ⭐ Key Component APIs

### `<ModalDialog>`
```jsx
<ModalDialog
  open={boolean}
  onClose={fn}
  title="string"
  message="string"
  type="confirm | success | warning | error | info"
  confirmText="string"
  cancelText="string"
  onConfirm={fn}
  onCancel={fn}
  loading={boolean}
  maxWidth="xs | sm | md"
>
  {/* optional custom content */}
</ModalDialog>
```

### `<StarRating>`
```jsx
<StarRating
  value={number}       // 0–5
  onChange={fn}        // null = read-only
  max={5}
  size="small | medium | large"
  color="#FFC107"
  readOnly={boolean}
  showValue={boolean}
/>
```

### `<ActivityCard>`
```jsx
<ActivityCard
  title="string"
  description="string"
  image="emoji or URL"
  progress={0–100}
  category="Literacy | Math | Science | Art | Music | Social"
  duration="15 min"
  coins={number}
  difficulty="Easy | Medium | Hard"
  ageGroup="4-6"
  locked={boolean}
  onClick={fn}
  variant="default | featured | compact"
/>
```

---

## 🛣️ Route Summary

| Path | Role | Protection |
|---|---|---|
| `/` | Public | None |
| `/login/child` | Public | None |
| `/login/parent` | Public | None |
| `/login/teacher` | Public | None |
| `/login/admin` | Public | None |
| `/register` | Public | None |
| `/forgot-password` | Public | None |
| `/child/dashboard` | Child | ProtectedRoute + RoleRoute + Feature flag |
| `/child/explore` | Child | ProtectedRoute + RoleRoute |
| `/child/awards` | Child | ProtectedRoute + RoleRoute |
| `/child/avatar` | Child | ProtectedRoute + RoleRoute + Feature flag |
| `/parent/dashboard` | Parent | ProtectedRoute + RoleRoute |
| `/parent/children` | Parent | ProtectedRoute + RoleRoute |
| `/teacher/dashboard` | Teacher | ProtectedRoute + RoleRoute + Feature flag |
| `/admin/dashboard` | Admin | ProtectedRoute + RoleRoute |
| `/admin/sessions` | Admin | ProtectedRoute + RoleRoute |
| `/admin/notifications` | Admin | ProtectedRoute + RoleRoute |
| `/admin/features` | Admin | ProtectedRoute + RoleRoute |
| `/showcase` | Public | None (dev only) |

---

## ⚙️ Environment Variables

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# Set to false (or remove) for production
VITE_DEV_MODE=true
```

> **⚠️ Production checklist:** Set `VITE_DEV_MODE=false` before deploying. This switches `AuthProvider` from the mock `DevAuthProvider` to the real Firebase `RealAuthProvider` and enables all route guards.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server (VITE_DEV_MODE=true by default)
npm run dev

# Production build
npm run build
```

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` v7 | Client-side routing |
| `firebase` v12 | Auth + Firestore |
| `@mui/material` + `@mui/icons-material` | Component library |
| `@emotion/react` + `@emotion/styled` | MUI styling engine |
| `vite` + `@vitejs/plugin-react` | Build tool |

---

*Module: SpacECE India Foundation — Auth, Child, Admin, Session, Notification, Feature Flags*
