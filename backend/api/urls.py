from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
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
    # Vistas de terapeutas
    PatientListCreateView,
    PatientDetailView,
    SessionListCreateView,
    SessionDetailView,
    TherapistNoteListCreateView,
    TherapistDashboardView,
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
    service_stats
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
    PatientPreviousTestsView
)
from .admin_views import (
    AdminCheckView,
    EnhancedAdminStatsView,
    EnhancedAdminUsersView,
    AdminUserManagementView
)

urlpatterns = [
    # Bienvenida
    path('', welcome_api, name='api_welcome'),
    
    # Autenticación
    path('login/', EmailOrUsernameAuthToken.as_view(), name='api_token_auth'),
    path('login/google/', GoogleOAuthView.as_view(), name='google_oauth'),
    path('register/therapist/', RegisterTherapistView.as_view(), name='register_therapist'),
    path('register/personal/', RegisterPersonalView.as_view(), name='register_personal'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('me/profile/', UpdateProfileView.as_view(), name='update_profile'),
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
    path('therapist/dashboard/', TherapistDashboardView.as_view(), name='therapist_dashboard'),
    path('therapist/patients/', PatientListCreateView.as_view(), name='patient_list_create'),
    path('therapist/patients/<int:pk>/', PatientDetailView.as_view(), name='patient_detail'),
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
    
    # Tests modulares (orden importante: rutas específicas primero)
    path('tests/', AvailableTestsView.as_view(), name='available_tests'),
    path('tests/execute/', ExecuteTestView.as_view(), name='execute_test'),
    path('tests/results/', TestResultsView.as_view(), name='test_results'),
    path('tests/results/<int:pk>/', TestResultDetailView.as_view(), name='test_result_detail'),
    path('tests/stats/', UserTestStatsView.as_view(), name='test_stats'),
    path('tests/grant-access/', GrantTestAccessView.as_view(), name='grant_test_access'),
    path('tests/patient-previous/', PatientPreviousTestsView.as_view(), name='patient_previous_tests'),
    path('tests/<str:code>/', TestModuleDetailView.as_view(), name='test_detail'),
]