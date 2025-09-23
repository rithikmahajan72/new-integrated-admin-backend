// Set admin token in browser localStorage for testing
// Run this in the browser console at localhost:3000

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU5OTU5NywiZXhwIjoxNzU5MjA0Mzk3fQ.Y5Xl_Rv7BxVVvlIbQdlnSGlzpXOW-vqVU8lN0ylD4CE';

const userData = {
  "_id": "68cd71f3f31eb5d72a6c8e25",
  "name": "Johyeeinteeety rtoe",
  "phNo": "7036567890",
  "isVerified": true,
  "isPhoneVerified": true,
  "isEmailVerified": true,
  "isAdmin": true,
  "isProfile": true,
  "email": "user@example.com",
  "platform": null
};

// Set the tokens
localStorage.setItem('authToken', adminToken);
localStorage.setItem('userData', JSON.stringify(userData));

console.log('✅ Admin tokens set successfully!');
console.log('🔄 Please refresh the page to apply changes.');

// Check if tokens are set
console.log('Auth Token set:', !!localStorage.getItem('authToken'));
console.log('User Data set:', !!localStorage.getItem('userData'));
