"""
views_narrative_documents.py - API para Documentos Narrativos del Consultante

Endpoints:
- POST /api/narrative-documents/ - Crear documento (terapeuta)
- GET /api/narrative-documents/ - Listar documentos del consultante autenticado
- GET /api/narrative-documents/<uuid>/ - Obtener documento específico
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import datetime
import logging

from .models import NarrativeDocument, Consultante, UserProfile

logger = logging.getLogger(__name__)


class NarrativeDocumentListCreateView(APIView):
    """
    GET: Lista documentos del consultante autenticado
    POST: Crea un documento para un consultante (solo terapeutas)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Lista documentos narrativos del usuario autenticado"""
        try:
            user = request.user
            profile = getattr(user, 'userprofile', None)
            
            # Si es consultante, mostrar sus documentos
            if profile and profile.user_type == 'patient':
                # Buscar el consultante asociado al usuario
                try:
                    consultante = Consultante.objects.get(user=user)
                except Consultante.DoesNotExist:
                    return Response({
                        'success': True,
                        'documents': [],
                        'message': 'No tienes documentos aún'
                    })
                
                documents = NarrativeDocument.objects.filter(
                    consultante=consultante,
                    is_visible_to_consultante=True
                ).order_by('-created_at')
                
                return Response({
                    'success': True,
                    'documents': [
                        {
                            'id': str(doc.id),
                            'type': doc.document_type,
                            'type_display': doc.get_document_type_display(),
                            'title': doc.title,
                            'content': doc.content,
                            'created_at': doc.created_at.isoformat(),
                            'generated_by': doc.generated_by.get_full_name() if doc.generated_by else 'Sistema'
                        }
                        for doc in documents
                    ]
                })
            
            # Si es terapeuta, puede ver todos los documentos que ha generado
            elif profile and profile.user_type == 'therapist':
                documents = NarrativeDocument.objects.filter(
                    generated_by=user
                ).order_by('-created_at')[:50]
                
                return Response({
                    'success': True,
                    'documents': [
                        {
                            'id': str(doc.id),
                            'type': doc.document_type,
                            'type_display': doc.get_document_type_display(),
                            'title': doc.title,
                            'consultante_name': doc.consultante.full_name,
                            'created_at': doc.created_at.isoformat(),
                        }
                        for doc in documents
                    ]
                })
            
            return Response({
                'success': True,
                'documents': []
            })
            
        except Exception as e:
            logger.error(f"Error listando documentos narrativos: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Crea un documento narrativo para un consultante"""
        try:
            user = request.user
            profile = getattr(user, 'userprofile', None)
            
            # Solo terapeutas pueden crear documentos
            if not profile or profile.user_type != 'therapist':
                return Response(
                    {'error': 'Solo terapeutas pueden crear documentos narrativos'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Validar datos
            consultante_uuid = request.data.get('consultante_uuid')
            document_type = request.data.get('document_type')
            title = request.data.get('title')
            content = request.data.get('content')
            
            if not all([consultante_uuid, document_type, title, content]):
                return Response(
                    {'error': 'Se requiere consultante_uuid, document_type, title y content'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar tipo de documento
            valid_types = ['soul_letter', 'journey_map', 'process_book']
            if document_type not in valid_types:
                return Response(
                    {'error': f'Tipo inválido. Válidos: {valid_types}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Buscar consultante
            try:
                consultante = Consultante.objects.get(uuid=consultante_uuid)
            except Consultante.DoesNotExist:
                return Response(
                    {'error': 'Consultante no encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Crear documento
            document = NarrativeDocument.objects.create(
                consultante=consultante,
                generated_by=user,
                document_type=document_type,
                title=title,
                content=content,
                is_visible_to_consultante=True
            )
            
            return Response({
                'success': True,
                'document': {
                    'id': str(document.id),
                    'type': document.document_type,
                    'title': document.title,
                    'created_at': document.created_at.isoformat()
                },
                'message': f'Documento "{title}" guardado y visible para {consultante.full_name}'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creando documento narrativo: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NarrativeDocumentDetailView(APIView):
    """
    GET: Obtiene un documento específico
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, document_id):
        """Obtiene un documento narrativo por ID"""
        try:
            user = request.user
            profile = getattr(user, 'userprofile', None)
            
            document = get_object_or_404(NarrativeDocument, id=document_id)
            
            # Verificar acceso
            if profile and profile.user_type == 'patient':
                # Consultante solo puede ver sus propios documentos
                try:
                    consultante = Consultante.objects.get(user=user)
                    if document.consultante != consultante:
                        return Response(
                            {'error': 'No tienes acceso a este documento'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Consultante.DoesNotExist:
                    return Response(
                        {'error': 'No tienes acceso a este documento'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            return Response({
                'success': True,
                'document': {
                    'id': str(document.id),
                    'type': document.document_type,
                    'type_display': document.get_document_type_display(),
                    'title': document.title,
                    'content': document.content,
                    'created_at': document.created_at.isoformat(),
                    'generated_by': document.generated_by.get_full_name() if document.generated_by else 'Sistema'
                }
            })
            
        except Exception as e:
            logger.error(f"Error obteniendo documento narrativo: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
