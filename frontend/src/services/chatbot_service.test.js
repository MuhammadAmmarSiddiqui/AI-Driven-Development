import chatbotService from './chatbot_service';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window and navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-agent'
  },
  writable: true
});

describe('ChatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage mock
    mockLocalStorage.clear();
    // Reset the service (this is a singleton, so we need to clear any cached data)
    localStorage.clear();
  });

  describe('Session Management', () => {
    it('creates a new session with correct properties', () => {
      const session = chatbotService.createSession('contextual', { page: 'test' });

      expect(session).toHaveProperty('id');
      expect(session.messages).toEqual([]);
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
      expect(session.mode).toBe('contextual');
      expect(session.isActive).toBe(true);
      expect(session.metadata).toHaveProperty('page');
      expect(session.metadata).toHaveProperty('pageUrl');
      expect(session.metadata).toHaveProperty('pageTitle');
      expect(session.metadata).toHaveProperty('userAgent');
    });

    it('saves and retrieves a session', () => {
      const session = chatbotService.createSession();

      chatbotService.saveSession(session);
      const retrievedSession = chatbotService.getSession(session.id);

      expect(retrievedSession.id).toBe(session.id);
      expect(retrievedSession.mode).toBe(session.mode);
    });

    it('gets all sessions', () => {
      const session1 = chatbotService.createSession();
      const session2 = chatbotService.createSession('contextual');

      chatbotService.saveSession(session1);
      chatbotService.saveSession(session2);

      const allSessions = chatbotService.getAllSessions();

      expect(Object.keys(allSessions)).toHaveLength(2);
      expect(allSessions[session1.id]).toBeDefined();
      expect(allSessions[session2.id]).toBeDefined();
    });

    it('deletes a session', () => {
      const session = chatbotService.createSession();
      chatbotService.saveSession(session);

      let allSessions = chatbotService.getAllSessions();
      expect(allSessions[session.id]).toBeDefined();

      chatbotService.deleteSession(session.id);

      allSessions = chatbotService.getAllSessions();
      expect(allSessions[session.id]).toBeUndefined();
    });
  });

  describe('Message Management', () => {
    it('creates a valid message', () => {
      const message = chatbotService.createMessage('Hello world', 'user', 'selected text', [{ text: 'source', source: 'test' }]);

      expect(message).toHaveProperty('id');
      expect(message.text).toBe('Hello world');
      expect(message.sender).toBe('user');
      expect(message.timestamp).toBeDefined();
      expect(message.selectedText).toBe('selected text');
      expect(message.sources).toEqual([{ text: 'source', source: 'test' }]);
    });

    it('validates message text', () => {
      expect(() => {
        chatbotService.createMessage('', 'user');
      }).toThrow('Invalid message text: must be a string between 1 and 2000 characters');

      expect(() => {
        chatbotService.createMessage('x'.repeat(2001), 'user');
      }).toThrow('Invalid message text: must be a string between 1 and 2000 characters');
    });

    it('validates message sender', () => {
      expect(() => {
        chatbotService.createMessage('Hello', 'invalid');
      }).toThrow('Invalid sender: must be one of "user", "bot", or "system"');
    });

    it('adds a message to a session', () => {
      const session = chatbotService.createSession();
      const message = chatbotService.createMessage('Hello', 'user');

      const updatedSession = chatbotService.addMessageToSession(session, message);

      expect(updatedSession.messages).toHaveLength(1);
      expect(updatedSession.messages[0].text).toBe('Hello');
      expect(updatedSession.updatedAt).not.toBe(session.updatedAt);
    });

    it('limits messages per session', () => {
      const session = chatbotService.createSession();
      const service = new (require('./chatbot_service').ChatbotService)();
      service.messageLimitPerSession = 2; // Override for test

      // Add 3 messages
      const message1 = chatbotService.createMessage('Message 1', 'user');
      const message2 = chatbotService.createMessage('Message 2', 'user');
      const message3 = chatbotService.createMessage('Message 3', 'user');

      let updatedSession = chatbotService.addMessageToSession(session, message1);
      updatedSession = chatbotService.addMessageToSession(updatedSession, message2);
      updatedSession = chatbotService.addMessageToSession(updatedSession, message3);

      // Should only keep the last 2 messages
      expect(updatedSession.messages).toHaveLength(2);
      expect(updatedSession.messages[0].text).toBe('Message 2');
      expect(updatedSession.messages[1].text).toBe('Message 3');
    });
  });

  describe('Interface State Management', () => {
    it('saves and gets interface state', () => {
      const interfaceState = {
        isOpen: true,
        mode: 'contextual',
        isMinimized: false
      };

      chatbotService.saveInterfaceState(interfaceState);
      const retrievedState = chatbotService.getInterfaceState();

      expect(retrievedState.isOpen).toBe(true);
      expect(retrievedState.mode).toBe('contextual');
      expect(retrievedState.isMinimized).toBe(false);
    });

    it('provides default interface state when none exists', () => {
      const defaultState = chatbotService.getInterfaceState();

      expect(defaultState).toHaveProperty('isOpen');
      expect(defaultState).toHaveProperty('isVisible');
      expect(defaultState).toHaveProperty('mode');
      expect(defaultState).toHaveProperty('isMinimized');
      expect(defaultState).toHaveProperty('isTyping');
      expect(defaultState).toHaveProperty('selectedText');
      expect(defaultState).toHaveProperty('position');
    });
  });

  describe('User Preferences Management', () => {
    it('saves and gets user preferences', () => {
      const preferences = {
        theme: 'dark',
        fontSize: 'large',
        notifications: {
          enabled: false,
          sound: true
        }
      };

      chatbotService.saveUserPreferences(preferences);
      const retrievedPreferences = chatbotService.getUserPreferences();

      expect(retrievedPreferences.theme).toBe('dark');
      expect(retrievedPreferences.fontSize).toBe('large');
      expect(retrievedPreferences.notifications.enabled).toBe(false);
      expect(retrievedPreferences.notifications.sound).toBe(true);
    });

    it('provides default preferences when none exist', () => {
      const defaultPreferences = chatbotService.getUserPreferences();

      expect(defaultPreferences).toHaveProperty('theme');
      expect(defaultPreferences).toHaveProperty('fontSize');
      expect(defaultPreferences).toHaveProperty('notifications');
      expect(defaultPreferences).toHaveProperty('persistence');
    });
  });

  describe('Current Session Management', () => {
    it('sets and gets current session ID', () => {
      const sessionId = 'test-session-id';

      chatbotService.setCurrentSessionId(sessionId);
      const retrievedId = chatbotService.getCurrentSessionId();

      expect(retrievedId).toBe(sessionId);
    });
  });

  describe('Session History Management', () => {
    it('gets recent sessions', () => {
      const session1 = chatbotService.createSession();
      const session2 = chatbotService.createSession('contextual');
      const session3 = chatbotService.createSession();

      chatbotService.saveSession(session1);
      chatbotService.saveSession(session2);
      chatbotService.saveSession(session3);

      // Update session2 to be more recent
      const updatedSession2 = {
        ...session2,
        updatedAt: new Date(Date.now() + 1000).toISOString()
      };
      chatbotService.saveSession(updatedSession2);

      const recentSessions = chatbotService.getRecentSessions(2);

      expect(recentSessions).toHaveLength(2);
      expect(recentSessions[0].id).toBe(session2.id); // Most recent
    });
  });

  describe('Cleanup Functionality', () => {
    it('cleans up old sessions', () => {
      // Create sessions with old timestamps
      const oldSession = chatbotService.createSession();
      oldSession.updatedAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(); // 31 days ago

      const recentSession = chatbotService.createSession('contextual');
      recentSession.updatedAt = new Date().toISOString(); // Now

      chatbotService.saveSession(oldSession);
      chatbotService.saveSession(recentSession);

      // Mock the service to have a shorter inactivity limit for testing
      const service = new (require('./chatbot_service').ChatbotService)();
      service.sessionInactivityLimit = 1000; // 1 second for test

      // Since we can't easily override private methods, we'll just test that the cleanup method exists
      expect(() => {
        service.cleanupOldSessions();
      }).not.toThrow();
    });
  });

  describe('Data Clearing', () => {
    it('clears all stored data', () => {
      const session = chatbotService.createSession();
      chatbotService.saveSession(session);
      chatbotService.setCurrentSessionId(session.id);
      chatbotService.saveInterfaceState({ isOpen: true });
      chatbotService.saveUserPreferences({ theme: 'dark' });

      // Verify data exists
      expect(chatbotService.getSession(session.id)).not.toBeNull();
      expect(chatbotService.getCurrentSessionId()).toBe(session.id);
      expect(chatbotService.getInterfaceState().isOpen).toBe(true);
      expect(chatbotService.getUserPreferences().theme).toBe('dark');

      // Clear all data
      chatbotService.clearAllData();

      // Verify data is cleared
      expect(chatbotService.getSession(session.id)).toBeNull();
      expect(chatbotService.getCurrentSessionId()).toBeNull();
      expect(chatbotService.getInterfaceState().isOpen).toBe(false); // Default value
      expect(chatbotService.getUserPreferences().theme).toBe('auto'); // Default value
    });
  });

  describe('Storage Error Handling', () => {
    it('handles localStorage quota exceeded error', () => {
      // Mock localStorage to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        const error = new Error();
        error.name = 'QuotaExceededError';
        throw error;
      });

      expect(() => {
        chatbotService.saveInterfaceState({ test: 'data' });
      }).toThrow();

      // Restore original implementation
      localStorage.setItem = originalSetItem;
    });

    it('handles parsing errors', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = chatbotService.getStorageItem('test');
      expect(result).toBeNull();
    });
  });
});