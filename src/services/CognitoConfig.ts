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
 */
export function createUserAttributes(
  email: string,
  firstName: string,
  lastName: string
): CognitoUserAttribute[] {
  return [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'given_name', Value: firstName }),
    new CognitoUserAttribute({ Name: 'family_name', Value: lastName }),
  ];
}

// Re-export types for convenience
export type {
  ISignUpResult,
  CognitoUserSession,
  CognitoUser,
  CognitoUserAttribute,
};
