# Uploading Book Content to Qdrant Vector Database

This document provides instructions for uploading all markdown files from the `frontend/docs` directory to the Qdrant vector database.

## Prerequisites

1. **Python 3.8+** installed on your system
2. **Docker** installed (for running Qdrant locally)
3. Required Python packages installed (see `backend/requirements.txt`)

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Qdrant Vector Database

You have two options:

#### Option A: Local Qdrant (Recommended for development)

Run the following command to start Qdrant in a Docker container:

```bash
# On Windows
start_qdrant.bat

# On Linux/Mac
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant
```

Wait about 10 seconds for Qdrant to start, then proceed to the upload step.

#### Option B: Cloud Qdrant

If you have a Qdrant Cloud account, update the configuration in `backend/src/.env` with your endpoint details.

## Configuration

The application uses configuration from `backend/src/.env`. For local development, you can use the provided `.env.local` file:

- `QDRANT_URL=http://localhost:6333` (for local instance)
- `QDRANT_API_KEY=` (empty for local instance)
- `QDRANT_COLLECTION_NAME=book_content`

## Running the Upload

### 1. Execute the Upload Script

```bash
python backend/upload_docs.py
```

This will:
- Scan the `frontend/docs` directory recursively
- Process each markdown file
- Generate embeddings using the configured model
- Store the content in Qdrant with metadata

### 2. Alternative: Use the API

Start the API server:

```bash
cd backend
uvicorn src.main:app --reload
```

Then make a POST request to:
```
POST http://localhost:8000/api/docs/upload-all
```

Additional API endpoints:
- `GET /api/docs/upload-status` - Check upload progress
- `GET /api/docs/verify-upload` - Verify upload completion
- `POST /api/docs/resume-upload` - Resume interrupted upload

## What Happens During Upload

1. **Scanning**: All `.md` files in `frontend/docs` and subdirectories are discovered
2. **Extraction**: Content is extracted from each markdown file
3. **Chunking**: Large documents are split into smaller chunks for better embedding
4. **Embedding**: Each chunk is converted to a vector representation
5. **Storage**: Vectors are stored in Qdrant with original content and metadata

## Progress Tracking

The upload process provides real-time progress updates:
- Number of files processed vs. total
- Current file being processed
- Percentage completion
- Processing time statistics

## Verification

After upload completes, you can verify all content was uploaded using:
```bash
python backend/upload_docs.py
```

Or via the API endpoint: `GET /api/docs/verify-upload`

## Troubleshooting

### Common Issues

1. **Connection Error**: Make sure Qdrant is running and accessible
2. **Memory Issues**: Reduce batch size in the upload configuration
3. **Slow Processing**: Check your embedding model and network connection

### Check Logs

Check the application logs in `backend/app.log` for detailed error information.

## API Documentation

Once the server is running, API documentation is available at:
- `http://localhost:8000/docs` - Interactive API documentation
- `http://localhost:8000/redoc` - Alternative API documentation