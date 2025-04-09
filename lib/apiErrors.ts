import { NextResponse } from 'next/server'

export enum ErrorType {
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  BAD_REQUEST = 'bad_request',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  VALIDATION_ERROR = 'validation_error',
}

export interface ApiError {
  error: {
    type: ErrorType,
    message: string,
    details?: Record<string, unknown>
  }
}

/**
 * 
 */
export function createErrorResponse(
  type: ErrorType,
  message: string,
  details?: Record<string, unknown>,
  status = getStatusCodeForErrorType(type)
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        type,
        message,
        ...(details && { details }),
      },
    },
    { status }
  )
}

/**
 * Maps error types to HTTP status codes.
 */
function getStatusCodeForErrorType(type: ErrorType): number {
  switch (type) {
    case ErrorType.UNAUTHORIZED:
      return 401
    case ErrorType.FORBIDDEN:
      return 403
    case ErrorType.NOT_FOUND:
      return 404
    case ErrorType.BAD_REQUEST:
    case ErrorType.VALIDATION_ERROR:
      return 400
    case ErrorType.INTERNAL_SERVER_ERROR:
    default:
      return 500
  }
}

/**
 * Creates a 401 Unauthorized response.
 */
export function createUnauthorizedResponse(message = 'Authentication required') {
  return createErrorResponse(ErrorType.UNAUTHORIZED, message)
}

/**
 * Creates a 403 Forbidden response.
 */
export function createForbiddenResponse(message = 'No right of access') {
  return createErrorResponse(ErrorType.FORBIDDEN, message)
}

/**
 * Creates a 404 Not Found response.
 */
export function createNotFoundResponse(message = 'Resource not found') {
  return createErrorResponse(ErrorType.NOT_FOUND, message)
}

/**
 * Creates a 400 Bad Request response.
 */
export function createBadRequestResponse(message = 'Incorrect request', details?: Record<string, unknown>) {
  return createErrorResponse(ErrorType.BAD_REQUEST, message, details)
}

/**
 * Creates a 422 Validation Error response.
 */
export function createValidationErrorResponse(message = 'Validation error', details?: Record<string, unknown>) {
  return createErrorResponse(ErrorType.VALIDATION_ERROR, message, details)
}

/**
 * Creates a 500 Internal Server Error response.
 */
export function createServerErrorResponse(message = 'Server error', details?: Record<string, unknown>) {
  return createErrorResponse(ErrorType.INTERNAL_SERVER_ERROR, message, details)
}