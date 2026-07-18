const mongoose = require('mongoose');
require('../models/User');
require('../models/Score');
require('../models/ChildProfile');

async function test() {
  await mongoose.connect('mongodb+srv://spaceece-admin:Asdf1234@spacece.clxh6qt.mongodb.net/?appName=SpacECE');
  const User = mongoose.model('User');
  const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  // Calculate User Retention
  const Session = mongoose.model('Session');
  const totalUsers = await User.countDocuments();
  const distinctUsersInSessions = await Session.distinct('user_id');
  const userRetention = totalUsers > 0 
    ? Math.min(100, Math.round((distinctUsersInSessions.length / totalUsers) * 100)) 
    : 0;

  // Calculate Activity Rate
  const ChildProfile = mongoose.model('ChildProfile');
  const ActivityScore = mongoose.model('ActivityScore');
  const totalChildren = await ChildProfile.countDocuments();
  const childrenWithScores = await ActivityScore.distinct('child_id');
  const activityRate = totalChildren > 0 
    ? Math.min(100, Math.round((childrenWithScores.length / totalChildren) * 100)) 
    : 0;

  // Calculate Badge Unlocks
  const childrenWithBadges = await ChildProfile.countDocuments({ 'badges.0': { $exists: true } });
  const badgeUnlocksRate = totalChildren > 0 
    ? Math.min(100, Math.round((childrenWithBadges / totalChildren) * 100)) 
    : 0;

  console.log({
    mongoStatus,
    userRetention,
    activityRate,
    badgeUnlocksRate
  });
  process.exit(0);
}

test().catch(console.error);
