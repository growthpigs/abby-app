/**
 * CognitoConfig - Stub for iOS Simulator Testing
 *
 * Provides mock implementations of Cognito User Pool functions
 * for testing the authentication flow on the iOS simulator.
 *
 * NOTE: In production, this would use real AWS Cognito User Pool.
 */

export interface CognitoUserSession {
  getAccessToken(): { getJwtToken(): string; getExpiration(): number };
  getIdToken(): { getJwtToken(): string };
  getRefreshToken(): { getToken(): string };
}

export interface CognitoUserAttribute {
  getName(): string;
  getValue(): string;
}

// Type for the mock Cognito user returned by getCognitoUser
export type MockCognitoUser = ReturnType<typeof getCognitoUser>;

/**
 * Mock Cognito User Pool for simulator testing
 */
export const userPool = {
  signUp: (
    username: string,
    password: string,
    attributes: CognitoUserAttribute[],
    validation: any[],
    callback: (err: any, result: any) => void
  ) => {
    setTimeout(() => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[CognitoConfig] Mock signUp called for:', username);
      }
      callback(null, {
        userSub: 'mock-user-sub-' + Date.now(),
        codeDeliveryDetails: {
          Destination: username,
          DeliveryMedium: 'EMAIL',
          AttributeName: 'email',
        },
      });
    }, 500);
  },

  getCurrentUser: (): MockCognitoUser | null => null,
};

/**
 * Get mock Cognito user for a username
 */
export const getCognitoUser = (username: string) => ({
  confirmRegistration: (code: string, _force: boolean, callback: (err: any, result: any) => void) => {
    setTimeout(() => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[CognitoConfig] Mock confirmRegistration');
      }
      callback(null, 'SUCCESS');
    }, 300);
  },

  authenticateUser: (authDetails: any, callbacks: any) => {
    setTimeout(() => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[CognitoConfig] Mock authenticateUser');
      }
      const mockSession: CognitoUserSession = {
        getAccessToken: () => ({
          getJwtToken: () => 'mock.access.token.' + Date.now(),
          getExpiration: () => Math.floor(Date.now() / 1000) + 3600,
        }),
        getIdToken: () => ({
          getJwtToken: () => 'mock.id.token.eyJzdWIiOiIxMjM0NTY3ODkwIn0=' + Date.now(),
        }),
        getRefreshToken: () => ({
          getToken: () => 'mock.refresh.token.' + Date.now(),
        }),
      };
      callbacks.onSuccess(mockSession);
    }, 800);
  },

  refreshSession: (refreshToken: any, callback: (err: any, session: any) => void) => {
    setTimeout(() => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[CognitoConfig] Mock refreshSession');
      }
      const mockSession: CognitoUserSession = {
        getAccessToken: () => ({
          getJwtToken: () => 'mock.new.access.token.' + Date.now(),
          getExpiration: () => Math.floor(Date.now() / 1000) + 3600,
        }),
        getIdToken: () => ({
          getJwtToken: () => 'mock.new.id.token.' + Date.now(),
        }),
        getRefreshToken: () => ({
          getToken: () => 'mock.refresh.token.' + Date.now(),
        }),
      };
      callback(null, mockSession);
    }, 600);
  },

  resendConfirmationCode: (callback: (err: any, result: any) => void) => {
    setTimeout(() => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[CognitoConfig] Mock resendConfirmationCode');
      }
      callback(null, 'SUCCESS');
    }, 300);
  },

  signOut: () => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[CognitoConfig] Mock signOut');
    }
  },

  getUsername: () => username,
});

/**
 * Create authentication details for login
 */
export const getAuthDetails = (username: string, password: string) => ({
  username,
  password,
});

/**
 * Create user attributes for signup
 */
export const createUserAttributes = (email: string, firstName: string, lastName: string): CognitoUserAttribute[] => [
  { getName: () => 'email', getValue: () => email },
  { getName: () => 'given_name', getValue: () => firstName },
  { getName: () => 'family_name', getValue: () => lastName },
] as CognitoUserAttribute[];

export default {
  userPool,
  getCognitoUser,
  getAuthDetails,
  createUserAttributes,
};
