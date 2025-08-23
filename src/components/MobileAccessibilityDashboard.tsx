/**
 * Mobile Accessibility Dashboard
 * 
 * Interactive dashboard for monitoring and managing mobile accessibility features.
 * Provides real-time accessibility auditing, preference management, and compliance reporting.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useMobileAccessibility } from './MobileAccessibilityProvider';

// Dashboard state interface
interface DashboardState {
  isOpen: boolean;
  activeTab: 'preferences' | 'audit' | 'compliance' | 'help';
  auditResults: AccessibilityAuditResult | null;
  isAuditing: boolean;
  autoAudit: boolean;
}

// Audit result interfaces (duplicated to avoid circular imports)
interface AccessibilityAuditResult {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  compliantAreas: string[];
}

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'perceivable' | 'operable' | 'understandable' | 'robust';
  description: string;
  element?: string;
  wcagCriterion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix?: string;
}

// Dashboard component
export const MobileAccessibilityDashboard: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    announceToScreenReader,
    checkWCAGCompliance
  } = useMobileAccessibility();

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isOpen: false,
    activeTab: 'preferences',
    auditResults: null,
    isAuditing: false,
    autoAudit: false
  });

  // Toggle dashboard visibility
  const toggleDashboard = useCallback(() => {
    setDashboardState(prev => {
      const newState = { ...prev, isOpen: !prev.isOpen };
      
      if (newState.isOpen) {
        announceToScreenReader('Accessibility dashboard opened', 'assertive');
      } else {
        announceToScreenReader('Accessibility dashboard closed', 'assertive');
      }
      
      return newState;
    });
  }, [announceToScreenReader]);

  // Run accessibility audit
  const runAudit = useCallback(async () => {
    setDashboardState(prev => ({ ...prev, isAuditing: true }));
    announceToScreenReader('Running accessibility audit...', 'polite');
    
    try {
      // Use built-in audit function
      const results = checkWCAGCompliance();
      
      setDashboardState(prev => ({
        ...prev,
        auditResults: results,
        isAuditing: false
      }));
      
      announceToScreenReader(
        `Audit complete. Score: ${results.score}%, ${results.issues.length} issues found`,
        'assertive'
      );
    } catch (error) {
      console.error('Audit failed:', error);
      setDashboardState(prev => ({ ...prev, isAuditing: false }));
      announceToScreenReader('Audit failed. Please try again.', 'assertive');
    }
  }, [checkWCAGCompliance, announceToScreenReader]);

  // Auto-audit on content changes
  useEffect(() => {
    if (!dashboardState.autoAudit) return;
    
    const observer = new MutationObserver(() => {
      // Debounce audit calls
      const timeoutId = setTimeout(() => {
        runAudit();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'aria-labelledby', 'aria-describedby', 'alt', 'role']
    });
    
    return () => observer.disconnect();
  }, [dashboardState.autoAudit, runAudit]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A: Toggle accessibility dashboard
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        toggleDashboard();
      }
      
      // Alt + Shift + A: Run audit
      if (event.altKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (dashboardState.isOpen) {
          runAudit();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleDashboard, runAudit, dashboardState.isOpen]);

  // Render preferences tab
  const renderPreferencesTab = () => (
    <div className="accessibility-tab-content" role="tabpanel" aria-labelledby="preferences-tab">
      <h3>Accessibility Preferences</h3>
      
      <div className="preference-group">
        <h4>Visual</h4>
        
        <label className="preference-item">
          <input
            type="checkbox"
            checked={preferences.highContrast}
            onChange={(e) => updatePreferences({ highContrast: e.target.checked })}
            aria-describedby="high-contrast-desc"
          />
          <span>High Contrast Mode</span>
          <small id="high-contrast-desc">Increases contrast for better visibility</small>
        </label>
        
        <label className="preference-item">
          <input
            type="checkbox"
            checked={preferences.largeText}
            onChange={(e) => updatePreferences({ largeText: e.target.checked })}
            aria-describedby="large-text-desc"
          />
          <span>Large Text</span>
          <small id="large-text-desc">Increases text size for better readability</small>
        </label>
        
        <div className="preference-item">
          <label htmlFor="font-size-slider">Font Size: {preferences.fontSize}%</label>
          <input
            id="font-size-slider"
            type="range"
            min="75"
            max="200"
            step="5"
            value={preferences.fontSize}
            onChange={(e) => updatePreferences({ fontSize: parseInt(e.target.value) })}
            aria-describedby="font-size-desc"
          />
          <small id="font-size-desc">Adjust text size from 75% to 200%</small>
        </div>
        
        <div className="preference-item">
          <label htmlFor="colorblind-select">Color Blindness Support</label>
          <select
            id="colorblind-select"
            value={preferences.colorBlindness}
            onChange={(e) => updatePreferences({ 
              colorBlindness: e.target.value as typeof preferences.colorBlindness 
            })}
          >
            <option value="none">None</option>
            <option value="protanopia">Protanopia (Red-blind)</option>
            <option value="deuteranopia">Deuteranopia (Green-blind)</option>
            <option value="tritanopia">Tritanopia (Blue-blind)</option>
          </select>
        </div>
      </div>
      
      <div className="preference-group">
        <h4>Motion & Animation</h4>
        
        <label className="preference-item">
          <input
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
            aria-describedby="reduced-motion-desc"
          />
          <span>Reduce Motion</span>
          <small id="reduced-motion-desc">Minimizes animations and transitions</small>
        </label>
      </div>
      
      <div className="preference-group">
        <h4>Input & Navigation</h4>
        
        <label className="preference-item">
          <input
            type="checkbox"
            checked={preferences.hapticFeedback}
            onChange={(e) => updatePreferences({ hapticFeedback: e.target.checked })}
            aria-describedby="haptic-desc"
          />
          <span>Haptic Feedback</span>
          <small id="haptic-desc">Vibration feedback for touch interactions</small>
        </label>
        
        <div className="preference-item">
          <label htmlFor="focus-style-select">Focus Indicator Style</label>
          <select
            id="focus-style-select"
            value={preferences.focusIndicatorStyle}
            onChange={(e) => updatePreferences({ 
              focusIndicatorStyle: e.target.value as typeof preferences.focusIndicatorStyle
            })}
          >
            <option value="default">Default</option>
            <option value="enhanced">Enhanced</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </div>
      </div>
      
      <div className="preference-group">
        <h4>Screen Reader</h4>
        
        <label className="preference-item">
          <input
            type="checkbox"
            checked={preferences.screenReader}
            onChange={(e) => updatePreferences({ screenReader: e.target.checked })}
            aria-describedby="screen-reader-desc"
          />
          <span>Screen Reader Optimizations</span>
          <small id="screen-reader-desc">Enhanced support for screen readers</small>
        </label>
        
        <label className="preference-item">
          <input
            type="checkbox"
            checked={preferences.voiceControl}
            onChange={(e) => updatePreferences({ voiceControl: e.target.checked })}
            aria-describedby="voice-control-desc"
          />
          <span>Voice Control Support</span>
          <small id="voice-control-desc">Optimizations for voice navigation</small>
        </label>
      </div>
    </div>
  );

  // Render audit tab
  const renderAuditTab = () => (
    <div className="accessibility-tab-content" role="tabpanel" aria-labelledby="audit-tab">
      <div className="audit-header">
        <h3>Accessibility Audit</h3>
        <div className="audit-controls">
          <button
            onClick={runAudit}
            disabled={dashboardState.isAuditing}
            className="audit-btn primary"
            aria-describedby="audit-btn-desc"
          >
            {dashboardState.isAuditing ? 'Running...' : 'Run Audit'}
          </button>
          <small id="audit-btn-desc">Performs comprehensive accessibility check</small>
          
          <label className="auto-audit-toggle">
            <input
              type="checkbox"
              checked={dashboardState.autoAudit}
              onChange={(e) => setDashboardState(prev => ({ 
                ...prev, 
                autoAudit: e.target.checked 
              }))}
            />
            <span>Auto-audit on changes</span>
          </label>
        </div>
      </div>
      
      {dashboardState.auditResults && (
        <div className="audit-results">
          <div className="audit-score">
            <h4>Accessibility Score</h4>
            <div className={`score ${getScoreClass(dashboardState.auditResults.score)}`}>
              {dashboardState.auditResults.score}%
            </div>
          </div>
          
          {dashboardState.auditResults.issues.length > 0 && (
            <div className="audit-issues">
              <h4>Issues Found ({dashboardState.auditResults.issues.length})</h4>
              <div className="issues-list">
                {dashboardState.auditResults.issues.map((issue, index) => (
                  <div key={`${issue.wcagCriterion}-${issue.description.slice(0, 20)}-${index}`} className={`issue-item ${issue.severity} ${issue.type}`}>
                    <div className="issue-header">
                      <span className="issue-type">{issue.type.toUpperCase()}</span>
                      <span className="issue-criterion">WCAG {issue.wcagCriterion}</span>
                    </div>
                    <h5>{issue.description}</h5>
                    {issue.element && (
                      <code className="issue-element">{issue.element}</code>
                    )}
                    {issue.fix && (
                      <div className="issue-fix">
                        <strong>Fix:</strong> {issue.fix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {dashboardState.auditResults.compliantAreas.length > 0 && (
            <div className="compliant-areas">
              <h4>Compliant Areas</h4>
              <ul>
                {dashboardState.auditResults.compliantAreas.map((area, index) => (
                  <li key={`compliant-area-${area.slice(0, 20)}-${index}`}>{area}</li>
                ))}
              </ul>
            </div>
          )}
          
          {dashboardState.auditResults.suggestions.length > 0 && (
            <div className="audit-suggestions">
              <h4>Suggestions</h4>
              <ul>
                {dashboardState.auditResults.suggestions.map((suggestion, index) => (
                  <li key={`suggestion-${suggestion.slice(0, 20)}-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render compliance tab
  const renderComplianceTab = () => (
    <div className="accessibility-tab-content" role="tabpanel" aria-labelledby="compliance-tab">
      <h3>WCAG Compliance</h3>
      
      <div className="compliance-overview">
        <h4>Standards Compliance</h4>
        <div className="compliance-grid">
          <div className="compliance-item">
            <h5>WCAG 2.1 Level AA</h5>
            <div className="compliance-status target">Target Standard</div>
            <p>Industry standard for web accessibility compliance</p>
          </div>
          
          <div className="compliance-item">
            <h5>Mobile Accessibility</h5>
            <div className="compliance-status focus">Focus Area</div>
            <p>Touch targets, orientation, zoom support</p>
          </div>
          
          <div className="compliance-item">
            <h5>Screen Reader Support</h5>
            <div className="compliance-status {preferences.screenReader ? 'enabled' : 'disabled'}">
              {preferences.screenReader ? 'Enabled' : 'Disabled'}
            </div>
            <p>Optimizations for screen reading software</p>
          </div>
        </div>
      </div>
      
      <div className="wcag-principles">
        <h4>WCAG Principles</h4>
        
        <div className="principle-group">
          <h5>1. Perceivable</h5>
          <ul>
            <li>Text alternatives for images</li>
            <li>Sufficient color contrast</li>
            <li>Resizable text</li>
            <li>Distinguishable content</li>
          </ul>
        </div>
        
        <div className="principle-group">
          <h5>2. Operable</h5>
          <ul>
            <li>Keyboard accessible</li>
            <li>No seizure-inducing content</li>
            <li>Sufficient time limits</li>
            <li>Navigable structure</li>
          </ul>
        </div>
        
        <div className="principle-group">
          <h5>3. Understandable</h5>
          <ul>
            <li>Readable text</li>
            <li>Predictable functionality</li>
            <li>Input assistance</li>
            <li>Error identification</li>
          </ul>
        </div>
        
        <div className="principle-group">
          <h5>4. Robust</h5>
          <ul>
            <li>Compatible with assistive technologies</li>
            <li>Valid HTML markup</li>
            <li>Future-proof implementation</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Render help tab
  const renderHelpTab = () => (
    <div className="accessibility-tab-content" role="tabpanel" aria-labelledby="help-tab">
      <h3>Accessibility Help</h3>
      
      <div className="help-section">
        <h4>Keyboard Shortcuts</h4>
        <dl className="shortcut-list">
          <dt>Alt + A</dt>
          <dd>Toggle accessibility dashboard</dd>
          
          <dt>Alt + Shift + A</dt>
          <dd>Run accessibility audit</dd>
          
          <dt>Alt + M</dt>
          <dd>Skip to main content</dd>
          
          <dt>Alt + N</dt>
          <dd>Skip to navigation</dd>
          
          <dt>Alt + H</dt>
          <dd>Toggle high contrast mode</dd>
          
          <dt>Escape</dt>
          <dd>Close modals and focus traps</dd>
          
          <dt>Tab / Shift + Tab</dt>
          <dd>Navigate between interactive elements</dd>
        </dl>
      </div>
      
      <div className="help-section">
        <h4>Using Screen Readers</h4>
        <ul>
          <li>Navigate by headings using H key</li>
          <li>Navigate by landmarks using D key</li>
          <li>Navigate by links using K key</li>
          <li>Navigate by form fields using F key</li>
          <li>List all links with Insert + F7</li>
          <li>List all headings with Insert + F6</li>
        </ul>
      </div>
      
      <div className="help-section">
        <h4>Mobile Accessibility Tips</h4>
        <ul>
          <li>Use double-tap to activate buttons and links</li>
          <li>Swipe right/left to navigate between elements</li>
          <li>Use three-finger swipe to scroll</li>
          <li>Enable zoom in device settings if needed</li>
          <li>Adjust text size in device accessibility settings</li>
        </ul>
      </div>
      
      <div className="help-section">
        <h4>Getting Help</h4>
        <p>If you're experiencing accessibility issues:</p>
        <ul>
          <li>Check your device's accessibility settings</li>
          <li>Try refreshing the page</li>
          <li>Contact support for assistance</li>
          <li>Report accessibility bugs</li>
        </ul>
      </div>
    </div>
  );

  // Get score class for styling
  const getScoreClass = (score: number): string => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  };

  if (!dashboardState.isOpen) {
    return (
      <button
        className="accessibility-dashboard-toggle"
        onClick={toggleDashboard}
        aria-label="Open accessibility dashboard"
        title="Open accessibility dashboard (Alt + A)"
      >
        <span className="accessibility-icon" aria-hidden="true">♿</span>
      </button>
    );
  }

  return (
    <dialog 
      className="accessibility-dashboard"
      aria-labelledby="dashboard-title"
      open={true}
    >
      <div className="dashboard-header">
        <h2 id="dashboard-title">Accessibility Dashboard</h2>
        <button
          className="dashboard-close"
          onClick={toggleDashboard}
          aria-label="Close accessibility dashboard"
        >
          ×
        </button>
      </div>
      
      <div className="dashboard-tabs" role="tablist">
        {(['preferences', 'audit', 'compliance', 'help'] as const).map(tab => (
          <button
            key={tab}
            id={`${tab}-tab`}
            role="tab"
            aria-selected={dashboardState.activeTab === tab}
            aria-controls={`${tab}-panel`}
            className={`tab-button ${dashboardState.activeTab === tab ? 'active' : ''}`}
            onClick={() => setDashboardState(prev => ({ ...prev, activeTab: tab }))}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="dashboard-content">
        {dashboardState.activeTab === 'preferences' && renderPreferencesTab()}
        {dashboardState.activeTab === 'audit' && renderAuditTab()}
        {dashboardState.activeTab === 'compliance' && renderComplianceTab()}
        {dashboardState.activeTab === 'help' && renderHelpTab()}
      </div>
      
      <style>{`
        .accessibility-dashboard-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #0066cc;
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          transition: all 0.3s ease;
        }
        
        .accessibility-dashboard-toggle:hover {
          background: #0052a3;
          transform: scale(1.05);
        }
        
        .accessibility-dashboard {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          max-height: 600px;
          background: white;
          border: 2px solid #0066cc;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          font-family: system-ui, sans-serif;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #0066cc;
          color: white;
          border-radius: 6px 6px 0 0;
        }
        
        .dashboard-header h2 {
          margin: 0;
          font-size: 18px;
        }
        
        .dashboard-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        
        .dashboard-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .dashboard-tabs {
          display: flex;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }
        
        .tab-button {
          flex: 1;
          padding: 12px 8px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
        }
        
        .tab-button:hover {
          background: #e9e9e9;
        }
        
        .tab-button.active {
          background: white;
          border-bottom-color: #0066cc;
          font-weight: 600;
        }
        
        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        
        .accessibility-tab-content h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #333;
        }
        
        .preference-group {
          margin-bottom: 24px;
        }
        
        .preference-group h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #555;
          padding-bottom: 4px;
          border-bottom: 1px solid #eee;
        }
        
        .preference-item {
          display: block;
          margin-bottom: 16px;
          padding: 8px 0;
        }
        
        .preference-item input[type="checkbox"] {
          margin-right: 8px;
        }
        
        .preference-item input[type="range"] {
          width: 100%;
          margin: 8px 0;
        }
        
        .preference-item select {
          width: 100%;
          padding: 8px;
          margin-top: 4px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        .preference-item small {
          display: block;
          color: #666;
          font-size: 12px;
          margin-top: 4px;
        }
        
        .audit-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .audit-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
        
        .audit-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .audit-btn.primary {
          background: #0066cc;
          color: white;
        }
        
        .audit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .auto-audit-toggle {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .audit-score {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .score {
          font-size: 48px;
          font-weight: bold;
          margin: 8px 0;
        }
        
        .score.excellent { color: #10b981; }
        .score.good { color: #3b82f6; }
        .score.fair { color: #f59e0b; }
        .score.poor { color: #ef4444; }
        
        .issue-item {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 4px;
          border-left: 4px solid;
        }
        
        .issue-item.error { 
          background: #fef2f2; 
          border-left-color: #ef4444; 
        }
        
        .issue-item.warning { 
          background: #fffbeb; 
          border-left-color: #f59e0b; 
        }
        
        .issue-item.info { 
          background: #eff6ff; 
          border-left-color: #3b82f6; 
        }
        
        .issue-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .issue-item h5 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }
        
        .issue-element {
          display: block;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          margin: 8px 0;
        }
        
        .issue-fix {
          margin-top: 8px;
          font-size: 13px;
        }
        
        .compliance-grid {
          display: grid;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .compliance-item {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        
        .compliance-item h5 {
          margin: 0 0 8px 0;
        }
        
        .compliance-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .compliance-status.target { background: #dbeafe; color: #1e40af; }
        .compliance-status.focus { background: #f3e8ff; color: #7c3aed; }
        .compliance-status.enabled { background: #d1fae5; color: #059669; }
        .compliance-status.disabled { background: #fee2e2; color: #dc2626; }
        
        .principle-group {
          margin-bottom: 20px;
        }
        
        .principle-group h5 {
          margin: 0 0 8px 0;
          color: #374151;
        }
        
        .principle-group ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .shortcut-list {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 8px 16px;
          margin-bottom: 20px;
        }
        
        .shortcut-list dt {
          font-family: monospace;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
        }
        
        .shortcut-list dd {
          margin: 0;
        }
        
        .help-section {
          margin-bottom: 24px;
        }
        
        .help-section h4 {
          margin: 0 0 12px 0;
          color: #374151;
        }
        
        .help-section ul {
          margin: 8px 0;
          padding-left: 20px;
        }
        
        .help-section li {
          margin-bottom: 4px;
        }
        
        .compliant-areas,
        .audit-suggestions {
          margin-top: 20px;
        }
        
        .compliant-areas h4,
        .audit-suggestions h4 {
          color: #10b981;
          margin: 0 0 8px 0;
        }
        
        @media (max-width: 480px) {
          .accessibility-dashboard {
            width: calc(100vw - 40px);
            right: 20px;
            left: 20px;
            max-height: calc(100vh - 40px);
          }
          
          .audit-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .audit-controls {
            align-items: stretch;
          }
          
          .compliance-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </dialog>
  );
};

export default MobileAccessibilityDashboard;
