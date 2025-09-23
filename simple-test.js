const axios = require('axios');

async function testAPI() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODYwMDgyOCwiZXhwIjoxNzU5MjA1NjI4fQ.8ed5uquFIHV5zpLs5LfiPmq0F9S1Dd96nThOP5kTm60';
    
    // Test bundling categories endpoint
    console.log('Testing Categories API...');
    const categoriesResponse = await axios.get('http://localhost:8080/api/items/bundles/categories', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    
    console.log('✅ Categories Response:');
    console.log('Categories count:', categoriesResponse.data.data.categories.length);
    console.log('Subcategories count:', categoriesResponse.data.data.subcategories.length);
    if (categoriesResponse.data.data.categories.length > 0) {
      console.log('First category:', categoriesResponse.data.data.categories[0]);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is the server running on port 8080?');
    }
  }
}

testAPI();
