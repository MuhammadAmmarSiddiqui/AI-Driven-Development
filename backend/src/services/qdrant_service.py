from qdrant_client import AsyncQdrantClient, models
from typing import List, Dict, Any, Optional
import logging
from sentence_transformers import SentenceTransformer
import numpy as np
import os
import asyncio
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class QdrantService:
    def __init__(self):
        # Switched to AsyncQdrantClient for FastAPI compatibility
        self.client = AsyncQdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )
        self.collection_name = os.getenv("QDRANT_COLLECTION_NAME", "knowledge_base")
        
        # Load embedding model (Note: for high performance, move this to a global or separate service)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

    async def _initialize_collection(self):
        """Initialize the Qdrant collection (Async version)"""
        try:
            exists = await self.client.collection_exists(self.collection_name)
            if not exists:
                await self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=384, 
                        distance=models.Distance.COSINE
                    )
                )
                logger.info(f"Created collection '{self.collection_name}'")
            else:
                logger.info(f"Collection '{self.collection_name}' already exists")
        except Exception as e:
            logger.error(f"Failed to initialize collection: {e}")

    def encode_text(self, text: str) -> List[float]:
        """Generate embeddings for a text (Synchronous CPU task)"""
        embedding = self.embedding_model.encode(text)
        return embedding.tolist()

    async def store_chunks(self, chunks: List[Dict[str, Any]]):
        """Store content chunks in Qdrant (Async version)"""
        if not chunks:
            return

        # Generate embeddings
        texts = [chunk.get("text", "") for chunk in chunks]
        embeddings = self.embedding_model.encode(texts)

        points = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            points.append(models.PointStruct(
                id=chunk.get("id", i),
                vector=embedding.tolist(),
                payload={
                    "text": chunk.get("text", ""),
                    "source": chunk.get("source", ""),
                    "page": chunk.get("page", ""),
                    "metadata": chunk.get("metadata", {}),
                    "chunk_id": chunk.get("chunk_id", "")
                }
            ))

        await self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        logger.info(f"Stored {len(chunks)} chunks in Qdrant")

    async def search(self, query: str, top_k: int = 5, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Search for relevant content.
        FIXED: Changed query_vector to query for query_points compatibility.
        """
        # If query is empty, handle appropriately
        if not query.strip():
            return []

        query_embedding = self.encode_text(query)

        # Build Qdrant filter if filters are provided
        query_filter = None
        if filters:
            conditions = [
                models.FieldCondition(key=k, match=models.MatchValue(value=v))
                for k, v in filters.items()
            ]
            query_filter = models.Filter(must=conditions)

        # UPDATED: Use 'query' instead of 'query_vector' for modern Qdrant client
        response = await self.client.query_points(
            collection_name=self.collection_name,
            query=query_embedding,
            limit=top_k,
            query_filter=query_filter
        )

        formatted_results = []
        for hit in response.points:
            formatted_results.append({
                "id": hit.id,
                "text": hit.payload.get("text", ""),
                "source": hit.payload.get("source", ""),
                "page": hit.payload.get("page", ""),
                "metadata": hit.payload.get("metadata", {}),
                "chunk_id": hit.payload.get("chunk_id", ""),
                "score": hit.score
            })

        return formatted_results

    async def get_collection_info(self):
        """Get collection statistics (Async version)"""
        try:
            info = await self.client.get_collection(self.collection_name)
            return {
                "vector_size": info.config.params.vectors.size,
                "points_count": info.points_count
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            return None