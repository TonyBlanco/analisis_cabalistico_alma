from rest_framework import serializers
from .test_models import TestModule, UserTestAccess, TestResult


class TestModuleSerializer(serializers.ModelSerializer):
    """Serializer para módulos de tests"""
    name = serializers.CharField(source='display_name', read_only=True)
    is_available = serializers.SerializerMethodField()
    user_access = serializers.SerializerMethodField()
    
    class Meta:
        model = TestModule
        fields = [
            'id', 'code', 'name', 'public_name', 'canonical_family', 'domain', 'is_internal',
            'description', 'test_type',
            'required_access_level', 'is_active',
            'available_for_therapists', 'available_for_personal',
            'uses_per_month', 'icon', 'order', 'estimated_duration',
            'requires_license', 'license_info',
            'is_available', 'user_access'
        ]
    
    def get_is_available(self, obj):
        """Verifica si el usuario actual tiene acceso"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_available_for_user(request.user)
        return False
    
    def get_user_access(self, obj):
        """Información de acceso del usuario"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                access = UserTestAccess.objects.get(
                    user=request.user,
                    test_module=obj
                )
                return {
                    'can_use': access.can_use_test(),
                    'uses_count': access.uses_count,
                    'current_month_uses': access.current_month_uses,
                    'monthly_limit': obj.uses_per_month,
                    'last_used': access.last_used,
                    'has_special_access': access.has_special_access
                }
            except UserTestAccess.DoesNotExist:
                # Crear acceso si no existe
                access = UserTestAccess.objects.create(
                    user=request.user,
                    test_module=obj
                )
                return {
                    'can_use': access.can_use_test(),
                    'uses_count': 0,
                    'current_month_uses': 0,
                    'monthly_limit': obj.uses_per_month,
                    'last_used': None,
                    'has_special_access': False
                }
        return None


class SimpleTestModuleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para TestModule en resultados"""
    name = serializers.CharField(source='display_name', read_only=True)
    class Meta:
        model = TestModule
        fields = ['id', 'code', 'name', 'description', 'test_type', 'icon']


class TestResultSerializer(serializers.ModelSerializer):
    """Serializer para resultados de tests"""
    test_module = SimpleTestModuleSerializer(read_only=True)
    test_module_name = serializers.SerializerMethodField()
    test_module_code = serializers.CharField(source='test_module.code', read_only=True)
    status = serializers.SerializerMethodField()
    patient_route = serializers.SerializerMethodField()
    patient_id = serializers.IntegerField(source='patient.id', read_only=True, allow_null=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = TestResult
        fields = [
            'id', 'test_module', 'test_module_name', 'test_module_code',
            'status', 'patient_route',
            'input_data', 'result_data', 'client_name', 'client_birth_date',
            'patient_id', 'patient_name',
            'notes', 'is_favorite', 'is_archived',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_test_module_name(self, obj):
        if obj.test_module:
            return obj.test_module.display_name
        # Fallback: try details/test_code
        try:
            if obj.details and isinstance(obj.details, dict):
                return obj.details.get('test_code') or obj.details.get('test_id')
        except Exception:
            pass
        return None

    def get_status(self, obj):
        # If this is an assignment-only marker, consider it pending; otherwise completed
        try:
            if getattr(obj, 'result_data', None) and (obj.result_data or {}).get('assignment_only') is True:
                return 'pending'
            if isinstance(getattr(obj, 'details', None), dict) and (obj.details or {}).get('legacy_assignment') is True:
                return 'pending'
        except Exception:
            pass
        return 'completed'

    def get_patient_route(self, obj):
        try:
            if obj.test_module and getattr(obj.test_module, 'code', None):
                return f"/dashboard/patient/tests/{obj.test_module.code}"
        except Exception:
            pass
        return None


class TestExecutionSerializer(serializers.Serializer):
    """Serializer para ejecutar un test"""
    test_module_code = serializers.CharField()
    input_data = serializers.JSONField()
    client_name = serializers.CharField(required=False, allow_blank=True)
    client_birth_date = serializers.DateField(required=False, allow_null=True)
    patient_id = serializers.IntegerField(required=False, allow_null=True, help_text='ID del paciente si se ejecuta desde la página del paciente')
    save_result = serializers.BooleanField(default=True)
