import { 
  WaveOptions, 
  WaveAnalysisOptions, 
  WaveItem,
  WaveAnalysisResult,
  WaveApiError
} from '../types';

describe('Type definitions', () => {
  describe('WaveOptions', () => {
    it('should accept valid options', () => {
      const validOptions: WaveOptions = {
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
        timeout: 5000
      };
      
      expect(validOptions.apiKey).toBe('test-key');
      expect(validOptions.baseUrl).toBe('https://custom.api.com');
      expect(validOptions.timeout).toBe(5000);
    });

    it('should require apiKey', () => {
      const minimalOptions: WaveOptions = {
        apiKey: 'test-key'
      };
      
      expect(minimalOptions.apiKey).toBe('test-key');
      expect(minimalOptions.baseUrl).toBeUndefined();
      expect(minimalOptions.timeout).toBeUndefined();
    });
  });

  describe('WaveAnalysisOptions', () => {
    it('should accept all valid reporttype values', () => {
      const options1: WaveAnalysisOptions = { reporttype: 1 };
      const options2: WaveAnalysisOptions = { reporttype: 2 };
      const options3: WaveAnalysisOptions = { reporttype: 3 };
      const options4: WaveAnalysisOptions = { reporttype: 4 };
      
      expect(options1.reporttype).toBe(1);
      expect(options2.reporttype).toBe(2);
      expect(options3.reporttype).toBe(3);
      expect(options4.reporttype).toBe(4);
    });

    it('should accept format options', () => {
      const jsonFormat: WaveAnalysisOptions = { format: 'json' };
      const xmlFormat: WaveAnalysisOptions = { format: 'xml' };
      
      expect(jsonFormat.format).toBe('json');
      expect(xmlFormat.format).toBe('xml');
    });

    it('should accept all optional parameters', () => {
      const fullOptions: WaveAnalysisOptions = {
        reporttype: 2,
        format: 'json',
        viewportwidth: 1920,
        viewportheight: 1080,
        evaldelay: 2000,
        username: 'testuser',
        password: 'testpass',
        useragent: 'Mozilla/5.0'
      };
      
      expect(fullOptions.viewportwidth).toBe(1920);
      expect(fullOptions.viewportheight).toBe(1080);
      expect(fullOptions.evaldelay).toBe(2000);
      expect(fullOptions.username).toBe('testuser');
      expect(fullOptions.password).toBe('testpass');
      expect(fullOptions.useragent).toBe('Mozilla/5.0');
    });
  });

  describe('WaveItem', () => {
    it('should represent a basic wave item', () => {
      const item: WaveItem = {
        id: 'alt_missing',
        description: 'Missing alternative text',
        count: 3,
        selectors: ['img:nth-child(1)', 'img:nth-child(2)', 'img:nth-child(3)']
      };
      
      expect(item.id).toBe('alt_missing');
      expect(item.count).toBe(3);
      expect(item.selectors).toHaveLength(3);
    });

    it('should support contrast data', () => {
      const itemWithContrast: WaveItem = {
        id: 'contrast',
        description: 'Low contrast',
        count: 1,
        contrastdata: [{
          fcolor: '#777777',
          bcolor: '#FFFFFF',
          contrastratio: '3.5:1',
          fontsize: '14px',
          fontweight: 'normal',
          bold: false,
          algorithm: 'WCAG21'
        }]
      };
      
      expect(itemWithContrast.contrastdata).toBeDefined();
      expect(itemWithContrast.contrastdata![0].contrastratio).toBe('3.5:1');
    });

    it('should support WCAG references', () => {
      const itemWithWcag: WaveItem = {
        id: 'label_missing',
        description: 'Missing form label',
        count: 1,
        wcag: [{
          name: '1.3.1 Info and Relationships',
          link: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships'
        }]
      };
      
      expect(itemWithWcag.wcag).toBeDefined();
      expect(itemWithWcag.wcag![0].name).toContain('1.3.1');
    });
  });

  describe('WaveAnalysisResult', () => {
    it('should represent a complete analysis result', () => {
      const result: WaveAnalysisResult = {
        status: {
          success: true,
          httpstatuscode: 200
        },
        statistics: {
          pagetitle: 'Test Page',
          pageurl: 'https://example.com',
          time: 1500,
          creditsremaining: 95,
          allitemcount: 10,
          totalelements: 150,
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
          },
          alert: {},
          feature: {},
          structure: {},
          aria: {},
          contrast: {}
        }
      };
      
      expect(result.status.success).toBe(true);
      expect(result.statistics.creditsremaining).toBe(95);
      expect(result.categories.error).toBeDefined();
      expect(Object.keys(result.categories.error!).length).toBe(1);
    });

    it('should handle partial categories', () => {
      const result: WaveAnalysisResult = {
        status: { success: true },
        statistics: {
          pagetitle: 'Test',
          pageurl: 'https://test.com',
          time: 1000,
          creditsremaining: 100,
          allitemcount: 0,
          totalelements: 50,
          waveurl: 'https://wave.webaim.org/report#/test.com'
        },
        categories: {}
      };
      
      expect(result.categories.error).toBeUndefined();
      expect(result.categories.alert).toBeUndefined();
    });
  });

  describe('WaveApiError', () => {
    it('should extend Error with additional properties', () => {
      const error = new Error('Test error') as WaveApiError;
      error.code = 'TEST_ERROR';
      error.statusCode = 400;
      error.response = { message: 'Bad request' };
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.response).toEqual({ message: 'Bad request' });
    });
  });
});