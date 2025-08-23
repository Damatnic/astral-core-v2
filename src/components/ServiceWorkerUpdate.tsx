/**
 * Service Worker Update Notification
 * 
 * Notifies users when a new version of the app is available
 * and provides controls for updating.
 */

import React, { useState } from 'react';
import { useServiceWorker } from '../hooks/useServiceWorker';
import './ServiceWorkerUpdate.css';

const ServiceWorkerUpdate: React.FC = () => {
  const {
    updateAvailable,
    isOfflineReady,
    skipWaiting,
    cacheStatus
  } = useServiceWorker();
  
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!updateAvailable && !isOfflineReady) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    await skipWaiting();
    // The page will reload automatically
  };

  return (
    <div className="sw-update-container">
      <div className="sw-update-header">
        <div className="sw-update-title">
          <svg className="sw-update-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          {updateAvailable ? 'Update Available' : 'Ready for Offline'}
        </div>
        <button 
          className="sw-update-btn-secondary"
          onClick={() => setShowDetails(!showDetails)}
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      <div className="sw-update-message">
        {updateAvailable 
          ? 'A new version of Astral Core is available with improvements and bug fixes.'
          : 'Astral Core is now ready to work offline.'}
      </div>

      <div className="sw-update-actions">
        {updateAvailable ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="sw-update-btn sw-update-btn-primary"
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Now'}
            </button>
            <button 
              className="sw-update-btn sw-update-btn-secondary"
              onClick={() => window.location.reload()}
            >
              Later
            </button>
          </div>
        ) : isOfflineReady ? (
          <button 
            className="sw-update-btn sw-update-btn-primary"
            onClick={() => window.location.reload()}
          >
            Got it
          </button>
        ) : null}
      </div>

      {showDetails && cacheStatus && (
        <div className="sw-update-details">
          <div className="status-item">
            <span className="status-label">Cache Version:</span>
            <span className="status-value">{cacheStatus.cacheVersion || 'N/A'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Cache Ready:</span>
            <span className="status-value">{cacheStatus.staticResources ? '✅' : '⏳'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Service Worker:</span>
            <span className="status-value">
              {cacheStatus.swRegistered ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Offline Ready:</span>
            <span className="status-value">
              {isOfflineReady ? '✅ Yes' : '⚠️ Limited'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceWorkerUpdate;