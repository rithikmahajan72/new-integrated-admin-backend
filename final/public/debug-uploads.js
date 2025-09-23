/**
 * Quick Fix for Upload Issues
 * 
 * This script can be run in the browser console to:
 * 1. Set the admin token for authentication
 * 2. Check if uploads are working
 * 3. Debug any upload failures
 */

// 1. Set the admin token (run this first)
function setAdminToken() {
  // Updated token for the correct admin user in database: 68cd71f3f31eb5d72a6c8e25
  const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4MzU3MSwiZXhwIjoxNzU5MTg4MzcxfQ.0ElD25i-I3qs09tnKSxq_gGfhhTokKR3GFVmiYbXk6U";
  
  localStorage.setItem('authToken', adminToken);
  console.log('✅ Admin token set successfully!');
  console.log('Token expires:', new Date(1759188371 * 1000).toLocaleString());
  
  // Also set user data - matching the actual admin user in database
  const userData = {
    _id: "68cd71f3f31eb5d72a6c8e25",
    name: "Johyeeinteeety rtoe",
    phNo: "7036567890",
    isVerified: true,
    isPhoneVerified: true,
    isEmailVerified: true,
    isAdmin: true,
    isProfile: true,
    email: "user@example.com",
    platform: null
  };
  
  localStorage.setItem('userData', JSON.stringify(userData));
  console.log('✅ User data set successfully!');
  console.log('You can now upload images and create products.');
}

// 2. Check if uploads are working
async function testUpload() {
  console.log('🧪 Testing upload functionality...');
  
  // Check if token is set
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('❌ No auth token found. Run setAdminToken() first.');
    return;
  }
  
  try {
    // Create a simple test image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('TEST', 25, 55);
    
    // Convert to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    
    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'test-upload.png');
    
    console.log('📤 Sending test upload...');
    
    // Make the upload request
    const response = await fetch('http://localhost:8080/api/items/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload test successful!');
      console.log('Server URL:', result.data?.imageUrl);
      console.log('Full response:', result);
      return result.data?.imageUrl;
    } else {
      console.error('❌ Upload test failed:');
      console.error('Status:', response.status);
      console.error('Response:', result);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Upload test error:', error);
    return null;
  }
}

// 3. Debug current upload state
function debugUploadState() {
  console.log('🔍 Current upload state:');
  console.log('=======================');
  
  // Check authentication
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  console.log('Auth token:', token ? '✅ Present' : '❌ Missing');
  console.log('User data:', userData ? '✅ Present' : '❌ Missing');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const isExpired = expiresAt < new Date();
      
      console.log('Token expires:', expiresAt.toLocaleString());
      console.log('Token status:', isExpired ? '❌ Expired' : '✅ Valid');
      console.log('Is admin:', payload.isAdmin ? '✅ Yes' : '❌ No');
    } catch (e) {
      console.log('Token format:', '❌ Invalid');
    }
  }
  
  // Check if we're on the right page
  const isUploadPage = window.location.pathname.includes('upload') || 
                       document.querySelector('[data-testid="product-upload"]') ||
                       document.querySelector('.product-upload') ||
                       document.title.toLowerCase().includes('upload');
  
  console.log('On upload page:', isUploadPage ? '✅ Yes' : '❓ Unknown');
  
  // Check backend connectivity
  console.log('Testing backend connectivity...');
  fetch('http://localhost:8080/api/categories')
    .then(response => {
      console.log('Backend connection:', response.ok ? '✅ Connected' : '❌ Failed');
      console.log('Backend status:', response.status);
    })
    .catch(error => {
      console.log('Backend connection:', '❌ Failed');
      console.log('Error:', error.message);
    });
}

// 4. Monitor upload progress
function monitorUploads() {
  console.log('👀 Monitoring uploads...');
  
  // Override console.log to catch upload logs
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('upload') || message.includes('serverUrl') || message.includes('blob:')) {
      console.warn('🔍 UPLOAD DEBUG:', ...args);
    }
    originalLog.apply(console, args);
  };
  
  // Override console.error to catch upload errors
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('upload') || message.includes('failed')) {
      console.error('🚨 UPLOAD ERROR:', ...args);
    }
    originalError.apply(console, args);
  };
  
  console.log('✅ Upload monitoring enabled. Check console for upload activity.');
}

// 5. Check for blob URLs in current form data
function checkForBlobUrls() {
  console.log('🔍 Checking current form for blob URLs...');
  
  // Try to find variant data in the page
  const checkElement = (element, path = '') => {
    if (!element) return [];
    
    const issues = [];
    
    // Check text content for blob URLs
    if (element.textContent && element.textContent.includes('blob:')) {
      const blobMatches = element.textContent.match(/blob:[^"\s]+/g);
      if (blobMatches) {
        blobMatches.forEach(url => {
          issues.push(`Found blob URL in ${path || 'page content'}: ${url}`);
        });
      }
    }
    
    // Check input values
    if (element.value && element.value.includes('blob:')) {
      issues.push(`Found blob URL in input ${path}: ${element.value}`);
    }
    
    // Check data attributes
    if (element.dataset) {
      Object.keys(element.dataset).forEach(key => {
        if (element.dataset[key] && element.dataset[key].includes('blob:')) {
          issues.push(`Found blob URL in data-${key} ${path}: ${element.dataset[key]}`);
        }
      });
    }
    
    return issues;
  };
  
  const allIssues = [];
  
  // Check all elements on the page
  document.querySelectorAll('*').forEach((element, index) => {
    const issues = checkElement(element, `element[${index}]`);
    allIssues.push(...issues);
  });
  
  // Check React component state if available
  try {
    // Look for React fiber nodes
    const reactElements = document.querySelectorAll('[data-reactroot], [data-reactid]');
    reactElements.forEach(element => {
      const fiber = element._reactInternalFiber || element._reactInternalInstance;
      if (fiber && fiber.memoizedState) {
        console.log('Found React state:', fiber.memoizedState);
      }
    });
  } catch (e) {
    // React checking failed, that's ok
  }
  
  console.log(`Found ${allIssues.length} blob URL issues:`);
  allIssues.forEach(issue => console.warn('⚠️', issue));
  
  if (allIssues.length === 0) {
    console.log('✅ No blob URLs found in current page');
  } else {
    console.log('\n🚨 BLOB URLS DETECTED! This will cause upload issues.');
    console.log('Solutions:');
    console.log('1. Run setAdminToken() to enable uploads');
    console.log('2. Re-upload any failed images/videos');
    console.log('3. Wait for all uploads to complete before submitting');
  }
  
  return allIssues;
}

// 6. Force cleanup of blob URLs
function cleanupBlobUrls() {
  console.log('🧹 Attempting to cleanup blob URLs...');
  
  // Try to clear any blob URLs from inputs
  document.querySelectorAll('input').forEach(input => {
    if (input.value && input.value.includes('blob:')) {
      console.log('Clearing blob URL from input:', input.value);
      input.value = '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  // Try to clear from text areas
  document.querySelectorAll('textarea').forEach(textarea => {
    if (textarea.value && textarea.value.includes('blob:')) {
      console.log('Clearing blob URL from textarea:', textarea.value);
      textarea.value = '';
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  console.log('✅ Blob URL cleanup attempted');
  console.log('Note: You may need to re-upload files after cleanup');
}
// 7. Instructions
function showInstructions() {
  console.log(`
🚀 YORAA UPLOAD DEBUG TOOLKIT
============================

To fix upload issues:

1. 📝 Set admin authentication:
   setAdminToken()

2. 🧪 Test if uploads work:
   await testUpload()

3. 🔍 Debug current state:
   debugUploadState()

4. 👀 Monitor upload activity:
   monitorUploads()

5. 🔍 Check for blob URLs in current form:
   checkForBlobUrls()

6. 🧹 Cleanup blob URLs:
   cleanupBlobUrls()

Common Issues & Solutions:
• Blob URLs in database → Authentication issue → Run setAdminToken()
• Upload fails silently → Backend not running → Start backend server
• 401/403 errors → Token expired → Run setAdminToken() again
• No server URLs → Uploads failing → Check backend logs
• Form shows blob URLs → Uploads incomplete → Re-upload files

Backend server should be running at: http://localhost:8080
Frontend should be running at: http://localhost:3000 (or similar)

CURRENT STATUS CHECK:
Run debugUploadState() to see your current setup status.
  `);
}

// Auto-run instructions
showInstructions();

// Export functions to global scope
window.setAdminToken = setAdminToken;
window.testUpload = testUpload;
window.debugUploadState = debugUploadState;
window.monitorUploads = monitorUploads;
window.checkForBlobUrls = checkForBlobUrls;
window.cleanupBlobUrls = cleanupBlobUrls;
window.showInstructions = showInstructions;
