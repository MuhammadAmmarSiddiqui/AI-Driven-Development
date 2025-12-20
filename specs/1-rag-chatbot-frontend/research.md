# Research: RAG Chatbot Frontend Integration

## Current State Analysis

### Existing Components
- **RAGChatbot.js**: Main chatbot component with general and contextual modes
- **RAGChatbotWrapper.js**: Wrapper for easy integration into Docusaurus pages
- **RAGChatbot.css**: Styling for the chatbot component
- **api_service.js**: API service for backend communication
- **api.js**: API configuration

### Key Features of Current Implementation
1. **Two Modes**: General chat and contextual chat (with text selection)
2. **Text Selection Integration**: Can select text on page and ask questions about it
3. **Source Attribution**: Shows sources for RAG responses
4. **Error Handling**: Graceful error handling with user feedback
5. **Loading States**: Typing indicators and loading states
6. **Message History**: Maintains conversation history

### Current Styling
- Basic CSS styling with a clean, modern chat interface
- User messages in blue (right-aligned)
- Bot messages in gray (left-aligned)
- System messages in yellow
- Error messages in red
- Responsive design with max-width constraints

## Requirements from Feature Spec
1. **Floating Widget**: Chatbot should be accessible from any page via a floating widget/bubble in bottom-right corner
2. **Docusaurus Theme Integration**: Styling should match Docusaurus theme colors and typography
3. **Toggle Interaction**: Click on floating bubble to toggle open/close
4. **Session Persistence**: Chat interface closes on navigation but conversation history persists

## Unknowns to Resolve

### Technical Unknowns
1. **Floating Widget Implementation**: How to implement a floating widget that appears on all Docusaurus pages
2. **Docusaurus Theme Integration**: How to access and use Docusaurus theme variables for styling
3. **State Persistence**: How to maintain conversation state across page navigations in Docusaurus
4. **Global Integration**: How to inject the chatbot into all pages without modifying each page individually
5. **Theme Customization**: How to access Docusaurus CSS variables and theme configuration

### Architecture Decisions Needed
1. **Widget Positioning**: Should use CSS fixed positioning or a React positioning library?
2. **State Management**: Should use React Context, localStorage, or Docusaurus-specific state management?
3. **Global Injection**: Should modify Docusaurus layout or use a plugin approach?
4. **Styling Approach**: Should extend current CSS or use Docusaurus theme customization?

## Research Tasks

### 1. Docusaurus Floating Widget Implementation
- Research best practices for adding floating UI elements to Docusaurus
- Investigate Docusaurus layout customization options
- Look into Docusaurus plugins for global UI elements

### 2. Docusaurus Theme Integration
- Research how to access Docusaurus theme variables
- Understand how to use Docusaurus CSS custom properties
- Learn about Docusaurus theme customization methods

### 3. State Persistence in Docusaurus
- Research how to maintain state across page navigations in Docusaurus
- Investigate localStorage, sessionStorage, and other persistence options
- Look into Docusaurus-specific state management patterns

### 4. Global Component Injection
- Research how to add components to all pages in Docusaurus
- Understand Docusaurus layout system and customization options
- Investigate potential approaches for global chatbot integration

## Next Steps
1. Research Docusaurus architecture and component injection methods
2. Investigate theme customization options in Docusaurus
3. Explore state management patterns for Docusaurus applications
4. Design the floating widget component architecture
5. Plan the integration approach for all pages