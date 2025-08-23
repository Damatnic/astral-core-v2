import React from 'react';
import { AutoSaveState } from '../hooks/useAutoSave';
import './AutoSaveIndicator.css';

export interface AutoSaveIndicatorProps {
  /** Auto-save state from useAutoSave hook */
  state: AutoSaveState;
  /** Whether to show detailed status text */
  showDetailedStatus?: boolean;
  /** Whether to show save countdown */
  showCountdown?: boolean;
  /** Custom position for the indicator */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  /** Custom CSS classes */
  className?: string;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to animate state changes */
  animated?: boolean;
  /** Custom text labels */
  labels?: {
    saving: string;
    saved: string;
    error: string;
    idle: string;
    nextSave: string;
  };
}

const DEFAULT_LABELS = {
  saving: 'Saving...',
  saved: 'Saved',
  error: 'Save failed',
  idle: 'Draft ready',
  nextSave: 'Next save in'
};

/**
 * Visual indicator component for auto-save status
 * Provides user feedback on draft saving state
 */
export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  state,
  showDetailedStatus = true,
  showCountdown = true,
  position = 'top-right',
  className = '',
  showIcons = true,
  animated = true,
  labels = DEFAULT_LABELS
}) => {
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const getStatusIcon = (): string => {
    switch (state.saveStatus) {
      case 'saving':
        return '⏳';
      case 'saved':
        return '✅';
      case 'error':
        return '❌';
      case 'idle':
      default:
        return state.isDirty ? '📝' : '💾';
    }
  };

  const getStatusText = (): string => {
    switch (state.saveStatus) {
      case 'saving':
        return labels.saving;
      case 'saved':
        return labels.saved;
      case 'error':
        return labels.error;
      case 'idle':
      default:
        return labels.idle;
    }
  };

  const getStatusColor = (): string => {
    switch (state.saveStatus) {
      case 'saving':
        return 'blue';
      case 'saved':
        return 'green';
      case 'error':
        return 'red';
      case 'idle':
      default:
        return state.isDirty ? 'orange' : 'gray';
    }
  };

  if (!state.isEnabled) {
    return null;
  }

  const containerClasses = [
    'auto-save-indicator',
    `auto-save-indicator--${position}`,
    `auto-save-indicator--${state.saveStatus}`,
    `auto-save-indicator--${getStatusColor()}`,
    animated && 'auto-save-indicator--animated',
    state.isDirty && 'auto-save-indicator--dirty',
    className
  ].filter(Boolean).join(' ');

  return (
    <output className={containerClasses} aria-live="polite">
      <div className="auto-save-indicator__content">
        {showIcons && (
          <span className="auto-save-indicator__icon" aria-hidden="true">
            {getStatusIcon()}
          </span>
        )}
        
        {showDetailedStatus && (
          <span className="auto-save-indicator__status">
            {getStatusText()}
          </span>
        )}
        
        {state.lastSaved && (
          <span className="auto-save-indicator__timestamp">
            {new Date(state.lastSaved).toLocaleTimeString()}
          </span>
        )}
        
        {state.lastError && (
          <span className="auto-save-indicator__error" title={state.lastError.message}>
            {state.lastError.message}
          </span>
        )}
      </div>
      
      {showCountdown && state.isDirty && state.nextSaveIn > 0 && state.saveStatus === 'idle' && (
        <div className="auto-save-indicator__countdown">
          <span className="auto-save-indicator__countdown-label">
            {labels.nextSave}:
          </span>
          <span className="auto-save-indicator__countdown-time">
            {formatTime(state.nextSaveIn)}
          </span>
        </div>
      )}
      
      {state.isSaving && (
        <div className="auto-save-indicator__progress">
          <div className="auto-save-indicator__progress-bar" />
        </div>
      )}
    </output>
  );
};

export default AutoSaveIndicator;
