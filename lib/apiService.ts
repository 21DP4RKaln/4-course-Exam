/**
 * API service for handling API requests with proper error handling and caching
 */

// Default fetch options
const DEFAULT_OPTIONS: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    credentials: 'include',
  };
  
  // API response interface
  interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    code?: string;
    errors?: Record<string, string>;
  }
  
  /**
   * API error class for consistent error handling
   */
  export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly code?: string;
    public readonly errors?: Record<string, string>;
  
    constructor(
      message: string, 
      statusCode: number = 500, 
      code?: string, 
      errors?: Record<string, string>
    ) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.code = code;
      this.errors = errors;
    }
  }
  
  /**
   * Fetch wrapper with improved error handling and response parsing
   */
  async function fetchWithErrorHandling<T = any>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        ...options,
      });
  
      // Parse response as JSON
      const data = await response.json().catch(() => ({})) as ApiResponse<T>;
  
      // Handle API errors
      if (!response.ok) {
        throw new ApiError(
          data.message || 'An error occurred', 
          response.status,
          data.code,
          data.errors
        );
      }
  
      // Return data for success responses
      return data.data as T;
    } catch (error) {
      // Re-throw ApiErrors
      if (error instanceof ApiError) {
        throw error;
      }
  
      // Convert other errors to ApiError
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new ApiError(message);
    }
  }
  
  /**
   * API service with common HTTP methods
   */
  const apiService = {
    /**
     * GET request with caching support
     */
    get: <T = any>(url: string, cache?: RequestCache): Promise<T> => {
      return fetchWithErrorHandling<T>(url, {
        method: 'GET',
        cache: cache || 'no-store',
      });
    },
  
    /**
     * POST request
     */
    post: <T = any, D = any>(url: string, data?: D): Promise<T> => {
      return fetchWithErrorHandling<T>(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
  
    /**
     * PUT request
     */
    put: <T = any, D = any>(url: string, data?: D): Promise<T> => {
      return fetchWithErrorHandling<T>(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
  
    /**
     * PATCH request
     */
    patch: <T = any, D = any>(url: string, data?: D): Promise<T> => {
      return fetchWithErrorHandling<T>(url, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
  
    /**
     * DELETE request
     */
    delete: <T = any>(url: string): Promise<T> => {
      return fetchWithErrorHandling<T>(url, {
        method: 'DELETE',
      });
    },
  
    /**
     * Upload file(s)
     */
    upload: <T = any>(url: string, formData: FormData): Promise<T> => {
      return fetchWithErrorHandling<T>(url, {
        method: 'POST',
        // Don't set Content-Type header for multipart/form-data
        headers: {
          'Cache-Control': 'no-cache',
        },
        body: formData,
      });
    },
  };
  
  export default apiService;