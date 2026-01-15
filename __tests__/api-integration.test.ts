/**
 * API Integration Tests - QuestionsService and Profile Payload
 *
 * Validates:
 * 1. QuestionsService - API integration for questions (GET /v1/questions/next, POST /v1/answers)
 * 2. Profile payload in useOnboardingStore.ts - uses 'birthday' not 'date_of_birth'
 * 3. Answer submission uses snake_case (question_id, response_time)
 * 4. Photo upload in App.tsx - removed manual Content-Type header
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
// TEST 1: QuestionsService Structure
// ==============================================================================

describe('QuestionsService API Integration', () => {
  test('QuestionsService file exists', () => {
    expect(fileExists('src/services/QuestionsService.ts')).toBe(true);
  });

  test('QuestionsService has getNextQuestion method', () => {
    const source = readFile('src/services/QuestionsService.ts');
    // Method accepts optional RequestOptions for AbortSignal support
    expect(source).toContain('async getNextQuestion(options?: RequestOptions)');
    expect(source).toContain('/questions/next');
  });

  test('QuestionsService has submitAnswer method', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('async submitAnswer(');
    expect(source).toContain('/answers');
  });

  test('QuestionsService uses snake_case for API requests', () => {
    const source = readFile('src/services/QuestionsService.ts');
    // Answer submission uses snake_case (question_id, response_time)
    expect(source).toContain('question_id: questionId');
    expect(source).toContain('response_time: responseTime');
  });

  test('QuestionsService uses secureFetch', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain("import { secureFetch");
    expect(source).toContain('await secureFetch(');
  });

  test('QuestionsService handles API response types correctly', () => {
    const source = readFile('src/services/QuestionsService.ts');
    // API returns strings for total_questions/answered_questions
    expect(source).toContain('total_questions: string');
    expect(source).toContain('answered_questions: string');
    expect(source).toContain('parseInt(apiData.total_questions');
    expect(source).toContain('parseInt(apiData.answered_questions');
  });

  test('QuestionsService has timeout configuration', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('REQUEST_TIMEOUT_MS');
    expect(source).toContain('timeout: REQUEST_TIMEOUT_MS');
  });

  test('QuestionsService uses Authorization header', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain("'Authorization': `Bearer ${token}`");
  });

  test('QuestionsService normalizes API question types', () => {
    const source = readFile('src/services/QuestionsService.ts');
    // Maps API types (open_ended, single_select, multi_select, scale)
    // to app types (open_ended, multiple_choice, scale, yes_no)
    expect(source).toContain("'open_ended': 'open_ended'");
    expect(source).toContain("'single_select': 'multiple_choice'");
    expect(source).toContain("'multi_select': 'multiple_choice'");
  });

  test('QuestionsService exports singleton instance', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('export const questionsService = new QuestionsService()');
  });

  test('QuestionsService supports AbortSignal for request cancellation', () => {
    const source = readFile('src/services/QuestionsService.ts');
    // RequestOptions interface with AbortSignal support
    expect(source).toContain('export interface RequestOptions');
    expect(source).toContain('signal?: AbortSignal');
    // Methods pass signal to secureFetch
    expect(source).toContain('signal: options?.signal');
  });
});

// ==============================================================================
// TEST 2: Profile Payload (useOnboardingStore)
// ==============================================================================

describe('Profile Payload - useOnboardingStore', () => {
  test('useOnboardingStore file exists', () => {
    expect(fileExists('src/store/useOnboardingStore.ts')).toBe(true);
  });

  test('Profile payload uses birthday not date_of_birth', () => {
    const source = readFile('src/store/useOnboardingStore.ts');
    // API uses 'birthday' not 'date_of_birth'
    expect(source).toContain('payload.birthday =');
    expect(source).not.toContain('payload.date_of_birth');
  });

  test('Profile payload uses snake_case keys', () => {
    const source = readFile('src/store/useOnboardingStore.ts');
    expect(source).toContain('display_name');
    expect(source).toContain('relationship_type');
    expect(source).toContain('smoking_me');
    expect(source).toContain('smoking_partner');
    expect(source).toContain('ethnicity_preferences');
  });

  test('Birthday is formatted as ISO date string (YYYY-MM-DD)', () => {
    const source = readFile('src/store/useOnboardingStore.ts');
    expect(source).toContain("toISOString().split('T')[0]");
  });

  test('getProfilePayload method exists', () => {
    const source = readFile('src/store/useOnboardingStore.ts');
    expect(source).toContain('getProfilePayload: () => {');
    expect(source).toContain('const payload: Record<string, unknown> = {}');
  });

  test('Profile payload only sends API-accepted fields (no rejected fields)', () => {
    const source = readFile('src/store/useOnboardingStore.ts');
    // FIX VERIFICATION: API rejects these fields, so we must NOT send them
    // These should be submitted via POST /v1/answers instead
    expect(source).not.toContain('payload.latitude');
    expect(source).not.toContain('payload.longitude');
    expect(source).not.toContain('payload.zip_code');
    expect(source).not.toContain('payload.ethnicity =');
    expect(source).not.toContain('payload.ethnicity_preferences');
    expect(source).not.toContain('payload.smoking_me');
    expect(source).not.toContain('payload.smoking_partner');
    expect(source).not.toContain('payload.relationship_type');
    // Should only send: display_name, birthday, gender
    expect(source).toContain('payload.display_name');
    expect(source).toContain('payload.birthday');
    expect(source).toContain('payload.gender');
  });
});

// ==============================================================================
// TEST 3: Photo Upload (App.tsx)
// ==============================================================================

describe('Photo Upload - App.tsx', () => {
  test('App.tsx file exists', () => {
    expect(fileExists('App.tsx')).toBe(true);
  });

  test('Photo upload does NOT set manual Content-Type header', () => {
    const source = readFile('App.tsx');
    // Find the photo upload section
    const photoUploadSection = source.substring(
      source.indexOf('/v1/photos'),
      source.indexOf('/v1/photos') + 1000
    );

    // Should NOT have Content-Type: multipart/form-data (fetch sets it automatically)
    expect(photoUploadSection).not.toContain("'Content-Type': 'multipart/form-data'");
  });

  test('Photo upload uses presigned URL 3-step flow', () => {
    const source = readFile('App.tsx');
    // Step 1: Get presigned URL
    expect(source).toContain('Step 1: Get presigned upload URL from backend');
    expect(source).toContain('/v1/photos/presign');
    // Step 2: Upload to S3
    expect(source).toContain('Step 2: Upload file directly to S3 using presigned URL');
    // Step 3: Register with backend
    expect(source).toContain('Step 3: Register photo with backend');
  });

  test('Photo upload uses snake_case for API fields', () => {
    const source = readFile('App.tsx');
    expect(source).toContain('file_name: filename');
    expect(source).toContain('content_type: contentType');
    expect(source).toContain('file_key: fileKey');
    expect(source).toContain('is_primary: false');
  });

  test('Photo upload uses Authorization header with Bearer token', () => {
    const source = readFile('App.tsx');
    // Verify Authorization header is used for photo upload
    // The pattern uses double quotes in App.tsx
    expect(source).toContain("'Authorization': `Bearer ${token}`");
  });
});

// ==============================================================================
// TEST 4: Error Handling
// ==============================================================================

describe('Error Handling in API Services', () => {
  test('QuestionsService wraps errors with error codes', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain("code: 'REQUEST_FAILED'");
    expect(source).toContain("code: 'NO_QUESTIONS'");
    expect(source).toContain("code: `HTTP_${response.status}`");
  });

  test('QuestionsService handles non-authenticated state', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain("throw new Error('Not authenticated')");
    expect(source).toContain('if (!token)');
  });

  test('QuestionsService logs in dev mode only', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('if (__DEV__) console.log');
    expect(source).toContain('if (__DEV__) console.error');
  });

  test('useOnboardingStore has persistence error handling', () => {
    const source = readFile('src/store/useOnboardingStore.ts');
    expect(source).toContain('try {');
    expect(source).toContain('catch (error)');
    expect(source).toContain('if (__DEV__)');
  });
});

// ==============================================================================
// TEST 5: API Types and Interfaces
// ==============================================================================

describe('API Types and Interfaces', () => {
  test('QuestionsService defines ApiQuestion interface', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('export interface ApiQuestion');
    expect(source).toContain('question_id: string');
    expect(source).toContain('question_text: string');
    expect(source).toContain("question_type: 'open_ended' | 'single_select' | 'multi_select' | 'scale'");
  });

  test('QuestionsService defines ApiNextQuestionsResponse interface', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('export interface ApiNextQuestionsResponse');
    expect(source).toContain('questions: ApiQuestion[]');
    expect(source).toContain('profile_completion: number');
  });

  test('QuestionsService defines normalized Question interface', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('export interface Question');
    expect(source).toContain('id: string');
    expect(source).toContain("type: 'multiple_choice' | 'open_ended' | 'scale' | 'yes_no'");
  });

  test('QuestionsService has question transformation method', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain('private transformQuestion(apiQ: ApiQuestion): Question');
  });
});

// ==============================================================================
// TEST 6: Config Integration
// ==============================================================================

describe('Config Integration', () => {
  test('QuestionsService uses centralized API_CONFIG', () => {
    const source = readFile('src/services/QuestionsService.ts');
    expect(source).toContain("import { API_CONFIG } from '../config'");
    expect(source).toContain('const API_BASE_URL = API_CONFIG.API_URL');
  });

  test('Config exports API_URL getter', () => {
    const source = readFile('src/config.ts');
    expect(source).toContain('get API_URL()');
    expect(source).toContain('dev.api.myaimatchmaker.ai');
  });
});
