const { S3Client, PutBucketPolicyCommand, PutBucketAclCommand } = require("@aws-sdk/client-s3");
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

async function fixBucketPermissions() {
  try {
    console.log("Setting bucket to public-read...");
    
    // First, try to set bucket ACL to public-read
    const aclCommand = new PutBucketAclCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: "public-read",
    });
    
    await s3.send(aclCommand);
    console.log("✅ Bucket ACL set to public-read successfully");
    
    // Apply the bucket policy
    const bucketPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${process.env.AWS_BUCKET_NAME}/*`
        }
      ]
    };
    
    const policyCommand = new PutBucketPolicyCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy),
    });
    
    await s3.send(policyCommand);
    console.log("✅ Bucket policy applied successfully");
    
  } catch (error) {
    console.error("❌ Error setting bucket permissions:", error.message);
    console.log("This might be expected if Contabo doesn't support all S3 ACL operations");
  }
}

// Test if the file is accessible after fixing permissions
async function testFileAccess() {
  console.log("\n🔍 Testing file access...");
  const testUrl = "https://usc1.contabostorage.com/yoraa-contabo-s3-bucket/categories/68c08ac8c80590e20e90a15f/1757448904152_80AE446B-DD82-4CD6-81D2-2DF8B152EE82.jpeg";
  
  try {
    const response = await fetch(testUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log("✅ File is now accessible!");
    } else {
      console.log("❌ File is still not accessible");
    }
  } catch (error) {
    console.error("❌ Error testing file access:", error.message);
  }
}

async function main() {
  console.log("🚀 Starting S3 permissions fix...");
  console.log(`Bucket: ${process.env.AWS_BUCKET_NAME}`);
  console.log(`Endpoint: ${process.env.S3_ENDPOINT}`);
  
  await fixBucketPermissions();
  await testFileAccess();
}

main().catch(console.error);
