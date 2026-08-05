import { defineConfig } from 'astro/config';

// Site statique, aucune intégration framework — voir conception/DECISIONS.md §14.
//
// base /porquerolles/ : GitHub Pages sans domaine custom (PLAN-ATELIER A1).
// DEMANDER #9 tranché en intérim le 5/08/2026 : rester sous /porquerolles/.
// Domaine custom plus tard → Cloudflare Pages (DECISIONS §14) + retrait du base.
// Tous les liens internes passent par site/src/lib/url.js (u()).
export default defineConfig({
  output: 'static',
  site: 'https://maison-picturale.github.io',
  base: '/porquerolles',
  trailingSlash: 'always',
});
