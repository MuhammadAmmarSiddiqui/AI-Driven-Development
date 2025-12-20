/**
 * API Configuration for RAG Chatbot
 * Contains configuration for API endpoints and other settings
 */

const API_CONFIG = {
  // Base URL for the backend API
  // In production, this might be an absolute URL to your backend
  // In development, it can be relative to use the same host
  BASE_URL:  'https://ammar67-src.hf.space/api',

  // Specific endpoints
  ENDPOINTS: {
    CHAT: '/chat',
    SELECTION_CHAT: '/selection-chat',
    INDEX: '/index',
    RETRIEVE: '/retrieve',
    HEALTH: '/health',
    INDEX_STATUS: '/index-status',
    CHAT_STATUS: '/chat-status',
    VALIDATE_RESPONSE: '/validate-response'
  },

  // Default settings
  DEFAULT_SETTINGS: {
    includeSources: true,
    topK: 5,
    maxTokens: 500,
    temperature: 0.7
  },

  // Timeout settings (in milliseconds)
  TIMEOUT: {
    REQUEST: 30000, // 30 seconds
    CONNECTION: 5000 // 5 seconds
  }
};

export default API_CONFIG;