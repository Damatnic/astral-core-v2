/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useI18n } from '../i18n/hooks';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' }
];

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'modal' | 'inline';
  showFlags?: boolean;
  showNativeNames?: boolean;
  className?: string;
  onLanguageChange?: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  showFlags = true,
  showNativeNames = true,
  className = '',
  onLanguageChange
}) => {
  const { language, changeLanguage, t, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === language) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    
    try {
      await changeLanguage(newLanguage);
      onLanguageChange?.(newLanguage);
      
      // Announce language change for accessibility
      const announcement = t('accessibility.language_changed', { 
        language: SUPPORTED_LANGUAGES.find(l => l.code === newLanguage)?.nativeName || newLanguage 
      });
      
      // Create screen reader announcement
      const srElement = document.createElement('div');
      srElement.setAttribute('aria-live', 'polite');
      srElement.setAttribute('aria-atomic', 'true');
      srElement.className = 'sr-only';
      srElement.textContent = announcement;
      document.body.appendChild(srElement);
      
      setTimeout(() => {
        document.body.removeChild(srElement);
      }, 3000);
      
    } catch (error) {
      console.error('[LanguageSelector] Failed to change language:', error);
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  };

  const renderLanguageOption = (lang: LanguageOption, isSelected: boolean = false) => (
    <div 
      key={lang.code}
      className={`language-option ${isSelected ? 'selected' : ''} ${lang.rtl ? 'rtl' : ''}`}
      onClick={() => handleLanguageChange(lang.code)}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleLanguageChange(lang.code);
        }
      }}
    >
      {showFlags && <span className="language-flag" aria-hidden="true">{lang.flag}</span>}
      <span className="language-name">
        {showNativeNames ? lang.nativeName : lang.name}
      </span>
      {isSelected && (
        <span className="language-check" aria-hidden="true">✓</span>
      )}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`language-selector-inline ${className} ${isRTL ? 'rtl' : ''}`}>
        <div className="language-grid">
          {SUPPORTED_LANGUAGES.map(lang => renderLanguageOption(lang, lang.code === language))}
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <>
        <button
          className={`language-trigger ${className}`}
          onClick={() => setIsOpen(true)}
          aria-label={t('settings.change_language', { defaultValue: 'Change language' })}
          disabled={isChanging}
        >
          {showFlags && <span aria-hidden="true">{currentLanguage.flag}</span>}
          <span>{showNativeNames ? currentLanguage.nativeName : currentLanguage.name}</span>
          <span className="language-trigger-arrow" aria-hidden="true">▼</span>
        </button>
        
        {isOpen && (
          <div className="language-modal-overlay" onClick={() => setIsOpen(false)}>
            <div 
              className={`language-modal ${isRTL ? 'rtl' : ''}`}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-labelledby="language-modal-title"
              aria-modal="true"
            >
              <h2 id="language-modal-title" className="language-modal-title">
                {t('settings.select_language', { defaultValue: 'Select Language' })}
              </h2>
              <div className="language-modal-content">
                {SUPPORTED_LANGUAGES.map(lang => renderLanguageOption(lang, lang.code === language))}
              </div>
              <button 
                className="language-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label={t('common.close', { defaultValue: 'Close' })}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default dropdown variant
  return (
    <div className={`language-selector ${className} ${isRTL ? 'rtl' : ''} ${isOpen ? 'open' : ''}`}>
      <button
        className="language-trigger"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('settings.change_language', { defaultValue: 'Change language' })}
        disabled={isChanging}
      >
        {showFlags && <span aria-hidden="true">{currentLanguage.flag}</span>}
        <span>{showNativeNames ? currentLanguage.nativeName : currentLanguage.name}</span>
        <span className={`language-trigger-arrow ${isOpen ? 'open' : ''}`} aria-hidden="true">
          {isChanging ? '⟳' : '▼'}
        </span>
      </button>
      
      {isOpen && (
        <div 
          className="language-dropdown"
          role="listbox"
          aria-label={t('settings.available_languages', { defaultValue: 'Available languages' })}
        >
          {SUPPORTED_LANGUAGES.map(lang => renderLanguageOption(lang, lang.code === language))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
