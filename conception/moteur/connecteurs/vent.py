#!/usr/bin/env python3
"""
Connecteur vent -- premier moteur qui calcule reellement un etat a partir
d'une mesure, jamais fait avant (voir REVUE-CRITIQUE-KIMI.md, constat A8 :
"aucun moteur ne calcule l'etat du jour", le site se contentait jusque-la
d'un choix manuel entre les trois etats deja documentes).

Contrat du connecteur, DECISIONS.md Sec.8 et Sec.10 : une source produit
une OBSERVATION datee avec un statut de fraicheur, jamais une valeur brute
consommee telle quelle.

    { valeur, mesure_a, recu_a, source, url, validite, statut }

Source de developpement, PAS de production : Open-Meteo, gratuit en usage
NON COMMERCIAL SEULEMENT (voir HOULE-OPENMETEO.md, deja flague dans cette
session). DECISIONS.md Sec.9 le prevoit explicitement : "Open-Meteo en
commodite de developpement derriere le meme connecteur" -- CANDHIS et/ou
Copernicus Marine (usage commercial autorise) sont les sources primaires
prevues, pas encore accessibles (cle CANDHIS jamais demandee, jetons
Meteo-France obtenus mais leur valeur n'est recuperable par aucune session,
voir PREMIER-RELEVE-TEMPS-REEL.md). Ne jamais deployer ce connecteur tel
quel sur un site avec monetisation sans repasser par une source commerciale.

Modele AROME France HD, point centre-ile (deja valide dans
HOULE-OPENMETEO.md) -- pas la station du semaphore (CLIMATOLOGIE-VENT.md),
source differente, non comparable minute a minute.

Usage :
    python3 conception/moteur/connecteurs/vent.py
    -> ecrit conception/donnees/etat-du-jour.json
"""
import datetime
import json
import sys
import urllib.request

OPEN_METEO_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude=42.999&longitude=6.205"
    "&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m"
    "&wind_speed_unit=kn&timezone=Europe%2FParis&models=arome_france_hd"
)

ETATS_PATH = "conception/porquerolles/etats.yml"
LIEUX_PATH = "conception/porquerolles/lieux.yml"
OUT_PATH = "conception/donnees/etat-du-jour.json"

# Validite de l'observation avant de la considerer perimee -- AROME HD se
# met a jour toutes les heures, une marge de securite de 90 min absorbe le
# delai de publication sans se faire piquer par un decalage d'horloge.
VALIDITE_MINUTES = 90


def direction_dans_secteur(direction, bornes):
    """bornes = [min, max]. Gere le cas normal (min < max) uniquement --
    aucun secteur d'etats.yml ne traverse 0/360 aujourd'hui ; leve une
    erreur explicite plutot que de deviner un comportement si ça change un
    jour, pour ne pas classer silencieusement en faux."""
    lo, hi = bornes
    if lo > hi:
        raise NotImplementedError(
            f"secteur [{lo},{hi}] traverse 0/360 -- non gere, corriger "
            f"direction_dans_secteur() avant d'utiliser ce fichier etats.yml"
        )
    return lo <= direction <= hi


def heure_dans_fenetre(heure_locale, bornes):
    lo, hi = bornes
    return lo <= heure_locale <= hi


def classifie(direction, vitesse, heure_locale, etats_doc):
    """Reproduit exactement la regle ecrite en tete d'etats.yml :
    "Premier etat qui correspond gagne. Du plus specifique au plus
    general." -- implemente ici en Python pour la premiere fois ; le site
    (site/src/lib/lieux.js) ne fait toujours que lire un etat choisi a la
    main, pas le calculer. Retourne le dict de l'etat qui matche."""
    for etat in etats_doc["etats"]:
        quand = etat.get("quand")
        if quand is None:
            if etat.get("defaut"):
                return etat
            continue
        if not direction_dans_secteur(direction, quand["direction"]):
            continue
        if vitesse < quand["moyen_min"]:
            continue
        if "heure" in quand and not heure_dans_fenetre(heure_locale, quand["heure"]):
            continue
        return etat
    raise RuntimeError("aucun etat ne matche, meme pas le defaut -- etats.yml incomplet")


def fetch_vent_live():
    req = urllib.request.Request(OPEN_METEO_URL, headers={"User-Agent": "porquerolles-connecteur/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.load(resp)
    return data


def observation_depuis_reponse(data):
    """Construit l'observation au format Sec.8. mesure_a = l'horodatage
    que la source elle-meme annonce (peut differer de l'heure de reception
    si la source publie avec un delai) ; recu_a = l'heure a laquelle CE
    script a recu la reponse."""
    cur = data["current"]
    # Open-Meteo rend l'heure locale sans decalage explicite dans la
    # chaine (deja convertie par le parametre timezone=Europe/Paris) --
    # on la garde telle quelle plutot que de lui attribuer un fuseau au
    # hasard.
    mesure_a = cur["time"]  # "2026-08-05T15:30", heure Europe/Paris
    recu_a = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return {
        "direction_deg": cur["wind_direction_10m"],
        "vitesse_nds": cur["wind_speed_10m"],
        "rafales_nds": cur["wind_gusts_10m"],
        "mesure_a": mesure_a,
        "recu_a": recu_a,
        "source": "Open-Meteo (modele AROME France HD), DEV UNIQUEMENT -- non commercial",
        "url": OPEN_METEO_URL,
        "validite_minutes": VALIDITE_MINUTES,
    }


def statut_fraicheur(mesure_a_str, maintenant_utc):
    """frais | tiede | perime -- Sec.8. mesure_a est en heure locale
    Europe/Paris sans decalage explicite dans la reponse Open-Meteo ; on
    le suppose UTC+2 (heure d'ete, valide pour la periode couverte par ce
    dossier, aout) plutot que de deviner un autre fuseau."""
    mesure_dt = datetime.datetime.fromisoformat(mesure_a_str).replace(
        tzinfo=datetime.timezone(datetime.timedelta(hours=2))
    )
    age_min = (maintenant_utc - mesure_dt).total_seconds() / 60
    if age_min <= VALIDITE_MINUTES:
        return "frais", age_min
    if age_min <= VALIDITE_MINUTES * 4:
        return "tiede", age_min
    return "perime", age_min


def main():
    import yaml

    with open(ETATS_PATH, encoding="utf-8") as f:
        etats_doc = yaml.safe_load(f)

    print(f"Requete Open-Meteo (AROME France HD)...", file=sys.stderr)
    data = fetch_vent_live()
    obs = observation_depuis_reponse(data)

    maintenant = datetime.datetime.now(datetime.timezone.utc)
    statut, age_min = statut_fraicheur(obs["mesure_a"], maintenant)
    obs["statut"] = statut
    obs["age_minutes"] = round(age_min, 1)

    heure_locale = datetime.datetime.fromisoformat(obs["mesure_a"]).hour \
        + datetime.datetime.fromisoformat(obs["mesure_a"]).minute / 60

    etat = classifie(obs["direction_deg"], obs["vitesse_nds"], heure_locale, etats_doc)

    # Veto de vent extreme (etats.yml, veto_vent_extreme) -- s'applique
    # independamment de l'etat matche, jamais invente ici : le seuil et
    # l'axe viennent tels quels du fichier.
    veto = etats_doc.get("veto_vent_extreme")
    veto_actif = veto is not None and obs["vitesse_nds"] >= veto["moyen_min"]

    resultat = {
        "genere_le": maintenant.isoformat(),
        "observation": obs,
        "etat": {
            "id": etat["id"],
            "nom": etat["nom"],
            "constat": etat.get("constat", "").strip() or None,
            "a_des_notes_de_lieu": etat["id"] not in ("vent_fort_non_categorise",),
        },
        "veto_vent_extreme_actif": veto_actif,
        "veto_vent_extreme_detail": veto if veto_actif else None,
    }

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultat, f, ensure_ascii=False, indent=2)

    print(f"Vent releve : {obs['direction_deg']}° a {obs['vitesse_nds']} nds "
          f"(rafales {obs['rafales_nds']} nds), mesure a {obs['mesure_a']}, "
          f"statut {statut} ({age_min:.0f} min)", file=sys.stderr)
    print(f"Etat calcule : {etat['id']} ({etat['nom']})", file=sys.stderr)
    if veto_actif:
        print(f"VETO VENT EXTREME ACTIF : sable force a {veto['note']}", file=sys.stderr)
    print(f"Ecrit {OUT_PATH}", file=sys.stderr)


if __name__ == "__main__":
    main()
