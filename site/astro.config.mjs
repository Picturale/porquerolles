import { defineConfig } from 'astro/config';

// Site statique, aucune intégration framework — voir conception/DECISIONS.md §14.
export default defineConfig({
  output: 'static',
});
