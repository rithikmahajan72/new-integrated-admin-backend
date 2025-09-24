// Firebase SMS OTP Test Script
// Run this in browser console to test Firebase configuration

(async function testFirebaseSetup() {
  console.log('🧪 Testing Firebase SMS OTP Setup...');
  
  // Test 1: Check Firebase auth instance
  console.log('1. Firebase Auth Instance:', window.firebase?.auth || 'Not found');
  
  // Test 2: Check if development mode is detected
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  console.log('2. Development Mode:', isDevelopment);
  
  // Test 3: Check reCAPTCHA container
  const recaptchaContainer = document.getElementById('recaptcha-container');
  console.log('3. reCAPTCHA Container:', recaptchaContainer ? 'Found' : 'Not found');
  
  // Test 4: Test phone number formatting
  const testPhone = '7006114695';
  const formattedPhone = testPhone.startsWith('+91') ? testPhone : `+91${testPhone}`;
  console.log('4. Phone Formatting:', `${testPhone} → ${formattedPhone}`);
  
  // Test 5: Check Firebase test phone numbers
  const testPhoneNumbers = {
    development: '+1 650-555-3434',
    testCode: '654321',
    production: '+91 7006114695'
  };
  console.log('5. Test Phone Numbers:', testPhoneNumbers);
  
  // Instructions
  console.log(`
🎯 Testing Instructions:
1. Navigate to: http://localhost:3002/settings/auto-invoice
2. Toggle the "get auto invoice mailing" switch
3. Check the SMS verification modal
4. Expected behavior:
   - Development: Shows test phone +1 650-555-3434
   - Use verification code: 654321
   - Email password: R@2727thik
   - Default password: R@2727thik

🔧 If SMS still doesn't work:
1. Check Firebase Console for billing status
2. Verify test phone numbers are configured
3. Check browser console for reCAPTCHA errors
4. Ensure domain is authorized in Firebase
  `);
})();

// Export for manual testing
window.testFirebaseSetup = function() {
  console.log('Firebase Auth Service:', window.firebaseAuthService);
  console.log('Current URL:', window.location.href);
  console.log('Hostname:', window.location.hostname);
};
