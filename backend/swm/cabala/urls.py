"""
URLs for Cábala Aplicada SWM.

All routes under /api/swm/cabala/
"""

from django.urls import path
from swm.cabala.views import (
    CabalaSessionListView,
    CabalaSessionCreateView,
    CabalaSessionDetailView,
    CabalaSessionUpdateView,
    CabalaSessionStartView,
    CabalaSessionCloseView,
    TreeStateView,
    SefirahObservationListView,
    SefirahObservationCreateView,
    SefirahObservationDeleteView,
    PathObservationListView,
    PathObservationCreateView,
    SessionSnapshotListView,
    SessionSnapshotCreateView,
    CabalaChoicesView,
    ClinicalContextSummaryView,
    ComprehensiveReportView,  # Phoenix Backend Bridge
    # Gematria readings and synthesis
    GematriaReadingListView,
    GematriaReadingCreateView,
    GematriaReadingDetailView,
    GematriaSynthesisListView,
    GematriaSynthesisCreateView,
    GematriaSynthesisDetailView,
    GematriaSynthesisExportView,
    GematriaPatternAnalysisView,
)

app_name = 'swm_cabala'

urlpatterns = [
    # Session management
    path('sessions/', CabalaSessionListView.as_view(), name='session_list'),
    path('sessions/create/', CabalaSessionCreateView.as_view(), name='session_create'),
    path('sessions/<uuid:session_id>/', CabalaSessionDetailView.as_view(), name='session_detail'),
    path('sessions/<uuid:session_id>/update/', CabalaSessionUpdateView.as_view(), name='session_update'),
    path('sessions/<uuid:session_id>/start/', CabalaSessionStartView.as_view(), name='session_start'),
    path('sessions/<uuid:session_id>/close/', CabalaSessionCloseView.as_view(), name='session_close'),
    
    # Tree state
    path('sessions/<uuid:session_id>/tree-state/', TreeStateView.as_view(), name='tree_state'),
    
    # Sefirah observations
    path('sefirot/<uuid:session_id>/', SefirahObservationListView.as_view(), name='sefirot_list'),
    path('sefirot/observe/', SefirahObservationCreateView.as_view(), name='sefirot_observe'),
    path('sefirot/<uuid:observation_id>/delete/', SefirahObservationDeleteView.as_view(), name='sefirot_delete'),
    
    # Path observations
    path('paths/<uuid:session_id>/', PathObservationListView.as_view(), name='paths_list'),
    path('paths/observe/', PathObservationCreateView.as_view(), name='paths_observe'),
    
    # Snapshots
    path('sessions/<uuid:session_id>/snapshots/', SessionSnapshotListView.as_view(), name='snapshots_list'),
    path('sessions/<uuid:session_id>/snapshots/create/', SessionSnapshotCreateView.as_view(), name='snapshots_create'),
    
    # Clinical Context (Ghost Tests Pipeline Integration)
    path('clinical-summary/<int:patient_id>/', ClinicalContextSummaryView.as_view(), name='clinical_summary'),
    
    # Comprehensive Report (Phoenix Backend Bridge)
    path('comprehensive-report/', ComprehensiveReportView.as_view(), name='comprehensive_report'),
    
    # =========================================================================
    # GEMATRIA READINGS AND SYNTHESIS - NEW!
    # =========================================================================
    
    # Gematria Readings
    path('gematria-readings/', GematriaReadingListView.as_view(), name='gematria_readings_list'),
    path('gematria-readings/save/', GematriaReadingCreateView.as_view(), name='gematria_readings_save'),
    path('gematria-readings/<uuid:reading_id>/', GematriaReadingDetailView.as_view(), name='gematria_readings_detail'),
    
    # Gematria Synthesis
    path('gematria-synthesis/', GematriaSynthesisListView.as_view(), name='gematria_synthesis_list'),
    path('gematria-synthesis/generate/', GematriaSynthesisCreateView.as_view(), name='gematria_synthesis_generate'),
    path('gematria-synthesis/<uuid:synthesis_id>/', GematriaSynthesisDetailView.as_view(), name='gematria_synthesis_detail'),
    path('gematria-synthesis/export/', GematriaSynthesisExportView.as_view(), name='gematria_synthesis_export'),
    
    # Pattern Analysis (without saving)
    path('gematria-analysis/', GematriaPatternAnalysisView.as_view(), name='gematria_analysis'),
    
    # Metadata
    path('choices/', CabalaChoicesView.as_view(), name='choices'),
]
