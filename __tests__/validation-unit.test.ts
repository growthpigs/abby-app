/**
 * Validation Unit Tests
 *
 * Tests the actual validation functions with various inputs.
 * These are pure TypeScript tests - no React Native runtime needed.
 */

import { describe, test, expect } from '@jest/globals';

// Import validation functions
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeName,
  sanitizeDigits,
  validateEmail,
  validatePassword,
  validateName,
  validateVerificationCode,
  validateAge,
  validatePasswordConfirm,
} from '../src/utils/validation';

// ==============================================================================
// TEST 1: Email Sanitization
// ==============================================================================

describe('sanitizeEmail', () => {
  test('trims whitespace', () => {
    expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
  });

  test('converts to lowercase', () => {
    expect(sanitizeEmail('Test@EXAMPLE.com')).toBe('test@example.com');
  });

  test('limits length to 254 characters', () => {
    const longEmail = 'a'.repeat(300) + '@example.com';
    expect(sanitizeEmail(longEmail).length).toBeLessThanOrEqual(254);
  });

  test('handles empty input', () => {
    expect(sanitizeEmail('')).toBe('');
  });

  test('handles null/undefined', () => {
    expect(sanitizeEmail(null as any)).toBe('');
    expect(sanitizeEmail(undefined as any)).toBe('');
  });
});

// ==============================================================================
// TEST 2: Text Sanitization (XSS Prevention)
// ==============================================================================

describe('sanitizeText', () => {
  test('removes HTML angle brackets', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  test('removes javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)');
    expect(sanitizeText('JAVASCRIPT:alert(1)')).toBe('alert(1)');
  });

  test('removes event handlers', () => {
    expect(sanitizeText('onclick=alert(1)')).toBe('alert(1)');
    expect(sanitizeText('onmouseover=evil()')).toBe('evil()');
    expect(sanitizeText('ONCLICK=alert(1)')).toBe('alert(1)');
  });

  test('removes data: URIs', () => {
    expect(sanitizeText('data:text/html,<script>alert(1)</script>')).toBe('text/html,scriptalert(1)/script');
  });

  test('trims whitespace', () => {
    expect(sanitizeText('  hello world  ')).toBe('hello world');
  });

  test('handles empty input', () => {
    expect(sanitizeText('')).toBe('');
  });

  test('handles null/undefined', () => {
    expect(sanitizeText(null as any)).toBe('');
    expect(sanitizeText(undefined as any)).toBe('');
  });
});

// ==============================================================================
// TEST 3: Name Sanitization
// ==============================================================================

describe('sanitizeName', () => {
  test('removes non-name characters', () => {
    expect(sanitizeName('John123')).toBe('John');
    expect(sanitizeName('Jane@Smith')).toBe('JaneSmith');
  });

  test('allows hyphens and apostrophes', () => {
    expect(sanitizeName("O'Brien")).toBe("O'Brien");
    expect(sanitizeName('Mary-Jane')).toBe('Mary-Jane');
  });

  test('collapses multiple spaces', () => {
    expect(sanitizeName('John    Doe')).toBe('John Doe');
  });

  test('trims whitespace', () => {
    expect(sanitizeName('  John Doe  ')).toBe('John Doe');
  });

  test('limits length to 100 characters', () => {
    const longName = 'a'.repeat(150);
    expect(sanitizeName(longName).length).toBeLessThanOrEqual(100);
  });

  test('handles empty input', () => {
    expect(sanitizeName('')).toBe('');
  });
});

// ==============================================================================
// TEST 4: Digit Sanitization
// ==============================================================================

describe('sanitizeDigits', () => {
  test('extracts only digits', () => {
    expect(sanitizeDigits('(555) 123-4567')).toBe('5551234567');
    expect(sanitizeDigits('abc123def456')).toBe('123456');
  });

  test('respects maxLength parameter', () => {
    expect(sanitizeDigits('1234567890', 6)).toBe('123456');
  });

  test('handles empty input', () => {
    expect(sanitizeDigits('')).toBe('');
  });

  test('handles input with no digits', () => {
    expect(sanitizeDigits('abcdef')).toBe('');
  });
});

// ==============================================================================
// TEST 5: Email Validation
// ==============================================================================

describe('validateEmail', () => {
  test('accepts valid emails', () => {
    expect(validateEmail('test@example.com').valid).toBe(true);
    expect(validateEmail('user.name@domain.org').valid).toBe(true);
    expect(validateEmail('user+tag@example.co.uk').valid).toBe(true);
  });

  test('rejects empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  test('rejects email without @', () => {
    const result = validateEmail('testexample.com');
    expect(result.valid).toBe(false);
  });

  test('rejects email without domain', () => {
    const result = validateEmail('test@');
    expect(result.valid).toBe(false);
  });

  test('rejects email without TLD', () => {
    const result = validateEmail('test@example');
    expect(result.valid).toBe(false);
  });

  test('rejects email with spaces', () => {
    const result = validateEmail('test @example.com');
    expect(result.valid).toBe(false);
  });
});

// ==============================================================================
// TEST 6: Password Validation
// ==============================================================================

describe('validatePassword', () => {
  test('accepts valid password', () => {
    expect(validatePassword('SecureP@ss1').valid).toBe(true);
    expect(validatePassword('MyP@ssw0rd!').valid).toBe(true);
  });

  test('rejects empty password', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  test('rejects password shorter than 8 characters', () => {
    const result = validatePassword('Short1!');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('8 characters');
  });

  test('rejects password without uppercase', () => {
    const result = validatePassword('lowercase1!');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('uppercase');
  });

  test('rejects password without lowercase', () => {
    const result = validatePassword('UPPERCASE1!');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('lowercase');
  });

  test('rejects password without number', () => {
    const result = validatePassword('NoNumbers!');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('number');
  });

  test('rejects password without special character', () => {
    const result = validatePassword('NoSpecial1');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('special');
  });
});

// ==============================================================================
// TEST 7: Password Confirmation
// ==============================================================================

describe('validatePasswordConfirm', () => {
  test('accepts matching passwords', () => {
    expect(validatePasswordConfirm('password123', 'password123').valid).toBe(true);
  });

  test('rejects empty confirmation', () => {
    const result = validatePasswordConfirm('password123', '');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('confirm');
  });

  test('rejects non-matching passwords', () => {
    const result = validatePasswordConfirm('password123', 'password456');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('match');
  });
});

// ==============================================================================
// TEST 8: Name Validation
// ==============================================================================

describe('validateName', () => {
  test('accepts valid names', () => {
    expect(validateName('John Doe').valid).toBe(true);
    expect(validateName("O'Brien").valid).toBe(true);
    expect(validateName('Mary-Jane Watson').valid).toBe(true);
  });

  test('rejects empty name', () => {
    const result = validateName('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  test('rejects name shorter than 2 characters', () => {
    const result = validateName('A');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2 characters');
  });

  test('rejects name with numbers', () => {
    const result = validateName('John123');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid');
  });

  test('rejects name with special characters', () => {
    const result = validateName('John@Doe');
    expect(result.valid).toBe(false);
  });
});

// ==============================================================================
// TEST 9: Verification Code Validation
// ==============================================================================

describe('validateVerificationCode', () => {
  test('accepts valid 6-digit code', () => {
    expect(validateVerificationCode('123456').valid).toBe(true);
    expect(validateVerificationCode('000000').valid).toBe(true);
  });

  test('rejects empty code', () => {
    const result = validateVerificationCode('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  test('rejects code shorter than 6 digits', () => {
    const result = validateVerificationCode('12345');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('6 digits');
  });

  test('rejects code longer than 6 digits', () => {
    const result = validateVerificationCode('1234567');
    expect(result.valid).toBe(false);
  });

  test('rejects code with non-digits', () => {
    const result = validateVerificationCode('12345a');
    expect(result.valid).toBe(false);
  });
});

// ==============================================================================
// TEST 10: Age Validation
// ==============================================================================

describe('validateAge', () => {
  test('accepts valid ages', () => {
    expect(validateAge(25).valid).toBe(true);
    expect(validateAge('30').valid).toBe(true);
    expect(validateAge(18).valid).toBe(true);
  });

  test('rejects age under 18', () => {
    const result = validateAge(17);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('18');
  });

  test('rejects age over 120', () => {
    const result = validateAge(121);
    expect(result.valid).toBe(false);
  });

  test('rejects invalid age string', () => {
    const result = validateAge('not a number');
    expect(result.valid).toBe(false);
  });

  test('accepts age as string', () => {
    expect(validateAge('25').valid).toBe(true);
  });
});
