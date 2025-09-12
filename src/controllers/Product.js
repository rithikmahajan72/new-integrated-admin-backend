const { Schema, default: mongoose } = require("mongoose")
const Product=require("../models/Product")

exports.create=async(req,res)=>{
    try {
        console.log('Product create endpoint hit');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        // Enhanced product creation with new fields
        const {
            productName,
            title,
            description,
            manufacturingDetails,
            shippingAndReturns,
            regularPrice,
            salePrice,
            returnable = true,
            metaTitle,
            metaDescription,
            slugUrl,
            categoryId,
            subCategoryId,
            status = 'draft',
            platformPricing = {},
            stockSizeOption = 'sizes',
            sizes = [],
            variants = [],
            alsoShowInOptions = {},
            sizeChart = {},
            commonSizeChart = {},
            filters = [],
            tags = []
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
            
            // Platform pricing for 5 different platforms (Yoraa as default)
            platformPricing: {
                yoraa: { // Default platform
                    enabled: true,
                    price: parseFloat(regularPrice) || 0,
                    salePrice: parseFloat(salePrice) || 0,
                    ...platformPricing.yoraa
                },
                myntra: {
                    enabled: platformPricing.myntra?.enabled || false,
                    price: parseFloat(platformPricing.myntra?.price) || parseFloat(regularPrice) || 0,
                    salePrice: parseFloat(platformPricing.myntra?.salePrice) || parseFloat(salePrice) || 0
                },
                amazon: {
                    enabled: platformPricing.amazon?.enabled || false,
                    price: parseFloat(platformPricing.amazon?.price) || parseFloat(regularPrice) || 0,
                    salePrice: parseFloat(platformPricing.amazon?.salePrice) || parseFloat(salePrice) || 0
                },
                flipkart: {
                    enabled: platformPricing.flipkart?.enabled || false,
                    price: parseFloat(platformPricing.flipkart?.price) || parseFloat(regularPrice) || 0,
                    salePrice: parseFloat(platformPricing.flipkart?.salePrice) || parseFloat(salePrice) || 0
                },
                nykaa: {
                    enabled: platformPricing.nykaa?.enabled || false,
                    price: parseFloat(platformPricing.nykaa?.price) || parseFloat(regularPrice) || 0,
                    salePrice: parseFloat(platformPricing.nykaa?.salePrice) || parseFloat(salePrice) || 0
                }
            },
            
            // Size and stock management
            stockSizeOption,
            sizes: sizes.map(size => ({
                size: size.size,
                quantity: parseInt(size.quantity) || 0,
                hsnCode: size.hsnCode || '',
                sku: size.sku || `${categoryId}/${subCategoryId}/${productName}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.random().toString().slice(2, 10)}`,
                barcode: size.barcode || '',
                platformPricing: size.platformPricing || {}
            })),
            
            // Variants and media - Transform image objects to URLs
            variants: variants.map(variant => ({
                name: variant.name,
                images: (variant.images || []).map(img => {
                    // If it's already a string (URL), return as is
                    if (typeof img === 'string') return img;
                    // If it's an object with url property, extract the URL
                    if (img && typeof img === 'object' && img.url) return img.url;
                    // Otherwise return empty string as fallback
                    return '';
                }).filter(url => url !== ''), // Remove empty URLs
                videos: (variant.videos || []).map(vid => {
                    if (typeof vid === 'string') return vid;
                    if (vid && typeof vid === 'object' && vid.url) return vid.url;
                    return '';
                }).filter(url => url !== ''),
                colors: variant.colors || [],
                additionalData: variant.additionalData || {}
            })),
            
            // Additional options - Transform frontend format to backend format
            alsoShowInOptions: {
                youMightAlsoLike: (() => {
                    console.log('Transform youMightAlsoLike:', alsoShowInOptions?.youMightAlsoLike);
                    return alsoShowInOptions?.youMightAlsoLike?.value === 'yes' || Boolean(alsoShowInOptions?.youMightAlsoLike);
                })(),
                similarItems: (() => {
                    console.log('Transform similarItems:', alsoShowInOptions?.similarItems);
                    return alsoShowInOptions?.similarItems?.value === 'yes' || Boolean(alsoShowInOptions?.similarItems);
                })(),
                othersAlsoBought: (() => {
                    console.log('Transform othersAlsoBought:', alsoShowInOptions?.othersAlsoBought);
                    return alsoShowInOptions?.othersAlsoBought?.value === 'yes' || Boolean(alsoShowInOptions?.othersAlsoBought);
                })(),
                customOptions: alsoShowInOptions?.customOptions || []
            },
            sizeChart: {
                inchChart: sizeChart?.inchChart || null,
                cmChart: sizeChart?.cmChart || null,
                measurementImage: sizeChart?.measurementImage || null
            },
            commonSizeChart: {
                cmChart: commonSizeChart?.cmChart || null,
                inchChart: commonSizeChart?.inchChart || null,
                measurementGuide: commonSizeChart?.measurementGuide || null
            },
            filters,
            tags,
            
            // Timestamps
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Debug: Log the product data being created
        console.log('Creating product with data:', JSON.stringify(productData, null, 2));
        
        const created = new Product(productData);
        
        // Validate before saving
        const validationError = created.validateSync();
        if (validationError) {
            console.log('Validation error:', validationError.errors);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.keys(validationError.errors).reduce((acc, key) => {
                    acc[key] = validationError.errors[key].message;
                    return acc;
                }, {})
            });
        }
        
        await created.save();
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: created
        });
    } catch (error) {
        console.log('Detailed error creating product:', error);
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        if (error.errors) {
            console.log('Validation errors:', error.errors);
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error adding product, please try again later',
            error: error.message,
            details: error.errors || {}
        });
    }
}

exports.getAll = async (req, res) => {
    try {
        const filter={}
        const sort={}
        let skip=0
        let limit=0

        if(req.query.brand){
            filter.brand={$in:req.query.brand}
        }

        if(req.query.category){
            filter.category={$in:req.query.category}
        }

        if(req.query.user){
            filter['isDeleted']=false
        }

        if(req.query.sort){
            sort[req.query.sort]=req.query.order?req.query.order==='asc'?1:-1:1
        }

        if(req.query.page && req.query.limit){

            const pageSize=req.query.limit
            const page=req.query.page

            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Product.find(filter).sort(sort).populate("brand").countDocuments().exec()
        const results=await Product.find(filter).sort(sort).populate("brand").skip(skip).limit(limit).exec()

        res.set("X-Total-Count",totalDocs)

        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching products, please try again later'})
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


