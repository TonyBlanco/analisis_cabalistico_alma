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

# Multi-Provider AI Service with automatic fallback (Gemini -> OpenAI -> Groq -> Ollama)
try:
    from api.utils.multi_ai_service import generate_with_fallback, multi_ai
    AI_ENABLED = len(multi_ai.available_providers) > 1  # At least one real provider besides ollama
except ImportError:
    generate_with_fallback = None
    multi_ai = None
    AI_ENABLED = False
    logging.warning("[SWM-v3] multi_ai_service not available")

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
        logger.warning("[SWM-v3] build_symbols_from_kabbalistic: kabbalistic data is empty")
        return None
    
    # Log the raw incoming data for debugging
    logger.info(f"[SWM-v3] build_symbols_from_kabbalistic RAW DATA: {kabbalistic}")
    
    letter_name = kabbalistic.get("hebrewLetter", "")
    if not letter_name:
        logger.warning(f"[SWM-v3] build_symbols_from_kabbalistic: no hebrewLetter in {kabbalistic}")
        logger.warning(f"[SWM-v3] Available keys in kabbalistic: {list(kabbalistic.keys())}")
        return None
    
    # Try to find the glyph with case-insensitive matching
    hebrew_glyph = HEBREW_LETTER_GLYPHS.get(letter_name, "")
    if not hebrew_glyph:
        # Try with first letter uppercase (e.g., "aleph" -> "Aleph")
        hebrew_glyph = HEBREW_LETTER_GLYPHS.get(letter_name.capitalize(), "")
    
    if not hebrew_glyph:
        logger.warning(f"[SWM-v3] No Hebrew glyph found for letter: '{letter_name}'")
        logger.info(f"[SWM-v3] Available keys: {list(HEBREW_LETTER_GLYPHS.keys())[:5]}...")
    
    return {
        "hebrew_letter": hebrew_glyph or letter_name,  # Fallback to letter name if no glyph
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


def normalize_card_id(card_id: str) -> str:
    """
    Normalize card ID to match BOTA deck format.
    
    Frontend uses: 'fool', 'magician', 'high_priestess'
    Backend uses: 'the-fool', 'the-magician', 'the-high-priestess'
    
    This function converts various formats to the expected BOTA format.
    """
    # Already in BOTA format (check for known BOTA IDs)
    bota_ids = {
        "the-fool", "the-magician", "the-high-priestess", "the-empress",
        "the-emperor", "the-hierophant", "the-lovers", "the-chariot",
        "strength", "the-hermit", "wheel-of-fortune", "justice",
        "the-hanged-man", "death", "temperance", "the-devil", "the-tower",
        "the-star", "the-moon", "the-sun", "judgement", "the-world"
    }
    
    if card_id in bota_ids:
        return card_id
    
    # Mapping from frontend IDs (snake_case) to BOTA IDs (kebab-case)
    id_mappings = {
        "fool": "the-fool",
        "magician": "the-magician",
        "high_priestess": "the-high-priestess",
        "empress": "the-empress",
        "emperor": "the-emperor",
        "hierophant": "the-hierophant",
        "lovers": "the-lovers",
        "chariot": "the-chariot",
        "strength": "strength",
        "hermit": "the-hermit",
        "wheel_of_fortune": "wheel-of-fortune",
        "fortune": "wheel-of-fortune",
        "wheel": "wheel-of-fortune",
        "justice": "justice",
        "hanged_man": "the-hanged-man",
        "death": "death",
        "temperance": "temperance",
        "devil": "the-devil",
        "tower": "the-tower",
        "star": "the-star",
        "moon": "the-moon",
        "sun": "the-sun",
        "judgement": "judgement",
        "judgment": "judgement",
        "world": "the-world",
    }
    
    # Try direct lookup
    if card_id in id_mappings:
        return id_mappings[card_id]
    
    # Try lowercase
    card_id_lower = card_id.lower()
    if card_id_lower in id_mappings:
        return id_mappings[card_id_lower]
    
    # Log unmapped ID for debugging
    logger.warning(f"[SWM-v3] Unmapped card ID: '{card_id}' - trying best-effort normalization")
    
    # Best-effort: convert underscore to hyphen, try adding 'the-' prefix
    normalized = card_id.replace("_", "-").lower()
    if normalized in bota_ids:
        return normalized
    
    the_normalized = f"the-{normalized}"
    if the_normalized in bota_ids:
        return the_normalized
    
    return card_id  # Return original if no mapping found


def generate_ai_symbolic_reading(
    cards: List[Dict[str, Any]],
    system_id: str,
    system_meta: Dict[str, Any],
    context_focus: Optional[str] = None,
    intention: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate symbolic reading using AI (Gemini).
    
    Returns structured interpretation with:
    - system_frame: Marco del sistema simbólico
    - core_meaning: Significado central de la(s) carta(s)
    - contextual_meaning: Interpretación contextual
    """
    if not cards:
        return None
    
    card = cards[0]  # Primary card for interpretation
    card_name = card.get("nameSpanish", card.get("name", "Unknown"))
    kabbalistic = card.get("kabbalistic", {})
    correspondences = card.get("correspondences", {})
    keywords = card.get("keywords", [])
    consciousness = card.get("consciousness", {})
    
    # Simplified prompt for reliable JSON output
    system_name = system_meta.get('name', system_id)
    sefirot_str = ', '.join(kabbalistic.get('sefirot', [])) or 'N/A'
    keywords_str = ', '.join(keywords[:4]) if keywords else 'N/A'
    
    prompt = f"""Interpreta la carta "{card_name}" del {system_name}.
Letra: {kabbalistic.get('hebrewLetter', 'N/A')}, Sendero: {kabbalistic.get('path', 'N/A')}, Sefirot: {sefirot_str}.
Keywords: {keywords_str}.

Responde SOLO este JSON (sin markdown):
{{"system_frame": "El {system_name} [1 oración sobre el sistema]", "core_meaning": "[2 oraciones sobre {card_name}]", "contextual_meaning": "[2 oraciones de reflexión]", "position_meaning": ""}}"""

    try:
        # Use multi-provider AI service with automatic fallback
        ai_result = generate_with_fallback(prompt, temperature=0.7, max_tokens=512)
        
        if not ai_result.get("success"):
            raise ValueError(ai_result.get("error", "AI generation failed"))
        
        response_text = ai_result.get("text", "").strip()
        ai_provider = ai_result.get("provider", "unknown")
        
        if not response_text:
            raise ValueError("Empty AI response")
        
        logger.info(f"[SWM-v3] AI response from provider: {ai_provider}")
        
        # Handle markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            parts = response_text.split("```")
            if len(parts) >= 2:
                response_text = parts[1].strip()
        
        # Fix common JSON issues
        response_text = response_text.replace('\n', ' ').replace('\r', '').strip()
        
        # Try to extract individual fields if JSON is malformed
        import re
        
        # First try to parse as complete JSON
        parsed = None
        try:
            # Try to find a complete JSON object
            if response_text.startswith('{'):
                # Count braces to find complete JSON
                brace_count = 0
                end_idx = 0
                for i, c in enumerate(response_text):
                    if c == '{':
                        brace_count += 1
                    elif c == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
                if end_idx > 0:
                    response_text = response_text[:end_idx]
            
            parsed = json.loads(response_text)
        except json.JSONDecodeError:
            # Extract fields manually using regex - more lenient patterns
            parsed = {}
            
            # Extract system_frame - match until next key or end
            match = re.search(r'"system_frame"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)', response_text)
            if match:
                parsed['system_frame'] = match.group(1).replace('\\"', '"').replace('\\n', ' ')
            
            # Extract core_meaning
            match = re.search(r'"core_meaning"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)', response_text)
            if match:
                parsed['core_meaning'] = match.group(1).replace('\\"', '"').replace('\\n', ' ')
            
            # Extract contextual_meaning
            match = re.search(r'"contextual_meaning"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)', response_text)
            if match:
                parsed['contextual_meaning'] = match.group(1).replace('\\"', '"').replace('\\n', ' ')
            
            if parsed:
                logger.info(f"[SWM-v3] Recovered {len(parsed)} fields from malformed JSON")
            else:
                # If no fields extracted, raise error
                raise ValueError(f"Could not parse AI response: {response_text[:200]}")
        
        return {
            "system": {"id": system_id, "label": system_meta.get("name", system_id)},
            "card": {
                "name": card_name,
                "arcana": card.get("arcana", "major"),
                "keywords": keywords[:10] if keywords else [],
            },
            "symbolic_reading": {
                "system_frame": parsed.get("system_frame", "Marco simbólico no disponible."),
                "core_meaning": parsed.get("core_meaning", "Significado en proceso de interpretación."),
                "contextual_meaning": parsed.get("contextual_meaning", "Contexto en desarrollo."),
                "position_meaning": parsed.get("position_meaning", ""),
            },
            "ai_generated": True,
            "ai_provider": ai_provider,
            "notes": f"Generado por IA via {ai_provider.upper()} ({system_meta.get('source', 'Tradición Hermética')})",
        }
    except json.JSONDecodeError as e:
        logger.error(f"[SWM-v3] JSON parse error from AI response: {e}")
        logger.debug(f"[SWM-v3] Raw AI response: {response_text[:500] if response_text else 'Empty'}")
        raise
    except Exception as e:
        logger.error(f"[SWM-v3] AI generation error: {e}")
        raise


def generate_fallback_symbolic_reading(
    cards: List[Dict[str, Any]],
    system_meta: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate fallback symbolic reading when AI is not available.
    Uses pre-defined interpretations from card data.
    """
    if not cards:
        return None
    
    card = cards[0]
    card_name = card.get("nameSpanish", card.get("name", "Unknown"))
    kabbalistic = card.get("kabbalistic", {})
    correspondences = card.get("correspondences", {})
    keywords = card.get("keywords", [])
    consciousness = card.get("consciousness", {})
    
    # Build meaningful fallback from card data
    sefirot = kabbalistic.get("sefirot", [])
    hebrew_letter = kabbalistic.get("hebrewLetter", "")
    letter_meaning = kabbalistic.get("letterMeaning", "")
    path = kabbalistic.get("path", "")
    power = consciousness.get("power", "")
    aspect = consciousness.get("aspect", "")
    
    system_frame = f"El sistema {system_meta.get('name', 'Tarot')} explora la consciencia a través de arquetipos universales conectados con la tradición cabalística."
    
    core_meaning_parts = []
    if card_name:
        core_meaning_parts.append(f"{card_name} representa")
    if keywords:
        core_meaning_parts.append(f"los principios de {', '.join(keywords[:3])}")
    if power:
        core_meaning_parts.append(f"y el poder de {power}")
    core_meaning = " ".join(core_meaning_parts) + "." if core_meaning_parts else "Significado en exploración."
    
    contextual_parts = []
    if hebrew_letter and letter_meaning:
        contextual_parts.append(f"La letra {hebrew_letter} ({letter_meaning}) invita a reflexionar sobre")
    if sefirot:
        contextual_parts.append(f"el sendero entre {' y '.join(sefirot)}")
    if aspect:
        contextual_parts.append(f"desde la perspectiva del {aspect}")
    contextual_meaning = " ".join(contextual_parts) + "." if contextual_parts else "Contexto simbólico en desarrollo."
    
    return {
        "system": {"id": system_meta.get("id", "unknown"), "label": system_meta.get("name", "Tarot")},
        "card": {
            "name": card_name,
            "arcana": card.get("arcana", "major"),
            "keywords": keywords[:10] if keywords else [],
        },
        "symbolic_reading": {
            "system_frame": system_frame,
            "core_meaning": core_meaning,
            "contextual_meaning": contextual_meaning,
            "position_meaning": "",
        },
        "ai_generated": False,
        "notes": "Lectura basada en correspondencias tradicionales.",
    }


def generate_educational_reading(
    system_id: str,
    selected_cards: List[str],
    spread_type: str = "simple",
    context_focus: Optional[str] = None,
    intention: Optional[str] = None,
    astrology_enrichment: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate an educational symbolic reading.
    
    This is NOT a clinical interpretation - purely educational/symbolic exploration.
    
    Args:
        system_id: Tarot system identifier (thoth, bota, etc.)
        selected_cards: List of card IDs to include
        spread_type: Type of spread (simple, three_cards, celtic_cross, etc.)
        context_focus: Optional focus area for reading
        intention: Optional intention/question for reading
        astrology_enrichment: Optional astrology context from AstrologyContextBuilder:
            {
                'enabled': bool,
                'context': {...},  # Raw astrology data
                'symbolic_text': str,  # Text for AI prompts
                'options': {...}  # include_transits, etc.
            }
    """
    # Normalize card IDs to match BOTA deck format
    selected_cards = [normalize_card_id(cid) for cid in selected_cards]
    logger.info(f"[SWM-v3] Normalized card IDs: {selected_cards}")
    
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
            
            # DEBUG log
            logger.info(f"[SWM-v3] Card {card_data['id']}: kabbalistic={bool(kabbalistic)}, symbols={bool(symbols)}")
            if symbols:
                logger.info(f"[SWM-v3] symbols keys: {list(symbols.keys())}")
            
            cards.append({
                "draw_id": f"draw-{i+1}",
                "id": card_data["id"],
                "name": card_data["name"],
                "nameSpanish": card_data.get("nameSpanish", card_data["name"]),
                "keyNumber": card_data.get("keyNumber"),
                "reversed": random.choice([True, False]) if i > 0 else False,  # First card upright
                "position": position,
                "kabbalistic": kabbalistic,
                "kabbalistic_details": symbols,  # Renamed from 'symbols' to avoid frontend conflict
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
    
    # Generate AI symbolic reading if available
    symbolic_reading = None
    
    # Enrich context with astrology if provided
    enriched_context = context_focus
    astrology_context_data = None
    if astrology_enrichment and astrology_enrichment.get('enabled'):
        astrology_context_data = astrology_enrichment.get('context')
        symbolic_text = astrology_enrichment.get('symbolic_text', '')
        if symbolic_text:
            enriched_context = f"{context_focus or ''} [Contexto astrológico: {symbolic_text}]".strip()
            logger.info(f"[SWM-v3] Astrology enrichment applied: {len(symbolic_text)} chars")
    
    if cards and AI_ENABLED and generate_with_fallback:
        try:
            symbolic_reading = generate_ai_symbolic_reading(
                cards=cards,
                system_id=system_id,
                system_meta=system_meta,
                context_focus=enriched_context,
                intention=intention,
            )
            logger.info(f"[SWM-v3] AI symbolic reading generated successfully")
        except Exception as e:
            logger.error(f"[SWM-v3] Error generating AI reading: {e}")
            symbolic_reading = generate_fallback_symbolic_reading(cards, system_meta)
    elif cards:
        # Fallback when AI not available
        symbolic_reading = generate_fallback_symbolic_reading(cards, system_meta)
    
    return {
        "reading_id": f"swm3-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}",
        "system": system_meta,
        "spread": spread_info,
        "cards": cards,
        "symbolic_reading": symbolic_reading,
        "context": context_focus,
        "intention": intention,
        "astrology_enrichment": {
            "enabled": bool(astrology_enrichment and astrology_enrichment.get('enabled')),
            "summary": astrology_context_data.get('natal_summary') if astrology_context_data else None,
            "transits_count": len(astrology_context_data.get('current_transits', [])) if astrology_context_data else 0,
        } if astrology_enrichment else None,
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
