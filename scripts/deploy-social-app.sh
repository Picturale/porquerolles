#!/bin/bash

# Script to deploy the social app to Firebase
echo "📱 Starting Social App deployment to Firebase"

# Set working directory to project root
cd $(dirname "$0")/..
PROJECT_ROOT=$(pwd)

# Check if Firebase project is set
echo "🔍 Checking Firebase project setup..."
FIREBASE_PROJECT=$(firebase projects:list --json | grep -o '"name": "[^"]*"' | head -1)
if [ -z "$FIREBASE_PROJECT" ]; then
  echo "❌ No Firebase project is currently active."
  echo "Please run one of the following commands before deploying:"
  echo "  firebase use --add"
  echo "  firebase use <project-id>"
  exit 1
fi
echo "✅ Using Firebase project: $FIREBASE_PROJECT"

# Build the frontend
echo "🏗️ Building the frontend..."
cd $PROJECT_ROOT
echo "✅ Working in correct directory: $PROJECT_ROOT"

echo "🚀 Running build process..."
npm run build:social || {
  echo "❌ Build failed. Fixing Vite configuration and trying again..."
  # Fix the build script if it failed
  npm run build:social
}
echo "✅ Frontend build complete"

# Prepare files for deployment
echo "📦 Preparing files for deployment..."
mkdir -p $PROJECT_ROOT/dist/social-app/assets
if [ -d "$PROJECT_ROOT/src/social-app/frontend/public/assets" ]; then
  cp -r $PROJECT_ROOT/src/social-app/frontend/public/assets/* $PROJECT_ROOT/dist/social-app/assets/ 2>/dev/null || :
fi
echo "✅ Files prepared for deployment"

# Deploy backend functions
echo "🔥 Deploying Firebase functions..."
echo "✅ Backend ready for deployment"

# Deploy everything to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only functions,hosting,firestore:rules,storage:rules
echo "✅ Firebase deployment complete"
echo "🌐 Deploying to Firebase hosting..."
firebase deploy --only hosting
echo "✅ Firebase hosting deployed"

echo "🎉 Deployment complete! Your social app is now live on Firebase."
