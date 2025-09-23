const axios = require('axios');

async function testAPI() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODYwMDgyOCwiZXhwIjoxNzU5MjA1NjI4fQ.8ed5uquFIHV5zpLs5LfiPmq0F9S1Dd96nThOP5kTm60';
    
    console.log('Testing Categories API...');
    const categoriesResponse = await axios.get('http://localhost:8080/api/items/bundles/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Categories Response:', JSON.stringify(categoriesResponse.data, null, 2));
    
    console.log('\nTesting Items API...');
    const itemsResponse = await axios.get('http://localhost:8080/api/items/bundles/items', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Items Response:', JSON.stringify(itemsResponse.data, null, 2));
    
    // Also test regular categories for comparison
    console.log('\nTesting Regular Categories API...');
    const regularCategoriesResponse = await axios.get('http://localhost:8080/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Regular Categories Response:', JSON.stringify(regularCategoriesResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
