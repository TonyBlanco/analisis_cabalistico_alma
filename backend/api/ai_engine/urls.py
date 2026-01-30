"""
AI Engine URL Configuration
"""
from django.urls import path
from .views import GenerateInterpretationView, InterpretationHistoryView, AIEngineStatusView

urlpatterns = [
    path('interpret/<int:test_result_id>/', GenerateInterpretationView.as_view(), name='ai_generate_interpretation'),
    path('history/<int:patient_id>/', InterpretationHistoryView.as_view(), name='ai_interpretation_history'),
    path('status/', AIEngineStatusView.as_view(), name='ai_engine_status'),
]
