// Test script to verify category API from frontend perspective
const testCategoryAPI = async () => {
  const API_BASE_URL = 'http://localhost:8080';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4NjYyNSwiZXhwIjoxNzU5MTkxNDI1fQ.9zqTP3wswjNF6JBUPM9dTfmkivy5BZK4AcOutacoivc';

  try {
    console.log('🧪 Testing category API from frontend perspective...');
    
    // Simulate axios request
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('📊 Full response:', data);
    console.log('📊 Response.data equivalent:', data);
    console.log('📊 Categories array:', data.data);
    console.log('📊 Number of categories:', data.data?.length || 0);

    if (data.success && Array.isArray(data.data)) {
      console.log('✅ Category API working correctly');
      data.data.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (ID: ${cat._id})`);
      });
    } else {
      console.log('❌ Unexpected response format');
    }

  } catch (error) {
    console.error('❌ Error testing category API:', error);
  }
};

// Also test localStorage setup
console.log('🔑 Current localStorage token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
console.log('👤 Current localStorage userData:', localStorage.getItem('userData') ? 'Present' : 'Missing');

// Set up localStorage if missing
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4NjYyNSwiZXhwIjoxNzU5MTkxNDI1fQ.9zqTP3wswjNF6JBUPM9dTfmkivy5BZK4AcOutacoivc';
const userData = '{"_id":"68cd71f3f31eb5d72a6c8e25","name":"Johyeeinteeety rtoe","phNo":"7036567890","isVerified":true,"isPhoneVerified":true,"isEmailVerified":true,"isAdmin":true,"isProfile":true,"email":"user@example.com","platform":null}';

localStorage.setItem('authToken', token);
localStorage.setItem('userData', userData);

console.log('✅ LocalStorage setup completed');

// Run the test
testCategoryAPI();
