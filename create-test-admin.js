const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yoraa1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestAdmin() {
  try {
    // Create admin user with the same ID from the JWT token
    const adminUser = new User({
      _id: new mongoose.Types.ObjectId('68c354d5d432b628b488a762'),
      name: 'Test Admin User',
      email: 'admin@test.com',
      phNo: '1234567890',
      isVerified: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      isAdmin: true,
      isProfile: true,
      password: 'hashedpassword', // This won't be used for JWT auth
    });

    await adminUser.save();
    console.log('✅ Test admin user created successfully');
    console.log('User ID:', adminUser._id);
    console.log('Is Admin:', adminUser.isAdmin);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.log('✅ Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
    process.exit(1);
  }
}

createTestAdmin();
