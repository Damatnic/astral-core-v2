/**
 * Offline Status Indicator Component
 * 
 * Shows users their current offline capabilities, multilingual crisis resource availability,
 * and provides controls for managing offline data and sync status.
 * 
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnhancedOffline } from '../hooks/useEnhancedOffline';
import { AppButton } from './AppButton';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';

export const OfflineStatusIndicator: React.FC = () => {
  const { t } = useTranslation();
  const {
    isOnline,
    capabilities,
    hasOfflineSupport,
    storageUsage,
    syncQueueSize,
    lastSync,
    updateOfflineResources,
    clearOfflineData,
    isInitializing,
    isUpdatingResources,
    error
  } = useEnhancedOffline();

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  /**
   * Format storage usage for display
   */
  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  /**
   * Get status color based on online/offline state
   */
  const getStatusColor = (): string => {
    if (isOnline) return 'var(--accent-success)';
    return hasOfflineSupport ? 'var(--accent-warning)' : 'var(--accent-error)';
  };

  /**
   * Get status text
   */
  const getStatusText = (): string => {
    if (isInitializing) return t('offline.status.initializing', 'Initializing...');
    if (isOnline) return t('offline.status.online', 'Online');
    return hasOfflineSupport 
      ? t('offline.status.offlineSupported', 'Offline (Crisis resources available)')
      : t('offline.status.offlineUnsupported', 'Offline (Limited functionality)');
  };

  /**
   * Handle resource update
   */
  const handleUpdateResources = async () => {
    try {
      await updateOfflineResources();
    } catch (err) {
      console.error('Failed to update offline resources:', err);
    }
  };

  /**
   * Handle clear offline data
   */
  const handleClearData = async () => {
    try {
      await clearOfflineData();
      setShowDetailsModal(false);
    } catch (err) {
      console.error('Failed to clear offline data:', err);
    }
  };

  if (!capabilities) return null;

  return (
    <>
      {/* Compact status indicator */}
      <button 
        className="offline-status-indicator"
        onClick={() => setShowDetailsModal(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowDetailsModal(true);
          }
        }}
        aria-label={t('offline.indicator.ariaLabel', 'Open offline status details')}
        title={getStatusText()}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `2px solid ${getStatusColor()}`,
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <div 
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor()
          }}
        />
        <span style={{ fontWeight: 'bold' }}>
          {isOnline ? '📶' : '📴'}
        </span>
        {syncQueueSize > 0 && (
          <span style={{ 
            backgroundColor: 'var(--accent-warning)', 
            color: 'white', 
            borderRadius: '10px', 
            padding: '2px 6px',
            fontSize: '10px'
          }}>
            {syncQueueSize}
          </span>
        )}
      </button>

      {/* Detailed status modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={t('offline.modal.title', 'Offline Status & Management')}
      >
        <div className="offline-status-modal space-y-4">
          {/* Connection Status */}
          <div className="status-section">
            <h3 className="text-lg font-semibold mb-3">
              {t('offline.connection.title', 'Connection Status')}
            </h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div 
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor()
                }}
              />
              <span className="font-medium">{getStatusText()}</span>
            </div>
          </div>

          {/* Offline Capabilities */}
          <div className="capabilities-section">
            <h3 className="text-lg font-semibold mb-3">
              {t('offline.capabilities.title', 'Offline Capabilities')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>{t('offline.capabilities.crisisResources', 'Crisis Resources')}:</span>
                <span className={capabilities.cacheStatus.crisisResources ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.cacheStatus.crisisResources ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('offline.capabilities.translations', 'Translations')}:</span>
                <span className={capabilities.cacheStatus.translations ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.cacheStatus.translations ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('offline.capabilities.cultural', 'Cultural Content')}:</span>
                <span className={capabilities.cacheStatus.culturalContent ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.cacheStatus.culturalContent ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('offline.capabilities.aiModels', 'AI Models')}:</span>
                <span className={capabilities.cacheStatus.aiModels ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.cacheStatus.aiModels ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="storage-section">
            <h3 className="text-lg font-semibold mb-3">
              {t('offline.storage.title', 'Storage Usage')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('offline.storage.used', 'Used')}:</span>
                <span>{formatStorageSize(storageUsage.used)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('offline.storage.quota', 'Quota')}:</span>
                <span>{formatStorageSize(storageUsage.quota)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 text-center">
                {storageUsage.percentage.toFixed(1)}% {t('offline.storage.used', 'used')}
              </div>
            </div>
          </div>

          {/* Sync Status */}
          {(syncQueueSize > 0 || lastSync) && (
            <div className="sync-section">
              <h3 className="text-lg font-semibold mb-3">
                {t('offline.sync.title', 'Sync Status')}
              </h3>
              <div className="space-y-2 text-sm">
                {syncQueueSize > 0 && (
                  <div className="flex justify-between">
                    <span>{t('offline.sync.queued', 'Queued items')}:</span>
                    <span className="font-medium">{syncQueueSize}</span>
                  </div>
                )}
                {lastSync && (
                  <div className="flex justify-between">
                    <span>{t('offline.sync.lastSync', 'Last sync')}:</span>
                    <span>{new Date(lastSync).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Network Information */}
          {capabilities.networkType && (
            <div className="network-section">
              <h3 className="text-lg font-semibold mb-3">
                {t('offline.network.title', 'Network Information')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('offline.network.type', 'Connection type')}:</span>
                  <span>{capabilities.networkType}</span>
                </div>
                {capabilities.downloadSpeed && (
                  <div className="flex justify-between">
                    <span>{t('offline.network.speed', 'Download speed')}:</span>
                    <span>{capabilities.downloadSpeed} Mbps</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-section">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="actions-section flex flex-col sm:flex-row gap-2">
            <AppButton
              onClick={handleUpdateResources}
              variant="primary"
              disabled={isUpdatingResources || !isOnline}
              className="flex-1"
            >
              {isUpdatingResources ? (
                <>
                  <LoadingSpinner size="small" />
                  {t('offline.actions.updating', 'Updating...')}
                </>
              ) : (
                t('offline.actions.update', 'Update Resources')
              )}
            </AppButton>
            <AppButton
              onClick={handleClearData}
              variant="secondary"
              className="flex-1"
            >
              {t('offline.actions.clear', 'Clear Offline Data')}
            </AppButton>
          </div>

          {/* Help Text */}
          <div className="help-text text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="mb-2">
              {t('offline.help.crisisResources', 'Crisis resources and emergency contacts are always available offline in your language.')}
            </p>
            <p>
              {t('offline.help.sync', 'When you go back online, any saved data will sync automatically.')}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OfflineStatusIndicator;
