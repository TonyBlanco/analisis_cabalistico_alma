from django.db import models
from django.contrib.auth.models import User
from datetime import datetime
from typing import Optional

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


class TestModuleQuerySet(models.QuerySet):
    def assignable(self):
        """
        Global filter to return ONLY assignable tests.
        This must be used in all user-facing views.
        """
        return self.filter(is_assignable=True)

    def _safe_testmodule_queryset(self):
        """
        Strict safety guard used by therapist/patient flows to exclude
        technical, inactive or internal modules.
        """
        return self.filter(
            domain=self.model.Domain.HOLISTIC,
            is_assignable=True,
            is_internal=False,
            is_active=True,
        )


class TestModule(models.Model):
    """Módulos de tests disponibles en la plataforma"""
    
    objects = TestModuleQuerySet.as_manager()

    class Domain(models.TextChoices):
        HOLISTIC = 'holistic', 'Holistic'
        TECHNICAL = 'technical', 'Technical'

    # Información básica
    code = models.CharField(max_length=50, unique=True)  # Código único del test
    name = models.CharField(max_length=200)  # Nombre del test
    public_name = models.CharField(
        max_length=255,
        blank=True,
        help_text='Nombre amigable visible en UI (sin nomenclatura clínica).'
    )
    canonical_family = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Familia canónica para agrupar instrumentos heredados.'
    )
    description = models.TextField()  # Descripción del test
    test_type = models.CharField(max_length=50, choices=TEST_TYPE_CHOICES)
    domain = models.CharField(
        max_length=20,
        choices=Domain.choices,
        default=Domain.HOLISTIC
    )
    
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
    is_assignable = models.BooleanField(
        default=True,
        help_text='Marca si el módulo puede asignarse desde la UI/terapeuta'
    )
    is_internal = models.BooleanField(
        default=False,
        help_text='Indica si este módulo es de uso interno (no visible en el catálogo).'
    )
    
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
    
    @property
    def display_name(self):
        """Nombre público derivado de public_name o del nombre interno."""
        return self.public_name or self.name

    def save(self, *args, **kwargs):
        if not self.public_name:
            self.public_name = self.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.display_name} ({self.code})"
    
    def is_available_for_user(self, user):
        """Verifica si un usuario tiene acceso a este test"""
        if not self.is_active:
            return False
        
        # Superusuario tiene acceso a todo
        if user.username == 'supertony' or user.is_superuser or user.is_staff:
            return True
        
        profile = user.profile
        
        # PRIORITY CHECK: Patients with Assignment-based access bypass availability checks
        # This MUST come before user_type checks to allow assigned therapist-only tests
        if profile.user_type == 'patient':
            try:
                from api.models import Patient
                from api.test_models import Assignment
                patient_obj = Patient.objects.filter(user=user).first()
                if patient_obj:
                    has_assignment = Assignment.objects.filter(
                        patient=patient_obj,
                        test_type__iexact=self.code,
                        status__in=['assigned', 'in_progress']
                    ).exists()
                    if has_assignment:
                        return True
                # Also check via assigned_to_user
                if Assignment.objects.filter(
                    assigned_to_user=user,
                    test_type__iexact=self.code,
                    status__in=['assigned', 'in_progress']
                ).exists():
                    return True
            except Exception:
                pass
        
        # Verificar tipo de usuario (after assignment check for patients)
        if profile.user_type == 'therapist' and not self.available_for_therapists:
            return False
        if profile.user_type == 'personal' and not self.available_for_personal:
            return False
        # Patients without assignment need available_for_personal flag
        if profile.user_type == 'patient' and not self.available_for_personal:
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
        # Patients inherit premium access for assigned tests (already handled above).
        user_level = 'premium' if profile.user_type in ('therapist', 'patient') else (profile.subscription_plan or 'free')
        
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


# READ-ONLY SEMANTIC LAYER - semantic bridge, do not refactor.
class HolisticExploration(models.Model):
    code = models.SlugField(unique=True)
    public_name = models.CharField(max_length=255)
    category = models.CharField(max_length=64)
    primary_sefirah = models.CharField(max_length=32)
    secondary_sefirot = models.JSONField(default=list, blank=True)
    client_visible_fields = models.JSONField(default=list, blank=True)
    therapist_only_fields = models.JSONField(default=list, blank=True)
    source_test = models.ForeignKey(
        TestModule,
        on_delete=models.PROTECT,
        related_name="holistic_explorations",
    )
    therapist_only_results = models.BooleanField(default=True)
    ai_interpretation_enabled = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


def get_holistic_exploration_for_testmodule(testmodule):
    """READ-ONLY SEMANTIC LAYER - do not refactor."""
    if not testmodule:
        return None
    return HolisticExploration.objects.filter(source_test=testmodule).first()


def get_client_view(exploration):
    """READ-ONLY SEMANTIC LAYER - client-safe view."""
    if not exploration:
        return None
    base_view = {
        "code": exploration.code,
        "public_name": exploration.public_name,
        "category": exploration.category,
        "primary_sefirah": exploration.primary_sefirah,
        "secondary_sefirot": exploration.secondary_sefirot,
        "description": exploration.description,
        "source_test_id": exploration.source_test_id,
    }
    if exploration.client_visible_fields:
        return {
            key: value
            for key, value in base_view.items()
            if key in exploration.client_visible_fields
        }
    return base_view


EXPLORATION_WORLD_BY_TEST_CODE = {
    # ATZILUT (Esencia)
    "asrs_essence": "atzilut",
    "life-purpose": "atzilut",
    # BERIA (Intelecto)
    "wellness": "beria",
    "screening-general": "beria",
    "scl90": "beria",
    "scl-90": "beria",
    "cognitive-map": "beria",
    "belief-system": "beria",
    # YETZIRAH (Emoción)
    "stress-regulation": "yetzirah",
    "anxiety-state-trait": "yetzirah",
    "emotional-literacy": "yetzirah",
    "attachment-style": "yetzirah",
    # ASSIAH (Acción/Cuerpo)
    "insomnia": "assiah",
    "nutrition": "assiah",
    "daily-rhythm": "assiah",
    "somatic-awareness": "assiah",
}

WORLD_NEXT_STEP = {
    "atzilut": "beria",
    "beria": "yetzirah",
    "yetzirah": "assiah",
    "assiah": "yetzirah",  # Asiá a menudo vuelve a Ietzirá para procesar síntomas
}

WORLD_RECOMMENDED_TESTS = {
    "atzilut": ["asrs_essence", "life-purpose"],
    "beria": ["wellness", "screening-general", "cognitive-map", "belief-system"],
    "yetzirah": ["stress-regulation", "anxiety-state-trait", "emotional-literacy", "attachment-style"],
    "assiah": ["insomnia", "nutrition", "daily-rhythm", "somatic-awareness"],
}

# Mapping legacy rules to the new engine
ASRS_STATE_TO_NEXT_WORLD = {
    "fluido": "atzilut",
    "latente": "beria",
    "forzado": "yetzirah",
    "fragmentado": "beria",
}

# BERIA -> YETZIRAH specific defaults if no structured data
BERIA_TO_YETZIRAH_DEFAULTS = {
    "wellness": "stress-regulation",
    "screening-general": "anxiety-state-trait",
    "scl90": "stress-regulation",
}


def get_therapist_next_exploration_suggestion(exploration, symbolic_result=None):
    """
    SYMBOLIC TRANSITION ENGINE (CORE PIECE)
    Calculates next world and recommends tests based on cabalistic model.
    """
    if not exploration:
        return None

    source_code = getattr(getattr(exploration, "source_test", None), "code", None)
    current_world = EXPLORATION_WORLD_BY_TEST_CODE.get(source_code)
    if not current_world:
        return None

    # 1. Resolve Next World
    next_world = None
    
    # Priority A: structured_data transition_suggestion
    if symbolic_result and isinstance(symbolic_result, dict):
        # Check standard structured_data key
        sd = symbolic_result.get('structured_data') or symbolic_result
        next_world = sd.get('transition_suggestion')

    # Priority B: Cabalistic rules (Atzilut rules)
    if not next_world and source_code == "asrs_essence" and symbolic_result:
        ritmo = (symbolic_result.get("ritmo_esencial") or symbolic_result.get("state") or "").lower()
        level = (symbolic_result.get("atzilut_level") or "").lower()
        
        if level == "low" or ritmo == "fragmentado":
            next_world = "beria"
        else:
            next_world = ASRS_STATE_TO_NEXT_WORLD.get(ritmo)

    # Priority C: Standard ladder
    if not next_world:
        next_world = WORLD_NEXT_STEP.get(current_world) or current_world

    # 2. Recommend Tests for Next World
    suggested_test_code = None
    secondary_codes = []
    
    candidates = WORLD_RECOMMENDED_TESTS.get(next_world, [])
    
    # Selection logic:
    if candidates:
        # Avoid recommending the same test we just did
        available_candidates = [c for c in candidates if c != source_code]
        if available_candidates:
            suggested_test_code = available_candidates[0]
            if len(available_candidates) > 1:
                secondary_codes = available_candidates[1:3]
    
    # Fallback to legacy beria defaults if needed
    if not suggested_test_code and current_world == "beria":
        suggested_test_code = BERIA_TO_YETZIRAH_DEFAULTS.get(source_code)

    # 3. Build Result Payload
    suggestion_name = None
    secondary_suggestions = []
    
    lookup_codes = [c for c in ([suggested_test_code] + secondary_codes) if c]
    name_by_code = {}
    if lookup_codes:
        for tm in TestModule.objects.filter(code__in=lookup_codes):
            name_by_code[tm.code] = tm.display_name
            
    if suggested_test_code:
        suggestion_name = name_by_code.get(suggested_test_code)
    
    for code in secondary_codes:
        if code in name_by_code:
            secondary_suggestions.append({
                "code": code,
                "name": name_by_code[code]
            })

    return {
        "current_world": current_world,
        "next_world": next_world,
        "suggested_test_code": suggested_test_code,
        "suggested_test_name": suggestion_name,
        "secondary_suggestions": secondary_suggestions,
    }
def get_therapist_view(exploration):
    """READ-ONLY SEMANTIC LAYER - therapist view."""
    if not exploration:
        return None
    view = get_client_view(exploration) or {}
    view.update(
        {
            "client_visible_fields": exploration.client_visible_fields,
            "therapist_only_fields": exploration.therapist_only_fields,
            "ai_interpretation_enabled": exploration.ai_interpretation_enabled,
        }
    )
    # ---- ASRS-Essence interpretation (ORM-only, runtime-only) ----
    try:
        if getattr(exploration, 'code', '') == 'asrs_essence':
            # Attempt to aggregate most recent TestResult for this TestModule (if any)
            tr = (
                TestResult.objects.filter(test_module=exploration.source_test, is_archived=False)
                .order_by('-created_at')
                .first()
            )

            interpretation = None
            if tr and tr.input_data:
                # Collect numeric responses in stable order
                try:
                    answers = None
                    if isinstance(tr.input_data, dict):
                        answers = tr.input_data.get('answers')
                    if isinstance(answers, dict) and answers:
                        raw_vals = [v for _, v in sorted(answers.items()) if isinstance(v, (int, float))]
                    else:
                        raw_vals = [v for k, v in sorted(tr.input_data.items()) if isinstance(v, (int, float))]
                except Exception:
                    # Fallback: take numeric values in insertion order
                    raw_vals = [v for v in (tr.input_data.values() if isinstance(tr.input_data, dict) else []) if isinstance(v, (int, float))]

                # If no numeric responses, provide a minimal therapist hint
                if not raw_vals:
                    interpretation = {
                        'ritmo_esencial': None,
                        'lectura': 'No hay respuestas cuantificables disponibles para generar interpretación.',
                        'foco_de_trabajo': 'Revisar respuestas crudas en el TestResult.',
                        'mundo_predominante': 'Atzilut',
                        'nivel_del_alma': 'Jaiá',
                    }
                else:
                    # Partition responses into 4 blocks (A,B,C,D) by sequential slicing
                    n = len(raw_vals)
                    # ensure at least 4 values by padding with repeats of last
                    if n < 4:
                        raw_vals = raw_vals + [raw_vals[-1]] * (4 - n)
                        n = len(raw_vals)

                    # slice into 4 roughly equal parts
                    q = n // 4
                    q = max(1, q)
                    a_vals = raw_vals[0:q]
                    b_vals = raw_vals[q: q * 2]
                    c_vals = raw_vals[q * 2: q * 3]
                    d_vals = raw_vals[q * 3: n]

                    def mean(xs):
                        return sum(xs) / len(xs) if xs else 0.0

                    a_m = mean(a_vals)
                    b_m = mean(b_vals)
                    c_m = mean(c_vals)
                    d_m = mean(d_vals)

                    # Normalize assuming scale max equals max observed value (avoid divide by zero)
                    scale_max = max(raw_vals) or 1.0
                    a_m_n = a_m / scale_max
                    b_m_n = b_m / scale_max
                    c_m_n = c_m / scale_max
                    d_m_n = d_m / scale_max

                    # Coherence index: 1 - normalized stddev across block means
                    import math
                    means = [a_m_n, b_m_n, c_m_n, d_m_n]
                    avg = mean(means)
                    variance = mean([(x - avg) ** 2 for x in means])
                    std = math.sqrt(variance)
                    coherence = max(0.0, 1.0 - std)  # clamp 0..1 roughly

                    # Deterministic rules
                    ritmo = 'fragmentado'
                    # High coherence + low friction (c) -> fluido
                    if coherence >= 0.75 and c_m_n <= 0.3:
                        ritmo = 'fluido'
                    # High intention (b) + low action (d) -> latente
                    elif b_m_n >= 0.7 and d_m_n <= 0.4:
                        ritmo = 'latente'
                    # High action (d) + low coherence -> forzado
                    elif d_m_n >= 0.7 and coherence <= 0.5:
                        ritmo = 'forzado'
                    # High dispersion -> fragmentado
                    else:
                        # dispersion if stddev high
                        if std >= 0.25:
                            ritmo = 'fragmentado'
                        else:
                            # fallback: pick dominant block
                            dominant = max(('a', a_m_n), ('b', b_m_n), ('c', c_m_n), ('d', d_m_n), key=lambda x: x[1])[0]
                            if dominant == 'a':
                                ritmo = 'fluido' if coherence > 0.6 else 'fragmentado'
                            elif dominant == 'b':
                                ritmo = 'latente'
                            elif dominant == 'c':
                                ritmo = 'fragmentado'
                            else:
                                ritmo = 'forzado' if coherence < 0.6 else 'fluido'

                    # Map canonical texts (exact strings provided)
                    texts = {
                        'fluido': '“El ritmo esencial se manifiesta de forma estable. La voluntad interna encuentra cauce natural en la acción, sin fricción significativa.”',
                        'forzado': '“Existe empuje y movimiento, pero con desconexión del pulso interno. La acción precede a la alineación.”',
                        'fragmentado': '“La energía vital aparece dispersa. Hay múltiples direcciones sin eje claro de unidad.”',
                        'latente': '“El ritmo esencial está presente, pero aún no encuentra forma de expresión sostenida en la acción.”',
                    }

                    lectura = texts.get(ritmo, '')

                    interpretation = {
                        'ritmo_esencial': ritmo,
                        'lectura': lectura,
                        'foco_de_trabajo': (
                            'Trabajar estabilidad del pulso interno y prácticas para integrar intención y acción.' if ritmo == 'fluido' else
                            'Explorar formas de contacto entre intención y acción; prácticas para manifestar la voluntad.' if ritmo == 'latente' else
                            'Reducir la disrupción entre intención y movimiento; ejercicios de regulación y coherencia.' if ritmo == 'forzado' else
                            'Priorizar anclaje y eje unificador; trabajo para reducir dispersión de impulsos.'
                        ),
                        'mundo_predominante': 'Atzilut',
                        'nivel_del_alma': 'Jaiá',
                        'indice_coherencia': float(round(coherence, 3)),
                    }

            # Attach therapist-only interpretation
            view['therapist_interpretation'] = interpretation
    except Exception:
        # Never raise in semantic helper; fail silently to avoid breaking API
        view['therapist_interpretation'] = None

    view['therapist_next_exploration_suggestion'] = get_therapist_next_exploration_suggestion(
        exploration,
        symbolic_result=view.get('therapist_interpretation') or {},
    )

    return view


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
        return f"License: {self.user.username} - {self.test_module.display_name} - {'Active' if self.active else 'Inactive'}"


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
        return f"{self.user.username} - {self.test_module.display_name}"
    
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
    archived_at = models.DateTimeField(null=True, blank=True)
    
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
        test_name = self.test_module.display_name if self.test_module else (self.test_id.upper() if self.test_id else 'Test')
        return f"{test_name} - {client} ({self.created_at.strftime('%Y-%m-%d')})"


class Assignment(models.Model):
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('pending_compute', 'Pending Compute'),
        ('completed', 'Completed'),
    ]

    # DEPRECATED: Will be removed in future version
    # Use subject_user + clinical_profile instead
    patient = models.ForeignKey(
        'api.Patient',
        on_delete=models.CASCADE,
        related_name='assignments',
        null=True,
        blank=True,
        help_text='(DEPRECATED) Use subject_user + clinical_profile instead'
    )
    
    # NEW IDENTITY-BASED FIELDS (Phase 4)
    subject_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='assignments_as_subject',
        null=True,
        blank=True,
        help_text='Usuario sobre el que se ejecuta el análisis (identidad canónica)'
    )
    clinical_profile = models.ForeignKey(
        'api.Patient',
        on_delete=models.SET_NULL,
        related_name='clinical_assignments',
        null=True,
        blank=True,
        help_text='Perfil clínico opcional (solo en contexto terapéutico)'
    )
    
    test_type = models.CharField(max_length=64)
    assigned_by_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='assignments_created',
    )
    assigned_to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='assignments_received',
    )

    questions = models.JSONField(default=list, blank=True)
    questions_hash = models.CharField(max_length=128, blank=True)
    raw_responses = models.JSONField(null=True, blank=True)
    responses_hash = models.CharField(max_length=128, blank=True)

    times_assigned = models.IntegerField(default=1)
    max_reassign = models.IntegerField(default=4)

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='assigned')
    locked = models.BooleanField(default=False)
    audit_log = models.JSONField(default=list, blank=True)
    results = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'test_type', '-created_at']),
            models.Index(fields=['assigned_to_user', '-created_at']),
            models.Index(fields=['subject_user', '-created_at']),
        ]

    def append_audit(self, event: str, data: Optional[dict] = None) -> None:
        entry = {
            'ts': datetime.utcnow().isoformat(),
            'event': event,
            'data': data or {},
        }
        log = list(self.audit_log or [])
        log.append(entry)
        self.audit_log = log
