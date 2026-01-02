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
