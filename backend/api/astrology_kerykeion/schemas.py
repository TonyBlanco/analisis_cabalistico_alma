"""
Schemas de validación para Kerykeion
Input y Output estructurados
"""
from typing import Optional, Dict, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict

from .params import normalize_house_system, normalize_zodiac_type


class LocationSchema(BaseModel):
    """Ubicación de nacimiento"""
    city: str = Field(..., description="Ciudad de nacimiento")
    country: str = Field(..., description="País de nacimiento")
    lat: float = Field(..., ge=-90, le=90, description="Latitud (-90 a 90)")
    lng: float = Field(..., ge=-180, le=180, description="Longitud (-180 a 180)")
    timezone: str = Field(default="UTC", description="Zona horaria (ej: 'UTC', 'America/Mexico_City')")


class KerykeionInputSchema(BaseModel):
    """Schema de entrada para Kerykeion"""
    birth_date: str = Field(..., description="Fecha de nacimiento (YYYY-MM-DD)")
    birth_time: str = Field(..., description="Hora de nacimiento (HH:MM)")
    location: LocationSchema = Field(..., description="Ubicación de nacimiento")
    house_system: Optional[str] = Field(
        default="placidus",
        description=(
            "Sistema de casas: placidus, equal, koch, whole_sign, regiomontanus, campanus "
            "o códigos: P, K, A/E, W, R, C"
        )
    )
    # Backward compatible (legacy field)
    zodiac_system: Optional[str] = Field(
        default="tropical",
        description="(Legacy) Sistema zodiacal: tropical, sidereal"
    )
    # Preferred field (new)
    zodiac_type: Optional[str] = Field(
        default=None,
        description="Sistema zodiacal: tropical, sidereal, draconic"
    )
    ayanamsha: Optional[str] = Field(
        default=None,
        description="Ayanamsha para sidereal (ej: lahiri). Opcional"
    )
    engine: str = Field(default="kerykeion", description="Motor de cálculo")
    engine_version: Optional[str] = Field(default="1.0.0", description="Versión del motor")

    @field_validator('birth_date')
    @classmethod
    def validate_birth_date(cls, v):
        """Validar formato de fecha"""
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('birth_date debe estar en formato YYYY-MM-DD')

    @field_validator('birth_time')
    @classmethod
    def validate_birth_time(cls, v):
        """Validar formato de hora"""
        try:
            datetime.strptime(v, '%H:%M')
            return v
        except ValueError:
            raise ValueError('birth_time debe estar en formato HH:MM')

    @field_validator('house_system')
    @classmethod
    def validate_house_system(cls, v):
        """Validar sistema de casas"""
        try:
            # Accept both codes and canonical names; store canonical name.
            return normalize_house_system(v)
        except Exception as e:
            raise ValueError(str(e))

    @field_validator('zodiac_system')
    @classmethod
    def validate_zodiac_system(cls, v):
        """Validar sistema zodiacal"""
        # Keep legacy field strict-ish, but accept empty and normalize when present.
        if v is None:
            return v
        zv = str(v).strip().lower()
        if not zv:
            return None
        if zv not in ('tropical', 'sidereal'):
            raise ValueError('zodiac_system debe ser uno de: tropical, sidereal')
        return zv

    @field_validator('zodiac_type')
    @classmethod
    def validate_zodiac_type(cls, v):
        if v is None:
            return v
        try:
            return normalize_zodiac_type(v)
        except Exception as e:
            raise ValueError(str(e))

    @field_validator('ayanamsha')
    @classmethod
    def validate_ayanamsha(cls, v):
        if v is None:
            return v
        s = str(v).strip().lower()
        return s or None


class PlanetOutputSchema(BaseModel):
    """Posición planetaria simplificada"""
    sign: str = Field(..., description="Signo zodiacal")
    degree: float = Field(..., ge=0, lt=30, description="Grado dentro del signo (0-29.99)")


class HouseOutputSchema(BaseModel):
    """Casa astrológica"""
    sign: str = Field(..., description="Signo del cúspide")
    degree: float = Field(..., ge=0, lt=30, description="Grado del cúspide (0-29.99)")


class AspectOutputSchema(BaseModel):
    """Aspecto entre planetas"""
    model_config = ConfigDict(populate_by_name=True)
    
    from_planet: str = Field(..., alias="from", description="Planeta origen")
    to_planet: str = Field(..., alias="to", description="Planeta destino")
    type: str = Field(..., description="Tipo de aspecto: conjunction, opposition, trine, square, sextile, quincunx, semisextile")
    orb: float = Field(..., ge=0, description="Orbe del aspecto en grados")


class CabalisticMappingSchema(BaseModel):
    """Mapeo cabalístico de un planeta"""
    sefira: str = Field(..., description="Nombre de la Sefirá (ej: Tiferet, Yesod)")
    path: Optional[int] = Field(None, ge=11, le=32, description="Número del sendero (11-32)")


class KerykeionOutputSchema(BaseModel):
    """Schema de salida estándar Kerykeion"""
    engine: str = Field(default="kerykeion", description="Motor utilizado")
    engine_version: str = Field(..., description="Versión del motor")
    planets: Dict[str, PlanetOutputSchema] = Field(..., description="Posiciones planetarias")
    houses: Dict[str, HouseOutputSchema] = Field(..., description="Casas astrológicas (indexadas por número como string)")
    aspects: List[AspectOutputSchema] = Field(..., description="Aspectos calculados")
    chart_svg: str = Field(..., description="SVG de la carta natal")
    cabalistic_mapping: Dict[str, CabalisticMappingSchema] = Field(..., description="Mapeo cabalístico planetas → Sefirot/Senderos")

