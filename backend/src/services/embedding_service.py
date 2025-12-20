import logging
from typing import List, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer
from src.config import config_main as Config

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, model_name: str = None):
        """
        Initialize the Embedding Service with a sentence transformer model
        """
        model_name = model_name or Config.EMBEDDING_MODEL
        self.model = SentenceTransformer(model_name)
        logger.info(f"Loaded embedding model: {model_name}")

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate a single embedding for the given text
        """
        if not text:
            return []

        try:
            embedding = self.model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding for text: {e}")
            raise

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a batch of texts
        """
        if not texts:
            return []

        try:
            embeddings = self.model.encode(texts)
            return [embedding.tolist() for embedding in embeddings]
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            raise

    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of the embeddings produced by this model
        """
        # Generate a test embedding to get the dimension
        test_embedding = self.model.encode(["test"])
        return len(test_embedding[0])

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calculate cosine similarity between two embeddings
        """
        try:
            # Convert to numpy arrays
            emb1 = np.array(embedding1)
            emb2 = np.array(embedding2)

            # Calculate cosine similarity
            dot_product = np.dot(emb1, emb2)
            norm1 = np.linalg.norm(emb1)
            norm2 = np.linalg.norm(emb2)

            if norm1 == 0 or norm2 == 0:
                return 0.0

            similarity = dot_product / (norm1 * norm2)
            return float(similarity)
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0

    def find_most_similar(self, query_embedding: List[float],
                         candidate_embeddings: List[List[float]]) -> List[float]:
        """
        Find the most similar embedding from a list of candidates
        Returns the index of the most similar embedding
        """
        if not candidate_embeddings:
            return -1

        similarities = [
            self.calculate_similarity(query_embedding, candidate)
            for candidate in candidate_embeddings
        ]

        return similarities.index(max(similarities))

# Example usage
if __name__ == "__main__":
    service = EmbeddingService()

    # Test single embedding
    text = "This is a sample text for embedding"
    embedding = service.generate_embedding(text)
    print(f"Generated embedding of length: {len(embedding)}")

    # Test batch embeddings
    texts = ["First sentence", "Second sentence", "Third sentence"]
    embeddings = service.generate_embeddings_batch(texts)
    print(f"Generated {len(embeddings)} embeddings")

    # Test similarity calculation
    if len(embeddings) >= 2:
        similarity = service.calculate_similarity(embeddings[0], embeddings[1])
        print(f"Similarity between first two embeddings: {similarity:.4f}")

    print(f"Embedding dimension: {service.get_embedding_dimension()}")