from rest_framework import serializers
from .models import (
    Calculo,
    Ficha,
    UserProfile,
    Patient,
    Session,
    PatientMessage,
    ServiceCategory,
    Service,
    ServicePackage,
    PackageService,
    Booking,
    AvailableSlot,
    BlockedDate,
    AnalysisRecord,
    CabalisticAnalysis,
    Resource,
    UserResourceAccess,
    TherapistHolisticConfig,
    ResonanciaObservation,
    ResonanciaRelation,
)
from .birth_data_model import UserBirthData
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from datetime import datetime, timedelta


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer básico para el perfil de usuario (uso admin/backend)."""

    class Meta:
        model = UserProfile
        fields = [
            "user_type",
            "full_name",
            "phone",
            "birth_date",
            "profession",
            "specialization",
            "license_number",
            "years_of_experience",
            "clinical_mode_requested",
            "clinical_mode_enabled",
            "clinical_credential_verified_at",
            "subscription_status",
            "subscription_start_date",
            "subscription_end_date",
            "max_fichas_per_month",
            "fichas_created_this_month",
        ]
        read_only_fields = ["subscription_status", "subscription_start_date", "subscription_end_date", "clinical_mode_enabled", "clinical_credential_verified_at"]


class UserProfileDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para el endpoint público de perfil `/api/profile/me/`.

    Reglas:
    - `legal_full_name` requerido cuando se establece por primera vez.
    - Debe contener al menos 2 palabras.
    - Máximo 2 cambios de nombre controlados por `name_change_count`.
    - `profile_version` se incrementa en cada actualización válida (se gestiona en la vista).
    - CORE RULE: Si se proporciona birth_city/birth_country, SE RESUELVEN coordenadas automáticamente.
    """

    email = serializers.EmailField(source="user.email", read_only=True)
    biologicalSex = serializers.ChoiceField(
        source="biological_sex",
        choices=UserProfile._meta.get_field("biological_sex").choices,
        required=False,
    )
    genderIdentity = serializers.ChoiceField(
        source="gender_identity",
        choices=UserProfile._meta.get_field("gender_identity").choices,
        required=False,
    )

    class Meta:
        model = UserProfile
        fields = [
            "legal_full_name",
            "full_name",
            "phone",
            "biologicalSex",
            "genderIdentity",
            "birth_date",
            "birth_time",
            "birth_city",
            "birth_country",
            "birth_latitude",
            "birth_longitude",
            "birth_timezone",
            "profile_version",
            "name_change_count",
            "consent_accepted_at",
            "user_type",
            "email",
            "clinical_mode_requested",
            "clinical_mode_enabled",
        ]
        read_only_fields = [
            "profile_version",
            "name_change_count",
            "consent_accepted_at",
            "user_type",
            "email",
            "clinical_mode_requested",
            "clinical_mode_enabled",
            # birth_timezone es manejado por geo-resolución, no por el usuario
        ]

    def validate_legal_full_name(self, value: str) -> str:
        """
        Validación estricta del nombre legal:
        - Requerido si se envía por primera vez.
        - Mínimo 2 palabras.
        """
        name = (value or "").strip()
        if not name:
            # Permitimos vacío solo si ya existe uno almacenado (no se está cambiando)
            instance: UserProfile = self.instance
            if instance and instance.legal_full_name:
                return instance.legal_full_name
            raise serializers.ValidationError("El nombre legal completo es obligatorio.")

        words = [w for w in name.split() if w]
        if len(words) < 2:
            raise serializers.ValidationError(
                "El nombre legal debe contener al menos 2 palabras (nombre y apellidos)."
            )
        return name

    def validate(self, attrs):
        """
        Control de cambios de nombre y geo-resolución de coordenadas.
        
        REGLA CORE: Si hay birth_city o birth_country, DEBEN resolverse coordenadas.
        """
        instance: UserProfile = self.instance
        if not instance:
            return attrs

        # === Control de cambios de nombre ===
        new_name = attrs.get("legal_full_name")
        if new_name is not None:
            current_name = (instance.legal_full_name or "").strip()
            candidate = new_name.strip()

            if current_name and candidate and candidate != current_name:
                # Nombre está cambiando
                if instance.name_change_count is not None and instance.name_change_count >= 2:
                    raise serializers.ValidationError(
                        {
                            "legal_full_name": (
                                "Cambios de nombre bloqueados (máximo 2 cambios alcanzado). "
                                "Contacta con soporte si necesitas ayuda adicional."
                            )
                        }
                    )
                # Marcamos que debemos incrementar el contador en update()
                attrs["_increment_name_change_count"] = True

        # === Geo-resolución de coordenadas (CORE RULE) ===
        # Si se proporciona city o country, resolver coordenadas
        new_city = attrs.get("birth_city")
        new_country = attrs.get("birth_country")
        
        # Detectar si la ubicación está cambiando
        city_changing = new_city is not None and new_city != (instance.birth_city or "")
        country_changing = new_country is not None and new_country != (instance.birth_country or "")
        location_changing = city_changing or country_changing
        
        # Si la ubicación cambia, necesitamos resolver coordenadas
        if location_changing:
            # Determinar ciudad/país final
            final_city = new_city if new_city is not None else instance.birth_city
            final_country = new_country if new_country is not None else instance.birth_country
            
            # Si hay ciudad o país, resolver coordenadas
            if final_city or final_country:
                # El usuario no proporcionó coordenadas manualmente?
                manual_lat = attrs.get("birth_latitude")
                manual_lng = attrs.get("birth_longitude")
                
                if manual_lat is None or manual_lng is None:
                    # Resolver coordenadas automáticamente
                    from .geocoding_utils import geocode_city, GeoResolutionError
                    
                    geo_result = geocode_city(final_city, final_country)
                    
                    if geo_result:
                        attrs["birth_latitude"] = geo_result["latitude"]
                        attrs["birth_longitude"] = geo_result["longitude"]
                        attrs["birth_timezone"] = geo_result["timezone"]
                        # Normalizar ciudad/país si es posible
                        if geo_result.get("city"):
                            attrs["birth_city"] = geo_result["city"]
                        if geo_result.get("country"):
                            attrs["birth_country"] = geo_result["country"]
                    else:
                        # FALLO DE RESOLUCIÓN - error crítico
                        location_str = f"{final_city}, {final_country}" if final_country else final_city
                        raise serializers.ValidationError({
                            "birth_city": (
                                f"No se pudieron resolver las coordenadas para: {location_str}. "
                                f"Verifica que el nombre de la ciudad y país sean correctos."
                            )
                        })

        return attrs

    def update(self, instance: UserProfile, validated_data):
        # Bandera interna para incrementar contador de cambios de nombre
        increment_name_change = validated_data.pop("_increment_name_change_count", False)

        # Asignar campos simples
        for field in [
            "legal_full_name",
            "full_name",
            "birth_date",
            "birth_time",
            "birth_city",
            "birth_country",
            "birth_latitude",
            "birth_longitude",
            "birth_timezone",
        ]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        # Incrementar contador de cambios de nombre si aplica
        if increment_name_change:
            current_count = instance.name_change_count or 0
            instance.name_change_count = current_count + 1

        instance.save()
        return instance


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


class PatientMessageSerializer(serializers.ModelSerializer):
    # contract: expose therapist_id and patient_id as integers
    therapist_id = serializers.IntegerField(source='therapist.id', read_only=True)
    patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    # Accept patient via `patient_id` in input
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), write_only=True)

    class Meta:
        model = PatientMessage
        fields = ['id', 'therapist_id', 'patient_id', 'patient', 'content', 'created_at', 'is_archived']
        read_only_fields = ['id', 'therapist_id', 'patient_id', 'created_at', 'is_archived']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Remove write-only field from representation
        rep.pop('patient', None)
        return rep


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
    # Check del alta: solicita el modo clínico (médico/psiquiatra). NO lo activa;
    # la activación requiere verificación de credencial por un administrador.
    clinical_mode_requested = serializers.BooleanField(required=False, default=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'phone', 
                  'profession', 'specialization', 'license_number', 'years_of_experience',
                  'clinical_mode_requested']
    
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
            'clinical_mode_requested': validated_data.pop('clinical_mode_requested', False),
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
        # Modo clínico: el alta solo REGISTRA la solicitud. La activación
        # (clinical_mode_enabled) la realiza un administrador tras verificar la
        # credencial médica/psiquiátrica. El rail anti-fraude nunca se levanta.
        profile.clinical_mode_requested = profile_data['clinical_mode_requested']
        
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
    """Serializer para pacientes - Ficha clínica holística"""
    therapist = serializers.ReadOnlyField(source='therapist.username')
    total_sessions = serializers.SerializerMethodField()
    total_fichas = serializers.SerializerMethodField()
    coordinates_valid = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            # Identificación
            'id', 'therapist', 'user',
            # Datos personales
            'first_name', 'last_name', 'full_name', 'email', 'phone', 'avatar',
            # Datos astrológicos/cabalísticos
            'birth_date', 'birth_time', 'birth_place', 'hebrew_name',
            # Coordenadas geográficas (CORE FIELDS para astrología)
            'birth_city', 'birth_country', 'birth_latitude', 'birth_longitude', 'birth_timezone',
            'coordinates_valid',
            # Datos clínicos
            'main_complaint', 'clinical_history',
            # Plan de tratamiento
            'treatment_plan',
            # Nivel de terapia cabalística
            'therapy_level',
            # Notas y estado
            'notes', 'is_active',
            # Therapy status (ownership management)
            'therapy_status', 'pause_reason', 'status_changed_at', 'status_changed_by',
            # Estadísticas
            'total_sessions', 'total_fichas',
            # Metadata
            'created_at', 'updated_at'
        ]
        read_only_fields = ['therapist', 'user', 'full_name', 'created_at', 'updated_at', 'status_changed_at', 'status_changed_by', 'coordinates_valid']

    def get_total_sessions(self, obj):
        return obj.sessions.count()

    def get_total_fichas(self, obj):
        return Ficha.objects.filter(patient_of=obj.therapist, nombre__icontains=obj.full_name).count()
    
    def get_coordinates_valid(self, obj):
        """Indica si el paciente tiene coordenadas válidas para análisis astrológicos"""
        return obj.birth_latitude is not None and obj.birth_longitude is not None

    def validate(self, attrs):
        """
        Geo-resolución automática de coordenadas para pacientes si cambia la ciudad/país.
        """
        instance = self.instance
        
        new_city = attrs.get("birth_city")
        new_country = attrs.get("birth_country")
        
        # Determinar valores actuales
        current_city = instance.birth_city if instance else None
        current_country = instance.birth_country if instance else None
        
        # Determinar valores finales
        final_city = new_city if new_city is not None else current_city
        final_country = new_country if new_country is not None else current_country
        
        # Detectar cambios
        city_changing = new_city is not None and new_city != current_city
        country_changing = new_country is not None and new_country != current_country
        
        # Detectar si faltan coordenadas en el registro existente (reparación)
        missing_coords = instance and (instance.birth_latitude is None or instance.birth_longitude is None)
        
        if city_changing or country_changing or (missing_coords and final_city):
            # Solo intentamos geocodificar si hay al menos ciudad y no se están enviando coordenadas manuales
            if final_city and (attrs.get("birth_latitude") is None or attrs.get("birth_longitude") is None):
                from .geocoding_utils import geocode_city
                
                geo_result = geocode_city(final_city, final_country)
                
                if geo_result:
                    attrs["birth_latitude"] = geo_result["latitude"]
                    attrs["birth_longitude"] = geo_result["longitude"]
                    attrs["birth_timezone"] = geo_result["timezone"]
                    # Normalizar nombres
                    if geo_result.get("city"): attrs["birth_city"] = geo_result["city"]
                    if geo_result.get("country"): attrs["birth_country"] = geo_result["country"]
                else:
                    raise serializers.ValidationError({
                        "birth_city": f"No se pudieron resolver las coordenadas para: {final_city}. Verifica el nombre."
                    })
        
        return attrs


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


from api.test_models import TestModule
from api.validators.test_execution import (
    validate_execution_mode,
    validate_role_for_execution,
    validate_clinical_context,
    validate_patient_ownership,
)


class CabalisticAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = CabalisticAnalysis
        fields = [
            'id',
            'analysis_type',
            'input_data',
            'result_data',
            'summary',
            'therapist_notes',
            'created_at',
        ]
        read_only_fields = fields

class AnalysisRecordSerializer(serializers.ModelSerializer):
    """
    Serializer para AnalysisRecord con validaciones defensivas.

    Reglas clave:
    - Admin nunca es actor.
    - execution_mode no se acepta desde el request: se deriva desde module_code + contexto.
    - therapist_clinical requiere patient_id + therapist_id + ownership + no auto-evaluación.
    """

    cabalistic_analysis = CabalisticAnalysisSerializer(read_only=True)

    class Meta:
        model = AnalysisRecord
        fields = [
            'id',
            'kind',
            'module_code',
            'subject_user',
            'created_by_user',
            'role_context',
            'execution_mode',
            'patient',
            'therapist',
            'birth_data_snapshot',
            'algorithm_snapshot',
            'raw_input',
            'computed_result',
            'legacy_output',
            'therapist_annotations',
            'visibility',
            'created_at',
            'test_result',
            'cabalistic_analysis',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'execution_mode',
            'therapist',
            'created_by_user',
            'computed_result',
            'legacy_output',
            'test_result',
            'cabalistic_analysis',
        ]

    def validate(self, data):
        """
        Validaciones cruzadas a nivel de objeto.
        """
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado.")

        profile = getattr(user, 'profile', None)
        if not profile:
            raise serializers.ValidationError("Perfil de usuario inválido.")

        # Admin nunca es actor
        if profile.is_admin or user.is_staff or user.is_superuser:
            raise serializers.ValidationError("Admin no puede ser actor de AnalysisRecord.")

        kind = data.get('kind')
        module_code = data.get('module_code')
        patient = data.get('patient')

        # Derivar execution_mode solo para clinical_test
        execution_mode = None
        if kind == 'clinical_test':
            try:
                test_module = TestModule.objects._safe_testmodule_queryset().get(code=module_code)
            except TestModule.DoesNotExist:
                raise serializers.ValidationError({"module_code": "TestModule no encontrado para este código."})

            # Regla de derivación:
            # - Si hay patient --> therapist_clinical
            # - Si no hay patient --> patient_self
            execution_mode = 'therapist_clinical' if patient else 'patient_self'

            # Validar contra reglas globales ya existentes
            validate_execution_mode(test_module, execution_mode)
            validate_role_for_execution(user, execution_mode)

            if execution_mode == 'therapist_clinical':
                # patient_id requerido
                validate_clinical_context(user, patient_id=patient.id if patient else None)
                # ownership + no auto-evaluación
                validate_patient_ownership(therapist_user=user, patient_id=patient.id)

        data['execution_mode'] = execution_mode
        data['created_by_user'] = user

        if kind == 'clinical_test' and execution_mode == 'therapist_clinical':
            data['therapist'] = user

        # Validar snapshots mínimos
        birth = data.get('birth_data_snapshot') or {}
        required_birth_fields = [
            'legal_name',
            'birth_date',
            'birth_time',
            'city',
            'country',
            'lat',
            'lng',
            'timezone',
            'geocode_source',
        ]
        missing_birth = [f for f in required_birth_fields if f not in birth]
        if missing_birth:
            raise serializers.ValidationError({
                'birth_data_snapshot': f"Faltan campos requeridos en birth_data_snapshot: {', '.join(missing_birth)}"
            })

        algo = data.get('algorithm_snapshot') or {}
        required_algo = ['engine', 'version', 'params']
        missing_algo = [f for f in required_algo if f not in algo]
        if missing_algo:
            raise serializers.ValidationError({
                'algorithm_snapshot': f"Faltan campos requeridos en algorithm_snapshot: {', '.join(missing_algo)}"
            })

        return data


class UserResourceAccessSerializer(serializers.ModelSerializer):
    """Serializer for UserResourceAccess model."""
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    resource_type = serializers.CharField(source='resource.resource_type', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True, allow_null=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserResourceAccess
        fields = [
            'id',
            'user',
            'user_username',
            'resource',
            'resource_title',
            'resource_type',
            'source',
            'assigned_by',
            'assigned_by_username',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        """Validate source and assigned_by consistency."""
        source = data.get('source')
        assigned_by = data.get('assigned_by')
        
        if source == 'assigned_by_therapist' and not assigned_by:
            raise serializers.ValidationError({
                'assigned_by': 'Required when source is assigned_by_therapist'
            })
        
        if source != 'assigned_by_therapist' and assigned_by:
            raise serializers.ValidationError({
                'assigned_by': 'Should only be set when source is assigned_by_therapist'
            })
        
        return data


class AssignResourceSerializer(serializers.Serializer):
    """Serializer for assigning a resource to a patient."""
    resource_id = serializers.UUIDField(required=True)
    
    def validate_resource_id(self, value):
        if not Resource.objects.filter(id=value).exists():
            raise serializers.ValidationError('Resource does not exist')
        return value


class AnalysisRecordSerializer(serializers.ModelSerializer):
    """Serializer for AnalysisRecord model with ownership validation."""
    
    class Meta:
        model = AnalysisRecord
        fields = [
            'id', 'kind', 'module_code', 'role_context', 'execution_mode',
            'birth_data_snapshot', 'algorithm_snapshot', 'raw_input', 'computed_result',
            'legacy_output', 'therapist_annotations', 'visibility', 'created_at',
            'created_by_user', 'subject_user', 'therapist', 'patient', 'test_result', 'cabalistic_analysis'
        ]
        read_only_fields = ['id', 'created_at', 'created_by_user']
    
    def validate(self, data):
        """Validate ownership and required fields based on execution_mode."""
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError('Request context required')
        
        user = request.user
        execution_mode = data.get('execution_mode')
        
        # Set created_by_user
        data['created_by_user'] = user
        
        # Validate execution_mode
        if execution_mode == 'therapist_clinical':
            # Must have therapist and patient
            if not data.get('therapist'):
                data['therapist'] = user
            if not data.get('patient'):
                raise serializers.ValidationError('patient is required for therapist_clinical mode')
            
            # Validate therapist owns patient
            patient = data.get('patient')
            if patient and patient.therapist != user:
                raise serializers.ValidationError('You do not own this patient')
        
        elif execution_mode == 'patient_self':
            # Patient executing on themselves
            data['subject_user'] = user
        
        # Validate required snapshots
        if not data.get('birth_data_snapshot'):
            raise serializers.ValidationError('birth_data_snapshot is required')
        if not data.get('algorithm_snapshot'):
            raise serializers.ValidationError('algorithm_snapshot is required')
        
        return data


class TherapistHolisticConfigSerializer(serializers.ModelSerializer):
    """Serializer for TherapistHolisticConfig model."""
    
    class Meta:
        model = TherapistHolisticConfig
        fields = ['therapist', 'weights', 'created_at', 'updated_at']
        read_only_fields = ['therapist', 'created_at', 'updated_at']
    
    def validate_weights(self, value):
        """Validate that weights sum to 1.0."""
        if not isinstance(value, dict):
            raise serializers.ValidationError('Weights must be a dictionary')
        
        total = sum(value.values())
        if abs(total - 1.0) > 0.001:
            raise serializers.ValidationError(f'Weights must sum to 1.0, currently sum to {total}')
        
        for key, weight in value.items():
            if not isinstance(weight, (int, float)) or weight < 0 or weight > 1:
                raise serializers.ValidationError(f'Invalid weight for {key}: {weight}')
        
        return value


class ResonanciaObservationSerializer(serializers.ModelSerializer):
    """Serializer para ResonanciaObservation (registro simbólico manual)."""

    subject = serializers.PrimaryKeyRelatedField(read_only=True)
    author = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ResonanciaObservation
        fields = [
            'id',
            'subject',
            'author',
            'type',
            'source',
            'context',
            'state',
            'anchors',
            'tags',
            'statement',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def validate_statement(self, value):
        cleaned = (value or '').strip()
        if not cleaned:
            raise serializers.ValidationError('statement es obligatorio.')
        return cleaned

    def _clean_list(self, items, *, field_name: str, max_items: int):
        if items is None:
            return []
        if not isinstance(items, list):
            raise serializers.ValidationError({field_name: 'Debe ser una lista.'})

        cleaned: list[str] = []
        for raw in items:
            if raw is None:
                continue
            if not isinstance(raw, str):
                raise serializers.ValidationError({field_name: 'Todos los elementos deben ser strings.'})
            candidate = raw.strip()
            if not candidate:
                continue
            cleaned.append(candidate)

        if len(cleaned) > max_items:
            raise serializers.ValidationError({field_name: f'Máximo {max_items} elementos.'})

        return cleaned

    def validate_anchors(self, value):
        return self._clean_list(value, field_name='anchors', max_items=50)

    def validate_tags(self, value):
        return self._clean_list(value, field_name='tags', max_items=30)


class ResonanciaRelationSerializer(serializers.ModelSerializer):
    """Serializer para ResonanciaRelation (posicionamiento relacional simbólico)."""

    subject = serializers.PrimaryKeyRelatedField(read_only=True)
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    from_ref = serializers.CharField(read_only=True)

    class Meta:
        model = ResonanciaRelation
        fields = [
            'id',
            'subject',
            'author',
            'created_at',
            'updated_at',
            'context',
            'from_ref',
            'to_label',
            'position',
            'note',
            'tags',
        ]
        read_only_fields = ['id', 'author', 'from_ref', 'created_at', 'updated_at']

    def validate_to_label(self, value):
        cleaned = (value or '').strip()
        if not cleaned:
            raise serializers.ValidationError('to_label es obligatorio.')
        return cleaned

    def validate_position(self, value):
        try:
            position_int = int(value)
        except Exception:
            raise serializers.ValidationError('position debe ser un número entero.')

        if position_int < 1 or position_int > 9:
            raise serializers.ValidationError('position debe estar entre 1 y 9 (sin 0).')

        return position_int

    def validate_note(self, value):
        cleaned = (value or '').strip()
        if len(cleaned) > 280:
            raise serializers.ValidationError('note máximo 280 caracteres.')
        return cleaned

    def validate_tags(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError({'tags': 'Debe ser una lista.'})

        cleaned: list[str] = []
        for raw in value:
            if raw is None:
                continue
            if not isinstance(raw, str):
                raise serializers.ValidationError({'tags': 'Todos los elementos deben ser strings.'})
            candidate = raw.strip()
            if not candidate:
                continue
            cleaned.append(candidate)

        if len(cleaned) > 30:
            raise serializers.ValidationError({'tags': 'Máximo 30 elementos.'})

        return cleaned
