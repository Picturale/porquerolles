import { defineConfig } from 'astro/config';

// Site statique, aucune intégration framework — voir conception/DECISIONS.md §14.
//
// base /porquerolles/ : GitHub Pages sans domaine custom (PLAN-ATELIER A1).
// DEMANDER #9 (nom de domaine) encore ouvert — quand tranché, basculer sur
// Cloudflare Pages et retirer ce base. Tous les liens internes passent par
// site/src/lib/url.js (u()) pour respecter ce préfixe.
export default defineConfig({
  output: 'static',
  site: 'https://maison-picturale.github.io',
  base: '/porquerolles',
  trailingSlash: 'always',
});
