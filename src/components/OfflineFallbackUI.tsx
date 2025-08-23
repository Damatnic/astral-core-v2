/**
 * Offline Fallback UI Component
 * 
 * Provides a comprehensive offline experience when the application
 * loses connectivity, including crisis resources and sync status
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnhancedOffline } from '../hooks/useEnhancedOffline';
import { backgroundSyncService } from '../services/backgroundSyncService';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';
import { OfflineCapabilities } from './OfflineCapabilities';
import { AppButton } from './AppButton';
import { LoadingSpinner } from './LoadingSpinner';

interface OfflineFallbackUIProps {
  showFullScreen?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const OfflineFallbackUI: React.FC<OfflineFallbackUIProps> = ({
  showFullScreen = true,
  onRetry,
  className = ''
}) => {
  const { t } = useTranslation();
  const { isOnline, updateOfflineResources } = useEnhancedOffline();
  const [syncStatus, setSyncStatus] = useState<{
    size: number;
    isSyncing: boolean;
    lastSyncTime?: number;
  }>({
    size: 0,
    isSyncing: false
  });
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Update sync status
    const updateSyncStatus = () => {
      const status = backgroundSyncService.getQueueStatus();
      setSyncStatus({
        size: status.size,
        isSyncing: status.isSyncing,
        lastSyncTime: Date.now()
      });
    };

    // Initial status
    updateSyncStatus();

    // Listen for sync updates
    const handleSyncResult = () => {
      updateSyncStatus();
    };

    backgroundSyncService.addSyncListener(handleSyncResult);

    // Update periodically
    const interval = setInterval(updateSyncStatus, 5000);

    return () => {
      backgroundSyncService.removeSyncListener(handleSyncResult);
      clearInterval(interval);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Force sync attempt
      await backgroundSyncService.forceSyncNow();
      
      // Call custom retry handler if provided
      if (onRetry) {
        await onRetry();
      }
      
      // Reload if now online
      if (navigator.onLine) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleUpdateResources = async () => {
    try {
      await updateOfflineResources();
    } catch (error) {
      console.error('Failed to update offline resources:', error);
    }
  };

  if (isOnline && !syncStatus.size) {
    return null; // Don't show if online and no pending sync
  }

  // Full screen offline view
  if (showFullScreen && !isOnline) {
    return (
      <div className={`offline-fallback-fullscreen ${className}`}>
        <div className="offline-container">
          {/* Header */}
          <div className="offline-header">
            <div className="offline-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="offline-title">
              {t('offline.fallback.title', 'You are offline')}
            </h1>
            <p className="offline-subtitle">
              {t('offline.fallback.subtitle', 'Some features are limited, but crisis resources remain available')}
            </p>
          </div>

          {/* Sync Status */}
          {syncStatus.size > 0 && (
            <div className="sync-status-card">
              <div className="sync-status-header">
                <h3>{t('offline.sync.pending', 'Pending Updates')}</h3>
                {syncStatus.isSyncing && <LoadingSpinner size="small" />}
              </div>
              <p className="sync-status-text">
                {t('offline.sync.itemsWaiting', '{{count}} items waiting to sync', { count: syncStatus.size })}
              </p>
              <p className="sync-status-note">
                {t('offline.sync.autoSync', 'Will automatically sync when connection is restored')}
              </p>
            </div>
          )}

          {/* Available Features */}
          <div className="offline-features">
            <h2>{t('offline.features.title', 'Available Offline')}</h2>
            <OfflineCapabilities variant="list" showActions={true} />
          </div>

          {/* Crisis Resources Section */}
          <div className="crisis-resources-section">
            <div className="crisis-header">
              <h2>{t('offline.crisis.title', 'Crisis Resources')}</h2>
              <span className="crisis-badge">
                {t('offline.crisis.alwaysAvailable', 'Always Available')}
              </span>
            </div>
            
            {!showCrisisResources ? (
              <AppButton
                variant="primary"
                onClick={() => setShowCrisisResources(true)}
                className="crisis-show-button"
              >
                {t('offline.crisis.showResources', 'Show Crisis Resources')}
              </AppButton>
            ) : (
              <div className="crisis-resources-content">
                <div className="crisis-card">
                  <h3>{t('offline.crisis.emergency', 'Emergency Contacts')}</h3>
                  <ul className="crisis-list">
                    <li>
                      <strong>{t('offline.crisis.hotline', 'Crisis Hotline')}:</strong>
                      <a href="tel:988" className="crisis-link">988</a>
                      <span className="crisis-note">{t('offline.crisis.available247', '24/7 Support')}</span>
                    </li>
                    <li>
                      <strong>{t('offline.crisis.text', 'Crisis Text')}:</strong>
                      <a href="sms:741741" className="crisis-link">Text HOME to 741741</a>
                    </li>
                  </ul>
                </div>

                <div className="crisis-card">
                  <h3>{t('offline.crisis.coping', 'Coping Strategies')}</h3>
                  <ul className="coping-list">
                    <li>{t('offline.coping.breathing', 'Deep breathing exercises (4-7-8 technique)')}</li>
                    <li>{t('offline.coping.grounding', '5-4-3-2-1 grounding technique')}</li>
                    <li>{t('offline.coping.safety', 'Review your safety plan')}</li>
                    <li>{t('offline.coping.support', 'Reach out to a trusted friend or family member')}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="offline-actions">
            <AppButton
              variant="primary"
              onClick={handleRetry}
              disabled={isRetrying}
              className="retry-button"
            >
              {isRetrying ? (
                <>
                  <LoadingSpinner size="small" />
                  {t('offline.actions.retrying', 'Checking connection...')}
                </>
              ) : (
                t('offline.actions.retry', 'Retry Connection')
              )}
            </AppButton>
            
            <AppButton
              variant="secondary"
              onClick={handleUpdateResources}
              disabled={!isOnline}
              className="update-button"
            >
              {t('offline.actions.updateResources', 'Update Offline Resources')}
            </AppButton>
          </div>

          {/* Help Text */}
          <div className="offline-help">
            <p>
              {t('offline.help.persistence', 'Your data is saved locally and will sync when you reconnect.')}
            </p>
            <p>
              {t('offline.help.crisis', 'If you are in crisis, please use the emergency resources above or call 988.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compact offline indicator
  return (
    <div className={`offline-fallback-compact ${className}`}>
      <OfflineStatusIndicator />
      {syncStatus.size > 0 && (
        <div className="sync-badge">
          <span className="sync-count">{syncStatus.size}</span>
          <span className="sync-label">{t('offline.sync.pending', 'pending')}</span>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = `
  .offline-fallback-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    overflow-y: auto;
  }

  .offline-container {
    max-width: 800px;
    width: 90%;
    margin: 20px;
    padding: 40px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .offline-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .offline-icon {
    color: #9ca3af;
    margin-bottom: 20px;
  }

  .offline-title {
    font-size: 32px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 10px 0;
  }

  .offline-subtitle {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }

  .sync-status-card {
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
  }

  .sync-status-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .sync-status-header h3 {
    margin: 0;
    font-size: 18px;
    color: #92400e;
  }

  .sync-status-text {
    font-size: 24px;
    font-weight: 600;
    color: #b45309;
    margin: 10px 0;
  }

  .sync-status-note {
    font-size: 14px;
    color: #92400e;
    margin: 0;
  }

  .offline-features {
    margin-bottom: 30px;
  }

  .offline-features h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 15px;
  }

  .crisis-resources-section {
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
  }

  .crisis-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .crisis-header h2 {
    margin: 0;
    font-size: 20px;
    color: #991b1b;
  }

  .crisis-badge {
    background: #dc2626;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .crisis-show-button {
    width: 100%;
    padding: 12px;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .crisis-show-button:hover {
    background: #b91c1c;
  }

  .crisis-resources-content {
    display: grid;
    gap: 20px;
  }

  .crisis-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
  }

  .crisis-card h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #991b1b;
  }

  .crisis-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .crisis-list li {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .crisis-link {
    color: #dc2626;
    font-size: 20px;
    font-weight: 600;
    text-decoration: none;
  }

  .crisis-link:hover {
    text-decoration: underline;
  }

  .crisis-note {
    font-size: 12px;
    color: #6b7280;
  }

  .coping-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .coping-list li {
    padding: 10px;
    margin-bottom: 10px;
    background: #fef2f2;
    border-left: 3px solid #dc2626;
    border-radius: 4px;
    color: #991b1b;
  }

  .offline-actions {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
  }

  .retry-button,
  .update-button {
    flex: 1;
    padding: 14px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .retry-button {
    background: #3b82f6;
    color: white;
  }

  .retry-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .retry-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .update-button {
    background: white;
    color: #3b82f6;
    border: 2px solid #3b82f6;
  }

  .update-button:hover:not(:disabled) {
    background: #eff6ff;
  }

  .update-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .offline-help {
    background: #f3f4f6;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
  }

  .offline-help p {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #4b5563;
  }

  .offline-help p:last-child {
    margin-bottom: 0;
  }

  /* Compact version */
  .offline-fallback-compact {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
  }

  .sync-badge {
    background: #fbbf24;
    color: #78350f;
    padding: 8px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .sync-count {
    background: #78350f;
    color: #fbbf24;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 20px;
    text-align: center;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .offline-container {
      padding: 20px;
      margin: 10px;
    }

    .offline-title {
      font-size: 24px;
    }

    .offline-actions {
      flex-direction: column;
    }

    .crisis-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .offline-container {
      background: #1f2937;
      color: #f3f4f6;
    }

    .offline-title {
      color: #f3f4f6;
    }

    .offline-subtitle {
      color: #9ca3af;
    }

    .sync-status-card {
      background: #451a03;
      border-color: #78350f;
    }

    .sync-status-header h3 {
      color: #fbbf24;
    }

    .sync-status-text {
      color: #fde68a;
    }

    .crisis-resources-section {
      background: #450a0a;
      border-color: #991b1b;
    }

    .crisis-card {
      background: #1f2937;
    }

    .offline-help {
      background: #111827;
    }

    .offline-help p {
      color: #9ca3af;
    }
  }

  /* Animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .offline-fallback-fullscreen {
    animation: fadeIn 0.3s ease-out;
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .offline-container {
      border: 2px solid currentColor;
    }

    .crisis-resources-section,
    .sync-status-card {
      border-width: 2px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .offline-fallback-fullscreen {
      animation: none;
    }

    .retry-button,
    .update-button,
    .crisis-show-button {
      transition: none;
    }
  }
`;

// Add styles to document
if (typeof document !== 'undefined' && !document.getElementById('offline-fallback-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'offline-fallback-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default OfflineFallbackUI;