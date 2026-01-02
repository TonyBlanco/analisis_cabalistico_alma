from __future__ import annotations

from symbolic.tarot.bota_observation import build_bota_observation


def test_bota_observation_is_spanish_and_non_empty():
    text = build_bota_observation("the-fool", reversed_flag=False)
    assert isinstance(text, str)
    assert text.strip()
    assert "Letra hebraica" in text
    assert "Sendero" in text
    assert "Sefirot" in text
    assert "Elemento" in text
    assert "Orientación" in text
    assert "The " not in text
    assert "mock" not in text.lower()


def test_bota_observation_uses_spanish_element_mapping():
    text = build_bota_observation("the-fool", reversed_flag=False)
    assert "Aire" in text
    assert "air" not in text.lower()

