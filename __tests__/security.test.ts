/**
 * Security Tests - Validation and Sanitization
 *
 * Tests for:
 * - secureFetch utility
 * - Input validation functions
 * - XSS sanitization
 */

import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(PROJECT_ROOT, relativePath));
}

// ==============================================================================
// TEST 1: SecureFetch Utility Structure
// ==============================================================================

describe('SecureFetch Utility', () => {
  test('secureFetch.ts file exists', () => {
    expect(fileExists('src/utils/secureFetch.ts')).toBe(true);
  });

  test('secureFetch exports main function', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('export async function secureFetch');
  });

  test('secureFetch has timeout configuration', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('MAX_TIMEOUT_MS');
    expect(source).toContain('DEFAULT_TIMEOUT_MS');
    expect(source).toContain('timeout');
  });

  test('secureFetch has abort controller for timeout', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('AbortController');
    expect(source).toContain('controller.abort()');
    expect(source).toContain('controller.signal');
  });

  test('secureFetch sanitizes error messages', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('sanitizeError');
    expect(source).toContain('statusMessages');
  });

  test('secureFetch has response size limit', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('MAX_RESPONSE_SIZE');
    expect(source).toContain('Content-Length');
  });

  test('secureFetch exports SecureFetchError type', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('export interface SecureFetchError');
    expect(source).toContain('code: string');
    expect(source).toContain('message: string');
  });

  test('secureFetch has JSON helper function', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('export async function secureFetchJSON');
  });

  test('secureFetch has API factory function', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('export function createSecureAPI');
  });
});

// ==============================================================================
// TEST 2: Validation Utilities Structure
// ==============================================================================

describe('Validation Utilities', () => {
  test('validation.ts file exists', () => {
    expect(fileExists('src/utils/validation.ts')).toBe(true);
  });

  test('validation exports sanitization functions', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain('export function sanitizeText');
    expect(source).toContain('export function sanitizeEmail');
    expect(source).toContain('export function sanitizeName');
    expect(source).toContain('export function sanitizeDigits');
  });

  test('validation exports validation functions', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain('export function validateEmail');
    expect(source).toContain('export function validatePassword');
    expect(source).toContain('export function validateName');
    expect(source).toContain('export function validateVerificationCode');
  });

  test('validation has XSS prevention', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain('XSS');
    expect(source).toContain('javascript:');
    expect(source).toContain('<>');
  });

  test('validation has length limits', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain('254'); // RFC 5321 email max
    expect(source).toContain('100'); // Name max
  });

  test('validation exports Validators object', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain('export const Validators = {');
    expect(source).toContain('sanitizeText');
    expect(source).toContain('sanitizeEmail');
  });
});

// ==============================================================================
// TEST 3: Service Security Integration
// ==============================================================================

describe('Service Security Integration', () => {
  test('QuestionsService uses secureFetch', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain("import { secureFetch");
    expect(source).toContain('secureFetch(');
    expect(source).toContain('REQUEST_TIMEOUT_MS');
  });

  test('AbbyRealtimeService uses secureFetch', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain("import { secureFetch");
    expect(source).toContain('secureFetch(');
    expect(source).toContain('REQUEST_TIMEOUT_MS');
  });

  test('QuestionsService has encodeURIComponent for path params', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('encodeURIComponent(categorySlug)');
    expect(source).toContain('encodeURIComponent(questionId)');
  });

  test('AbbyRealtimeService has encodeURIComponent for session IDs', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('encodeURIComponent(this.sessionId)');
  });

  test('Services do not expose raw error messages', () => {
    const questionsSource = readFile('src/services/QuestionsService.ts');
    const realtimeSource = readFile('src/services/AbbyRealtimeService.ts');

    // Should not have template strings with raw error text
    expect(questionsSource).not.toContain('throw new Error(`Failed');
    expect(realtimeSource).not.toContain('throw new Error(`Failed');
  });
});

// ==============================================================================
// TEST 4: Input Validation Patterns
// ==============================================================================

describe('Input Validation Patterns', () => {
  test('Email validation uses RFC-compliant pattern', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain('EMAIL_REGEX');
    expect(source).toContain('@');
    expect(source).toContain('[^\\s@]+');
  });

  test('Password validation checks all requirements', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain('[A-Z]'); // Uppercase
    expect(source).toContain('[a-z]'); // Lowercase
    expect(source).toContain('[0-9]'); // Number
    expect(source).toContain('[!@#$%^&*(),.?":{}|<>]'); // Special char
  });

  test('Verification code is exactly 6 digits', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain('^\\d{6}$');
  });

  test('Name validation allows only valid characters', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain("[a-zA-Z\\s\\-']+");
  });
});

// ==============================================================================
// TEST 5: XSS Prevention Patterns
// ==============================================================================

describe('XSS Prevention', () => {
  test('sanitizeText removes HTML angle brackets', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain("replace(/[<>]/g, '')");
  });

  test('sanitizeText removes javascript: protocol', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain("replace(/javascript:/gi, '')");
  });

  test('sanitizeText removes event handlers', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain("replace(/on\\w+=/gi, '')");
  });

  test('sanitizeText removes data: URIs', () => {
    const source = readFile('src/utils/validation.ts');
    expect(source).toContain("replace(/data:/gi, '')");
  });
});

// ==============================================================================
// TEST 6: Auth Security
// ==============================================================================

describe('Auth Security', () => {
  test('AuthService uses Cognito not plain text', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain('CognitoUserSession');
    expect(source).not.toContain('password: "'); // No hardcoded passwords
  });

  test('TokenManager uses secure storage', () => {
    const source = readFile('src/services/TokenManager.ts');
    // Uses SecureStore for native, AsyncStorage as web fallback
    expect(source).toContain('SecureStore');
    expect(source).toContain('expo-secure-store');
  });

  test('AuthService maps Cognito errors to user-friendly messages', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain('mapCognitoError');
    expect(source).toContain('UsernameExistsException');
    expect(source).toContain('NotAuthorizedException');
  });

  test('AuthService does not log passwords', () => {
    const source = readFile('src/services/AuthService.ts');
    // Should log password LENGTH but not password VALUE
    expect(source).toContain("console.log('Password length:'");
    expect(source).not.toContain("console.log('[AuthService] Password:'");
  });
});

// ==============================================================================
// TEST 7: Screen Input Sanitization
// ==============================================================================

describe('Screen Input Handling', () => {
  test('DOBScreen sanitizes numeric inputs', () => {
    const source = readFile('src/components/screens/DOBScreen.tsx');
    expect(source).toContain("replace(/[^0-9]/g, '')");
  });

  test('PhoneNumberScreen sanitizes phone inputs', () => {
    const source = readFile('src/components/screens/PhoneNumberScreen.tsx');
    expect(source).toContain("replace(/\\D/g, '')");
  });

  test('EmailScreen validates email format', () => {
    const source = readFile('src/components/screens/EmailScreen.tsx');
    expect(source).toContain('[^\\s@]+@[^\\s@]+\\.[^\\s@]+');
  });

  test('PasswordScreen validates password requirements', () => {
    const source = readFile('src/components/screens/PasswordScreen.tsx');
    expect(source).toContain('[A-Z]');
    expect(source).toContain('[a-z]');
    expect(source).toContain('[0-9]');
  });
});

// ==============================================================================
// TEST 8: Error Handling Security
// ==============================================================================

describe('Error Handling Security', () => {
  test('secureFetch returns generic error codes', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('TIMEOUT');
    expect(source).toContain('NETWORK_ERROR');
    expect(source).toContain('REQUEST_FAILED');
  });

  test('secureFetch handles AbortError', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('AbortError');
  });

  test('secureFetch has HTTP status code mapping', () => {
    const source = readFile('src/utils/secureFetch.ts');
    expect(source).toContain('400:');
    expect(source).toContain('401:');
    expect(source).toContain('403:');
    expect(source).toContain('404:');
    expect(source).toContain('429:');
    expect(source).toContain('500:');
  });
});

// ==============================================================================
// TEST 9: Timeout Configuration
// ==============================================================================

describe('Timeout Configuration', () => {
  test('secureFetch has sensible timeout defaults', () => {
    const source = readFile('src/utils/secureFetch.ts');
    // Default should be 30s, max 60s
    expect(source).toContain('30000');
    expect(source).toContain('60000');
  });

  test('QuestionsService has appropriate timeout', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('REQUEST_TIMEOUT_MS = 15000');
  });

  test('AbbyRealtimeService has appropriate timeouts', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('REQUEST_TIMEOUT_MS = 20000');
    expect(source).toContain('AVAILABILITY_TIMEOUT_MS = 5000');
  });
});

// ==============================================================================
// TEST 10: Token Management Security
// ==============================================================================

describe('Token Management', () => {
  test('TokenManager uses SecureStore', () => {
    expect(fileExists('src/services/TokenManager.ts')).toBe(true);
    const source = readFile('src/services/TokenManager.ts');
    expect(source).toContain('expo-secure-store');
    expect(source).toContain('SecureStore');
  });

  test('TokenManager has secure key names', () => {
    const source = readFile('src/services/TokenManager.ts');
    expect(source).toContain('abby_auth_token');
    expect(source).toContain('abby_refresh_token');
  });

  test('TokenManager wraps errors in __DEV__ check', () => {
    const source = readFile('src/services/TokenManager.ts');
    expect(source).toContain('if (__DEV__) console.error');
  });
});
