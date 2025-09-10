const { generateSignedUrl } = require('./src/utils/S3');
require('dotenv').config();

async function testSignedUrls() {
  console.log('🧪 Testing Signed URL Generation...\n');
  
  // Test files from your database
  const testFiles = [
    'categories/68c08ac8c80590e20e90a15f/1757448904152_80AE446B-DD82-4CD6-81D2-2DF8B152EE82.jpeg',
    'categories/68c095bdfc67b730bcc9daa9/1757451709918_IMG_1662.png'
  ];
  
  for (const fileName of testFiles) {
    console.log(`📁 Testing file: ${fileName}`);
    
    try {
      // Generate signed URL
      const signedUrl = await generateSignedUrl(fileName);
      console.log(`✅ Signed URL generated successfully`);
      console.log(`🔗 URL: ${signedUrl}\n`);
      
      // Test access
      console.log('🔍 Testing access...');
      const response = await fetch(signedUrl);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        console.log('✅ SUCCESS: Image is accessible!\n');
      } else {
        console.log(`❌ FAILED: Image returned ${response.status}\n`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${fileName}:`, error.message);
    }
    
    console.log('─'.repeat(80));
  }
  
  console.log('\n🎯 API Endpoints Available:');
  console.log('POST /api/images/refresh-image-url');
  console.log('  - Refresh a single image URL');
  console.log('  - Body: { "imageUrl": "your-image-url" }');
  console.log('');
  console.log('POST /api/images/refresh-multiple-urls');
  console.log('  - Refresh multiple image URLs');
  console.log('  - Body: { "imageUrls": ["url1", "url2", ...] }');
  console.log('');
  console.log('🔄 URL Expiration: 24 hours');
  console.log('📝 Note: URLs will be automatically refreshed when they expire');
}

testSignedUrls().catch(console.error);
