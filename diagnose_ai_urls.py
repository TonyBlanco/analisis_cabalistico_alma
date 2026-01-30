#!/usr/bin/env python
"""Diagnose AI Engine URL registration."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.urls import get_resolver, URLPattern, URLResolver

def print_urls(urlpatterns, prefix=''):
    """Recursively print all URLs."""
    for pattern in urlpatterns:
        if isinstance(pattern, URLPattern):
            route = str(pattern.pattern)
            full_route = prefix + route
            if 'ai-engine' in full_route or 'ai_engine' in str(pattern.callback):
                print(f"  ✅ {full_route} → {pattern.callback}")
        elif isinstance(pattern, URLResolver):
            new_prefix = prefix + str(pattern.pattern)
            print_urls(pattern.url_patterns, new_prefix)

print("\n" + "="*60)
print("AI Engine URL Registration Diagnosis")
print("="*60)

try:
    resolver = get_resolver()
    print("\n🔍 Searching for ai-engine URLs...\n")
    print_urls(resolver.url_patterns, prefix='')
    
    print("\n" + "="*60)
    print("✅ URL diagnosis complete")
    print("="*60 + "\n")
    
except Exception as e:
    print(f"\n❌ Error: {e}\n")
    import traceback
    traceback.print_exc()
