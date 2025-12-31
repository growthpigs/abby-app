/**
 * Mock expo-secure-store for Expo Go compatibility
 *
 * Uses in-memory storage as fallback when native module unavailable.
 * Data is NOT persisted across app restarts in this mock.
 */

const memoryStore: Record<string, string> = {};

export async function setItemAsync(key: string, value: string): Promise<void> {
  memoryStore[key] = value;
}

export async function getItemAsync(key: string): Promise<string | null> {
  return memoryStore[key] ?? null;
}

export async function deleteItemAsync(key: string): Promise<void> {
  delete memoryStore[key];
}

export function isAvailableAsync(): Promise<boolean> {
  return Promise.resolve(true);
}

// Export constants that might be used
export const AFTER_FIRST_UNLOCK = 1;
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 2;
export const ALWAYS = 3;
export const ALWAYS_THIS_DEVICE_ONLY = 4;
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 5;
export const WHEN_UNLOCKED = 6;
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 7;
