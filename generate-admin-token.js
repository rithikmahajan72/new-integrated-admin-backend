const jwt = require('jsonwebtoken');
require('dotenv').config();

// Your actual admin user data from the database
const adminUser = {
  _id: "68cd71f3f31eb5d72a6c8e25",
  name: "Johyeeinteeety rtoe",
  phNo: "7036567890",
  isVerified: true,
  isPhoneVerified: true,
  isEmailVerified: true,
  isAdmin: true,
  isProfile: true,
  email: "user@example.com",
  platform: null
};

// Generate JWT token using the same secret and format as your backend
const generateToken = (user) => {
  return jwt.sign(
    user,
    process.env.SECRET_KEY || 'your-secret-key-here', // Make sure this matches your .env
    { expiresIn: '7d' }
  );
};

const token = generateToken(adminUser);

console.log('🔑 Generated Admin Token:');
console.log(token);
console.log('\n📋 Copy this token and use it in your frontend:');
console.log(`localStorage.setItem('authToken', '${token}');`);
console.log('\n👤 Admin User Data:');
console.log(JSON.stringify(adminUser, null, 2));
console.log('\n📝 Full localStorage setup:');
console.log(`localStorage.setItem('authToken', '${token}');`);
console.log(`localStorage.setItem('userData', '${JSON.stringify(adminUser)}');`);
localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4MzU3MSwiZXhwIjoxNzU5MTg4MzcxfQ.0ElD25i-I3qs09tnKSxq_gGfhhTokKR3GFVmiYbXk6U');

localStorage.setItem('userData', '{"_id":"68cd71f3f31eb5d72a6c8e25","name":"Johyeeinteeety rtoe","phNo":"7036567890","isVerified":true,"isPhoneVerified":true,"isEmailVerified":true,"isAdmin":true,"isProfile":true,"email":"user@example.com","platform":null}');localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4MzU3MSwiZXhwIjoxNzU5MTg4MzcxfQ.0ElD25i-I3qs09tnKSxq_gGfhhTokKR3GFVmiYbXk6U');

localStorage.setItem('userData', '{"_id":"68cd71f3f31eb5d72a6c8e25","name":"Johyeeinteeety rtoe","phNo":"7036567890","isVerified":true,"isPhoneVerified":true,"isEmailVerified":true,"isAdmin":true,"isProfile":true,"email":"user@example.com","platform":null}');localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4MzU3MSwiZXhwIjoxNzU5MTg4MzcxfQ.0ElD25i-I3qs09tnKSxq_gGfhhTokKR3GFVmiYbXk6U');

localStorage.setItem('userData', '{"_id":"68cd71f3f31eb5d72a6c8e25","name":"Johyeeinteeety rtoe","phNo":"7036567890","isVerified":true,"isPhoneVerified":true,"isEmailVerified":true,"isAdmin":true,"isProfile":true,"email":"user@example.com","platform":null}');localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4MzU3MSwiZXhwIjoxNzU5MTg4MzcxfQ.0ElD25i-I3qs09tnKSxq_gGfhhTokKR3GFVmiYbXk6U');

localStorage.setItem('userData', '{"_id":"68cd71f3f31eb5d72a6c8e25","name":"Johyeeinteeety rtoe","phNo":"7036567890","isVerified":true,"isPhoneVerified":true,"isEmailVerified":true,"isAdmin":true,"isProfile":true,"email":"user@example.com","platform":null}');