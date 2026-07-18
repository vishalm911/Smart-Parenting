# Milestone Catalog Activities - Component Structure

## 📊 Component Hierarchy

```
Home.jsx (Child Dashboard)
└── MilestoneCatalogActivities
    ├── Collapsible Header (Always visible)
    │   ├── Title: "Milestone Activities Catalog"
    │   ├── Subtitle: Level info & activity count
    │   ├── Description: Age-appropriate description
    │   └── Toggle Button: Expand/Collapse
    │
    └── Catalog Content (Visible when expanded)
        ├── Domain Grid (5 cards)
        │   ├── Physical Development 💪
        │   ├── Social Development 👥
        │   ├── Emotional Development ❤️
        │   ├── Cognitive Development 🧠
        │   └── Aesthetic Development 🎨
        │
        ├── Selected Domain Activities (when domain clicked)
        │   ├── Domain Header with Close Button
        │   └── Activities Grid
        │       └── Activity Cards (multiple)
        │           ├── Activity Name
        │           ├── Domain Badge
        │           ├── Milestone Info
        │           ├── Description
        │           └── "View Details" Button
        │
        ├── All Domains Preview (default state)
        │   ├── Preview Title
        │   └── Instructions Text
        │
        └── Activity Detail Modal (when activity clicked)
            ├── Modal Header
            │   ├── Activity Name
            │   ├── Domain Badge
            │   └── Age Range Badge
            │
            ├── Modal Body
            │   ├── 🎯 Milestone
            │   ├── 📝 Description
            │   ├── 🎮 Game Idea
            │   ├── 🤖 AI Integration
            │   └── ✨ Learning Outcome
            │
            └── Modal Footer
                ├── 🚀 Start Activity Button
                └── 🔖 Bookmark Button
```

---

## 🎨 Visual States

### State 1: Collapsed (Initial)
```
┌─────────────────────────────────────────────┐
│  🎯 Milestone Activities Catalog        [+] │
│  Level 1: 0-6 Months • 9 Activities         │
│  Sensory awareness, early bonding...        │
└─────────────────────────────────────────────┘
```

### State 2: Expanded - Domain Selection
```
┌─────────────────────────────────────────────┐
│  🎯 Milestone Activities Catalog        [-] │
│  Level 1: 0-6 Months • 9 Activities         │
│  Sensory awareness, early bonding...        │
└─────────────────────────────────────────────┘

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 💪 Physical    │ │ 👥 Social      │ │ ❤️ Emotional   │
│ Development    │ │ Development    │ │ Development    │
│                │ │                │ │                │
│ 3 Activities   │ │ 2 Activities   │ │ 1 Activity     │
└────────────────┘ └────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐
│ 🧠 Cognitive   │ │ 🎨 Aesthetic   │
│ Development    │ │ Development    │
│                │ │                │
│ 1 Activity     │ │ 2 Activities   │
└────────────────┘ └────────────────┘

┌─────────────────────────────────────────────┐
│  📚 Explore Activities by Domain            │
│  Click on any domain card above to view...  │
└─────────────────────────────────────────────┘
```

### State 3: Domain Selected - Activities List
```
┌─────────────────────────────────────────────┐
│  💪 Physical Development Activities     [×] │
└─────────────────────────────────────────────┘

┌────────────────────────────┐ ┌────────────────────────────┐
│ Tummy Time Tracker     [💪]│ │ Sound Compass          [💪]│
│                            │ │                            │
│ Milestone: Lifts head...   │ │ Milestone: Turns head...   │
│ An animated screen with... │ │ Left-and-right audio...    │
│                            │ │                            │
│ [View Full Details →]      │ │ [View Full Details →]      │
└────────────────────────────┘ └────────────────────────────┘

┌────────────────────────────┐
│ Rhythm Mover           [💪]│
│                            │
│ Milestone: Moves arms...   │
│ Screen plays soft music... │
│                            │
│ [View Full Details →]      │
└────────────────────────────┘
```

### State 4: Activity Detail Modal
```
┌─────────────────────────────────────────────┐
│                                         [×] │
│  Tummy Time Tracker                         │
│  [💪 Physical] [0-6 Months]                 │
├─────────────────────────────────────────────┤
│                                             │
│  🎯 Milestone                               │
│  ┌─────────────────────────────────────┐   │
│  │ Lifts head briefly during tummy time│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📝 Description                             │
│  ┌─────────────────────────────────────┐   │
│  │ An animated screen with high-       │   │
│  │ contrast black-and-white patterns...│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  🎮 Game Idea                               │
│  ┌─────────────────────────────────────┐   │
│  │ Head-Up Hero - A floating star      │   │
│  │ rises every time the baby lifts...  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  🤖 AI Integration                          │
│  ┌─────────────────────────────────────┐   │
│  │ AI camera via tablet detects head...│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✨ Learning Outcome                        │
│  ┌─────────────────────────────────────┐   │
│  │ Baby develops neck muscle strength  │   │
│  │ and early proprioception            │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [🚀 Start Activity]  [🔖 Bookmark]         │
└─────────────────────────────────────────────┘
```

---

## 🔄 User Interaction Flow

```
1. User Age Check (age_months)
   ├── IF age_months is null/undefined → HIDE COMPONENT
   ├── IF age_months < 0 → HIDE COMPONENT
   ├── IF age_months > 36 → HIDE COMPONENT
   └── IF age_months 0-36 → SHOW COMPONENT
       ↓
2. Load Appropriate Level Data
   ├── 0-6 months → Level 1
   ├── 6-12 months → Level 2
   ├── 12-18 months → Level 3
   ├── 18-24 months → Level 4
   ├── 24-30 months → Level 5
   └── 30-36 months → Level 6
       ↓
3. Display Collapsed Header
   └── Click Header → EXPAND
       ↓
4. Show Domain Grid
   ├── Click Domain Card → Show Domain Activities
   │   └── Click Activity Card → Open Detail Modal
   │       ├── Click Start Activity → (Future: Navigate to activity)
   │       ├── Click Bookmark → (Future: Save to favorites)
   │       └── Click Close/Overlay → Close Modal
   │
   └── Click Close Domain → Return to Domain Grid
       ↓
5. Click Header Again → COLLAPSE
```

---

## 📦 Props & State

### Component Props
```javascript
// No props - reads from UserContext
const { profile } = useUser();
const ageMonths = profile?.age_months;
```

### Internal State
```javascript
const [isExpanded, setIsExpanded] = useState(false);
// Controls whether catalog content is visible

const [selectedDomain, setSelectedDomain] = useState(null);
// Stores currently selected domain key (physical, social, etc.)

const [selectedActivity, setSelectedActivity] = useState(null);
// Stores activity object for detail modal
```

### Data Flow
```
UserContext (profile.age_months)
    ↓
getActivitiesForAge(ageMonths)
    ↓
levelData { level, ageRange, description, domains }
    ↓
domains { physical: [...], social: [...], ... }
    ↓
selectedDomain
    ↓
domains[selectedDomain]
    ↓
selectedActivity
```

---

## 🎨 Styling Classes

### Main Container
- `.catalog-section` - Root container

### Header
- `.catalog-header` - Header container (golden gradient)
- `.catalog-header-content` - Flex container
- `.catalog-header-left` - Left content area
- `.catalog-title` - Main title with icon
- `.catalog-subtitle` - Level and count info
- `.catalog-description` - Description text
- `.catalog-toggle-btn` - Expand/collapse button

### Content Area
- `.catalog-content` - Expanded content container
- `.domain-grid` - Grid of domain cards
- `.domain-card` - Individual domain card
- `.domain-card-header` - Domain card header
- `.domain-icon` - Domain emoji icon
- `.domain-name` - Domain name text
- `.domain-description` - Domain description
- `.domain-stats` - Statistics area
- `.domain-activity-count` - Activity count badge

### Domain Activities
- `.domain-activities-section` - Selected domain section
- `.domain-activities-header` - Header with close button
- `.close-domain-btn` - Close button
- `.activities-list` - Grid of activity cards
- `.catalog-activity-card` - Individual activity card
- `.activity-card-top` - Card header
- `.activity-name` - Activity title
- `.activity-domain-badge` - Domain badge
- `.activity-milestone` - Milestone info
- `.activity-description` - Description text
- `.view-details-btn` - View details button

### Preview
- `.all-domains-preview` - Default preview area
- `.preview-title` - Preview title
- `.preview-subtitle` - Instructions text

### Modal
- `.activity-detail-overlay` - Modal overlay (backdrop)
- `.activity-detail-modal` - Modal container
- `.modal-close-btn` - Close button
- `.modal-header` - Modal header (purple gradient)
- `.modal-badges` - Badge container
- `.modal-badge` - Individual badge
- `.modal-body` - Modal content area
- `.modal-section` - Content section
- `.modal-footer` - Footer with buttons
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button

---

## 🌈 Color Scheme

### Domain Colors
```css
Physical:   #10B981 (Green)
Social:     #3B82F6 (Blue)
Emotional:  #EF4444 (Red)
Cognitive:  #8B5CF6 (Purple)
Aesthetic:  #F59E0B (Orange)
```

### Theme Colors
```css
Background: #FFF9E6, #FFE5B4 (Cream/Beige)
Primary:    #FFB84D, #F4A300, #FF8C42 (Golden)
Border:     #FFD700 (Gold)
Text:       #1A1A1A (Dark)
Secondary:  #5A5A5A (Gray)
```

### Gradients
```css
Header:     linear-gradient(135deg, #FFB84D 0%, #F4A300 50%, #FF8C42 100%)
Modal:      linear-gradient(135deg, #667EEA 0%, #764BA2 100%)
Button:     linear-gradient(135deg, #10B981 0%, #059669 100%)
Background: linear-gradient(135deg, #FFF9E6 0%, #FFE5B4 100%)
```

---

## 📱 Responsive Breakpoints

### Desktop (> 768px)
- Domain Grid: 3 columns (minmax(280px, 1fr))
- Activities List: 3 columns (minmax(320px, 1fr))
- Modal: 800px max-width
- Full features enabled

### Tablet (≤ 768px)
- Domain Grid: 2 columns
- Activities List: 2 columns
- Modal: 700px max-width
- Adjusted padding and spacing

### Mobile (≤ 480px)
- Domain Grid: 1 column
- Activities List: 1 column
- Modal: Full width with minimal padding
- Stacked buttons
- Reduced font sizes

---

## ✨ Animation Effects

### Entry Animations
- `fadeIn`: Opacity 0 → 1, translateY(10px) → 0
- `expandDown`: Max-height 0 → 5000px with opacity
- `slideInUp`: translateY(20px) → 0 with opacity
- `scaleIn`: scale(0.9) → 1 with opacity

### Hover Effects
- Scale and translate transformations
- Shadow intensity changes
- Color transitions
- Border color highlights

### Interaction Animations
- Button press: scale(0.98)
- Rotate on close: rotate(90deg)
- Slide on view details: translateX(4px)

---

## 🔌 Integration Points

### Current
```javascript
// In Home.jsx (line 11)
import MilestoneCatalogActivities from '../../components/child/MilestoneCatalogActivities';

// In Home.jsx (line 368)
<MilestoneCatalogActivities />
```

### Position in Dashboard
```
Dashboard Page
├── Top Navigation
├── Profile Quick Access
├── Dashboard Inner
│   ├── Hero Section
│   ├── AI Recommendations
│   ├── Dashboard Grid
│   │   ├── Learning Journey
│   │   ├── Daily Missions
│   │   ├── Explore Worlds
│   │   └── Statistics
│   │
│   └── ★ Milestone Catalog Activities ★  ← HERE
│
└── Assessment Modal
```

---

## 🎯 Data Structure Example

```javascript
// For a 3-month-old baby (Level 1: 0-6 Months)
{
  level: 1,
  ageRange: "0-6 Months",
  description: "Sensory awareness, early bonding, basic reflexes...",
  domains: {
    physical: [
      {
        milestone: "Lifts head briefly during tummy time",
        eActivity: "Tummy Time Tracker",
        description: "An animated screen with high-contrast...",
        gameIdea: "Head-Up Hero - A floating star rises...",
        aiIntegration: "AI camera via tablet detects head...",
        learningOutcome: "Baby develops neck muscle strength..."
      },
      // ... more activities
    ],
    social: [ /* activities */ ],
    emotional: [ /* activities */ ],
    cognitive: [ /* activities */ ],
    aesthetic: [ /* activities */ ]
  }
}
```

---

## 🚀 Quick Reference

### File Locations
- Component: `src/components/child/MilestoneCatalogActivities.jsx`
- Styles: `src/components/child/MilestoneCatalogActivities.css`
- Data: `src/data/milestoneActivitiesCatalog.js`
- Integration: `src/pages/child/Home.jsx` (lines 11, 368)

### Key Functions
- `getActivitiesForAge(ageMonths)` - Returns level data
- `setIsExpanded(bool)` - Toggle catalog visibility
- `setSelectedDomain(key)` - Select domain to view
- `setSelectedActivity(obj)` - Open activity detail modal

### Domain Keys
- `physical`, `social`, `emotional`, `cognitive`, `aesthetic`

### Age Ranges
- `"0-6"`, `"6-12"`, `"12-18"`, `"18-24"`, `"24-30"`, `"30-36"`

---

**Component Ready! 🎉**
