"""
Cleanup script: Mark sealed workspaces with 0 cards as CANCELLED.

This fixes legacy data where workspaces were sealed without content validation.
"""
import os
import django
import sys
from django.utils import timezone

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from swm.tarot.models import WorkspaceInstance, WorkspaceStatus


def main():
    # Find sealed workspaces with 0 cards
    invalid_workspaces = WorkspaceInstance.objects.filter(
        status=WorkspaceStatus.SEALED,
        total_cards=0
    )
    
    count = invalid_workspaces.count()
    
    if count == 0:
        print("✅ No invalid sealed workspaces found.")
        return
    
    print(f"🔍 Found {count} sealed workspace(s) with 0 cards:")
    print()
    
    for ws in invalid_workspaces:
        print(f"  ID: {ws.id}")
        print(f"  Subject: {ws.subject_user}")
        print(f"  Spread: {ws.get_spread_type_display()}")
        print(f"  System: {ws.get_tarot_system_display()}")
        print(f"  Created: {ws.created_at.strftime('%Y-%m-%d %H:%M')}")
        print(f"  Sealed: {ws.sealed_at.strftime('%Y-%m-%d %H:%M') if ws.sealed_at else 'N/A'}")
        print(f"  Total cards: {ws.total_cards}")
        print()
    
    response = input(f"Mark these {count} workspace(s) as CANCELLED? (yes/no): ").strip().lower()
    
    if response == 'yes':
        updated = invalid_workspaces.update(
            status=WorkspaceStatus.CANCELLED,
            updated_at=timezone.now()
        )
        print(f"✅ Updated {updated} workspace(s) to CANCELLED status.")
        print("These will no longer appear as 'Sellado' in the history panel.")
    else:
        print("❌ Operation cancelled. No changes made.")


if __name__ == '__main__':
    main()
