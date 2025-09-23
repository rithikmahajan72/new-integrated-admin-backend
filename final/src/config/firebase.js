// Minimal Firebase configuration for admin panel - Auth only, no client-side Firestore
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIYkTNzIrk_RugNOybriphlQ8aVTJ-KD8",
  authDomain: "yoraa-android-ios.firebaseapp.com",
  projectId: "yoraa-android-ios",
  storageBucket: "yoraa-android-ios.firebasestorage.app",
  messagingSenderId: "133733122921",
  appId: "1:133733122921:web:2d177abff9fb94ef35b3f8",
  measurementId: "G-HXS9N6W9D4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication only - no Firestore client
export const auth = getAuth(app);

// Admin configuration
export const ADMIN_CONFIG = {
  adminEmail: "rithikmahajan27@gmail.com",
  adminPhone: "7006114695"
};

// Check if user is admin
export const isAdmin = (email, phone) => {
  return email === ADMIN_CONFIG.adminEmail || phone === ADMIN_CONFIG.adminPhone;
};

// Initialize Analytics (only in production)
let analytics = null;
try {
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  }
} catch (error) {
  console.warn('⚠️ Analytics initialization failed:', error);
}

export { analytics };
export default app;
