# SpaceECE Advanced Features - Implementation Roadmap

## Quick Reference

**Total Estimated Time:** 8 weeks  
**Total Features:** 19 major features  
**New Collections:** 8 Firebase collections  
**New Components:** 20+ React components  
**New Routes:** 5 new routes

---

## Phase 1: Foundation Setup (Week 1-2)

### Task 1.1: Firebase Schema Setup
**Priority:** 🔴 Critical  
**Time:** 2 days

- [ ] Update `firestore.rules` with new security rules
- [ ] Create new Firestore collections structure
- [ ] Set up Firebase Storage buckets
- [ ] Test security rules with Firebase Emulator

**Files to Create/Modify:**
- `firestore.rules`
- `storage.rules`

---

### Task 1.2: TypeScript Interfaces
**Priority:** 🔴 Critical  
**Time:** 1 day

- [ ] Add new interfaces to `src/types/index.ts`
- [ ] Create type definitions for all new collections
- [ ] Add enums for mood types, activity types, etc.

**New Interfaces Needed:**
```typescript
- MoodCheckIn
- CognitiveGame
- CognitiveScore
- CreativityActivity
- Drawing
- EmotionActivity
- EmotionScore
- KindnessJournalEntry
- StoryContent
- StoryProgress
- ParentNotification
- AdminUser
```

---

### Task 1.3: Zustand Stores
**Priority:** 🔴 Critical  
**Time:** 2 days

**Files to Create:**
- `src/store/emotionStore.ts` - Mood tracking & breathing activity
- `src/store/creativityStore.ts` - Drawing canvas state
- `src/store/storyStore.ts` - Story navigation & progress
- `src/store/notificationStore.ts` - Parent notifications
- `src/store/adminStore.ts` - Admin panel state

---

### Task 1.4: Firebase Services
**Priority:** 🔴 Critical  
**Time:** 3 days

**Files to Create:**
- `src/services/emotion.service.ts`
- `src/services/drawing.service.ts`
- `src/services/story.service.ts`
- `src/services/notification.service.ts`
- `src/services/admin.service.ts`

Each service should include:
- CRUD operations
- Real-time listeners
- Error handling
- Type safety

---

## Phase 2: Emotion Tracking System (Week 3)

### Task 2.1: Emotion Check-In Widget
**Priority:** 🔴 Critical  
**Time:** 3 days

- [ ] Create `EmotionCheckIn.tsx` component
- [ ] Design emoji selector UI
- [ ] Implement intensity slider (1-5 stars)
- [ ] Add optional notes textarea
- [ ] Save to Firestore `mood_checkins`
- [ ] Integrate into Dashboard entry point

**Component Location:** `src/components/EmotionCheckIn.tsx`

---

### Task 2.2: Mood Pattern Detection
**Priority:** 🟠 High  
**Time:** 2 days

- [ ] Create Cloud Function `checkMoodPattern`
- [ ] Implement 3-day negative mood detection
- [ ] Trigger parent notification on pattern match
- [ ] Add mood history chart to profile

**Files:**
- `functions/src/checkMoodPattern.ts` (Cloud Function)
- `src/components/MoodHistoryChart.tsx`

---

### Task 2.3: Guided Breathing Activity
**Priority:** 🟠 High  
**Time:** 2 days

- [ ] Create `BreathingActivity.tsx` component
- [ ] Design animation (inhale/exhale circle)
- [ ] Add calming background music option
- [ ] Implement 3-minute guided session
- [ ] Track completion in mood check-in

**Component Location:** `src/components/BreathingActivity.tsx`

---

## Phase 3: Drawing & Storage System (Week 4)

### Task 3.1: Install Fabric.js
**Priority:** 🔴 Critical  
**Time:** 1 hour

```bash
npm install fabric @types/fabric
```

---

### Task 3.2: Drawing Canvas Component
**Priority:** 🔴 Critical  
**Time:** 4 days

- [ ] Create `DrawingCanvas.tsx` with Fabric.js
- [ ] Implement tools:
  - [ ] Freehand brush
  - [ ] Eraser
  - [ ] Color picker
  - [ ] Brush size slider
  - [ ] Undo/Redo stack
  - [ ] Clear canvas
- [ ] Add canvas serialization (toJSON)
- [ ] Implement save to Firebase Storage

**Component Location:** `src/components/DrawingCanvas.tsx`

---

### Task 3.3: Firebase Storage Integration
**Priority:** 🔴 Critical  
**Time:** 2 days

- [ ] Create upload function for drawings
- [ ] Generate thumbnails on upload
- [ ] Save metadata to `drawings` collection
- [ ] Create parent notification on save

**Service Location:** `src/services/drawing.service.ts`

---

### Task 3.4: Drawing Gallery
**Priority:** 🟠 High  
**Time:** 1 day

- [ ] Create masonry layout gallery
- [ ] Add lightbox preview
- [ ] Implement delete functionality
- [ ] Show parent viewed status

**Component Location:** `src/components/DrawingGallery.tsx`

---

## Phase 4: Kindness Journal (Week 4-5)

### Task 4.1: Journal Entry Form
**Priority:** 🟠 High  
**Time:** 2 days

- [ ] Create `KindnessJournalEntry.tsx`
- [ ] Support text + drawing entries
- [ ] Add emotion selector
- [ ] Implement weekly prompt system
- [ ] Save to `kindness_journal` collection

**Component Location:** `src/components/KindnessJournalEntry.tsx`

---

### Task 4.2: Journal History View
**Priority:** 🟡 Medium  
**Time:** 1 day

- [ ] Display past entries in timeline
- [ ] Show parent responses
- [ ] Filter by month/year

**Component Location:** `src/components/JournalHistory.tsx`

---

### Task 4.3: Weekly Reminder System
**Priority:** 🟡 Medium  
**Time:** 1 day

- [ ] Create Cloud Function `sendWeeklyJournalReminder`
- [ ] Schedule to run every Monday
- [ ] Check if entry completed for week
- [ ] Send in-app notification reminder

---

## Phase 5: Branching Story Engine (Week 5-6)

### Task 5.1: Story Data Structure
**Priority:** 🔴 Critical  
**Time:** 1 day

- [ ] Define story format in Firestore
- [ ] Create sample story with 3 endings
- [ ] Upload story assets to Storage

---

### Task 5.2: Story Navigation System
**Priority:** 🔴 Critical  
**Time:** 3 days

- [ ] Enhance `StoryWorldPage.tsx`
- [ ] Create `StoryBranchNode.tsx` component
- [ ] Implement choice selection logic
- [ ] Handle navigation to next point/ending
- [ ] Save progress to `story_progress`

**Files:**
- `src/pages/StoryWorldPage.tsx` (enhance)
- `src/components/StoryBranchNode.tsx`

---

### Task 5.3: Story Progress Tracking
**Priority:** 🟠 High  
**Time:** 2 days

- [ ] Show endings unlocked counter
- [ ] Calculate completion percentage
- [ ] Display story map/tree view
- [ ] Add replay button

**Component Location:** `src/components/StoryProgress.tsx`

---

### Task 5.4: Reading Comprehension Quiz
**Priority:** 🟡 Medium  
**Time:** 2 days

- [ ] Generate 3-5 questions at story end
- [ ] Multiple choice + True/False
- [ ] Track reading score
- [ ] Show results summary

**Component Location:** `src/components/ReadingQuiz.tsx`

---

## Phase 6: Dual Scoring System (Week 6)

### Task 6.1: Score Calculation
**Priority:** 🔴 Critical  
**Time:** 2 days

- [ ] Create `calculateCognitiveScore()` function
- [ ] Create `calculateEmotionalScore()` function
- [ ] Update user document with scores
- [ ] Create Cloud Function to run daily

**Files:**
- `src/utils/scoring.ts`
- `functions/src/calculateScores.ts`

---

### Task 6.2: Score Visualization
**Priority:** 🟠 High  
**Time:** 2 days

- [ ] Install Recharts: `npm install recharts`
- [ ] Create `ScoreChart.tsx` component
- [ ] Show dual line chart (cognitive vs emotional)
- [ ] Add to Profile and Parent Dashboard

**Component Location:** `src/components/ScoreChart.tsx`

---

## Phase 7: Parent Dashboard (Week 7)

### Task 7.1: Parent Dashboard Page
**Priority:** 🔴 Critical  
**Time:** 3 days

- [ ] Create `ParentDashboard.tsx` page
- [ ] Show all children (if multiple)
- [ ] Display child progress summary
- [ ] Show recent activities
- [ ] List notifications

**Page Location:** `src/pages/ParentDashboard.tsx`

---

### Task 7.2: Child Artwork Gallery (Parent View)
**Priority:** 🟠 High  
**Time:** 2 days

- [ ] Show all child's drawings
- [ ] Mark as viewed
- [ ] Add comment feature
- [ ] Download artwork option

**Component Location:** `src/components/ParentArtworkView.tsx`

---

### Task 7.3: Notification System
**Priority:** 🟠 High  
**Time:** 2 days

- [ ] Create notification badge in header
- [ ] Real-time notification listener
- [ ] Mark as read functionality
- [ ] Notification details modal

**Components:**
- `src/components/NotificationBadge.tsx`
- `src/components/NotificationList.tsx`

---

## Phase 8: Admin Panel (Week 7-8)

### Task 8.1: Admin Authentication
**Priority:** 🔴 Critical  
**Time:** 1 day

- [ ] Create `AdminRoute.tsx` guard
- [ ] Add role check in Firestore rules
- [ ] Create admin seed user

**Component Location:** `src/components/AdminRoute.tsx`

---

### Task 8.2: Admin Layout
**Priority:** 🔴 Critical  
**Time:** 1 day

- [ ] Create `AdminPanel.tsx` main page
- [ ] Create admin sidebar navigation
- [ ] Add admin header

**Page Location:** `src/pages/AdminPanel.tsx`

---

### Task 8.3: Game Manager
**Priority:** 🟠 High  
**Time:** 3 days

- [ ] Create `GameManager.tsx` page
- [ ] List all games with filter/search
- [ ] Create game form with type selector
- [ ] Edit game content
- [ ] Toggle active/inactive

**Page Location:** `src/pages/admin/GameManager.tsx`

---

### Task 8.4: Asset Uploader
**Priority:** 🟠 High  
**Time:** 2 days

- [ ] Create `AssetUploader.tsx` page
- [ ] Drag & drop file upload
- [ ] Organize by category
- [ ] Auto-generate thumbnails
- [ ] Manage existing assets

**Page Location:** `src/pages/admin/AssetUploader.tsx`

---

### Task 8.5: Story Editor
**Priority:** 🟡 Medium  
**Time:** 4 days

- [ ] Create `StoryEditor.tsx` page
- [ ] Visual node-based editor (React Flow?)
- [ ] Add choice points
- [ ] Create endings
- [ ] Upload scene images
- [ ] Preview story flow

**Page Location:** `src/pages/admin/StoryEditor.tsx`

**Note:** Consider using `react-flow` library for visual editor

---

### Task 8.6: Analytics Dashboard
**Priority:** 🟡 Medium  
**Time:** 3 days

- [ ] Create `AnalyticsView.tsx` page
- [ ] Show all children's scores
- [ ] Filter by age group
- [ ] Export to CSV
- [ ] Emotion trends graphs
- [ ] Activity completion rates

**Page Location:** `src/pages/admin/AnalyticsView.tsx`

---

## Phase 9: Testing & Polish (Week 8)

### Task 9.1: Unit Testing
**Priority:** 🟡 Medium  
**Time:** 2 days

- [ ] Test score calculation functions
- [ ] Test mood pattern detection
- [ ] Test story navigation logic

---

### Task 9.2: Integration Testing
**Priority:** 🟡 Medium  
**Time:** 2 days

- [ ] Test Firebase CRUD operations
- [ ] Test Storage upload/download
- [ ] Test real-time listeners

---

### Task 9.3: E2E Testing
**Priority:** 🟡 Medium  
**Time:** 2 days

- [ ] Test complete user journeys
- [ ] Test parent dashboard flows
- [ ] Test admin panel operations

---

### Task 9.4: Performance Optimization
**Priority:** 🟡 Medium  
**Time:** 1 day

- [ ] Optimize Firestore queries
- [ ] Implement pagination
- [ ] Lazy load images
- [ ] Code splitting optimization

---

### Task 9.5: Accessibility Audit
**Priority:** 🟡 Medium  
**Time:** 1 day

- [ ] Keyboard navigation
- [ ] Screen reader labels
- [ ] Color contrast check
- [ ] Focus states

---

## Installation Dependencies

### New npm Packages to Install:

```bash
# Drawing & Canvas
npm install fabric @types/fabric

# Charts & Visualization
npm install recharts

# Optional: Visual Story Editor
npm install reactflow

# Optional: Drag & Drop Upload
npm install react-dropzone

# Optional: Rich Text Editor for Journal
npm install react-quill

# Optional: Date Utilities
npm install date-fns
```

---

## Environment Variables

Add to `.env`:

```env
# Existing Firebase config...

# Cloud Functions URL (after deployment)
VITE_FUNCTIONS_URL=https://us-central1-your-project.cloudfunctions.net

# Optional: Enable admin panel
VITE_ADMIN_ENABLED=true
```

---

## Firebase Cloud Functions to Deploy

1. **checkMoodPattern** - Triggers on mood check-in creation
2. **calculateScores** - Scheduled daily at midnight
3. **sendWeeklyJournalReminder** - Scheduled Monday mornings
4. **generateThumbnail** - Triggers on drawing upload

```bash
# Deploy functions
cd functions
npm install
npm run deploy
```

---

## Routes to Add

Update `src/App.tsx` with new routes:

```typescript
// Parent routes
<Route path="/parent/dashboard" element={<ParentDashboard />} />
<Route path="/parent/child/:childId" element={<ChildDetails />} />

// Admin routes
<Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
<Route path="/admin/games" element={<AdminRoute><GameManager /></AdminRoute>} />
<Route path="/admin/stories" element={<AdminRoute><StoryEditor /></AdminRoute>} />
<Route path="/admin/assets" element={<AdminRoute><AssetUploader /></AdminRoute>} />
<Route path="/admin/analytics" element={<AdminRoute><AnalyticsView /></AdminRoute>} />
```

---

## Success Criteria

### Phase 1 Complete When:
- ✅ All Firestore collections created
- ✅ Security rules deployed
- ✅ All TypeScript interfaces defined
- ✅ All Zustand stores created
- ✅ All service files created

### Phase 2 Complete When:
- ✅ Emotion check-in works on dashboard
- ✅ Moods save to Firestore
- ✅ Breathing activity triggers correctly
- ✅ Parent notifications created for mood patterns

### Phase 3 Complete When:
- ✅ Drawing canvas fully functional
- ✅ Drawings save to Firebase Storage
- ✅ Gallery displays all drawings
- ✅ Parents can view child's art

### Phase 4 Complete When:
- ✅ Journal entry form works
- ✅ Weekly prompts display
- ✅ Entry history shows past entries
- ✅ Reminders send on schedule

### Phase 5 Complete When:
- ✅ Stories load and display
- ✅ Choice selection advances story
- ✅ Endings unlock correctly
- ✅ Progress tracks completion %

### Phase 6 Complete When:
- ✅ Scores calculate accurately
- ✅ Charts display both score types
- ✅ Scores update automatically

### Phase 7 Complete When:
- ✅ Parent dashboard shows child data
- ✅ Notifications work in real-time
- ✅ Parents can view artwork

### Phase 8 Complete When:
- ✅ Admin can create games
- ✅ Admin can upload assets
- ✅ Admin can create stories
- ✅ Analytics display correctly

### Phase 9 Complete When:
- ✅ All tests passing
- ✅ Performance optimized
- ✅ Accessibility compliant

---

## Risk Management

### High Risk Items:
1. **Fabric.js Learning Curve** - Team may need time to learn library
   - *Mitigation:* Allocate extra time, follow tutorials

2. **Firebase Storage Costs** - Many images may increase costs
   - *Mitigation:* Implement compression, thumbnail generation

3. **Story Editor Complexity** - Visual editor is complex
   - *Mitigation:* Start with simple form, enhance later

### Medium Risk Items:
1. **Cloud Functions Cold Starts** - May cause delays
   - *Mitigation:* Consider keeping functions warm

2. **Real-time Listeners** - May affect performance
   - *Mitigation:* Implement proper cleanup, use pagination

---

## Questions for Product Owner

Before starting implementation:

1. Should parents be able to create accounts and link children?
2. What's the max file size for drawings?
3. How many free stories should be available vs premium?
4. Should there be moderation for journal entries?
5. What admin permissions are needed (super admin vs content admin)?
6. Should analytics be exportable? In what format?
7. Do we need email notifications or just in-app?
8. What's the priority: mobile responsive or desktop first?

---

**Ready to start implementation!** 🚀

Which phase would you like to begin with?
