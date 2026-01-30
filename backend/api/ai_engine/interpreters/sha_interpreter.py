"""
SHA Harmony Interpreter
Specializes in interpreting Sefirotic harmony assessments.
"""
import logging
import json
from typing import Dict, Any, List
from django.contrib.auth.models import User
from api.test_models import TestResult
from .base import BaseInterpreter
from ..llm.prompts import SHA_HARMONY_SYSTEM_PROMPT, SHA_HARMONY_USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)


class SHAInterpreter(BaseInterpreter):
    """Interpreter for SHA Harmony test results using Kabbalistic psychology."""
    
    def interpret(self, test_result: TestResult, user: User) -> Dict[str, Any]:
        """Generate comprehensive interpretation of SHA Harmony results."""
        
        # Extract SHA context from test result
        sha_context = self._extract_sha_context(test_result)
        
        # Get patient context
        patient_context = self._extract_patient_context(test_result)
        
        # Identify Sefirotic imbalances
        imbalances = self._identify_imbalances(sha_context['sefirot_scores'])
        
        # Retrieve relevant knowledge from RAG
        km = self._get_knowledge_manager()
        
        # Build query for RAG
        # RAG disabled - not justified yet
        rag_context = []
        logger.info("RAG disabled - using direct AI interpretation")
        
        # Build prompt for Gemini/Groq (via multi_ai_service)
        messages = self._build_gemini_messages(sha_context, patient_context, rag_context)
        
        # Generate interpretation with multi-provider fallback
        gemini = self._get_gemini_client()
        logger.info(f"SHA Interpreter: Calling AI (Gemini/Groq fallback)...")
        
        completion = gemini.generate_completion(
            messages=messages,
            response_format={'type': 'json_object'}
        )
        
        # Parse GPT-4 response
        interpretation_content = json.loads(completion['content'])
        
        # Build final response
        interpretation_id = self._generate_interpretation_id()
        
        return {
            'interpretation_id': interpretation_id,
            'narrative': interpretation_content.get('narrative', {}),
            'suggested_diagnoses': interpretation_content.get('suggested_diagnoses', []),
            'therapeutic_route': interpretation_content.get('therapeutic_route', {}),
            'metadata': {
                'model_used': 'multi-ai-service (Gemini/Groq/OpenAI/Ollama)',
                'tokens': completion['tokens'],
                'cost_usd': completion['cost_usd'],
                'rag_sources': [],  # RAG disabled
                'timestamp': test_result.created_at.isoformat()
            }
        }
    
    def _extract_sha_context(self, test_result: TestResult) -> Dict[str, Any]:
        """Extract SHA-specific data from test result."""
        details = test_result.details
        
        # Handle both v1 and v2 formats
        if 'harmony_index' in details:
            # v2 format
            return {
                'schema_version': 'v2',
                'harmony_index': details.get('harmony_index', 0),
                'harmony_level': details.get('harmony_level', 'unknown'),
                'sefirot_scores': details.get('sefirot_scores', {}),
                'recommendations': details.get('recommendations', [])
            }
        else:
            # v1 format - calculate harmony_index from total
            total = details.get('total', 0)
            harmony_index = total / 8.0  # v1 was out of 40, normalize to 5-point scale
            return {
                'schema_version': 'v1',
                'harmony_index': harmony_index,
                'harmony_level': self._calculate_harmony_level(harmony_index),
                'sefirot_scores': {},  # v1 didn't have individual scores
                'recommendations': []
            }
    
    def _extract_patient_context(self, test_result: TestResult) -> Dict[str, Any]:
        """Extract patient demographic info."""
        patient = test_result.patient
        if not patient:
            return {
                'name': 'Unknown',
                'age': 'Unknown',
                'gender': 'Unknown'
            }
        
        # Calculate age from birth_date if available
        age = 'Unknown'
        if hasattr(patient, 'birth_date') and patient.birth_date:
            from datetime import date
            today = date.today()
            age = today.year - patient.birth_date.year - (
                (today.month, today.day) < (patient.birth_date.month, patient.birth_date.day)
            )
        
        return {
            'name': patient.full_name or 'Unknown',
            'age': age,
            'gender': getattr(patient, 'gender', 'Unknown')
        }
    
    def _identify_imbalances(self, sefirot_scores: Dict[str, int]) -> Dict[str, List[str]]:
        """Identify Sefirotic imbalances (low < 3, high > 4)."""
        if not sefirot_scores:
            return {'low': [], 'high': [], 'balanced': []}
        
        low = []
        high = []
        balanced = []
        
        for sefira, score in sefirot_scores.items():
            if score < 3:
                low.append(sefira)
            elif score > 4:
                high.append(sefira)
            else:
                balanced.append(sefira)
        
        return {'low': low, 'high': high, 'balanced': balanced}
    
    def _build_rag_query(self, sha_context: Dict, imbalances: Dict) -> str:
        """Build query for RAG knowledge retrieval."""
        query_parts = []
        
        # Add harmony level context
        query_parts.append(f"Sefirotic harmony {sha_context['harmony_level']}")
        
        # Add low Sefirot
        if imbalances['low']:
            query_parts.append(f"low {' '.join(imbalances['low'])}")
        
        # Add high Sefirot
        if imbalances['high']:
            query_parts.append(f"high {' '.join(imbalances['high'])}")
        
        # Add therapeutic keywords
        query_parts.append("personality patterns therapeutic interventions")
        
        return ' '.join(query_parts)
    
    def _format_rag_context(self, rag_results: List[Dict]) -> str:
        """Format RAG results for inclusion in prompt."""
        if not rag_results:
            return "No additional context available."
        
        context_parts = []
        for i, result in enumerate(rag_results, 1):
            context_parts.append(
                f"[Source {i}] {result['source']} (relevance: {result['score']:.2f})\n"
                f"{result['text']}\n"
            )
        
        return '\n'.join(context_parts)
    
    def _build_gemini_messages(
        self,
        sha_context: Dict,
        patient_context: Dict,
        rag_context: str
    ) -> List[Dict[str, str]]:
        """Build message array for GPT-4 API."""
        
        # Format Sefirot scores for prompt
        sefirot_scores_text = ""
        if sha_context['sefirot_scores']:
            for sefira, score in sha_context['sefirot_scores'].items():
                sefirot_scores_text += f"  - {sefira}: {score} / 5\n"
        else:
            sefirot_scores_text = "  (Individual Sefirot scores not available in v1 format)"
        
        # Build user prompt from template
        user_prompt = SHA_HARMONY_USER_PROMPT_TEMPLATE.format(
            patient_name=patient_context['name'],
            patient_age=patient_context['age'],
            patient_gender=patient_context['gender'],
            harmony_index=sha_context['harmony_index'],
            harmony_level=sha_context['harmony_level'],
            keter=sha_context['sefirot_scores'].get('Keter', 'N/A'),
            chokmah=sha_context['sefirot_scores'].get('Chokmah', 'N/A'),
            binah=sha_context['sefirot_scores'].get('Binah', 'N/A'),
            chesed=sha_context['sefirot_scores'].get('Chesed', 'N/A'),
            gevurah=sha_context['sefirot_scores'].get('Gevurah', 'N/A'),
            tiferet=sha_context['sefirot_scores'].get('Tiferet', 'N/A'),
            netzach=sha_context['sefirot_scores'].get('Netzach', 'N/A'),
            hod=sha_context['sefirot_scores'].get('Hod', 'N/A'),
            yesod=sha_context['sefirot_scores'].get('Yesod', 'N/A'),
            malkuth=sha_context['sefirot_scores'].get('Malkuth', 'N/A'),
            rag_context=rag_context
        )
        
        return [
            {'role': 'system', 'content': SHA_HARMONY_SYSTEM_PROMPT},
            {'role': 'user', 'content': user_prompt}
        ]
    
    def _calculate_harmony_level(self, harmony_index: float) -> str:
        """Calculate harmony level from index (for v1 compatibility)."""
        if harmony_index >= 4.5:
            return 'excellent'
        elif harmony_index >= 3.5:
            return 'good'
        elif harmony_index >= 2.5:
            return 'moderate'
        else:
            return 'low'
