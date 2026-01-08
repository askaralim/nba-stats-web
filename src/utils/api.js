/**
 * API Utility
 * Centralized API client for handling standardized API responses
 */

import { API_BASE_URL } from '../config';

/**
 * Standard API response format:
 * Success: { success: true, data: {...}, timestamp: "..." }
 * Error: { success: false, error: { code, message, details }, timestamp: "..." }
 */

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, code, details = null, statusCode = null) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

/**
 * Parse API response and extract data or throw error
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed response data
 */
async function parseResponse(response) {
  const data = await response.json();

  // Handle success response
  if (data.success === true) {
    return data.data; // Extract data from wrapper
  }

  // Handle error response
  if (data.success === false && data.error) {
    const error = data.error;
    throw new APIError(
      error.message || 'An error occurred',
      error.code || 'UNKNOWN_ERROR',
      error.details,
      response.status
    );
  }

  // Fallback for legacy responses (backward compatibility)
  // If response doesn't have success field, assume it's the data directly
  if (data.success === undefined) {
    return data;
  }

  // Unknown response format
  throw new APIError(
    'Invalid API response format',
    'INVALID_RESPONSE',
    data,
    response.status
  );
}

/**
 * Make API request with standardized error handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Parsed response data with rate limit info
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);

    // Extract rate limit headers if present
    const rateLimitInfo = {
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      reset: response.headers.get('X-RateLimit-Reset')
    };

    // Handle HTTP errors (4xx, 5xx)
    if (!response.ok) {
      // Handle rate limit errors (429)
      if (response.status === 429) {
        try {
          const errorData = await response.json();
          if (errorData.success === false && errorData.error) {
            const error = errorData.error;
            const rateLimitError = new APIError(
              error.message || 'Too many requests, please try again later',
              'RATE_LIMIT_EXCEEDED',
              {
                ...error.details,
                retryAfter: error.retryAfter,
                rateLimitInfo
              },
              response.status
            );
            rateLimitError.retryAfter = error.retryAfter;
            throw rateLimitError;
          }
        } catch (parseError) {
          // If error response is not JSON, throw generic rate limit error
          const rateLimitError = new APIError(
            'Too many requests, please try again later',
            'RATE_LIMIT_EXCEEDED',
            { rateLimitInfo },
            response.status
          );
          rateLimitError.retryAfter = rateLimitInfo.reset ? 
            Math.ceil((new Date(rateLimitInfo.reset).getTime() - Date.now()) / 1000) : 60;
          throw rateLimitError;
        }
      }

      // Try to parse error response
      try {
        const errorData = await response.json();
        if (errorData.success === false && errorData.error) {
          const error = errorData.error;
          throw new APIError(
            error.message || `HTTP ${response.status}: ${response.statusText}`,
            error.code || 'HTTP_ERROR',
            error.details,
            response.status
          );
        }
      } catch (parseError) {
        // If error response is not JSON, throw generic error
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          null,
          response.status
        );
      }
    }

    const data = await parseResponse(response);
    
    // Attach rate limit info to response if available
    if (rateLimitInfo.limit) {
      data._rateLimit = rateLimitInfo;
    }
    
    return data;
  } catch (error) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError(
        'Network error: Unable to connect to server',
        'NETWORK_ERROR',
        error.message
      );
    }

    // Handle other errors
    throw new APIError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      error.message
    );
  }
}

/**
 * GET request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response data
 */
export async function apiGet(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: 'GET' });
}

/**
 * POST request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
export async function apiPost(endpoint, body = {}) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
export async function apiPut(endpoint, body = {}) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} Response data
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

/**
 * Get user-friendly error message from API error
 * @param {APIError|Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  if (error instanceof APIError) {
    return error.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Check if error is a specific error code
 * @param {APIError|Error} error - Error object
 * @param {string} code - Error code to check
 * @returns {boolean} True if error matches code
 */
export function isErrorCode(error, code) {
  return error instanceof APIError && error.code === code;
}

/**
 * Check if error is a rate limit error
 * @param {APIError|Error} error - Error object
 * @returns {boolean} True if error is rate limit error
 */
export function isRateLimitError(error) {
  return isErrorCode(error, 'RATE_LIMIT_EXCEEDED');
}

/**
 * Get retry after seconds from rate limit error
 * @param {APIError} error - Rate limit error
 * @returns {number|null} Seconds to wait before retrying, or null if not available
 */
export function getRetryAfter(error) {
  if (isRateLimitError(error)) {
    return error.retryAfter || null;
  }
  return null;
}

