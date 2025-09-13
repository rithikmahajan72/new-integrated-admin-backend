// Test to verify blob URL validation works
const axios = require('axios');

async function testBlobUrlValidation() {
  console.log('🧪 Testing blob URL validation...');
  
  const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMzYzU0ZmFhZTA4ZDRlYTcxYTAyODgiLCJuYW1lIjoiQWRtaW4gVXNlciIsInBoTm8iOiI5ODc2NTQzMjEwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6dHJ1ZSwiaXNQcm9maWxlIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB5b3JhYS5jb20iLCJwbGF0Zm9ybSI6bnVsbCwiX192IjowLCJpYXQiOjE3NTc2NjA1MzQsImV4cCI6MTc2MDI1MjUzNH0.JFac9CqhsadlHZX0_gtuyDNHWDzKBsEdiAo6QV5MxI4';

  // Test data with blob URLs (should be rejected)
  const testProductWithBlobUrls = {
    productName: "Test Product with Blob URLs",
    title: "Test Product",
    description: "This should fail validation",
    categoryId: "68c43828606de606b405789d",
    subCategoryId: "68c56e1ea067bbb188258725",
    regularPrice: 999,
    salePrice: 899,
    status: "draft",
    variants: [
      {
        name: "Variant 1",
        images: [
          "blob:http://localhost:3000/4c6ca08a-44d0-4e82-b637-67b07cc0c78b",
          "blob:http://localhost:3000/09c3854a-2d67-400d-9f43-747fd53e397c"
        ],
        videos: [
          "blob:http://localhost:3000/11f1ccb8-d214-47d8-8abf-77baab946ec5"
        ],
        colors: [],
        additionalData: {}
      }
    ]
  };

  try {
    console.log('📤 Sending product with blob URLs to backend...');
    const response = await axios.post('http://localhost:8080/api/products', testProductWithBlobUrls, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    // If we get here, validation failed
    console.log('❌ VALIDATION FAILED - Backend accepted blob URLs!');
    console.log('Response:', response.data);
    return false;

  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ VALIDATION WORKING - Backend rejected blob URLs');
      console.log('Error message:', error.response.data.message);
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

// Test with valid URLs (should succeed)
async function testValidUrls() {
  console.log('\n🧪 Testing with valid URLs...');
  
  const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMzYzU0ZmFhZTA4ZDRlYTcxYTAyODgiLCJuYW1lIjoiQWRtaW4gVXNlciIsInBoTm8iOiI5ODc2NTQzMjEwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6dHJ1ZSwiaXNQcm9maWxlIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB5b3JhYS5jb20iLCJwbGF0Zm9ybSI6bnVsbCwiX192IjowLCJpYXQiOjE3NTc2NjA1MzQsImV4cCI6MTc2MDI1MjUzNH0.JFac9CqhsadlHZX0_gtuyDNHWDzKBsEdiAo6QV5MxI4';

  // Test data with valid S3 URLs
  const testProductWithValidUrls = {
    productName: "Test Product with Valid URLs",
    title: "Test Product",
    description: "This should pass validation",
    categoryId: "68c43828606de606b405789d",
    subCategoryId: "68c56e1ea067bbb188258725",
    regularPrice: 999,
    salePrice: 899,
    status: "draft",
    variants: [
      {
        name: "Variant 1",
        images: [
          "https://usc1.contabostorage.com/yoraa-contabo-s3-bucket/uploads/images/upload_1757773826571_uqt6otx4d/1757773826571_package.json"
        ],
        videos: [],
        colors: [],
        additionalData: {}
      }
    ]
  };

  try {
    console.log('📤 Sending product with valid URLs to backend...');
    const response = await axios.post('http://localhost:8080/api/products', testProductWithValidUrls, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ VALID URLS ACCEPTED - Product created successfully');
    console.log('Product ID:', response.data.product?.productId);
    return true;

  } catch (error) {
    console.log('❌ Unexpected error with valid URLs:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting blob URL validation tests...');
  console.log('==========================================\n');
  
  const blobUrlTest = await testBlobUrlValidation();
  const validUrlTest = await testValidUrls();
  
  console.log('\n📋 TEST RESULTS');
  console.log('===============');
  console.log('Blob URL rejection:', blobUrlTest ? '✅ PASS' : '❌ FAIL');
  console.log('Valid URL acceptance:', validUrlTest ? '✅ PASS' : '❌ FAIL');
  
  if (blobUrlTest && validUrlTest) {
    console.log('\n🎉 All tests passed! Blob URL validation is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Check the validation logic.');
  }
}

runTests();
