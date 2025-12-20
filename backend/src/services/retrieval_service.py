import logging
import time
from typing import List, Dict, Any, Optional
from .qdrant_service import QdrantService
from ..utils.error_handler import handle_error

logger = logging.getLogger(__name__)

class RetrievalService:
    def __init__(self):
        # Ensure QdrantService supports async methods
        self.qdrant_service = QdrantService()

    async def retrieve_relevant_content(self, query: str, top_k: int = 5, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Retrieve relevant content based on the query using async execution.
        """
        start_time = time.time()

        try:
            # Added 'await' - Assuming your QdrantService.search is now async
            results = await self.qdrant_service.search(query, top_k=top_k, filters=filters)

            processing_time = time.time() - start_time

            formatted_results = {
                "query": query,
                "contexts": results,
                "total_results": len(results),
                "retrieval_time": processing_time,
                "success": True,
                "message": f"Retrieved {len(results)} relevant contexts"
            }

            logger.info(f"Retrieved {len(results)} contexts for query: {query[:50]}...")
            return formatted_results

        except Exception as e:
            processing_time = time.time() - start_time
            # Use standardized error handler
            handle_error(e, f"RetrievalService.retrieve_relevant_content for query: {query}")
            
            return {
                "query": query,
                "contexts": [],
                "total_results": 0,
                "retrieval_time": processing_time,
                "success": False,
                "message": f"Failed to retrieve content: {str(e)}",
                "error": str(e)
            }

    async def retrieve_by_source(self, source: str, top_k: int = 10) -> Dict[str, Any]:
        """
        Retrieve content specifically from a given source using Qdrant filters.
        """
        start_time = time.time()
        try:
            # Use metadata filtering instead of fetching 1000 items and filtering in Python
            filters = {"source": source}
            results = await self.qdrant_service.search("", top_k=top_k, filters=filters)

            return {
                "source": source,
                "contexts": results,
                "total_results": len(results),
                "retrieval_time": time.time() - start_time,
                "success": True,
                "message": f"Retrieved {len(results)} contexts from source: {source}"
            }
        except Exception as e:
            handle_error(e, f"RetrievalService.retrieve_by_source: {source}")
            return {"success": False, "message": str(e), "contexts": []}

    async def hybrid_search(self, query: str, keyword_weight: float = 0.3, top_k: int = 5) -> Dict[str, Any]:
        """
        Perform hybrid search. Updated to await the async service.
        """
        start_time = time.time()
        try:
            # Call the updated async search in qdrant_service
            results = await self.qdrant_service.search(query, top_k=top_k)

            return {
                "query": query,
                "contexts": results,
                "total_results": len(results),
                "retrieval_time": time.time() - start_time,
                "keyword_weight": keyword_weight,
                "success": True,
                "message": "Performed semantic search (Hybrid placeholder)"
            }
        except Exception as e:
            handle_error(e, "RetrievalService.hybrid_search")
            return {"success": False, "message": str(e), "contexts": []}

    async def validate_index_availability(self) -> bool:
        """
        Check if the index is available and has content.
        """
        try:
            # Changed to await
            collection_info = await self.qdrant_service.get_collection_info()
            if collection_info and collection_info.get("points_count", 0) > 0:
                return True
            return False
        except Exception as e:
            logger.error(f"Error validating index availability: {e}")
            return False