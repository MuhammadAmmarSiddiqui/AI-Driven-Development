/**
 * API Service for RAG Chatbot
 * Provides methods to communicate with the backend API
 */

class ApiService {
  constructor(baseURL = 'https://ammar67-src.hf.space/api') {
    this.baseURL = baseURL;
  }

  /**
   * Perform a general chat request
   * @param {string} query - The user's question
   * @param {boolean} includeSources - Whether to include source information
   * @returns {Promise<Object>} The API response
   */
  async generalChat(query, includeSources = true) {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        include_sources: includeSources
      })
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Perform a contextual chat request with selected text
   * @param {string} query - The user's question about selected text
   * @param {string} selectedText - The text the user selected
   * @returns {Promise<Object>} The API response
   */
  async contextualChat(query, selectedText) {
    const response = await fetch(`${this.baseURL}/selection-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        selected_text: selectedText
      })
    });

    if (!response.ok) {
      throw new Error(`Contextual chat request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Index a document
   * @param {string} sourcePath - Path to the document to index
   * @param {Object} metadata - Additional metadata for the document
   * @returns {Promise<Object>} The API response
   */
  async indexDocument(sourcePath, metadata = {}) {
    const response = await fetch(`${this.baseURL}/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_path: sourcePath,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error(`Index request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Retrieve relevant content based on a query
   * @param {string} query - The search query
   * @param {number} topK - Number of results to return
   * @returns {Promise<Object>} The API response
   */
  async retrieveContent(query, topK = 5) {
    const response = await fetch(`${this.baseURL}/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        top_k: topK
      })
    });

    if (!response.ok) {
      throw new Error(`Retrieve request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Check the health of the API
   * @returns {Promise<Object>} The API response
   */
  async healthCheck() {
    const response = await fetch(`${this.baseURL}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get the status of the indexing system
   * @returns {Promise<Object>} The API response
   */
  async getIndexStatus() {
    const response = await fetch(`${this.baseURL}/index-status`);

    if (!response.ok) {
      throw new Error(`Index status request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Validate if a response is properly grounded in context
   * @param {string} query - The original query
   * @param {string} response - The generated response
   * @param {Array} context - The context used to generate the response
   * @returns {Promise<Object>} The API response
   */
  async validateResponse(query, response, context) {
    const apiResponse = await fetch(`${this.baseURL}/validate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        response,
        context
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`Validate response request failed: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    return await apiResponse.json();
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for direct instantiation if needed
export { ApiService };