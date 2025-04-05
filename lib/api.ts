import { NextResponse } from 'next/server';

/**
 * API error codes for consistent error handling
 */
export enum ApiErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'unauthorized',
  INVALID_CREDENTIALS = 'invalid_credentials',
  TOKEN_EXPIRED = 'token_expired',
  
  // Authorization errors
  FORBIDDEN = 'forbidden',
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  
  // Resource errors
  NOT_FOUND = 'not_found',
  ALREADY_EXISTS = 'already_exists',
  VALIDATION_ERROR = 'validation_error',
  
  // Database errors
  DATABASE_ERROR = 'database_error',
  RELATION_ERROR = 'relation_error',
  
  // General errors
  BAD_REQUEST = 'bad_request',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
}

/**
 * Standard API error response interface
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code: ApiErrorCode;
  errors?: Record<string, string> | null;
  debug?: any;
}

/**
 * Standard API success response interface
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Create a standard error response
 */
export function createErrorResponse(
  message: string,
  code: ApiErrorCode,
  status: number,
  errors?: Record<string, string> | null,
  debug?: any
) {
  const response: ApiErrorResponse = {
    success: false,
    message,
    code,
    ...(errors && { errors }),
  };
  
  // Add debug info in development mode
  if (process.env.NODE_ENV !== 'production' && debug) {
    response.debug = debug;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Create a successful response
 */
export function createSuccessResponse<T = any>(
  data: T,
  message?: string,
  status: number = 200
) {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Common error handlers for API routes
 */
export const ApiErrors = {
  unauthorized: (message: string = 'Authentication required') => 
    createErrorResponse(message, ApiErrorCode.UNAUTHORIZED, 401),
    
  forbidden: (message: string = 'Access denied') => 
    createErrorResponse(message, ApiErrorCode.FORBIDDEN, 403),
    
  notFound: (message: string = 'Resource not found') => 
    createErrorResponse(message, ApiErrorCode.NOT_FOUND, 404),
    
  badRequest: (message: string = 'Invalid request', errors?: Record<string, string>) => 
    createErrorResponse(message, ApiErrorCode.BAD_REQUEST, 400, errors),
    
  validationError: (errors: Record<string, string>) => 
    createErrorResponse('Validation failed', ApiErrorCode.VALIDATION_ERROR, 422, errors),
    
  internalError: (message: string = 'Internal server error', error?: any) => 
    createErrorResponse(message, ApiErrorCode.INTERNAL_SERVER_ERROR, 500, null, error),
    
  databaseError: (message: string = 'Database operation failed', error?: any) => 
    createErrorResponse(message, ApiErrorCode.DATABASE_ERROR, 500, null, error),
    
  conflict: (message: string = 'Resource already exists') => 
    createErrorResponse(message, ApiErrorCode.ALREADY_EXISTS, 409),
};

/**
 * API exception handler wrapper
 */
export async function withErrorHandling(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      return ApiErrors.internalError(error.message, error);
    }
    
    return ApiErrors.internalError('An unexpected error occurred', error);
  }
}

// Default fetch options
const DEFAULT_OPTIONS: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
  credentials: 'include',
};

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
 * API service with common HTTP methods for client-side requests
 */
export const apiService = {
  /**
   * GET request with caching support
   */
  get: async <T = any>(url: string, cache?: RequestCache): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        method: 'GET',
        cache: cache || 'no-store',
      });

      // Parse response as JSON
      const data = await response.json() as ApiSuccessResponse<T>;

      // Handle API errors
      if (!response.ok) {
        throw new ApiError(
          data.message || 'An error occurred', 
          response.status
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
  },

  /**
   * POST request
   */
  post: async <T = any, D = any>(url: string, data?: D): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json() as ApiSuccessResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'An error occurred', 
          response.status
        );
      }

      return responseData.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new ApiError(message);
    }
  },

  /**
   * PUT request
   */
  put: async <T = any, D = any>(url: string, data?: D): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json() as ApiSuccessResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'An error occurred', 
          response.status
        );
      }

      return responseData.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new ApiError(message);
    }
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(url: string): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...DEFAULT_OPTIONS,
        method: 'DELETE',
      });

      const responseData = await response.json() as ApiSuccessResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'An error occurred', 
          response.status
        );
      }

      return responseData.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new ApiError(message);
    }
  },

  /**
   * Upload file(s)
   */
  upload: async <T = any>(url: string, formData: FormData): Promise<T> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        // Don't set Content-Type header for multipart/form-data
        headers: {
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
        body: formData,
      });

      const responseData = await response.json() as ApiSuccessResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'An error occurred', 
          response.status
        );
      }

      return responseData.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new ApiError(message);
    }
  },
};