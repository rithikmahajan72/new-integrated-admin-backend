// Test script to check shipping charges API
import axios from 'axios';

const testShippingAPI = async () => {
  try {
    console.log('Testing shipping charges API...');
    
    // Get the current token from localStorage (assuming it's stored there)
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    console.log('Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    const response = await axios.get('http://localhost:8080/api/settings/shipping/charges', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response:', response.data);
    console.log('Status:', response.status);
    
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};

// Add this to window so we can call it from browser console
window.testShippingAPI = testShippingAPI;

export default testShippingAPI;
