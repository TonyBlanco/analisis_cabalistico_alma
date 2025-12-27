# -*- coding: utf-8 -*-
from copy import deepcopy
from datetime import datetime

import api.astrology_kerykeion.multi_tech as multi_tech


def _sample_chart():
    return {
        "planetas": [
            {"nombre": "sun", "signo": "Aries", "grados": 10, "longitud_ecliptica": 10, "casa": 1, "es_retrogrado": False},
            {"nombre": "moon", "signo": "Tauro", "grados": 5, "longitud_ecliptica": 35, "casa": 2, "es_retrogrado": False},
        ],
        "casas": [{"numero": 1, "signo": "Aries", "cuspide_grados": 0, "cuspide_longitud": 0}],
        "aspectos": [{"planeta1": "sun", "planeta2": "moon", "tipo": "Conjuncion", "orbe": 2.5, "es_aplicativo": False}],
        "metadatos": {
            "sistema_casas": "P",
            "zodiac_type": "tropical",
            "fuente": "swiss_ephemeris",
            "version_engine": "2.10.3",
        },
    }


def _sample_input():
    return {
        "birth_date": "1990-01-01",
        "birth_time": "12:00",
        "location": {
            "city": "Madrid",
            "country": "ES",
            "lat": 40.4168,
            "lng": -3.7038,
            "timezone": "UTC",
        },
        "house_system": "P",
        "zodiac_type": "tropical",
        "engine": "swiss_ephemeris",
    }


def test_build_multitech_payload_structure(monkeypatch):
    natal = _sample_chart()
    natal_copy = deepcopy(natal)
    input_data = _sample_input()
    ref_dt = datetime(2024, 1, 1, 12, 0)

    def fake_run_chart_at_datetime(_input_data, _dt):
        return _sample_chart()

    def fake_solar_return_datetime(*_args, **_kwargs):
        return datetime(2024, 1, 2, 12, 0)

    monkeypatch.setattr(multi_tech, "_run_chart_at_datetime", fake_run_chart_at_datetime)
    monkeypatch.setattr(multi_tech, "_compute_solar_return_datetime", fake_solar_return_datetime)

    payload = multi_tech.build_multitech_payload(natal, input_data, reference_dt=ref_dt)

    assert payload["natal"] == natal_copy
    assert "meta" in payload
    assert "transits" in payload
    assert "solarReturn" in payload
    assert "progressions" in payload
    assert payload["progressions"]["method"] == "secondary_progression_day_for_year"
    assert payload["solarReturn"]["reference_date"]
    assert payload["transits"]["metadatos"]["technique"] == "transits"
