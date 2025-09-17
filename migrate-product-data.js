const mongoose = require('mongoose');
const Product = require('./src/models/Product');

// Database Migration Script to Fix Product Data Mapping Issues
async function migrateProductData() {
    try {
        console.log('🚀 Starting Product Data Migration...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yoraa', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB');
        
        const products = await Product.find({});
        let updatedCount = 0;
        let processedCount = 0;
        
        console.log(`📊 Found ${products.length} products to process`);
        
        for (const product of products) {
            processedCount++;
            let needsUpdate = false;
            const updates = {};
            
            console.log(`\n🔄 Processing product ${processedCount}/${products.length}: ${product.productName || product.name}`);
            
            // Fix 1: Missing main images - copy from first variant
            if ((!product.images || product.images.length === 0) && 
                product.variants?.[0]?.images?.length > 0) {
                
                updates.images = product.variants[0].images.map((url, index) => {
                    // Handle both string URLs and object URLs
                    const imageUrl = typeof url === 'string' ? url : url.url || url;
                    return {
                        url: imageUrl,
                        order: index,
                        alt: `${product.productName || product.name} image ${index + 1}`,
                        isMain: index === 0
                    };
                });
                needsUpdate = true;
                console.log(`  📸 Fixed images: Found ${updates.images.length} images from variant`);
            }
            
            // Fix 2: Missing main videos - copy from first variant
            if ((!product.videos || product.videos.length === 0) && 
                product.variants?.[0]?.videos?.length > 0) {
                
                updates.videos = product.variants[0].videos.map((url, index) => {
                    const videoUrl = typeof url === 'string' ? url : url.url || url;
                    return {
                        url: videoUrl,
                        order: index,
                        title: `${product.productName || product.name} video ${index + 1}`
                    };
                });
                needsUpdate = true;
                console.log(`  🎥 Fixed videos: Found ${updates.videos.length} videos from variant`);
            }
            
            // Fix 3: Missing imageUrl (main product image)
            if (!product.imageUrl) {
                let mainImageUrl = '';
                
                // Try to get from main images
                if (product.images?.[0]?.url) {
                    mainImageUrl = product.images[0].url;
                } else if (product.variants?.[0]?.images?.[0]) {
                    const firstVariantImage = product.variants[0].images[0];
                    mainImageUrl = typeof firstVariantImage === 'string' ? firstVariantImage : firstVariantImage.url || firstVariantImage;
                }
                
                if (mainImageUrl) {
                    updates.imageUrl = mainImageUrl;
                    needsUpdate = true;
                    console.log(`  🖼️ Fixed imageUrl: ${mainImageUrl.substring(0, 50)}...`);
                }
            }
            
            // Fix 4: Missing name field (legacy compatibility)
            if (!product.name && product.productName) {
                updates.name = product.productName;
                needsUpdate = true;
                console.log(`  📝 Fixed name field: ${product.productName}`);
            }
            
            // Fix 5: Missing stock calculation
            const calculatedStock = product.sizes?.reduce((total, size) => total + (size.quantity || 0), 0) || 0;
            if (!product.stock && calculatedStock > 0) {
                updates.stock = calculatedStock;
                needsUpdate = true;
                console.log(`  📦 Fixed stock: ${calculatedStock}`);
            }
            
            // Fix 6: Missing totalStock field
            if (!product.totalStock && calculatedStock > 0) {
                updates.totalStock = calculatedStock;
                needsUpdate = true;
                console.log(`  📊 Fixed totalStock: ${calculatedStock}`);
            }
            
            // Fix 7: Missing price field (legacy compatibility)
            if (!product.price && product.regularPrice) {
                updates.price = product.regularPrice;
                needsUpdate = true;
                console.log(`  💰 Fixed price: ${product.regularPrice}`);
            }
            
            // Fix 8: Clean up variant images structure
            if (product.variants && product.variants.length > 0) {
                const cleanedVariants = product.variants.map(variant => {
                    const cleanedVariant = { ...variant.toObject() };
                    
                    // Ensure images are properly structured
                    if (cleanedVariant.images) {
                        cleanedVariant.images = cleanedVariant.images.map(img => {
                            if (typeof img === 'string') return img;
                            if (img && typeof img === 'object' && img.url) return img.url;
                            return img;
                        }).filter(url => url && typeof url === 'string');
                    }
                    
                    // Ensure videos are properly structured
                    if (cleanedVariant.videos) {
                        cleanedVariant.videos = cleanedVariant.videos.map(vid => {
                            if (typeof vid === 'string') return vid;
                            if (vid && typeof vid === 'object' && vid.url) return vid.url;
                            return vid;
                        }).filter(url => url && typeof url === 'string');
                    }
                    
                    return cleanedVariant;
                });
                
                if (JSON.stringify(cleanedVariants) !== JSON.stringify(product.variants)) {
                    updates.variants = cleanedVariants;
                    needsUpdate = true;
                    console.log(`  🔧 Fixed variant structure`);
                }
            }
            
            // Fix 9: Ensure status is valid
            if (!['draft', 'published', 'scheduled'].includes(product.status)) {
                updates.status = 'draft';
                needsUpdate = true;
                console.log(`  📋 Fixed status: ${product.status} -> draft`);
            }
            
            // Apply updates if needed
            if (needsUpdate) {
                try {
                    await Product.findByIdAndUpdate(product._id, updates, { new: true });
                    updatedCount++;
                    console.log(`  ✅ Updated product: ${product.productName || product.name}`);
                } catch (error) {
                    console.error(`  ❌ Failed to update product ${product._id}:`, error.message);
                }
            } else {
                console.log(`  ⏭️ No updates needed`);
            }
        }
        
        console.log(`\n🎉 Migration completed!`);
        console.log(`📊 Processed: ${processedCount} products`);
        console.log(`✅ Updated: ${updatedCount} products`);
        console.log(`⏭️ Skipped: ${processedCount - updatedCount} products (no updates needed)`);
        
        // Test a sample product to verify the fix
        const sampleProduct = await Product.findOne({}).populate('categoryId subCategoryId');
        if (sampleProduct) {
            console.log(`\n🧪 Sample product verification:`);
            console.log(`- Name: ${sampleProduct.productName || sampleProduct.name}`);
            console.log(`- Images: ${sampleProduct.images?.length || 0} main images`);
            console.log(`- Videos: ${sampleProduct.videos?.length || 0} main videos`);
            console.log(`- ImageURL: ${sampleProduct.imageUrl ? 'Present' : 'Missing'}`);
            console.log(`- Stock: ${sampleProduct.stock || 0}`);
            console.log(`- Variant Images: ${sampleProduct.variants?.[0]?.images?.length || 0}`);
            console.log(`- Status: ${sampleProduct.status}`);
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📤 Disconnected from MongoDB');
    }
}

// Test function to verify data structure
async function testProductDataStructure() {
    try {
        console.log('🧪 Testing Product Data Structure...');
        
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yoraa', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        const products = await Product.find({}).limit(3);
        
        for (const product of products) {
            console.log(`\n📋 Product: ${product.productName || product.name}`);
            console.log(`  - ID: ${product._id}`);
            console.log(`  - Images: ${JSON.stringify(product.images?.length || 0)} main`);
            console.log(`  - Videos: ${JSON.stringify(product.videos?.length || 0)} main`);
            console.log(`  - ImageURL: ${product.imageUrl ? 'Present' : 'Missing'}`);
            console.log(`  - Variants: ${product.variants?.length || 0}`);
            
            if (product.variants?.[0]) {
                console.log(`  - Variant 1 Images: ${product.variants[0].images?.length || 0}`);
                console.log(`  - Variant 1 Videos: ${product.variants[0].videos?.length || 0}`);
            }
            
            console.log(`  - Stock: ${product.stock || 0}`);
            console.log(`  - Status: ${product.status}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'test') {
        testProductDataStructure();
    } else {
        migrateProductData();
    }
}

module.exports = {
    migrateProductData,
    testProductDataStructure
};
