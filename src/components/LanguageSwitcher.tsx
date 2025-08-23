/**
 * Language Switcher Component
 * 
 * Provides language selection with cultural awareness,
 * RTL support, and accessibility features
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCulturalContext } from '../i18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'modal';
  showFlags?: boolean;
  showNativeNames?: boolean;
  compact?: boolean;
  className?: string;
  onLanguageChange?: (language: string) => void;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', rtl: false },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭', rtl: false }
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showFlags = true,
  showNativeNames = true,
  compact = false,
  className = '',
  onLanguageChange
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize selected language
  useEffect(() => {
    const currentLang = languages.find(lang => 
      lang.code === i18n.language || 
      i18n.language.startsWith(lang.code.split('-')[0])
    );
    setSelectedLanguage(currentLang || languages[0]);
  }, [i18n.language]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  // Handle language change
  const handleLanguageSelect = async (language: Language) => {
    if (language.code === i18n.language) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    
    try {
      // Change language
      await changeLanguage(language.code);
      
      // Get cultural context
      const context = getCulturalContext(language.code);
      
      // Apply RTL/LTR changes
      if (language.rtl) {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = language.code;
        document.body.classList.add('rtl-mode');
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = language.code;
        document.body.classList.remove('rtl-mode');
      }
      
      // Store preference
      localStorage.setItem('preferred_language', language.code);
      localStorage.setItem('cultural_context', JSON.stringify(context));
      
      // Notify parent component
      if (onLanguageChange) {
        onLanguageChange(language.code);
      }
      
      // Show success notification
      showNotification(t('language.changed', { language: language.nativeName }));
      
      setSelectedLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
      showNotification(t('language.changeFailed'), 'error');
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `language-notification language-notification--${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Render dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`language-switcher language-switcher--dropdown ${className}`} ref={dropdownRef}>
        <button
          ref={buttonRef}
          className="language-switcher__button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={t('language.selectLanguage')}
          disabled={isChanging}
        >
          {showFlags && selectedLanguage && (
            <span className="language-flag" aria-hidden="true">
              {selectedLanguage.flag}
            </span>
          )}
          {!compact && selectedLanguage && (
            <span className="language-name">
              {showNativeNames ? selectedLanguage.nativeName : selectedLanguage.name}
            </span>
          )}
          <svg
            className={isOpen ? 'language-arrow language-arrow--open' : 'language-arrow'}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        {isOpen && (
          <ul
            className="language-menu"
            role="listbox"
            aria-label={t('language.availableLanguages')}
            onKeyDown={handleKeyDown}
          >
            {languages.map((language) => (
              <li
                key={language.code}
                role="option"
                aria-selected={language.code === i18n.language}
                className={`language-option ${
                  language.code === i18n.language ? 'language-option--selected' : ''
                } ${language.rtl ? 'language-option--rtl' : ''}`}
              >
                <button
                  className="language-option__button"
                  onClick={() => handleLanguageSelect(language)}
                  disabled={isChanging}
                  dir={language.rtl ? 'rtl' : 'ltr'}
                >
                  {showFlags && (
                    <span className="language-flag" aria-hidden="true">
                      {language.flag}
                    </span>
                  )}
                  <div className="language-names">
                    <span className="language-name">{language.name}</span>
                    {showNativeNames && language.name !== language.nativeName && (
                      <span className="language-native">{language.nativeName}</span>
                    )}
                  </div>
                  {language.code === i18n.language && (
                    <svg
                      className="language-check"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M13.5 4.5L6 12L2.5 8.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Render inline variant
  if (variant === 'inline') {
    return (
      <div className={`language-switcher language-switcher--inline ${className}`}>
        <div className="language-inline-list" role="radiogroup" aria-label={t('language.selectLanguage')}>
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-inline-option ${
                language.code === i18n.language ? 'language-inline-option--selected' : ''
              }`}
              onClick={() => handleLanguageSelect(language)}
              disabled={isChanging}
              role="radio"
              aria-checked={language.code === i18n.language}
              dir={language.rtl ? 'rtl' : 'ltr'}
            >
              {showFlags && (
                <span className="language-flag" aria-hidden="true">
                  {language.flag}
                </span>
              )}
              {compact ? (
                <span className="language-code">{language.code.toUpperCase()}</span>
              ) : (
                <span className="language-name">
                  {showNativeNames ? language.nativeName : language.name}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render modal variant
  return (
    <div className={`language-switcher language-switcher--modal ${className}`}>
      <button
        className="language-switcher__trigger"
        onClick={() => setIsOpen(true)}
        aria-label={t('language.selectLanguage')}
        disabled={isChanging}
      >
        {showFlags && selectedLanguage && (
          <span className="language-flag" aria-hidden="true">
            {selectedLanguage.flag}
          </span>
        )}
        <span className="language-name">
          {selectedLanguage?.nativeName || 'Language'}
        </span>
      </button>
      
      {isOpen && (
        <div
          className="language-modal-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        >
          <div
            className="language-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
          >
            <div className="language-modal__header">
              <h2 id="language-modal-title">{t('language.selectLanguage')}</h2>
              <button
                className="language-modal__close"
                onClick={() => setIsOpen(false)}
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
            
            <div className="language-modal__content">
              <div className="language-grid">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    className={`language-card ${
                      language.code === i18n.language ? 'language-card--selected' : ''
                    }`}
                    onClick={() => handleLanguageSelect(language)}
                    disabled={isChanging}
                    dir={language.rtl ? 'rtl' : 'ltr'}
                  >
                    <div className="language-card__flag">{language.flag}</div>
                    <div className="language-card__name">{language.name}</div>
                    <div className="language-card__native">{language.nativeName}</div>
                    {language.rtl && (
                      <div className="language-card__rtl">RTL</div>
                    )}
                    {language.code === i18n.language && (
                      <div className="language-card__selected">✓</div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="language-modal__info">
                <p>{t('language.info.crisisAvailable')}</p>
                <p>{t('language.info.culturallyAdapted')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = `
  /* Base styles */
  .language-switcher {
    position: relative;
    font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  }

  .language-flag {
    font-size: 20px;
    line-height: 1;
  }

  /* Dropdown variant */
  .language-switcher--dropdown {
    display: inline-block;
  }

  .language-switcher__button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 44px;
  }

  .language-switcher__button:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .language-switcher__button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .language-switcher__button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .language-arrow {
    transition: transform 0.2s;
  }

  .language-arrow--open {
    transform: rotate(180deg);
  }

  .language-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 200px;
    max-height: 400px;
    overflow-y: auto;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    list-style: none;
    margin: 0;
    padding: 4px;
    z-index: 1000;
    animation: slideDown 0.2s ease-out;
  }

  .language-option {
    list-style: none;
  }

  .language-option__button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    color: #374151;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }

  .language-option--rtl .language-option__button {
    text-align: right;
    flex-direction: row-reverse;
  }

  .language-option__button:hover {
    background: #f3f4f6;
  }

  .language-option__button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }

  .language-option--selected .language-option__button {
    background: #eff6ff;
    color: #2563eb;
    font-weight: 600;
  }

  .language-names {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .language-native {
    font-size: 12px;
    color: #6b7280;
  }

  .language-check {
    color: #10b981;
  }

  /* Inline variant */
  .language-switcher--inline {
    display: inline-block;
  }

  .language-inline-list {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #f3f4f6;
    border-radius: 8px;
  }

  .language-inline-option {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 36px;
  }

  .language-inline-option:hover {
    background: white;
    color: #374151;
  }

  .language-inline-option:focus {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }

  .language-inline-option--selected {
    background: white;
    color: #2563eb;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .language-code {
    font-size: 12px;
    font-weight: 600;
  }

  /* Modal variant */
  .language-switcher--modal {
    display: inline-block;
  }

  .language-switcher__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .language-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease-out;
  }

  .language-modal {
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    animation: scaleIn 0.2s ease-out;
  }

  .language-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .language-modal__header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
  }

  .language-modal__close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
  }

  .language-modal__close:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .language-modal__content {
    padding: 20px;
    overflow-y: auto;
  }

  .language-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .language-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .language-card:hover {
    border-color: #9ca3af;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .language-card:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .language-card--selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .language-card__flag {
    font-size: 32px;
  }

  .language-card__name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    text-align: center;
  }

  .language-card__native {
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  }

  .language-card__rtl {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 6px;
    background: #fbbf24;
    color: #78350f;
    font-size: 10px;
    font-weight: 600;
    border-radius: 4px;
  }

  .language-card__selected {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #10b981;
    color: white;
    border-radius: 50%;
    font-size: 12px;
  }

  .language-modal__info {
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .language-modal__info p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #6b7280;
  }

  .language-modal__info p:last-child {
    margin-bottom: 0;
  }

  /* Notification styles */
  .language-notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    background: #10b981;
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideUp 0.3s ease-out;
  }

  .language-notification--error {
    background: #ef4444;
  }

  .language-notification.fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }

  /* Animations */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    to {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .language-switcher__button,
    .language-switcher__trigger {
      background: #1f2937;
      border-color: #374151;
      color: #f3f4f6;
    }

    .language-switcher__button:hover,
    .language-switcher__trigger:hover {
      background: #111827;
      border-color: #4b5563;
    }

    .language-menu {
      background: #1f2937;
      border-color: #374151;
    }

    .language-option__button {
      color: #f3f4f6;
    }

    .language-option__button:hover {
      background: #374151;
    }

    .language-option--selected .language-option__button {
      background: #1e3a8a;
      color: #93bbfc;
    }

    .language-modal {
      background: #1f2937;
    }

    .language-modal__header {
      border-color: #374151;
    }

    .language-modal__header h2 {
      color: #f3f4f6;
    }

    .language-modal__close {
      color: #9ca3af;
    }

    .language-modal__close:hover {
      background: #374151;
      color: #f3f4f6;
    }

    .language-card {
      background: #111827;
      border-color: #374151;
    }

    .language-card:hover {
      border-color: #6b7280;
    }

    .language-card--selected {
      background: #1e3a8a;
      border-color: #2563eb;
    }

    .language-card__name {
      color: #f3f4f6;
    }

    .language-card__native {
      color: #9ca3af;
    }

    .language-modal__info {
      background: #111827;
    }

    .language-modal__info p {
      color: #9ca3af;
    }

    .language-inline-list {
      background: #374151;
    }

    .language-inline-option {
      color: #9ca3af;
    }

    .language-inline-option:hover {
      background: #1f2937;
      color: #f3f4f6;
    }

    .language-inline-option--selected {
      background: #1f2937;
      color: #60a5fa;
    }
  }

  /* RTL support */
  [dir="rtl"] .language-switcher__button,
  [dir="rtl"] .language-menu {
    text-align: right;
  }

  [dir="rtl"] .language-menu {
    left: auto;
    right: 0;
  }

  [dir="rtl"] .language-option__button {
    text-align: right;
  }

  [dir="rtl"] .language-modal__header {
    flex-direction: row-reverse;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .language-switcher__button,
    .language-option__button,
    .language-inline-option,
    .language-card,
    .language-arrow {
      transition: none;
    }

    .language-menu,
    .language-modal-overlay,
    .language-modal,
    .language-notification {
      animation: none;
    }
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .language-menu {
      min-width: 160px;
    }

    .language-modal {
      width: 95%;
      max-height: 90vh;
    }

    .language-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .language-card {
      padding: 12px;
    }

    .language-card__flag {
      font-size: 24px;
    }
  }
`;

// Add styles to document
if (typeof document !== 'undefined' && !document.getElementById('language-switcher-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'language-switcher-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default LanguageSwitcher;