/**
 * Store Synchronization Module
 *
 * Decouples cross-store updates using Zustand's subscription pattern.
 * This avoids race conditions caused by setTimeout(0) patterns.
 *
 * How it works:
 * - Subscribes to demo store state changes
 * - Synchronously updates vibe controller when relevant state changes
 * - No setTimeout, no race conditions, predictable execution order
 *
 * Usage: Import this module once in App.tsx to initialize subscriptions.
 */

import { useDemoStore, DemoState } from './useDemoStore';
import { useVibeController } from './useVibeController';
import { AppState } from '../types/vibe';

// Map demo states to app states for vibe controller
const DEMO_TO_APP_STATE: Record<DemoState, AppState> = {
  COACH_INTRO: 'COACH_INTRO',
  INTERVIEW: 'INTERVIEW_LIGHT',
  SEARCHING: 'SEARCHING',
  MATCH: 'MATCH_FOUND',
  PAYMENT: 'MATCH_FOUND',
  REVEAL: 'MATCH_FOUND',
  COACH: 'COACH',
};

// Use global to survive hot reloads - Metro bundler preserves globalThis
const SYNC_KEY = '__ABBY_STORE_SYNC__' as const;

interface StoreSyncState {
  isInitialized: boolean;
  unsubscribeState: (() => void) | null;
  unsubscribeCoverage: (() => void) | null;
}

// Extend globalThis type for our sync state
declare global {
  // eslint-disable-next-line no-var
  var __ABBY_STORE_SYNC__: StoreSyncState | undefined;
}

// Get or create global state (survives hot reload)
function getGlobalSyncState(): StoreSyncState {
  if (!globalThis.__ABBY_STORE_SYNC__) {
    globalThis.__ABBY_STORE_SYNC__ = {
      isInitialized: false,
      unsubscribeState: null,
      unsubscribeCoverage: null,
    };
  }
  return globalThis.__ABBY_STORE_SYNC__;
}

/**
 * Initialize store synchronization subscriptions.
 * Call this once when the app starts.
 *
 * Hot-reload safe: Uses globalThis to track subscriptions across module reloads.
 */
export function initializeStoreSync(): void {
  const state = getGlobalSyncState();

  // Already initialized - skip (hot reload protection)
  if (state.isInitialized) {
    if (__DEV__) console.log('[StoreSync] Already initialized, skipping');
    return;
  }

  // Subscribe to demo state changes → sync vibe state
  state.unsubscribeState = useDemoStore.subscribe(
    (s) => s.currentState,
    (currentState, previousState) => {
      if (currentState !== previousState) {
        const appState = DEMO_TO_APP_STATE[currentState];
        if (appState) {
          useVibeController.getState().setFromAppState(appState);
          if (__DEV__) {
            console.log(`[StoreSync] State: ${previousState} → ${currentState} → Vibe: ${appState}`);
          }
        }
      }
    },
    { fireImmediately: false }
  );

  // Subscribe to coverage changes → sync theme progression
  state.unsubscribeCoverage = useDemoStore.subscribe(
    (s) => s.coveragePercent,
    (coveragePercent, previousCoverage) => {
      if (coveragePercent !== previousCoverage) {
        useVibeController.getState().setCoveragePercent(coveragePercent);
        if (__DEV__) {
          console.log(`[StoreSync] Coverage: ${previousCoverage.toFixed(1)}% → ${coveragePercent.toFixed(1)}%`);
        }
      }
    },
    { fireImmediately: false }
  );

  state.isInitialized = true;
  if (__DEV__) console.log('[StoreSync] Initialized store subscriptions');
}

/**
 * Clean up subscriptions (for testing or hot reload).
 */
export function cleanupStoreSync(): void {
  const state = getGlobalSyncState();

  if (state.unsubscribeState) {
    state.unsubscribeState();
    state.unsubscribeState = null;
  }
  if (state.unsubscribeCoverage) {
    state.unsubscribeCoverage();
    state.unsubscribeCoverage = null;
  }
  state.isInitialized = false;
  if (__DEV__) console.log('[StoreSync] Cleaned up store subscriptions');
}

/**
 * Manually trigger vibe sync for current demo state.
 * Useful after loading persisted state.
 */
export function syncVibeFromCurrentState(): void {
  const currentState = useDemoStore.getState().currentState;
  const appState = DEMO_TO_APP_STATE[currentState];
  if (appState) {
    useVibeController.getState().setFromAppState(appState);
  }
}
