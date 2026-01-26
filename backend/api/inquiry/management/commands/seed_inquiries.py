"""
Management command to seed InquiryDefinitions from JSON file.

Usage:
    python manage.py seed_inquiries
    python manage.py seed_inquiries --clear  # Clear existing before seeding
"""

import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from api.inquiry.models import InquiryDefinition


class Command(BaseCommand):
    help = 'Seed InquiryDefinitions from JSON file'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing definitions before seeding',
        )
        parser.add_argument(
            '--file',
            type=str,
            default='docs/INQUIRY_DEFINITIONS_COMPLETE.json',
            help='Path to JSON file (relative to project root)',
        )
    
    def handle(self, *args, **options):
        # Find the JSON file
        base_dir = settings.BASE_DIR.parent  # Go up from backend/
        json_path = os.path.join(base_dir, options['file'])
        
        if not os.path.exists(json_path):
            self.stderr.write(
                self.style.ERROR(f'JSON file not found: {json_path}')
            )
            return
        
        # Clear existing if requested
        if options['clear']:
            deleted_count = InquiryDefinition.objects.all().delete()[0]
            self.stdout.write(
                self.style.WARNING(f'Deleted {deleted_count} existing definitions')
            )
        
        # Load JSON
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Handle both list format and dict with 'inquiries' key
        all_inquiries = []
        if isinstance(data, dict):
            inquiries_dict = data.get('inquiries', {})
            if isinstance(inquiries_dict, dict):
                # Flatten all module inquiries into single list
                for module_name, module_inquiries in inquiries_dict.items():
                    all_inquiries.extend(module_inquiries)
            else:
                all_inquiries = inquiries_dict
        else:
            all_inquiries = data
        
        created_count = 0
        updated_count = 0
        error_count = 0
        
        for inquiry_data in all_inquiries:
            code = None
            try:
                code = inquiry_data.pop('code', None)
                if not code:
                    self.stderr.write(
                        self.style.ERROR(f'Inquiry without code: {inquiry_data}')
                    )
                    error_count += 1
                    continue
                
                # Map JSON fields to model fields
                model_data = self._map_fields(inquiry_data)
                
                obj, created = InquiryDefinition.objects.update_or_create(
                    code=code,
                    defaults=model_data
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(f'  [CREATED]: {code}')
                else:
                    updated_count += 1
                    self.stdout.write(f'  [UPDATED]: {code}')
                    
            except Exception as e:
                error_count += 1
                error_msg = f'Error processing {code if code else "unknown"}: {str(e)}'
                self.stderr.write(self.style.ERROR(error_msg))
        
        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS(f'Seeding completed:'))
        self.stdout.write(f'  Created: {created_count}')
        self.stdout.write(f'  Updated: {updated_count}')
        self.stdout.write(f'  Errors:  {error_count}')
        self.stdout.write(f'  Total:   {created_count + updated_count}')
        self.stdout.write(self.style.SUCCESS('=' * 50))
    
    def _map_fields(self, data):
        """Map JSON structure to model fields."""
        return {
            'source_module': data.get('source_module', ''),
            'priority': data.get('priority', 'important'),
            'category': data.get('category', ''),
            'question_type': data.get('question_type', 'text_short'),
            'question_text': data.get('question_text', ''),
            'question_text_short': data.get('question_text_short', ''),
            'help_text': data.get('help_text', ''),
            'placeholder': data.get('placeholder', ''),
            'choices': data.get('choices'),
            'scale_labels': data.get('scale_labels'),
            'validation': data.get('validation'),
            'trigger_condition': data.get('trigger_condition'),
            'valid_for_days': data.get('valid_for_days', 90),
            'follow_up': data.get('follow_up'),
            'dynamic': data.get('dynamic', False),
            'applies_per': data.get('applies_per', ''),
            'sensitive': data.get('sensitive', False),
            'opt_out_visible': data.get('opt_out_visible', True),
            'is_active': True,
        }
