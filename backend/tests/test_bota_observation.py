from __future__ import annotations

from django.test import SimpleTestCase

from symbolic.tarot.bota_observation import build_bota_observation


class BotaObservationTests(SimpleTestCase):
    def test_bota_observation_is_spanish_and_non_empty(self):
        text = build_bota_observation("the-fool", reversed_flag=False)
        self.assertIsInstance(text, str)
        self.assertTrue(text.strip())
        self.assertIn("Letra:", text)
        self.assertIn("Sendero:", text)
        self.assertIn("Sefirot:", text)
        self.assertIn("Elemento:", text)
        self.assertNotIn("The ", text)
        self.assertNotIn("mock", text.lower())

    def test_bota_observation_uses_spanish_element_mapping(self):
        text = build_bota_observation("the-fool", reversed_flag=False)
        self.assertIn("Elemento: Aire", text)
        self.assertNotIn("Elemento: air", text)

    def test_bota_identity_mapping_from_common_keys(self):
        # Spanish name
        text_es = build_bota_observation("El Loco", reversed_flag=False)
        self.assertNotIn("N/A", text_es)

        # English card name (as may arrive in some payloads)
        text_en = build_bota_observation("The High Priestess", reversed_flag=False)
        self.assertNotIn("N/A", text_en)

        # Filename / slug formats used by assets or UI
        text_file = build_bota_observation("00_el_loco.png", reversed_flag=False)
        self.assertNotIn("N/A", text_file)

        text_slug = build_bota_observation("02_la_sacerdotisa", reversed_flag=False)
        self.assertNotIn("N/A", text_slug)
