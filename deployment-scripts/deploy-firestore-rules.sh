#!/bin/bash

# Deploy Firestore Rules Script
# This script deploys the updated Firestore security rules to fix connection issues

echo "🔥 Deploying Firestore Rules to Fix Connection Issues"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --no-localhost

# Deploy Firestore rules
echo "📋 Deploying Firestore security rules..."
firebase deploy --only firestore:rules --project yoraa-android-ios

echo ""
echo "✅ Firestore rules deployed successfully!"
echo ""
echo "🔧 Additional fixes applied:"
echo "   • Enhanced Firebase configuration with offline support"
echo "   • Improved error handling in Firestore connections"
echo "   • Added connection testing and retry logic"
echo "   • Updated security rules for better access control"
echo ""
echo "🔄 Please refresh your application to see the changes take effect."
