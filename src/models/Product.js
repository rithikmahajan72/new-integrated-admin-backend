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

// Variant schema for different product variants with enhanced fields
const variantSchema = new Schema({
    name: { type: String, required: true },
    
    // Basic variant information
    productName: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    manufacturingDetails: { type: String, default: '' },
    
    // Variant-specific pricing
    regularPrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    
    // Shipping and returns for variant
    shippingAndReturns: { type: Schema.Types.Mixed, default: {} },
    
    // Media for variant
    images: [{ type: String }], // Array of image URLs
    videos: [{ type: String }], // Array of video URLs
    
    // Variant filters and options
    filters: { type: Schema.Types.Mixed, default: {} },
    colors: [{ type: String }], // Array of color options
    
    // Variant size management
    stockSizes: [{ type: Schema.Types.Mixed }],
    customSizes: [{ type: Schema.Types.Mixed }],
    
    // Meta data for variant
    metaData: {
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
        slugUrl: { type: String, default: '' }
    },
    
    // Additional data for nested options
    additionalData: { type: Schema.Types.Mixed, default: {} }
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
    
    // Enhanced media management
    images: [{
        url: { type: String, required: true },
        order: { type: Number, default: 0 },
        alt: { type: String, default: '' },
        isMain: { type: Boolean, default: false }
    }],
    videos: [{
        url: { type: String, required: true },
        order: { type: Number, default: 0 },
        title: { type: String, default: '' }
    }],
    mediaOrder: [{ type: Number }],
    
    // Variants with enhanced structure
    variants: [variantSchema],
    
    // Enhanced filter assignment
    filters: [{ type: Schema.Types.Mixed }],
    productFilters: [{ type: Schema.Types.Mixed }],
    
    // Size charts (uploaded as excel/image)
    sizeChart: {
        inchChart: { type: String }, // File URL
        cmChart: { type: String }, // File URL
        measurementImage: { type: String } // File URL
    },
    commonSizeChart: {
        cmChart: { type: String },
        inchChart: { type: String },
        measurementGuide: { type: String },
        attachedToVariants: [{ type: Number }], // Array of variant indices
        globalChart: { type: String }
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
    
    // Enhanced also show in options
    alsoShowInOptions: {
        similarItems: {
            enabled: { type: Boolean, default: false },
            placement: { type: String, default: 'default' },
            items: [{ type: Schema.Types.Mixed }]
        },
        othersAlsoBought: {
            enabled: { type: Boolean, default: false },
            placement: { type: String, default: 'default' },
            items: [{ type: Schema.Types.Mixed }]
        },
        youMightAlsoLike: {
            enabled: { type: Boolean, default: false },
            placement: { type: String, default: 'default' },
            items: [{ type: Schema.Types.Mixed }]
        },
        customOptions: [{ type: Schema.Types.Mixed }],
        appPlacements: { type: Schema.Types.Mixed, default: {} }
    },
    
    // Enhanced publishing and scheduling options
    publishingOptions: {
        action: { type: String, enum: ['draft', 'publish', 'schedule', 'save_later'], default: 'draft' },
        scheduledDate: { type: String },
        scheduledTime: { type: String },
        publishAt: { type: Date },
        autoPublish: { type: Boolean, default: false },
        notificationSettings: { type: Schema.Types.Mixed, default: {} }
    },
    publishedAt: { type: Date },
    
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
    additionalData: { type: Schema.Types.Mixed, default: {} },
    
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