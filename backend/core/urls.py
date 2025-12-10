"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Cualquier url que empiece por 'api/' se enviará a api/urls.py
    path('api/', include('api.urls')), 

    # --- AÑADE ESTA LÍNEA ---
    # Redirige la raíz (/) a la bienvenida de la API (/api/)
    path('', RedirectView.as_view(url='/api/', permanent=True)),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)