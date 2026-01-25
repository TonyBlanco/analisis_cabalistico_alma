"""
Quick test script for Lunar Return calculation
Run from backend/: python test_lunar_return_quick.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from datetime import datetime
from decimal import Decimal
from astrology.engine.lunar_return import LunarReturnEngine

def test_lunar_return():
    """Quick test of lunar return calculation"""
    print("=" * 60)
    print("LUNAR RETURN QUICK TEST")
    print("=" * 60)
    
    engine = LunarReturnEngine()
    
    # Test data
    birth_datetime = datetime(1990, 5, 15, 10, 30)
    latitude = Decimal('40.7128')
    longitude = Decimal('-74.0060')
    target_month = "2026-01"
    patient_id = 999  # Test patient
    
    print(f"\nBirth: {birth_datetime}")
    print(f"Location: {latitude}, {longitude}")
    print(f"Target Month: {target_month}")
    
    try:
        print("\n⏳ Calculating lunar return (may take 10-20 seconds)...")
        result = engine.calculate_lunar_return(
            patient_id=patient_id,
            birth_datetime=birth_datetime,
            latitude=latitude,
            longitude=longitude,
            target_month=target_month
        )
        
        print("\n✅ Calculation successful!")
        print("=" * 60)
        print(f"Return DateTime: {result['return_datetime']}")
        print(f"Natal Moon Position: {result['lunar_position']:.4f}°")
        print(f"Return Moon Position: {result['return_lunar_position']:.4f}°")
        print(f"Precision: {result['precision']:.6f}° ({result['precision'] * 60:.2f} arcminutes)")
        print(f"Chart Planets: {len(result['chart'].get('planets', []))} found")
        print("=" * 60)
        
        # Verify precision
        if result['precision'] < 1.0:
            print("✅ Precision test PASSED (< 1°)")
        else:
            print(f"⚠️ Precision test WARNING ({result['precision']:.4f}° >= 1°)")
            
        # Verify month
        return_dt = datetime.fromisoformat(result['return_datetime'])
        if return_dt.month == 1 and return_dt.year == 2026:
            print("✅ Month test PASSED")
        else:
            print(f"⚠️ Month test FAILED (got {return_dt.year}-{return_dt.month:02d})")
            
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_lunar_return()
    sys.exit(0 if success else 1)
