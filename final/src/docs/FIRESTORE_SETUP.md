# Firebase Firestore Security Rules Fix

The 400 Bad Request errors you're seeing are likely due to restrictive Firestore security rules. Here's how to fix them:

## 1. Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project: `yoraa-android-ios`
3. Navigate to `Firestore Database` in the left sidebar
4. Click on the `Rules` tab

## 2. Update Security Rules

Replace your current rules with these **temporary development rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Specific rules for users collection
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Test collection for connection testing
    match /test/{testId} {
      allow read, write: if true;
    }
  }
}
```

## 3. For Production (Later)

Once you have authentication working, use these more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow admin to read all users (you'll need to implement admin claims)
      allow read: if request.auth != null && 
        request.auth.token.admin == true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Admin test collection
    match /test/{testId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. Create Firestore Indexes

If you get index-related errors, you may need to create indexes:

1. In Firebase Console → Firestore Database → Indexes tab
2. Add composite indexes if needed:
   - Collection: `users`
   - Fields: `createdAt` (Descending)
   - Query scope: Collection

## 5. Alternative: Use Firebase Emulator (Recommended for Development)

For local development, consider using the Firebase emulator:

```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

Then update your Firebase config to connect to the emulator in development.

## 6. Authentication Setup

Make sure you have authentication enabled:

1. Firebase Console → Authentication → Sign-in method
2. Enable at least one sign-in provider (Email/Password recommended)
3. Add your domain to authorized domains

## Important Notes

⚠️ **The open rules above are for DEVELOPMENT ONLY**
- They allow anyone to read/write your database
- Always use proper authentication and authorization in production
- Monitor your Firebase usage to avoid unexpected charges

🔧 **After updating rules:**
- Rules take effect immediately
- Refresh your browser and try the user management again
- Check the browser console for any remaining errors

📝 **Testing Steps:**
1. Update the security rules as shown above
2. Refresh your application
3. Click "Create Test Users" button (development only)
4. Try refreshing the user list
5. Test blocking/unblocking functionality
