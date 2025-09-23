// Import required dependencies
const express = require("express"); // Express framework for routing
const multer = require("multer"); // Middleware for handling file uploads
const itemController = require("../controllers/itemController/ItemController"); // Controller for item-related logic
const { uploadMultipart, deleteFileFromS3 } = require("../utils/S3"); // S3 utilities for file upload and deletion
const mongoose = require("mongoose"); // Mongoose for MongoDB operations
const { ApiResponse } = require("../utils/ApiResponse"); // Utility to standardize API responses
const { verifyToken } = require("../middleware/VerifyToken"); // Middleware to verify JWT tokens
const Item = require("../models/Item"); // Mongoose model for Item collection
const SubCategory = require("../models/SubCategory"); // Mongoose model for SubCategory collection
const checkAdminRole = require("../middleware/checkAdminRole"); // Middleware to restrict access to admins

// Initialize an Express router instance
const itemRouter = express.Router();

// Configure multer for in-memory storage (files are stored in memory, not on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Multer instance for handling single file uploads

// POST /api/items/
// Creates a new item with an image upload (admin-only)
itemRouter.get(
  "/download",
  verifyToken,
  checkAdminRole,
  async (req, res) => {
    try {
      const items = await Item.find()
        .populate("subCategoryId", "name")
        .populate("categoryId", "name")
        .lean();
      res.setHeader("Content-Disposition", 'attachment; filename="items.json"');
      res.setHeader("Content-Type", "application/json");
      // Pretty-print JSON with 2-space indentation
      res.status(200).send(JSON.stringify(items, null, 2));
    } catch (error) {
      console.error("Error downloading items:", error);
      res
        .status(500)
        .json(
          ApiResponse(null, "Error downloading items", false, 500, error.message)
        );
    }
  }
);

// POST /api/items/upload-image
// Standalone image upload endpoint for frontend to upload individual images
itemRouter.post(
  "/upload-image",
  verifyToken, // Ensure user is authenticated
  checkAdminRole, // Ensure user has admin role
  upload.single("image"), // Handle single file upload (field name: "image")
  async (req, res) => {
    try {
      // Check if an image file was uploaded
      if (!req.file) {
        return res
          .status(400)
          .json(ApiResponse(null, "No file uploaded", false, 400));
      }

      // Generate a unique filename with timestamp
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substr(2, 9);
      const fileName = `upload_${timestamp}_${uniqueId}`;

      // Upload the image to AWS S3 in a general uploads folder
      const fileUrl = await uploadMultipart(
        req.file,
        `uploads/images`,
        fileName
      );

      console.log("Image uploaded to:", fileUrl);

      // Send success response with the uploaded image URL
      res
        .status(200)
        .json(ApiResponse({ imageUrl: fileUrl }, "Image uploaded successfully", true, 200));
    } catch (error) {
      console.error("Image upload error:", error);
      res
        .status(500)
        .json(
          ApiResponse(null, "Image upload failed", false, 500, error.message)
        );
    }
  }
);

// POST /api/items/upload-video
// Standalone video upload endpoint for frontend to upload individual videos
itemRouter.post(
  "/upload-video",
  verifyToken, // Ensure user is authenticated
  checkAdminRole, // Ensure user has admin role
  upload.single("video"), // Handle single file upload (field name: "video")
  async (req, res) => {
    try {
      // Check if a video file was uploaded
      if (!req.file) {
        return res
          .status(400)
          .json(ApiResponse(null, "No file uploaded", false, 400));
      }

      // Generate a unique filename with timestamp
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substr(2, 9);
      const fileName = `upload_${timestamp}_${uniqueId}`;

      // Upload the video to AWS S3 in a general uploads folder
      const fileUrl = await uploadMultipart(
        req.file,
        `uploads/videos`,
        fileName
      );

      console.log("Video uploaded to:", fileUrl);

      // Send success response with the uploaded video URL
      res
        .status(200)
        .json(ApiResponse({ videoUrl: fileUrl }, "Video uploaded successfully", true, 200));
    } catch (error) {
      console.error("Video upload error:", error);
      res
        .status(500)
        .json(
          ApiResponse(null, "Video upload failed", false, 500, error.message)
        );
    }
  }
);

// POST /api/items/text-only
// Creates a new item without file upload for text-only workflow (admin-only)
itemRouter.post(
  "/text-only",
  verifyToken, // Ensure user is authenticated
  checkAdminRole, // Ensure user has admin role
  async (req, res) => {
    console.log("Creating text-only item:", req.body);
    try {
      // Verify the provided subCategoryId exists
      const existingSubCategory = await SubCategory.findOne({
        _id: req.body.subCategoryId,
      });
      if (!existingSubCategory) {
        return res
          .status(404)
          .json(ApiResponse(null, "SubCategory not found", false, 404));
      }
      const categoryId = existingSubCategory.categoryId; // Get associated category ID

      // Check for duplicate item name (check both new and legacy fields)
      const existingItems = await Item.findOne({ 
        $or: [
          { productName: req.body.productName || req.body.name },
          { name: req.body.productName || req.body.name }
        ]
      });
      if (existingItems) {
        return res
          .status(400)
          .json(ApiResponse(null, "Item name already exists", false, 400));
      }

      // Generate a new MongoDB ObjectId for the item
      const newItemId = new mongoose.Types.ObjectId();

      // Attach categoryId to the request body for use in the controller
      req.body.categoryId = categoryId;

      // Call the controller to create the item (without image)
      const item = await itemController.createItem(req, res, newItemId);

      // The controller handles the response, so we don't need to send one here
    } catch (error) {
      console.error("Text-only item creation error:", error);
      res
        .status(500)
        .json(
          ApiResponse(null, "Item creation failed", false, 500, error.message)
        );
    }
  }
);

itemRouter.post(
  "/",
  verifyToken, // Ensure user is authenticated
  checkAdminRole, // Ensure user has admin role
  upload.single("image"), // Handle single file upload (field name: "image")
  async (req, res) => {
    console.log("qqqqqqqqqqqqqq"); // Debug log
    try {
      // Check if an image file was uploaded
      if (!req.file) {
        return res
          .status(400)
          .json(ApiResponse(null, "No file uploaded", false, 400));
      }

      console.log("qqqqqqqqqqqqqq11111111111", req.body); // Log request body for debugging

      // Verify the provided subCategoryId exists
      const existingSubCategory = await SubCategory.findOne({
        _id: req.body.subCategoryId,
      });
      if (!existingSubCategory) {
        return res
          .status(404)
          .json(ApiResponse(null, "SubCategory not found", false, 404));
      }
      const categoryId = existingSubCategory.categoryId; // Get associated category ID
      console.log("qqq2222", categoryId); // Log category ID for debugging

      // Check for duplicate item name (check both new and legacy fields)
      const existingItems = await Item.findOne({ 
        $or: [
          { productName: req.body.productName || req.body.name },
          { name: req.body.productName || req.body.name }
        ]
      });
      if (existingItems) {
        return res
          .status(400)
          .json(ApiResponse(null, "Item name already exists", false, 400));
      }

      // Generate a new MongoDB ObjectId for the item
      const newItemId = new mongoose.Types.ObjectId();

      // Upload the image to AWS S3 with a path like categories/{categoryId}/{subCategoryId}/{itemId}
      const fileUrl = await uploadMultipart(
        req.file,
        `categories/${categoryId}/${existingSubCategory._id}`,
        newItemId || "default"
      );
      console.log("File uploaded to:", fileUrl); // Log S3 URL for debugging

      // Attach the image URL and categoryId to the request body for use in the controller
      req.body.imageUrl = fileUrl;
      req.body.categoryId = categoryId;

      // Call the controller to create the item
      const item = await itemController.createItem(req, res, newItemId);

      // Prevent further execution if the controller already sent a response
      if (!item) {
        return; // Early return if item creation fails or response was sent
      }

      // Send success response with the created item
      res
        .status(201)
        .json(ApiResponse(item, "item created successfully", true, 201));
    } catch (error) {
      console.error(error); // Log error for debugging
      res
        .status(500)
        .json(
          ApiResponse(null, "Item creation failed", false, 500, error.message)
        );
    }
  }
);

// GET /api/items/totalItemCount
// Retrieves the total number of items (authenticated users only)
itemRouter.get(
  "/totalItemCount",
  verifyToken,
  itemController.getTotalItemCount
);

// GET /api/items/statistics
// Retrieves item statistics by status (authenticated users only)
itemRouter.get(
  "/statistics",
  verifyToken,
  itemController.getItemStatistics
);

// GET /api/items/
// Retrieves all items (public access)
itemRouter.get("/", itemController.getAllItems);

// POST /api/items/filter
// Retrieves items based on filter criteria (e.g., category, subcategory, price)
itemRouter.post("/filter", itemController.getItemsByFilter);

// ==============================
// PRODUCT BUNDLING ROUTES
// ==============================

// GET /api/items/bundles - Get all product bundles with filtering and pagination
itemRouter.get("/bundles", verifyToken, checkAdminRole, itemController.getAllProductBundles);

// POST /api/items/bundles - Create a new product bundle
itemRouter.post("/bundles", verifyToken, checkAdminRole, itemController.createProductBundle);

// GET /api/items/bundles/categories - Get categories and subcategories for bundling
itemRouter.get("/bundles/categories", verifyToken, checkAdminRole, itemController.getCategoriesForBundling);

// GET /api/items/bundles/items - Get items available for bundling
itemRouter.get("/bundles/items", verifyToken, checkAdminRole, itemController.getItemsForBundling);

// GET /api/items/bundles/:bundleId - Get a specific product bundle by ID
itemRouter.get("/bundles/:bundleId", verifyToken, checkAdminRole, itemController.getProductBundleById);

// PUT /api/items/bundles/:bundleId - Update a product bundle
itemRouter.put("/bundles/:bundleId", verifyToken, checkAdminRole, itemController.updateProductBundle);

// DELETE /api/items/bundles/:bundleId - Delete a product bundle
itemRouter.delete("/bundles/:bundleId", verifyToken, checkAdminRole, itemController.deleteProductBundle);

// PATCH /api/items/bundles/:bundleId/toggle-status - Toggle bundle active status
itemRouter.patch("/bundles/:bundleId/toggle-status", verifyToken, checkAdminRole, itemController.toggleBundleStatus);

// PUT /api/items/bundles/:bundleId/reorder - Update bundle items order (drag & drop)
itemRouter.put("/bundles/:bundleId/reorder", verifyToken, checkAdminRole, itemController.updateBundleItemsOrder);

// ========================================
// ARRANGEMENT CONTROL ROUTES
// ========================================

// GET /api/items/categories-arrangement
// Get all categories with their subcategories for arrangement control
itemRouter.get(
  "/categories-arrangement",
  verifyToken,
  checkAdminRole,
  itemController.getCategoriesForArrangement
);

// GET /api/items/items-arrangement
// Get items by category and subcategory for arrangement
itemRouter.get(
  "/items-arrangement",
  verifyToken,
  checkAdminRole,
  itemController.getItemsForArrangement
);

// PUT /api/items/items-display-order
// Update items display order (for drag & drop arrangement)
itemRouter.put(
  "/items-display-order",
  verifyToken,
  checkAdminRole,
  itemController.updateItemsDisplayOrder
);

// PUT /api/items/categories-display-order
// Update categories display order
itemRouter.put(
  "/categories-display-order",
  verifyToken,
  checkAdminRole,
  itemController.updateCategoriesDisplayOrder
);

// PUT /api/items/subcategories-display-order
// Update subcategories display order
itemRouter.put(
  "/subcategories-display-order",
  verifyToken,
  checkAdminRole,
  itemController.updateSubCategoriesDisplayOrder
);

// GET /api/items/:id
// Retrieves a single item by its ID (public access)
itemRouter.get("/:id", itemController.getItemById);

// GET /api/items/latest-items/:subCategoryId
// Retrieves the latest items for a specific subcategory (public access)
itemRouter.get(
  "/latest-items/:subCategoryId",
  itemController.getLatestItemsBySubCategory
);

// GET /api/items/subcategory/:subCategoryId
// Retrieves all items for a specific subcategory (public access)
itemRouter.get(
  "/subcategory/:subCategoryId",
  itemController.getItemsBySubCategory
);

// GET /api/items/:itemId/bundles - Get bundles for a specific product (public route for frontend)
itemRouter.get("/:itemId/bundles", itemController.getBundlesForProduct);

// PUT /api/items/:id
// Updates an existing item with an optional image upload (admin-only)
itemRouter.put(
  "/:id",
  verifyToken, // Ensure user is authenticated
  checkAdminRole, // Ensure user has admin role
  upload.single("image"), // Handle single file upload (field name: "image")
  async (req, res) => {
    try {
      // Check if the item exists
      const existingItems = await Item.findById(req.params.id);
      console.log("existingItems", existingItems); // Log existing item for debugging
      if (!existingItems) {
        return res
          .status(404)
          .json(ApiResponse(null, "itmes not found", false, 404));
      }

      // Get the associated subcategory and category
      const existingSubCategory = await SubCategory.findOne({
        _id: existingItems.subCategoryId,
      });
      if (!existingSubCategory) {
        return res
          .status(404)
          .json(ApiResponse(null, "SubCategory not found", false, 404));
      }
      const categoryId = existingSubCategory.categoryId; // Get associated category ID

      // If a new image is uploaded, delete the old images from S3
      if (req.file) {
        // Delete from images array
        if (existingItems.images && Array.isArray(existingItems.images)) {
          for (const image of existingItems.images) {
            if (image.url) {
              await deleteFileFromS3(image.url);
            }
          }
        }
        // Delete legacy imageUrl if exists
        if (existingItems.imageUrl) {
          await deleteFileFromS3(existingItems.imageUrl);
        }
      }

      // If a new image is uploaded, upload it to S3 and update the image URL
      if (req.file) {
        const fileUrl = await uploadMultipart(
          req.file,
          `categories/${categoryId}/${existingSubCategory._id}`,
          req.params.id || "default"
        );
        req.body.imageUrl = fileUrl; // Legacy support
        req.body.images = [{ url: fileUrl, type: 'image', priority: 1 }]; // New structure
      }

      // Call the controller to update the item
      const updatedItem = await itemController.updateItem(req, res);

      // Send success response with the updated item
      res.status(200).json(updatedItem);
    } catch (error) {
      // Send error response if update fails
      res
        .status(500)
        .json(
          ApiResponse(null, "Item update failed", false, 500, error.message)
        );
    }
  }
);

// DELETE /api/items/:id
// Deletes an item by its ID (admin-only)
itemRouter.delete(
  "/:id",
  verifyToken,
  checkAdminRole,
  itemController.deleteItem
);

// ==============================
// NEW FLOW-BASED ROUTES
// ==============================

// PHASE 1: Create basic product information with sizes
// POST /api/items/basic-product
itemRouter.post(
  "/basic-product",
  verifyToken,
  checkAdminRole,
  itemController.createBasicProduct
);

// PHASE 2: Update product with draft configuration (images, filters, categories)
// PUT /api/items/:productId/draft-configuration
itemRouter.put(
  "/:productId/draft-configuration",
  verifyToken,
  checkAdminRole,
  itemController.updateDraftConfiguration
);

// PHASE 3: Add review to product (consumer/admin side)
// POST /api/items/:productId/reviews
itemRouter.post(
  "/:productId/reviews",
  verifyToken, // Both admin and regular users can add reviews
  itemController.addReview
);

// PHASE 4: Update also show in options (draft management)
// PUT /api/items/:productId/also-show-options
itemRouter.put(
  "/:productId/also-show-options",
  verifyToken,
  checkAdminRole,
  itemController.updateAlsoShowInOptions
);

// PHASE 5: Update product status (draft → schedule → live)
// PUT /api/items/:productId/status
itemRouter.put(
  "/:productId/status",
  verifyToken,
  checkAdminRole,
  itemController.updateProductStatus
);

// UTILITY ROUTES for the new flow

// Get product by productId (supports both ObjectId and productId)
// GET /api/items/product/:id
itemRouter.get(
  "/product/:id",
  itemController.getProductById
);

// Get products by status (draft, scheduled, published)
// GET /api/items/status/:status
itemRouter.get(
  "/status/:status",
  verifyToken,
  checkAdminRole,
  itemController.getProductsByStatus
);

// Update product sizes only (Phase 1 update)
// PUT /api/items/:productId/sizes
itemRouter.put(
  "/:productId/sizes",
  verifyToken,
  checkAdminRole,
  itemController.updateProductSizes
);

// Toggle review settings (enable/disable reviews)
// PUT /api/items/:productId/review-settings
itemRouter.put(
  "/:productId/review-settings",
  verifyToken,
  checkAdminRole,
  itemController.updateReviewSettings
);

// NEW SIMPLIFIED ENDPOINTS FOR NON-AUTHENTICATED FLOW

// POST /api/items/create-draft
// Creates a new product in draft mode without requiring categories or authentication
itemRouter.post(
  "/create-draft",
  async (req, res) => {
    console.log("🚀 Creating draft product - Request received");
    console.log("📡 Request body:", JSON.stringify(req.body, null, 2));
    console.log("📏 Request body size:", JSON.stringify(req.body).length, "characters");
    try {
      // Extract only the basic fields we need, ignore complex objects like variants, images, etc.
      const {
        productName,
        title,
        description,
        manufacturingDetails,
        shippingAndReturns,
        returnable = true,
        sizes = [],
        // Optional fields that might be sent but we'll ignore for now
        variants,
        images,
        categoryId,
        subCategoryId,
        filters,
        ...otherFields  // Capture other fields to avoid errors
      } = req.body;

      // Validate required fields with better error messages
      if (!productName || typeof productName !== 'string' || !productName.trim()) {
        console.log("❌ Validation failed: Product name is missing or invalid");
        return res.status(400).json(ApiResponse(null, "Product name is required and must be a non-empty string", false, 400));
      }

      // Ensure description has a default value (required field)
      const productDescription = (description && typeof description === 'string' && description.trim()) 
        ? description.trim() 
        : `Description for ${productName.trim()}`;

      console.log("✅ Basic validation passed:", {
        productName: productName.trim(),
        hasDescription: !!description,
        sizesCount: Array.isArray(sizes) ? sizes.length : 0
      });

      // Log ignored fields for debugging
      if (variants || images || filters || Object.keys(otherFields).length > 0) {
        console.log("Note: Ignoring complex fields in create-draft:", {
          variants: variants ? `${Array.isArray(variants) ? variants.length : 1} variant(s)` : 'none',
          images: images ? `${Array.isArray(images) ? images.length : 1} image(s)` : 'none', 
          filters: filters ? `${Array.isArray(filters) ? filters.length : 1} filter(s)` : 'none',
          otherFields: Object.keys(otherFields)
        });
      }

      // Check for duplicate item name
      const existingItem = await Item.findOne({ 
        $or: [
          { productName: req.body.productName },
          { name: req.body.productName }
        ]
      });
      if (existingItem) {
        return res
          .status(400)
          .json(ApiResponse(null, "Item name already exists", false, 400));
      }

      // Generate unique productId
      const productId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare basic item data for draft
      const itemData = {
        productId,
        
        // Basic product information
        productName: productName.trim(),
        title: (title && typeof title === 'string' && title.trim()) ? title.trim() : productName.trim(),
        description: productDescription,
        manufacturingDetails: (manufacturingDetails && typeof manufacturingDetails === 'string') ? manufacturingDetails.trim() : '',
        shippingAndReturns: (shippingAndReturns && typeof shippingAndReturns === 'string') ? shippingAndReturns.trim() : '',
        returnable: Boolean(returnable),
        
        // Sizes (if provided) - with improved error handling
        sizes: Array.isArray(sizes) ? sizes.map((size, index) => {
          try {
            if (!size || typeof size !== 'object') {
              console.log(`⚠️ Skipping invalid size at index ${index}:`, size);
              return null;
            }
            
            const sizeData = {
              size: size.sizeName || size.size || 'Unknown',
              quantity: Math.max(0, parseInt(size.quantity) || 0),
              stock: Math.max(0, parseInt(size.stock) || parseInt(size.quantity) || 0),
              hsnCode: (size.hsnCode || size.hsn || '').toString().slice(0, 8), // Ensure max 8 chars
              sku: size.sku || `${productName.toLowerCase().replace(/\s+/g, '-')}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.random().toString().slice(2, 10)}`,
              barcode: (size.barcode || size.barcodeNo || '').toString().slice(0, 14), // Ensure max 14 chars
              regularPrice: Math.max(0, Number(size.regularPrice) || 0),
              salePrice: Math.max(0, Number(size.salePrice) || 0),
              // Measurements in cm
              fitWaistCm: Math.max(0, Number(size.fitWaistCm || size.waistCm) || 0),
              inseamLengthCm: Math.max(0, Number(size.inseamLengthCm || size.inseamCm) || 0),
              chestCm: Math.max(0, Number(size.chestCm) || 0),
              frontLengthCm: Math.max(0, Number(size.frontLengthCm) || 0),
              acrossShoulderCm: Math.max(0, Number(size.acrossShoulderCm) || 0),
              // Measurements in inches
              toFitWaistIn: Math.max(0, Number(size.toFitWaistIn || size.waistIn) || 0),
              inseamLengthIn: Math.max(0, Number(size.inseamLengthIn || size.inseamIn) || 0),
              chestIn: Math.max(0, Number(size.chestIn) || 0),
              frontLengthIn: Math.max(0, Number(size.frontLengthIn) || 0),
              acrossShoulderIn: Math.max(0, Number(size.acrossShoulderIn) || 0),
              // Meta fields
              metaTitle: (size.metaTitle || '').toString(),
              metaDescription: (size.metaDescription || '').toString(),
              slugUrl: (size.slugUrl || '').toString()
            };
            
            console.log(`✅ Processed size ${index + 1}:`, sizeData.size);
            return sizeData;
          } catch (sizeError) {
            console.error(`❌ Error processing size at index ${index}:`, sizeError.message);
            return null;
          }
        }).filter(size => size !== null) : [],
        
        // Default status is draft
        status: 'draft',
        
        // Initialize empty arrays for later phases
        images: [],
        filters: [],
        variants: [],
        
        // Categories will be added later in the workflow
        categoryId: null,
        subCategoryId: null,
        
        // Status flags
        isActive: true,
        isDeleted: false,
        
        // Meta data
        metaTitle: req.body.metaTitle || productName,
        metaDescription: req.body.metaDescription || productDescription,
        slugUrl: req.body.slugUrl || productName.toLowerCase().replace(/\s+/g, '-'),
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newItem = new Item(itemData);
      await newItem.save();
      
      res.status(201).json(ApiResponse(newItem, "Draft product created successfully. Categories and images can be added later.", true, 201));
    } catch (error) {
      console.error("❌ Draft product creation error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      console.error("❌ Request body that caused error:", JSON.stringify(req.body, null, 2));
      res
        .status(500)
        .json(
          ApiResponse(null, "Draft product creation failed", false, 500, error.message)
        );
    }
  }
);



// Export the router for use in the main Express app
module.exports = itemRouter;