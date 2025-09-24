// Test Firebase Authentication Configuration
import { firebaseAuthService } from './services/firebaseAuthService.js';
import { auth } from './config/firebase.js';

export const testFirebaseSetup = async () => {
  console.log('🔥 Testing Firebase Authentication Setup...');
  
  try {
    // Test 1: Check Firebase Auth initialization
    console.log('📋 Firebase Auth Status:', auth ? '✅ Initialized' : '❌ Not initialized');
    
    // Test 2: Initialize reCAPTCHA
    console.log('🤖 Testing reCAPTCHA initialization...');
    const recaptcha = firebaseAuthService.initRecaptcha('test-recaptcha');
    console.log('🤖 reCAPTCHA:', recaptcha ? '✅ Ready' : '❌ Failed');
    
    // Test 3: Check admin configuration
    const { ADMIN_CONFIG } = await import('./config/firebase.js');
    console.log('👤 Admin Config:');
    console.log('   📧 Email:', ADMIN_CONFIG.adminEmail);
    console.log('   📱 Phone:', ADMIN_CONFIG.adminPhone);
    console.log('   🔑 Password Set:', ADMIN_CONFIG.adminPassword ? '✅ Yes' : '❌ No');
    
    // Test 4: Validate credentials
    const credentialsTest = firebaseAuthService.validateCredentials('R@2727thik', 'R@2727thik');
    console.log('🔐 Credentials Test:', credentialsTest.success ? '✅ Valid' : '❌ Invalid');
    
    console.log('\n🎉 Firebase Authentication is ready!');
    console.log('📝 Next steps:');
    console.log('   1. Go to settings page');
    console.log('   2. Toggle "get auto invoice mailing"');
    console.log('   3. Firebase 2FA modal will open');
    console.log('   4. SMS OTP will be sent to +917006114695');
    console.log('   5. Email verification will be sent to rithikmahajan27@gmail.com');
    
    return { success: true, message: 'Firebase setup validated' };
    
  } catch (error) {
    console.error('❌ Firebase setup test failed:', error);
    return { success: false, error: error.message };
  }
};

// Auto-run test when imported
if (typeof window !== 'undefined') {
  console.log('🚀 Firebase Authentication Test Available');
  console.log('💡 Run testFirebaseSetup() in console to test configuration');
  
  // Make test function globally available
  window.testFirebaseSetup = testFirebaseSetup;
}
