import { defineConfig } from 'vitest/config';

// Vitest tourne depuis site/ — process.cwd() = site/, comme Astro build,
// pour que lieux.js résolve ../conception/porquerolles/*.yml.
export default defineConfig({
  test: {
    include: ['src/**/*.test.js'],
    environment: 'node',
  },
});
