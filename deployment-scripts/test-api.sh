#!/bin/bash

# Quick test script for Yoraa Backend API
SERVER_IP="185.193.19.244"
PORT="8080"
BASE_URL="http://$SERVER_IP:$PORT"

echo "🧪 Testing Yoraa Backend API on $BASE_URL"
echo "================================================"

# Test 1: Health check
echo "1. Testing health endpoint..."
response=$(curl -s -w "%{http_code}" -o /tmp/response.txt "$BASE_URL/")
http_code=$(echo $response | tail -c 4)

if [ "$http_code" = "200" ]; then
    echo "✅ Main endpoint is working (HTTP $http_code)"
    cat /tmp/response.txt | jq . 2>/dev/null || cat /tmp/response.txt
else
    echo "❌ Main endpoint failed (HTTP $http_code)"
    cat /tmp/response.txt
fi

echo ""

# Test 2: Health endpoint
echo "2. Testing /health endpoint..."
response=$(curl -s -w "%{http_code}" -o /tmp/response2.txt "$BASE_URL/health")
http_code=$(echo $response | tail -c 4)

if [ "$http_code" = "200" ]; then
    echo "✅ Health endpoint is working (HTTP $http_code)"
    cat /tmp/response2.txt | jq . 2>/dev/null || cat /tmp/response2.txt
else
    echo "❌ Health endpoint failed (HTTP $http_code)"
    cat /tmp/response2.txt
fi

echo ""

# Test 3: Check if server is accepting connections
echo "3. Testing server connectivity..."
if nc -z $SERVER_IP $PORT 2>/dev/null; then
    echo "✅ Server is accepting connections on port $PORT"
else
    echo "❌ Cannot connect to server on port $PORT"
fi

echo ""
echo "================================================"
echo "🎯 API Base URL: $BASE_URL"
echo "📚 Available endpoints:"
echo "   GET  $BASE_URL/ (Main)"
echo "   GET  $BASE_URL/health (Health check)"
echo "   POST $BASE_URL/api/auth/* (Authentication)"
echo "   GET  $BASE_URL/api/items/* (Items/Products)"
echo "   GET  $BASE_URL/api/categories/* (Categories)"
echo "   ... and more"

# Clean up temp files
rm -f /tmp/response.txt /tmp/response2.txt
