#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');

function sh(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

console.log('Starting heavy cleanup...');
try {
  // Build outputs
  sh('rm -rf dist build .cache');
  // Emulators
  sh('rm -rf .emulator-data firestore_export storage_export firebase-debug.log*');
  // Mobile
  sh('rm -rf android/build android/app/build android/.gradle android/.idea android/capacitor-cordova-android-plugins');
  sh('rm -rf ios/build ios/App/Pods ios/capacitor-cordova-ios-plugins ios/App/Podfile.lock');
  // Reports
  sh('rm -rf coverage playwright-report test-results .nyc_output');
  // Logs and backups
  sh('rm -f DEPLOYMENT-LOG-*.md BUILD-REPORT.md CLEANUP-*.md');
  sh('rm -f CreatePost_backup.jsx RichTextEditor_backup.jsx');
  // Archives
  try { sh('find . -maxdepth 3 -type f -name \'*.zip\' -delete'); } catch {}
  try { sh('find . -maxdepth 3 -type f -name \'*.tar\' -delete'); } catch {}
  try { sh('find . -maxdepth 3 -type f -name \'*.tar.gz\' -delete'); } catch {}
  try { sh('find . -maxdepth 3 -type f -name \'*.tgz\' -delete'); } catch {}
} catch (e) {
  console.error('Cleanup error:', e.message);
}
console.log('Cleanup done.');
