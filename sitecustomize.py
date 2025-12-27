"""
Site customization to prefer vendored Swiss Ephemeris.

Adds `backend/vendor` to sys.path early so `import swisseph` loads the vendored
extension module when available.

This file does not alter application logic; it only adjusts module resolution.
"""
import sys
from pathlib import Path

VENDOR_PATH = Path(__file__).resolve().parent / "backend" / "vendor"
if VENDOR_PATH.exists():
    vendor_str = str(VENDOR_PATH)
    if vendor_str not in sys.path:
        sys.path.insert(0, vendor_str)
