require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = await User.findOne({ email: 'admin@spaceece.com' }).select('+password');
  if (!admin) {
    console.log('❌ No admin user found in database!');
    process.exit(1);
  }
  console.log('Admin found:');
  console.log('ID:', admin._id);
  console.log('Email:', admin.email);
  console.log('Role:', admin.role);
  console.log('Is Active:', admin.is_active);

  const match = await admin.comparePassword('Admin@1234');
  console.log('Password match test with Admin@1234:', match);

  process.exit(0);
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
