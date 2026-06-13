# Firebase Collections Setup Guide - SpaceECE

This guide shows you **exactly** how to create each collection in Firebase Firestore with the correct field structure.

---

## 📋 Prerequisites

Before starting:
- ✅ Firebase project created
- ✅ Firestore Database enabled
- ✅ Logged into Firebase Console

**Open your Firebase Console**: https://console.firebase.google.com/

---

## 🎯 Quick Navigation

1. [cognitive_games Collection](#1-cognitive_games-collection)
2. [creativity_activities Collection](#2-creativity_activities-collection)
3. [emotion_activities Collection](#3-emotion_activities-collection)
4. [cognitive_scores Collection](#4-cognitive_scores-collection)
5. [Verify Collections](#5-verify-your-collections)

---

## 1. cognitive_games Collection

### Purpose
Stores all brain world games (memory, sequence, pattern, maze)

### Step-by-Step Creation

#### Step 1.1: Start Collection
1. Go to **Firestore Database** (in left sidebar)
2. Click **"Data"** tab
3. Click **"+ Start collection"** button
4. Enter Collection ID: **`cognitive_games`**
5. Click **"Next"**

#### Step 1.2: Add First Document
Now you'll add the first game document.

**Document ID**: Click **"Auto-ID"** (Firebase will generate a unique ID)

**Fields to Add**: Click **"+ Add field"** for each:

| Field Name | Type | Value | Notes |
|------------|------|-------|-------|
| `type` | string | `memory` | Options: memory, sequence, pattern, maze |
| `title` | string | `Memory Match - Animals` | Game title |
| `description` | string | `Find matching pairs of cute animals` | Short description |
| `ageGroup` | string | `5-7` | Options: 5-7, 8-10, 11-12 |
| `difficulty` | string | `easy` | Options: easy, medium, hard |
| `contentData` | map | `{}` | Click "+" to expand, leave empty for now |
| `pointsReward` | number | `100` | Points given on completion |
| `xpReward` | number | `50` | Experience points given |
| `active` | boolean | `true` | Is game active? |
| `createdBy` | string | `admin` | Admin user ID |
| `createdAt` | timestamp | Click clock icon → "Set to current time" | When created |

#### Step 1.3: Save Document
Click **"Save"** button at the bottom

✅ **First cognitive_games document created!**

#### Step 1.4: Add More Sample Games (Optional)

Click **"+ Add document"** and repeat with different values:

**Game 2: Sequence Builder**
```
type: "sequence"
title: "Sequence Builder - Colors"
description: "Remember and repeat the color pattern"
ageGroup: "8-10"
difficulty: "medium"
contentData: {}
pointsReward: 150
xpReward: 75
active: true
createdBy: "admin"
createdAt: [current timestamp]
```

**Game 3: Pattern Finder**
```
type: "pattern"
title: "Pattern Finder - Shapes"
description: "Find the different shape in the grid"
ageGroup: "5-7"
difficulty: "easy"
contentData: {}
pointsReward: 120
xpReward: 60
active: true
createdBy: "admin"
createdAt: [current timestamp]
```

**Game 4: Maze Challenge**
```
type: "maze"
title: "Maze Challenge - Level 1"
description: "Navigate through the maze to find the exit"
ageGroup: "8-10"
difficulty: "medium"
contentData: {}
pointsReward: 200
xpReward: 100
active: true
createdBy: "admin"
createdAt: [current timestamp]
```

---

## 2. creativity_activities Collection

### Purpose
Stores creativity world activities (drawing, coloring, story creation)

### Step-by-Step Creation

#### Step 2.1: Start Collection
1. Go back to **Firestore Database** → **Data** tab
2. Click **"+ Start collection"** button
3. Enter Collection ID: **`creativity_activities`**
4. Click **"Next"**

#### Step 2.2: Add First Document

**Document ID**: Click **"Auto-ID"**

**Fields to Add**:

| Field Name | Type | Value | Notes |
|------------|------|-------|-------|
| `type` | string | `coloring` | Options: coloring, drawing, story-creation |
| `title` | string | `Color the Elephant` | Activity title |
| `description` | string | `Bring this cute elephant to life with colors!` | Description |
| `ageGroup` | string | `5-7` | Options: 5-7, 8-10, 11-12 |
| `templateUrl` | string | `` | Leave empty (will be filled when uploaded) |
| `thumbnailUrl` | string | `` | Leave empty |
| `category` | string | `animals` | Options: animals, nature, vehicles, fantasy |
| `active` | boolean | `true` | Is activity active? |
| `createdBy` | string | `admin` | Admin user ID |
| `createdAt` | timestamp | [current time] | When created |

#### Step 2.3: Save Document
Click **"Save"**

✅ **First creativity_activities document created!**

#### Step 2.4: Add More Sample Activities (Optional)

**Activity 2: Coloring Page - Nature**
```
type: "coloring"
title: "Color the Garden"
description: "Fill this beautiful garden with colors"
ageGroup: "5-7"
templateUrl: ""
thumbnailUrl: ""
category: "nature"
active: true
createdBy: "admin"
createdAt: [current timestamp]
```

**Activity 3: Drawing Pad**
```
type: "drawing"
title: "Free Drawing Canvas"
description: "Create your own masterpiece from scratch"
ageGroup: "8-10"
templateUrl: ""
thumbnailUrl: ""
category: "freestyle"
active: true
createdBy: "admin"
createdAt: [current timestamp]
```

---

## 3. emotion_activities Collection

### Purpose
Stores emotion world activities (recognition, friendship stories, decision making)

### Step-by-Step Creation

#### Step 3.1: Start Collection
1. Go to **Firestore Database** → **Data** tab
2. Click **"+ Start collection"** button
3. Enter Collection ID: **`emotion_activities`**
4. Click **"Next"**

#### Step 3.2: Add First Document

**Document ID**: Click **"Auto-ID"**

**Fields to Add**:

| Field Name | Type | Value | Notes |
|------------|------|-------|-------|
| `type` | string | `recognition` | Options: recognition, friendship-story, decision-making |
| `title` | string | `Identify Happy Face` | Activity title |
| `scenarioText` | string | `Look at this person's face. How are they feeling?` | Scenario description |
| `imageUrl` | string | `` | Leave empty (will be filled later) |
| `choices` | array | See below ↓ | Array of choice objects |
| `emotionTag` | string | `empathy` | Options: empathy, kindness, anger-management, friendship |
| `ageGroup` | string | `5-7` | Options: 5-7, 8-10, 11-12 |
| `pointsReward` | number | `25` | Points given |
| `active` | boolean | `true` | Is activity active? |
| `createdBy` | string | `admin` | Admin user ID |
| `createdAt` | timestamp | [current time] | When created |

#### Step 3.3: Add Choices Array

For the **`choices`** field:
1. Click on the **`choices`** field type dropdown → Select **"array"**
2. Click **"Add item"** to add first choice
3. Select type: **"map"**
4. Add these fields inside the map:

**Choice 1 (Correct Answer):**
```
id: "choice1" (string)
text: "Happy 😊" (string)
isCorrect: true (boolean)
feedback: "That's right! This person is smiling and looks happy!" (string)
```

Click **"Add item"** again for Choice 2:

**Choice 2:**
```
id: "choice2" (string)
text: "Sad 😢" (string)
isCorrect: false (boolean)
feedback: "Not quite. Look at the smile! They seem happy." (string)
```

**Choice 3:**
```
id: "choice3" (string)
text: "Angry 😠" (string)
isCorrect: false (boolean)
feedback: "Not quite. An angry face looks different. This person is happy!" (string)
```

#### Step 3.4: Save Document
Click **"Save"**

✅ **First emotion_activities document created!**

#### Step 3.5: Add More Sample Activities (Optional)

**Activity 2: Friendship Scenario**
```
type: "friendship-story"
title: "Helping a Friend"
scenarioText: "Your friend drops their books in the hallway. What do you do?"
imageUrl: ""
choices: [
  {
    id: "choice1",
    text: "Help them pick up the books",
    isCorrect: true,
    feedback: "Great choice! Helping friends is what kindness is all about!"
  },
  {
    id: "choice2",
    text: "Walk away",
    isCorrect: false,
    feedback: "Think about how your friend might feel. Helping is better!"
  },
  {
    id: "choice3",
    text: "Laugh at them",
    isCorrect: false,
    feedback: "That would hurt their feelings. Being kind is always better!"
  }
]
emotionTag: "kindness"
ageGroup: "5-7"
pointsReward: 30
active: true
createdBy: "admin"
createdAt: [current timestamp]
```

---

## 4. cognitive_scores Collection

### Purpose
Stores player scores from cognitive games

### Important Note
⚠️ **This collection will be AUTO-CREATED** when users play games!

You don't need to create this manually. When a child completes a game, the app will automatically create this collection and add documents.

### Structure (For Reference)

When auto-created, documents will have this structure:

```
id: [auto-generated]
childId: "user-id-123" (string) - The child's user ID
gameId: "game-id-456" (string) - The game's ID
gameType: "memory" (string) - Type of game
score: 85 (number) - Score achieved
accuracy: 90 (number) - Accuracy percentage
attempts: 3 (number) - Number of attempts
timeSpent: 120 (number) - Time in seconds
completed: true (boolean) - Whether completed
date: [timestamp] - When played
```

### Optional: Create Sample Score (For Testing)

If you want to test the analytics before playing games:

1. Click **"+ Start collection"**
2. Collection ID: **`cognitive_scores`**
3. Click **"Next"**
4. Add document with fields above
5. Use your test user ID for `childId`
6. Use an existing game ID for `gameId`

---

## 5. Verify Your Collections

### Step 5.1: Check All Collections

Go to **Firestore Database** → **Data** tab

You should now see these collections in the list:
- ✅ cognitive_games
- ✅ creativity_activities
- ✅ emotion_activities
- ✅ cognitive_scores (if you created it manually)

### Step 5.2: Check Document Counts

Each collection should show:
- **cognitive_games**: 1-4 documents (depending on how many you added)
- **creativity_activities**: 1-3 documents
- **emotion_activities**: 1-2 documents

### Step 5.3: Test in Admin Panel

1. Open your app: http://localhost:5173
2. Login as admin (use bypass login)
3. Go to **Admin Panel**
4. Click **Cognitive Games**
5. You should see your games listed!
6. Try creating a new game through the UI

✅ **Collections Working!**

---

## 📊 Collections Summary

| Collection | Purpose | Created By | Documents |
|------------|---------|------------|-----------|
| `cognitive_games` | Brain world games | Manual/Admin | 4+ |
| `creativity_activities` | Art activities | Manual/Admin | 3+ |
| `emotion_activities` | Emotion scenarios | Manual/Admin | 2+ |
| `cognitive_scores` | Player scores | Auto-created | Auto |
| `emotion_scores` | Emotion scores | Auto-created | Auto |
| `drawings` | User drawings | Auto-created | Auto |
| `users` | User accounts | Auto-created | Auto |

---

## 🔄 Auto-Created Collections

These collections will be created automatically when needed:

### `users`
Created when users register. Structure:
```
id: [user-uid]
email: "user@example.com"
displayName: "John Doe"
role: "child" (or "parent", "admin")
level: 1
xp: 0
totalScore: 0
cognitiveScore: 0
emotionalScore: 0
streak: 0
parentId: null
children: []
createdAt: [timestamp]
updatedAt: [timestamp]
lastLoginDate: [timestamp]
```

### `emotion_scores`
Created when users complete emotion activities. Similar to cognitive_scores.

### `drawings`
Created when users save drawings. Structure:
```
id: [auto-generated]
childId: "user-id"
drawingUrl: "gs://bucket/path"
thumbnailUrl: "gs://bucket/path"
canvasData: "{...}" (serialized canvas)
type: "freehand"
parentViewed: false
createdAt: [timestamp]
```

---

## 🎨 Adding More Content Later

### Via Admin Panel (Recommended)
1. Login as admin
2. Go to Admin Panel
3. Use the UI to create games/activities

### Via Firebase Console
1. Go to the collection
2. Click **"Add document"**
3. Fill in the fields
4. Save

### Via Code (Advanced)
Use the `adminService` in your app to programmatically add content.

---

## 🔧 Troubleshooting

### Problem: "Collection not showing in list"
**Solution**: Refresh the Firebase Console page

### Problem: "Can't add field to choices array"
**Solution**: 
1. Make sure field type is "array"
2. Click "Add item" first
3. Then select "map" as item type
4. Add fields inside the map

### Problem: "Timestamp not working"
**Solution**: 
1. Click on the timestamp field
2. Click the clock icon
3. Select "Set to current time"

### Problem: "Can't see collections in admin panel"
**Solution**: 
1. Make sure you're logged in as admin
2. Check that your user has `role: "admin"` in the `users` collection
3. Refresh the page

---

## ✅ Final Checklist

- [ ] `cognitive_games` collection created with 4 sample games
- [ ] `creativity_activities` collection created with 3 sample activities
- [ ] `emotion_activities` collection created with 2 sample scenarios
- [ ] All fields have correct types (string, number, boolean, array, map, timestamp)
- [ ] At least one document in each collection
- [ ] Collections visible in Firebase Console
- [ ] Collections accessible from Admin Panel
- [ ] Can create new content through Admin Panel

---

## 📸 Visual Reference

### What Firebase Console Should Look Like:

```
Firestore Database
├── cognitive_games (4 documents)
│   ├── abc123 (Memory Match - Animals)
│   ├── def456 (Sequence Builder - Colors)
│   ├── ghi789 (Pattern Finder - Shapes)
│   └── jkl012 (Maze Challenge - Level 1)
│
├── creativity_activities (3 documents)
│   ├── mno345 (Color the Elephant)
│   ├── pqr678 (Color the Garden)
│   └── stu901 (Free Drawing Canvas)
│
├── emotion_activities (2 documents)
│   ├── vwx234 (Identify Happy Face)
│   └── yza567 (Helping a Friend)
│
└── (other collections will appear as users interact with the app)
```

---

## 🎉 Success!

You now have your Firebase collections set up correctly!

Your SpaceECE app can now:
- ✅ Load games from Firestore
- ✅ Display activities in worlds
- ✅ Show emotion scenarios
- ✅ Save user scores
- ✅ Allow admins to manage content

**Next Step**: Start using the Admin Panel to add more content!

---

## 💡 Tips

1. **Start Small**: Add 2-3 items per collection first, then add more later
2. **Use Admin Panel**: It's easier than Firebase Console for regular content management
3. **Backup Regularly**: Go to Firestore → Import/Export to backup your data
4. **Test First**: Create test content, try it in the app, then create real content

---

**Need Help?** Refer back to the main `FIREBASE_SETUP_GUIDE.md` for general Firebase setup questions.
