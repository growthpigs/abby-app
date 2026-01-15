/**
 * App Configuration
 *
 * Central configuration for API, Cognito, and feature flags.
 * Uses EXPO_PUBLIC_ environment variables for environment-specific config.
 *
 * @see .env.development for development config
 * @see .env.production for production config
 * @see docs/BACKEND-INTEGRATION.md for integration status
 */

export const API_CONFIG = {
  /**
   * USE_REAL_API: Master switch for backend integration
   * Controlled via EXPO_PUBLIC_USE_REAL_API environment variable
   *
   * false = Use mock services (development)
   * true  = Use real API calls to backend
   */
  USE_REAL_API: process.env.EXPO_PUBLIC_USE_REAL_API === 'true',

  /** Backend base URL (from environment) */
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://dev.api.myaimatchmaker.ai',

  /** API version prefix (from environment) */
  API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',

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
  REGION: process.env.EXPO_PUBLIC_COGNITO_REGION || 'us-east-1',

  /** Cognito User Pool ID */
  USER_POOL_ID: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_l3JxaWpl5',

  /** Cognito App Client ID */
  CLIENT_ID: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '2ljj7mif1k7jjc2ajiq676fhm1',

  /** Token refresh threshold (refresh when less than this time remaining) */
  TOKEN_REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes
};

export const VOICE_CONFIG = {
  /**
   * Voice provider: OpenAI Realtime API via backend WebRTC.
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

/**
 * Timeout Configuration
 * Centralized timeout values for network requests, UI interactions, and demo mode.
 * Single source of truth to prevent scattered hardcoded values.
 *
 * SCOPE: This constant centralizes timeouts for:
 * - Service layer (AbbyRealtimeService, TokenManager)
 * - Main UI interactions (App.tsx, CoachIntroScreen)
 * - Demo mode simulations
 *
 * OUT OF SCOPE (intentionally separate):
 * - Screen-internal animation durations (see ANIMATION_DURATIONS in constants/layout.ts)
 * - Component-specific delays (HamburgerMenu, etc.)
 * - Service-specific overrides (QuestionsService, secureFetch defaults)
 */
export const TIMEOUTS = {
  /**
   * Network request timeouts (milliseconds)
   */
  NETWORK: {
    /** Standard API requests */
    STANDARD: 30000,
    /** Realtime voice API requests (longer for voice) */
    REALTIME: 20000,
    /** Availability checks (fast fail) */
    AVAILABILITY: 5000,
  },

  /**
   * UI interaction delays (milliseconds)
   */
  UI: {
    /** Scroll animation delay (for smooth auto-scroll) */
    SCROLL_DELAY: 100,
    /** Debounce input fields */
    INPUT_DEBOUNCE: 300,
    /** Toast/snackbar auto-dismiss */
    TOAST_DURATION: 3000,
  },

  /**
   * Demo mode simulation delays (milliseconds)
   */
  DEMO: {
    /** Minimum typing delay before message */
    TYPING_MIN: 1500,
    /** Maximum total typing delay (random between MIN and this value) */
    TYPING_MAX: 3000,
    /** Pause between messages */
    MESSAGE_PAUSE: 2000,
  },
} as const;

export const FEATURE_FLAGS = {
  /** Enable voice features (requires native build) */
  VOICE_ENABLED: process.env.EXPO_PUBLIC_VOICE_ENABLED === 'true',

  /** Show developer debug overlay */
  DEV_OVERLAY: process.env.EXPO_PUBLIC_DEV_OVERLAY === 'true' || __DEV__,

  /** Enable analytics */
  ANALYTICS_ENABLED: !__DEV__,

  /** Enable Sentry error reporting */
  SENTRY_ENABLED: !__DEV__,
};

export default {
  API: API_CONFIG,
  COGNITO: COGNITO_CONFIG,
  VOICE: VOICE_CONFIG,
  TIMEOUTS,
  FEATURES: FEATURE_FLAGS,
};
