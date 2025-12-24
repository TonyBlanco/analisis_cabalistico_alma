# Persistence Service
# Handles database operations for natal charts

from typing import Optional
from django.core.exceptions import ObjectDoesNotExist

from ..models import NatalChart
from ..domain.chart import NatalChart as DomainNatalChart


class PersistenceService:
    """Service for natal chart persistence operations"""

    def get_natal_chart(self, patient_id: int) -> Optional[DomainNatalChart]:
        """
        Get natal chart for patient

        Args:
            patient_id: Patient identifier

        Returns:
            Domain NatalChart object or None if not found
        """
        try:
            natal_chart_model = NatalChart.objects.get(patient_id=patient_id)
            return natal_chart_model.to_domain_chart()
        except ObjectDoesNotExist:
            return None

    def save_natal_chart(self, chart: DomainNatalChart) -> None:
        """
        Save natal chart to database

        Args:
            chart: Domain NatalChart object to save
        """
        # Check if chart already exists
        try:
            existing_chart = NatalChart.objects.get(patient_id=chart.patient_id)
            # Update existing chart
            existing_chart.birth_datetime = chart.birth_datetime
            existing_chart.latitude = chart.latitude
            existing_chart.longitude = chart.longitude
            existing_chart.timezone = chart.timezone
            existing_chart.house_system = chart.house_system
            existing_chart.zodiac_type = chart.zodiac_type
            existing_chart.planets_data = self._planets_to_dict(chart.planets)
            existing_chart.houses_data = self._houses_to_dict(chart.houses)
            existing_chart.aspects_data = self._aspects_to_dict(chart.aspects)
            existing_chart.version += 1
            existing_chart.save()
        except ObjectDoesNotExist:
            # Create new chart
            natal_chart_model = NatalChart.from_domain_chart(chart)
            natal_chart_model.save()

    def delete_natal_chart(self, patient_id: int) -> bool:
        """
        Delete natal chart for patient

        Args:
            patient_id: Patient identifier

        Returns:
            True if deleted, False if not found
        """
        try:
            natal_chart_model = NatalChart.objects.get(patient_id=patient_id)
            natal_chart_model.delete()
            return True
        except ObjectDoesNotExist:
            return False

    def _planets_to_dict(self, planets):
        """Convert planet positions to dictionary format"""
        return [{
            'planet_id': p.planet_id,
            'planet_name': p.planet_name,
            'longitude': float(p.longitude),
            'latitude': float(p.latitude),
            'distance': float(p.distance),
            'speed_longitude': float(p.speed_longitude),
            'speed_latitude': float(p.speed_latitude),
            'speed_distance': float(p.speed_distance),
            'sign': p.sign,
            'sign_degree': float(p.sign_degree),
            'house': p.house,
            'retrograde': p.retrograde
        } for p in planets]

    def _houses_to_dict(self, houses):
        """Convert house positions to dictionary format"""
        return [{
            'house_number': h.house_number,
            'longitude': float(h.longitude),
            'sign': h.sign,
            'degree': float(h.degree)
        } for h in houses]

    def _aspects_to_dict(self, aspects):
        """Convert aspects to dictionary format"""
        return [{
            'planet1_id': a.planet1_id,
            'planet2_id': a.planet2_id,
            'aspect_type': a.aspect_type,
            'angle': float(a.angle),
            'orb': float(a.orb),
            'applying': a.applying
        } for a in aspects]