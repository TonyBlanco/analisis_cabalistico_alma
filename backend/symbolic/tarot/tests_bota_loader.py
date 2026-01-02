from django.test import TestCase

from symbolic.tarot.loaders.bota_loader import bota_card_count, get_bota_card


class BotaDatasetLoaderTests(TestCase):
    def test_bota_dataset_loads_all_cards(self) -> None:
        self.assertEqual(bota_card_count(), 78)

    def test_get_bota_card_resolves_from_mock_id(self) -> None:
        card = get_bota_card("bota_00_fool")
        self.assertIsInstance(card, dict)
        self.assertEqual(card.get("id"), "the-fool")
        self.assertEqual(card.get("nameSpanish"), "El Loco")

