// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Admin configuration
export const ADMIN_CONFIG = {
  adminEmail: "rithikmahajan27@gmail.com",
  adminPhone: "7006114695"
};

// Check if user is admin
export const isAdmin = (email, phone) => {
  return email === ADMIN_CONFIG.adminEmail || phone === ADMIN_CONFIG.adminPhone;
};

export default app;
