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

class IdentityProfile(models.Model):
    """
    Perfil de Identidad Simbólica/Astrológica
    
    Separado de Patient porque:
    - Patient = perfil clínico (terapia)
    - IdentityProfile = datos de nacimiento para cálculos simbólicos
    
    Un usuario puede tener IdentityProfile sin ser Patient (usuarios personales)
    Un Patient siempre tiene user_id que puede tener IdentityProfile
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='identity_profile',
        help_text='Usuario al que pertenece esta identidad simbólica'
    )
    
    # Birth data (astrological/symbolic)
    birth_date = models.DateField(
        help_text='Fecha de nacimiento (para astrología y cálculos cabalísticos)'
    )
    birth_time = models.TimeField(
        null=True,
        blank=True,
        help_text='Hora exacta de nacimiento (opcional, mejora precisión astrológica)'
    )
    
    # Location data (required for astrological calculations)
    birth_city = models.CharField(
        max_length=200,
        blank=True,
        help_text='Ciudad de nacimiento'
    )
    birth_country = models.CharField(
        max_length=100,
        blank=True,
        help_text='País de nacimiento'
    )
    birth_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Latitud del lugar de nacimiento (requerido para astrología)'
    )
    birth_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Longitud del lugar de nacimiento (requerido para astrología)'
    )
    birth_timezone = models.CharField(
        max_length=100,
        blank=True,
        help_text='Zona horaria del lugar de nacimiento'
    )
    
    # Symbolic identity
    hebrew_name = models.CharField(
        max_length=255,
        blank=True,
        help_text='Nombre en hebreo (opcional, para análisis cabalístico)'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Identity Profile'
        verbose_name_plural = 'Identity Profiles'
        db_table = 'api_identityprofile'
        indexes = [
            models.Index(fields=['user'], name='identity_user_idx'),
        ]
    
    def __str__(self):
        return f"IdentityProfile({self.user.username}, born {self.birth_date})"

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
    telegram_chat_id = models.BigIntegerField(
        null=True,
        blank=True,
        help_text='Chat ID de Telegram vinculado vía bot (notificaciones)',
    )

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

    # ===== MODO CLÍNICO (vocabulario clínico completo) =====
    # Solo terapeutas médicos/psiquiatras con credencial verificada.
    # NOTA: el rail anti-fraude (no fármacos/dosis/curas mágicas) NUNCA se levanta,
    # independientemente de este flag (ver clinical-lexicon.ts / formative-safety.ts).
    clinical_mode_requested = models.BooleanField(
        default=False,
        help_text='El terapeuta marcó el check de modo clínico en el alta. No habilita nada por sí solo; requiere verificación de credencial por un administrador.'
    )
    clinical_mode_enabled = models.BooleanField(
        default=False,
        help_text='Modo clínico activo: levanta el bloqueo del léxico clínico (diagnóstico, trastorno, patología…). Solo lo activa un administrador tras verificar la credencial.'
    )
    clinical_credential_verified_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Fecha de verificación de la credencial profesional que habilita el modo clínico.'
    )
    clinical_credential_verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='clinical_verifications_done',
        help_text='Administrador que verificó la credencial y activó el modo clínico.'
    )
    
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
    
    def can_use_clinical_lexicon(self):
        """El vocabulario clínico solo está disponible para terapeutas con modo clínico verificado.
        El rail anti-fraude (no fármacos/dosis/curas) NUNCA se levanta, independientemente de esto."""
        return self.user_type == 'therapist' and self.clinical_mode_enabled
    
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
    telegram = models.CharField(
        max_length=64,
        blank=True,
        default='',
        help_text='Usuario de Telegram sin @ (handle)',
    )
    send_credentials_via = models.JSONField(
        default=list,
        blank=True,
        help_text='Canales para enviar credenciales, p.ej. ["email", "telegram"]',
    )
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
    
    # ========== FEDERACIÓN HOLÍSTICA (Phase-1) ==========
    consent_federation = models.BooleanField(
        default=False,
        help_text='Consentimiento explícito del sujeto para federación de lectura cross-workspace (hubs MSHE/SCDF/SCID-5)'
    )
    consent_federation_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Fecha en que se otorgó el consentimiento de federación'
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


class TherapistPatientInvitation(models.Model):
    """
    Solicitud de un terapeuta para vincular un usuario ya registrado (p. ej. cuenta personal/Google)
    como consultante en su cartera. Requiere aceptación explícita del usuario.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptada'),
        ('rejected', 'Rechazada'),
        ('cancelled', 'Cancelada'),
    ]

    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='patient_invitations_sent',
        limit_choices_to={'profile__user_type': 'therapist'},
    )
    target_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='therapist_invitations_received',
    )
    email = models.EmailField(help_text='Email usado en la búsqueda (auditoría)')
    message = models.TextField(blank=True, help_text='Mensaje opcional del terapeuta')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_invitation',
    )
    supplemental_birth_date = models.DateField(
        null=True,
        blank=True,
        help_text='Fecha de nacimiento indicada por el terapeuta si el perfil del usuario no la tiene',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Invitación terapeuta–consultante'
        verbose_name_plural = 'Invitaciones terapeuta–consultante'
        constraints = [
            models.UniqueConstraint(
                fields=['therapist', 'target_user'],
                condition=models.Q(status='pending'),
                name='unique_pending_invitation_per_therapist_user',
            ),
        ]
        indexes = [
            models.Index(fields=['target_user', 'status'], name='inv_target_status_idx'),
            models.Index(fields=['therapist', 'status'], name='inv_therapist_status_idx'),
        ]

    def __str__(self):
        return f"Invitación {self.therapist_id} → {self.target_user_id} ({self.status})"


class TelegramLinkToken(models.Model):
    """Código corto para deep-link t.me/bot?start=… (máx. 64 chars en Telegram)."""
    PURPOSE_CHOICES = [
        ('patient_welcome', 'Bienvenida consultante'),
        ('user_link', 'Vincular cuenta existente'),
        ('invitation', 'Invitación terapeuta'),
    ]

    code = models.CharField(max_length=32, unique=True, db_index=True)
    purpose = models.CharField(max_length=32, choices=PURPOSE_CHOICES)
    user_id = models.IntegerField(help_text='Usuario Django a vincular')
    patient_id = models.IntegerField(null=True, blank=True)
    invitation_id = models.IntegerField(null=True, blank=True)
    context = models.JSONField(default=dict, blank=True)
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Token enlace Telegram'
        verbose_name_plural = 'Tokens enlace Telegram'
        indexes = [
            models.Index(fields=['code', 'expires_at'], name='tg_link_code_exp_idx'),
        ]

    def __str__(self):
        return f'TelegramLinkToken({self.code}, {self.purpose})'


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
    archived_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Patient Message'
        verbose_name_plural = 'Patient Messages'
        indexes = [
            models.Index(fields=['patient', 'created_at']),
            models.Index(fields=['therapist', 'patient', 'created_at']),
        ]

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


class AIInteractionFeedback(models.Model):
    """Feedback de terapeuta sobre asistencias IA (mejora de prompts/RAG, sin entrenamiento de pesos)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ai_interaction_feedback",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_interaction_feedback",
    )
    feature = models.CharField(max_length=64, db_index=True)
    provider = models.CharField(max_length=32, blank=True)
    prompt_version = models.CharField(max_length=64, blank=True)
    rating = models.PositiveSmallIntegerField()
    correction_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Feedback interacción IA"
        verbose_name_plural = "Feedback interacciones IA"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["feature", "-created_at"], name="api_aiif_feat_created_idx"),
            models.Index(fields=["therapist", "-created_at"], name="api_aiif_ther_created_idx"),
        ]

    def __str__(self):
        return f"AIFeedback {self.feature} ({self.rating}/5) by {self.therapist_id}"


class ProcessEvent(models.Model):
    """Evento normalizado de proceso para PIP Fase 1."""

    LANE_CHOICES = [
        ("symbolic", "Symbolic"),
        ("clinical_support", "Clinical Support"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="process_events",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="process_events",
    )
    event_type = models.CharField(max_length=96, db_index=True)
    lane = models.CharField(max_length=32, choices=LANE_CHOICES)
    source_type = models.CharField(max_length=64, db_index=True)
    source_id = models.CharField(max_length=96, db_index=True)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Evento de proceso PIP"
        verbose_name_plural = "Eventos de proceso PIP"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["therapist", "patient", "-created_at"]),
            models.Index(fields=["event_type", "-created_at"]),
        ]

    def __str__(self):
        return f"ProcessEvent {self.event_type} {self.source_type}:{self.source_id}"


class ProcessSnapshot(models.Model):
    """Resumen estructurado reutilizable por RAG, sin PHI innecesaria."""

    DOMAIN_CHOICES = [
        ("kabbalah", "Kabbalah"),
        ("bioemotion", "Bioemotion"),
        ("tarot", "Tarot"),
        ("clinical", "Clinical"),
        ("astrology", "Astrology"),
    ]
    LANE_CHOICES = ProcessEvent.LANE_CHOICES
    CONSENT_CHOICES = [
        ("store_with_consent", "Store with consent"),
        ("store_anonymized", "Store anonymized"),
        ("no_store", "No store"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="process_snapshots",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="process_snapshots",
    )
    domain = models.CharField(max_length=32, choices=DOMAIN_CHOICES, db_index=True)
    lane = models.CharField(max_length=32, choices=LANE_CHOICES, db_index=True)
    source_type = models.CharField(max_length=64, db_index=True)
    source_id = models.CharField(max_length=96, db_index=True)
    structured = models.JSONField(default=dict, blank=True)
    text_summary = models.TextField()
    consent_scope = models.CharField(
        max_length=32,
        choices=CONSENT_CHOICES,
        default="store_with_consent",
    )
    base_weight = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Snapshot de proceso PIP"
        verbose_name_plural = "Snapshots de proceso PIP"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["therapist", "source_type", "source_id"],
                name="api_process_snapshot_source_unique",
            ),
        ]
        indexes = [
            models.Index(fields=["therapist", "patient", "lane", "-created_at"]),
            models.Index(fields=["domain", "lane", "-created_at"]),
        ]

    def __str__(self):
        return f"ProcessSnapshot {self.domain}/{self.lane} {self.source_type}:{self.source_id}"


class EmbeddingChunk(models.Model):
    """Chunk embebible ligado a un snapshot; embedding local/mockeable en v1."""

    LANE_CHOICES = ProcessEvent.LANE_CHOICES

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    snapshot = models.ForeignKey(
        ProcessSnapshot,
        on_delete=models.CASCADE,
        related_name="embedding_chunks",
    )
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="embedding_chunks",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="embedding_chunks",
    )
    lane = models.CharField(max_length=32, choices=LANE_CHOICES, db_index=True)
    text = models.TextField()
    embedding = models.JSONField(default=list, blank=True)
    weight = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Chunk de embedding PIP"
        verbose_name_plural = "Chunks de embedding PIP"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["therapist", "patient", "lane", "-created_at"]),
        ]

    def __str__(self):
        return f"EmbeddingChunk {self.snapshot_id} ({self.lane})"


class FederationAuditLog(models.Model):
    """Registro inmutable de lecturas federadas cross-workspace.
    
    Cada invocación del endpoint de federación genera una entrada de auditoría.
    Logs son append-only (no updates, no deletes) para compliance.
    
    Policy: HOLISTIC_FEDERATION_POLICY.md (v2.0)
    Contract: FEDERATION_HUBS_CONTRACT.md §2.4
    """
    
    HUB_CHOICES = [
        ('MSHE', 'Motor de Síntesis Holística Evaluativa'),
        ('SCDF', 'Structured Clinical Data Formulation'),
        ('SCID5', 'SCID-5 Holístico'),
    ]
    
    STATUS_CHOICES = [
        ('allowed', 'Permitido'),
        ('denied', 'Denegado'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Identificador único del registro de auditoría'
    )
    
    # Timestamp
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text='Momento exacto de la solicitud de lectura federada'
    )
    
    # Actores
    requested_by_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='federation_audit_requests',
        help_text='Usuario (terapeuta) que solicitó la lectura federada'
    )
    
    subject_patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        db_index=True,
        related_name='federation_audit_logs',
        help_text='Paciente/sujeto cuya información fue consultada'
    )
    
    # Hub consumidor
    federation_hub = models.CharField(
        max_length=16,
        choices=HUB_CHOICES,
        help_text='Hub federado que consumió los datos (MSHE/SCDF/SCID5)'
    )
    
    # Scope de lectura
    scope = models.JSONField(
        help_text='Alcance de la solicitud: {date_range: {start, end}, included_domains: [...]}'
    )
    
    # Resultado
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default='allowed',
        help_text='Si la lectura fue permitida o denegada'
    )
    
    records_accessed_count = models.IntegerField(
        default=0,
        help_text='Número de AnalysisRecords incluidos en el feed (0 si denegado)'
    )
    
    denial_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text='Razón de denegación (ej: "no_consent", "no_ownership")'
    )
    
    # Trazabilidad opcional
    output_snapshot_id = models.UUIDField(
        null=True,
        blank=True,
        help_text='ID del output generado por el hub (si aplica)'
    )
    
    class Meta:
        verbose_name = 'Auditoría de Federación'
        verbose_name_plural = 'Auditorías de Federación'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['subject_patient', 'timestamp']),
            models.Index(fields=['requested_by_user', 'timestamp']),
            models.Index(fields=['federation_hub', 'timestamp']),
        ]
    
    def __str__(self):
        return f'FedAudit {self.federation_hub} - {self.subject_patient} by {self.requested_by_user} [{self.status}]'
    
    def delete(self, *args, **kwargs):
        """Prohibir borrado de logs de auditoría (compliance)"""
        raise Exception("FederationAuditLog records cannot be deleted (immutable for compliance)")

        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['subject', '-created_at'], name='resrel_subj_created_idx'),
            models.Index(fields=['author', '-created_at'], name='resrel_auth_created_idx'),
            models.Index(fields=['subject', 'context'], name='resrel_subj_ctx_idx'),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f'ResonanciaRelation {self.position} ({self.subject_id})'


from api.models_auth_advanced import AuthOneTimeCode, PasskeyCredential, WebAuthnChallenge  # noqa: E402,F401
