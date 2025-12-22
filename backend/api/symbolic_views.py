"""
Vistas simbolicas pasivas (TreeStructuralState v0.1)
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .symbolic_state import build_tree_structural_state_v0_1


@method_decorator(csrf_exempt, name='dispatch')
class TreeStructuralStateView(APIView):
    """
    Estado simbolico estructural del Arbol de la Vida (v0.1).
    Ruta: POST /api/symbolic/tree-structural-state/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.data or {}
        full_name = payload.get("full_name")
        birth_date = payload.get("birth_date")
        tarot_cards = payload.get("tarot_cards")
        astrology_planets = payload.get("astrology_planets")

        state = build_tree_structural_state_v0_1(
            full_name=full_name,
            birth_date=birth_date,
            tarot_cards=tarot_cards,
            astrology_planets=astrology_planets,
        )

        return Response(state, status=status.HTTP_200_OK)
