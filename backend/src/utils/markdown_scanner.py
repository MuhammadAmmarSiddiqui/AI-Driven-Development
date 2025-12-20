"""
Utility module for scanning directories and finding markdown files.
"""
import os
from pathlib import Path
from typing import List


def find_markdown_files(directory_path: str) -> List[str]:
    """
    Recursively scan a directory for all markdown files.

    Args:
        directory_path: Path to the directory to scan

    Returns:
        List of absolute file paths to markdown files
    """
    directory = Path(directory_path)
    if not directory.exists() or not directory.is_dir():
        raise ValueError(f"Directory not found: {directory_path}")

    markdown_files = []
    # Recursively find all .md files
    for file_path in directory.rglob('*.md'):
        if file_path.is_file():
            markdown_files.append(str(file_path.absolute()))

    return sorted(markdown_files)  # Return sorted list for consistent processing order


def find_markdown_files_with_stats(directory_path: str) -> List[dict]:
    """
    Recursively scan a directory for all markdown files with additional statistics.

    Args:
        directory_path: Path to the directory to scan

    Returns:
        List of dictionaries containing file path and statistics
    """
    directory = Path(directory_path)
    if not directory.exists() or not directory.is_dir():
        raise ValueError(f"Directory not found: {directory_path}")

    markdown_files = []
    for file_path in directory.rglob('*.md'):
        if file_path.is_file():
            stat = file_path.stat()
            file_info = {
                'path': str(file_path.absolute()),
                'size': stat.st_size,
                'modified': stat.st_mtime,
                'relative_path': str(file_path.relative_to(directory))
            }
            markdown_files.append(file_info)

    return sorted(markdown_files, key=lambda x: x['path'])  # Sort by path for consistent processing order


if __name__ == "__main__":
    # Example usage
    docs_dir = "frontend/docs"
    try:
        files = find_markdown_files(docs_dir)
        print(f"Found {len(files)} markdown files in {docs_dir}:")
        for file in files:
            print(f"  - {file}")
    except ValueError as e:
        print(f"Error: {e}")