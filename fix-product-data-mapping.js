// Fix for Product Data Mapping Issues
// This file contains the fixed logic for handling product data mapping

const mongoose = require('mongoose');

// Fixed Product Controller Methods
const fixedProductController = {
    
    // Enhanced getById with proper data mapping
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const product = await Product.findById(id)
                .populate('categoryId', 'name description')
                .populate('subCategoryId', 'name description');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Enhanced response with proper data mapping
            const enhancedProduct = {
                ...product.toObject(),
                
                // Map main images from variants if main images are empty
                images: product.images && product.images.length > 0 
                    ? product.images 
                    : (product.variants?.[0]?.images || []).map((url, index) => ({
                        url,
                        order: index,
                        alt: `Product image ${index + 1}`,
                        isMain: index === 0
                    })),
                
                // Map main videos from variants if main videos are empty  
                videos: product.videos && product.videos.length > 0 
                    ? product.videos 
                    : (product.variants?.[0]?.videos || []).map((url, index) => ({
                        url,
                        order: index,
                        title: `Product video ${index + 1}`
                    })),
                
                // Extract main imageUrl from first image
                imageUrl: product.imageUrl || 
                         (product.images?.[0]?.url) || 
                         (product.variants?.[0]?.images?.[0]) || 
                         '',
                
                // Calculate total stock from sizes
                stock: product.stock || 
                       product.sizes?.reduce((total, size) => total + (size.quantity || 0), 0) || 
                       product.variants?.reduce((total, variant) => {
                           return total + (variant.stockSizes?.reduce((vTotal, size) => vTotal + (size.quantity || 0), 0) || 0);
                       }, 0) || 0,
                
                // Add category and subcategory names
                category: product.categoryId?.name || '',
                subcategory: product.subCategoryId?.name || '',
                
                // Ensure price fields are consistent
                price: product.price || product.regularPrice || 0,
                
                // Add legacy fields for compatibility
                name: product.name || product.productName || product.title,
                
                // Total stock calculation
                totalStock: product.sizes?.reduce((total, size) => total + (size.quantity || 0), 0) || 0
            };

            res.status(200).json({
                success: true,
                message: 'Product fetched successfully',
                data: enhancedProduct,
                statusCode: 200
            });

        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch product',
                error: error.message
            });
        }
    },

    // Enhanced create method with better data mapping
    create: async (req, res) => {
        try {
            console.log('🚀 Enhanced Product create endpoint hit');
            
            // ... existing create logic with enhancements ...
            
            // After creating the product, ensure proper data mapping
            const savedProduct = await product.save();
            
            // Create enhanced response similar to getById
            const enhancedResponse = {
                ...savedProduct.toObject(),
                images: savedProduct.images && savedProduct.images.length > 0 
                    ? savedProduct.images 
                    : (savedProduct.variants?.[0]?.images || []).map((url, index) => ({
                        url,
                        order: index,
                        alt: `Product image ${index + 1}`,
                        isMain: index === 0
                    })),
                videos: savedProduct.videos && savedProduct.videos.length > 0 
                    ? savedProduct.videos 
                    : (savedProduct.variants?.[0]?.videos || []).map((url, index) => ({
                        url,
                        order: index,
                        title: `Product video ${index + 1}`
                    })),
                imageUrl: savedProduct.imageUrl || 
                         (savedProduct.variants?.[0]?.images?.[0]) || 
                         '',
                category: savedProduct.categoryId?.name || '',
                subcategory: savedProduct.subCategoryId?.name || '',
                name: savedProduct.productName,
                stock: savedProduct.sizes?.reduce((total, size) => total + (size.quantity || 0), 0) || 0,
                totalStock: savedProduct.sizes?.reduce((total, size) => total + (size.quantity || 0), 0) || 0
            };

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: enhancedResponse,
                statusCode: 201
            });

        } catch (error) {
            // ... error handling ...
        }
    }
};

// Database Migration Script to Fix Existing Data
const fixExistingProductData = async () => {
    try {
        const Product = require('./src/models/Product');
        
        console.log('Starting product data migration...');
        
        const products = await Product.find({});
        let updatedCount = 0;
        
        for (const product of products) {
            let needsUpdate = false;
            const updates = {};
            
            // Fix missing main images - copy from first variant
            if ((!product.images || product.images.length === 0) && 
                product.variants?.[0]?.images?.length > 0) {
                updates.images = product.variants[0].images.map((url, index) => ({
                    url,
                    order: index,
                    alt: `Product image ${index + 1}`,
                    isMain: index === 0
                }));
                needsUpdate = true;
            }
            
            // Fix missing main videos - copy from first variant
            if ((!product.videos || product.videos.length === 0) && 
                product.variants?.[0]?.videos?.length > 0) {
                updates.videos = product.variants[0].videos.map((url, index) => ({
                    url,
                    order: index,
                    title: `Product video ${index + 1}`
                }));
                needsUpdate = true;
            }
            
            // Fix missing imageUrl
            if (!product.imageUrl) {
                updates.imageUrl = product.variants?.[0]?.images?.[0] || '';
                needsUpdate = true;
            }
            
            // Fix missing name field
            if (!product.name && product.productName) {
                updates.name = product.productName;
                needsUpdate = true;
            }
            
            // Fix missing stock calculation
            if (!product.stock && product.sizes?.length > 0) {
                updates.stock = product.sizes.reduce((total, size) => total + (size.quantity || 0), 0);
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await Product.findByIdAndUpdate(product._id, updates);
                updatedCount++;
                console.log(`Updated product: ${product.productName} (${product._id})`);
            }
        }
        
        console.log(`Migration completed. Updated ${updatedCount} products.`);
        
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

module.exports = {
    fixedProductController,
    fixExistingProductData
};
