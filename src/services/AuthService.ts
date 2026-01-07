/**
 * AuthService - Authentication API client
 *
 * Handles all authentication operations against the MyAIMatchmaker API.
 * Currently stubbed with mock responses - will connect to real API when credentials provided.
 *
 * BLOCKER STATUS: Waiting for client API credentials
 * - Signup endpoint returns 401 (should be public)
 * - Cannot test without test user or admin access
 * - See: docs/API-TEST-RESULTS.md
 *
 * API Spec: https://dev.api.myaimatchmaker.ai/docs
 */

import { TokenManager } from './TokenManager';

const API_BASE_URL = 'https://dev.api.myaimatchmaker.ai/v1';
const COGNITO_CLIENT_ID = '2ljj7mif1k7jjc2ajiq676fhm1';

// ========================================
// Types (matching client API spec)
// ========================================

export interface SignupRequest {
  clientId: string;
  username: string; // Email address
  password: string;
  userAttributes: {
    email: string;
    name: string;
    preferred_username: string;
  };
}

export interface SignupResponse {
  userSub: string;
  codeDeliveryDetails: {
    destination: string;
    deliveryMedium: 'EMAIL' | 'SMS';
    attributeName: string;
  };
}

export interface VerifyRequest {
  clientId: string;
  username: string;
  confirmationCode: string;
}

export interface VerifyResponse {
  message: string;
}

export interface LoginRequest {
  clientId: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RefreshTokenRequest {
  clientId: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// ========================================
// Service Implementation
// ========================================

export const AuthService = {
  /**
   * Sign up a new user
   * POST /v1/auth/signup
   *
   * CURRENT STATUS: Stubbed - real endpoint returns 401 Unauthorized
   */
  async signup(
    email: string,
    password: string,
    name: string
  ): Promise<SignupResponse> {
    if (__DEV__) {
      console.log('[AuthService] signup() called (STUBBED)');
      console.log('[AuthService] Email:', email);
    }

    // TODO: Replace with real API call when credentials available
    // const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     clientId: COGNITO_CLIENT_ID,
    //     username: email,
    //     password,
    //     userAttributes: {
    //       email,
    //       name,
    //       preferred_username: email.split('@')[0],
    //     },
    //   } as SignupRequest),
    // });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful signup response
    return {
      userSub: 'mock-user-sub-12345',
      codeDeliveryDetails: {
        destination: email,
        deliveryMedium: 'EMAIL',
        attributeName: 'email',
      },
    };
  },

  /**
   * Verify email with confirmation code
   * POST /v1/auth/verify
   *
   * CURRENT STATUS: Stubbed - cannot test without signup working
   */
  async verify(email: string, code: string): Promise<VerifyResponse> {
    if (__DEV__) {
      console.log('[AuthService] verify() called (STUBBED)');
      console.log('[AuthService] Email:', email);
      console.log('[AuthService] Code:', code);
    }

    // TODO: Replace with real API call when credentials available
    // const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     clientId: COGNITO_CLIENT_ID,
    //     username: email,
    //     confirmationCode: code,
    //   } as VerifyRequest),
    // });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock successful verification
    return {
      message: 'Email verified successfully',
    };
  },

  /**
   * Log in existing user
   * POST /v1/auth/login
   *
   * CURRENT STATUS: Stubbed - cannot test without verified user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    if (__DEV__) {
      console.log('[AuthService] login() called (STUBBED)');
      console.log('[AuthService] Email:', email);
    }

    // TODO: Replace with real API call when credentials available
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     clientId: COGNITO_CLIENT_ID,
    //     username: email,
    //     password,
    //   } as LoginRequest),
    // });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Mock JWT tokens (structure matches Cognito)
    const mockTokens: LoginResponse = {
      accessToken: 'mock.access.token.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      idToken: 'mock.id.token.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciJ9',
      refreshToken: 'mock-refresh-token-abcdef123456',
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
    };

    // Store tokens using TokenManager
    await TokenManager.setToken(mockTokens.accessToken);
    await TokenManager.setRefreshToken(mockTokens.refreshToken);

    if (__DEV__) console.log('[AuthService] Tokens stored in secure storage');

    return mockTokens;
  },

  /**
   * Refresh access token using refresh token
   * POST /v1/auth/refresh
   *
   * CURRENT STATUS: Stubbed
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    if (__DEV__) console.log('[AuthService] refreshToken() called (STUBBED)');

    const refreshToken = await TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // TODO: Replace with real API call when credentials available
    // const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     clientId: COGNITO_CLIENT_ID,
    //     refreshToken,
    //   } as RefreshTokenRequest),
    // });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Mock refreshed tokens
    const mockRefresh: RefreshTokenResponse = {
      accessToken: 'mock.new.access.token.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      idToken: 'mock.new.id.token.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciJ9',
      expiresIn: 3600,
      tokenType: 'Bearer',
    };

    // Update access token
    await TokenManager.setToken(mockRefresh.accessToken);

    if (__DEV__) console.log('[AuthService] Access token refreshed');

    return mockRefresh;
  },

  /**
   * Log out current user (clear tokens)
   * No API call required - just clear local tokens
   */
  async logout(): Promise<void> {
    if (__DEV__) console.log('[AuthService] logout() called');

    await TokenManager.clearTokens();

    if (__DEV__) console.log('[AuthService] User logged out, tokens cleared');
  },

  /**
   * Check if user is currently authenticated
   * (Has valid access token stored)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getToken();
    return token !== null;
  },

  /**
   * Get current access token
   * Returns null if not authenticated
   */
  async getAccessToken(): Promise<string | null> {
    return await TokenManager.getToken();
  },
};

export default AuthService;
