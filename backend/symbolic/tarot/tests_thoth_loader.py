from django.test import TestCase

from symbolic.tarot.loaders.thoth_loader import get_thoth_card, thoth_card_count


class ThothDatasetLoaderTests(TestCase):
    def test_thoth_dataset_loads_all_cards(self) -> None:
        self.assertEqual(thoth_card_count(), 78)

    def test_get_thoth_card_resolves_from_mock_id(self) -> None:
        card = get_thoth_card("thoth_00_fool")
        self.assertIsInstance(card, dict)
        self.assertEqual(card.get("id"), "the-fool")
        self.assertEqual(card.get("nameSpanish"), "El Loco")

