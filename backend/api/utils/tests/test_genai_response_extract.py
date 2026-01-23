from types import SimpleNamespace

from django.test import SimpleTestCase

from api.utils.genai_response import extract_debug, extract_text


class GenAIResponseHelperTest(SimpleTestCase):
    def test_prefers_text_attribute(self):
        source = SimpleNamespace(text="texto principal")
        self.assertEqual(extract_text(source), "texto principal")

    def test_candidates_content_parts_joined(self):
        parts = [SimpleNamespace(text="parte A"), SimpleNamespace(text="parte B")]
        candidate = SimpleNamespace(content=SimpleNamespace(parts=parts))
        response = SimpleNamespace(candidates=[candidate])
        self.assertEqual(extract_text(response), "parte A parte B")

    def test_dict_like_candidates_are_supported(self):
        response = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": "uno"},
                            {"text": "dos"}
                        ]
                    }
                }
            ]
        }
        self.assertEqual(extract_text(response), "uno dos")

    def test_missing_text_returns_empty_string(self):
        class Marker:
            pass

        self.assertEqual(extract_text(Marker()), "")

    def test_extract_debug_includes_expected_keys(self):
        response = {"candidates": []}
        debug = extract_debug(response)
        self.assertIn("response_type", debug)
        self.assertIn("model_dump", debug)
        self.assertIn("keys", debug)
