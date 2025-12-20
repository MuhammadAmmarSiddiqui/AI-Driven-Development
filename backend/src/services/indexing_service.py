import logging
from typing import List, Dict, Any
from .qdrant_service import QdrantService
from .embedding_service import EmbeddingService
from .content_extraction_service import ContentExtractionService
from .chunking_service import ChunkingService
import time

logger = logging.getLogger(__name__)

class IndexingService:
    def __init__(self):
        self.qdrant_service = QdrantService()
        self.embedding_service = EmbeddingService()
        self.content_extraction_service = ContentExtractionService()
        self.chunking_service = ChunkingService()

    def index_document(self, source_path: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Index a document by extracting content, chunking, and storing in Qdrant
        """
        start_time = time.time()

        try:
            # Extract content from the document
            extraction_result = self.content_extraction_service.process_book_content(source_path)
            chunks = extraction_result["chunks"]

            # Store chunks in Qdrant
            self.qdrant_service.store_chunks(chunks)

            processing_time = time.time() - start_time

            result = {
                "source_path": source_path,
                "indexed_chunks": len(chunks),
                "processing_time": processing_time,
                "success": True,
                "message": f"Successfully indexed {len(chunks)} chunks from {source_path}",
                "metadata": metadata or {}
            }

            logger.info(f"Indexed {len(chunks)} chunks from {source_path}")
            return result

        except Exception as e:
            processing_time = time.time() - start_time
            error_result = {
                "source_path": source_path,
                "indexed_chunks": 0,
                "processing_time": processing_time,
                "success": False,
                "message": f"Failed to index document: {str(e)}",
                "error": str(e)
            }

            logger.error(f"Failed to index document {source_path}: {e}")
            return error_result

    def index_multiple_documents(self, source_paths: List[str]) -> Dict[str, Any]:
        """
        Index multiple documents
        """
        start_time = time.time()
        results = []

        for source_path in source_paths:
            result = self.index_document(source_path)
            results.append(result)

        total_processing_time = time.time() - start_time

        # Aggregate results
        successful = sum(1 for r in results if r["success"])
        total_chunks = sum(r["indexed_chunks"] for r in results)

        summary = {
            "total_documents": len(source_paths),
            "successful_documents": successful,
            "failed_documents": len(source_paths) - successful,
            "total_chunks_indexed": total_chunks,
            "total_processing_time": total_processing_time,
            "success": successful == len(source_paths),
            "message": f"Indexed {successful}/{len(source_paths)} documents",
            "detailed_results": results
        }

        return summary

    def index_text_content(self, text: str, source: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Index text content directly (not from a file)
        """
        start_time = time.time()

        try:
            # Chunk the text
            chunks = self.chunking_service.chunk_text(text, source, metadata)

            # Store chunks in Qdrant
            self.qdrant_service.store_chunks(chunks)

            processing_time = time.time() - start_time

            result = {
                "source": source,
                "indexed_chunks": len(chunks),
                "processing_time": processing_time,
                "success": True,
                "message": f"Successfully indexed {len(chunks)} chunks from text content",
                "metadata": metadata or {}
            }

            logger.info(f"Indexed {len(chunks)} chunks from text content: {source}")
            return result

        except Exception as e:
            processing_time = time.time() - start_time
            error_result = {
                "source": source,
                "indexed_chunks": 0,
                "processing_time": processing_time,
                "success": False,
                "message": f"Failed to index text content: {str(e)}",
                "error": str(e)
            }

            logger.error(f"Failed to index text content from {source}: {e}")
            return error_result

    def update_document(self, source_path: str, new_content: str = None) -> Dict[str, Any]:
        """
        Update an existing document in the index
        """
        # For now, we'll just re-index the document
        # In a real implementation, you might want to implement more sophisticated update logic
        return self.index_document(source_path)

    def delete_document(self, source: str) -> Dict[str, Any]:
        """
        Delete a document from the index by source
        """
        start_time = time.time()

        try:
            # In Qdrant, we can't directly delete by payload, so we would need to search first
            # This is a simplified implementation - in practice, you'd need to track document IDs
            # and delete them specifically

            # For now, return a message indicating this needs to be implemented
            processing_time = time.time() - start_time

            result = {
                "source": source,
                "processing_time": processing_time,
                "success": False,
                "message": "Document deletion needs to be implemented with document ID tracking",
                "warning": "This feature is not fully implemented yet"
            }

            logger.warning(f"Document deletion not fully implemented for {source}")
            return result

        except Exception as e:
            processing_time = time.time() - start_time
            error_result = {
                "source": source,
                "processing_time": processing_time,
                "success": False,
                "message": f"Failed to delete document: {str(e)}",
                "error": str(e)
            }

            logger.error(f"Failed to delete document {source}: {e}")
            return error_result

    def get_index_status(self) -> Dict[str, Any]:
        """
        Get the status of the index
        """
        collection_info = self.qdrant_service.get_collection_info()

        if collection_info:
            return {
                "collection_name": self.qdrant_service.collection_name,
                "vector_size": collection_info["vector_size"],
                "distance": collection_info["distance"],
                "point_count": collection_info["point_count"],
                "status": "ready"
            }
        else:
            return {
                "collection_name": self.qdrant_service.collection_name,
                "status": "error",
                "message": "Could not retrieve collection information"
            }

# Example usage
if __name__ == "__main__":
    service = IndexingService()

    # Example: Index a sample document (this would require an actual file)
    # result = service.index_document("sample_book.md")
    # print(result)

    # Example: Index text content
    sample_text = """
    This is a sample text that would normally come from a book.
    It contains multiple sentences and paragraphs that would be
    processed by our RAG system to answer user questions.
    """
    result = service.index_text_content(sample_text, "sample_content", {"category": "example"})
    print(f"Indexing result: {result['message']}")