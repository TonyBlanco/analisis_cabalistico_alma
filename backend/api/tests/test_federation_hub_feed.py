"""Tests for Federation Hub Feed endpoint and service.

Policy: HOLISTIC_FEDERATION_POLICY.md
Authorization: FEDERATION_MVP_AUTHORIZATION_PLAN.md §3
"""

from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from api.models import Patient, AnalysisRecord, FederationAuditLog, UserProfile


class FederationHubFeedTestCase(TestCase):
    """Tests para endpoint GET /api/federation/hub-feed/"""
    
    def setUp(self):
        """Setup test data: therapist, patient, records"""
        
        # Create therapist user
        self.therapist_user = User.objects.create_user(
            username='therapist_test',
            email='therapist@test.com',
            password='testpass123'
        )
        self.therapist_profile, _ = UserProfile.objects.get_or_create(
            user=self.therapist_user,
            defaults={
                'user_type': 'therapist',
                'full_name': 'Dr. Therapist Test'
            }
        )
        self.therapist_profile.user_type = 'therapist'
        self.therapist_profile.full_name = 'Dr. Therapist Test'
        self.therapist_profile.save()
        # Invalidar cache de relación para forzar reload
        if hasattr(self.therapist_user, '_profile_cache'):
            del self.therapist_user._profile_cache
        self.therapist_user.refresh_from_db()
        
        # Create another therapist (for ownership tests)
        self.other_therapist = User.objects.create_user(
            username='other_therapist',
            email='other@test.com',
            password='testpass123'
        )
        self.other_therapist_profile, _ = UserProfile.objects.get_or_create(
            user=self.other_therapist,
            defaults={
                'user_type': 'therapist',
                'full_name': 'Dr. Other Therapist'
            }
        )
        self.other_therapist_profile.user_type = 'therapist'
        self.other_therapist_profile.full_name = 'Dr. Other Therapist'
        self.other_therapist_profile.save()
        # Invalidar cache de relación
        if hasattr(self.other_therapist, '_profile_cache'):
            del self.other_therapist._profile_cache
        self.other_therapist.refresh_from_db()
        
        # Create patient (owned by therapist_user)
        self.patient = Patient.objects.create(
            therapist=self.therapist_user,
            first_name='Test',
            last_name='Patient',
            email='patient@test.com',
            birth_date=date(1990, 1, 1),
            consent_federation=True,  # Consentimiento activo
        )
        
        # Create patient without consent
        self.patient_no_consent = Patient.objects.create(
            therapist=self.therapist_user,
            first_name='NoConsent',
            last_name='Patient',
            email='noconsent@test.com',
            birth_date=date(1985, 5, 15),
            consent_federation=False,  # Sin consentimiento
        )
        
        # Create AnalysisRecords for patient
        self.record1 = AnalysisRecord.objects.create(
            kind='clinical_test',
            module_code='PHQ9',
            role_context='therapist',
            execution_mode='therapist_clinical',
            birth_data_snapshot={'legal_name': 'Test Patient', 'birth_date': '1990-01-01'},
            algorithm_snapshot={'engine': 'PHQ9_ENGINE', 'version': '1.0'},
            raw_input={'score': 15},
            computed_result={'severity': 'moderate', 'summary': 'Moderate depression symptoms'},
            visibility='therapist',
            created_by_user=self.therapist_user,
            patient=self.patient,
            therapist=self.therapist_user,
        )
        
        self.record2 = AnalysisRecord.objects.create(
            kind='kabbalah',
            module_code='GEMATRIA',
            role_context='therapist',
            execution_mode='therapist_clinical',
            birth_data_snapshot={'legal_name': 'Test Patient', 'birth_date': '1990-01-01'},
            algorithm_snapshot={'engine': 'GEMATRIA_ENGINE', 'version': '2.0'},
            raw_input={'name': 'Test'},
            computed_result={'value': 400, 'interpretation': 'Strong foundation'},
            visibility='both',  # Visible para therapist y patient
            created_by_user=self.therapist_user,
            patient=self.patient,
            therapist=self.therapist_user,
        )
        
        # Record antiguo (para date_range tests)
        old_date = date.today() - timedelta(days=400)
        self.old_record = AnalysisRecord.objects.create(
            kind='astrology',
            module_code='NATAL_CHART',
            role_context='therapist',
            execution_mode='therapist_clinical',
            birth_data_snapshot={'legal_name': 'Test Patient', 'birth_date': '1990-01-01'},
            algorithm_snapshot={'engine': 'KERYKEION', 'version': '3.0'},
            raw_input={},
            computed_result={'chart': 'data'},
            visibility='therapist',
            created_by_user=self.therapist_user,
            patient=self.patient,
            therapist=self.therapist_user,
        )
        # Forzar created_at antiguo (en producción esto sería natural)
        AnalysisRecord.objects.filter(id=self.old_record.id).update(created_at=old_date)
        
        # API client
        self.client = APIClient()
    
    def test_no_ownership_403(self):
        """Test: therapist sin ownership del patient -> 403"""
        
        self.client.force_authenticate(user=self.other_therapist)
        
        response = self.client.get('/api/federation/hub-feed/', {
            'patient_id': self.patient.id,
            'hub': 'MSHE',
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('ownership', response.data['error'].lower())
        
        # Verificar audit log created (denied)
        audit_log = FederationAuditLog.objects.filter(
            requested_by_user=self.other_therapist,
            status='denied',
            denial_reason='no_ownership'
        ).first()
        self.assertIsNotNone(audit_log)
    
    def test_no_consent_403(self):
        """Test: therapist con ownership pero patient sin consent_federation -> 403"""
        
        self.client.force_authenticate(user=self.therapist_user)
        
        response = self.client.get('/api/federation/hub-feed/', {
            'patient_id': self.patient_no_consent.id,
            'hub': 'SCDF',
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('consent', response.data['error'].lower())
        
        # Verificar audit log (denied)
        audit_log = FederationAuditLog.objects.filter(
            subject_patient=self.patient_no_consent,
            status='denied',
            denial_reason='no_consent_federation'
        ).first()
        self.assertIsNotNone(audit_log)
    
    def test_success_with_consent_200(self):
        """Test: therapist con ownership + consent=True -> 200 con records normalizados"""
        
        self.client.force_authenticate(user=self.therapist_user)
        
        response = self.client.get('/api/federation/hub-feed/', {
            'patient_id': self.patient.id,
            'hub': 'MSHE',
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar estructura HubFeedSnapshot
        self.assertIn('metadata', response.data)
        self.assertIn('records', response.data)
        self.assertIn('audit_log_id', response.data)
        
        # Verificar metadata
        metadata = response.data['metadata']
        self.assertEqual(metadata['subject_patient_id'], self.patient.id)
        self.assertEqual(metadata['hub_code'], 'MSHE')
        self.assertGreater(metadata['records_count'], 0)
        
        # Verificar records normalizados
        records = response.data['records']
        self.assertGreater(len(records), 0)
        
        # Verificar que records tienen campos normalizados (no raw_input completo)
        for record in records:
            self.assertIn('record_id', record)
            self.assertIn('module_code', record)
            self.assertIn('summary_public', record)
            self.assertIn('summary_pro', record)
            self.assertIn('tags', record)
            self.assertIn('record_ref', record)
            # CRÍTICO: raw_input NO debe estar en feed normalizado
            self.assertNotIn('raw_input', record)
        
        # Verificar audit log created (allowed)
        audit_log = FederationAuditLog.objects.filter(
            requested_by_user=self.therapist_user,
            subject_patient=self.patient,
            status='allowed',
            federation_hub='MSHE'
        ).first()
        self.assertIsNotNone(audit_log)
        self.assertEqual(audit_log.records_accessed_count, len(records))
    
    def test_date_range_filters(self):
        """Test: date_range filtra correctamente los records"""
        
        self.client.force_authenticate(user=self.therapist_user)
        
        # Query con date_from reciente (debe excluir old_record)
        date_from = (date.today() - timedelta(days=30)).isoformat()
        
        response = self.client.get('/api/federation/hub-feed/', {
            'patient_id': self.patient.id,
            'hub': 'SCID5',
            'date_from': date_from,
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        records = response.data['records']
        
        # Verificar que old_record NO está incluido
        record_ids = [r['record_id'] for r in records]
        self.assertNotIn(str(self.old_record.id), record_ids)
        
        # Verificar que records recientes SÍ están
        self.assertIn(str(self.record1.id), record_ids)
        self.assertIn(str(self.record2.id), record_ids)
    
    def test_audit_log_immutable(self):
        """Test: FederationAuditLog es inmutable (no puede borrarse)"""
        
        # Crear audit log
        audit_log = FederationAuditLog.objects.create(
            requested_by_user=self.therapist_user,
            subject_patient=self.patient,
            federation_hub='MSHE',
            scope={'test': 'data'},
            status='allowed',
            records_accessed_count=5,
        )
        
        # Intentar borrar debe lanzar excepción
        with self.assertRaises(Exception) as context:
            audit_log.delete()
        
        self.assertIn('immutable', str(context.exception).lower())
        
        # Verificar que log sigue existiendo
        self.assertTrue(FederationAuditLog.objects.filter(id=audit_log.id).exists())
    
    def test_missing_params_400(self):
        """Test: parámetros faltantes -> 400"""
        
        self.client.force_authenticate(user=self.therapist_user)
        
        # Sin patient_id
        response = self.client.get('/api/federation/hub-feed/', {'hub': 'MSHE'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Sin hub
        response = self.client.get('/api/federation/hub-feed/', {'patient_id': self.patient.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_invalid_date_format_400(self):
        """Test: formato de fecha inválido -> 400"""
        
        self.client.force_authenticate(user=self.therapist_user)
        
        response = self.client.get('/api/federation/hub-feed/', {
            'patient_id': self.patient.id,
            'hub': 'MSHE',
            'date_from': 'invalid-date',
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ISO format', response.data['error'])
    
    def test_no_raw_input_in_feed(self):
        """Test CRÍTICO: feed NO expone raw_input completo (seguridad)"""
        
        self.client.force_authenticate(user=self.therapist_user)
        
        response = self.client.get('/api/federation/hub-feed/', {
            'patient_id': self.patient.id,
            'hub': 'MSHE',
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que NINGÚN record tiene raw_input en respuesta
        for record in response.data['records']:
            self.assertNotIn('raw_input', record, 
                "SECURITY VIOLATION: raw_input must not be exposed in federation feed")
