import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state based on the data model
const initialState = {
  currentSession: null,
  sessions: new Map(),
  interfaceState: {
    isOpen: false,
    isVisible: true,
    mode: 'general',
    isMinimized: false,
    isTyping: false,
    selectedText: null,
    position: { x: 20, y: 20 } // Default position (will be bottom-right in floating widget)
  },
  userPreferences: {
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
  },
  apiConfig: {
    baseUrl: '/api',
    endpoints: {},
    defaultSettings: {}
  }
};

// Action types
const actionTypes = {
  SET_CURRENT_SESSION: 'SET_CURRENT_SESSION',
  ADD_SESSION: 'ADD_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  DELETE_SESSION: 'DELETE_SESSION',
  SET_INTERFACE_STATE: 'SET_INTERFACE_STATE',
  UPDATE_INTERFACE_STATE: 'UPDATE_INTERFACE_STATE',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  UPDATE_USER_PREFERENCES: 'UPDATE_USER_PREFERENCES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_TYPING: 'SET_TYPING',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE'
};

// Reducer function
function chatbotReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_CURRENT_SESSION:
      return {
        ...state,
        currentSession: action.payload
      };

    case actionTypes.ADD_SESSION:
      const newSessions = new Map(state.sessions);
      newSessions.set(action.payload.id, action.payload);
      return {
        ...state,
        sessions: newSessions
      };

    case actionTypes.UPDATE_SESSION:
      const updatedSessions = new Map(state.sessions);
      if (updatedSessions.has(action.payload.id)) {
        updatedSessions.set(action.payload.id, {
          ...updatedSessions.get(action.payload.id),
          ...action.payload.updates
        });
      }
      return {
        ...state,
        sessions: updatedSessions
      };

    case actionTypes.DELETE_SESSION:
      const remainingSessions = new Map(state.sessions);
      remainingSessions.delete(action.payload.id);
      return {
        ...state,
        sessions: remainingSessions,
        currentSession: state.currentSession?.id === action.payload.id ? null : state.currentSession
      };

    case actionTypes.SET_INTERFACE_STATE:
      return {
        ...state,
        interfaceState: action.payload
      };

    case actionTypes.UPDATE_INTERFACE_STATE:
      return {
        ...state,
        interfaceState: {
          ...state.interfaceState,
          ...action.payload
        }
      };

    case actionTypes.SET_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: action.payload
      };

    case actionTypes.UPDATE_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };

    case actionTypes.ADD_MESSAGE:
      if (!state.currentSession) return state;

      const sessionWithNewMessage = {
        ...state.currentSession,
        messages: [...state.currentSession.messages, action.payload],
        updatedAt: new Date().toISOString()
      };

      return {
        ...state,
        currentSession: sessionWithNewMessage,
        sessions: new Map(state.sessions).set(sessionWithNewMessage.id, sessionWithNewMessage)
      };

    case actionTypes.SET_TYPING:
      return {
        ...state,
        interfaceState: {
          ...state.interfaceState,
          isTyping: action.payload
        }
      };

    case actionTypes.LOAD_FROM_STORAGE:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

// Create context
const ChatbotContext = createContext();

// Provider component
export function ChatbotProvider({ children }) {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  // Load from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('chatbotState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Convert the sessions object back to a Map
        if (parsedState.sessions) {
          const sessionsMap = new Map(Object.entries(parsedState.sessions));
          parsedState.sessions = sessionsMap;
        }
        dispatch({ type: actionTypes.LOAD_FROM_STORAGE, payload: parsedState });
      } catch (error) {
        console.error('Failed to load chatbot state from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      // Convert Map to object for JSON serialization
      const stateToSave = {
        ...state,
        sessions: Object.fromEntries(state.sessions)
      };
      localStorage.setItem('chatbotState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save chatbot state to localStorage:', error);
    }
  }, [state]);

  // Session management functions
  const createNewSession = (mode = 'general', metadata = {}) => {
    const newSession = {
      id: uuidv4(),
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

    dispatch({ type: actionTypes.ADD_SESSION, payload: newSession });
    dispatch({ type: actionTypes.SET_CURRENT_SESSION, payload: newSession });

    return newSession;
  };

  const switchSession = (sessionId) => {
    const session = state.sessions.get(sessionId);
    if (session) {
      dispatch({ type: actionTypes.SET_CURRENT_SESSION, payload: session });
    }
  };

  const addMessageToCurrentSession = (message) => {
    if (state.currentSession) {
      dispatch({ type: actionTypes.ADD_MESSAGE, payload: message });
    }
  };

  const updateInterfaceState = (updates) => {
    dispatch({ type: actionTypes.UPDATE_INTERFACE_STATE, payload: updates });
  };

  const updateSession = (sessionId, updates) => {
    dispatch({ type: actionTypes.UPDATE_SESSION, payload: { id: sessionId, updates } });
  };

  const value = {
    state,
    dispatch,
    createNewSession,
    switchSession,
    addMessageToCurrentSession,
    updateInterfaceState,
    updateSession
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
}

// Custom hook to use the context
export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}