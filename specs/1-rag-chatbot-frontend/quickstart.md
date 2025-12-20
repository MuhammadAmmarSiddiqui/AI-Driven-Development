# Quickstart Guide: RAG Chatbot Frontend Integration

## Overview
This guide provides instructions for setting up and using the enhanced RAG chatbot with floating widget functionality in your Docusaurus application.

## Prerequisites
- Node.js 16+ installed
- Docusaurus 2.x project set up
- Existing RAG backend API running
- Basic knowledge of React and JavaScript

## Installation Steps

### 1. Clone or Update Your Repository
```bash
git clone <your-repo-url>
cd <your-project-directory>
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Verify Backend API Connection
Ensure your RAG backend API is running and accessible. By default, the frontend expects the API at `/api` (relative to your frontend).

## Running the Application

### Development Mode
```bash
cd frontend
npm start
```
This will start the Docusaurus development server with hot reloading.

### Production Build
```bash
cd frontend
npm run build
npm run serve
```

## Key Components

### 1. Floating Chatbot Widget
The main enhancement is the floating chatbot widget that appears on all pages:
- Located in the bottom-right corner of the screen
- Toggle open/close by clicking the chat icon
- Maintains conversation history across page navigations

### 2. Enhanced RAG Chatbot
The core chatbot component with additional features:
- Two modes: General and Contextual
- Contextual mode allows asking questions about selected text on the page
- Source attribution for RAG responses
- Error handling and loading states

## Configuration

### API Configuration
The API endpoint can be configured in `frontend/src/config/api.js`:
```javascript
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || '/api',
  // ... other configuration
};
```

### Environment Variables
Create a `.env` file in the `frontend` directory:
```
REACT_APP_API_BASE_URL=https://your-backend-api.com/api
```

## Integration with Docusaurus

### Global Component Injection
The floating chatbot is automatically injected into all Docusaurus pages through the layout system. No manual integration is needed on individual pages.

### Theme Integration
The chatbot styling automatically adapts to your Docusaurus theme colors and typography.

## Usage

### 1. Opening the Chatbot
- Look for the chat icon in the bottom-right corner of any page
- Click the icon to open the chat interface
- The chat interface will slide in from the bottom-right

### 2. Using Different Modes
- **General Mode**: Ask questions about the overall content
- **Contextual Mode**: Select text on the page, then ask questions about it
- Toggle between modes using the mode switch in the chat header

### 3. Managing Conversations
- Clear the current chat using the "Clear" button
- The conversation history persists across page navigations
- Close the chat by clicking the chat icon again or the close button

## Development

### Adding New Features
1. Update the data models in `specs/1-rag-chatbot-frontend/data-model.md`
2. Modify the components in `frontend/src/components/RAGChatbot/`
3. Update the context provider in `frontend/src/context/ChatbotContext.js` (if needed)
4. Test thoroughly across different pages and scenarios

### State Management
The application uses React Context for global state management with localStorage persistence:
- Global chat state is managed in `ChatbotContext`
- State is persisted in localStorage for cross-session continuity
- Session data is automatically cleaned up after 30 days of inactivity

### Styling
- Primary styles are in `frontend/src/components/RAGChatbot/RAGChatbot.css`
- The component adapts to Docusaurus theme variables
- Custom CSS variables can be defined in your Docusaurus theme

## API Endpoints Used

The chatbot communicates with the following backend endpoints:
- `POST /api/chat` - General chat queries
- `POST /api/selection-chat` - Contextual chat with selected text
- `GET /api/health` - API health check

## Troubleshooting

### Chatbot Not Appearing
- Verify that the build completed without errors
- Check browser console for JavaScript errors
- Ensure all required dependencies are installed

### API Connection Issues
- Verify the backend API is running and accessible
- Check the API configuration in `src/config/api.js`
- Look for CORS errors in the browser console

### Styling Issues
- Clear browser cache and hard refresh the page
- Verify Docusaurus theme configuration
- Check for CSS conflicts in browser dev tools

## Next Steps

### For Developers
1. Explore the data models in `specs/1-rag-chatbot-frontend/data-model.md`
2. Review the implementation plan in `specs/1-rag-chatbot-frontend/plan.md`
3. Check the API contracts in `specs/1-rag-chatbot-frontend/contracts/`
4. Run tests to ensure functionality: `npm test`

### For Customization
1. Modify the styling in `RAGChatbot.css` to match your brand
2. Update the position and behavior of the floating widget as needed
3. Extend the context provider for additional features
4. Add analytics or additional functionality as required