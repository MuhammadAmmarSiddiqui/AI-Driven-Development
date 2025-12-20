import apiService from './api_service';

// Mock the global fetch function
global.fetch = jest.fn();

describe('APIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any cached configuration
    apiService.setConfig({ baseUrl: '/api' });
  });

  describe('General Chat', () => {
    it('makes a successful general chat request', async () => {
      const mockResponse = {
        response: 'This is a test response',
        sources: [{ text: 'Sample source', source: 'test-source' }],
        response_time: 0.5
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await apiService.generalChat('Test question', true);

      expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Test question',
          include_sources: true
        })
      });

      expect(result).toEqual(mockResponse);
    });

    it('handles general chat error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(apiService.generalChat('Test question')).rejects.toThrow(
        'API request failed: 500 Internal Server Error'
      );
    });

    it('handles network error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(apiService.generalChat('Test question')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Contextual Chat', () => {
    it('makes a successful contextual chat request', async () => {
      const mockResponse = {
        response: 'This is a contextual response',
        sources: [{ text: 'Sample source', source: 'test-source' }],
        response_time: 0.3
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await apiService.contextualChat('Test question', 'Selected text');

      expect(global.fetch).toHaveBeenCalledWith('/api/selection-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Test question',
          selected_text: 'Selected text',
          include_sources: true
        })
      });

      expect(result).toEqual(mockResponse);
    });

    it('handles contextual chat error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(apiService.contextualChat('Test question', 'Selected text')).rejects.toThrow(
        'API request failed: 400 Bad Request'
      );
    });
  });

  describe('Health Check', () => {
    it('makes a successful health check request', async () => {
      const mockResponse = { status: 'healthy', version: '1.0.0' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await apiService.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual(mockResponse);
    });

    it('handles health check error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      });

      await expect(apiService.healthCheck()).rejects.toThrow(
        'API request failed: 503 Service Unavailable'
      );
    });
  });

  describe('Configuration', () => {
    it('sets and uses custom configuration', async () => {
      const customConfig = {
        baseUrl: 'https://custom-api.example.com',
        headers: {
          'Authorization': 'Bearer token123',
          'Custom-Header': 'custom-value'
        }
      };

      apiService.setConfig(customConfig);

      const mockResponse = { response: 'Custom API response' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      await apiService.generalChat('Test question');

      expect(global.fetch).toHaveBeenCalledWith('https://custom-api.example.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123',
          'Custom-Header': 'custom-value'
        },
        body: JSON.stringify({
          query: 'Test question',
          include_sources: true
        })
      });
    });

    it('uses default configuration when none is set', async () => {
      const mockResponse = { response: 'Default API response' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      await apiService.generalChat('Test question');

      expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Test question',
          include_sources: true
        })
      });
    });
  });

  describe('Error Handling', () => {
    it('handles non-JSON response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      await expect(apiService.generalChat('Test question')).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('handles various HTTP error statuses', async () => {
      const errorCases = [
        { status: 400, statusText: 'Bad Request' },
        { status: 401, statusText: 'Unauthorized' },
        { status: 403, statusText: 'Forbidden' },
        { status: 404, statusText: 'Not Found' },
        { status: 500, statusText: 'Internal Server Error' }
      ];

      for (const errorCase of errorCases) {
        global.fetch.mockResolvedValue({
          ok: false,
          status: errorCase.status,
          statusText: errorCase.statusText
        });

        await expect(apiService.generalChat('Test question')).rejects.toThrow(
          `API request failed: ${errorCase.status} ${errorCase.statusText}`
        );
      }
    });
  });

  describe('Request Building', () => {
    it('builds correct request options', () => {
      const options = apiService._buildRequestOptions('POST', { query: 'test' });

      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.body).toBe(JSON.stringify({ query: 'test' }));
    });

    it('includes custom headers in request options', () => {
      apiService.setConfig({
        headers: { 'Authorization': 'Bearer token' }
      });

      const options = apiService._buildRequestOptions('POST', { query: 'test' });

      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.headers['Authorization']).toBe('Bearer token');
    });
  });
});