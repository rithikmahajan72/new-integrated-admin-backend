import React, { useEffect, useState } from 'react';
import { auth, db, analytics } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const FirebaseStatus = () => {
  const [status, setStatus] = useState({
    auth: 'checking...',
    firestore: 'checking...',
    analytics: 'checking...',
    user: null,
    error: null
  });

  useEffect(() => {
    console.log('🔥 Firebase Status Component: Starting checks...');
    
    try {
      // Test Firebase Auth
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('🔐 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
        setStatus(prev => ({
          ...prev,
          auth: '✅ Connected',
          user: user ? `Logged in as: ${user.email || user.uid}` : 'Not logged in'
        }));
      });

      // Test Firestore
      if (db) {
        console.log('🗄️ Firestore: Connected');
        setStatus(prev => ({
          ...prev,
          firestore: '✅ Connected'
        }));
      }

      // Test Analytics
      if (analytics) {
        console.log('📊 Analytics: Connected');
        setStatus(prev => ({
          ...prev,
          analytics: '✅ Connected'
        }));
      }

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Firebase Status error:', error);
      setStatus(prev => ({
        ...prev,
        auth: `❌ Error: ${error.message}`,
        error: error.message
      }));
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-white border rounded-lg p-3 shadow-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔥 Firebase Status</div>
      <div>Auth: {status.auth}</div>
      <div>Firestore: {status.firestore}</div>
      <div>Analytics: {status.analytics}</div>
      <div className="text-gray-600 mt-1">{status.user}</div>
      {status.error && (
        <div className="text-red-600 mt-1 text-xs">Error: {status.error}</div>
      )}
      <div className="text-gray-500 mt-2 text-xs">
        Project: yoraa-android-ios
      </div>
    </div>
  );
};

export default FirebaseStatus;
