"""Quick inspection of patient data."""
from django.contrib.auth import get_user_model
from api.models import Patient
from api.test_models import TestResult, Assignment

User = get_user_model()

print("=== ALL PATIENTS ===")
for p in Patient.objects.all()[:10]:
    print(f"ID {p.id}: {p.full_name} (therapist: {p.therapist.username}, user_id: {p.user_id})")

# Check patient by user_id 18 (might be user_id, not patient_id)
print("\n=== USER ID 18 ===")
user18 = User.objects.filter(id=18).first()
if user18:
    print(f"User: {user18.username}")
    print(f"Profile type: {user18.profile.user_type}")
    
    # Find patient record
    patient = Patient.objects.filter(user_id=18).first()
    if patient:
        print(f"Patient record ID: {patient.id}")
        print(f"Patient name: {patient.full_name}")
        
        print("\n=== TEST RESULTS ===")
        trs = TestResult.objects.filter(patient=patient)
        print(f"Linked to patient: {trs.count()}")
        
        orphans = TestResult.objects.filter(user=user18, patient__isnull=True)
        print(f"Orphan (no patient link): {orphans.count()}")
        
        print("\n=== ASSIGNMENTS ===")
        assigns = Assignment.objects.filter(clinical_profile=patient)
        print(f"Total: {assigns.count()}")
        
        print("\n=== TOTAL CLEANUP SCOPE ===")
        total = trs.count() + orphans.count() + assigns.count()
        print(f"Total items: {total}")
    else:
        print("No Patient record for user 18")
else:
    print("User 18 not found")
