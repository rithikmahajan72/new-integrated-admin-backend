const mongoose = require('mongoose');
const { generateSignedUrl } = require('./src/utils/S3');
require('dotenv').config();

// Import your models
const Category = require('./src/models/Category');
const Item = require('./src/models/Item');
const ItemDetails = require('./src/models/ItemDetails');
// Add other models that have image URLs as needed

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function extractS3KeyFromUrl(imageUrl) {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    
    if (imageUrl.includes('X-Amz-Algorithm')) {
      // Already a signed URL, extract the key from the path
      const urlParts = new URL(imageUrl);
      let s3Key = urlParts.pathname.substring(1); // Remove leading slash
      const bucketName = process.env.AWS_BUCKET_NAME;
      if (s3Key.startsWith(`${bucketName}/`)) {
        s3Key = s3Key.substring(bucketName.length + 1);
      }
      return s3Key;
    } else if (imageUrl.includes(process.env.AWS_BUCKET_NAME)) {
      // Direct S3 URL
      const urlParts = new URL(imageUrl);
      const pathParts = urlParts.pathname.split('/');
      const bucketIndex = pathParts.indexOf(process.env.AWS_BUCKET_NAME);
      if (bucketIndex !== -1) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', imageUrl, error.message);
    return null;
  }
}

async function updateCategoryImages() {
  console.log('\n🔄 Updating Category Images...');
  
  try {
    const categories = await Category.find({ imageUrl: { $exists: true, $ne: null } });
    console.log(`Found ${categories.length} categories with images`);
    
    let updated = 0;
    let failed = 0;
    
    for (const category of categories) {
      try {
        const s3Key = await extractS3KeyFromUrl(category.imageUrl);
        if (s3Key) {
          const signedUrl = await generateSignedUrl(s3Key);
          await Category.findByIdAndUpdate(category._id, { imageUrl: signedUrl });
          console.log(`✅ Updated category: ${category.name}`);
          updated++;
        } else {
          console.log(`⚠️  Could not extract S3 key for category: ${category.name}`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Error updating category ${category.name}:`, error.message);
        failed++;
      }
    }
    
    console.log(`Categories: ${updated} updated, ${failed} failed`);
  } catch (error) {
    console.error('Error updating categories:', error);
  }
}

async function updateItemImages() {
  console.log('\n🔄 Updating Item Images...');
  
  try {
    const items = await Item.find({
      $or: [
        { primaryImage: { $exists: true, $ne: null } },
        { images: { $exists: true, $ne: [] } }
      ]
    });
    
    console.log(`Found ${items.length} items with images`);
    
    let updated = 0;
    let failed = 0;
    
    for (const item of items) {
      try {
        let itemUpdated = false;
        const updateData = {};
        
        // Update primary image
        if (item.primaryImage) {
          const s3Key = await extractS3KeyFromUrl(item.primaryImage);
          if (s3Key) {
            const signedUrl = await generateSignedUrl(s3Key);
            updateData.primaryImage = signedUrl;
            itemUpdated = true;
          }
        }
        
        // Update images array
        if (item.images && item.images.length > 0) {
          const updatedImages = [];
          for (const imageUrl of item.images) {
            const s3Key = await extractS3KeyFromUrl(imageUrl);
            if (s3Key) {
              const signedUrl = await generateSignedUrl(s3Key);
              updatedImages.push(signedUrl);
            } else {
              updatedImages.push(imageUrl); // Keep original if can't process
            }
          }
          updateData.images = updatedImages;
          itemUpdated = true;
        }
        
        if (itemUpdated) {
          await Item.findByIdAndUpdate(item._id, updateData);
          console.log(`✅ Updated item: ${item.name || item._id}`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error updating item ${item._id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`Items: ${updated} updated, ${failed} failed`);
  } catch (error) {
    console.error('Error updating items:', error);
  }
}

async function updateItemDetailsImages() {
  console.log('\n🔄 Updating ItemDetails Images...');
  
  try {
    const itemDetails = await ItemDetails.find({
      $or: [
        { primaryImage: { $exists: true, $ne: null } },
        { images: { $exists: true, $ne: [] } }
      ]
    });
    
    console.log(`Found ${itemDetails.length} item details with images`);
    
    let updated = 0;
    let failed = 0;
    
    for (const detail of itemDetails) {
      try {
        let detailUpdated = false;
        const updateData = {};
        
        // Update primary image
        if (detail.primaryImage) {
          const s3Key = await extractS3KeyFromUrl(detail.primaryImage);
          if (s3Key) {
            const signedUrl = await generateSignedUrl(s3Key);
            updateData.primaryImage = signedUrl;
            detailUpdated = true;
          }
        }
        
        // Update images array
        if (detail.images && detail.images.length > 0) {
          const updatedImages = [];
          for (const imageUrl of detail.images) {
            const s3Key = await extractS3KeyFromUrl(imageUrl);
            if (s3Key) {
              const signedUrl = await generateSignedUrl(s3Key);
              updatedImages.push(signedUrl);
            } else {
              updatedImages.push(imageUrl); // Keep original if can't process
            }
          }
          updateData.images = updatedImages;
          detailUpdated = true;
        }
        
        if (detailUpdated) {
          await ItemDetails.findByIdAndUpdate(detail._id, updateData);
          console.log(`✅ Updated item detail: ${detail._id}`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error updating item detail ${detail._id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`ItemDetails: ${updated} updated, ${failed} failed`);
  } catch (error) {
    console.error('Error updating item details:', error);
  }
}

async function main() {
  console.log('🚀 Starting database image URL migration to signed URLs...');
  console.log(`Bucket: ${process.env.AWS_BUCKET_NAME}`);
  console.log(`Endpoint: ${process.env.S3_ENDPOINT}\n`);
  
  await connectToDatabase();
  
  // Update all image URLs to signed URLs
  await updateCategoryImages();
  await updateItemImages();
  await updateItemDetailsImages();
  
  console.log('\n✅ Migration completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Your existing images are now accessible via signed URLs');
  console.log('2. New uploads will automatically use signed URLs');
  console.log('3. Signed URLs expire in 24 hours but can be refreshed via API');
  console.log('4. Use /api/images/refresh-image-url to refresh expired URLs');
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
