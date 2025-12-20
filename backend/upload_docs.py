#!/usr/bin/env python3
"""
Script to upload all markdown documents from frontend/docs to Qdrant vector database.
"""
import asyncio
import sys
import os
from pathlib import Path

# Add the backend/src directory to the path so we can import our modules
backend_src = Path(__file__).parent / "src"
sys.path.insert(0, str(backend_src))

from src.services.docs_upload_service import DocsUploadService


def main():
    print("Starting upload of all markdown documents to Qdrant...")
    print("This may take several minutes depending on the number and size of documents.")

    # Create the upload service
    upload_service = DocsUploadService()

    # Perform the upload
    result = upload_service.upload_all_docs(
        docs_directory="frontend/docs",
        batch_size=5  # Process 5 files at a time to manage memory usage
    )

    # Print results
    print("\n" + "="*60)
    print("UPLOAD COMPLETED")
    print("="*60)
    print(f"Success: {result['success']}")
    print(f"Total files: {result['total_count']}")
    print(f"Processed: {result['processed_count']}")
    print(f"Successful: {result['successful_count']}")
    print(f"Failed: {result['failed_count']}")
    print(f"Processing time: {result['processing_time']:.2f} seconds")
    print(f"Average time per file: {result['average_time_per_file']:.2f} seconds")

    if result['failed_count'] > 0:
        print(f"\nFailed files:")
        for failed in result['failed_files']:
            print(f"  - {failed['file']}: {failed['error']}")

    # Verify the upload
    print(f"\nVerifying upload completion...")
    verification_result = upload_service.verify_upload_completion()
    print(f"Verification completed. Expected files: {verification_result['expected_file_count']}")
    print(f"Index status: {verification_result['index_status']}")

    print("\nProcess completed!")


if __name__ == "__main__":
    main()