/**
 * secureFetch - Secure HTTP client with timeout, retry, and error sanitization
 *
 * Security features:
 * - Request timeout (default 30s, max 60s)
 * - Sanitized error messages (no internal details exposed)
 * - Response size limits
 * - Request abort on timeout
 * - Automatic retry with exponential backoff for transient failures
 */

import { API_CONFIG } from '../config';
import { TokenManager } from '../services/TokenManager';
import { AuthService } from '../services/AuthService';

// Maximum allowed timeout (60 seconds)
const MAX_TIMEOUT_MS = 60000;

// Default timeout (30 seconds)
const DEFAULT_TIMEOUT_MS = 30000;

// Maximum response size (10MB)
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

// Retry configuration from central config
const RETRY_CONFIG = API_CONFIG.RETRY;

// HTTP status codes that should trigger a retry for idempotent methods (GET, HEAD, OPTIONS)
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

// For non-idempotent methods (POST, PUT, PATCH, DELETE), only retry on codes where
// we KNOW the server didn't process the request to avoid duplicate submissions
const SAFE_RETRY_STATUS_CODES_NON_IDEMPOTENT = new Set([408, 429, 503]);

// HTTP methods that are NOT safe to blindly retry (may cause duplicates)
const NON_IDEMPOTENT_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export interface SecureFetchOptions extends Omit<RequestInit, 'signal'> {
  /** Request timeout in milliseconds (default: 30000, max: 60000) */
  timeout?: number;
  /** Maximum response size in bytes (default: 10MB) */
  maxResponseSize?: number;
  /** Maximum retry attempts for transient failures (default: 3, set 0 to disable) */
  maxRetries?: number;
  /** Disable retry for this request */
  noRetry?: boolean;
  /** Skip automatic token refresh on 401 (use for auth endpoints) */
  skipTokenRefresh?: boolean;
  /** External AbortSignal for manual request cancellation (combined with timeout) */
  signal?: AbortSignal;
}

/**
 * Attempt to refresh the auth token
 * Returns new access token on success, null on failure
 *
 * IMPORTANT: AuthService.refreshToken() has its own mutex to prevent race conditions.
 * We rely on that mutex (SINGLE SOURCE OF TRUTH) rather than maintaining a duplicate here.
 * This ensures all token refresh logic is consolidated in AuthService.
 */
async function refreshAuthToken(): Promise<string | null> {
  try {
    const storedRefreshToken = await TokenManager.getRefreshToken();
    if (!storedRefreshToken) {
      if (__DEV__) console.log('[secureFetch] No refresh token available');
      return null;
    }

    // AuthService.refreshToken() has its own mutex - concurrent calls return the same promise
    const response = await AuthService.refreshToken();
    if (__DEV__) console.log('[secureFetch] Token refreshed successfully');
    // API expects ID token, not access token
    return response.idToken;
  } catch (error) {
    if (__DEV__) console.log('[secureFetch] Token refresh failed:', error);
    return null;
  }
}

/**
 * Calculate delay for retry attempt with exponential backoff
 */
function getRetryDelay(attempt: number): number {
  const baseDelay = RETRY_CONFIG.DELAY_MS;
  const multiplier = RETRY_CONFIG.BACKOFF_MULTIPLIER;
  // Exponential backoff: delay * multiplier^attempt (with some jitter)
  const delay = baseDelay * Math.pow(multiplier, attempt);
  // Add jitter of ±20% to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

/**
 * Check if an error/response should trigger a retry
 * @param error - The error that occurred (if any)
 * @param response - The response received (if any)
 * @param method - The HTTP method used (default: GET)
 */
function shouldRetry(error: unknown, response?: Response, method: string = 'GET'): boolean {
  const isNonIdempotent = NON_IDEMPOTENT_METHODS.has(method.toUpperCase());

  // For network errors, still retry but be cautious with non-idempotent methods
  // Only retry AbortError (timeout) as the request likely didn't reach server
  if (error instanceof Error) {
    if (error.name === 'AbortError') return true; // Timeout - request probably didn't complete
    // For non-idempotent methods, don't retry other network errors as request may have been sent
    if (isNonIdempotent) return false;
    if (error.message.includes('network') || error.message.includes('Network')) return true;
    if (error.message.includes('fetch')) return true;
  }

  // Retry on specific HTTP status codes
  if (response) {
    // For non-idempotent methods, use the restricted safe set
    const allowedCodes = isNonIdempotent
      ? SAFE_RETRY_STATUS_CODES_NON_IDEMPOTENT
      : RETRYABLE_STATUS_CODES;
    if (allowedCodes.has(response.status)) {
      return true;
    }
  }

  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface SecureFetchError {
  code: string;
  message: string;
  status?: number;
}

/**
 * Sanitize error messages to prevent information leakage
 */
function sanitizeError(error: unknown, status?: number): SecureFetchError {
  // Map common HTTP status codes to user-friendly messages
  const statusMessages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Resource not found',
    408: 'Request timed out',
    429: 'Too many requests. Please wait and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable',
    503: 'Service unavailable. Please try again later.',
    504: 'Server timed out. Please try again.',
  };

  if (status && statusMessages[status]) {
    return {
      code: `HTTP_${status}`,
      message: statusMessages[status],
      status,
    };
  }

  // Handle known error types
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return {
        code: 'TIMEOUT',
        message: 'Request timed out. Please try again.',
      };
    }

    if (error.message.includes('network') || error.message.includes('Network')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Generic error - don't expose internal details
  return {
    code: 'REQUEST_FAILED',
    message: 'Request failed. Please try again.',
  };
}

/**
 * Secure fetch wrapper with timeout, size limits, retry, and error sanitization
 */
export async function secureFetch(
  url: string,
  options: SecureFetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    maxResponseSize = MAX_RESPONSE_SIZE,
    maxRetries = RETRY_CONFIG.MAX_ATTEMPTS,
    noRetry = false,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  // Extract HTTP method for retry logic (default to GET)
  const httpMethod = (fetchOptions.method || 'GET').toUpperCase();

  // Enforce timeout limits
  const safeTimeout = Math.min(Math.max(timeout, 1000), MAX_TIMEOUT_MS);

  // Determine effective retry count
  const effectiveMaxRetries = noRetry ? 0 : maxRetries;

  // Check if already aborted before starting
  if (externalSignal?.aborted) {
    throw sanitizeError(new DOMException('Aborted', 'AbortError'));
  }

  let lastError: unknown = null;
  let lastResponse: Response | null = null;

  // Attempt request with retries
  for (let attempt = 0; attempt <= effectiveMaxRetries; attempt++) {
    // Check external signal before retry wait
    if (externalSignal?.aborted) {
      throw sanitizeError(new DOMException('Aborted', 'AbortError'));
    }

    // Wait before retry (skip on first attempt)
    if (attempt > 0) {
      const delay = getRetryDelay(attempt - 1);
      if (__DEV__) console.log(`[secureFetch] Retry ${attempt}/${effectiveMaxRetries} after ${delay}ms`);
      await sleep(delay);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), safeTimeout);

    // Forward external abort signal to our controller
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener('abort', onExternalAbort);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', onExternalAbort);

      // Check response size via Content-Length header
      const contentLength = response.headers.get('Content-Length');
      if (contentLength && parseInt(contentLength, 10) > maxResponseSize) {
        throw {
          code: 'RESPONSE_TOO_LARGE',
          message: 'Response exceeds size limit',
        };
      }

      // Check if we should retry this response (respects HTTP method idempotency)
      if (shouldRetry(null, response, httpMethod) && attempt < effectiveMaxRetries) {
        lastResponse = response;
        lastError = null;
        continue; // Try again
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', onExternalAbort);
      lastError = error;
      lastResponse = null;

      // Re-throw non-retryable sanitized errors immediately
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      // Check if we should retry this error (respects HTTP method idempotency)
      if (!shouldRetry(error, undefined, httpMethod) || attempt >= effectiveMaxRetries) {
        throw sanitizeError(error);
      }

      // Continue to retry
    }
  }

  // All retries exhausted
  if (lastResponse && RETRYABLE_STATUS_CODES.has(lastResponse.status)) {
    throw sanitizeError(null, lastResponse.status);
  }

  throw sanitizeError(lastError);
}

/**
 * Secure JSON fetch - fetches and parses JSON with all security features
 * Includes automatic token refresh on 401 responses
 */
export async function secureFetchJSON<T = unknown>(
  url: string,
  options: SecureFetchOptions = {}
): Promise<T> {
  const { skipTokenRefresh = false, ...fetchOptions } = options;

  let response = await secureFetch(url, fetchOptions);

  // Handle 401 with token refresh
  if (response.status === 401 && !skipTokenRefresh) {
    const newToken = await refreshAuthToken();

    if (newToken) {
      // Retry with new token
      const headers = new Headers(fetchOptions.headers);
      headers.set('Authorization', `Bearer ${newToken}`);

      response = await secureFetch(url, {
        ...fetchOptions,
        headers,
        skipTokenRefresh: true, // Prevent infinite refresh loop
      });
    }
  }

  if (!response.ok) {
    throw sanitizeError(null, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw {
      code: 'PARSE_ERROR',
      message: 'Invalid response format',
    };
  }
}

/**
 * Create a pre-configured secure fetch for API calls
 */
export function createSecureAPI(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
  return {
    async get<T = unknown>(
      path: string,
      options: SecureFetchOptions = {}
    ): Promise<T> {
      return secureFetchJSON<T>(`${baseUrl}${path}`, {
        ...options,
        method: 'GET',
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });
    },

    async post<T = unknown>(
      path: string,
      body?: unknown,
      options: SecureFetchOptions = {}
    ): Promise<T> {
      return secureFetchJSON<T>(`${baseUrl}${path}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    },

    async put<T = unknown>(
      path: string,
      body?: unknown,
      options: SecureFetchOptions = {}
    ): Promise<T> {
      return secureFetchJSON<T>(`${baseUrl}${path}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    },

    async delete<T = unknown>(
      path: string,
      options: SecureFetchOptions = {}
    ): Promise<T> {
      return secureFetchJSON<T>(`${baseUrl}${path}`, {
        ...options,
        method: 'DELETE',
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });
    },
  };
}

export default secureFetch;
