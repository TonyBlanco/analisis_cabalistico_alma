from django.contrib.auth.models import User
from django.test import TestCase

from .models import SymbolicReading
from .service import SymbolicReadingSaveContext, saveSymbolicReading


def _create_user(username: str) -> User:
    user = User.objects.create_user(username=username, password="pass12345")
    if hasattr(user, "profile"):
        user.profile.user_type = "therapist"
        user.profile.save(update_fields=["user_type"])
    return user


class SymbolicReadingPersistenceTests(TestCase):
    def setUp(self):
        self.therapist = _create_user("swm3_test_therapist")
        self.consultant = User.objects.create_user(username="swm3_test_consultant", password="pass12345")

        self.reading = {
            "id": "swm-v3-mock-1",
            "summary": "Lectura educativa mock.",
            "themes": ["t1"],
            "correspondences": ["c1"],
            "caution": "Lectura educativa (mock) - no es consejo ni diagnostico clinico.",
            "cards": [],
        }

    def test_no_store_does_not_persist(self):
        saved = saveSymbolicReading(
            reading=self.reading,
            consentMode=SymbolicReading.ConsentMode.NO_STORE,
            context=SymbolicReadingSaveContext(
                therapist=self.therapist,
                consultant=self.consultant,
                system_id="thoth",
                consent_version="swm-v3-phase-3-consent-v1",
                consent_accepted_at="2026-01-01T00:00:00Z",
            ),
        )
        self.assertIsNone(saved)
        self.assertEqual(SymbolicReading.objects.count(), 0)

    def test_store_anonymized_does_not_store_consultant(self):
        saved = saveSymbolicReading(
            reading=self.reading,
            consentMode=SymbolicReading.ConsentMode.STORE_ANONYMIZED,
            context=SymbolicReadingSaveContext(
                therapist=self.therapist,
                consultant=self.consultant,
                system_id="thoth",
                consent_version="swm-v3-phase-3-consent-v1",
                consent_accepted_at="2026-01-01T00:00:00Z",
            ),
        )
        self.assertIsNotNone(saved)
        saved = SymbolicReading.objects.get(id=saved.id)
        self.assertIsNone(saved.consultant_id)
        self.assertEqual(saved.consent_mode, SymbolicReading.ConsentMode.STORE_ANONYMIZED)
        self.assertEqual(saved.audit_trace.get("swm_version"), "v3")
        self.assertEqual(saved.audit_trace.get("phase"), "phase-3")
        self.assertEqual(saved.audit_trace.get("source"), "mock")

    def test_store_with_consent_stores_consultant(self):
        saved = saveSymbolicReading(
            reading=self.reading,
            consentMode=SymbolicReading.ConsentMode.STORE_WITH_CONSENT,
            context=SymbolicReadingSaveContext(
                therapist=self.therapist,
                consultant=self.consultant,
                system_id="thoth",
                consent_version="swm-v3-phase-3-consent-v1",
                consent_accepted_at="2026-01-01T00:00:00Z",
            ),
        )
        self.assertIsNotNone(saved)
        saved = SymbolicReading.objects.get(id=saved.id)
        self.assertEqual(saved.consultant_id, self.consultant.id)
        self.assertEqual(saved.therapist_id, self.therapist.id)
        self.assertEqual(saved.consent_mode, SymbolicReading.ConsentMode.STORE_WITH_CONSENT)

