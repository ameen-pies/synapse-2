from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """Initialize with a lightweight sentence transformer model"""
        logger.info(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        logger.info(f"Model loaded. Embedding dimension: {self.embedding_dim}")
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text"""
        return self.model.encode(text, convert_to_numpy=True)
    
    def generate_batch_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a batch of texts"""
        return self.model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
    
    def create_content_text(self, content: Dict) -> str:
        """Create searchable text from content document - UPDATED FOR YOUR SCHEMA"""
        parts = []
        
        # Add title with higher weight (repeat for importance)
        if 'title' in content:
            parts.append(f"{content['title']} {content['title']}")
        
        # Add description
        if 'description' in content:
            parts.append(content['description'])
        elif 'desc' in content:
            parts.append(content['desc'])
        
        # Add tags (your schema uses 'tags' as array)
        if 'tags' in content and content['tags']:
            tags = content['tags'] if isinstance(content['tags'], list) else [content['tags']]
            parts.append(' '.join(tags))
        
        # Add labels (for forums)
        if 'labels' in content and content['labels']:
            labels = content['labels'] if isinstance(content['labels'], list) else [content['labels']]
            parts.append(' '.join(labels))
        
        # Add category (repeat for importance)
        if 'category' in content:
            parts.append(f"{content['category']} {content['category']}")
        
        # Add author for credibility signal
        if 'author' in content:
            parts.append(content['author'])
        elif 'creator' in content:
            parts.append(content['creator'])
        
        # Add difficulty level (for courses)
        if 'difficulty' in content:
            parts.append(content['difficulty'])
        
        return ' '.join(parts).strip()
    
    def generate_query_embedding(self, topics: List[str]) -> np.ndarray:
        """Generate embedding for user-selected topics"""
        query_text = ' '.join(topics)
        return self.generate_embedding(query_text)