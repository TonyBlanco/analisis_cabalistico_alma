"""
Tests for the Resonance Map F1 backbone:
  - GenealogyPerson new fields (birth_order_number, is_deceased, is_abortion, side)
  - ResonanciaRelation resonance_type filter + detail CRUD
  - ResonanceClientCapture enable/disable idempotency
"""

import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from api.bioemotional.models import GenealogyPerson
from api.models import Patient, ResonanciaRelation, ResonanceClientCapture


def _make_therapist(username):
    User = get_user_model()
    user = User.objects.create_user(username, f'{username}@example.com', 'password')
    user.profile.user_type = 'therapist'
    user.profile.save()
    return user


def _make_patient(therapist, suffix='1'):
    return Patient.objects.create(
        therapist=therapist,
        email=f'patient{suffix}@example.com',
        first_name='Paciente',
        last_name=suffix,
        full_name=f'Paciente {suffix}',
        birth_date='1990-01-01',
        birth_city='Ciudad',
        birth_country='Pais',
    )


def _make_relation(therapist, patient, resonance_type=None, to_label='Hermano mayor', **kwargs):
    return ResonanciaRelation.objects.create(
        author=therapist,
        subject=patient,
        context='familiar',
        to_label=to_label,
        position=1,
        resonance_type=resonance_type,
        **kwargs,
    )


class GenealogyPersonNewFieldsTest(TestCase):
    """GenealogyPerson exposes birth_order_number, is_deceased, is_abortion, side via API."""

    def setUp(self):
        self.therapist = _make_therapist('gp_thera')
        self.patient = _make_patient(self.therapist, 'gp1')
        self.client_api = Client()
        self.client_api.force_login(self.therapist)

    def _create_person(self, extra=None):
        payload = {
            'generation': -1,
            'relation': 'padre',
            'name': 'José',
            'birth_year': 1955,
        }
        if extra:
            payload.update(extra)
        return self.client_api.post(
            f'/api/bioemotional/genealogy/{self.patient.id}/person',
            json.dumps(payload),
            content_type='application/json',
        )

    def test_create_person_with_resonance_fields_persisted(self):
        resp = self._create_person({
            'birth_order_number': 2,
            'is_deceased': True,
            'is_abortion': False,
            'side': 'paterno',
        })
        self.assertEqual(resp.status_code, 201, resp.json())
        data = resp.json()
        self.assertEqual(data['birth_order_number'], 2)
        self.assertTrue(data['is_deceased'])
        self.assertFalse(data['is_abortion'])
        self.assertEqual(data['side'], 'paterno')

    def test_create_person_defaults_for_resonance_fields(self):
        resp = self._create_person()
        self.assertEqual(resp.status_code, 201, resp.json())
        data = resp.json()
        self.assertIsNone(data['birth_order_number'])
        self.assertFalse(data['is_deceased'])
        self.assertFalse(data['is_abortion'])
        self.assertIsNone(data['side'])

    def test_abortion_flag_can_be_set(self):
        resp = self._create_person({'is_abortion': True, 'birth_order_number': 1})
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertTrue(data['is_abortion'])
        self.assertEqual(data['birth_order_number'], 1)

    def test_side_materno_accepted(self):
        resp = self._create_person({'side': 'materno'})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['side'], 'materno')

    def test_response_includes_all_resonance_fields(self):
        resp = self._create_person()
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        for field in ('birth_order_number', 'is_deceased', 'is_abortion', 'side'):
            self.assertIn(field, data, f"field '{field}' missing from response")


class ResonanciaRelationResonanceTypeFilterTest(TestCase):
    """resonance_type filter on GET /api/resonancia/relations/."""

    def setUp(self):
        self.therapist = _make_therapist('rt_thera')
        self.patient = _make_patient(self.therapist, 'rt1')
        self.client_api = Client()
        self.client_api.force_login(self.therapist)

        self.rel_numero = _make_relation(self.therapist, self.patient, resonance_type='resonancia_por_numero')
        self.rel_exclusion = _make_relation(self.therapist, self.patient, resonance_type='exclusion', to_label='Hermana')
        self.rel_legacy = _make_relation(self.therapist, self.patient, resonance_type=None, to_label='Abuela')

    def test_filter_by_resonance_type_returns_only_matching(self):
        resp = self.client_api.get(
            f'/api/resonancia/relations/?subject={self.patient.id}&resonance_type=resonancia_por_numero'
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['resonance_type'], 'resonancia_por_numero')

    def test_filter_by_exclusion(self):
        resp = self.client_api.get(
            f'/api/resonancia/relations/?subject={self.patient.id}&resonance_type=exclusion'
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['resonance_type'], 'exclusion')

    def test_no_filter_returns_all_three(self):
        resp = self.client_api.get(f'/api/resonancia/relations/?subject={self.patient.id}')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 3)

    def test_filter_by_unknown_type_returns_empty(self):
        resp = self.client_api.get(
            f'/api/resonancia/relations/?subject={self.patient.id}&resonance_type=no_existe'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), [])


class ResonanciaRelationDetailCRUDTest(TestCase):
    """GET/PATCH/DELETE on /api/resonancia/relations/{pk}/."""

    def setUp(self):
        self.therapist = _make_therapist('rd_thera')
        self.other = _make_therapist('rd_other')
        self.patient = _make_patient(self.therapist, 'rd1')
        self.client_api = Client()
        self.client_api.force_login(self.therapist)

        self.relation = _make_relation(
            self.therapist, self.patient,
            resonance_type='sindrome_aniversario',
            relevance='alta',
        )

    def test_get_detail_returns_relation(self):
        resp = self.client_api.get(f'/api/resonancia/relations/{self.relation.pk}/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['id'], str(self.relation.pk))
        self.assertEqual(data['resonance_type'], 'sindrome_aniversario')
        self.assertEqual(data['relevance'], 'alta')

    def test_patch_updates_resonance_type(self):
        resp = self.client_api.patch(
            f'/api/resonancia/relations/{self.relation.pk}/',
            json.dumps({'resonance_type': 'hueco_aborto'}),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['resonance_type'], 'hueco_aborto')
        self.relation.refresh_from_db()
        self.assertEqual(self.relation.resonance_type, 'hueco_aborto')

    def test_patch_updates_note_and_source_ref(self):
        resp = self.client_api.patch(
            f'/api/resonancia/relations/{self.relation.pk}/',
            json.dumps({'note': 'Nueva nota', 'source_ref': 'sesion_12'}),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['note'], 'Nueva nota')
        self.assertEqual(data['source_ref'], 'sesion_12')

    def test_delete_removes_relation(self):
        pk = self.relation.pk
        resp = self.client_api.delete(f'/api/resonancia/relations/{pk}/')
        self.assertEqual(resp.status_code, 204)
        self.assertFalse(ResonanciaRelation.objects.filter(pk=pk).exists())

    def test_other_therapist_cannot_access(self):
        other_client = Client()
        other_client.force_login(self.other)
        resp = other_client.get(f'/api/resonancia/relations/{self.relation.pk}/')
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated_returns_401(self):
        anon = Client()
        resp = anon.get(f'/api/resonancia/relations/{self.relation.pk}/')
        self.assertIn(resp.status_code, (401, 403))


class ResonanciaRelationNewFieldsSerializedTest(TestCase):
    """New resonance_type, relevance, direction, source fields appear in list and create."""

    def setUp(self):
        self.therapist = _make_therapist('rf_thera')
        self.patient = _make_patient(self.therapist, 'rf1')
        self.client_api = Client()
        self.client_api.force_login(self.therapist)

    def test_create_with_all_new_fields(self):
        payload = {
            'context': 'familiar',
            'to_label': 'Abuelo paterno',
            'position': 4,
            'resonance_type': 'duplica_generacional',
            'relevance': 'alta',
            'direction': 'a_to_b',
            'source': 'terapeuta',
            'source_ref': 'sesion_3',
        }
        resp = self.client_api.post(
            f'/api/resonancia/relations/?subject={self.patient.id}',
            json.dumps(payload),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201, resp.json())
        data = resp.json()
        self.assertEqual(data['resonance_type'], 'duplica_generacional')
        self.assertEqual(data['relevance'], 'alta')
        self.assertEqual(data['direction'], 'a_to_b')
        self.assertEqual(data['source_ref'], 'sesion_3')

    def test_create_legacy_no_resonance_type(self):
        payload = {
            'context': 'relacional',
            'to_label': 'Hermano',
            'position': 2,
        }
        resp = self.client_api.post(
            f'/api/resonancia/relations/?subject={self.patient.id}',
            json.dumps(payload),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201, resp.json())
        data = resp.json()
        self.assertIsNone(data['resonance_type'])
        self.assertEqual(data['relevance'], 'media')
        self.assertEqual(data['direction'], 'bidireccional')


class ResonanceClientCaptureTest(TestCase):
    """ResonanceClientCapture idempotency and enable/disable logic."""

    def setUp(self):
        self.therapist = _make_therapist('cc_thera')
        self.other = _make_therapist('cc_other')
        self.patient = _make_patient(self.therapist, 'cc1')
        self.client_api = Client()
        self.client_api.force_login(self.therapist)
        self.url = f'/api/resonancia/client-capture/?subject={self.patient.id}'

    def test_get_creates_flag_idempotently(self):
        self.assertEqual(ResonanceClientCapture.objects.count(), 0)
        resp = self.client_api.get(self.url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(ResonanceClientCapture.objects.count(), 1)
        data = resp.json()
        self.assertFalse(data['enabled'])
        self.assertIsNone(data['enabled_at'])

    def test_second_get_does_not_duplicate(self):
        self.client_api.get(self.url)
        self.client_api.get(self.url)
        self.assertEqual(ResonanceClientCapture.objects.count(), 1)

    def test_patch_enable_sets_enabled_at(self):
        resp = self.client_api.patch(
            self.url,
            json.dumps({'enabled': True}),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data['enabled'])
        self.assertIsNotNone(data['enabled_at'])

    def test_patch_disable_preserves_enabled_at(self):
        self.client_api.patch(self.url, json.dumps({'enabled': True}), content_type='application/json')
        first_resp = self.client_api.get(self.url).json()
        enabled_at_first = first_resp['enabled_at']

        resp = self.client_api.patch(
            self.url,
            json.dumps({'enabled': False}),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data['enabled'])
        self.assertEqual(data['enabled_at'], enabled_at_first)

    def test_re_enable_does_not_reset_enabled_at(self):
        self.client_api.patch(self.url, json.dumps({'enabled': True}), content_type='application/json')
        first = self.client_api.get(self.url).json()['enabled_at']

        self.client_api.patch(self.url, json.dumps({'enabled': False}), content_type='application/json')
        self.client_api.patch(self.url, json.dumps({'enabled': True}), content_type='application/json')
        second = self.client_api.get(self.url).json()['enabled_at']

        self.assertEqual(first, second)

    def test_missing_subject_returns_404(self):
        resp = self.client_api.get('/api/resonancia/client-capture/')
        self.assertEqual(resp.status_code, 404)

    def test_wrong_patient_ownership_returns_404(self):
        other_patient = _make_patient(self.other, 'cc_other1')
        resp = self.client_api.get(
            f'/api/resonancia/client-capture/?subject={other_patient.id}'
        )
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated_returns_401(self):
        anon = Client()
        resp = anon.get(self.url)
        self.assertIn(resp.status_code, (401, 403))

    def test_unique_together_enforced_at_db_level(self):
        ResonanceClientCapture.objects.create(therapist=self.therapist, patient=self.patient)
        with self.assertRaises(Exception):
            ResonanceClientCapture.objects.create(therapist=self.therapist, patient=self.patient)
