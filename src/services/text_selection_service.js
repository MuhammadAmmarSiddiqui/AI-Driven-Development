/**
 * Text Selection Service for capturing user-selected text
 * This service handles text selection events and provides utilities for working with selected text
 */

class TextSelectionService {
  constructor() {
    this.selectedText = '';
    this.selectionStart = null;
    this.selectionEnd = null;
    this.selectedElement = null;
  }

  /**
   * Get the currently selected text on the page
   * @returns {string} The selected text
   */
  getSelectedText() {
    if (window.getSelection) {
      const selection = window.getSelection();
      return selection.toString().trim();
    } else if (document.selection && document.selection.type !== 'Control') {
      // For older IE versions
      return document.selection.createRange().text.trim();
    }
    return '';
  }

  /**
   * Get detailed information about the current text selection
   * @returns {Object} Selection details including text, start/end positions, and context
   */
  getSelectionDetails() {
    const selection = window.getSelection ? window.getSelection() :
                     document.selection ? document.selection.createRange() : null;

    if (!selection || selection.toString().trim() === '') {
      return {
        text: '',
        start: null,
        end: null,
        element: null,
        context: null
      };
    }

    const selectedText = selection.toString().trim();

    // Get the range for more detailed information
    let range = null;
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }

    return {
      text: selectedText,
      range: range,
      element: range ? range.commonAncestorContainer.parentElement : null,
      context: this.getContextAroundSelection(selection, range),
      rect: range ? range.getBoundingClientRect() : null
    };
  }

  /**
   * Get context around the selected text (surrounding text)
   * @param {Selection} selection - The current selection object
   * @param {Range} range - The range of the selection
   * @returns {Object} Context information
   */
  getContextAroundSelection(selection, range) {
    if (!range) return null;

    const container = range.commonAncestorContainer;
    const element = container.nodeType === 3 ? container.parentElement : container;

    // Get text content of the containing element
    const fullText = element ? element.textContent : '';
    const selectedText = selection.toString();

    // Find the position of selected text in the full text
    const startIndex = fullText.indexOf(selectedText);
    const endIndex = startIndex + selectedText.length;

    // Get context before and after the selection
    const contextBefore = fullText.substring(Math.max(0, startIndex - 100), startIndex);
    const contextAfter = fullText.substring(endIndex, Math.min(fullText.length, endIndex + 100));

    return {
      fullText: fullText,
      selectedText: selectedText,
      contextBefore: contextBefore,
      contextAfter: contextAfter,
      elementTag: element ? element.tagName : null,
      elementId: element ? element.id : null,
      elementClass: element ? element.className : null
    };
  }

  /**
   * Register event listeners for text selection
   * @param {Function} onSelectionChange - Callback function to execute when selection changes
   */
  registerSelectionListener(onSelectionChange) {
    const handleSelectionChange = () => {
      const selectionDetails = this.getSelectionDetails();

      if (selectionDetails.text) {
        // Only trigger callback if there's actually selected text
        if (typeof onSelectionChange === 'function') {
          onSelectionChange(selectionDetails);
        }
      }
    };

    // Add event listeners for mouseup and keyup events
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);

    // Return a function to remove the listeners
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }

  /**
   * Validate selected text for use in contextual chat
   * @param {string} text - The selected text to validate
   * @returns {Object} Validation result with isValid flag and message
   */
  validateSelectedText(text) {
    if (!text) {
      return {
        isValid: false,
        message: 'No text selected',
        errorType: 'empty_selection'
      };
    }

    // Check for minimum length
    if (text.length < 3) {
      return {
        isValid: false,
        message: 'Selected text is too short. Please select more text.',
        errorType: 'too_short',
        length: text.length
      };
    }

    // Check for maximum length
    if (text.length > 1000) {
      return {
        isValid: false,
        message: 'Selected text is too long. Please select a smaller portion.',
        errorType: 'too_long',
        length: text.length
      };
    }

    // Check for punctuation-only selections
    const cleanText = text.replace(/[^\w\s]/gi, '').trim();
    if (!cleanText) {
      return {
        isValid: false,
        message: 'Selected text contains only punctuation. Please select meaningful text.',
        errorType: 'punctuation_only'
      };
    }

    return {
      isValid: true,
      message: 'Selected text is valid for contextual chat',
      length: text.length
    };
  }

  /**
   * Highlight selected text in the UI
   * @param {string} highlightClass - CSS class to apply for highlighting
   */
  highlightSelection(highlightClass = 'selected-text-highlight') {
    const selection = window.getSelection();
    if (!selection.toString().trim()) return;

    const range = selection.getRangeAt(0);
    const newNode = document.createElement('span');
    newNode.className = highlightClass;

    range.surroundContents(newNode);
  }

  /**
   * Remove highlighting from selected text
   */
  removeHighlight(highlightClass = 'selected-text-highlight') {
    const highlightedElements = document.querySelectorAll(`.${highlightClass}`);
    highlightedElements.forEach(element => {
      const parent = element.parentNode;
      parent.replaceChild(element.firstChild, element);
      parent.normalize(); // Merge adjacent text nodes
    });
  }
}

// Export a singleton instance
const textSelectionService = new TextSelectionService();
export default textSelectionService;

// Also export the class for direct instantiation if needed
export { TextSelectionService };