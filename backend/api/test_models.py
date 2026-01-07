from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

# Tipos de tests disponibles
TEST_TYPE_CHOICES = [
    ('basic', 'Análisis Básico'),
    ('numerology', 'Numerología Completa'),
    ('compatibility', 'Compatibilidad de Pareja'),
    ('career', 'Orientación Profesional'),
    ('spiritual', 'Camino Espiritual'),
    ('health', 'Salud y Bienestar'),
    ('financial', 'Abundancia Financiera'),
    ('family', 'Relaciones Familiares'),
    ('purpose', 'Propósito de Vida'),
    ('past_life', 'Vidas Pasadas'),
    ('pai', 'PAI - Inventario de Personalidad'),
    ('bdi', 'BDI-II - Inventario de Depresión de Beck'),
    ('bai', 'BAI - Inventario de Ansiedad de Beck'),
    ('diagnostic', 'Diagnostic Screenings (PHQ/GAD/Other)'),
    ('holistic_screening', 'Holistic Screenings (in-house)'),
    ('wellness', 'Wellness (in-house)'),
]

# Niveles de acceso por membresía
ACCESS_LEVEL_CHOICES = [
    ('free', 'Gratuito'),
    ('personal', 'Personal'),
    ('professional', 'Profesional'),
    ('premium', 'Premium'),
]


class TestModule(models.Model):
    """Módulos de tests disponibles en la plataforma"""
    
    # Información básica
    code = models.CharField(max_length=50, unique=True)  # Código único del test
    name = models.CharField(max_length=200)  # Nombre del test
    description = models.TextField()  # Descripción del test
    test_type = models.CharField(max_length=50, choices=TEST_TYPE_CHOICES)
    
    # Control de acceso
    required_access_level = models.CharField(
        max_length=20, 
        choices=ACCESS_LEVEL_CHOICES,
        default='personal'
    )
    
    # Disponibilidad
    is_active = models.BooleanField(default=True)
    available_for_therapists = models.BooleanField(default=True)
    available_for_personal = models.BooleanField(default=True)
    
    # Límites de uso
    uses_per_month = models.IntegerField(null=True, blank=True)  # null = ilimitado
    
    # Metadatos
    icon = models.CharField(max_length=100, blank=True)  # Nombre del ícono
    order = models.IntegerField(default=0)  # Orden de visualización
    estimated_duration = models.IntegerField(default=10)  # Duración estimada en minutos
    # Licencias / restricciones de uso para instrumentos propietarios
    requires_license = models.BooleanField(default=False)
    license_info = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Módulo de Test'
        verbose_name_plural = 'Módulos de Tests'
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def is_available_for_user(self, user):
        """Verifica si un usuario tiene acceso a este test"""
        if not self.is_active:
            return False
        
        # Superusuario tiene acceso a todo
        if user.username == 'supertony' or user.is_superuser or user.is_staff:
            return True
        
        profile = user.profile
        
        # Verificar tipo de usuario
        if profile.user_type == 'therapist' and not self.available_for_therapists:
            return False
        if profile.user_type == 'personal' and not self.available_for_personal:
            return False
        
        # Si el módulo requiere licencia, solo está disponible para usuarios con licencia activa
        if self.requires_license:
            try:
                return UserTestLicense.objects.filter(user=user, test_module=self, active=True).exists()
            except Exception:
                return False

        # Verificar nivel de acceso
        # Therapists are not capped by plan (functional full access), but we still keep
        # explicit restrictions (availability flags + licenses) above.
        user_level = 'premium' if profile.user_type == 'therapist' else (profile.subscription_plan or 'free')
        
        access_hierarchy = {
            'free': 0,
            'personal': 1,
            'professional': 2,
            'premium': 3
        }
        
        required_level = access_hierarchy.get(self.required_access_level, 1)
        user_access = access_hierarchy.get(user_level, 0)
        
        # Allow if user access level is sufficient or the user has a granted license for this module
        if user_access >= required_level:
            return True
        # If the module requires a license, check if the user has a license granted
        if self.requires_license:
            try:
                return UserTestLicense.objects.filter(user=user, test_module=self, active=True).exists()
            except Exception:
                # If the model isn't available/installed yet, fallback
                return False
        return False


class UserTestLicense(models.Model):
    """Registra licencias otorgadas a usuarios para módulos licenciados"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_licenses')
    test_module = models.ForeignKey(TestModule, on_delete=models.CASCADE, related_name='licenses')
    active = models.BooleanField(default=True)
    granted_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='granted_licenses')
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['user', 'test_module']
        verbose_name = 'Licencia de Test'
        verbose_name_plural = 'Licencias de Tests'

    def __str__(self):
        return f"License: {self.user.username} - {self.test_module.name} - {'Active' if self.active else 'Inactive'}"


class UserTestAccess(models.Model):
    """Control de acceso y uso de tests por usuario"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_access')
    test_module = models.ForeignKey(TestModule, on_delete=models.CASCADE, related_name='user_access')
    
    # Estadísticas de uso
    uses_count = models.IntegerField(default=0)  # Veces que ha usado este test
    last_used = models.DateTimeField(null=True, blank=True)
    
    # Control de límites mensuales
    current_month_uses = models.IntegerField(default=0)
    month_reset_date = models.DateField(auto_now_add=True)
    
    # Acceso especial (override del nivel de membresía)
    has_special_access = models.BooleanField(default=False)
    special_access_expires = models.DateTimeField(null=True, blank=True)
    special_access_uses = models.IntegerField(null=True, blank=True)  # null = ilimitado
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'test_module']
        verbose_name = 'Acceso a Test'
        verbose_name_plural = 'Accesos a Tests'
    
    def __str__(self):
        return f"{self.user.username} - {self.test_module.name}"
    
    def can_use_test(self):
        """Verifica si el usuario puede usar este test ahora"""
        # Superusuario tiene acceso ilimitado
        if self.user.username == 'supertony' or self.user.is_superuser or self.user.is_staff:
            return True
        
        # Verificar acceso especial
        if self.has_special_access:
            if self.special_access_expires and self.special_access_expires < datetime.now():
                self.has_special_access = False
                self.save()
            elif self.special_access_uses is not None and self.special_access_uses <= 0:
                return False
            else:
                return True
        
        # Verificar límites mensuales
        if self.test_module.uses_per_month is not None:
            # Resetear contador si cambió el mes
            current_month = datetime.now().date().replace(day=1)
            if self.month_reset_date < current_month:
                self.current_month_uses = 0
                self.month_reset_date = current_month
                self.save()
            
            if self.current_month_uses >= self.test_module.uses_per_month:
                return False
        
        return self.test_module.is_available_for_user(self.user)
    
    def record_use(self):
        """Registra el uso de un test"""
        self.uses_count += 1
        self.current_month_uses += 1
        self.last_used = datetime.now()
        
        if self.has_special_access and self.special_access_uses is not None:
            self.special_access_uses -= 1
        
        self.save()


class TestResult(models.Model):
    """Resultados guardados de tests realizados (incluye tests psicométricos con análisis clínico y cabalístico)"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_results')
    test_module = models.ForeignKey(TestModule, on_delete=models.CASCADE, related_name='results', null=True, blank=True)
    
    # ID del test psicométrico (para tests que no usan TestModule)
    test_id = models.CharField(
        max_length=50,
        blank=True,
        help_text="ID del test psicométrico (ej: 'phq-9', 'gad-7', 'ptsd', 'scl-90-r', etc.)"
    )
    
    # Datos del test
    input_data = models.JSONField(null=True, blank=True)  # Datos ingresados por el usuario
    result_data = models.JSONField(null=True, blank=True)  # Resultados calculados
    
    # Para terapeutas: a quién se le hizo el test
    client_name = models.CharField(max_length=255, blank=True)
    client_birth_date = models.DateField(null=True, blank=True)
    
    # Vinculación con paciente (opcional - para cuando un terapeuta ejecuta un test para un paciente)
    patient = models.ForeignKey(
        'api.Patient',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='test_results',
        help_text='Paciente asociado a este test (si fue ejecutado por un terapeuta)'
    )
    
    # Campos específicos para tests psicométricos con análisis clínico y cabalístico
    score = models.IntegerField(
        null=True,
        blank=True,
        help_text="Puntaje numérico del test psicométrico"
    )
    clinical_diagnosis = models.CharField(
        max_length=255,
        blank=True,
        help_text="Diagnóstico clínico (ej: 'Ansiedad Severa', 'Depresión Moderada')"
    )
    kabbalah_sefira = models.CharField(
        max_length=100,
        blank=True,
        help_text="Sefirá relacionada (ej: 'Netzach', 'Malchut', 'Binah')"
    )
    angel_remedy = models.CharField(
        max_length=100,
        blank=True,
        help_text="Ángel remedio (ej: 'Caliel', 'Veuliah', 'Mikael')"
    )
    
    # Datos adicionales (opcional, para guardar respuestas crudas y análisis completo)
    details = models.JSONField(
        null=True,
        blank=True,
        help_text="Respuestas crudas, análisis completo u otros datos adicionales"
    )
    
    # Metadatos
    notes = models.TextField(blank=True)  # Notas del usuario
    is_favorite = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Resultado de Test'
        verbose_name_plural = 'Resultados de Tests'
        indexes = [
            models.Index(fields=['test_id', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['patient', 'created_at']),
        ]
    
    def __str__(self):
        client = self.client_name if self.client_name else (self.patient.full_name if self.patient else self.user.username)
        test_name = self.test_module.name if self.test_module else (self.test_id.upper() if self.test_id else 'Test')
        return f"{test_name} - {client} ({self.created_at.strftime('%Y-%m-%d')})"
