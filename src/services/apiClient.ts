/**
 * API Client Service for Astral Core
 * Centralized HTTP client with authentication, error handling, and retry logic
 */

import { auth0Service } from './auth0Service';
import { getEnv } from '../utils/envValidator';

// API Configuration
const API_BASE_URL = getEnv('VITE_API_BASE_URL') || 'http://localhost:3847/api';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Request/Response Types
type ApiParamValue = string | number | boolean;

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, ApiParamValue>;
  timeout?: number;
  retries?: number;
  withAuth?: boolean;
  signal?: AbortSignal;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: string;
}

// Custom API Error
export class AstralCoreApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
  timestamp: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'AstralCoreApiError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
    this.timestamp = error.timestamp;
  }
}

/**
 * Astral Core API Client
 */
class ApiClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly abortControllers: Map<string, AbortController>;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-App-Name': 'Astral-Core',
      'X-App-Version': '2.0.0',
    };
    this.abortControllers = new Map();
  }

  /**
   * Make an API request
   */
  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = API_TIMEOUT,
      retries = MAX_RETRIES,
      withAuth = true,
      signal,
    } = config;

    // Build URL with query params
    const url = this.buildURL(endpoint, params);

    // Prepare headers
    const requestHeaders = await this.prepareHeaders(headers, withAuth);

    // Create abort controller for timeout
    const abortController = new AbortController();
    const requestId = this.generateRequestId();
    this.abortControllers.set(requestId, abortController);

    // Set timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    try {
      // Make request with retry logic
      const response = await this.fetchWithRetry(
        url,
        {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: signal || abortController.signal,
          credentials: 'include', // Include cookies
        },
        retries
      );

      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);

      // Parse response
      const data = await this.parseResponse<T>(response);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    config?: Omit<ApiRequestConfig, 'method' | 'body' | 'params'>
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'GET',
      params,
    });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body,
    });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body,
    });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body,
    });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, 'method'>
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
    return response.data;
  }

  /**
   * Upload file
   */
  async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Get auth token
    const token = await auth0Service.getAccessToken();
    
    // Make request with XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(this.handleError(new Error(xhr.statusText)));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(this.handleError(new Error('Network error')));
      });

      // Open and send request
      xhr.open('POST', this.buildURL(endpoint));
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('X-App-Name', 'Astral-Core');
      xhr.send(formData);
    });
  }

  /**
   * Download file
   */
  async download(
    endpoint: string,
    filename?: string,
    config?: Omit<ApiRequestConfig, 'method'>
  ): Promise<void> {
    const response = await this.request(endpoint, {
      ...config,
      method: 'GET',
      headers: {
        ...config?.headers,
        'Content-Type': 'application/octet-stream',
      },
    });

    // Create blob from response
    const blob = new Blob([response.data]);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Cancel request
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel all requests
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Prepare request headers
   */
  private async prepareHeaders(
    customHeaders: Record<string, string>,
    withAuth: boolean
  ): Promise<Record<string, string>> {
    const headers = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    // Add authentication token
    if (withAuth) {
      const token = await auth0Service.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add request ID for tracking
    headers['X-Request-ID'] = this.generateRequestId();

    // Add crisis mode header if active
    const crisisMode = this.checkCrisisMode();
    if (crisisMode) {
      headers['X-Crisis-Override'] = 'true';
    }

    return headers;
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number
  ): Promise<Response> {
    let lastError: any;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, options);

        // Check if response is ok
        if (response.ok) {
          return response;
        }

        // Handle specific HTTP errors
        if (response.status === 401) {
          // Try to refresh token
          await auth0Service.refreshToken();
          // Update auth header and retry
          if (options.headers && options.headers instanceof Headers) {
            const token = await auth0Service.getAccessToken();
            if (token) {
              options.headers.set('Authorization', `Bearer ${token}`);
            }
          }
        } else if (response.status === 429) {
          // Rate limited - wait before retry
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY * (i + 1);
          await this.delay(delay);
        } else if (response.status >= 500) {
          // Server error - retry with exponential backoff
          if (i < retries) {
            await this.delay(RETRY_DELAY * Math.pow(2, i));
          }
        } else {
          // Client error - don't retry
          return response;
        }
      } catch (error) {
        lastError = error;
        
        // Network error - retry with exponential backoff
        if (i < retries) {
          await this.delay(RETRY_DELAY * Math.pow(2, i));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Parse response
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/')) {
      return await response.text() as unknown as T;
    } else {
      return await response.blob() as unknown as T;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown): AstralCoreApiError {
    // Type guard for Error with name property
    if (error instanceof Error) {
      // Abort error
      if (error.name === 'AbortError') {
        return new AstralCoreApiError({
          message: 'Request was cancelled',
          code: 'REQUEST_CANCELLED',
          timestamp: new Date().toISOString(),
        });
      }

      // Network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return new AstralCoreApiError({
          message: 'Network error - please check your connection',
          code: 'NETWORK_ERROR',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // API error response with type guard
    const errorWithResponse = error as any;
    if (errorWithResponse?.response) {
      return new AstralCoreApiError({
        message: errorWithResponse.response.data?.message || errorWithResponse.message || 'Request failed',
        status: errorWithResponse.response.status,
        code: errorWithResponse.response.data?.code,
        details: errorWithResponse.response.data?.details,
        timestamp: new Date().toISOString(),
      });
    }

    // Generic error
    const errorMessage = error instanceof Error ? error.message : 
                        (typeof error === 'string' ? error : 'An unexpected error occurred');
    
    return new AstralCoreApiError({
      message: errorMessage,
      code: 'UNKNOWN_ERROR',
      details: error,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Check if crisis mode is active
   */
  private checkCrisisMode(): boolean {
    // Check localStorage or state for crisis mode
    return localStorage.getItem('astralcore_crisis_mode') === 'true';
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  upload: apiClient.upload.bind(apiClient),
  download: apiClient.download.bind(apiClient),
  cancel: apiClient.cancelRequest.bind(apiClient),
  cancelAll: apiClient.cancelAllRequests.bind(apiClient),
};

export default apiClient;
