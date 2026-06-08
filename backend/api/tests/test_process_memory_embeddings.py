from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from api.models import Patient
from api.process_memory.embeddings import (
    LexicalEmbeddingBackend,
    OllamaEmbeddingBackend,
    get_embedding_backend,
)


class ProcessMemoryEmbeddingsTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist = User.objects.create_user("emb_therapist", "emb@example.com", "pass")
        self.therapist.profile.user_type = "therapist"
        self.therapist.profile.save()
        self.patient = Patient.objects.create(
            therapist=self.therapist,
            first_name="Embed",
            last_name="Test",
            email="embed@example.com",
            full_name="Embed Test",
            birth_date="1990-01-01",
        )

    def test_lexical_backend_returns_empty_vector(self):
        backend = LexicalEmbeddingBackend()
        self.assertEqual(backend.embed("duelo y regulacion"), [])

    @override_settings(PROCESS_MEMORY_EMBEDDINGS="lexical")
    def test_get_embedding_backend_default_is_lexical(self):
        backend = get_embedding_backend()
        self.assertIsInstance(backend, LexicalEmbeddingBackend)

    @override_settings(PROCESS_MEMORY_EMBEDDINGS="ollama")
    def test_get_embedding_backend_ollama_mode(self):
        backend = get_embedding_backend()
        self.assertIsInstance(backend, OllamaEmbeddingBackend)

    @patch("requests.post")
    def test_ollama_backend_embed_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"embedding": [0.1, 0.2, 0.3]}
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        backend = OllamaEmbeddingBackend(
            base_url="http://ollama.test:11434",
            model="nomic-embed-text",
        )
        vector = backend.embed("texto de prueba")

        self.assertEqual(vector, [0.1, 0.2, 0.3])
        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args
        self.assertEqual(call_kwargs[0][0], "http://ollama.test:11434/api/embeddings")
        self.assertEqual(
            call_kwargs[1]["json"],
            {"model": "nomic-embed-text", "prompt": "texto de prueba"},
        )

    @patch("requests.post")
    def test_ollama_backend_embed_failure_returns_empty(self, mock_post):
        mock_post.side_effect = ConnectionError("ollama down")
        backend = OllamaEmbeddingBackend(base_url="http://127.0.0.1:11434")
        self.assertEqual(backend.embed("fallo"), [])

    @override_settings(PROCESS_MEMORY_EMBEDDINGS="lexical")
    def test_create_embedding_chunk_lexical_stores_empty_vector(self):
        from api.process_memory.services import create_embedding_chunk, create_process_snapshot

        snapshot = create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="bioemotion",
            lane="clinical_support",
            source_type="manual",
            source_id="lex-1",
            structured={},
            text_summary="Resumen sin vector.",
        )
        chunk = create_embedding_chunk(
            snapshot=snapshot,
            therapist=self.therapist,
            patient=self.patient,
            lane="clinical_support",
            text="duelo simbolico",
        )
        self.assertEqual(chunk.embedding, [])

    @override_settings(
        PROCESS_MEMORY_EMBEDDINGS="ollama",
        OLLAMA_BASE_URL="http://ollama.test:11434",
        OLLAMA_EMBED_MODEL="nomic-embed-text",
    )
    @patch("requests.post")
    def test_create_embedding_chunk_uses_ollama_when_configured(self, mock_post):
        from api.process_memory.services import create_embedding_chunk, create_process_snapshot

        mock_response = MagicMock()
        mock_response.json.return_value = {"embedding": [0.5, 0.6]}
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        snapshot = create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="bioemotion",
            lane="clinical_support",
            source_type="manual",
            source_id="ollama-1",
            structured={},
            text_summary="Resumen con vector.",
        )
        chunk = create_embedding_chunk(
            snapshot=snapshot,
            therapist=self.therapist,
            patient=self.patient,
            lane="clinical_support",
            text="duelo simbolico",
        )
        self.assertEqual(chunk.embedding, [0.5, 0.6])
        mock_post.assert_called_once()

    @override_settings(PROCESS_MEMORY_EMBEDDINGS="ollama")
    @patch("requests.post")
    def test_create_embedding_chunk_explicit_embedding_skips_ollama(self, mock_post):
        from api.process_memory.services import create_embedding_chunk, create_process_snapshot

        snapshot = create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="bioemotion",
            lane="clinical_support",
            source_type="manual",
            source_id="explicit-1",
            structured={},
            text_summary="Resumen.",
        )
        chunk = create_embedding_chunk(
            snapshot=snapshot,
            therapist=self.therapist,
            patient=self.patient,
            lane="clinical_support",
            text="duelo",
            embedding=[0.9],
        )
        self.assertEqual(chunk.embedding, [0.9])
        mock_post.assert_not_called()