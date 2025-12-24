# Astrology API Serializers
# REST API serializers for natal chart operations

from rest_framework import serializers
from decimal import Decimal

from ..domain.chart import NatalChart
from ..domain.planet_position import PlanetPosition
from ..domain.house_position import HousePosition
from ..domain.aspect import Aspect


class PlanetPositionSerializer(serializers.Serializer):
    """Serializer for planet position data"""
    planet_id = serializers.IntegerField()
    planet_name = serializers.CharField()
    longitude = serializers.DecimalField(max_digits=10, decimal_places=6)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=6)
    speed = serializers.DecimalField(max_digits=10, decimal_places=6)
    sign = serializers.CharField()
    sign_degree = serializers.DecimalField(max_digits=5, decimal_places=2)
    house = serializers.IntegerField()
    retrograde = serializers.BooleanField()


class HousePositionSerializer(serializers.Serializer):
    """Serializer for house cusp data"""
    house_number = serializers.IntegerField()
    longitude = serializers.DecimalField(max_digits=10, decimal_places=6)
    sign = serializers.CharField()
    degree = serializers.DecimalField(max_digits=5, decimal_places=2)


class AspectSerializer(serializers.Serializer):
    """Serializer for planetary aspect data"""
    planet1_id = serializers.IntegerField()
    planet2_id = serializers.IntegerField()
    aspect_type = serializers.CharField()
    angle = serializers.DecimalField(max_digits=6, decimal_places=2)
    orb = serializers.DecimalField(max_digits=4, decimal_places=2)
    applying = serializers.BooleanField()


class NatalChartSerializer(serializers.Serializer):
    """Serializer for complete natal chart"""
    patient_id = serializers.IntegerField()
    birth_datetime = serializers.DateTimeField()
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    timezone = serializers.CharField()
    house_system = serializers.CharField(max_length=2)
    zodiac_type = serializers.CharField(max_length=1)
    planets = PlanetPositionSerializer(many=True)
    houses = HousePositionSerializer(many=True)
    aspects = AspectSerializer(many=True)


class NatalChartRequestSerializer(serializers.Serializer):
    """Serializer for natal chart calculation request"""
    patient_id = serializers.IntegerField()
    birth_datetime = serializers.DateTimeField()
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    timezone = serializers.CharField(required=False, default='UTC')
    house_system = serializers.ChoiceField(
        choices=['P', 'K', 'R', 'E', 'W'],
        required=False,
        default='P'
    )
    zodiac_type = serializers.ChoiceField(
        choices=['T', 'S'],
        required=False,
        default='T'
    )
    include_minor_aspects = serializers.BooleanField(required=False, default=False)


class NatalChartUpdateSerializer(serializers.Serializer):
    """Serializer for natal chart parameter updates"""
    house_system = serializers.ChoiceField(
        choices=['P', 'K', 'R', 'E', 'W'],
        required=False
    )
    zodiac_type = serializers.ChoiceField(
        choices=['T', 'S'],
        required=False
    )
    include_minor_aspects = serializers.BooleanField(required=False)