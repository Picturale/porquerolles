#!/bin/bash

# Script to run Firebase emulators for local development
echo "🔥 Starting Firebase emulators for social app development..."

# Set the environment variable to use emulators
export VITE_USE_EMULATOR=true

# Navigate to the project root
cd $(dirname "$0")/..

# Make sure firebase-tools is installed
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI not found, installing globally..."
    npm install -g firebase-tools
fi

# Start the emulators
echo "🚀 Starting Firebase emulators..."
firebase emulators:start --only auth,functions,firestore,storage,hosting

echo "❌ Firebase emulators stopped."
