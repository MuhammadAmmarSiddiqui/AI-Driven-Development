import React, { useState, useEffect } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import RAGChatbot from './RAGChatbot';
import './RAGChatbot.css';

const FloatingChatbot = () => {
  const { state, updateInterfaceState } = useChatbot();
  const [isVisible, setIsVisible] = useState(true);

  // Handle toggle open/close functionality
  const toggleChat = () => {
    updateInterfaceState({ isOpen: !state.interfaceState.isOpen });
  };

  // Handle minimizing functionality
  const toggleMinimize = () => {
    updateInterfaceState({ isMinimized: !state.interfaceState.isMinimized });
  };

  // Close chat when navigating away from the page (optional)
  useEffect(() => {
    const handleRouteChange = () => {
      // Close the chat when navigating to a new page, but preserve the session
      updateInterfaceState({ isOpen: false });
    };

    // This would be handled differently in a Docusaurus context
    // For now, we'll just log the route change
    const handleBeforeUnload = () => {
      // Preserve session data in localStorage
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateInterfaceState]);

  // Check if chat is open and not minimized
  const isChatOpen = state.interfaceState.isOpen && !state.interfaceState.isMinimized;

  return (
    <div className="floating-chatbot-container">
      {/* Floating bubble/widget */}
      {!isChatOpen && state.interfaceState.isVisible && (
        <div
          className="floating-chatbot-bubble"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
          }}
          onClick={toggleChat}
        >
          <div className="chatbot-bubble-content">
            <span className="chatbot-icon">💬</span>
          </div>
        </div>
      )}

      {/* Chat interface when open */}
      {isChatOpen && (
        <div
          className="floating-chatbot-window"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            width: '400px',
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div className="chatbot-header" style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Book Assistant</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={toggleMinimize}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0 4px',
                }}
                title="Minimize"
              >
                −
              </button>
              <button
                onClick={toggleChat}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0 4px',
                }}
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <RAGChatbot />
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;