import React, { useState, useRef, useEffect } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import AutoSaveIndicator from './AutoSaveIndicator';
import './AutoSaveTextEditor.css';

export interface AutoSaveTextEditorProps {
  /** Initial content */
  initialContent?: string;
  /** Initial title */
  initialTitle?: string;
  /** Draft ID for saving/loading */
  draftId?: string;
  /** Placeholder text for content */
  contentPlaceholder?: string;
  /** Placeholder text for title */
  titlePlaceholder?: string;
  /** Whether to show title input */
  showTitle?: boolean;
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Maximum characters allowed */
  maxCharacters?: number;
  /** Whether to show auto-save indicator */
  showAutoSaveIndicator?: boolean;
  /** Auto-save indicator position */
  indicatorPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  /** Whether to enable auto-save */
  enableAutoSave?: boolean;
  /** Auto-save interval in milliseconds */
  saveInterval?: number;
  /** Callback when content changes */
  onContentChange?: (content: string) => void;
  /** Callback when title changes */
  onTitleChange?: (title: string) => void;
  /** Callback when draft is saved */
  onDraftSaved?: (content: string, title: string) => void;
  /** Callback when draft is loaded */
  onDraftLoaded?: (content: string, title: string) => void;
  /** Custom CSS classes */
  className?: string;
  /** Whether editor is disabled */
  disabled?: boolean;
  /** Whether to show word count */
  showWordCount?: boolean;
  /** Minimum height for content area */
  minHeight?: number;
  /** Maximum height for content area */
  maxHeight?: number;
}

/**
 * Enhanced text editor with auto-save functionality
 * Includes title input, character/word count, and visual save indicators
 */
export const AutoSaveTextEditor: React.FC<AutoSaveTextEditorProps> = ({
  initialContent = '',
  initialTitle = '',
  draftId = `editor_${Date.now()}`,
  contentPlaceholder = 'Start typing...',
  titlePlaceholder = 'Enter title...',
  showTitle = true,
  showCharCount = true,
  maxCharacters = 5000,
  showAutoSaveIndicator = true,
  indicatorPosition = 'top-right',
  enableAutoSave = true,
  saveInterval = 30000,
  onContentChange,
  onTitleChange,
  onDraftSaved,
  onDraftLoaded,
  className = '',
  disabled = false,
  showWordCount = true,
  minHeight = 200,
  maxHeight = 600
}) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-save hook
  const autoSave = useAutoSave(draftId, initialContent, initialTitle, {
    saveInterval,
    onSaveSuccess: (draft) => {
      onDraftSaved?.(draft.content, draft.title || '');
    },
    onDraftLoaded: (draft) => {
      setContent(draft.content);
      setTitle(draft.title || '');
      onDraftLoaded?.(draft.content, draft.title || '');
    }
  });
  
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [isFocused, setIsFocused] = useState(false);
  
  // Update auto-save when enabled state changes
  useEffect(() => {
    autoSave.setEnabled(enableAutoSave);
  }, [enableAutoSave, autoSave]);
  
  /**
   * Handle content change
   */
  const handleContentChange = (newContent: string) => {
    if (disabled) return;
    
    // Enforce character limit
    if (maxCharacters && newContent.length > maxCharacters) {
      return;
    }
    
    setContent(newContent);
    autoSave.updateContent(newContent);
    onContentChange?.(newContent);
  };
  
  /**
   * Handle title change
   */
  const handleTitleChange = (newTitle: string) => {
    if (disabled) return;
    
    setTitle(newTitle);
    autoSave.updateTitle(newTitle);
    onTitleChange?.(newTitle);
  };
  
  /**
   * Get character count
   */
  const getCharCount = (): number => {
    return content.length;
  };
  
  /**
   * Get word count
   */
  const getWordCount = (): number => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  };
  
  /**
   * Get remaining characters
   */
  const getRemainingChars = (): number => {
    return maxCharacters ? maxCharacters - content.length : 0;
  };
  
  /**
   * Get character count CSS class
   */
  const getCharCountClass = (): string => {
    if (!maxCharacters) return '';
    
    const isAtCharLimit = content.length >= maxCharacters;
    const isNearCharLimit = content.length > maxCharacters * 0.9;
    
    if (isAtCharLimit) {
      return 'auto-save-text-editor__char-count--at-limit';
    }
    if (isNearCharLimit) {
      return 'auto-save-text-editor__char-count--near-limit';
    }
    return '';
  };
  
  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      autoSave.saveDraft();
    }
    
    // Ctrl/Cmd + N to create new draft
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      autoSave.createNewDraft();
      setContent('');
      setTitle('');
    }
  };
  
  /**
   * Handle focus events
   */
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  /**
   * Manual save handler
   */
  const handleManualSave = () => {
    autoSave.saveDraft();
  };
  
  const editorClasses = [
    'auto-save-text-editor',
    isFocused && 'auto-save-text-editor--focused',
    disabled && 'auto-save-text-editor--disabled',
    autoSave.state.isDirty && 'auto-save-text-editor--dirty',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={editorClasses}>
      {showTitle && (
        <div className="auto-save-text-editor__title-section">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={titlePlaceholder}
            disabled={disabled}
            className="auto-save-text-editor__title-input"
            aria-label="Document title"
          />
        </div>
      )}
      
      <div className="auto-save-text-editor__content-section">
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={contentPlaceholder}
          disabled={disabled}
          className="auto-save-text-editor__content-input"
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`
          }}
          aria-label="Document content"
          aria-describedby={
            showCharCount || showWordCount 
              ? 'editor-stats' 
              : undefined
          }
        />
        
        {(showCharCount || showWordCount) && (
          <div 
            id="editor-stats" 
            className="auto-save-text-editor__stats"
            aria-live="polite"
          >
            {showWordCount && (
              <span className="auto-save-text-editor__word-count">
                {getWordCount()} words
              </span>
            )}
            
            {showCharCount && (
              <span 
                className={`auto-save-text-editor__char-count ${getCharCountClass()}`}
              >
                {getCharCount()}
                {maxCharacters ? ` / ${maxCharacters}` : ''}
              </span>
            )}
            
            {Boolean(maxCharacters && getRemainingChars() <= 50) && (
              <span className="auto-save-text-editor__remaining-chars">
                {getRemainingChars()} remaining
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="auto-save-text-editor__actions">
        <button
          type="button"
          onClick={handleManualSave}
          disabled={disabled || !autoSave.state.isDirty || autoSave.state.isSaving}
          className="auto-save-text-editor__save-button"
          aria-label="Save draft manually"
        >
          {autoSave.state.isSaving ? 'Saving...' : 'Save'}
        </button>
        
        <div className="auto-save-text-editor__keyboard-shortcuts">
          <span className="auto-save-text-editor__shortcut">
            <kbd>Ctrl</kbd> + <kbd>S</kbd> to save
          </span>
        </div>
      </div>
      
      {showAutoSaveIndicator && (
        <AutoSaveIndicator
          state={autoSave.state}
          position={indicatorPosition}
          showDetailedStatus={true}
          showCountdown={true}
          animated={true}
        />
      )}
    </div>
  );
};

export default AutoSaveTextEditor;
