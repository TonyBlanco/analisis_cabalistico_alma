from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import List

from django.conf import settings

logger = logging.getLogger(__name__)


class EmbeddingBackend(ABC):
    """Compute dense vectors for process-memory chunks (Phase 1 — no pgvector yet)."""

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """Return an embedding vector for *text* (may be empty for lexical mode)."""


class LexicalEmbeddingBackend(EmbeddingBackend):
    """No-op vectors; retrieval stays lexical via ``RAGService`` until pgvector."""

    def embed(self, text: str) -> List[float]:
        return []


class OllamaEmbeddingBackend(EmbeddingBackend):
    """Ollama ``/api/embeddings`` (e.g. nomic-embed-text on Hetzner)."""

    def __init__(
        self,
        *,
        base_url: str | None = None,
        model: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        self.base_url = (base_url or getattr(settings, "OLLAMA_BASE_URL", "http://127.0.0.1:11434")).rstrip(
            "/"
        )
        self.model = model or getattr(settings, "OLLAMA_EMBED_MODEL", "nomic-embed-text")
        self.timeout = timeout

    def embed(self, text: str) -> List[float]:
        if not (text or "").strip():
            return []

        import requests

        url = f"{self.base_url}/api/embeddings"
        payload = {"model": self.model, "prompt": text}
        try:
            response = requests.post(url, json=payload, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            vector = data.get("embedding")
            if isinstance(vector, list):
                return [float(v) for v in vector]
            logger.warning("[ProcessMemory] Ollama embeddings response missing 'embedding' key")
        except Exception as exc:
            logger.warning("[ProcessMemory] Ollama embedding failed: %s", exc)
        return []


def get_embedding_backend() -> EmbeddingBackend:
    """Factory driven by ``PROCESS_MEMORY_EMBEDDINGS`` (lexical/off vs ollama)."""
    mode = getattr(settings, "PROCESS_MEMORY_EMBEDDINGS", "lexical").lower().strip()
    if mode == "ollama":
        return OllamaEmbeddingBackend()
    return LexicalEmbeddingBackend()