"""
Ejemplo de cómo usar ClinicalScorer y TEST_LINKS en una View de Django

Este archivo es solo un ejemplo. No debe ser importado directamente.
Copia este código en tu archivo de views (test_views.py o views.py)
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from api.utils import ClinicalScorer, TEST_LINKS
from api.test_models import TestResult
from api.models import Patient


class ProcessPsychometricTestView(APIView):
    """
    View para procesar tests psicométricos con análisis clínico y cabalístico
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Procesa un test psicométrico y retorna análisis clínico y cabalístico
        
        Body esperado:
        {
            "test_id": "phq-9",
            "answers": [2, 3, 1, 2, 3, 2, 2, 1, 3],
            "patient_id": 1  # Opcional, para terapeutas
        }
        """
        test_id = request.data.get('test_id')
        answers = request.data.get('answers', [])
        patient_id = request.data.get('patient_id')
        
        # Validaciones básicas
        if not test_id:
            return Response(
                {'error': 'test_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not answers or not isinstance(answers, list):
            return Response(
                {'error': 'answers debe ser una lista de enteros'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 1. Calcular score clínico
            scorer = ClinicalScorer()
            clinical_result = scorer.calcular_score(test_id, answers)
            
            # 2. Obtener mapeo cabalístico
            if test_id not in TEST_LINKS:
                return Response(
                    {'error': f'Test ID "{test_id}" no tiene mapeo cabalístico'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            kabbalah_mapping = TEST_LINKS[test_id]
            
            # 3. Preparar respuesta
            result = {
                'clinical': {
                    'score_bruto': clinical_result['score_bruto'],
                    'diagnostico_clinico': clinical_result['diagnostico_clinico']
                },
                'kabbalah': {
                    'test_name': kabbalah_mapping['test_name'],
                    'sefira_id': kabbalah_mapping['sefira_id'],
                    'organo_ref_id': kabbalah_mapping['organo_ref_id'],
                    'concepto_clave_id': kabbalah_mapping['concepto_clave_id'],
                    'angel_remedio_idx': kabbalah_mapping['angel_remedio_idx'],
                    'bio_desc': kabbalah_mapping['bio_desc']
                }
            }
            
            # 4. Guardar resultado en la base de datos (opcional)
            patient = None
            if patient_id:
                try:
                    patient = Patient.objects.get(id=patient_id, therapist=request.user)
                except Patient.DoesNotExist:
                    pass  # Si no existe, continuar sin paciente
            
            test_result = TestResult.objects.create(
                user=request.user,
                patient=patient,
                test_id=test_id,
                score=int(clinical_result['score_bruto']),
                clinical_diagnosis=clinical_result['diagnostico_clinico'],
                kabbalah_sefira=kabbalah_mapping['sefira_id'],
                angel_remedy=f"Angel_{kabbalah_mapping['angel_remedio_idx']}",  # Ajustar según tu sistema de ángeles
                details={
                    'answers': answers,
                    'kabbalah_mapping': kabbalah_mapping,
                    'full_result': result
                }
            )
            
            result['test_result_id'] = test_result.id
            
            return Response(result, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error al procesar test: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

