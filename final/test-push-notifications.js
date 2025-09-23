#!/usr/bin/env node

/**
 * Test script for Redux-based push notification system
 * Tests: API endpoints, Redux integration, and component functionality
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_TIMEOUT = 30000;

// Test data
const testNotification = {
  title: 'Test Notification',
  body: 'This is a test push notification from Redux system',
  deepLink: 'app://product/123',
  targetPlatform: 'both',
  imageUrl: null,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.magenta}${msg}${colors.reset}`),
};

// Test functions
const testBackendEndpoint = async () => {
  log.header('\n=== Testing Backend Notification Endpoint ===');
  
  try {
    log.info('Testing POST /api/notifications/send-notification');
    
    const response = await axios.post(`${API_BASE_URL}/api/notifications/send-notification`, {
      ...testNotification,
      isTest: true, // Flag to prevent actual FCM sending during test
    });
    
    if (response.status === 200) {
      log.success('Backend endpoint is working correctly');
      log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } else {
      log.error(`Unexpected status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      log.error(`Backend error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      log.error('Backend server is not responding. Make sure the server is running.');
    } else {
      log.error(`Request error: ${error.message}`);
    }
    return false;
  }
};

const testReduxFiles = () => {
  log.header('\n=== Testing Redux Implementation Files ===');
  
  const requiredFiles = [
    'final/src/store/slices/pushNotificationSlice.js',
    'final/src/hooks/usePushNotifications.js',
    'final/src/services/fcmService.js',
    'final/public/firebase-messaging-sw.js',
    'final/src/api/endpoints.js',
    'final/src/components/NotificationItem.jsx',
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log.success(`${file} exists`);
    } else {
      log.error(`${file} is missing`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
};

const testReduxSliceStructure = () => {
  log.header('\n=== Testing Redux Slice Structure ===');
  
  try {
    const slicePath = path.join(__dirname, 'final/src/store/slices/pushNotificationSlice.js');
    const sliceContent = fs.readFileSync(slicePath, 'utf8');
    
    const requiredElements = [
      'sendPushNotification',
      'uploadNotificationImage',
      'scheduleNotification',
      'fetchNotificationHistory',
      'updateNotificationField',
      'resetNotificationForm',
      'extraReducers',
    ];
    
    let allElementsFound = true;
    
    for (const element of requiredElements) {
      if (sliceContent.includes(element)) {
        log.success(`Redux slice contains ${element}`);
      } else {
        log.error(`Redux slice missing ${element}`);
        allElementsFound = false;
      }
    }
    
    return allElementsFound;
  } catch (error) {
    log.error(`Failed to read Redux slice: ${error.message}`);
    return false;
  }
};

const testFCMServiceStructure = () => {
  log.header('\n=== Testing FCM Service Structure ===');
  
  try {
    const fcmPath = path.join(__dirname, 'final/src/services/fcmService.js');
    const fcmContent = fs.readFileSync(fcmPath, 'utf8');
    
    const requiredMethods = [
      'requestPermission',
      'onMessage',
      'showNotification',
      'getToken',
    ];
    
    let allMethodsFound = true;
    
    for (const method of requiredMethods) {
      if (fcmContent.includes(method)) {
        log.success(`FCM service contains ${method}`);
      } else {
        log.error(`FCM service missing ${method}`);
        allMethodsFound = false;
      }
    }
    
    return allMethodsFound;
  } catch (error) {
    log.error(`Failed to read FCM service: ${error.message}`);
    return false;
  }
};

const testNotificationComponentProps = () => {
  log.header('\n=== Testing NotificationItem Component ===');
  
  try {
    const componentPath = path.join(__dirname, 'final/src/components/NotificationItem.jsx');
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    const requiredFeatures = [
      'PropTypes',
      'onEdit',
      'onDelete',
      'status',
      'platforms',
      'deeplink',
      'getStatusColor',
      'getStatusIcon',
    ];
    
    let allFeaturesFound = true;
    
    for (const feature of requiredFeatures) {
      if (componentContent.includes(feature)) {
        log.success(`NotificationItem supports ${feature}`);
      } else {
        log.error(`NotificationItem missing ${feature}`);
        allFeaturesFound = false;
      }
    }
    
    return allFeaturesFound;
  } catch (error) {
    log.error(`Failed to read NotificationItem component: ${error.message}`);
    return false;
  }
};

const runAllTests = async () => {
  log.header('🚀 Redux Push Notification System Test Suite');
  log.info('Testing complete integration of Redux-based push notifications\n');
  
  const results = {
    backendEndpoint: false,
    reduxFiles: false,
    reduxSlice: false,
    fcmService: false,
    notificationComponent: false,
  };
  
  // Test file existence
  results.reduxFiles = testReduxFiles();
  
  // Test Redux slice structure
  results.reduxSlice = testReduxSliceStructure();
  
  // Test FCM service structure
  results.fcmService = testFCMServiceStructure();
  
  // Test NotificationItem component
  results.notificationComponent = testNotificationComponentProps();
  
  // Test backend endpoint
  results.backendEndpoint = await testBackendEndpoint();
  
  // Summary
  log.header('\n=== Test Results Summary ===');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      log.success(`${test}: PASSED`);
    } else {
      log.error(`${test}: FAILED`);
    }
  });
  
  log.header(`\nOverall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    log.success('\n🎉 All tests passed! Redux push notification system is ready.');
    log.info('\nNext steps:');
    log.info('1. Start your backend server');
    log.info('2. Run the frontend with `npm run dev`');
    log.info('3. Navigate to the push notifications page');
    log.info('4. Test sending notifications with different platforms');
    log.info('5. Verify FCM token generation and message handling');
  } else {
    log.warn('\n⚠️  Some tests failed. Please check the implementation.');
    log.info('\nCommon issues:');
    log.info('- Ensure backend server is running on correct port');
    log.info('- Check Firebase configuration in both frontend and backend');
    log.info('- Verify all Redux files are properly imported');
    log.info('- Make sure FCM service worker is registered');
  }
  
  process.exit(passed === total ? 0 : 1);
};

// Handle process signals
process.on('SIGINT', () => {
  log.warn('\n\nTest interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log.warn('\n\nTest terminated');
  process.exit(1);
});

// Run tests
runAllTests().catch((error) => {
  log.error(`\nUnexpected error: ${error.message}`);
  process.exit(1);
});
