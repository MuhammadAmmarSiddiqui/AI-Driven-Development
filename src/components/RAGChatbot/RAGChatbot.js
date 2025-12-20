
import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import apiService from '../../services/api_service';
import textSelectionService from '../../services/text_selection_service';
import './RAGChatbot.css';

const RAGChatbot = ({ initialMode = 'general', apiEndpoint = '/api', isFloating = false }) => {
  const { state, addMessageToCurrentSession, updateInterfaceState, createNewSession } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [chatMode, setChatMode] = useState(initialMode); // 'general' or 'contextual'
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Use context state if available, otherwise fallback to local state
  const messages = state.currentSession ? state.currentSession.messages : [];

  // Ensure a session exists when component mounts
  useEffect(() => {
    if (!state.currentSession) {
      createNewSession(initialMode);
    }
  }, [state.currentSession, createNewSession, initialMode]);

  // Handle text selection
  useEffect(() => {
    const removeListener = textSelectionService.registerSelectionListener((selectionDetails) => {
      if (selectionDetails.text) {
        const validation = textSelectionService.validateSelectedText(selectionDetails.text);

        if (validation.isValid) {
          setSelectedText(selectionDetails.text);
          setIsTextSelected(true);

          // If in contextual mode and text is selected, show a prompt
          if (chatMode === 'contextual') {
            const systemMessage = {
              id: Date.now(),
              text: `You've selected: "${selectionDetails.text.substring(0, 60)}..."`,
              sender: 'system',
              timestamp: new Date()
            };

            addMessageToCurrentSession(systemMessage);
          }
        } else {
          setSelectedText('');
          setIsTextSelected(false);
        }
      } else {
        setIsTextSelected(false);
      }
    });

    // Clean up event listeners
    return removeListener;
  }, [chatMode, addMessageToCurrentSession]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      selectedText: chatMode === 'contextual' && isTextSelected ? selectedText : null
    };

    addMessageToCurrentSession(userMessage);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Update interface state to show typing indicator
    updateInterfaceState({ isTyping: true });

    try {
      // Prepare the request payload
      let payload;
      if (chatMode === 'contextual' && isTextSelected) {
        payload = {
          query: inputValue,
          selected_text: selectedText,
          include_sources: true
        };
      } else {
        payload = {
          query: inputValue,
          include_sources: true
        };
      }

      // Determine which API endpoint to use
      const endpoint = chatMode === 'contextual' && isTextSelected
        ? `${apiEndpoint}/selection-chat`
        : `${apiEndpoint}/chat`;

      // Make API call using the service
      let data;
      if (chatMode === 'contextual' && isTextSelected) {
        data = await apiService.contextualChat(inputValue, selectedText);
      } else {
        data = await apiService.generalChat(inputValue, true);
      }

      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        sources: data.sources || [],
        responseTime: data.response_time
      };

      addMessageToCurrentSession(botMessage);
    } catch (err) {
      setError(`Failed to get response: ${err.message}`);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${err.message}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };

      addMessageToCurrentSession(errorMessage);
    } finally {
      setIsLoading(false);
      updateInterfaceState({ isTyping: false });
    }
  };

  const clearChat = () => {
    // In floating widget context, we might want to preserve session data
    // For now, just clear local state
    // TODO: Implement proper session clearing via context
    setError(null);
  };

  const toggleChatMode = () => {
    const newMode = chatMode === 'general' ? 'contextual' : 'general';
    setChatMode(newMode);

    // Add a message about mode change
    const systemMessage = {
      id: Date.now(),
      text: `Switched to ${newMode} mode. ${newMode === 'contextual' ? 'Select text on the page to ask questions about it.' : 'Ask general questions about the book content.'}`,
      sender: 'system',
      timestamp: new Date()
    };

    addMessageToCurrentSession(systemMessage);
  };

  const clearSelection = () => {
    textSelectionService.removeHighlight();
    setSelectedText('');
    setIsTextSelected(false);
  };

  // Add keyboard shortcuts functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        if (!isLoading && !(chatMode === 'contextual' && !isTextSelected && inputValue.trim())) {
          handleSubmit(new Event('submit', { cancelable: true }));
        }
      }

      // Escape to clear selection in contextual mode
      if (e.key === 'Escape' && chatMode === 'contextual' && isTextSelected) {
        clearSelection();
      }

      // Ctrl/Cmd + M to toggle chat mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        toggleChatMode();
      }

      // Ctrl/Cmd + L to clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputValue, isLoading, chatMode, isTextSelected, toggleChatMode, clearChat, clearSelection]);

  return (
    <div
      className={`rag-chatbot ${isFloating ? 'floating' : ''}`}
      role="region"
      aria-label="Chat interface"
      tabIndex={0}
    >
      <div className="chat-header" role="banner">
        <h3 id="chat-title">Book Assistant</h3>
        <div className="chat-controls" role="toolbar">
          <button
            className={`mode-toggle ${chatMode === 'contextual' ? 'active' : ''}`}
            onClick={toggleChatMode}
            title={chatMode === 'contextual' ? 'Switch to general mode' : 'Switch to contextual mode'}
            aria-label={chatMode === 'contextual' ? 'Switch to general mode' : 'Switch to contextual mode'}
            aria-pressed={chatMode === 'contextual'}
          >
            {chatMode === 'contextual' ? 'Contextual' : 'General'} Mode
          </button>
          <button
            className="clear-chat"
            onClick={clearChat}
            title="Clear chat"
            aria-label="Clear chat history"
          >
            Clear
          </button>
        </div>
      </div>

      {chatMode === 'contextual' && (
        <div
          className={`selection-indicator ${isTextSelected ? 'active' : 'inactive'}`}
          role="status"
          aria-live="polite"
        >
          {isTextSelected ? (
            <div>
              <span className="selected-text-preview">
                Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
              </span>
              <button
                onClick={clearSelection}
                className="clear-selection"
                aria-label="Clear selected text"
              >
                Clear
              </button>
            </div>
          ) : (
            <span>Select text on the page to ask questions about it</span>
          )}
        </div>
      )}

      <div
        className="chat-messages"
        aria-live="polite"
        aria-relevant="additions"
        role="log"
        aria-labelledby="chat-title"
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
            role="listitem"
            aria-label={`${message.sender === 'user' ? 'User' : message.sender === 'bot' ? 'Assistant' : 'System'} message: ${message.text}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="message-content">
              <span className="sender-indicator" aria-hidden="true">
                {message.sender === 'user' ? 'You:' :
                 message.sender === 'bot' ? 'Assistant:' : 'System:'}
              </span>
              <div className="message-text">
                {message.text}

                {message.sources && message.sources.length > 0 && (
                  <details className="sources-details" role="group">
                    <summary aria-label={`Show ${message.sources.length} sources`}>
                      Sources ({message.sources.length})
                    </summary>
                    <ul className="sources-list" role="list">
                      {message.sources.slice(0, 3).map((source, index) => (
                        <li key={index} className="source-item" role="listitem">
                          <span className="source-text">{source.text?.substring(0, 100)}...</span>
                          <span className="source-info">({source.source || 'unknown source'})</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
            <span className="timestamp" aria-label={`Message sent at ${message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`}>
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        ))}

        {state.interfaceState.isTyping && (
          <div className="message bot" role="status" aria-live="polite">
            <div className="message-content">
              <span className="sender-indicator" aria-hidden="true">Assistant:</span>
              <div className="typing-indicator" aria-label="Assistant is typing">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {error && (
        <div className="error-message" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <form
        className="chat-input-form"
        onSubmit={handleSubmit}
        role="form"
        aria-label="Chat input form"
      >
        <label htmlFor="chat-input" className="sr-only">Type your message</label>
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            chatMode === 'contextual' && isTextSelected
              ? 'Ask a question about the selected text...'
              : chatMode === 'contextual'
              ? 'Select text first, then ask a question...'
              : 'Ask a question about the book content...'
          }
          disabled={isLoading || (chatMode === 'contextual' && !isTextSelected)}
          aria-invalid={!!error}
          aria-describedby={error ? "error-message" : undefined}
          autoComplete="off"
          aria-autocomplete="none"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim() || (chatMode === 'contextual' && !isTextSelected)}
          aria-label="Send message"
        >
          Send
        </button>
      </form>

      {error && <div id="error-message" className="sr-only">{error}</div>}
    </div>
  );
};

export default RAGChatbot;