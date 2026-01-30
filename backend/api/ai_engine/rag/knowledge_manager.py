"""
Knowledge Base Manager
Handles embedding generation and retrieval from vector database.
"""
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class KnowledgeManager:
    """Manages RAG knowledge base with embeddings and retrieval."""
    
    def __init__(self):
        """Initialize knowledge manager (with stubs for missing dependencies)."""
        self.index = None
        self.openai_client = None
        self.embedding_model = 'text-embedding-3-large'
        self.encoding = None
        
        # Try to initialize Pinecone and OpenAI (graceful fallback if not configured)
        try:
            self._init_pinecone()
        except Exception as e:
            logger.warning(f"Pinecone initialization failed: {e}. RAG features will be limited.")
        
        try:
            self._init_openai()
        except Exception as e:
            logger.warning(f"OpenAI embeddings initialization failed: {e}. Using fallback.")
    
    def _init_pinecone(self):
        """Initialize Pinecone connection."""
        try:
            import pinecone
            from django.conf import settings
            
            pinecone.init(
                api_key=settings.PINECONE_API_KEY,
                environment=settings.PINECONE_ENVIRONMENT
            )
            self.index = pinecone.Index(settings.PINECONE_INDEX_NAME)
            logger.info("✓ Pinecone initialized successfully")
        except ImportError:
            logger.warning("Pinecone not installed. Install with: pip install pinecone-client")
        except AttributeError as e:
            logger.warning(f"Pinecone configuration missing: {e}")
    
    def _init_openai(self):
        """Initialize OpenAI embeddings client."""
        try:
            from openai import OpenAI
            from django.conf import settings
            import tiktoken
            
            self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
            self.embedding_model = getattr(settings, 'OPENAI_EMBEDDING_MODEL', 'text-embedding-3-large')
            self.encoding = tiktoken.encoding_for_model('gpt-4-turbo-preview')
            logger.info("✓ OpenAI embeddings initialized successfully")
        except ImportError:
            logger.warning("OpenAI or tiktoken not installed")
        except AttributeError as e:
            logger.warning(f"OpenAI configuration missing: {e}")
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI."""
        if not self.openai_client:
            logger.warning("OpenAI client not available, returning dummy embedding")
            return [0.0] * 3072  # Dummy embedding
        
        try:
            response = self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return [0.0] * 3072  # Fallback
    
    def retrieve_context(
        self,
        query: str,
        top_k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
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
        if not self.index:
            logger.warning("Pinecone not available, returning fallback context")
            return self._get_fallback_context(query, top_k)
        
        try:
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
        
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return self._get_fallback_context(query, top_k)
    
    def _get_fallback_context(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Provide fallback context when RAG is unavailable."""
        # Return generic Kabbalistic knowledge as fallback
        fallback_contexts = [
            {
                'text': 'Chesed represents loving-kindness, compassion, and generosity. Low Chesed may indicate difficulty with self-compassion and accepting love from others.',
                'score': 0.75,
                'source': 'Kabbalistic Psychology (Fallback)',
                'category': 'kabbalah',
                'metadata': {'sefira': 'Chesed'}
            },
            {
                'text': 'Gevurah represents strength, discipline, and boundaries. High Gevurah can manifest as rigidity, perfectionism, or excessive self-criticism.',
                'score': 0.72,
                'source': 'Kabbalistic Psychology (Fallback)',
                'category': 'kabbalah',
                'metadata': {'sefira': 'Gevurah'}
            },
            {
                'text': 'Tiferet represents balance, beauty, and integration. It harmonizes Chesed and Gevurah. Strong Tiferet indicates good emotional balance.',
                'score': 0.70,
                'source': 'Kabbalistic Psychology (Fallback)',
                'category': 'kabbalah',
                'metadata': {'sefira': 'Tiferet'}
            },
            {
                'text': 'Mindfulness-Based Therapy can help address rigidity (high Gevurah) by cultivating present-moment awareness and acceptance.',
                'score': 0.68,
                'source': 'Therapeutic Modalities (Fallback)',
                'category': 'therapies',
                'metadata': {'modality': 'Mindfulness-Based Therapy'}
            },
            {
                'text': 'Gestalt Therapy emphasizes integration and wholeness, aligning with Tiferet principles. Useful for personality pattern work.',
                'score': 0.65,
                'source': 'Therapeutic Modalities (Fallback)',
                'category': 'therapies',
                'metadata': {'modality': 'Gestalt Therapy'}
            }
        ]
        
        logger.info(f"Using fallback context ({len(fallback_contexts)} items)")
        return fallback_contexts[:top_k]
    
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
        
        Args:
            doc_id: Unique document identifier
            text: Document text
            metadata: Document metadata (category, source, etc.)
            chunk_size: Maximum tokens per chunk
            chunk_overlap: Overlap between chunks
        """
        if not self.index:
            logger.warning("Pinecone not available, skipping document ingestion")
            return
        
        try:
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
        
        except Exception as e:
            logger.error(f"Error ingesting document: {e}")
    
    def _split_text(self, text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """Split text into overlapping chunks by token count."""
        if not self.encoding:
            # Fallback: split by characters
            chunks = []
            for i in range(0, len(text), chunk_size * 4):  # Rough estimate: 4 chars per token
                chunks.append(text[i:i + chunk_size * 4])
            return chunks
        
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
