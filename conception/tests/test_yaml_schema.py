"""Validation du schéma des YAML île — PLAN-ATELIER B3.

ids uniques, notes entre 0 et 5, axes complets pour les états qui ont
une matrice. Aucun appel réseau.
"""
from __future__ import annotations

import pathlib

import pytest
import yaml

ROOT = pathlib.Path(__file__).resolve().parents[1]
ETATS = ROOT / "porquerolles" / "etats.yml"
LIEUX = ROOT / "porquerolles" / "lieux.yml"
AXES = ("eau", "sable", "tranquillite")
# États pour lesquels le site a une matrice complète (PLAN-ATELIER §1).
ETATS_MATRICE = ("calme", "mistral_fort", "est_fort")


@pytest.fixture(scope="module")
def etats_doc():
    return yaml.safe_load(ETATS.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def lieux_doc():
    return yaml.safe_load(LIEUX.read_text(encoding="utf-8"))


def test_etats_ids_uniques(etats_doc):
    ids = [e["id"] for e in etats_doc["etats"]]
    assert len(ids) == len(set(ids))
    assert "calme" in ids


def test_lieux_ids_uniques(lieux_doc):
    ids = [l["id"] for l in lieux_doc["lieux"]]
    assert len(ids) == len(set(ids))
    assert len(ids) >= 15


def test_notes_plages_schema(lieux_doc):
    for lieu in lieux_doc["lieux"]:
        if lieu.get("type") != "plage":
            continue
        notes = lieu.get("notes") or {}
        for etat in ETATS_MATRICE:
            assert etat in notes, f"{lieu['id']} manque notes[{etat}]"
            n = notes[etat]
            for axe in AXES:
                assert axe in n, f"{lieu['id']}.{etat} manque {axe}"
                assert isinstance(n[axe], (int, float))
                assert 0 <= n[axe] <= 5, f"{lieu['id']}.{etat}.{axe}={n[axe]}"


def test_veto_vent_extreme_present(etats_doc):
    veto = etats_doc["veto_vent_extreme"]
    assert veto["moyen_min"] == 30
    assert veto["axe"] == "sable"
    assert veto["note"] == 0
