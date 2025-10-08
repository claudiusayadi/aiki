#!/bin/bash

# API Test Script for Aiki
# Make sure the server is running: yarn start:dev

BASE_URL="http://localhost:5154/api/v1"
COOKIE_JAR=$(mktemp)

echo "======================================"
echo "🧪 Testing Aiki API"
echo "======================================"
echo ""

# 1. Check health
echo "1️⃣  Checking API health..."
curl -s "$BASE_URL/health" | jq '.'
echo ""
echo ""

# # 2. Register a new user
# echo "2️⃣  Registering new user..."
# REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "email": "testuser@example.com",
#     "password": "Test1234!"
#   }')
# echo "$REGISTER_RESPONSE" | jq '.'
# echo ""
# echo ""

# # 3. Get verification code from database
# echo "3️⃣  Getting verification code from database..."
# echo ""
# read -p "Enter the verification code: " VERIFICATION_CODE
# echo ""

# # 4. Verify email
# echo "4️⃣  Verifying email with code: $VERIFICATION_CODE..."
# VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/verify-email" \
#   -H "Content-Type: application/json" \
#   -d "{
#     \"email\": \"testuser@example.com\",
#     \"code\": \"$VERIFICATION_CODE\"
#   }")
# echo "$VERIFY_RESPONSE" | jq '.'
# echo ""
# echo ""

# 5. Login user
echo "5️⃣  Logging in user..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_JAR" -X POST "$BASE_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test1234!"
  }')
echo "$LOGIN_RESPONSE" | jq '.'

# Extract cookies
ACCESS_TOKEN=$(grep -oP 'AikiAccessToken\s+\K[^\s]+' "$COOKIE_JAR" || echo "")
REFRESH_TOKEN=$(grep -oP 'AikiRefreshToken\s+\K[^\s]+' "$COOKIE_JAR" || echo "")

echo ""
echo "Access Token (from cookie): $ACCESS_TOKEN"
echo "Refresh Token (from cookie): $REFRESH_TOKEN"
echo ""
echo ""

# 6. Get available plans
echo "6️⃣  Getting available plans..."
PLANS_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X GET "$BASE_URL/plans")
echo "$PLANS_RESPONSE" | jq '.'

# Extract plan IDs
FOCUS_PLAN_ID=$(echo "$PLANS_RESPONSE" | jq -r '.data[]? | select(.slug == "focus") | .id // empty')
FLOW_PLAN_ID=$(echo "$PLANS_RESPONSE" | jq -r '.data[]? | select(.slug == "flow") | .id // empty')

# If plans are in a different structure, try alternatives
if [ -z "$FOCUS_PLAN_ID" ]; then
    FOCUS_PLAN_ID=$(echo "$PLANS_RESPONSE" | jq -r '.[] | select(.slug == "focus") | .id // empty')
fi

if [ -z "$FLOW_PLAN_ID" ]; then
    FLOW_PLAN_ID=$(echo "$PLANS_RESPONSE" | jq -r '.[] | select(.slug == "flow") | .id // empty')
fi

echo ""
echo "Focus Plan ID: $FOCUS_PLAN_ID"
echo "Flow Plan ID: $FLOW_PLAN_ID"
echo ""
echo ""

# 7. Initialize payment for Focus plan
if [ -n "$FOCUS_PLAN_ID" ]; then
    echo "7️⃣  Initializing payment for Focus plan..."
    FOCUS_PAYMENT_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/payments/initialize" \
      -H "Content-Type: application/json" \
      -d "{
        \"plan_id\": \"$FOCUS_PLAN_ID\",
        \"quantity\": 5
      }")
    echo "$FOCUS_PAYMENT_RESPONSE" | jq '.'
    
    # Extract reference
    FOCUS_REFERENCE=$(echo "$FOCUS_PAYMENT_RESPONSE" | jq -r '.data.reference // .reference // empty')
    
    if [ -n "$FOCUS_REFERENCE" ]; then
        echo ""
        echo "Payment Reference: $FOCUS_REFERENCE"
        echo ""
        echo "⏳ Simulating payment completion..."
        echo "   (In production, user would pay on Paystack and then be redirected back)"
        sleep 2
        
        echo ""
        echo "7️⃣ a. Verifying Focus plan payment..."
        FOCUS_VERIFY_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/payments/verify" \
          -H "Content-Type: application/json" \
          -d "{
            \"reference\": \"$FOCUS_REFERENCE\"
          }")
        echo "$FOCUS_VERIFY_RESPONSE" | jq '.'
        
        echo ""
        echo "7️⃣ b. Checking user tasks_left after Focus payment..."
        USER_INFO_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X GET "$BASE_URL/users")
        echo "$USER_INFO_RESPONSE" | jq '.data[0] | {email, tasks_left}'
    fi
    
    echo ""
    echo ""
else
    echo "❌ Focus plan not found. Skipping payment initialization."
    echo ""
fi

# 8. Initialize payment for Flow plan
if [ -n "$FLOW_PLAN_ID" ]; then
    echo "8️⃣  Initializing payment for Flow plan (subscription)..."
    FLOW_PAYMENT_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/payments/initialize" \
      -H "Content-Type: application/json" \
      -d "{
        \"plan_id\": \"$FLOW_PLAN_ID\"
      }")
    echo "$FLOW_PAYMENT_RESPONSE" | jq '.'
    echo ""
    echo ""
else
    echo "❌ Flow plan not found. Skipping payment initialization."
    echo ""
fi

# Cleanup
rm -f "$COOKIE_JAR"

echo "======================================"
echo "✅ API Testing Complete!"
echo "======================================"
