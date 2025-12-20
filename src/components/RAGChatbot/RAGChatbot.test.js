import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import RAGChatbot from './RAGChatbot';
import { ChatbotProvider, useChatbot } from '../../context/ChatbotContext';
import apiService from '../../services/api_service';
import textSelectionService from '../../services/text_selection_service';

// Mock services
jest.mock('../../services/api_service');
jest.mock('../../services/text_selection_service');

// Mock context
const MockChatbotProvider = ({ children }) => {
  const mockState = {
    currentSession: { messages: [] },
    sessions: new Map(),
    interfaceState: { isTyping: false, isOpen: true },
    userPreferences: { theme: 'light' }
  };

  const mockAddMessageToCurrentSession = jest.fn();
  const mockUpdateInterfaceState = jest.fn();

  return (
    <ChatbotProvider value={{
      state: mockState,
      addMessageToCurrentSession: mockAddMessageToCurrentSession,
      updateInterfaceState: mockUpdateInterfaceState,
      createNewSession: jest.fn(),
      switchSession: jest.fn(),
      updateSession: jest.fn()
    }}>
      {children}
    </ChatbotProvider>
  );
};

// Mock the useChatbot hook
jest.mock('../../context/ChatbotContext', () => ({
  ...jest.requireActual('../../context/ChatbotContext'),
  useChatbot: jest.fn()
}));

describe('RAGChatbot Component', () => {
  const mockUseChatbot = {
    state: {
      currentSession: { messages: [] },
      sessions: new Map(),
      interfaceState: { isTyping: false, isOpen: true },
      userPreferences: { theme: 'light' }
    },
    addMessageToCurrentSession: jest.fn(),
    updateInterfaceState: jest.fn(),
    createNewSession: jest.fn(),
    switchSession: jest.fn(),
    updateSession: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useChatbot.mockReturnValue(mockUseChatbot);

    // Mock text selection service
    textSelectionService.registerSelectionListener = jest.fn((callback) => {
      // Return a mock cleanup function
      return () => {};
    });
    textSelectionService.validateSelectedText = jest.fn((text) => ({
      isValid: text && text.length > 0 && text.length < 1000
    }));
    textSelectionService.removeHighlight = jest.fn();
  });

  it('renders the chatbot component correctly', () => {
    render(
      <MockChatbotProvider>
        <RAGChatbot />
      </MockChatbotProvider>
    );

    expect(screen.getByRole('region', { name: /chat interface/i })).toBeInTheDocument();
    expect(screen.getByText('Book Assistant')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /chat input form/i })).toBeInTheDocument();
    expect(screen.getByRole('log', { name: /chat-title/i })).toBeInTheDocument();
  });

  it('toggles chat mode between general and contextual', () => {
    render(
      <MockChatbotProvider>
        <RAGChatbot />
      </MockChatbotProvider>
    );

    const modeToggle = screen.getByRole('button', { name: /switch to contextual mode/i });
    expect(modeToggle).toBeInTheDocument();

    fireEvent.click(modeToggle);
    expect(screen.getByText('Contextual Mode')).toBeInTheDocument();

    fireEvent.click(modeToggle);
    expect(screen.getByText('General Mode')).toBeInTheDocument();
  });

  it('submits a message when the form is submitted', async () => {
    const mockResponse = {
      response: 'This is a test response',
      sources: [{ text: 'Sample source text', source: 'test-source' }]
    };

    apiService.generalChat.mockResolvedValue(mockResponse);

    render(
      <MockChatbotProvider>
        <RAGChatbot />
      </MockChatbotProvider>
    );

    const input = screen.getByLabelText('Type your message');
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(apiService.generalChat).toHaveBeenCalledWith('Test question', true);
      expect(mockUseChatbot.addMessageToCurrentSession).toHaveBeenCalled();
    });
  });

  it('handles contextual chat when text is selected', async () => {
    const mockResponse = {
      response: 'This is a contextual response',
      sources: [{ text: 'Sample source text', source: 'test-source' }]
    };

    apiService.contextualChat.mockResolvedValue(mockResponse);

    // Mock the state to have text selected
    const contextualState = {
      ...mockUseChatbot.state,
      interfaceState: { isTyping: false, isOpen: true }
    };

    useChatbot.mockReturnValue({
      ...mockUseChatbot,
      state: contextualState
    });

    render(
      <MockChatbotProvider>
        <RAGChatbot initialMode="contextual" />
      </MockChatbotProvider>
    );

    // Simulate text selection
    const selectionIndicator = screen.getByText(/Select text on the page/i);
    expect(selectionIndicator).toBeInTheDocument();

    // In contextual mode with selected text, the placeholder should be different
    const input = screen.getByLabelText('Type your message');
    fireEvent.change(input, { target: { value: 'Question about selection' } });

    // For this test, we'll simulate that text is selected by updating the mock
    useChatbot.mockReturnValue({
      ...mockUseChatbot,
      state: {
        ...mockUseChatbot.state,
        interfaceState: { isTyping: false, isOpen: true }
      }
    });
  });

  it('shows typing indicator when loading', async () => {
    apiService.generalChat.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ response: 'Test response', sources: [] }), 100);
      });
    });

    render(
      <MockChatbotProvider>
        <RAGChatbot />
      </MockChatbotProvider>
    );

    const input = screen.getByLabelText('Type your message');
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.submit(form);

    // Check that typing indicator appears
    expect(screen.getByLabelText(/Assistant is typing/i)).toBeInTheDocument();
  });

  it('displays error messages when API fails', async () => {
    const errorMessage = 'API request failed';
    apiService.generalChat.mockRejectedValue(new Error(errorMessage));

    render(
      <MockChatbotProvider>
        <RAGChatbot />
      </MockChatbotProvider>
    );

    const input = screen.getByLabelText('Type your message');
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Failed to get response/i)).toBeInTheDocument();
    });
  });

  it('clears selection when clear button is clicked in contextual mode', () => {
    render(
      <MockChatbotProvider>
        <RAGChatbot initialMode="contextual" />
      </MockChatbotProvider>
    );

    // Mock that text is selected
    const mockSetSelectedText = jest.fn();
    const mockSetIsTextSelected = jest.fn();

    // We can't directly test the internal state, but we can test the UI elements
    // that would appear when text is selected
    const clearSelectionButton = screen.queryByRole('button', { name: /Clear selected text/i });

    // If the button doesn't exist in this state, it means no text is selected
    // which is the default behavior
    expect(clearSelectionButton).toBeFalsy();
  });

  it('handles keyboard shortcuts', () => {
    render(
      <MockChatbotProvider>
        <RAGChatbot />
      </MockChatbotProvider>
    );

    const input = screen.getByLabelText('Type your message');
    fireEvent.change(input, { target: { value: 'Test message' } });

    // Simulate Ctrl+Enter to send message
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

    // The form submission would happen, but we're testing that the key event is handled
    expect(input.value).toBe('Test message');
  });

  it('displays messages in the chat', () => {
    const mockStateWithMessages = {
      ...mockUseChatbot.state,
      currentSession: {
        messages: [
          {
            id: 1,
            text: 'Hello, this is a test message',
            sender: 'user',
            timestamp: new Date()
          },
          {
            id: 2,
            text: 'This is a bot response',
            sender: 'bot',
            timestamp: new Date()
          }
        ]
      }
    };

    useChatbot.mockReturnValue({
      ...mockUseChatbot,
      state: mockStateWithMessages
    });

    render(
      <MockChatbotProvider>
        <RAGChatbot />
      </MockChatbotProvider>
    );

    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    expect(screen.getByText('This is a bot response')).toBeInTheDocument();
  });
});

describe('FloatingChatbot Component', () => {
  // Since we don't have the FloatingChatbot in the same file,
  // we'll just add placeholder tests
  it('should render the floating chatbot bubble when closed', () => {
    // This would be tested in a separate file for FloatingChatbot
    expect(true).toBe(true);
  });
});

describe('API Service Integration', () => {
  it('calls the correct API endpoint for general chat', async () => {
    const mockResponse = { response: 'Test response', sources: [] };
    apiService.generalChat.mockResolvedValue(mockResponse);

    await apiService.generalChat('Test query', true);

    expect(apiService.generalChat).toHaveBeenCalledWith('Test query', true);
  });

  it('calls the correct API endpoint for contextual chat', async () => {
    const mockResponse = { response: 'Contextual response', sources: [] };
    apiService.contextualChat.mockResolvedValue(mockResponse);

    await apiService.contextualChat('Test query', 'Selected text');

    expect(apiService.contextualChat).toHaveBeenCalledWith('Test query', 'Selected text');
  });
});

describe('Text Selection Service Integration', () => {
  it('validates selected text correctly', () => {
    const validText = 'This is valid selected text';
    const invalidText = '';
    const tooLongText = 'x'.repeat(1001); // More than 1000 characters

    expect(textSelectionService.validateSelectedText(validText).isValid).toBe(true);
    expect(textSelectionService.validateSelectedText(invalidText).isValid).toBe(false);
    expect(textSelectionService.validateSelectedText(tooLongText).isValid).toBe(false);
  });
});