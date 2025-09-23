# Firebase User Management Integration

This document explains the Firebase user management integration for the BlockUser component.

## Features

- ✅ Real Firebase integration with Firestore
- ✅ Redux state management for users
- ✅ Block/Unblock users with reasons
- ✅ Search and filter functionality
- ✅ Real-time updates
- ✅ Error handling and loading states
- ✅ Test data utilities for development

## Setup

### 1. Firebase Configuration

The Firebase configuration is already set up in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCIYkTNzIrk_RugNOybriphlQ8aVTJ-KD8",
  authDomain: "yoraa-android-ios.firebaseapp.com",
  projectId: "yoraa-android-ios",
  storageBucket: "yoraa-android-ios.firebasestorage.app",
  messagingSenderId: "133733122921",
  appId: "1:133733122921:web:2d177abff9fb94ef35b3f8",
  measurementId: "G-HXS9N6W9D4"
};
```

### 2. Firestore Database Structure

Users are stored in the `users` collection with the following structure:

```javascript
{
  id: "firebase-doc-id",
  displayName: "User Name",
  name: "User Name",
  email: "user@example.com",
  phoneNumber: "+1234567890",
  phone: "+1234567890",
  dateOfBirth: "DD/Month/YYYY",
  address: "Full Address",
  username: "username",
  gender: "Male/Female",
  points: 100,
  isBlocked: false,
  blockReason: "Reason if blocked",
  blockedAt: "2024-01-01T00:00:00Z",
  blockedBy: "admin",
  reviews: {
    rating: 5,
    text: "Review text"
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### 3. Redux Integration

The user management uses a dedicated Redux slice (`usersSlice`) with the following state:

```javascript
{
  users: [],           // All users
  filteredUsers: [],   // Filtered users based on search/filter
  loading: false,      // Loading state
  error: null,        // Error messages
  searchTerm: '',     // Current search term
  filterType: 'all',  // 'all', 'active', 'blocked'
  selectedUser: null, // Currently selected user
  blockLoading: false,   // Block operation loading
  unblockLoading: false  // Unblock operation loading
}
```

## Usage

### 1. BlockUser Component

Navigate to `/block-user` in the application to access the user management interface.

**Features:**
- View all registered users from Firebase
- Search users by name, email, phone, or username
- Filter users by status (All, Active, Blocked)
- Block users with optional reason
- Unblock users
- Real-time updates

### 2. Actions Available

**Block User:**
```javascript
dispatch(blockUser({ 
  userId: "user-id", 
  reason: "Optional reason" 
}));
```

**Unblock User:**
```javascript
dispatch(unblockUser({ userId: "user-id" }));
```

**Fetch All Users:**
```javascript
dispatch(fetchAllUsers());
```

**Search Users:**
```javascript
dispatch(setSearchTerm("search term"));
```

### 3. Test Data

For development, test users are automatically added when the component loads if no users exist in Firebase.

**Manual Test Data Addition:**
- In development mode, a "Add Test Data" button is available
- Test users include both active and blocked users
- Test data includes realistic Indian user information

## API Integration

The system also supports backend API integration for additional functionality:

- Base URL: `http://localhost:8080/api`
- Authentication via Bearer token
- Fallback to Firebase-only mode if backend is unavailable

### Backend Endpoints Used:
- `PATCH /users/:id/block` - Block user
- `PATCH /users/:id/unblock` - Unblock user

## Error Handling

- Network errors are caught and displayed to users
- Automatic error clearing after 5 seconds
- Graceful degradation if Firebase or backend is unavailable
- Loading states for all operations

## Security

- Admin authentication required (configured in firebase.js)
- Firebase security rules should be configured appropriately
- Sensitive data (passwords) are never stored or displayed in plain text

## Development

### Test Data Utilities

Located in `src/utils/testData.js`:

```javascript
import { addTestUsers, initializeTestData } from '../utils/testData';

// Add test users to Firebase
await addTestUsers();

// Initialize test data if no users exist
await initializeTestData();
```

### Debugging

1. Check browser console for Firebase connection status
2. Verify Firebase project permissions
3. Ensure Firestore rules allow read/write for authenticated admin
4. Check Redux DevTools for state changes

## Files Modified/Created

### New Files:
- `src/store/slices/usersSlice.js` - Redux slice for user management
- `src/services/userService.js` - Firebase service layer
- `src/utils/testData.js` - Test data utilities

### Modified Files:
- `src/pages/BlockUser.jsx` - Complete Firebase integration
- `src/store/store.js` - Added users slice

## Next Steps

1. Configure Firestore security rules
2. Set up proper admin authentication
3. Add user activity logging
4. Implement user deletion (soft delete)
5. Add bulk operations (block/unblock multiple users)
6. Add export functionality for user data
7. Implement user statistics dashboard

## Troubleshooting

### Common Issues:

1. **Firebase Connection Errors:**
   - Check internet connection
   - Verify Firebase project configuration
   - Check browser console for specific errors

2. **Permission Denied:**
   - Configure Firestore security rules
   - Ensure admin authentication is working

3. **Users Not Loading:**
   - Check Firestore collection name is 'users'
   - Verify document structure matches expected format
   - Check Redux state in DevTools

4. **Block/Unblock Not Working:**
   - Verify user ID is correct
   - Check Firebase permissions
   - Look for errors in console
