// Test the new image upload endpoints
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

// Create a simple test image file (1x1 pixel PNG)
const createTestImage = () => {
  // Base64 encoded 1x1 pixel transparent PNG
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGWjVYzAAAAABJRU5ErkJggg==';
  return Buffer.from(base64PNG, 'base64');
};

async function testImageUpload() {
  try {
    // Create test image
    const imageBuffer = createTestImage();
    
    // Create form data
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    // Test token (you may need to update this with a valid token)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMzYzU0ZmFhZTA4ZDRlYTcxYTAyODgiLCJuYW1lIjoiQWRtaW4gVXNlciIsInBoTm8iOiI5ODc2NTQzMjEwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6dHJ1ZSwiaXNQcm9maWxlIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB5b3JhYS5jb20iLCJwbGF0Zm9ybSI6bnVsbCwiX192IjowLCJpYXQiOjE3NTc2NjA1MzQsImV4cCI6MTc2MDI1MjUzNH0.JFac9CqhsadlHZX0_gtuyDNHWDzKBsEdiAo6QV5MxI4';

    console.log('Testing image upload endpoint...');
    
    const response = await axios.post('http://localhost:8080/api/items/upload-image', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Image upload successful!');
    console.log('Response:', response.data);
    console.log('Image URL:', response.data.data.imageUrl);

  } catch (error) {
    console.error('❌ Image upload failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testImageUpload();
