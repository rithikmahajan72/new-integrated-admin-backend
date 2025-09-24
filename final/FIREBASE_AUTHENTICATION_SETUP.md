# Firebase Setup for Real-time OTP Authentication

## 🔥 Firebase Configuration Required

To enable SMS and Email OTP services, you need to configure the following in your Firebase Console:

### 1. Enable Authentication Methods
Go to Firebase Console → Authentication → Sign-in method:

- ✅ **Phone** - Enable phone authentication
- ✅ **Email/Password** - Enable email/password authentication
- ✅ **Email Link** - Enable passwordless sign-in

### 2. Phone Authentication Setup
- Add your phone number `+917006114695` to authorized test numbers if needed
- Verify your domain is authorized in Firebase Console
- Set up reCAPTCHA verification for web

### 3. Email Authentication Setup
- Configure email templates in Authentication → Templates
- Set up custom domain if needed
- Enable email verification

### 4. Current Configuration
```javascript
// Admin credentials configured in firebase.js
ADMIN_CONFIG = {
  adminEmail: "rithikmahajan27@gmail.com",
  adminPhone: "7006114695", 
  adminPassword: "R@2727thik"
}
```

### 5. Security Rules
Ensure your Firebase Security Rules allow authentication:
```javascript
// Example rules for Firestore (if used)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Domain Authorization
Add your domains to authorized domains:
- `localhost:3001` (development)
- Your production domain

### 7. Testing
1. Run the application
2. Navigate to settings page 
3. Click toggle for "get auto invoice mailing"
4. Firebase 2FA modal will appear
5. SMS OTP will be sent to +917006114695
6. Email verification will be sent to rithikmahajan27@gmail.com
7. Enter OTP and password "R@2727thik"

## 🚀 Features Implemented

- ✅ Real-time SMS OTP via Firebase Phone Auth
- ✅ Email verification via Firebase Email Auth  
- ✅ reCAPTCHA protection for SMS
- ✅ Auto-retry and error handling
- ✅ User-friendly status messages
- ✅ Password validation (R@2727thik)
- ✅ Complete verification workflow

## 🔧 Troubleshooting

If SMS doesn't work:
1. Check Firebase Console quotas
2. Verify phone number format (+91 prefix)
3. Check reCAPTCHA configuration
4. Ensure domain is authorized

If Email doesn't work:
1. Check spam folder
2. Verify email in Firebase Console
3. Check email template configuration
4. Ensure email/password is enabled

## 📱 Live Demo Flow

1. **Auto-send**: When 2FA modal opens, SMS and Email are automatically sent
2. **SMS Input**: User receives SMS and enters 6-digit code
3. **Password Input**: User enters email password (R@2727thik) 
4. **Default Password**: User enters default password (R@2727thik)
5. **Verification**: Firebase validates all inputs
6. **Success**: User is authenticated and setting is updated

The system now uses **real Firebase services** for authentication instead of mock/demo functionality!
