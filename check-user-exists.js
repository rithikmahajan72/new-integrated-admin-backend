const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUserExists() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const problemUserId = '68be5958d23a0bec0384ff21';
    console.log(`\n🔍 Checking if user exists: ${problemUserId}`);
    
    const user = await User.findById(problemUserId);
    
    if (user) {
      console.log('✅ User found in database:');
      console.log({
        _id: user._id,
        name: user.name,
        email: user.email,
        phNo: user.phNo,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin
      });
    } else {
      console.log('❌ User NOT found in database');
      console.log('This explains the "Cannot read properties of null" error');
    }
    
    // Check if there are any users with similar phone numbers
    console.log('\n🔍 Checking for similar users...');
    const similarUsers = await User.find({ 
      $or: [
        { phNo: '+6234567890' },
        { phNo: '6234567890' },
        { email: 'user@example.com' }
      ]
    });
    
    console.log(`Found ${similarUsers.length} similar users:`);
    similarUsers.forEach(u => {
      console.log({
        _id: u._id,
        name: u.name,
        phNo: u.phNo,
        email: u.email,
        isAdmin: u.isAdmin
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUserExists();
