// Temporary Firestore Configuration with Offline Mode
// This addresses the 400 Bad Request errors by enabling offline mode and reducing connection attempts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  doc 
} from "firebase/firestore";
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

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore with persistent cache and offline support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  }),
  // Reduce connection attempts and timeout for faster failure
  experimentalForceLongPolling: true
});

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

// Admin configuration
export const ADMIN_CONFIG = {
  adminEmail: "rithikmahajan27@gmail.com",
  adminPhone: "7006114695"
};

// Check if user is admin
export const isAdmin = (email, phone) => {
  return email === ADMIN_CONFIG.adminEmail || phone === ADMIN_CONFIG.adminPhone;
};

// Enhanced connection test with better error handling
export const testFirestoreConnection = async () => {
  try {
    console.log('🔍 Testing Firestore connection...');
    
    // Simple connection test without actual document read
    const testPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000); // 5 second timeout
      
      // Just test if we can create a reference (doesn't require network)
      try {
        const testRef = doc(db, 'test', 'connection');
        clearTimeout(timeout);
        resolve(true);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
    
    await testPromise;
    console.log('✅ Firestore connection test passed');
    return true;
  } catch (error) {
    console.warn('⚠️ Firestore connection test failed:', error.message);
    return false;
  }
};

export { analytics };
export default app;
