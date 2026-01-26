# Tests for Solar Arc Directions
# pytest test_solar_arc.py

import pytest
from datetime import datetime
from backend.astrology.engine.solar_arc import SolarArcEngine


class TestSolarArcEngine:
    """Tests for Solar Arc calculations"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.engine = SolarArcEngine()
        
        # Standard birth data for testing
        self.birth_data = {
            'year': 1990,
            'month': 1,
            'day': 1,
            'hour': 12,
            'minute': 0
        }
    
    def test_solar_arc_calculation_basic(self):
        """Test basic Solar Arc calculation"""
        result = self.engine.calculate_solar_arc(
            birth_data=self.birth_data,
            target_date='2025-01-01'
        )
        
        # Basic structure checks
        assert 'arc_degrees' in result
        assert 'target_date' in result
        assert 'planets' in result
        assert 'method' in result
        assert result['method'] == 'solar_arc_directions'
        
        # Arc should be positive and reasonable
        assert 0 <= result['arc_degrees'] <= 360
        
        # Should have data for all planets
        expected_planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 
                          'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
        for planet in expected_planets:
            assert planet in result['planets']
    
    def test_solar_arc_planet_structure(self):
        """Test that each planet has correct data structure"""
        result = self.engine.calculate_solar_arc(
            birth_data=self.birth_data,
            target_date='2025-01-01'
        )
        
        for planet_name, planet_data in result['planets'].items():
            # Each planet should have these fields
            assert 'longitude' in planet_data
            assert 'natal_longitude' in planet_data
            assert 'arc_applied' in planet_data
            assert 'sign' in planet_data
            assert 'sign_degree' in planet_data
            
            # Longitude should be within valid range
            assert 0 <= planet_data['longitude'] < 360
            assert 0 <= planet_data['natal_longitude'] < 360
            
            # Sign degree should be 0-30
            assert 0 <= planet_data['sign_degree'] < 30
            
            # Arc applied should match the main arc
            assert abs(planet_data['arc_applied'] - result['arc_degrees']) < 0.01
    
    def test_solar_arc_one_year_progress(self):
        """Test that Solar Arc for 1 year is approximately 1 degree"""
        result = self.engine.calculate_solar_arc(
            birth_data=self.birth_data,
            target_date='1991-01-01'
        )
        
        # Solar Arc should be approximately 1 degree per year
        # Allow for some variation (0.9 to 1.1 degrees)
        assert 0.9 <= result['arc_degrees'] <= 1.1
    
    def test_solar_arc_thirty_five_years(self):
        """Test Solar Arc for 35 years (typical age)"""
        result = self.engine.calculate_solar_arc(
            birth_data=self.birth_data,
            target_date='2025-01-01'
        )
        
        # 35 years should give approximately 35 degrees
        # Allow for reasonable variation (34 to 36 degrees)
        assert 34 <= result['arc_degrees'] <= 36
    
    def test_solar_arc_target_date_format(self):
        """Test that target_date is properly returned"""
        target = '2025-06-15'
        result = self.engine.calculate_solar_arc(
            birth_data=self.birth_data,
            target_date=target
        )
        
        assert result['target_date'] == target
    
    def test_zodiac_sign_calculation(self):
        """Test zodiac sign determination"""
        # Test various longitudes
        test_cases = [
            (0, 'aries'),
            (30, 'taurus'),
            (60, 'gemini'),
            (90, 'cancer'),
            (120, 'leo'),
            (150, 'virgo'),
            (180, 'libra'),
            (210, 'scorpio'),
            (240, 'sagittarius'),
            (270, 'capricorn'),
            (300, 'aquarius'),
            (330, 'pisces')
        ]
        
        for longitude, expected_sign in test_cases:
            sign, degree = self.engine._get_zodiac_sign(longitude)
            assert sign == expected_sign
            assert degree == 0.0
    
    def test_solar_arc_different_birth_times(self):
        """Test that different birth times produce different results"""
        birth_morning = {
            'year': 1990,
            'month': 1,
            'day': 1,
            'hour': 6,
            'minute': 0
        }
        
        birth_evening = {
            'year': 1990,
            'month': 1,
            'day': 1,
            'hour': 18,
            'minute': 0
        }
        
        result_morning = self.engine.calculate_solar_arc(birth_morning, '2025-01-01')
        result_evening = self.engine.calculate_solar_arc(birth_evening, '2025-01-01')
        
        # Results should be different but close (same day, different times)
        assert result_morning['arc_degrees'] != result_evening['arc_degrees']
        assert abs(result_morning['arc_degrees'] - result_evening['arc_degrees']) < 1.0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
