from django.db import models
from datetime import date
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

class UserProfile(models.Model):
    """Perfil extendido del usuario con información adicional"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='personal')
    
    # Campos comunes
    # display_name: El nombre que usa para login (username de Django)
    # full_name: El nombre que se usa para los cálculos cabalísticos (para particulares)
    full_name = models.CharField(max_length=255)  # Nombre para cálculos cabalísticos
    phone = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
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

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


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
    
    # Campo legacy para compatibilidad (se calcula automáticamente)
    full_name = models.CharField(max_length=255, help_text='Nombre completo (calculado automáticamente)')
    
    # ========== DATOS ASTROLÓGICOS/CABALÍSTICOS ==========
    birth_date = models.DateField(help_text='Fecha de nacimiento')
    birth_time = models.TimeField(null=True, blank=True, help_text='Hora exacta de nacimiento')
    birth_place = models.CharField(max_length=255, blank=True, help_text='Lugar de nacimiento (ciudad, país)')
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
    birth_timezone = models.CharField(max_length=100, blank=True, help_text='Zona horaria del lugar de nacimiento')
    hebrew_name = models.CharField(max_length=255, blank=True, help_text='Nombre en hebreo (opcional)')
    
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
    """
    Análisis de Alta Cábala realizados para pacientes
    Guarda Gematria, Tarot, Mapa del Alma, Astrología, Tikún
    """
    ANALYSIS_TYPE_CHOICES = [
        ('gematria', 'Gematria'),
        ('tarot', 'Tarot Terapéutico'),
        ('soul-map', 'Mapa del Alma'),
        ('astrology', 'Carta Astral Cabalística'),
        ('tikun', 'Análisis de Tikún'),
        ('shekinah', 'Análisis Shejinah Moderno Pitagórico'),
        ('astrology-kerykeion', 'Astrología Técnica (Kerykeion)'),
        ('crossover', 'Síntesis Cruzada'),
    ]
    
    # Relaciones
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='cabalistic_analyses',
        help_text='Paciente para el que se realizó el análisis'
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='cabalistic_analyses',
        help_text='Terapeuta que ejecutó el análisis'
    )
    
    # Tipo de análisis
    analysis_type = models.CharField(
        max_length=20,
        choices=ANALYSIS_TYPE_CHOICES,
        help_text='Tipo de análisis cabalístico realizado'
    )
    
    # Datos de entrada (lo que se usó para generar el análisis)
    input_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Datos de entrada del análisis (ej: palabra para Gematria, fecha para Tarot)'
    )
    
    # Resultados completos
    result_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Resultados completos del análisis en formato JSON'
    )
    
    # Resumen para visualización rápida
    summary = models.TextField(
        blank=True,
        help_text='Resumen breve del análisis para visualización rápida'
    )
    
    # Notas del terapeuta
    therapist_notes = models.TextField(
        blank=True,
        help_text='Notas adicionales del terapeuta sobre este análisis'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_analysis_type_display()} - {self.patient.full_name} ({self.created_at.strftime('%Y-%m-%d')})"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Análisis Cabalístico'
        verbose_name_plural = 'Análisis Cabalísticos'
        indexes = [
            models.Index(fields=['patient', 'analysis_type', '-created_at']),
            models.Index(fields=['therapist', '-created_at']),
        ]

