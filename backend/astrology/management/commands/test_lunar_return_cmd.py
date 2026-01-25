"""
Test Lunar Return via Django management command
Run: python manage.py test_lunar_return_cmd
"""

from django.core.management.base import BaseCommand
from datetime import datetime
from decimal import Decimal
from astrology.engine.lunar_return import LunarReturnEngine


class Command(BaseCommand):
    help = 'Test Lunar Return calculation'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("LUNAR RETURN TEST")
        self.stdout.write("=" * 60)
        
        engine = LunarReturnEngine()
        
        # Test data
        birth_datetime = datetime(1990, 5, 15, 10, 30)
        latitude = Decimal('40.7128')
        longitude = Decimal('-74.0060')
        target_month = "2026-01"
        patient_id = 999
        
        self.stdout.write(f"\nBirth: {birth_datetime}")
        self.stdout.write(f"Location: {latitude}, {longitude}")
        self.stdout.write(f"Target Month: {target_month}")
        
        try:
            self.stdout.write("\n⏳ Calculating lunar return...")
            result = engine.calculate_lunar_return(
                patient_id=patient_id,
                birth_datetime=birth_datetime,
                latitude=latitude,
                longitude=longitude,
                target_month=target_month
            )
            
            self.stdout.write(self.style.SUCCESS("\n✅ Calculation successful!"))
            self.stdout.write("=" * 60)
            self.stdout.write(f"Return DateTime: {result['return_datetime']}")
            self.stdout.write(f"Natal Moon: {result['lunar_position']:.4f}°")
            self.stdout.write(f"Return Moon: {result['return_lunar_position']:.4f}°")
            self.stdout.write(f"Precision: {result['precision']:.6f}°")
            self.stdout.write("=" * 60)
            
            if result['precision'] < 1.0:
                self.stdout.write(self.style.SUCCESS("✅ Precision < 1°"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"\n❌ Error: {e}"))
            raise
