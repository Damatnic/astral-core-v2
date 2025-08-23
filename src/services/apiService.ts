/**
 * Enhanced API Service for Astral Core
 * Provides a robust HTTP client with retry logic, caching, and error handling
 */

import { auth0Service } from './auth0Service';

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
  skipAuth?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

class ApiService {
  private config: ApiConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();
  private interceptors = {
    request: [] as Array<(config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>>,
    response: [] as Array<(response: ApiResponse) => ApiResponse | Promise<ApiResponse>>,
    error: [] as Array<(error: ApiError) => ApiError | Promise<ApiError>>
  };

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      cache: true,
      cacheTTL: 300000, // 5 minutes
      ...config
    };

    // Add default interceptors
    this.setupDefaultInterceptors();
  }

  /**
   * Setup default interceptors for auth and error handling
   */
  private setupDefaultInterceptors() {
    // Add auth token to requests
    this.addRequestInterceptor(async (config) => {
      if (!config.skipAuth) {
        const token = await auth0Service.getAccessToken();
        if (token) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
          };
        }
      }
      return config;
    });

    // Handle 401 errors
    this.addErrorInterceptor(async (error) => {
      if (error.status === 401) {
        // Try to refresh token
        try {
          await auth0Service.refreshToken();
          // Retry the original request
          return error;
        } catch (refreshError) {
          // Redirect to login
          await auth0Service.logout();
        }
      }
      return error;
    });
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>) {
    this.interceptors.request.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>) {
    this.interceptors.response.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: (error: ApiError) => ApiError | Promise<ApiError>) {
    this.interceptors.error.push(interceptor);
  }

  /**
   * Make HTTP request with retry logic and caching
   */
  async request<T = any>(url: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.interceptors.request) {
      finalConfig = await interceptor(finalConfig);
    }

    // Check cache for GET requests
    const cacheKey = this.getCacheKey(url, finalConfig);
    if (finalConfig.method === 'GET' || !finalConfig.method) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { data: cached, status: 200, headers: new Headers(), ok: true };
      }

      // Check for pending request to prevent duplicate calls
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        return pending as Promise<ApiResponse<T>>;
      }
    }

    // Create request promise
    const requestPromise = this.executeRequest<T>(url, finalConfig);

    // Store as pending for deduplication
    if (finalConfig.method === 'GET' || !finalConfig.method) {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    try {
      const response = await requestPromise;
      
      // Apply response interceptors
      let finalResponse = response;
      for (const interceptor of this.interceptors.response) {
        finalResponse = await interceptor(finalResponse);
      }

      // Cache successful GET responses
      if ((finalConfig.method === 'GET' || !finalConfig.method) && finalResponse.ok) {
        this.setCache(cacheKey, finalResponse.data, finalConfig.cacheTTL);
      }

      return finalResponse;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest<T>(url: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url, config.params);
    const retries = config.retries ?? this.config.retries ?? 3;
    const retryDelay = this.config.retryDelay ?? 1000;
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = config.timeout ?? this.config.timeout ?? 30000;
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(fullUrl, {
          method: config.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers
          },
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Parse response
        let data: T;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text() as unknown as T;
        }

        // Handle HTTP errors
        if (!response.ok) {
          const error: ApiError = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            details: data
          };

          // Apply error interceptors
          let finalError = error;
          for (const interceptor of this.interceptors.error) {
            finalError = await interceptor(finalError);
          }

          // Retry on 5xx errors
          if (response.status >= 500 && attempt < retries) {
            lastError = finalError;
            await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
            continue;
          }

          throw finalError;
        }

        return {
          data,
          status: response.status,
          headers: response.headers,
          ok: response.ok
        };

      } catch (error) {
        // Handle network errors with proper type guards
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = {
              message: 'Request timeout',
              code: 'TIMEOUT'
            };
          } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
            lastError = {
              message: 'Network error',
              code: 'NETWORK_ERROR'
            };
          } else {
            lastError = {
              message: error.message,
              code: 'UNKNOWN_ERROR'
            };
          }
        } else {
          lastError = {
            message: typeof error === 'string' ? error : 'Unknown error occurred',
            code: 'UNKNOWN_ERROR'
          };
        }

        // Retry on network errors
        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt));
          continue;
        }

        // Apply error interceptors
        let finalError = lastError;
        if (finalError) {
          for (const interceptor of this.interceptors.error) {
            finalError = await interceptor(finalError);
          }
          throw finalError;
        } else {
          throw new Error('Request failed');
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = path.startsWith('http') ? path : `${this.config.baseURL}${path}`;
    
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(url: string, config: ApiRequestConfig): string {
    return `${config.method || 'GET'}:${url}:${JSON.stringify(config.params || {})}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache(key: string): any | null {
    if (!this.config.cache) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const ttl = this.config.cacheTTL ?? 300000;
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: any, ttl?: number): void {
    if (!this.config.cache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean old cache entries
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      const now = Date.now();
      const effectiveTTL = ttl ?? this.config.cacheTTL ?? 300000;
      
      entries.forEach(([key, value]) => {
        if (now - value.timestamp > effectiveTTL) {
          this.cache.delete(key);
        }
      });
    }
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const keys = Array.from(this.cache.keys());
      keys.forEach(key => {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  async get<T = any>(url: string, params?: Record<string, any>, config?: ApiRequestConfig): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'GET', params });
    return response.data;
  }

  async post<T = any>(url: string, body?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'POST', body });
    return response.data;
  }

  async put<T = any>(url: string, body?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'PUT', body });
    return response.data;
  }

  async patch<T = any>(url: string, body?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'PATCH', body });
    return response.data;
  }

  async delete<T = any>(url: string, config?: ApiRequestConfig): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'DELETE' });
    return response.data;
  }
}

// Create and export default instance
import { ENV } from '../utils/envConfig';

const apiService = new ApiService({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  retries: 3,
  cache: true,
  cacheTTL: 5 * 60 * 1000 // 5 minutes
});

// Export for crisis endpoints (with different config)
export const crisisApiService = new ApiService({
  baseURL: ENV.API_BASE_URL,
  timeout: 60000, // Longer timeout for crisis
  retries: 5, // More retries for crisis
  cache: true,
  cacheTTL: 60 * 60 * 1000 // 1 hour cache for crisis resources
});

export default apiService;