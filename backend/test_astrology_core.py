#!/usr/bin/env python
"""
Astrology Core Test Script
Test the natal chart calculation engine with sample data
"""

import os
import sys
import django
from datetime import datetime
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from astrology.services.chart_service import ChartService
from astrology.domain.chart import NatalChart


def test_natal_chart_calculation():
    """Test natal chart calculation with sample data"""
    print("🪐 Testing Astrology Core - Natal Chart Calculation")
    print("=" * 60)

    # Sample birth data (famous person for testing)
    patient_id = 1  # Use existing patient ID
    birth_datetime = datetime(1985, 6, 15, 14, 30, 0)  # Example birth date
    latitude = Decimal('40.7128')  # New York City latitude
    longitude = Decimal('-74.0060')  # New York City longitude
    timezone = 'America/New_York'

    print(f"📅 Birth Date/Time: {birth_datetime}")
    print(f"📍 Location: {latitude}°N, {longitude}°W")
    print(f"🕐 Timezone: {timezone}")
    print()

    try:
        # Create chart service
        chart_service = ChartService()

        # Calculate natal chart (without saving to database for now)
        print("🔮 Calculating natal chart...")
        chart = chart_service.engine.calculate_natal_chart(
            patient_id=patient_id,
            birth_datetime=birth_datetime,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            house_system='P',  # Placidus
            zodiac_type='T',   # Tropical
            include_minor_aspects=False
        )

        # Display results
        print("✅ Natal chart calculated successfully!")
        print()

        print("🌟 PLANET POSITIONS:")
        print("-" * 40)
        for planet in chart.planets:
            retrograde = " (R)" if planet.retrograde else ""
            print(f"  {planet.planet_name:8}: {planet.longitude:>8.2f}° in {planet.sign:8} (House {planet.house}){retrograde}")

        print()
        print("🏠 HOUSE CUSPS:")
        print("-" * 40)
        for house in chart.houses:
            print(f"  House {house.house_number}: {house.longitude:>8.2f}° in {house.sign}")

        print()
        print("🔗 MAJOR ASPECTS:")
        print("-" * 40)
        for aspect in chart.aspects:
            applying = "applying" if aspect.applying else "separating"
            print(f"  {aspect.planet1_id} {aspect.aspect_type} {aspect.planet2_id}: {aspect.angle:.1f}° (orb: {aspect.orb:.1f}°, {applying})")

        print()
        print("📊 SUMMARY:")
        print(f"  - Planets calculated: {len(chart.planets)}")
        print(f"  - Houses calculated: {len(chart.houses)}")
        print(f"  - Aspects found: {len(chart.aspects)}")
        print(f"  - House system: {chart.house_system}")
        print(f"  - Zodiac type: {chart.zodiac_type}")

        return True

    except Exception as e:
        print(f"❌ Error calculating natal chart: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_chart_persistence():
    """Test chart persistence operations"""
    print("\n💾 Testing Chart Persistence")
    print("=" * 60)

    try:
        chart_service = ChartService()

        # Test with existing patient
        patient_id = 1  # Use existing patient

        # Create a test chart
        test_chart = NatalChart(
            patient_id=patient_id,
            birth_datetime=datetime(2000, 1, 1, 12, 0, 0),
            latitude=Decimal('0.0'),
            longitude=Decimal('0.0'),
            timezone='UTC',
            house_system='P',
            zodiac_type='T',
            planets=[],
            houses=[],
            aspects=[]
        )

        # Save chart
        print("💾 Saving test chart...")
        chart_service.persistence.save_natal_chart(test_chart)

        # Retrieve chart
        print("📖 Retrieving test chart...")
        retrieved_chart = chart_service.persistence.get_natal_chart(patient_id)

        if retrieved_chart:
            print("✅ Chart persistence works correctly!")
            print(f"  - Patient ID: {retrieved_chart.patient_id}")
            print(f"  - Birth date: {retrieved_chart.birth_datetime}")

            # Clean up
            print("🗑️  Deleting test chart...")
            chart_service.persistence.delete_natal_chart(patient_id)
            print("✅ Test chart deleted successfully!")

            return True
        else:
            print("❌ Failed to retrieve saved chart")
            return False

    except Exception as e:
        print(f"❌ Error testing persistence: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 Starting Astrology Core Tests")
    print("=" * 60)

    # Test 1: Natal chart calculation
    success1 = test_natal_chart_calculation()

    # Test 2: Chart persistence
    success2 = test_chart_persistence()

    print("\n" + "=" * 60)
    if success1 and success2:
        print("🎉 ALL TESTS PASSED! Astrology Core is working correctly.")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED. Please check the errors above.")
        sys.exit(1)