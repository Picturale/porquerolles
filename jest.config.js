export default {
  // Use jsdom so DOM APIs like document/canvas exist
  testEnvironment: 'jsdom',
  // Only run our unit tests, ignore e2e and other scripts
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
};
