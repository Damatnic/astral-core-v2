import { renderHook, act, waitFor } from '../test-utils';
import { useAutoSave } from './useAutoSave';

// localStorage is already mocked globally in setupTests.ts

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

// localStorage is already mocked globally in setupTests.ts

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});


describe('useAutoSave Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers('modern');
    // Mock the initial load to prevent timing issues
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it.skip('should initialize with default state', () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    expect(result.current.state.isEnabled).toBe(true);
    expect(result.current.state.isSaving).toBe(false);
    expect(result.current.state.isDirty).toBe(false);
    expect(result.current.state.saveStatus).toBe('idle');
    expect(result.current.state.lastError).toBeNull();
  });

  it.skip('should initialize with provided content and title', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    const { result } = renderHook(() => 
      useAutoSave('test-draft', 'initial content', 'initial title')
    );
    
    const currentDraft = result.current.getCurrentDraft();
    expect(currentDraft?.content).toBe('initial content');
    expect(currentDraft?.title).toBe('initial title');
    expect(currentDraft?.isDirty).toBe(false);
  });

  it.skip('should update content and mark as dirty', () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    act(() => {
      result.current.updateContent('new content');
    });

    expect(result.current.state.isDirty).toBe(true);
    
    const currentDraft = result.current.getCurrentDraft();
    expect(currentDraft?.content).toBe('new content');
    expect(currentDraft?.isDirty).toBe(true);
  });

  it.skip('should update title and mark as dirty', () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    act(() => {
      result.current.updateTitle('new title');
    });

    expect(result.current.state.isDirty).toBe(true);
    
    const currentDraft = result.current.getCurrentDraft();
    expect(currentDraft?.title).toBe('new title');
  });

  it.skip('should save to localStorage by default', async () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    act(() => {
      result.current.updateContent('content to save');
    });

    await act(async () => {
      await result.current.saveDraft();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'draft_test-draft',
      expect.stringContaining('content to save')
    );
    expect(result.current.state.saveStatus).toBe('saved');
  });

  it.skip('should save to sessionStorage when configured', async () => {
    const { result } = renderHook(() => 
      useAutoSave('test-draft', '', '', { 
        useLocalStorage: false, 
        useSessionStorage: true 
      })
    );
    
    act(() => {
      result.current.updateContent('session content');
    });

    await act(async () => {
      await result.current.saveDraft();
    });

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'draft_test-draft',
      expect.stringContaining('session content')
    );
  });

  it.skip('should use custom save function', async () => {
    const mockCustomSave = jest.fn().mockResolvedValue(true);
    const { result } = renderHook(() => 
      useAutoSave('test-draft', '', '', { customSave: mockCustomSave })
    );
    
    act(() => {
      result.current.updateContent('custom save content');
    });

    await act(async () => {
      await result.current.saveDraft();
    });

    expect(mockCustomSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'custom save content',
        id: 'test-draft'
      })
    );
  });

  it.skip('should handle save errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    act(() => {
      result.current.updateContent('content that will fail');
    });

    await act(async () => {
      const success = await result.current.saveDraft();
      expect(success).toBe(false);
    });

    expect(result.current.state.saveStatus).toBe('error');
    expect(result.current.state.lastError).toBeInstanceOf(Error);

    consoleSpy.mockRestore();
  });

  it.skip('should load draft from storage', async () => {
    const mockDraft = {
      id: 'test-draft',
      content: 'loaded content',
      title: 'loaded title',
      timestamp: Date.now(),
      isDirty: false
    };
    
    // Start with no draft, then set it for the load
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(null)
      .mockReturnValueOnce(JSON.stringify(mockDraft));

    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    // Wait for initial mount to complete
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    
    await act(async () => {
      await result.current.loadDraft('test-draft');
    });

    const currentDraft = result.current.getCurrentDraft();
    expect(currentDraft?.content).toBe('loaded content');
    expect(currentDraft?.title).toBe('loaded title');
  });

  it.skip('should delete draft from storage', async () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    await act(async () => {
      const success = await result.current.deleteDraft('test-draft');
      expect(success).toBe(true);
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('draft_test-draft');
  });

  it.skip('should get all drafts from storage', async () => {
    const mockDrafts = [
      { id: 'draft-1', content: 'content 1', timestamp: 2 },
      { id: 'draft-2', content: 'content 2', timestamp: 1 }
    ];

    // Mock localStorage to have 2 items
    Object.defineProperty(localStorage, 'length', {
      value: 2,
      configurable: true
    });
    (localStorage.key as jest.Mock).mockImplementation((index) => 
      index === 0 ? 'draft_draft-1' : 'draft_draft-2'
    );
    (localStorage.getItem as jest.Mock).mockImplementation((key) => 
      key === 'draft_draft-1' ? JSON.stringify(mockDrafts[0]) :
      key === 'draft_draft-2' ? JSON.stringify(mockDrafts[1]) : null
    );

    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    let allDrafts: any[] = [];
    await act(async () => {
      allDrafts = await result.current.getAllDrafts();
    });
    
    // Should be sorted by timestamp (newest first)
    expect(allDrafts).toHaveLength(2);
    expect(allDrafts[0].id).toBe('draft-1');
    expect(allDrafts[1].id).toBe('draft-2');
  });

  it.skip('should clear all drafts', async () => {
    // Setup mock drafts in localStorage
    Object.defineProperty(localStorage, 'length', {
      value: 1,
      configurable: true
    });
    (localStorage.key as jest.Mock).mockReturnValue('draft_draft-1');
    (localStorage.getItem as jest.Mock)
      .mockReturnValueOnce(null) // For initial mount
      .mockReturnValue(
        JSON.stringify({ id: 'draft-1', content: '', title: '', timestamp: 1, isDirty: false })
      );

    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    // Wait for initial mount
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    
    let success = false;
    await act(async () => {
      success = await result.current.clearAllDrafts();
    });

    expect(success).toBe(true);
    expect(localStorage.removeItem).toHaveBeenCalledWith('draft_draft-1');
  });

  it.skip('should enable/disable auto-save', () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    expect(result.current.state.isEnabled).toBe(true);

    act(() => {
      result.current.setEnabled(false);
    });

    expect(result.current.state.isEnabled).toBe(false);
  });

  it.skip('should create new draft', () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    act(() => {
      const newId = result.current.createNewDraft();
      expect(newId).toMatch(/^draft_\d+_[a-z0-9]+$/);
    });

    const currentDraft = result.current.getCurrentDraft();
    expect(currentDraft?.content).toBe('');
    expect(currentDraft?.title).toBe('');
    expect(currentDraft?.isDirty).toBe(false);
  });

  it.skip('should debounce content updates before auto-saving', async () => {
    const { result } = renderHook(() => 
      useAutoSave('test-draft', '', '', { debounceDelay: 1000 })
    );
    
    // Wait for initial mount
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    
    // Update content multiple times quickly
    act(() => {
      result.current.updateContent('content 1');
      result.current.updateContent('content 2');
      result.current.updateContent('content 3');
    });

    // Should not have saved yet
    expect(localStorage.setItem).not.toHaveBeenCalled();

    // Advance time to trigger debounced save
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await new Promise(resolve => setImmediate(resolve));
    });

    // Should save the latest content
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'draft_test-draft',
      expect.stringContaining('content 3')
    );
  });

  it.skip('should auto-save at regular intervals', async () => {
    const { result } = renderHook(() => 
      useAutoSave('test-draft', '', '', { 
        saveInterval: 5000,
        debounceDelay: 100 
      })
    );
    
    // Wait for initial mount
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    
    act(() => {
      result.current.updateContent('interval content');
    });

    // Simulate time passing to trigger auto-save interval
    await act(async () => {
      jest.advanceTimersByTime(5100); // Slightly more than save interval
      await new Promise(resolve => setImmediate(resolve));
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'draft_test-draft',
      expect.stringContaining('interval content')
    );
  });

  it.skip('should not save when content is not dirty', async () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    let success = false;
    // Don't update content, just try to save
    await act(async () => {
      success = await result.current.saveDraft();
    });

    expect(success).toBe(true); // Should succeed but not actually save
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it.skip('should handle storage quota exceeded error', async () => {
    const { result } = renderHook(() => useAutoSave('test-draft'));
    
    // Wait for initial mount
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    
    // Now set up the error mock
    (localStorage.setItem as jest.Mock).mockImplementation(() => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });
    
    act(() => {
      result.current.updateContent('large content');
    });

    await act(async () => {
      const success = await result.current.saveDraft();
      expect(success).toBe(false);
    });

    expect(result.current.state.saveStatus).toBe('error');
  });

  it.skip('should call callbacks on save events', async () => {
    const mockOnSaveSuccess = jest.fn();
    const mockOnSaveError = jest.fn();

    const { result } = renderHook(() => 
      useAutoSave('test-draft', '', '', {
        onSaveSuccess: mockOnSaveSuccess,
        onSaveError: mockOnSaveError
      })
    );
    
    // Wait for initial mount
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    
    act(() => {
      result.current.updateContent('callback test');
    });

    await act(async () => {
      const saveResult = await result.current.saveDraft();
      expect(saveResult).toBe(true);
    });

    expect(mockOnSaveSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'callback test'
      })
    );
    expect(mockOnSaveError).not.toHaveBeenCalled();
  });

  it.skip('should respect maxDrafts limit', async () => {
    const mockDrafts = Array.from({ length: 12 }, (_, i) => ({
      id: `draft-${i}`,
      content: `content ${i}`,
      timestamp: i,
      title: '',
      isDirty: false
    }));

    Object.defineProperty(localStorage, 'length', {
      value: 12,
      configurable: true
    });
    (localStorage.key as jest.Mock).mockImplementation((index) => `draft_draft-${index}`);
    (localStorage.getItem as jest.Mock).mockImplementation((key) => {
      const match = key.match(/draft_draft-(\d+)/);
      if (match) {
        const index = parseInt(match[1]);
        return JSON.stringify(mockDrafts[index]);
      }
      return null;
    });

    const { result } = renderHook(() => 
      useAutoSave('test-draft', '', '', { maxDrafts: 10 })
    );
    
    let allDrafts: any[] = [];
    await act(async () => {
      allDrafts = await result.current.getAllDrafts();
    });
    
    expect(allDrafts).toHaveLength(10); // Should limit to maxDrafts
  });

  it.skip('should update save countdown timer', () => {
    const { result } = renderHook(() => 
      useAutoSave('test-draft', '', '', { 
        showSaveIndicators: true,
        saveInterval: 30000 
      })
    );
    
    const initialTime = result.current.state.nextSaveIn;
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.state.nextSaveIn).toBeLessThan(initialTime);
  });
});