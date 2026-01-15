/**
 * AuthService - AWS Cognito Authentication
 *
 * Handles all authentication operations via Cognito SDK.
 * Uses client's Cognito User Pool for email/password auth.
 *
 * User Pool: us-east-1_l3JxaWpl5
 * Client ID: 2ljj7mif1k7jjc2ajiq676fhm1
 */

import { CognitoRefreshToken } from 'amazon-cognito-identity-js';
import { TokenManager } from './TokenManager';
import {
  userPool,
  getCognitoUser,
  getAuthDetails,
  createUserAttributes,
  type CognitoUserSession,
} from './CognitoConfig';

// ========================================
// Types
// ========================================

export interface SignupResponse {
  userSub: string;
  username: string; // The generated username (needed for verify/login)
  codeDeliveryDetails: {
    destination: string;
    deliveryMedium: 'EMAIL' | 'SMS';
    attributeName: string;
  };
}

export interface VerifyResponse {
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthError {
  message: string;
  code: string;
}

// ========================================
// Error Mapping
// ========================================

/**
 * Map Cognito error codes to user-friendly messages
 */
function mapCognitoError(error: Error & { code?: string }): AuthError {
  const code = error.code || 'UnknownError';

  const errorMessages: Record<string, string> = {
    UsernameExistsException: 'This email is already registered',
    InvalidPasswordException: 'Password does not meet requirements',
    UserNotConfirmedException: 'Please verify your email first',
    NotAuthorizedException: 'Incorrect email or password',
    CodeMismatchException: 'Invalid verification code',
    ExpiredCodeException: 'Verification code expired. Request a new one.',
    LimitExceededException: 'Too many attempts. Please wait and try again.',
    UserNotFoundException: 'No account found with this email',
    InvalidParameterException: 'Invalid input provided',
    NetworkError: 'Network error. Please check your connection.',
    UnexpectedLambdaException: 'Server error. Please try again.',
    AliasExistsException: 'An account with this email already exists',
  };

  return {
    code,
    message: errorMessages[code] || error.message || 'An error occurred',
  };
}

// ========================================
// Token Utilities
// ========================================

/**
 * Decode JWT payload without verification (for client-side expiry check only)
 * Never use this for security decisions on server - only for UX optimization
 */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64URL decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired (with 60s buffer for clock skew)
 */
function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true; // Treat missing exp as expired
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowSeconds + bufferSeconds;
}

// ========================================
// Refresh Token Mutex
// ========================================

/** Maximum time to wait for token refresh before giving up (30 seconds) */
const TOKEN_REFRESH_TIMEOUT_MS = 30000;

/**
 * Wrap a promise with a timeout to prevent infinite hangs
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject({ code: 'TIMEOUT', message: errorMessage });
      }, timeoutMs);
    }),
  ]);
}

/**
 * Singleton promise for token refresh to prevent race conditions.
 * If multiple requests need a refresh, they all wait on the same promise.
 */
let refreshPromise: Promise<RefreshTokenResponse> | null = null;

// ========================================
// Service Implementation
// ========================================

export const AuthService = {
  /**
   * Sign up a new user with email, password, and name
   *
   * Flow:
   * 1. Call Cognito signUp with email, password, and attributes
   * 2. Cognito sends 6-digit verification code to email
   * 3. User must call verify() with the code
   */
  async signup(
    email: string,
    password: string,
    firstName: string,
    familyName: string
  ): Promise<SignupResponse> {

    const attributes = createUserAttributes(email, firstName, familyName);

    // Cognito pool is configured with email as ALIAS, not username
    // Username must NOT be email format - generate unique ID
    const username = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // DETAILED DEBUG LOGGING - see exactly what we're sending
    if (__DEV__) {
      console.log('=== COGNITO SIGNUP DEBUG ===');
      console.log('Input email:', JSON.stringify(email));
      console.log('Input firstName:', JSON.stringify(firstName));
      console.log('Input familyName:', JSON.stringify(familyName));
      console.log('Generated username:', username);
      console.log('Password length:', password?.length);
      console.log('Attributes count:', attributes.length);
      attributes.forEach((attr, i) => {
        console.log(`  Attr[${i}]: ${attr.getName()} = "${attr.getValue()}"`);
      });
      console.log('=== END DEBUG ===');
    }

    return new Promise((resolve, reject) => {
      userPool.signUp(username, password, attributes, [], (err, result) => {
        if (err) {
          const cognitoErr = err as Error & { code?: string; message?: string; name?: string };
          if (__DEV__) {
            console.log('=== COGNITO SIGNUP ERROR ===');
            console.log('Error code:', cognitoErr.code);
            console.log('Error name:', cognitoErr.name);
            console.log('Error message:', cognitoErr.message);
            console.log('Full error:', JSON.stringify(cognitoErr, null, 2));
            console.log('=== END ERROR ===');
          }
          // For InvalidParameterException, show the ACTUAL Cognito message (more specific)
          if (cognitoErr.code === 'InvalidParameterException') {
            reject({ code: cognitoErr.code, message: cognitoErr.message || 'Invalid parameter' });
          } else {
            reject(mapCognitoError(cognitoErr));
          }
          return;
        }

        if (!result) {
          reject({ code: 'UnknownError', message: 'Signup failed' });
          return;
        }

        if (__DEV__) {
          console.log('[AuthService] Signup successful');
          console.log('[AuthService] UserSub:', result.userSub);
        }

        resolve({
          userSub: result.userSub,
          username, // Return the generated username for verify/login
          codeDeliveryDetails: {
            destination: result.codeDeliveryDetails?.Destination || email,
            deliveryMedium:
              (result.codeDeliveryDetails?.DeliveryMedium as 'EMAIL' | 'SMS') ||
              'EMAIL',
            attributeName:
              result.codeDeliveryDetails?.AttributeName || 'email',
          },
        });
      });
    });
  },

  /**
   * Verify email with 6-digit confirmation code
   *
   * Called after signup to confirm the user's email address.
   */
  async verify(username: string, code: string): Promise<VerifyResponse> {
    if (__DEV__) {
      if (__DEV__) console.log('[AuthService] verify() - Confirming registration');
      if (__DEV__) console.log('[AuthService] Username:', username);
    }

    const cognitoUser = getCognitoUser(username);

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          const cognitoErr = err as Error & { code?: string; message?: string };
          if (__DEV__) {
            if (__DEV__) console.log('[AuthService] Verify error code:', cognitoErr.code);
            if (__DEV__) console.log('[AuthService] Verify error message:', cognitoErr.message);
            if (__DEV__) console.log('[AuthService] Full error:', JSON.stringify(err, null, 2));
          }
          reject(mapCognitoError(cognitoErr));
          return;
        }

        if (__DEV__) console.log('[AuthService] Email verified:', result);

        resolve({
          message: 'Email verified successfully',
        });
      });
    });
  },

  /**
   * Resend verification code to email
   *
   * Use when the original code expired or wasn't received.
   */
  async resendVerificationCode(username: string): Promise<void> {
    if (__DEV__) {
      if (__DEV__) console.log('[AuthService] resendVerificationCode()');
    }

    const cognitoUser = getCognitoUser(username);

    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          if (__DEV__) console.log('[AuthService] Resend error:', err);
          reject(mapCognitoError(err as Error & { code?: string }));
          return;
        }

        if (__DEV__) console.log('[AuthService] Code resent:', result);
        resolve();
      });
    });
  },

  /**
   * Log in with email and password
   *
   * Flow:
   * 1. Authenticate with Cognito
   * 2. Store tokens in secure storage
   * 3. Return token info
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    if (__DEV__) {
      if (__DEV__) console.log('[AuthService] login() - Authenticating');
      if (__DEV__) console.log('[AuthService] Username:', username);
    }

    const cognitoUser = getCognitoUser(username);
    const authDetails = getAuthDetails(username, password);

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          if (__DEV__) console.log('[AuthService] Login successful');

          const accessToken = session.getAccessToken().getJwtToken();
          const idToken = session.getIdToken().getJwtToken();
          const refreshToken = session.getRefreshToken().getToken();
          const expiresIn = session.getAccessToken().getExpiration();

          // Store tokens securely
          // IMPORTANT: API expects ID token, not access token
          await TokenManager.setToken(idToken);
          await TokenManager.setRefreshToken(refreshToken);

          if (__DEV__) console.log('[AuthService] Tokens stored (using idToken)');

          resolve({
            accessToken,
            idToken,
            refreshToken,
            expiresIn,
            tokenType: 'Bearer',
          });
        },

        onFailure: (err: Error & { code?: string }) => {
          if (__DEV__) console.log('[AuthService] Login error:', err);
          reject(mapCognitoError(err));
        },

        // Handle MFA if required (not currently used)
        // mfaRequired: (codeDeliveryDetails) => { ... },
        // newPasswordRequired: (userAttributes) => { ... },
      });
    });
  },

  /**
   * Refresh access token using stored refresh token
   *
   * Uses mutex pattern to prevent race conditions when multiple
   * concurrent requests all detect an expired token simultaneously.
   *
   * Includes 30s timeout to prevent infinite hangs if Cognito is unresponsive.
   *
   * Called automatically when access token expires (1 hour).
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    // If a refresh is already in progress, reuse that promise
    if (refreshPromise) {
      if (__DEV__) console.log('[AuthService] Reusing existing refresh promise');
      return refreshPromise;
    }

    if (__DEV__) console.log('[AuthService] refreshToken() - starting new refresh');

    // Create the refresh promise with timeout protection and store it
    // Timeout prevents infinite hangs if Cognito is unresponsive
    refreshPromise = withTimeout(
      this._doRefreshToken(),
      TOKEN_REFRESH_TIMEOUT_MS,
      'Token refresh timed out after 30 seconds. Please try again.'
    ).finally(() => {
      // Clear the promise when done (success, failure, or timeout)
      refreshPromise = null;
    });

    return refreshPromise;
  },

  /**
   * Internal refresh implementation (called by refreshToken mutex)
   */
  async _doRefreshToken(): Promise<RefreshTokenResponse> {
    const storedRefreshToken = await TokenManager.getRefreshToken();
    if (!storedRefreshToken) {
      throw { code: 'NoRefreshToken', message: 'No refresh token available' };
    }

    // Get the current user from pool
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      throw { code: 'NoUser', message: 'No user session found' };
    }

    const refreshTokenObj = new CognitoRefreshToken({
      RefreshToken: storedRefreshToken,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(refreshTokenObj, async (err, session) => {
        if (err) {
          if (__DEV__) console.log('[AuthService] Refresh error:', err);
          reject(mapCognitoError(err as Error & { code?: string }));
          return;
        }

        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        const expiresIn = session.getAccessToken().getExpiration();

        // Update stored token (using idToken - API expects ID token)
        await TokenManager.setToken(idToken);

        if (__DEV__) console.log('[AuthService] Token refreshed (using idToken)');

        resolve({
          accessToken,
          idToken,
          expiresIn,
          tokenType: 'Bearer',
        });
      });
    });
  },

  /**
   * Log out current user
   *
   * Clears local tokens and signs out from Cognito.
   */
  async logout(): Promise<void> {
    if (__DEV__) console.log('[AuthService] logout()');

    // Sign out from Cognito (local only, doesn't invalidate refresh token on server)
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }

    // Clear stored tokens
    await TokenManager.clearTokens();

    if (__DEV__) console.log('[AuthService] User logged out');
  },

  /**
   * Check if user is currently authenticated with a valid token
   *
   * Returns true only if:
   * 1. A token exists in storage
   * 2. The token is not expired (with 60s buffer)
   *
   * This is a client-side check for UX optimization.
   * Server will still validate tokens on each request.
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getToken();
    if (!token) return false;

    // Check if token is expired
    if (isTokenExpired(token)) {
      if (__DEV__) console.log('[AuthService] Token exists but is expired');
      return false;
    }

    return true;
  },

  /**
   * Check if current token is expired and needs refresh
   */
  async needsTokenRefresh(): Promise<boolean> {
    const token = await TokenManager.getToken();
    if (!token) return false;
    return isTokenExpired(token);
  },

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    return await TokenManager.getToken();
  },

  /**
   * Get current user's email from Cognito session
   */
  getCurrentUserEmail(): string | null {
    const cognitoUser = userPool.getCurrentUser();
    return cognitoUser?.getUsername() || null;
  },

  /**
   * Initiate forgot password flow
   *
   * Sends a verification code to the user's email.
   * User must then call confirmForgotPassword with the code and new password.
   */
  async forgotPassword(email: string): Promise<{ destination: string }> {
    if (__DEV__) console.log('[AuthService] forgotPassword() - Initiating reset');

    const cognitoUser = getCognitoUser(email);

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          if (__DEV__) console.log('[AuthService] Reset code sent:', data);
          resolve({
            destination: data.CodeDeliveryDetails?.Destination || email,
          });
        },
        onFailure: (err: Error & { code?: string }) => {
          if (__DEV__) console.log('[AuthService] Forgot password error:', err);
          reject(mapCognitoError(err));
        },
      });
    });
  },

  /**
   * Confirm forgot password with verification code and new password
   */
  async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    if (__DEV__) console.log('[AuthService] confirmForgotPassword()');

    const cognitoUser = getCognitoUser(email);

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          if (__DEV__) console.log('[AuthService] Password reset successful');
          resolve();
        },
        onFailure: (err: Error & { code?: string }) => {
          if (__DEV__) console.log('[AuthService] Confirm password error:', err);
          reject(mapCognitoError(err));
        },
      });
    });
  },
};

export default AuthService;
