/**
 * Préfixe un chemin absolu du site avec le `base` Astro.
 * Sous GitHub Pages sans domaine custom, le site vit à `/porquerolles/`
 * (PLAN-ATELIER A1, DEMANDER #9 encore ouvert). Ne jamais écrire un
 * `href="/…"` en dur : tous les liens internes passent par ici.
 */
export function u(chemin) {
  const base = import.meta.env.BASE_URL; // toujours terminé par /
  const propre = chemin.startsWith('/') ? chemin.slice(1) : chemin;
  return `${base}${propre}`;
}
