import { useState, useEffect, useCallback, useRef } from 'react';

export interface DraftData {
  id: string;
  content: string;
  title?: string;
  timestamp: number;
  lastSaved?: number;
  isDirty: boolean;
}

export interface AutoSaveOptions {
  /** Auto-save interval in milliseconds */
  saveInterval?: number;
  /** Debounce delay for user input in milliseconds */
  debounceDelay?: number;
  /** Maximum number of drafts to keep */
  maxDrafts?: number;
  /** Storage key prefix */
  storagePrefix?: string;
  /** Whether to save to localStorage */
  useLocalStorage?: boolean;
  /** Whether to save to sessionStorage */
  useSessionStorage?: boolean;
  /** Custom save function */
  customSave?: (draft: DraftData) => Promise<boolean>;
  /** Custom load function */
  customLoad?: (id: string) => Promise<DraftData | null>;
  /** Callback when save succeeds */
  onSaveSuccess?: (draft: DraftData) => void;
  /** Callback when save fails */
  onSaveError?: (error: Error, draft: DraftData) => void;
  /** Callback when draft is loaded */
  onDraftLoaded?: (draft: DraftData) => void;
  /** Whether to show save indicators */
  showSaveIndicators?: boolean;
}

export interface AutoSaveState {
  /** Whether auto-save is currently enabled */
  isEnabled: boolean;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Last save timestamp */
  lastSaved: number | null;
  /** Last save error */
  lastError: Error | null;
  /** Current save status */
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  /** Time until next auto-save */
  nextSaveIn: number;
}

export interface AutoSaveHook {
  /** Current auto-save state */
  state: AutoSaveState;
  /** Save draft manually */
  saveDraft: () => Promise<boolean>;
  /** Load draft by ID */
  loadDraft: (id: string) => Promise<DraftData | null>;
  /** Delete draft by ID */
  deleteDraft: (id: string) => Promise<boolean>;
  /** Get all available drafts */
  getAllDrafts: () => Promise<DraftData[]>;
  /** Clear all drafts */
  clearAllDrafts: () => Promise<boolean>;
  /** Enable/disable auto-save */
  setEnabled: (enabled: boolean) => void;
  /** Update draft content */
  updateContent: (content: string) => void;
  /** Update draft title */
  updateTitle: (title: string) => void;
  /** Create new draft */
  createNewDraft: () => string;
  /** Get current draft */
  getCurrentDraft: () => DraftData | null;
}

const DEFAULT_OPTIONS: Required<AutoSaveOptions> = {
  saveInterval: 30000, // 30 seconds
  debounceDelay: 2000, // 2 seconds
  maxDrafts: 10,
  storagePrefix: 'draft_',
  useLocalStorage: true,
  useSessionStorage: false,
  customSave: async () => true,
  customLoad: async () => null,
  onSaveSuccess: () => {},
  onSaveError: () => {},
  onDraftLoaded: () => {},
  showSaveIndicators: true
};

/**
 * Hook for auto-saving drafts with visual indicators and multiple storage options
 */
export const useAutoSave = (
  draftId: string,
  initialContent: string = '',
  initialTitle: string = '',
  options: AutoSaveOptions = {}
): AutoSaveHook => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // State management
  const [state, setState] = useState<AutoSaveState>({
    isEnabled: true,
    isSaving: false,
    isDirty: false,
    lastSaved: null,
    lastError: null,
    saveStatus: 'idle',
    nextSaveIn: opts.saveInterval
  });
  
  const [currentDraft, setCurrentDraft] = useState<DraftData>({
    id: draftId,
    content: initialContent,
    title: initialTitle,
    timestamp: Date.now(),
    isDirty: false
  });
  
  // Refs for timers and debouncing
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputTimeRef = useRef<number>(Date.now());
  
  /**
   * Get storage key for draft
   */
  const getStorageKey = useCallback((id: string): string => {
    return `${opts.storagePrefix}${id}`;
  }, [opts.storagePrefix]);
  
  /**
   * Save to localStorage
   */
  const saveToLocalStorage = useCallback(async (draft: DraftData): Promise<boolean> => {
    try {
      const key = getStorageKey(draft.id);
      localStorage.setItem(key, JSON.stringify(draft));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }, [getStorageKey]);
  
  /**
   * Save to sessionStorage
   */
  const saveToSessionStorage = useCallback(async (draft: DraftData): Promise<boolean> => {
    try {
      const key = getStorageKey(draft.id);
      sessionStorage.setItem(key, JSON.stringify(draft));
      return true;
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
      return false;
    }
  }, [getStorageKey]);
  
  /**
   * Load from localStorage
   */
  const loadFromLocalStorage = useCallback(async (id: string): Promise<DraftData | null> => {
    try {
      const key = getStorageKey(id);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, [getStorageKey]);
  
  /**
   * Load from sessionStorage
   */
  const loadFromSessionStorage = useCallback(async (id: string): Promise<DraftData | null> => {
    try {
      const key = getStorageKey(id);
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load from sessionStorage:', error);
      return null;
    }
  }, [getStorageKey]);
  
  /**
   * Save draft using configured methods
   */
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!currentDraft.isDirty || state.isSaving) {
      return true;
    }
    
    setState(prev => ({ ...prev, isSaving: true, saveStatus: 'saving', lastError: null }));
    
    try {
      const draftToSave: DraftData = {
        ...currentDraft,
        lastSaved: Date.now(),
        timestamp: Date.now()
      };
      
      let success = true;
      
      // Save using configured methods
      if (opts.useLocalStorage) {
        success = success && await saveToLocalStorage(draftToSave);
      }
      
      if (opts.useSessionStorage) {
        success = success && await saveToSessionStorage(draftToSave);
      }
      
      if (opts.customSave !== DEFAULT_OPTIONS.customSave) {
        success = success && await opts.customSave(draftToSave);
      }
      
      if (success) {
        setCurrentDraft(prev => ({ ...prev, isDirty: false, lastSaved: draftToSave.lastSaved }));
        setState(prev => ({
          ...prev,
          isSaving: false,
          isDirty: false,
          lastSaved: draftToSave.lastSaved || null,
          saveStatus: 'saved',
          nextSaveIn: opts.saveInterval
        }));
        
        opts.onSaveSuccess(draftToSave);
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setState(prev => prev.saveStatus === 'saved' ? { ...prev, saveStatus: 'idle' } : prev);
        }, 3000);
        
      } else {
        throw new Error('Failed to save draft');
      }
      
      return success;
      
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Unknown save error');
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastError: saveError,
        saveStatus: 'error'
      }));
      
      opts.onSaveError(saveError, currentDraft);
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setState(prev => prev.saveStatus === 'error' ? { ...prev, saveStatus: 'idle', lastError: null } : prev);
      }, 5000);
      
      return false;
    }
  }, [currentDraft, state.isSaving, opts, saveToLocalStorage, saveToSessionStorage]);
  
  /**
   * Load draft by ID
   */
  const loadDraft = useCallback(async (id: string): Promise<DraftData | null> => {
    try {
      let draft: DraftData | null = null;
      
      // Try custom load first
      if (opts.customLoad !== DEFAULT_OPTIONS.customLoad) {
        draft = await opts.customLoad(id);
      }
      
      // Fall back to localStorage
      if (!draft && opts.useLocalStorage) {
        draft = await loadFromLocalStorage(id);
      }
      
      // Fall back to sessionStorage
      if (!draft && opts.useSessionStorage) {
        draft = await loadFromSessionStorage(id);
      }
      
      if (draft) {
        setCurrentDraft(draft);
        setState(prev => ({
          ...prev,
          isDirty: draft.isDirty,
          lastSaved: draft.lastSaved || null
        }));
        
        opts.onDraftLoaded(draft);
      }
      
      return draft;
      
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, [opts, loadFromLocalStorage, loadFromSessionStorage]);
  
  /**
   * Delete draft by ID
   */
  const deleteDraft = useCallback(async (id: string): Promise<boolean> => {
    try {
      const key = getStorageKey(id);
      
      if (opts.useLocalStorage) {
        localStorage.removeItem(key);
      }
      
      if (opts.useSessionStorage) {
        sessionStorage.removeItem(key);
      }
      
      return true;
      
    } catch (error) {
      console.error('Failed to delete draft:', error);
      return false;
    }
  }, [getStorageKey, opts.useLocalStorage, opts.useSessionStorage]);
  
  /**
   * Get drafts from a specific storage
   */
  const getDraftsFromStorage = useCallback((storage: Storage): DraftData[] => {
    const drafts: DraftData[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(opts.storagePrefix)) {
        const stored = storage.getItem(key);
        if (stored) {
          try {
            const draft = JSON.parse(stored);
            drafts.push(draft);
          } catch (error) {
            console.warn('Failed to parse draft:', key, error);
          }
        }
      }
    }
    
    return drafts;
  }, [opts.storagePrefix]);
  
  /**
   * Get all available drafts
   */
  const getAllDrafts = useCallback(async (): Promise<DraftData[]> => {
    const allDrafts: DraftData[] = [];
    
    try {
      // Get from localStorage
      if (opts.useLocalStorage) {
        allDrafts.push(...getDraftsFromStorage(localStorage));
      }
      
      // Get from sessionStorage
      if (opts.useSessionStorage) {
        const sessionDrafts = getDraftsFromStorage(sessionStorage);
        // Avoid duplicates
        sessionDrafts.forEach(draft => {
          if (!allDrafts.find(d => d.id === draft.id)) {
            allDrafts.push(draft);
          }
        });
      }
      
      // Sort by timestamp (newest first) and limit
      allDrafts.sort((a, b) => b.timestamp - a.timestamp);
      return allDrafts.slice(0, opts.maxDrafts);
      
    } catch (error) {
      console.error('Failed to get all drafts:', error);
      return [];
    }
  }, [opts.useLocalStorage, opts.useSessionStorage, opts.maxDrafts, getDraftsFromStorage]);
  
  /**
   * Clear all drafts
   */
  const clearAllDrafts = useCallback(async (): Promise<boolean> => {
    try {
      const drafts = await getAllDrafts();
      
      for (const draft of drafts) {
        await deleteDraft(draft.id);
      }
      
      return true;
      
    } catch (error) {
      console.error('Failed to clear all drafts:', error);
      return false;
    }
  }, [getAllDrafts, deleteDraft]);
  
  /**
   * Update content with debouncing
   */
  const updateContent = useCallback((content: string) => {
    lastInputTimeRef.current = Date.now();
    
    setCurrentDraft(prev => ({
      ...prev,
      content,
      isDirty: content !== initialContent || prev.title !== initialTitle
    }));
    
    setState(prev => ({ ...prev, isDirty: true }));
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set up debounced save
    debounceTimerRef.current = setTimeout(() => {
      if (state.isEnabled) {
        saveDraft();
      }
    }, opts.debounceDelay);
    
  }, [initialContent, initialTitle, state.isEnabled, opts.debounceDelay, saveDraft]);
  
  /**
   * Update title
   */
  const updateTitle = useCallback((title: string) => {
    setCurrentDraft(prev => ({
      ...prev,
      title,
      isDirty: prev.content !== initialContent || title !== initialTitle
    }));
    
    setState(prev => ({ ...prev, isDirty: true }));
  }, [initialContent, initialTitle]);
  
  /**
   * Enable/disable auto-save
   */
  const setEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isEnabled: enabled }));
    
    if (!enabled) {
      // Clear timers when disabled
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }
  }, []);
  
  /**
   * Create new draft
   */
  const createNewDraft = useCallback((): string => {
    const newId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const newDraft: DraftData = {
      id: newId,
      content: '',
      title: '',
      timestamp: Date.now(),
      isDirty: false
    };
    
    setCurrentDraft(newDraft);
    setState(prev => ({ ...prev, isDirty: false, lastSaved: null, saveStatus: 'idle' }));
    
    return newId;
  }, []);
  
  /**
   * Get current draft
   */
  const getCurrentDraft = useCallback((): DraftData | null => {
    return currentDraft;
  }, [currentDraft]);
  
  /**
   * Set up auto-save interval
   */
  useEffect(() => {
    if (!state.isEnabled) return;
    
    // Clear existing timer
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current);
    }
    
    // Set up auto-save interval
    saveTimerRef.current = setInterval(() => {
      const timeSinceLastInput = Date.now() - lastInputTimeRef.current;
      
      // Only auto-save if user hasn't been typing recently
      if (timeSinceLastInput > opts.debounceDelay && currentDraft.isDirty) {
        saveDraft();
      }
    }, opts.saveInterval);
    
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [state.isEnabled, opts.saveInterval, opts.debounceDelay, currentDraft.isDirty, saveDraft]);
  
  /**
   * Set up countdown timer for next save indicator
   */
  useEffect(() => {
    if (!state.isEnabled || !opts.showSaveIndicators) return;
    
    // Clear existing countdown timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    // Set up countdown timer
    countdownTimerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        nextSaveIn: Math.max(0, prev.nextSaveIn - 1000)
      }));
    }, 1000);
    
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [state.isEnabled, opts.showSaveIndicators]);
  
  /**
   * Load initial draft on mount
   */
  useEffect(() => {
    loadDraft(draftId);
  }, [draftId, loadDraft]);
  
  /**
   * Clean up timers on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);
  
  return {
    state,
    saveDraft,
    loadDraft,
    deleteDraft,
    getAllDrafts,
    clearAllDrafts,
    setEnabled,
    updateContent,
    updateTitle,
    createNewDraft,
    getCurrentDraft
  };
};
