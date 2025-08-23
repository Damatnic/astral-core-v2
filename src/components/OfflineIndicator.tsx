/**
 * Offline Indicator Component
 * 
 * Visual indicator for connection status with crisis intervention priority
 * and accessibility compliance for the Astral Core mental health platform.
 */

import React from 'react';
import { useOffline } from '../contexts/OfflineProvider';
import { AlertIcon, CheckIcon, PhoneIcon  } from './icons.dynamic';

export interface OfflineIndicatorProps {
  variant?: 'minimal' | 'detailed' | 'banner';
  showConnectionQuality?: boolean;
  showCrisisStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  variant = 'minimal',
  showConnectionQuality = true,
  showCrisisStatus = true,
  className = '',
  onClick
}) => {
  const { connectionStatus } = useOffline();
  const {
    isOnline,
    connectionQuality,
    crisisResourcesAvailable,
    serviceWorkerStatus
  } = connectionStatus;

  // Determine status and styling
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        status: 'offline',
        label: 'Offline',
        icon: <AlertIcon />,
        color: crisisResourcesAvailable ? 'amber' : 'red',
        description: crisisResourcesAvailable 
          ? 'Offline - Crisis resources available' 
          : 'Offline - Limited functionality'
      };
    }

    if (connectionQuality === 'poor') {
      return {
        status: 'poor',
        label: 'Poor Connection',
        icon: <AlertIcon />,
        color: 'amber',
        description: 'Slow connection - Some features may be limited'
      };
    }

    return {
      status: 'online',
      label: connectionQuality === 'excellent' ? 'Excellent' : 'Good',
      icon: <CheckIcon />,
      color: 'green',
      description: 'Connected - All features available'
    };
  };

  const statusInfo = getStatusInfo();

  // Crisis indicator when offline
  const CrisisIndicator = () => {
    if (isOnline || !showCrisisStatus) return null;

    return (
      <div className={`crisis-status crisis-status--${crisisResourcesAvailable ? 'available' : 'unavailable'}`}>
        <PhoneIcon />
        <span className="sr-only">Crisis resources </span>
        <span>
          {crisisResourcesAvailable ? 'Emergency contacts available' : 'Emergency contacts unavailable'}
        </span>
      </div>
    );
  };

  // Minimal variant - just an icon/dot
  if (variant === 'minimal') {
    return (
      <div 
        className={`offline-indicator offline-indicator--minimal ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
        aria-label={`Connection status: ${statusInfo.description}`}
      >
        <div className={`status-indicator status-indicator--${statusInfo.color}`}>
          <div className="status-dot" />
          {!isOnline && crisisResourcesAvailable && (
            <div className="crisis-dot" aria-label="Crisis resources available offline" />
          )}
        </div>
      </div>
    );
  }

  // Detailed variant - icon with text
  if (variant === 'detailed') {
    return (
      <div 
        className={`offline-indicator offline-indicator--detailed ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
      >
        <div className={`status-content status-content--${statusInfo.color}`}>
          <div className="status-icon">
            {statusInfo.icon}
          </div>
          <div className="status-text">
            <div className="status-label">{statusInfo.label}</div>
            {showConnectionQuality && (
              <div className="status-description">{statusInfo.description}</div>
            )}
          </div>
        </div>
        <CrisisIndicator />
      </div>
    );
  }

  // Banner variant - full width banner
  return (
    <div className={`offline-indicator offline-indicator--banner ${className}`}>
      <div className={`banner-content banner-content--${statusInfo.color}`}>
        <div className="banner-main">
          <div className="status-icon">
            {statusInfo.icon}
          </div>
          <div className="status-text">
            <div className="status-label">{statusInfo.label}</div>
            <div className="status-description">{statusInfo.description}</div>
          </div>
        </div>
        
        {!isOnline && (
          <div className="banner-crisis">
            <CrisisIndicator />
            {serviceWorkerStatus === 'active' && (
              <div className="service-worker-status">
                <span className="sw-indicator" />
                <span>Offline mode active</span>
              </div>
            )}
          </div>
        )}
        
        {onClick && (
          <button 
            className="banner-action"
            onClick={onClick}
            aria-label="View connection details"
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
};

// CSS styles for the component
export const offlineIndicatorStyles = `
  .offline-indicator {
    position: relative;
    font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  }

  /* Minimal Variant */
  .offline-indicator--minimal {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }

  .status-indicator {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .status-indicator--green .status-dot {
    background-color: var(--green-500, #10b981);
    box-shadow: 0 0 0 2px var(--green-100, #dcfce7);
  }

  .status-indicator--amber .status-dot {
    background-color: var(--amber-500, #f59e0b);
    box-shadow: 0 0 0 2px var(--amber-100, #fef3c7);
  }

  .status-indicator--red .status-dot {
    background-color: var(--red-500, #ef4444);
    box-shadow: 0 0 0 2px var(--red-100, #fee2e2);
  }

  .crisis-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 4px;
    height: 4px;
    background-color: var(--blue-500, #3b82f6);
    border-radius: 50%;
    border: 1px solid var(--white, #ffffff);
  }

  /* Detailed Variant */
  .offline-indicator--detailed {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    background-color: var(--bg-secondary, #f8fafc);
    border: 1px solid var(--border-light, #e2e8f0);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .offline-indicator--detailed:hover {
    background-color: var(--bg-hover, #f1f5f9);
    border-color: var(--border-hover, #cbd5e1);
  }

  .status-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-content--green .status-icon {
    color: var(--green-600, #059669);
  }

  .status-content--amber .status-icon {
    color: var(--amber-600, #d97706);
  }

  .status-content--red .status-icon {
    color: var(--red-600, #dc2626);
  }

  .status-text {
    flex: 1;
  }

  .status-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary, #1e293b);
    line-height: 1.2;
  }

  .status-description {
    font-size: 12px;
    color: var(--text-secondary, #64748b);
    line-height: 1.3;
    margin-top: 2px;
  }

  .crisis-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    line-height: 1.2;
  }

  .crisis-status--available {
    background-color: var(--blue-50, #eff6ff);
    color: var(--blue-700, #1d4ed8);
    border: 1px solid var(--blue-200, #bfdbfe);
  }

  .crisis-status--unavailable {
    background-color: var(--red-50, #fef2f2);
    color: var(--red-700, #b91c1c);
    border: 1px solid var(--red-200, #fecaca);
  }

  .crisis-status svg {
    width: 12px;
    height: 12px;
  }

  /* Banner Variant */
  .offline-indicator--banner {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .banner-content {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .banner-content--green {
    background-color: var(--green-50, #f0fdf4);
    border: 1px solid var(--green-200, #bbf7d0);
  }

  .banner-content--amber {
    background-color: var(--amber-50, #fffbeb);
    border: 1px solid var(--amber-200, #fde68a);
  }

  .banner-content--red {
    background-color: var(--red-50, #fef2f2);
    border: 1px solid var(--red-200, #fecaca);
  }

  .banner-main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .banner-crisis {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .service-worker-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary, #64748b);
  }

  .sw-indicator {
    width: 6px;
    height: 6px;
    background-color: var(--green-500, #10b981);
    border-radius: 50%;
  }

  .banner-action {
    padding: 6px 12px;
    background-color: var(--white, #ffffff);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary, #1e293b);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .banner-action:hover {
    background-color: var(--bg-hover, #f8fafc);
    border-color: var(--border-hover, #cbd5e1);
  }

  .banner-action:focus {
    outline: 2px solid var(--blue-500, #3b82f6);
    outline-offset: 2px;
  }

  /* Screen reader only text */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Focus styles for accessibility */
  .offline-indicator[role="button"]:focus {
    outline: 2px solid var(--blue-500, #3b82f6);
    outline-offset: 2px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .offline-indicator--detailed {
      background-color: var(--bg-secondary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
    }

    .offline-indicator--detailed:hover {
      background-color: var(--bg-hover-dark, #334155);
      border-color: var(--border-hover-dark, #4b5563);
    }

    .status-label {
      color: var(--text-primary-dark, #f1f5f9);
    }

    .status-description {
      color: var(--text-secondary-dark, #94a3b8);
    }

    .banner-action {
      background-color: var(--bg-secondary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
      color: var(--text-primary-dark, #f1f5f9);
    }

    .banner-action:hover {
      background-color: var(--bg-hover-dark, #334155);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .status-dot {
      border: 2px solid currentColor;
    }

    .offline-indicator--detailed {
      border-width: 2px;
    }

    .banner-content {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .status-dot,
    .offline-indicator--detailed,
    .banner-action {
      transition: none;
    }
  }
`;

export default OfflineIndicator;
