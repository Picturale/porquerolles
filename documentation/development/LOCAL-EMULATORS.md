# Local Firebase Emulators

This project can use Firebase emulators for local development.

## Ports
- Firestore: http://127.0.0.1:8080
- Auth: http://127.0.0.1:9099
- Storage: http://127.0.0.1:9199
- Functions: http://127.0.0.1:5001
- Emulator UI: http://127.0.0.1:4000

## Run

1. Start emulators in one terminal:
   - npm run dev:emulators
2. Start the web app in another terminal (Vite auto-picks .env.development):
   - npm run dev

Ensure VITE_USE_EMULATOR=true in .env.development (already set).

## Notes
- Functions base URL for local calls: http://127.0.0.1:5001/vision-picturale-community/us-central1
- Sign-in flows will use Auth emulator; create accounts via Emulator UI if needed.
