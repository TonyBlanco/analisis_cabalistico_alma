"""
Pattern Analyzer
Generic interpreter for tests without specialized interpreters.
"""
import logging
import json
from typing import Dict, Any
from django.contrib.auth.models import User
from api.test_models import TestResult
from .base import BaseInterpreter

logger = logging.getLogger(__name__)


class PatternAnalyzer(BaseInterpreter):
    """Generic pattern analyzer for any test type."""
    
    def interpret(self, test_result: TestResult, user: User) -> Dict[str, Any]:
        """Generate generic interpretation based on test data patterns."""
        
        logger.info(f"Pattern Analyzer: Interpreting test result {test_result.id}")
        
        # Extract test type and data
        test_type = test_result.test_module.code if test_result.test_module else 'unknown'
        test_data = test_result.details
        
        # Build generic prompt
        gpt4 = self._get_gpt4_client()
        
        messages = [
            {
                'role': 'system',
                'content': '''You are an expert psychotherapist analyzing psychological assessment results.
                
Provide a therapeutic interpretation following this JSON structure:
{
  "narrative": {
    "summary": "2-3 sentence overview",
    "key_insights": ["insight 1", "insight 2", "insight 3"],
    "clinical_concerns": ["concern if any"],
    "strengths": ["strength 1", "strength 2"]
  },
  "suggested_diagnoses": [],
  "therapeutic_route": {
    "immediate_focus": {
      "issue": "Primary focus area",
      "techniques": ["technique 1", "technique 2"]
    },
    "complementary_modalities": [{"modality": "name", "rationale": "why"}],
    "next_assessments": ["suggestion 1"],
    "contraindications": []
  }
}

Use compassionate, educational language. Never diagnose - suggest patterns and growth areas.'''
            },
            {
                'role': 'user',
                'content': f'''Test Type: {test_type}
Test Results: {json.dumps(test_data, indent=2)}

Provide a comprehensive therapeutic interpretation.'''
            }
        ]
        
        completion = gemini.generate_completion(
            messages=messages,
            response_format={'type': 'json_object'}
        )
        
        interpretation_content = json.loads(completion['content'])
        interpretation_id = self._generate_interpretation_id()
        
        return {
            'interpretation_id': interpretation_id,
            'narrative': interpretation_content.get('narrative', {}),
            'suggested_diagnoses': interpretation_content.get('suggested_diagnoses', []),
            'therapeutic_route': interpretation_content.get('therapeutic_route', {}),
            'metadata': {
                'model_used': 'gpt-4-turbo-preview',
                'tokens': completion['tokens'],
                'cost_usd': completion['cost_usd'],
                'rag_sources': [],
                'interpreter_type': 'pattern_analyzer'
            }
        }
