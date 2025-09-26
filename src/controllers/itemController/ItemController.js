const Item = require("../../models/Item");
const SubCategory = require("../../models/SubCategory");
const ProductBundle = require("../../models/ProductBundle");
const Category = require("../../models/Category");
const { ApiResponse } = require("../../utils/ApiResponse");
const { deleteFileFromS3 } = require("../../utils/S3");
const mongoose = require("mongoose");

/**
 * PHASE 1: Create basic product information with sizes
 * This is the initial product details upload phase
 */
exports.createBasicProduct = async (req, res) => {
  try {
    const {
      productName,
      title,
      description,
      manufacturingDetails,
      shippingAndReturns,
      returnable = true,
      sizes = [] // Optional - can be empty if no sizes
    } = req.body;

    // Validate required fields for basic product
    if (!productName) {
      return res.status(400).json(ApiResponse(null, "Product name is required", false, 400));
    }

    if (!description) {
      return res.status(400).json(ApiResponse(null, "Product description is required", false, 400));
    }

    // Generate unique itemId
    const itemId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare basic item data (PHASE 1)
    const itemData = {
      itemId,
      productId: itemId, // Add productId field for compatibility with existing indexes
      
      // Basic product information
      productName,
      title: title || productName,
      description,
      manufacturingDetails: manufacturingDetails || '',
      shippingAndReturns: shippingAndReturns || '',
      returnable: Boolean(returnable),
      
      // Sizes (if provided)
      sizes: sizes.map(size => ({
        size: size.size,
        quantity: parseInt(size.quantity) || 0,
        stock: parseInt(size.stock) || parseInt(size.quantity) || 0,
        hsnCode: size.hsnCode || '',
        sku: size.sku || `${productName.toLowerCase().replace(/\s+/g, '-')}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.random().toString().slice(2, 10)}`,
        barcode: size.barcode || '',
        regularPrice: Number(size.regularPrice || 0),
        salePrice: Number(size.salePrice || 0),
        // Measurements in cm
        fitWaistCm: Number(size.fitWaistCm) || 0,
        inseamLengthCm: Number(size.inseamLengthCm) || 0,
        chestCm: Number(size.chestCm) || 0,
        frontLengthCm: Number(size.frontLengthCm) || 0,
        acrossShoulderCm: Number(size.acrossShoulderCm) || 0,
        // Measurements in inches
        toFitWaistIn: Number(size.toFitWaistIn) || 0,
        inseamLengthIn: Number(size.inseamLengthIn) || 0,
        chestIn: Number(size.chestIn) || 0,
        frontLengthIn: Number(size.frontLengthIn) || 0,
        acrossShoulderIn: Number(size.acrossShoulderIn) || 0,
        // SEO fields at size level
        metaTitle: size.metaTitle || '',
        metaDescription: size.metaDescription || '',
        slugUrl: size.slugUrl || ''
      })),
      
      // Default status is draft
      status: 'draft',
      
      // Initialize empty arrays for later phases
      images: [],
      filters: [],
      variants: [],
      
      // Status flags
      isActive: true,
      isDeleted: false
    };

    const newItem = new Item(itemData);
    await newItem.save();
    
    res.status(201).json(ApiResponse(newItem, "Basic product created successfully. Ready for draft configuration.", true, 201));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * PHASE 2: Update product with draft configuration (images, filters, categories)
 * This moves the product to draft section with full configuration
 */
exports.updateDraftConfiguration = async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      images = [],
      filters = [],
      categoryId,
      subCategoryId,
      variants = [],
      alsoShowInOptions = {}
    } = req.body;

    // Validate required fields for draft
    if (!categoryId || !subCategoryId) {
      return res.status(400).json(ApiResponse(null, "Category and subcategory are required for draft configuration", false, 400));
    }

    // Validate subcategory exists
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res.status(400).json(ApiResponse(null, "SubCategory not found", false, 400));
    }

    // Validate that no blob URLs are being sent
    if (images && Array.isArray(images)) {
      const blobUrls = images.filter(img => typeof img.url === 'string' && img.url.startsWith('blob:'));
      if (blobUrls.length > 0) {
        return res.status(400).json(ApiResponse(null, `Invalid image URLs detected. Found ${blobUrls.length} temporary blob URL(s). Please ensure all files are properly uploaded to the server before submitting.`, false, 400));
      }
    }

    // Format filters
    let formattedFilters = [];
    if (filters && Array.isArray(filters)) {
      formattedFilters = filters.map(filter => ({
        key: filter.key,
        value: filter.value,
        code: filter.code || ""
      }));
    }

    // Update data for draft configuration
    const updateData = {
      // Categories
      categoryId,
      subCategoryId,
      
      // Images and media
      images: images.map(img => ({
        url: img.url,
        type: img.type || 'image',
        priority: img.priority || 1
      })),
      
      // Filters
      filters: formattedFilters,
      
      // Variants
      variants: variants || [],
      
      // Also show in options (can be configured in draft)
      alsoShowInOptions: alsoShowInOptions || {},
      
      // Keep status as draft
      status: 'draft'
    };

    const item = await Item.findOneAndUpdate(
      mongoose.Types.ObjectId.isValid(itemId) ? 
        { $or: [{ itemId: itemId }, { productId: itemId }, { _id: itemId }] } : 
        { $or: [{ itemId: itemId }, { productId: itemId }] },
      { $set: updateData },
      { new: true }
    );

    if (!item) {
      return res.status(404).json(ApiResponse(null, "Product not found", false, 404));
    }

    res.status(200).json(ApiResponse(item, "Draft configuration updated successfully", true, 200));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * PHASE 3: Add review to product (consumer/admin side)
 */
exports.addReview = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId, rating, reviewText } = req.body;

    // Validate required fields
    if (!userId || !rating) {
      return res.status(400).json(ApiResponse(null, "User ID and rating are required", false, 400));
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json(ApiResponse(null, "Rating must be between 1 and 5", false, 400));
    }

    const item = await Item.findOne({ itemId: itemId });
    if (!item) {
      return res.status(404).json(ApiResponse(null, "Product not found", false, 404));
    }

    // Check if review submission is enabled
    if (!item.isReviewSubmissionEnabled) {
      return res.status(400).json(ApiResponse(null, "Review submission is disabled for this product", false, 400));
    }

    // Check if user already reviewed this product
    const existingReview = item.reviews.find(review => review.user.toString() === userId);
    if (existingReview) {
      return res.status(400).json(ApiResponse(null, "You have already reviewed this product", false, 400));
    }

    // Add new review
    const newReview = {
      user: userId,
      rating: parseInt(rating),
      reviewText: reviewText || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    item.reviews.push(newReview);
    
    // The pre-save middleware will automatically calculate averageRating, totalReviews, and ratingDistribution
    await item.save();

    res.status(201).json(ApiResponse(item, "Review added successfully", true, 201));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * PHASE 4: Update also show in options (draft management)
 */
exports.updateAlsoShowInOptions = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { alsoShowInOptions } = req.body;

    const item = await Item.findOne({ itemId: itemId });
    if (!item) {
      return res.status(404).json(ApiResponse(null, "Product not found", false, 404));
    }

    // Update also show in options
    const updateData = {
      alsoShowInOptions: {
        similarItems: {
          enabled: alsoShowInOptions?.similarItems?.enabled || false,
          placement: alsoShowInOptions?.similarItems?.placement || 'default',
          items: alsoShowInOptions?.similarItems?.items || []
        },
        othersAlsoBought: {
          enabled: alsoShowInOptions?.othersAlsoBought?.enabled || false,
          placement: alsoShowInOptions?.othersAlsoBought?.placement || 'default',
          items: alsoShowInOptions?.othersAlsoBought?.items || []
        },
        youMightAlsoLike: {
          enabled: alsoShowInOptions?.youMightAlsoLike?.enabled || false,
          placement: alsoShowInOptions?.youMightAlsoLike?.placement || 'default',
          items: alsoShowInOptions?.youMightAlsoLike?.items || []
        },
        customOptions: alsoShowInOptions?.customOptions || [],
        appPlacements: alsoShowInOptions?.appPlacements || {}
      }
    };

    const updatedItem = await Item.findOneAndUpdate(
      { itemId: itemId },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(ApiResponse(updatedItem, "Also show in options updated successfully", true, 200));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * PHASE 5: Update product status (draft → schedule → live)
 */
exports.updateProductStatus = async (req, res) => {
  try {
    const { itemId } = req.params; // Can be either ObjectId or itemId
    const { 
      status, 
      scheduledDate, 
      scheduledTime, 
      publishAt,
      publishingOptions = {}
    } = req.body;

    // Validate status
    const validStatuses = ['draft', 'published', 'scheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(ApiResponse(null, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, false, 400));
    }

    let item;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      item = await Item.findById(itemId);
    }
    
    // If not found, try to find by itemId or productId
    if (!item) {
      item = await Item.findOne({ 
        $or: [
          { itemId: itemId },
          { productId: itemId }
        ]
      });
    }
    
    if (!item) {
      return res.status(404).json(ApiResponse(null, "Product not found", false, 404));
    }

    let updateData = { status };

    // Handle scheduling
    if (status === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        return res.status(400).json(ApiResponse(null, "Scheduled date and time are required for scheduled status", false, 400));
      }
      
      // Create publishAt date from scheduledDate and scheduledTime
      const publishAtDate = new Date(`${scheduledDate}T${scheduledTime}:00.000Z`);
      
      // Validate that the scheduled time is in the future
      if (publishAtDate <= new Date()) {
        return res.status(400).json(ApiResponse(null, "Scheduled time must be in the future", false, 400));
      }
      
      updateData.scheduledDate = scheduledDate;
      updateData.scheduledTime = scheduledTime;
      updateData.scheduledAt = new Date(); // When it was scheduled
      updateData.publishAt = publishAtDate;
    }

    // Handle publishing
    if (status === 'published') {
      updateData.publishedAt = new Date();
      // Clear scheduling fields when publishing
      updateData.scheduledDate = null;
      updateData.scheduledTime = null;
      updateData.scheduledAt = null;
      updateData.publishAt = null;
    }

    // Handle draft status
    if (status === 'draft') {
      // Clear all publishing and scheduling fields
      updateData.publishedAt = null;
      updateData.scheduledDate = null;
      updateData.scheduledTime = null;
      updateData.scheduledAt = null;
      updateData.publishAt = null;
    }

    // Update publishing options
    updateData.publishingOptions = {
      action: publishingOptions.action || status,
      scheduledDate: publishingOptions.scheduledDate || scheduledDate || '',
      scheduledTime: publishingOptions.scheduledTime || scheduledTime || '',
      publishAt: publishingOptions.publishAt ? new Date(publishingOptions.publishAt) : (publishAt ? new Date(publishAt) : null),
      autoPublish: publishingOptions.autoPublish || false,
      notificationSettings: publishingOptions.notificationSettings || {}
    };

    const updatedItem = await Item.findOneAndUpdate(
      { $or: [{ _id: itemId }, { itemId: itemId }] },
      { $set: updateData },
      { new: true }
    ).populate('categoryId', 'name')
     .populate('subCategoryId', 'name');

    const statusMessage = {
      'draft': 'Product moved to draft',
      'scheduled': `Product scheduled for ${scheduledDate} at ${scheduledTime}`,
      'published': 'Product published successfully'
    };

    res.status(200).json(ApiResponse(updatedItem, statusMessage[status], true, 200));
  } catch (err) {
    console.error('updateProductStatus error:', err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * Auto-publish scheduled items that are due
 */
exports.publishScheduledItems = async () => {
  try {
    const now = new Date();
    console.log('🕒 Checking for scheduled items to publish at:', now.toISOString());
    
    const scheduledItems = await Item.find({
      status: 'scheduled',
      publishAt: { $lte: now },
      isActive: true,
      isDeleted: false
    });
    
    console.log(`🕒 Found ${scheduledItems.length} items to publish`);
    
    const publishPromises = scheduledItems.map(async (item) => {
      try {
        const updatedItem = await Item.findByIdAndUpdate(
          item._id,
          {
            $set: {
              status: 'published',
              publishedAt: new Date(),
              // Clear scheduling fields
              scheduledDate: null,
              scheduledTime: null,
              scheduledAt: null,
              publishAt: null
            }
          },
          { new: true }
        );
        
        console.log(`✅ Successfully published item: ${item.productName} (${item.itemId})`);
        return updatedItem;
      } catch (error) {
        console.error(`❌ Failed to publish item: ${item.productName} (${item.itemId})`, error);
        return null;
      }
    });
    
    const results = await Promise.allSettled(publishPromises);
    const publishedCount = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
    
    console.log(`🎉 Successfully published ${publishedCount} out of ${scheduledItems.length} scheduled items`);
    return { publishedCount, totalScheduled: scheduledItems.length };
  } catch (error) {
    console.error('❌ Error in publishScheduledItems:', error);
    return { publishedCount: 0, totalScheduled: 0, error: error.message };
  }
};

/**
 * Get scheduled items summary
 */
exports.getScheduledItemsSummary = async (req, res) => {
  try {
    const now = new Date();
    
    const scheduledItems = await Item.find({
      status: 'scheduled',
      isActive: true,
      isDeleted: false
    })
    .select('itemId productName scheduledDate scheduledTime publishAt')
    .sort({ publishAt: 1 });
    
    const overdue = scheduledItems.filter(item => item.publishAt && item.publishAt <= now);
    const upcoming = scheduledItems.filter(item => item.publishAt && item.publishAt > now);
    
    const summary = {
      total: scheduledItems.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      overdueItems: overdue,
      upcomingItems: upcoming.slice(0, 10) // Limit to next 10
    };
    
    res.status(200).json(ApiResponse(summary, "Scheduled items summary retrieved successfully", true, 200));
  } catch (error) {
    console.error('Error getting scheduled items summary:', error);
    res.status(500).json(ApiResponse(null, error.message, false, 500));
  }
};

/**
 * Legacy: Create a new item (for backward compatibility)
 */
/**
 * Legacy: Create a new item (for backward compatibility)
 * This function maintains the old behavior but adapts to the new flow
 */
exports.createItem = async (req, res, newItemId) => {
  try {
    const {
      productName,
      title,
      description,
      manufacturingDetails,
      shippingAndReturns,
      returnable = true,
      metaTitle,
      metaDescription,
      slugUrl,
      categoryId,
      subCategoryId,
      status = 'draft',
      scheduledDate,
      scheduledTime,
      publishAt,
      stockSizeOption = 'sizes',
      sizes = [],
      variants = [],
      alsoShowInOptions = {},
      filters = [],
      tags = [],
      images = [],
      publishingOptions = {}
    } = req.body;

    // Validate required fields
    if (!productName) {
      return res.status(400).json(ApiResponse(null, "Product name is required", false, 400));
    }

    // For legacy support, allow creation without categories but warn
    if (!categoryId || !subCategoryId) {
      console.warn("Legacy createItem called without categories - product will be created in draft mode");
    }

    // Validate subcategory if provided
    if (subCategoryId) {
      const subCategory = await SubCategory.findById(subCategoryId);
      if (!subCategory) {
        return res.status(400).json(ApiResponse(null, "SubCategory not found", false, 400));
      }
    }

    // Validate that no blob URLs are being sent
    const validateUrls = (urlArray, type) => {
      if (Array.isArray(urlArray)) {
        const blobUrls = urlArray.filter(url => typeof url === 'string' && url.startsWith('blob:'));
        if (blobUrls.length > 0) {
          throw new Error(`Invalid ${type} URLs detected. Found ${blobUrls.length} temporary blob URL(s). Please ensure all files are properly uploaded to the server before submitting.`);
        }
      }
    };

    // Check images array for blob URLs
    if (images && Array.isArray(images)) {
      const blobUrls = images.filter(img => typeof img.url === 'string' && img.url.startsWith('blob:'));
      if (blobUrls.length > 0) {
        return res.status(400).json(ApiResponse(null, `Invalid image URLs detected. Found ${blobUrls.length} temporary blob URL(s). Please ensure all files are properly uploaded to the server before submitting.`, false, 400));
      }
    }

    // Check variants for blob URLs
    if (variants && Array.isArray(variants)) {
      variants.forEach((variant, index) => {
        if (variant.images) {
          validateUrls(variant.images, `image in variant ${index + 1}`);
        }
        if (variant.videos) {
          validateUrls(variant.videos, `video in variant ${index + 1}`);
        }
      });
    }

    // Generate unique itemId using the new format
    const itemId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Parse and format filters if they exist
    let formattedFilters = [];
    if (filters && Array.isArray(filters)) {
      formattedFilters = filters.map(filter => ({
        key: filter.key,
        value: filter.value,
        code: filter.code || ""
      }));
    } else if (filters && typeof filters === 'string') {
      try {
        const parsedFilters = JSON.parse(filters);
        if (Array.isArray(parsedFilters)) {
          formattedFilters = parsedFilters.map(filter => ({
            key: filter.key,
            value: filter.value,
            code: filter.code || ""
          }));
        }
      } catch (error) {
        console.error("Error parsing filters:", error);
        return res.status(400).json(ApiResponse(null, "Invalid filters format", false, 400));
      }
    }

    // Prepare item data with new structure
    const itemData = {
      _id: newItemId,
      itemId,
      productId: itemId, // Add productId for compatibility with existing indexes
      
      // Basic product information
      productName: productName,
      title: title || productName,
      description: description || '',
      manufacturingDetails: manufacturingDetails || '',
      shippingAndReturns: shippingAndReturns || '',
      returnable: Boolean(returnable),
      
      // Categories (optional for legacy support)
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
      
      // Size and stock management
      stockSizeOption,
      sizes: sizes.map(size => ({
        size: size.size,
        quantity: parseInt(size.quantity) || 0,
        stock: parseInt(size.stock) || parseInt(size.quantity) || 0,
        hsnCode: size.hsnCode || '',
        sku: size.sku || `${productName.toLowerCase().replace(/\s+/g, '-')}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.random().toString().slice(2, 10)}`,
        barcode: size.barcode || '',
        regularPrice: Number(size.regularPrice || 0),
        salePrice: Number(size.salePrice || 0),
        // Measurements in cm
        fitWaistCm: Number(size.fitWaistCm) || 0,
        inseamLengthCm: Number(size.inseamLengthCm) || 0,
        chestCm: Number(size.chestCm) || 0,
        frontLengthCm: Number(size.frontLengthCm) || 0,
        acrossShoulderCm: Number(size.acrossShoulderCm) || 0,
        // Measurements in inches
        toFitWaistIn: Number(size.toFitWaistIn) || 0,
        inseamLengthIn: Number(size.inseamLengthIn) || 0,
        chestIn: Number(size.chestIn) || 0,
        frontLengthIn: Number(size.frontLengthIn) || 0,
        acrossShoulderIn: Number(size.acrossShoulderIn) || 0,
        // SEO fields at size level
        metaTitle: size.metaTitle || '',
        metaDescription: size.metaDescription || '',
        slugUrl: size.slugUrl || ''
      })),
      
      // Variants
      variants: variants || [],
      
      // Images array (new structure)
      images: images.length > 0 ? images.map(img => ({
        url: img.url,
        type: img.type || 'image',
        priority: img.priority || 1
      })) : [],
      
      // Additional options
      alsoShowInOptions: alsoShowInOptions || {},
      filters: formattedFilters,
      tags: Array.isArray(tags) ? tags : [],
      
      // Status and scheduling
      status,
      scheduledDate: scheduledDate || '',
      scheduledTime: scheduledTime || '',
      publishAt: publishAt ? new Date(publishAt) : null,
      
      // Publishing options
      publishingOptions: {
        action: publishingOptions.action || status || 'draft',
        scheduledDate: publishingOptions.scheduledDate || scheduledDate || '',
        scheduledTime: publishingOptions.scheduledTime || scheduledTime || '',
        publishAt: publishingOptions.publishAt ? new Date(publishingOptions.publishAt) : (publishAt ? new Date(publishAt) : null),
        autoPublish: publishingOptions.autoPublish || false,
        notificationSettings: publishingOptions.notificationSettings || {}
      },
      
      // Meta data
      metaTitle: metaTitle || productName,
      metaDescription: metaDescription || description || '',
      slugUrl: slugUrl || productName.toLowerCase().replace(/\s+/g, '-'),
      
      // Status flags
      isActive: true,
      isDeleted: false
    };

    const newItem = new Item(itemData);
    await newItem.save();
    
    res.status(201).json(ApiResponse(newItem, "Item created successfully", true, 201));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * Get items by subCategoryId
 */
exports.getItemsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const { page = 1, limit = 100, filters = {} } = req.body;

    let filterCriteria = { subCategoryId };

    // Apply filters dynamically if provided
    if (filters.material) filterCriteria.material = { $in: filters.material };
    if (filters.minPrice) filterCriteria.price = { $gte: parseFloat(filters.minPrice) };
    if (filters.maxPrice) filterCriteria.price = { ...filterCriteria.price, $lte: parseFloat(filters.maxPrice) };
    if (filters.minRating) filterCriteria.averageRating = { $gte: parseFloat(filters.minRating) };

    const items = await Item.find(filterCriteria)
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const totalItems = await Item.countDocuments(filterCriteria);

    res.status(200).json(ApiResponse(items, "Items fetched successfully", true, 200, {
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, "Error fetching items", false, 500, err.message));
  }
};

/**
 * Get items by filters
 */
exports.getItemsByFilter = async (req, res) => {
  console.log("Fetching items with filters...");

  try {
    const { page = 1, limit = 100, filters = {}, searchText = "" } = req.body;
    console.log("Received Request Body:", JSON.stringify(req.body, null, 2));
    console.log("Extracted Filters:", JSON.stringify(filters, null, 2));

    let filterCriteria = {};
    const toObjectId = (id) => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

    // Category/subcategory handling
    let validCategoryIds = [];
    if (filters.categoryId) {
      const categoryIds = Array.isArray(filters.categoryId) ? filters.categoryId : [filters.categoryId];
      validCategoryIds = categoryIds.map(toObjectId).filter(id => id);
      filterCriteria.categoryId = { $in: validCategoryIds };
      console.log("Applied categoryId filter:", JSON.stringify(filterCriteria.categoryId, null, 2));
    }

    if (filters.subCategoryId) {
      const subCategoryIds = Array.isArray(filters.subCategoryId) ? filters.subCategoryId : [filters.subCategoryId];
      const validSubCategoryIds = subCategoryIds.map(toObjectId).filter(id => id);
      console.log("Raw subCategoryIds:", subCategoryIds);
      console.log("Valid subCategoryIds:", validSubCategoryIds);

      if (filters.categoryId && validCategoryIds.length > 0) {
        const validSubCategories = await SubCategory.find({ categoryId: { $in: validCategoryIds } }).distinct("_id");
        console.log("Valid subcategories from DB:", validSubCategories.map(id => id.toString()));
        const filteredSubCategories = validSubCategoryIds.filter(id => validSubCategories.some(validId => validId.equals(id)));
        if (filteredSubCategories.length > 0) {
          filterCriteria.subCategoryId = { $in: filteredSubCategories };
          console.log("Applied subCategoryId filter with category check:", JSON.stringify(filterCriteria.subCategoryId, null, 2));
        } else {
          console.log("No matching subcategories found for categoryId, skipping subCategoryId filter");
        }
      } else {
        filterCriteria.subCategoryId = { $in: validSubCategoryIds };
        console.log("Applied subCategoryId filter:", JSON.stringify(filterCriteria.subCategoryId, null, 2));
      }
    }

    // Handle predefined fields
    if (filters.material) {
      filterCriteria.material = { $in: filters.material };
      console.log("Applied material filter:", filterCriteria.material);
    }
    if (filters.minPrice) {
      filterCriteria.price = { $gte: parseFloat(filters.minPrice) };
      console.log("Applied minPrice filter:", filterCriteria.price);
    }
    if (filters.maxPrice) {
      filterCriteria.price = { ...filterCriteria.price, $lte: parseFloat(filters.maxPrice) };
      console.log("Applied maxPrice filter:", filterCriteria.price);
    }
    if (filters.minRating) {
      filterCriteria.averageRating = { $gte: parseFloat(filters.minRating) };
      console.log("Applied minRating filter:", filterCriteria.averageRating);
    }

    // Handle dynamic filters from the Item's filters array with case-insensitive matching for both key and value
    const dynamicFilterKeys = Object.keys(filters).filter(
      key => !['categoryId', 'subCategoryId', 'material', 'minPrice', 'maxPrice', 'minRating', 'customFilters'].includes(key)
    );
    console.log("Dynamic Filter Keys:", dynamicFilterKeys);

    if (dynamicFilterKeys.length > 0) {
      const filterQueries = dynamicFilterKeys.map(key => {
        const values = Array.isArray(filters[key]) ? filters[key] : [filters[key]];
        // Escape special regex characters and join values with OR (|)
        const escapedValues = values.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        return {
          "filters.key": { $regex: `^${key}$`, $options: "i" }, // Case-insensitive key matching
          "filters.value": { $regex: escapedValues.join("|"), $options: "i" } // Case-insensitive value matching
        };
      });
      filterCriteria.$and = filterQueries;
      console.log("Applied dynamic filters ($and):", JSON.stringify(filterCriteria.$and, null, 2));
    }

    if (searchText) {
      filterCriteria.$or = [
        { productName: { $regex: searchText, $options: "i" } },
        { name: { $regex: searchText, $options: "i" } },
        { title: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } }
      ];
      console.log("Applied searchText filter ($or):", filterCriteria.$or);
    }

    console.log("Final Filter Criteria:", JSON.stringify(filterCriteria, null, 2));

    const items = await Item.find(filterCriteria)
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    console.log("Items found:", JSON.stringify(items, null, 2));

    const totalItems = await Item.countDocuments(filterCriteria);
    console.log("Total items matching criteria:", totalItems);

    const response = {
      success: true,
      message: "Items fetched successfully",
      statusCode: 200,
      data: items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error in getItemsByFilter:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      statusCode: 500,
      error: err.message,
    });
  }
};

/**
 * Get all items (with pagination)
 */
exports.getAllItems = async (req, res) => {
  // Debug log removed
  try {
    const { page = 1, limit = 100 } = req.query;
    const items = await Item.find()
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const totalItems = await Item.countDocuments();

    res.status(200).json({
      items,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, "Error fetching items", false, 500, err.message));
  }
};

/**
 * Get a single item by itemId
 */
exports.getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    let item;
    
    // Try to find by ObjectId first (for backward compatibility)
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      item = await Item.findById(itemId)
        .populate("subCategoryId")
        .populate("categoryId");
    }
    
    // If not found, try to find by itemId
    if (!item) {
      item = await Item.findOne({ itemId: itemId })
        .populate("subCategoryId")
        .populate("categoryId");
    }
    
    if (!item) {
      return res.status(404).json(ApiResponse(null, "Item not found", false, 404));
    }
    
    res.status(200).json(ApiResponse(item, "Item fetched successfully", true, 200));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, "Error fetching item", false, 500, err.message));
  }
};

/**
 * Update an item (supports both legacy and new flow)
 * Can be used for any phase of the product flow
 */
exports.updateItem = async (req, res) => {
  console.log("req.body", req.body);
  try {
    const {
      productName,
      title,
      description,
      manufacturingDetails,
      shippingAndReturns,
      returnable,
      metaTitle,
      metaDescription,
      slugUrl,
      categoryId,
      subCategoryId,
      status,
      scheduledDate,
      scheduledTime,
      publishAt,
      stockSizeOption,
      sizes,
      variants,
      alsoShowInOptions,
      filters,
      tags,
      images,
      publishingOptions
    } = req.body;

    if (subCategoryId) {
      const subCategory = await SubCategory.findById(subCategoryId);
      if (!subCategory) {
        return res.status(400).json(ApiResponse(null, "SubCategory not found", false, 400));
      }
    }

    // Validate that no blob URLs are being sent
    if (images && Array.isArray(images)) {
      const blobUrls = images.filter(img => typeof img.url === 'string' && img.url.startsWith('blob:'));
      if (blobUrls.length > 0) {
        return res.status(400).json(ApiResponse(null, `Invalid image URLs detected. Found ${blobUrls.length} temporary blob URL(s). Please ensure all files are properly uploaded to the server before submitting.`, false, 400));
      }
    }

    // Parse and format filters if they exist
    let formattedFilters = [];
    if (filters) {
      try {
        const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
        if (Array.isArray(parsedFilters)) {
          formattedFilters = parsedFilters.map(filter => ({
            key: filter.key,
            value: filter.value,
            code: filter.code || ""
          }));
        }
      } catch (error) {
        console.error("Error parsing filters:", error);
        return res.status(400).json(ApiResponse(null, "Invalid filters format", false, 400));
      }
    }

    const updateData = {
      // Main product information
      ...(productName && { productName }),
      ...(title && { title }),
      ...(description && { description }),
      ...(manufacturingDetails !== undefined && { manufacturingDetails }),
      ...(shippingAndReturns !== undefined && { shippingAndReturns }),
      ...(returnable !== undefined && { returnable: Boolean(returnable) }),
      
      // Categories
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
      
      // Size and stock management
      ...(stockSizeOption && { stockSizeOption }),
      ...(sizes && { 
        sizes: sizes.map(size => ({
          size: size.size,
          quantity: parseInt(size.quantity) || 0,
          stock: parseInt(size.stock) || parseInt(size.quantity) || 0,
          hsnCode: size.hsnCode || '',
          sku: size.sku || '',
          barcode: size.barcode || '',
          regularPrice: Number(size.regularPrice || 0),
          salePrice: Number(size.salePrice || 0),
          // Measurements in cm
          fitWaistCm: Number(size.fitWaistCm) || 0,
          inseamLengthCm: Number(size.inseamLengthCm) || 0,
          chestCm: Number(size.chestCm) || 0,
          frontLengthCm: Number(size.frontLengthCm) || 0,
          acrossShoulderCm: Number(size.acrossShoulderCm) || 0,
          // Measurements in inches
          toFitWaistIn: Number(size.toFitWaistIn) || 0,
          inseamLengthIn: Number(size.inseamLengthIn) || 0,
          chestIn: Number(size.chestIn) || 0,
          frontLengthIn: Number(size.frontLengthIn) || 0,
          acrossShoulderIn: Number(size.acrossShoulderIn) || 0,
          // SEO fields at size level
          metaTitle: size.metaTitle || '',
          metaDescription: size.metaDescription || '',
          slugUrl: size.slugUrl || ''
        }))
      }),
      
      // Variants and images
      ...(variants && { variants }),
      ...(images && { 
        images: images.map(img => ({
          url: img.url,
          type: img.type || 'image',
          priority: img.priority || 1
        }))
      }),
      
      // Additional options
      ...(alsoShowInOptions && { alsoShowInOptions }),
      ...(formattedFilters.length > 0 && { filters: formattedFilters }),
      ...(tags && { tags: Array.isArray(tags) ? tags : (tags ? tags.split(",") : []) }),
      
      // Status and scheduling
      ...(status && { status }),
      ...(scheduledDate !== undefined && { scheduledDate }),
      ...(scheduledTime !== undefined && { scheduledTime }),
      ...(publishAt && { publishAt: new Date(publishAt) }),
      ...(publishingOptions && { publishingOptions }),
      
      // Meta data
      ...(metaTitle && { metaTitle }),
      ...(metaDescription && { metaDescription }),
      ...(slugUrl && { slugUrl })
    };

    // Handle status changes with proper validation
    if (status === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      return res.status(400).json(ApiResponse(null, "Scheduled date and time are required for scheduled status", false, 400));
    }

    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!item) {
      return res.status(404).json(ApiResponse(null, "Item not found", false, 404));
    }

    const statusMessage = {
      'draft': 'Item updated and moved to draft',
      'scheduled': 'Item updated and scheduled successfully',
      'published': 'Item updated and published successfully'
    };

    const message = status && statusMessage[status] ? statusMessage[status] : "Item updated successfully";

    res.status(200).json(ApiResponse(item, message, true, 200));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, "Error updating item", false, 500));
  }
};

/**
 * Get product by productId (supports both ObjectId and productId)
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params; // Can be either ObjectId or productId
    
    let item;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await Item.findById(id).populate('categoryId subCategoryId');
    }
    
    // If not found, try to find by itemId
    if (!item) {
      item = await Item.findOne({ itemId: id }).populate('categoryId subCategoryId');
    }
    
    if (!item) {
      return res.status(404).json(ApiResponse(null, "Product not found", false, 404));
    }
    
    res.status(200).json(ApiResponse(item, "Product retrieved successfully", true, 200));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * Get products by status (draft, scheduled, published)
 */
exports.getProductsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const validStatuses = ['draft', 'scheduled', 'published'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(ApiResponse(null, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, false, 400));
    }
    
    const items = await Item.find({ 
      status, 
      isDeleted: false 
    })
    .populate('categoryId subCategoryId')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
    
    const totalItems = await Item.countDocuments({ 
      status, 
      isDeleted: false 
    });
    
    res.status(200).json(ApiResponse(items, `${status.charAt(0).toUpperCase() + status.slice(1)} products retrieved successfully`, true, 200, {
      totalPages: Math.ceil(totalItems / limit),
      currentPage: parseInt(page),
      totalItems
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * Update product sizes only (Phase 1 update)
 */
exports.updateProductSizes = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { sizes } = req.body;
    
    if (!sizes || !Array.isArray(sizes)) {
      return res.status(400).json(ApiResponse(null, "Sizes array is required", false, 400));
    }
    
    const formattedSizes = sizes.map(size => ({
      size: size.size,
      quantity: parseInt(size.quantity) || 0,
      stock: parseInt(size.stock) || parseInt(size.quantity) || 0,
      hsnCode: size.hsnCode || '',
      sku: size.sku || '',
      barcode: size.barcode || '',
      regularPrice: Number(size.regularPrice || 0),
      salePrice: Number(size.salePrice || 0),
      // Measurements in cm
      fitWaistCm: Number(size.fitWaistCm) || 0,
      inseamLengthCm: Number(size.inseamLengthCm) || 0,
      chestCm: Number(size.chestCm) || 0,
      frontLengthCm: Number(size.frontLengthCm) || 0,
      acrossShoulderCm: Number(size.acrossShoulderCm) || 0,
      // Measurements in inches
      toFitWaistIn: Number(size.toFitWaistIn) || 0,
      inseamLengthIn: Number(size.inseamLengthIn) || 0,
      chestIn: Number(size.chestIn) || 0,
      frontLengthIn: Number(size.frontLengthIn) || 0,
      acrossShoulderIn: Number(size.acrossShoulderIn) || 0,
      // SEO fields at size level
      metaTitle: size.metaTitle || '',
      metaDescription: size.metaDescription || '',
      slugUrl: size.slugUrl || ''
    }));
    
    const item = await Item.findOneAndUpdate(
      { itemId: itemId },
      { $set: { sizes: formattedSizes } },
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json(ApiResponse(null, "Product not found", false, 404));
    }
    
    res.status(200).json(ApiResponse(item, "Product sizes updated successfully", true, 200));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * Toggle review settings (enable/disable reviews)
 */
exports.updateReviewSettings = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isReviewDisplayEnabled, isReviewSubmissionEnabled } = req.body;
    
    const updateData = {};
    if (isReviewDisplayEnabled !== undefined) {
      updateData.isReviewDisplayEnabled = Boolean(isReviewDisplayEnabled);
    }
    if (isReviewSubmissionEnabled !== undefined) {
      updateData.isReviewSubmissionEnabled = Boolean(isReviewSubmissionEnabled);
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json(ApiResponse(null, "At least one review setting must be provided", false, 400));
    }
    
    const item = await Item.findOneAndUpdate(
      { itemId: itemId },
      { $set: updateData },
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json(ApiResponse(null, "Product not found", false, 404));
    }
    
    res.status(200).json(ApiResponse(item, "Review settings updated successfully", true, 200));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, err.message, false, 500));
  }
};

/**
 * Delete an item by itemId
 */
exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log("params", itemId);
    
    let item;
    
    // Try to find by ObjectId first (for backward compatibility)
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      item = await Item.findByIdAndDelete(itemId);
    }
    
    // If not found, try to find by itemId
    if (!item) {
      item = await Item.findOneAndDelete({ itemId: itemId });
    }
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    // Delete images from S3
    if (item.images && Array.isArray(item.images)) {
      for (const image of item.images) {
        if (image.url) {
          await deleteFileFromS3(image.url);
        }
      }
    }
    
    // Delete legacy imageUrl if exists
    if (item.imageUrl) {
      await deleteFileFromS3(item.imageUrl);
    }
    
    // Delete variant images
    if (item.variants && Array.isArray(item.variants)) {
      for (const variant of item.variants) {
        if (variant.images && Array.isArray(variant.images)) {
          for (const imageUrl of variant.images) {
            if (imageUrl) {
              await deleteFileFromS3(imageUrl);
            }
          }
        }
        if (variant.videos && Array.isArray(variant.videos)) {
          for (const videoUrl of variant.videos) {
            if (videoUrl) {
              await deleteFileFromS3(videoUrl);
            }
          }
        }
      }
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting item", error: err.message });
  }
};

/**
 * Get latest items by subCategoryId sorted by timestamp (latest first)
 */
exports.getLatestItemsBySubCategory = async (req, res) => {
  console.log("1111111111111111");
  try {
    const { subCategoryId } = req.params;
    const { page = 1, limit = 100 } = req.query;

    const items = await Item.find({ subCategoryId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const totalItems = await Item.countDocuments({ subCategoryId });

    res.status(200).json(ApiResponse(items, "Latest items fetched successfully", true, 200, {
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, "Error fetching latest items", false, 500, err.message));
  }
};

/**
 * Get total item count
 */
exports.getTotalItemCount = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();

    res.status(200).json(ApiResponse({ totalItems }, "Total item count fetched successfully", true, 200));
  } catch (err) {
    console.error(err);
    res.status(500).json(ApiResponse(null, "Error fetching total item count", false, 500, err.message));
  }
};

/**
 * Get item statistics by status
 */
exports.getItemStatistics = async (req, res) => {
  try {
    // Get counts for each status
    const draftsCount = await Item.countDocuments({ status: 'draft' });
    const publishedCount = await Item.countDocuments({ status: 'published' });
    const scheduledCount = await Item.countDocuments({ status: 'scheduled' });
    const totalCount = await Item.countDocuments();

    const statistics = {
      drafts: draftsCount,
      live: publishedCount, // Mapping 'published' to 'live' for frontend compatibility
      published: publishedCount,
      scheduled: scheduledCount,
      total: totalCount
    };

    res.status(200).json(ApiResponse(statistics, "Item statistics fetched successfully", true, 200));
  } catch (err) {
    console.error("Error fetching item statistics:", err);
    res.status(500).json(ApiResponse(null, "Error fetching item statistics", false, 500, err.message));
  }
};

// ==============================
// PRODUCT BUNDLING FUNCTIONALITY
// ==============================

/**
 * Create a new product bundle
 * Combines a main product with additional items (e.g., red t-shirt + yellow pants + grey shoes)
 */
exports.createProductBundle = async (req, res) => {
  try {
    const {
      bundleName,
      description,
      mainProduct,
      bundleItems,
      bundlePrice,
      isActive = true,
      priority = 1,
      showOnProductPage = true,
      showInRecommendations = true,
      validFrom,
      validUntil,
      createdBy
    } = req.body;

    // Validation
    if (!bundleName || !mainProduct || !bundleItems || !bundlePrice || !createdBy) {
      return res.status(400).json(
        ApiResponse(null, "Bundle name, main product, bundle items, bundle price, and creator are required", false, 400)
      );
    }

    if (!Array.isArray(bundleItems) || bundleItems.length === 0) {
      return res.status(400).json(
        ApiResponse(null, "Bundle items must be a non-empty array", false, 400)
      );
    }

    // Validate main product exists
    const mainItem = await Item.findById(mainProduct.itemId)
      .populate('categoryId subCategoryId');
    
    if (!mainItem) {
      return res.status(404).json(
        ApiResponse(null, "Main product not found", false, 404)
      );
    }

    // Validate all bundle items exist
    const bundleItemIds = bundleItems.map(item => item.itemId);
    const existingItems = await Item.find({ _id: { $in: bundleItemIds } })
      .populate('categoryId subCategoryId');
    
    if (existingItems.length !== bundleItems.length) {
      return res.status(404).json(
        ApiResponse(null, "One or more bundle items not found", false, 404)
      );
    }

    // Prepare main product data
    const mainProductData = {
      itemId: mainItem._id,
      productId: mainItem.itemId,
      productName: mainItem.productName,
      categoryId: mainItem.categoryId._id,
      subCategoryId: mainItem.subCategoryId._id,
      categoryName: mainItem.categoryId.name,
      subCategoryName: mainItem.subCategoryId.name,
      image: mainItem.images && mainItem.images.length > 0 ? mainItem.images[0].url : '',
      price: mainProduct.price || mainItem.regularPrice || 0
    };

    // Prepare bundle items data
    const bundleItemsData = bundleItems.map((bundleItem, index) => {
      const item = existingItems.find(existingItem => 
        existingItem._id.toString() === bundleItem.itemId.toString()
      );
      
      return {
        itemId: item._id,
        productId: item.itemId,
        productName: item.productName,
        categoryId: item.categoryId._id,
        subCategoryId: item.subCategoryId._id,
        categoryName: item.categoryId.name,
        subCategoryName: item.subCategoryId.name,
        image: item.images && item.images.length > 0 ? item.images[0].url : '',
        price: bundleItem.price || item.regularPrice || 0,
        discountPrice: bundleItem.discountPrice || 0,
        position: index
      };
    });

    // Create new bundle
    const newBundle = new ProductBundle({
      bundleName,
      description,
      mainProduct: mainProductData,
      bundleItems: bundleItemsData,
      bundlePrice: parseFloat(bundlePrice),
      isActive,
      priority: parseInt(priority),
      showOnProductPage,
      showInRecommendations,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      createdBy
    });

    const savedBundle = await newBundle.save();
    
    // Populate the saved bundle for response
    const populatedBundle = await ProductBundle.findById(savedBundle._id)
      .populate('mainProduct.itemId bundleItems.itemId');

    res.status(201).json(
      ApiResponse(populatedBundle, "Product bundle created successfully", true, 201)
    );

  } catch (err) {
    console.error("Error creating product bundle:", err);
    res.status(500).json(
      ApiResponse(null, "Error creating product bundle", false, 500, err.message)
    );
  }
};

/**
 * Get all product bundles with filtering and pagination
 */
exports.getAllProductBundles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      mainProductId,
      categoryId,
      subCategoryId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (mainProductId) {
      filter['mainProduct.itemId'] = mainProductId;
    }
    
    if (categoryId) {
      filter['mainProduct.categoryId'] = categoryId;
    }
    
    if (subCategoryId) {
      filter['mainProduct.subCategoryId'] = subCategoryId;
    }
    
    if (search) {
      filter.$or = [
        { bundleName: { $regex: search, $options: 'i' } },
        { 'mainProduct.productName': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute query
    const bundles = await ProductBundle.find(filter)
      .populate('mainProduct.itemId bundleItems.itemId')
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const totalBundles = await ProductBundle.countDocuments(filter);
    const totalPages = Math.ceil(totalBundles / pageSize);

    const result = {
      bundles,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalBundles,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    };

    res.status(200).json(
      ApiResponse(result, "Product bundles fetched successfully", true, 200)
    );

  } catch (err) {
    console.error("Error fetching product bundles:", err);
    res.status(500).json(
      ApiResponse(null, "Error fetching product bundles", false, 500, err.message)
    );
  }
};

/**
 * Get a specific product bundle by ID
 */
exports.getProductBundleById = async (req, res) => {
  try {
    const { bundleId } = req.params;

    const bundle = await ProductBundle.findById(bundleId)
      .populate('mainProduct.itemId bundleItems.itemId');

    if (!bundle) {
      return res.status(404).json(
        ApiResponse(null, "Product bundle not found", false, 404)
      );
    }

    res.status(200).json(
      ApiResponse(bundle, "Product bundle fetched successfully", true, 200)
    );

  } catch (err) {
    console.error("Error fetching product bundle:", err);
    res.status(500).json(
      ApiResponse(null, "Error fetching product bundle", false, 500, err.message)
    );
  }
};

/**
 * Update a product bundle
 */
exports.updateProductBundle = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const {
      bundleName,
      description,
      bundleItems,
      bundlePrice,
      isActive,
      priority,
      showOnProductPage,
      showInRecommendations,
      validFrom,
      validUntil,
      updatedBy
    } = req.body;

    const bundle = await ProductBundle.findById(bundleId);
    
    if (!bundle) {
      return res.status(404).json(
        ApiResponse(null, "Product bundle not found", false, 404)
      );
    }

    // If bundle items are being updated, validate them
    if (bundleItems && Array.isArray(bundleItems)) {
      const bundleItemIds = bundleItems.map(item => item.itemId);
      const existingItems = await Item.find({ _id: { $in: bundleItemIds } })
        .populate('categoryId subCategoryId');
      
      if (existingItems.length !== bundleItems.length) {
        return res.status(404).json(
          ApiResponse(null, "One or more bundle items not found", false, 404)
        );
      }

      // Update bundle items data
      bundle.bundleItems = bundleItems.map((bundleItem, index) => {
        const item = existingItems.find(existingItem => 
          existingItem._id.toString() === bundleItem.itemId.toString()
        );
        
        return {
          itemId: item._id,
          productId: item.itemId,
          productName: item.productName,
          categoryId: item.categoryId._id,
          subCategoryId: item.subCategoryId._id,
          categoryName: item.categoryId.name,
          subCategoryName: item.subCategoryId.name,
          image: item.images && item.images.length > 0 ? item.images[0].url : '',
          price: bundleItem.price || item.regularPrice || 0,
          discountPrice: bundleItem.discountPrice || 0,
          position: index
        };
      });
    }

    // Update other fields
    if (bundleName !== undefined) bundle.bundleName = bundleName;
    if (description !== undefined) bundle.description = description;
    if (bundlePrice !== undefined) bundle.bundlePrice = parseFloat(bundlePrice);
    if (isActive !== undefined) bundle.isActive = isActive;
    if (priority !== undefined) bundle.priority = parseInt(priority);
    if (showOnProductPage !== undefined) bundle.showOnProductPage = showOnProductPage;
    if (showInRecommendations !== undefined) bundle.showInRecommendations = showInRecommendations;
    if (validFrom !== undefined) bundle.validFrom = new Date(validFrom);
    if (validUntil !== undefined) bundle.validUntil = validUntil ? new Date(validUntil) : null;
    if (updatedBy !== undefined) bundle.updatedBy = updatedBy;

    const updatedBundle = await bundle.save();
    
    // Populate the updated bundle for response
    const populatedBundle = await ProductBundle.findById(updatedBundle._id)
      .populate('mainProduct.itemId bundleItems.itemId');

    res.status(200).json(
      ApiResponse(populatedBundle, "Product bundle updated successfully", true, 200)
    );

  } catch (err) {
    console.error("Error updating product bundle:", err);
    res.status(500).json(
      ApiResponse(null, "Error updating product bundle", false, 500, err.message)
    );
  }
};

/**
 * Delete a product bundle
 */
exports.deleteProductBundle = async (req, res) => {
  try {
    const { bundleId } = req.params;

    const bundle = await ProductBundle.findById(bundleId);
    
    if (!bundle) {
      return res.status(404).json(
        ApiResponse(null, "Product bundle not found", false, 404)
      );
    }

    await ProductBundle.findByIdAndDelete(bundleId);

    res.status(200).json(
      ApiResponse(null, "Product bundle deleted successfully", true, 200)
    );

  } catch (err) {
    console.error("Error deleting product bundle:", err);
    res.status(500).json(
      ApiResponse(null, "Error deleting product bundle", false, 500, err.message)
    );
  }
};

/**
 * Get bundles for a specific main product (for showing on product page)
 */
exports.getBundlesForProduct = async (req, res) => {
  try {
    const { itemId } = req.params;

    const bundles = await ProductBundle.find({
      'mainProduct.itemId': itemId,
      isActive: true,
      showOnProductPage: true
    })
    .populate('mainProduct.itemId bundleItems.itemId')
    .sort({ priority: -1, createdAt: -1 });

    res.status(200).json(
      ApiResponse(bundles, "Product bundles fetched successfully", true, 200)
    );

  } catch (err) {
    console.error("Error fetching bundles for product:", err);
    res.status(500).json(
      ApiResponse(null, "Error fetching bundles for product", false, 500, err.message)
    );
  }
};

/**
 * Get all items for bundle creation (with category and subcategory info)
 */
exports.getItemsForBundling = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      categoryId,
      subCategoryId,
      search,
      excludeItemIds
    } = req.query;

    // Build filter query
    const filter = {
      status: 'published', // Only published items can be bundled
    };
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    if (subCategoryId) {
      filter.subCategoryId = subCategoryId;
    }
    
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Exclude specific items (useful when editing bundles)
    if (excludeItemIds) {
      const excludeIds = Array.isArray(excludeItemIds) ? excludeItemIds : [excludeItemIds];
      filter._id = { $nin: excludeIds };
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute query
    const items = await Item.find(filter)
      .populate('categoryId subCategoryId')
      .select('productId productName title images regularPrice salePrice categoryId subCategoryId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    // Format items for bundling UI
    const formattedItems = items.map(item => ({
      _id: item._id,
      productId: item.itemId,
      productName: item.productName,
      title: item.title,
      categoryId: item.categoryId._id,
      categoryName: item.categoryId.name,
      subCategoryId: item.subCategoryId._id,
      subCategoryName: item.subCategoryId.name,
      image: item.images && item.images.length > 0 ? item.images[0].url : '',
      regularPrice: item.regularPrice || 0,
      salePrice: item.salePrice || 0,
      currentPrice: item.salePrice || item.regularPrice || 0
    }));

    const result = {
      items: formattedItems,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    };

    res.status(200).json(
      ApiResponse(result, "Items for bundling fetched successfully", true, 200)
    );

  } catch (err) {
    console.error("Error fetching items for bundling:", err);
    res.status(500).json(
      ApiResponse(null, "Error fetching items for bundling", false, 500, err.message)
    );
  }
};

/**
 * Get categories and subcategories for bundle filtering
 */
exports.getCategoriesForBundling = async (req, res) => {
  try {
    // Get all categories - no populate needed since Category doesn't reference SubCategory
    const categories = await Category.find()
      .select('name description')
      .sort({ name: 1 });

    // Get subcategories separately with category info
    const subcategories = await SubCategory.find()
      .populate('categoryId', 'name')
      .select('name description categoryId')
      .sort({ name: 1 });

    console.log('Categories found:', categories.length);
    console.log('Subcategories found:', subcategories.length);

    const result = {
      categories,
      subcategories
    };

    res.status(200).json(
      ApiResponse(result, "Categories for bundling fetched successfully", true, 200)
    );

  } catch (err) {
    console.error("Error fetching categories for bundling:", err);
    res.status(500).json(
      ApiResponse(null, "Error fetching categories for bundling", false, 500, err.message)
    );
  }
};

/**
 * Toggle bundle active status
 */
exports.toggleBundleStatus = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const { updatedBy } = req.body;

    const bundle = await ProductBundle.findById(bundleId);
    
    if (!bundle) {
      return res.status(404).json(
        ApiResponse(null, "Product bundle not found", false, 404)
      );
    }

    bundle.isActive = !bundle.isActive;
    if (updatedBy) bundle.updatedBy = updatedBy;
    
    await bundle.save();

    const action = bundle.isActive ? 'activated' : 'deactivated';

    res.status(200).json(
      ApiResponse(bundle, `Product bundle ${action} successfully`, true, 200)
    );

  } catch (err) {
    console.error("Error toggling bundle status:", err);
    res.status(500).json(
      ApiResponse(null, "Error toggling bundle status", false, 500, err.message)
    );
  }
};

/**
 * Update bundle items order (for drag & drop functionality)
 */
exports.updateBundleItemsOrder = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const { bundleItems, updatedBy } = req.body;

    if (!Array.isArray(bundleItems)) {
      return res.status(400).json(
        ApiResponse(null, "Bundle items must be an array", false, 400)
      );
    }

    const bundle = await ProductBundle.findById(bundleId);
    
    if (!bundle) {
      return res.status(404).json(
        ApiResponse(null, "Product bundle not found", false, 404)
      );
    }

    // Update positions
    bundle.bundleItems = bundleItems.map((item, index) => ({
      ...item,
      position: index
    }));

    if (updatedBy) bundle.updatedBy = updatedBy;
    
    await bundle.save();

    const populatedBundle = await ProductBundle.findById(bundleId)
      .populate('mainProduct.itemId bundleItems.itemId');

    res.status(200).json(
      ApiResponse(populatedBundle, "Bundle items order updated successfully", true, 200)
    );

  } catch (err) {
    console.error("Error updating bundle items order:", err);
    res.status(500).json(
      ApiResponse(null, "Error updating bundle items order", false, 500, err.message)
    );
  }
};

// ==============================
// ARRANGEMENT CONTROL FUNCTIONALITY
// ==============================

/**
 * Get all categories with their subcategories for arrangement control
 */
exports.getCategoriesForArrangement = async (req, res) => {
  try {
    const categories = await Category.find({})
      .select('name description imageUrl')
      .sort({ name: 1 });
    
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await SubCategory.find({ categoryId: category._id })
          .select('name description imageUrl categoryId')
          .sort({ name: 1 });
        
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl,
          subcategories: subcategories
        };
      })
    );

    res.status(200).json(
      ApiResponse(categoriesWithSubcategories, "Categories fetched successfully for arrangement", true, 200)
    );
  } catch (err) {
    console.error("Error fetching categories for arrangement:", err);
    res.status(500).json(
      ApiResponse(null, "Error fetching categories for arrangement", false, 500, err.message)
    );
  }
};

/**
 * Get items by category and subcategory for arrangement
 */
exports.getItemsForArrangement = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.query;
    
    let filter = { isActive: true, isDeleted: false, status: 'published' };
    
    if (categoryId && categoryId !== 'all') {
      filter.categoryId = categoryId;
    }
    
    if (subCategoryId && subCategoryId !== 'all') {
      filter.subCategoryId = subCategoryId;
    }

    const items = await Item.find(filter)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .select('productName title description images displayOrder categoryId subCategoryId productId')
      .sort({ displayOrder: 1, createdAt: -1 });

    const formattedItems = items.map((item, index) => ({
      _id: item._id,
      productId: item.itemId,
      productName: item.productName,
      title: item.title || item.productName,
      description: item.description,
      image: item.images && item.images.length > 0 ? item.images[0].url : '/api/placeholder/65/65',
      category: item.categoryId?.name || 'Uncategorized',
      subcategory: item.subCategoryId?.name || 'Uncategorized',
      displayOrder: item.displayOrder || index,
      originalIndex: index
    }));

    res.status(200).json(
      ApiResponse(formattedItems, "Items fetched successfully for arrangement", true, 200)
    );
  } catch (err) {
    console.error("Error fetching items for arrangement:", err);
    res.status(500).json(
      ApiResponse(null, "Error fetching items for arrangement", false, 500, err.message)
    );
  }
};

/**
 * Update items display order (for drag & drop arrangement)
 */
exports.updateItemsDisplayOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json(
        ApiResponse(null, "Items must be an array", false, 400)
      );
    }

    // Use bulkWrite for better performance
    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id || item.id },
        update: { displayOrder: index + 1 }
      }
    }));

    await Item.bulkWrite(bulkOps);

    // Fetch updated items to return
    const itemIds = items.map(item => item._id || item.id);
    const updatedItems = await Item.find({ _id: { $in: itemIds } })
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .select('productName title description images displayOrder categoryId subCategoryId productId')
      .sort({ displayOrder: 1 });

    res.status(200).json(
      ApiResponse(updatedItems, "Items display order updated successfully", true, 200)
    );

  } catch (err) {
    console.error("Error updating items display order:", err);
    res.status(500).json(
      ApiResponse(null, "Error updating items display order", false, 500, err.message)
    );
  }
};

/**
 * Update category display order
 */
exports.updateCategoriesDisplayOrder = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json(
        ApiResponse(null, "Categories must be an array", false, 400)
      );
    }

    const bulkOps = categories.map((category, index) => ({
      updateOne: {
        filter: { _id: category._id || category.id },
        update: { displayOrder: index + 1 }
      }
    }));

    await Category.bulkWrite(bulkOps);

    const updatedCategories = await Category.find({})
      .select('name description imageUrl displayOrder')
      .sort({ displayOrder: 1 });

    res.status(200).json(
      ApiResponse(updatedCategories, "Categories display order updated successfully", true, 200)
    );

  } catch (err) {
    console.error("Error updating categories display order:", err);
    res.status(500).json(
      ApiResponse(null, "Error updating categories display order", false, 500, err.message)
    );
  }
};

/**
 * Update subcategory display order
 */
exports.updateSubCategoriesDisplayOrder = async (req, res) => {
  try {
    const { subcategories } = req.body;

    if (!Array.isArray(subcategories)) {
      return res.status(400).json(
        ApiResponse(null, "Subcategories must be an array", false, 400)
      );
    }

    const bulkOps = subcategories.map((subcategory, index) => ({
      updateOne: {
        filter: { _id: subcategory._id || subcategory.id },
        update: { displayOrder: index + 1 }
      }
    }));

    await SubCategory.bulkWrite(bulkOps);

    const updatedSubCategories = await SubCategory.find({})
      .populate('categoryId', 'name')
      .select('name description imageUrl displayOrder categoryId')
      .sort({ displayOrder: 1 });

    res.status(200).json(
      ApiResponse(updatedSubCategories, "Subcategories display order updated successfully", true, 200)
    );

  } catch (err) {
    console.error("Error updating subcategories display order:", err);
    res.status(500).json(
      ApiResponse(null, "Error updating subcategories display order", false, 500, err.message)
    );
  }
};