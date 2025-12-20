from typing import List, Dict, Any
import logging
import hashlib
from langchain_text_splitters import RecursiveCharacterTextSplitter
import uuid

logger = logging.getLogger(__name__)

class ChunkingService:
    def __init__(self,
                 chunk_size: int = 1000,
                 chunk_overlap: int = 200,
                 separators: List[str] = None):
        """
        Initialize the Chunking Service with configurable parameters
        """
        if separators is None:
            separators = ["\n\n", "\n", " ", ""]

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            is_separator_regex=False,
            separators=separators
        )

    def chunk_text(self, text: str, source: str = "", metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Split text into chunks using RecursiveCharacterTextSplitter
        """
        if not text:
            return []

        # Split the text into chunks
        split_texts = self.text_splitter.split_text(text)

        # Create chunk objects with metadata
        chunks = []
        for i, chunk_text in enumerate(split_texts):
            # Generate a valid Qdrant point ID (must be an integer or UUID)
            # We'll use a combination of a hash of the source and chunk index converted to int
            source_hash = hashlib.md5(str(source).encode('utf-8')).hexdigest()
            # Take first 8 hex characters and convert to integer
            hash_int = int(source_hash[:8], 16)
            # Combine with chunk index to ensure uniqueness
            chunk_id = hash_int + i

            chunk = {
                "id": chunk_id,
                "text": chunk_text,
                "source": source,
                "metadata": metadata or {},
                "chunk_id": f"chunk_{i}",
                "length": len(chunk_text)
            }
            chunks.append(chunk)

        logger.info(f"Split text from {source} into {len(chunks)} chunks")
        return chunks

    def chunk_multiple_texts(self,
                           texts: List[Dict[str, Any]],
                           source_key: str = "source",
                           text_key: str = "text") -> List[Dict[str, Any]]:
        """
        Process multiple text sources and return all chunks
        Each input text should be a dict with 'source' and 'text' keys
        """
        all_chunks = []
        for text_obj in texts:
            source = text_obj.get(source_key, "")
            text = text_obj.get(text_key, "")
            metadata = text_obj.get("metadata", {})

            chunks = self.chunk_text(text, source, metadata)
            all_chunks.extend(chunks)

        return all_chunks

    def update_chunking_parameters(self,
                                 chunk_size: int = None,
                                 chunk_overlap: int = None,
                                 separators: List[str] = None):
        """
        Update the chunking parameters
        """
        current_params = self.text_splitter._separators if hasattr(self.text_splitter, '_separators') else ["\n\n", "\n", " ", ""]

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size or self.text_splitter._chunk_size,
            chunk_overlap=chunk_overlap or self.text_splitter._chunk_overlap,
            length_function=self.text_splitter._length_function,
            is_separator_regex=self.text_splitter._is_separator_regex,
            separators=separators or current_params
        )

# Example usage
if __name__ == "__main__":
    # Initialize the service
    chunking_service = ChunkingService(chunk_size=500, chunk_overlap=100)

    # Example text to chunk
    sample_text = """
    Machine learning is a method of data analysis that automates analytical model building.
    It is a branch of artificial intelligence based on the idea that systems can learn from data,
    identify patterns and make decisions with minimal human intervention.

    Machine learning algorithms build a model based on sample data, known as training data,
    in order to make predictions or decisions without being explicitly programmed to do so.
    Machine learning algorithms are used in a wide variety of applications, such as in medicine,
    email filtering, speech recognition, and computer vision, where it is difficult or unfeasible
    to develop conventional algorithms to perform the needed tasks.

    Deep learning is part of a broader family of machine learning methods based on artificial neural networks
    with representation learning. Learning can be supervised, semi-supervised or unsupervised.
    """

    # Chunk the text
    chunks = chunking_service.chunk_text(sample_text, source="sample_document.md")

    print(f"Created {len(chunks)} chunks:")
    for i, chunk in enumerate(chunks):
        print(f"Chunk {i+1}: {len(chunk['text'])} characters")
        print(f"  Content preview: {chunk['text'][:100]}...")
        print()