# RAG Chatbot Component

The RAG (Retrieval-Augmented Generation) Chatbot is a floating widget component that provides users with an AI-powered assistant to ask questions about the book content. The component features both general and contextual chat modes, persistent sessions, and seamless integration with Docusaurus.

## Features

- **Floating Widget**: Accessible from any page via a bubble in the bottom-right corner
- **Dual Chat Modes**:
  - General mode: Ask questions about the book content
  - Contextual mode: Ask questions about selected text on the page
- **Persistent Sessions**: Conversation history preserved across page navigations
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation support
- **Animations**: Smooth transitions and message animations for better UX

## Usage

The component is automatically integrated into the Docusaurus application via the plugin configuration in `docusaurus.config.js`. No additional setup is required for basic usage.

### Component Structure

- `RAGChatbot.js`: Main chatbot interface component
- `FloatingChatbot.js`: Floating widget wrapper component
- `RAGChatbot.css`: Styling with Docusaurus theme compatibility
- `RAGChatbotWrapper.js`: Global injection wrapper
- `api_service.js`: API communication layer
- `text_selection_service.js`: Text selection handling
- `chatbot_service.js`: Session management and persistence

### Chat Modes

1. **General Mode**:
   - Ask questions about the book content in general
   - Uses the entire book knowledge base for responses

2. **Contextual Mode**:
   - Select text on the page to ask specific questions about it
   - Prioritizes the selected text as context for responses
   - Automatically detects selected text on the page

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Send message
- `Ctrl/Cmd + M`: Toggle chat mode (general/contextual)
- `Ctrl/Cmd + L`: Clear chat
- `Escape`: Clear text selection in contextual mode

### API Endpoints

The component communicates with the backend via the following endpoints:

- `/api/chat`: General chat queries
- `/api/selection-chat`: Contextual chat queries with selected text
- `/api/health`: Health check endpoint

## Styling

The component is designed to match the Docusaurus theme with:

- CSS custom properties that adapt to light/dark modes
- Responsive design for different screen sizes
- Smooth animations and transitions
- Accessible color contrast ratios

## Session Management

- Conversations are stored in localStorage with automatic cleanup after 30 days
- Session metadata includes page URL, title, and user agent
- Maximum of 1000 messages per session with oldest messages removed when limit is reached

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles for screen readers
- Proper focus management
- WCAG 2.1 AA compliant color contrast
- Screen reader announcements for dynamic content

## Customization

The component can be customized by modifying:

- CSS variables in `RAGChatbot.css`
- Default preferences in `ChatbotContext.js`
- API endpoints in `api_service.js`

## Troubleshooting

- If the chatbot doesn't appear, check that the Docusaurus plugin is properly configured
- If API calls fail, verify that the backend is running and accessible
- For session persistence issues, check browser localStorage settings