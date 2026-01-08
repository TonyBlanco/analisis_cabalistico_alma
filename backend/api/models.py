from django.db import models
from datetime import date
import uuid
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Tipos de usuario
USER_TYPE_CHOICES = [
    ('personal', 'Usuario Personal'),
    ('therapist', 'Terapeuta Profesional'),
    ('patient', 'Paciente'),
    ('visitor', 'Visitante'),
]

# Estados de suscripción
SUBSCRIPTION_STATUS_CHOICES = [
    ('trial', 'Período de Prueba'),
    ('active', 'Activa'),
    ('canceled', 'Cancelada'),
    ('expired', 'Expirada'),
]

# Demografía básica
BIOLOGICAL_SEX_CHOICES = [
    ('male', 'Masculino'),
    ('female', 'Femenino'),
    ('intersex', 'Intersexual'),
    ('unknown', 'Desconocido'),
    ('not_recorded', 'Sin registro'),
]

GENDER_IDENTITY_CHOICES = [
    ('woman', 'Mujer'),
    ('man', 'Hombre'),
    ('non_binary', 'No binaria'),
    ('other', 'Otra'),
    ('prefer_not_to_say', 'Prefiere no decirlo'),
    ('not_recorded', 'Sin registro'),
]

class UserProfile(models.Model):
    """Perfil extendido del usuario con información adicional"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='personal')
    
    # Campos comunes
    # display_name: El nombre que usa para login (username de Django)
    # full_name: El nombre que se usa para los cálculos cabalísticos (para particulares)
    full_name = models.CharField(max_length=255)  # Nombre para cálculos cabalísticos
    legal_full_name = models.CharField(max_length=255, blank=True)  # Nombre legal completo
    phone = models.CharField(max_length=20, blank=True)

    # Demografía
    biological_sex = models.CharField(
        max_length=20,
        choices=BIOLOGICAL_SEX_CHOICES,
        default='not_recorded',
        blank=True,
        help_text='Sexo biológico (demografía básica)'
    )
    gender_identity = models.CharField(
        max_length=20,
        choices=GENDER_IDENTITY_CHOICES,
        default='not_recorded',
        blank=True,
        help_text='Identidad de género (demografía básica)'
    )

    birth_date = models.DateField(null=True, blank=True)
    birth_time = models.TimeField(null=True, blank=True)
    
    # ========== COORDENADAS GEOGRÁFICAS (CORE FIELDS) ==========
    # Estos campos son REQUERIDOS para análisis astrológicos/cabalísticos
    birth_city = models.CharField(max_length=200, blank=True)
    birth_country = models.CharField(max_length=100, blank=True)
    birth_latitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True,
        help_text='Latitud del lugar de nacimiento (núcleo perfil)'
    )
    birth_longitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True,
        help_text='Longitud del lugar de nacimiento (núcleo perfil)'
    )
    birth_timezone = models.CharField(
        max_length=100, 
        blank=True,
        help_text='Zona horaria del lugar de nacimiento (núcleo perfil)'
    )
    
    # Control de versión y consentimiento
    profile_version = models.IntegerField(default=1)
    name_change_count = models.IntegerField(default=0)
    consent_accepted_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text='Marca de tiempo de aceptación de consentimiento terapéutico'
    )

    # Sistema de roles y permisos
    is_admin = models.BooleanField(default=False)  # Admin puede ver estadísticas y mantener usuarios
    
    # Campos para terapeutas
    profession = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    years_of_experience = models.IntegerField(null=True, blank=True)
    
    # Sistema de pagos y membresías
    membership_active = models.BooleanField(default=True)  # Trial activo por defecto
    membership_expires = models.DateTimeField(null=True, blank=True)
    subscription_status = models.CharField(
        max_length=20, 
        choices=SUBSCRIPTION_STATUS_CHOICES, 
        default='trial'
    )
    subscription_plan = models.CharField(max_length=50, blank=True)  # 'personal', 'professional', 'premium'
    subscription_start_date = models.DateTimeField(null=True, blank=True)
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    last_payment_date = models.DateTimeField(null=True, blank=True)
    next_billing_date = models.DateTimeField(null=True, blank=True)
    
    # Límites según tipo de usuario
    max_fichas_per_month = models.IntegerField(default=10)  # Personal: 10, Therapist: ilimitado
    fichas_created_this_month = models.IntegerField(default=0)
    
    # Para terapeutas: número de clientes
    max_patients = models.IntegerField(default=0)  # 0=ilimitado en trial, 100=plan básico
    current_patients_count = models.IntegerField(default=0)
    
    # OAuth (Google)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.full_name} ({self.get_user_type_display()})"
    
    def has_active_subscription(self):
        """Verifica si el usuario tiene una suscripción activa"""
        from django.utils import timezone
        if not self.membership_active:
            return False
        if self.membership_expires and self.membership_expires < timezone.now():
            return False
        return self.subscription_status in ['trial', 'active']
    
    def can_create_ficha(self):
        """Verifica si el usuario puede crear más fichas este mes"""
        if self.user_type == 'therapist':
            # Para terapeutas: verificar límite de clientes
            if self.max_patients == 0:  # Trial sin límite
                return True
            return self.current_patients_count < self.max_patients
        # Para particulares: verificar límite mensual
        return self.fichas_created_this_month < self.max_fichas_per_month
    
    def can_add_patient(self):
        """Verifica si el usuario puede agregar un nuevo paciente (solo para terapeutas)"""
        if self.user_type != 'therapist':
            return False, "Solo los terapeutas pueden agregar pacientes"
        
        if self.max_patients == 0:  # Trial sin límite
            return True, "OK"
        
        if self.current_patients_count >= self.max_patients:
            return False, f"Límite de {self.max_patients} clientes alcanzado. Necesitas un upgrade"
        
        return True, "OK"
    
    def get_remaining_capacity(self):
        """Obtiene la capacidad restante (para terapeutas) o fichas restantes (para particulares)"""
        if self.user_type == 'therapist':
            if self.max_patients == 0:
                return None  # Sin límite
            return max(0, self.max_patients - self.current_patients_count)
        else:
            return max(0, self.max_fichas_per_month - self.fichas_created_this_month)
    
    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuarios'


# Signal para crear perfil automáticamente cuando se crea un usuario
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


class Calculo(models.Model):
    """Representa un cálculo numerológico guardado."""
    nombre = models.CharField(max_length=255)
    fecha_nacimiento = models.DateField()
    sistema = models.CharField(max_length=50, default='dshevastan')
    
    # Guardamos los resultados clave
    esencia = models.CharField(max_length=20)
    expresion = models.CharField(max_length=20)
    destino = models.CharField(max_length=20)
    
    fecha_calculo = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cálculo para {self.nombre} el {self.fecha_calculo.strftime('%Y-%m-%d')}"


class Ficha(models.Model):
    # 1. Relación: La ficha pertenece a un Usuario
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fichas')
    
    # 2. Datos de Entrada
    nombre = models.CharField(max_length=200)
    fecha_nacimiento = models.DateField()
    sistema = models.CharField(max_length=50, default='pitagorico')
    
    # 3. El Resultado Completo
    resultado = models.JSONField()
    
    # 4. Si esta ficha es de un paciente de terapeuta
    is_patient = models.BooleanField(default=False)
    patient_of = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='patient_fichas',
        null=True,
        blank=True
    )
    
    # 5. Metadata
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} ({self.sistema}) - {self.usuario.username}"
    
    class Meta:
        ordering = ['-creado_en']
        verbose_name = 'Ficha Numerológica'
        verbose_name_plural = 'Fichas Numerológicas'





class Patient(models.Model):
    """Modelo para pacientes de terapeutas - Ficha clínica holística"""
    therapist = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='patients',
        limit_choices_to={'profile__user_type': 'therapist'},
        help_text='Terapeuta que creó y gestiona este paciente'
    )
    
    # Vinculación con usuario (para login del paciente)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='patient_profile',
        help_text='Usuario asociado si el paciente tiene cuenta de login'
    )
    
    # ========== DATOS PERSONALES ==========
    first_name = models.CharField(max_length=100, blank=True, help_text='Nombre del paciente')
    last_name = models.CharField(max_length=100, blank=True, help_text='Apellidos del paciente')
    email = models.EmailField(help_text='Email del paciente')
    phone = models.CharField(max_length=20, blank=True, help_text='Teléfono de contacto')
    avatar = models.URLField(blank=True, help_text='URL del avatar del paciente')

    # Demografía
    biological_sex = models.CharField(
        max_length=20,
        choices=BIOLOGICAL_SEX_CHOICES,
        default='not_recorded',
        blank=True,
        help_text='Sexo biológico (demografía básica)'
    )
    gender_identity = models.CharField(
        max_length=20,
        choices=GENDER_IDENTITY_CHOICES,
        default='not_recorded',
        blank=True,
        help_text='Identidad de género (demografía básica)'
    )
    
    # Campo legacy para compatibilidad (se calcula automáticamente)
    full_name = models.CharField(max_length=255, help_text='Nombre completo (calculado automáticamente)')
    
    # ========== DATOS ASTROLÓGICOS/CABALÍSTICOS ==========
    birth_date = models.DateField(help_text='Fecha de nacimiento')
    birth_time = models.TimeField(null=True, blank=True, help_text='Hora exacta de nacimiento')
    birth_place = models.CharField(max_length=255, blank=True, help_text='Lugar de nacimiento (ciudad, país) - LEGACY')
    hebrew_name = models.CharField(max_length=255, blank=True, help_text='Nombre en hebreo (opcional)')
    
    # ========== COORDENADAS GEOGRÁFICAS (CORE FIELDS) ==========
    # Estos campos son REQUERIDOS para análisis astrológicos/cabalísticos
    birth_city = models.CharField(max_length=200, blank=True, help_text='Ciudad de nacimiento')
    birth_country = models.CharField(max_length=100, blank=True, help_text='País de nacimiento')
    birth_latitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True,
        help_text='Latitud del lugar de nacimiento'
    )
    birth_longitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True,
        help_text='Longitud del lugar de nacimiento'
    )
    birth_timezone = models.CharField(
        max_length=100, 
        blank=True, 
        help_text='Zona horaria del lugar de nacimiento'
    )
    
    # ========== DATOS CLÍNICOS ==========
    main_complaint = models.TextField(blank=True, help_text='Motivo principal de consulta')
    clinical_history = models.TextField(blank=True, help_text='Historial clínico del paciente')
    
    # ========== PLAN DE TRATAMIENTO (JSON) ==========
    treatment_plan = models.JSONField(
        default=dict,
        blank=True,
        help_text='Plan de tratamiento holístico en formato JSON: { "meditations": [], "oils": [], "magnetism": [], "biodecoding": [] }'
    )
    
    # ========== NIVEL DE TERAPIA CABALÍSTICA ==========
    THERAPY_LEVEL_CHOICES = [
        ('assiyah', 'Nivel 1: Sanación (Assiyah)'),
        ('yetzirah', 'Nivel 2: Equilibrio (Yetzirah)'),
        ('beriah', 'Nivel 3: Propósito (Beriah)'),
    ]
    therapy_level = models.CharField(
        max_length=20,
        choices=THERAPY_LEVEL_CHOICES,
        blank=True,
        null=True,
        help_text='Nivel de terapia cabalística en el que se está trabajando con el paciente'
    )
    
    # Notas generales (legacy)
    notes = models.TextField(blank=True, help_text='Notas adicionales del terapeuta')
    
    # Status
    is_active = models.BooleanField(default=True, help_text='Indica si el paciente está activo')
    
    # ========== THERAPY STATUS (OWNERSHIP MANAGEMENT) ==========
    THERAPY_STATUS_CHOICES = [
        ('active', 'Activo'),
        ('paused', 'Pausado'),
        ('inactive', 'Inactivo'),
        ('archived', 'Archivado'),
    ]
    therapy_status = models.CharField(
        max_length=20,
        choices=THERAPY_STATUS_CHOICES,
        default='active',
        help_text='Estado actual de la terapia del paciente'
    )
    pause_reason = models.TextField(
        blank=True,
        help_text='Motivo de pausa (si therapy_status es paused)'
    )
    status_changed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Última vez que cambió el therapy_status'
    )
    status_changed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='patient_status_changes',
        help_text='Terapeuta que cambió el estado'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Calcular full_name automáticamente si no está definido
        if not self.full_name:
            self.full_name = f"{self.first_name} {self.last_name}".strip()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.full_name} - Paciente de {self.therapist.username}"
    
    class Meta:
        ordering = ['-created_at']
        unique_together = [['therapist', 'email'], ['therapist', 'user']]
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'


class Session(models.Model):
    """Sesiones terapéuticas"""
    SESSION_TYPE_CHOICES = [
        ('initial', 'Sesión Inicial'),
        ('followup', 'Seguimiento'),
        ('consultation', 'Consulta'),
        ('closure', 'Cierre'),
    ]
    
    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='sessions')
    
    # Información de la sesión
    session_date = models.DateTimeField()
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES, default='followup')
    duration_minutes = models.IntegerField(default=60)
    
    # Notas de la sesión
    notes = models.TextField(blank=True)
    private_notes = models.TextField(blank=True, help_text="Notas privadas solo para el terapeuta")
    
    # Fichas relacionadas
    related_fichas = models.ManyToManyField(Ficha, blank=True, related_name='sessions')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Sesión {self.session_type} - {self.patient.full_name} - {self.session_date.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-session_date']
        verbose_name = 'Sesión Terapéutica'
        verbose_name_plural = 'Sesiones Terapéuticas'


class TherapistNote(models.Model):
    """Notas rápidas del terapeuta sobre pacientes o fichas"""
    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='therapist_notes')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='therapist_notes', null=True, blank=True)
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE, related_name='therapist_notes', null=True, blank=True)
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    
    # Tags para organización
    tags = models.CharField(max_length=500, blank=True, help_text="Separar con comas")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.therapist.username}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Nota del Terapeuta'
        verbose_name_plural = 'Notas de Terapeutas'


class PatientMessage(models.Model):
    """Mensajes unidireccionales del terapeuta al paciente (no clínicos)."""
    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_patient_messages')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient_messages')
    content = models.CharField(max_length=1000, help_text='Texto plano, neutro, no clínico')
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Patient Message'
        verbose_name_plural = 'Patient Messages'

    def __str__(self):
        return f"Message {self.id} from {self.therapist.username} to {self.patient.full_name}"


# ========== MODELOS PARA SERVICIOS DE TONY BLANCO ==========

class ServiceCategory(models.Model):
    """Categorías de servicios"""
    CATEGORY_CHOICES = [
        ('sesiones', 'Sesiones Individuales'),
        ('lecturas', 'Lecturas y Análisis'),
        ('formacion', 'Formación Profesional'),
        ('talleres', 'Talleres y Retiros'),
        ('contenido', 'Contenido Digital'),
        ('acompanamiento', 'Acompañamiento Continuo'),
        ('comunidad', 'Comunidad y Membresía'),
    ]
    
    name = models.CharField(max_length=100, choices=CATEGORY_CHOICES, unique=True)
    display_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Nombre del ícono (lucide-react)")
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.display_name
    
    class Meta:
        ordering = ['order', 'display_name']
        verbose_name = 'Categoría de Servicio'
        verbose_name_plural = 'Categorías de Servicios'


class Service(models.Model):
    """Servicios ofrecidos por Tony Blanco"""
    SERVICE_TYPE_CHOICES = [
        ('session', 'Sesión en Vivo'),
        ('reading', 'Lectura/Análisis'),
        ('course', 'Curso Grabado'),
        ('workshop', 'Taller en Vivo'),
        ('retreat', 'Retiro Virtual'),
        ('membership', 'Membresía Mensual'),
        ('package', 'Paquete de Sesiones'),
        ('meditation', 'Meditación Grabada'),
    ]
    
    DURATION_TYPE_CHOICES = [
        ('minutes', 'Minutos'),
        ('hours', 'Horas'),
        ('days', 'Días'),
        ('months', 'Meses'),
        ('years', 'Años'),
        ('lifetime', 'Acceso de por vida'),
    ]
    
    # Información básica
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    
    # Descripción
    short_description = models.CharField(max_length=500)
    full_description = models.TextField()
    benefits = models.JSONField(default=list, help_text="Lista de beneficios del servicio")
    includes = models.JSONField(default=list, help_text="Qué incluye el servicio")
    
    # Precios
    price_usd = models.DecimalField(max_digits=10, decimal_places=2)
    price_eur = models.DecimalField(max_digits=10, decimal_places=2)
    has_discount = models.BooleanField(default=False)
    discount_price_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_price_eur = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_label = models.CharField(max_length=100, blank=True, help_text="Ej: 'Primera sesión'")
    
    # Duración
    duration_value = models.IntegerField(help_text="Valor numérico de duración")
    duration_type = models.CharField(max_length=20, choices=DURATION_TYPE_CHOICES)
    
    # Disponibilidad
    is_active = models.BooleanField(default=True)
    requires_booking = models.BooleanField(default=True, help_text="Requiere reserva de horario")
    max_participants = models.IntegerField(null=True, blank=True, help_text="Para talleres/retiros")
    
    # Plataforma de entrega
    platform = models.CharField(max_length=100, default='Zoom', help_text="Zoom, Google Meet, Discord, etc.")
    
    # Orden y destacados
    order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - ${self.price_usd} USD"
    
    def get_price(self, currency='USD'):
        """Obtiene el precio en la moneda especificada"""
        if self.has_discount:
            if currency == 'EUR':
                return self.discount_price_eur or self.price_eur
            return self.discount_price_usd or self.price_usd
        
        return self.price_eur if currency == 'EUR' else self.price_usd
    
    class Meta:
        ordering = ['order', '-is_featured', 'name']
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'


class ServicePackage(models.Model):
    """Paquetes de servicios con descuento"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    
    # Servicios incluidos
    services = models.ManyToManyField(Service, through='PackageService')
    
    # Precios con descuento
    price_usd = models.DecimalField(max_digits=10, decimal_places=2)
    price_eur = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.IntegerField(help_text="% de descuento respecto a precio individual")
    
    # Validez
    validity_months = models.IntegerField(default=12, help_text="Meses de validez desde la compra")
    
    # Disponibilidad
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.discount_percentage}% OFF"
    
    class Meta:
        ordering = ['-discount_percentage', 'name']
        verbose_name = 'Paquete de Servicios'
        verbose_name_plural = 'Paquetes de Servicios'


class PackageService(models.Model):
    """Relación entre paquetes y servicios"""
    package = models.ForeignKey(ServicePackage, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1, help_text="Cantidad de este servicio incluido")
    
    class Meta:
        unique_together = ['package', 'service']


class Booking(models.Model):
    """Reservas de servicios"""
    BOOKING_STATUS_CHOICES = [
        ('pending', 'Pendiente de Pago'),
        ('confirmed', 'Confirmada'),
        ('completed', 'Completada'),
        ('canceled', 'Cancelada'),
        ('rescheduled', 'Reprogramada'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('stripe', 'Tarjeta (Stripe)'),
        ('paypal', 'PayPal'),
        ('bizum', 'Bizum'),
        ('transfer', 'Transferencia Bancaria'),
    ]
    
    # Usuario y servicio
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings', null=True, blank=True)
    package = models.ForeignKey(ServicePackage, on_delete=models.CASCADE, related_name='bookings', null=True, blank=True)
    
    # Fecha y hora (para servicios en vivo)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    timezone = models.CharField(max_length=50, default='Europe/Madrid')
    
    # Detalles de contacto
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=20, blank=True)
    
    # Notas
    client_notes = models.TextField(blank=True, help_text="Notas del cliente")
    admin_notes = models.TextField(blank=True, help_text="Notas internas")
    
    # Pago
    currency = models.CharField(max_length=3, default='USD', choices=[('USD', 'USD'), ('EUR', 'EUR')])
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default='pending')
    
    # IDs de pasarelas de pago
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    paypal_order_id = models.CharField(max_length=255, blank=True)
    bizum_transaction_id = models.CharField(max_length=255, blank=True)
    
    # Link de reunión
    meeting_link = models.URLField(blank=True, help_text="Zoom/Google Meet link")
    
    # Estado
    status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default='pending')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        service_name = self.service.name if self.service else self.package.name
        return f"{service_name} - {self.client_name} - {self.status}"
    
    def get_service_name(self):
        return self.service.name if self.service else self.package.name
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'


class AvailableSlot(models.Model):
    """Horarios disponibles para reservas"""
    DAY_CHOICES = [
        (0, 'Lunes'),
        (1, 'Martes'),
        (2, 'Miércoles'),
        (3, 'Jueves'),
        (4, 'Viernes'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    
    # Configuración de disponibilidad
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=50, default='Europe/Madrid')
    
    # Servicios permitidos en este horario
    allowed_services = models.ManyToManyField(Service, blank=True, related_name='available_slots')
    
    # Estado
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time} - {self.end_time}"
    
    class Meta:
        ordering = ['day_of_week', 'start_time']
        verbose_name = 'Horario Disponible'
        verbose_name_plural = 'Horarios Disponibles'


class BlockedDate(models.Model):
    """Fechas bloqueadas (vacaciones, días no laborables)"""
    date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)
    is_full_day = models.BooleanField(default=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Bloqueado: {self.date} - {self.reason}"
    
    class Meta:
        ordering = ['date']
        verbose_name = 'Fecha Bloqueada'
        verbose_name_plural = 'Fechas Bloqueadas'


class CabalisticAnalysis(models.Model):
    """Análisis cabalístico estructurado, consumible por el motor de síntesis.

    Definido originalmente en la migración 0020_add_cabalistic_analysis y
    reintroducido aquí sin cambios de contrato para respetar el núcleo sellado.
    """

    ANALYSIS_TYPE_CHOICES = [
        ('gematria', 'Gematria'),
        ('tarot', 'Tarot Terapéutico'),
        ('soul-map', 'Mapa del Alma'),
        ('astrology', 'Carta Astral Cabalística'),
        ('tikun', 'Análisis de Tikún'),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='cabalistic_analyses',
        help_text='Paciente para el que se realizó el análisis',
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='cabalistic_analyses',
        help_text='Terapeuta que ejecutó el análisis',
    )

    analysis_type = models.CharField(
        max_length=20,
        choices=ANALYSIS_TYPE_CHOICES,
        help_text='Tipo de análisis cabalístico realizado',
    )
    input_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Datos de entrada del análisis (ej: palabra para Gematria, fecha para Tarot)',
    )
    result_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Resultados completos del análisis en formato JSON',
    )
    summary = models.TextField(
        blank=True,
        help_text='Resumen breve del análisis para visualización rápida',
    )
    therapist_notes = models.TextField(
        blank=True,
        help_text='Notas adicionales del terapeuta sobre este análisis',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Análisis Cabalístico'
        verbose_name_plural = 'Análisis Cabalísticos'
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['patient', 'analysis_type', '-created_at'],
                name='api_cabalis_patient_9d1192_idx',
            ),
            models.Index(
                fields=['therapist', '-created_at'],
                name='api_cabalis_therapi_be0633_idx',
            ),
        ]

    def __str__(self) -> str:  # pragma: no cover - representación simple
        return f'{self.get_analysis_type_display()} - {self.patient.full_name}'


class AnalysisRecord(models.Model):
    """Núcleo normalizado de ejecuciones de análisis (AnalysisRecord).

    Modelo sellado definido en la migración 0026_analysisrecord, reintroducido
    sin cambios de estructura para restaurar compatibilidad con servicios y
    vistas existentes sin alterar flujos clínicos.
    """

    KIND_CHOICES = [
        ('clinical_test', 'Clinical Test'),
        ('kabbalah', 'Kabbalah'),
        ('astrology', 'Astrology'),
        ('legacy', 'Legacy'),
        ('holistic_evaluative_synthesis', 'Holistic Evaluative Synthesis'),
    ]

    ROLE_CONTEXT_CHOICES = [
        ('therapist', 'Therapist'),
        ('personal', 'Personal'),
        ('patient', 'Patient'),
    ]

    EXECUTION_MODE_CHOICES = [
        ('patient_self', 'Patient Self'),
        ('therapist_clinical', 'Therapist Clinical'),
    ]

    VISIBILITY_CHOICES = [
        ('therapist', 'Therapist only'),
        ('patient', 'Patient only'),
        ('both', 'Therapist and Patient'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Identificador estable de la ejecución de análisis (UUID).',
    )
    kind = models.CharField(
        max_length=32,
        choices=KIND_CHOICES,
        help_text='Tipo de análisis ejecutado.',
    )
    module_code = models.CharField(
        max_length=64,
        help_text='Identificador estable del módulo (ej: PHQ9, SCDF, KERYKEION_NATAL).',
    )
    role_context = models.CharField(
        max_length=16,
        choices=ROLE_CONTEXT_CHOICES,
        help_text='Contexto de rol en el momento de la ejecución.',
    )
    execution_mode = models.CharField(
        max_length=32,
        choices=EXECUTION_MODE_CHOICES,
        null=True,
        blank=True,
        help_text='Derivado en backend desde module_code + contexto. Nunca confiado desde request.',
    )

    birth_data_snapshot = models.JSONField(
        help_text=(
            'Snapshot inmutable de datos de nacimiento en el momento del análisis. '
            'Debe incluir: legal_name, birth_date, birth_time, city, country, lat, lng, timezone, geocode_source.'
        ),
    )
    algorithm_snapshot = models.JSONField(
        help_text=(
            'Snapshot inmutable de motor/versión/parámetros. '
            'Campos esperados: engine, version, build_hash (opcional), params.'
        ),
    )
    raw_input = models.JSONField(
        null=True,
        blank=True,
        help_text='Input crudo recibido desde frontend / capa de orquestación.',
    )
    computed_result = models.JSONField(
        null=True,
        blank=True,
        help_text='Resultado normalizado final del análisis (JSON).',
    )
    legacy_output = models.JSONField(
        null=True,
        blank=True,
        help_text='Salida original del módulo legacy (JSON serializado, opcional).',
    )

    # Anotaciones del terapeuta (editable por propietario)
    therapist_annotations = models.JSONField(
        null=True,
        blank=True,
        default=dict,
        help_text=('Anotaciones del terapeuta sobre este resultado. '
                   'Estructura: {summary: string, notes: string, visible_to_patient: boolean}.'),
    )

    visibility = models.CharField(
        max_length=16,
        choices=VISIBILITY_CHOICES,
        default='therapist',
        help_text='Quién puede ver este AnalysisRecord en dashboards.',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    created_by_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='analysis_created_records',
        help_text='Usuario que dispara la ejecución (terapeuta, personal o paciente).',
    )
    subject_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='analysis_subject_records',
        null=True,
        blank=True,
        help_text='Usuario sujeto del análisis (si existe cuenta).',
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='therapist_analysis_records',
        null=True,
        blank=True,
        help_text='Terapeuta propietario (ownership clínico).',
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        related_name='analysis_records',
        null=True,
        blank=True,
        help_text='Paciente clínico asociado (obligatorio en therapist_clinical).',
    )
    test_result = models.ForeignKey(
        'api.TestResult',
        on_delete=models.SET_NULL,
        related_name='analysis_records',
        null=True,
        blank=True,
        help_text='Resultado de test relacionado, si existe.',
    )
    cabalistic_analysis = models.ForeignKey(
        CabalisticAnalysis,
        on_delete=models.SET_NULL,
        related_name='analysis_records',
        null=True,
        blank=True,
        help_text='Análisis cabalístico relacionado, si existe.',
    )

    class Meta:
        verbose_name = 'Analysis Record'
        verbose_name_plural = 'Analysis Records'
        indexes = [
            models.Index(
                fields=['subject_user', 'created_at'],
                name='api_analysi_subject_05aeed_idx',
            ),
            models.Index(
                fields=['created_by_user', 'created_at'],
                name='api_analysi_created_cac56c_idx',
            ),
            models.Index(
                fields=['kind', 'module_code'],
                name='api_analysi_kind_a20a7b_idx',
            ),
            models.Index(
                fields=['created_at'],
                name='api_analysi_created_624740_idx',
            ),
        ]

    def __str__(self) -> str:  # pragma: no cover - representación simple
        return f'{self.kind}::{self.module_code} [{self.id}]'


class TherapistHolisticConfig(models.Model):
    """Configuración de pesos para Motor de Síntesis Holística Evaluativa (MSHE)"""
    
    therapist = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='holistic_config',
        help_text='Terapeuta propietario de esta configuración'
    )
    
    # Pesos por disciplina (deben sumar 1.0)
    weights = models.JSONField(
        default=dict,
        help_text='Pesos por disciplina: {"kabbalah_numerology": 0.20, "tarot_evolutivo": 0.20, "astrologia_terapeutica": 0.20, "transgeneracional": 0.20, "biodecodificacion": 0.20}'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Configuración Holística del Terapeuta'
        verbose_name_plural = 'Configuraciones Holísticas de Terapeutas'
    
    def __str__(self):
        return f"Config MSHE - {self.therapist.username}"
    
    def clean(self):
        """Validar que los pesos sumen 1.0"""
        from django.core.exceptions import ValidationError
        total = sum(self.weights.values())
        if abs(total - 1.0) > 0.001:  # Tolerancia para errores de punto flotante
            raise ValidationError(f'Los pesos deben sumar 1.0, actualmente suman {total}')
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @staticmethod
    def get_default_weights():
        """Pesos recomendados por defecto"""
        return {
            "kabbalah_numerology": 0.20,
            "tarot_evolutivo": 0.20,
            "astrologia_terapeutica": 0.20,
            "transgeneracional": 0.20,
            "biodecodificacion": 0.20
        }


class Resource(models.Model):
    """
    Shared resource model (videos, audios, PDFs, courses).
    Resources exist once; access is managed via UserResourceAccess.
    """
    RESOURCE_TYPE_CHOICES = [
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('pdf', 'PDF'),
        ('course', 'Curso'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, help_text='Título del recurso')
    description = models.TextField(blank=True, help_text='Descripción del recurso')
    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPE_CHOICES,
        help_text='Tipo de recurso'
    )
    content_url = models.URLField(blank=True, help_text='URL del contenido del recurso')
    thumbnail_url = models.URLField(blank=True, help_text='URL de la miniatura')
    access_level = models.CharField(
        max_length=20,
        default='free',
        help_text='Nivel de acceso base (free, personal, professional, premium)'
    )
    is_active = models.BooleanField(default=True, help_text='Indica si el recurso está activo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Recurso'
        verbose_name_plural = 'Recursos'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class UserResourceAccess(models.Model):
    """
    Access control for shared resources.
    
    Resources exist once; access is managed via this relation table.
    """
    SOURCE_CHOICES = [
        ('free', 'Gratuito'),
        ('assigned_by_therapist', 'Asignado por terapeuta'),
        ('self_purchased', 'Auto-adquirido'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='resource_accesses',
        help_text='Usuario que tiene acceso al recurso'
    )
    resource = models.ForeignKey(
        'Resource',
        on_delete=models.CASCADE,
        related_name='user_accesses',
        help_text='Recurso al que se tiene acceso'
    )
    source = models.CharField(
        max_length=32,
        choices=SOURCE_CHOICES,
        help_text='Origen del acceso'
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_resources',
        help_text='Terapeuta que asignó el recurso (solo si source=assigned_by_therapist)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'resource')
        verbose_name = 'Acceso a Recurso'
        verbose_name_plural = 'Accesos a Recursos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['resource', 'source']),
        ]
    
    def __str__(self):
        return f'{self.user.username} -> {self.resource.title} ({self.source})'
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Validate assigned_by only if source is assigned_by_therapist
        if self.source == 'assigned_by_therapist' and not self.assigned_by:
            raise ValidationError('assigned_by is required when source is assigned_by_therapist')
        if self.source != 'assigned_by_therapist' and self.assigned_by:
            raise ValidationError('assigned_by should only be set when source is assigned_by_therapist')


# ========== CONFIGURACIONES DE TERAPEUTAS ==========

class TherapistHolisticConfig(models.Model):
    """
    Configuración de pesos para el Motor de Síntesis Holística Evaluativa (MSHE).
    Cada terapeuta puede personalizar los pesos de los diferentes módulos.
    """
    therapist = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='holistic_config',
        help_text="Terapeuta propietario de esta configuración"
    )

    weights = models.JSONField(
        default=dict,
        help_text="Pesos para cada módulo holístico (deben sumar 1.0)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuración Holística del Terapeuta"
        verbose_name_plural = "Configuraciones Holísticas de Terapeutas"

    @staticmethod
    def get_default_weights():
        """Retorna los pesos por defecto recomendados"""
        return {
            'kabbalah_numerology': 0.20,
            'tarot_evolutivo': 0.20,
            'astrologia_terapeutica': 0.20,
            'transgeneracional': 0.20,
            'biodecodificacion': 0.20
        }

    def clean(self):
        """Validar que los pesos sumen 1.0"""
        from django.core.exceptions import ValidationError

        if not isinstance(self.weights, dict):
            raise ValidationError('Los pesos deben ser un diccionario JSON')

        total = sum(self.weights.values())
        if abs(total - 1.0) > 0.001:
            raise ValidationError(f'Los pesos deben sumar 1.0, actualmente suman {total}')

        # Validar pesos individuales
        for key, value in self.weights.items():
            if not isinstance(value, (int, float)) or value < 0 or value > 1:
                raise ValidationError(f'Peso inválido para {key}: {value}')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Configuración MSHE de {self.therapist.username}'


class ResonanciaObservation(models.Model):
    """Observación simbólica manual (Resonancia Ancestral).

    Modelo aislado: persiste registro observacional sin inferencias, sin scoring y sin automatización.
    """

    TYPE_CHOICES = [
        ('resonancia', 'Resonancia'),
        ('eje', 'Eje'),
        ('repeticion', 'Repetición'),
        ('nota', 'Nota'),
    ]

    SOURCE_CHOICES = [
        ('observacion_directa', 'Observación directa'),
        ('registro_manual', 'Registro manual'),
    ]

    CONTEXT_CHOICES = [
        ('familiar', 'Familiar'),
        ('relacional', 'Relacional'),
        ('sistemico', 'Sistémico'),
    ]

    STATE_CHOICES = [
        ('activo', 'Activo'),
        ('latente', 'Latente'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='resonancia_observations',
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='resonancia_observations',
        limit_choices_to={'profile__user_type': 'therapist'},
    )

    type = models.CharField(max_length=16, choices=TYPE_CHOICES)
    source = models.CharField(max_length=32, choices=SOURCE_CHOICES, default='registro_manual')
    context = models.CharField(max_length=16, choices=CONTEXT_CHOICES)
    state = models.CharField(max_length=16, choices=STATE_CHOICES)

    anchors = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    statement = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Observación (Resonancia)'
        verbose_name_plural = 'Observaciones (Resonancia)'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['subject', '-created_at'], name='res_subj_created_idx'),
            models.Index(fields=['author', '-created_at'], name='res_auth_created_idx'),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f'ResonanciaObservation {self.type} ({self.subject_id})'


class ResonanciaRelation(models.Model):
    """Relación simbólica manual (Resonancia Ancestral).

    Modelo aislado: persiste posicionamiento relacional simbólico 1-9 (sin inferencias, sin scoring).
    """

    CONTEXT_CHOICES = [
        ('familiar', 'Familiar'),
        ('relacional', 'Relacional'),
        ('sistemico', 'Sistémico'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='resonancia_relations',
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='resonancia_relations',
        limit_choices_to={'profile__user_type': 'therapist'},
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    context = models.CharField(max_length=16, choices=CONTEXT_CHOICES)
    from_ref = models.CharField(max_length=64, default='consultante')
    to_label = models.CharField(max_length=160)
    position = models.PositiveSmallIntegerField()

    note = models.CharField(max_length=280, blank=True, default='')
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = 'Relación (Resonancia)'
        verbose_name_plural = 'Relaciones (Resonancia)'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['subject', '-created_at'], name='resrel_subj_created_idx'),
            models.Index(fields=['author', '-created_at'], name='resrel_auth_created_idx'),
            models.Index(fields=['subject', 'context'], name='resrel_subj_ctx_idx'),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f'ResonanciaRelation {self.position} ({self.subject_id})'

