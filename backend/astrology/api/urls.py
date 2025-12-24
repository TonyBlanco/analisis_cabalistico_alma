# Astrology API URLs
# URL patterns for astrology API endpoints

from django.urls import path
from .views import NatalChartView

app_name = 'astrology'

urlpatterns = [
    # Natal chart operations for a specific patient
    path(
        'patients/<int:patient_id>/natal-chart/',
        NatalChartView.as_view(),
        name='natal-chart'
    ),
]