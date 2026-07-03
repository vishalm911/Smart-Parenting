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

    console.log('\n🎉 Database seeding complete!');
  } catch (err) {
    console.error('Error during seeding:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
