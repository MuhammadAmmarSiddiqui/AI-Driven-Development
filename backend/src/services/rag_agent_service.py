import logging
from typing import Dict, Any, List, Optional
from .agent_service import AgentService
from .retrieval_service import RetrievalService
from .indexing_service import IndexingService
from ..models.query_model import UserQuery, ChatResponse
import time

logger = logging.getLogger(__name__)

class RAGAgentService:
    def __init__(self):
        self.agent_service = AgentService()
        self.retrieval_service = RetrievalService()
        self.indexing_service = IndexingService()

    async def answer_query(self, query: str, top_k: int = 5, include_sources: bool = True) -> ChatResponse:
        """
        Answer a user query using RAG (Retrieval-Augmented Generation)
        """
        start_time = time.time()

        try:
            # Retrieve relevant context - FIXED: Added 'await' since retrieve_relevant_content is async
            retrieval_result = await self.retrieval_service.retrieve_relevant_content(
                query=query,
                top_k=top_k
            )

            if not retrieval_result["success"]:
                # If retrieval fails, generate response without context
                response = self.agent_service.generate_response(query)
                sources = []
            else:
                # Generate response with retrieved context - FIXED: Added 'await' since generate_response_with_guardrails is async
                retrieved_contexts = retrieval_result["contexts"]
                response = await self.agent_service.generate_response_with_guardrails(
                    user_query=query,
                    retrieved_context=retrieved_contexts
                )
                sources = retrieved_contexts if include_sources else []

            processing_time = time.time() - start_time

            chat_response = ChatResponse(
                response=response,
                query=query,
                sources=sources,
                response_time=processing_time,
                success=True
            )

            logger.info(f"Answered query in {processing_time:.2f}s")
            return chat_response

        except Exception as e:
            processing_time = time.time() - start_time
            error_response = ChatResponse(
                response="Sorry, I encountered an error while processing your request.",
                query=query,
                sources=[],
                response_time=processing_time,
                success=False
            )
            logger.error(f"Error answering query '{query}': {e}")
            return error_response

    async def answer_contextual_query(self, query: str, selected_text: str = None, top_k: int = 5) -> ChatResponse:
        """
        Answer a query with priority given to selected text if provided
        """
        start_time = time.time()

        try:
            # Retrieve relevant context
            retrieval_result = await self.retrieval_service.retrieve_relevant_content(
                query=query,
                top_k=top_k
            )

            contexts = []
            if retrieval_result["success"]:
                contexts = retrieval_result["contexts"]

            # If selected text is provided, add it to contexts with higher priority
            if selected_text:
                # Add selected text as a high-priority context
                selected_context = {
                    "id": "selected_text",
                    "text": selected_text,
                    "source": "user_selection",
                    "score": 1.0,  # Highest possible score
                    "chunk_id": "selected_chunk",
                    "relevance": 1.0
                }
                contexts.insert(0, selected_context)  # Insert at beginning for priority

            # Generate response with contexts
            response = await self.agent_service.generate_response_with_guardrails(
                user_query=query,
                retrieved_context=contexts
            )

            processing_time = time.time() - start_time

            chat_response = ChatResponse(
                response=response,
                query=query,
                sources=contexts,
                response_time=processing_time,
                success=True
            )

            logger.info(f"Answered contextual query in {processing_time:.2f}s")
            return chat_response

        except Exception as e:
            processing_time = time.time() - start_time
            error_response = ChatResponse(
                response="Sorry, I encountered an error while processing your request.",
                query=query,
                sources=[],
                response_time=processing_time,
                success=False
            )
            logger.error(f"Error answering contextual query '{query}': {e}")
            return error_response

    def validate_answer(self, query: str, response: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate if the response is properly grounded in the provided context
        """
        try:
            # Simple validation: check if key terms from context appear in response
            context_text = " ".join([ctx.get("text", "") for ctx in context])
            response_lower = response.lower()
            context_lower = context_text.lower()

            # Count how many context terms appear in the response
            context_words = set(context_lower.split())
            response_words = set(response_lower.split())
            overlap = len(context_words.intersection(response_words))
            total_context_words = len(context_words)

            validation_score = overlap / total_context_words if total_context_words > 0 else 0

            return {
                "query": query,
                "is_valid": validation_score > 0.1,  # Threshold: 10% overlap
                "validation_score": validation_score,
                "overlap_count": overlap,
                "context_word_count": total_context_words,
                "message": f"Response validation passed: {validation_score:.2%} context overlap"
            }
        except Exception as e:
            logger.error(f"Error validating answer: {e}")
            return {
                "query": query,
                "is_valid": False,
                "validation_score": 0,
                "error": str(e),
                "message": "Validation failed due to error"
            }

    def check_index_status(self) -> Dict[str, Any]:
        """
        Check the status of the index to ensure RAG can function properly
        """
        try:
            status = self.retrieval_service.validate_index_availability()
            return {
                "index_available": status,
                "service": "RAG Agent",
                "status": "ready" if status else "index_not_available"
            }
        except Exception as e:
            logger.error(f"Error checking index status: {e}")
            return {
                "index_available": False,
                "service": "RAG Agent",
                "status": "error",
                "error": str(e)
            }

    def get_conversation_context(self, session_id: str = None) -> List[Dict[str, str]]:
        """
        Get conversation context for a session (placeholder implementation)
        In a real implementation, this would retrieve from a database or memory store
        """
        # Placeholder - in a real implementation, this would fetch from session storage
        return []

# Example usage
if __name__ == "__main__":
    rag_service = RAGAgentService()

    # Check if index is available
    status = rag_service.check_index_status()
    print(f"Index status: {status}")

    if status["index_available"]:
        # Example: Answer a query
        response = rag_service.answer_query("What is machine learning?")
        print(f"Response: {response.response}")
        print(f"Sources: {len(response.sources)}")
    else:
        print("Index is not available - please index some content first")