"""
Management command to seed MCMI-4-Mystic question bank from JSON files.

Usage:
    python manage.py seed_mcmi4_mystic [--reset]

Options:
    --reset: Clear existing questions before seeding
"""

import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from api.mcmi4_models import MCMI4MysticQuestionBank, DimensionConfig


class Command(BaseCommand):
    help = 'Load MCMI-4-Mystic questions from JSON files into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Clear existing questions before seeding',
        )

    def handle(self, *args, **options):
        reset = options.get('reset', False)

        if reset:
            self.stdout.write(self.style.WARNING('🗑️  Clearing existing question bank...'))
            MCMI4MysticQuestionBank.objects.all().delete()
            DimensionConfig.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✅ Cleared'))

        # JSON file paths
        data_dir = os.path.join(settings.BASE_DIR, 'data')
        worlds = ['atzilut', 'briah', 'yetzirah', 'assiah']

        total_questions = 0
        total_dimensions = 0

        for world in worlds:
            filename = f'mcmi4_mystic_questions_{world}.json'
            filepath = os.path.join(data_dir, filename)

            if not os.path.exists(filepath):
                self.stdout.write(self.style.ERROR(f'❌ File not found: {filepath}'))
                continue

            self.stdout.write(f'\n📂 Loading {world.upper()}...')

            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                metadata = data.get('metadata', {})
                dimensions = data.get('dimensions', {})

                self.stdout.write(f"  World: {metadata.get('world_name', world)}")
                self.stdout.write(f"  Dimensions: {len(dimensions)}")

                # Load dimensions and questions
                for dim_key, dim_data in dimensions.items():
                    dimension_id = dim_data.get('dimension_id')
                    sefirah = dim_data.get('sefirah', '').lower()
                    items_required = dim_data.get('items_required', 7)

                    # Create/update DimensionConfig
                    DimensionConfig.objects.update_or_create(
                        dimension_id=dimension_id,
                        defaults={
                            'world': world,
                            'name': dim_data.get('name', dim_key),
                            'sefirah': sefirah,
                            'description': dim_data.get('description', ''),
                            'items_required': items_required,
                        }
                    )
                    total_dimensions += 1

                    # Load questions for this dimension
                    questions = dim_data.get('questions', [])
                    for q in questions:
                        question_id = q.get('id')
                        if not question_id:
                            continue

                        MCMI4MysticQuestionBank.objects.update_or_create(
                            question_id=question_id,
                            defaults={
                                'world': world,
                                'dimension_id': dimension_id,
                                'sefirah': sefirah,
                                'text_es': q.get('text', ''),
                                'text_en': q.get('text_en', ''),
                                'reverse_scored': q.get('reverse_scored', False),
                                'weight': q.get('weight', 1.0),
                                'is_active': True,
                            }
                        )
                        total_questions += 1

                self.stdout.write(self.style.SUCCESS(f'  ✅ Loaded {len(dimensions)} dimensions with questions'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ Error loading {world}: {str(e)}'))
                continue

        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'🎉 SEEDING COMPLETE'))
        self.stdout.write(f'  Total Questions: {total_questions}')
        self.stdout.write(f'  Total Dimensions: {total_dimensions}')
        self.stdout.write(f'  Questions in DB: {MCMI4MysticQuestionBank.objects.count()}')
        self.stdout.write(f'  Dimensions in DB: {DimensionConfig.objects.count()}')
        self.stdout.write('='*60 + '\n')

        # Verification by world
        self.stdout.write('📊 Distribution by World:')
        for world in worlds:
            count = MCMI4MysticQuestionBank.objects.filter(world=world).count()
            self.stdout.write(f'  {world.capitalize()}: {count} questions')
