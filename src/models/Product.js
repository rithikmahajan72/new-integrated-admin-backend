const mongoose=require("mongoose")
const {Schema}=mongoose

// Platform pricing schema for different platforms
const platformPricingSchema = new Schema({
    enabled: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 }
}, { _id: false });

// Size schema with platform-specific pricing
const sizeSchema = new Schema({
    size: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    hsnCode: { type: String, maxlength: 8 }, // 8 digits as requested
    sku: { type: String, required: true }, // Format: men/tshirt/insomniac tshirt/2025/07/28/12345678
    barcode: { type: String, maxlength: 14 }, // 14 digits as requested
    platformPricing: {
        yoraa: platformPricingSchema,
        myntra: platformPricingSchema,
        amazon: platformPricingSchema,
        flipkart: platformPricingSchema,
        nykaa: platformPricingSchema
    }
}, { _id: false });

// Variant schema for different product variants
const variantSchema = new Schema({
    name: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs
    videos: [{ type: String }], // Array of video URLs
    colors: [{ type: String }], // Array of color options
    additionalData: { type: Schema.Types.Mixed } // Flexible additional data
}, { _id: false });

const productSchema= new Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Basic product information
    productName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    
    // Manufacturing and shipping details (merged from multiple parameters)
    manufacturingDetails: {
        type: String,
        default: ''
    },
    shippingAndReturns: {
        shippingDetails: [{ type: String }],
        returnPolicy: [{ type: String }],
        additionalInfo: { type: String }
    },
    
    // Pricing
    regularPrice: {
        type: Number,
        required: true,
        min: 0
    },
    salePrice: {
        type: Number,
        default: 0,
        min: 0
    },
    returnable: {
        type: Boolean,
        default: true
    },
    
    // Platform pricing for 5 different platforms (Yoraa as default)
    platformPricing: {
        yoraa: platformPricingSchema, // Default platform
        myntra: platformPricingSchema,
        amazon: platformPricingSchema,
        flipkart: platformPricingSchema,
        nykaa: platformPricingSchema
    },
    
    // Category and subcategory
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true
    },
    
    // Size and stock management
    stockSizeOption: {
        type: String,
        enum: ['noSize', 'sizes'],
        default: 'sizes'
    },
    sizes: [sizeSchema],
    
    // Variants with images up to 5 (can be increased)
    variants: [variantSchema],
    
    // Size charts (uploaded as excel/image)
    sizeChart: {
        inchChart: { type: String }, // File URL
        cmChart: { type: String }, // File URL
        measurementImage: { type: String } // File URL
    },
    commonSizeChart: {
        cmChart: { type: String },
        inchChart: { type: String },
        measurementGuide: { type: String }
    },
    
    // Meta data fields
    metaTitle: {
        type: String,
        default: ''
    },
    metaDescription: {
        type: String,
        default: ''
    },
    slugUrl: {
        type: String,
        default: ''
    },
    
    // Filter assignment
    filters: [{
        key: { type: String },
        value: { type: String },
        code: { type: String }
    }],
    
    // Also show in options (different apps option)
    alsoShowInOptions: {
        youMightAlsoLike: { type: Boolean, default: false },
        similarItems: { type: Boolean, default: false },
        othersAlsoBought: { type: Boolean, default: false },
        // Dynamic options can be added
        customOptions: [{ 
            id: String, 
            label: String, 
            value: Boolean 
        }]
    },
    
    // Product status
    status: {
        type: String,
        enum: ['draft', 'published', 'scheduled'],
        default: 'draft'
    },
    
    // Scheduling fields
    scheduledDate: {
        type: String, // Store as string for date in YYYY-MM-DD format
        required: false
    },
    scheduledTime: {
        type: String, // Store as string for time in HH:MM format
        required: false
    },
    scheduledAt: {
        type: Date, // Combined date-time when the product was scheduled
        required: false
    },
    publishAt: {
        type: Date, // Exact date-time when the product should go live
        required: false
    },
    
    // Additional fields
    tags: [{ type: String }],
    
    // Legacy fields (keeping for backward compatibility)
    price: {
        type: Number,
        default: function() { return this.regularPrice; }
    },
    discountPercentage: {
        type: Number,
        default: 0,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default: function() { return this.categoryId; }
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: false
    },
    stockQuantity: {
        type: Number,
        default: function() { 
            return this.sizes?.reduce((total, size) => total + (size.quantity || 0), 0) || 0;
        }
    },
    prodSize: {
        type: String,
        required: false
    },
    thumbnail: {
        type: String,
        default: function() { 
            return this.variants?.[0]?.images?.[0] || '';
        }
    },
    images: {
        type: [String],
        default: function() {
            return this.variants?.flatMap(v => v.images || []) || [];
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{timestamps:true,versionKey:false})

module.exports=mongoose.model('Product',productSchema)