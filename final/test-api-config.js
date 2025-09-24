// Test file to validate centralized API configuration
import { getBaseURL, getApiURL, API_ENDPOINTS, AXIOS_CONFIG } from '../src/config/apiConfig.js';

console.log('🧪 Testing Centralized API Configuration...');

// Test 1: Base URL functions
console.log('\n1. Base URL Functions:');
console.log('   getBaseURL():', getBaseURL());
console.log('   getApiURL():', getApiURL());

// Test 2: API Endpoints
console.log('\n2. API Endpoints:');
Object.entries(API_ENDPOINTS).forEach(([key, value]) => {
  console.log(`   ${key}:`, value);
});

// Test 3: Axios Configuration
console.log('\n3. Axios Configuration:');
console.log('   AXIOS_CONFIG:', AXIOS_CONFIG);

// Test 4: Environment Variable Usage
console.log('\n4. Environment Variables:');
console.log('   VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL || 'Not set (using default)');

// Test 5: URL Construction Validation
console.log('\n5. URL Construction Validation:');
console.log('   Should NOT contain double /api:', getApiURL().includes('/api/api') ? '❌ FAIL' : '✅ PASS');
console.log('   Should end with /api:', getApiURL().endsWith('/api') ? '✅ PASS' : '❌ FAIL');
console.log('   Should be valid URL:', URL.canParse ? URL.canParse(getApiURL()) ? '✅ PASS' : '❌ FAIL' : 'Skipped (Node < 18)');

console.log('\n✅ Configuration Test Complete!');
