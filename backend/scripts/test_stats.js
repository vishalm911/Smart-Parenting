const mongoose = require('mongoose');
require('../models/User');
require('../models/Score');

async function test() {
  await mongoose.connect('mongodb+srv://spaceece-admin:Asdf1234@spacece.clxh6qt.mongodb.net/?appName=SpacECE');
  const User = mongoose.model('User');
  const Session = mongoose.model('Session');
  
  const users = await User.find({});
  const sessions = await Session.find({ is_active: true });
  
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newSignups = users.filter((u) => {
    const ts = u.created_at ? new Date(u.created_at).getTime() : 0;
    return ts > oneWeekAgo;
  }).length;
  
  const pending = users.filter((u) => !u.is_active).length;
  
  console.log({
    totalUsers: users.length,
    activeSessions: sessions.length,
    newSignups,
    pending,
    usersDates: users.map(u => u.created_at)
  });
  process.exit(0);
}

test().catch(console.error);
