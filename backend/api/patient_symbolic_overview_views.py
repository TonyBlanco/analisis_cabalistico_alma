# -*- coding: utf-8 -*-
"""
Patient Symbolic Overview API
Proporciona un resumen consolidado de todos los análisis simbólicos de un paciente:
- Astrología (carta natal Kerykeion)
- Tarot (lecturas terapéuticas)
- Cábala aplicada (análisis guardados)
- Tests psicométricos
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404

from .models import Patient
from .models_astrology import AstrologyNatalChart
from .models import CabalisticAnalysis
from .test_models import TestResult
from .permissions import IsTherapist

# Optional: include SWM v3 symbolic readings (B.O.T.A. snapshots) in overview completeness
try:
    from symbolic.swm_v3.models import SymbolicReading  # type: ignore
except Exception:
    SymbolicReading = None

class PatientSymbolicOverviewView(APIView):
    """
    GET /api/therapist/patients/<id>/symbolic-overview/
    
    Devuelve un JSON estructurado con:
    - has_natal_chart: bool
    - natal_chart_summary: {calculated_at, house_system, zodiac_type} | null
    - cabalistic_analyses: [{id, analysis_type, created_at, brief_summary}]
    - test_results: [{id, test_name, completed_at, severity_label}]
    - completeness_score: 0-100 (porcentaje de módulos completados)
    - missing_modules: ["Astrología", "Tarot", ...]
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request, id):
        # Enforce ownership: therapists can only fetch their own active patients.
        patient = get_object_or_404(Patient, pk=id, therapist=request.user, is_active=True)

        warnings = []

        # 1. Astrología (Carta Natal)
        natal_chart = None
        has_natal_chart = False
        try:
            chart_obj = AstrologyNatalChart.objects.filter(patient=patient).first()
            if chart_obj is None:
                raise AstrologyNatalChart.DoesNotExist()
            has_natal_chart = True
            chart_payload = chart_obj.chart_payload or {}
            metadatos = chart_payload.get('metadatos', {})
            natal_chart = {
                'calculated_at': metadatos.get('calculated_at'),
                'house_system': metadatos.get('sistema_casas'),
                'zodiac_type': metadatos.get('zodiac_type'),
                'planet_count': len(chart_payload.get('planetas', [])),
            }
        except AstrologyNatalChart.DoesNotExist:
            pass
        except Exception as exc:
            warnings.append(f"astrology_summary_failed: {type(exc).__name__}")

        # 2. Análisis cabalísticos (incluye Tarot, Gematria, Crossover, etc.)
        cabalistic_analyses = []
        try:
            for analysis in CabalisticAnalysis.objects.filter(patient=patient).order_by('-created_at')[:10]:
                payload = analysis.result_data or analysis.input_data or {}

                # Extraer resumen breve del payload si existe
                brief = analysis.summary or ""

                if analysis.analysis_type == 'tarot':
                    cards = payload.get('cards_drawn')
                    if not isinstance(cards, list):
                        cards = payload.get('cards')
                    if isinstance(cards, list):
                        brief = brief or f"{len(cards)} cartas"
                    else:
                        brief = brief or "Lectura guardada"
                elif analysis.analysis_type == 'astrology':
                    brief = brief or "Carta astral cabalística"
                elif analysis.analysis_type == 'gematria':
                    brief = brief or "Análisis numerológico"
                elif analysis.analysis_type == 'soul-map':
                    brief = brief or "Mapa del Alma"
                elif analysis.analysis_type == 'tikun':
                    brief = brief or "Análisis de Tikún"
                else:
                    brief = brief or "Análisis guardado"

                cabalistic_analyses.append({
                    'id': analysis.id,
                    'analysis_type': analysis.analysis_type,
                    'analysis_type_display': analysis.get_analysis_type_display(),
                    'created_at': analysis.created_at.isoformat() if analysis.created_at else None,
                    'brief_summary': brief,
                })
        except Exception as exc:
            warnings.append(f"cabalistic_analyses_failed: {type(exc).__name__}")

        # 3. Tests psicométricos
        test_results = []
        try:
            results_qs = TestResult.objects.filter(patient=patient)
            if not results_qs.exists() and patient.user:
                results_qs = TestResult.objects.filter(user=patient.user)

            for result in results_qs.order_by('-created_at')[:10]:
                severity = ""

                # Algunos tests guardan severidad en result_data/details, otros en clinical_diagnosis.
                result_payload = result.result_data or result.details or {}
                if isinstance(result_payload, dict):
                    severity = (
                        result_payload.get('severity_label')
                        or result_payload.get('severity')
                        or result_payload.get('risk_level')
                        or ""
                    )

                severity = severity or (result.clinical_diagnosis or "")

                test_name = "Test desconocido"
                test_code = None
                if result.test_module:
                    test_name = result.test_module.name
                    test_code = result.test_module.code
                elif result.test_id:
                    test_name = result.test_id.upper()

                test_results.append({
                    'id': result.id,
                    'test_name': test_name,
                    'test_code': test_code,
                    'completed_at': result.created_at.isoformat() if result.created_at else None,
                    'severity_label': severity,
                })
        except Exception as exc:
            warnings.append(f"test_results_failed: {type(exc).__name__}")

        # 4. Score de completitud
        modules_available = ['natal_chart', 'tarot', 'cabala', 'tests']
        modules_completed = []
        
        if has_natal_chart:
            modules_completed.append('natal_chart')
        if any(a['analysis_type'] == 'tarot' for a in cabalistic_analyses):
            modules_completed.append('tarot')
        # Also consider SWM v3 symbolic readings (e.g. B.O.T.A. snapshots) as Tarot
        try:
            if SymbolicReading is not None and getattr(patient, 'user_id', None):
                swm_qs = SymbolicReading.objects.filter(therapist=request.user, consultant_id=patient.user_id)
                if swm_qs.exists() and 'tarot' not in modules_completed:
                    modules_completed.append('tarot')
        except Exception:
            # keep overview tolerant to failures here
            pass
        # Cábala se considera completada si existe cualquier análisis cabalístico guardado
        # distinto de tarot (incluye tipos extendidos legacy como 'shekinah').
        if any(a.get('analysis_type') and a.get('analysis_type') != 'tarot' for a in cabalistic_analyses):
            modules_completed.append('cabala')
        if test_results:
            modules_completed.append('tests')
        
        completeness_score = int((len(modules_completed) / len(modules_available)) * 100)
        
        missing_modules = []
        if 'natal_chart' not in modules_completed:
            missing_modules.append('Astrología (Carta Natal)')
        if 'tarot' not in modules_completed:
            missing_modules.append('Tarot Terapéutico')
        if 'cabala' not in modules_completed:
            missing_modules.append('Cábala Aplicada')
        if 'tests' not in modules_completed:
            missing_modules.append('Tests Psicométricos')

        # Nombre preferido: legal_full_name en UserProfile (si existe), luego full_name en Patient.
        patient_profile_name = None
        try:
            if patient.user and hasattr(patient.user, 'profile') and patient.user.profile:
                patient_profile_name = (
                    getattr(patient.user.profile, 'legal_full_name', None)
                    or getattr(patient.user.profile, 'full_name', None)
                )
        except Exception:
            patient_profile_name = None

        patient_name = (
            patient_profile_name
            or getattr(patient, 'full_name', None)
            or f"{getattr(patient, 'first_name', '')} {getattr(patient, 'last_name', '')}".strip()
            or getattr(patient, 'email', None)
            or f"Paciente #{patient.id}"
        )

        return Response({
            'patient_id': patient.id,
            'patient_name': patient_name,
            'has_natal_chart': has_natal_chart,
            'natal_chart_summary': natal_chart,
            'cabalistic_analyses': cabalistic_analyses,
            'test_results': test_results,
            'completeness_score': completeness_score,
            'modules_completed': modules_completed,
            'missing_modules': missing_modules,
            'warnings': warnings,
        }, status=status.HTTP_200_OK)
