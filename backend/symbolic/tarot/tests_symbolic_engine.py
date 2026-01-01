from django.test import SimpleTestCase

from symbolic.tarot.symbolic_engine import build_minimal_symbolic_reading, SymbolicEngineInput
from symbolic.tarot.symbolic_engine import _MAJOR_ARCANA_CANONICAL_ES


class SymbolicEngineTests(SimpleTestCase):
    def test_symbolic_engine_returns_structure(self):
        reading = build_minimal_symbolic_reading(
            SymbolicEngineInput(
                system_id="golden-dawn",
                system_label="Golden Dawn Tarot",
                card_name="The Fool",
                arcana="major",
                keywords=["beginning", "threshold"],
            )
        )
        self.assertIn("system", reading)
        self.assertIn("card", reading)
        self.assertIn("symbolic_reading", reading)
        self.assertIn("notes", reading)
        self.assertIn("core_meaning", reading["symbolic_reading"])
        self.assertIn("contextual_meaning", reading["symbolic_reading"])
        self.assertIn("position_meaning", reading["symbolic_reading"])
        self.assertIn("system_frame", reading["symbolic_reading"])

    def test_different_systems_produce_different_meanings(self):
        gd = build_minimal_symbolic_reading(
            SymbolicEngineInput(
                system_id="golden-dawn",
                system_label="Golden Dawn Tarot",
                card_name="The Fool",
                arcana="major",
                keywords=["beginning"],
            )
        )
        thoth = build_minimal_symbolic_reading(
            SymbolicEngineInput(
                system_id="thoth",
                system_label="Thoth Tarot (Crowley)",
                card_name="The Fool",
                arcana="major",
                keywords=["beginning"],
            )
        )
        self.assertNotEqual(
            gd["symbolic_reading"]["core_meaning"],
            thoth["symbolic_reading"]["core_meaning"],
        )

    def test_no_ia_calls(self):
        from pathlib import Path

        source = Path(__file__).with_name("symbolic_engine.py").read_text(encoding="utf-8")
        forbidden = ["openai", "generativeai", "gemini", "llm", "anthropic"]
        self.assertFalse(any(marker in source.lower() for marker in forbidden))

    def test_all_major_arcana_have_core_meaning(self):
        systems = [
            ("golden-dawn", "symbolic.tarot.meanings.golden_dawn"),
            ("rota", "symbolic.tarot.meanings.rota"),
            ("marsella", "symbolic.tarot.meanings.marsella"),
            ("rider-waite", "symbolic.tarot.meanings.rider_waite"),
            ("tarot-cabalistico", "symbolic.tarot.meanings.tarot_cabalistico"),
            ("oracle-symbolic", "symbolic.tarot.meanings.oracle_symbolic"),
        ]

        for system_id, module_path in systems:
            module = __import__(module_path, fromlist=["SYMBOLIC_MEANINGS"])
            meanings = getattr(module, "SYMBOLIC_MEANINGS", {})
            missing = [name for name in _MAJOR_ARCANA_CANONICAL_ES if name not in meanings]
            self.assertEqual(missing, [], msg=f"{system_id} missing: {missing}")
