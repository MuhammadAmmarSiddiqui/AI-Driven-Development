# Quickstart Guide: AI/Spec-Driven Book RAG Chatbot

## Documentation Access Requirement
All implementation documentation for FastAPI, OpenAI Agents SDK, ChatKit.js, embedding model, Qdrant, and Qdrant MCP server MUST be accessed using the context7 MCP server during development.

## Overview
This guide provides quick setup instructions for the RAG Chatbot that allows users to ask questions about book content and receive accurate answers based on the book's information.

## Prerequisites
- Python 3.11+
- Node.js 16+ (for frontend development)
- Access to Google Gemini API (for LLM)
- Qdrant Cloud account (or local Qdrant instance)

## Backend Setup

### 1. Environment Setup
```bash
# Create and navigate to backend directory
mkdir backend && cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn qdrant-client langchain sentence-transformers google-generativeai python-dotenv
```

### 2. Environment Variables
Create a `.env` file in the backend directory:
```env
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
GOOGLE_API_KEY=your_google_api_key
QDRANT_COLLECTION_NAME=book_content_chunks
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
```

### 3. Run the Backend Service
```bash
# Start the FastAPI server
uvicorn src.main:app --reload --port 8000
```

## Frontend Integration

### 1. Install Dependencies
```bash
# In your Docusaurus project directory
npm install
```

### 2. Add the RAG Chatbot Component
The RAG chatbot component can be integrated into any Docusaurus page or as a layout component.

### 3. Configure CORS
The backend service must be configured to allow requests from your Docusaurus site's domain.

## Content Indexing

### 1. Prepare Book Content
Ensure your book content is available in the `frontend/docs` directory in Markdown format.

### 2. Run Indexing Script
```bash
python scripts/index-book-content.py
```

This script will:
- Read Markdown files from the Docusaurus docs directory
- Split content using RecursiveCharacterTextSplitter
- Generate embeddings using the specified model
- Upload chunks to Qdrant collection

## API Usage Examples

### General Chat
```javascript
fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'What are the key concepts in chapter 3?',
    context_mode: false,
    selected_text: ''
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Contextual Chat
```javascript
fetch('http://localhost:8000/api/selection-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'Explain this concept further',
    context_mode: true,
    selected_text: 'The concept of embodied AI combines...'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Testing
```bash
# Backend tests
pip install pytest
pytest tests/

# Frontend tests (if applicable)
npm test
```

## Deployment
1. Deploy the FastAPI backend to your preferred platform (e.g., Render, Railway, AWS, GCP)
2. Update the Docusaurus site with the deployed backend URL
3. Deploy the Docusaurus site to GitHub Pages