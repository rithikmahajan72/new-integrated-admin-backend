const axios = require('axios');

async function testStatusUpdate() {
  try {
    console.log('Testing status update API...');
    
    // First, test without authentication (should get 401)
    console.log('\n1. Testing without auth token:');
    try {
      const response = await axios.put('http://localhost:8080/api/items/68d52d8cab026efe468921b9/status', {
        status: 'published'
      });
      console.log('Response:', response.status, response.data);
    } catch (error) {
      console.log('Expected error:', error.response.status, error.response.data);
    }

    // Test with invalid token (should get 401)
    console.log('\n2. Testing with invalid auth token:');
    try {
      const response = await axios.put('http://localhost:8080/api/items/68d52d8cab026efe468921b9/status', {
        status: 'published'
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('Response:', response.status, response.data);
    } catch (error) {
      console.log('Expected error:', error.response.status, error.response.data);
    }

    // Test finding the item by ObjectId (should work now)
    console.log('\n3. Testing product lookup:');
    try {
      const response = await axios.get('http://localhost:8080/api/items/product/68d52d8cab026efe468921b9');
      console.log('Product found:', !!response.data.data);
      console.log('Product ID:', response.data.data.productId);
      console.log('Product _id:', response.data.data._id);
    } catch (error) {
      console.log('Error finding product:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testStatusUpdate();
