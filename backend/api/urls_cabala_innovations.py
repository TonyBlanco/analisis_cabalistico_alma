"""
urls_cabala_innovations.py - URLs para las Innovaciones Cabalísticas

Incluir en backend/api/urls.py:
    path('api/cabala/', include('api.urls_cabala_innovations')),
"""

from django.urls import path
from .views_cabala_innovations import (
    CabalaSincroniasView,
    CabalaAlertasPreventivasView,
    CabalaExportacionNarrativaView,
    CabalaCalendarioCosmicView,
    CabalaCalendarioLunarView,
    CabalaMapaAnualView,
    CabalaAnalisisEventoView,
    CabalaLaboratorioNombresView,
    CabalaMeditacionesView,
    CabalaArbolVivoView,
    CabalaArbolVivoActivityView,
)

app_name = 'cabala_innovations'

urlpatterns = [
    # INNOVACIÓN 7: Sincronías Biográficas
    path('sincronias/', CabalaSincroniasView.as_view(), name='sincronias'),
    
    # Alertas Preventivas Éticas
    path('alertas-preventivas/', CabalaAlertasPreventivasView.as_view(), name='alertas_preventivas'),
    
    # Exportación Narrativa Hermosa
    path('exportacion-narrativa/', CabalaExportacionNarrativaView.as_view(), name='exportacion_narrativa'),
    
    # INNOVACIÓN 15: Calendario Cósmico
    path('calendario-cosmico/', CabalaCalendarioCosmicView.as_view(), name='calendario_cosmico'),
    path('calendario-cosmico/lunar/', CabalaCalendarioLunarView.as_view(), name='calendario_lunar'),
    path('calendario-cosmico/anual/', CabalaMapaAnualView.as_view(), name='mapa_anual'),
    path('calendario-cosmico/analizar-evento/', CabalaAnalisisEventoView.as_view(), name='analizar_evento'),
    
    # INNOVACIÓN 4: Laboratorio de Nombres
    path('laboratorio-nombres/', CabalaLaboratorioNombresView.as_view(), name='laboratorio_nombres'),
    
    # INNOVACIÓN 5: Meditaciones Personalizadas
    path('meditaciones/', CabalaMeditacionesView.as_view(), name='meditaciones'),
    
    # INNOVACIÓN 13: Árbol Vivo (Gamificación)
    path('arbol-vivo/', CabalaArbolVivoView.as_view(), name='arbol_vivo'),
    path('arbol-vivo/<uuid:uuid>/', CabalaArbolVivoView.as_view(), name='arbol_vivo_detail'),
    path('arbol-vivo/<uuid:uuid>/activity/', CabalaArbolVivoActivityView.as_view(), name='arbol_vivo_activity'),
]
