require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ChildProfile = require('../models/ChildProfile');
const { ActivityScore } = require('../models/Score');

const MONGODB_URI = process.env.MONGODB_URI;

const boysNames = ['Aarav', 'Arjun', 'Kabir', 'Karan', 'Rohan', 'Vihaan', 'Aditya', 'Krishna', 'Sai', 'Dev', 'Vivaan', 'Reyansh', 'Ishaan', 'Ayaan', 'Atharv', 'Shaurya', 'Aarush', 'Rudra'];
const girlsNames = ['Aanya', 'Diya', 'Ananya', 'Priya', 'Riya', 'Ira', 'Myra', 'Kavya', 'Saanvi', 'Kiara', 'Aadhya', 'Anika', 'Aahana', 'Prisha', 'Suhana', 'Meera', 'Sneha', 'Avani'];
const parentLastNames = ['Sharma', 'Devi', 'Singh', 'Patel', 'Gupta', 'Verma', 'Kumar', 'Reddy', 'Rao', 'Nair', 'Joshi', 'Mehta', 'Sen', 'Das', 'Roy', 'Choudhury'];
const parentFirstNames = ['Rajesh', 'Suresh', 'Amit', 'Ramesh', 'Vijay', 'Sunita', 'Anita', 'Pooja', 'Meena', 'Rakesh', 'Sanjay', 'Geeta', 'Kiran', 'Deepak', 'Vikram', 'Neha'];

const domains = ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'];

const activitiesByDomain = {
  Literacy: ['Letter Tracing Safari', 'Phonics Matching Fun', 'Sight Words Collector', 'Rhyme Builder'],
  Numeracy: ['Count the Apples', 'Geometry Shape Puzzle', 'Pattern Quest', 'Number Line Runner'],
  Cognitive: ['Memory Matching Cards', 'Hidden Object Finder', 'Logic Sorting Puzzle', 'Path Navigator'],
  Creativity: ['Dynamic Mosaic Art', 'Free Paint Sandbox', 'Block Builder Space', 'Musical Chords Sandbox'],
  Emotional: ['Emotion Recognition Cards', 'Sharing & Caring Story', 'Breathing Bubble Coach', 'Social Scenario Choices']
};

const activityTypeMap = {
  'Letter Tracing Safari': 'phonics',
  'Phonics Matching Fun': 'phonics',
  'Sight Words Collector': 'word_builder',
  'Rhyme Builder': 'fluency',
  'Count the Apples': 'numeracy',
  'Geometry Shape Puzzle': 'puzzle',
  'Pattern Quest': 'logic',
  'Number Line Runner': 'numeracy',
  'Memory Matching Cards': 'logic',
  'Hidden Object Finder': 'puzzle',
  'Logic Sorting Puzzle': 'logic',
  'Path Navigator': 'logic',
  'Dynamic Mosaic Art': 'puzzle',
  'Free Paint Sandbox': 'puzzle',
  'Block Builder Space': 'puzzle',
  'Musical Chords Sandbox': 'puzzle',
  'Emotion Recognition Cards': 'literacy',
  'Sharing & Caring Story': 'story',
  'Breathing Bubble Coach': 'literacy',
  'Social Scenario Choices': 'story'
};

async function seed() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully!');

  console.log('Cleaning up old demo data...');
  const demoUsers = await User.find({ email: /demo_parent/ });
  const demoUserIds = demoUsers.map(u => u._id);
  await User.deleteMany({ _id: { $in: demoUserIds } });
  
  const demoChildren = await ChildProfile.find({ parent_uid: { $in: demoUserIds } });
  const demoChildrenIds = demoChildren.map(c => c._id);
  await ChildProfile.deleteMany({ _id: { $in: demoChildrenIds } });
  await ActivityScore.deleteMany({ child_id: { $in: demoChildrenIds } });
  
  const createdParents = [];
  const createdChildren = [];
  let createdScoresCount = 0;

  const passwordHash = await bcrypt.hash('Parent@1234', 12);

  console.log('Generating 25 parents and active children profiles...');
  for (let i = 1; i <= 25; i++) {
    const parentFirstName = parentFirstNames[Math.floor(Math.random() * parentFirstNames.length)];
    const parentLastName = parentLastNames[Math.floor(Math.random() * parentLastNames.length)];
    const parentEmail = `demo_parent${i}@spaceece.com`;
    const parentName = `${parentFirstName} ${parentLastName}`;

    const parentUser = await User.create({
      email: parentEmail,
      password: passwordHash, // use prehashed password to save execution time
      displayName: parentName,
      role: 'parent',
      emailVerified: true,
      linked_child_profiles: []
    });

    createdParents.push(parentUser);

    const numChildren = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 children
    const childIdsForParent = [];

    for (let c = 1; c <= numChildren; c++) {
      const isBoy = Math.random() > 0.5;
      const childFirstName = isBoy 
        ? boysNames[Math.floor(Math.random() * boysNames.length)] 
        : girlsNames[Math.floor(Math.random() * girlsNames.length)];
      const childName = `${childFirstName} ${parentLastName}`;
      const childAge = Math.floor(Math.random() * 7) + 3; // 3 to 9 years old
      const childGrade = childAge <= 4 ? 'Nursery' : childAge <= 5 ? 'LKG' : childAge <= 6 ? 'UKG' : `Grade ${childAge - 5}`;
      const childUsername = `${childFirstName.toLowerCase()}_demo_${Math.floor(Math.random() * 1000)}`;

      const childProfile = new ChildProfile({
        parent_uid: parentUser._id,
        name: childName,
        username: childUsername,
        age: childAge,
        avatar: isBoy ? ['👦', '🧑', '🦁', '🦁', '🤖'][Math.floor(Math.random() * 5)] : ['👧', '👩', '🦄', '🐱', '🦋'][Math.floor(Math.random() * 5)],
        grade: childGrade,
        pin: '1234',
        xp: Math.floor(Math.random() * 3500) + 300,
        stars: Math.floor(Math.random() * 100) + 10,
        coins: Math.floor(Math.random() * 500) + 40,
        dayStreak: Math.floor(Math.random() * 6) + 1,
        progress: {
          mathWorld: Math.floor(Math.random() * 70) + 10,
          puzzleWorld: Math.floor(Math.random() * 70) + 10,
          numberAdventure: Math.floor(Math.random() * 70) + 10,
          logicIsland: Math.floor(Math.random() * 70) + 10,
          readingWorld: Math.floor(Math.random() * 70) + 10,
          storyWorld: Math.floor(Math.random() * 70) + 10,
          vocabularyZone: Math.floor(Math.random() * 70) + 10,
          languageChallenges: Math.floor(Math.random() * 70) + 10,
        }
      });

      await childProfile.save();
      createdChildren.push(childProfile);
      childIdsForParent.push(childProfile._id);

      const numScores = Math.floor(Math.random() * 7) + 4; // 4 to 10 scores
      
      // Determine if this child is flagged to test dashboard warnings
      const isLiteracyFlagged = createdChildren.length === 3 || createdChildren.length === 12;
      const isNumeracyFlagged = createdChildren.length === 7 || createdChildren.length === 18;
      const isInactiveFlagged = createdChildren.length === 5 || createdChildren.length === 22;

      for (let s = 1; s <= numScores; s++) {
        let domain = domains[Math.floor(Math.random() * domains.length)];
        
        if (isLiteracyFlagged) domain = 'Literacy';
        if (isNumeracyFlagged) domain = 'Numeracy';

        const acts = activitiesByDomain[domain];
        const activityName = acts[Math.floor(Math.random() * acts.length)];
        const activityType = activityTypeMap[activityName] || 'puzzle';

        let accuracy = Math.floor(Math.random() * 41) + 60; // 60% to 100%
        let score = Math.floor((accuracy / 100) * 100);

        if ((isLiteracyFlagged && s <= 3) || (isNumeracyFlagged && s <= 3)) {
          accuracy = Math.floor(Math.random() * 20) + 40; // 40% to 59% (remediation warning)
          score = Math.floor((accuracy / 100) * 100);
        }

        let scoreDate = new Date();
        if (isInactiveFlagged) {
          scoreDate.setDate(scoreDate.getDate() - (Math.floor(Math.random() * 5) + 6)); // 6-10 days ago (inactivity warning)
        } else {
          scoreDate.setDate(scoreDate.getDate() - (numScores - s));
        }

        await ActivityScore.create({
          child_id: childProfile._id,
          activity_id: `act_${domain.toLowerCase()}_${s}`,
          activity_type: activityType,
          score: score,
          accuracy: accuracy,
          time_spent: Math.floor(Math.random() * 180) + 45,
          attempts: Math.random() > 0.8 ? 2 : 1,
          username: childProfile.username,
          display_name: childProfile.name,
          date: scoreDate
        });
        createdScoresCount++;
      }
    }

    await User.findByIdAndUpdate(parentUser._id, { $set: { linked_child_profiles: childIdsForParent } });
  }

  console.log(`Seeding complete:`);
  console.log(`- Created ${createdParents.length} Parent accounts.`);
  console.log(`- Created ${createdChildren.length} Child profiles.`);
  console.log(`- Seeded ${createdScoresCount} play/assessment score logs.`);
  console.log(`- Triggered 4 low accuracy warning flags (remedial alerts).`);
  console.log(`- Triggered 2 inactive warnings (days offline alerts).`);
  console.log(`Credentials: demo_parent1@spaceece.com to demo_parent25@spaceece.com (Password: Parent@1234)`);
  
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
