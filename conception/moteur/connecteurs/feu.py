#!/usr/bin/env python3
"""
Connecteur risque incendie -- DECISIONS.md Sec.12 : "/aujourdhui/feu | le
niveau seul. Jamais le perimetre -> lien Parc". Ce connecteur ne rend QUE
le niveau numerique (1-5) du massif 839 (Iles d'Hyeres, qui couvre
Porquerolles) -- jamais une liste de ce qui est ouvert ou ferme, meme si
la source permettait de le deviner. C'est le risque operationnel que
DECISIONS.md Sec.12 nomme explicitement comme la raison d'exclure le
perimetre de la V1 : "coder en dur une liste de plages et de sentiers...
change par arrete et qu'on ne saura pas tenir."

Source : risque-prevention-incendie.fr, deja verifiee dans VERIFICATIONS.md
Sec.2 et CATALOGUE-SOURCES.md Sec.3.1 -- endpoint reel, HTTP 200, massif
839 = ILES D'HYERES confirme (page /var + massifs_centre.js).

LICENCE INCONNUE -- aucune mention trouvee sur le site (CATALOGUE-SOURCES.md
Sec.3.1 : "Demande ecrite a la DDTM 83 recommandee avant usage
publicitaire"). Ce connecteur est un test de faisabilite technique, PAS une
autorisation d'usage public -- meme statut que le connecteur vent.py vis-a-vis
d'Open-Meteo (dev uniquement), pour un motif different (licence non
etablie, pas licence non-commerciale connue). Voir A-VERIFIER.md, demarche
n°3 (demande de flux ouvert a la prefecture, jamais envoyee).

Heure de publication -- NE JAMAIS L'AFFICHER. VERIFICATIONS.md Sec.2 a
trouve deux pages officielles du Parc qui se contredisent (18h vs 19h) ;
la regle retenue est de sonder le fichier de J+1, de retomber sur celui du
jour si absent, et d'afficher la DATE PORTEE PAR LA DONNEE elle-meme,
jamais une heure supposee.

Usage :
    python3 conception/moteur/connecteurs/feu.py
    python3 conception/moteur/connecteurs/feu.py --tolerant
    -> ecrit conception/donnees/risque-incendie-du-jour.json

Mode --tolerant (PLAN-ATELIER A2) : en cas d'echec (reseau, source tombee…),
code retour 0 et RIEN d'ecrit — le dernier JSON est conserve. Jamais de
suppression, jamais de niveau invente.
"""
import argparse
import datetime
import json
import sys
import urllib.error
import urllib.request

BASE_URL = "https://www.risque-prevention-incendie.fr/static/83/import_data/{date}.json"
MASSIF_ID = "839"  # Iles d'Hyeres -- confirme dans VERIFICATIONS.md, page /var
OUT_PATH = "conception/donnees/risque-incendie-du-jour.json"

NIVEAU_LABELS = {
    0: "non communiqué",
    1: "vert",
    2: "jaune",
    3: "orange",
    4: "rouge",
    5: "rouge exceptionnel",
}

VALIDITE_MINUTES = 60 * 20  # publication quotidienne, une seule valeur par jour


def fetch_jour(date_str):
    """Retourne (data, url) ou (None, url) si 404 -- ne remonte jamais
    d'autre exception que celle d'une vraie panne reseau, pour distinguer
    "le fichier de demain n'existe pas encore" (normal, attendu) d'une
    vraie erreur."""
    url = BASE_URL.format(date=date_str)
    req = urllib.request.Request(url, headers={"User-Agent": "porquerolles-connecteur/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.load(resp), url
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None, url
        raise


def sonde():
    """Sonde J+1 d'abord (la publication du soir peut deja etre en ligne),
    retombe sur J si absent -- regle exacte de VERIFICATIONS.md Sec.2."""
    aujourdhui = datetime.date.today()
    demain = aujourdhui + datetime.timedelta(days=1)

    data, url = fetch_jour(demain.strftime("%Y%m%d"))
    if data is not None:
        return data, url, demain

    data, url = fetch_jour(aujourdhui.strftime("%Y%m%d"))
    if data is not None:
        return data, url, aujourdhui

    raise RuntimeError(
        f"ni le fichier de demain ({demain}) ni celui d'aujourd'hui "
        f"({aujourdhui}) ne repondent -- source indisponible, ne jamais "
        f"inventer un niveau par defaut"
    )


def run():
    print("Sondage risque-prevention-incendie.fr (J+1 puis J)...", file=sys.stderr)
    data, url, date_portee = sonde()

    niveau_massifs = data.get("massifs", {}).get(MASSIF_ID)
    niveau_zm = data.get("zm", {}).get(MASSIF_ID)

    if niveau_massifs is None:
        raise RuntimeError(f"massif {MASSIF_ID} absent de la reponse -- structure changee ?")

    niveau = niveau_massifs[0] if isinstance(niveau_massifs, list) else niveau_massifs
    accord_zm = (niveau_zm == niveau)
    if not accord_zm:
        print(f"ATTENTION: massifs[{MASSIF_ID}]={niveau} mais zm[{MASSIF_ID}]={niveau_zm} "
              f"-- les deux cles ne concordent pas, deja signale comme possible "
              f"dans VERIFICATIONS.md", file=sys.stderr)

    recu_a = datetime.datetime.now(datetime.timezone.utc)

    # Fraicheur au moment de l'ecriture — le site la recalcule au build
    # (site/src/lib/fraicheur.js, PLAN A3) a partir de genere_le.
    age_min = 0.0
    statut = "frais"

    resultat = {
        "genere_le": recu_a.isoformat(),
        "observation": {
            "niveau": niveau,
            "niveau_label": NIVEAU_LABELS.get(niveau, f"niveau inconnu ({niveau})"),
            "massif": f"{MASSIF_ID} ILES D'HYERES",
            "zm_concorde": accord_zm,
            "zm_valeur": niveau_zm,
            # Date PORTEE PAR LA DONNEE, jamais une heure de publication
            # supposee -- voir l'avertissement en tete de ce fichier.
            "date_donnee": date_portee.isoformat(),
            "recu_a": recu_a.isoformat(),
            "source": "risque-prevention-incendie.fr — licence inconnue, usage dev/test uniquement",
            "url": url,
            "validite_minutes": VALIDITE_MINUTES,
            "statut": statut,
            "age_minutes": age_min,
        },
    }

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultat, f, ensure_ascii=False, indent=2)

    print(f"Niveau massif {MASSIF_ID} (date des donnees {date_portee}) : "
          f"{niveau} ({NIVEAU_LABELS.get(niveau)}) — zm concorde: {accord_zm}", file=sys.stderr)
    print(f"Ecrit {OUT_PATH}", file=sys.stderr)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument(
        "--tolerant",
        action="store_true",
        help="echec → code 0, rien d'ecrit (conserve le dernier JSON)",
    )
    args = parser.parse_args(argv)
    try:
        run()
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError,
            RuntimeError, KeyError, TypeError, ValueError) as e:
        print(f"ECHEC connecteur feu : {e}", file=sys.stderr)
        if args.tolerant:
            print(
                "Mode --tolerant : dernier JSON conserve, code retour 0 "
                "(PLAN-ATELIER A2).",
                file=sys.stderr,
            )
            return 0
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
