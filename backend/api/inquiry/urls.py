"""
Active Inquiry Engine - URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    InquiryDefinitionViewSet,
    PatientInquiryResponseViewSet,
    KnowledgeGapViewSet,
)

router = DefaultRouter()
router.register(r'definitions', InquiryDefinitionViewSet, basename='inquiry-definition')
router.register(r'responses', PatientInquiryResponseViewSet, basename='inquiry-response')
router.register(r'gaps', KnowledgeGapViewSet, basename='knowledge-gap')

urlpatterns = [
    path('', include(router.urls)),
]
