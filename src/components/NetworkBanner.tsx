/**
 * Network Banner Component
 * 
 * Full-width banner for connection status alerts with crisis intervention priority
 * for the Astral Core mental health platform.
 */

import React, { useEffect } from 'react';
import { useOffline } from '../contexts/OfflineProvider';
import { AlertIcon, CheckIcon, PhoneIcon  } from './icons.dynamic';

export interface NetworkBannerProps {
  showWhenOnline?: boolean;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  onDismiss?: () => void;
  className?: string;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({
  showWhenOnline = false,
  autoDismiss = false,
  autoDismissDelay = 5000,
  onDismiss,
  className = ''
}) => {
  const { connectionStatus } = useOffline();
  const {
    isOnline,
    connectionQuality,
    crisisResourcesAvailable,
    serviceWorkerStatus
  } = connectionStatus;

  // Auto-dismiss functionality
  useEffect(() => {
    if (autoDismiss && isOnline && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, isOnline, onDismiss, autoDismissDelay]);

  // Don't show banner when online unless specified
  if (isOnline && !showWhenOnline) return null;

  const getBannerContent = () => {
    if (!isOnline) {
      return {
        type: 'offline',
        icon: <AlertIcon />,
        title: 'You\'re offline',
        message: crisisResourcesAvailable 
          ? 'Crisis resources and emergency contacts are still available.'
          : 'Some features may not be available.',
        actionText: crisisResourcesAvailable ? 'View Crisis Resources' : 'Try Again',
        severity: crisisResourcesAvailable ? 'warning' : 'error'
      };
    }

    if (connectionQuality === 'poor') {
      return {
        type: 'poor-connection',
        icon: <AlertIcon />,
        title: 'Slow connection detected',
        message: 'Some features may load slowly. Crisis resources are prioritized.',
        actionText: 'Optimize Connection',
        severity: 'warning'
      };
    }

    // Only show when explicitly requested for online state
    return {
      type: 'online',
      icon: <CheckIcon />,
      title: 'Connection restored',
      message: 'All features are now available.',
      actionText: 'Continue',
      severity: 'success'
    };
  };

  const bannerContent = getBannerContent();

  return (
    <div 
      className={`network-banner network-banner--${bannerContent.severity} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="network-banner__content">
        <div className="network-banner__main">
          <div className="network-banner__icon">
            {bannerContent.icon}
          </div>
          <div className="network-banner__text">
            <div className="network-banner__title">
              {bannerContent.title}
            </div>
            <div className="network-banner__message">
              {bannerContent.message}
            </div>
          </div>
        </div>

        <div className="network-banner__meta">
          {!isOnline && crisisResourcesAvailable && (
            <div className="crisis-available">
              <PhoneIcon />
              <span>Emergency contacts available</span>
            </div>
          )}
          
          {!isOnline && serviceWorkerStatus === 'active' && (
            <div className="offline-mode">
              <span className="offline-mode__indicator" />
              <span>Offline mode active</span>
            </div>
          )}
        </div>

        <div className="network-banner__actions">
          <button 
            className="network-banner__action network-banner__action--primary"
            onClick={() => {
              if (bannerContent.type === 'offline' && crisisResourcesAvailable) {
                // Navigate to crisis resources
                window.location.href = '/crisis';
              } else if (onDismiss) {
                onDismiss();
              }
            }}
          >
            {bannerContent.actionText}
          </button>
          
          {onDismiss && (
            <button 
              className="network-banner__action network-banner__action--secondary"
              onClick={onDismiss}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS styles for the component
export const networkBannerStyles = `
  .network-banner {
    position: relative;
    width: 100%;
    font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-bottom: 16px;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .network-banner--success {
    background-color: var(--green-50, #f0fdf4);
    border: 1px solid var(--green-200, #bbf7d0);
    color: var(--green-800, #166534);
  }

  .network-banner--warning {
    background-color: var(--amber-50, #fffbeb);
    border: 1px solid var(--amber-200, #fde68a);
    color: var(--amber-800, #92400e);
  }

  .network-banner--error {
    background-color: var(--red-50, #fef2f2);
    border: 1px solid var(--red-200, #fecaca);
    color: var(--red-800, #991b1b);
  }

  .network-banner__content {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .network-banner__main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .network-banner__icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .network-banner__text {
    flex: 1;
    min-width: 0;
  }

  .network-banner__title {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: 2px;
  }

  .network-banner__message {
    font-size: 14px;
    line-height: 1.4;
    opacity: 0.9;
  }

  .network-banner__meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .crisis-available {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    background-color: var(--blue-100, #dbeafe);
    color: var(--blue-800, #1e40af);
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--blue-200, #bfdbfe);
  }

  .crisis-available svg {
    width: 14px;
    height: 14px;
  }

  .offline-mode {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--gray-600, #4b5563);
  }

  .offline-mode__indicator {
    width: 8px;
    height: 8px;
    background-color: var(--green-500, #10b981);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .network-banner__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .network-banner__action {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    line-height: 1.25;
    min-height: 44px; /* WCAG 2.1 AA touch target */
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .network-banner__action--primary {
    background-color: var(--white, #ffffff);
    color: var(--gray-900, #111827);
    border-color: var(--gray-300, #d1d5db);
  }

  .network-banner--success .network-banner__action--primary {
    background-color: var(--green-600, #059669);
    color: var(--white, #ffffff);
    border-color: var(--green-600, #059669);
  }

  .network-banner--warning .network-banner__action--primary {
    background-color: var(--amber-600, #d97706);
    color: var(--white, #ffffff);
    border-color: var(--amber-600, #d97706);
  }

  .network-banner--error .network-banner__action--primary {
    background-color: var(--red-600, #dc2626);
    color: var(--white, #ffffff);
    border-color: var(--red-600, #dc2626);
  }

  .network-banner__action--primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .network-banner__action--primary:focus {
    outline: 2px solid var(--blue-500, #3b82f6);
    outline-offset: 2px;
  }

  .network-banner__action--secondary {
    background-color: transparent;
    color: currentColor;
    border-color: transparent;
    padding: 8px; /* Increased from 4px 8px for touch targets */
    font-size: 18px;
    line-height: 1;
    opacity: 0.7;
    min-height: 44px; /* WCAG 2.1 AA touch target */
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .network-banner__action--secondary:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.05);
  }

  .network-banner__action--secondary:focus {
    outline: 2px solid var(--blue-500, #3b82f6);
    outline-offset: 2px;
    opacity: 1;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .network-banner__content {
      padding: 12px 16px;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .network-banner__main {
      width: 100%;
    }

    .network-banner__meta {
      width: 100%;
      justify-content: flex-start;
    }

    .network-banner__actions {
      width: 100%;
      justify-content: flex-end;
    }

    .network-banner__action {
      padding: 6px 12px;
      font-size: 13px;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .network-banner--success {
      background-color: var(--green-900, #14532d);
      border-color: var(--green-700, #15803d);
      color: var(--green-100, #dcfce7);
    }

    .network-banner--warning {
      background-color: var(--amber-900, #78350f);
      border-color: var(--amber-700, #b45309);
      color: var(--amber-100, #fef3c7);
    }

    .network-banner--error {
      background-color: var(--red-900, #7f1d1d);
      border-color: var(--red-700, #b91c1c);
      color: var(--red-100, #fee2e2);
    }

    .network-banner__action--primary {
      background-color: var(--gray-800, #1f2937);
      color: var(--gray-100, #f3f4f6);
      border-color: var(--gray-600, #4b5563);
    }

    .crisis-available {
      background-color: var(--blue-900, #1e3a8a);
      color: var(--blue-100, #dbeafe);
      border-color: var(--blue-700, #1d4ed8);
    }

    .offline-mode {
      color: var(--gray-400, #9ca3af);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .network-banner {
      border-width: 2px;
    }

    .network-banner__action {
      border-width: 2px;
    }

    .crisis-available {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .network-banner {
      animation: none;
    }

    .offline-mode__indicator {
      animation: none;
    }

    .network-banner__action {
      transition: none;
    }

    .network-banner__action--primary:hover {
      transform: none;
    }
  }
`;

export default NetworkBanner;
