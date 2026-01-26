# Tests for Composite Chart calculations
# pytest test_composite_chart.py

import pytest
from backend.astrology.engine.composite_chart import CompositeChartEngine


class TestCompositeChartEngine:
    """Tests for Composite Chart calculations"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.engine = CompositeChartEngine()
        
        # Standard birth data for person 1
        self.person1_data = {
            'year': 1990,
            'month': 1,
            'day': 1,
            'hour': 12,
            'minute': 0,
            'latitude': 40.4168,  # Madrid
            'longitude': -3.7038
        }
        
        # Standard birth data for person 2
        self.person2_data = {
            'year': 1992,
            'month': 6,
            'day': 15,
            'hour': 8,
            'minute': 30,
            'latitude': 41.3851,  # Barcelona
            'longitude': 2.1734
        }
    
    def test_composite_chart_basic(self):
        """Test basic Composite Chart calculation"""
        result = self.engine.calculate_composite_chart(
            person1_data=self.person1_data,
            person2_data=self.person2_data
        )
        
        # Basic structure checks
        assert 'planets' in result
        assert 'houses' in result
        assert 'ascendant' in result
        assert 'midheaven' in result
        assert 'composite_location' in result
        assert 'composite_datetime' in result
        assert 'method' in result
        assert result['method'] == 'composite_midpoints'
    
    def test_composite_planet_structure(self):
        """Test that each planet has correct data structure"""
        result = self.engine.calculate_composite_chart(
            person1_data=self.person1_data,
            person2_data=self.person2_data
        )
        
        expected_planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 
                          'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
        
        for planet_name in expected_planets:
            assert planet_name in result['planets']
            planet_data = result['planets'][planet_name]
            
            # Each planet should have these fields
            assert 'longitude' in planet_data
            assert 'person1_longitude' in planet_data
            assert 'person2_longitude' in planet_data
            assert 'sign' in planet_data
            assert 'sign_degree' in planet_data
            
            # Longitude should be within valid range
            assert 0 <= planet_data['longitude'] < 360
            assert 0 <= planet_data['person1_longitude'] < 360
            assert 0 <= planet_data['person2_longitude'] < 360
            
            # Sign degree should be 0-30
            assert 0 <= planet_data['sign_degree'] < 30
    
    def test_midpoint_calculation_normal(self):
        """Test midpoint calculation for normal cases"""
        # 30° and 60° should give 45°
        midpoint = self.engine._calculate_midpoint(30, 60)
        assert abs(midpoint - 45) < 0.01
        
        # 0° and 90° should give 45°
        midpoint = self.engine._calculate_midpoint(0, 90)
        assert abs(midpoint - 45) < 0.01
        
        # 100° and 200° should give 150°
        midpoint = self.engine._calculate_midpoint(100, 200)
        assert abs(midpoint - 150) < 0.01
    
    def test_midpoint_calculation_wraparound(self):
        """Test midpoint calculation with wrap-around cases"""
        # 350° and 10° should give 0° (or 360°), not 180°
        midpoint = self.engine._calculate_midpoint(350, 10)
        assert midpoint < 20 or midpoint > 340  # Around 0°
        
        # 10° and 350° should also give ~0°
        midpoint = self.engine._calculate_midpoint(10, 350)
        assert midpoint < 20 or midpoint > 340
        
        # 330° and 30° should give ~0°
        midpoint = self.engine._calculate_midpoint(330, 30)
        assert midpoint < 30 or midpoint > 330
    
    def test_composite_location(self):
        """Test that composite location is average of both persons"""
        result = self.engine.calculate_composite_chart(
            person1_data=self.person1_data,
            person2_data=self.person2_data
        )
        
        expected_lat = (self.person1_data['latitude'] + self.person2_data['latitude']) / 2
        expected_lon = (self.person1_data['longitude'] + self.person2_data['longitude']) / 2
        
        assert abs(result['composite_location']['latitude'] - expected_lat) < 0.01
        assert abs(result['composite_location']['longitude'] - expected_lon) < 0.01
    
    def test_houses_structure(self):
        """Test that houses have correct structure"""
        result = self.engine.calculate_composite_chart(
            person1_data=self.person1_data,
            person2_data=self.person2_data
        )
        
        # Should have 12 houses
        assert len(result['houses']) == 12
        
        for house in result['houses']:
            assert 'number' in house
            assert 'cusp_longitude' in house
            assert 'sign' in house
            assert 'sign_degree' in house
            assert 1 <= house['number'] <= 12
            assert 0 <= house['cusp_longitude'] < 360
    
    def test_ascendant_and_midheaven(self):
        """Test that ascendant and midheaven are valid"""
        result = self.engine.calculate_composite_chart(
            person1_data=self.person1_data,
            person2_data=self.person2_data
        )
        
        assert 0 <= result['ascendant'] < 360
        assert 0 <= result['midheaven'] < 360
    
    def test_composite_datetime_format(self):
        """Test that composite datetime is in ISO format"""
        result = self.engine.calculate_composite_chart(
            person1_data=self.person1_data,
            person2_data=self.person2_data
        )
        
        # Should be in ISO format
        assert 'T' in result['composite_datetime']
        assert '-' in result['composite_datetime']
    
    def test_zodiac_sign_calculation(self):
        """Test zodiac sign determination"""
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
    
    def test_same_person_composite(self):
        """Test composite with same birth data (edge case)"""
        result = self.engine.calculate_composite_chart(
            person1_data=self.person1_data,
            person2_data=self.person1_data
        )
        
        # Should still work, with midpoints equal to original positions
        assert 'planets' in result
        for planet_name, planet_data in result['planets'].items():
            # Midpoint of same position should equal the position
            assert abs(planet_data['longitude'] - planet_data['person1_longitude']) < 0.01


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
