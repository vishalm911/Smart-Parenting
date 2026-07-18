require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const existing = await User.findOne({ email: 'admin@spaceece.com' });
  if (existing) {
    console.log('✅ Admin already exists! Email: admin@spaceece.com');
    process.exit(0);
  }
  await User.create({
    email: 'admin@spaceece.com',
    password: 'Admin@1234',
    displayName: 'SpacECE Admin',
    role: 'admin',
    is_active: true,
  });
  console.log('✅ Admin created!');
  console.log('   Email:    admin@spaceece.com');
  console.log('   Password: Admin@1234');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});