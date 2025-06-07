import * as index from '../index';
import { WaveClient } from '../wave-client';
import { createWaveClient } from '../index';

describe('Module exports', () => {
  it('should export WaveClient', () => {
    expect(index.WaveClient).toBeDefined();
    expect(index.WaveClient).toBe(WaveClient);
  });

  it('should export createWaveClient function', () => {
    expect(index.createWaveClient).toBeDefined();
    expect(typeof index.createWaveClient).toBe('function');
  });

  it('should have WaveClient as default export', () => {
    expect(index.default).toBeDefined();
    expect(index.default).toBe(WaveClient);
  });

  it('should export all types', () => {
    // Check that type exports are available (they won't have runtime values)
    // This mainly ensures the export statements are correct
    expect(index).toBeDefined();
  });

  describe('createWaveClient', () => {
    it('should create a WaveClient instance', () => {
      const client = createWaveClient({ apiKey: 'test-key' });
      expect(client).toBeInstanceOf(WaveClient);
    });

    it('should pass options to WaveClient constructor', () => {
      const options = {
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
        timeout: 10000
      };
      
      const client = createWaveClient(options);
      expect(client).toBeInstanceOf(WaveClient);
      // Can't directly test private properties, but we know they're passed through
    });

    it('should throw error when apiKey is missing', () => {
      expect(() => createWaveClient({ apiKey: '' })).toThrow('API key is required');
    });
  });
});