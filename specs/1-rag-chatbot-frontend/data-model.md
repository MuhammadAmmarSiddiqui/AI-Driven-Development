# Data Model: RAG Chatbot Frontend Integration

## Overview
This document defines the data structures and state management for the enhanced RAG chatbot with floating widget functionality.

## Core Entities

### 1. Chat Message
Represents a single message in the conversation.

```javascript
{
  id: string | number,           // Unique identifier for the message
  text: string,                  // The message content
  sender: 'user' | 'bot' | 'system', // Who sent the message
  timestamp: Date | string,      // When the message was sent
  selectedText: string | null,   // Text that was selected when message was sent (contextual mode)
  sources: Array<{              // Sources for RAG responses (bot messages only)
    text: string,
    source: string,
    score?: number
  }> | null,
  responseTime?: number,         // Time taken for bot response (bot messages only)
  isError?: boolean              // Whether the message represents an error
}
```

### 2. Conversation Session
Represents a collection of related messages with metadata.

```javascript
{
  id: string,                    // Unique session identifier
  messages: ChatMessage[],       // Array of messages in the conversation
  createdAt: Date | string,      // When the session was created
  updatedAt: Date | string,      // When the session was last updated
  mode: 'general' | 'contextual', // Current chat mode
  isActive: boolean,             // Whether this session is currently active
  metadata: {                    // Additional session metadata
    pageUrl?: string,            // URL of the page where session started
    pageTitle?: string,          // Title of the page where session started
    userAgent?: string           // User agent of the client
  }
}
```

### 3. Chat Interface State
Represents the current state of the chatbot UI component.

```javascript
{
  isOpen: boolean,               // Whether the chat interface is open
  isVisible: boolean,            // Whether the floating widget is visible
  mode: 'general' | 'contextual', // Current chat mode
  isMinimized: boolean,          // Whether the chat is minimized
  isTyping: boolean,             // Whether the bot is currently typing
  selectedText: string | null,   // Currently selected text on the page
  position: {                    // Position of the floating widget
    x: number,                   // X coordinate (for future drag functionality)
    y: number                    // Y coordinate (for future drag functionality)
  }
}
```

### 4. User Preferences
Represents user preferences for the chatbot experience.

```javascript
{
  theme: 'light' | 'dark' | 'auto', // Theme preference
  fontSize: 'small' | 'medium' | 'large', // Font size preference
  notifications: {               // Notification preferences
    enabled: boolean,            // Whether notifications are enabled
    sound: boolean,              // Whether to play sound notifications
    desktop: boolean             // Whether to show desktop notifications
  },
  persistence: {                 // Persistence settings
    conversationHistory: boolean, // Whether to save conversation history
    sessionState: boolean,       // Whether to persist session state across visits
  }
}
```

## State Management Structure

### Global State (Context)
The application will use React Context to manage global chatbot state:

```javascript
{
  currentSession: ConversationSession | null, // Current active conversation
  sessions: Map<string, ConversationSession>, // All conversation sessions (for history)
  interfaceState: ChatInterfaceState, // UI state of the chatbot
  userPreferences: UserPreferences, // User preferences
  apiConfig: {                    // API configuration
    baseUrl: string,
    endpoints: object,
    defaultSettings: object
  }
}
```

### Local Storage Structure
For persistence across page navigations and sessions:

```javascript
{
  'chatbot.sessions': {         // All conversation sessions
    [sessionId: string]: ConversationSession
  },
  'chatbot.currentSessionId': string, // Currently active session ID
  'chatbot.interfaceState': ChatInterfaceState, // UI state
  'chatbot.preferences': UserPreferences, // User preferences
  'chatbot.lastActiveTab': string // Last active tab for session restoration
}
```

## API Data Contracts

### Request/Response Models

#### Chat Request
```javascript
{
  query: string,                 // User's question
  selected_text?: string,        // Selected text (for contextual mode)
  include_sources?: boolean,     // Whether to include source information
  session_id?: string           // Session identifier for context
}
```

#### Chat Response
```javascript
{
  response: string,              // Bot's response
  sources?: Array<{             // Source documents (if include_sources=true)
    text: string,
    source: string,
    score?: number
  }>,
  session_id: string,           // Session identifier
  response_time: number         // Time taken to generate response
}
```

#### Selection Chat Request
```javascript
{
  query: string,                 // User's question about selected text
  selected_text: string,         // The selected text
  include_sources?: boolean      // Whether to include source information
}
```

## Validation Rules

### Message Validation
- `text` must be non-empty (1-2000 characters)
- `sender` must be one of 'user', 'bot', or 'system'
- `timestamp` must be a valid date/time
- `sources` array must not exceed 10 items if present

### Session Validation
- `messages` array must not exceed 1000 items
- `mode` must be either 'general' or 'contextual'
- `id` must be a valid UUID or unique string

### Interface State Validation
- `position.x` and `position.y` must be within viewport bounds
- `mode` must be either 'general' or 'contextual'
- `isOpen` and `isVisible` must be boolean values

## State Transitions

### Chat Interface States
```
[Hidden] <---> [Visible] <---> [Open] <---> [Minimized]
    ^              |              |            |
    |--------------|--------------|------------|
         Toggle visibility   Toggle open      Toggle minimize
```

### Message Flow
1. User sends message → Message added to current session
2. API request initiated → Interface state updates to "typing"
3. API response received → Bot message added to session
4. Error occurs → Error message added to session
5. Session saved to localStorage

## Data Relationships

### Session-Messages Relationship
- One `ConversationSession` contains many `ChatMessage` objects
- Messages are ordered chronologically within a session
- Session metadata references the messages it contains

### Interface-Session Relationship
- `ChatInterfaceState` references the currently active `ConversationSession`
- UI state changes may affect session properties (e.g., minimizing)
- Session changes may trigger UI state updates

## Performance Considerations

### Data Size Limits
- Individual messages: < 2KB text content
- Session history: Maximum 1000 messages per session
- Total stored sessions: Maximum 50 sessions in localStorage
- Source documents: Maximum 10 sources per response

### Caching Strategy
- Active session kept in memory (Context)
- Recent sessions cached in localStorage
- Session history purged after 30 days of inactivity
- Automatic cleanup of old sessions to maintain performance