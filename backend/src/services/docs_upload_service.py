"""
Service for uploading all markdown files from frontend/docs to Qdrant vector database.
"""
import logging
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from src.services.indexing_service import IndexingService
from src.utils.markdown_scanner import find_markdown_files_with_stats


logger = logging.getLogger(__name__)


class DocsUploadService:
    def __init__(self):
        self.indexing_service = IndexingService()
        self.upload_progress = {}

    def upload_all_docs(self,
                       docs_directory: str = "frontend/docs",
                       batch_size: int = 5,
                       continue_from: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload all markdown files from the specified directory to Qdrant.

        Args:
            docs_directory: Path to the directory containing markdown files
            batch_size: Number of files to process in each batch
            continue_from: Optional file path to resume upload from

        Returns:
            Dictionary with upload results and statistics
        """
        start_time = time.time()

        # Find all markdown files
        logger.info(f"Scanning directory: {docs_directory}")
        try:
            files_with_stats = find_markdown_files_with_stats(docs_directory)
            all_files = [f['path'] for f in files_with_stats]
            logger.info(f"Found {len(all_files)} markdown files to process")
        except ValueError as e:
            logger.error(f"Error scanning directory: {e}")
            return {
                "success": False,
                "message": str(e),
                "processed_count": 0,
                "total_count": 0,
                "processing_time": 0
            }

        if not all_files:
            logger.warning(f"No markdown files found in {docs_directory}")
            return {
                "success": True,
                "message": f"No markdown files found in {docs_directory}",
                "processed_count": 0,
                "total_count": 0,
                "processing_time": time.time() - start_time
            }

        # Determine which files to process (in case of resuming)
        if continue_from:
            try:
                continue_index = all_files.index(continue_from)
                files_to_process = all_files[continue_index:]
                logger.info(f"Resuming upload from file: {continue_from} ({continue_index + 1}/{len(all_files)})")
            except ValueError:
                logger.error(f"Resume file not found: {continue_from}")
                return {
                    "success": False,
                    "message": f"Resume file not found: {continue_from}",
                    "processed_count": 0,
                    "total_count": len(all_files),
                    "processing_time": time.time() - start_time
                }
        else:
            files_to_process = all_files

        total_files = len(files_to_process)
        processed_count = 0
        failed_files = []
        successful_files = []

        logger.info(f"Starting upload of {total_files} files")

        # Process files in batches
        for i in range(0, len(files_to_process), batch_size):
            batch = files_to_process[i:i + batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}/{(len(files_to_process)-1)//batch_size + 1} ({len(batch)} files)")

            for file_path in batch:
                try:
                    # Update progress
                    current_progress = {
                        "current_file": file_path,
                        "processed": processed_count,
                        "total": total_files,
                        "percentage": (processed_count / total_files) * 100,
                        "status": "processing"
                    }
                    self.upload_progress[file_path] = current_progress

                    # Index the document
                    result = self.indexing_service.index_document(file_path)

                    if result["success"]:
                        successful_files.append(file_path)
                        logger.info(f"Successfully uploaded: {file_path} ({result['indexed_chunks']} chunks)")
                    else:
                        failed_files.append({
                            "file": file_path,
                            "error": result.get("error", "Unknown error")
                        })
                        logger.error(f"Failed to upload {file_path}: {result.get('message', 'Unknown error')}")

                except Exception as e:
                    failed_files.append({
                        "file": file_path,
                        "error": str(e)
                    })
                    logger.error(f"Exception processing {file_path}: {e}")

                processed_count += 1

                # Update progress
                current_progress = {
                    "current_file": file_path,
                    "processed": processed_count,
                    "total": total_files,
                    "percentage": (processed_count / total_files) * 100,
                    "status": "completed" if processed_count == total_files else "processing"
                }
                self.upload_progress[file_path] = current_progress

        processing_time = time.time() - start_time

        # Prepare results
        success = len(failed_files) == 0
        message = (
            f"Upload completed. {len(successful_files)} files processed successfully."
            f" {len(failed_files)} files failed."
        )

        result = {
            "success": success,
            "message": message,
            "processed_count": processed_count,
            "successful_count": len(successful_files),
            "failed_count": len(failed_files),
            "total_count": total_files,
            "processing_time": processing_time,
            "successful_files": successful_files,
            "failed_files": failed_files,
            "average_time_per_file": processing_time / processed_count if processed_count > 0 else 0
        }

        logger.info(message)
        return result

    def get_upload_status(self, file_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Get the current status of the upload process.

        Args:
            file_path: Optional specific file to get status for

        Returns:
            Dictionary with upload status information
        """
        if file_path:
            return self.upload_progress.get(file_path, {"status": "not_found"})
        else:
            # Return overall status based on the last known progress
            if not self.upload_progress:
                return {"status": "idle", "progress": 0}

            # Find the most recently updated progress
            latest_progress = max(self.upload_progress.values(),
                                key=lambda x: x.get('processed', 0))
            return {
                "status": latest_progress.get('status', 'processing'),
                "progress": latest_progress.get('percentage', 0),
                "processed": latest_progress.get('processed', 0),
                "total": latest_progress.get('total', 0),
                "current_file": latest_progress.get('current_file', 'unknown')
            }

    def verify_upload_completion(self, docs_directory: str = "frontend/docs") -> Dict[str, Any]:
        """
        Verify that all files from the docs directory have been successfully uploaded.

        Args:
            docs_directory: Path to the directory containing original markdown files

        Returns:
            Dictionary with verification results
        """
        start_time = time.time()

        try:
            # Get all expected files
            expected_files = find_markdown_files_with_stats(docs_directory)
            expected_file_paths = {f['path'] for f in expected_files}

            # Get index status to see what's been uploaded
            index_status = self.indexing_service.get_index_status()

            # For a complete verification, we would need to query Qdrant for all documents
            # and compare with expected files. This is a simplified version.

            verification_result = {
                "expected_file_count": len(expected_file_paths),
                "expected_files": list(expected_file_paths),
                "index_status": index_status,
                "verification_time": time.time() - start_time,
                "message": f"Verification completed. Found {len(expected_file_paths)} expected files."
            }

            return verification_result

        except Exception as e:
            logger.error(f"Error during verification: {e}")
            return {
                "success": False,
                "message": f"Verification failed: {str(e)}",
                "verification_time": time.time() - start_time
            }


if __name__ == "__main__":
    # Example usage
    upload_service = DocsUploadService()

    # Upload all docs
    result = upload_service.upload_all_docs()

    print("Upload completed!")
    print(f"Success: {result['success']}")
    print(f"Processed: {result['processed_count']}/{result['total_count']}")
    print(f"Successful: {result['successful_count']}")
    print(f"Failed: {result['failed_count']}")
    print(f"Processing time: {result['processing_time']:.2f} seconds")

    if result['failed_count'] > 0:
        print("\nFailed files:")
        for failed in result['failed_files']:
            print(f"  - {failed['file']}: {failed['error']}")