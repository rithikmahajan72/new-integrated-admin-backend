// Frontend API debug script
// Open browser console and run this to debug the issue

console.log('=== YORAA FRONTEND DEBUG ===');

// Check if we're in the right context
console.log('Current URL:', window.location.href);

// Check Redux store state
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log('Redux DevTools available');
  // Try to access the store (this depends on how Redux is exposed)
  try {
    const state = window.store ? window.store.getState() : 'Store not exposed on window';
    console.log('Redux State:', state);
  } catch (e) {
    console.log('Could not access Redux state:', e.message);
  }
} else {
  console.log('Redux DevTools not available');
}

// Check localStorage for tokens
console.log('Auth Token:', localStorage.getItem('authToken'));

// Check if API base URL is correct
console.log('Base URL from environment:', import.meta ? import.meta.env.VITE_API_BASE_URL : 'Not available');

// Test API call directly
async function testDirectAPICall() {
  try {
    console.log('Testing direct API call to /api/items...');
    const response = await fetch('http://localhost:8080/api/items');
    const data = await response.json();
    console.log('Direct API Response:', data);
    console.log('Items count:', data.items?.length || 0);
  } catch (error) {
    console.error('Direct API call failed:', error);
  }
}

testDirectAPICall();

// Test with auth token if available
async function testAuthenticatedAPICall() {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      console.log('Testing authenticated API call...');
      const response = await fetch('http://localhost:8080/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Authenticated API Response:', data);
    } catch (error) {
      console.error('Authenticated API call failed:', error);
    }
  } else {
    console.log('No auth token found');
  }
}

testAuthenticatedAPICall();

console.log('=== END DEBUG ===');
