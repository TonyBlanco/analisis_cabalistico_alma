from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

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


class SymbolicReadingApiExecutionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.therapist = _create_user("swm3_api_test_therapist")
        self.client.force_authenticate(user=self.therapist)

    def test_no_store_returns_payload_for_golden_dawn(self):
        response = self.client.post(
            "/api/swm-v3/symbolic-readings/",
            data={
                "system_id": "golden-dawn",
                "consent_mode": "no_store",
                "reading_type": "educational",
                "selected_cards": ["gd_00_the_fool"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body.get("success"))
        self.assertFalse(body.get("stored"))
        self.assertEqual(body.get("mode"), "no_store")
        self.assertIsNone(body.get("reading_id"))
        self.assertIsInstance(body.get("payload"), dict)
        self.assertNotEqual(body, {})
        self.assertEqual(body["payload"].get("id", "").startswith("swm-v3-mock-golden-dawn-"), True)

    def test_store_anonymized_persists_golden_dawn(self):
        response = self.client.post(
            "/api/swm-v3/symbolic-readings/",
            data={
                "system_id": "golden_dawn",
                "consent_mode": "store_anonymized",
                "reading_type": "educational",
                "selected_cards": ["gd_00_the_fool"],
                "consent": {
                    "explicit_opt_in": True,
                    "version": "swm-v3-phase-3-consent-v1",
                    "accepted_at": "2026-01-01T00:00:00Z",
                },
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertTrue(body.get("success"))
        self.assertTrue(body.get("stored"))
        self.assertEqual(body.get("mode"), "store_anonymized")
        self.assertIsNotNone(body.get("reading_id"))
        self.assertIsInstance(body.get("payload"), dict)

        saved = SymbolicReading.objects.get(id=body["reading_id"])
        self.assertEqual(saved.system_id, "golden_dawn")
        self.assertIsNone(saved.consultant_id)

    def test_no_store_returns_payload_for_rota(self):
        response = self.client.post(
            "/api/swm-v3/symbolic-readings/",
            data={
                "system_id": "rota",
                "consent_mode": "no_store",
                "reading_type": "educational",
                "selected_cards": ["rota_10_wheel"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body.get("success"))
        self.assertFalse(body.get("stored"))
        self.assertEqual(body.get("mode"), "no_store")
        self.assertIsNone(body.get("reading_id"))
        self.assertIsInstance(body.get("payload"), dict)
        self.assertNotEqual(body, {})
        self.assertEqual(body["payload"].get("id", "").startswith("swm-v3-mock-rota-"), True)

    def test_no_store_returns_payload_for_marsella(self):
        response = self.client.post(
            "/api/swm-v3/symbolic-readings/",
            data={
                "system_id": "marsella",
                "consent_mode": "no_store",
                "reading_type": "educational",
                "selected_cards": ["mars_01_bateleur"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body.get("success"))
        self.assertFalse(body.get("stored"))
        self.assertEqual(body.get("mode"), "no_store")
        self.assertIsNone(body.get("reading_id"))
        self.assertIsInstance(body.get("payload"), dict)
        self.assertNotEqual(body, {})
        self.assertEqual(body["payload"].get("id", "").startswith("swm-v3-mock-marsella-"), True)

    def test_no_store_returns_payload_for_rider_waite(self):
        response = self.client.post(
            "/api/swm-v3/symbolic-readings/",
            data={
                "system_id": "rider_waite",
                "consent_mode": "no_store",
                "reading_type": "educational",
                "selected_cards": ["rw_00_the_fool"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body.get("success"))
        self.assertFalse(body.get("stored"))
        self.assertEqual(body.get("mode"), "no_store")
        self.assertIsNone(body.get("reading_id"))
        self.assertIsInstance(body.get("payload"), dict)
        self.assertNotEqual(body, {})
        self.assertEqual(body["payload"].get("id", "").startswith("swm-v3-mock-rider-waite-"), True)
