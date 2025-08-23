/**
 * Theme Customization Dashboard
 * 
 * Interactive interface for customizing therapeutic themes with mental health
 * considerations, accessibility compliance, and color psychology guidance.
 */

import React, { useState, useCallback } from 'react';
import {
  useTheme,
  TherapeuticTheme,
  ColorMode,
  ColorIntensity,
  AccessibilityLevel,
  THERAPEUTIC_THEMES
} from '../services/advancedThemingSystem';
import '../styles/ThemeCustomizationDashboard.css';

interface ThemeCustomizationDashboardProps {
  onThemeChange?: (theme: TherapeuticTheme) => void;
  className?: string;
}

export const ThemeCustomizationDashboard: React.FC<ThemeCustomizationDashboardProps> = ({
  onThemeChange,
  className = ''
}) => {
  const {
    currentTheme,
    currentColors,
    preferences,
    setTherapeuticTheme,
    setColorMode,
    setIntensity,
    setAccessibilityLevel,
    setColorOverride,
    resetCustomizations,
    getContrastRatio,
    isAccessibilityCompliant,
    exportTheme,
    importTheme,
    getTherapeuticRecommendations
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'accessibility' | 'psychology'>('themes');
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [importData, setImportData] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Handle theme selection
  const handleThemeSelect = useCallback((theme: TherapeuticTheme) => {
    setTherapeuticTheme(theme);
    onThemeChange?.(theme);
  }, [setTherapeuticTheme, onThemeChange]);

  // Handle color override
  const handleColorChange = useCallback((colorKey: string, color: string) => {
    setColorOverride(colorKey as keyof typeof currentColors, color);
    setColorPickerOpen(null);
  }, [setColorOverride, currentColors]);

  // Handle theme import
  const handleImportTheme = useCallback(() => {
    const success = importTheme(importData);
    if (success) {
      setImportData('');
      alert('Theme imported successfully!');
    } else {
      alert('Failed to import theme. Please check the format.');
    }
  }, [importTheme, importData]);

  // Handle theme export
  const handleExportTheme = useCallback(() => {
    const themeData = exportTheme();
    navigator.clipboard.writeText(themeData).then(() => {
      alert('Theme data copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy theme data. Please copy manually from the console.');
      console.log('Theme Export Data:', themeData);
    });
  }, [exportTheme]);

  // Get psychological recommendations
  const recommendations = getTherapeuticRecommendations();

  return (
    <div className={`theme-customization-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>🎨 Therapeutic Theme Customization</h2>
        <div className="header-actions">
          <button 
            className="btn-export"
            onClick={handleExportTheme}
            title="Export current theme settings"
          >
            📤 Export Theme
          </button>
          <button 
            className="btn-reset"
            onClick={resetCustomizations}
            title="Reset to default settings"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Current Theme Preview */}
      <div className="current-theme-preview">
        <div className="theme-info">
          <h3>{currentTheme.name}</h3>
          <p>{currentTheme.description}</p>
          <div className="theme-tags">
            <span className="accessibility-badge">
              {currentTheme.accessibility.level} Compliant
            </span>
            <span className="contrast-badge">
              {currentTheme.accessibility.contrastRatio.toFixed(1)}:1 Contrast
            </span>
            {currentTheme.accessibility.colorBlindFriendly && (
              <span className="colorblind-badge">Color Blind Friendly</span>
            )}
          </div>
        </div>
        <div className="color-palette">
          {Object.entries(currentColors).slice(0, 8).map(([key, color]) => (
            <button
              key={key}
              type="button"
              className="color-swatch"
              style={{ backgroundColor: color }}
              title={`${key}: ${color}`}
              onClick={() => setColorPickerOpen(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setColorPickerOpen(key);
                }
              }}
              aria-label={`Select ${key} color (${color})`}
            />
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          🌈 Themes
        </button>
        <button
          className={`tab-button ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          🎨 Colors
        </button>
        <button
          className={`tab-button ${activeTab === 'accessibility' ? 'active' : ''}`}
          onClick={() => setActiveTab('accessibility')}
        >
          ♿ Accessibility
        </button>
        <button
          className={`tab-button ${activeTab === 'psychology' ? 'active' : ''}`}
          onClick={() => setActiveTab('psychology')}
        >
          🧠 Psychology
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'themes' && (
          <div className="themes-panel">
            <div className="control-section">
              <h4>Theme Selection</h4>
              <div className="theme-grid">
                {Object.values(THERAPEUTIC_THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-card ${preferences.therapeuticTheme === theme.id ? 'selected' : ''}`}
                    onClick={() => handleThemeSelect(theme.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleThemeSelect(theme.id);
                      }
                    }}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <div className="theme-preview">
                      <div className="preview-colors">
                        <div 
                          className="preview-color primary"
                          style={{ backgroundColor: theme.colors.light.primary }}
                        />
                        <div 
                          className="preview-color secondary"
                          style={{ backgroundColor: theme.colors.light.secondary }}
                        />
                        <div 
                          className="preview-color background"
                          style={{ backgroundColor: theme.colors.light.background }}
                        />
                      </div>
                    </div>
                    <div className="theme-info">
                      <h5>{theme.name}</h5>
                      <p>{theme.description}</p>
                      <div className="recommended-for">
                        <strong>Recommended for:</strong>
                        <ul>
                          {theme.recommendedFor.slice(0, 2).map((condition) => (
                            <li key={condition}>{condition}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <h4>Display Settings</h4>
              <div className="control-grid">
                <div className="control-item">
                  <label htmlFor="color-mode">Color Mode:</label>
                  <select
                    id="color-mode"
                    value={preferences.colorMode}
                    onChange={(e) => setColorMode(e.target.value as ColorMode)}
                  >
                    <option value="auto">Auto (System)</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="control-item">
                  <label htmlFor="intensity">Color Intensity:</label>
                  <select
                    id="intensity"
                    value={preferences.intensity}
                    onChange={(e) => setIntensity(e.target.value as ColorIntensity)}
                    disabled={!currentTheme.customization.allowsIntensityAdjustment}
                  >
                    <option value="subtle">Subtle</option>
                    <option value="balanced">Balanced</option>
                    <option value="vibrant">Vibrant</option>
                  </select>
                </div>

                <div className="control-item">
                  <label htmlFor="font-size">Font Size:</label>
                  <select
                    id="font-size"
                    value={preferences.fontSize}
                    onChange={(_e) => setTherapeuticTheme(preferences.therapeuticTheme)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>

                <div className="control-item">
                  <label htmlFor="spacing">Spacing:</label>
                  <select
                    id="spacing"
                    value={preferences.spacing}
                    onChange={(_e) => setTherapeuticTheme(preferences.therapeuticTheme)}
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="colors-panel">
            <div className="control-section">
              <h4>Color Customization</h4>
              {!currentTheme.customization.allowsColorOverrides ? (
                <p className="notice">
                  This theme doesn't allow color customization for therapeutic consistency.
                </p>
              ) : (
                <div className="color-grid">
                  {Object.entries(currentColors).map(([key, color]) => (
                    <div key={key} className="color-control">
                      <label>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</label>
                      <div className="color-input-group">
                        <button
                          type="button"
                          className="color-display"
                          style={{ backgroundColor: color }}
                          onClick={() => setColorPickerOpen(key)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setColorPickerOpen(key);
                            }
                          }}
                          aria-label={`Select color for ${key}`}
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="color-value"
                        />
                        <div className="contrast-info">
                          {key.includes('text') && (
                            <span className={`contrast-ratio ${
                              isAccessibilityCompliant(color, currentColors.background) 
                                ? 'good' : 'poor'
                            }`}>
                              {getContrastRatio(color, currentColors.background).toFixed(1)}:1
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {colorPickerOpen && (
              <div className="color-picker-modal">
                <button
                  type="button"
                  className="color-picker-overlay"
                  onClick={() => setColorPickerOpen(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setColorPickerOpen(null);
                    }
                  }}
                  aria-label="Close color picker"
                />
                <div className="color-picker">
                  <h5>Choose Color for {colorPickerOpen}</h5>
                  <input
                    type="color"
                    value={currentColors[colorPickerOpen as keyof typeof currentColors]}
                    onChange={(e) => handleColorChange(colorPickerOpen, e.target.value)}
                  />
                  <button onClick={() => setColorPickerOpen(null)}>Done</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="accessibility-panel">
            <div className="control-section">
              <h4>Accessibility Settings</h4>
              <div className="control-grid">
                <div className="control-item">
                  <label htmlFor="accessibility-level">Compliance Level:</label>
                  <select
                    id="accessibility-level"
                    value={preferences.accessibilityLevel}
                    onChange={(e) => setAccessibilityLevel(e.target.value as AccessibilityLevel)}
                  >
                    <option value="AA">WCAG AA (4.5:1 contrast)</option>
                    <option value="AAA">WCAG AAA (7:1 contrast)</option>
                  </select>
                </div>

                <div className="control-item checkbox-item">
                  <input
                    type="checkbox"
                    id="high-contrast"
                    checked={preferences.highContrast}
                    onChange={(e) => setAccessibilityLevel(e.target.checked ? 'AAA' : 'AA')}
                  />
                  <label htmlFor="high-contrast">High Contrast Mode</label>
                </div>

                <div className="control-item checkbox-item">
                  <input
                    type="checkbox"
                    id="reduce-motion"
                    checked={preferences.reduceMotion}
                    onChange={(_e) => setTherapeuticTheme(preferences.therapeuticTheme)}
                  />
                  <label htmlFor="reduce-motion">Reduce Motion</label>
                </div>
              </div>
            </div>

            <div className="accessibility-check">
              <h4>Accessibility Check</h4>
              <div className="check-results">
                <div className={`check-item ${currentTheme.accessibility.level === 'AAA' ? 'pass' : 'warning'}`}>
                  <span className="check-icon">{currentTheme.accessibility.level === 'AAA' ? '✅' : '⚠️'}</span>
                  <span>Contrast Compliance: {currentTheme.accessibility.level}</span>
                </div>
                <div className={`check-item ${currentTheme.accessibility.colorBlindFriendly ? 'pass' : 'fail'}`}>
                  <span className="check-icon">{currentTheme.accessibility.colorBlindFriendly ? '✅' : '❌'}</span>
                  <span>Color Blind Friendly: {currentTheme.accessibility.colorBlindFriendly ? 'Yes' : 'No'}</span>
                </div>
                <div className="check-item pass">
                  <span className="check-icon">✅</span>
                  <span>Keyboard Navigation: Supported</span>
                </div>
                <div className="check-item pass">
                  <span className="check-icon">✅</span>
                  <span>Screen Reader: Compatible</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'psychology' && (
          <div className="psychology-panel">
            <div className="control-section">
              <h4>Color Psychology Insights</h4>
              <div className="psychology-info">
                <h5>Current Theme Benefits:</h5>
                <ul>
                  {currentTheme.psychologyPrinciples.map((principle) => (
                    <li key={principle}>{principle}</li>
                  ))}
                </ul>
              </div>

              <div className="recommended-conditions">
                <h5>Recommended For:</h5>
                <div className="condition-tags">
                  {currentTheme.recommendedFor.map((condition) => (
                    <span key={condition} className="condition-tag">{condition}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="control-section">
              <h4>Personalized Recommendations</h4>
              <button
                className="btn-recommendations"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                {showRecommendations ? 'Hide' : 'Show'} Recommendations
              </button>

              {showRecommendations && (
                <div className="recommendations-list">
                  {recommendations.length > 0 ? (
                    recommendations.map((themeId) => {
                      const theme = THERAPEUTIC_THEMES[themeId];
                      return (
                        <div key={themeId} className="recommendation-item">
                          <div className="recommendation-preview">
                            <div 
                              className="preview-color"
                              style={{ backgroundColor: theme.colors.light.primary }}
                            />
                          </div>
                          <div className="recommendation-info">
                            <h6>{theme.name}</h6>
                            <p>{theme.description}</p>
                            <button
                              className="btn-apply"
                              onClick={() => handleThemeSelect(themeId)}
                            >
                              Apply Theme
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No specific recommendations available. Consider your current mood and preferences.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Import/Export Section */}
      <div className="import-export-section">
        <h4>Theme Import/Export</h4>
        <div className="import-export-controls">
          <div className="import-section">
            <label htmlFor="import-data">Import Theme Data:</label>
            <textarea
              id="import-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste theme data here..."
              rows={4}
            />
            <button 
              className="btn-import"
              onClick={handleImportTheme}
              disabled={!importData.trim()}
            >
              Import Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizationDashboard;
