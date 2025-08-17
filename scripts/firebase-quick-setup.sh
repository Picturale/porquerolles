#!/bin/bash

# Quick Firebase setup and deploy script
echo "🔥 Firebase Quick Setup and Deploy 🔥"

# Set working directory to project root
cd $(dirname "$0")/..
PROJECT_ROOT=$(pwd)

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI not found. Installing..."
  npm install -g firebase-tools
fi

# Log in to Firebase if needed
firebase -V || firebase login

# Initialize a new Firebase project if needed
if [ ! -f ".firebaserc" ]; then
  echo "📝 No Firebase project configured. Let's set one up."
  echo "Choose an option:"
  echo "1) Create a new Firebase project"
  echo "2) Use an existing Firebase project"
  read -p "Enter your choice (1 or 2): " choice
  
  if [ "$choice" == "1" ]; then
    # Create new project
    echo "Creating new project..."
    firebase projects:create
  else
    # Use existing project
    firebase projects:list
    read -p "Enter the project ID from the list above: " project_id
    firebase use --add "$project_id"
  fi
else
  echo "✅ Firebase project already configured."
fi

# Set up Firebase hosting if needed
if ! grep -q '"hosting":' firebase.json 2>/dev/null; then
  echo "Setting up Firebase hosting..."
  firebase init hosting
fi

# Set up Firebase functions if needed
if [ ! -d "functions" ]; then
  echo "Setting up Firebase functions..."
  firebase init functions
fi

# Build and deploy
echo "🚀 Building and deploying..."
$PROJECT_ROOT/scripts/deploy-social-app.sh

echo "✅ All done!"
