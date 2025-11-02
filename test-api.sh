#!/bin/bash

echo "🧪 Testing Ampd Energy Device Savings API..."
echo ""

# Start server in background
echo "🚀 Starting server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo "📊 Testing API endpoints..."
echo ""

# Test health endpoint
echo "1. Health Check:"
curl -s http://localhost:3000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/api/health
echo ""
echo ""

# Test devices endpoint
echo "2. Devices List (first 2):"
curl -s http://localhost:3000/api/devices | jq '.[0:2]' 2>/dev/null || curl -s http://localhost:3000/api/devices | head -c 200
echo ""
echo ""

# Test device savings
echo "3. Device 1 Aggregated Savings (Jan 1-7, 2023):"
curl -s "http://localhost:3000/api/devices/1/savings/aggregated?start_date=2023-01-01&end_date=2023-01-07&interval=day" | jq '.data[0:3]' 2>/dev/null || curl -s "http://localhost:3000/api/devices/1/savings/aggregated?start_date=2023-01-01&end_date=2023-01-07&interval=day" | head -c 300
echo ""
echo ""

# Test monthly stats
echo "4. Device 1 Monthly Statistics:"
curl -s "http://localhost:3000/api/devices/1/stats/monthly" | jq '.' 2>/dev/null || curl -s "http://localhost:3000/api/devices/1/stats/monthly"
echo ""
echo ""

echo "✅ API tests completed!"
echo ""
echo "🌐 Frontend available at: http://localhost:3000"
echo "📚 API documentation in README.md"
echo ""
echo "To stop the server:"
echo "  kill $SERVER_PID"
echo ""
echo "Server PID: $SERVER_PID"