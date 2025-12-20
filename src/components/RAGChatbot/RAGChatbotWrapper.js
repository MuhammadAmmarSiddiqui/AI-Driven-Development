import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatbotProvider } from '../../context/ChatbotContext';
import FloatingChatbot from './FloatingChatbot';
import './RAGChatbot.css';

/**
 * A wrapper component for the RAG Chatbot that can be easily integrated into Docusaurus pages
 * This component sets up the context provider and renders the floating chatbot widget
 */
const RAGChatbotWrapper = ({ initialMode = 'general', apiEndpoint = '/api' }) => {
  return (
    <ChatbotProvider>
      <div className="rag-chatbot-wrapper">
        <FloatingChatbot />
      </div>
    </ChatbotProvider>
  );
};

// Auto-mount the chatbot when this module is loaded by Docusaurus
if (typeof document !== 'undefined') {
  // Wait for the DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountChatbot);
  } else {
    // DOM is already ready
    setTimeout(mountChatbot, 0);
  }
}

function mountChatbot() {
  // Find the root element that was injected by the Docusaurus plugin
  const chatbotRoot = document.getElementById('rag-chatbot-root');

  if (chatbotRoot) {
    // Create a React root and render the chatbot
    const root = createRoot(chatbotRoot);
    root.render(<RAGChatbotWrapper />);
  } else {
    console.warn('RAG Chatbot: Root element #rag-chatbot-root not found');
  }
}

export default RAGChatbotWrapper;