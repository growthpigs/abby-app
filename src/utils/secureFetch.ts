/**
 * secureFetch - Secure HTTP client with timeout and error sanitization
 *
 * Security features:
 * - Request timeout (default 30s, max 60s)
 * - Sanitized error messages (no internal details exposed)
 * - Response size limits
 * - Request abort on timeout
 */

// Maximum allowed timeout (60 seconds)
const MAX_TIMEOUT_MS = 60000;

// Default timeout (30 seconds)
const DEFAULT_TIMEOUT_MS = 30000;

// Maximum response size (10MB)
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

export interface SecureFetchOptions extends RequestInit {
  /** Request timeout in milliseconds (default: 30000, max: 60000) */
  timeout?: number;
  /** Maximum response size in bytes (default: 10MB) */
  maxResponseSize?: number;
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
 * Secure fetch wrapper with timeout, size limits, and error sanitization
 */
export async function secureFetch(
  url: string,
  options: SecureFetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    maxResponseSize = MAX_RESPONSE_SIZE,
    ...fetchOptions
  } = options;

  // Enforce timeout limits
  const safeTimeout = Math.min(Math.max(timeout, 1000), MAX_TIMEOUT_MS);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), safeTimeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check response size via Content-Length header
    const contentLength = response.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength, 10) > maxResponseSize) {
      throw {
        code: 'RESPONSE_TOO_LARGE',
        message: 'Response exceeds size limit',
      };
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Re-throw sanitized errors
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }

    throw sanitizeError(error);
  }
}

/**
 * Secure JSON fetch - fetches and parses JSON with all security features
 */
export async function secureFetchJSON<T = unknown>(
  url: string,
  options: SecureFetchOptions = {}
): Promise<T> {
  const response = await secureFetch(url, options);

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
