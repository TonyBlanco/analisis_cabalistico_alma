"""
Vistas para análisis de Alta Cábala
Gematria, Tarot, Mapa del Alma, Astrología, Tikún
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from .models import Patient, CabalisticAnalysis
from .utils.tarot_service import analyze_archetype_vs_clinical


@method_decorator(csrf_exempt, name='dispatch')
class SaveCabalisticAnalysisView(APIView):
    """
    Guarda un análisis de Alta Cábala para un paciente
    Ruta: POST /api/therapist/patients/<id>/cabalistic-analysis/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, id):
        """Guarda un análisis cabalístico"""
        try:
            # Obtener el paciente (solo si es del terapeuta actual)
            patient = get_object_or_404(
                Patient.objects.filter(therapist=request.user),
                id=id
            )
            
            analysis_type = request.data.get('analysis_type')
            input_data = request.data.get('input_data', {})
            result_data = request.data.get('result_data', {})
            summary = request.data.get('summary', '')
            therapist_notes = request.data.get('therapist_notes', '')
            
            if not analysis_type:
                return Response(
                    {'error': 'El tipo de análisis (analysis_type) es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar que el tipo sea válido
            valid_types = [choice[0] for choice in CabalisticAnalysis.ANALYSIS_TYPE_CHOICES]
            if analysis_type not in valid_types:
                return Response(
                    {'error': f'Tipo de análisis inválido. Debe ser uno de: {", ".join(valid_types)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear el análisis
            analysis = CabalisticAnalysis.objects.create(
                patient=patient,
                therapist=request.user,
                analysis_type=analysis_type,
                input_data=input_data,
                result_data=result_data,
                summary=summary,
                therapist_notes=therapist_notes
            )
            
            return Response({
                'success': True,
                'analysis_id': analysis.id,
                'message': 'Análisis guardado exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error al guardar el análisis: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class ListCabalisticAnalysesView(APIView):
    """
    Lista todos los análisis de Alta Cábala de un paciente
    Ruta: GET /api/therapist/patients/<id>/cabalistic-analyses/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, id):
        """Lista los análisis cabalísticos del paciente"""
        try:
            # Obtener el paciente (solo si es del terapeuta actual)
            patient = get_object_or_404(
                Patient.objects.filter(therapist=request.user),
                id=id
            )
            
            # Filtrar por tipo si se especifica
            analysis_type = request.query_params.get('type', None)
            analyses = CabalisticAnalysis.objects.filter(patient=patient)
            
            if analysis_type:
                analyses = analyses.filter(analysis_type=analysis_type)
            
            analyses = analyses.order_by('-created_at')
            
            # Serializar resultados
            results = []
            for analysis in analyses:
                results.append({
                    'id': analysis.id,
                    'analysis_type': analysis.analysis_type,
                    'analysis_type_display': analysis.get_analysis_type_display(),
                    'input_data': analysis.input_data,
                    'result_data': analysis.result_data,
                    'summary': analysis.summary,
                    'therapist_notes': analysis.therapist_notes,
                    'created_at': analysis.created_at.isoformat(),
                    'updated_at': analysis.updated_at.isoformat()
                })
            
            return Response({
                'success': True,
                'count': len(results),
                'results': results
            }, status=status.HTTP_200_OK)
        
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al listar los análisis: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class GenerateAndSaveTarotAnalysisView(APIView):
    """
    Genera y guarda automáticamente un análisis de Tarot cruzado
    Ruta: POST /api/therapist/patients/<id>/tarot-analysis/generate-and-save/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, id):
        """Genera y guarda el análisis de Tarot"""
        try:
            # Obtener el paciente
            patient = get_object_or_404(
                Patient.objects.filter(therapist=request.user),
                id=id
            )
            
            # Verificar que tenga fecha de nacimiento
            if not patient.birth_date:
                return Response(
                    {'error': 'El paciente no tiene fecha de nacimiento registrada'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generar análisis usando el servicio existente
            from .utils.tarot_service import analyze_archetype_vs_clinical
            analysis_result = analyze_archetype_vs_clinical(
                patient=patient,
                birth_date=patient.birth_date.isoformat()
            )
            
            # Verificar si hay error
            if 'error' in analysis_result:
                error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
                if 'No se encontraron tests' in analysis_result['error']:
                    error_status = status.HTTP_400_BAD_REQUEST
                elif 'fecha de nacimiento' in analysis_result['error'].lower():
                    error_status = status.HTTP_400_BAD_REQUEST
                
                return Response(
                    {'error': analysis_result['error']},
                    status=error_status
                )
            
            # Crear resumen
            summary = f"Arcano {analysis_result['arcana_number']}: {analysis_result['arcana_name']} - {analysis_result['test_name']} ({analysis_result['clinical_severity']})"
            
            # Guardar el análisis
            analysis = CabalisticAnalysis.objects.create(
                patient=patient,
                therapist=request.user,
                analysis_type='tarot',
                input_data={
                    'birth_date': patient.birth_date.isoformat(),
                    'patient_name': patient.full_name
                },
                result_data=analysis_result,
                summary=summary,
                therapist_notes=request.data.get('therapist_notes', '')
            )
            
            return Response({
                'success': True,
                'analysis_id': analysis.id,
                'analysis': analysis_result,
                'message': 'Análisis de Tarot generado y guardado exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error al generar y guardar el análisis: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

