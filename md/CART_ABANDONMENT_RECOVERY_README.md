# Cart Abandonment Recovery System

## Overview

A comprehensive cart abandonment recovery system that integrates with Firebase to track and recover abandoned shopping carts. The system includes both frontend and backend components with Redux state management, real-time data fetching, and email automation.

## Features

### 🔍 Data Management
- **Firebase Integration**: Syncs user data from Firebase Authentication
- **Real-time Data**: Dynamic data fetching with filtering options
- **MongoDB Storage**: Persistent storage for cart abandonment data

### 📊 Analytics & Filtering
- **Date Range Filtering**: Last 7 days, 30 days, 90 days
- **User Type Filtering**: All users, registered users, guests
- **Country/Region Filtering**: Geographic filtering
- **Sorting Options**: Sort by last active, name, email, cart value

### 📧 Communication
- **Individual Emails**: Send personalized recovery emails
- **Bulk Email Campaign**: Mass email functionality
- **Email Templates**: Customizable email templates
- **Email Tracking**: Track email opens and clicks

### 📈 Export & Reporting
- **CSV Export**: Export user data as CSV files
- **XLSX Export**: Export user data as Excel files
- **Statistics Dashboard**: Real-time statistics and metrics
- **User Profiles**: Detailed user profile views

### 🔧 Admin Actions
- **User Management**: View, edit, and delete users
- **Bulk Operations**: Mass actions on selected users
- **Recovery Tracking**: Track recovery attempts and success rates

## Technical Architecture

### Frontend (React + Redux)
```
final/src/
├── pages/
│   ├── cartabandonmentrecovery.jsx (deprecated)
│   └── CartAbandonmentRecovery.js (new implementation)
├── store/
│   └── slices/
│       └── cartAbandonmentSlice.js
└── services/
    └── cartAbandonmentAPI.js
```

### Backend (Node.js + Express + MongoDB)
```
src/
├── models/
│   └── CartAbandonment.js
├── controllers/
│   └── cartAbandonmentController.js
└── routes/
    └── cartAbandonmentRoutes.js
```

## API Endpoints

### Base URL: `/api/cart-abandonment`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/abandoned-carts` | Get all abandoned carts with filters |
| GET | `/statistics` | Get dashboard statistics |
| POST | `/sync-firebase-users` | Sync users from Firebase |
| GET | `/export` | Export data (CSV/XLSX) |
| POST | `/send-email/:userId` | Send email to specific user |
| POST | `/send-bulk-emails` | Send bulk emails |
| GET | `/user-profile/:userId` | Get user profile details |
| DELETE | `/delete-user/:userId` | Delete user |
| GET | `/filter-options` | Get available filter options |

## Installation & Setup

### Backend Setup

1. **Install Dependencies**
```bash
cd YoraaClothingShopRepo-backened
npm install xlsx nodemailer
```

2. **Environment Variables**
Add to your `.env` file:
```env
# Email configuration for cart abandonment recovery
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL for cart recovery links
FRONTEND_URL=http://localhost:3000
```

3. **Start Backend Server**
```bash
npm start
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd final
npm install
```

2. **Environment Variables**
Create `final/.env` file:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

3. **Start Frontend Server**
```bash
npm start
```

## Usage Guide

### 1. Sync Firebase Users
- Click "Sync Firebase Users" to import user data from Firebase
- This creates abandoned cart records for users with cart activity

### 2. Filter and Search
- Use date range filters to focus on recent abandonment
- Filter by user type (registered vs guest users)
- Filter by country/region for geographic analysis
- Sort by various criteria for organized viewing

### 3. Individual Actions
- **View Profile**: See detailed user information and cart contents
- **Send Email**: Send personalized recovery emails
- **Delete User**: Remove users from the system

### 4. Bulk Operations
- Select multiple users using checkboxes
- Send bulk emails to selected users
- Use "Select All" for mass operations

### 5. Export Data
- Export filtered data as CSV for basic analysis
- Export as XLSX for advanced Excel analysis
- Includes all user data and cart information

## Data Model

### CartAbandonment Schema
```javascript
{
  userId: String,           // User identifier
  firebaseUid: String,      // Firebase user ID
  email: String,            // User email
  mobile: String,           // Phone number
  userName: String,         // Display name
  userType: String,         // 'registered' or 'guest'
  dob: Date,               // Date of birth
  gender: String,          // 'M', 'F', or 'Other'
  country: String,         // Country code
  region: String,          // Region/state
  cartItems: [{            // Cart contents
    itemId: String,
    itemName: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  cartValue: Number,       // Total cart value
  lastActive: Date,        // Last activity timestamp
  avgVisitTime: Number,    // Average session duration
  abandonedAt: Date,       // When cart was abandoned
  status: String,          // 'abandoned', 'recovered', 'blocked'
  recoveryAttempts: Number, // Number of recovery attempts
  emailsSent: [{           // Email history
    sentAt: Date,
    type: String,
    opened: Boolean,
    clicked: Boolean
  }],
  // ... additional fields
}
```

## Redux State Management

### State Structure
```javascript
{
  abandonedCarts: [],      // List of abandoned cart records
  statistics: {},          // Dashboard statistics
  filterOptions: {},       // Available filter options
  filters: {},            // Current filter settings
  pagination: {},         // Pagination info
  loading: {},           // Loading states for different operations
  error: {},             // Error states
  selectedUsers: [],     // Selected user IDs for bulk operations
  userProfile: null      // Currently viewed user profile
}
```

### Available Actions
```javascript
// Data fetching
fetchAbandonedCarts(params)
fetchStatistics(filters)
syncFirebaseUsers()

// User operations
sendEmailToUser({ userId, emailData })
sendBulkEmails(emailData)
fetchUserProfile(userId)
deleteUser(userId)

// Export operations
exportData({ format, filters })

// UI operations
updateFilters(filters)
toggleUserSelection(userId)
selectAllUsers()
deselectAllUsers()
```

## Email Templates

### Default Recovery Email
```html
<h2>Don't forget your items!</h2>
<p>Hi [User Name],</p>
<p>You left [Item Count] items in your cart worth $[Cart Value].</p>
<p>Complete your purchase now to secure these items.</p>
<a href="[Frontend URL]/cart">Complete Purchase</a>
```

### Custom Email Support
- Customizable subject lines
- HTML email templates
- Dynamic content insertion
- Tracking pixels for open rates

## Performance Optimizations

### Frontend
- **Memoized Components**: Prevents unnecessary re-renders
- **Redux Selectors**: Efficient state selection
- **Lazy Loading**: Components loaded on demand
- **Debounced Filters**: Reduced API calls during filtering

### Backend
- **Database Indexes**: Optimized query performance
- **Bulk Operations**: Efficient batch processing
- **Pagination**: Large dataset handling
- **Caching**: Redis caching for frequently accessed data

## Security Features

- **Input Validation**: All inputs validated and sanitized
- **Rate Limiting**: API rate limiting to prevent abuse
- **Authentication**: JWT token-based authentication
- **Data Encryption**: Sensitive data encryption
- **CORS Configuration**: Proper cross-origin settings

## Monitoring & Analytics

### Metrics Tracked
- Total abandoned carts
- Recovery rates
- Email open rates
- User engagement metrics
- Geographic distribution

### Dashboard Statistics
- Real-time cart abandonment counts
- User type distribution
- Average cart values
- Recovery success rates

## Error Handling

### Frontend Error Handling
- User-friendly error messages
- Retry mechanisms for failed requests
- Offline state detection
- Loading states for all operations

### Backend Error Handling
- Comprehensive error logging
- Graceful failure handling
- Validation error responses
- Database connection error recovery

## Future Enhancements

### Planned Features
- **SMS Integration**: SMS-based recovery campaigns
- **Push Notifications**: Web push notification support
- **A/B Testing**: Email template testing
- **Machine Learning**: Predictive abandonment detection
- **Advanced Analytics**: Conversion funnel analysis
- **Integration APIs**: Third-party service integrations

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Advanced Caching**: Multi-layer caching strategy
- **Microservices**: Service-oriented architecture
- **API Versioning**: Backward compatibility support

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check backend server is running on port 8080
   - Verify CORS settings
   - Check environment variables

2. **Firebase Sync Issues**
   - Verify Firebase configuration
   - Check service account permissions
   - Validate Firebase project settings

3. **Email Sending Failed**
   - Check email service configuration
   - Verify SMTP credentials
   - Check rate limits

4. **Export Not Working**
   - Check file permissions
   - Verify export dependencies installed
   - Check browser popup blockers

### Support
For technical support or feature requests, please contact the development team or create an issue in the project repository.

## License
This project is part of the Yoraa Clothing Shop system and follows the project's licensing terms.
