const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceece';

// ── Models ──────────────────────────────────────────────────────────────────
const { MathGame, PuzzleGame, LogicGame } = require('./models/Score');
const {
  Story, VocabularyGame, WordBuilder, PictureMatch,
  SoundMatch, ObjectRecognition, FluencyPassage,
  Challenge, ReadingActivity
} = require('./models/Literacy');
const { CognitiveSelGame, CognitiveStory } = require('./models/CognitiveSel');

// ── Cognitive & SEL Games Config ─────────────────────────────────────────────
const COGNITIVE_GAMES = [
  // --- Brain World ---
  {
    universe: 'brain',
    game_id: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cards and find matching pairs',
    emoji: '🃏',
    color: '#3B82F6',
    config: { card_emojis: ['🐶','🐱','🦁','🐯','🦊','🐺','🦝','🐻'] }
  },
  {
    universe: 'brain',
    game_id: 'sequence-builder',
    title: 'Sequence Builder',
    description: 'Remember and repeat the color pattern',
    emoji: '✨',
    color: '#8B5CF6',
    config: { colors: ['#3B82F6','#EF4444','#22C55E','#F59E0B'], emojis: ['🔵','🔴','🟢','🟡'] }
  },
  {
    universe: 'brain',
    game_id: 'pattern-finder',
    title: 'Pattern Finder',
    description: 'Find the odd emoji out in the grid',
    emoji: '🔍',
    color: '#F59E0B',
    config: { sets: [{ common: '🐱', odd: '🐶' }, { common: '🍎', odd: '🍏' }, { common: '🚗', odd: '🚲' }, { common: '🦁', odd: '🐯' }, { common: '🎈', odd: '🎨' }] }
  },
  {
    universe: 'brain',
    game_id: 'maze-challenge',
    title: 'Maze Challenge',
    description: 'Navigate the rocket safely to the planet',
    emoji: '🏝️',
    color: '#10B981',
    config: { layout: [[0, 0, 1, 0, 0], [1, 0, 1, 0, 1], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 1, 0]] }
  },
  // --- Creativity World ---
  {
    universe: 'creativity',
    game_id: 'drawing-pad',
    title: 'Drawing Pad',
    description: 'Create your own masterpiece with digital canvas',
    emoji: '🖌️',
    color: '#F2A100',
    config: { palette: ['#EF4444','#F59E0B','#22C55E','#3B82F6','#8B5CF6','#EC4899','#000000','#FFFFFF'], brush_sizes: [4, 8, 14, 22] }
  },
  {
    universe: 'creativity',
    game_id: 'story-creator',
    title: 'Story Creator',
    description: 'Build your own comic stories with stickers',
    emoji: '📖',
    color: '#EC4899',
    config: { stickers: ['🦁','🐸','🌈','🏰','🌸','🚀','⭐','🌊','🦋','🌺','🎈','🍭'] }
  },
  {
    universe: 'creativity',
    game_id: 'coloring-studio',
    title: 'Color Studio',
    description: 'Color beautiful illustrations digitally',
    emoji: '🎨',
    color: '#F7B733',
    config: {
      palette: ['#EF4444','#F59E0B','#22C55E','#3B82F6','#8B5CF6','#EC4899','#000000','#FFFFFF'],
      shapes: [
        { id: 'cat', emoji: '🐱', path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z' },
        { id: 'star', emoji: '⭐', path: 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' },
        { id: 'heart', emoji: '❤️', path: 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z' }
      ]
    }
  },
  {
    universe: 'creativity',
    game_id: 'gallery',
    title: 'My Gallery',
    description: "Explore all the masterpieces you've built!",
    emoji: '🖼️',
    color: '#8B5CF6',
    config: {}
  },
  // --- Emotion World ---
  {
    universe: 'emotion',
    game_id: 'emotion-checkin',
    title: 'Emotion Check-In',
    description: 'How are you feeling today?',
    emoji: '😊',
    color: '#F59E0B',
    config: {
      moods: [
        { emoji: '😊', label: 'Happy',    color: '#F59E0B', message: 'Wonderful! Keep that smile going! 🌟' },
        { emoji: '😐', label: 'Okay',     color: '#6B7280', message: "That's alright. Every day is different! 💪" },
        { emoji: '😢', label: 'Sad',      color: '#3B82F6', message: "It's okay to feel sad. You are loved! 💙" },
        { emoji: '😠', label: 'Angry',    color: '#EF4444', message: 'Take a deep breath. You can calm down! 🍃' },
        { emoji: '😨', label: 'Scared',   color: '#8B5CF6', message: "It's brave to share how you feel! 💜" },
        { emoji: '🤩', label: 'Excited',  color: '#EC4899', message: 'Your excitement is contagious! 🎉' }
      ]
    }
  },
  {
    universe: 'emotion',
    game_id: 'emotion-recognition',
    title: 'Emotion Recognition',
    description: 'Learn to identify different emotions',
    emoji: '👀',
    color: '#EF4444',
    config: {
      scenarios: [
        { face: '😊', correct: 'Happy', options: ['Happy', 'Sad', 'Angry', 'Scared'] },
        { face: '😢', correct: 'Sad', options: ['Happy', 'Sad', 'Excited', 'Okay'] },
        { face: '😠', correct: 'Angry', options: ['Happy', 'Angry', 'Excited', 'Scared'] },
        { face: '😨', correct: 'Scared', options: ['Sad', 'Okay', 'Scared', 'Happy'] },
        { face: '🤩', correct: 'Excited', options: ['Angry', 'Excited', 'Sad', 'Scared'] },
        { face: '😐', correct: 'Okay', options: ['Okay', 'Happy', 'Angry', 'Sad'] }
      ]
    }
  },
  {
    universe: 'emotion',
    game_id: 'friendship-stories',
    title: 'Friendship Stories',
    description: 'Make caring choices in social stories',
    emoji: '❤️',
    color: '#EC4899',
    config: {
      scenarios: [
        {
          scene: '🏫',
          story: 'Ananya sees a new student sitting alone at lunch. What should she do?',
          choices: [
            { text: '😊 Invite them to sit with her friends', correct: true, response: 'Wonderful! You made a new friend feel welcome! 🌟' },
            { text: '😐 Ignore them and continue eating', correct: false, response: 'Hmm, they might feel lonely. Try being more welcoming next time!' }
          ]
        },
        {
          scene: '🎨',
          story: 'Rohan accidentally breaks his friend\'s pencil. What should he do?',
          choices: [
            { text: 'Apologize and offer to replace it 🙏', correct: true, response: 'Great! Saying sorry and making it right is very kind! 💙' },
            { text: 'Pretend it didn\'t happen 🏃', correct: false, response: 'It\'s better to be honest and apologise. Friends trust each other!' }
          ]
        },
        {
          scene: '⚽',
          story: 'During a game, Priya\'s team loses. Her friend starts crying. What should Priya do?',
          choices: [
            { text: '🤗 Comfort them and say "We played well!"', correct: true, response: 'You are such a caring friend! 🤗' },
            { text: '😤 Tell them "Stop crying, it\'s just a game"', correct: false, response: 'Feelings matter! Comforting friends is always better.' }
          ]
        }
      ]
    }
  },
  {
    universe: 'emotion',
    game_id: 'kindness-challenge',
    title: 'Kindness Challenge',
    description: 'Complete daily acts of kindness',
    emoji: '🎁',
    color: '#8B5CF6',
    config: {
      acts: [
        { id: 1, text: 'Share a snack or treat with someone today 🍎', done: false },
        { id: 2, text: 'Give a warm hug or high-five to a family member 🤗', done: false },
        { id: 3, text: 'Say a big "Thank you" to a parent or teacher 🙏', done: false }
      ]
    }
  },
  {
    universe: 'emotion',
    game_id: 'decision-making',
    title: 'Decision Making',
    description: 'Practice making thoughtful choices',
    emoji: '💡',
    color: '#10B981',
    config: {
      scenarios: [
        {
          scenario: 'You want to play with the red truck, but your classmate is using it. What is the best choice?',
          choices: [
            { text: 'Wait for my turn patiently ⌛', correct: true, feedback: 'Excellent! Sharing and taking turns makes playtime fun for everyone!' },
            { text: 'Snatch the toy when they look away 😤', correct: false, feedback: 'Oops, snatching is not nice and could hurt their feelings.' }
          ]
        },
        {
          scenario: 'You find a pencil lying alone on the school hallway floor. What is the best choice?',
          choices: [
            { text: 'Give it to the classroom teacher 👩‍🏫', correct: true, feedback: 'Superb! Returning lost things is the honest and right thing to do!' },
            { text: 'Keep it and hide it in my pencil box 🎒', correct: false, feedback: 'Hmm, the person who lost it might be looking for it.' }
          ]
        }
      ]
    }
  }
];

const COGNITIVE_STORIES = [
  {
    story_id: 'lost-puppy',
    title: 'The Lost Puppy',
    emoji: '🐶',
    color: '#F59E0B',
    nodes: {
      start: {
        text: 'You find a little puppy sitting alone in the park, looking sad and lost. What do you do?',
        scene: '🌳🐶😢',
        choices: [
          { text: '🏠 Take the puppy home and look after it', next: 'home' },
          { text: '📣 Ask around the park if anyone lost it', next: 'ask' }
        ]
      },
      home: {
        text: 'You bring the puppy home and give it water and food. It wags its tail happily! What next?',
        scene: '🏠🐶💧🍖',
        choices: [
          { text: '📋 Make "Found Dog" posters and put them up', next: 'poster' },
          { text: '🤗 Keep it as your own pet', next: 'keep' }
        ]
      },
      ask: {
        text: 'You ask around and find an old lady crying — it\'s her puppy! She is so relieved. What do you say?',
        scene: '👵🐶😊',
        choices: [
          { text: '😊 "I\'m so glad I found it for you!"', next: 'kindEnding' },
          { text: '💰 "Can I have a reward please?"', next: 'rewardEnding' }
        ]
      },
      poster: {
        text: 'Your posters work! The owner calls and comes to pick up the puppy. They thank you gratefully.',
        scene: '📋✅🐶👨',
        ending: true,
        emotion: 'proud',
        message: '🌟 You are responsible and kind! The puppy is home safe.'
      },
      keep: {
        text: 'A few days later a child comes looking for their puppy. They had been crying all week.',
        scene: '👦😢🐶',
        choices: [
          { text: '❤️ Return the puppy to the child', next: 'returnEnding' },
          { text: '😐 Pretend you don\'t know about any puppy', next: 'dishonestEnding' }
        ]
      },
      kindEnding: {
        text: 'The old lady hugs you and calls you a true hero. She gives you a beautiful flower from her garden.',
        scene: '🌸👵🐶😊',
        ending: true,
        emotion: 'happy',
        message: '💛 Your kindness made the whole day brighter!'
      },
      rewardEnding: {
        text: 'The old lady gives you a coin but looks a little sad. True kindness doesn\'t need a reward!',
        scene: '💰👵🐶😐',
        ending: true,
        emotion: 'neutral',
        message: '🤔 Helping others feels even better when you don\'t expect anything back!'
      },
      returnEnding: {
        text: 'The child cries happy tears and hugs the puppy tightly. You feel a warm glow in your heart!',
        scene: '👦🐶❤️😊',
        ending: true,
        emotion: 'proud',
        message: '🌟 Doing the right thing always feels amazing. You\'re a hero!'
      },
      dishonestEnding: {
        text: 'The child leaves sad and the puppy misses its family. Honesty is always the right choice.',
        scene: '👦😢🚶',
        ending: true,
        emotion: 'sad',
        message: '💙 It\'s never too late to be honest. Next time, you\'ll know what to do!'
      }
    }
  },
  {
    story_id: 'magic-garden',
    title: 'The Magic Garden',
    emoji: '🌸',
    color: '#10B981',
    nodes: {
      start: {
        text: 'You discover a beautiful hidden garden full of glowing flowers. A fairy appears and offers you a gift. Which do you choose?',
        scene: '🌺✨🧚',
        choices: [
          { text: '🌱 A magic seed that grows a wish tree', next: 'wishTree' },
          { text: '📚 A book that teaches you all about plants', next: 'book' }
        ]
      },
      wishTree: {
        text: 'The tree grows! It can grant ONE wish. What do you wish for?',
        scene: '🌳✨⭐',
        choices: [
          { text: '🌍 A healthier planet with more trees', next: 'planetEnding' },
          { text: '🍭 All the sweets I want forever!', next: 'sweetsEnding' }
        ]
      },
      book: {
        text: 'You learn to grow beautiful gardens everywhere. Your village becomes the greenest in the country!',
        scene: '📚🌿🏡',
        ending: true,
        emotion: 'proud',
        message: '🌿 Knowledge is the greatest gift! You made the world greener.'
      },
      planetEnding: {
        text: 'Trees sprout across the world! Birds sing, rivers flow clear, and everyone breathes fresh air.',
        scene: '🌍🌳🐦💨',
        ending: true,
        emotion: 'happy',
        message: '🌟 You thought of everyone, not just yourself. True hero!'
      },
      sweetsEnding: {
        text: 'The sweets are delicious but you feel sick after too many. Perhaps a wish for others lasts longer!',
        scene: '🍭😋🤢',
        ending: true,
        emotion: 'neutral',
        message: '🍬 Sweet moments are better when shared! Think of others next time.'
      }
    }
  }
];

// ── Numeracy Games ──────────────────────────────────────────────────────────
const MATH_GAMES = [
  { title: 'Counting Fun',    description: 'Count colourful objects and learn numbers 1–10!', emoji: '🐻', ageRange: '1–3', age_group: '1–3', difficulty: 'easy',   gradient: 'bg-gradient-to-br from-[#FF9A56] via-[#F5A623] to-[#FFCC02]', type: 'counting', is_active: true },
  { title: 'Number Match',    description: 'Match numbers to the right group of objects!',   emoji: '🎯', ageRange: '4–6', age_group: '4–6', difficulty: 'medium', gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]',                type: 'matching', is_active: true },
  { title: 'Add & Subtract',  description: 'Master addition and subtraction!',               emoji: '➕', ageRange: '7–10',age_group: '7–10',difficulty: 'hard',   gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]',                type: 'arithmetic', is_active: true },
  { title: 'Times Tables',    description: 'Speed through multiplication timed rounds!',     emoji: '✖️', ageRange: '7–10',age_group: '7–10',difficulty: 'hard',   gradient: 'bg-gradient-to-br from-[#FF6B9D] via-[#F5A623] to-[#FFD180]', type: 'arithmetic', is_active: true },
  { title: 'Number Order',    description: 'Put numbers in the right order!',                emoji: '📊', ageRange: '4–6', age_group: '4–6', difficulty: 'medium', gradient: 'bg-gradient-to-br from-[#66BB6A] to-[#2EC4B6]',                type: 'ordering', is_active: true },
  { title: 'Shape Numbers',   description: 'Count the sides and corners of shapes!',         emoji: '🔷', ageRange: '1–3', age_group: '1–3', difficulty: 'easy',   gradient: 'bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF]',                type: 'counting', is_active: true },
];

const PUZZLE_GAMES = [
  { title: 'Shape Matching',   description: 'Match shapes to their shadows!',     emoji: '🔷', ageRange: '1–3', age_group: '1–3', difficulty: 'easy',   gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]', is_active: true },
  { title: 'Drag & Drop',      description: 'Drag pieces to complete pictures!',  emoji: '🧩', ageRange: '4–6', age_group: '4–6', difficulty: 'medium', gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]', is_active: true },
  { title: 'Logic Challenges', description: 'Solve tricky logic puzzles!',        emoji: '🧠', ageRange: '7–10',age_group: '7–10',difficulty: 'hard',   gradient: 'bg-gradient-to-br from-[#FF6B9D] via-[#F5A623] to-[#FFD180]', is_active: true },
  { title: 'Jigsaw Puzzles',   description: 'Put together beautiful pictures!',   emoji: '🖼️', ageRange: '4–6', age_group: '4–6', difficulty: 'medium', gradient: 'bg-gradient-to-br from-[#FF9A56] via-[#F5A623] to-[#FFCC02]', is_active: true },
  { title: 'Pattern Puzzles',  description: 'Find the missing piece!',            emoji: '🔮', ageRange: '4–6', age_group: '4–6', difficulty: 'medium', gradient: 'bg-gradient-to-br from-[#66BB6A] to-[#2EC4B6]', is_active: true },
  { title: 'Color Sorting',    description: 'Sort objects by color, shape, size!',emoji: '🎨', ageRange: '1–3', age_group: '1–3', difficulty: 'easy',   gradient: 'bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF]', is_active: true },
];

const LOGIC_GAMES = [
  { title: 'Pattern Spotter',  description: 'Find the pattern and choose what comes next!', emoji: '🔍', ageRange: '4–6', age_group: '4–6', difficulty: 'medium', gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]', is_active: true },
  { title: 'Sequence Builder',  description: 'Complete the number sequence correctly!',       emoji: '🧬', ageRange: '7–10',age_group: '7–10',difficulty: 'hard',   gradient: 'bg-gradient-to-br from-[#FF9A56] via-[#F5A623] to-[#FFCC02]', is_active: true },
  { title: 'Maze Runner',       description: 'Navigate through tricky mazes!',               emoji: '🏃', ageRange: '4–6', age_group: '4–6', difficulty: 'medium', gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]', is_active: true },
  { title: 'Multiply Quest',    description: 'Master multiplication through epic quests!',   emoji: '⚔️', ageRange: '7–10',age_group: '7–10',difficulty: 'hard',   gradient: 'bg-gradient-to-br from-[#FF6B9D] via-[#F5A623] to-[#FFD180]', is_active: true },
  { title: 'Story Problems',    description: 'Solve real-world math problems in stories!',   emoji: '📖', ageRange: '7–10',age_group: '7–10',difficulty: 'hard',   gradient: 'bg-gradient-to-br from-[#66BB6A] to-[#2EC4B6]', is_active: true },
  { title: "Odd One Out",       description: "Find the item that doesn't belong!",          emoji: '🎭', ageRange: '1–3', age_group: '1–3', difficulty: 'easy',   gradient: 'bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF]', is_active: true },
];

// ── Stories ─────────────────────────────────────────────────────────────────
const STORIES = [
  {
    title: "The Brave Lion", emoji: "🦁", author: "SpacECE Team",
    age_group: "4-6", difficulty: "Easy", language: "English", topic: "Courage",
    estimated_time: "5 min", is_featured: true, is_active: true,
    cover_gradient: "linear-gradient(135deg,#FFD180,#F5A623)",
    pages: [
      "Once upon a time, in a golden savanna, there lived a young lion named <strong>Leo</strong>. He had a big fluffy mane and bright golden eyes. Leo loved to explore, but every time he heard a loud sound, he would hide under the big tree. \"I am afraid,\" he whispered.",
      "One day, Leo found a little rabbit stuck in thorny bushes. The rabbit was crying. Leo felt scared too — but he also felt something else in his heart. \"I can help,\" he said softly. Carefully, he pulled the thorns away with his big paws. The rabbit was free!",
      "\"Thank you, brave lion!\" said the rabbit. Leo smiled. He didn't feel scared anymore. He felt <strong>warm and strong</strong> inside. That night, all the animals called him the Brave Lion of the Savanna. Leo learned that courage means helping even when you are afraid.",
    ],
    quiz: { question: "Why did Leo feel brave at the end?", options: ["He ran away","He helped the rabbit","He roared loudly","He won a race"], correct: 1 },
    quizzes: [
      { question: "Why did Leo feel brave at the end?", options: ["He ran away","He helped the rabbit","He roared loudly","He won a race"], correct: 1 }
    ]
  },
  {
    title: "Magic Forest", emoji: "🌿", author: "SpacECE Team",
    age_group: "7-10", difficulty: "Medium", language: "English", topic: "Nature",
    estimated_time: "8 min", is_featured: true, is_active: true,
    cover_gradient: "linear-gradient(135deg,#7EDFDA,#2EC4B6)",
    pages: [
      "Deep in the hills of Maharashtra, where mango trees grow tall and rivers sing, there was a <strong>magic forest</strong> that no one had entered for 100 years. Meera, a curious girl of nine, had heard stories from her grandmother. \"The forest knows your heart,\" Aaji would say.",
      "One monsoon morning, Meera followed a glowing butterfly into the trees. She came upon a river blocked by fallen logs. Animals on the other side could not reach the water. Without hesitation, Meera worked for an hour, moving log after log.",
      "When the water flowed free, the forest lit up around her. Fireflies formed a path to a tall banyan tree — full of seeds her village needed for next year's harvest. Meera brought the seeds home. The village said a magic forest helped them. Only Meera knew: <strong>the magic was inside her all along.</strong>",
    ],
    quiz: { question: "What did Meera find at the end of the firefly path?", options: ["A golden crown","Seeds for the village","A sleeping tiger","A magic lamp"], correct: 1 },
    quizzes: [
      { question: "What did Meera find at the end of the firefly path?", options: ["A golden crown","Seeds for the village","A sleeping tiger","A magic lamp"], correct: 1 }
    ]
  },
  {
    title: "Starry Night", emoji: "🌙", author: "SpacECE Team",
    age_group: "1-3", difficulty: "Beginner", language: "English", topic: "Bedtime",
    estimated_time: "3 min", is_featured: true, is_active: true,
    cover_gradient: "linear-gradient(135deg,#CE93D8,#7C4DFF)",
    pages: [
      "Look up! The sky is dark and full of <strong>shiny stars</strong>. ⭐⭐⭐ One star twinkles. Two stars wink. Three stars say goodnight!",
      "The moon is round and bright. 🌕 It lights the path for sleepy animals. The owl says <strong>hoo hoo</strong>. The cat says <strong>mew mew</strong>. Time for bed! 😴",
    ],
    quiz: { question: "What does the owl say?", options: ["Mew mew","Hoo hoo","Roar","Tweet"], correct: 1 },
    quizzes: [
      { question: "What does the owl say?", options: ["Mew mew","Hoo hoo","Roar","Tweet"], correct: 1 }
    ]
  },
  {
    title: "Neel the Fish", emoji: "🐟", author: "SpacECE Team",
    age_group: "4-6", difficulty: "Easy", language: "English", topic: "Adventure",
    estimated_time: "6 min", is_featured: false, is_active: true,
    cover_gradient: "linear-gradient(135deg,#FF8A65,#FF6B9D)",
    pages: [
      "Neel was a small blue fish who lived in a big river. Every day, he swam to the same rock and ate the same food. \"I wish I could see what is beyond the bend,\" he thought.",
      "One day, Neel swam past the bend — and found a whole new world! Colourful corals, dancing weeds, and friendly fish of every shape. \"Why did I wait so long?\" he laughed, doing a happy spin. 🐠",
    ],
    quiz: { question: "What did Neel find beyond the bend?", options: ["A waterfall","Colourful corals and new friends","A big shark","A fishing net"], correct: 1 },
    quizzes: [
      { question: "What did Neel find beyond the bend?", options: ["A waterfall","Colourful corals and new friends","A big shark","A fishing net"], correct: 1 }
    ]
  },
  {
    title: "Priya's Garden", emoji: "🌸", author: "SpacECE Team",
    age_group: "7-10", difficulty: "Hard", language: "हिंदी", topic: "Nature",
    estimated_time: "10 min", is_featured: false, is_active: true,
    cover_gradient: "linear-gradient(135deg,#66BB6A,#2EC4B6)",
    pages: [
      "प्रिया के घर के पीछे एक छोटा-सा बगीचा था। वहाँ गेंदे के फूल, तुलसी और मिर्च के पौधे थे। <strong>हर सुबह</strong> वह उन्हें पानी देती थी। एक दिन उसने देखा कि एक पौधा मुरझा रहा है।",
      "प्रिया ने किताब में पढ़ा — मिट्टी में पानी रुकना चाहिए। उसने पत्थर हटाए और ढीली मिट्टी डाली। तीन दिन बाद पौधा फिर हरा-भरा हो गया। <strong>ज्ञान ही असली खाद है।</strong>",
    ],
    quiz: { question: "प्रिया ने पौधे को ठीक करने के लिए क्या किया?", options: ["उसे काट दिया","ढीली मिट्टी डाली","पानी बंद किया","दूसरी जगह लगाया"], correct: 1 },
    quizzes: [
      { question: "प्रिया ने पौधे को ठीक करने के लिए क्या किया?", options: ["उसे काट दिया","ढीली मिट्टी डाली","पानी बंद किया","दूसरी जगह लगाया"], correct: 1 }
    ]
  },
  {
    title: "The Kind Elephant", emoji: "🐘", author: "SpacECE Team",
    age_group: "1-3", difficulty: "Beginner", language: "English", topic: "Kindness",
    estimated_time: "3 min", is_featured: false, is_active: true,
    cover_gradient: "linear-gradient(135deg,#B2EBF2,#4FC3F7)",
    pages: [
      "Ellie the elephant had a very long trunk. 🐘 She used it to pick up bananas, drink water, and wave hello to friends!",
      "One hot day, all the animals were thirsty. Ellie walked to the river and filled her trunk with water. She sprayed everyone! 💦 Everyone was cool and happy. Ellie smiled.",
    ],
    quiz: { question: "What did Ellie use her trunk for?", options: ["To fly","To pick up bananas and help friends","To dig holes","To make noise"], correct: 1 },
    quizzes: [
      { question: "What did Ellie use her trunk for?", options: ["To fly","To pick up bananas and help friends","To dig holes","To make noise"], correct: 1 }
    ]
  },
];

// ── Vocabulary ──────────────────────────────────────────────────────────────
const VOCABULARY = [
  { emoji: "🐘", word: "Elephant", meaning: "A large grey animal with a long trunk", definition: "A large grey animal with a long trunk", age_group: "4-6", difficulty: "easy" },
  { emoji: "🌺", word: "Flower",   meaning: "A colourful bloom on a plant",         definition: "A colourful bloom on a plant",         age_group: "4-6", difficulty: "easy" },
  { emoji: "🍎", word: "Apple",    meaning: "A round red or green fruit",            definition: "A round red or green fruit",            age_group: "1-3", difficulty: "easy" },
  { emoji: "🌊", word: "Wave",     meaning: "Water moving up and down",              definition: "Water moving up and down",              age_group: "7-10", difficulty: "medium" },
  { emoji: "🦋", word: "Butterfly",meaning: "A colourful flying insect",             definition: "A colourful flying insect",             age_group: "4-6", difficulty: "easy" },
  { emoji: "⛰️", word: "Mountain", meaning: "A very tall hill of land",              definition: "A very tall hill of land",              age_group: "7-10", difficulty: "hard" },
  { emoji: "🌙", word: "Moon",     meaning: "Earth's natural satellite",             definition: "Earth's natural satellite",             age_group: "1-3", difficulty: "easy" },
  { emoji: "🎨", word: "Colour",   meaning: "What we see in light — red, blue...",   definition: "What we see in light — red, blue...",   age_group: "4-6", difficulty: "easy" },
  { emoji: "🐸", word: "Frog",     meaning: "A green animal that jumps and croaks",  definition: "A green animal that jumps and croaks",  age_group: "1-3", difficulty: "easy" },
  { emoji: "🏠", word: "House",    meaning: "A building where people live",          definition: "A building where people live",          age_group: "1-3", difficulty: "easy" },
];

const WORD_BUILDER = [
  { emoji: "🐸",  word: "FROG",     letters: ["F", "R", "O", "G"],     hint: "It jumps and says ribbit 🐸" },
  { emoji: "🌸",  word: "FLOWER",   letters: ["F", "L", "O", "W", "E", "R"],   hint: "Pretty and found in gardens 🌸" },
  { emoji: "🦁",  word: "LION",     letters: ["L", "I", "O", "N"],     hint: "King of the jungle 🦁" },
  { emoji: "🍎",  word: "APPLE",    letters: ["A", "P", "P", "L", "E"],    hint: "A red juicy fruit 🍎" },
  { emoji: "🐟",  word: "FISH",     letters: ["F", "I", "S", "H"],     hint: "Lives in water 🐟" },
  { emoji: "🌙",  word: "MOON",     letters: ["M", "O", "O", "N"],     hint: "Shines at night 🌙" },
  { emoji: "🐘",  word: "ELEPHANT", letters: ["E", "L", "E", "P", "H", "A", "N", "T"], hint: "Has a long trunk 🐘" },
  { emoji: "🏠",  word: "HOUSE",    letters: ["H", "O", "U", "S", "E"],    hint: "Where we live 🏠" },
];

const SOUND_MATCH = [
  { prompt: "Who says  Moo ?",    spokenPrompt:"Who says Moo?",    animals: ["🐮","🐷","🐔","🐸"], labels: ["Cow","Pig","Hen","Frog"], word: "Cow", options: ["🐮","🐷","🐔","🐸"], answer: 0, sound:"Moo Moo Moo" },
  { prompt: "Who says  Woof ?",   spokenPrompt:"Who says Woof?",   animals: ["🐱","🐶","🐦","🐸"], labels: ["Cat","Dog","Bird","Frog"], word: "Dog", options: ["🐱","🐶","🐦","🐸"], answer: 1, sound:"Woof Woof Woof" },
  { prompt: "Who says  Meow ?",   spokenPrompt:"Who says Meow?",   animals: ["🐶","🦁","🐱","🐮"], labels: ["Dog","Lion","Cat","Cow"],  word: "Cat", options: ["🐶","🦁","🐱","🐮"], answer: 2, sound:"Meow Meow" },
  { prompt: "Who says  Cluck ?",  spokenPrompt:"Who says Cluck?",  animals: ["🦅","🐔","🐟","🐷"], labels: ["Eagle","Hen","Fish","Pig"], word: "Hen", options: ["🦅","🐔","🐟","🐷"], answer: 1, sound:"Cluck Cluck Cluck" },
  { prompt: "Who says  Roar ?",   spokenPrompt:"Who says Roar?",   animals: ["🐮","🦊","🦁","🐸"], labels: ["Cow","Fox","Lion","Frog"],  word: "Lion", options: ["🐮","🦊","🦁","🐸"], answer: 2, sound:"Roarrr" },
  { prompt: "Who says  Ribbit ?", spokenPrompt:"Who says Ribbit?", animals: ["🐸","🐟","🐛","🐢"], labels: ["Frog","Fish","Worm","Turtle"],word: "Frog", options: ["🐸","🐟","🐛","🐢"], answer: 0, sound:"Ribbit Ribbit" },
];

const OBJECT_RECOGNITION = [
  { object_name: "Apple",    items:["🍎","🐶","🚗","🏠"], options:["🍎","🐶","🚗","🏠"], answer:0 },
  { object_name: "Dog",      items:["🌸","🐶","⭐","🍎"], options:["🌸","🐶","⭐","🍎"], answer:1 },
  { object_name: "Star",     items:["🐘","🌊","⭐","🏠"], options:["🐘","🌊","⭐","🏠"], answer:2 },
  { object_name: "House",    items:["🐟","🌺","🎈","🏠"], options:["🐟","🌺","🎈","🏠"], answer:3 },
  { object_name: "Fish",     items:["🐟","🌸","🎨","🐘"], options:["🐟","🌸","🎨","🐘"], answer:0 },
  { object_name: "Elephant", items:["🐸","🏠","🐘","⭐"], options:["🐸","🏠","🐘","⭐"], answer:2 },
];

const FLUENCY = [
  {
    title:"The River", level:"Easy", age_group:"7-10",
    text:"The river flows down the mountain. It passes through forests and villages. Children play near the river. They catch fish and swim in summer. The river gives water to farmers for their crops. Without the river, the village would be dry.",
    wpm_goal: 60,
  },
  {
    title:"The Market", level:"Medium", age_group:"7-10",
    text:"Every Saturday, the market comes alive with colour and noise. Vendors sell vegetables, fruits, spices, and clothes. The smell of fresh flowers fills the air. Old women bargain loudly. Children run between stalls eating sugarcane. The market is the heart of the village.",
    wpm_goal: 60,
  },
  {
    title:"Technology Today", level:"Hard", age_group:"7-10",
    text:"Technology has changed the way we learn and communicate. Smartphones connect people across thousands of kilometres instantly. Students can now access libraries from their homes. However, too much screen time can affect health. Balancing technology with outdoor activity is important for growing children.",
    wpm_goal: 60,
  },
];

const CHALLENGES = [
  { title:"Alphabet Adventure", type:"alphabet",   description:"Trace animated letters and match uppercase to lowercase!",  age_group:"4-6",  difficulty:"medium", points: 10, is_active:true, icon:"🔤", color:"#F5A623" },
  { title:"Sound Matching",     type:"sound",      description:"Match animal sounds to the right animals. Listen carefully!", age_group:"1-3",  difficulty:"easy",   points: 15, is_active:true, icon:"🔊", color:"#2EC4B6" },
  { title:"Object Recognition", type:"object",     description:"Tap the correct object when you hear its name.",              age_group:"1-3",  difficulty:"easy",   points: 10, is_active:true, icon:"👆", color:"#7C4DFF" },
  { title:"Reading Fluency",    type:"fluency",    description:"Read a passage in 60 seconds. How many words can you read?",  age_group:"7-10", difficulty:"hard",   points: 20, is_active:true, icon:"⏱️", color:"#FF6B9D" },
  { title:"Story Comprehension", type:"comprehension",description:"Answer questions about stories you've read.",               age_group:"7-10", difficulty:"hard",   points: 15, is_active:true, icon:"❓", color:"#66BB6A" },
  { title:"Phonics Mode",        type:"phonics",   description:"Syllables highlighted as words are spoken. Great for phonics!",age_group:"4-6",  difficulty:"medium", points: 10, is_active:true, icon:"🅰️", color:"#FF8A65" },
];

async function seedCollection(colName, Model, docs) {
  console.log(`\n📦 Seeding [${colName}]...`);
  const count = await Model.countDocuments();
  if (count > 0) {
    console.log(`   ⚠️  Already has ${count} docs — skipping`);
    return;
  }
  await Model.insertMany(docs);
  console.log(`   Done — seeded ${docs.length} docs.`);
}

async function main() {
  console.log('Connecting to:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    await seedCollection('mathgames', MathGame, MATH_GAMES);
    await seedCollection('puzzlegames', PuzzleGame, PUZZLE_GAMES);
    await seedCollection('logicgames', LogicGame, LOGIC_GAMES);
    await seedCollection('stories', Story, STORIES);
    await seedCollection('vocabularygames', VocabularyGame, VOCABULARY);
    await seedCollection('wordbuilders', WordBuilder, WORD_BUILDER);
    await seedCollection('soundmatches', SoundMatch, SOUND_MATCH);
    await seedCollection('objectrecognitions', ObjectRecognition, OBJECT_RECOGNITION);
    await seedCollection('fluencypassages', FluencyPassage, FLUENCY);
    await seedCollection('challenges', Challenge, CHALLENGES);
    await seedCollection('cognitiveselgames', CognitiveSelGame, COGNITIVE_GAMES);
    await seedCollection('cognitivestories', CognitiveStory, COGNITIVE_STORIES);

    console.log('\n🎉 Database seeding complete!');
  } catch (err) {
    console.error('Error during seeding:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
