#!/bin/bash

# Script to verify the integration of all components of the social app
echo "🔍 Starting Social App Integration Test"

# Set the working directory to the project root
cd $(dirname "$0")/..

# Check Firebase configuration
echo "Checking Firebase configuration..."
if [ ! -f "src/social-app/.env" ]; then
  echo "❌ Firebase configuration not found. Creating from example..."
  cp src/social-app/.env.example src/social-app/.env
  echo "✅ Created .env file from example. Please update with your Firebase project details."
else
  echo "✅ Firebase configuration found."
fi

# Check Firebase CLI installation
echo "Checking Firebase CLI installation..."
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI not found. Please install using: npm install -g firebase-tools"
else
  echo "✅ Firebase CLI found."
fi

# Check backend dependencies
echo "Checking backend dependencies..."
if [ ! -d "src/social-app/backend/node_modules" ]; then
  echo "⚙️ Installing backend dependencies..."
  cd src/social-app/backend
  npm install
  cd ../../..
  echo "✅ Backend dependencies installed."
else
  echo "✅ Backend dependencies found."
fi

# Check frontend dependencies
echo "Checking frontend dependencies..."
if [ ! -d "src/social-app/frontend/node_modules" ]; then
  echo "⚙️ Installing frontend dependencies..."
  cd src/social-app/frontend
  npm install
  cd ../../..
  echo "✅ Frontend dependencies installed."
else
  echo "✅ Frontend dependencies found."
fi

# Check if build works
echo "Testing build process..."
npm run build:social
if [ $? -eq 0 ]; then
  echo "✅ Build successful."
else
  echo "❌ Build failed. Please check the error messages above."
  exit 1
fi

# Final report
echo ""
echo "🚀 Social App Integration Test Complete"
echo "✅ Your social app is ready for deployment"
echo "🔶 Next steps:"
echo "  1. Update src/social-app/.env with your Firebase project details"
echo "  2. Run './scripts/start-social-emulators.sh' to test locally"
echo "  3. Run './scripts/deploy-social-app.sh' to deploy to Firebase"
echo ""
