import { vi } from 'vitest';

// Mock AsyncStorage for store tests
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => null),
    removeItem: vi.fn(async () => null),
    getAllKeys: vi.fn(async () => []),
    multiGet: vi.fn(async () => []),
    multiSet: vi.fn(async () => null),
    multiRemove: vi.fn(async () => null),
    clear: vi.fn(async () => null),
  },
}));
