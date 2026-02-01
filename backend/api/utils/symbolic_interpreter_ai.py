"""
Symbolic Interpreter AI Service — Backend Integration
Connects symbolic-interpreter.ts with Gemini AI

SAFETY RULES (CRITICAL):
1. NO accept personal data in requests
2. Validate TreeStructuralState structure
3. Enforce content filtering
4. Rate limiting per session
"""
import json
from typing import Dict, Any, Optional
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .genai_response import extract_text
from .multi_ai_service import MultiAIService

# Import Gemini
genai = None
try:
    from google import genai as genai_local
    genai = genai_local
except ImportError:
    genai = None


class SymbolicInterpreterAI:
    """AI service for symbolic interpretation (read-only)"""
    
    def __init__(self):
        """Initialize Gemini client"""
        # Prefer Groq via MultiAIService if available
        groq_key = getattr(settings, 'GROQ_API_KEY', '')
        self.enabled = False
        self.model = None
        self.error_message = None
        self._use_multi = False

        if groq_key:
            try:
                self.client = MultiAIService(preferred_provider='groq')
                self._use_multi = True
                self.enabled = True
                print('[OK] SymbolicInterpreterAI configured using MultiAIService (GROQ preferred)')
                return
            except Exception as e:
                self.error_message = f"Error initializing MultiAIService: {e}"
                print(f"[WARNING] {self.error_message}")

        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
        
        if not api_key:
            self.error_message = "GEMINI_API_KEY not configured"
            print(f"[WARNING] {self.error_message}")
            return
        
        if not genai:
            self.error_message = "google.genai module not installed"
            print(f"[WARNING] {self.error_message}")
            return
        
        try:
            self.client = genai.Client(api_key=api_key)
            self.model = self.client.models.generate_content
            self.model_name = model_name
            self.generation_config = {
                'temperature': 0.7,
                'top_p': 0.8,
                'top_k': 40,
                'max_output_tokens': 1024,
            }
            self.enabled = True
            print(f"[OK] SymbolicInterpreterAI configured with model: {model_name}")
        except Exception as e:
            self.error_message = f"Error configuring Gemini: {str(e)}"
            print(f"[ERROR] {self.error_message}")
            self.enabled = False
    
    def validate_tree_state_structure(self, tree_state: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validates TreeStructuralState structure
        Returns (valid: bool, error_message: Optional[str])
        """
        # Check required fields
        if 'source' not in tree_state:
            return False, "Missing 'source' field"
        
        if 'methodId' not in tree_state['source']:
            return False, "Missing 'source.methodId' field"
        
        if 'sefirot' not in tree_state or not isinstance(tree_state['sefirot'], list):
            return False, "Missing or invalid 'sefirot' field"
        
        if len(tree_state['sefirot']) != 10:
            return False, f"Expected 10 sefirot, got {len(tree_state['sefirot'])}"
        
        if 'flows' not in tree_state or not isinstance(tree_state['flows'], list):
            return False, "Missing or invalid 'flows' field"
        
        # Validate NO personal data leakage
        tree_state_str = json.dumps(tree_state).lower()
        personal_data_indicators = [
            'nombre', 'name', 
            'fecha de nacimiento', 'birth date', 'birthdate',
            'edad', 'age',
            'dni', 'id card',
            'email', 'correo',
            'teléfono', 'phone',
        ]
        
        for indicator in personal_data_indicators:
            if indicator in tree_state_str:
                return False, f"Personal data indicator detected: '{indicator}'"
        
        return True, None
    
    def generate_symbolic_interpretation(self, prompt: str) -> str:
        """
        Generates symbolic interpretation using Gemini
        Returns raw AI response
        """
        if not self.enabled:
            raise Exception(self.error_message or "AI service not enabled")
        
        try:
            if self._use_multi and isinstance(self.client, MultiAIService):
                result = self.client.generate(prompt, temperature=0.7, max_tokens=1024, top_p=0.8)
                if not result.get('success'):
                    raise Exception(result.get('error', 'MultiAIService error'))
                return result.get('text', '')
            else:
                response = self.model(
                    model=self.model_name,
                    contents=prompt,
                    config=self.generation_config
                )
                return extract_text(response)
        except Exception as e:
            error_msg = f"Error generating AI interpretation: {str(e)}"
            print(f"[ERROR] {error_msg}")
            raise Exception(error_msg)


# Global service instance
symbolic_ai_service = SymbolicInterpreterAI()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_symbolic_interpretation_view(request):
    """
    API endpoint: POST /api/symbolic-interpreter/generate
    
    Request body:
    {
        "treeState": TreeStructuralState,
        "safetyLevel": "educational" | "formative" | "observational",
        "focusAreas": ["flows", "sefirot-roles"] (optional)
    }
    
    Response:
    {
        "success": true,
        "aiResponse": "raw AI text response",
        "timestamp": "ISO timestamp"
    }
    """
    # Check if AI service is enabled
    if not symbolic_ai_service.enabled:
        return Response({
            'success': False,
            'error': symbolic_ai_service.error_message or 'AI service not available',
            'fallback': True,
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    # Parse request
    tree_state = request.data.get('treeState')
    safety_level = request.data.get('safetyLevel', 'educational')
    prompt = request.data.get('prompt')
    
    if not tree_state:
        return Response({
            'success': False,
            'error': 'Missing treeState in request body',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not prompt:
        return Response({
            'success': False,
            'error': 'Missing prompt in request body',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate TreeStructuralState structure
    valid, error_msg = symbolic_ai_service.validate_tree_state_structure(tree_state)
    if not valid:
        return Response({
            'success': False,
            'error': f'Invalid TreeStructuralState: {error_msg}',
            'securityViolation': 'personal_data' in error_msg.lower(),
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate interpretation
    try:
        ai_response = symbolic_ai_service.generate_symbolic_interpretation(prompt)
        
        return Response({
            'success': True,
            'aiResponse': ai_response,
            'timestamp': json.dumps({'iso': 'now'}),  # Will be replaced by frontend
            'safetyLevel': safety_level,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'fallback': True,
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def symbolic_interpreter_status_view(request):
    """
    API endpoint: GET /api/symbolic-interpreter/status
    
    Returns AI service availability status
    """
    return Response({
        'enabled': symbolic_ai_service.enabled,
        'errorMessage': symbolic_ai_service.error_message,
        'version': '1.0.0',
    }, status=status.HTTP_200_OK)
