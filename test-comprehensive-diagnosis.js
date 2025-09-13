// Final comprehensive test to diagnose the frontend upload issue
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test 1: Verify backend endpoints are working
async function testBackendUpload() {
  console.log('\n🔧 Test 1: Backend upload endpoint functionality');
  console.log('================================================');
  
  try {
    // Create a simple test image
    const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGWjVYzAAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64PNG, 'base64');
    
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMzYzU0ZmFhZTA4ZDRlYTcxYTAyODgiLCJuYW1lIjoiQWRtaW4gVXNlciIsInBoTm8iOiI5ODc2NTQzMjEwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6dHJ1ZSwiaXNQcm9maWxlIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB5b3JhYS5jb20iLCJwbGF0Zm9ybSI6bnVsbCwiX192IjowLCJpYXQiOjE3NTc2NjA1MzQsImV4cCI6MTc2MDI1MjUzNH0.JFac9CqhsadlHZX0_gtuyDNHWDzKBsEdiAo6QV5MxI4';

    const response = await axios.post('http://localhost:8080/api/items/upload-image', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${adminToken}`
      }
    });

    console.log('✅ Backend upload working correctly!');
    console.log('Response structure:', {
      success: response.data.success,
      message: response.data.message,
      hasImageUrl: !!response.data.data?.imageUrl,
      imageUrlSample: response.data.data?.imageUrl?.substring(0, 100) + '...'
    });
    
    return {
      working: true,
      imageUrl: response.data.data?.imageUrl,
      fullResponse: response.data
    };

  } catch (error) {
    console.log('❌ Backend upload failed:');
    console.log('Error:', error.response?.data || error.message);
    return { working: false, error: error.message };
  }
}

// Test 2: Simulate frontend axios configuration
async function testFrontendAxiosConfig() {
  console.log('\n🔧 Test 2: Frontend axios configuration simulation');
  console.log('==================================================');
  
  try {
    // Simulate how the frontend axios is configured
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:8080',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add the request interceptor like in the frontend
    axiosInstance.interceptors.request.use((config) => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMzYzU0ZmFhZTA4ZDRlYTcxYTAyODgiLCJuYW1lIjoiQWRtaW4gVXNlciIsInBoTm8iOiI5ODc2NTQzMjEwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6dHJ1ZSwiaXNQcm9maWxlIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB5b3JhYS5jb20iLCJwbGF0Zm9ybSI6bnVsbCwiX192IjowLCJpYXQiOjE3NTc2NjA1MzQsImV4cCI6MTc2MDI1MjUzNH0.JFac9CqhsadlHZX0_gtuyDNHWDzKBsEdiAo6QV5MxI4';
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Simulate the imageAPI call
    const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGWjVYzAAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64PNG, 'base64');
    
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'frontend-test.png',
      contentType: 'image/png'
    });

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    };

    const response = await axiosInstance.post('/api/items/upload-image', formData, config);
    
    console.log('✅ Frontend-style upload working!');
    console.log('Response data structure:', {
      hasData: !!response.data,
      hasDataProperty: !!response.data.data,
      hasImageUrl: !!response.data.data?.imageUrl,
      imageUrl: response.data.data?.imageUrl?.substring(0, 100) + '...'
    });

    return {
      working: true,
      response: response.data
    };

  } catch (error) {
    console.log('❌ Frontend-style upload failed:');
    console.log('Status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    return { working: false, error: error.message };
  }
}

// Test 3: Simulate the exact frontend uploadUtils logic
async function testUploadUtilsLogic() {
  console.log('\n🔧 Test 3: uploadUtils logic simulation');
  console.log('=======================================');
  
  try {
    // Create a mock file like what comes from file input
    const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGWjVYzAAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64PNG, 'base64');
    
    // Simulate the file object that comes from input[type="file"]
    const mockFile = {
      name: 'test-upload.png',
      type: 'image/png',
      size: imageBuffer.length,
      buffer: imageBuffer
    };

    console.log('Mock file created:', {
      name: mockFile.name,
      type: mockFile.type,
      size: mockFile.size
    });

    // Simulate uploadUtils.uploadImage
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: mockFile.name,
      contentType: mockFile.type
    });
    
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMzYzU0ZmFhZTA4ZDRlYTcxYTAyODgiLCJuYW1lIjoiQWRtaW4gVXNlciIsInBoTm8iOiI5ODc2NTQzMjEwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6dHJ1ZSwiaXNQcm9maWxlIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB5b3JhYS5jb20iLCJwbGF0Zm9ybSI6bnVsbCwiX192IjowLCJpYXQiOjE3NTc2NjA1MzQsImV4cCI6MTc2MDI1MjUzNH0.JFac9CqhsadlHZX0_gtuyDNHWDzKBsEdiAo6QV5MxI4';

    const config = {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${adminToken}`
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`uploadUtils progress: ${percentCompleted}%`);
      }
    };

    console.log('Making uploadUtils-style API call...');
    const response = await axios.post('http://localhost:8080/api/items/upload-image', formData, config);

    console.log('✅ uploadUtils simulation successful!');
    
    // Simulate the exact logic from SingleProductUpload.jsx
    let serverUrl = null;
    if (response && response.data) {
      // Try different possible response structures (as in the frontend)
      serverUrl = response.data.imageUrl || response.data.videoUrl || response.data.data?.imageUrl || response.data.data?.videoUrl;
    }

    console.log('URL extraction result:');
    console.log('  Full response.data:', JSON.stringify(response.data, null, 2));
    console.log('  Extracted serverUrl:', serverUrl);
    console.log('  URL type:', typeof serverUrl);
    console.log('  URL length:', serverUrl?.length);

    if (!serverUrl) {
      console.log('❌ No URL extracted - this is the problem!');
      console.log('Available properties in response.data:', Object.keys(response.data));
      if (response.data.data) {
        console.log('Available properties in response.data.data:', Object.keys(response.data.data));
      }
    } else {
      console.log('✅ Server URL extracted successfully');
    }

    return {
      working: true,
      serverUrl: serverUrl,
      fullResponse: response.data
    };

  } catch (error) {
    console.log('❌ uploadUtils simulation failed:');
    console.log('Error:', error.response?.data || error.message);
    return { working: false, error: error.message };
  }
}

// Test 4: Check what happens with blob URLs
function testBlobUrlSimulation() {
  console.log('\n🔧 Test 4: Blob URL simulation (what frontend sees vs server URLs)');
  console.log('====================================================================');
  
  // Simulate what happens when frontend creates blob URLs
  const mockFileData = {
    id: Date.now(),
    name: 'test-image.png',
    type: 'image/png',
    size: 1024,
    // This is what gets created initially
    url: 'blob:http://localhost:3000/12345678-1234-1234-1234-123456789012',
    serverUrl: null // This should be updated after upload
  };

  console.log('Initial file data (what gets stored initially):', mockFileData);
  
  // Simulate successful upload
  const mockServerUrl = 'https://usc1.contabostorage.com/yoraa-contabo-s3-bucket/uploads/images/upload_1757773129655_fynpnegbn/1757773129656_test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=8639314847fff3d7c95c290dc6605027%2F20250913%2Fus-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250913T141851Z&X-Amz-Expires=86400&X-Amz-Signature=d3547cff8d154a188d45b8cceebee50b3b2af05ca837d6e2c3413d75803f096c&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject';
  
  // Update with server URL
  mockFileData.serverUrl = mockServerUrl;
  console.log('After successful upload (what should be stored):', {
    ...mockFileData,
    serverUrl: mockServerUrl.substring(0, 100) + '...'
  });

  console.log('\n🤔 The question is: Why is the database showing blob URLs instead of server URLs?');
  console.log('Possible reasons:');
  console.log('1. Upload is failing silently and serverUrl remains null');
  console.log('2. Product creation is using the blob URL instead of serverUrl');
  console.log('3. Frontend is not waiting for upload completion before submitting');
  console.log('4. There\'s an authentication issue preventing uploads');
  
  return mockFileData;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive upload system diagnosis...');
  console.log('=================================================');
  
  try {
    const test1 = await testBackendUpload();
    const test2 = await testFrontendAxiosConfig();
    const test3 = await testUploadUtilsLogic();
    const test4 = testBlobUrlSimulation();

    console.log('\n📋 DIAGNOSIS SUMMARY');
    console.log('===================');
    console.log('Backend upload working:', test1.working ? '✅' : '❌');
    console.log('Frontend axios working:', test2.working ? '✅' : '❌');
    console.log('uploadUtils logic working:', test3.working ? '✅' : '❌');
    
    if (test1.working && test2.working && test3.working) {
      console.log('\n🎉 All upload systems are working correctly!');
      console.log('The issue must be in one of these areas:');
      console.log('1. Frontend not calling uploadUtils correctly');
      console.log('2. Frontend not waiting for uploads to complete');
      console.log('3. Product creation using blob URLs instead of server URLs');
      console.log('4. Authentication issues in the actual frontend app');
      
      if (test3.serverUrl) {
        console.log('\n✅ Server URL extraction is working correctly');
        console.log('Server URL format:', test3.serverUrl.substring(0, 100) + '...');
      } else {
        console.log('\n❌ Server URL extraction failed - found the issue!');
      }
    } else {
      console.log('\n❌ Found issues in the upload system:');
      if (!test1.working) console.log('- Backend upload endpoint not working');
      if (!test2.working) console.log('- Frontend axios configuration issue');
      if (!test3.working) console.log('- uploadUtils logic issue');
    }

  } catch (error) {
    console.error('Test runner failed:', error);
  }
}

// Run the comprehensive test
runAllTests();
