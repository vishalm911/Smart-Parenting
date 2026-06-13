# SpaceECE Advanced Features - Technical Design Document

## Overview
This document outlines the technical design for implementing advanced features in SpaceECE including emotion tracking, enhanced Firebase integrations, admin panel, and advanced world features.

---

## 1. Feature List

### 1.1 Core Features
- ✅ **Emotion Check-In Widget** - Dashboard entry point for mood tracking
- ✅ **Drawing Storage System** - Firebase Storage integration for artwork
- ✅ **Branching Story Engine** - Interactive narrative system
- ✅ **Dual Scoring System** - Separate cognitive & emotional scores
- ✅ **Kindness Journal** - Weekly reflection entries
- ✅ **Parent Notifications** - Alert system for emotional patterns
- ✅ **Guided Breathing** - Calming activity for negative emotions
- ✅ **Admin Panel** - Content management system

---

## 2. High-Level Architecture

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    SpaceECE Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Child      │  │   Parent     │  │    Admin     │      │
│  │  Interface   │  │  Dashboard   │  │    Panel     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│  ┌──────▼──────────────────▼──────────────────▼───────┐     │
│  │           Application Layer (React)                 │     │
│  │  - Emotion Check-In Widget                          │     │
│  │  - World Pages (Brain, Creativity, Emotion, Story)  │     │
│  │  - Drawing Canvas (Fabric.js)                       │     │
│  │  - Branching Story Engine                           │     │
│  │  - Kindness Journal                                 │     │
│  │  - Breathing Activity                               │     │
│  └──────┬──────────────────────────────────────────────┘     │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────┐     │
│  │         State Management (Zustand)                   │     │
│  │  - authStore, emotionStore, creativityStore         │     │
│  │  - storyStore, notificationStore, adminStore        │     │
│  └──────┬──────────────────────────────────────────────┘     │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────┐     │
│  │           Firebase Services Layer                    │     │
│  │  - Authentication, Firestore, Storage, Functions    │     │
│  └──────┬──────────────────────────────────────────────┘     │
│         │                                                     │
└─────────┼─────────────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────┐
│                    Firebase Backend                            │
├────────────────────────────────────────────────────────────────┤
│  Authentication │ Firestore DB │ Storage │ Cloud Functions    │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 User Role Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────┐│
│  │    Child     │       │    Parent    │       │  Admin   ││
│  │              │       │              │       │          ││
│  │ - Play games │       │ - View child │       │ - Manage ││
│  │ - Draw art   │◄──────┤   progress   │       │   content││
│  │ - Emotions   │       │ - View art   │       │ - Upload ││
│  │ - Stories    │       │ - Get alerts │       │   assets ││
│  │ - Journal    │       │              │       │ - View   ││
│  │              │       │              │       │   scores ││
│  └──────────────┘       └──────────────┘       └──────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Firebase Database Schema

### 3.1 Firestore Collections

#### Collection: `users`
```typescript
{
  id: string;                    // Auto-generated user ID
  email: string;
  displayName: string;
  role: 'child' | 'parent' | 'admin';
  avatar?: string;
  level: number;
  xp: number;
  totalScore: number;
  cognitiveScore: number;        // NEW
  emotionalScore: number;        // NEW
  streak: number;
  parentId?: string;             // NEW - Link child to parent
  children?: string[];           // NEW - Parent's children IDs
  lastLoginDate: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Collection: `mood_checkins`
```typescript
{
  id: string;
  childId: string;
  mood: 'happy' | 'excited' | 'neutral' | 'sad' | 'angry' | 'worried' | 'proud';
  moodEmoji: string;             // '😀' | '😃' | '🙂' | '😐' | '😟' | '😢' | '😠'
  intensity: number;             // 1-5 scale
  notes?: string;
  timestamp: Timestamp;
  triggeredBreathing: boolean;   // If breathing activity was shown
  breathingCompleted: boolean;
}
```

#### Collection: `cognitive_games`
```typescript
{
  id: string;
  type: 'memory' | 'sequence' | 'pattern' | 'maze';
  title: string;
  description: string;
  ageGroup: '5-7' | '8-10' | '11-12';
  difficulty: 'easy' | 'medium' | 'hard';
  contentData: {
    // Memory Match
    cards?: { id: string; image: string; }[];
    
    // Sequence Builder
    sequence?: string[];
    maxLevel?: number;
    
    // Pattern Finder
    grid?: any[][];
    correctAnswer?: string;
    
    // Maze Challenge
    mazeLayout?: number[][];
    startPos?: [number, number];
    endPos?: [number, number];
  };
  pointsReward: number;
  xpReward: number;
  active: boolean;
  createdBy: string;             // Admin ID
  createdAt: Timestamp;
}
```

#### Collection: `cognitive_scores`
```typescript
{
  id: string;
  childId: string;
  gameId: string;
  gameType: string;
  score: number;
  accuracy: number;              // Percentage
  attempts: number;
  timeSpent: number;             // Seconds
  completed: boolean;
  date: Timestamp;
}
```

#### Collection: `creativity_activities`
```typescript
{
  id: string;
  type: 'drawing' | 'coloring' | 'story-creation';
  title: string;
  description: string;
  ageGroup: '5-7' | '8-10' | '11-12';
  templateUrl?: string;          // For coloring pages
  thumbnailUrl?: string;
  category: string;              // 'animals' | 'nature' | 'vehicles' | 'fantasy'
  active: boolean;
  createdBy: string;
  createdAt: Timestamp;
}
```

#### Collection: `drawings`
```typescript
{
  id: string;
  childId: string;
  title?: string;
  drawingUrl: string;            // Firebase Storage URL
  thumbnailUrl: string;
  canvasData: string;            // Serialized Fabric.js canvas JSON
  type: 'freehand' | 'coloring' | 'story-panel';
  parentViewed: boolean;         // NEW
  parentComments?: string;       // NEW
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Collection: `emotion_activities`
```typescript
{
  id: string;
  type: 'recognition' | 'friendship-story' | 'decision-making';
  title: string;
  scenarioText: string;
  imageUrl?: string;
  choices: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  emotionTag: 'empathy' | 'kindness' | 'anger-management' | 'friendship';
  ageGroup: '5-7' | '8-10' | '11-12';
  pointsReward: number;
  active: boolean;
  createdBy: string;
  createdAt: Timestamp;
}
```

#### Collection: `emotion_scores`
```typescript
{
  id: string;
  childId: string;
  activityId: string;
  activityType: string;
  emotionTag: string;
  score: number;
  correct: boolean;
  choicesMade: string[];
  date: Timestamp;
}
```

#### Collection: `kindness_journal`
```typescript
{
  id: string;
  childId: string;
  weekNumber: number;            // Week of year
  year: number;
  entryType: 'text' | 'drawing' | 'both';
  entryText?: string;
  entryImageUrl?: string;        // Firebase Storage URL
  kindActDescription: string;
  emotionFelt: string;
  parentResponse?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Collection: `story_content`
```typescript
{
  id: string;
  title: string;
  description: string;
  ageGroup: '5-7' | '8-10' | '11-12';
  coverImageUrl: string;
  introduction: {
    text: string;
    imageUrl: string;
  };
  choicePoints: {
    id: string;
    text: string;
    imageUrl: string;
    choices: {
      id: string;
      text: string;
      nextPointId: string | null; // null = ending
      emotionTag?: string;
    }[];
  }[];
  endings: {
    id: string;
    title: string;
    text: string;
    imageUrl: string;
    emotionOutcome: 'happy' | 'proud' | 'curious' | 'thoughtful';
    moralLesson: string;
  }[];
  totalEndings: number;
  active: boolean;
  createdBy: string;
  createdAt: Timestamp;
}
```

#### Collection: `story_progress`
```typescript
{
  id: string;
  childId: string;
  storyId: string;
  currentPointId: string;
  choicesMade: string[];         // Array of choice IDs
  endingsUnlocked: string[];     // Array of ending IDs
  completionPercentage: number;  // (endingsUnlocked / totalEndings) * 100
  lastPlayedAt: Timestamp;
  createdAt: Timestamp;
}
```

#### Collection: `parent_notifications`
```typescript
{
  id: string;
  parentId: string;
  childId: string;
  type: 'mood-alert' | 'achievement' | 'journal-entry' | 'new-drawing';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  metadata: {
    moodStreak?: number;
    achievementId?: string;
    drawingId?: string;
    journalId?: string;
  };
  createdAt: Timestamp;
}
```

---

## 4. Component Architecture

### 4.1 New Components to Build

```
src/
├── components/
│   ├── EmotionCheckIn.tsx           # Mood tracking widget
│   ├── BreathingActivity.tsx        # Guided breathing
│   ├── DrawingCanvas.tsx            # Fabric.js canvas wrapper
│   ├── StoryBranchNode.tsx          # Story choice display
│   ├── KindnessJournalEntry.tsx     # Journal input form
│   ├── ParentNotificationBadge.tsx  # Notification indicator
│   └── ScoreChart.tsx               # Dual score visualization
│
├── pages/
│   ├── ParentDashboard.tsx          # Parent view
│   ├── AdminPanel.tsx               # Admin main page
│   └── admin/
│       ├── GameManager.tsx
│       ├── StoryEditor.tsx
│       ├── AssetUploader.tsx
│       └── AnalyticsView.tsx
│
├── store/
│   ├── emotionStore.ts              # Mood & emotion state
│   ├── creativityStore.ts           # Drawing state
│   ├── storyStore.ts                # Story progress
│   ├── notificationStore.ts         # Parent notifications
│   └── adminStore.ts                # Admin panel state
│
└── services/
    ├── emotion.service.ts
    ├── drawing.service.ts
    ├── story.service.ts
    ├── notification.service.ts
    └── admin.service.ts
```

---

## 5. Key Features - Low-Level Design

### 5.1 Emotion Check-In Widget

**Component: `EmotionCheckIn.tsx`**

```typescript
interface EmotionCheckInProps {
  onComplete: (mood: MoodData) => void;
  showBreathingIfNeeded?: boolean;
}

interface MoodData {
  mood: MoodType;
  intensity: number;
  notes?: string;
}

// Algorithm:
// 1. Display emoji scale on dashboard entry
// 2. User selects mood + intensity (1-5 stars)
// 3. Optional text input for notes
// 4. Save to Firestore mood_checkins
// 5. Check last 3 days of moods
// 6. If 3+ negative moods → trigger breathing activity
// 7. If 3+ negative moods → create parent notification
```

**Breathing Activity Trigger Logic:**
```typescript
const shouldTriggerBreathing = (mood: MoodType): boolean => {
  return ['sad', 'angry', 'worried'].includes(mood);
};

const checkMoodPattern = async (childId: string): Promise<boolean> => {
  // Get last 3 days of check-ins
  const last3Days = await getLastNDaysMoods(childId, 3);
  
  // Count negative moods
  const negativeMoods = last3Days.filter(m => 
    ['sad', 'angry', 'worried'].includes(m.mood)
  );
  
  // Alert parent if 3+ negative
  if (negativeMoods.length >= 3) {
    await createParentNotification({
      type: 'mood-alert',
      priority: 'high',
      message: 'Your child has expressed negative emotions for 3+ days'
    });
    return true;
  }
  
  return false;
};
```

---

### 5.2 Drawing Canvas with Firebase Storage

**Component: `DrawingCanvas.tsx`**

```typescript
interface DrawingCanvasProps {
  activityId?: string;
  templateUrl?: string;  // For coloring pages
  onSave: (drawingData: DrawingData) => void;
}

// Fabric.js Integration:
// 1. Initialize canvas with Fabric.js
// 2. Provide tools: brush, eraser, color picker, brush size
// 3. Undo/Redo stack
// 4. Load template if coloring page
// 5. Save: 
//    a. Generate thumbnail (toDataURL)
//    b. Serialize canvas (toJSON)
//    c. Upload to Firebase Storage
//    d. Save metadata to Firestore
```

**Storage Structure:**
```
Firebase Storage:
/drawings/
  /{childId}/
    /{drawingId}.png          // Full image
    /{drawingId}_thumb.png    // Thumbnail
/coloring-templates/
  /{templateId}.png
/story-assets/
  /scenes/{sceneId}.png
  /characters/{characterId}.png
```

**Save Algorithm:**
```typescript
const saveDrawing = async (canvas: fabric.Canvas, childId: string) => {
  // 1. Generate image data
  const fullImage = canvas.toDataURL({ format: 'png', quality: 1 });
  const thumbnail = canvas.toDataURL({ 
    format: 'png', 
    quality: 0.5, 
    multiplier: 0.2 
  });
  
  // 2. Upload to Storage
  const drawingId = generateId();
  const fullUrl = await uploadToStorage(
    `drawings/${childId}/${drawingId}.png`, 
    fullImage
  );
  const thumbUrl = await uploadToStorage(
    `drawings/${childId}/${drawingId}_thumb.png`, 
    thumbnail
  );
  
  // 3. Save metadata to Firestore
  await db.collection('drawings').add({
    childId,
    drawingUrl: fullUrl,
    thumbnailUrl: thumbUrl,
    canvasData: JSON.stringify(canvas.toJSON()),
    type: 'freehand',
    parentViewed: false,
    createdAt: serverTimestamp()
  });
  
  // 4. Notify parent
  await createParentNotification({
    type: 'new-drawing',
    childId,
    priority: 'low'
  });
};
```

---

### 5.3 Branching Story Engine

**Component: `StoryWorldPage.tsx` (Enhanced)**

```typescript
interface StoryState {
  storyId: string;
  currentPointId: string;
  choiceHistory: string[];
  endingsUnlocked: string[];
}

// Story Navigation Algorithm:
const navigateStory = async (
  storyId: string, 
  choiceId: string, 
  userId: string
) => {
  // 1. Load story content
  const story = await getStory(storyId);
  
  // 2. Find current choice point
  const currentPoint = story.choicePoints.find(
    p => p.choices.some(c => c.id === choiceId)
  );
  
  // 3. Get selected choice
  const choice = currentPoint.choices.find(c => c.id === choiceId);
  
  // 4. Determine next destination
  if (choice.nextPointId === null) {
    // Reached an ending
    const ending = story.endings.find(e => e.id === choiceId);
    await unlockEnding(userId, storyId, ending.id);
    return { type: 'ending', data: ending };
  } else {
    // Continue to next choice point
    const nextPoint = story.choicePoints.find(
      p => p.id === choice.nextPointId
    );
    await saveProgress(userId, storyId, choiceId, nextPoint.id);
    return { type: 'continue', data: nextPoint };
  }
};
```

**Story Progress Tracking:**
```typescript
const calculateCompletion = (
  endingsUnlocked: string[], 
  totalEndings: number
): number => {
  return (endingsUnlocked.length / totalEndings) * 100;
};

const getUnlockedEndingsDisplay = (story: Story, progress: Progress) => {
  return {
    discovered: progress.endingsUnlocked.length,
    remaining: story.totalEndings - progress.endingsUnlocked.length,
    percentage: calculateCompletion(
      progress.endingsUnlocked, 
      story.totalEndings
    )
  };
};
```

---

### 5.4 Dual Scoring System

**Score Calculation:**
```typescript
// Cognitive Score = Average of all brain world activities
const calculateCognitiveScore = async (childId: string): Promise<number> => {
  const scores = await db
    .collection('cognitive_scores')
    .where('childId', '==', childId)
    .get();
  
  const totalScore = scores.docs.reduce(
    (sum, doc) => sum + doc.data().score, 
    0
  );
  
  return scores.docs.length > 0 
    ? Math.round(totalScore / scores.docs.length) 
    : 0;
};

// Emotional Score = Average of emotion world activities
const calculateEmotionalScore = async (childId: string): Promise<number> => {
  const scores = await db
    .collection('emotion_scores')
    .where('childId', '==', childId)
    .get();
  
  const totalScore = scores.docs.reduce(
    (sum, doc) => sum + doc.data().score, 
    0
  );
  
  return scores.docs.length > 0 
    ? Math.round(totalScore / scores.docs.length) 
    : 0;
};

// Update user scores periodically
const updateUserScores = async (childId: string) => {
  const cognitiveScore = await calculateCognitiveScore(childId);
  const emotionalScore = await calculateEmotionalScore(childId);
  
  await db.collection('users').doc(childId).update({
    cognitiveScore,
    emotionalScore,
    updatedAt: serverTimestamp()
  });
};
```

---

### 5.5 Kindness Journal

**Component: `KindnessJournalEntry.tsx`**

```typescript
interface JournalEntryData {
  entryType: 'text' | 'drawing' | 'both';
  kindActDescription: string;
  entryText?: string;
  entryImage?: File;
  emotionFelt: string;
}

// Weekly prompt system:
const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const hasCompletedThisWeek = async (childId: string): Promise<boolean> => {
  const weekNum = getWeekNumber(new Date());
  const year = new Date().getFullYear();
  
  const entry = await db
    .collection('kindness_journal')
    .where('childId', '==', childId)
    .where('weekNumber', '==', weekNum)
    .where('year', '==', year)
    .get();
  
  return !entry.empty;
};
```

---

### 5.6 Admin Panel

**Pages Structure:**

1. **Game Manager** (`/admin/games`)
   - List all cognitive games
   - Create new game (form with type selector)
   - Edit game content
   - Activate/deactivate games

2. **Story Editor** (`/admin/stories`)
   - Visual branching story editor
   - Drag-and-drop choice points
   - Upload scene images
   - Preview story flow

3. **Asset Uploader** (`/admin/assets`)
   - Upload coloring templates
   - Upload story scene assets
   - Organize by category
   - Generate thumbnails

4. **Analytics View** (`/admin/analytics`)
   - View all children's scores
   - Filter by age group
   - Export CSV reports
   - Emotion trends graphs

**Admin Route Protection:**
```typescript
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};
```

---

## 6. Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. ✅ Update Firestore schema and security rules
2. ✅ Create new Zustand stores
3. ✅ Build Emotion Check-In widget
4. ✅ Implement mood tracking backend
5. ✅ Create parent notification system

### Phase 2: Core Features (Week 3-4)
6. ✅ Implement Drawing Canvas with Fabric.js
7. ✅ Build Firebase Storage integration
8. ✅ Create Kindness Journal feature
9. ✅ Implement Breathing Activity
10. ✅ Build dual scoring system

### Phase 3: Advanced (Week 5-6)
11. ✅ Build Branching Story Engine
12. ✅ Create Story Editor for admin
13. ✅ Implement story progress tracking
14. ✅ Build Parent Dashboard

### Phase 4: Admin Panel (Week 7-8)
15. ✅ Create admin authentication/authorization
16. ✅ Build Game Manager interface
17. ✅ Build Asset Uploader
18. ✅ Create Analytics Dashboard
19. ✅ Testing and refinement

---

## 7. Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId 
                  || isParentOf(userId) 
                  || isAdmin();
      allow write: if request.auth.uid == userId;
    }
    
    // Mood check-ins
    match /mood_checkins/{checkinId} {
      allow read: if isOwner() || isParentOf(resource.data.childId) || isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner() || isAdmin();
    }
    
    // Drawings
    match /drawings/{drawingId} {
      allow read: if isOwner() || isParentOf(resource.data.childId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner() || isParentOf(resource.data.childId);
      allow delete: if isOwner() || isAdmin();
    }
    
    // Admin-only collections
    match /cognitive_games/{gameId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /emotion_activities/{activityId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /story_content/{storyId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner() {
      return request.auth.uid == resource.data.childId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isParentOf(childId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.children.hasAny([childId]);
    }
  }
}
```

---

## 8. API Endpoints (Firebase Cloud Functions)

### Function: `checkMoodPattern`
- Trigger: onCreate in `mood_checkins`
- Purpose: Check last 3 days, create parent notification if needed

### Function: `calculateScores`
- Trigger: Scheduled (daily at midnight)
- Purpose: Update all users' cognitive and emotional scores

### Function: `sendWeeklyJournalReminder`
- Trigger: Scheduled (Monday morning)
- Purpose: Remind children to complete kindness journal

### Function: `generateThumbnail`
- Trigger: onFinalize in Storage `/drawings/{childId}/{drawingId}.png`
- Purpose: Auto-generate thumbnail for drawings

---

## 9. Testing Strategy

### Unit Tests
- Mood check-in logic
- Score calculation algorithms
- Story navigation logic
- Permission checks

### Integration Tests
- Firebase Storage upload/download
- Firestore CRUD operations
- Parent notification flow
- Admin panel operations

### E2E Tests
- Complete user journey from check-in to activity
- Parent viewing child's progress
- Admin creating and publishing content

---

## 10. Next Steps

1. Review and approve this design document
2. Set up Firebase collections and security rules
3. Begin Phase 1 implementation
4. Create component mockups/wireframes
5. Set up development environment for Fabric.js

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-10  
**Author:** Kiro AI Assistant
