from django.test import SimpleTestCase

from astrology.config.astrology_settings import normalize_house_system, normalize_zodiac_type


class ChartCodesNormalizationTest(SimpleTestCase):
    def test_normalize_house_system_aliases(self):
        self.assertEqual(normalize_house_system('placidus'), 'P')
        self.assertEqual(normalize_house_system('P'), 'P')
        self.assertEqual(normalize_house_system(None), 'P')

    def test_normalize_zodiac_type_aliases(self):
        self.assertEqual(normalize_zodiac_type('tropical'), 'T')
        self.assertEqual(normalize_zodiac_type('T'), 'T')
        self.assertEqual(normalize_zodiac_type('sidereal'), 'S')
        self.assertEqual(normalize_zodiac_type(None), 'T')