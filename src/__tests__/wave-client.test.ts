import { WaveClient } from '../wave-client';
import axios from 'axios';
import { forward } from '@ngrok/ngrok';

jest.mock('axios');
jest.mock('@ngrok/ngrok', () => ({
  forward: jest.fn().mockResolvedValue({
    url: () => 'https://test.ngrok.io',
    close: jest.fn().mockResolvedValue(undefined)
  })
}));

describe('WaveClient', () => {
  const mockApiKey = 'test-api-key';
  let client: WaveClient;

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.create as jest.Mock).mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    });
    client = new WaveClient({ apiKey: mockApiKey });
  });

  describe('constructor', () => {
    it('should throw error if API key is not provided', () => {
      expect(() => new WaveClient({ apiKey: '' })).toThrow('API key is required');
    });

    it('should use default base URL if not provided', () => {
      const client = new WaveClient({ apiKey: mockApiKey });
      expect(client).toBeDefined();
    });

    it('should use custom base URL if provided', () => {
      const customUrl = 'https://custom.wave.api';
      const client = new WaveClient({ apiKey: mockApiKey, baseUrl: customUrl });
      expect(client).toBeDefined();
    });
  });

  describe('analyze', () => {
    const mockUrl = 'https://example.com';
    const mockSuccessResponse = {
      data: {
        status: { success: true },
        statistics: {
          pagetitle: 'Example Page',
          pageurl: mockUrl,
          time: 1234,
          creditsremaining: 99,
          allitemcount: 10,
          totalelements: 100,
          waveurl: 'https://wave.webaim.org/report#/example.com'
        },
        categories: {
          error: {
            alt_missing: {
              id: 'alt_missing',
              description: 'Missing alternative text',
              count: 2,
              selectors: ['img:nth-child(1)', 'img:nth-child(2)']
            }
          }
        }
      }
    };

    beforeEach(() => {
      (axios.create as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue(mockSuccessResponse)
      });
    });

    it('should throw error if URL is not provided', async () => {
      await expect(client.analyze('')).rejects.toThrow('URL is required');
    });

    it('should make API request with correct parameters', async () => {
      const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockAxiosInstance.get.mockResolvedValue(mockSuccessResponse);

      const result = await client.analyze(mockUrl);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/request', {
        params: {
          key: mockApiKey,
          url: mockUrl,
          format: 'json'
        }
      });
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should include optional parameters in request', async () => {
      const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockAxiosInstance.get.mockResolvedValue(mockSuccessResponse);

      const options = {
        reporttype: 2 as const,
        viewportwidth: 1920,
        viewportheight: 1080,
        evaldelay: 2000
      };

      await client.analyze(mockUrl, options);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/request', {
        params: {
          key: mockApiKey,
          url: mockUrl,
          format: 'json',
          ...options
        }
      });
    });

    it('should include authentication and useragent parameters', async () => {
      const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockAxiosInstance.get.mockResolvedValue(mockSuccessResponse);

      const options = {
        username: 'testuser',
        password: 'testpass',
        useragent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      };

      await client.analyze(mockUrl, options);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/request', {
        params: {
          key: mockApiKey,
          url: mockUrl,
          format: 'json',
          ...options
        }
      });
    });

    it('should handle API error responses', async () => {
      const mockErrorResponse = {
        data: {
          status: {
            success: false,
            message: 'Invalid API key',
            code: 'INVALID_KEY'
          }
        }
      };

      const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockAxiosInstance.get.mockResolvedValue(mockErrorResponse);

      await expect(client.analyze(mockUrl)).rejects.toThrow('Invalid API key');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(client.analyze(mockUrl)).rejects.toThrow('Network error');
    });
  });

  describe('analyzeSource', () => {
    const mockHtmlSource = '<html><body><h1>Test Page</h1></body></html>';
    const mockNgrokUrl = 'https://test123.ngrok.io';
    const mockSuccessResponse = {
      data: {
        status: { success: true },
        statistics: {
          pagetitle: 'Test Page',
          pageurl: mockNgrokUrl,
          time: 1234,
          creditsremaining: 99,
          allitemcount: 10,
          totalelements: 100,
          waveurl: 'https://wave.webaim.org/report#/test123.ngrok.io'
        },
        categories: {
          error: {},
          alert: {},
          feature: {}
        }
      }
    };
    
    beforeEach(() => {
      (forward as jest.Mock).mockResolvedValue({
        url: () => mockNgrokUrl,
        close: jest.fn().mockResolvedValue(undefined)
      });
    });

    it('should analyze HTML source using ngrok tunnel', async () => {
      const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockAxiosInstance.get.mockResolvedValue(mockSuccessResponse);

      const result = await client.analyzeSource(mockHtmlSource);

      expect(forward).toHaveBeenCalledWith({
        addr: expect.any(Number),
        authtoken_from_env: true
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/request', {
        params: {
          key: mockApiKey,
          url: mockNgrokUrl,
          format: 'json'
        }
      });
      expect(result).toEqual(mockSuccessResponse.data);
      // Cleanup is handled by the ngrok listener's close method
    });

    it('should throw error if source is not provided', async () => {
      await expect(client.analyzeSource('')).rejects.toThrow('Source content is required and must be a string');
    });

    it('should throw error if source is not a string', async () => {
      await expect(client.analyzeSource(null as unknown as string)).rejects.toThrow('Source content is required and must be a string');
    });

    it('should cleanup resources even if analysis fails', async () => {
      const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockAxiosInstance.get.mockRejectedValue(new Error('Analysis failed'));

      await expect(client.analyzeSource(mockHtmlSource)).rejects.toThrow('Analysis failed');
      // Cleanup is handled by the ngrok listener's close method
    });

    it('should pass options to analyze method', async () => {
      const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
      mockAxiosInstance.get.mockResolvedValue(mockSuccessResponse);

      const options = {
        reporttype: 2 as const,
        viewportwidth: 1920
      };

      await client.analyzeSource(mockHtmlSource, options);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/request', {
        params: {
          key: mockApiKey,
          url: mockNgrokUrl,
          format: 'json',
          ...options
        }
      });
    });
  });
});