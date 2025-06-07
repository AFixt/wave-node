export interface WaveOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface WaveAnalysisOptions {
  reporttype?: 1 | 2 | 3 | 4;
  format?: 'json' | 'xml';
  viewportwidth?: number;
  viewportheight?: number;
  evaldelay?: number;
  username?: string;
  password?: string;
  useragent?: string;
}

export interface WaveError {
  type: string;
  message: string;
}

export interface WaveItem {
  id: string;
  description: string;
  count: number;
  selectors?: string[];
  contrastdata?: Array<{
    fcolor: string;
    bcolor: string;
    contrastratio: string;
    fontsize: string;
    fontweight: string;
    bold: boolean;
    algorithm: string;
  }>;
  wcag?: Array<{
    name: string;
    link: string;
  }>;
}

export interface WaveCategories {
  error?: Record<string, WaveItem>;
  alert?: Record<string, WaveItem>;
  feature?: Record<string, WaveItem>;
  structure?: Record<string, WaveItem>;
  aria?: Record<string, WaveItem>;
  contrast?: Record<string, WaveItem>;
}

export interface WaveStatistics {
  pagetitle: string;
  pageurl: string;
  time: number;
  creditsremaining: number;
  allitemcount: number;
  totalelements: number;
  waveurl: string;
}

export interface WaveAnalysisResult {
  status: {
    success: boolean;
    httpstatuscode?: number;
  };
  statistics: WaveStatistics;
  categories: WaveCategories;
}

export interface WaveApiError extends Error {
  code?: string;
  statusCode?: number;
  response?: unknown;
}