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

urlpatterns = [
    # Bienvenida
    path('', welcome_api, name='api_welcome'),
    
    # Autenticación
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('login/google/', GoogleOAuthView.as_view(), name='google_oauth'),
    path('register/therapist/', RegisterTherapistView.as_view(), name='register_therapist'),
    path('register/personal/', RegisterPersonalView.as_view(), name='register_personal'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    
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
]