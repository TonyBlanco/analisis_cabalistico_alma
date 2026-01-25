# Astrology API URLs
# URL patterns for astrology API endpoints

from django.urls import path
from .views import NatalChartView, SolarArcView, LunarReturnView

app_name = 'astrology'

urlpatterns = [
    # Natal chart operations for a specific patient
    path(
        'patients/<int:patient_id>/natal-chart/',
        NatalChartView.as_view(),
        name='natal-chart'
    ),
    # Solar Arc Directions for a specific patient
    path(
        'patients/<int:patient_id>/solar-arc/',
        SolarArcView.as_view(),
        name='solar-arc'
    ),
    # Lunar Return for a specific patient
    path(
        'patients/<int:patient_id>/lunar-return/',
        LunarReturnView.as_view(),
        name='lunar-return'
    ),
]