---
description: "Task list for RAG Chatbot implementation"
---

# Tasks: AI/Spec-Driven Book RAG Chatbot Integration

**Input**: Design documents from `/specs/001-rag-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Backend**: `backend/src/models/`, `backend/src/services/`, `backend/src/api/`
- **Frontend**: `frontend/src/components/`, `frontend/src/services/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T000 [P] Access FastAPI documentation via context7 MCP server for implementation guidance
- [ ] T000.1 [P] Access OpenAI Agents SDK documentation via context7 MCP server for implementation guidance
- [ ] T000.2 [P] Access ChatKit.js documentation via context7 MCP server for implementation guidance
- [ ] T000.3 [P] Access embedding model documentation via context7 MCP server for implementation guidance
- [ ] T000.4 [P] Access Qdrant documentation via context7 MCP server for implementation guidance
- [ ] T000.5 [P] Access Qdrant MCP server documentation via context7 MCP server for implementation guidance
- [ ] T001 Create backend directory structure per implementation plan
- [ ] T002 Create frontend directory structure per implementation plan
- [ ] T003 [P] Initialize backend with FastAPI dependencies in backend/requirements.txt
- [ ] T004 [P] Initialize frontend with Docusaurus dependencies in frontend/package.json
- [ ] T005 [P] Configure linting and formatting tools for Python and JavaScript

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Setup Qdrant vector database connection in backend/src/services/qdrant_service.py
- [ ] T007 [P] Configure OpenAI Agents SDK with Google Gemini API integration in backend/src/services/agent_service.py
- [ ] T008 [P] Setup content chunking service using RecursiveCharacterTextSplitter in backend/src/services/chunking_service.py
- [ ] T009 [P] Create Book Content Chunk model in backend/src/models/chunk_model.py
- [ ] T009.1 [P] Create Agent Session model in backend/src/models/agent_session_model.py
- [ ] T009.2 [P] Create Agent Task model in backend/src/models/agent_task_model.py
- [ ] T010 Configure error handling and logging infrastructure in backend/src/utils/
- [ ] T011 Setup environment configuration management in backend/.env and backend/src/config.py
- [ ] T012 Setup CORS middleware for GitHub Pages in backend/src/main.py
- [ ] T013 Create basic API routing structure in backend/src/api/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 3 - Book Content Indexing and Retrieval (Priority: P1) 🎯 MVP

**Goal**: Index book content into Qdrant vector database so that RAG system can efficiently retrieve relevant information when users ask questions

**Independent Test**: Verify that book content is properly chunked, embedded, and stored in the vector database, and that relevant content can be retrieved based on search queries

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US3] Contract test for indexing functionality in backend/tests/contract/test_indexing.py
- [ ] T015 [P] [US3] Integration test for content retrieval in backend/tests/integration/test_retrieval.py

### Implementation for User Story 3

- [ ] T016 [P] [US3] Create content processing model in backend/src/models/content_model.py
- [ ] T017 [P] [US3] Create retrieved context model in backend/src/models/context_model.py
- [ ] T018 [US3] Implement content extraction from frontend/docs markdown files in backend/src/services/content_extraction_service.py
- [ ] T019 [US3] Implement embedding generation using sentence-transformers in backend/src/services/embedding_service.py
- [ ] T020 [US3] Implement Qdrant indexing logic in backend/src/services/indexing_service.py
- [ ] T020.1 [US3] Implement Qdrant vector database upload via MCP server for book content in backend/src/services/indexing_service.py
- [ ] T021 [US3] Implement content retrieval logic in backend/src/services/retrieval_service.py
- [ ] T022 [US3] Create indexing endpoint in backend/src/api/indexing_router.py
- [ ] T023 [US3] Create retrieval endpoint in backend/src/api/retrieval_router.py
- [ ] T024 [US3] Add validation and error handling for indexing operations
- [ ] T025 [US3] Add logging for indexing operations

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 4: User Story 1 - Basic Book Question Answering (Priority: P1)

**Goal**: Allow users to ask questions about book content and receive accurate answers based on the book's information, so they can quickly find relevant information without having to manually search through all the pages

**Independent Test**: Can be fully tested by asking various questions about book content and verifying that the system returns accurate, contextually relevant answers based on the book's information

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T026 [P] [US1] Contract test for /api/chat endpoint in backend/tests/contract/test_chat_endpoint.py
- [ ] T027 [P] [US1] Integration test for basic Q&A flow in backend/tests/integration/test_basic_qa.py

### Implementation for User Story 1

- [ ] T028 [P] [US1] Create User Query model in backend/src/models/query_model.py
- [ ] T029 [P] [US1] Create Chat Response model in backend/src/models/response_model.py
- [ ] T030 [US1] Implement Agent-based RAG logic service in backend/src/services/rag_agent_service.py
- [ ] T031 [US1] Implement general chat endpoint in backend/src/api/chat_router.py
- [ ] T032 [US1] Integrate Qdrant retrieval with OpenAI Agents SDK using Google Gemini in RAG service
- [ ] T033 [US1] Implement guardrail system prompt to enforce answers based on retrieved context
- [ ] T034 [US1] Add health check endpoint in backend/src/api/health_router.py
- [ ] T035 [US1] Add index status endpoint in backend/src/api/status_router.py
- [ ] T036 [US1] Add validation and error handling for chat operations
- [ ] T037 [US1] Add logging for chat operations

**Checkpoint**: At this point, User Stories 1 AND 3 should both work independently

---

## Phase 5: User Story 2 - Contextual Chat with Selected Text (Priority: P2)

**Goal**: Allow users to select specific text on the page and ask follow-up questions about that text, so they can get deeper insights or clarifications about specific concepts without losing context

**Independent Test**: Can be fully tested by selecting text on a book page, asking a question related to that text, and verifying that the system prioritizes the selected text as context in its response

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T038 [P] [US2] Contract test for /api/selection-chat endpoint in backend/tests/contract/test_selection_chat.py
- [ ] T039 [P] [US2] Integration test for contextual Q&A flow in backend/tests/integration/test_contextual_qa.py

### Implementation for User Story 2

- [ ] T040 [P] [US2] Enhance User Query model to support contextual mode in backend/src/models/query_model.py
- [ ] T041 [US2] Update Agent-based RAG logic service to prioritize selected text in backend/src/services/rag_agent_service.py
- [ ] T042 [US2] Implement contextual chat endpoint in backend/src/api/chat_router.py
- [ ] T043 [US2] Implement text selection capture in frontend/src/services/text_selection_service.js
- [ ] T044 [US2] Create RAG Chatbot React component in frontend/src/components/RAGChatbot.js
- [ ] T045 [US2] Implement API communication integration in frontend/src/services/api_service.js
- [ ] T046 [US2] Add UI indicators for contextual chat mode in frontend/src/components/RAGChatbot.js
- [ ] T047 [US2] Add validation and error handling for contextual operations
- [ ] T048 [US2] Add logging for contextual operations

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Frontend Integration & Deployment

**Goal**: Integrate the RAG chatbot into the existing Docusaurus book website and deploy to GitHub Pages

**Independent Test**: Verify the chatbot is properly integrated into the Docusaurus site and can communicate with the backend API

### Implementation for Frontend Integration

- [ ] T049 [P] Analyze existing frontend structure in frontend/ directory to identify integration points
- [ ] T050 [P] Create RAGChatbot component compatible with existing frontend architecture in frontend/src/components/RAGChatbot.js
- [ ] T051 [P] Create chat service for API communication in frontend/src/services/chatService.js
- [ ] T052 Integrate RAGChatbot component into existing Docusaurus layout in frontend/src/components/
- [ ] T053 Configure API endpoints in frontend/src/config/api.js
- [ ] T054 Add error handling and loading states in frontend/src/components/RAGChatbot.js
- [ ] T055 Test frontend integration with deployed backend
- [ ] T056 Configure GitHub Pages deployment for Docusaurus site

**Checkpoint**: The complete RAG chatbot system should now be functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T057 [P] Documentation updates in docs/
- [ ] T058 Code cleanup and refactoring
- [ ] T059 Performance optimization across all stories
- [ ] T060 [P] Additional unit tests (if requested) in backend/tests/unit/ and frontend/tests/
- [ ] T061 Security hardening
- [ ] T062 Run quickstart.md validation
- [ ] T063 End-to-end testing validation
- [ ] T064 Handle vector database unavailability in backend/src/services/retrieval_service.py
- [ ] T065 Implement validation for long user questions in backend/src/models/query_model.py
- [ ] T066 Handle multi-topic questions in backend/src/services/rag_service.py
- [ ] T067 Handle short/punctuation-only selected text in frontend/src/services/text_selection_service.js
- [ ] T068 Handle unindexed content requests in backend/src/api/chat_router.py

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Frontend Integration (Phase 6)**: Depends on all backend user stories being complete
- **Polish (Phase 7)**: Depends on all desired user stories and frontend integration being complete

### User Story Dependencies

- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 1 (P1)**: Can start after Foundational (Phase 2) and User Story 3 - Builds upon indexing functionality
- **User Story 2 (P2)**: Can start after User Story 1 is complete - Builds upon basic chat functionality

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for /api/chat endpoint in backend/tests/contract/test_chat_endpoint.py"
Task: "Integration test for basic Q&A flow in backend/tests/integration/test_basic_qa.py"

# Launch all models for User Story 1 together:
Task: "Create User Query model in backend/src/models/query_model.py"
Task: "Create Chat Response model in backend/src/models/response_model.py"
```

---

## Implementation Strategy

### MVP First (User Stories 3 and 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 3 (Indexing)
4. Complete Phase 4: User Story 1 (Basic Chat)
5. **STOP and VALIDATE**: Test User Stories 1 and 3 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 3 → Test independently → Deploy/Demo
3. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
4. Add User Story 2 → Test independently → Deploy/Demo
5. Add Frontend Integration → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 3 (Indexing)
   - Developer B: User Story 1 (Basic Chat)
   - Developer C: User Story 2 (Contextual Chat) - waits for US1
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence