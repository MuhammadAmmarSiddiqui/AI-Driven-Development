# Research Summary: AI/Spec-Driven Book RAG Chatbot Integration

## Decision: Qdrant Vector Database via MCP Server
**Rationale**: Qdrant was specifically chosen in the clarifications as the vector database for the RAG system. It provides efficient similarity search and is well-suited for document retrieval in RAG applications. The MCP server will be used for managing the Qdrant integration. All Qdrant documentation will be accessed via the context7 MCP server during implementation.
**Alternatives considered**:
- Pinecone: Commercial solution with managed service but higher costs
- Weaviate: Open-source alternative with GraphQL API but potentially more complex setup
- FAISS: Facebook's vector similarity library but requires more custom implementation

## Decision: OpenAI Agents SDK with Google Gemini 2.0 Flash Model
**Rationale**: Selected as the agent framework with Google Gemini 2.0 Flash as the underlying LLM. This combination provides agent-based reasoning capabilities with a fast, cost-effective model that's well-suited for RAG applications. All OpenAI Agents SDK documentation will be accessed via the context7 MCP server during implementation.
**Alternatives considered**:
- OpenAI GPT models with custom agent framework: Well-established but potentially higher cost
- Anthropic Claude with custom agent framework: Good for reasoning but might be overkill for simple Q&A
- Open-source models (Llama, Mistral) with Langchain agents: Free but require more infrastructure management

## Decision: RecursiveCharacterTextSplitter for Chunking
**Rationale**: Selected in clarifications as the content chunking strategy. This approach recursively splits text by characters while maintaining semantic boundaries. All embedding model documentation will be accessed via the context7 MCP server during implementation.
**Alternatives considered**:
- SentenceSplitter: Simpler but might not handle complex documents well
- TokenSplitter: More precise but requires tokenization knowledge
- MarkdownHeaderTextSplitter: Better for structured documents but less general-purpose

## Decision: Frontend Integration Approach
**Rationale**: Since the frontend is already built in the frontend directory using Docusaurus, the approach will be to integrate the RAG chatbot components into the existing architecture. Native React components provide better control and integration with the existing Docusaurus setup. All Docusaurus and ChatKit.js documentation will be accessed via the context7 MCP server during implementation.
**Alternatives considered**:
- OpenAI ChatKit: If available, would provide ready-made chat interface
- Custom React components: More flexible and better integration with existing Docusaurus frontend
- Third-party chat libraries: Many options but require additional dependencies

## Decision: FastAPI for Backend Framework
**Rationale**: FastAPI provides excellent performance, automatic API documentation, and strong typing support, making it ideal for the RAG backend service. All FastAPI documentation will be accessed via the context7 MCP server during implementation.
**Alternatives considered**:
- Flask: Simpler but less performant and fewer built-in features
- Django: More heavy-weight than needed for API service
- Express.js: Good for Node.js environments but Python ecosystem preferred

## Decision: Text Selection Capture
**Rationale**: Using `window.getSelection()` provides a standard browser API to capture selected text for the contextual chat feature.
**Alternatives considered**:
- Custom text selection handlers: More complex but more control
- Selectionchange event listeners: More sophisticated but potentially over-engineered
- Docusaurus-specific plugins: Might be available but less flexible

## Decision: CORS Configuration
**Rationale**: Required for the Docusaurus frontend on GitHub Pages to communicate with the FastAPI backend.
**Alternatives considered**:
- Proxy server: Could be used but adds complexity
- Server-side rendering: Would eliminate CORS but changes architecture significantly
- JSONP: Outdated approach with security concerns