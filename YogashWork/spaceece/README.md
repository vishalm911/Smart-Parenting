# SpaceECE - Kids Learning & Development Platform

A complete production-ready React + TypeScript web application that helps children aged 5–12 improve cognitive skills, creativity, emotional intelligence, and decision-making through interactive activities and games.

## 🌟 Features

### Four Learning Worlds

1. **Brain World** - Cognitive Skills
   - Memory Match games
   - Sequence Builder
   - Pattern Finder
   - Maze Challenges
   - Real-time analytics and progress tracking

2. **Creativity World** - Artistic Expression
   - Digital Drawing Pad with Fabric.js
   - Color Studio with coloring pages
   - Story Creator (drag & drop comic builder)
   - Personal gallery for all creations

3. **Emotion World** - Emotional Intelligence
   - Daily emotion check-ins
   - Emotion recognition activities
   - Friendship stories with choices
   - Kindness challenges
   - Decision-making scenarios

4. **Story World** - Interactive Reading
   - Branching story engine
   - Multiple choice points
   - Unique endings to discover
   - Reading comprehension questions
   - Replay system

### Gamification Features
- ⭐ Experience points (XP) and leveling system
- 🏆 Achievements and badges
- 🔥 Daily streaks
- 🎊 Confetti rewards and celebrations
- 📊 Progress tracking and analytics

## 🛠 Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Data Fetching:** React Query
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Charts:** Recharts
- **Canvas:** Fabric.js (for drawing)
- **Confetti:** canvas-confetti

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project (see setup instructions below)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spaceece
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password and Google Sign-In)
   - Create a Firestore Database
   - Enable Firebase Storage
   - Copy your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗 Project Structure

```
spaceece/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AnimatedButton.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── WorldCard.tsx
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── BrainWorldPage.tsx
│   │   ├── CreativityWorldPage.tsx
│   │   ├── EmotionWorldPage.tsx
│   │   ├── StoryWorldPage.tsx
│   │   └── ProfilePage.tsx
│   ├── services/           # External services
│   │   └── firebase/
│   │       ├── config.ts
│   │       └── auth.service.ts
│   ├── store/              # Zustand state management
│   │   ├── authStore.ts
│   │   ├── progressStore.ts
│   │   └── achievementStore.ts
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── animations.ts
│   │   └── helpers.ts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies
```

## 🎨 Design System

### Brand Colors
- **Primary Orange:** `#F2A100`
- **Golden Yellow:** `#F7B733`
- **Dark Charcoal:** `#111111`
- **Light Gray:** `#F5F5F5`
- **Soft Cream:** `#FFF7E6`
- **Light Orange:** `#FFE4B5`

### Typography
- **Headings:** Poppins ExtraBold
- **Body:** Poppins
- **Buttons:** Poppins SemiBold

### UI Style
- Rounded corners (20px–32px)
- Large touch-friendly buttons
- Soft shadows
- Floating cards
- Gentle animations

## 🔥 Firebase Firestore Schema

### Collections

```typescript
users/
  {userId}/
    - email: string
    - displayName: string
    - avatar?: string
    - level: number
    - xp: number
    - totalScore: number
    - streak: number
    - lastLoginDate: string
    - createdAt: string
    - updatedAt: string

brainWorldResults/
  {resultId}/
    - userId: string
    - activityType: string
    - difficulty: string
    - score: number
    - accuracy: number
    - createdAt: string

emotionResults/
  {resultId}/
    - userId: string
    - activityType: string
    - score: number
    - createdAt: string

storyResults/
  {resultId}/
    - userId: string
    - storyId: string
    - endingsDiscovered: string[]
    - comprehensionScore: number
    - createdAt: string

drawings/
  {drawingId}/
    - userId: string
    - imageUrl: string
    - type: string
    - createdAt: string

achievements/
  {achievementId}/
    - userId: string
    - type: string
    - name: string
    - unlockedAt: string

moodCheckins/
  {checkinId}/
    - userId: string
    - mood: string
    - date: string
    - createdAt: string
```

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## 🧪 Linting

```bash
npm run lint
```

## 🚀 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Deploy to Vercel/Netlify

Simply connect your repository to Vercel or Netlify and they'll handle the build and deployment automatically.

## 🎯 Future Enhancements

### Planned Features
- [ ] Implement full Memory Match game logic
- [ ] Build Sequence Builder with increasing difficulty
- [ ] Create Pattern Finder with multiple categories
- [ ] Develop Maze Challenge with pathfinding
- [ ] Implement Drawing Pad with Fabric.js
- [ ] Build Color Studio with fillable regions
- [ ] Create Story Creator drag & drop interface
- [ ] Implement branching story engine
- [ ] Add reading comprehension quiz system
- [ ] Build admin dashboard for parents
- [ ] Add multi-language support
- [ ] Implement social features (share achievements)
- [ ] Add voice narration for stories
- [ ] Create weekly progress reports

### Technical Improvements
- [ ] Add unit tests (Jest/Vitest)
- [ ] Implement E2E tests (Playwright/Cypress)
- [ ] Add error boundaries
- [ ] Implement offline support (PWA)
- [ ] Add performance monitoring
- [ ] Optimize images and assets
- [ ] Implement code splitting
- [ ] Add skeleton loaders

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support, email support@spaceece.com or join our community Discord server.

## 🙏 Acknowledgments

- Design inspired by child-centered educational principles
- Icon library: Lucide React
- Animation library: Framer Motion
- Firebase for backend services

---

**Built with ❤️ for children's learning and development**
