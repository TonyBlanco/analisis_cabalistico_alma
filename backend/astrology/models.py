# Natal Chart Model
# Django model for storing calculated natal charts

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from decimal import Decimal
import json
from datetime import datetime

from api.models import Patient
from .config.astrology_settings import normalize_house_system, normalize_zodiac_type


class NatalChart(models.Model):
    """Django model for storing calculated natal charts"""

    # Relationship to patient
    patient = models.OneToOneField(
        Patient,
        on_delete=models.CASCADE,
        related_name='natal_chart',
        help_text='Patient this natal chart belongs to'
    )

    # Birth data (stored for verification and recalculation)
    birth_datetime = models.DateTimeField(help_text='Birth date and time')
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text='Birth latitude'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text='Birth longitude'
    )
    timezone = models.CharField(
        max_length=100,
        default='UTC',
        help_text='Timezone string'
    )

    # Calculation parameters
    house_system = models.CharField(
        max_length=2,
        default='P',
        help_text='House system used (P=Placidus, K=Koch, etc.)'
    )
    zodiac_type = models.CharField(
        max_length=1,
        default='T',
        help_text='Zodiac type (T=Tropical, S=Sidereal)'
    )

    # Calculated data stored as JSON
    planets_data = models.JSONField(
        encoder=DjangoJSONEncoder,
        help_text='Calculated planet positions'
    )
    houses_data = models.JSONField(
        encoder=DjangoJSONEncoder,
        help_text='Calculated house cusps'
    )
    aspects_data = models.JSONField(
        encoder=DjangoJSONEncoder,
        help_text='Calculated aspects between planets'
    )

    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    version = models.IntegerField(default=1, help_text='Calculation version')

    class Meta:
        verbose_name = 'Carta Natal'
        verbose_name_plural = 'Cartas Natales'
        ordering = ['-calculated_at']

    def __str__(self):
        return f"Carta Natal de {self.patient.full_name} ({self.birth_datetime.date()})"

    def to_domain_chart(self):
        """Convert to domain NatalChart object"""
        from astrology.domain.chart import NatalChart as DomainNatalChart
        from astrology.domain.planet_position import PlanetPosition
        from astrology.domain.house_position import HousePosition
        from astrology.domain.aspect import Aspect

        # Convert planets data
        planets = []
        for planet_data in self.planets_data:
            planets.append(PlanetPosition(
                planet_id=planet_data['planet_id'],
                planet_name=planet_data['planet_name'],
                longitude=Decimal(str(planet_data['longitude'])),
                latitude=Decimal(str(planet_data['latitude'])),
                distance=Decimal(str(planet_data['distance'])),
                speed_longitude=Decimal(str(planet_data['speed_longitude'])),
                speed_latitude=Decimal(str(planet_data['speed_latitude'])),
                speed_distance=Decimal(str(planet_data['speed_distance'])),
                sign=planet_data['sign'],
                sign_degree=Decimal(str(planet_data['sign_degree'])),
                house=planet_data['house'],
                retrograde=planet_data['retrograde']
            ))

        # Convert houses data
        houses = []
        for house_data in self.houses_data:
            houses.append(HousePosition(
                house_number=house_data['house_number'],
                longitude=Decimal(str(house_data['longitude'])),
                sign=house_data['sign'],
                sign_degree=Decimal(str(
                    house_data.get('sign_degree', house_data.get('degree', 0))
                )),
            ))

        # Convert aspects data
        aspects = []
        for aspect_data in self.aspects_data:
            aspects.append(Aspect(
                planet1_id=aspect_data['planet1_id'],
                planet2_id=aspect_data['planet2_id'],
                aspect_type=aspect_data['aspect_type'],
                angle=Decimal(str(aspect_data['angle'])),
                orb=Decimal(str(aspect_data['orb'])),
                applying=aspect_data['applying']
            ))

        return DomainNatalChart(
            patient_id=self.patient.id,
            birth_datetime=self.birth_datetime,
            latitude=self.latitude,
            longitude=self.longitude,
            timezone=self.timezone,
            house_system=self.house_system,
            zodiac_type=self.zodiac_type,
            planets=planets,
            houses=houses,
            aspects=aspects
        )

    @classmethod
    def from_domain_chart(cls, domain_chart):
        """Create Django model from domain NatalChart object"""
        # Convert planets to dict
        planets_data = []
        for planet in domain_chart.planets:
            planets_data.append({
                'planet_id': planet.planet_id,
                'planet_name': planet.planet_name,
                'longitude': float(planet.longitude),
                'latitude': float(planet.latitude),
                'distance': float(planet.distance),
                'speed_longitude': float(planet.speed_longitude),
                'speed_latitude': float(planet.speed_latitude),
                'speed_distance': float(planet.speed_distance),
                'sign': planet.sign,
                'sign_degree': float(planet.sign_degree),
                'house': planet.house,
                'retrograde': planet.retrograde
            })

        # Convert houses to dict
        houses_data = []
        for house in domain_chart.houses:
            houses_data.append({
                'house_number': house.house_number,
                'longitude': float(house.longitude),
                'sign': house.sign,
                'sign_degree': float(house.sign_degree),
            })

        # Convert aspects to dict
        aspects_data = []
        for aspect in domain_chart.aspects:
            aspects_data.append({
                'planet1_id': aspect.planet1_id,
                'planet2_id': aspect.planet2_id,
                'aspect_type': aspect.aspect_type,
                'angle': float(aspect.angle),
                'orb': float(aspect.orb),
                'applying': aspect.applying
            })

        return cls(
            patient_id=domain_chart.patient_id,
            birth_datetime=domain_chart.birth_datetime,
            latitude=domain_chart.latitude,
            longitude=domain_chart.longitude,
            timezone=domain_chart.timezone,
            house_system=normalize_house_system(domain_chart.house_system),
            zodiac_type=normalize_zodiac_type(domain_chart.zodiac_type),
            planets_data=planets_data,
            houses_data=houses_data,
            aspects_data=aspects_data
        )