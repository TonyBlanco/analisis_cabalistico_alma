"""
Modelo extendido para datos personales del usuario
"""
from django.db import models
from django.contrib.auth.models import User


class UserBirthData(models.Model):
    """Datos de nacimiento del usuario para cálculos cabalísticos"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='birth_data')
    
    # Datos básicos
    full_name = models.CharField(max_length=200, help_text="Nombre completo según documento")
    birth_date = models.DateField(help_text="Fecha de nacimiento")
    
    # Datos extendidos para cálculos precisos
    birth_time = models.TimeField(null=True, blank=True, help_text="Hora de nacimiento (opcional)")
    birth_city = models.CharField(max_length=200, blank=True, help_text="Ciudad de nacimiento")
    birth_country = models.CharField(max_length=100, blank=True, help_text="País de nacimiento")
    
    # Coordenadas geográficas
    birth_latitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True,
        help_text="Latitud del lugar de nacimiento"
    )
    birth_longitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True,
        help_text="Longitud del lugar de nacimiento"
    )
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_locked = models.BooleanField(
        default=False, 
        help_text="Si está bloqueado, el usuario no puede cambiar estos datos"
    )
    # Unlock / verification data
    unlock_requested = models.BooleanField(default=False, help_text='Se ha solicitado desbloqueo')
    unlock_token = models.CharField(max_length=128, blank=True, null=True, help_text='Token para desbloquear por email')
    
    # Name change tracking
    full_name_change_count = models.IntegerField(
        default=0,
        help_text="Número de veces que se ha cambiado el nombre completo"
    )
    full_name_locked = models.BooleanField(
        default=False,
        help_text="Si está bloqueado, el usuario no puede cambiar el nombre completo"
    )
    birth_place_label = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Etiqueta formateada del lugar de nacimiento (ej: 'La Habana, Cuba')"
    )
    
    # Profile update tracking (for therapist corrections)
    profile_updated_by_therapist = models.BooleanField(
        default=False,
        help_text="Indica si el terapeuta actualizó el perfil para corregir datos"
    )
    last_therapist_update = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Última vez que el terapeuta actualizó el perfil"
    )
    updated_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='birth_data_updates',
        help_text="Terapeuta que actualizó el perfil"
    )
    
    class Meta:
        verbose_name = "Datos de Nacimiento"
        verbose_name_plural = "Datos de Nacimiento"
    
    def __str__(self):
        return f"{self.full_name} - {self.birth_date}"
    
    def get_full_birth_info(self):
        """Retorna información completa de nacimiento"""
        info = {
            'nombre': self.full_name,
            'fecha': str(self.birth_date),
        }
        
        if self.birth_time:
            info['hora'] = str(self.birth_time)
        
        if self.birth_city:
            info['ciudad'] = self.birth_city
            
        if self.birth_country:
            info['pais'] = self.birth_country
            
        if self.birth_latitude and self.birth_longitude:
            info['coordenadas'] = {
                'latitud': float(self.birth_latitude),
                'longitud': float(self.birth_longitude)
            }
        
        return info

    def generate_unlock_token(self):
        import uuid
        token = uuid.uuid4().hex
        self.unlock_token = token
        self.unlock_requested = True
        self.save(update_fields=['unlock_token', 'unlock_requested'])
        return token

    def clear_unlock_request(self):
        self.unlock_requested = False
        self.unlock_token = None
        self.save(update_fields=['unlock_requested', 'unlock_token'])
    
    def is_profile_complete(self):
        """
        Valida si el perfil tiene datos esenciales completos para análisis cabalísticos.
        
        Datos mandatorios:
        - Nombre legal completo (≥2 palabras: nombre + apellidos)
        - Fecha de nacimiento
        - Lugar de nacimiento (ciudad Y país)
        
        Returns:
            dict: {
                'is_complete': bool,
                'missing_fields': list,
                'warnings': list
            }
        """
        missing = []
        warnings = []
        
        # 1. Nombre legal completo (≥2 palabras)
        if not self.full_name:
            missing.append('full_name')
        else:
            words = self.full_name.strip().split()
            if len(words) < 2:
                missing.append('full_name')
                warnings.append('El nombre debe incluir al menos nombre y apellido')
        
        # 2. Fecha de nacimiento
        if not self.birth_date:
            missing.append('birth_date')
        
        # 3. Lugar de nacimiento (ciudad Y país)
        if not self.birth_city:
            missing.append('birth_city')
        if not self.birth_country:
            missing.append('birth_country')
        
        return {
            'is_complete': len(missing) == 0,
            'missing_fields': missing,
            'warnings': warnings
        }
