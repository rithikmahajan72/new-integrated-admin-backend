// Clear authentication state for testing
console.log('🧹 Clearing authentication state...');

// Clear all auth-related localStorage
localStorage.removeItem('authToken');
localStorage.removeItem('userData');
localStorage.removeItem('cartData');
localStorage.removeItem('wishlistData');

console.log('✅ Authentication state cleared!');
console.log('You can now test the fresh user flow:');
console.log('1. App should open to http://localhost:3000/auth');
console.log('2. Login with phone: 7036567890');
console.log('3. Should redirect to http://localhost:3000/admin-dashboard');

// For browser console usage
if (typeof window !== 'undefined') {
  window.clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('cartData');
    localStorage.removeItem('wishlistData');
    console.log('✅ Authentication cleared! Refresh the page to test.');
  };
  
  console.log('💡 Tip: Run clearAuth() in console to clear auth state anytime');
}
