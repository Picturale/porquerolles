"""Tests du connecteur vent — PLAN-ATELIER B2.

Porte les 10 cas tabulés dans CONNECTEUR-VENT-PREMIER-CALCUL.md + les
seuils du veto. Aucun appel réseau.
"""
from __future__ import annotations

import pathlib
import sys

import pytest
import yaml

ROOT = pathlib.Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / "conception" / "moteur" / "connecteurs"))

import vent  # noqa: E402

ETATS_PATH = ROOT / "conception" / "porquerolles" / "etats.yml"


@pytest.fixture(scope="module")
def etats_doc():
    with open(ETATS_PATH, encoding="utf-8") as f:
        return yaml.safe_load(f)


# Table exacte de CONNECTEUR-VENT-PREMIER-CALCUL.md § Vérification.
# Dernière ligne du rapport = deux cas (0° et 5°) → 10 cas au total.
CAS_CLASSIFICATION = [
    (295, 30, 12.0, "mistral_fort"),
    (295, 15, 12.0, "mistral"),
    (90, 25, 12.0, "est_fort"),
    (100, 13, 15.0, "brise_sud_est"),
    (100, 13, 10.0, "est"),
    (70, 11, 10.0, "est"),
    (200, 25, 12.0, "vent_fort_non_categorise"),
    (200, 10, 12.0, "calme"),
    (0, 30, 12.0, "calme"),
    (5, 40, 12.0, "calme"),
]


@pytest.mark.parametrize("direction,vitesse,heure,attendu", CAS_CLASSIFICATION)
def test_classifie_cas_documentes(etats_doc, direction, vitesse, heure, attendu):
    etat = vent.classifie(direction, vitesse, heure, etats_doc)
    assert etat["id"] == attendu


@pytest.mark.parametrize(
    "vitesse,actif",
    [
        (25, False),
        (29, False),
        (30, True),
        (45, True),
    ],
)
def test_veto_seuils(etats_doc, vitesse, actif):
    veto = etats_doc["veto_vent_extreme"]
    assert veto["moyen_min"] == 30
    assert (vitesse >= veto["moyen_min"]) is actif
