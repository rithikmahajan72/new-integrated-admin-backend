const axios = require('axios');

async function testOrphanedTokenScenario() {
  console.log('🧪 Testing orphaned token scenario...\n');
  
  // This is a sample token structure for the non-existent user
  // In real scenario, this would be the actual token from the client
  const problematicToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGJlNTk1OGQyM2EwYmVjMDM4NGZmMjEiLCJuYW1lIjoiSm9oeXVpbiBydG9lIiwicGhObyI6Iis2MjM0NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6ZmFsc2UsImlzUHJvZmlsZSI6ZmFsc2UsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInBsYXRmb3JtIjpudWxsLCJfX3YiOjAsImlhdCI6MTc1NzMwNTI1MywiZXhwIjoxNzU5ODk3MjUzfQ.5F6fZQVtTOHt6Xdf5NkOA9taEGqywjyJJuMWXuTihQw';
  
  try {
    console.log('📡 Making request to /api/user/getUser with orphaned token...');
    
    const response = await axios.get('http://localhost:8080/api/user/getUser', {
      headers: {
        'Authorization': `Bearer ${problematicToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('❌ Unexpected success - should have returned 404');
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('✅ Server responded with error (expected):');
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
      
      if (error.response.status === 404 && error.response.data.message === 'User not found') {
        console.log('🎉 SUCCESS: UserController properly handled orphaned token!');
      } else if (error.response.status === 500) {
        console.log('❌ FAILURE: Still getting 500 error - fix not working');
      }
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testOrphanedTokenScenario().catch(console.error);
