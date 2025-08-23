import { describe, test, expect, beforeEach } from '@jest/globals';
import { usePreferenceStore } from './preferenceStore';
import { act } from '@testing-library/react';

// localStorage is already mocked in setupTests.ts, just get reference
const localStorageMock = window.localStorage as any;

describe('preferenceStore', () => {
  beforeEach(() => {
    usePreferenceStore.setState({ contentFilters: [] });
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('initial state', () => {
    test('should have empty contentFilters array as initial state', () => {
      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual([]);
    });

    test('should have setFilters and loadFilters functions', () => {
      const state = usePreferenceStore.getState();
      expect(typeof state.setFilters).toBe('function');
      expect(typeof state.loadFilters).toBe('function');
    });
  });

  describe('setFilters action', () => {
    test('should update contentFilters in state', () => {
      const testFilters = ['violence', 'substance-abuse', 'self-harm'];
      
      act(() => {
        usePreferenceStore.getState().setFilters(testFilters);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(testFilters);
    });

    test('should save filters to localStorage', () => {
      const testFilters = ['violence', 'substance-abuse'];
      
      act(() => {
        usePreferenceStore.getState().setFilters(testFilters);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'contentFilters',
        JSON.stringify(testFilters)
      );
    });

    test('should handle empty array', () => {
      const emptyFilters: string[] = [];
      
      act(() => {
        usePreferenceStore.getState().setFilters(emptyFilters);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual([]);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'contentFilters',
        JSON.stringify([])
      );
    });

    test('should handle filters with special characters', () => {
      const specialFilters = ['filter-with-dash', 'filter with spaces', 'filter_with_underscore'];
      
      act(() => {
        usePreferenceStore.getState().setFilters(specialFilters);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(specialFilters);
    });

    test('should overwrite previous filters', () => {
      const firstFilters = ['filter1', 'filter2'];
      const secondFilters = ['filter3', 'filter4', 'filter5'];
      
      act(() => {
        usePreferenceStore.getState().setFilters(firstFilters);
      });
      
      act(() => {
        usePreferenceStore.getState().setFilters(secondFilters);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(secondFilters);
      expect(state.contentFilters).not.toEqual(firstFilters);
    });
  });

  describe('loadFilters action', () => {
    test('should load filters from localStorage when data exists', () => {
      const savedFilters = ['violence', 'substance-abuse'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFilters));

      act(() => {
        usePreferenceStore.getState().loadFilters();
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(savedFilters);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('contentFilters');
    });

    test('should not change state when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      act(() => {
        usePreferenceStore.getState().loadFilters();
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('contentFilters');
    });

    test('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      act(() => {
        usePreferenceStore.getState().loadFilters();
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual([]); // Should remain unchanged
      expect(console.error).toHaveBeenCalledWith(
        'Failed to parse content filters from localStorage',
        expect.any(Error)
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('contentFilters');
    });

    test('should handle malformed JSON objects', () => {
      localStorageMock.getItem.mockReturnValue('{"incomplete": true');

      act(() => {
        usePreferenceStore.getState().loadFilters();
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual([]);
      expect(console.error).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('contentFilters');
    });

    test('should handle empty string in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('');

      act(() => {
        usePreferenceStore.getState().loadFilters();
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual([]);
      // Empty string should be handled gracefully without error
      expect(console.error).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    test('should preserve existing filters when localStorage throws error', () => {
      const existingFilters = ['existing-filter'];
      usePreferenceStore.setState({ contentFilters: existingFilters });
      
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      act(() => {
        usePreferenceStore.getState().loadFilters();
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(existingFilters);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to parse content filters from localStorage',
        expect.any(Error)
      );
    });
  });

  describe('state persistence', () => {
    test('should maintain state consistency between set and load operations', () => {
      const testFilters = ['filter1', 'filter2', 'filter3'];
      
      // Set filters
      act(() => {
        usePreferenceStore.getState().setFilters(testFilters);
      });

      // Simulate what would be saved to localStorage
      const savedData = (localStorageMock.setItem as jest.Mock).mock.calls[0][1];
      localStorageMock.getItem.mockReturnValue(savedData);

      // Reset state and load
      usePreferenceStore.setState({ contentFilters: [] });
      
      act(() => {
        usePreferenceStore.getState().loadFilters();
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(testFilters);
    });

    test('should handle complex filter data', () => {
      const complexFilters = [
        'violence-graphic',
        'substance-abuse-detailed',
        'self-harm-methods',
        'eating-disorders',
        'domestic-violence',
        'sexual-content-explicit'
      ];
      
      act(() => {
        usePreferenceStore.getState().setFilters(complexFilters);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'contentFilters',
        JSON.stringify(complexFilters)
      );

      const savedData = (localStorageMock.setItem as jest.Mock).mock.calls[0][1] as string;
      expect(JSON.parse(savedData)).toEqual(complexFilters);
    });
  });

  describe('edge cases', () => {
    test('should handle duplicate filters', () => {
      const filtersWithDuplicates = ['filter1', 'filter2', 'filter1', 'filter3'];
      
      act(() => {
        usePreferenceStore.getState().setFilters(filtersWithDuplicates);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(filtersWithDuplicates); // Store doesn't deduplicate
    });

    test('should handle very long filter arrays', () => {
      const longFilterArray = Array.from({ length: 100 }, (_, i) => `filter-${i}`);
      
      act(() => {
        usePreferenceStore.getState().setFilters(longFilterArray);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(longFilterArray);
      expect(state.contentFilters).toHaveLength(100);
    });

    test('should handle filters with unicode characters', () => {
      const unicodeFilters = ['暴力', 'substance-abuse', '🚫explicit'];
      
      act(() => {
        usePreferenceStore.getState().setFilters(unicodeFilters);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(unicodeFilters);
    });
  });

  describe('concurrent operations', () => {
    test('should handle rapid consecutive setFilters calls', () => {
      const filter1 = ['filter1'];
      const filter2 = ['filter2'];
      const filter3 = ['filter3'];
      
      act(() => {
        usePreferenceStore.getState().setFilters(filter1);
        usePreferenceStore.getState().setFilters(filter2);
        usePreferenceStore.getState().setFilters(filter3);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(filter3); // Should have latest value
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    });

    test('should handle setFilters and loadFilters called together', () => {
      const initialFilters = ['initial-filter'];
      const newFilters = ['new-filter'];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(initialFilters));
      
      act(() => {
        usePreferenceStore.getState().loadFilters();
        usePreferenceStore.getState().setFilters(newFilters);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(newFilters); // setFilters should override loadFilters
    });
  });

  describe('error recovery', () => {
    test('should recover gracefully from localStorage access errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      expect(() => {
        act(() => {
          usePreferenceStore.getState().loadFilters();
        });
      }).not.toThrow();

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual([]);
    });

    test('should continue working after localStorage error', () => {
      // First, trigger an error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      act(() => {
        usePreferenceStore.getState().loadFilters();
      });

      // Then, verify normal operation works
      localStorageMock.getItem.mockReturnValue(null);
      const testFilters = ['recovery-filter'];
      
      act(() => {
        usePreferenceStore.getState().setFilters(testFilters);
      });

      const state = usePreferenceStore.getState();
      expect(state.contentFilters).toEqual(testFilters);
    });
  });
});