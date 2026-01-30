#!/usr/bin/env python
"""Check SHA workspaces and test results."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from swm.sha.models import WorkspaceInstance
from api.test_models import TestResult

print("\n" + "="*60)
print("SHA Workspaces Analysis")
print("="*60 + "\n")

workspaces = WorkspaceInstance.objects.all().order_by('-created_at')

if not workspaces:
    print("❌ No SHA workspaces found")
else:
    for ws in workspaces:
        print(f"Workspace: {ws.id}")
        print(f"  Subject: {ws.subject_user.username if ws.subject_user else 'None'}")
        print(f"  Created by: {ws.creator_user.username if ws.creator_user else 'None'}")
        
        # Find related test results
        artifacts = ws.artifacts.all()
        print(f"  Artifacts: {artifacts.count()}")
        
        for artifact in artifacts:
            if artifact.artifact_type == 'test_result':
                test_result_id = artifact.data.get('test_result_id')
                if test_result_id:
                    try:
                        test_result = TestResult.objects.get(pk=test_result_id)
                        print(f"    ✅ Test Result #{test_result_id} EXISTS")
                    except TestResult.DoesNotExist:
                        print(f"    ❌ Test Result #{test_result_id} NOT FOUND")
        print()

print("="*60 + "\n")
