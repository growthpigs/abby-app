/**
 * AWS Cognito Configuration
 *
 * Client backend uses Cognito for authentication.
 * Configuration sourced from COGNITO_CONFIG (single source of truth)
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  ISignUpResult,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { COGNITO_CONFIG } from '../config';

// Cognito User Pool configuration (from config.ts - single source of truth)
const poolData = {
  UserPoolId: COGNITO_CONFIG.USER_POOL_ID,
  ClientId: COGNITO_CONFIG.CLIENT_ID,
};

// Create the user pool instance
export const userPool = new CognitoUserPool(poolData);

/**
 * Get a CognitoUser instance for the given email
 */
export function getCognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: email,
    Pool: userPool,
  });
}

/**
 * Create authentication details for login
 */
export function getAuthDetails(
  email: string,
  password: string
): AuthenticationDetails {
  return new AuthenticationDetails({
    Username: email,
    Password: password,
  });
}

/**
 * Create user attributes for signup
 * Note: Only includes family_name if provided (Cognito rejects empty strings)
 */
export function createUserAttributes(
  email: string,
  firstName: string,
  lastName: string
): CognitoUserAttribute[] {
  const attrs = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'given_name', Value: firstName || 'User' }),
  ];

  // Only add family_name if it's a non-empty string (Cognito rejects empty values)
  if (lastName && lastName.trim().length > 0) {
    attrs.push(new CognitoUserAttribute({ Name: 'family_name', Value: lastName }));
  }

  return attrs;
}

// Re-export types for convenience
export type {
  ISignUpResult,
  CognitoUserSession,
  CognitoUser,
  CognitoUserAttribute,
};
