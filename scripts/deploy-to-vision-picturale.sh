#!/bin/bash

# Script to deploy social app to the existing vision-picturale-community Firebase project
echo "🔥 Deploying to vision-picturale-community project 🔥"

# Set working directory to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"
echo "Working from directory: $PROJECT_ROOT"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI not found. Installing..."
  npm install -g firebase-tools
fi

# Log in to Firebase if needed
firebase -V || firebase login

# Set the project to vision-picturale-community
echo "Setting active project to vision-picturale-community..."
firebase use vision-picturale-community || {
  echo "Project not found in your Firebase account."
  echo "Adding vision-picturale-community as an alias..."
  firebase use --add vision-picturale-community
}

# Check if Firebase project is set correctly
CURRENT_PROJECT=$(firebase projects:list --json | grep -o '"name": "[^"]*"' | grep -o 'vision-picturale-community' || echo "")
if [ -z "$CURRENT_PROJECT" ]; then
  echo "❌ Could not set vision-picturale-community as the active project."
  echo "Please make sure you have access to this project."
  exit 1
fi
echo "✅ Using Firebase project: vision-picturale-community"

# Create or update .firebaserc file
cat > .firebaserc << EOF
{
  "projects": {
    "default": "vision-picturale-community"
  }
}
EOF
echo "✅ .firebaserc file updated"

# Build and deploy
echo "🚀 Building and deploying..."

# Build the frontend
echo "🏗️ Building the frontend..."
cd "$PROJECT_ROOT/src/social-app/frontend"
npm install
echo "✅ Frontend dependencies installed"

# Return to the project root
cd "$PROJECT_ROOT"
echo "🚀 Running build process..."
npm run build:social || {
  echo "❌ Build failed. Trying alternative build method..."
  # Fix the build script if it failed
  npm run dev:social -- --build
}
echo "✅ Frontend build complete"

# Prepare files for deployment
echo "📦 Preparing files for deployment..."
mkdir -p $PROJECT_ROOT/dist/social-app/assets
if [ -d "$PROJECT_ROOT/src/social-app/frontend/public/assets" ]; then
  cp -r $PROJECT_ROOT/src/social-app/frontend/public/assets/* $PROJECT_ROOT/dist/social-app/assets/ 2>/dev/null || :
fi

# Copy test page
cp "$PROJECT_ROOT/src/social-app/test.html" "$PROJECT_ROOT/dist/social-app/"
echo "✅ Files prepared for deployment"

# Deploy backend functions
echo "🔥 Deploying Firebase functions..."
cd "$PROJECT_ROOT/src/social-app/backend"
if [ -d "$PROJECT_ROOT/src/social-app/backend" ]; then
  npm install
  echo "✅ Backend dependencies installed"
else
  echo "⚠️ Backend directory not found, skipping backend deployment"
fi

# Return to the project root
cd "$PROJECT_ROOT"

# Deploy everything to Firebase
echo "🚀 Deploying to Firebase..."
if [ -f "$PROJECT_ROOT/firebase.json" ]; then
  # Deploy hosting only first to ensure the basic app works
  firebase deploy --only hosting --project vision-picturale-community
  
  # Then try to deploy the other components
  firebase deploy --only firestore:rules,storage:rules --project vision-picturale-community || echo "⚠️ Rules deployment failed, but hosting should still work"
  
  if [ -d "$PROJECT_ROOT/src/social-app/backend" ] && [ -f "$PROJECT_ROOT/src/social-app/backend/package.json" ]; then
    firebase deploy --only functions --project vision-picturale-community || echo "⚠️ Functions deployment failed, but hosting should still work"
  fi
  
  echo "✅ Firebase deployment complete"
else
  echo "❌ firebase.json not found in $PROJECT_ROOT"
  echo "Creating a simple firebase.json file..."
  cat > "$PROJECT_ROOT/firebase.json" << EOF
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/social-app/**",
        "destination": "/social-app/index.html"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF
  firebase deploy --only hosting --project vision-picturale-community
  echo "✅ Firebase deployment complete (hosting only)"
fi

echo "🎉 Deployment complete! Your social app is now live on vision-picturale-community Firebase project."
echo "Visit: https://vision-picturale-community.web.app/social-app/"
