from rest_framework import serializers
from .models import (
    Calculo, Ficha, UserProfile, Patient, Session, TherapistNote,
    ServiceCategory, Service, ServicePackage, PackageService, 
    Booking, AvailableSlot, BlockedDate
)
from .birth_data_model import UserBirthData
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from datetime import datetime, timedelta


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para el perfil de usuario"""
    class Meta:
        model = UserProfile
        fields = [
            'user_type', 'full_name', 'phone', 'birth_date',
            'profession', 'specialization', 'license_number', 'years_of_experience',
            'subscription_status', 'subscription_start_date', 'subscription_end_date',
            'max_fichas_per_month', 'fichas_created_this_month'
        ]
        read_only_fields = ['subscription_status', 'subscription_start_date', 'subscription_end_date']


class UserBirthDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBirthData
        fields = [
            'full_name', 'birth_date', 'birth_time', 'birth_city', 'birth_country',
            'birth_latitude', 'birth_longitude', 'is_locked', 'unlock_requested'
        ]
        read_only_fields = []
    unlock_requested = serializers.BooleanField(read_only=True)
    unlock_requested = serializers.BooleanField(read_only=True)


class UserSerializer(serializers.ModelSerializer):
    """Serializer para usuario con perfil incluido"""
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class RegisterTherapistSerializer(serializers.ModelSerializer):
    """Serializer para registro de terapeutas"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    email = serializers.EmailField(required=True)
    
    # Campos del perfil
    full_name = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)
    profession = serializers.CharField(required=True)
    specialization = serializers.CharField(required=False, allow_blank=True)
    license_number = serializers.CharField(required=False, allow_blank=True)
    years_of_experience = serializers.IntegerField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'phone', 
                  'profession', 'specialization', 'license_number', 'years_of_experience']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value
    
    def create(self, validated_data):
        # Extraer datos del perfil
        profile_data = {
            'full_name': validated_data.pop('full_name'),
            'phone': validated_data.pop('phone'),
            'profession': validated_data.pop('profession'),
            'specialization': validated_data.pop('specialization', ''),
            'license_number': validated_data.pop('license_number', ''),
            'years_of_experience': validated_data.pop('years_of_experience'),
        }
        
        # Crear usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Actualizar perfil (se crea automáticamente por el signal)
        profile = user.profile
        profile.user_type = 'therapist'
        profile.full_name = profile_data['full_name']
        profile.phone = profile_data['phone']
        profile.profession = profile_data['profession']
        profile.specialization = profile_data['specialization']
        profile.license_number = profile_data['license_number']
        profile.years_of_experience = profile_data['years_of_experience']
        
        # Período de prueba de 14 días
        profile.subscription_status = 'trial'
        profile.subscription_start_date = datetime.now()
        profile.subscription_end_date = datetime.now() + timedelta(days=14)
        profile.max_fichas_per_month = 999999  # Ilimitado para terapeutas
        
        profile.save()
        
        return user


class RegisterPersonalSerializer(serializers.ModelSerializer):
    """Serializer para registro de usuarios personales"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    email = serializers.EmailField(required=True)
    
    # Campos del perfil
    full_name = serializers.CharField(required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    birth_date = serializers.DateField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'phone', 'birth_date']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value
    
    def create(self, validated_data):
        # Extraer datos del perfil
        profile_data = {
            'full_name': validated_data.pop('full_name'),
            'phone': validated_data.pop('phone', ''),
            'birth_date': validated_data.pop('birth_date'),
        }
        
        # Crear usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Actualizar perfil
        profile = user.profile
        profile.user_type = 'personal'
        profile.full_name = profile_data['full_name']
        profile.phone = profile_data['phone']
        profile.birth_date = profile_data['birth_date']
        
        # Período de prueba de 7 días
        profile.subscription_status = 'trial'
        profile.subscription_start_date = datetime.now()
        profile.subscription_end_date = datetime.now() + timedelta(days=7)
        profile.max_fichas_per_month = 10
        
        profile.save()
        
        return user


class CalculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calculo
        fields = ['id', 'nombre', 'fecha_nacimiento', 'sistema', 'esencia', 'expresion', 'destino', 'fecha_calculo']


class FichaSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = Ficha
        fields = ['id', 'usuario', 'nombre', 'fecha_nacimiento', 'sistema', 'resultado', 
                  'is_patient', 'patient_of', 'creado_en', 'actualizado_en']
        read_only_fields = ['usuario', 'creado_en', 'actualizado_en']


# ============ SERIALIZERS PARA TERAPEUTAS ============

from .models import Patient, Session, TherapistNote


class PatientSerializer(serializers.ModelSerializer):
    """Serializer para pacientes"""
    therapist = serializers.ReadOnlyField(source='therapist.username')
    total_sessions = serializers.SerializerMethodField()
    total_fichas = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['id', 'therapist', 'full_name', 'email', 'phone', 'birth_date',
                  'notes', 'is_active', 'total_sessions', 'total_fichas',
                  'created_at', 'updated_at']
        read_only_fields = ['therapist', 'created_at', 'updated_at']
    
    def get_total_sessions(self, obj):
        return obj.sessions.count()
    
    def get_total_fichas(self, obj):
        return Ficha.objects.filter(patient_of=obj.therapist, nombre__icontains=obj.full_name).count()


class SessionSerializer(serializers.ModelSerializer):
    """Serializer para sesiones terapéuticas"""
    therapist = serializers.ReadOnlyField(source='therapist.username')
    patient_name = serializers.ReadOnlyField(source='patient.full_name')
    
    class Meta:
        model = Session
        fields = ['id', 'therapist', 'patient', 'patient_name', 'session_date',
                  'session_type', 'duration_minutes', 'notes', 'private_notes',
                  'related_fichas', 'created_at', 'updated_at']
        read_only_fields = ['therapist', 'created_at', 'updated_at']
    
    def validate_patient(self, value):
        """Verificar que el paciente pertenece al terapeuta"""
        request = self.context.get('request')
        if request and request.user:
            if value.therapist != request.user:
                raise serializers.ValidationError("Este paciente no te pertenece.")
        return value


class TherapistNoteSerializer(serializers.ModelSerializer):
    """Serializer para notas del terapeuta"""
    therapist = serializers.ReadOnlyField(source='therapist.username')
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TherapistNote
        fields = ['id', 'therapist', 'patient', 'patient_name', 'ficha',
                  'title', 'content', 'tags', 'created_at', 'updated_at']
        read_only_fields = ['therapist', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else None
    
    def validate(self, data):
        """Al menos debe estar asociado a un paciente o una ficha"""
        if not data.get('patient') and not data.get('ficha'):
            raise serializers.ValidationError("La nota debe estar asociada a un paciente o una ficha.")
        return data


# ========== SERIALIZERS PARA SERVICIOS ==========

class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer para categorías de servicios"""
    services_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'display_name', 'description', 'icon', 
                  'order', 'is_active', 'services_count']
    
    def get_services_count(self, obj):
        return obj.services.filter(is_active=True).count()


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer para servicios"""
    category_name = serializers.CharField(source='category.display_name', read_only=True)
    duration_display = serializers.SerializerMethodField()
    price_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'slug', 'name', 'category', 'category_name', 'service_type',
            'short_description', 'full_description', 'benefits', 'includes',
            'price_usd', 'price_eur', 'has_discount', 'discount_price_usd', 
            'discount_price_eur', 'discount_label',
            'duration_value', 'duration_type', 'duration_display',
            'is_active', 'requires_booking', 'max_participants', 'platform',
            'is_featured', 'is_bestseller', 'price_display'
        ]
    
    def get_duration_display(self, obj):
        """Formato legible de duración"""
        if obj.duration_type == 'minutes':
            return f"{obj.duration_value} minutos"
        elif obj.duration_type == 'hours':
            return f"{obj.duration_value} hora{'s' if obj.duration_value > 1 else ''}"
        elif obj.duration_type == 'days':
            return f"{obj.duration_value} día{'s' if obj.duration_value > 1 else ''}"
        elif obj.duration_type == 'months':
            return f"{obj.duration_value} mes{'es' if obj.duration_value > 1 else ''}"
        elif obj.duration_type == 'years':
            return f"{obj.duration_value} año{'s' if obj.duration_value > 1 else ''}"
        else:
            return "Acceso de por vida"
    
    def get_price_display(self, obj):
        """Precios con descuento si aplica"""
        return {
            'usd': {
                'original': float(obj.price_usd),
                'current': float(obj.discount_price_usd or obj.price_usd) if obj.has_discount else float(obj.price_usd),
                'has_discount': obj.has_discount,
                'discount_label': obj.discount_label if obj.has_discount else None
            },
            'eur': {
                'original': float(obj.price_eur),
                'current': float(obj.discount_price_eur or obj.price_eur) if obj.has_discount else float(obj.price_eur),
                'has_discount': obj.has_discount,
                'discount_label': obj.discount_label if obj.has_discount else None
            }
        }


class PackageServiceSerializer(serializers.ModelSerializer):
    """Serializer para servicios dentro de un paquete"""
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_slug = serializers.CharField(source='service.slug', read_only=True)
    
    class Meta:
        model = PackageService
        fields = ['service', 'service_name', 'service_slug', 'quantity']


class ServicePackageSerializer(serializers.ModelSerializer):
    """Serializer para paquetes de servicios"""
    package_services = PackageServiceSerializer(source='packageservice_set', many=True, read_only=True)
    savings_usd = serializers.SerializerMethodField()
    savings_eur = serializers.SerializerMethodField()
    
    class Meta:
        model = ServicePackage
        fields = [
            'id', 'slug', 'name', 'description', 'package_services',
            'price_usd', 'price_eur', 'discount_percentage',
            'validity_months', 'is_active', 'savings_usd', 'savings_eur'
        ]
    
    def get_savings_usd(self, obj):
        """Calcular ahorro en USD"""
        total_individual = sum(
            ps.service.price_usd * ps.quantity 
            for ps in obj.packageservice_set.all()
        )
        return float(total_individual - obj.price_usd)
    
    def get_savings_eur(self, obj):
        """Calcular ahorro en EUR"""
        total_individual = sum(
            ps.service.price_eur * ps.quantity 
            for ps in obj.packageservice_set.all()
        )
        return float(total_individual - obj.price_eur)


class BookingSerializer(serializers.ModelSerializer):
    """Serializer para reservas"""
    service_name = serializers.CharField(source='get_service_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_email', 'service', 'package', 'service_name',
            'scheduled_date', 'timezone', 'client_name', 'client_email', 
            'client_phone', 'client_notes', 'admin_notes',
            'currency', 'amount_paid', 'payment_method', 'payment_status',
            'stripe_payment_intent_id', 'paypal_order_id', 'bizum_transaction_id',
            'meeting_link', 'status', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validar que se seleccione servicio o paquete (no ambos)"""
        if data.get('service') and data.get('package'):
            raise serializers.ValidationError("Debe seleccionar servicio o paquete, no ambos.")
        if not data.get('service') and not data.get('package'):
            raise serializers.ValidationError("Debe seleccionar un servicio o paquete.")
        
        # Validar que la fecha no sea en el pasado
        if data.get('scheduled_date') and data['scheduled_date'] < datetime.now():
            raise serializers.ValidationError("La fecha de reserva no puede ser en el pasado.")
        
        return data


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer simplificado para crear reservas desde el frontend"""
    class Meta:
        model = Booking
        fields = [
            'service', 'package', 'scheduled_date', 'timezone',
            'client_name', 'client_email', 'client_phone', 'client_notes',
            'currency', 'payment_method'
        ]
    
    def create(self, validated_data):
        """Crear reserva y calcular el monto"""
        request = self.context.get('request')
        validated_data['user'] = request.user if request and request.user.is_authenticated else None
        
        # Calcular monto según servicio o paquete
        currency = validated_data.get('currency', 'USD')
        if validated_data.get('service'):
            validated_data['amount_paid'] = validated_data['service'].get_price(currency)
        elif validated_data.get('package'):
            validated_data['amount_paid'] = validated_data['package'].price_usd if currency == 'USD' else validated_data['package'].price_eur
        
        return super().create(validated_data)


class AvailableSlotSerializer(serializers.ModelSerializer):
    """Serializer para horarios disponibles"""
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    allowed_services_names = serializers.SerializerMethodField()
    
    class Meta:
        model = AvailableSlot
        fields = [
            'id', 'day_of_week', 'day_name', 'start_time', 'end_time',
            'timezone', 'allowed_services', 'allowed_services_names', 'is_active'
        ]
    
    def get_allowed_services_names(self, obj):
        return [service.name for service in obj.allowed_services.all()]


class BlockedDateSerializer(serializers.ModelSerializer):
    """Serializer para fechas bloqueadas"""
    class Meta:
        model = BlockedDate
        fields = ['id', 'date', 'reason', 'is_full_day', 'start_time', 'end_time']

