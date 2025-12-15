from django.contrib import admin
from .models import (
    UserProfile, 
    Calculo, 
    Ficha, 
    Patient, 
    Session, 
    TherapistNote,
    ServiceCategory,
    Service,
    ServicePackage,
    PackageService,
    Booking,
    AvailableSlot,
    BlockedDate,
    Resource,
    UserResourceAccess,
)
from .test_models import TestModule, UserTestAccess, TestResult


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'user', 'user_type', 'subscription_status', 'created_at']
    list_filter = ['user_type', 'subscription_status']
    search_fields = ['full_name', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Calculo)
class CalculoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fecha_calculo', 'sistema')
    search_fields = ('nombre',)


@admin.register(Ficha)
class FichaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'usuario', 'sistema', 'creado_en')
    search_fields = ('nombre', 'usuario__username')


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'therapist', 'birth_date', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['full_name', 'email', 'therapist__username']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'therapist', 'session_date', 'session_type', 'duration_minutes']
    list_filter = ['session_type', 'session_date']
    search_fields = ['patient__full_name', 'therapist__username', 'notes']
    filter_horizontal = ['related_fichas']


@admin.register(TherapistNote)
class TherapistNoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'therapist', 'patient', 'created_at']
    list_filter = ['created_at', 'therapist']
    search_fields = ['title', 'content', 'therapist__username', 'patient__full_name']


# ========== ADMIN PARA SERVICIOS ==========

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'name', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['display_name', 'name']
    ordering = ['order', 'display_name']


class PackageServiceInline(admin.TabularInline):
    model = PackageService
    extra = 1


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'service_type', 'price_usd', 'price_eur', 'is_active', 'is_featured']
    list_filter = ['service_type', 'category', 'is_active', 'is_featured', 'is_bestseller']
    search_fields = ['name', 'short_description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    fieldsets = (
        ('Información Básica', {
            'fields': ('category', 'name', 'slug', 'service_type')
        }),
        ('Descripción', {
            'fields': ('short_description', 'full_description', 'benefits', 'includes')
        }),
        ('Precios', {
            'fields': ('price_usd', 'price_eur', 'has_discount', 'discount_price_usd', 'discount_price_eur', 'discount_label')
        }),
        ('Duración y Disponibilidad', {
            'fields': ('duration_value', 'duration_type', 'requires_booking', 'max_participants', 'platform')
        }),
        ('Estado', {
            'fields': ('is_active', 'is_featured', 'is_bestseller', 'order')
        }),
    )


@admin.register(ServicePackage)
class ServicePackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_usd', 'price_eur', 'discount_percentage', 'validity_months', 'is_active']
    list_filter = ['is_active', 'discount_percentage']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [PackageServiceInline]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['get_service_name', 'client_name', 'scheduled_date', 'status', 'payment_method', 'amount_paid', 'currency', 'created_at']
    list_filter = ['status', 'payment_method', 'payment_status', 'currency', 'scheduled_date']
    search_fields = ['client_name', 'client_email', 'client_phone']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    fieldsets = (
        ('Servicio', {
            'fields': ('user', 'service', 'package')
        }),
        ('Fecha y Hora', {
            'fields': ('scheduled_date', 'timezone')
        }),
        ('Cliente', {
            'fields': ('client_name', 'client_email', 'client_phone', 'client_notes')
        }),
        ('Pago', {
            'fields': ('currency', 'amount_paid', 'payment_method', 'payment_status', 
                      'stripe_payment_intent_id', 'paypal_order_id', 'bizum_transaction_id')
        }),
        ('Reunión', {
            'fields': ('meeting_link', 'admin_notes')
        }),
        ('Estado', {
            'fields': ('status', 'created_at', 'updated_at', 'completed_at')
        }),
    )


@admin.register(AvailableSlot)
class AvailableSlotAdmin(admin.ModelAdmin):
    list_display = ['get_day_of_week_display', 'start_time', 'end_time', 'timezone', 'is_active']
    list_filter = ['day_of_week', 'is_active']
    filter_horizontal = ['allowed_services']


@admin.register(BlockedDate)
class BlockedDateAdmin(admin.ModelAdmin):
    list_display = ['date', 'reason', 'is_full_day', 'start_time', 'end_time']
    list_filter = ['is_full_day', 'date']
    search_fields = ['reason']
    ordering = ['date']


@admin.register(TestModule)
class TestModuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'test_type', 'required_access_level', 'is_active', 'order']
    list_filter = ['test_type', 'required_access_level', 'is_active', 'available_for_therapists', 'available_for_personal']
    search_fields = ['name', 'code', 'description']
    ordering = ['order', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserTestAccess)
class UserTestAccessAdmin(admin.ModelAdmin):
    list_display = ['user', 'test_module', 'uses_count', 'current_month_uses', 'has_special_access', 'last_used']
    list_filter = ['has_special_access', 'test_module']
    search_fields = ['user__username', 'test_module__name']
    readonly_fields = ['created_at', 'updated_at']
    

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'test_module', 'client_name', 'is_favorite', 'is_archived', 'created_at']
    list_filter = ['test_module', 'is_favorite', 'is_archived', 'created_at']
    search_fields = ['user__username', 'test_module__name', 'client_name', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


# ========== RESOURCE ACCESS CORE ADMIN ==========

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'resource_type', 'access_level', 'is_active', 'created_at']
    list_filter = ['resource_type', 'access_level', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(UserResourceAccess)
class UserResourceAccessAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'source', 'assigned_by', 'created_at']
    list_filter = ['source', 'created_at']
    search_fields = ['user__username', 'resource__title', 'assigned_by__username']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
