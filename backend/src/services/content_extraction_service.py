
import logging
from typing import Dict, Any
from pathlib import Path
import markdown
from PyPDF2 import PdfReader

from src.services.chunking_service import ChunkingService

logger = logging.getLogger(__name__)

class ContentExtractionService:
    def __init__(self):
        self.chunking_service = ChunkingService()

    def extract_from_file(self, file_path: str) -> Dict[str, Any]:
        """
        Extract content from various file types
        """
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        file_extension = file_path.suffix.lower()

        if file_extension == '.pdf':
            return self._extract_from_pdf(file_path)
        elif file_extension == '.md':
            return self._extract_from_markdown(file_path)
        elif file_extension == '.txt':
            return self._extract_from_txt(file_path)
        elif file_extension in ['.doc', '.docx']:
            return self._extract_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

    def _extract_from_pdf(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract content from PDF file
        """
        try:
            pdf_reader = PdfReader(str(file_path))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

            return {
                "text": text,
                "page_count": len(pdf_reader.pages),
                "word_count": len(text.split()),
                "file_size": file_path.stat().st_size
            }
        except Exception as e:
            logger.error(f"Error extracting content from PDF {file_path}: {e}")
            raise

    def _extract_from_markdown(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract content from Markdown file
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            # Convert markdown to plain text by removing markdown syntax
            # For now, we'll just return the raw content, but we could use
            # markdown libraries to convert to plain text if needed
            html_content = markdown.markdown(content)

            # Simple approach to get plain text from HTML
            import re
            plain_text = re.sub('<[^<]+?>', '', html_content)

            return {
                "text": content,  # Return original markdown content
                "word_count": len(content.split()),
                "file_size": file_path.stat().st_size
            }
        except Exception as e:
            logger.error(f"Error extracting content from Markdown {file_path}: {e}")
            raise

    def _extract_from_txt(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract content from TXT file
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            return {
                "text": content,
                "word_count": len(content.split()),
                "file_size": file_path.stat().st_size
            }
        except Exception as e:
            logger.error(f"Error extracting content from TXT {file_path}: {e}")
            raise


    
    def extract_from_directory(self, directory_path: str, recursive: bool = True) -> Dict[str, Any]:
        """
        Extract content from all supported files in a directory
        """
        directory = Path(directory_path)
        if not directory.exists() or not directory.is_dir():
            raise ValueError(f"Directory not found: {directory_path}")

        results = {
            "directory": str(directory),
            "extracted_files": [],
            "total_text_length": 0,
            "file_count": 0
        }

        # Define supported file extensions
        supported_extensions = {'.pdf', '.md', '.txt', '.docx'}

        # Get all files in directory
        if recursive:
            files = directory.rglob('*.*')
        else:
            files = directory.glob('*.*')

        for file_path in files:
            if file_path.suffix.lower() in supported_extensions:
                try:
                    extraction_result = self.extract_from_file(file_path)
                    extraction_result["source_file"] = str(file_path)
                    results["extracted_files"].append(extraction_result)
                    results["total_text_length"] += len(extraction_result["text"])
                    results["file_count"] += 1
                except Exception as e:
                    logger.warning(f"Failed to extract content from {file_path}: {e}")
                    continue

        return results

    def process_book_content(self, source_path: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> Dict[str, Any]:
        """
        Process book content by extracting and chunking it
        """
        # Extract content from the source
        extraction_result = self.extract_from_file(source_path)

        # Prepare metadata
        metadata = {
            "source_path": source_path,
            "file_size": extraction_result.get("file_size"),
            "page_count": extraction_result.get("page_count"),
            "word_count": extraction_result.get("word_count")
        }

        # Chunk the extracted text
        chunks = self.chunking_service.chunk_text(
            text=extraction_result["text"],
            source=source_path,
            metadata=metadata
        )

        return {
            "source_path": source_path,
            "extracted_text_length": len(extraction_result["text"]),
            "total_chunks": len(chunks),
            "chunks": chunks,
            "extraction_metadata": extraction_result,
            "chunking_params": {
                "chunk_size": chunk_size,
                "chunk_overlap": chunk_overlap
            }
        }

# Example usage
if __name__ == "__main__":
    service = ContentExtractionService()

    # Example: Process a book file (this would be a sample file)
    # result = service.process_book_content("sample_book.md")
    # print(f"Processed {result['total_chunks']} chunks from the book")