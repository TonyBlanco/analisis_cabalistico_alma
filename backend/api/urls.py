from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    CreatePatientWithAccountView,
    CalculoCabalisticoView,
    welcome_api,
    FichaListCreateView,
    FichaRetrieveView,
    RegisterTherapistView,
    RegisterPersonalView,
    CurrentUserView,
    UpdateProfileView,
    BirthDataView,
    BirthDataUnlockRequestView,
    BirthDataUnlockConfirmView,
    GeocodeCityView,
    CheckMembershipView,
    EmailOrUsernameAuthToken,
    GoogleOAuthView,
    AdminStatsView,
    AdminUsersView,
    AdminUserDetailView,
    UserProfileMeView,
    UserProfileConsentView,
    # Vistas de terapeutas
    PatientListCreateView,
    PatientDetailView,
    GenerateAIPlanView,
    SessionListCreateView,
    SessionDetailView,
    TherapistNoteListCreateView,
    TherapistDashboardView,
    TherapistPatientProfileView,
    # Vistas de Consultante (nuevo sistema unificado)
    ConsultanteListCreateView,
    ConsultanteDetailView,
    ConsultanteResolveView,
    PatientLegacyAdapter,
    ConsultanteHealthCheckView,
    # Vistas de servicios
    ServiceCategoryListView,
    ServiceListView,
    ServiceDetailView,
    ServicePackageListView,
    ServicePackageDetailView,
    BookingListCreateView,
    BookingDetailView,
    AvailableSlotsView,
    BlockedDatesView,
    service_stats,
)
from .ai_views import AIHolisticQueryView
from .cleanup_views import DataCleanupView
from .astrology_ai_views import (
    AstrologyInterpretNatalView,
    AstrologyInterpretTransitsView,
    AstrologyInterpretProgressionsView,
    AstrologyInterpretSolarReturnView,
    AstrologyInterpretPsychologicalView,
    AstrologyQuerySituationView,
    AstrologyAIStatusView,
    AstrologyAIInterpretationListView,
    AstrologyAIInterpretationDetailView,
)
from .payment_views import (
    CreateCheckoutSessionView,
    StripeWebhookView,
    CancelSubscriptionView,
    SubscriptionStatusView
)
from .bizum_views import (
    BizumPaymentNotificationView,
    ActivateMembershipView
)
from .test_views import (
    AvailableTestsView,
    TestModuleDetailView,
    ExecuteTestView,
    TestResultsView,
    TestResultDetailView,
    UserTestStatsView,
    GrantTestAccessView,
    AssignTestToPatientView,
    ArchiveTestAssignmentView,
    UnassignTestFromPatientView,
    PatientPreviousTestsView,
    ProcessTestSubmissionView,
    PHQ9SubmitView,
    GAD7SubmitView,
    BAISubmitView,
    ISISubmitView,
    BDI2SubmitView
)
from .patient_note_views import PatientNotesView
from .assignments import (
    AssignmentListCreateView,
    AssignmentDetailView,
    AssignmentStartView,
    AssignmentSubmitView,
    AssignmentComputeView,
    AssignmentResultsView,
    AssignmentResetView,
)
from .gematria_views import GematriaInterpretationView
from .tarot_views import TarotAnalysisView, TarotCabalisticCorrespondenceView
from .tarot_holistic_views import (
    TarotHolisticSchemaView,
    TarotHolisticProviderStatusView,
    TarotInterpretCardView,
    TarotInterpretSpreadView,
    TarotHolisticConsentCheckView,
)
from .cabalistic_views import (
    SaveCabalisticAnalysisView,
    ListCabalisticAnalysesView,
    GenerateAndSaveTarotAnalysisView,
    KerykeionAnalysisView,
    KabbalahInterpretationView,
    CabalaAplicadaMethodRecordView,
    CrossoverSynthesisView
)
from .admin_views import (
    AdminCheckView,
    EnhancedAdminStatsView,
    EnhancedAdminUsersView,
    AdminUserManagementView
)
from .federation_views import FederationHubFeedView
from .views import (
    reset_admin_passwords_temp,
    configure_admin_profiles_temp,
    MyResourcesView,
    AssignResourceToPatientView,
    AcquireResourceView,
)
from .analysis_views import (
    AnalysisRecordListCreateView,
    AnalysisRecordDetailView,
    UpdateAnalysisAnnotationsView,
    HolisticSynthesisView,
    TherapistHolisticConfigView,
    SCID5AIAssistantView,
)
from .patient_profile_views import (
    TherapistUpdatePatientProfileView,
    PatientProfileValidationView,
    ProfileUpdateAcknowledgeView,
)
from .patient_status_views import (
    PatientStatusUpdateView,
    PatientArchiveView,
)
from .patient_symbolic_overview_views import PatientSymbolicOverviewView
from .patient_holistic_export_views import PatientHolisticExportsView
from .symbolic_views import TreeStructuralStateView
from .utils.symbolic_interpreter_ai import (
    generate_symbolic_interpretation_view,
    symbolic_interpreter_status_view,
)
from .resonancia_views import (
    ResonanciaObservationListCreateView,
    ResonanciaObservationDetailView,
    ResonanciaRelationListCreateView,
)
# SWM v3 - Symbolic Workspace Module v3
from symbolic.swm_v3.views import SwmV3SymbolicReadingCreateView, SwmV3SystemsListView

urlpatterns = [
    # ⚠️ ENDPOINTS TEMPORALES - ELIMINAR DESPUÉS DE USAR ⚠️
    path('temp/reset-admin-passwords/', reset_admin_passwords_temp, name='temp_reset_passwords'),
    path('temp/configure-profiles/', configure_admin_profiles_temp, name='temp_configure_profiles'),
    
    # Bienvenida
    path('', welcome_api, name='api_welcome'),
    
    # Autenticación
    path('login/', EmailOrUsernameAuthToken.as_view(), name='api_token_auth'),
    path('login/google/', GoogleOAuthView.as_view(), name='google_oauth'),
    path('register/therapist/', RegisterTherapistView.as_view(), name='register_therapist'),
    path('register/personal/', RegisterPersonalView.as_view(), name='register_personal'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('me/profile/', UpdateProfileView.as_view(), name='update_profile'),
    path('profile/me/', UserProfileMeView.as_view(), name='profile_me'),
    path('profile/me/consent/', UserProfileConsentView.as_view(), name='profile_me_consent'),
    path('profile/me/acknowledge-update/', ProfileUpdateAcknowledgeView.as_view(), name='profile_acknowledge_update'),
    # Alias para cuenta de paciente (usa el mismo endpoint que profile/me/)
    path('account/profile/', UserProfileMeView.as_view(), name='account_profile'),
    path('me/birth-data/', BirthDataView.as_view(), name='birth_data'),
    path('me/birth-data/send-unlock-email/', BirthDataUnlockRequestView.as_view(), name='birth_data_send_unlock'),
    path('me/birth-data/unlock/', BirthDataUnlockConfirmView.as_view(), name='birth_data_unlock_confirm'),
    path('geocode/city/', GeocodeCityView.as_view(), name='geocode_city'),
    path('check-membership/', CheckMembershipView.as_view(), name='check_membership'),
    
    # Cálculos
    path('calcular/', CalculoCabalisticoView.as_view(), name='calcular_cabala'),
    
    # AI Assistant
    path('ai/holistic-query/', AIHolisticQueryView.as_view(), name='ai_holistic_query'),
    
    # Fichas
    path('fichas/', FichaListCreateView.as_view(), name='ficha_list_create'),
    path('fichas/<int:pk>/', FichaRetrieveView.as_view(), name='ficha_retrieve'),
    
    # ===========================================================================
    # CONSULTANTE API (nuevo sistema unificado)
    # Ver: docs/UNIFIED_CONSULTANTE_ARCHITECTURE.md
    # ===========================================================================
    path('consultantes/', ConsultanteListCreateView.as_view(), name='consultante_list_create'),
    path('consultantes/health/', ConsultanteHealthCheckView.as_view(), name='consultante_health'),
    path('consultantes/resolve/<int:legacy_id>/', ConsultanteResolveView.as_view(), name='consultante_resolve'),
    path('consultantes/<uuid:uuid>/', ConsultanteDetailView.as_view(), name='consultante_detail'),
    
    # Endpoints exclusivos para terapeutas
    path('therapist/patients/create/', CreatePatientWithAccountView.as_view(), name='create_patient_with_account'),
    path('therapist/dashboard/', TherapistDashboardView.as_view(), name='therapist_dashboard'),
    path('therapist/cleanup/', DataCleanupView.as_view(), name='therapist_data_cleanup'),
    path('therapist/patients/', PatientListCreateView.as_view(), name='patient_list_create'),
    path('therapist/patients/<int:pk>/', PatientDetailView.as_view(), name='patient_detail'),
    path('therapist/patients/<int:pk>/profile/', TherapistPatientProfileView.as_view(), name='therapist_patient_profile'),
    path('therapist/patients/<int:pk>/profile/update/', TherapistUpdatePatientProfileView.as_view(), name='therapist_update_patient_profile'),
    path('therapist/patients/<int:pk>/profile/validation/', PatientProfileValidationView.as_view(), name='patient_profile_validation'),
    path('therapist/patients/<int:pk>/status/', PatientStatusUpdateView.as_view(), name='patient_status_update'),
    path('therapist/patients/<int:pk>/archive/', PatientArchiveView.as_view(), name='patient_archive'),
    path('therapist/patients/<int:id>/symbolic-overview/', PatientSymbolicOverviewView.as_view(), name='patient_symbolic_overview'),
    path('therapist/patients/<int:id>/holistic-exports/', PatientHolisticExportsView.as_view(), name='patient_holistic_exports'),
    path('therapist/patients/<int:id>/tarot-analysis/', TarotAnalysisView.as_view(), name='tarot_analysis'),
    path('tarot/cabalistic-correspondence/', TarotCabalisticCorrespondenceView.as_view(), name='tarot_cabalistic_correspondence'),

    # SWM v3 (Phase 3): governed persistence for symbolic readings
    path('swm-v3/symbolic-readings/', SwmV3SymbolicReadingCreateView.as_view(), name='swm_v3_symbolic_readings_create'),
    path('swm-v3/systems/', SwmV3SystemsListView.as_view(), name='swm_v3_systems_list'),

    path('therapist/patients/<int:id>/tarot-analysis/generate-and-save/', GenerateAndSaveTarotAnalysisView.as_view(), name='tarot_analysis_generate_and_save'),
    path('therapist/patients/<int:id>/cabalistic-analysis/', SaveCabalisticAnalysisView.as_view(), name='save_cabalistic_analysis'),
    path('therapist/patients/<int:id>/cabalistic-analyses/', ListCabalisticAnalysesView.as_view(), name='list_cabalistic_analyses'),
    path('therapist/patients/<int:id>/astrology-kerykeion/', KerykeionAnalysisView.as_view(), name='kerykeion_analysis'),
    path('therapist/patients/<int:id>/interpretation/kabbalah/', KabbalahInterpretationView.as_view(), name='kabbalah_interpretation'),
    path('therapist/patients/<int:id>/cabala-aplicada/records/', CabalaAplicadaMethodRecordView.as_view(), name='cabala_aplicada_records'),
    path('therapist/patients/<int:id>/crossover/generate-and-save/', CrossoverSynthesisView.as_view(), name='crossover_synthesis'),
    path('therapist/sessions/', SessionListCreateView.as_view(), name='session_list_create'),
    path('therapist/sessions/<int:pk>/', SessionDetailView.as_view(), name='session_detail'),
    path('therapist/notes/', TherapistNoteListCreateView.as_view(), name='therapist_note_list_create'),
    
    # Pagos y suscripciones
    path('payments/create-checkout/', CreateCheckoutSessionView.as_view(), name='create_checkout'),
    path('payments/webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
    path('payments/cancel-subscription/', CancelSubscriptionView.as_view(), name='cancel_subscription'),
    path('payments/subscription-status/', SubscriptionStatusView.as_view(), name='subscription_status'),
    
    # ========== SERVICIOS Y RESERVAS ==========
    
    # Categorías y servicios
    path('services/categories/', ServiceCategoryListView.as_view(), name='service_categories'),
    path('services/', ServiceListView.as_view(), name='service_list'),
    path('services/<slug:slug>/', ServiceDetailView.as_view(), name='service_detail'),
    
    # Paquetes
    path('packages/', ServicePackageListView.as_view(), name='package_list'),
    path('packages/<slug:slug>/', ServicePackageDetailView.as_view(), name='package_detail'),
    
    # Reservas
    path('bookings/', BookingListCreateView.as_view(), name='booking_list_create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    
    # Disponibilidad
    path('availability/slots/', AvailableSlotsView.as_view(), name='available_slots'),
    path('availability/blocked/', BlockedDatesView.as_view(), name='blocked_dates'),
    
    # Estadísticas (admin)
    path('stats/services/', service_stats, name='service_stats'),
    
    # Payment webhooks
    path('payments/bizum/notify/', BizumPaymentNotificationView.as_view(), name='bizum_notify'),
    path('payments/activate/', ActivateMembershipView.as_view(), name='activate_membership'),
    
    # Admin endpoints mejorados
    path('admin/check/', AdminCheckView.as_view(), name='admin_check'),
    path('admin/stats/', EnhancedAdminStatsView.as_view(), name='enhanced_admin_stats'),
    path('admin/users/', EnhancedAdminUsersView.as_view(), name='enhanced_admin_users'),
    path('admin/users/<int:user_id>/', AdminUserManagementView.as_view(), name='admin_user_management'),
    
    # Gematria AI
    path('gematria/interpret/', GematriaInterpretationView.as_view(), name='gematria_interpret'),
    
    # Astrology AI Interpretation
    path('astrology/ai-status/', AstrologyAIStatusView.as_view(), name='astrology_ai_status'),
    path('astrology/interpret/natal/', AstrologyInterpretNatalView.as_view(), name='astrology_interpret_natal'),
    path('astrology/interpret/transits/', AstrologyInterpretTransitsView.as_view(), name='astrology_interpret_transits'),
    path('astrology/interpret/progressions/', AstrologyInterpretProgressionsView.as_view(), name='astrology_interpret_progressions'),
    path('astrology/interpret/solar-return/', AstrologyInterpretSolarReturnView.as_view(), name='astrology_interpret_solar_return'),
    path('astrology/interpret/psychological/', AstrologyInterpretPsychologicalView.as_view(), name='astrology_interpret_psychological'),
    path('astrology/interpret/situation/', AstrologyQuerySituationView.as_view(), name='astrology_interpret_situation'),
    
    # Astrology AI Interpretation Management
    path('astrology/interpretations/', AstrologyAIInterpretationListView.as_view(), name='astrology_interpretations_list'),
    path('astrology/interpretations/<int:interpretation_id>/', AstrologyAIInterpretationDetailView.as_view(), name='astrology_interpretation_detail'),
    
    # ========== TAROT HOLÍSTICO AI (Multi-Provider) ==========
    # Endpoints de interpretación simbólica educativa (NO clínica)
    path('ai/tarot/schema/', TarotHolisticSchemaView.as_view(), name='tarot_holistic_schema'),
    path('ai/tarot/provider-status/', TarotHolisticProviderStatusView.as_view(), name='tarot_holistic_provider_status'),
    path('ai/tarot/interpretCard/', TarotInterpretCardView.as_view(), name='tarot_interpret_card'),
    path('ai/tarot/interpretSpread/', TarotInterpretSpreadView.as_view(), name='tarot_interpret_spread'),
    path('ai/tarot/consent-check/', TarotHolisticConsentCheckView.as_view(), name='tarot_holistic_consent_check'),
    
    # Tests modulares (orden importante: rutas específicas primero)
    path('tests/', AvailableTestsView.as_view(), name='available_tests'),
    path('tests/phq9/submit/', PHQ9SubmitView.as_view(), name='phq9_submit'),
    path('tests/gad7/submit/', GAD7SubmitView.as_view(), name='gad7_submit'),
    path('tests/bai/submit/', BAISubmitView.as_view(), name='bai_submit'),
    path('tests/isi/submit/', ISISubmitView.as_view(), name='isi_submit'),
    path('tests/bdi2/submit/', BDI2SubmitView.as_view(), name='bdi2_submit'),
    path('tests/submit/', ProcessTestSubmissionView.as_view(), name='process_test_submission'),
    path('tests/execute/', ExecuteTestView.as_view(), name='execute_test'),
    path('tests/results/', TestResultsView.as_view(), name='test_results'),
    path('tests/results/<int:pk>/', TestResultDetailView.as_view(), name='test_result_detail'),
    path('tests/stats/', UserTestStatsView.as_view(), name='test_stats'),
    path('tests/grant-access/', GrantTestAccessView.as_view(), name='grant_test_access'),
    path('tests/assign-to-patient/', AssignTestToPatientView.as_view(), name='assign_test_to_patient'),
    path('tests/assignments/<int:assignment_id>/archive/', ArchiveTestAssignmentView.as_view(), name='archive_test_assignment'),
    path('tests/unassign-from-patient/', UnassignTestFromPatientView.as_view(), name='unassign_test_from_patient'),
    path('tests/patient-previous/', PatientPreviousTestsView.as_view(), name='patient_previous_tests'),
    # Assignment workflow (MCMI4 Mystic)
    path('assignments', AssignmentListCreateView.as_view(), name='assignment_list_create'),
    path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment_detail'),
    path('assignments/<int:assignment_id>/start', AssignmentStartView.as_view(), name='assignment_start'),
    path('assignments/<int:assignment_id>/submit', AssignmentSubmitView.as_view(), name='assignment_submit'),
    path('assignments/<int:assignment_id>/compute', AssignmentComputeView.as_view(), name='assignment_compute'),
    path('assignments/<int:assignment_id>/results', AssignmentResultsView.as_view(), name='assignment_results'),
    path('assignments/<int:assignment_id>/reset', AssignmentResetView.as_view(), name='assignment_reset'),
    # Therapist -> Patient notes (unidirectional)
    path('patient-notes/', PatientNotesView.as_view(), name='patient_notes'),
    path('tests/<str:code>/', TestModuleDetailView.as_view(), name='test_detail'),
    
    # AnalysisRecord core (núcleo normalizado de análisis)
    path('analysis-records/', AnalysisRecordListCreateView.as_view(), name='analysisrecord_list_create'),
    path('analysis-records/<uuid:pk>/', AnalysisRecordDetailView.as_view(), name='analysisrecord_detail'),
    path('analysis-records/<uuid:pk>/annotations/', UpdateAnalysisAnnotationsView.as_view(), name='analysisrecord_annotations'),
    
    # Motor de Síntesis Holística Evaluativa (MSHE)
    path('analysis-records/holistic-synthesis/', HolisticSynthesisView.as_view(), name='holistic_synthesis'),
    path('therapist/holistic-config/', TherapistHolisticConfigView.as_view(), name='therapist_holistic_config'),
    
    # Asistente IA para SCID-5 Holístico
    path('analysis-records/scid5-ai-assistant/', SCID5AIAssistantView.as_view(), name='scid5_ai_assistant'),
    
    # ========== FEDERACIÓN HOLÍSTICA (Phase-1) ==========
    # Endpoint read-only para lectura federada cross-workspace (hubs MSHE/SCDF/SCID-5)
    path('federation/hub-feed/', FederationHubFeedView.as_view(), name='federation_hub_feed'),

    # Dominio bio-emocional & árbol transgeneracional (aislado)
    path('bioemotional/', include('api.bioemotional.urls', namespace='bioemotional')),

    # Resonancia Ancestral (observaciones simbólicas manuales, sin inferencias)
    path('resonancia/observations/', ResonanciaObservationListCreateView.as_view(), name='resonancia_observations'),
    path('resonancia/observations/<uuid:pk>/', ResonanciaObservationDetailView.as_view(), name='resonancia_observation_detail'),
    path('resonancia/relations/', ResonanciaRelationListCreateView.as_view(), name='resonancia_relations'),

    # Estado simbolico estructural (TreeStructuralState v0.1)
    path('symbolic/tree-structural-state/', TreeStructuralStateView.as_view(), name='tree_structural_state'),
    
    # Astrology Core (astronomical calculations only)
    path('therapist/', include('astrology.api.urls')),
    
    # Symbolic Interpreter AI (read-only, non-clinical)
    path('symbolic-interpreter/generate/', generate_symbolic_interpretation_view, name='symbolic_interpreter_generate'),
    path('symbolic-interpreter/status/', symbolic_interpreter_status_view, name='symbolic_interpreter_status'),
    
    # Resource Access Core
    path('resources/my/', MyResourcesView.as_view(), name='my_resources'),
    path('patients/<int:patient_id>/resources/assign/', AssignResourceToPatientView.as_view(), name='assign_resource_to_patient'),
    path('resources/<int:resource_id>/acquire/', AcquireResourceView.as_view(), name='acquire_resource'),
    
    # SWM MCMI-4 Místico (Specialized Workspace Module)
    path('swm/mcmi4/', include('swm.mcmi4.urls', namespace='swm_mcmi4')),
    
    # SWM MCMI-4 Reflection (Experiential Reflection Module)
    path('swm/mcmi4-reflection/', include('swm.mcmi4_reflection.urls', namespace='swm_mcmi4_reflection')),
    
    # SWM Tarot Evolutivo (Symbolic Tarot Workspace)
    path('swm/tarot/', include('swm.tarot.urls', namespace='swm_tarot')),
    
    # SWM Cábala Aplicada (Tree of Life Workspace)
    path('swm/cabala/', include('swm.cabala.urls', namespace='swm_cabala')),
    
    # SWM Transgeneracional Profundo (Psychogenealogy Workspace)
    path('swm/transgenerational/', include('swm.transgenerational.urls', namespace='swm_transgenerational')),

    # SWM Auditoría de Armonía Sefirótica (SHA)
    path('swm/sha/', include('swm.sha.urls', namespace='swm_sha')),
    
    # Active Inquiry Engine (Patient context collection)
    path('inquiry/', include('api.inquiry.urls')),
    
    # AI Engine (Therapeutic interpretation with GPT-4 + RAG)
    path('ai-engine/', include('api.ai_engine.urls')),
]
