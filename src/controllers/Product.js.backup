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
            
            // Status and platforms
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
            
            // Also show in options
            alsoShowInOptions = {},
            
            // Size charts
            sizeChart = {},
            commonSizeChart = {},
            
            // Tags and additional data
            tags = [],
            additionalData = {}
        } = req.body;

        // Validate required fields
        if (!productName || !categoryId || !subCategoryId) {
            return res.status(400).json({
                success: false,
                message: 'Product name, category, and subcategory are required'
            });
        }

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

        // Process platform pricing with Yoraa as default and others as optional
        const processedPlatformPricing = {
            yoraa: { 
                enabled: true, // Always enabled
                price: parseFloat(regularPrice) || 0,
                salePrice: parseFloat(salePrice) || 0
            }
        };

        // Add other platforms only if they are enabled
        const otherPlatforms = ['myntra', 'amazon', 'flipkart', 'nykaa'];
        otherPlatforms.forEach(platform => {
            if (platformPricing[platform] && platformPricing[platform].enabled) {
                processedPlatformPricing[platform] = {
                    enabled: true,
                    price: parseFloat(platformPricing[platform].price) || parseFloat(regularPrice) || 0,
                    salePrice: parseFloat(platformPricing[platform].salePrice) || parseFloat(salePrice) || 0
                };
            }
        });

        // Process sizes with enhanced structure
        const processedSizes = (stockSizeOption === 'sizes' ? (customSizes.length > 0 ? customSizes : sizes) : []).map(size => {
            const sizeData = {
                size: size.size || size.name,
                quantity: parseInt(size.quantity) || 0,
                hsnCode: size.hsnCode || '',
                sku: size.sku || `${categoryId.slice(-6)}/${subCategoryId.slice(-6)}/${productName.toLowerCase().replace(/\s+/g, '-')}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.random().toString().slice(2, 8)}`,
                barcode: size.barcode || ''
            };

            return sizeData;
        });

        // Process variants with comprehensive nested options
        const processedVariants = variants.map((variant, index) => {
            return {
                name: variant.name || `Variant ${index + 1}`,
                productName: variant.productName || '',
                title: variant.title || '',
                description: variant.description || '',
                manufacturingDetails: variant.manufacturingDetails || '',
                regularPrice: parseFloat(variant.regularPrice) || 0,
                salePrice: parseFloat(variant.salePrice) || 0,
                shippingAndReturns: variant.shippingAndReturns || {},
                images: (variant.images || []).filter(img => img && (typeof img === 'string' || img.url)),
                videos: (variant.videos || []).filter(vid => vid && (typeof vid === 'string' || vid.url)),
                filters: variant.filters || {},
                colors: variant.colors || [],
                stockSizes: variant.stockSizes || [],
                customSizes: variant.customSizes || [],
                metaData: {
                    metaTitle: variant.metaTitle || '',
                    metaDescription: variant.metaDescription || '',
                    slugUrl: variant.slugUrl || ''
                },
                additionalData: variant.additionalData || {}
            };
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
            status,
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
                similarItems: Array.isArray(alsoShowInOptions && alsoShowInOptions.similarItems) 
                    ? alsoShowInOptions.similarItems : [],
                othersAlsoBought: Array.isArray(alsoShowInOptions && alsoShowInOptions.othersAlsoBought) 
                    ? alsoShowInOptions.othersAlsoBought : [],
                customOptions: Array.isArray(alsoShowInOptions && alsoShowInOptions.customOptions) 
                    ? alsoShowInOptions.customOptions : []
            },
            sizeChart: {
                cmChart: sizeChart && sizeChart.cmChart ? sizeChart.cmChart : null,
                measurementImage: sizeChart && sizeChart.measurementImage ? sizeChart.measurementImage : null
            },
            commonSizeChart: {
                inchChart: commonSizeChart && commonSizeChart.inchChart ? commonSizeChart.inchChart : null,
                measurementGuide: commonSizeChart && commonSizeChart.measurementGuide ? commonSizeChart.measurementGuide : null
            },
            tags: Array.isArray(tags) ? tags : [],
            additionalData: additionalData || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

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
            productFilters = [],
            
            // Also show in options
            alsoShowInOptions = {},
            
            // Size charts
            sizeChart = {},
            commonSizeChart = {},
            
            // Tags and additional data
            tags = [],
            additionalData = {}
        } = req.body;

        // Validate required fields
        if (!productName || !categoryId || !subCategoryId) {
            return res.status(400).json({
                success: false,
                message: 'Product name, category, and subcategory are required'
            });
        }

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

        // Process platform pricing with Yoraa as default and others as optional
        const processedPlatformPricing = {
            yoraa: { 
                enabled: true, // Always enabled
                price: parseFloat(regularPrice) || 0,
                salePrice: parseFloat(salePrice) || 0,
                ...platformPricing.yoraa
            }
        };

        // Add other platforms only if they are enabled
        const otherPlatforms = ['myntra', 'amazon', 'flipkart', 'nykaa'];
        otherPlatforms.forEach(platform => {
            if (platformPricing[platform]?.enabled) {
                processedPlatformPricing[platform] = {
                    enabled: true,
                    price: parseFloat(platformPricing[platform]?.price) || parseFloat(regularPrice) || 0,
                    salePrice: parseFloat(platformPricing[platform]?.salePrice) || parseFloat(salePrice) || 0
                };
            }
        });

        // Process sizes with enhanced structure
        const processedSizes = (stockSizeOption === 'sizes' ? (customSizes.length > 0 ? customSizes : sizes) : []).map(size => {
            const sizeData = {
                size: size.size || size.name,
                quantity: parseInt(size.quantity) || 0,
                hsnCode: size.hsnCode || '',
                sku: size.sku || `${categoryId.slice(-6)}/${subCategoryId.slice(-6)}/${productName.toLowerCase().replace(/\s+/g, '-')}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.random().toString().slice(2, 8)}`,
                barcode: size.barcode || '',
                platformPricing: {}
            };

            // Add platform-specific pricing for each enabled platform
            Object.keys(processedPlatformPricing).forEach(platform => {
                if (processedPlatformPricing[platform].enabled) {
                    sizeData.platformPricing[platform] = {
                        price: parseFloat(size[`${platform}Price`]) || parseFloat(size.price) || parseFloat(regularPrice) || 0
                    };
                }
            });

            return sizeData;
        });

        // Process variants with comprehensive nested options
        const processedVariants = variants.map((variant, index) => {
            const variantData = {
                name: variant.name || `Variant ${index + 1}`,
                
                // Basic variant information
                productName: variant.productName || '',
                title: variant.title || '',
                description: variant.description || '',
                manufacturingDetails: variant.manufacturingDetails || '',
                
                // Variant-specific pricing
                regularPrice: parseFloat(variant.regularPrice) || 0,
                salePrice: parseFloat(variant.salePrice) || 0,
                
                // Shipping and returns for variant
                shippingAndReturns: variant.shippingAndReturns || {},
                
                // Media for variant
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

                // Variant filters and options
                filters: variant.filters || {},
                colors: variant.colors || [],
                
                // Variant size management
                stockSizes: variant.stockSizes || [],
                customSizes: variant.customSizes || [],
                
                // Meta data for variant
                metaData: {
                    metaTitle: variant.metaTitle || '',
                    metaDescription: variant.metaDescription || '',
                    slugUrl: variant.slugUrl || ''
                },
                
                // Additional data for nested options
                additionalData: {
                    // Store variant-specific nested conditions
                    nestingConditions: variant.nestingConditions || {},
                    copyFromVariant1: variant.copyFromVariant1 || false,
                    ...variant.additionalData
                }
            };

            return variantData;
        });

        // Process media with order management
        const processedImages = (images || []).map((img, index) => ({
            url: typeof img === 'string' ? img : (img?.url || ''),
            order: mediaOrder[index] || index,
            alt: img?.alt || `Product image ${index + 1}`,
            isMain: index === 0
        })).filter(img => img.url);

        const processedVideos = (videos || []).map((vid, index) => ({
            url: typeof vid === 'string' ? vid : (vid?.url || ''),
            order: index,
            title: vid?.title || `Product video ${index + 1}`
        })).filter(vid => vid.url);

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
            status,
            
            // Enhanced platform pricing
            platformPricing: processedPlatformPricing,
            
            // Size and stock management
            stockSizeOption,
            sizes: processedSizes,
            
            // Enhanced media management
            images: processedImages,
            videos: processedVideos,
            mediaOrder: mediaOrder,
            
            // Filter assignments and product filters
            filters: filters || [],
            productFilters: productFilters || [],
            
            // Also show in options
            alsoShowInOptions: {
                similarItems: Array.isArray(alsoShowInOptions?.similarItems) 
                    ? alsoShowInOptions.similarItems 
                    : [],
                othersAlsoBought: Array.isArray(alsoShowInOptions?.othersAlsoBought) 
                    ? alsoShowInOptions.othersAlsoBought 
                    : [],
                customOptions: Array.isArray(alsoShowInOptions?.customOptions) 
                    ? alsoShowInOptions.customOptions 
                    : []
            },
            
            // Size charts
            sizeChart: {
                cmChart: sizeChart?.cmChart || null,
                measurementImage: sizeChart?.measurementImage || null
            },
            commonSizeChart: {
                inchChart: commonSizeChart?.inchChart || null,
                measurementGuide: commonSizeChart?.measurementGuide || null
            },
            
            // Tags and additional data
            tags: Array.isArray(tags) ? tags : [],
            additionalData: additionalData || {},
            
            // Timestamps
            createdAt: new Date(),
            updatedAt: new Date()
        };

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

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=await Product.findById(id).populate("brand").populate("category")
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting product details, please try again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Product.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating product, please try again later'})
    }
}

exports.undeleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const unDeleted=await Product.findByIdAndUpdate(id,{isDeleted:false},{new:true}).populate('brand')
        res.status(200).json(unDeleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error restoring product, please try again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true}).populate("brand")
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error deleting product, please try again later'})
    }
}

// Make a product live (publish from draft)
exports.publishProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (product.status === 'published') {
            return res.status(400).json({ message: 'Product is already published' });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                status: 'published',
                scheduledDate: null,
                scheduledTime: null,
                scheduledAt: null,
                publishAt: null
            },
            { new: true }
        ).populate('categoryId subCategoryId');
        
        res.status(200).json({
            message: 'Product published successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error publishing product, please try again later' });
    }
}

// Schedule a product for later publishing
exports.scheduleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledDate, scheduledTime, date, time } = req.body;
        
        // Support both formats (scheduledDate/scheduledTime and date/time)
        const scheduleDate = scheduledDate || date;
        const scheduleTime = scheduledTime || time;
        
        if (!scheduleDate || !scheduleTime) {
            return res.status(400).json({ 
                message: 'Schedule date and time are required' 
            });
        }
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Create the publishAt datetime
        const publishAtDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        
        // Validate that the scheduled time is in the future
        if (publishAtDateTime <= new Date()) {
            return res.status(400).json({ 
                message: 'Schedule time must be in the future' 
            });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                status: 'scheduled',
                scheduledDate: scheduleDate,
                scheduledTime: scheduleTime,
                scheduledAt: new Date(),
                publishAt: publishAtDateTime
            },
            { new: true }
        ).populate('categoryId subCategoryId');
        
        res.status(200).json({
            message: 'Product scheduled successfully',
            product: updatedProduct,
            publishAt: publishAtDateTime
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error scheduling product, please try again later' });
    }
}

// Cancel a scheduled product and move it back to draft
exports.cancelSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (product.status !== 'scheduled') {
            return res.status(400).json({ message: 'Product is not scheduled' });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                status: 'draft',
                scheduledDate: null,
                scheduledTime: null,
                scheduledAt: null,
                publishAt: null
            },
            { new: true }
        ).populate('categoryId subCategoryId');
        
        res.status(200).json({
            message: 'Schedule cancelled successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error cancelling schedule, please try again later' });
    }
}


