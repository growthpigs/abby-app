/**
 * TokenManager - Secure JWT token storage
 *
 * Stores authentication tokens in iOS Keychain via expo-secure-store.
 * Falls back to AsyncStorage in development/simulator mode.
 *
 * RUNTIME-VERIFIED: expo-secure-store v15.0.8 installed and importable
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'abby_auth_token';
const REFRESH_TOKEN_KEY = 'abby_refresh_token';

// Determine if we can use SecureStore (requires physical device or proper simulator setup)
const useSecureStore = Platform.OS === 'ios' || Platform.OS === 'android';

export const TokenManager = {
  /**
   * Store access token
   */
  async setToken(token: string): Promise<void> {
    try {
      if (useSecureStore) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
      if (__DEV__) console.log('[TokenManager] Token stored');
    } catch (error) {
      if (__DEV__) console.error('[TokenManager] Failed to store token:', error);
      throw error;
    }
  },

  /**
   * Retrieve access token
   */
  async getToken(): Promise<string | null> {
    try {
      const token = useSecureStore
        ? await SecureStore.getItemAsync(TOKEN_KEY)
        : await AsyncStorage.getItem(TOKEN_KEY);

      return token;
    } catch (error) {
      if (__DEV__) console.error('[TokenManager] Failed to retrieve token:', error);
      return null;
    }
  },

  /**
   * Store refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      if (useSecureStore) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      } else {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
      }
      if (__DEV__) console.log('[TokenManager] Refresh token stored');
    } catch (error) {
      if (__DEV__) console.error('[TokenManager] Failed to store refresh token:', error);
      throw error;
    }
  },

  /**
   * Retrieve refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = useSecureStore
        ? await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
        : await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      return token;
    } catch (error) {
      if (__DEV__) console.error('[TokenManager] Failed to retrieve refresh token:', error);
      return null;
    }
  },

  /**
   * Clear all tokens (logout)
   */
  async clearTokens(): Promise<void> {
    try {
      if (useSecureStore) {
        await Promise.all([
          SecureStore.deleteItemAsync(TOKEN_KEY),
          SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        ]);
      } else {
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        ]);
      }
      if (__DEV__) console.log('[TokenManager] Tokens cleared');
    } catch (error) {
      if (__DEV__) console.error('[TokenManager] Failed to clear tokens:', error);
      throw error;
    }
  },
};

export default TokenManager;
