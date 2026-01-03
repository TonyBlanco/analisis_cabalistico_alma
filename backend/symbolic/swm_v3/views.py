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
from symbolic.tarot.meaning_resolver import ResolveInput, resolveSymbolicMeaning
from symbolic.tarot.loaders.thoth_loader import get_thoth_card
from symbolic.tarot.loaders.bota_loader import get_bota_card

from .models import SymbolicReading
from .service import SymbolicReadingSaveContext, saveSymbolicReading


CONSENT_MODES = {
    SymbolicReading.ConsentMode.NO_STORE,
    SymbolicReading.ConsentMode.STORE_ANONYMIZED,
    SymbolicReading.ConsentMode.STORE_WITH_CONSENT,
}

_SPREAD_POSITIONS: dict[str, list[dict[str, str]]] = {
    "simple": [
        {"id": "present", "nameSpanish": "Estado actual", "meaning": "Estado actual observable"},
    ],
    "three_cards": [
        {"id": "origin", "nameSpanish": "Origen", "meaning": "Punto de partida simbólico"},
        {"id": "present", "nameSpanish": "Presente", "meaning": "Estado actual observable"},
        {"id": "direction", "nameSpanish": "Dirección", "meaning": "Tendencia simbólica"},
    ],
    "observation": [
        {"id": "visible", "nameSpanish": "Lo visible", "meaning": "Lo observable en primer plano"},
        {"id": "underlying", "nameSpanish": "Lo subyacente", "meaning": "Estructura de fondo que sostiene"},
    ],
}


def _spread_positions(spread_type: str, card_count: int) -> list[dict[str, str]]:
    positions = _SPREAD_POSITIONS.get(spread_type) or _SPREAD_POSITIONS["simple"]
    if not isinstance(positions, list):
        return []
    return positions[: max(0, min(card_count, len(positions)))]


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

    def get(self, request):
        """List symbolic readings for the authenticated therapist or return a single reading by id."""
        try:
            user = request.user
            if not hasattr(user, "profile") or getattr(user.profile, "user_type", None) != "therapist":
                return _error("Only therapist users can list symbolic readings.", status_code=403)

            reading_id = request.query_params.get("id")
            if reading_id:
                reading = SymbolicReading.objects.filter(id=reading_id, therapist=user).first()
                if not reading:
                    return _error("Reading not found.", status_code=404)
                return _json({"success": True, "item": {
                    "id": str(reading.id),
                    "system_id": reading.system_id,
                    "consent_mode": reading.consent_mode,
                    "reading_type": reading.reading_type,
                    "created_at": reading.created_at.isoformat(),
                    "content": reading.content,
                }}, status_code=200)

            patient_id = request.query_params.get("patient_id")
            qs = SymbolicReading.objects.filter(therapist=user)
            if patient_id:
                try:
                    pid = int(patient_id)
                except (TypeError, ValueError):
                    return _error("Invalid patient_id.", status_code=400)
                # Lazy import to avoid tight coupling on module import.
                from api.models import Patient  # type: ignore

                patient = Patient.objects.filter(pk=pid, therapist=user, is_active=True).first()
                consultant_id = getattr(patient, "user_id", None) if patient else None
                if consultant_id:
                    qs = qs.filter(consultant_id=consultant_id)
                else:
                    qs = qs.none()

            qs = qs.order_by("-created_at")[:100]
            items = [
                {
                    "id": str(r.id),
                    "system_id": r.system_id,
                    "consent_mode": r.consent_mode,
                    "reading_type": r.reading_type,
                    "created_at": r.created_at.isoformat(),
                    "summary": (r.content.get("summary") if isinstance(r.content, dict) else None),
                }
                for r in qs
            ]
            return _json({"success": True, "items": items}, status_code=200)
        except Exception:
            return _error("Unexpected server error.", status_code=500)

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
                spread_type_raw = request.data.get("spread_type")
                spread_type = spread_type_raw if isinstance(spread_type_raw, str) and spread_type_raw else "simple"
                payload_content = adapter.build_payload(selected_cards, context={"spread_type": spread_type}).to_content_dict()

            cards = payload_content.get("cards") if isinstance(payload_content, dict) else None
            if isinstance(cards, list) and cards:
                system_label = getattr(adapter, "label", system_id) if adapter is not None else system_id
                spread_type_raw = request.data.get("spread_type")
                spread_type = spread_type_raw if isinstance(spread_type_raw, str) and spread_type_raw else "simple"
                positions = _spread_positions(spread_type, len(cards))
                context_focus_raw = request.data.get("context_focus")
                context_focus = (
                    context_focus_raw.strip()
                    if isinstance(context_focus_raw, str) and context_focus_raw.strip()
                    else "general"
                )

                positioned_cards: list[dict[str, Any]] = []
                per_card_readings: list[dict[str, Any]] = []
                for idx, raw_card in enumerate(cards):
                    card_obj = raw_card if isinstance(raw_card, dict) else {"id": str(raw_card)}
                    position_obj = positions[idx] if idx < len(positions) else None
                    if isinstance(position_obj, dict):
                        card_obj = {**card_obj, "position": position_obj}

                    # Deterministic inversion flag (backend is the authority).
                    reversed_flag = ((sum(ord(c) for c in str(card_obj.get("id") or "")) + idx) % 2) == 1
                    card_label = str(card_obj.get("name") or card_obj.get("id") or "Carta")
                    name_es = card_obj.get("nameSpanish")
                    if not isinstance(name_es, str) or not name_es.strip():
                        card_obj = {**card_obj, "nameSpanish": card_label}

                    if system_id == "thoth":
                        thoth_card = get_thoth_card(card_obj.get("id") or card_obj.get("code"))
                        if isinstance(thoth_card, dict):
                            thoth_upright = thoth_card.get("upright") if isinstance(thoth_card.get("upright"), dict) else {}
                            thoth_reversed = thoth_card.get("reversed") if isinstance(thoth_card.get("reversed"), dict) else {}
                            thoth_kabbalistic = (
                                thoth_card.get("kabbalistic")
                                if isinstance(thoth_card.get("kabbalistic"), dict)
                                else {}
                            )
                            extra_symbols = {
                                "nameSpanish": thoth_card.get("nameSpanish"),
                                "keywords": thoth_card.get("keywords"),
                                "keywordsReversed": thoth_card.get("keywordsReversed"),
                                "upright": {
                                    "general": thoth_upright.get("general"),
                                    "love": thoth_upright.get("love"),
                                    "career": thoth_upright.get("career"),
                                    "spiritual": thoth_upright.get("spiritual"),
                                },
                                "reversed": {
                                    "general": thoth_reversed.get("general"),
                                    "love": thoth_reversed.get("love"),
                                    "career": thoth_reversed.get("career"),
                                    "spiritual": thoth_reversed.get("spiritual"),
                                },
                                "kabbalistic": {
                                    "hebrewLetter": thoth_kabbalistic.get("hebrewLetter"),
                                    "path": thoth_kabbalistic.get("path"),
                                    "sefirot": thoth_kabbalistic.get("sefirot"),
                                    "element": thoth_kabbalistic.get("element"),
                                    "planet": thoth_kabbalistic.get("planet"),
                                    "sign": thoth_kabbalistic.get("sign"),
                                    "decan": thoth_kabbalistic.get("decan"),
                                },
                                # Backward-compatible: populate existing UI fields as additional enrichment.
                                "hebrew_letter": thoth_kabbalistic.get("hebrewLetter"),
                                "letter_name": thoth_kabbalistic.get("hebrewLetter"),
                                "gematria": thoth_kabbalistic.get("letterValue"),
                                "path": thoth_kabbalistic.get("path"),
                                "sefirot": thoth_kabbalistic.get("sefirot"),
                            }
                            existing_symbols = card_obj.get("symbols") if isinstance(card_obj.get("symbols"), dict) else {}
                            card_obj = {
                                **card_obj,
                                "nameSpanish": thoth_card.get("nameSpanish") or card_obj.get("nameSpanish"),
                                "symbols": {**existing_symbols, **extra_symbols},
                            }

                    if system_id == "bota":
                        bota_card = get_bota_card(card_obj.get("id") or card_obj.get("code"))
                        if isinstance(bota_card, dict):
                            kabbalistic = (
                                bota_card.get("kabbalistic")
                                if isinstance(bota_card.get("kabbalistic"), dict)
                                else {}
                            )
                            colors = (
                                kabbalistic.get("colors")
                                if isinstance(kabbalistic.get("colors"), dict)
                                else {}
                            )
                            extra_symbols = {
                                "nameSpanish": bota_card.get("nameSpanish"),
                                "keywords": None,
                                "keywordsReversed": None,
                                "upright": {},
                                "reversed": {},
                                "kabbalistic": {
                                    "hebrewLetter": kabbalistic.get("hebrewLetter"),
                                    "letterValue": kabbalistic.get("letterValue"),
                                    "path": kabbalistic.get("path"),
                                    "sefirot": kabbalistic.get("sefirot"),
                                    "element": kabbalistic.get("element"),
                                    "planet": kabbalistic.get("planet"),
                                    "sign": kabbalistic.get("sign"),
                                    "decan": kabbalistic.get("decan"),
                                    "colors": colors if colors else None,
                                },
                                # Backward-compatible: populate existing UI fields as additional enrichment.
                                "hebrew_letter": kabbalistic.get("hebrewLetter"),
                                "letter_name": kabbalistic.get("hebrewLetter"),
                                "gematria": kabbalistic.get("letterValue"),
                                "path": kabbalistic.get("path"),
                                "sefirot": kabbalistic.get("sefirot"),
                            }
                            existing_symbols = card_obj.get("symbols") if isinstance(card_obj.get("symbols"), dict) else {}
                            card_obj = {
                                **card_obj,
                                "name": bota_card.get("nameSpanish") or card_obj.get("name"),
                                "nameSpanish": bota_card.get("nameSpanish") or card_obj.get("nameSpanish"),
                                "symbols": {**existing_symbols, **extra_symbols},
                            }

                    meaning = resolveSymbolicMeaning(
                        ResolveInput(
                            system_id=system_id,
                            system_label=str(system_label),
                            card=card_obj,
                            position=position_obj if isinstance(position_obj, dict) else None,
                            reversed=reversed_flag,
                            context_focus=context_focus,
                        )
                    )
                    # Keep backward-compatible container shape used by UI.
                    keywords_out = meaning.get("keywords")
                    if system_id == "bota":
                        keywords_out = []
                    elif not keywords_out:
                        keywords_out = card_obj.get("tags") or []
                    sr = {
                        "system": {"id": system_id, "label": str(system_label)},
                        "card": {
                            "name": meaning.get("title") or card_label,
                            "arcana": str(card_obj.get("arcana") or "unknown"),
                            "keywords": keywords_out,
                        },
                        "symbolic_reading": {
                            "core_meaning": meaning.get("core_meaning") or "",
                            "contextual_meaning": meaning.get("contextual_meaning") or "",
                            "context_meaning": meaning.get("context_meaning") or "",
                            "position_meaning": meaning.get("position_meaning") or "",
                            "system_frame": meaning.get("system_frame") or "",
                        },
                        "notes": "Lectura simbólica estructurada. No diagnóstica.",
                    }

                    card_obj = {
                        **card_obj,
                        "reversed": reversed_flag,
                        "keywords": keywords_out,
                        "upright": meaning.get("upright") or {},
                        "reversed_context": meaning.get("reversed") or {},
                        "symbolic_reading": sr,
                    }
                    positioned_cards.append(card_obj)
                    per_card_readings.append(sr)

                cards = positioned_cards
                payload_content = {**payload_content, "cards": positioned_cards}

                # Backward-compatible: keep top-level symbolic_reading for the first card.
                payload_content = {**payload_content, "symbolic_reading": per_card_readings[0] if per_card_readings else None}

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


class SwmV3SymbolicReadingDetailView(APIView):
    """Detail view for a single symbolic reading. Supports GET (therapist owner) and DELETE with strict checks.

    DELETE enforces:
    - authenticated user is a therapist
    - therapist is owner of the reading
    - reading.system_id corresponds to B.O.T.A. (allows several common variants)
    - reading.reading_type is the allowed phase type
    - reading.consent_mode represents a stored reading (not `no_store`)
    Returns hard-delete (permanent) on success.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            user = request.user
            if not hasattr(user, "profile") or getattr(user.profile, "user_type", None) != "therapist":
                return _error("Only therapist users can access symbolic readings.", status_code=403)

            reading = SymbolicReading.objects.filter(id=pk, therapist=user).first()
            if not reading:
                return _error("Reading not found.", status_code=404)

            return _json(
                {
                    "success": True,
                    "item": {
                        "id": str(reading.id),
                        "system_id": reading.system_id,
                        "consent_mode": reading.consent_mode,
                        "reading_type": reading.reading_type,
                        "created_at": reading.created_at.isoformat(),
                        "content": reading.content,
                    },
                },
                status_code=200,
            )
        except Exception:
            return _error("Unexpected server error.", status_code=500)

    def delete(self, request, pk):
        try:
            user = request.user
            if not hasattr(user, "profile") or getattr(user.profile, "user_type", None) != "therapist":
                return _error("Only therapist users can delete symbolic readings.", status_code=403)

            reading = SymbolicReading.objects.filter(id=pk).first()
            if not reading:
                return _error("Reading not found.", status_code=404)

            # Ownership check
            if reading.therapist_id != user.id:
                return _error("You are not the owner of this reading.", status_code=403)

            # System check: accept common variants that indicate B.O.T.A.
            sysid = (reading.system_id or "").lower()
            allowed_sys_keywords = ["bota", "tarot_bota", "tarot-bota", "tarotbota"]
            if not any(k in sysid for k in allowed_sys_keywords):
                return _error("Deletion allowed only for B.O.T.A. symbolic readings.", status_code=403)

            # Reading type check (phase 3 stored readings are 'educational')
            if reading.reading_type != SymbolicReading.ReadingType.EDUCATIONAL:
                return _error("Deletion allowed only for phase-3 educational symbolic readings.", status_code=403)

            # Only allow deleting stored readings (cannot delete non-stored/no_store)
            if reading.consent_mode == SymbolicReading.ConsentMode.NO_STORE:
                return _error("Cannot delete non-stored observational readings.", status_code=403)

            # Hard delete
            reading.delete()
            return _json({"success": True, "deleted": True}, status_code=200)
        except Exception:
            return _error("Unexpected server error.", status_code=500)
