/**
 * Validation Utilities
 *
 * Common validation functions for all form inputs
 * No external dependencies - pure TypeScript validation
 *
 * Security features:
 * - Input sanitization to prevent XSS
 * - Length limits to prevent overflow attacks
 * - Pattern validation for all input types
 *
 * Returns: { valid: boolean, error?: string }
 */

// ========================================
// Input Sanitization (XSS Prevention)
// ========================================

/**
 * Sanitize text input to prevent XSS attacks
 * Removes potentially dangerous HTML and JavaScript
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove HTML angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, etc.)
    .replace(/data:/gi, '') // Remove data: URIs
    .trim();
}

/**
 * Sanitize email - lowercase and trim only
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim().slice(0, 254);
}

/**
 * Sanitize name - remove non-name characters
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(/[^a-zA-Z\s\-']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

/**
 * Extract only digits from input
 */
export function sanitizeDigits(input: string, maxLength?: number): string {
  if (!input || typeof input !== 'string') return '';
  const digits = input.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ========================================
// Email Validation
// ========================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return { valid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true };
}

// ========================================
// Password Validation
// ========================================

/**
 * Password requirements (per client API spec):
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain a number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain a special character' };
  }

  return { valid: true };
}

/**
 * Confirm password matches original
 */
export function validatePasswordConfirm(
  password: string,
  confirm: string
): ValidationResult {
  if (!confirm) {
    return { valid: false, error: 'Please confirm your password' };
  }

  if (password !== confirm) {
    return { valid: false, error: 'Passwords do not match' };
  }

  return { valid: true };
}

// ========================================
// Name Validation
// ========================================

export function validateName(name: string, fieldName = 'Name'): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: `${fieldName} is too long` };
  }

  // Only allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }

  return { valid: true };
}

// ========================================
// Verification Code Validation
// ========================================

export function validateVerificationCode(code: string): ValidationResult {
  const trimmed = code.trim();

  if (!trimmed) {
    return { valid: false, error: 'Verification code is required' };
  }

  if (!/^\d{6}$/.test(trimmed)) {
    return { valid: false, error: 'Code must be 6 digits' };
  }

  return { valid: true };
}

// ========================================
// Required Field Validation
// ========================================

export function validateRequired(value: string, fieldName = 'This field'): ValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}

// ========================================
// Age Validation
// ========================================

export function validateAge(age: number | string): ValidationResult {
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;

  if (isNaN(ageNum)) {
    return { valid: false, error: 'Please enter a valid age' };
  }

  if (ageNum < 18) {
    return { valid: false, error: 'You must be at least 18 years old' };
  }

  if (ageNum > 120) {
    return { valid: false, error: 'Please enter a valid age' };
  }

  return { valid: true };
}

// ========================================
// Gender Validation
// ========================================

const VALID_GENDERS = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'];

export function validateGender(gender: string): ValidationResult {
  if (!gender) {
    return { valid: false, error: 'Please select your gender' };
  }

  if (!VALID_GENDERS.includes(gender)) {
    return { valid: false, error: 'Invalid gender selection' };
  }

  return { valid: true };
}

// ========================================
// Relationship Status Validation
// ========================================

const VALID_RELATIONSHIP_STATUSES = [
  'SINGLE',
  'PARTNERED',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'ITS_COMPLICATED',
];

export function validateRelationshipStatus(status: string): ValidationResult {
  if (!status) {
    return { valid: false, error: 'Please select your relationship status' };
  }

  if (!VALID_RELATIONSHIP_STATUSES.includes(status)) {
    return { valid: false, error: 'Invalid relationship status' };
  }

  return { valid: true };
}

// ========================================
// Location Validation
// ========================================

export function validateLocation(location: string): ValidationResult {
  const trimmed = location.trim();

  if (!trimmed) {
    return { valid: false, error: 'Location is required' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Location must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Location is too long' };
  }

  return { valid: true };
}

// ========================================
// Bio Validation
// ========================================

export function validateBio(bio: string): ValidationResult {
  const trimmed = bio.trim();

  if (!trimmed) {
    return { valid: false, error: 'Bio is required' };
  }

  if (trimmed.length < 50) {
    return { valid: false, error: 'Bio must be at least 50 characters' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Bio must be less than 500 characters' };
  }

  return { valid: true };
}

// ========================================
// Form Validation Helper
// ========================================

/**
 * Validate entire form object
 * Returns first error found, or null if all valid
 */
export function validateForm<T extends Record<string, unknown>>(
  fields: T,
  validators: Partial<Record<keyof T, (value: unknown) => ValidationResult>>
): ValidationResult {
  for (const [fieldName, validator] of Object.entries(validators)) {
    if (!validator) continue;
    const result = validator(fields[fieldName as keyof T]);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

// ========================================
// Exports
// ========================================

export const Validators = {
  // Sanitizers
  sanitizeText,
  sanitizeEmail,
  sanitizeName,
  sanitizeDigits,
  // Validators
  email: validateEmail,
  password: validatePassword,
  passwordConfirm: validatePasswordConfirm,
  name: validateName,
  verificationCode: validateVerificationCode,
  required: validateRequired,
  age: validateAge,
  gender: validateGender,
  relationshipStatus: validateRelationshipStatus,
  location: validateLocation,
  bio: validateBio,
  form: validateForm,
};

export default Validators;
