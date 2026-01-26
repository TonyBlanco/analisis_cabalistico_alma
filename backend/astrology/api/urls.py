# Astrology API URLs
# URL patterns for astrology API endpoints

from django.urls import path
from .views import (
    NatalChartView, 
    SolarArcView, 
    LunarReturnView, 
    CompositeChartView, 
    DavisonChartView,
    TransitsView,
    ProgressionsView,
    SolarReturnView,
    SynastryView,
    HarmonicsView
)

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
    # Composite Chart for a specific patient
    path(
        'patients/<int:patient_id>/composite-chart/',
        CompositeChartView.as_view(),
        name='composite-chart'
    ),
    # Davison Relationship Chart for a specific patient
    path(
        'patients/<int:patient_id>/davison-chart/',
        DavisonChartView.as_view(),
        name='davison-chart'
    ),
    # Planetary Transits for a specific patient
    path(
        'patients/<int:patient_id>/transits/',
        TransitsView.as_view(),
        name='transits'
    ),
    # Secondary Progressions for a specific patient
    path(
        'patients/<int:patient_id>/progressions/',
        ProgressionsView.as_view(),
        name='progressions'
    ),
    # Solar Return for a specific patient
    path(
        'patients/<int:patient_id>/solar-return/',
        SolarReturnView.as_view(),
        name='solar-return'
    ),
    # Synastry (relationship comparison) for a specific patient
    path(
        'patients/<int:patient_id>/synastry/',
        SynastryView.as_view(),
        name='synastry'
    ),
    # Harmonic Charts for a specific patient
    path(
        'patients/<int:patient_id>/harmonics/',
        HarmonicsView.as_view(),
        name='harmonics'
    ),
]