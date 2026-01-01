from __future__ import annotations

from typing import Any

from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from symbolic.tarot.execution import resolve_adapter
from symbolic.tarot import builtin_adapters  # noqa: F401
from symbolic.tarot.systems.golden_dawn_tarot import adapter as golden_dawn_adapter  # noqa: F401
from symbolic.tarot.systems.rota_tarot import adapter as rota_adapter  # noqa: F401
from symbolic.tarot.systems.tarot_de_marsella_symbolic import adapter as marsella_adapter  # noqa: F401
from symbolic.tarot.systems.rider_waite_symbolic import adapter as rider_waite_adapter  # noqa: F401
from symbolic.tarot.systems.tarot_cabalistico_tree_of_life import adapter as cabalistic_adapter  # noqa: F401
from symbolic.tarot.systems.generic_symbolic_oracle import adapter as oracle_adapter  # noqa: F401
from symbolic.tarot.symbolic_engine import build_symbolic_reading_for_payload

from .models import SymbolicReading
from .service import SymbolicReadingSaveContext, saveSymbolicReading


CONSENT_MODES = {
    SymbolicReading.ConsentMode.NO_STORE,
    SymbolicReading.ConsentMode.STORE_ANONYMIZED,
    SymbolicReading.ConsentMode.STORE_WITH_CONSENT,
}


def _json(payload: dict[str, Any], status_code: int) -> JsonResponse:
    required_defaults = {
        "success": False,
        "stored": False,
        "mode": None,
        "reading_id": None,
    }
    return JsonResponse({**required_defaults, **payload}, status=status_code)


def _error(detail: str, status_code: int = 400, mode: str | None = None) -> JsonResponse:
    return _json({"success": False, "stored": False, "mode": mode, "error": detail}, status_code)


class SwmV3SymbolicReadingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        consent_mode_raw = request.data.get("consent_mode")
        mode = consent_mode_raw if isinstance(consent_mode_raw, str) else None

        try:
            user = request.user
            if not hasattr(user, "profile") or getattr(user.profile, "user_type", None) != "therapist":
                return _error("Only therapist users can store symbolic readings.", status_code=403, mode=mode)

            consent_mode = request.data.get("consent_mode")
            if consent_mode not in CONSENT_MODES:
                return _error("Invalid consent_mode.", mode=mode)

            system_id = request.data.get("system_id")
            if not isinstance(system_id, str) or not system_id:
                return _error("Invalid system_id.", mode=consent_mode)

            selected_cards_raw = request.data.get("selected_cards") or []
            selected_cards: list[str] = (
                [str(card_id) for card_id in selected_cards_raw if isinstance(card_id, (str, int))]
                if isinstance(selected_cards_raw, list)
                else []
            )

            adapter = resolve_adapter(system_id)
            if adapter is None:
                payload_content = request.data.get("content")
                if not isinstance(payload_content, dict):
                    return _error("Unsupported system_id.", mode=consent_mode)
            else:
                payload_content = adapter.build_payload(selected_cards, context={}).to_content_dict()

            cards = payload_content.get("cards") if isinstance(payload_content, dict) else None
            if isinstance(cards, list) and cards:
                system_label = getattr(adapter, "label", system_id) if adapter is not None else system_id
                symbolic_reading = build_symbolic_reading_for_payload(
                    system_id=system_id,
                    system_label=str(system_label),
                    card=cards[0] if isinstance(cards[0], dict) else {"id": str(cards[0])},
                    spread_type=str(request.data.get("spread_type") or "simple"),
                    position=str(request.data.get("position") or "central"),
                    intention=str(request.data.get("intention") or ""),
                )
                payload_content = {**payload_content, "symbolic_reading": symbolic_reading}

            if consent_mode == SymbolicReading.ConsentMode.NO_STORE:
                return _json(
                    {
                        "success": True,
                        "stored": False,
                        "mode": consent_mode,
                        "reading_id": None,
                        "payload": payload_content,
                    },
                    status_code=200,
                )

            consent = request.data.get("consent") or {}
            if not isinstance(consent, dict):
                return _error("Invalid consent payload.", mode=consent_mode)

            explicit_opt_in = consent.get("explicit_opt_in") is True
            consent_version = consent.get("version")
            accepted_at_raw = consent.get("accepted_at")
            if not explicit_opt_in or not consent_version or not accepted_at_raw:
                return _error(
                    "Explicit opt-in consent is required to store readings.",
                    mode=consent_mode,
                )

            reading_type = request.data.get("reading_type") or SymbolicReading.ReadingType.EDUCATIONAL
            if reading_type != SymbolicReading.ReadingType.EDUCATIONAL:
                return _error("Only educational readings are allowed in Phase 3.", mode=consent_mode)

            consultant = request.data.get("consultant_id")
            consultant_user = None
            if consent_mode == SymbolicReading.ConsentMode.STORE_WITH_CONSENT and consultant:
                consultant_user = User.objects.filter(id=consultant).first()

            saved = saveSymbolicReading(
                reading=payload_content,
                consentMode=consent_mode,
                context=SymbolicReadingSaveContext(
                    therapist=user,
                    consultant=consultant_user,
                    system_id=system_id,
                    reading_type=reading_type,
                    consent_version=str(consent_version),
                    consent_accepted_at=str(accepted_at_raw),
                ),
            )

            if saved is None:
                return _json(
                    {
                        "success": True,
                        "stored": False,
                        "mode": consent_mode,
                        "reading_id": None,
                        "payload": payload_content,
                    },
                    status_code=200,
                )

            return _json(
                {
                    "success": True,
                    "stored": True,
                    "mode": consent_mode,
                    "reading_id": str(saved.id),
                    "payload": payload_content,
                },
                status_code=201,
            )
        except ValueError as error:
            return _error(str(error), mode=mode)
        except Exception:
            return _error("Unexpected server error.", status_code=500, mode=mode)

