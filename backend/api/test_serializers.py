from rest_framework import serializers
from .test_models import TestModule, UserTestAccess, TestResult


class TestModuleSerializer(serializers.ModelSerializer):
    """Serializer para módulos de tests"""
    is_available = serializers.SerializerMethodField()
    user_access = serializers.SerializerMethodField()
    
    class Meta:
        model = TestModule
        fields = [
            'id', 'code', 'name', 'description', 'test_type',
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
    class Meta:
        model = TestModule
        fields = ['id', 'code', 'name', 'description', 'test_type', 'icon']


class TestResultSerializer(serializers.ModelSerializer):
    """Serializer para resultados de tests"""
    test_module = SimpleTestModuleSerializer(read_only=True)
    test_module_name = serializers.CharField(source='test_module.name', read_only=True)
    test_module_code = serializers.CharField(source='test_module.code', read_only=True)
    patient_id = serializers.IntegerField(source='patient.id', read_only=True, allow_null=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = TestResult
        fields = [
            'id', 'test_module', 'test_module_name', 'test_module_code',
            'input_data', 'result_data', 'client_name', 'client_birth_date',
            'patient_id', 'patient_name',
            'notes', 'is_favorite', 'is_archived',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TestExecutionSerializer(serializers.Serializer):
    """Serializer para ejecutar un test"""
    test_module_code = serializers.CharField()
    input_data = serializers.JSONField()
    client_name = serializers.CharField(required=False, allow_blank=True)
    client_birth_date = serializers.DateField(required=False, allow_null=True)
    patient_id = serializers.IntegerField(required=False, allow_null=True, help_text='ID del paciente si se ejecuta desde la página del paciente')
    save_result = serializers.BooleanField(default=True)
