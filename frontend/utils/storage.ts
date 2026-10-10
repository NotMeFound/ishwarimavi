/**
 * Safe Storage Utilities
 * Handles sandbox/iframe constraints, blocked third-party storage,
 * and prevents JSON parsing or QuotaExceeded errors from throwing uncaught exceptions.
 */

const memoryStore: Record<string, string> = {};
const sessionMemoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // Storage blocked or SecurityError in iframe
    }
    return memoryStore[key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    memoryStore[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Storage blocked or quota exceeded
    }
  },

  removeItem: (key: string): void => {
    delete memoryStore[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Storage blocked
    }
  },

  getJSON: <T>(key: string, fallback: T): T => {
    try {
      const raw = safeStorage.getItem(key);
      if (!raw || raw === 'undefined' || raw === 'null') {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return parsed !== undefined && parsed !== null ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  },

  setJSON: <T>(key: string, value: T): void => {
    try {
      safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Ignore serialization issues
    }
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const val = window.sessionStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // Storage blocked or SecurityError
    }
    return sessionMemoryStore[key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    sessionMemoryStore[key] = value;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (e) {
      // Storage blocked
    }
  },

  removeItem: (key: string): void => {
    delete sessionMemoryStore[key];
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (e) {
      // Storage blocked
    }
  },

  getJSON: <T>(key: string, fallback: T): T => {
    try {
      const raw = safeSessionStorage.getItem(key);
      if (!raw || raw === 'undefined' || raw === 'null') {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return parsed !== undefined && parsed !== null ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  },

  setJSON: <T>(key: string, value: T): void => {
    try {
      safeSessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Ignore serialization issues
    }
  }
};
