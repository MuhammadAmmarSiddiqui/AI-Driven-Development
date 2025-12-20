# Quick Start Guide: Book RAG Chatbot

This guide will help you set up and run the Book RAG Chatbot application.

## Prerequisites

- Python 3.8+
- Node.js 16+ (for frontend development)
- Qdrant vector database
- Google Gemini API key

## Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key-here
QDRANT_COLLECTION_NAME=book_content

# Google Gemini Configuration
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-2.0-flash

# Application Configuration
APP_NAME=Book RAG Chatbot API
APP_VERSION=1.0.0
DEBUG=true

# Server Configuration
HOST=0.0.0.0
PORT=8000

# CORS Configuration for GitHub Pages
FRONTEND_URL=https://your-username.github.io
GITHUB_USERNAME=your-username

# Model and Processing Configuration
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Database Configuration
DATABASE_URL=sqlite:///./rag_chatbot.db

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=app.log
```

### 3. Start the Backend Server

```bash
cd backend/src
python -m uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`.

## Frontend Setup

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Run the Development Server

```bash
cd frontend
npm start
```

The Docusaurus site will be available at `http://localhost:3000`.

## Using the Chatbot

### 1. Index Book Content

Before asking questions, you need to index book content into the vector database:

```bash
# Example API call to index a document
curl -X POST "http://localhost:8000/api/index" \
  -H "Content-Type: application/json" \
  -d '{
    "source_path": "/path/to/your/book.pdf",
    "metadata": {
      "title": "Your Book Title",
      "author": "Author Name"
    }
  }'
```

### 2. Ask Questions

#### General Questions

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main concept discussed in the book?",
    "include_sources": true
  }'
```

#### Contextual Questions

```bash
curl -X POST "http://localhost:8000/api/selection-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain this concept in more detail?",
    "selected_text": "The concept of machine learning is based on algorithms that can learn from data.",
    "include_sources": true
  }'
```

## Integrating the Chatbot in Docusaurus

To add the chatbot to your Docusaurus pages:

```jsx
import RAGChatbot from '@site/src/components/RAGChatbot/RAGChatbotWrapper';

<RAGChatbot initialMode="general" apiEndpoint="/api" />
```

## API Endpoints

- `GET /api/health` - Check API health
- `POST /api/chat` - General chat endpoint
- `POST /api/selection-chat` - Contextual chat with selected text
- `POST /api/index` - Index a document
- `POST /api/retrieve` - Retrieve relevant content
- `GET /api/index-status` - Get indexing status

## Troubleshooting

1. **API Key Issues**: Make sure your Google Gemini API key is correctly set in the environment variables.

2. **Qdrant Connection**: Ensure Qdrant is running and accessible at the configured URL.

3. **CORS Errors**: If running the frontend separately, make sure the backend CORS settings allow your frontend domain.

4. **Indexing Issues**: Check that the file paths are accessible to the backend server.

## Deployment

The application is configured for GitHub Pages deployment. The workflow in `.github/workflows/deploy.yml` will build and deploy the Docusaurus frontend automatically when changes are pushed to the main branch.