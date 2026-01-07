/**
 * Behavioral Tests - Validation Functions
 *
 * These are REAL tests that:
 * 1. Import actual functions
 * 2. Execute them with test inputs
 * 3. Assert on actual output behavior
 *
 * Unlike the security.test.ts which just greps source files,
 * these tests actually validate the code works correctly.
 */

import { describe, test, expect } from '@jest/globals';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateVerificationCode,
  validateAge,
  sanitizeText,
  sanitizeEmail,
  sanitizeName,
  sanitizeDigits,
} from '../src/utils/validation';

// ============================================================================
// Email Validation Tests
// ============================================================================

describe('validateEmail - Behavioral Tests', () => {
  test('accepts valid email formats', () => {
    expect(validateEmail('user@example.com').valid).toBe(true);
    expect(validateEmail('user.name@example.com').valid).toBe(true);
    expect(validateEmail('user+tag@example.com').valid).toBe(true);
    expect(validateEmail('user@subdomain.example.com').valid).toBe(true);
  });

  test('rejects empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  test('rejects email without @', () => {
    const result = validateEmail('userexample.com');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  test('rejects email without domain', () => {
    const result = validateEmail('user@');
    expect(result.valid).toBe(false);
  });

  test('rejects email with only @ and .', () => {
    // This was the bug in SignInScreen's inline validation
    const result = validateEmail('@.');
    expect(result.valid).toBe(false);
  });

  test('rejects email over 254 characters', () => {
    const longEmail = 'a'.repeat(250) + '@b.com';
    const result = validateEmail(longEmail);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email is too long');
  });

  test('trims whitespace before validation', () => {
    const result = validateEmail('  user@example.com  ');
    expect(result.valid).toBe(true);
  });
});

// ============================================================================
// Password Validation Tests
// ============================================================================

describe('validatePassword - Behavioral Tests', () => {
  test('accepts password meeting all requirements', () => {
    // 8+ chars, uppercase, lowercase, number, special char
    expect(validatePassword('Password1!').valid).toBe(true);
    expect(validatePassword('MyP@ssw0rd').valid).toBe(true);
    expect(validatePassword('Complex!Pass123').valid).toBe(true);
  });

  test('rejects empty password', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password is required');
  });

  test('rejects password under 8 characters', () => {
    const result = validatePassword('Pass1!');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters');
  });

  test('rejects password without uppercase', () => {
    const result = validatePassword('password1!');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must contain an uppercase letter');
  });

  test('rejects password without lowercase', () => {
    const result = validatePassword('PASSWORD1!');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must contain a lowercase letter');
  });

  test('rejects password without number', () => {
    const result = validatePassword('Password!');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must contain a number');
  });

  test('rejects password without special character', () => {
    const result = validatePassword('Password1');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must contain a special character');
  });

  test('this was the bug - accepts 8 lowercase chars in old inline validation', () => {
    // The old SignInScreen validation only checked length >= 8
    // This would have passed: 'aaaaaaaa'
    // Our proper validation should reject it
    const result = validatePassword('aaaaaaaa');
    expect(result.valid).toBe(false);
  });
});

// ============================================================================
// Name Validation Tests
// ============================================================================

describe('validateName - Behavioral Tests', () => {
  test('accepts valid names', () => {
    expect(validateName('John').valid).toBe(true);
    expect(validateName('Mary Jane').valid).toBe(true);
    expect(validateName("O'Connor").valid).toBe(true);
    expect(validateName('Jean-Pierre').valid).toBe(true);
  });

  test('rejects empty name', () => {
    const result = validateName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name is required');
  });

  test('rejects name under 2 characters', () => {
    const result = validateName('A');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name must be at least 2 characters');
  });

  test('rejects name with numbers', () => {
    const result = validateName('John123');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name contains invalid characters');
  });

  test('rejects name with special characters', () => {
    const result = validateName('John@Doe');
    expect(result.valid).toBe(false);
  });

  test('uses custom field name in error', () => {
    const result = validateName('', 'First name');
    expect(result.error).toBe('First name is required');
  });
});

// ============================================================================
// Verification Code Tests
// ============================================================================

describe('validateVerificationCode - Behavioral Tests', () => {
  test('accepts 6-digit code', () => {
    expect(validateVerificationCode('123456').valid).toBe(true);
    expect(validateVerificationCode('000000').valid).toBe(true);
    expect(validateVerificationCode('999999').valid).toBe(true);
  });

  test('rejects empty code', () => {
    const result = validateVerificationCode('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Verification code is required');
  });

  test('rejects code with less than 6 digits', () => {
    const result = validateVerificationCode('12345');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Code must be 6 digits');
  });

  test('rejects code with more than 6 digits', () => {
    const result = validateVerificationCode('1234567');
    expect(result.valid).toBe(false);
  });

  test('rejects code with letters', () => {
    const result = validateVerificationCode('12345a');
    expect(result.valid).toBe(false);
  });

  test('rejects code with spaces', () => {
    const result = validateVerificationCode('123 456');
    expect(result.valid).toBe(false);
  });
});

// ============================================================================
// Age Validation Tests
// ============================================================================

describe('validateAge - Behavioral Tests', () => {
  test('accepts valid adult ages', () => {
    expect(validateAge(18).valid).toBe(true);
    expect(validateAge(25).valid).toBe(true);
    expect(validateAge(65).valid).toBe(true);
    expect(validateAge(100).valid).toBe(true);
  });

  test('accepts age as string', () => {
    expect(validateAge('25').valid).toBe(true);
  });

  test('rejects age under 18', () => {
    const result = validateAge(17);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('You must be at least 18 years old');
  });

  test('rejects age over 120', () => {
    const result = validateAge(121);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid age');
  });

  test('rejects non-numeric string', () => {
    const result = validateAge('abc');
    expect(result.valid).toBe(false);
  });
});

// ============================================================================
// Sanitization Tests
// ============================================================================

describe('sanitizeText - XSS Prevention', () => {
  test('removes HTML angle brackets', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  test('removes javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)');
  });

  test('removes javascript: case insensitive', () => {
    expect(sanitizeText('JaVaScRiPt:alert(1)')).toBe('alert(1)');
  });

  test('removes onclick handlers', () => {
    expect(sanitizeText('onclick=alert(1)')).toBe('alert(1)');
  });

  test('removes onmouseover handlers', () => {
    expect(sanitizeText('onmouseover=alert(1)')).toBe('alert(1)');
  });

  test('removes data: URIs', () => {
    expect(sanitizeText('data:text/html,<script>alert(1)</script>')).toBe('text/html,scriptalert(1)/script');
  });

  test('preserves safe text', () => {
    expect(sanitizeText('Hello, World!')).toBe('Hello, World!');
  });

  test('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  test('handles null/undefined gracefully', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(null as any)).toBe('');
    expect(sanitizeText(undefined as any)).toBe('');
  });
});

describe('sanitizeEmail - Email normalization', () => {
  test('lowercases email', () => {
    expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
  });

  test('trims whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
  });

  test('truncates to 254 characters', () => {
    const longEmail = 'a'.repeat(300) + '@b.com';
    expect(sanitizeEmail(longEmail).length).toBe(254);
  });

  test('handles empty string', () => {
    expect(sanitizeEmail('')).toBe('');
  });
});

describe('sanitizeName - Name cleaning', () => {
  test('allows letters, spaces, hyphens, apostrophes', () => {
    expect(sanitizeName("Mary-Jane O'Connor")).toBe("Mary-Jane O'Connor");
  });

  test('removes numbers', () => {
    expect(sanitizeName('John123')).toBe('John');
  });

  test('removes special characters', () => {
    expect(sanitizeName('John@Doe!')).toBe('JohnDoe');
  });

  test('collapses multiple spaces', () => {
    expect(sanitizeName('John    Doe')).toBe('John Doe');
  });

  test('truncates to 100 characters', () => {
    const longName = 'A'.repeat(150);
    expect(sanitizeName(longName).length).toBe(100);
  });
});

describe('sanitizeDigits - Digit extraction', () => {
  test('extracts only digits', () => {
    expect(sanitizeDigits('abc123def456')).toBe('123456');
  });

  test('respects maxLength', () => {
    expect(sanitizeDigits('1234567890', 6)).toBe('123456');
  });

  test('handles phone numbers', () => {
    expect(sanitizeDigits('(555) 123-4567')).toBe('5551234567');
  });

  test('handles empty string', () => {
    expect(sanitizeDigits('')).toBe('');
  });
});
