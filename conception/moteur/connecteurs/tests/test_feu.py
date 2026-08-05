"""Tests du connecteur feu — PLAN-ATELIER B2.

Règle J+1→J (VERIFICATIONS.md §2 / feu.py:sonde) avec mocks HTTP.
Aucun appel réseau.
"""
from __future__ import annotations

import datetime
import pathlib
import sys
from unittest import mock

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / "conception" / "moteur" / "connecteurs"))

import feu  # noqa: E402


def _payload(niveau=3):
    return {
        "massifs": {feu.MASSIF_ID: [niveau]},
        "zm": {feu.MASSIF_ID: niveau},
    }


def test_sonde_prend_j_plus_1_si_present():
    auj = datetime.date.today()
    dem = auj + datetime.timedelta(days=1)
    payload = _payload(4)

    def fake_fetch(date_str):
        if date_str == dem.strftime("%Y%m%d"):
            return payload, f"mock://{date_str}"
        pytest.fail(f"ne devait pas sonder {date_str} si J+1 répond")

    with mock.patch.object(feu, "fetch_jour", side_effect=fake_fetch):
        data, url, date_portee = feu.sonde()

    assert data is payload
    assert date_portee == dem
    assert dem.strftime("%Y%m%d") in url


def test_sonde_retombe_sur_j_si_j_plus_1_absent():
    auj = datetime.date.today()
    dem = auj + datetime.timedelta(days=1)
    payload = _payload(2)

    def fake_fetch(date_str):
        if date_str == dem.strftime("%Y%m%d"):
            return None, f"mock://{date_str}"
        if date_str == auj.strftime("%Y%m%d"):
            return payload, f"mock://{date_str}"
        pytest.fail(f"date inattendue {date_str}")

    with mock.patch.object(feu, "fetch_jour", side_effect=fake_fetch):
        data, url, date_portee = feu.sonde()

    assert data is payload
    assert date_portee == auj
    assert auj.strftime("%Y%m%d") in url


def test_sonde_echoue_sans_inventer_si_tout_absent():
    def fake_fetch(date_str):
        return None, f"mock://{date_str}"

    with mock.patch.object(feu, "fetch_jour", side_effect=fake_fetch):
        with pytest.raises(RuntimeError, match="source indisponible"):
            feu.sonde()
