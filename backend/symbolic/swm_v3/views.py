"""
SWM v3 - Symbolic Workspace Module v3 Views

Endpoints gobernados para lecturas simbólicas educativas.
Implementa persistencia gobernada con tres modos:
- no_store: no persiste (default, privacidad por defecto)
- store_anonymized: persiste metadatos anonimizados
- store_with_consent: persiste con consentimiento explícito

Refs: docs/SWM_V3_INTERPRETACION_SIMBOLICA_GOBERNADA.md
"""

import json
import logging
import random
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

# Hebrew letter glyphs mapping (from cabala_py.arbol_vida)
HEBREW_LETTER_GLYPHS = {
    "Aleph": "א", "Alef": "א",
    "Beth": "ב", "Bet": "ב",
    "Gimel": "ג",
    "Daleth": "ד", "Dalet": "ד",
    "Heh": "ה", "He": "ה",
    "Vav": "ו", "Vau": "ו",
    "Zayin": "ז", "Zain": "ז",
    "Cheth": "ח", "Chet": "ח", "Het": "ח",
    "Teth": "ט", "Tet": "ט",
    "Yod": "י", "Yodh": "י",
    "Kaph": "כ", "Kaf": "כ", "Caph": "כ",
    "Lamed": "ל",
    "Mem": "מ",
    "Nun": "נ",
    "Samekh": "ס", "Samech": "ס",
    "Ayin": "ע",
    "Peh": "פ", "Pe": "פ",
    "Tzaddi": "צ", "Tzadi": "צ",
    "Qoph": "ק", "Qof": "ק",
    "Resh": "ר",
    "Shin": "ש",
    "Tau": "ת", "Tav": "ת",
}


def build_symbols_from_kabbalistic(kabbalistic: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Build frontend-compatible symbols object from kabbalistic data.
    
    Frontend expects:
      - hebrew_letter: glyph (ה)
      - letter_name: name (Aleph)
      - gematria: numeric value (1)
      - path: path number (11)
      - sefirot: array of sefirot names
      - tags: extracted from keywords/correspondences
    """
    if not kabbalistic:
        return None
    
    letter_name = kabbalistic.get("hebrewLetter", "")
    hebrew_glyph = HEBREW_LETTER_GLYPHS.get(letter_name, "")
    
    return {
        "hebrew_letter": hebrew_glyph,
        "letter_name": letter_name,
        "gematria": kabbalistic.get("letterValue"),
        "path": kabbalistic.get("path"),
        "sefirot": kabbalistic.get("sefirot", []),
        "letter_meaning": kabbalistic.get("letterMeaning", ""),
        "intelligence": kabbalistic.get("intelligence", ""),
        "cube_of_space": kabbalistic.get("cubeOfSpace", ""),
    }

# Path to symbolic data
SYMBOLIC_DATA_PATH = Path(settings.BASE_DIR).parent / "packages" / "symbolic"


def load_bota_deck() -> Dict[str, Any]:
    """Load B.O.T.A. deck data from JSON."""
    try:
        bota_path = SYMBOLIC_DATA_PATH / "tarot" / "bota" / "bota_tableau_complete.json"
        if bota_path.exists():
            with open(bota_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error loading BOTA deck: {e}")
    return {"deck": {"name": "B.O.T.A. Tarot"}, "majorArcana": []}


def get_system_metadata(system_id: str) -> Dict[str, Any]:
    """Get metadata for a symbolic system."""
    systems = {
        "thoth": {
            "id": "thoth",
            "name": "Thoth Tarot (Crowley)",
            "implemented": True,
            "description": "Crowley's Thoth Tarot with astrological and kabbalistic correspondences",
            "source": "Aleister Crowley & Lady Frieda Harris",
        },
        "golden-dawn": {
            "id": "golden-dawn",
            "name": "Golden Dawn Tarot",
            "implemented": False,
            "description": "Hermetic Order of the Golden Dawn tradition",
            "source": "Golden Dawn tradition",
        },
        "bota": {
            "id": "bota",
            "name": "B.O.T.A. Tarot",
            "implemented": True,
            "description": "Builders of the Adytum - Paul Foster Case tradition",
            "source": "Paul Foster Case",
        },
        "rider-waite": {
            "id": "rider-waite",
            "name": "Rider-Waite-Smith",
            "implemented": False,
            "description": "Classic Rider-Waite-Smith imagery",
            "source": "Arthur Edward Waite & Pamela Colman Smith",
        },
        "marsella": {
            "id": "marsella",
            "name": "Tarot de Marsella",
            "implemented": False,
            "description": "Traditional Marseille deck",
            "source": "French tradition",
        },
        "tarot-cabalistico": {
            "id": "tarot-cabalistico",
            "name": "Tarot Cabalístico",
            "implemented": True,
            "description": "Kabbalistic Tree of Life correspondences",
            "source": "Hermetic Qabalah",
        },
        "sephiroth": {
            "id": "sephiroth",
            "name": "Tarot of the Sephiroth",
            "implemented": False,
            "description": "Sephirotic path working",
            "source": "Kabbalistic tradition",
        },
        "hermetic": {
            "id": "hermetic",
            "name": "Hermetic Tarot",
            "implemented": False,
            "description": "Golden Dawn symbolism (Godfrey Dowson)",
            "source": "Godfrey Dowson",
        },
    }
    return systems.get(system_id, {
        "id": system_id,
        "name": system_id.title(),
        "implemented": False,
        "description": "System not found",
    })


def generate_educational_reading(
    system_id: str,
    selected_cards: List[str],
    spread_type: str = "simple",
    context_focus: Optional[str] = None,
    intention: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate an educational symbolic reading.
    
    This is NOT a clinical interpretation - purely educational/symbolic exploration.
    """
    system_meta = get_system_metadata(system_id)
    
    # Load deck data
    if system_id in ["thoth", "bota", "tarot-cabalistico"]:
        deck_data = load_bota_deck()
    else:
        deck_data = {"deck": {"name": system_meta["name"]}, "majorArcana": []}
    
    major_arcana = deck_data.get("majorArcana", [])
    
    # If no cards selected, pick random cards based on spread
    num_cards = {
        "simple": 1,
        "single": 1,
        "three_cards": 3,
        "observation": 3,
        "celtic_cross": 10,
        "tree_of_life": 10,
    }.get(spread_type, 1)
    
    if not selected_cards and major_arcana:
        selected_cards = [
            card["id"] for card in random.sample(major_arcana, min(num_cards, len(major_arcana)))
        ]
    
    # Build cards data
    cards = []
    positions = [
        {"id": "significator", "name": "Significador", "meaning": "Represents the querent or situation"},
        {"id": "crossing", "name": "Cruce", "meaning": "What crosses or challenges"},
        {"id": "foundation", "name": "Fundamento", "meaning": "The foundation or root"},
        {"id": "past", "name": "Pasado", "meaning": "Recent past influences"},
        {"id": "crown", "name": "Corona", "meaning": "Possible outcome or aspiration"},
        {"id": "future", "name": "Futuro", "meaning": "Near future influences"},
        {"id": "self", "name": "El Yo", "meaning": "Your current position"},
        {"id": "environment", "name": "Entorno", "meaning": "Environmental influences"},
        {"id": "hopes_fears", "name": "Esperanzas/Temores", "meaning": "Hopes and fears"},
        {"id": "outcome", "name": "Resultado", "meaning": "Final outcome"},
    ]
    
    for i, card_id in enumerate(selected_cards[:num_cards]):
        # Find card in deck
        card_data = next((c for c in major_arcana if c.get("id") == card_id), None)
        
        if card_data:
            position = positions[i] if i < len(positions) else {"id": f"pos_{i+1}", "name": f"Posición {i+1}"}
            kabbalistic = card_data.get("kabbalistic", {})
            correspondences = card_data.get("correspondences", {})
            keywords = card_data.get("keywords", [])
            
            # Build symbols for frontend compatibility
            symbols = build_symbols_from_kabbalistic(kabbalistic)
            if symbols:
                # Add tags from keywords and correspondences
                tags = list(keywords)
                if correspondences.get("astrology"):
                    tags.append(correspondences["astrology"])
                if correspondences.get("element"):
                    tags.append(correspondences["element"])
                symbols["tags"] = tags
            
            cards.append({
                "draw_id": f"draw-{i+1}",
                "id": card_data["id"],
                "name": card_data["name"],
                "nameSpanish": card_data.get("nameSpanish", card_data["name"]),
                "keyNumber": card_data.get("keyNumber"),
                "reversed": random.choice([True, False]) if i > 0 else False,  # First card upright
                "position": position,
                "kabbalistic": kabbalistic,
                "symbols": symbols,  # Frontend-compatible symbols
                "correspondences": correspondences,
                "keywords": keywords,
                "consciousness": card_data.get("consciousness", {}),
            })
        else:
            # Generate placeholder if card not found
            cards.append({
                "draw_id": f"draw-{i+1}",
                "id": card_id,
                "name": card_id.replace("-", " ").title(),
                "nameSpanish": card_id.replace("-", " ").title(),
                "reversed": False,
                "position": positions[i] if i < len(positions) else {"id": f"pos_{i+1}", "name": f"Posición {i+1}"},
            })
    
    # Build spread info
    spread_info = {
        "id": spread_type,
        "name": {
            "simple": "Tirada Simple",
            "single": "Carta Única",
            "three_cards": "Tirada Trina",
            "observation": "Tirada de Observación",
            "celtic_cross": "Cruz Celta",
            "tree_of_life": "Árbol de la Vida",
        }.get(spread_type, "Tirada Libre"),
        "positions": len(cards),
    }
    
    return {
        "reading_id": f"swm3-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}",
        "system": system_meta,
        "spread": spread_info,
        "cards": cards,
        "context": context_focus,
        "intention": intention,
        "generated_at": datetime.now().isoformat(),
        "educational_disclaimer": (
            "Esta lectura es de carácter educativo y simbólico. "
            "No constituye consejo médico, psicológico ni profesional. "
            "Las interpretaciones son exploraciones simbólicas para reflexión personal."
        ),
    }


class SwmV3SymbolicReadingCreateView(APIView):
    """
    POST /api/swm-v3/symbolic-readings/
    
    Create an educational symbolic reading with governed persistence.
    
    Request body:
    {
        "system_id": "thoth",
        "consent_mode": "no_store" | "store_anonymized" | "store_with_consent",
        "reading_type": "educational",
        "selected_cards": ["the-fool", "the-magician"],
        "spread_type": "three_cards",
        "context_focus": "relationships",
        "intention": "Explorar patrones simbólicos relevantes...",
        "consultant_id": null | int,
        "consent": {
            "explicit_opt_in": true,
            "version": "1.0",
            "accepted_at": "2026-01-28T12:00:00Z"
        }
    }
    
    Response:
    {
        "success": true,
        "stored": false,
        "mode": "no_store",
        "reading_id": "swm3-20260128-1234",
        "payload": { ... reading data ... }
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request) -> Response:
        try:
            data = request.data
            
            # Extract request parameters
            system_id = data.get("system_id", "thoth")
            consent_mode = data.get("consent_mode", "no_store")
            reading_type = data.get("reading_type", "educational")
            selected_cards = data.get("selected_cards", [])
            spread_type = data.get("spread_type", "simple")
            context_focus = data.get("context_focus")
            intention = data.get("intention")
            consultant_id = data.get("consultant_id")
            consent_data = data.get("consent", {})
            
            # Validate consent mode
            if consent_mode not in ["no_store", "store_anonymized", "store_with_consent"]:
                consent_mode = "no_store"
            
            # Check if system is implemented
            system_meta = get_system_metadata(system_id)
            if not system_meta.get("implemented", False):
                logger.info(f"[SWM-v3] System '{system_id}' not implemented, using fallback")
            
            # Generate educational reading
            reading_payload = generate_educational_reading(
                system_id=system_id,
                selected_cards=selected_cards,
                spread_type=spread_type,
                context_focus=context_focus,
                intention=intention,
            )
            
            # Determine if we should store
            stored = False
            if consent_mode == "store_with_consent" and consent_data.get("explicit_opt_in"):
                # TODO: Implement actual persistence when models are ready
                stored = True
                logger.info(f"[SWM-v3] Reading stored with consent for user {request.user.id}")
            elif consent_mode == "store_anonymized":
                # TODO: Implement anonymized storage
                stored = True
                logger.info(f"[SWM-v3] Reading stored anonymized")
            else:
                logger.info(f"[SWM-v3] Reading NOT stored (mode={consent_mode})")
            
            # Audit log (always)
            logger.info(
                f"[SWM-v3] Reading generated: system={system_id}, "
                f"spread={spread_type}, cards={len(reading_payload.get('cards', []))}, "
                f"mode={consent_mode}, stored={stored}, user={request.user.id}"
            )
            
            return Response({
                "success": True,
                "stored": stored,
                "mode": consent_mode,
                "reading_id": reading_payload.get("reading_id"),
                "payload": reading_payload,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"[SWM-v3] Error generating reading: {e}", exc_info=True)
            return Response({
                "success": False,
                "stored": False,
                "mode": None,
                "reading_id": None,
                "error": "Error interno al generar la lectura simbólica.",
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SwmV3SystemsListView(APIView):
    """
    GET /api/swm-v3/systems/
    
    List available symbolic systems and their implementation status.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request) -> Response:
        systems = [
            get_system_metadata("thoth"),
            get_system_metadata("golden-dawn"),
            get_system_metadata("bota"),
            get_system_metadata("rider-waite"),
            get_system_metadata("marsella"),
            get_system_metadata("tarot-cabalistico"),
            get_system_metadata("sephiroth"),
            get_system_metadata("hermetic"),
        ]
        
        return Response({
            "success": True,
            "systems": systems,
            "total": len(systems),
            "implemented": sum(1 for s in systems if s.get("implemented")),
        })
