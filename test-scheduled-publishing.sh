#!/bin/bash

# Test script for scheduled publishing functionality
echo "🚀 Testing scheduled publishing functionality..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080/api"
ITEM_ID="your-test-item-id" # Replace with an actual item ID

echo -e "${YELLOW}1. Testing status update to scheduled...${NC}"

# Test scheduling an item
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-token" \
  -d '{
    "status": "scheduled",
    "scheduledDate": "2025-09-27",
    "scheduledTime": "15:30"
  }' \
  "${BASE_URL}/items/${ITEM_ID}/status"

echo -e "\n${YELLOW}2. Testing status update to published...${NC}"

# Test publishing an item
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-token" \
  -d '{
    "status": "published"
  }' \
  "${BASE_URL}/items/${ITEM_ID}/status"

echo -e "\n${YELLOW}3. Testing scheduled items summary...${NC}"

# Test getting scheduled items summary
curl -H "Authorization: Bearer your-admin-token" \
  "${BASE_URL}/items/scheduled-summary"

echo -e "\n${GREEN}Test completed!${NC}"
echo -e "${YELLOW}Note: Replace 'your-test-item-id' and 'your-admin-token' with actual values${NC}"
