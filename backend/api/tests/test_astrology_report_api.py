# -*- coding: utf-8 -*-
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from api.models import Patient, UserProfile
from api.models_astrology import AstrologyNatalChart, AstrologySessionReport


def _sample_chart_payload():
    return {
        'planetas': [
            {'nombre': 'sun', 'signo': 'Leo', 'grados': 10, 'longitud_ecliptica': 130, 'casa': 10},
            {'nombre': 'moon', 'signo': 'Cáncer', 'grados': 5, 'longitud_ecliptica': 95, 'casa': 9},
        ],
        'casas': [
            {'numero': i, 'signo': 'Aries', 'cuspide_grados': 0, 'cuspide_longitud': (i - 1) * 30}
            for i in range(1, 13)
        ],
        'aspectos': [],
        'metadatos': {
            'sistema_casas': 'P',
            'zodiac_type': 'tropical',
            'fuente': 'swiss_ephemeris',
            'calculated_at': '2026-06-10T12:00:00',
            'version_engine': 'test',
        },
    }


class AstrologyReportApiTests(TestCase):
    def setUp(self):
        self.therapist = User.objects.create_user(username='astro_rep_t')
        self.therapist.set_unusable_password()
        self.therapist.save(update_fields=['password'])
        UserProfile.objects.create(user=self.therapist, user_type='therapist', full_name='Terapeuta Test')
        self.patient = Patient.objects.create(
            therapist=self.therapist,
            first_name='Luna',
            last_name='Test',
            email='luna@test.com',
            birth_date='1990-05-15',
            birth_time='14:30:00',
            birth_city='Madrid',
            birth_country='ES',
            birth_latitude=40.4168,
            birth_longitude=-3.7038,
            birth_timezone='Europe/Madrid',
            is_active=True,
        )
        self.chart = AstrologyNatalChart.objects.create(
            patient=self.patient,
            created_by=self.therapist,
            house_system='P',
            source='swiss_ephemeris',
            chart_payload=_sample_chart_payload(),
            input_snapshot={'zodiac_type': 'tropical', 'house_system': 'P'},
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.therapist)

    def test_create_and_list_report(self):
        url = f'/api/therapist/patients/{self.patient.id}/astrology-reports/'
        res = self.client.post(url, {
            'active_layers': ['natal', 'transits'],
            'include_interpretations': False,
            'therapist_notes': 'Nota de prueba',
        }, format='json')
        self.assertEqual(res.status_code, 201, res.content)
        self.assertIn('id', res.data)
        self.assertEqual(res.data['therapist_notes'], 'Nota de prueba')
        report = AstrologySessionReport.objects.get(pk=res.data['id'])
        self.assertEqual(report.patient_id, self.patient.id)
        self.assertIn('natal', report.report_payload.get('active_layers', []))

        list_res = self.client.get(url)
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(list_res.data['count'], 1)

    def test_get_detail_and_share(self):
        report = AstrologySessionReport.objects.create(
            patient=self.patient,
            created_by=self.therapist,
            natal_chart=self.chart,
            title='Informe test',
            report_payload={'version': '1', 'active_layers': ['natal']},
        )
        detail_url = f'/api/therapist/patients/{self.patient.id}/astrology-reports/{report.id}/'
        detail = self.client.get(detail_url)
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data['title'], 'Informe test')

        patched = self.client.patch(detail_url, {'is_shared_with_patient': True}, format='json')
        self.assertEqual(patched.status_code, 200)
        self.assertTrue(patched.data['is_shared_with_patient'])