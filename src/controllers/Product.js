const { Schema, default: mongoose } = require("mongoose")
const Product=require("../models/Product")

exports.create=async(req,res)=>{
    try {
        console.log('Product create endpoint hit');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        // Enhanced product creation with comprehensive form fields
        const {
            // Basic product information
            productName,
            title,
            description,
            manufacturingDetails,
            shippingAndReturns,
            
            // Pricing
            regularPrice,
            salePrice,
            returnable = true,
            
            // Meta data fields
            metaTitle,
            metaDescription,
            slugUrl,
            
            // Category assignment
            categoryId,
            subCategoryId,
            
            // Status and platforms (frontend sends 'live' for published, 'draft' for draft)
            status = 'draft',
            platformPricing = {},
            
            // Size and stock management
            stockSizeOption = 'sizes',
            sizes = [],
            customSizes = [],
            
            // Media management
            images = [],
            videos = [],
            mediaOrder = [],
            
            // Variants with comprehensive data
            variants = [],
            
            // Filter assignments
            filters = [],
            productFilters = [],
            
            // Also show in options (frontend sends nested structure)
            alsoShowInOptions = {},
            
            // Size charts
            sizeChart = {},
            commonSizeChart = {},
            
            // Tags and additional data
            tags = [],
            additionalData = {},
            
            // Publishing options from frontend
            publishingAction,
            scheduledDate,
            scheduledTime,
            publishAt
        } = req.body;

        // Validate required fields
        if (!productName || !categoryId || !subCategoryId) {
            return res.status(400).json({
                success: false,
                message: 'Product name, category, and subcategory are required'
            });
        }

        // Validate that no blob URLs are being sent (critical security check)
        const validateUrls = (urlArray, type) => {
            if (Array.isArray(urlArray)) {
                const blobUrls = urlArray.filter(url => typeof url === 'string' && url.startsWith('blob:'));
                if (blobUrls.length > 0) {
                    console.error(`❌ BLOB URL DETECTED: Found ${blobUrls.length} blob URL(s) in ${type}:`, blobUrls);
                    throw new Error(`Invalid ${type} URLs detected. Found ${blobUrls.length} temporary blob URL(s). Please ensure all files are properly uploaded to the server before submitting.`);
                }
            }
        };

        // Check main product images/videos
        validateUrls(images, 'product images');
        validateUrls(videos, 'product videos');

        // Check variants for blob URLs
        if (variants && Array.isArray(variants)) {
            variants.forEach((variant, index) => {
                if (variant.images) {
                    validateUrls(variant.images, `images in variant ${index + 1}`);
                }
                if (variant.videos) {
                    validateUrls(variant.videos, `videos in variant ${index + 1}`);
                }
            });
        }

        console.log('✅ URL validation passed - no blob URLs detected');

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID format'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subcategory ID format'
            });
        }

        // Generate unique product ID
        const productId = `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Process platform pricing - frontend sends all platforms enabled by default
        const processedPlatformPricing = {
            yoraa: { 
                enabled: true, // Always enabled as default platform
                price: parseFloat(regularPrice) || 0,
                salePrice: parseFloat(salePrice) || 0
            },
            myntra: {
                enabled: platformPricing.myntra?.enabled !== false, // Default to true unless explicitly disabled
                price: parseFloat(platformPricing.myntra?.price) || parseFloat(regularPrice) || 0,
                salePrice: parseFloat(platformPricing.myntra?.salePrice) || parseFloat(salePrice) || 0
            },
            amazon: {
                enabled: platformPricing.amazon?.enabled !== false, // Default to true unless explicitly disabled
                price: parseFloat(platformPricing.amazon?.price) || parseFloat(regularPrice) || 0,
                salePrice: parseFloat(platformPricing.amazon?.salePrice) || parseFloat(salePrice) || 0
            },
            flipkart: {
                enabled: platformPricing.flipkart?.enabled !== false, // Default to true unless explicitly disabled
                price: parseFloat(platformPricing.flipkart?.price) || parseFloat(regularPrice) || 0,
                salePrice: parseFloat(platformPricing.flipkart?.salePrice) || parseFloat(salePrice) || 0
            },
            nykaa: {
                enabled: platformPricing.nykaa?.enabled !== false, // Default to true unless explicitly disabled
                price: parseFloat(platformPricing.nykaa?.price) || parseFloat(regularPrice) || 0,
                salePrice: parseFloat(platformPricing.nykaa?.salePrice) || parseFloat(salePrice) || 0
            }
        };

        // Process sizes with enhanced structure and platform-specific pricing
        const processedSizes = (stockSizeOption === 'sizes' ? (customSizes.length > 0 ? customSizes : sizes) : []).map(size => {
            const sizeData = {
                size: size.size || size.name,
                quantity: parseInt(size.quantity) || 0,
                hsnCode: size.hsnCode || '',
                sku: size.sku || `${categoryId.slice(-6)}/${subCategoryId.slice(-6)}/${productName.toLowerCase().replace(/\s+/g, '-')}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.random().toString().slice(2, 8)}`,
                barcode: size.barcode || '',
                platformPricing: {
                    yoraa: { 
                        price: parseFloat(size.yoraaPrice) || parseFloat(size.price) || parseFloat(regularPrice) || 0 
                    },
                    myntra: { 
                        price: parseFloat(size.myntraPrice) || parseFloat(size.price) || parseFloat(regularPrice) || 0 
                    },
                    amazon: { 
                        price: parseFloat(size.amazonPrice) || parseFloat(size.price) || parseFloat(regularPrice) || 0 
                    },
                    flipkart: { 
                        price: parseFloat(size.flipkartPrice) || parseFloat(size.price) || parseFloat(regularPrice) || 0 
                    },
                    nykaa: { 
                        price: parseFloat(size.nykaaPrice) || parseFloat(size.price) || parseFloat(regularPrice) || 0 
                    }
                }
            };

            return sizeData;
        });

        // Process variants with comprehensive nested options and frontend data structure
        const processedVariants = variants.map((variant, index) => {
            // Extract data from additionalData if present (frontend structure)
            const additionalData = variant.additionalData || {};
            
            const variantData = {
                name: variant.name || `Variant ${index + 1}`,
                
                // Handle inheritance from first variant (copyFromVariant1 checkboxes)
                productName: variant.copyFromVariant1?.productName ? 
                    (variants[0]?.productName || variants[0]?.additionalData?.productName || productName) : 
                    (variant.productName || additionalData.productName || ''),
                    
                title: variant.copyFromVariant1?.title ? 
                    (variants[0]?.title || variants[0]?.additionalData?.title || title) : 
                    (variant.title || additionalData.title || ''),
                    
                description: variant.copyFromVariant1?.description ? 
                    (variants[0]?.description || variants[0]?.additionalData?.description || description) : 
                    (variant.description || additionalData.description || ''),
                    
                manufacturingDetails: variant.copyFromVariant1?.manufacturingDetails ? 
                    (variants[0]?.manufacturingDetails || variants[0]?.additionalData?.manufacturingDetails || manufacturingDetails) : 
                    (variant.manufacturingDetails || additionalData.manufacturingDetails || ''),
                    
                shippingAndReturns: variant.copyFromVariant1?.shippingAndReturns ? 
                    (variants[0]?.shippingAndReturns || variants[0]?.additionalData?.shippingAndReturns || shippingAndReturns) : 
                    (variant.shippingAndReturns || additionalData.shippingAndReturns || {}),
                    
                regularPrice: variant.copyFromVariant1?.regularPrice ? 
                    parseFloat(variants[0]?.regularPrice || variants[0]?.additionalData?.regularPrice || regularPrice) : 
                    parseFloat(variant.regularPrice || additionalData.regularPrice) || 0,
                    
                salePrice: variant.copyFromVariant1?.salePrice ? 
                    parseFloat(variants[0]?.salePrice || variants[0]?.additionalData?.salePrice || salePrice) : 
                    parseFloat(variant.salePrice || additionalData.salePrice) || 0,
                    
                stockSizes: variant.copyFromVariant1?.stockSizes ? 
                    (variants[0]?.stockSizes || variants[0]?.additionalData?.stockSizes || sizes) : 
                    (variant.stockSizes || additionalData.stockSizes || []),
                
                // Media handling - clean up URLs from frontend format
                images: (variant.images || []).map(img => {
                    if (typeof img === 'string') return img;
                    if (img && typeof img === 'object' && img.url) return img.url;
                    return '';
                }).filter(url => url !== ''),
                
                videos: (variant.videos || []).map(vid => {
                    if (typeof vid === 'string') return vid;
                    if (vid && typeof vid === 'object' && vid.url) return vid.url;
                    return '';
                }).filter(url => url !== ''),
                
                // Filter and color management
                filters: variant.filters || additionalData.filters || {},
                colors: variant.colors || [],
                customSizes: variant.customSizes || additionalData.customSizes || [],
                
                // Nesting conditions for variant relationships
                nestingConditions: {
                    copyFromVariant1: variant.copyFromVariant1 || {},
                    inheritanceRules: variant.inheritanceRules || {},
                    conditionalFields: variant.conditionalFields || {}
                },
                
                // Meta data for variant
                metaData: {
                    metaTitle: variant.metaTitle || '',
                    metaDescription: variant.metaDescription || '',
                    slugUrl: variant.slugUrl || ''
                },
                
                // Additional data for advanced variant features
                additionalData: {
                    variantIndex: index,
                    isBaseVariant: index === 0,
                    inheritanceSettings: variant.inheritanceSettings || {},
                    customAttributes: variant.customAttributes || {},
                    ...additionalData
                }
            };
            
            return variantData;
        });

        // Process media with order management
        const processedImages = (images || []).map((img, index) => ({
            url: typeof img === 'string' ? img : (img && img.url ? img.url : ''),
            order: mediaOrder[index] || index,
            alt: img && img.alt ? img.alt : `Product image ${index + 1}`,
            isMain: index === 0
        })).filter(img => img.url);

        const processedVideos = (videos || []).map((vid, index) => ({
            url: typeof vid === 'string' ? vid : (vid && vid.url ? vid.url : ''),
            order: index,
            title: vid && vid.title ? vid.title : `Product video ${index + 1}`
        })).filter(vid => vid.url);

        // Map frontend status values to backend model enum values
        const mappedStatus = status === 'live' ? 'published' : (status || 'draft');

        const productData = {
            productId,
            productName,
            title: title || productName,
            description: description || '',
            manufacturingDetails: manufacturingDetails || '',
            shippingAndReturns: shippingAndReturns || {},
            regularPrice: parseFloat(regularPrice) || 0,
            salePrice: parseFloat(salePrice) || 0,
            returnable: Boolean(returnable),
            metaTitle: metaTitle || productName,
            metaDescription: metaDescription || description || '',
            slugUrl: slugUrl || `${productName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            categoryId,
            subCategoryId,
            status: mappedStatus,
            platformPricing: processedPlatformPricing,
            stockSizeOption,
            sizes: processedSizes,
            images: processedImages,
            videos: processedVideos,
            mediaOrder: mediaOrder,
            variants: processedVariants,
            filters: filters || [],
            productFilters: productFilters || [],
            alsoShowInOptions: {
                // Enhanced "Also Show In" options for app placement
                similarItems: {
                    enabled: Boolean(alsoShowInOptions?.similarItems?.enabled),
                    placement: alsoShowInOptions?.similarItems?.placement || 'default',
                    items: Array.isArray(alsoShowInOptions?.similarItems?.items) 
                        ? alsoShowInOptions.similarItems.items : []
                },
                othersAlsoBought: {
                    enabled: Boolean(alsoShowInOptions?.othersAlsoBought?.enabled),
                    placement: alsoShowInOptions?.othersAlsoBought?.placement || 'default',
                    items: Array.isArray(alsoShowInOptions?.othersAlsoBought?.items) 
                        ? alsoShowInOptions.othersAlsoBought.items : []
                },
                youMightAlsoLike: {
                    enabled: Boolean(alsoShowInOptions?.youMightAlsoLike?.enabled),
                    placement: alsoShowInOptions?.youMightAlsoLike?.placement || 'default',
                    items: Array.isArray(alsoShowInOptions?.youMightAlsoLike?.items) 
                        ? alsoShowInOptions.youMightAlsoLike.items : []
                },
                customOptions: Array.isArray(alsoShowInOptions?.customOptions) 
                    ? alsoShowInOptions.customOptions : [],
                appPlacements: alsoShowInOptions?.appPlacements || {}
            },
            sizeChart: {
                cmChart: (sizeChart && typeof sizeChart.cmChart === 'string') ? sizeChart.cmChart : '',
                measurementImage: (sizeChart && typeof sizeChart.measurementImage === 'string') ? sizeChart.measurementImage : '',
                inchChart: (sizeChart && typeof sizeChart.inchChart === 'string') ? sizeChart.inchChart : ''
            },
            commonSizeChart: {
                inchChart: (commonSizeChart && typeof commonSizeChart.inchChart === 'string') ? commonSizeChart.inchChart : '',
                measurementGuide: (commonSizeChart && typeof commonSizeChart.measurementGuide === 'string') ? commonSizeChart.measurementGuide : '',
                cmChart: (commonSizeChart && typeof commonSizeChart.cmChart === 'string') ? commonSizeChart.cmChart : '',
                // Attach common size charts with variants
                attachedToVariants: commonSizeChart?.attachedToVariants || [],
                globalChart: (commonSizeChart && typeof commonSizeChart.globalChart === 'string') ? commonSizeChart.globalChart : ''
            },
            tags: Array.isArray(tags) ? tags : [],
            additionalData: additionalData || {},
            
            // Enhanced publishing and scheduling options
            publishingOptions: {
                action: req.body.publishingAction || 'draft', // 'draft', 'publish', 'schedule', 'save_later'
                scheduledDate: req.body.scheduledDate || null,
                scheduledTime: req.body.scheduledTime || null,
                publishAt: req.body.publishAt ? new Date(req.body.publishAt) : null,
                autoPublish: Boolean(req.body.autoPublish),
                notificationSettings: req.body.notificationSettings || {}
            },
            
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Handle different publishing actions
        if (req.body.publishingAction) {
            switch (req.body.publishingAction) {
                case 'publish':
                    productData.status = 'published';
                    productData.publishedAt = new Date();
                    break;
                case 'schedule':
                    if (req.body.publishAt) {
                        productData.status = 'scheduled';
                        productData.publishAt = new Date(req.body.publishAt);
                    } else {
                        productData.status = 'draft';
                    }
                    break;
                case 'save_later':
                case 'draft':
                default:
                    productData.status = 'draft';
                    break;
            }
        } else if (status === 'live') {
            // Handle direct status submission from frontend (live = published)
            productData.status = 'published';
            productData.publishedAt = new Date();
        }

        console.log('Processed product data:', JSON.stringify(productData, null, 2));

        const product = new Product(productData);
        const savedProduct = await product.save();

        console.log('Product created successfully:', savedProduct.productId);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: savedProduct
        });

    } catch (error) {
        console.error('Error in product creation:', error);
        
        // Handle blob URL validation errors with 400 status
        if (error.message && error.message.includes('blob URL')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

// Get all products with enhanced filtering
exports.getAll = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            categoryId, 
            subCategoryId, 
            status,
            platform,
            search 
        } = req.query;

        const query = {};

        // Apply filters
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            query.categoryId = categoryId;
        }

        if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
            query.subCategoryId = subCategoryId;
        }

        if (status) {
            query.status = status;
        }

        if (platform) {
            query[`platformPricing.${platform}.enabled`] = true;
        }

        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(query)
            .populate('categoryId', 'name')
            .populate('subCategoryId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalProducts: total,
                hasNext: skip + parseInt(limit) < total,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// Get single product by ID
exports.getById = async (req, res) => {
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

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// Update product
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('categoryId', 'name')
          .populate('subCategoryId', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('Error updating product:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// Delete product
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

// Publish a product immediately
exports.publishProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { 
                status: 'published',
                publishedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name')
          .populate('subCategoryId', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product published successfully',
            product
        });

    } catch (error) {
        console.error('Error publishing product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to publish product',
            error: error.message
        });
    }
};

// Schedule a product for future publishing
exports.scheduleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { publishAt, scheduledDate, scheduledTime } = req.body;

        let publishDate;
        if (publishAt) {
            publishDate = new Date(publishAt);
        } else if (scheduledDate && scheduledTime) {
            publishDate = new Date(`${scheduledDate}T${scheduledTime}`);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Publish date and time are required'
            });
        }

        if (publishDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Scheduled time must be in the future'
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { 
                status: 'scheduled',
                publishAt: publishDate,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name')
          .populate('subCategoryId', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product scheduled successfully',
            product,
            scheduledFor: publishDate
        });

    } catch (error) {
        console.error('Error scheduling product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to schedule product',
            error: error.message
        });
    }
};

// Cancel scheduled publishing
exports.cancelSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { 
                status: 'draft',
                publishAt: null,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name')
          .populate('subCategoryId', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Scheduled publishing cancelled successfully',
            product
        });

    } catch (error) {
        console.error('Error cancelling schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel schedule',
            error: error.message
        });
    }
};

// Undelete a product
exports.undeleteById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { 
                isDeleted: false,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name')
          .populate('subCategoryId', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product restored successfully',
            product
        });

    } catch (error) {
        console.error('Error restoring product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore product',
            error: error.message
        });
    }
};
