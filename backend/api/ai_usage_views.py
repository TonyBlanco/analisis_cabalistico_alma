"""API de consumo IA por terapeuta (Fase 1 metering)."""
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.ai.usage_meter import get_billing_period, get_therapist_usage_summary
from api.models_ai_usage import AIUsageEvent
from api.permissions import IsTherapist


class TherapistAIUsageView(APIView):
    """GET /api/therapist/ai-usage/ — resumen del mes actual."""

    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        period = request.query_params.get('period') or get_billing_period()
        return Response(get_therapist_usage_summary(request.user, billing_period=period))


class TherapistAIUsageHistoryView(APIView):
    """GET /api/therapist/ai-usage/history/ — últimos eventos."""

    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 50)), 200)
        period = request.query_params.get('period') or get_billing_period()
        events = (
            AIUsageEvent.objects.filter(therapist=request.user, billing_period=period)
            .select_related('patient')
            .order_by('-created_at')[:limit]
        )
        rows = [
            {
                'id': event.id,
                'task_type': event.task_type,
                'provider': event.provider,
                'model': event.model,
                'total_tokens': event.total_tokens,
                'estimated_cost_eur': str(event.estimated_cost_eur),
                'patient_id': event.patient_id,
                'source_type': event.source_type,
                'source_id': event.source_id,
                'created_at': event.created_at.isoformat(),
            }
            for event in events
        ]
        return Response({'billing_period': period, 'events': rows, 'count': len(rows)})