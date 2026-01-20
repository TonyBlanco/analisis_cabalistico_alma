"""
Script para crear migración de MCMI-4-Mystic models.
Ejecutar: python create_mcmi4_migration.py
"""

import os
import sys
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import call_command

# Import models to ensure they're registered
from api.mcmi4_models import MCMI4MysticQuestionBank, MCMI4MysticTestInstance, DimensionConfig

print("Creating migration for MCMI-4-Mystic models...")
call_command('makemigrations', 'api', '--name', 'mcmi4_mystic_models')
print("Done!")
