// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role?: 'child' | 'parent' | 'admin';
  avatar?: string;
  level: number;
  xp: number;
  totalScore: number;
  cognitiveScore?: number;
  emotionalScore?: number;
  streak: number;
  parentId?: string;
  children?: string[];
  lastLoginDate: string;
  createdAt: string;
  updatedAt: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  userId: string;
  type: 'brain' | 'creativity' | 'emotion' | 'story';
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: string;
}

// Brain World Types
export interface BrainActivity {
  id: string;
  userId: string;
  activityType: 'memory-match' | 'sequence-builder' | 'pattern-finder' | 'maze-challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  accuracy: number;
  attempts: number;
  completionTime: number;
  level: number;
  createdAt: string;
}

export interface MemoryMatchResult {
  matches: number;
  attempts: number;
  time: number;
  accuracy: number;
}

export interface SequenceBuilderResult {
  level: number;
  correctSequences: number;
  errors: number;
  completionTime: number;
}

export interface PatternFinderResult {
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  category: 'shapes' | 'colors' | 'animals' | 'numbers';
}

export interface MazeChallengeResult {
  level: number;
  wrongTurns: number;
  completionTime: number;
  successRate: number;
}

// Emotion World Types
export interface EmotionActivity {
  id: string;
  userId: string;
  activityType: 'emotion-checkin' | 'emotion-recognition' | 'friendship-story' | 'kindness-challenge' | 'decision-making';
  score: number;
  empathyScore?: number;
  decisionScore?: number;
  createdAt: string;
}

export interface MoodCheckin {
  id: string;
  userId: string;
  mood: 'very-happy' | 'happy' | 'neutral' | 'okay' | 'sad' | 'very-sad' | 'angry';
  date: string;
  time: string;
  note?: string;
}

export interface FriendshipStory {
  id: string;
  scenario: string;
  options: FriendshipOption[];
}

export interface FriendshipOption {
  id: string;
  text: string;
  feedback: string;
  empathyPoints: number;
}

// Story World Types
export interface StoryActivity {
  id: string;
  userId: string;
  storyId: string;
  endingsDiscovered: string[];
  comprehensionScore: number;
  readingScore: number;
  completionPercentage: number;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  introduction: string;
  illustration: string;
  choicePoints: ChoicePoint[];
  endings: StoryEnding[];
}

export interface ChoicePoint {
  id: string;
  text: string;
  illustration: string;
  options: StoryOption[];
}

export interface StoryOption {
  id: string;
  text: string;
  nextPointId?: string;
  endingId?: string;
}

export interface StoryEnding {
  id: string;
  title: string;
  text: string;
  illustration: string;
  emotion: 'happy' | 'proud' | 'curious';
  moralLesson: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: string | boolean;
}

// Creativity World Types
export interface Drawing {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl: string;
  type: 'drawing' | 'coloring' | 'story';
  createdAt: string;
}

export interface ColoringPage {
  id: string;
  title: string;
  category: 'animals' | 'nature' | 'vehicles' | 'fantasy';
  imageUrl: string;
}

export interface StoryCreation {
  id: string;
  userId: string;
  panels: StoryPanel[];
  createdAt: string;
}

export interface StoryPanel {
  id: string;
  background: string;
  characters: Character[];
  props: Prop[];
  caption: string;
  order: number;
}

export interface Character {
  id: string;
  type: 'boy' | 'girl' | 'teacher' | 'animal-friend';
  position: { x: number; y: number };
  scale: number;
}

export interface Prop {
  id: string;
  type: 'ball' | 'book' | 'tree' | 'bicycle';
  position: { x: number; y: number };
  scale: number;
}

// Challenge Types
export interface ChallengeEntry {
  id: string;
  userId: string;
  challengeType: string;
  response: string;
  date: string;
  streak: number;
}

// Progress Types
export interface ProgressSummary {
  userId: string;
  brainWorld: WorldProgress;
  creativityWorld: WorldProgress;
  emotionWorld: WorldProgress;
  storyWorld: WorldProgress;
  overallProgress: number;
  totalActivitiesCompleted: number;
  lastUpdated: string;
}

export interface WorldProgress {
  completionPercentage: number;
  score: number;
  lastActivity: string;
  highestLevel: number;
  accuracy: number;
  activitiesCompleted: number;
}

// UI Types
export interface WorldCardData {
  id: string;
  title: string;
  theme: string;
  icon: string;
  color: string;
  progress: number;
  score: number;
  lastActivity?: string;
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// Game State Types
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  timeElapsed: number;
}

// Admin Types
export interface CognitiveGame {
  id: string;
  type: 'memory' | 'sequence' | 'pattern' | 'maze';
  title: string;
  description: string;
  ageGroup: '5-7' | '8-10' | '11-12';
  difficulty: 'easy' | 'medium' | 'hard';
  contentData: any;
  pointsReward: number;
  xpReward: number;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CreativityActivity {
  id: string;
  type: 'drawing' | 'coloring' | 'story-creation';
  title: string;
  description: string;
  ageGroup: '5-7' | '8-10' | '11-12';
  templateUrl?: string;
  thumbnailUrl?: string;
  category: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface EmotionScenario {
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
  createdAt: string;
}

export interface CognitiveScore {
  id: string;
  childId: string;
  gameId: string;
  gameType: string;
  score: number;
  accuracy: number;
  attempts: number;
  timeSpent: number;
  completed: boolean;
  date: string;
}

export interface EmotionScore {
  id: string;
  childId: string;
  activityId: string;
  activityType: string;
  emotionTag: string;
  score: number;
  correct: boolean;
  choicesMade: string[];
  date: string;
}

export interface AdminStats {
  totalUsers: number;
  totalChildren: number;
  totalParents: number;
  totalGames: number;
  totalActivities: number;
  activeUsers: number;
  avgCognitiveScore: number;
  avgEmotionalScore: number;
}

export interface UploadedAsset {
  id: string;
  type: 'coloring-template' | 'story-scene' | 'character' | 'prop';
  title: string;
  url: string;
  thumbnailUrl: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
}
