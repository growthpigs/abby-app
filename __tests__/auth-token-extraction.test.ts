/**
 * Authentication Token Extraction Tests
 *
 * Verifies that AuthService correctly extracts and stores ID tokens
 * per ADR-001-COGNITO-TOKEN-STRATEGY.md
 *
 * CRITICAL: This test ensures ID tokens (not access tokens) are stored
 * for API calls to match backend expectations.
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
// TEST SUITE: ID Token Extraction (ADR-001)
// ==============================================================================

describe('ID Token Extraction (ADR-001)', () => {
  // ============================================================================
  // TEST 1: ADR-001 Documentation Exists
  // ============================================================================

  test('ADR-001-COGNITO-TOKEN-STRATEGY.md exists', () => {
    expect(fileExists('docs/05-planning/ADR-001-COGNITO-TOKEN-STRATEGY.md')).toBe(
      true,
    );
  });

  test('ADR-001 documents ID token strategy', () => {
    const content = readFile('docs/05-planning/ADR-001-COGNITO-TOKEN-STRATEGY.md');
    expect(content).toContain('ID Token');
    expect(content).toContain('ID token');
    expect(content).toContain('Access Token');
  });

  // ============================================================================
  // TEST 2: AuthService Implements ID Token Storage
  // ============================================================================

  test('AuthService.ts imports TokenManager', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain("import { TokenManager }");
  });

  test('AuthService.ts login method extracts ID token', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain('session.getIdToken().getJwtToken()');
  });

  test('AuthService.ts login method stores ID token (not access token)', () => {
    const source = readFile('src/services/AuthService.ts');

    // CRITICAL: Must extract ID token
    expect(source).toContain('session.getIdToken().getJwtToken()');

    // CRITICAL: Must store the ID token to TokenManager
    expect(source).toContain('await TokenManager.setToken(idToken)');

    // CRITICAL: Verify the token being stored is idToken
    expect(source).toMatch(/await TokenManager\.setToken\(idToken\)/);
  });

  test('AuthService.ts token refresh method stores ID token', () => {
    const source = readFile('src/services/AuthService.ts');

    // Get the refresh method section
    const refreshStart = source.indexOf('_doRefreshToken');
    const refreshEnd = source.indexOf('export', refreshStart + 1);
    const refreshMethod = source.substring(refreshStart, refreshEnd);

    // Must store ID token, not access token
    expect(refreshMethod).toContain('idToken');
    expect(refreshMethod).toContain('TokenManager.setToken');

    // Verify it's storing ID token (not access token)
    expect(refreshMethod).toContain('await TokenManager.setToken(idToken)');
  });

  // ============================================================================
  // TEST 3: Documentation Consistency
  // ============================================================================

  test('API-CONTRACTS.md specifies ID token for API calls', () => {
    const source = readFile('docs/04-technical/API-CONTRACTS.md');
    expect(source).toContain('Bearer <cognito_id_token>');
    expect(source).toContain('getIdToken()');
  });

  test('RUNBOOK.md documents ID token extraction', () => {
    const source = readFile('docs/06-reference/RUNBOOK.md');
    expect(source).toContain('session.getIdToken()');
    expect(source).toContain('ID token');
  });

  test('TECH-STACK.md documents ID token strategy', () => {
    const source = readFile('docs/04-technical/TECH-STACK.md');
    expect(source).toContain('ID token');
    expect(source).toContain('ADR-001');
  });

  // ============================================================================
  // TEST 4: Token Comments Reference Decision
  // ============================================================================

  test('AuthService.ts token storage comments reference ADR-001', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain('ADR-001');
  });

  test('Login method has proper comment about ID token purpose', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain('ID token for API calls per ADR-001');
  });

  test('Refresh method has proper comment about ID token purpose', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain('ID token for API calls (per ADR-001)');
  });

  // ============================================================================
  // TEST 5: TokenManager Compatibility
  // ============================================================================

  test('TokenManager.ts has setToken method', () => {
    const source = readFile('src/services/TokenManager.ts');
    expect(source).toContain('setToken');
  });

  test('TokenManager stores token securely', () => {
    const source = readFile('src/services/TokenManager.ts');
    expect(source).toContain('SecureStore');
  });

  // ============================================================================
  // TEST 6: API Integration Consistency
  // ============================================================================

  test('AbbyRealtimeService uses stored token from TokenManager', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('TokenManager.getToken()');
  });

  test('AbbyRealtimeService sets Authorization header with Bearer token', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('Authorization');
    expect(source).toContain('Bearer ${token}');
  });

  // ============================================================================
  // TEST 7: No Access Token in API Headers
  // ============================================================================

  test('Services use TokenManager.getToken() not getAccessToken', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    // Should use getToken (which is now ID token) not getAccessToken
    expect(source).toContain('TokenManager.getToken()');
    expect(source).not.toContain('getAccessToken()');
  });

  test('API-CONTRACTS.md does NOT show access_token in headers', () => {
    const source = readFile('docs/04-technical/API-CONTRACTS.md');
    const headerSection = source.substring(
      source.indexOf('API Headers'),
      source.indexOf('---', source.indexOf('API Headers')),
    );
    // Should NOT have old access_token pattern
    expect(headerSection).not.toContain('access_token>');
  });
});
