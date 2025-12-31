/**
 * Validation Utilities
 *
 * Common validation functions for all form inputs
 * No external dependencies - pure TypeScript validation
 *
 * Returns: { valid: boolean, error?: string }
 */

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
export function validateForm(
  fields: Record<string, any>,
  validators: Record<string, (value: any) => ValidationResult>
): ValidationResult {
  for (const [fieldName, validator] of Object.entries(validators)) {
    const result = validator(fields[fieldName]);
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
