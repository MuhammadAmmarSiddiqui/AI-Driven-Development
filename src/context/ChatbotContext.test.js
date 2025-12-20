import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ChatbotProvider, useChatbot } from './ChatbotContext';

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

describe('ChatbotContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage mock
    mockLocalStorage.clear();
  });

  it('provides initial state correctly', () => {
    const wrapper = ({ children }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    const { result } = renderHook(() => useChatbot(), { wrapper });

    expect(result.current.state.currentSession).toBeNull();
    expect(result.current.state.sessions).toBeInstanceOf(Map);
    expect(result.current.state.interfaceState).toEqual({
      isOpen: false,
      isVisible: true,
      mode: 'general',
      isMinimized: false,
      isTyping: false,
      selectedText: null,
      position: { x: 20, y: 20 }
    });
    expect(result.current.state.userPreferences).toEqual({
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
    });
  });

  it('creates a new session', () => {
    const wrapper = ({ children }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    const { result } = renderHook(() => useChatbot(), { wrapper });

    act(() => {
      result.current.createNewSession('general', { test: 'metadata' });
    });

    expect(result.current.state.currentSession).not.toBeNull();
    expect(result.current.state.currentSession.mode).toBe('general');
    expect(result.current.state.currentSession.messages).toEqual([]);
    expect(result.current.state.currentSession.metadata.test).toBe('metadata');
    expect(result.current.state.sessions.size).toBe(1);
  });

  it('switches between sessions', () => {
    const wrapper = ({ children }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    const { result } = renderHook(() => useChatbot(), { wrapper });

    // Create two sessions
    let session1, session2;
    act(() => {
      session1 = result.current.createNewSession('general');
      session2 = result.current.createNewSession('contextual');
    });

    // Verify current session is the last created one
    expect(result.current.state.currentSession.id).toBe(session2.id);

    // Switch to the first session
    act(() => {
      result.current.switchSession(session1.id);
    });

    expect(result.current.state.currentSession.id).toBe(session1.id);
  });

  it('adds a message to the current session', () => {
    const wrapper = ({ children }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    const { result } = renderHook(() => useChatbot(), { wrapper });

    // Create a session first
    act(() => {
      result.current.createNewSession();
    });

    const message = {
      id: 1,
      text: 'Test message',
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    act(() => {
      result.current.addMessageToCurrentSession(message);
    });

    expect(result.current.state.currentSession.messages).toHaveLength(1);
    expect(result.current.state.currentSession.messages[0]).toEqual(message);
  });

  it('updates interface state', () => {
    const wrapper = ({ children }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    const { result } = renderHook(() => useChatbot(), { wrapper });

    act(() => {
      result.current.updateInterfaceState({ isOpen: true, mode: 'contextual' });
    });

    expect(result.current.state.interfaceState.isOpen).toBe(true);
    expect(result.current.state.interfaceState.mode).toBe('contextual');
  });

  it('updates session data', () => {
    const wrapper = ({ children }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    const { result } = renderHook(() => useChatbot(), { wrapper });

    let session;
    act(() => {
      session = result.current.createNewSession();
    });

    const updates = { mode: 'contextual', isActive: false };

    act(() => {
      result.current.updateSession(session.id, updates);
    });

    const updatedSession = result.current.state.sessions.get(session.id);
    expect(updatedSession.mode).toBe('contextual');
    expect(updatedSession.isActive).toBe(false);
  });

  it('loads state from localStorage on initial render', () => {
    // Set up initial state in localStorage
    const savedState = {
      currentSession: {
        id: 'test-session',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mode: 'general',
        isActive: true,
        metadata: {}
      },
      sessions: {
        'test-session': {
          id: 'test-session',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          mode: 'general',
          isActive: true,
          metadata: {}
        }
      },
      interfaceState: {
        isOpen: true,
        isVisible: true,
        mode: 'contextual',
        isMinimized: false,
        isTyping: false,
        selectedText: null,
        position: { x: 20, y: 20 }
      },
      userPreferences: {
        theme: 'dark',
        fontSize: 'large',
        notifications: {
          enabled: false,
          sound: true,
          desktop: true
        },
        persistence: {
          conversationHistory: true,
          sessionState: true
        }
      }
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));

    const wrapper = ({ children }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    const { result } = renderHook(() => useChatbot(), { wrapper });

    // Wait for useEffect to complete
    expect(result.current.state.interfaceState.isOpen).toBe(true);
    expect(result.current.state.interfaceState.mode).toBe('contextual');
    expect(result.current.state.userPreferences.theme).toBe('dark');
  });

  it('saves state to localStorage when state changes', () => {
    const wrapper = ({ children }) => (
      <ChatbotProvider>{children}</ChatbotProvider>
    );

    const { result } = renderHook(() => useChatbot(), { wrapper });

    // Trigger a state change
    act(() => {
      result.current.updateInterfaceState({ isOpen: true });
    });

    // Check that localStorage was called with the updated state
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'chatbotState',
      expect.any(String)
    );
  });
});