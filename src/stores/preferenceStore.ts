import { create } from 'zustand';

interface PreferenceState {
  contentFilters: string[];
  setFilters: (filters: string[]) => void;
  loadFilters: () => void;
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
  contentFilters: [],
  loadFilters: () => {
    try {
        const savedFilters = localStorage.getItem('contentFilters');
        // Check for null, undefined, or empty string
        if (savedFilters && savedFilters.trim() !== '') {
          set({ contentFilters: JSON.parse(savedFilters) });
        }
    } catch (e) {
        console.error("Failed to parse content filters from localStorage", e);
        localStorage.removeItem('contentFilters');
    }
  },
  setFilters: (filters) => {
    set({ contentFilters: filters });
    localStorage.setItem('contentFilters', JSON.stringify(filters));
  },
}));

// Initial load
usePreferenceStore.getState().loadFilters();
