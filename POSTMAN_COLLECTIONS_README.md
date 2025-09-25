# Yoraa API Collections - Postman Setup Guide

This document describes the three separate Postman collections for the Yoraa Clothing Shop backend APIs, organized by authentication requirements and user roles.

## 📚 Collections Overview

### 1. **Yoraa Public APIs** (`Yoraa_Public_APIs.postman_collection.json`)
- **Purpose**: APIs that don't require authentication
- **Use Case**: Product browsing, public content, basic information
- **Authentication**: None required

### 2. **Yoraa User APIs** (`Yoraa_User_APIs.postman_collection.json`)  
- **Purpose**: APIs for authenticated users
- **Use Case**: Shopping, orders, profile management, user actions
- **Authentication**: User bearer token required

### 3. **Yoraa Admin APIs** (`Yoraa_Admin_APIs.postman_collection.json`)
- **Purpose**: Administrative and management APIs
- **Use Case**: Content management, user administration, analytics
- **Authentication**: Admin bearer token required

---

## 🚀 Quick Setup Guide

### Step 1: Import Collections
1. Open Postman
2. Click **Import** button
3. Select all three collection files:
   - `Yoraa_Public_APIs.postman_collection.json`
   - `Yoraa_User_APIs.postman_collection.json`
   - `Yoraa_Admin_APIs.postman_collection.json`

### Step 2: Configure Base URL
Update the `baseUrl` variable in each collection:
- **Default**: `http://localhost:8080`
- **Production**: Update to your production server URL

### Step 3: Authentication Setup

#### For User APIs:
1. Run **User Login** request in the Authentication folder
2. The `authToken` will be automatically saved
3. All subsequent user API requests will use this token

#### For Admin APIs:
1. Run **Admin Login** request in the Admin Authentication folder
2. The `adminToken` will be automatically saved
3. All subsequent admin API requests will use this token

---

## 📦 Collection Structure Details

### 🌐 **Public APIs Collection**
```
🏥 Health & Status
├── Server Status
└── Health Check

📦 Items Catalog
├── Get All Items
├── Get Item by ID
├── Get Items by Filter
├── Get Items by SubCategory
└── Search Items by Name

📂 Categories
├── Get All Categories
├── Get Category by ID
├── Get All SubCategories
└── Get SubCategories by Category

🔍 Filters & Search
├── Get Available Sizes
├── Get Available Colors
└── Get Available Brands

💰 Pricing & Promotions
└── Validate Promo Code

🎨 Content & Media
├── Get All Banners
├── Get Active Join Us Posts
└── Get Posts by Section

⚙️ App Settings
└── Get App Settings

👥 Invite System
└── Validate Invite Code

⭐ Reviews (Public)
└── Get Item Reviews
```

### 👤 **User APIs Collection**
```
🔐 Authentication
├── User Login
├── User Signup
├── Firebase Login
├── Generate OTP
├── Verify OTP
├── Reset Password
└── Logout

👤 User Profile
├── Get User Profile
├── Update User Profile
└── Update User Profile (Extended)

🛒 Shopping Cart
├── Add Item to Cart
├── Get User Cart
├── Update Cart Item
├── Remove Item from Cart
└── Clear Cart

📍 Address Management
├── Add Address
├── Get User Addresses
├── Update Address
└── Delete Address

🛍️ Orders
├── Create Order
├── Get User Orders
├── Get Order by ID
└── Cancel Order

💳 Payments
└── Create Razorpay Order

⭐ Reviews & Ratings
├── Create Review
├── Update Review
└── Delete Review

💝 Wishlist & Save for Later
├── Add to Wishlist
├── Get User Wishlist
├── Remove from Wishlist
├── Save Item for Later
└── Get Saved Items

🎯 Points & Rewards
├── Get User Points
└── Redeem Points

📧 User Messages
├── Get Folder Counts
├── Get Messages by Folder
├── Send Message
└── Reply to Message

👥 Invite Friends
├── Send Invite
└── Get User Invites
```

### 🛡️ **Admin APIs Collection**
```
🔐 Admin Authentication
└── Admin Login

👥 User Management
├── Get All Users
├── Get Total Users Count
├── Make User Admin
└── Delete User

📦 Items Management
├── Create Item
├── Update Item
├── Delete Item
├── Upload Item Image
├── Get Products by Status
└── Create Basic Product (Phase 1)

📂 Categories Management
├── Create Category
├── Update Category
├── Delete Category
├── Create SubCategory
└── Update SubCategory

🛍️ Orders Management
├── Get All Orders
├── Get Order Statistics
├── Update Order Status
├── Accept Order
└── Get Return Requests

💰 Promo Codes Management
├── Get All Promo Codes
├── Create Promo Code
├── Update Promo Code
└── Delete Promo Code

🤝 Partners Management
├── Create Partner
├── Get All Partners
└── Update Partner

🎨 Banners Management
├── Create Banner
├── Update Banner
└── Delete Banner

📊 Analytics & Reports
├── Get Dashboard Analytics
├── Get Sales Analytics
├── Get User Analytics
└── Get Acquisition Analytics

🎯 Points System Management
├── Get Points Configuration
├── Update Points Configuration
├── Get All Users with Points
└── Allocate Points

📦 Bulk Operations
├── Bulk Upload Items
├── Bulk Upload Categories
└── Download Items Template

🔥 Firebase Management
├── Get All Firebase Users
├── Create Firebase User
├── Update Firebase User
└── Set Custom Claims

📧 Notifications Management
├── Send Notification
└── Get All Notifications

🚚 Shipping Management
├── Get Shipping Charges
├── Create Shipping Charge
└── Update Shipping Charge

👥 Invite System Management
├── Generate Invite Codes
├── Export Invite Codes
└── Get Invite Statistics

📈 Cart Abandonment Management
├── Get Abandoned Carts
├── Sync Firebase Users
└── Export Abandonment Data
```

---

## 🔧 Usage Workflow

### **For Public APIs Testing:**
1. Start with Health Check to ensure server is running
2. Browse categories and items without authentication
3. Test filtering and search functionality
4. Validate promo codes and view public content

### **For User APIs Testing:**
1. **Authentication Flow:**
   - Run User Signup → User Login
   - Or use Firebase Login / OTP verification
2. **Shopping Flow:**
   - Browse items → Add to Cart → Create Order
   - Manage addresses and payment methods
3. **Profile Management:**
   - Update profile, manage wishlist, view order history

### **For Admin APIs Testing:**
1. **Setup:**
   - Run Admin Login first
   - Ensure admin privileges are configured
2. **Content Management:**
   - Create categories → Create items → Upload images
   - Manage banners, promo codes, and partners
3. **Operations:**
   - Monitor orders, manage users, view analytics
   - Handle bulk operations and system configuration

---

## 🛠️ Variables & Environment

### **Collection Variables**
Each collection automatically manages these variables:

#### Public APIs:
- `baseUrl` - Server URL
- `itemId`, `categoryId`, `subCategoryId` - Auto-saved from responses

#### User APIs:
- `baseUrl` - Server URL  
- `authToken` - User authentication token (auto-saved)
- `userId`, `itemId`, `cartId`, `orderId`, `addressId` - Auto-saved IDs

#### Admin APIs:
- `baseUrl` - Server URL
- `adminToken` - Admin authentication token (auto-saved)
- All entity IDs for management operations

### **Authentication Headers**
- **Public APIs**: No authentication headers
- **User APIs**: `Authorization: Bearer {{authToken}}`
- **Admin APIs**: `Authorization: Bearer {{adminToken}}`

---

## 🚨 Important Notes

### **Security Considerations**
1. **Never share admin tokens** in production environments
2. **Use environment variables** for sensitive data in team settings
3. **Rotate tokens regularly** for security best practices

### **Testing Best Practices**
1. **Start with Public APIs** to verify basic functionality
2. **Test authentication flows** before using protected endpoints
3. **Use proper test data** - don't use production data for testing
4. **Clean up test data** after testing sessions

### **Error Handling**
- **401 Unauthorized**: Token expired or invalid - re-authenticate
- **403 Forbidden**: Insufficient permissions - check admin/user roles
- **404 Not Found**: Invalid IDs - check variable values
- **500 Server Error**: Backend issue - check server logs

### **Pre-request Scripts**
Each collection includes automatic:
- **Token management** - Auto-adds appropriate auth headers
- **ID extraction** - Saves entity IDs from responses for subsequent requests

### **Test Scripts**
Automatic functionality includes:
- **Token saving** after successful authentication
- **ID variable updates** for chained requests
- **Basic response validation**

---

## 📋 Troubleshooting

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Re-run login request for appropriate collection |
| `404 Category/Item Not Found` | Update ID variables with valid values |
| `500 Server Error` | Check backend server status and logs |
| `Variables not saving` | Ensure test scripts are enabled in Postman |
| `File upload fails` | Check file size limits and S3 configuration |

---

## 🤝 Contributing

When adding new APIs:
1. **Categorize appropriately** - Public, User, or Admin
2. **Follow naming conventions** - Use emojis and clear descriptions
3. **Include proper authentication** - Set `noauth` for public endpoints
4. **Add test scripts** - For ID extraction and validation
5. **Update documentation** - Keep this README current

---

## 📞 Support

For issues or questions:
1. Check server logs for backend errors
2. Verify database connections and configurations
3. Ensure proper authentication setup
4. Review API endpoint URLs and methods

**Happy Testing! 🚀**
