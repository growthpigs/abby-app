/**
 * App Configuration
 *
 * Central configuration for API, Cognito, and feature flags.
 * Controls whether app uses real backend or mocks.
 *
 * @see docs/BACKEND-INTEGRATION.md for integration status
 */

export const API_CONFIG = {
  /**
   * USE_REAL_API: Master switch for backend integration
   *
   * false = Use mock services (current state - backend blocked)
   * true  = Use real API calls to dev.api.myaimatchmaker.ai
   *
   * TESTING: Attempting to connect to real backend
   */
  USE_REAL_API: true,

  /** Backend base URL */
  BASE_URL: 'https://dev.api.myaimatchmaker.ai',

  /** API version prefix */
  API_VERSION: 'v1',

  /** Full API URL */
  get API_URL() {
    return `${this.BASE_URL}/${this.API_VERSION}`;
  },

  /** Request timeout in milliseconds */
  TIMEOUT_MS: 30000,

  /** Retry configuration */
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2,
  },
};

export const COGNITO_CONFIG = {
  /** AWS Region */
  REGION: 'us-east-1',

  /** Cognito User Pool ID */
  USER_POOL_ID: 'us-east-1_l3JxaWpl5',

  /** Cognito App Client ID */
  CLIENT_ID: '2ljj7mif1k7jjc2ajiq676fhm1',

  /** Token refresh threshold (refresh when less than this time remaining) */
  TOKEN_REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes
};

export const VOICE_CONFIG = {
  /**
   * Voice provider: 'openai_realtime' (backend) or 'elevenlabs' (legacy)
   *
   * The real backend uses OpenAI Realtime API via WebRTC.
   * ElevenLabs code exists for demo branch only.
   */
  PROVIDER: 'openai_realtime' as const,

  /** OpenAI Realtime API settings (via backend proxy) */
  OPENAI_REALTIME: {
    /** Get session via POST /v1/abby/realtime/session */
    SESSION_ENDPOINT: '/abby/realtime/session',
    /** Check availability via GET /v1/abby/realtime/available */
    AVAILABILITY_ENDPOINT: '/abby/realtime/available',
  },
};

export const FEATURE_FLAGS = {
  /** Enable voice features (requires native build) */
  VOICE_ENABLED: true,

  /** Show developer debug overlay */
  DEV_OVERLAY: __DEV__,

  /** Enable analytics */
  ANALYTICS_ENABLED: !__DEV__,

  /** Enable Sentry error reporting */
  SENTRY_ENABLED: !__DEV__,
};

export default {
  API: API_CONFIG,
  COGNITO: COGNITO_CONFIG,
  VOICE: VOICE_CONFIG,
  FEATURES: FEATURE_FLAGS,
};
