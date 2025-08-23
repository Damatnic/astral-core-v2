/**
 * @fileoverview Accessibility Button Component
 * Floating accessibility button for quick access to accessibility settings
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { accessibilityService } from '../services/accessibilityService';
import AccessibilitySettingsComponent from './AccessibilitySettings';
import { SettingsIcon } from './icons.dynamic';

export const AccessibilityButton: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState(accessibilityService.getSettings());

  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(accessibilityService.getSettings());
    };

    // Listen for settings changes
    window.addEventListener('accessibility-settings-changed', handleSettingsChange);
    
    return () => {
      window.removeEventListener('accessibility-settings-changed', handleSettingsChange);
    };
  }, []);

  const handleQuickActions = (action: string) => {
    switch (action) {
      case 'high-contrast': {
        const newSettings = {
          ...settings,
          highContrast: !settings.highContrast
        };
        accessibilityService.updateSettings(newSettings);
        setSettings(newSettings);
        accessibilityService.announce({
          message: `High contrast ${newSettings.highContrast ? 'enabled' : 'disabled'}`,
          priority: 'high',
          type: 'status'
        });
        break;
      }
      case 'large-text': {
        const currentSize = settings.increasedTextSize || 1.0;
        const newSize = currentSize === 1.0 ? 1.5 : currentSize === 1.5 ? 2.0 : 1.0;
        const newSettings = {
          ...settings,
          increasedTextSize: newSize
        };
        accessibilityService.updateSettings(newSettings);
        setSettings(newSettings);
        accessibilityService.announce({
          message: `Text size set to ${newSize === 1.0 ? 'normal' : newSize === 1.5 ? 'large' : 'extra-large'}`,
          priority: 'high',
          type: 'status'
        });
        break;
      }
      case 'reduce-motion': {
        const newSettings = {
          ...settings,
          reducedMotion: !settings.reducedMotion
        };
        accessibilityService.updateSettings(newSettings);
        setSettings(newSettings);
        accessibilityService.announce({
          message: `Animations ${newSettings.reducedMotion ? 'reduced' : 'enabled'}`,
          priority: 'high',
          type: 'status'
        });
        break;
      }
      case 'screen-reader': {
        const newSettings = {
          ...settings,
          screenReaderEnabled: !settings.screenReaderEnabled
        };
        accessibilityService.updateSettings(newSettings);
        setSettings(newSettings);
        accessibilityService.announce({
          message: `Screen reader mode ${newSettings.screenReaderEnabled ? 'enabled' : 'disabled'}`,
          priority: 'high',
          type: 'status'
        });
        break;
      }
      case 'keyboard-nav': {
        const newSettings = {
          ...settings,
          enhancedKeyboardNavigation: !settings.enhancedKeyboardNavigation
        };
        accessibilityService.updateSettings(newSettings);
        setSettings(newSettings);
        accessibilityService.announce({
          message: `Keyboard navigation ${newSettings.enhancedKeyboardNavigation ? 'enabled' : 'disabled'}`,
          priority: 'high',
          type: 'status'
        });
        break;
      }
      case 'crisis-shortcuts': {
        accessibilityService.announce({
          message: 'Crisis shortcuts: Alt+C for crisis resources, Alt+E for emergency, Alt+S for safety plan, Alt+Q for quiet space',
          priority: 'high',
          type: 'status'
        });
        break;
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'a':
            e.preventDefault();
            setIsExpanded(!isExpanded);
            break;
          case 'h':
            e.preventDefault();
            handleQuickActions('high-contrast');
            break;
          case 't':
            e.preventDefault();
            handleQuickActions('large-text');
            break;
          case 'm':
            e.preventDefault();
            handleQuickActions('reduce-motion');
            break;
          case 'k':
            e.preventDefault();
            handleQuickActions('keyboard-nav');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, settings]);

  return (
    <>
      <style>{`
        .accessibility-floating-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .accessibility-main-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          position: relative;
        }

        .accessibility-main-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .accessibility-main-button:focus {
          outline: 3px solid #667eea;
          outline-offset: 3px;
        }

        .accessibility-main-button.active {
          transform: rotate(45deg);
        }

        .accessibility-icon {
          font-size: 1.5rem;
        }

        .accessibility-quick-panel {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 1rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 280px;
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .accessibility-quick-panel.expanded {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        .accessibility-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 0.5rem;
        }

        .accessibility-panel-title {
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .accessibility-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .accessibility-close-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .quick-action-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-action-item:hover {
          border-color: var(--accent-primary);
          transform: translateX(-2px);
        }

        .quick-action-item.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-color: var(--accent-primary);
        }

        .quick-action-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .quick-action-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          border-radius: 8px;
          color: var(--accent-primary);
        }

        .quick-action-text {
          display: flex;
          flex-direction: column;
        }

        .quick-action-label {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .quick-action-shortcut {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .quick-action-toggle {
          width: 44px;
          height: 24px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          position: relative;
          transition: background 0.3s ease;
        }

        .quick-action-toggle.active {
          background: var(--accent-primary);
        }

        .quick-action-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .quick-action-toggle.active::after {
          transform: translateX(20px);
        }

        .accessibility-settings-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .accessibility-settings-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .accessibility-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
        }

        @media (max-width: 768px) {
          .accessibility-floating-container {
            bottom: 1rem;
            right: 1rem;
          }

          .accessibility-quick-panel {
            min-width: calc(100vw - 2rem);
            right: -1rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .accessibility-main-button,
          .accessibility-quick-panel,
          .quick-action-item,
          .quick-action-toggle::after {
            transition: none;
          }
        }
      `}</style>

      <div className="accessibility-floating-container">
        {isExpanded && (
          <div className={isExpanded ? 'accessibility-quick-panel expanded' : 'accessibility-quick-panel'}>
            <div className="accessibility-panel-header">
              <h3 className="accessibility-panel-title">
                <SettingsIcon />
                Accessibility
              </h3>
              <button
                className="accessibility-close-btn"
                onClick={() => setIsExpanded(false)}
                aria-label="Close accessibility panel"
              >
                ✕
              </button>
            </div>

            <button
              className={settings.highContrast ? 'quick-action-item active' : 'quick-action-item'}
              onClick={() => handleQuickActions('high-contrast')}
              aria-label="Toggle high contrast mode"
            >
              <div className="quick-action-info">
                <div className="quick-action-icon">🔆</div>
                <div className="quick-action-text">
                  <span className="quick-action-label">High Contrast</span>
                  <span className="quick-action-shortcut">Alt + H</span>
                </div>
              </div>
              <div className={settings.highContrast ? 'quick-action-toggle active' : 'quick-action-toggle'} />
            </button>

            <button
              className={(settings.increasedTextSize || 1.0) > 1.0 ? 'quick-action-item active' : 'quick-action-item'}
              onClick={() => handleQuickActions('large-text')}
              aria-label="Cycle text size"
            >
              <div className="quick-action-info">
                <div className="quick-action-icon">📝</div>
                <div className="quick-action-text">
                  <span className="quick-action-label">Large Text</span>
                  <span className="quick-action-shortcut">Alt + T</span>
                </div>
              </div>
              <div className={(settings.increasedTextSize || 1.0) > 1.0 ? 'quick-action-toggle active' : 'quick-action-toggle'} />
            </button>

            <button
              className={settings.reducedMotion ? 'quick-action-item active' : 'quick-action-item'}
              onClick={() => handleQuickActions('reduce-motion')}
              aria-label="Toggle reduced motion"
            >
              <div className="quick-action-info">
                <div className="quick-action-icon">⏸️</div>
                <div className="quick-action-text">
                  <span className="quick-action-label">Reduce Motion</span>
                  <span className="quick-action-shortcut">Alt + M</span>
                </div>
              </div>
              <div className={settings.reducedMotion ? 'quick-action-toggle active' : 'quick-action-toggle'} />
            </button>

            <button
              className={settings.screenReaderEnabled ? 'quick-action-item active' : 'quick-action-item'}
              onClick={() => handleQuickActions('screen-reader')}
              aria-label="Toggle screen reader mode"
            >
              <div className="quick-action-info">
                <div className="quick-action-icon">📢</div>
                <div className="quick-action-text">
                  <span className="quick-action-label">Screen Reader</span>
                  <span className="quick-action-shortcut">Alt + R</span>
                </div>
              </div>
              <div className={settings.screenReaderEnabled ? 'quick-action-toggle active' : 'quick-action-toggle'} />
            </button>

            <button
              className={settings.enhancedKeyboardNavigation ? 'quick-action-item active' : 'quick-action-item'}
              onClick={() => handleQuickActions('keyboard-nav')}
              aria-label="Toggle keyboard navigation"
            >
              <div className="quick-action-info">
                <div className="quick-action-icon">⌨️</div>
                <div className="quick-action-text">
                  <span className="quick-action-label">Keyboard Nav</span>
                  <span className="quick-action-shortcut">Alt + K</span>
                </div>
              </div>
              <div className={settings.enhancedKeyboardNavigation ? 'quick-action-toggle active' : 'quick-action-toggle'} />
            </button>

            <button
              className="quick-action-item"
              onClick={() => handleQuickActions('crisis-shortcuts')}
              aria-label="Announce crisis keyboard shortcuts"
            >
              <div className="quick-action-info">
                <div className="quick-action-icon">🆘</div>
                <div className="quick-action-text">
                  <span className="quick-action-label">Crisis Shortcuts</span>
                  <span className="quick-action-shortcut">Alt + C/E/S/Q</span>
                </div>
              </div>
            </button>

            <button
              className="accessibility-settings-link"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsExpanded(false);
              }}
            >
              <SettingsIcon />
              Full Settings
            </button>
          </div>
        )}

        <button
          className={isExpanded ? 'accessibility-main-button active' : 'accessibility-main-button'}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Close accessibility menu' : 'Open accessibility menu'}
          aria-expanded={isExpanded}
        >
          {(settings.highContrast || settings.screenReaderEnabled || settings.enhancedKeyboardNavigation) && (
            <span className="accessibility-badge" aria-label="Accessibility features active" />
          )}
          <span className="accessibility-icon" aria-hidden="true">♿</span>
        </button>
      </div>

      {isSettingsOpen && (
        <AccessibilitySettingsComponent
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default AccessibilityButton;