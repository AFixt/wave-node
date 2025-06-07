import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  WaveOptions,
  WaveAnalysisOptions,
  WaveAnalysisResult,
  WaveApiError
} from './types';
import { SourceAnalyzer } from './source-analyzer';

export class WaveClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor(options: WaveOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://wave.webaim.org/api';

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: options.timeout || 30000,
      headers: {
        'User-Agent': 'wave-node/0.1.0'
      }
    });
  }

  async analyze(url: string, options: WaveAnalysisOptions = {}): Promise<WaveAnalysisResult> {
    if (!url) {
      throw new Error('URL is required');
    }

    const params = {
      key: this.apiKey,
      url: url,
      format: options.format || 'json',
      ...options
    };

    try {
      const response = await this.httpClient.get('/request', { params });

      if (options.format === 'xml') {
        return response.data;
      }

      return this.parseJsonResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private parseJsonResponse(data: unknown): WaveAnalysisResult {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    const dataObj = data as Record<string, unknown>;
    if (dataObj.status && (dataObj.status as Record<string, unknown>).success === false) {
      const status = dataObj.status as Record<string, unknown>;
      const error = new Error((status.message as string) || 'API request failed') as WaveApiError;
      error.code = status.code as string;
      throw error;
    }

    return data as WaveAnalysisResult;
  }

  private handleError(error: unknown): WaveApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const responseData = axiosError.response?.data as Record<string, unknown>;
      const waveError = new Error(
        (responseData?.message as string) ||
        axiosError.message ||
        'Unknown error occurred'
      ) as WaveApiError;

      waveError.statusCode = axiosError.response?.status;
      waveError.response = axiosError.response?.data;

      if (axiosError.code) {
        waveError.code = axiosError.code;
      }

      return waveError;
    }

    return error as WaveApiError;
  }

  getCreditsRemaining(): number | null {
    return null;
  }

  async analyzeSource(source: string, options: WaveAnalysisOptions = {}): Promise<WaveAnalysisResult> {
    if (!source || typeof source !== 'string') {
      throw new Error('Source content is required and must be a string');
    }

    const analyzer = new SourceAnalyzer();

    try {
      // Create local server and get ngrok URL
      const url = await analyzer.createServer(source);

      // Give the server a moment to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Analyze the ngrok URL
      const result = await this.analyze(url, options);

      return result;
    } finally {
      // Always cleanup resources
      await analyzer.cleanup();
    }
  }
}
