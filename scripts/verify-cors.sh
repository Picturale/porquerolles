#!/bin/bash

# Script to verify CORS configuration for Firebase
# Creates a detailed report of the CORS status

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FILE="./docs/CORS-CHECK-REPORT-$TIMESTAMP.md"

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
  echo "Error: Must be run from the root project directory"
  exit 1
fi

# Create the report file
cat > "$REPORT_FILE" << EOL
# CORS Configuration Verification Report
**Date:** $(date)

## Configuration Status

EOL

# Check CORS file
if [ -f "cors.json" ]; then
  echo "✅ CORS configuration file exists" >> "$REPORT_FILE"
  echo "\`\`\`json" >> "$REPORT_FILE"
  cat cors.json >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
else
  echo "❌ CORS configuration file missing" >> "$REPORT_FILE"
fi

echo -e "\n## Firebase Storage CORS Status\n" >> "$REPORT_FILE"

# Check gsutil availability
if command -v gsutil &> /dev/null; then
  echo "✅ gsutil tool is available" >> "$REPORT_FILE"
  
  # Get current CORS configuration
  echo -e "\nCurrent CORS configuration for storage:\n" >> "$REPORT_FILE"
  echo "\`\`\`" >> "$REPORT_FILE"
  gsutil cors get gs://vision-picturale-community.firebasestorage.app >> "$REPORT_FILE" 2>&1
  echo "\`\`\`" >> "$REPORT_FILE"
else
  echo "❌ gsutil tool is not installed" >> "$REPORT_FILE"
  echo "Please install Google Cloud SDK to manage CORS settings" >> "$REPORT_FILE"
fi

echo -e "\n## Firebase Initialization\n" >> "$REPORT_FILE"

# Check Firebase initialization file
if [ -f "src/social-app/frontend/firebase.js" ]; then
  echo "✅ Firebase initialization file exists" >> "$REPORT_FILE"
  echo "\nCORS handling code in firebase.js:\n" >> "$REPORT_FILE"
  echo "\`\`\`javascript" >> "$REPORT_FILE"
  grep -A20 "CORS handling" src/social-app/frontend/firebase.js >> "$REPORT_FILE" 2>&1
  echo "\`\`\`" >> "$REPORT_FILE"
else
  echo "❌ Firebase initialization file not found" >> "$REPORT_FILE"
fi

echo -e "\n## Recommendations\n" >> "$REPORT_FILE"

echo "1. **Test in development mode** to verify CORS handling is working correctly" >> "$REPORT_FILE"
echo "2. **Clear browser cache** before testing, as CORS errors can be cached" >> "$REPORT_FILE"
echo "3. **Use browser developer tools** to inspect network requests for CORS headers" >> "$REPORT_FILE"
echo "4. **Consider Firebase Emulators** for local development to avoid CORS issues entirely" >> "$REPORT_FILE"

echo "CORS verification complete. Report saved to $REPORT_FILE"
echo "Open the report with: code $REPORT_FILE"
