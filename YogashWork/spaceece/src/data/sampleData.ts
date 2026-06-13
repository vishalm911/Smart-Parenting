// Sample data for testing and development

export const sampleStories = [
  {
    id: 'lost-puppy',
    title: 'The Lost Puppy',
    introduction: 'You see a small puppy wandering alone in the park. It looks lost and scared.',
    illustration: '🐕',
    choicePoints: [
      {
        id: 'cp1',
        text: 'What do you do?',
        illustration: '🤔',
        options: [
          { id: 'o1', text: 'Try to comfort the puppy', nextPointId: 'cp2' },
          { id: 'o2', text: 'Look for the owner', nextPointId: 'cp3' },
          { id: 'o3', text: 'Call for help', endingId: 'e3' },
        ],
      },
    ],
    endings: [
      {
        id: 'e1',
        title: 'New Best Friend',
        text: 'You helped reunite the puppy with its owner, and they were so grateful!',
        illustration: '🎉',
        emotion: 'happy',
        moralLesson: 'Helping others brings joy to everyone.',
      },
    ],
  },
];

export const sampleColoringPages = [
  {
    id: 'cat1',
    title: 'Cute Cat',
    category: 'animals',
    imageUrl: '/coloring/cat.svg',
  },
  {
    id: 'tree1',
    title: 'Big Tree',
    category: 'nature',
    imageUrl: '/coloring/tree.svg',
  },
  {
    id: 'car1',
    title: 'Race Car',
    category: 'vehicles',
    imageUrl: '/coloring/car.svg',
  },
  {
    id: 'unicorn1',
    title: 'Magical Unicorn',
    category: 'fantasy',
    imageUrl: '/coloring/unicorn.svg',
  },
];

export const sampleFriendshipStories = [
  {
    id: 'fs1',
    scenario: 'Your friend drops all their books in the hallway. What do you do?',
    options: [
      {
        id: 'fs1-o1',
        text: 'Help them pick up the books',
        feedback: 'Great choice! Helping friends shows kindness.',
        empathyPoints: 10,
      },
      {
        id: 'fs1-o2',
        text: 'Ignore them and keep walking',
        feedback: 'Think about how your friend might feel. We can all help each other!',
        empathyPoints: 0,
      },
      {
        id: 'fs1-o3',
        text: 'Laugh at them',
        feedback: 'Laughing at someone when they need help can hurt their feelings.',
        empathyPoints: -5,
      },
    ],
  },
  {
    id: 'fs2',
    scenario: 'A new student joins your class and looks nervous. What do you do?',
    options: [
      {
        id: 'fs2-o1',
        text: 'Say hello and introduce yourself',
        feedback: 'Wonderful! Making new friends feel welcome is very kind.',
        empathyPoints: 10,
      },
      {
        id: 'fs2-o2',
        text: 'Wait for someone else to talk to them',
        feedback: 'You could be the one to make them feel welcome!',
        empathyPoints: 3,
      },
      {
        id: 'fs2-o3',
        text: 'Invite them to play with you at recess',
        feedback: 'Excellent! This is a very friendly thing to do.',
        empathyPoints: 15,
      },
    ],
  },
];

export const sampleKindnessChallenges = [
  {
    id: 'kc1',
    date: '2026-06-09',
    challenge: 'Help someone with something today',
    description: 'Look for someone who needs help and offer to help them.',
  },
  {
    id: 'kc2',
    date: '2026-06-10',
    challenge: 'Share something with a friend',
    description: 'Share a toy, snack, or your time with a friend today.',
  },
  {
    id: 'kc3',
    date: '2026-06-11',
    challenge: 'Say something nice to 3 people',
    description: 'Give compliments or say kind words to three different people.',
  },
  {
    id: 'kc4',
    date: '2026-06-12',
    challenge: 'Make someone smile today',
    description: 'Do something that will make someone happy.',
  },
  {
    id: 'kc5',
    date: '2026-06-13',
    challenge: 'Help clean up without being asked',
    description: 'Clean up your room or help with chores without waiting to be asked.',
  },
];

export const sampleDecisionScenarios = [
  {
    id: 'ds1',
    scenario: 'You find a toy that doesn\'t belong to you. What do you do?',
    illustration: '🧸',
    choices: [
      {
        id: 'ds1-c1',
        text: 'Return it to the lost and found',
        feedback: 'Great decision! Returning lost items is the right thing to do.',
        outcome: 'The owner was very happy to get their toy back!',
        decisionPoints: 10,
      },
      {
        id: 'ds1-c2',
        text: 'Keep it for yourself',
        feedback: 'Think about how you would feel if you lost your favorite toy.',
        outcome: 'The owner is still looking for their toy and feels sad.',
        decisionPoints: 0,
      },
      {
        id: 'ds1-c3',
        text: 'Ask a teacher for help',
        feedback: 'Good thinking! Adults can help us make good decisions.',
        outcome: 'The teacher helped find the owner. Great teamwork!',
        decisionPoints: 10,
      },
    ],
  },
];

export const sampleMemoryMatchCards = [
  { id: 1, icon: '🍎', color: '#FF6B6B' },
  { id: 2, icon: '🍌', color: '#FFD93D' },
  { id: 3, icon: '🍇', color: '#A78BFA' },
  { id: 4, icon: '🍓', color: '#FB7185' },
  { id: 5, icon: '🍊', color: '#FB923C' },
  { id: 6, icon: '🍑', color: '#FDBA74' },
];

export const samplePatternCategories = {
  shapes: ['⭐', '⬛', '🔵', '🔺', '💠', '🔶'],
  colors: ['🟥', '🟦', '🟩', '🟨', '🟪', '🟧'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
  numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'],
};

export const sampleSequences = [
  { level: 1, sequence: ['🔴', '🔵'], type: 'color' },
  { level: 2, sequence: ['🔴', '🔵', '🟢'], type: 'color' },
  { level: 3, sequence: ['⭐', '⬛', '⭐'], type: 'shape' },
  { level: 4, sequence: ['⭐', '⬛', '⭐', '⬛'], type: 'shape' },
  { level: 5, sequence: ['🔴', '🔵', '🟢', '🟡'], type: 'color' },
];

export const sampleAchievements = [
  {
    id: 'memory-master',
    name: 'Memory Master',
    description: 'Complete 10 memory match games',
    icon: '🧠',
    type: 'brain',
    requirement: { type: 'games_completed', count: 10, activityType: 'memory-match' },
  },
  {
    id: 'creative-artist',
    name: 'Creative Artist',
    description: 'Create 5 drawings',
    icon: '🎨',
    type: 'creativity',
    requirement: { type: 'creations_made', count: 5, activityType: 'drawing' },
  },
  {
    id: 'kind-heart',
    name: 'Kind Heart',
    description: 'Complete 7 day streak of kindness challenges',
    icon: '❤️',
    type: 'emotion',
    requirement: { type: 'streak', count: 7, activityType: 'kindness-challenge' },
  },
  {
    id: 'story-explorer',
    name: 'Story Explorer',
    description: 'Finish 3 different stories',
    icon: '📚',
    type: 'story',
    requirement: { type: 'stories_completed', count: 3 },
  },
  {
    id: 'problem-solver',
    name: 'Problem Solver',
    description: 'Solve 20 puzzles',
    icon: '🧩',
    type: 'brain',
    requirement: { type: 'puzzles_solved', count: 20 },
  },
  {
    id: 'empathy-hero',
    name: 'Empathy Hero',
    description: 'Score 100+ empathy points',
    icon: '🤝',
    type: 'emotion',
    requirement: { type: 'total_points', count: 100, pointType: 'empathy' },
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Login for 7 consecutive days',
    icon: '🔥',
    type: 'general',
    requirement: { type: 'login_streak', count: 7 },
  },
  {
    id: 'level-five',
    name: 'Level 5 Champion',
    description: 'Reach level 5',
    icon: '⭐',
    type: 'general',
    requirement: { type: 'level_reached', count: 5 },
  },
];

export const sampleMoodOptions = [
  { emoji: '😀', label: 'Very Happy', value: 'very-happy' },
  { emoji: '😃', label: 'Happy', value: 'happy' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😟', label: 'Sad', value: 'sad' },
  { emoji: '😢', label: 'Very Sad', value: 'very-sad' },
  { emoji: '😠', label: 'Angry', value: 'angry' },
];

export const sampleEmotionRecognition = [
  { id: 'er1', emotion: 'Happy', emoji: '😊', description: 'Feeling joy and contentment' },
  { id: 'er2', emotion: 'Sad', emoji: '😢', description: 'Feeling down or unhappy' },
  { id: 'er3', emotion: 'Angry', emoji: '😠', description: 'Feeling frustrated or mad' },
  { id: 'er4', emotion: 'Proud', emoji: '😌', description: 'Feeling accomplished' },
  { id: 'er5', emotion: 'Nervous', emoji: '😰', description: 'Feeling worried or anxious' },
  { id: 'er6', emotion: 'Excited', emoji: '🤩', description: 'Feeling energetic and thrilled' },
  { id: 'er7', emotion: 'Surprised', emoji: '😮', description: 'Feeling amazed or shocked' },
];

export const sampleStoryCreatorAssets = {
  characters: [
    { id: 'boy', name: 'Boy', emoji: '👦' },
    { id: 'girl', name: 'Girl', emoji: '👧' },
    { id: 'teacher', name: 'Teacher', emoji: '👨‍🏫' },
    { id: 'dog', name: 'Dog', emoji: '🐕' },
    { id: 'cat', name: 'Cat', emoji: '🐈' },
  ],
  backgrounds: [
    { id: 'school', name: 'School', emoji: '🏫' },
    { id: 'park', name: 'Park', emoji: '🌳' },
    { id: 'home', name: 'Home', emoji: '🏠' },
    { id: 'forest', name: 'Forest', emoji: '🌲' },
    { id: 'beach', name: 'Beach', emoji: '🏖️' },
  ],
  props: [
    { id: 'ball', name: 'Ball', emoji: '⚽' },
    { id: 'book', name: 'Book', emoji: '📚' },
    { id: 'tree', name: 'Tree', emoji: '🌳' },
    { id: 'bicycle', name: 'Bicycle', emoji: '🚲' },
    { id: 'flower', name: 'Flower', emoji: '🌸' },
  ],
};

// Helper function to get sample data
export const getSampleData = (type: string) => {
  switch (type) {
    case 'stories':
      return sampleStories;
    case 'coloringPages':
      return sampleColoringPages;
    case 'friendshipStories':
      return sampleFriendshipStories;
    case 'kindnessChallenges':
      return sampleKindnessChallenges;
    case 'decisionScenarios':
      return sampleDecisionScenarios;
    case 'memoryMatchCards':
      return sampleMemoryMatchCards;
    case 'patternCategories':
      return samplePatternCategories;
    case 'sequences':
      return sampleSequences;
    case 'achievements':
      return sampleAchievements;
    case 'moodOptions':
      return sampleMoodOptions;
    case 'emotionRecognition':
      return sampleEmotionRecognition;
    case 'storyCreatorAssets':
      return sampleStoryCreatorAssets;
    default:
      return null;
  }
};
