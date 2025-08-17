#!/bin/bash

# Script to run both Vite dev server and Firebase emulators for social app development
echo "🚀 Starting social app development environment"

# Set the environment variable to use emulators
export VITE_USE_EMULATOR=true

# Navigate to the project root
cd $(dirname "$0")/..

# Start Firebase emulators in the background
echo "🔥 Starting Firebase emulators..."
firebase emulators:start --only auth,functions,firestore,storage --project social-app &
EMULATOR_PID=$!

# Wait a bit for emulators to start
sleep 5

# Start Vite dev server in the foreground
echo "⚡ Starting Vite dev server..."
npm run dev:social

# When Vite is terminated, kill the emulators
echo "❌ Stopping Firebase emulators..."
kill $EMULATOR_PID

echo "✅ Development environment shutdown complete"
