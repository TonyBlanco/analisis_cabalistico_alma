# AI Engine Implementation Guide

**Phase**: DOC > (Implementation Documentation)  
**Purpose**: Step-by-step guide for coding the AI therapeutic interpretation engine  
**Prerequisite**: Read [AI_ENGINE_ARCHITECTURE.md](AI_ENGINE_ARCHITECTURE.md) first

---

## Table of Contents

1. [Implementation Roadmap](#implementation-roadmap)
2. [Backend Implementation](#backend-implementation)
3. [RAG Knowledge Base Setup](#rag-knowledge-base-setup)
4. [LLM Integration](#llm-integration)
5. [Frontend Implementation](#frontend-implementation)
6. [Testing & Validation](#testing--validation)
7. [Deployment Checklist](#deployment-checklist)

---

## Implementation Roadmap

### Phase 1: Foundation (2-3 days)
- ✅ Architecture design completed
- 🔄 Setup environment (API keys, dependencies)
- 🔄 Create base directory structure
- 🔄 Implement orchestrator skeleton
- 🔄 Setup Django API endpoints

### Phase 2: RAG System (3-4 days)
- 🔄 Choose vector database (Pinecone recommended for start)
- 🔄 Implement knowledge base manager
- 🔄 Ingest DSM-5, ICD-11, therapy knowledge
- 🔄 Create embedding pipeline
- 🔄 Test retrieval accuracy

### Phase 3: Interpreters (5-7 days)
- 🔄 SHA Harmony interpreter (priority 1)
- 🔄 MCMI-4 interpreter (priority 2)
- 🔄 Wellness tests interpreter
- 🔄 Cross-test pattern analyzer

### Phase 4: LLM Integration (2-3 days)
- 🔄 OpenAI GPT-4 client
- 🔄 Prompt engineering templates
- 🔄 Safety filters & content moderation
- 🔄 Response validation

### Phase 5: Frontend (3-4 days)
- 🔄 AIInterpretationPanel component
- 🔄 Therapist-only access control
- 🔄 Loading states & error handling
- 🔄 JSON vs narrative view toggle

### Phase 6: Polish (2-3 days)
- 🔄 Audit logging
- 🔄 Cost tracking
- 🔄 Performance optimization (caching)
- 🔄 Documentation

**Total Estimated Time**: 17-24 days (3-4 weeks)

---

## Backend Implementation

### Step 1: Directory Structure

Create the following structure in `backend/api/`:

```
backend/api/
├── ai_engine/
│   ├── __init__.py
│   ├── orchestrator.py          # Main routing logic
│   ├── models.py                # AIInterpretation, AuditLog
│   ├── serializers.py           # DRF serializers
│   ├── views.py                 # API endpoints
│   ├── urls.py                  # URL routing
│   ├── permissions.py           # IsTherapist permission
│   │
│   ├── interpreters/
│   │   ├── __init__.py
│   │   ├── base.py              # BaseInterpreter abstract class
│   │   ├── sha_interpreter.py   # SHA Harmony specialist
│   │   ├── mcmi4_interpreter.py # MCMI-4 specialist
│   │   ├── wellness_interpreter.py
│   │   ├── pattern_analyzer.py  # Cross-test patterns
│   │   └── utils.py
│   │
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── knowledge_manager.py # Embedding + retrieval
│   │   ├── embeddings.py        # OpenAI embeddings client
│   │   ├── vector_store.py      # Pinecone/Qdrant wrapper
│   │   └── ingest_scripts/
│   │       ├── ingest_dsm5.py
│   │       ├── ingest_icd11.py
│   │       ├── ingest_therapies.py
│   │       └── ingest_kabbalah.py
│   │
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── openai_client.py     # GPT-4 wrapper
│   │   ├── prompts.py           # Prompt templates
│   │   ├── safety.py            # Content moderation
│   │   └── response_parser.py   # Parse GPT-4 JSON responses
│   │
│   └── utils/
│       ├── __init__.py
│       ├── cost_tracker.py      # Track API costs
│       ├── cache.py             # Redis caching layer
│       └── audit.py             # Audit logging
```

**Command**:
```powershell
cd backend/api
mkdir ai_engine
cd ai_engine
mkdir interpreters, rag, llm, utils
mkdir rag/ingest_scripts
# Create __init__.py files
New-Item -ItemType File __init__.py, interpreters/__init__.py, rag/__init__.py, llm/__init__.py, utils/__init__.py
```

### Step 2: Install Dependencies

Add to `backend/requirements.txt`:

```txt
# AI Engine dependencies
openai==1.12.0                 # GPT-4 + embeddings
pinecone-client==3.0.0         # Vector database (alternative: qdrant-client)
tiktoken==0.6.0                # Token counting
tenacity==8.2.3                # Retry logic for API calls
redis==5.0.1                   # Caching layer
langchain==0.1.0               # Optional: RAG utilities (can implement manually)
```

**Install**:
```powershell
cd backend
.venv\Scripts\activate
pip install openai pinecone-client tiktoken tenacity redis
pip freeze > requirements.txt
```

### Step 3: Environment Variables

Add to `backend/core/settings.py`:

```python
# AI Engine Configuration
AI_ENGINE_ENABLED = env.bool('AI_ENGINE_ENABLED', default=False)
OPENAI_API_KEY = env('OPENAI_API_KEY', default='')
OPENAI_MODEL = env('OPENAI_MODEL', default='gpt-4-turbo-preview')
OPENAI_EMBEDDING_MODEL = env('OPENAI_EMBEDDING_MODEL', default='text-embedding-3-large')

# Vector Database (Pinecone)
PINECONE_API_KEY = env('PINECONE_API_KEY', default='')
PINECONE_ENVIRONMENT = env('PINECONE_ENVIRONMENT', default='us-west1-gcp')
PINECONE_INDEX_NAME = env('PINECONE_INDEX_NAME', default='holistica-knowledge')

# Redis Cache
REDIS_URL = env('REDIS_URL', default='redis://localhost:6379/0')

# AI Engine Limits
AI_MAX_TOKENS = env.int('AI_MAX_TOKENS', default=4000)
AI_TEMPERATURE = env.float('AI_TEMPERATURE', default=0.3)
AI_CACHE_TTL = env.int('AI_CACHE_TTL', default=86400)  # 24 hours
```

Add to `.env`:

```env
# AI Engine (DEVELOPMENT ONLY - Add to .env.local, NOT committed)
AI_ENGINE_ENABLED=true
OPENAI_API_KEY=sk-proj-...your-key...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

PINECONE_API_KEY=...your-pinecone-key...
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=holistica-knowledge

REDIS_URL=redis://localhost:6379/0

AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.3
AI_CACHE_TTL=86400
```

⚠️ **CRITICAL**: Add `.env.local` to `.gitignore` to prevent committing API keys.

### Step 4: Create Models

**File**: `backend/api/ai_engine/models.py`

```python
from django.db import models
from django.contrib.auth.models import User
from api.test_models import TestResult
from api.models import Patient

class AIInterpretation(models.Model):
    """
    Stores AI-generated interpretations for test results.
    Therapist-only feature.
    """
    id = models.CharField(max_length=50, primary_key=True)  # e.g., ai_interp_abc123
    test_result = models.ForeignKey(TestResult, on_delete=models.CASCADE, related_name='ai_interpretations')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True)
    interpreter_type = models.CharField(max_length=50)  # sha_interpreter, mcmi4_interpreter, etc.
    
    # Interpretation content (JSON)
    narrative = models.JSONField()  # {summary, key_insights, clinical_concerns, strengths}
    suggested_diagnoses = models.JSONField(default=list)  # [{code, name, probability, evidence}]
    therapeutic_route = models.JSONField()  # {immediate_focus, complementary_modalities, next_assessments}
    
    # Metadata
    model_used = models.CharField(max_length=100, default='gpt-4-turbo-preview')
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    total_cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    
    # RAG context used
    rag_sources = models.JSONField(default=list)  # List of knowledge base chunks retrieved
    
    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_cached = models.BooleanField(default=False)
    cache_hit_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'ai_interpretations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['test_result', '-created_at']),
            models.Index(fields=['patient', '-created_at']),
            models.Index(fields=['interpreter_type']),
        ]
    
    def __str__(self):
        return f"AI Interpretation {self.id} for TestResult {self.test_result_id}"


class AIAuditLog(models.Model):
    """
    Audit log for all AI Engine requests.
    Tracks usage, errors, and costs.
    """
    id = models.AutoField(primary_key=True)
    interpretation = models.ForeignKey(AIInterpretation, on_delete=models.CASCADE, null=True, blank=True)
    
    # Request details
    request_type = models.CharField(max_length=50)  # generate_interpretation, retrieve_context
    test_type = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Response details
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    latency_ms = models.IntegerField()  # Response time in milliseconds
    
    # Costs
    tokens_used = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['test_type', '-timestamp']),
            models.Index(fields=['success']),
        ]
    
    def __str__(self):
        status = "✓" if self.success else "✗"
        return f"{status} {self.request_type} by {self.user.username} at {self.timestamp}"
```

**Migrate**:
```powershell
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Step 5: Create Orchestrator

**File**: `backend/api/ai_engine/orchestrator.py`

```python
"""
AI Engine Orchestrator
Routes interpretation requests to specialized interpreters.
"""
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from api.test_models import TestResult
from .interpreters.sha_interpreter import SHAInterpreter
from .interpreters.mcmi4_interpreter import MCMI4Interpreter
from .interpreters.wellness_interpreter import WellnessInterpreter
from .interpreters.pattern_analyzer import PatternAnalyzer
from .models import AIInterpretation, AIAuditLog
from .utils.cache import get_cached_interpretation, cache_interpretation
from .utils.audit import log_ai_request

logger = logging.getLogger(__name__)


class AIEngineOrchestrator:
    """
    Main orchestrator for AI interpretation requests.
    Routes to appropriate interpreter based on test type.
    """
    
    def __init__(self):
        self.interpreters = {
            'sha_harmony': SHAInterpreter(),
            'mcmi4': MCMI4Interpreter(),
            'mcmi4_signal': MCMI4Interpreter(),
            'wellness': WellnessInterpreter(),
            'pattern_analysis': PatternAnalyzer(),
        }
    
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
        if not settings.AI_ENGINE_ENABLED:
            raise ValueError("AI Engine is not enabled. Set AI_ENGINE_ENABLED=true in settings.")
        
        # Check cache first (unless force_refresh)
        if not force_refresh:
            cached = get_cached_interpretation(test_result.id)
            if cached:
                logger.info(f"Cache hit for TestResult {test_result.id}")
                return cached
        
        # Get test type
        test_type = test_result.test_module.code if test_result.test_module else 'unknown'
        
        # Route to appropriate interpreter
        interpreter = self.interpreters.get(test_type)
        if not interpreter:
            # Try pattern analyzer for unknown types
            interpreter = self.interpreters['pattern_analysis']
            logger.warning(f"No specific interpreter for {test_type}, using pattern analyzer")
        
        # Generate interpretation
        try:
            interpretation_data = interpreter.interpret(test_result, user)
            
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
            cache_interpretation(test_result.id, interpretation_data)
            
            # Audit log
            log_ai_request(
                user=user,
                request_type='generate_interpretation',
                test_type=test_type,
                success=True,
                latency_ms=interpretation_data['metadata'].get('latency_ms', 0),
                tokens_used=interpretation_data['metadata']['tokens']['total'],
                cost_usd=interpretation_data['metadata']['cost_usd'],
                interpretation=ai_interpretation
            )
            
            return interpretation_data
        
        except Exception as e:
            logger.error(f"Error generating interpretation for TestResult {test_result.id}: {str(e)}", exc_info=True)
            
            # Audit log failure
            log_ai_request(
                user=user,
                request_type='generate_interpretation',
                test_type=test_type,
                success=False,
                error_message=str(e),
                latency_ms=0,
                tokens_used=0,
                cost_usd=0.0
            )
            
            raise
    
    def get_interpreter_for_test(self, test_type: str):
        """Get the appropriate interpreter for a test type."""
        return self.interpreters.get(test_type, self.interpreters['pattern_analysis'])
```

### Step 6: Create API Endpoints

**File**: `backend/api/ai_engine/views.py`

```python
"""
AI Engine API Views
Therapist-only endpoints for AI interpretations.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from api.test_models import TestResult
from api.permissions import IsTherapist
from .orchestrator import AIEngineOrchestrator
from .models import AIInterpretation
from .serializers import AIInterpretationSerializer

class GenerateInterpretationView(APIView):
    """
    POST /api/ai-engine/interpret/<test_result_id>/
    Generate AI interpretation for a test result.
    Therapist-only.
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, test_result_id: int):
        """Generate AI interpretation."""
        # Get test result
        test_result = get_object_or_404(TestResult, pk=test_result_id)
        
        # Verify therapist has access to this patient
        if test_result.patient and test_result.patient.therapist != request.user:
            return Response(
                {"detail": "No tiene permiso para acceder a este resultado"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if force_refresh requested
        force_refresh = request.data.get('force_refresh', False)
        
        # Generate interpretation
        try:
            orchestrator = AIEngineOrchestrator()
            interpretation = orchestrator.generate_interpretation(
                test_result=test_result,
                user=request.user,
                force_refresh=force_refresh
            )
            
            return Response(interpretation, status=status.HTTP_200_OK)
        
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            return Response(
                {"detail": f"Error generando interpretación: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InterpretationHistoryView(APIView):
    """
    GET /api/ai-engine/history/<patient_id>/
    Get all AI interpretations for a patient.
    Therapist-only.
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request, patient_id: int):
        """Get interpretation history for patient."""
        # Verify therapist has access
        from api.models import Patient
        patient = get_object_or_404(Patient, pk=patient_id, therapist=request.user)
        
        # Get all interpretations
        interpretations = AIInterpretation.objects.filter(patient=patient)
        serializer = AIInterpretationSerializer(interpretations, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
```

**File**: `backend/api/ai_engine/urls.py`

```python
from django.urls import path
from .views import GenerateInterpretationView, InterpretationHistoryView

urlpatterns = [
    path('interpret/<int:test_result_id>/', GenerateInterpretationView.as_view(), name='ai_generate_interpretation'),
    path('history/<int:patient_id>/', InterpretationHistoryView.as_view(), name='ai_interpretation_history'),
]
```

**Add to**: `backend/api/urls.py`

```python
# Add to urlpatterns
path('ai-engine/', include('api.ai_engine.urls')),
```

---

## RAG Knowledge Base Setup

### Step 1: Setup Pinecone

**Sign up**: https://www.pinecone.io/ (free tier: 1M vectors, sufficient for start)

**Create index**:
```python
# backend/api/ai_engine/rag/setup_pinecone.py
import pinecone
from django.conf import settings

def setup_pinecone_index():
    """Initialize Pinecone index for knowledge base."""
    pinecone.init(
        api_key=settings.PINECONE_API_KEY,
        environment=settings.PINECONE_ENVIRONMENT
    )
    
    # Create index if not exists
    index_name = settings.PINECONE_INDEX_NAME
    if index_name not in pinecone.list_indexes():
        pinecone.create_index(
            name=index_name,
            dimension=3072,  # text-embedding-3-large dimension
            metric='cosine',
            pods=1,
            pod_type='p1.x1'  # Free tier
        )
        print(f"✓ Created Pinecone index: {index_name}")
    else:
        print(f"✓ Pinecone index already exists: {index_name}")
    
    return pinecone.Index(index_name)

if __name__ == '__main__':
    setup_pinecone_index()
```

**Run**:
```powershell
cd backend
python api/ai_engine/rag/setup_pinecone.py
```

### Step 2: Knowledge Base Manager

**File**: `backend/api/ai_engine/rag/knowledge_manager.py`

```python
"""
Knowledge Base Manager
Handles embedding generation and retrieval from vector database.
"""
import logging
from typing import List, Dict, Any
import pinecone
from openai import OpenAI
from django.conf import settings
import tiktoken

logger = logging.getLogger(__name__)

class KnowledgeManager:
    """Manages RAG knowledge base with embeddings and retrieval."""
    
    def __init__(self):
        # Initialize Pinecone
        pinecone.init(
            api_key=settings.PINECONE_API_KEY,
            environment=settings.PINECONE_ENVIRONMENT
        )
        self.index = pinecone.Index(settings.PINECONE_INDEX_NAME)
        
        # Initialize OpenAI
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.embedding_model = settings.OPENAI_EMBEDDING_MODEL
        
        # Token counter
        self.encoding = tiktoken.encoding_for_model(settings.OPENAI_MODEL)
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI."""
        response = self.openai_client.embeddings.create(
            model=self.embedding_model,
            input=text
        )
        return response.data[0].embedding
    
    def retrieve_context(
        self,
        query: str,
        top_k: int = 5,
        filter_metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant context from knowledge base.
        
        Args:
            query: Search query
            top_k: Number of results to return
            filter_metadata: Optional metadata filters (e.g., {"category": "dsm5"})
        
        Returns:
            List of {text, score, metadata} dictionaries
        """
        # Generate query embedding
        query_embedding = self.generate_embedding(query)
        
        # Query Pinecone
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_metadata
        )
        
        # Format results
        context_chunks = []
        for match in results.matches:
            context_chunks.append({
                'text': match.metadata.get('text', ''),
                'score': match.score,
                'source': match.metadata.get('source', 'unknown'),
                'category': match.metadata.get('category', 'general'),
                'metadata': match.metadata
            })
        
        logger.info(f"Retrieved {len(context_chunks)} context chunks for query: {query[:100]}...")
        return context_chunks
    
    def ingest_document(
        self,
        doc_id: str,
        text: str,
        metadata: Dict[str, Any],
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        """
        Ingest a document into knowledge base.
        Splits into chunks, generates embeddings, and stores in Pinecone.
        
        Args:
            doc_id: Unique document identifier
            text: Document text
            metadata: Document metadata (category, source, etc.)
            chunk_size: Maximum tokens per chunk
            chunk_overlap: Overlap between chunks
        """
        # Split into chunks
        chunks = self._split_text(text, chunk_size, chunk_overlap)
        
        # Generate embeddings and upsert
        vectors = []
        for i, chunk in enumerate(chunks):
            embedding = self.generate_embedding(chunk)
            chunk_id = f"{doc_id}_chunk_{i}"
            
            vectors.append({
                'id': chunk_id,
                'values': embedding,
                'metadata': {
                    **metadata,
                    'text': chunk,
                    'chunk_index': i,
                    'doc_id': doc_id
                }
            })
        
        # Upsert to Pinecone (batch)
        self.index.upsert(vectors=vectors)
        logger.info(f"✓ Ingested {len(chunks)} chunks from document {doc_id}")
    
    def _split_text(self, text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """Split text into overlapping chunks by token count."""
        tokens = self.encoding.encode(text)
        chunks = []
        
        start = 0
        while start < len(tokens):
            end = start + chunk_size
            chunk_tokens = tokens[start:end]
            chunk_text = self.encoding.decode(chunk_tokens)
            chunks.append(chunk_text)
            start += chunk_size - chunk_overlap
        
        return chunks
```

### Step 3: Ingest Knowledge Sources

**File**: `backend/api/ai_engine/rag/ingest_scripts/ingest_dsm5.py`

```python
"""
Ingest DSM-5 diagnostic criteria into knowledge base.
"""
from ..knowledge_manager import KnowledgeManager

# Sample DSM-5 entries (replace with full DSM-5 JSON/text)
DSM5_ENTRIES = [
    {
        "code": "F60.5",
        "name": "Obsessive-Compulsive Personality Disorder",
        "criteria": """
        A pervasive pattern of preoccupation with orderliness, perfectionism, and mental 
        and interpersonal control, at the expense of flexibility, openness, and efficiency, 
        beginning by early adulthood and present in a variety of contexts, as indicated by 
        four (or more) of the following:
        
        1. Is preoccupied with details, rules, lists, order, organization, or schedules 
           to the extent that the major point of the activity is lost
        2. Shows perfectionism that interferes with task completion
        3. Is excessively devoted to work and productivity
        4. Is overconscientious, scrupulous, and inflexible about matters of morality, ethics, or values
        5. Is unable to discard worn-out or worthless objects
        6. Is reluctant to delegate tasks or work with others
        7. Adopts a miserly spending style toward both self and others
        8. Shows rigidity and stubbornness
        """,
        "differential_diagnosis": "...",
        "prevalence": "2-8% of general population",
        "comorbidity": "Often co-occurs with anxiety disorders, depression"
    },
    # Add more DSM-5 entries...
]

def ingest_dsm5():
    """Ingest DSM-5 into knowledge base."""
    km = KnowledgeManager()
    
    for entry in DSM5_ENTRIES:
        doc_text = f"""
        DSM-5 Code: {entry['code']}
        Disorder: {entry['name']}
        
        Diagnostic Criteria:
        {entry['criteria']}
        
        Differential Diagnosis:
        {entry['differential_diagnosis']}
        
        Prevalence: {entry['prevalence']}
        Comorbidity: {entry['comorbidity']}
        """
        
        km.ingest_document(
            doc_id=f"dsm5_{entry['code']}",
            text=doc_text,
            metadata={
                'category': 'dsm5',
                'source': 'DSM-5',
                'disorder_code': entry['code'],
                'disorder_name': entry['name']
            }
        )
    
    print(f"✓ Ingested {len(DSM5_ENTRIES)} DSM-5 entries")

if __name__ == '__main__':
    ingest_dsm5()
```

**Run ingestion scripts**:
```powershell
cd backend
python api/ai_engine/rag/ingest_scripts/ingest_dsm5.py
python api/ai_engine/rag/ingest_scripts/ingest_icd11.py
python api/ai_engine/rag/ingest_scripts/ingest_therapies.py
python api/ai_engine/rag/ingest_scripts/ingest_kabbalah.py
```

---

## LLM Integration

### Step 1: OpenAI Client

**File**: `backend/api/ai_engine/llm/openai_client.py`

```python
"""
OpenAI GPT-4 Client
Handles LLM requests with retry logic and token management.
"""
import logging
import time
from typing import Dict, Any, List
from openai import OpenAI
from django.conf import settings
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class GPT4Client:
    """Wrapper for OpenAI GPT-4 API with retry logic."""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.AI_MAX_TOKENS
        self.temperature = settings.AI_TEMPERATURE
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def generate_completion(
        self,
        messages: List[Dict[str, str]],
        response_format: Dict[str, str] = None,
        temperature: float = None
    ) -> Dict[str, Any]:
        """
        Generate completion from GPT-4.
        
        Args:
            messages: List of {"role": "user/system/assistant", "content": "..."}
            response_format: Optional {"type": "json_object"} for JSON mode
            temperature: Override default temperature
        
        Returns:
            {
                "content": "...",
                "tokens": {"prompt": 123, "completion": 456, "total": 579},
                "cost_usd": 0.0123,
                "latency_ms": 1234
            }
        """
        start_time = time.time()
        
        # Prepare request
        kwargs = {
            'model': self.model,
            'messages': messages,
            'max_tokens': self.max_tokens,
            'temperature': temperature or self.temperature
        }
        
        if response_format:
            kwargs['response_format'] = response_format
        
        # Call OpenAI
        try:
            response = self.client.chat.completions.create(**kwargs)
            
            # Calculate metrics
            latency_ms = int((time.time() - start_time) * 1000)
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            total_tokens = response.usage.total_tokens
            
            # Cost calculation (GPT-4-turbo pricing as of Jan 2026)
            # Prompt: $0.01 per 1K tokens, Completion: $0.03 per 1K tokens
            cost_usd = (prompt_tokens / 1000 * 0.01) + (completion_tokens / 1000 * 0.03)
            
            logger.info(f"GPT-4 completion: {total_tokens} tokens, {latency_ms}ms, ${cost_usd:.4f}")
            
            return {
                'content': response.choices[0].message.content,
                'tokens': {
                    'prompt': prompt_tokens,
                    'completion': completion_tokens,
                    'total': total_tokens
                },
                'cost_usd': cost_usd,
                'latency_ms': latency_ms
            }
        
        except Exception as e:
            logger.error(f"Error calling GPT-4: {str(e)}", exc_info=True)
            raise
```

### Step 2: Prompt Templates

**File**: `backend/api/ai_engine/llm/prompts.py`

```python
"""
Prompt Templates for AI Interpreters
"""

SHA_HARMONY_SYSTEM_PROMPT = """
You are an expert psychotherapist specializing in holistic and Kabbalistic psychology.
Your role is to interpret SHA Harmony test results, which assess Sefirotic balance 
across the Tree of Life.

Guidelines:
- Use symbolic, compassionate language
- Focus on growth opportunities, not pathology
- Connect Sefirotic imbalances to psychological patterns
- Suggest therapeutic modalities that address imbalances
- NEVER provide medical diagnoses (educational/symbolic only)

Prohibited terms:
- "diagnóstico", "diagnostic", "disorder", "illness", "disease", "pathology", 
  "mental illness", "psychopathology", "syndrome", "condition", "abnormal"

Use instead:
- "patrón de personalidad" (personality pattern)
- "área de crecimiento" (growth area)
- "desafío emocional" (emotional challenge)
- "oportunidad de desarrollo" (development opportunity)

Output Format (JSON):
{
  "narrative": {
    "summary": "2-3 sentence overview of Sefirotic state",
    "key_insights": ["insight 1", "insight 2", "insight 3"],
    "clinical_concerns": ["concern 1 (if any)"],
    "strengths": ["strength 1", "strength 2"]
  },
  "suggested_diagnoses": [
    {
      "code": "F60.5",
      "name": "Obsessive-Compulsive Personality Disorder",
      "probability": 0.72,
      "evidence": ["Low Tiferet (perfectionism)", "High Gevurah (rigidity)"]
    }
  ],
  "therapeutic_route": {
    "immediate_focus": {
      "sefira": "Chesed",
      "issue": "Cultivate self-compassion",
      "techniques": ["Loving-kindness meditation", "Self-compassion exercises"]
    },
    "complementary_modalities": [
      {"modality": "Mindfulness-Based Therapy", "rationale": "Address Gevurah rigidity"},
      {"modality": "Gestalt Therapy", "rationale": "Integrate Tiferet balance"}
    ],
    "next_assessments": ["MCMI-4 for personality pattern validation"],
    "contraindications": ["Avoid overly confrontational techniques (low Chesed)"]
  }
}
"""

SHA_HARMONY_USER_PROMPT_TEMPLATE = """
Interpret the following SHA Harmony test results:

**Patient Context:**
- Name: {patient_name}
- Age: {patient_age}
- Gender: {patient_gender}

**SHA Harmony Results:**
- Harmony Index: {harmony_index} / 5.0 ({harmony_level})
- Sefirot Scores:
  - Keter (Crown): {keter} / 5
  - Chokmah (Wisdom): {chokmah} / 5
  - Binah (Understanding): {binah} / 5
  - Chesed (Mercy): {chesed} / 5
  - Gevurah (Strength): {gevurah} / 5
  - Tiferet (Beauty): {tiferet} / 5
  - Netzach (Victory): {netzach} / 5
  - Hod (Glory): {hod} / 5
  - Yesod (Foundation): {yesod} / 5
  - Malkuth (Kingdom): {malkuth} / 5

**Relevant Knowledge Base Context:**
{rag_context}

Please provide a comprehensive therapeutic interpretation following the output format.
"""

MCMI4_SYSTEM_PROMPT = """
You are an expert clinical psychologist specializing in personality assessment.
Your role is to interpret MCMI-4 test results, which measure personality patterns 
and clinical syndromes.

Guidelines:
- Use clinical language appropriate for therapist audience
- Connect elevated scales to DSM-5/ICD-11 patterns
- Suggest differential diagnoses with probability estimates
- Recommend therapeutic approaches based on pattern configurations
- Consider scale interactions (e.g., Avoidant + Dependent)

Output Format: Same JSON structure as SHA Harmony interpreter.
"""

# Add more prompts for other interpreters...
```

---

## Frontend Implementation

### Step 1: AI Interpretation Panel Component

**File**: `tonyblanco-app/components/ai/AIInterpretationPanel.tsx`

```typescript
/**
 * AI Interpretation Panel
 * Displays AI-generated therapeutic interpretations.
 * THERAPIST-ONLY component.
 */
'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

interface AIInterpretation {
  interpretation_id: string;
  narrative: {
    summary: string;
    key_insights: string[];
    clinical_concerns: string[];
    strengths: string[];
  };
  suggested_diagnoses: Array<{
    code: string;
    name: string;
    probability: number;
    evidence: string[];
  }>;
  therapeutic_route: {
    immediate_focus: {
      sefira?: string;
      issue: string;
      techniques: string[];
    };
    complementary_modalities: Array<{
      modality: string;
      rationale: string;
    }>;
    next_assessments: string[];
    contraindications: string[];
  };
  metadata: {
    model_used: string;
    timestamp: string;
    cost_usd: number;
  };
}

interface AIInterpretationPanelProps {
  testResultId: number;
  existingInterpretation?: AIInterpretation;
  onRefresh?: () => void;
}

export default function AIInterpretationPanel({
  testResultId,
  existingInterpretation,
  onRefresh
}: AIInterpretationPanelProps) {
  const [interpretation, setInterpretation] = useState<AIInterpretation | null>(
    existingInterpretation || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInterpretation = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai-engine/interpret/${testResultId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ force_refresh: forceRefresh })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error generando interpretación');
      }

      const data = await response.json();
      setInterpretation(data);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!interpretation && !loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Interpretación IA</h3>
          <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Solo Terapeuta
          </span>
        </div>

        <p className="text-gray-600 mb-4">
          Genera una interpretación terapéutica profunda usando IA con contexto de DSM-5, 
          ICD-11 y modalidades terapéuticas.
        </p>

        <button
          onClick={() => generateInterpretation(false)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generar Interpretación IA
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Generando interpretación con IA...</p>
        <p className="text-sm text-gray-500 mt-2">Esto puede tomar 10-15 segundos</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-900">Error</h3>
        </div>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => generateInterpretation(false)}
          className="mt-4 text-red-600 hover:text-red-800 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!interpretation) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Interpretación IA</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {interpretation.metadata.model_used} • ${interpretation.metadata.cost_usd.toFixed(4)}
          </span>
          <button
            onClick={() => generateInterpretation(true)}
            className="text-purple-600 hover:text-purple-800 transition"
            title="Regenerar interpretación"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Narrative Summary */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">Resumen</h4>
        <p className="text-gray-700 leading-relaxed">{interpretation.narrative.summary}</p>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Insights Clave
        </h4>
        <ul className="space-y-2">
          {interpretation.narrative.key_insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span className="text-gray-700">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Clinical Concerns */}
      {interpretation.narrative.clinical_concerns.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Áreas de Atención
          </h4>
          <ul className="space-y-2">
            {interpretation.narrative.clinical_concerns.map((concern, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span className="text-gray-700">{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Diagnoses */}
      {interpretation.suggested_diagnoses.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Patrones Sugeridos
          </h4>
          <div className="space-y-3">
            {interpretation.suggested_diagnoses.map((diagnosis, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono text-sm text-gray-500">{diagnosis.code}</span>
                    <p className="font-medium text-gray-900">{diagnosis.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {(diagnosis.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 mt-2">
                  {diagnosis.evidence.map((evidence, evidx) => (
                    <li key={evidx}>• {evidence}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Therapeutic Route */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Ruta Terapéutica</h4>
        
        {/* Immediate Focus */}
        <div className="bg-white border border-purple-200 rounded-lg p-4 mb-4">
          <h5 className="font-medium text-purple-900 mb-2">Enfoque Inmediato</h5>
          {interpretation.therapeutic_route.immediate_focus.sefira && (
            <p className="text-sm text-gray-600 mb-1">
              <strong>Sefirá:</strong> {interpretation.therapeutic_route.immediate_focus.sefira}
            </p>
          )}
          <p className="text-gray-700 mb-2">{interpretation.therapeutic_route.immediate_focus.issue}</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {interpretation.therapeutic_route.immediate_focus.techniques.map((technique, idx) => (
              <li key={idx}>✓ {technique}</li>
            ))}
          </ul>
        </div>

        {/* Complementary Modalities */}
        <div className="mb-4">
          <h5 className="font-medium text-gray-900 mb-2">Modalidades Complementarias</h5>
          <div className="space-y-2">
            {interpretation.therapeutic_route.complementary_modalities.map((modality, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-900">{modality.modality}</p>
                <p className="text-sm text-gray-600">{modality.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Assessments */}
        {interpretation.therapeutic_route.next_assessments.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2">Evaluaciones Sugeridas</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              {interpretation.therapeutic_route.next_assessments.map((assessment, idx) => (
                <li key={idx}>→ {assessment}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Contraindications */}
        {interpretation.therapeutic_route.contraindications.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h5 className="font-medium text-yellow-900 mb-2">Contraindicaciones</h5>
            <ul className="text-sm text-yellow-800 space-y-1">
              {interpretation.therapeutic_route.contraindications.map((contra, idx) => (
                <li key={idx}>⚠ {contra}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 2: Integrate into Test Result Pages

Add to test result components (e.g., `ReadableResult.tsx`):

```typescript
import AIInterpretationPanel from '@/components/ai/AIInterpretationPanel';

// Inside component render
{isTherapist && (
  <div className="mt-6">
    <AIInterpretationPanel testResultId={testResult.id} />
  </div>
)}
```

---

## Testing & Validation

### Step 1: Unit Tests

**File**: `backend/api/ai_engine/tests/test_orchestrator.py`

```python
from django.test import TestCase
from api.ai_engine.orchestrator import AIEngineOrchestrator
from api.test_models import TestResult, TestModule
from api.models import Patient
from django.contrib.auth.models import User

class OrchestratorTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('therapist', 'test@test.com', 'pass')
        self.module = TestModule.objects.create(code='sha_harmony', name='SHA Harmony')
        self.patient = Patient.objects.create(user=self.user, therapist=self.user, full_name='Test')
        self.result = TestResult.objects.create(
            test_module=self.module,
            patient=self.patient,
            user=self.user,
            details={'harmony_index': 3.2}
        )
    
    def test_generate_interpretation_sha(self):
        orchestrator = AIEngineOrchestrator()
        interpretation = orchestrator.generate_interpretation(self.result, self.user)
        
        self.assertIn('interpretation_id', interpretation)
        self.assertIn('narrative', interpretation)
        self.assertIn('therapeutic_route', interpretation)
```

### Step 2: Integration Test

**Manual test flow**:
1. Create test patient
2. Execute SHA Harmony test
3. Call `/api/ai-engine/interpret/<result_id>/`
4. Verify response structure
5. Check frontend panel rendering
6. Verify audit log created
7. Test cache (second request should be faster)

---

## Deployment Checklist

### Environment Setup
- [ ] OpenAI API key added to production `.env`
- [ ] Pinecone API key configured
- [ ] Redis server running (for caching)
- [ ] `AI_ENGINE_ENABLED=true` in production

### Database Migrations
- [ ] Run `python manage.py migrate` to create AI tables
- [ ] Verify `AIInterpretation` and `AIAuditLog` tables exist

### Knowledge Base
- [ ] Pinecone index created in production environment
- [ ] DSM-5 knowledge ingested (run `ingest_dsm5.py`)
- [ ] ICD-11 knowledge ingested
- [ ] Therapeutic modalities ingested
- [ ] Kabbalistic knowledge ingested

### API Endpoints
- [ ] `/api/ai-engine/interpret/<id>/` accessible to therapists only
- [ ] `/api/ai-engine/history/<patient_id>/` returns interpretations
- [ ] Permissions verified (IsTherapist enforced)

### Frontend
- [ ] `AIInterpretationPanel` renders correctly
- [ ] Therapist-only visibility enforced
- [ ] Loading states work
- [ ] Error handling displays properly
- [ ] Refresh button regenerates interpretation

### Monitoring
- [ ] Audit logs capturing all requests
- [ ] Cost tracking functional
- [ ] Latency metrics recorded
- [ ] Error rates monitored

### Security
- [ ] API keys stored in environment variables (NOT committed to repo)
- [ ] Safety filters active in prompts
- [ ] Therapist-only access enforced at API level
- [ ] Patient data properly isolated

---

## Next Steps

1. **Complete DOC phase**: Create remaining documentation (setup scripts, testing guide)
2. **Begin CODE phase**: Implement orchestrator → RAG → interpreters → frontend
3. **Parallel tasks**: While coding backend, prepare knowledge base ingestion
4. **Iterative testing**: Test each interpreter as it's built
5. **Alpha release**: Deploy to staging with limited therapist access
6. **Feedback loop**: Gather therapist feedback, refine prompts
7. **Production release**: Full rollout with monitoring

---

**Estimated Timeline**: 3-4 weeks for complete implementation  
**Priority Order**: Orchestrator → RAG → SHA Interpreter → Frontend → Other Interpreters  
**Cost**: ~$50-100 for knowledge base ingestion (one-time), ~$6/month operational

**Dependencies**: OpenAI API key, Pinecone account, Redis server  
**Blockers**: None (all tools available)

Ready to proceed with CODE phase? 🚀
