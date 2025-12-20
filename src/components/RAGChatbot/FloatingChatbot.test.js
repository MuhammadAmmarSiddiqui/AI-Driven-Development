import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FloatingChatbot from './FloatingChatbot';
import { ChatbotProvider, useChatbot } from '../../context/ChatbotContext';

// Mock context
jest.mock('../../context/ChatbotContext', () => ({
  useChatbot: jest.fn()
}));

describe('FloatingChatbot Component', () => {
  const mockState = {
    interfaceState: {
      isOpen: false,
      isMinimized: false,
      isVisible: true,
      mode: 'general',
      isTyping: false,
      selectedText: null,
      position: { x: 20, y: 20 }
    }
  };

  const mockUpdateInterfaceState = jest.fn();

  const mockUseChatbot = {
    state: mockState,
    updateInterfaceState: mockUpdateInterfaceState
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useChatbot.mockReturnValue(mockUseChatbot);
  });

  it('renders the floating chatbot bubble when chat is closed', () => {
    render(<FloatingChatbot />);

    // When chat is closed, the bubble should be visible
    expect(screen.getByRole('button', { name: /chatbot/i })).toBeInTheDocument();
  });

  it('opens the chat interface when bubble is clicked', () => {
    render(<FloatingChatbot />);

    const bubble = screen.getByRole('button', { name: /chatbot/i });
    fireEvent.click(bubble);

    expect(mockUpdateInterfaceState).toHaveBeenCalledWith({ isOpen: true });
  });

  it('closes the chat interface when close button is clicked', () => {
    // Mock state with chat open
    const openState = {
      ...mockState,
      interfaceState: {
        ...mockState.interfaceState,
        isOpen: true
      }
    };

    useChatbot.mockReturnValue({
      ...mockUseChatbot,
      state: openState
    });

    render(<FloatingChatbot />);

    // When chat is open, the close button should be visible
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    expect(mockUpdateInterfaceState).toHaveBeenCalledWith({ isOpen: false });
  });

  it('minimizes the chat when minimize button is clicked', () => {
    // Mock state with chat open
    const openState = {
      ...mockState,
      interfaceState: {
        ...mockState.interfaceState,
        isOpen: true
      }
    };

    useChatbot.mockReturnValue({
      ...mockUseChatbot,
      state: openState
    });

    render(<FloatingChatbot />);

    // When chat is open, the minimize button should be visible
    const minimizeButton = screen.getByRole('button', { name: /Minimize/i });
    fireEvent.click(minimizeButton);

    expect(mockUpdateInterfaceState).toHaveBeenCalledWith({ isMinimized: true });
  });

  it('shows the chat window when open and not minimized', () => {
    // Mock state with chat open and not minimized
    const openState = {
      ...mockState,
      interfaceState: {
        ...mockState.interfaceState,
        isOpen: true,
        isMinimized: false
      }
    };

    useChatbot.mockReturnValue({
      ...mockUseChatbot,
      state: openState
    });

    render(<FloatingChatbot />);

    // Should show the chat window
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Book Assistant')).toBeInTheDocument();
  });

  it('hides the chat window when minimized', () => {
    // Mock state with chat open but minimized
    const minimizedState = {
      ...mockState,
      interfaceState: {
        ...mockState.interfaceState,
        isOpen: true,
        isMinimized: true
      }
    };

    useChatbot.mockReturnValue({
      ...mockUseChatbot,
      state: minimizedState
    });

    render(<FloatingChatbot />);

    // Should not show the chat window when minimized
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('hides the bubble when chat is open', () => {
    // Mock state with chat open
    const openState = {
      ...mockState,
      interfaceState: {
        ...mockState.interfaceState,
        isOpen: true,
        isMinimized: false
      }
    };

    useChatbot.mockReturnValue({
      ...mockUseChatbot,
      state: openState
    });

    render(<FloatingChatbot />);

    // Should not show the bubble when chat is open
    expect(screen.queryByRole('button', { name: /chatbot/i })).not.toBeInTheDocument();
  });
});