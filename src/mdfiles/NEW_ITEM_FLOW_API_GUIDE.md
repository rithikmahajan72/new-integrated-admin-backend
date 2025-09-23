# New Item Flow API Guide

This guide describes the new flow-based approach for creating and managing products in the Yoraa backend system.

## Overview

The new flow divides product creation into 5 distinct phases:

1. **Phase 1**: Basic product information + sizes (product details upload)
2. **Phase 2**: Draft section with images, filters, categories
3. **Phase 3**: Reviews management (consumer/admin)
4. **Phase 4**: alsoShowInOptions management in drafts
5. **Phase 5**: Status management (draft → schedule → live)

## API Endpoints

### Phase 1: Create Basic Product

**Endpoint**: `POST /api/items/basic-product`

**Description**: Creates a basic product with essential information and optional sizes.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "productName": "Men's Cotton T-Shirt",
  "title": "Premium Cotton T-Shirt for Men",
  "description": "High-quality cotton t-shirt perfect for casual wear",
  "manufacturingDetails": "Made with 100% organic cotton",
  "shippingAndReturns": "Free shipping on orders above $50. 30-day return policy.",
  "returnable": true,
  "sizes": [
    {
      "size": "M",
      "quantity": 100,
      "stock": 100,
      "hsnCode": "62051000",
      "sku": "men-tshirt-cotton-2025-01-21-12345678",
      "barcode": "1234567890123",
      "regularPrice": 29.99,
      "salePrice": 24.99,
      "fitWaistCm": 76,
      "inseamLengthCm": 71,
      "chestCm": 101,
      "frontLengthCm": 71,
      "acrossShoulderCm": 45,
      "toFitWaistIn": 30,
      "inseamLengthIn": 28,
      "chestIn": 40,
      "frontLengthIn": 28,
      "acrossShoulderIn": 18,
      "metaTitle": "Men's Cotton T-Shirt - Medium",
      "metaDescription": "Premium cotton t-shirt in medium size",
      "slugUrl": "mens-cotton-tshirt-medium"
    }
  ]
}
```

**Response**:
```json
{
  "data": {
    "productId": "ITEM_1732123456789_abc123def",
    "productName": "Men's Cotton T-Shirt",
    "status": "draft",
    // ... other product details
  },
  "message": "Basic product created successfully. Ready for draft configuration.",
  "success": true,
  "statusCode": 201
}
```

### Phase 2: Update Draft Configuration

**Endpoint**: `PUT /api/items/:productId/draft-configuration`

**Description**: Adds images, filters, categories to move product to draft section.

**Request Body**:
```json
{
  "categoryId": "60a5f1234567890123456789",
  "subCategoryId": "60a5f9876543210987654321",
  "images": [
    {
      "url": "https://bucket.s3.amazonaws.com/image1.jpg",
      "type": "image",
      "priority": 1
    },
    {
      "url": "https://bucket.s3.amazonaws.com/image2.jpg",
      "type": "image",
      "priority": 2
    }
  ],
  "filters": [
    {
      "key": "color",
      "value": "blue",
      "code": "BL"
    },
    {
      "key": "material",
      "value": "cotton",
      "code": "CT"
    }
  ],
  "variants": [
    {
      "name": "Blue Cotton",
      "images": ["https://bucket.s3.amazonaws.com/variant1.jpg"],
      "videos": [],
      "colors": ["#0066CC"]
    }
  ],
  "alsoShowInOptions": {
    "similarItems": {
      "enabled": false,
      "placement": "default",
      "items": []
    },
    "othersAlsoBought": {
      "enabled": false,
      "placement": "default",
      "items": []
    },
    "youMightAlsoLike": {
      "enabled": false,
      "placement": "default",
      "items": []
    }
  }
}
```

### Phase 3: Add Review

**Endpoint**: `POST /api/items/:productId/reviews`

**Description**: Add a review to the product (available to both consumers and admins).

**Request Body**:
```json
{
  "userId": "60a5f1234567890123456789",
  "rating": 5,
  "reviewText": "Excellent quality t-shirt! Very comfortable and fits perfectly."
}
```

### Phase 4: Update Also Show In Options

**Endpoint**: `PUT /api/items/:productId/also-show-options`

**Description**: Configure related product recommendations.

**Request Body**:
```json
{
  "alsoShowInOptions": {
    "similarItems": {
      "enabled": true,
      "placement": "sidebar",
      "items": [
        {
          "productId": "ITEM_1732123456789_xyz789def",
          "reason": "Similar style"
        }
      ]
    },
    "othersAlsoBought": {
      "enabled": true,
      "placement": "bottom",
      "items": [
        {
          "productId": "ITEM_1732123456789_abc456ghi",
          "reason": "Frequently bought together"
        }
      ]
    },
    "youMightAlsoLike": {
      "enabled": true,
      "placement": "default",
      "items": []
    },
    "customOptions": [],
    "appPlacements": {
      "mobile": "bottom",
      "desktop": "sidebar"
    }
  }
}
```

### Phase 5: Update Product Status

**Endpoint**: `PUT /api/items/:productId/status`

**Description**: Change product status from draft to scheduled or published.

**Request Body for Scheduling**:
```json
{
  "status": "scheduled",
  "scheduledDate": "2024-01-25",
  "scheduledTime": "10:30",
  "publishAt": "2024-01-25T10:30:00.000Z",
  "publishingOptions": {
    "action": "schedule",
    "autoPublish": true,
    "notificationSettings": {
      "emailNotification": true,
      "pushNotification": false
    }
  }
}
```

**Request Body for Publishing**:
```json
{
  "status": "published",
  "publishingOptions": {
    "action": "publish",
    "notificationSettings": {
      "emailNotification": true,
      "pushNotification": true
    }
  }
}
```

## Utility Endpoints

### Get Product by ID

**Endpoint**: `GET /api/items/product/:id`

**Description**: Retrieve product by either ObjectId or productId.

### Get Products by Status

**Endpoint**: `GET /api/items/status/:status`

**Description**: Get all products with a specific status (draft, scheduled, published).

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

### Update Product Sizes

**Endpoint**: `PUT /api/items/:productId/sizes`

**Description**: Update only the sizes of a product.

### Update Review Settings

**Endpoint**: `PUT /api/items/:productId/review-settings`

**Description**: Enable/disable review display and submission.

**Request Body**:
```json
{
  "isReviewDisplayEnabled": true,
  "isReviewSubmissionEnabled": true
}
```

## Item Schema Fields Reference

### Basic Product Information
- `productName` (required): Name of the product
- `title`: Display title (defaults to productName)
- `description` (required): Product description
- `manufacturingDetails`: Manufacturing information
- `shippingAndReturns`: Shipping and return policy
- `returnable`: Whether the item can be returned (default: true)

### Size Schema (at size level)
- `size` (required): Size identifier (S, M, L, XL, etc.)
- `quantity`: Available quantity
- `stock`: Stock count (for compatibility)
- `hsnCode`: HSN code (max 8 digits)
- `sku` (required): Stock keeping unit
- `barcode`: Product barcode (max 14 digits)
- `regularPrice` (required): Regular selling price
- `salePrice`: Sale/discounted price
- `fitWaistCm`, `inseamLengthCm`, `chestCm`, `frontLengthCm`, `acrossShoulderCm`: Measurements in centimeters
- `toFitWaistIn`, `inseamLengthIn`, `chestIn`, `frontLengthIn`, `acrossShoulderIn`: Measurements in inches
- `metaTitle`, `metaDescription`, `slugUrl`: SEO fields at size level

### Categories
- `categoryId` (required for Phase 2): Category ObjectId
- `subCategoryId` (required for Phase 2): SubCategory ObjectId

### Images and Media
- `images`: Array of image objects with `url`, `type`, and `priority`
- `variants`: Product variants with images, videos, and colors

### Filters
- `filters`: Array of filter objects with `key`, `value`, and optional `code`

### Reviews
- `reviews`: Array of review objects
- `averageRating`: Calculated average rating (0-5)
- `totalReviews`: Total number of reviews
- `ratingDistribution`: Distribution of ratings (1-5 stars)
- `isReviewDisplayEnabled`: Whether to display reviews
- `isReviewSubmissionEnabled`: Whether to allow new reviews

### Status Management
- `status`: Current status (draft, scheduled, published)
- `scheduledDate`: Scheduled publication date
- `scheduledTime`: Scheduled publication time
- `publishAt`: Combined scheduled datetime
- `publishedAt`: Actual publication timestamp
- `publishingOptions`: Publishing configuration

### Also Show In Options
- `alsoShowInOptions.similarItems`: Similar product recommendations
- `alsoShowInOptions.othersAlsoBought`: "Others also bought" recommendations
- `alsoShowInOptions.youMightAlsoLike`: "You might also like" recommendations
- `alsoShowInOptions.customOptions`: Custom recommendation options
- `alsoShowInOptions.appPlacements`: Platform-specific placements

## Error Responses

All endpoints return consistent error responses:

```json
{
  "data": null,
  "message": "Error description",
  "success": false,
  "statusCode": 400
}
```

Common error status codes:
- `400`: Bad Request (validation errors, missing required fields)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (product not found)
- `500`: Internal Server Error (server-side errors)

## Legacy Support

The system maintains backward compatibility with the existing `createItem` and `updateItem` endpoints for legacy integrations. However, new implementations should use the flow-based approach for better organization and maintainability.
