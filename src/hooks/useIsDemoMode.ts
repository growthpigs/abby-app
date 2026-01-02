/**
 * useIsDemoMode - Centralized demo mode detection
 *
 * SINGLE SOURCE OF TRUTH for determining if app is in demo mode.
 * All components should use this hook instead of checking tokens/API individually.
 *
 * Demo mode is active when:
 * 1. No auth token is available
 *
 * Future: Could add API availability check here.
 */

import { useState, useEffect, useCallback } from 'react';
import { TokenManager } from '../services/TokenManager';

interface DemoModeState {
  isDemoMode: boolean;
  isLoading: boolean;
  reason: 'no_token' | 'authenticated' | 'checking';
}

/**
 * Hook to check if app is running in demo mode
 * Returns { isDemoMode, isLoading, reason }
 */
export const useIsDemoMode = (): DemoModeState => {
  const [state, setState] = useState<DemoModeState>({
    isDemoMode: false,
    isLoading: true,
    reason: 'checking',
  });

  const checkDemoMode = useCallback(async () => {
    try {
      const token = await TokenManager.getToken();

      if (!token) {
        setState({
          isDemoMode: true,
          isLoading: false,
          reason: 'no_token',
        });
        return;
      }

      setState({
        isDemoMode: false,
        isLoading: false,
        reason: 'authenticated',
      });
    } catch (error) {
      // On error, default to demo mode for safety
      if (__DEV__) {
        console.warn('[useIsDemoMode] Error checking auth:', error);
      }
      setState({
        isDemoMode: true,
        isLoading: false,
        reason: 'no_token',
      });
    }
  }, []);

  useEffect(() => {
    checkDemoMode();
  }, [checkDemoMode]);

  return state;
};

/**
 * Non-hook version for use outside React components
 * Returns a promise that resolves to isDemoMode boolean
 */
export const checkIsDemoMode = async (): Promise<boolean> => {
  try {
    const token = await TokenManager.getToken();
    return !token;
  } catch {
    return true; // Default to demo mode on error
  }
};

/**
 * Synchronous check using cached token (for callbacks)
 * Note: May be stale, use async version when possible
 */
export const isDemoModeSync = (): boolean => {
  // TokenManager caches tokens, so getToken is relatively fast
  // But for truly sync access, we'd need a separate cache
  // For now, this is a placeholder that defaults to checking
  return false; // Caller should use async version
};
