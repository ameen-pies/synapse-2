import faiss
import numpy as np
from typing import List, Dict, Tuple
import logging
from embeddings import EmbeddingGenerator

logger = logging.getLogger(__name__)

class FAISSRecommender:
    """FAISS-based content recommendation system"""
    
    def __init__(self, embedding_generator: EmbeddingGenerator):
        self.embedding_gen = embedding_generator
        self.index = None
        self.content_mapping = []  # Maps FAISS index position to content
        self.is_trained = False
    
    def build_index(self, contents: List[Dict]):
        """Build FAISS index from content embeddings"""
        if not contents:
            logger.warning("No content provided to build index")
            return
        
        logger.info(f"Building FAISS index for {len(contents)} items")
        
        # Generate embeddings
        texts = [self.embedding_gen.create_content_text(c) for c in contents]
        embeddings = self.embedding_gen.generate_batch_embeddings(texts)
        
        # Create FAISS index (using L2 distance)
        dimension = embeddings.shape[1]
        
        # For small datasets (<1000), use simple IndexFlatL2
        # For larger datasets, use IndexIVFFlat with clustering
        if len(contents) < 1000:
            logger.info("Using IndexFlatL2 (brute force) for small dataset")
            self.index = faiss.IndexFlatL2(dimension)
            self.index.add(embeddings.astype('float32'))
        else:
            # Use IVF (Inverted File) with k-means clustering
            nlist = min(100, len(contents) // 10)  # Number of clusters
            quantizer = faiss.IndexFlatL2(dimension)
            self.index = faiss.IndexIVFFlat(quantizer, dimension, nlist)
            
            # Train the index
            logger.info(f"Training IndexIVFFlat with {nlist} clusters")
            self.index.train(embeddings.astype('float32'))
            self.index.add(embeddings.astype('float32'))
            
            # Set search parameters for better recall
            self.index.nprobe = min(10, nlist)  # Number of clusters to search
        
        # Store content mapping
        self.content_mapping = contents
        self.is_trained = True
        
        logger.info(f"✅ FAISS index built successfully. Total vectors: {self.index.ntotal}")
    
    def search(self, topics: List[str], k: int = 10) -> List[Tuple[Dict, float]]:
        """Search for top-k similar content based on user topics"""
        if not self.is_trained:
            logger.error("Index not trained. Call build_index first")
            return []
        
        # Generate query embedding
        query_embedding = self.embedding_gen.generate_query_embedding(topics)
        query_embedding = query_embedding.reshape(1, -1).astype('float32')
        
        # Search
        k = min(k, self.index.ntotal)  # Don't request more than available
        distances, indices = self.index.search(query_embedding, k)
        
        # Convert distances to similarity scores (lower distance = higher similarity)
        # Normalize to 0-1 range
        max_dist = distances[0].max() if len(distances[0]) > 0 and distances[0].max() > 0 else 1
        similarities = 1 - (distances[0] / max_dist)
        
        # Build results
        results = []
        for idx, score in zip(indices[0], similarities):
            if 0 <= idx < len(self.content_mapping):
                results.append((self.content_mapping[idx], float(score)))
        
        logger.info(f"Found {len(results)} recommendations for topics: {topics}")
        return results
    
    def update_index(self, new_contents: List[Dict]):
        """Add new content to existing index"""
        if not new_contents:
            return
        
        logger.info(f"Adding {len(new_contents)} new items to index")
        
        texts = [self.embedding_gen.create_content_text(c) for c in new_contents]
        embeddings = self.embedding_gen.generate_batch_embeddings(texts)
        
        self.index.add(embeddings.astype('float32'))
        self.content_mapping.extend(new_contents)
        
        logger.info(f"Index updated. Total vectors: {self.index.ntotal}")
    
    def get_stats(self) -> Dict:
        """Get index statistics"""
        return {
            "is_trained": self.is_trained,
            "total_vectors": self.index.ntotal if self.index else 0,
            "dimension": self.embedding_gen.embedding_dim,
            "total_content": len(self.content_mapping)
        }