"""
Tests for Lunar Return calculations
"""

import unittest
from datetime import datetime
from decimal import Decimal

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False

from astrology.engine.lunar_return import LunarReturnEngine


@unittest.skipUnless(SWISSEPH_AVAILABLE, "Swiss Ephemeris not available")
class TestLunarReturn(unittest.TestCase):
    """Test cases for Lunar Return calculations"""

    def setUp(self):
        """Set up test data"""
        self.engine = LunarReturnEngine()
        
        # Test birth data (arbitrary example)
        self.birth_datetime = datetime(1990, 5, 15, 10, 30)
        self.latitude = Decimal('40.7128')  # New York
        self.longitude = Decimal('-74.0060')
        self.patient_id = 1

    def test_lunar_return_calculation(self):
        """Test basic lunar return calculation"""
        target_month = "2026-01"
        
        result = self.engine.calculate_lunar_return(
            patient_id=self.patient_id,
            birth_datetime=self.birth_datetime,
            latitude=self.latitude,
            longitude=self.longitude,
            target_month=target_month
        )
        
        # Assertions
        self.assertIn('return_datetime', result)
        self.assertIn('lunar_position', result)
        self.assertIn('return_lunar_position', result)
        self.assertIn('chart', result)
        self.assertIn('precision', result)
        self.assertEqual(result['target_month'], target_month)
        
        # Verify return is within target month
        return_dt = datetime.fromisoformat(result['return_datetime'])
        self.assertEqual(return_dt.year, 2026)
        self.assertEqual(return_dt.month, 1)
        
        # Verify precision is reasonable (< 1 degree)
        self.assertLess(result['precision'], 1.0)

    def test_angular_difference(self):
        """Test angular difference calculation"""
        # Test normal case
        diff1 = self.engine._angular_difference(45.0, 30.0)
        self.assertEqual(diff1, 15.0)
        
        # Test wrap-around case
        diff2 = self.engine._angular_difference(10.0, 350.0)
        self.assertEqual(diff2, 20.0)
        
        # Test exact match
        diff3 = self.engine._angular_difference(180.0, 180.0)
        self.assertEqual(diff3, 0.0)
        
        # Test 180-degree case
        diff4 = self.engine._angular_difference(0.0, 180.0)
        self.assertEqual(diff4, 180.0)

    def test_invalid_target_month(self):
        """Test handling of invalid target month format"""
        with self.assertRaises(ValueError):
            self.engine.calculate_lunar_return(
                patient_id=self.patient_id,
                birth_datetime=self.birth_datetime,
                latitude=self.latitude,
                longitude=self.longitude,
                target_month="2026-13"  # Invalid month
            )

    def test_coarse_search(self):
        """Test coarse search returns reasonable result"""
        target_moon_longitude = 120.0
        start_date = datetime(2026, 1, 1)
        end_date = datetime(2026, 2, 1)
        
        closest_dt, closest_diff = self.engine._coarse_search(
            target_moon_longitude,
            start_date,
            end_date
        )
        
        # Should find a date
        self.assertIsNotNone(closest_dt)
        
        # Should be within search range
        self.assertGreaterEqual(closest_dt, start_date)
        self.assertLess(closest_dt, end_date)
        
        # Difference should be less than Moon's daily movement (~13°)
        self.assertLess(closest_diff, 13.0)


if __name__ == '__main__':
    unittest.main()
