#!/bin/bash

# Export environment variables for shopwave project

# Clerk Authentication
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YWR2YW5jZWQta29pLTU4LmNsZXJrLmFjY291bnRzLmRldiQ"
export CLERK_SECRET_KEY="sk_test_79pbdZWPLcN5GtX0mUgC6WD6eyzWGOSqkKHGmgP5gg"

# MongoDB Configuration
export MONGODB_URI="mongodb+srv://dhananjaywin15112004:ec2cY3Gk2HxizdS2@cluster.4jkps.mongodb.net/?retryWrites=true&w=majority&appName=photos-test"
export MONGODB_DB_NAME="photos-test"

# Razorpay Configuration
export NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_RDS7GUfIddVKwK"
export RAZORPAY_KEY_SECRET="Sk0lz17w2Hz328cgvSs9WsVR"

# ImageKit Configuration
export NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_wkRNuym4bz+0R6wuAYTQfiaWi90="
export IMAGEKIT_PRIVATE_KEY="private_CbNfu0pqv6SGi5szq+HCP01WZUc="
export NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/b5qewhvhb"

# Application URL
export NEXT_PUBLIC_APP_URL="https://shopwave.social"

echo "Environment variables exported successfully!"