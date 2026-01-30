"""
Base Interpreter Abstract Class
All specialized interpreters inherit from this.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any
import uuid
from django.contrib.auth.models import User
from api.test_models import TestResult


class BaseInterpreter(ABC):
    """Abstract base class for all AI interpreters."""
    
    def __init__(self):
        self.knowledge_manager = None  # Lazy-loaded
        self.gemini_client = None  # Lazy-loaded
    
    @abstractmethod
    def interpret(self, test_result: TestResult, user: User) -> Dict[str, Any]:
        """
        Generate interpretation for a test result.
        
        Args:
            test_result: TestResult object to interpret
            user: User requesting interpretation
        
        Returns:
            {
                "interpretation_id": "ai_interp_xyz",
                "narrative": {
                    "summary": str,
                    "key_insights": [str],
                    "clinical_concerns": [str],
                    "strengths": [str]
                },
                "suggested_diagnoses": [{
                    "code": str,
                    "name": str,
                    "probability": float,
                    "evidence": [str]
                }],
                "therapeutic_route": {
                    "immediate_focus": {
                        "issue": str,
                        "techniques": [str]
                    },
                    "complementary_modalities": [{
                        "modality": str,
                        "rationale": str
                    }],
                    "next_assessments": [str],
                    "contraindications": [str]
                },
                "metadata": {
                    "model_used": str,
                    "tokens": {"prompt": int, "completion": int, "total": int},
                    "cost_usd": float,
                    "rag_sources": [dict]
                }
            }
        """
        pass
    
    def _get_knowledge_manager(self):
        """Lazy-load knowledge manager."""
        if self.knowledge_manager is None:
            from ..rag.knowledge_manager import KnowledgeManager
            self.knowledge_manager = KnowledgeManager()
        return self.knowledge_manager
    
    def _get_gemini_client(self):
        """Lazy-load Gemini client."""
        if self.gemini_client is None:
            from ..llm.gemini_client import GeminiClient
            self.gemini_client = GeminiClient()
        return self.gemini_client
    
    def _generate_interpretation_id(self) -> str:
        """Generate unique interpretation ID."""
        return f"ai_interp_{uuid.uuid4().hex[:12]}"
