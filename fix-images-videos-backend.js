const Product = require('./src/models/Product');

/**
 * Backend-only solution to fix missing images and videos in existing products
 * This function automatically maps variant images/videos to main product fields
 */
async function fixProductImagesAndVideos() {
    try {
        console.log('🔧 Starting backend fix for product images and videos...');
        
        // Find all products with empty images/videos but have variant images/videos
        const productsToFix = await Product.find({
            $or: [
                { 
                    $and: [
                        { $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] },
                        { 'variants.0.images.0': { $exists: true } }
                    ]
                },
                { 
                    $and: [
                        { $or: [{ videos: { $exists: false } }, { videos: { $size: 0 } }] },
                        { 'variants.0.videos.0': { $exists: true } }
                    ]
                },
                { 
                    $and: [
                        { $or: [{ imageUrl: { $exists: false } }, { imageUrl: '' }] },
                        { 'variants.0.images.0': { $exists: true } }
                    ]
                }
            ]
        });

        console.log(`📊 Found ${productsToFix.length} products that need fixing`);

        let fixedCount = 0;

        for (const product of productsToFix) {
            const updates = {};
            let needsUpdate = false;

            // Fix main images if empty but variant has images
            if ((!product.images || product.images.length === 0) && 
                product.variants?.[0]?.images?.length > 0) {
                
                updates.images = product.variants[0].images.map((url, index) => {
                    const imageUrl = typeof url === 'string' ? url : url.url || url;
                    return {
                        url: imageUrl,
                        order: index,
                        alt: `${product.productName} image ${index + 1}`,
                        isMain: index === 0
                    };
                });
                needsUpdate = true;
                console.log(`  📸 Fixed images for: ${product.productName} (${updates.images.length} images)`);
            }

            // Fix main videos if empty but variant has videos
            if ((!product.videos || product.videos.length === 0) && 
                product.variants?.[0]?.videos?.length > 0) {
                
                updates.videos = product.variants[0].videos.map((url, index) => {
                    const videoUrl = typeof url === 'string' ? url : url.url || url;
                    return {
                        url: videoUrl,
                        order: index,
                        title: `${product.productName} video ${index + 1}`
                    };
                });
                needsUpdate = true;
                console.log(`  🎥 Fixed videos for: ${product.productName} (${updates.videos.length} videos)`);
            }

            // Fix imageUrl if empty but has images
            if (!product.imageUrl && product.variants?.[0]?.images?.[0]) {
                const firstImage = product.variants[0].images[0];
                updates.imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url || firstImage;
                needsUpdate = true;
                console.log(`  🖼️ Fixed imageUrl for: ${product.productName}`);
            }

            // Apply updates
            if (needsUpdate) {
                await Product.findByIdAndUpdate(product._id, updates, { new: true });
                fixedCount++;
                console.log(`  ✅ Updated product: ${product.productName}`);
            }
        }

        console.log(`🎉 Backend fix completed! Fixed ${fixedCount} products.`);
        return { success: true, fixedCount, totalChecked: productsToFix.length };

    } catch (error) {
        console.error('❌ Backend fix failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Middleware to automatically fix product data on API responses
 * Add this to your product routes
 */
function enhanceProductData(product) {
    const enhanced = product.toObject ? product.toObject() : { ...product };

    // Map main images from variants if main images are empty
    if ((!enhanced.images || enhanced.images.length === 0) && 
        enhanced.variants?.[0]?.images?.length > 0) {
        
        enhanced.images = enhanced.variants[0].images.map((url, index) => {
            const imageUrl = typeof url === 'string' ? url : url.url || url;
            return {
                url: imageUrl,
                order: index,
                alt: `${enhanced.productName} image ${index + 1}`,
                isMain: index === 0
            };
        });
    }

    // Map main videos from variants if main videos are empty
    if ((!enhanced.videos || enhanced.videos.length === 0) && 
        enhanced.variants?.[0]?.videos?.length > 0) {
        
        enhanced.videos = enhanced.variants[0].videos.map((url, index) => {
            const videoUrl = typeof url === 'string' ? url : url.url || url;
            return {
                url: videoUrl,
                order: index,
                title: `${enhanced.productName} video ${index + 1}`
            };
        });
    }

    // Set imageUrl if empty
    if (!enhanced.imageUrl) {
        if (enhanced.images?.[0]?.url) {
            enhanced.imageUrl = enhanced.images[0].url;
        } else if (enhanced.variants?.[0]?.images?.[0]) {
            const firstImage = enhanced.variants[0].images[0];
            enhanced.imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url || firstImage;
        }
    }

    // Add category and subcategory names if populated
    if (enhanced.categoryId?.name) {
        enhanced.category = enhanced.categoryId.name;
    }
    if (enhanced.subCategoryId?.name) {
        enhanced.subcategory = enhanced.subCategoryId.name;
    }

    // Ensure name field exists
    if (!enhanced.name) {
        enhanced.name = enhanced.productName || enhanced.title;
    }

    // Calculate stock if not present
    if (!enhanced.stock && enhanced.sizes?.length > 0) {
        enhanced.stock = enhanced.sizes.reduce((total, size) => total + (size.quantity || 0), 0);
    }

    // Calculate totalStock
    if (!enhanced.totalStock && enhanced.sizes?.length > 0) {
        enhanced.totalStock = enhanced.sizes.reduce((total, size) => total + (size.quantity || 0), 0);
    }

    return enhanced;
}

/**
 * Express middleware to enhance all product responses
 */
function productEnhancementMiddleware(req, res, next) {
    const originalJson = res.json;
    
    res.json = function(data) {
        if (data && data.success) {
            // Single product response
            if (data.data && data.data.productName) {
                data.data = enhanceProductData(data.data);
            }
            // Multiple products response
            else if (data.data && Array.isArray(data.data)) {
                data.data = data.data.map(product => enhanceProductData(product));
            }
            // Legacy product response
            else if (data.product && data.product.productName) {
                data.product = enhanceProductData(data.product);
            }
            // Legacy products response
            else if (data.products && Array.isArray(data.products)) {
                data.products = data.products.map(product => enhanceProductData(product));
            }
        }
        
        return originalJson.call(this, data);
    };
    
    next();
}

module.exports = {
    fixProductImagesAndVideos,
    enhanceProductData,
    productEnhancementMiddleware
};
