# Project workflows

Quick commands to keep dev/test/deploy simple.

## Local web only
- npm run dev  # Vite on http://localhost:8002/ (per vite.config)

## Local with Firebase Emulators
- npm run ports:kill  # free common ports (5001,8080,9099,9199,4001,4002)
- npm run emu:all     # firestore, auth, storage, functions (imports ./.emulator-data)
- npm run emu:ui      # open Emulator UI (http://127.0.0.1:4002)

Notes:
- Use dev:api if you want Vite to point to local functions base URL.
- To persist emulator state, stop with Ctrl+C; export happens automatically with --export-on-exit.

## Build and validate
- npm run build
- npm run validate  # optional project-specific checks

## Deploy
- npm run deploy:hosting   # static hosting only
- npm run deploy:functions # functions only
- npm run deploy:backend   # firestore (rules/indexes), functions, storage (no RTDB)
- npm run deploy:full      # everything (may fail on RTDB until rules fixed)

## Firestore indexes
- npm run indexes:pull  # export project indexes to config/firestore.indexes.json
- npm run indexes:push  # deploy rules + indexes

## Secrets (Functions)
- firebase functions:secrets:set ADMIN_BOOTSTRAP_CODE
- After setting, deploy functions: npm run deploy:functions

## Troubleshooting
- Ports busy: npm run ports:kill
- Emulator UI clash: change ui port in firebase.json emulators.ui.port
- RTDB rules error: database.rules.json must contain top-level { "rules": { ... } }
