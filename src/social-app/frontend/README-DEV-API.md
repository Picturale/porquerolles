Dev API routing tips

- The dev server (Vite) proxies /api/* to Firebase Functions. The base is controlled by FUNCTIONS_BASE_URL.
- To use the local emulator (europe-west1), create a .env.local with:
  FUNCTIONS_BASE_URL=http://127.0.0.1:5001/vision-picturale-community/europe-west1
- If you changed it, restart the dev server so it picks up the new env.
- The Functions in this project run in region europe-west1. Avoid us-central1 in local configs.
- Seed Firestore emulator with a few demo products:
  1) Ensure emulators are running (functions + firestore).
  2) Run: npm run seed:products
  3) Search in the UI for: cadre, papier, kit
