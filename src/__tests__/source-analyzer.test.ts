import { SourceAnalyzer } from '../source-analyzer';
import { forward } from '@ngrok/ngrok';

jest.mock('@ngrok/ngrok', () => ({
  forward: jest.fn().mockResolvedValue({
    url: () => 'https://test.ngrok.io',
    close: jest.fn().mockResolvedValue(undefined)
  })
}));

describe('SourceAnalyzer', () => {
  let analyzer: SourceAnalyzer;

  beforeEach(() => {
    analyzer = new SourceAnalyzer();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    // Clean up any open handles
    if (analyzer && analyzer['server']) {
      const server = analyzer['server'];
      if (server) {
        await new Promise<void>((resolve) => {
          server.close(() => resolve());
        });
      }
    }
  });

  describe('createServer', () => {
    it('should create a server and return ngrok URL', async () => {
      const mockNgrokUrl = 'https://abc123.ngrok.io';
      (forward as jest.Mock).mockResolvedValue({
        url: () => mockNgrokUrl,
        close: jest.fn().mockResolvedValue(undefined)
      });

      const htmlContent = '<html><body><h1>Test</h1></body></html>';
      const url = await analyzer.createServer(htmlContent);

      expect(url).toBe(mockNgrokUrl);
      expect(forward).toHaveBeenCalledWith({
        addr: expect.any(Number),
        authtoken_from_env: true
      });
    });

    it('should serve the provided HTML content', async () => {
      const mockNgrokUrl = 'https://abc123.ngrok.io';
      (forward as jest.Mock).mockResolvedValue({
        url: () => mockNgrokUrl,
        close: jest.fn().mockResolvedValue(undefined)
      });

      const htmlContent = '<html><body><h1>Test Page</h1></body></html>';
      const url = await analyzer.createServer(htmlContent);
      
      expect(url).toBe(mockNgrokUrl);
      
      // Verify the server was created
      expect(analyzer['server']).toBeDefined();
      expect(analyzer['port']).toBeGreaterThan(0);
      
      // Clean up the server
      await analyzer.cleanup();
    });

    it('should handle server creation errors', async () => {
      const error = new Error('Failed to connect to ngrok');
      (forward as jest.Mock).mockRejectedValue(error);

      await expect(analyzer.createServer('<html></html>')).rejects.toThrow(error);
    });
  });

  describe('cleanup', () => {
    it('should disconnect ngrok and close server', async () => {
      const mockNgrokUrl = 'https://abc123.ngrok.io';
      (forward as jest.Mock).mockResolvedValue({
        url: () => mockNgrokUrl,
        close: jest.fn().mockResolvedValue(undefined)
      });

      await analyzer.createServer('<html></html>');
      await analyzer.cleanup();

      // Cleanup handled by listener.close().toHaveBeenCalledWith(mockNgrokUrl);
      expect(analyzer.getUrl()).toBeNull();
    });

    it('should handle cleanup errors gracefully', async () => {
      const mockNgrokUrl = 'https://abc123.ngrok.io';
      (forward as jest.Mock).mockResolvedValue({
        url: () => mockNgrokUrl,
        close: jest.fn().mockRejectedValue(new Error('Disconnect failed'))
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzer.createServer('<html></html>');
      await analyzer.cleanup();

      expect(consoleSpy).toHaveBeenCalledWith('Error disconnecting ngrok:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getUrl', () => {
    it('should return ngrok URL when server is running', async () => {
      const mockNgrokUrl = 'https://abc123.ngrok.io';
      (forward as jest.Mock).mockResolvedValue({
        url: () => mockNgrokUrl,
        close: jest.fn().mockResolvedValue(undefined)
      });

      await analyzer.createServer('<html></html>');
      expect(analyzer.getUrl()).toBe(mockNgrokUrl);
    });

    it('should return null when no server is running', () => {
      expect(analyzer.getUrl()).toBeNull();
    });
  });
});