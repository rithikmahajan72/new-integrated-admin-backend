const mongoose = require("mongoose");
const { deleteFileFromS3 } = require("../utils/S3");

// Platform pricing schema for different platforms
const platformPricingSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 }
}, { _id: false });

// Size schema with platform-specific pricing
const sizeSchema = new mongoose.Schema({
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
const variantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs
    videos: [{ type: String }], // Array of video URLs
    colors: [{ type: String }], // Array of color options
    additionalData: { type: mongoose.Schema.Types.Mixed } // Flexible additional data
}, { _id: false });

// ==============================
// Item Schema Definition
// ==============================
const itemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true, // Ensure unique productId
      index: true,
    },
    
    // Basic product information
    productName: { type: String, index: true },
    title: { type: String, index: true },
    name: { type: String, required: true, index: true }, // Legacy field
    description: { type: String },
    
    // Manufacturing and shipping details (merged from multiple parameters)
    manufacturingDetails: { type: String, default: '' },
    shippingAndReturns: {
        shippingDetails: [{ type: String }],
        returnPolicy: [{ type: String }],
        additionalInfo: { type: String }
    },
    
    // Pricing
    regularPrice: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0 }, // Legacy field
    returnable: { type: Boolean, default: true },
    
    // Platform pricing for 5 different platforms (Yoraa as default)
    platformPricing: {
        yoraa: platformPricingSchema, // Default platform
        myntra: platformPricingSchema,
        amazon: platformPricingSchema,
        flipkart: platformPricingSchema,
        nykaa: platformPricingSchema
    },
    
    // Size and stock management
    stockSizeOption: {
        type: String,
        enum: ['noSize', 'sizes'],
        default: 'sizes'
    },
    sizes: [sizeSchema],
    stock: { type: Number, required: true, default: 0, min: 0 }, // Legacy field
    
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
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    slugUrl: { type: String, default: '' },
    
    // Categories
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    
    // Filter assignment
    filters: [
      {
        key: { type: String, required: true, index: true },
        value: { type: String, required: true, index: true },
        code: { type: String },
      },
    ],
    
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
    
    // Additional fields
    tags: [{ type: String }],
    
    // Legacy fields (keeping for backward compatibility)
    imageUrl: { type: String },
    brand: { type: String, index: true },
    style: [{ type: String, index: true }],
    occasion: [{ type: String, index: true }],
    fit: [{ type: String }],
    material: [{ type: String }],
    discountPrice: { type: Number, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    discountPercentage: { type: Number, default: 0 },
    isItemDetail: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ==============================
// Middleware: Auto-calculate discount percentage
// ==============================
itemSchema.pre("save", function (next) {
  if (this.discountPrice && this.price) {
    this.discountPercentage = ((this.price - this.discountPrice) / this.price) * 100;
  }
  next();
});

// ==============================
// Middleware: Cleanup on deletion
// ==============================
// - Deletes associated item details
// - Deletes item image from S3 if exists
itemSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  const itemId = this._id;

  // Delete associated ItemDetails
  await mongoose.model("ItemDetails").deleteOne({ items: itemId });

  // Delete associated image from S3
  if (this.imageUrl) {
    await deleteFileFromS3(this.imageUrl);
  }

  next();
});

// Export the Item model
module.exports = mongoose.model("Item", itemSchema);
