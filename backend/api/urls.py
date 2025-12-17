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
    PatientPreviousTestsView,
    ProcessTestSubmissionView
)
from .gematria_views import GematriaInterpretationView
from .tarot_views import TarotAnalysisView
from .cabalistic_views import (
    SaveCabalisticAnalysisView,
    ListCabalisticAnalysesView,
    GenerateAndSaveTarotAnalysisView,
    KerykeionAnalysisView,
    CrossoverSynthesisView
)
from .admin_views import (
    AdminCheckView,
    EnhancedAdminStatsView,
    EnhancedAdminUsersView,
    AdminUserManagementView
)
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
    
    # Fichas
    path('fichas/', FichaListCreateView.as_view(), name='ficha_list_create'),
    path('fichas/<int:pk>/', FichaRetrieveView.as_view(), name='ficha_retrieve'),
    
    # Endpoints exclusivos para terapeutas
    path('therapist/patients/create/', CreatePatientWithAccountView.as_view(), name='create_patient_with_account'),
    path('therapist/dashboard/', TherapistDashboardView.as_view(), name='therapist_dashboard'),
    path('therapist/patients/', PatientListCreateView.as_view(), name='patient_list_create'),
    path('therapist/patients/<int:pk>/', PatientDetailView.as_view(), name='patient_detail'),
    path('therapist/patients/<int:pk>/profile/', TherapistPatientProfileView.as_view(), name='therapist_patient_profile'),
    path('therapist/patients/<int:pk>/profile/update/', TherapistUpdatePatientProfileView.as_view(), name='therapist_update_patient_profile'),
    path('therapist/patients/<int:pk>/profile/validation/', PatientProfileValidationView.as_view(), name='patient_profile_validation'),
    path('therapist/patients/<int:pk>/status/', PatientStatusUpdateView.as_view(), name='patient_status_update'),
    path('therapist/patients/<int:pk>/archive/', PatientArchiveView.as_view(), name='patient_archive'),
    path('therapist/patients/<int:id>/tarot-analysis/', TarotAnalysisView.as_view(), name='tarot_analysis'),
    path('therapist/patients/<int:id>/tarot-analysis/generate-and-save/', GenerateAndSaveTarotAnalysisView.as_view(), name='tarot_analysis_generate_and_save'),
    path('therapist/patients/<int:id>/cabalistic-analysis/', SaveCabalisticAnalysisView.as_view(), name='save_cabalistic_analysis'),
    path('therapist/patients/<int:id>/cabalistic-analyses/', ListCabalisticAnalysesView.as_view(), name='list_cabalistic_analyses'),
    path('therapist/patients/<int:id>/astrology-kerykeion/', KerykeionAnalysisView.as_view(), name='kerykeion_analysis'),
    path('therapist/patients/<int:id>/crossover/generate-and-save/', CrossoverSynthesisView.as_view(), name='crossover_synthesis'),
    path('therapist/sessions/', SessionListCreateView.as_view(), name='session_list_create'),
    path('therapist/sessions/<int:pk>/', SessionDetailView.as_view(), name='session_detail'),
    path('therapist/notes/', TherapistNoteListCreateView.as_view(), name='therapist_note_list_create'),
    
    # Pagos y suscripciones
    path('payments/create-checkout/', CreateCheckoutSessionView.as_view(), name='create_checkout'),
    path('payments/webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
    path('payments/cancel-subscription/', CancelSubscriptionView.as_view(), name='cancel_subscription'),
    path('payments/subscription-status/', SubscriptionStatusView.as_view(), name='subscription_status'),
    
    # ========== ADMIN ==========
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('admin/users/', AdminUsersView.as_view(), name='admin_users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    
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
    
    # Tests modulares (orden importante: rutas específicas primero)
    path('tests/', AvailableTestsView.as_view(), name='available_tests'),
    path('tests/submit/', ProcessTestSubmissionView.as_view(), name='process_test_submission'),
    path('tests/execute/', ExecuteTestView.as_view(), name='execute_test'),
    path('tests/results/', TestResultsView.as_view(), name='test_results'),
    path('tests/results/<int:pk>/', TestResultDetailView.as_view(), name='test_result_detail'),
    path('tests/stats/', UserTestStatsView.as_view(), name='test_stats'),
    path('tests/grant-access/', GrantTestAccessView.as_view(), name='grant_test_access'),
    path('tests/assign-to-patient/', AssignTestToPatientView.as_view(), name='assign_test_to_patient'),
    path('tests/patient-previous/', PatientPreviousTestsView.as_view(), name='patient_previous_tests'),
    path('tests/<str:code>/', TestModuleDetailView.as_view(), name='test_detail'),
    
    # AnalysisRecord core (núcleo normalizado de análisis)
    path('analysis-records/', AnalysisRecordListCreateView.as_view(), name='analysisrecord_list_create'),
    path('analysis-records/<uuid:pk>/', AnalysisRecordDetailView.as_view(), name='analysisrecord_detail'),

    # Dominio bio-emocional & árbol transgeneracional (aislado)
    path('bioemotional/', include('api.bioemotional.urls', namespace='bioemotional')),
    
    # Resource Access Core
    path('resources/my/', MyResourcesView.as_view(), name='my_resources'),
    path('patients/<int:patient_id>/resources/assign/', AssignResourceToPatientView.as_view(), name='assign_resource_to_patient'),
    path('resources/<int:resource_id>/acquire/', AcquireResourceView.as_view(), name='acquire_resource'),
]
