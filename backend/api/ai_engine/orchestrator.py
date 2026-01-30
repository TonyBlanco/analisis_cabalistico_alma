"""
AI Engine Orchestrator
Routes interpretation requests to specialized interpreters.
"""
import logging
import uuid
from typing import Dict, Any
from django.conf import settings
from api.test_models import TestResult
from .models import AIInterpretation, AIAuditLog

logger = logging.getLogger(__name__)


class AIEngineOrchestrator:
    """
    Main orchestrator for AI interpretation requests.
    Routes to appropriate interpreter based on test type.
    """
    
    def __init__(self):
        self.interpreters = {}
        # Interpreters will be imported lazily to avoid circular imports
    
    def _get_interpreter(self, test_type: str):
        """Lazy-load interpreter for test type."""
        if test_type not in self.interpreters:
            if test_type == 'sha_harmony':
                from .interpreters.sha_interpreter import SHAInterpreter
                self.interpreters[test_type] = SHAInterpreter()
            elif test_type in ['mcmi4', 'mcmi4_signal']:
                from .interpreters.mcmi4_interpreter import MCMI4Interpreter
                self.interpreters[test_type] = MCMI4Interpreter()
            elif test_type == 'wellness':
                from .interpreters.wellness_interpreter import WellnessInterpreter
                self.interpreters[test_type] = WellnessInterpreter()
            else:
                # Default to pattern analyzer
                from .interpreters.pattern_analyzer import PatternAnalyzer
                self.interpreters[test_type] = PatternAnalyzer()
        
        return self.interpreters[test_type]
    
    def generate_interpretation(
        self,
        test_result: TestResult,
        user,
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Generate AI interpretation for a test result.
        
        Args:
            test_result: TestResult object to interpret
            user: User requesting interpretation (must be therapist)
            force_refresh: If True, bypass cache and regenerate
        
        Returns:
            {
                "interpretation_id": "ai_interp_xyz",
                "narrative": {...},
                "suggested_diagnoses": [...],
                "therapeutic_route": {...},
                "metadata": {...}
            }
        """
        # Check if AI Engine is enabled
        if not getattr(settings, 'AI_ENGINE_ENABLED', False):
            raise ValueError("AI Engine is not enabled. Set AI_ENGINE_ENABLED=true in settings.")
        
        # Check cache first (unless force_refresh)
        if not force_refresh:
            cached = self._get_cached_interpretation(test_result.id)
            if cached:
                logger.info(f"Cache hit for TestResult {test_result.id}")
                # Increment cache hit count
                cached_obj = AIInterpretation.objects.get(id=cached['interpretation_id'])
                cached_obj.cache_hit_count += 1
                cached_obj.save(update_fields=['cache_hit_count'])
                return cached
        
        # Get test type
        test_type = test_result.test_module.code if test_result.test_module else 'unknown'
        
        # Route to appropriate interpreter
        try:
            interpreter = self._get_interpreter(test_type)
            logger.info(f"Routing to interpreter: {interpreter.__class__.__name__} for test {test_type}")
        except ImportError as e:
            logger.warning(f"No specific interpreter for {test_type}, using pattern analyzer: {e}")
            from .interpreters.pattern_analyzer import PatternAnalyzer
            interpreter = PatternAnalyzer()
        
        # Generate interpretation
        import time
        start_time = time.time()
        
        try:
            interpretation_data = interpreter.interpret(test_result, user)
            
            latency_ms = int((time.time() - start_time) * 1000)
            interpretation_data['metadata']['latency_ms'] = latency_ms
            
            # Save to database
            ai_interpretation = AIInterpretation.objects.create(
                id=interpretation_data['interpretation_id'],
                test_result=test_result,
                patient=test_result.patient,
                interpreter_type=test_type,
                narrative=interpretation_data['narrative'],
                suggested_diagnoses=interpretation_data.get('suggested_diagnoses', []),
                therapeutic_route=interpretation_data['therapeutic_route'],
                model_used=interpretation_data['metadata']['model_used'],
                prompt_tokens=interpretation_data['metadata']['tokens']['prompt'],
                completion_tokens=interpretation_data['metadata']['tokens']['completion'],
                total_cost_usd=interpretation_data['metadata']['cost_usd'],
                rag_sources=interpretation_data['metadata'].get('rag_sources', []),
                created_by=user,
                is_cached=False
            )
            
            # Cache result
            self._cache_interpretation(test_result.id, interpretation_data)
            
            # Audit log success
            self._log_request(
                user=user,
                request_type='generate_interpretation',
                test_type=test_type,
                success=True,
                latency_ms=latency_ms,
                tokens_used=interpretation_data['metadata']['tokens']['total'],
                cost_usd=interpretation_data['metadata']['cost_usd'],
                interpretation=ai_interpretation
            )
            
            logger.info(f"✓ Generated interpretation {interpretation_data['interpretation_id']} in {latency_ms}ms")
            return interpretation_data
        
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Error generating interpretation for TestResult {test_result.id}: {str(e)}", exc_info=True)
            
            # Audit log failure
            self._log_request(
                user=user,
                request_type='generate_interpretation',
                test_type=test_type,
                success=False,
                error_message=str(e),
                latency_ms=latency_ms,
                tokens_used=0,
                cost_usd=0.0
            )
            
            raise
    
    def _get_cached_interpretation(self, test_result_id: int) -> Dict[str, Any]:
        """Retrieve cached interpretation from database."""
        try:
            cached = AIInterpretation.objects.filter(test_result_id=test_result_id).latest('created_at')
            return {
                'interpretation_id': cached.id,
                'narrative': cached.narrative,
                'suggested_diagnoses': cached.suggested_diagnoses,
                'therapeutic_route': cached.therapeutic_route,
                'metadata': {
                    'model_used': cached.model_used,
                    'tokens': {
                        'prompt': cached.prompt_tokens,
                        'completion': cached.completion_tokens,
                        'total': cached.prompt_tokens + cached.completion_tokens
                    },
                    'cost_usd': float(cached.total_cost_usd),
                    'timestamp': cached.created_at.isoformat(),
                    'rag_sources': cached.rag_sources,
                    'cached': True
                }
            }
        except AIInterpretation.DoesNotExist:
            return None
    
    def _cache_interpretation(self, test_result_id: int, data: Dict[str, Any]):
        """Cache interpretation (already saved to DB, this is a no-op placeholder for future Redis)."""
        # Future: Implement Redis caching here
        pass
    
    def _log_request(self, user, request_type, test_type, success, latency_ms, 
                     tokens_used=0, cost_usd=0.0, error_message='', interpretation=None):
        """Log AI Engine request to audit log."""
        AIAuditLog.objects.create(
            interpretation=interpretation,
            request_type=request_type,
            test_type=test_type,
            user=user,
            success=success,
            error_message=error_message,
            latency_ms=latency_ms,
            tokens_used=tokens_used,
            cost_usd=cost_usd
        )
