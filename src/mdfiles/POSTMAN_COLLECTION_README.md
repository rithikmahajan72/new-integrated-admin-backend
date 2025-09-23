# Yoraa Items API - Updated Postman Collection

## 🚀 Overview
This is the updated and properly formatted Postman collection for the enhanced `Item.js` model APIs in the Yoraa Clothing Shop backend. This collection provides comprehensive testing capabilities for all item-related operations.

## 📁 Collection Features

### 🔐 **Authentication**
- **Admin Login**: Automatically sets authentication token for protected routes
- **Bearer Token Management**: Auto-saves and uses JWT tokens

### 📦 **Item Management (CRUD Operations)**
- **Create Item**: Full schema support with sizes, measurements, pricing
- **Get All Items**: Pagination, sorting, filtering
- **Get Item by ID**: Individual item retrieval
- **Update Item**: Comprehensive item modification
- **Delete Item**: Admin-only item removal

### 🔍 **Advanced Filtering & Search**
- **Filter Items**: Multi-criteria filtering (category, price, filters)
- **SubCategory Search**: Category-based item retrieval
- **Latest Items**: Recently added item fetching
- **Advanced Search**: Complex search with multiple parameters

### 🖼️ **Image Management**
- **Upload Single Image**: S3 integration for image storage
- **Image URL Management**: Proper image handling and validation

### 📊 **Statistics & Reporting**
- **Total Item Count**: Database statistics
- **Item Statistics**: Detailed analytics and breakdowns
- **Data Export**: JSON export of all items

### ⭐ **Reviews System**
- **Add Reviews**: Submit item reviews with ratings
- **Get Reviews**: Paginated review retrieval
- **Rating Calculations**: Automatic average rating updates

### 📅 **Scheduled Publishing**
- **Scheduled Items**: Future publication scheduling
- **Publishing Status**: Status management (draft/scheduled/published)
- **Auto-publish**: Automated publishing workflows

## 🔧 **Enhanced Item Model Support**

### **Size Management**
```json
{
  "size": "M",
  "quantity": 75,
  "stock": 75,
  "hsnCode": "61051000",
  "sku": "men/tshirt/premium-cotton/2024/09/20/12345679",
  "barcode": "12345678901235",
  "regularPrice": 999,
  "salePrice": 799,
  "fitWaistCm": 91,
  "chestCm": 96,
  "frontLengthCm": 68,
  "acrossShoulderCm": 43,
  "toFitWaistIn": 36,
  "chestIn": 38,
  "frontLengthIn": 27,
  "acrossShoulderIn": 17,
  "metaTitle": "Premium Cotton T-Shirt Size M",
  "metaDescription": "Size M premium cotton t-shirt with 38 inch chest measurement",
  "slugUrl": "premium-cotton-tshirt-size-m"
}
```

### **Filter System**
```json
{
  "filters": [
    {
      "key": "brand",
      "value": "Yoraa",
      "code": "YR"
    },
    {
      "key": "material",
      "value": "Cotton",
      "code": "CT"
    }
  ]
}
```

### **Publishing Options**
```json
{
  "publishingOptions": {
    "action": "schedule",
    "scheduledDate": "2024-12-01",
    "scheduledTime": "10:00",
    "publishAt": "2024-12-01T10:00:00Z",
    "autoPublish": true,
    "notificationSettings": {
      "emailNotification": true,
      "pushNotification": true
    }
  }
}
```

## 📋 **Setup Instructions**

### 1. **Import Collection**
```bash
1. Open Postman
2. Click "Import" button
3. Select "Yoraa_Items_API_Updated.postman_collection.json"
4. Collection imported successfully
```

### 2. **Configure Variables**
Set these collection variables:
- `baseUrl`: Your backend server URL (default: `http://localhost:3000`)
- `authToken`: Auto-set after login
- `itemId`: Auto-set after item creation
- `productId`: Auto-set after item creation

### 3. **Environment Setup**
Ensure your backend has:
- ✅ MongoDB connection
- ✅ S3 bucket configuration
- ✅ JWT authentication
- ✅ Admin user credentials

## 🎯 **Usage Workflow**

### **Step 1: Authentication**
```
1. Run "Admin Login" request
2. Verify authToken is set automatically
3. Token will be used for all protected routes
```

### **Step 2: Basic Operations**
```
1. Create Item → Get All Items → Get Item by ID
2. Update Item → Verify changes
3. Test filtering and search
4. Clean up with Delete Item
```

### **Step 3: Advanced Features**
```
1. Upload images and test S3 integration
2. Add reviews and verify rating calculations
3. Test scheduled publishing workflow
4. Generate statistics and reports
```

## 🔗 **API Endpoints Reference**

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| `POST` | `/api/auth/login` | Admin authentication | ❌ | ✅ Active |
| `POST` | `/api/items` | Create new item | ✅ | ✅ Active |
| `GET` | `/api/items` | Get all items | ❌ | ✅ Active |
| `GET` | `/api/items/:id` | Get item by ID | ❌ | ✅ Active |
| `PUT` | `/api/items/:id` | Update item | ✅ | ✅ Active |
| `DELETE` | `/api/items/:id` | Delete item | ✅ | ✅ Active |
| `POST` | `/api/items/filter` | Filter items | ❌ | ✅ Active |
| `GET` | `/api/items/subcategory/:id` | Get by subcategory | ❌ | ✅ Active |
| `GET` | `/api/items/latest-items/:id` | Get latest items | ❌ | ✅ Active |
| `POST` | `/api/items/upload-image` | Upload image | ✅ | ✅ Active |
| `GET` | `/api/items/totalItemCount` | Get item count | ✅ | ✅ Active |
| `GET` | `/api/items/statistics` | Get statistics | ✅ | ✅ Active |
| `GET` | `/api/items/download` | Download items | ✅ | ✅ Active |
| `POST` | `/api/reviews` | Add review | ✅ | ✅ Active |
| `GET` | `/api/reviews/item/:id` | Get item reviews | ❌ | ✅ Active |

## 🧪 **Automated Testing**

### **Test Coverage**
- ✅ Response status codes (200, 201, 400, 401, 404, 500)
- ✅ Response time validation (< 5000ms)
- ✅ JSON response structure
- ✅ Data integrity checks
- ✅ Authentication token management
- ✅ Variable setting and usage

### **Running Tests**
```bash
# Option 1: Collection Runner
1. Select collection → Click "Run"
2. Choose requests to run
3. Review results in runner

# Option 2: Individual Request Testing
1. Send individual requests
2. Check "Test Results" tab
3. Review console logs
```

## 🛠️ **Advanced Configuration**

### **Custom Environment Variables**
```javascript
// Pre-request Script Example
pm.collectionVariables.set('timestamp', new Date().toISOString());
pm.collectionVariables.set('randomSKU', `SKU_${Math.random().toString(36).substr(2, 9)}`);
```

### **Dynamic Data Generation**
```javascript
// Generate dynamic test data
const productName = `Test Product ${Date.now()}`;
const sku = `test/item/${new Date().getFullYear()}/${Math.random().toString(36).substr(2, 8)}`;
```

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Re-run Admin Login request |
| `404 Category Not Found` | Update categoryId/subCategoryId with valid IDs |
| `400 Blob URL Detected` | Use proper S3 URLs, not temporary blob URLs |
| `500 Server Error` | Check backend logs and database connection |
| `Image Upload Fails` | Verify S3 configuration and file permissions |

### **Debug Checklist**
- [ ] Backend server running on correct port
- [ ] MongoDB connection established
- [ ] S3 bucket configured and accessible
- [ ] Valid admin credentials
- [ ] Correct category/subcategory IDs
- [ ] Proper JSON formatting in request bodies

## 📈 **Performance Optimization**

### **Best Practices**
- Use pagination for large datasets (`page`, `limit` parameters)
- Implement proper sorting (`sortBy`, `sortOrder`)
- Use specific filters to reduce response size
- Cache frequently accessed data
- Optimize image sizes for uploads

### **Monitoring**
- Response time tracking (automated in tests)
- Error rate monitoring
- Success rate validation
- Performance benchmarks

## 🔄 **Updates & Maintenance**

### **Version History**
- `v2.1.0` - Updated collection with proper JSON formatting
- `v2.0.0` - Complete Item.js model support
- `v1.0.0` - Initial release

### **Maintenance Tasks**
- Regular endpoint validation
- Schema update synchronization
- Test case updates
- Documentation refresh

## 🤝 **Contributing**

### **Adding New Requests**
1. Follow existing naming conventions
2. Include proper authentication headers
3. Add comprehensive test scripts
4. Update documentation

### **Best Practices**
- Use descriptive request names
- Include detailed descriptions
- Add proper error handling
- Maintain consistent structure

---

## 📞 **Support**

For issues or questions:
1. Check troubleshooting section
2. Review backend logs
3. Verify database state
4. Contact development team

**Collection File**: `Yoraa_Items_API_Updated.postman_collection.json`
**Last Updated**: September 20, 2024
**Version**: 2.1.0
