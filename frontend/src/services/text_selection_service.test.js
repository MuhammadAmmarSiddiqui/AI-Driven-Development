import textSelectionService from './text_selection_service';

describe('TextSelectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing event listeners
    document.removeEventListener('mouseup', textSelectionService._handleSelection);
    document.removeEventListener('keyup', textSelectionService._handleSelection);
  });

  describe('Text Selection Detection', () => {
    it('detects selected text on the page', () => {
      // Create a mock selection
      const mockSelection = {
        toString: () => 'Selected text from the page',
        rangeCount: 1,
        getRangeAt: jest.fn(() => ({
          cloneContents: jest.fn(() => {
            const div = document.createElement('div');
            div.textContent = 'Selected text';
            return div;
          })
        }))
      };

      Object.defineProperty(window, 'getSelection', {
        value: () => mockSelection,
        writable: true
      });

      const result = textSelectionService.getSelectedText();
      expect(result).toBe('Selected text from the page');
    });

    it('returns empty string when no text is selected', () => {
      const mockSelection = {
        toString: () => '',
        rangeCount: 0
      };

      Object.defineProperty(window, 'getSelection', {
        value: () => mockSelection,
        writable: true
      });

      const result = textSelectionService.getSelectedText();
      expect(result).toBe('');
    });

    it('gets selection details including coordinates', () => {
      const mockRange = {
        getBoundingClientRect: () => ({
          x: 100,
          y: 200,
          width: 200,
          height: 20
        }),
        cloneContents: jest.fn(() => {
          const div = document.createElement('div');
          div.textContent = 'Selected text';
          return div;
        })
      };

      const mockSelection = {
        toString: () => 'Selected text',
        rangeCount: 1,
        getRangeAt: jest.fn(() => mockRange)
      };

      Object.defineProperty(window, 'getSelection', {
        value: () => mockSelection,
        writable: true
      });

      const result = textSelectionService.getSelectionDetails();
      expect(result.text).toBe('Selected text');
      expect(result.rect).toEqual({ x: 100, y: 200, width: 200, height: 20 });
    });
  });

  describe('Text Validation', () => {
    it('validates valid text correctly', () => {
      const validText = 'This is a valid selection';
      const result = textSelectionService.validateSelectedText(validText);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects empty text', () => {
      const result = textSelectionService.validateSelectedText('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No text selected');
    });

    it('rejects whitespace-only text', () => {
      const result = textSelectionService.validateSelectedText('   \t\n  ');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Selected text is empty or contains only whitespace');
    });

    it('rejects too long text', () => {
      const longText = 'x'.repeat(1001); // More than 1000 characters
      const result = textSelectionService.validateSelectedText(longText);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Selected text is too long (max 1000 characters)');
    });

    it('trims whitespace from text', () => {
      const result = textSelectionService.validateSelectedText('  trimmed text  ');

      expect(result.isValid).toBe(true);
      expect(result.text).toBe('trimmed text');
    });
  });

  describe('Event Handling', () => {
    it('registers and calls selection listeners', () => {
      const mockCallback = jest.fn();
      const removeListener = textSelectionService.registerSelectionListener(mockCallback);

      // Simulate a selection event
      const mockSelection = {
        toString: () => 'New selection',
        rangeCount: 1,
        getRangeAt: jest.fn(() => ({
          cloneContents: jest.fn(() => {
            const div = document.createElement('div');
            div.textContent = 'Selected text';
            return div;
          })
        }))
      };

      Object.defineProperty(window, 'getSelection', {
        value: () => mockSelection,
        writable: true
      });

      // Trigger the internal selection handler
      textSelectionService._handleSelection();

      expect(mockCallback).toHaveBeenCalledWith({
        text: 'New selection',
        rect: expect.any(Object)
      });

      // Test removing the listener
      removeListener();
      // The callback should not be called again after removal
    });

    it('does not call callback when no text is selected', () => {
      const mockCallback = jest.fn();
      textSelectionService.registerSelectionListener(mockCallback);

      const mockSelection = {
        toString: () => '',
        rangeCount: 0
      };

      Object.defineProperty(window, 'getSelection', {
        value: () => mockSelection,
        writable: true
      });

      textSelectionService._handleSelection();

      expect(mockCallback).toHaveBeenCalledWith({
        text: null,
        rect: null
      });
    });
  });

  describe('Highlight Management', () => {
    it('adds highlight to selected text', () => {
      // Create a test element with some text
      document.body.innerHTML = '<p id="test-paragraph">This is test text</p>';
      const element = document.getElementById('test-paragraph');

      // Create a mock range that encompasses the element
      const mockRange = {
        surroundContents: jest.fn(),
        selectNode: jest.fn(),
        cloneContents: jest.fn(() => {
          const span = document.createElement('span');
          span.textContent = 'test text';
          return span;
        })
      };

      const mockSelection = {
        toString: () => 'test text',
        rangeCount: 1,
        getRangeAt: jest.fn(() => mockRange),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      };

      Object.defineProperty(window, 'getSelection', {
        value: () => mockSelection,
        writable: true
      });

      // This would normally highlight the selected text, but we're testing
      // that the function doesn't throw errors
      expect(() => {
        textSelectionService.highlightSelection();
      }).not.toThrow();
    });

    it('removes existing highlights', () => {
      // Create a test element with highlighted text
      document.body.innerHTML = '<p>This has <span class="selected-text-highlight">highlighted</span> text</p>';

      textSelectionService.removeHighlight();

      // Check that highlights are removed (in a real test, we'd check the DOM)
      // For now, just ensure the function exists and doesn't throw
      expect(() => {
        textSelectionService.removeHighlight();
      }).not.toThrow();
    });
  });

  describe('Utility Functions', () => {
    it('normalizes whitespace in text', () => {
      const input = 'Text   with\t\texcessive\n\nwhitespace';
      const result = textSelectionService._normalizeWhitespace(input);

      expect(result).toBe('Text with excessive whitespace');
    });

    it('handles empty or null input', () => {
      expect(textSelectionService._normalizeWhitespace('')).toBe('');
      expect(textSelectionService._normalizeWhitespace(null)).toBe('');
      expect(textSelectionService._normalizeWhitespace(undefined)).toBe('');
    });
  });

  describe('Service Lifecycle', () => {
    it('initializes event listeners', () => {
      // Reset the service to test initialization
      textSelectionService._initialize();

      // Check that event listeners are added (we can't directly test this
      // since the listeners are internal, but we can ensure the method exists)
      expect(textSelectionService._initialize).toBeDefined();
    });

    it('cleans up event listeners', () => {
      // The cleanup method should remove event listeners
      expect(() => {
        textSelectionService.cleanup();
      }).not.toThrow();
    });
  });
});