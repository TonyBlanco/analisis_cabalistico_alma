# Persistence Service
# Handles database operations for natal charts

from typing import Optional
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
import pytz

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
        # First try primary model (astrology module)
        try:
            natal_chart_model = NatalChart.objects.get(patient_id=patient_id)
            return natal_chart_model.to_domain_chart()
        except ObjectDoesNotExist:
            pass
        
        # Fallback: try AstrologyNatalChart from api module
        try:
            from api.models_astrology import AstrologyNatalChart
            api_chart = AstrologyNatalChart.objects.get(patient_id=patient_id)
            return self._convert_api_chart_to_domain(api_chart)
        except (ObjectDoesNotExist, ImportError):
            return None
    
    def _convert_api_chart_to_domain(self, api_chart) -> DomainNatalChart:
        """
        Convert AstrologyNatalChart (api module) to domain NatalChart.
        
        Extracts birth data from input_snapshot or chart_payload.
        """
        from ..domain.chart import PlanetPosition, HousePosition, Aspect
        from decimal import Decimal
        
        payload = api_chart.chart_payload or {}
        snapshot = api_chart.input_snapshot or {}
        
        # Extract birth datetime from snapshot
        birth_dt = None
        
        # Try birth_date + birth_time format
        if snapshot.get('birth_date') and snapshot.get('birth_time'):
            try:
                date_str = snapshot['birth_date']
                time_str = snapshot['birth_time']
                birth_dt = datetime.strptime(f"{date_str} {time_str}", '%Y-%m-%d %H:%M')
                birth_dt = pytz.UTC.localize(birth_dt)
            except:
                pass
        
        if not birth_dt and snapshot.get('birth_datetime'):
            try:
                birth_dt = datetime.fromisoformat(snapshot['birth_datetime'].replace('Z', '+00:00'))
            except:
                pass
        
        if not birth_dt:
            # Last resort - construct from individual fields
            try:
                birth_dt = datetime(
                    year=int(snapshot.get('year', 1990)),
                    month=int(snapshot.get('month', 1)),
                    day=int(snapshot.get('day', 1)),
                    hour=int(snapshot.get('hour', 12)),
                    minute=int(snapshot.get('minute', 0)),
                    tzinfo=pytz.UTC
                )
            except:
                birth_dt = datetime.now(pytz.UTC)
        
        # Extract coordinates from location dict or direct fields
        location = snapshot.get('location', {})
        latitude = float(location.get('lat', snapshot.get('lat', snapshot.get('latitude', 0))))
        longitude = float(location.get('lng', snapshot.get('lng', snapshot.get('longitude', 0))))
        timezone = location.get('timezone', snapshot.get('timezone', 'UTC'))
        
        # Convert planets - simplified for Solar Arc which just needs basic birth info
        planets = []
        planets_data = payload.get('planets', {})
        planet_id = 0
        for name, data in planets_data.items():
            if isinstance(data, dict):
                planet_id += 1
                try:
                    planets.append(PlanetPosition(
                        planet_id=planet_id,
                        planet_name=name,
                        longitude=Decimal(str(data.get('abs_pos', data.get('degree', 0)))),
                        latitude=Decimal('0'),
                        distance=Decimal('1'),
                        speed_longitude=Decimal('0'),
                        speed_latitude=Decimal('0'),
                        speed_distance=Decimal('0'),
                        sign=data.get('sign', ''),
                        sign_degree=Decimal(str(data.get('degree', 0))),
                        house=int(data.get('house', 1)),
                        retrograde=data.get('retrograde', False)
                    ))
                except:
                    pass
        
        # Convert houses
        houses = []
        houses_data = payload.get('houses', {})
        for i in range(1, 13):
            house_key = str(i)
            if house_key in houses_data:
                house_data = houses_data[house_key]
                if isinstance(house_data, dict):
                    try:
                        houses.append(HousePosition(
                            house_number=i,
                            longitude=Decimal(str(house_data.get('abs_pos', house_data.get('degree', 0)))),
                            sign=house_data.get('sign', ''),
                            sign_degree=Decimal(str(house_data.get('degree', 0)))
                        ))
                    except:
                        pass
        
        # Convert aspects
        aspects = []
        aspects_data = payload.get('aspects', [])
        if isinstance(aspects_data, list):
            for asp in aspects_data:
                if isinstance(asp, dict):
                    try:
                        aspects.append(Aspect(
                            planet1_id=0,
                            planet1_name=asp.get('planet1', asp.get('p1_name', '')),
                            planet2_id=0,
                            planet2_name=asp.get('planet2', asp.get('p2_name', '')),
                            aspect_type=asp.get('aspect_type', asp.get('aspect', '')),
                            angle=Decimal(str(asp.get('angle', 0))),
                            orb=Decimal(str(asp.get('orb', 0))),
                            applying=asp.get('applying', False),
                            separating=asp.get('separating', False)
                        ))
                    except:
                        pass
        
        return DomainNatalChart(
            patient_id=api_chart.patient_id,
            birth_datetime=birth_dt,
            latitude=Decimal(str(latitude)),
            longitude=Decimal(str(longitude)),
            timezone=timezone,
            house_system=api_chart.house_system or 'placidus',
            zodiac_type='tropical',
            planets=planets,
            houses=houses,
            aspects=aspects
        )

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
            'sign_degree': float(h.sign_degree),
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