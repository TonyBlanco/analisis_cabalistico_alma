"""
Script to import MCMI-4-Mystic questions from JSON files into database.

Usage:
cd backend
python scripts/import_mcmi4_mystic_questions.py
"""

import os
import sys
import json
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.mcmi4_models import MCMI4MysticQuestionBank, DimensionConfig

# Path to JSON files
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

JSON_FILES = [
    'mcmi4_mystic_questions_atzilut.json',
    'mcmi4_mystic_questions_briah.json',
    'mcmi4_mystic_questions_yetzirah.json',
    'mcmi4_mystic_questions_assiah.json',
]


def load_json_file(filename):
    """Load and parse JSON file."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def import_questions_from_world(world_data):
    """Import all questions from a single world JSON."""
    if not world_data:
        return 0, 0
    
    metadata = world_data.get('metadata', {})
    world = metadata.get('world', 'unknown')
    dimensions = world_data.get('dimensions', {})
    
    questions_created = 0
    questions_updated = 0
    dimensions_created = 0
    
    print(f"\n{'='*60}")
    print(f"Importing {metadata.get('world_name', world.upper())}")
    print(f"{'='*60}")
    
    for dim_key, dim_data in dimensions.items():
        dimension_id = dim_data.get('dimension_id')
        
        # Create/update dimension config
        dim_config, created = DimensionConfig.objects.update_or_create(
            dimension_id=dimension_id,
            defaults={
                'world': world,
                'name': dim_data.get('name', dim_key),
                'sefirah': dim_data.get('sefirah', 'Multiple'),
                'description': dim_data.get('description', ''),
                'items_required': dim_data.get('items_required', 7),
            }
        )
        
        if created:
            dimensions_created += 1
            print(f"  ✅ Created dimension: {dim_config.name}")
        
        # Import questions for this dimension
        questions = dim_data.get('questions', [])
        for q in questions:
            question_id = q.get('id')
            
            question, created = MCMI4MysticQuestionBank.objects.update_or_create(
                question_id=question_id,
                defaults={
                    'world': world,
                    'dimension_id': dimension_id,
                    'sefirah': dim_data.get('sefirah', 'Multiple'),
                    'text_es': q.get('text', ''),
                    'text_en': q.get('text_en', ''),
                    'reverse_scored': q.get('reverse_scored', False),
                    'weight': q.get('weight', 1.0),
                    'is_active': True,
                }
            )
            
            if created:
                questions_created += 1
            else:
                questions_updated += 1
    
    print(f"  📊 Dimensions: {dimensions_created} created")
    print(f"  📝 Questions: {questions_created} created, {questions_updated} updated")
    
    return questions_created, questions_updated


def main():
    """Main import process."""
    print("\n🔄 Starting MCMI-4-Mystic Question Bank Import...")
    
    total_created = 0
    total_updated = 0
    
    for json_file in JSON_FILES:
        world_data = load_json_file(json_file)
        if world_data:
            created, updated = import_questions_from_world(world_data)
            total_created += created
            total_updated += updated
    
    print(f"\n{'='*60}")
    print(f"✅ Import Complete!")
    print(f"{'='*60}")
    print(f"Total Questions Created: {total_created}")
    print(f"Total Questions Updated: {total_updated}")
    print(f"Total in Database: {MCMI4MysticQuestionBank.objects.count()}")
    print(f"Total Dimensions: {DimensionConfig.objects.count()}")
    
    # Show summary by world
    print(f"\n📊 Summary by World:")
    for world_choice in ['atzilut', 'briah', 'yetzirah', 'assiah']:
        count = MCMI4MysticQuestionBank.objects.filter(world=world_choice).count()
        print(f"  {world_choice.capitalize()}: {count} questions")


if __name__ == '__main__':
    main()
