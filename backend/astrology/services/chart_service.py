# Chart Service
# Application service for natal chart operations

from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any

from .persistence_service import PersistenceService
from ..engine.natal_chart_engine import NatalChartEngine
from ..domain.chart import NatalChart


class ChartService:
    """Service for natal chart operations"""

    def __init__(self):
        self.engine = NatalChartEngine()
        self.persistence = PersistenceService()

    def get_or_create_natal_chart(
        self,
        patient_id: int,
        birth_datetime: datetime,
        latitude: Decimal,
        longitude: Decimal,
        timezone: str = "UTC",
        house_system: str = "P",
        zodiac_type: str = "T",
        include_minor_aspects: bool = False
    ) -> NatalChart:
        """
        Get existing natal chart or create new one

        Args:
            patient_id: Patient identifier
            birth_datetime: Birth date and time
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Timezone string
            house_system: House system
            zodiac_type: Zodiac type
            include_minor_aspects: Whether to include minor aspects

        Returns:
            NatalChart object
        """
        # Check if chart already exists
        existing_chart = self.persistence.get_natal_chart(patient_id)

        if existing_chart:
            # Verify if parameters match
            if self._chart_matches_parameters(
                existing_chart, birth_datetime, latitude, longitude,
                timezone, house_system, zodiac_type
            ):
                return existing_chart
            else:
                # Parameters changed, recalculate
                self.persistence.delete_natal_chart(patient_id)

        # Calculate new chart
        chart = self.engine.calculate_natal_chart(
            patient_id=patient_id,
            birth_datetime=birth_datetime,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            house_system=house_system,
            zodiac_type=zodiac_type,
            include_minor_aspects=include_minor_aspects,
        )

        # Save to persistence
        self.persistence.save_natal_chart(chart)

        return chart

    def get_natal_chart(self, patient_id: int) -> Optional[NatalChart]:
        """
        Get natal chart for patient

        Args:
            patient_id: Patient identifier

        Returns:
            NatalChart object or None if not found
        """
        return self.persistence.get_natal_chart(patient_id)

    def update_natal_chart_parameters(
        self,
        patient_id: int,
        house_system: Optional[str] = None,
        zodiac_type: Optional[str] = None,
        include_minor_aspects: Optional[bool] = None
    ) -> Optional[NatalChart]:
        """
        Update chart calculation parameters and recalculate

        Args:
            patient_id: Patient identifier
            house_system: New house system
            zodiac_type: New zodiac type
            include_minor_aspects: New aspect calculation setting

        Returns:
            Updated NatalChart or None if chart doesn't exist
        """
        existing_chart = self.persistence.get_natal_chart(patient_id)
        if not existing_chart:
            return None

        # Update parameters
        if house_system:
            existing_chart.house_system = house_system
        if zodiac_type:
            existing_chart.zodiac_type = zodiac_type

        # Recalculate with new parameters
        new_chart = self.engine.calculate_natal_chart(
            patient_id=existing_chart.patient_id,
            birth_datetime=existing_chart.birth_datetime,
            latitude=existing_chart.latitude,
            longitude=existing_chart.longitude,
            timezone=existing_chart.timezone,
            house_system=existing_chart.house_system,
            zodiac_type=existing_chart.zodiac_type,
            include_minor_aspects=include_minor_aspects or False,
        )

        # Save updated chart
        self.persistence.save_natal_chart(new_chart)

        return new_chart

    def delete_natal_chart(self, patient_id: int) -> bool:
        """
        Delete natal chart for patient

        Args:
            patient_id: Patient identifier

        Returns:
            True if deleted, False if not found
        """
        return self.persistence.delete_natal_chart(patient_id)

    def _chart_matches_parameters(
        self,
        chart: NatalChart,
        birth_datetime: datetime,
        latitude: Decimal,
        longitude: Decimal,
        timezone: str,
        house_system: str,
        zodiac_type: str
    ) -> bool:
        """Check if chart parameters match the requested ones"""
        return (
            chart.birth_datetime == birth_datetime and
            chart.latitude == latitude and
            chart.longitude == longitude and
            chart.timezone == timezone and
            chart.house_system == house_system and
            chart.zodiac_type == zodiac_type
        )