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
