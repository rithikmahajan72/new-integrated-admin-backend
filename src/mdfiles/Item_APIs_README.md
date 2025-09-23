# Yoraa Items API - Postman Collection Guide

## Overview
This comprehensive Postman collection provides complete API testing capabilities for the enhanced `Item.js` model in the Yoraa backend system. The collection includes all CRUD operations, advanced filtering, image management, reviews, scheduled publishing, and statistical reporting.

## Collection Structure

### 1. **Authentication**
- **Admin Login**: Get authentication token required for protected routes

### 2. **Item Management**
- **Create Item**: Create new items with complete schema support
- **Get All Items**: Retrieve all items with pagination and sorting
- **Get Item by ID**: Fetch specific item details
- **Update Item**: Modify existing items
- **Delete Item**: Remove items (admin only)

### 3. **Item Filtering & Search**
- **Filter Items**: Advanced filtering by multiple criteria
- **Get Items by SubCategory**: Filter by subcategory
- **Get Latest Items by SubCategory**: Get recently added items

### 4. **Image Management**
- **Upload Single Image**: Upload images to S3 for item usage

### 5. **Statistics & Reports**
- **Get Total Item Count**: Database statistics
- **Get Item Statistics**: Detailed analytics
- **Download Items Data**: Export all items as JSON

### 6. **Reviews Management**
- **Add Review to Item**: Submit item reviews
- **Get Item Reviews**: Retrieve item reviews with pagination

### 7. **Scheduled Publishing**
- **Create Scheduled Item**: Create items for future publication
- **Update Publishing Status**: Change publishing state

### 8. **Advanced Search**
- **Search by Multiple Filters**: Complex filtering scenarios
- **Search by Size Availability**: Filter by size and stock

## Item Model Features Covered

### Enhanced Size Schema
- Size-specific pricing (regular price, sale price)
- Stock and quantity management
- HSN codes and SKU management
- Barcode support
- Detailed measurements (both cm and inches)
- Size-specific SEO fields (meta title, description, slug URL)

### Product Information
- Complete product details (name, title, description)
- Manufacturing and shipping information
- Category and subcategory assignment
- Multi-filter support with key-value pairs

### Media Management
- Multiple images with priority ordering
- Image type classification (image/video)
- S3 integration for file storage

### Reviews and Ratings
- User reviews with ratings (1-5 stars)
- Automatic average rating calculation
- Rating distribution tracking
- Review display and submission controls

### Publishing and Scheduling
- Draft, published, and scheduled states
- Date and time scheduling
- Auto-publish functionality
- Notification settings

### Enhanced Features
- "Also show in" options (similar items, others also bought, etc.)
- Publishing options with scheduling
- Status tracking and flags
- Performance-optimized indexes

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Item_APIs_Complete.postman_collection.json`
4. The collection will be imported with all requests and tests

### 2. Configure Variables
Set the following collection variables:
- `baseUrl`: Your backend server URL (default: `http://localhost:3000`)
- `authToken`: Will be automatically set after admin login

### 3. Environment Setup
Ensure your backend server is running with:
- MongoDB connection established
- S3 configuration for image uploads
- Admin user credentials available

## Usage Workflow

### Step 1: Authentication
1. Run "Admin Login" request
2. Verify that `authToken` is automatically set
3. This token will be used for all protected routes

### Step 2: Basic Item Operations
1. **Create Item**: Use the comprehensive payload example
2. **Get All Items**: Verify the item was created
3. **Get Item by ID**: Check specific item details
4. **Update Item**: Modify item properties
5. **Delete Item**: Remove test items

### Step 3: Advanced Features
1. **Filter Items**: Test complex filtering scenarios
2. **Upload Images**: Test S3 integration
3. **Add Reviews**: Test review functionality
4. **Scheduled Publishing**: Test time-based publishing

## API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/items` | Create new item | Yes (Admin) |
| GET | `/api/items` | Get all items | No |
| GET | `/api/items/:id` | Get item by ID | No |
| PUT | `/api/items/:id` | Update item | Yes (Admin) |
| DELETE | `/api/items/:id` | Delete item | Yes (Admin) |
| POST | `/api/items/filter` | Filter items | No |
| GET | `/api/items/subcategory/:id` | Get by subcategory | No |
| GET | `/api/items/latest-items/:id` | Get latest items | No |
| POST | `/api/items/upload-image` | Upload image | Yes (Admin) |
| GET | `/api/items/totalItemCount` | Get item count | Yes |
| GET | `/api/items/statistics` | Get statistics | Yes |
| GET | `/api/items/download` | Download items | Yes (Admin) |

## Sample Data Structures

### Create Item Payload
```json
{
  "productName": "Premium Cotton T-Shirt",
  "title": "Comfortable Premium Cotton T-Shirt for Daily Wear",
  "description": "High-quality premium cotton t-shirt...",
  "categoryId": "64f5a8b8c9e77c001f9a2345",
  "subCategoryId": "64f5a8c8c9e77c001f9a2346",
  "sizes": [
    {
      "size": "M",
      "quantity": 75,
      "regularPrice": 999,
      "salePrice": 799,
      "sku": "men/tshirt/premium-cotton/2024/01/15/12345679",
      "chestCm": 96,
      "chestIn": 38
    }
  ],
  "filters": [
    {
      "key": "material",
      "value": "Cotton",
      "code": "CT"
    }
  ]
}
```

### Filter Items Payload
```json
{
  "filters": [
    {
      "key": "brand",
      "value": "Yoraa"
    }
  ],
  "priceRange": {
    "min": 500,
    "max": 2000
  },
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "page": 1,
  "limit": 20
}
```

## Test Automation

The collection includes automated tests for:
- Response status codes
- Response time validation
- Data structure verification
- Automatic variable setting (auth tokens, item IDs)
- JSON response validation

### Running Tests
1. Select the collection
2. Click "Run" to execute all requests
3. Review test results in the runner
4. Check console for detailed logs

## Error Handling

Common error scenarios covered:
- Invalid authentication (401)
- Missing required fields (400)
- Item not found (404)
- Server errors (500)
- Blob URL validation
- File upload errors

## Advanced Features

### Scheduled Publishing
Create items for future publication:
```json
{
  "status": "scheduled",
  "scheduledDate": "2024-06-01",
  "scheduledTime": "10:00",
  "publishAt": "2024-06-01T10:00:00Z",
  "publishingOptions": {
    "action": "schedule",
    "autoPublish": true
  }
}
```

### Size-Specific Measurements
Support for both metric and imperial measurements:
```json
{
  "chestCm": 96,
  "chestIn": 38,
  "frontLengthCm": 68,
  "frontLengthIn": 27
}
```

### Review System
Automatic rating calculations:
```json
{
  "rating": 5,
  "reviewText": "Excellent quality!"
}
```

## Security Considerations

- All admin operations require authentication
- Blob URL validation prevents temporary URLs
- File upload security with S3 integration
- Input validation for all fields

## Troubleshooting

### Common Issues
1. **Token Expired**: Re-run admin login
2. **Invalid Category/SubCategory IDs**: Update with valid IDs from your database
3. **Image Upload Fails**: Check S3 configuration
4. **Filter Not Working**: Verify filter key-value pairs exist in database

### Debug Tips
- Check browser console for detailed error messages
- Verify server logs for backend errors
- Use Postman console for request/response debugging
- Test with smaller payloads first

## Integration Notes

This collection is designed to work with:
- Node.js/Express backend
- MongoDB database
- AWS S3 for file storage
- JWT authentication
- Mongoose ODM

## Updates and Maintenance

When updating the collection:
1. Update endpoint URLs if backend routes change
2. Modify request payloads for schema changes
3. Update authentication mechanisms if changed
4. Add new test cases for new features

## Contributing

To extend this collection:
1. Add new requests following the existing pattern
2. Include proper error handling tests
3. Update documentation
4. Test all scenarios before publishing

---

**Note**: This collection is specifically designed for the enhanced Item.js model with comprehensive size management, scheduling, and review features. Ensure your backend implementation supports all these features for optimal testing results.
