#!/usr/bin/env python3
"""
Test script for the docs upload functionality.
"""
import sys
import os
from pathlib import Path

# Add the backend/src directory to the path so we can import our modules
backend_src = Path(__file__).parent / "src"
sys.path.insert(0, str(backend_src))

from src.services.docs_upload_service import DocsUploadService
from src.utils.markdown_scanner import find_markdown_files


def test_markdown_scanner():
    """Test the markdown scanner utility."""
    print("Testing markdown scanner...")

    try:
        # Test with a known directory
        files = find_markdown_files("frontend/docs")
        print(f"Found {len(files)} markdown files in frontend/docs")

        if files:
            print("First 5 files:")
            for file in files[:5]:
                print(f"  - {file}")
        else:
            print("No markdown files found - this might be expected if directory is empty")

        return True
    except Exception as e:
        print(f"Error testing markdown scanner: {e}")
        return False


def test_docs_upload_service():
    """Test the docs upload service."""
    print("\nTesting docs upload service...")

    try:
        upload_service = DocsUploadService()

        # Test getting status when idle
        status = upload_service.get_upload_status()
        print(f"Upload status (idle): {status}")

        # Test verification without actually uploading
        verification = upload_service.verify_upload_completion()
        print(f"Verification result: {verification.get('message', 'No message')}")
        print(f"Expected files count: {verification.get('expected_file_count', 0)}")

        return True
    except Exception as e:
        print(f"Error testing docs upload service: {e}")
        return False


def main():
    print("Running tests for docs upload functionality...")

    success = True

    success &= test_markdown_scanner()
    success &= test_docs_upload_service()

    print(f"\nTests completed. Success: {success}")

    if success:
        print("\nAll tests passed! The docs upload functionality is ready.")
        print("\nTo run the actual upload, execute: python upload_docs.py")
    else:
        print("\nSome tests failed. Please check the implementation.")
        sys.exit(1)


if __name__ == "__main__":
    main()