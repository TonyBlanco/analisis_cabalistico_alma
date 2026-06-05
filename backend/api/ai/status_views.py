from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.ai.llm_bridge import get_provider_status


class AIStatusView(APIView):
    """GET /api/ai/status/ — providers and last inference metrics (no secrets)."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response(get_provider_status())