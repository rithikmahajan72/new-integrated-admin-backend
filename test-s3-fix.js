const { setObjectPublicACL, getPublicUrl } = require('./src/utils/S3.js');
require("dotenv").config();

async function testExistingFile() {
  console.log("🔧 Testing fix for existing uploaded file...");
  
  // The problematic file from the database
  const fileName = "categories/68c08ac8c80590e20e90a15f/1757448904152_80AE446B-DD82-4CD6-81D2-2DF8B152EE82.jpeg";
  
  console.log(`Setting public ACL for: ${fileName}`);
  
  // Try to set the ACL for the existing file
  const aclResult = await setObjectPublicACL(fileName);
  
  if (aclResult) {
    console.log("✅ ACL set successfully");
  } else {
    console.log("❌ ACL setting failed");
  }
  
  // Generate the proper URL
  const publicUrl = getPublicUrl(fileName);
  console.log(`Generated URL: ${publicUrl}`);
  
  // Test access
  console.log("\n🔍 Testing file access...");
  try {
    const response = await fetch(publicUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log("✅ File is now accessible!");
      console.log(`✅ SUCCESS: Your image is accessible at: ${publicUrl}`);
    } else if (response.status === 403) {
      console.log("❌ Still getting 403 Forbidden - bucket policy may need manual configuration");
    } else if (response.status === 401) {
      console.log("❌ Still getting 401 Unauthorized - authentication issue");
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error testing file access:", error.message);
  }
}

async function debugContaboSettings() {
  console.log("\n📋 Current Configuration:");
  console.log(`Bucket: ${process.env.AWS_BUCKET_NAME}`);
  console.log(`Endpoint: ${process.env.S3_ENDPOINT}`);
  console.log(`Region: ${process.env.AWS_REGION}`);
  
  console.log("\n🔍 Manual Steps to Check:");
  console.log("1. Log into your Contabo Object Storage dashboard");
  console.log("2. Navigate to your bucket: yoraa-contabo-s3-bucket");
  console.log("3. Check bucket permissions/policy settings");
  console.log("4. Ensure 'Public Access' is enabled");
  console.log("5. Verify the bucket policy allows s3:GetObject for all users");
}

async function main() {
  await testExistingFile();
  await debugContaboSettings();
}

main().catch(console.error);
