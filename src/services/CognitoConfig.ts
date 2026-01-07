/**
 * AWS Cognito Configuration
 *
 * Client backend uses Cognito for authentication.
 * User Pool: us-east-1_l3JxaWpl5
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  ISignUpResult,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

// Cognito User Pool configuration (from client)
const poolData = {
  UserPoolId: 'us-east-1_l3JxaWpl5',
  ClientId: '2ljj7mif1k7jjc2ajiq676fhm1',
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
 *
 * IMPORTANT: Only send attributes that Nathan's Cognito pool has configured.
 * We've tested: email only (fails), given_name (fails)
 * Now testing: 'name' attribute instead of 'given_name'
 */
export function createUserAttributes(
  email: string,
  firstName: string,
  lastName: string
): CognitoUserAttribute[] {
  // Build full name for 'name' attribute
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    // Try 'name' instead of 'given_name' - some pools require this
    new CognitoUserAttribute({ Name: 'name', Value: fullName }),
  ];

  return attributes;
}

// Re-export types for convenience
export type {
  ISignUpResult,
  CognitoUserSession,
  CognitoUser,
  CognitoUserAttribute,
};
