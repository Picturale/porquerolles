#!/bin/bash

# Test Firebase connection
echo "🔍 Testing Firebase connection..."

# Set working directory to project root
cd $(dirname "$0")/..
PROJECT_ROOT=$(pwd)

# Check if Firebase project is set
echo "Checking Firebase project setup..."
FIREBASE_PROJECT=$(firebase projects:list --json | grep -o '"name": "[^"]*"' | head -1)
if [ -z "$FIREBASE_PROJECT" ]; then
  echo "❌ No Firebase project is currently active."
  echo "Please run: ./scripts/firebase-quick-setup.sh"
  exit 1
fi
echo "✅ Firebase project detected: $FIREBASE_PROJECT"

# Check emulator status
echo "Checking Firebase emulators..."
EMULATOR_RUNNING=$(curl -s http://localhost:4000/emulator/v1/projects/demo-project/databases/\(default\) || echo "failed")
if [[ "$EMULATOR_RUNNING" == *"failed"* ]]; then
  echo "❓ Firebase emulators might not be running. Would you like to start them?"
  read -p "Start emulators? (y/n): " choice
  if [ "$choice" == "y" ] || [ "$choice" == "Y" ]; then
    echo "Starting emulators..."
    ./scripts/start-social-emulators.sh &
    sleep 5
  fi
else
  echo "✅ Firebase emulators detected"
fi

# Test deploy-ready
echo "Testing deployment readiness..."
if [ ! -d "$PROJECT_ROOT/dist/social-app" ]; then
  echo "⚠️ No build found. Building the app..."
  npm run build:social
else
  echo "✅ Build directory exists"
fi

echo "🔥 Firebase setup appears to be complete!"
echo ""
echo "🚀 Next steps:"
echo "1. To deploy: npm run deploy:social"
echo "2. For local development: npm run dev:social:full"
echo ""
