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
  };

  return {
    code,
    message: errorMessages[code] || error.message || 'An error occurred',
  };
}

// ========================================
// Service Implementation
// ========================================

export const AuthService = {
  /**
   * Sign up a new user with email and password
   *
   * Flow:
   * 1. Call Cognito signUp with email, password, and attributes
   * 2. Cognito sends 6-digit verification code to email
   * 3. User must call verify() with the code
   */
  async signup(
    email: string,
    password: string,
    name: string
  ): Promise<SignupResponse> {
    if (__DEV__) {
      console.log('[AuthService] signup() - Starting registration');
      console.log('[AuthService] Email:', email);
    }

    // Split name into first/last if space present, otherwise use as first name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(' ') || '';

    const attributes = createUserAttributes(email, firstName, lastName);

    // Generate username from email (Cognito pool uses email alias, so username can't be email format)
    // Extract part before @ and add random suffix to ensure uniqueness
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const username = `${emailPrefix}_${Date.now()}`;

    return new Promise((resolve, reject) => {
      userPool.signUp(username, password, attributes, [], (err, result) => {
        if (err) {
          if (__DEV__) console.log('[AuthService] Signup error:', err);
          reject(mapCognitoError(err as Error & { code?: string }));
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
  async verify(email: string, code: string): Promise<VerifyResponse> {
    if (__DEV__) {
      console.log('[AuthService] verify() - Confirming registration');
      console.log('[AuthService] Email:', email);
    }

    const cognitoUser = getCognitoUser(email);

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          if (__DEV__) console.log('[AuthService] Verify error:', err);
          reject(mapCognitoError(err as Error & { code?: string }));
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
  async resendVerificationCode(email: string): Promise<void> {
    if (__DEV__) {
      console.log('[AuthService] resendVerificationCode()');
    }

    const cognitoUser = getCognitoUser(email);

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
  async login(email: string, password: string): Promise<LoginResponse> {
    if (__DEV__) {
      console.log('[AuthService] login() - Authenticating');
      console.log('[AuthService] Email:', email);
    }

    const cognitoUser = getCognitoUser(email);
    const authDetails = getAuthDetails(email, password);

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          if (__DEV__) console.log('[AuthService] Login successful');

          const accessToken = session.getAccessToken().getJwtToken();
          const idToken = session.getIdToken().getJwtToken();
          const refreshToken = session.getRefreshToken().getToken();
          const expiresIn = session.getAccessToken().getExpiration();

          // Store tokens securely
          await TokenManager.setToken(accessToken);
          await TokenManager.setRefreshToken(refreshToken);

          if (__DEV__) console.log('[AuthService] Tokens stored');

          resolve({
            accessToken,
            idToken,
            refreshToken,
            expiresIn,
            tokenType: 'Bearer',
          });
        },

        onFailure: (err) => {
          if (__DEV__) console.log('[AuthService] Login error:', err);
          reject(mapCognitoError(err as Error & { code?: string }));
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
   * Called automatically when access token expires (1 hour).
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    if (__DEV__) console.log('[AuthService] refreshToken()');

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

        // Update stored access token
        await TokenManager.setToken(accessToken);

        if (__DEV__) console.log('[AuthService] Token refreshed');

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
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getToken();
    return token !== null;
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
};

export default AuthService;
