/**
 * Chatbot Service for state management and localStorage persistence
 * Implements the data model structure defined in data-model.md
 */

class ChatbotService {
  constructor() {
    this.storageKeyPrefix = 'chatbot';
    this.sessionHistoryLimit = 50; // Maximum number of sessions to store
    this.sessionInactivityLimit = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    this.messageLimitPerSession = 1000; // Maximum messages per session
  }

  // Session management methods
  createSession(mode = 'general', metadata = {}) {
    const session = {
      id: this.generateId(),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode,
      isActive: true,
      metadata: {
        ...metadata,
        pageUrl: window.location.href,
        pageTitle: document.title,
        userAgent: navigator.userAgent
      }
    };

    return session;
  }

  // Message management methods
  createMessage(text, sender, selectedText = null, sources = null) {
    // Validate inputs
    if (!text || typeof text !== 'string' || text.length > 2000) {
      throw new Error('Invalid message text: must be a string between 1 and 2000 characters');
    }

    if (!['user', 'bot', 'system'].includes(sender)) {
      throw new Error('Invalid sender: must be one of "user", "bot", or "system"');
    }

    const message = {
      id: this.generateId(),
      text,
      sender,
      timestamp: new Date().toISOString(),
      selectedText: selectedText || null,
      sources: sources || null
    };

    return message;
  }

  addMessageToSession(session, message) {
    // Validate session and message
    if (!session || !message) {
      throw new Error('Session and message are required');
    }

    // Limit message count per session
    let updatedMessages = [...session.messages, message];
    if (updatedMessages.length > this.messageLimitPerSession) {
      // Remove oldest messages, keeping only the most recent
      updatedMessages = updatedMessages.slice(-this.messageLimitPerSession);
    }

    return {
      ...session,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    };
  }

  // LocalStorage persistence methods
  saveSession(session) {
    try {
      const sessions = this.getAllSessions();
      sessions[session.id] = session;
      this.setStorageItem('sessions', sessions);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  getSession(sessionId) {
    try {
      const sessions = this.getAllSessions();
      return sessions[sessionId] || null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  getAllSessions() {
    try {
      const sessions = this.getStorageItem('sessions') || {};
      return sessions;
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      return {};
    }
  }

  deleteSession(sessionId) {
    try {
      const sessions = this.getAllSessions();
      delete sessions[sessionId];
      this.setStorageItem('sessions', sessions);
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  // Current session management
  setCurrentSessionId(sessionId) {
    try {
      this.setStorageItem('currentSessionId', sessionId);
    } catch (error) {
      console.error('Failed to set current session ID:', error);
      throw error;
    }
  }

  getCurrentSessionId() {
    try {
      return this.getStorageItem('currentSessionId');
    } catch (error) {
      console.error('Failed to get current session ID:', error);
      return null;
    }
  }

  // Interface state management
  saveInterfaceState(interfaceState) {
    try {
      this.setStorageItem('interfaceState', interfaceState);
    } catch (error) {
      console.error('Failed to save interface state:', error);
      throw error;
    }
  }

  getInterfaceState() {
    try {
      const defaultState = {
        isOpen: false,
        isVisible: true,
        mode: 'general',
        isMinimized: false,
        isTyping: false,
        selectedText: null,
        position: { x: 20, y: 20 }
      };

      return { ...defaultState, ...this.getStorageItem('interfaceState') };
    } catch (error) {
      console.error('Failed to get interface state:', error);
      return {
        isOpen: false,
        isVisible: true,
        mode: 'general',
        isMinimized: false,
        isTyping: false,
        selectedText: null,
        position: { x: 20, y: 20 }
      };
    }
  }

  // User preferences management
  saveUserPreferences(preferences) {
    try {
      this.setStorageItem('preferences', preferences);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  getUserPreferences() {
    try {
      const defaultPreferences = {
        theme: 'auto',
        fontSize: 'medium',
        notifications: {
          enabled: true,
          sound: false,
          desktop: false
        },
        persistence: {
          conversationHistory: true,
          sessionState: true
        }
      };

      return { ...defaultPreferences, ...this.getStorageItem('preferences') };
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return {
        theme: 'auto',
        fontSize: 'medium',
        notifications: {
          enabled: true,
          sound: false,
          desktop: false
        },
        persistence: {
          conversationHistory: true,
          sessionState: true
        }
      };
    }
  }

  // Utility methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Storage methods with error handling
  setStorageItem(key, value) {
    if (!window.localStorage) {
      console.warn('localStorage not available');
      return;
    }

    try {
      const fullKey = `${this.storageKeyPrefix}.${key}`;
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting cleanup');
        this.cleanupOldSessions();
        // Try again after cleanup
        localStorage.setItem(`${this.storageKeyPrefix}.${key}`, JSON.stringify(value));
      } else {
        throw error;
      }
    }
  }

  getStorageItem(key) {
    if (!window.localStorage) {
      console.warn('localStorage not available');
      return null;
    }

    const fullKey = `${this.storageKeyPrefix}.${key}`;
    const item = localStorage.getItem(fullKey);

    if (item) {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.error(`Failed to parse stored item ${key}:`, error);
        return null;
      }
    }

    return null;
  }

  // Cleanup methods
  cleanupOldSessions() {
    try {
      const sessions = this.getAllSessions();
      const now = Date.now();
      let cleanedCount = 0;

      // Identify sessions to remove (older than 30 days and inactive)
      const sessionIds = Object.keys(sessions);
      for (const sessionId of sessionIds) {
        const session = sessions[sessionId];
        const sessionDate = new Date(session.updatedAt).getTime();

        if (now - sessionDate > this.sessionInactivityLimit) {
          delete sessions[sessionId];
          cleanedCount++;
        }
      }

      // If we still have too many sessions, remove the oldest ones
      if (Object.keys(sessions).length > this.sessionHistoryLimit) {
        const sortedSessions = Object.entries(sessions)
          .sort((a, b) => new Date(a[1].updatedAt) - new Date(b[1].updatedAt));

        const sessionsToRemove = sortedSessions.slice(0,
          sortedSessions.length - this.sessionHistoryLimit);

        for (const [sessionId] of sessionsToRemove) {
          delete sessions[sessionId];
          cleanedCount++;
        }
      }

      // Save cleaned sessions
      this.setStorageItem('sessions', sessions);

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} old sessions`);
      }
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  }

  // Session history management
  getRecentSessions(limit = 10) {
    try {
      const sessions = this.getAllSessions();
      const sessionArray = Object.values(sessions);

      // Sort by updatedAt (most recent first) and limit the results
      return sessionArray
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent sessions:', error);
      return [];
    }
  }

  // Clear all stored data (for reset purposes)
  clearAllData() {
    try {
      localStorage.removeItem(`${this.storageKeyPrefix}.sessions`);
      localStorage.removeItem(`${this.storageKeyPrefix}.currentSessionId`);
      localStorage.removeItem(`${this.storageKeyPrefix}.interfaceState`);
      localStorage.removeItem(`${this.storageKeyPrefix}.preferences`);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const chatbotService = new ChatbotService();
export default chatbotService;

// Also export the class for direct instantiation if needed
export { ChatbotService };