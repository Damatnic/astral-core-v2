/**
 * @fileoverview Accessibility Settings Component
 * Comprehensive accessibility configuration panel for WCAG 2.1 AAA compliance
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { accessibilityService, AccessibilitySettings } from '../services/accessibilityService';
import { AppButton } from './AppButton';
import { Modal } from './Modal';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettingsComponent: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(accessibilityService.getSettings());
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'motor' | 'cognitive'>('visual');
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    setVoiceSupported(accessibilityService.isVoiceNavigationSupported());
  }, []);

  const handleSettingChange = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    accessibilityService.updateSettings({ [key]: value });
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      // Visual accessibility
      highContrast: false,
      reducedMotion: false,
      increasedTextSize: 1.0,
      focusIndicatorStrength: 'normal' as const,
      colorBlindnessType: 'none' as const,
      
      // Screen reader support
      screenReaderEnabled: false,
      verboseDescriptions: true,
      crisisAnnouncements: true,
      livRegionPoliteness: 'polite' as const,
      
      // Keyboard navigation
      enhancedKeyboardNavigation: true,
      skipLinksEnabled: true,
      crisisShortcutsEnabled: true,
      tabTrapEnabled: false,
      
      // Voice control
      voiceNavigationEnabled: false,
      voiceCommandSensitivity: 'medium' as const,
      emergencyVoiceCommands: true,
      
      // Motor accessibility
      clickTimeoutIncrease: 1.0,
      dragAndDropAlternatives: true,
      stickyKeys: false,
      
      // Cognitive accessibility
      simplifiedInterface: false,
      readingAssistance: false,
      contextualHelp: true,
      errorSummaryEnabled: true
    };
    
    setSettings(defaultSettings);
    accessibilityService.updateSettings(defaultSettings);
  };

  const testVoiceCommands = () => {
    accessibilityService.announce({
      message: 'Voice command test: Say "help" to see available commands.',
      priority: 'medium',
      type: 'status'
    });
  };

  const testScreenReader = () => {
    accessibilityService.announce({
      message: 'Screen reader test announcement. Accessibility features are working properly.',
      priority: 'medium',
      type: 'status'
    });
  };

  const tabs = [
    { id: 'visual', label: 'Visual', icon: '👁️' },
    { id: 'audio', label: 'Audio', icon: '🔊' },
    { id: 'motor', label: 'Motor', icon: '⌨️' },
    { id: 'cognitive', label: 'Cognitive', icon: '🧠' }
  ] as const;

  const renderVisualSettings = () => (
    <div className="accessibility-settings-section">
      <h3>Visual Accessibility</h3>
      
      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
          />
          <span className="setting-title">High Contrast Theme</span>
          <span className="setting-description">Increases contrast for better visibility</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
          />
          <span className="setting-title">Reduce Motion</span>
          <span className="setting-description">Minimizes animations and transitions</span>
        </label>
      </div>

      <div className="setting-group">
        <label htmlFor="text-size-scale" className="setting-title">Text Size Scale</label>
        <input
          id="text-size-scale"
          type="range"
          min="1.0"
          max="2.0"
          step="0.1"
          value={settings.increasedTextSize}
          onChange={(e) => handleSettingChange('increasedTextSize', parseFloat(e.target.value))}
          className="setting-slider"
          aria-describedby="text-size-value"
        />
        <span id="text-size-value" className="setting-value">{Math.round(settings.increasedTextSize * 100)}%</span>
      </div>

      <div className="setting-group">
        <label htmlFor="focus-indicator" className="setting-title">Focus Indicator Strength</label>
        <select
          id="focus-indicator"
          value={settings.focusIndicatorStrength}
          onChange={(e) => handleSettingChange('focusIndicatorStrength', e.target.value as 'normal' | 'enhanced' | 'maximum')}
          className="setting-select"
        >
          <option value="normal">Normal</option>
          <option value="enhanced">Enhanced</option>
          <option value="maximum">Maximum</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="color-vision" className="setting-title">Color Vision Support</label>
        <select
          id="color-vision"
          value={settings.colorBlindnessType}
          onChange={(e) => handleSettingChange('colorBlindnessType', e.target.value as 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'monochrome')}
          className="setting-select"
        >
          <option value="none">Default Colors</option>
          <option value="deuteranopia">Deuteranopia (Green-blind)</option>
          <option value="protanopia">Protanopia (Red-blind)</option>
          <option value="tritanopia">Tritanopia (Blue-blind)</option>
          <option value="monochrome">Monochrome</option>
        </select>
      </div>
    </div>
  );

  const renderAudioSettings = () => (
    <div className="accessibility-settings-section">
      <h3>Audio & Screen Reader</h3>
      
      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.screenReaderEnabled}
            onChange={(e) => handleSettingChange('screenReaderEnabled', e.target.checked)}
          />
          <span className="setting-title">Screen Reader Support</span>
          <span className="setting-description">Enhanced announcements and descriptions</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.verboseDescriptions}
            onChange={(e) => handleSettingChange('verboseDescriptions', e.target.checked)}
            disabled={!settings.screenReaderEnabled}
          />
          <span className="setting-title">Verbose Descriptions</span>
          <span className="setting-description">Detailed element descriptions</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.crisisAnnouncements}
            onChange={(e) => handleSettingChange('crisisAnnouncements', e.target.checked)}
          />
          <span className="setting-title">Crisis Announcements</span>
          <span className="setting-description">Important crisis-related alerts</span>
        </label>
      </div>

      <div className="setting-group">
        <label htmlFor="live-region-politeness" className="setting-title">Live Region Politeness</label>
        <select
          id="live-region-politeness"
          value={settings.livRegionPoliteness}
          onChange={(e) => handleSettingChange('livRegionPoliteness', e.target.value as 'assertive' | 'off' | 'polite')}
          className="setting-select"
          disabled={!settings.screenReaderEnabled}
        >
          <option value="off">Off</option>
          <option value="polite">Polite</option>
          <option value="assertive">Assertive</option>
        </select>
      </div>

      {voiceSupported && (
        <>
          <div className="setting-group">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.voiceNavigationEnabled}
                onChange={(e) => handleSettingChange('voiceNavigationEnabled', e.target.checked)}
              />
              <span className="setting-title">Voice Navigation</span>
              <span className="setting-description">Control the app with voice commands</span>
            </label>
          </div>

          <div className="setting-group">
            <label htmlFor="voice-sensitivity" className="setting-title">Voice Command Sensitivity</label>
            <select
              id="voice-sensitivity"
              value={settings.voiceCommandSensitivity}
              onChange={(e) => handleSettingChange('voiceCommandSensitivity', e.target.value as 'low' | 'medium' | 'high')}
              className="setting-select"
              disabled={!settings.voiceNavigationEnabled}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.emergencyVoiceCommands}
                onChange={(e) => handleSettingChange('emergencyVoiceCommands', e.target.checked)}
              />
              <span className="setting-title">Emergency Voice Commands</span>
              <span className="setting-description">Voice commands for crisis situations</span>
            </label>
          </div>
        </>
      )}

      <div className="setting-actions">
        <AppButton onClick={testScreenReader} variant="secondary">
          Test Screen Reader
        </AppButton>
        {voiceSupported && (
          <AppButton onClick={testVoiceCommands} variant="secondary">
            Test Voice Commands
          </AppButton>
        )}
      </div>
    </div>
  );

  const renderMotorSettings = () => (
    <div className="accessibility-settings-section">
      <h3>Motor & Keyboard</h3>
      
      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.enhancedKeyboardNavigation}
            onChange={(e) => handleSettingChange('enhancedKeyboardNavigation', e.target.checked)}
          />
          <span className="setting-title">Enhanced Keyboard Navigation</span>
          <span className="setting-description">Improved keyboard-only navigation</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.skipLinksEnabled}
            onChange={(e) => handleSettingChange('skipLinksEnabled', e.target.checked)}
          />
          <span className="setting-title">Skip Links</span>
          <span className="setting-description">Quick navigation shortcuts</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.crisisShortcutsEnabled}
            onChange={(e) => handleSettingChange('crisisShortcutsEnabled', e.target.checked)}
          />
          <span className="setting-title">Crisis Shortcuts</span>
          <span className="setting-description">Alt+C for crisis resources, Alt+E for emergency</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.tabTrapEnabled}
            onChange={(e) => handleSettingChange('tabTrapEnabled', e.target.checked)}
          />
          <span className="setting-title">Tab Trapping</span>
          <span className="setting-description">Keep focus within modals and dialogs</span>
        </label>
      </div>

      <div className="setting-group">
        <label htmlFor="click-timeout" className="setting-title">Click Timeout Multiplier</label>
        <input
          id="click-timeout"
          type="range"
          min="1.0"
          max="3.0"
          step="0.1"
          value={settings.clickTimeoutIncrease}
          onChange={(e) => handleSettingChange('clickTimeoutIncrease', parseFloat(e.target.value))}
          className="setting-slider"
          aria-describedby="click-timeout-value"
        />
        <span id="click-timeout-value" className="setting-value">{settings.clickTimeoutIncrease.toFixed(1)}x</span>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.dragAndDropAlternatives}
            onChange={(e) => handleSettingChange('dragAndDropAlternatives', e.target.checked)}
          />
          <span className="setting-title">Drag & Drop Alternatives</span>
          <span className="setting-description">Keyboard alternatives for drag operations</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.stickyKeys}
            onChange={(e) => handleSettingChange('stickyKeys', e.target.checked)}
          />
          <span className="setting-title">Sticky Keys Support</span>
          <span className="setting-description">Sequential key press detection</span>
        </label>
      </div>

      <div className="keyboard-shortcuts-info">
        <h4>Available Keyboard Shortcuts:</h4>
        <ul>
          <li><kbd>Alt</kbd> + <kbd>C</kbd>: Crisis Resources</li>
          <li><kbd>Alt</kbd> + <kbd>E</kbd>: Emergency Contact</li>
          <li><kbd>Alt</kbd> + <kbd>S</kbd>: Safety Plan</li>
          <li><kbd>Alt</kbd> + <kbd>H</kbd>: Accessibility Help</li>
          <li><kbd>Alt</kbd> + <kbd>N</kbd>: Skip to Main Content</li>
          <li><kbd>Alt</kbd> + <kbd>V</kbd>: Toggle Voice Navigation</li>
        </ul>
      </div>
    </div>
  );

  const renderCognitiveSettings = () => (
    <div className="accessibility-settings-section">
      <h3>Cognitive Support</h3>
      
      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.simplifiedInterface}
            onChange={(e) => handleSettingChange('simplifiedInterface', e.target.checked)}
          />
          <span className="setting-title">Simplified Interface</span>
          <span className="setting-description">Reduce visual complexity and distractions</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.readingAssistance}
            onChange={(e) => handleSettingChange('readingAssistance', e.target.checked)}
          />
          <span className="setting-title">Reading Assistance</span>
          <span className="setting-description">Enhanced text readability and focus</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.contextualHelp}
            onChange={(e) => handleSettingChange('contextualHelp', e.target.checked)}
          />
          <span className="setting-title">Contextual Help</span>
          <span className="setting-description">Show helpful tips and guidance</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={settings.errorSummaryEnabled}
            onChange={(e) => handleSettingChange('errorSummaryEnabled', e.target.checked)}
          />
          <span className="setting-title">Error Summaries</span>
          <span className="setting-description">Clear error descriptions and solutions</span>
        </label>
      </div>

      <div className="cognitive-info">
        <h4>Mental Health Specific Features:</h4>
        <ul>
          <li>Crisis-aware interface adaptations</li>
          <li>Calm color schemes during distress</li>
          <li>Progressive disclosure of information</li>
          <li>Consistent navigation patterns</li>
          <li>Clear emergency action paths</li>
        </ul>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'visual': return renderVisualSettings();
      case 'audio': return renderAudioSettings();
      case 'motor': return renderMotorSettings();
      case 'cognitive': return renderCognitiveSettings();
      default: return renderVisualSettings();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Accessibility Settings"
      size="lg"
    >
      <div className="accessibility-settings">
        <div className="accessibility-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'accessibility-tab active' : 'accessibility-tab'}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="accessibility-content">
          {renderActiveTab()}
        </div>

        <div className="accessibility-actions">
          <AppButton onClick={resetToDefaults} variant="secondary">
            Reset to Defaults
          </AppButton>
          <AppButton onClick={onClose} variant="primary">
            Done
          </AppButton>
        </div>
      </div>
    </Modal>
  );
};

export default AccessibilitySettingsComponent;
