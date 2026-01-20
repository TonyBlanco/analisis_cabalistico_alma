"""Federation Views - Endpoint read-only para lectura federada cross-workspace.

Endpoint: GET /api/federation/hub-feed/

Policy: HOLISTIC_FEDERATION_POLICY.md
Authorization: FEDERATION_MVP_AUTHORIZATION_PLAN.md §2.1
"""

from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied

from api.services.federation_service import get_hub_feed
from api.serializers_federation import HubFeedSnapshotSerializer


class FederationHubFeedView(APIView):
    """Endpoint GET read-only para HubFeedSnapshot.
    
    Query params:
        - patient_id (required): ID del paciente/sujeto
        - hub (required): Código del hub (MSHE|SCDF|SCID5)
        - scope (optional): CSV de dominios/scopes (default: "analysis_records_summary")
        - date_from (optional): Fecha inicio (ISO format YYYY-MM-DD)
        - date_to (optional): Fecha fin (ISO format YYYY-MM-DD)
    
    Returns:
        200: HubFeedSnapshot con metadata + records normalizados + audit_log_id
        403: Sin permisos (no ownership, no consent, not therapist)
        400: Parámetros inválidos
    
    Auth: IsAuthenticated (terapeuta validado en service layer)
    
    Example:
        GET /api/federation/hub-feed/?patient_id=123&hub=MSHE&date_from=2025-01-01&date_to=2026-01-20
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        # Parsear query params
        patient_id = request.query_params.get('patient_id')
        hub_code = request.query_params.get('hub')
        scope_csv = request.query_params.get('scope', 'analysis_records_summary')
        date_from_str = request.query_params.get('date_from')
        date_to_str = request.query_params.get('date_to')
        
        # Validar required params
        if not patient_id:
            return Response(
                {"error": "patient_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not hub_code:
            return Response(
                {"error": "hub query parameter is required (MSHE|SCDF|SCID5)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse patient_id
        try:
            patient_id = int(patient_id)
        except (ValueError, TypeError):
            return Response(
                {"error": "patient_id must be an integer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse scope (CSV to list)
        scope = [s.strip() for s in scope_csv.split(',') if s.strip()]
        
        # Parse dates
        date_from = None
        date_to = None
        
        if date_from_str:
            try:
                date_from = datetime.fromisoformat(date_from_str).date()
            except (ValueError, TypeError):
                return Response(
                    {"error": "date_from must be ISO format (YYYY-MM-DD)"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if date_to_str:
            try:
                date_to = datetime.fromisoformat(date_to_str).date()
            except (ValueError, TypeError):
                return Response(
                    {"error": "date_to must be ISO format (YYYY-MM-DD)"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validar date_range lógico
        if date_from and date_to and date_from > date_to:
            return Response(
                {"error": "date_from must be <= date_to"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Llamar FederationService (aplica validaciones + auditoría)
        try:
            hub_feed = get_hub_feed(
                therapist_user=request.user,
                patient_id=patient_id,
                hub_code=hub_code.upper(),
                scope=scope,
                date_from=date_from,
                date_to=date_to,
            )
        except PermissionDenied as e:
            # Auditoría ya registrada como 'denied' en service
            return Response(
                {"error": str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Serializar respuesta (opcional: validar schema)
        serializer = HubFeedSnapshotSerializer(hub_feed)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
