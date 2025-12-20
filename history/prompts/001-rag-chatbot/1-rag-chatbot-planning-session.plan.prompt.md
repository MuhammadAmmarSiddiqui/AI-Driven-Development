---
id: 1
title: rag-chatbot-planning-session
stage: plan
date: 2025-12-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-rag-chatbot
branch: 001-rag-chatbot
user: user2
command: /sp.plan
labels: [planning,rag,chatbot,architecture]
links:
  spec: specs/001-rag-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-rag-chatbot/plan.md
 - specs/001-rag-chatbot/research.md
 - specs/001-rag-chatbot/data-model.md
 - specs/001-rag-chatbot/quickstart.md
 - specs/001-rag-chatbot/contracts/rag-chatbot-api.yaml
tests:
 - null
---

## Prompt

```
/sp.plan

## Project: AI/Spec-Driven Book RAG Chatbot Integration - Execution Plan

**Objective:** Implement the RAG Chatbot, integrating the FastAPI backend (Qdrant, OpenAI Agents) with the Docusaurus book deployed on GitHub Pages.

**Execution Order:** Proceed through the following phases and tasks sequentially. Focus on one task at a time verlap: 50 tokens**. | DPI.1, DPI.2 | PENDING |
| **P1.5** | **Embedding and Indexing:** Run the script to generate embeddings and upload all book content in frontend/docs in markdown files in chunks to the Qdrant collection using mcp server if available. **Validation:** Query Qdrant to confirm all book content is successfully indexed (DPI.5). | DPI.3, DPI.5 | PENDING |

---

### 💻 Phase 2: RAG Band confirm successful completion before moving to the next.

---

###  Phase 1: Data Pipeline and Vector Indexing Setup (DPI.1 - DPI.5)

| Task ID | Description | Spec Reference | Status |
| :--- | :--- | :--- | :--- |
| **P1.1** | **Use Context7 MCP**: Use Context7 MCP server for Qdrant and Qdrant MCP Server for docs and info required for implementation.
| **P1.2** | **Configure Qdrant Cloud:** Create the Qdrant Cloud Free Tier collection. Define the Vector Dimension based on the chosen embedding model (e.g., sentence-transformers/all-MiniLM-L6-v2`) using the mcp server if available. | DPI.4 | PENDING |
| **P1.3** | **Install Data Processing Dependencies:** Install Python libraries: `qdrant-client`, `langchain`, and the chosen embedding model library (e.g., `sentence-transformers/all-MiniLM-L6-v2`). | DPI.3 | PENDING |
| **P1.4** | **Data Extraction and Chunking Script:** Write a Python script to read Markdown/HTML from the Docusaurus build output. Use the **Recursive Character Text Splitter** with **Chunk ackend Service Development (RBS.1 - RBS.6, DEP.3)

| Task ID | Description | Spec Reference | Status |
| :--- | :--- | :--- | :--- |
| **P2.1** | **FastAPI Setup and Dependencies:** Initialize the backend project by creating a separate backend/ directory.. Install `fastapi`, `uvicorn`, `qdrant-client`, and the **OpenAI Agents SDK/ChatKit Python SDK**.Use Context7 MCP Server for docs and info required for implementation. Configure API keys/secrets as environment variables, ask if needed. | RBS.1, RBS.5 | PENDING |
| **P2.2** | **Implement General Chat Endpoint:** Create the **`POST /api/chat`** endpoint. Implement the core RAG logic: Query embedding -> Qdrant retrieval (top k=5) -> Use the OpenAI Agent with the **Guardrail System Prompt** to enforce answers are *strictly* based on retrieved context. | RBS.2, RBS.4, RBS.5, RBS.6 | PENDING |
| **P2.3** | **Implement Contextual Chat Endpoint:** Create the **`POST /api/selection-chat`** endpoint. Modify the RAG logic to prioritize the `selected_text` by including it as primary context for the LLM Agent. | RBS.3 | PENDING |
| **P2.4** | **CORS Configuration:** Configure CORS middleware in FastAPI to allow calls from the Docusaurus deployment's GitHub Pages URL (DEP.3). | DEP.3 | PENDING |
| **P2.5** | **Local Testing:** Test both endpoints locally to verify accurate RAG retrieval and generation against the book content (DEP.1). | DEP.1 | PENDING |

---

### 🌐 Phase 3: Frontend Integration and Deployment (FES.1 - FES.5, DEP.2)

| Task ID | Description | Spec Reference | Status |
| :--- | :--- | :--- | :--- |
| **P3.1** | **Backend Deployment:** Deploy the finalized FastAPI service (P2.5) to the specified target platform (DEP.2). Record the Base URL (FES.2). | DEP.2, FES.2 | PENDING |
| **P3.2** | **Chatbot UI Component Creation:** Develop the Docusaurus/React component (`RAGChatbot.js`). Use the **ChatKit.js client-side library** for chat state and communication and use Context7 MCP to get its info and docs for implementation (FES.1, FES.5). | FES.1, FES.5 | PENDING |
| **P3.3** | **Text Selection Capture Logic:** Implement JavaScript logic (`window.getSelection()`) to capture selected text. Add UI logic to enable the 'Contextual Mode' flag (FES.3, FES.4). | FES.3, FES.4 | PENDING |
| **P3.4** | **API Communication Integration:** Connect the frontend component to the deployed FastAPI endpoints, using `/api/selection-chat` when the 'Contextual Mode' is active (FES.2, FES.4). | FES.2, FES.4 | PENDING |
| **P3.5** | **End-to-End Testing:** Deploy the updated Docusaurus site to GitHub Pages. Perform final end-to-end testing (DEP.1), verifying both general and contextual Q&A are correctly answered from the book content. | DEP.1 | Use the spec.md file in 001-rag-chatbot directory
```

## Response snapshot

Completed the planning phase for the AI/Spec-Driven Book RAG Chatbot Integration. Created the following artifacts:

1. **plan.md** - Implementation plan with technical context, constitution check, and project structure
2. **research.md** - Research summary with technology decisions and rationale for Qdrant, Google Gemini 2.5 Flash, RecursiveCharacterTextSplitter, and frontend integration approach
3. **data-model.md** - Data model defining entities (Book Content Chunk, User Query, Retrieved Context, Chat Response) and their relationships
4. **contracts/rag-chatbot-api.yaml** - API contract specification for the RAG chatbot service with endpoints for general chat, contextual chat, health check, and index status
5. **quickstart.md** - Quickstart guide with setup instructions for backend and frontend, environment variables, and API usage examples

The plan addresses all functional requirements from the spec, including both general and contextual chat capabilities, content indexing, and proper error handling. The architecture uses FastAPI backend with Qdrant vector database and integrates with Docusaurus frontend.

## Outcome

- ✅ Impact: Complete implementation plan with all required artifacts created for RAG chatbot development
- 🧪 Tests: N/A - Planning phase completed
- 📁 Files: 5 files created (plan.md, research.md, data-model.md, quickstart.md, contracts/rag-chatbot-api.yaml)
- 🔁 Next prompts: /sp.tasks to generate implementation tasks, then implementation phase
- 🧠 Reflection: Planning phase successfully completed with all required artifacts generated according to the template

## Evaluation notes (flywheel)

- Failure modes observed: None - all planning phases completed successfully
- Graders run and results (PASS/FAIL): PASS - All constitutional requirements satisfied
- Prompt variant (if applicable): Standard /sp.plan command
- Next experiment (smallest change to try): Execute /sp.tasks to generate implementation tasks