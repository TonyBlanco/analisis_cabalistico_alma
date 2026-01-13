from backend.core import settings as _orig
# Import all uppercase settings into this module
for name in dir(_orig):
    if name.isupper():
        globals()[name] = getattr(_orig, name)
# Filter out problematic symbolic.* apps that require non-identifier labels
INSTALLED_APPS = [a for a in INSTALLED_APPS if not (isinstance(a, str) and a.startswith('symbolic.'))]
