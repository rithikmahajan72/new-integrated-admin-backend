// Debug script to check shipping charges
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

// You'll need to get a valid token first
async function debugShipping() {
  try {
    console.log('Fetching shipping charges...');
    
    // First, let's see what's already in the database
    const response = await axios.get(`${BASE_URL}/settings/shipping/charges`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to add a real token
      }
    });
    
    console.log('Current shipping charges:', JSON.stringify(response.data, null, 2));
    
    // Test data that might cause conflict
    const testData = {
      country: "United States",
      region: "",
      deliveryCharge: 10.99,
      returnCharge: 5.99,
      estimatedDays: 3
    };
    
    console.log('\nTrying to create shipping charge with data:', testData);
    
    const createResponse = await axios.post(`${BASE_URL}/settings/shipping/charges`, testData, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to add a real token
      }
    });
    
    console.log('Create response:', createResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugShipping();
