"""
Active Inquiry Engine - Admin Configuration
"""

from django.contrib import admin
from .models import InquiryDefinition, PatientInquiryResponse


@admin.register(InquiryDefinition)
class InquiryDefinitionAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'source_module', 'priority', 'question_type', 
        'category', 'is_active', 'valid_for_days'
    ]
    list_filter = ['source_module', 'priority', 'question_type', 'is_active']
    search_fields = ['code', 'question_text', 'question_text_short']
    ordering = ['source_module', 'priority', 'code']
    
    fieldsets = (
        ('Identificación', {
            'fields': ('code', 'source_module', 'priority', 'category', 'is_active')
        }),
        ('Pregunta', {
            'fields': ('question_type', 'question_text', 'question_text_short', 
                      'help_text', 'placeholder')
        }),
        ('Opciones (para choice/scale)', {
            'fields': ('choices', 'scale_labels'),
            'classes': ('collapse',)
        }),
        ('Validación y Trigger', {
            'fields': ('validation', 'trigger_condition', 'valid_for_days'),
            'classes': ('collapse',)
        }),
        ('Seguimiento', {
            'fields': ('follow_up',),
            'classes': ('collapse',)
        }),
        ('Configuración Avanzada', {
            'fields': ('dynamic', 'applies_per', 'sensitive', 'opt_out_visible'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PatientInquiryResponse)
class PatientInquiryResponseAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'get_inquiry_code', 'collected_at', 
        'collected_by', 'is_valid', 'expires_at'
    ]
    list_filter = ['is_valid', 'collected_by', 'inquiry__source_module']
    search_fields = ['patient__user__email', 'inquiry__code']
    ordering = ['-collected_at']
    raw_id_fields = ['patient', 'inquiry', 'session', 'collected_by_user', 'superseded_by']
    
    def get_inquiry_code(self, obj):
        return obj.inquiry.code
    get_inquiry_code.short_description = 'Inquiry Code'
    get_inquiry_code.admin_order_field = 'inquiry__code'
