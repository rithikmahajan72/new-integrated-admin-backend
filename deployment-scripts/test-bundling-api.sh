#!/bin/bash

# Product Bundling API Test Script
# This script tests all the product bundling endpoints

BASE_URL="http://localhost:5000/api"
TOKEN="" # Add your JWT token here

echo "=== Product Bundling API Tests ==="
echo ""

# Test 1: Get categories for bundling
echo "1. Testing GET /items/bundles/categories"
curl -X GET "$BASE_URL/items/bundles/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 2: Get items for bundling
echo "2. Testing GET /items/bundles/items"
curl -X GET "$BASE_URL/items/bundles/items?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 3: Create a product bundle
echo "3. Testing POST /items/bundles"
curl -X POST "$BASE_URL/items/bundles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bundleName": "Summer Collection Bundle",
    "description": "Perfect summer outfit combination",
    "mainProduct": {
      "itemId": "ITEM_MAIN_ID_HERE",
      "price": 2500
    },
    "bundleItems": [
      {
        "itemId": "ITEM_BUNDLE_1_ID_HERE",
        "price": 1500,
        "position": 0
      },
      {
        "itemId": "ITEM_BUNDLE_2_ID_HERE", 
        "price": 1200,
        "position": 1
      }
    ],
    "bundlePrice": 4500,
    "isActive": true,
    "showOnProductPage": true,
    "showInRecommendations": true,
    "createdBy": "test@admin.com"
  }' | jq '.'
echo ""

# Test 4: Get all bundles
echo "4. Testing GET /items/bundles"
curl -X GET "$BASE_URL/items/bundles?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 5: Get specific bundle (replace BUNDLE_ID with actual ID)
echo "5. Testing GET /items/bundles/:bundleId"
BUNDLE_ID="REPLACE_WITH_ACTUAL_BUNDLE_ID"
curl -X GET "$BASE_URL/items/bundles/$BUNDLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 6: Update bundle
echo "6. Testing PUT /items/bundles/:bundleId"
curl -X PUT "$BASE_URL/items/bundles/$BUNDLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bundleName": "Updated Summer Collection",
    "description": "Updated description",
    "bundlePrice": 4200,
    "updatedBy": "test@admin.com"
  }' | jq '.'
echo ""

# Test 7: Toggle bundle status
echo "7. Testing PATCH /items/bundles/:bundleId/toggle-status"
curl -X PATCH "$BASE_URL/items/bundles/$BUNDLE_ID/toggle-status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updatedBy": "test@admin.com"
  }' | jq '.'
echo ""

# Test 8: Get bundles for a specific product (public route)
echo "8. Testing GET /items/:itemId/bundles"
ITEM_ID="REPLACE_WITH_ACTUAL_ITEM_ID"
curl -X GET "$BASE_URL/items/$ITEM_ID/bundles" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 9: Delete bundle
echo "9. Testing DELETE /items/bundles/:bundleId"
curl -X DELETE "$BASE_URL/items/bundles/$BUNDLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "=== All tests completed ==="
echo ""
echo "Instructions:"
echo "1. Make sure your backend server is running on localhost:5000"
echo "2. Add your JWT token to the TOKEN variable at the top of this script"
echo "3. Replace ITEM_MAIN_ID_HERE, ITEM_BUNDLE_1_ID_HERE, etc. with actual item IDs"
echo "4. Replace BUNDLE_ID and ITEM_ID with actual IDs after creating bundles"
echo "5. Run: chmod +x test-bundling-api.sh && ./test-bundling-api.sh"
