"""
AI Engine URL Configuration
"""
from django.urls import path
from .views import GenerateInterpretationView, InterpretationHistoryView, AIEngineStatusView, InterpretAssignmentView, ExportInterpretationToMSHEView

urlpatterns = [
    path('interpret/<int:test_result_id>/', GenerateInterpretationView.as_view(), name='ai_generate_interpretation'),
    path('interpret-assignment/<int:assignment_id>/', InterpretAssignmentView.as_view(), name='ai_generate_interpret_assignment'),
    path('export-to-mshe/<str:interpretation_id>/', ExportInterpretationToMSHEView.as_view(), name='ai_export_to_mshe'),
    path('history/<int:patient_id>/', InterpretationHistoryView.as_view(), name='ai_interpretation_history'),
    path('status/', AIEngineStatusView.as_view(), name='ai_engine_status'),
]
