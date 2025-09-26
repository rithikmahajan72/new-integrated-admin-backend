# Backend ID Standardization - Complete Guide

## Summary

This document outlines the standardization of product/item identification across the Yoraa Clothing Shop backend to use **`itemId`** as the primary identifier.

## Background

The system previously used inconsistent identification patterns:
- Some routes used `:productId`
- Others used `:id` 
- Frontend mixed `item._id` (MongoDB ObjectId) and `item.itemId`
- Database models had mixed naming conventions

## Standardization Decision

**Primary Identifier: `itemId`**

### Why `itemId`?
1. **Business Logic Identifier**: Human-readable format (`ITEM_1234567890_abc123def`)
2. **Database Independent**: Not tied to MongoDB ObjectIds
3. **Consistent Pattern**: Clear semantic meaning for item identification
4. **Frontend Friendly**: Easier to work with than ObjectIds
5. **API Clarity**: Clear semantic meaning in REST endpoints
6. **Semantic Consistency**: "itemId" clearly indicates it's an identifier for an item/product

## Changes Made

### 1. Backend Routes Updated

#### ItemRoutes.js
- `GET /api/items/:id` → `GET /api/items/:itemId`
- `PUT /api/items/:id` → `PUT /api/items/:itemId`
- `DELETE /api/items/:id` → `DELETE /api/items/:itemId`
- `GET /api/items/:productId/bundles` → `GET /api/items/:itemId/bundles`

#### ReviewRoutes.js
- All routes changed from `:productId` to `:itemId`
- Examples:
  - `POST /user/:productId/reviews` → `POST /user/:itemId/reviews`
  - `GET /public/:productId/reviews` → `GET /public/:itemId/reviews`

#### WishlistRoutes.js
- `DELETE /remove/:productId` → `DELETE /remove/:itemId`

#### CartRoutes.js
- `DELETE /item/:productId` → `DELETE /item/:itemId`

### 2. Controller Methods Updated

#### ItemController.js
- `getItemById()`: Now accepts productId, supports both ObjectId (backward compatibility) and productId
- `deleteItem()`: Now accepts productId, supports both ObjectId (backward compatibility) and productId

### 3. Database Model Updates

#### Order.js
- `item_quantities.item_id` → `item_quantities.product_id`
- Changed from ObjectId reference to String productId

### 4. Frontend API Updates

#### endpoints.js
- Function parameter names changed from `itemId` to `productId`
- API calls updated to use productId

#### ItemManagement.jsx
- Status update logic now uses `item.productId` as primary identifier
- Fallback to `item._id` for backward compatibility

## Backward Compatibility

All controller methods include backward compatibility:

```javascript
// Controller pattern for backward compatibility
let item;

// Try to find by ObjectId first (for backward compatibility)
if (mongoose.Types.ObjectId.isValid(productId)) {
  item = await Item.findById(productId);
}

// If not found, try to find by productId
if (!item) {
  item = await Item.findOne({ productId: productId });
}
```

This ensures:
- Existing ObjectId-based calls continue to work
- New productId-based calls work seamlessly
- Gradual migration without breaking changes

## Database Schema

### Item Model (Primary)
```javascript
{
  productId: String (unique, required) // e.g., "ITEM_1672234567890_abc123def"
  _id: ObjectId // MongoDB default, kept for database operations
  // ... other fields
}
```

### ProductBundle Model (Reference Both)
```javascript
{
  mainProduct: {
    itemId: ObjectId (ref: 'Item'), // For Mongoose population
    productId: String // For business logic and queries
  },
  bundleItems: [{
    itemId: ObjectId (ref: 'Item'), // For Mongoose population  
    productId: String // For business logic and queries
  }]
}
```

### Order Model (Updated)
```javascript
{
  items: [ObjectId] // Still reference Items for population
  item_quantities: [{
    product_id: String, // Now uses productId instead of item_id ObjectId
    quantity: Number,
    sku: String
  }]
}
```

## API Endpoint Patterns

### Standard Pattern
```
GET    /api/items/:productId           // Get single item
PUT    /api/items/:productId           // Update item  
DELETE /api/items/:productId           // Delete item
POST   /api/items/:productId/reviews   // Add review
GET    /api/items/:productId/bundles   // Get bundles
```

### New Flow Endpoints (Already using productId)
```
PUT    /api/items/:productId/draft-configuration
PUT    /api/items/:productId/status
PUT    /api/items/:productId/sizes
GET    /api/items/product/:productId   // Alternative getter
```

## Frontend Usage

### Redux Actions
```javascript
// Update status action
updateProductStatus({ 
  productId: item.productId || item._id, // Primary: productId, Fallback: _id
  statusData 
})
```

### Component Logic  
```javascript
// Primary identifier resolution
const productId = item.productId || item._id;

// API calls
await itemAPI.getItemById(productId);
await itemAPI.updateItem(productId, data);
await itemAPI.deleteItem(productId);
```

## Benefits Achieved

1. **Consistency**: All endpoints use the same parameter naming convention
2. **Clarity**: `productId` is semantically clear compared to generic `id`
3. **Business Logic**: Aligns with business identifiers rather than database internals
4. **Maintainability**: Easier to understand and maintain codebase
5. **API Documentation**: Clear, consistent API documentation
6. **Backward Compatibility**: Existing integrations continue to work

## Migration Checklist

### Backend ✅
- [x] Routes updated to use `:productId`
- [x] Controller methods support both ObjectId and productId  
- [x] Database models updated where needed
- [x] Backward compatibility maintained

### Frontend ✅  
- [x] API endpoint functions updated
- [x] Component logic updated to use productId as primary
- [x] Redux actions updated

### Documentation ✅
- [x] API documentation updated
- [x] Code comments updated
- [x] This standardization guide created

## Next Steps

1. **Testing**: Thoroughly test all endpoints with both old and new identifiers
2. **Monitoring**: Monitor for any issues during the transition period
3. **Gradual Migration**: Update client applications to use productId
4. **Future Cleanup**: After full migration, consider removing ObjectId fallback support

## Example Usage

### Create Item
```javascript
// Returns item with productId: "ITEM_1672234567890_abc123def"
const newItem = await itemAPI.createItem(itemData);
```

### Get Item  
```javascript
// Works with either:
const item1 = await itemAPI.getItemById("ITEM_1672234567890_abc123def"); // productId
const item2 = await itemAPI.getItemById("64a7b8c9d012345e678f9012"); // ObjectId (backward compatibility)
```

### Update Item
```javascript
// Primary usage
await itemAPI.updateItem(item.productId, updatedData);

// Fallback for compatibility
await itemAPI.updateItem(item._id, updatedData);
```

This standardization provides a solid foundation for consistent product identification across the entire Yoraa Clothing Shop system.
