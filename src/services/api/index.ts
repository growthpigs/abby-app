/**
 * API Service Export
 *
 * This is the single import point for all API operations.
 * Automatically switches between mock and real based on config.
 *
 * Usage:
 *   import { api } from '@/services/api';
 *   const profile = await api.getMe();
 *
 * @see docs/BACKEND-INTEGRATION.md
 */

import { API_CONFIG } from '../../config';
import { IApiService } from './types';
import { MockApiService } from './mock';
import { RealApiService } from './client';

// Export the appropriate service based on config
export const api: IApiService = API_CONFIG.USE_REAL_API ? RealApiService : MockApiService;

// Re-export types for convenience
export * from './types';

// Export individual services if needed for testing
export { MockApiService } from './mock';
export { RealApiService } from './client';

// Log which service is active
if (__DEV__) {
  console.log(`[API] Using ${API_CONFIG.USE_REAL_API ? 'REAL' : 'MOCK'} API service`);
}

export default api;
