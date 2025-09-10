const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

// Initialize Contabo S3-compatible client
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-central-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function checkBucketConfiguration() {
  console.log("🔍 Analyzing your bucket configuration...\n");
  
  // Test file from your screenshot
  const testFileName = "categories/68c095bdfc67b730bcc9daa9/1757451709918_IMG_1662.png";
  const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/${testFileName}`;
  
  console.log("📋 Configuration Summary:");
  console.log(`Bucket: ${process.env.AWS_BUCKET_NAME}`);
  console.log(`Endpoint: ${process.env.S3_ENDPOINT}`);
  console.log(`Test File: ${testFileName}`);
  console.log(`Public URL: ${publicUrl}\n`);
  
  // Test public access
  console.log("🔓 Testing Public Access...");
  try {
    const response = await fetch(publicUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log("✅ SUCCESS: Bucket has public read access enabled!");
      console.log("✅ Your images are publicly accessible");
      return true;
    } else if (response.status === 401) {
      console.log("❌ PRIVATE: Bucket is configured for private access only");
      console.log("❌ Images require authentication to access");
      return false;
    } else if (response.status === 403) {
      console.log("❌ FORBIDDEN: Bucket policy blocks public access");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing public access:", error.message);
    return false;
  }
}

async function generateSignedUrl(fileName, expiresIn = 3600) {
  console.log(`\n🔐 Generating signed URL for: ${fileName}`);
  
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    });
    
    const signedUrl = await getSignedUrl(s3, command, { expiresIn });
    console.log("✅ Signed URL generated successfully:");
    console.log(signedUrl);
    
    // Test the signed URL
    console.log("\n🧪 Testing signed URL access...");
    const response = await fetch(signedUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log("✅ Signed URL works! File is accessible with authentication");
    }
    
    return signedUrl;
  } catch (error) {
    console.error("❌ Error generating signed URL:", error.message);
    return null;
  }
}

async function provideSolutions(isPublic) {
  console.log("\n💡 SOLUTIONS:\n");
  
  if (!isPublic) {
    console.log("🎯 Option 1: Make Bucket Public (Recommended for Product Images)");
    console.log("   → Go to Contabo dashboard");
    console.log("   → Click on bucket: yoraa-contabo-s3-bucket");
    console.log("   → Enable 'Public Read Access' or 'Allow Anonymous Access'");
    console.log("   → Save changes and wait 2-5 minutes");
    console.log("");
    
    console.log("🎯 Option 2: Use Signed URLs (For Admin-Only Images)");
    console.log("   → Implement signed URL generation in your backend");
    console.log("   → Return signed URLs instead of direct S3 URLs");
    console.log("   → URLs expire after specified time (more secure)");
    console.log("");
    
    console.log("🎯 Option 3: Implement Authentication Middleware");
    console.log("   → Create a proxy endpoint in your backend");
    console.log("   → Verify user authentication before serving images");
    console.log("   → Stream images through your backend");
  } else {
    console.log("✅ Your bucket is already configured for public access!");
    console.log("✅ All uploaded images should be publicly accessible");
  }
}

async function main() {
  const isPublic = await checkBucketConfiguration();
  
  if (!isPublic) {
    // Generate a signed URL as example
    const testFileName = "categories/68c095bdfc67b730bcc9daa9/1757451709918_IMG_1662.png";
    await generateSignedUrl(testFileName);
  }
  
  await provideSolutions(isPublic);
}

main().catch(console.error);
