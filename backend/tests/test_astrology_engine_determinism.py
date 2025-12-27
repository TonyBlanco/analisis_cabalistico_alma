import os
import unittest
from datetime import datetime
from decimal import Decimal

try:
    from astrology.engine.astro_engine_adapter import compute_chart, AstroEngineConfig, EphemerisNotReadyError
    from astrology.engine.natal_chart_engine import SWISSEPH_AVAILABLE
    ASTROLOGY_CORE_AVAILABLE = True
except ImportError:
    ASTROLOGY_CORE_AVAILABLE = False
    SWISSEPH_AVAILABLE = False


class AstrologyEngineDeterminismTest(unittest.TestCase):
    @unittest.skipUnless(ASTROLOGY_CORE_AVAILABLE and SWISSEPH_AVAILABLE, "Astrology core or Swiss Ephemeris not available")
    def test_repeatable_output_same_input(self):
        # Require ephemeris path configured; if not present, skip with clear message
        if not os.getenv("SWISSEPH_PATH"):
            self.skipTest("SWISSEPH_PATH not set; ephemeris data required for deterministic test")

        birth_dt = datetime(1959, 8, 1, 20, 0)  # Example fixed case (Havana sample in docs)
        lat = Decimal("23.1136")
        lng = Decimal("-82.3666")

        cfg = AstroEngineConfig(house_system="P", zodiac_type="T", draconic=False)

        chart1 = compute_chart(birth_dt, lat, lng, timezone="America/Havana", config=cfg)
        chart2 = compute_chart(birth_dt, lat, lng, timezone="America/Havana", config=cfg)

        # Planets
        self.assertEqual(len(chart1.planets), len(chart2.planets))
        for p1, p2 in zip(chart1.planets, chart2.planets):
            self.assertEqual(p1.planet_name, p2.planet_name)
            self.assertEqual(p1.longitude, p2.longitude)
            self.assertEqual(p1.latitude, p2.latitude)
            self.assertEqual(p1.sign, p2.sign)
            self.assertEqual(p1.sign_degree, p2.sign_degree)

        # Houses
        self.assertEqual(len(chart1.houses), len(chart2.houses))
        for h1, h2 in zip(chart1.houses, chart2.houses):
            self.assertEqual(h1.house_number, h2.house_number)
            self.assertEqual(h1.longitude, h2.longitude)
            self.assertEqual(h1.sign, h2.sign)
            self.assertEqual(h1.sign_degree, h2.sign_degree)

        # Aspects
        self.assertEqual(len(chart1.aspects), len(chart2.aspects))
        for a1, a2 in zip(chart1.aspects, chart2.aspects):
            self.assertEqual((a1.planet1_id, a1.planet2_id, a1.aspect_type, a1.orb), (a2.planet1_id, a2.planet2_id, a2.aspect_type, a2.orb))


if __name__ == "__main__":
    unittest.main()
