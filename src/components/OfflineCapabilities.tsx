/**
 * Offline Capabilities Component
 * 
 * Display available features and offline functionality status
 * for the Astral Core mental health platform.
 */

import React, { useState } from 'react';
import { useOffline } from '../contexts/OfflineProvider';
import { CheckIcon, AlertIcon, PhoneIcon, ChatIcon, SparkleIcon  } from './icons.dynamic';

export interface OfflineCapabilitiesProps {
  variant?: 'compact' | 'detailed' | 'list';
  showActions?: boolean;
  onFeatureClick?: (feature: string) => void;
  className?: string;
}

export const OfflineCapabilities: React.FC<OfflineCapabilitiesProps> = ({
  variant = 'detailed',
  showActions = true,
  onFeatureClick,
  className = ''
}) => {
  const { connectionStatus, isFeatureAvailable, getOfflineCapability } = useOffline();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'crisis resources':
        return <PhoneIcon />;
      case 'helper chat':
        return <ChatIcon />;
      case 'ai assistant':
        return <SparkleIcon />;
      default:
        return <CheckIcon />;
    }
  };

  const getFeatureStatus = (feature: string) => {
    const available = isFeatureAvailable(feature);
    const capability = getOfflineCapability(feature);
    
    if (connectionStatus.isOnline) {
      return {
        status: 'online',
        icon: <CheckIcon />,
        text: 'Available',
        color: 'green'
      };
    }

    if (available) {
      return {
        status: 'offline-available',
        icon: <CheckIcon />,
        text: 'Available offline',
        color: 'blue'
      };
    }

    return {
      status: 'offline-unavailable',
      icon: <AlertIcon />,
      text: capability?.fallbackAction || 'Not available offline',
      color: 'amber'
    };
  };

  const handleFeatureToggle = (feature: string) => {
    if (expandedFeature === feature) {
      setExpandedFeature(null);
    } else {
      setExpandedFeature(feature);
    }
  };

  const handleFeatureAction = (feature: string) => {
    if (onFeatureClick) {
      onFeatureClick(feature);
    } else {
      // Default actions
      switch (feature.toLowerCase()) {
        case 'crisis resources':
          window.location.href = '/crisis';
          break;
        case 'safety plan':
          window.location.href = '/safety-plan';
          break;
        case 'coping strategies':
          window.location.href = '/coping';
          break;
        default:
          break;
      }
    }
  };

  // Compact variant - just availability indicators
  if (variant === 'compact') {
    return (
      <div className={`offline-capabilities offline-capabilities--compact ${className}`}>
        <div className="capabilities-summary">
          <div className="summary-item">
            <span className="summary-label">Features available:</span>
            <span className="summary-count">
              {connectionStatus.offlineCapabilities.filter(cap => 
                connectionStatus.isOnline || cap.available
              ).length} / {connectionStatus.offlineCapabilities.length}
            </span>
          </div>
          {!connectionStatus.isOnline && (
            <div className="summary-offline">
              <AlertIcon />
              <span>Offline mode</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List variant - simple list with status
  if (variant === 'list') {
    return (
      <div className={`offline-capabilities offline-capabilities--list ${className}`}>
        <ul className="capabilities-list">
          {connectionStatus.offlineCapabilities.map(capability => {
            const status = getFeatureStatus(capability.feature);
            const available = connectionStatus.isOnline || capability.available;
            
            return (
              <li 
                key={capability.feature} 
                className={`capability-item capability-item--${status.status}`}
              >
                <div className="capability-content">
                  <div className="capability-icon">
                    {getFeatureIcon(capability.feature)}
                  </div>
                  <div className="capability-text">
                    <span className="capability-name">{capability.feature}</span>
                    <div className="capability-status">
                      {status.icon}
                      <span>{status.text}</span>
                    </div>
                  </div>
                  {showActions && available && (
                    <button
                      className="capability-action"
                      onClick={() => handleFeatureAction(capability.feature)}
                      aria-label={`Access ${capability.feature}`}
                    >
                      Use
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // Detailed variant - full feature cards
  return (
    <div className={`offline-capabilities offline-capabilities--detailed ${className}`}>
      <div className="capabilities-header">
        <h3>Available Features</h3>
        <div className="connection-status">
          {connectionStatus.isOnline ? (
            <span className="status-online">
              <CheckIcon />
              Online
            </span>
          ) : (
            <span className="status-offline">
              <AlertIcon />
              Offline
            </span>
          )}
        </div>
      </div>

      <div className="capabilities-grid">
        {connectionStatus.offlineCapabilities.map(capability => {
          const status = getFeatureStatus(capability.feature);
          const available = connectionStatus.isOnline || capability.available;
          const isExpanded = expandedFeature === capability.feature;

          return (
            <div 
              key={capability.feature}
              className={`capability-card capability-card--${status.status}`}
            >
              <div className="capability-header">
                <div className="capability-main">
                  <div className="capability-icon">
                    {getFeatureIcon(capability.feature)}
                  </div>
                  <div className="capability-info">
                    <h4 className="capability-name">{capability.feature}</h4>
                    <p className="capability-description">{capability.description}</p>
                  </div>
                </div>
                <div className="capability-status">
                  <div className={`status-indicator status-indicator--${status.color}`}>
                    {status.icon}
                  </div>
                  <span className="status-text">{status.text}</span>
                </div>
              </div>

              {!available && capability.fallbackAction && (
                <div className="capability-fallback">
                  <p><strong>Offline alternative:</strong> {capability.fallbackAction}</p>
                </div>
              )}

              <div className="capability-actions">
                {available && showActions && (
                  <button
                    className="capability-primary-action"
                    onClick={() => handleFeatureAction(capability.feature)}
                  >
                    {connectionStatus.isOnline ? 'Use Feature' : 'Access Offline'}
                  </button>
                )}
                
                <button
                  className="capability-details-toggle"
                  onClick={() => handleFeatureToggle(capability.feature)}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? 'Less Info' : 'More Info'}
                </button>
              </div>

              {isExpanded && (
                <div className="capability-details">
                  <div className="detail-item">
                    <strong>Availability:</strong>
                    <span>{available ? 'Available' : 'Not available offline'}</span>
                  </div>
                  {capability.fallbackAction && (
                    <div className="detail-item">
                      <strong>Offline fallback:</strong>
                      <span>{capability.fallbackAction}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <strong>Connection required:</strong>
                    <span>{capability.available ? 'No' : 'Yes'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!connectionStatus.isOnline && (
        <div className="offline-notice">
          <AlertIcon />
          <div className="notice-content">
            <p><strong>You are currently offline.</strong></p>
            <p>Some features have limited functionality. Crisis resources remain fully available.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles for the component
export const offlineCapabilitiesStyles = `
  .offline-capabilities {
    font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  }

  /* Compact Variant */
  .offline-capabilities--compact {
    padding: 12px 16px;
    background-color: var(--bg-secondary, #f8fafc);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 8px;
  }

  .capabilities-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .summary-label {
    font-size: 14px;
    color: var(--text-secondary, #64748b);
  }

  .summary-count {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
  }

  .summary-offline {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--amber-600, #d97706);
  }

  .summary-offline svg {
    width: 14px;
    height: 14px;
  }

  /* List Variant */
  .offline-capabilities--list {
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 8px;
    overflow: hidden;
  }

  .capabilities-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .capability-item {
    border-bottom: 1px solid var(--border-light, #e2e8f0);
  }

  .capability-item:last-child {
    border-bottom: none;
  }

  .capability-content {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
  }

  .capability-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-secondary, #64748b);
  }

  .capability-text {
    flex: 1;
    min-width: 0;
  }

  .capability-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary, #1e293b);
    display: block;
    margin-bottom: 2px;
  }

  .capability-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }

  .capability-status svg {
    width: 12px;
    height: 12px;
  }

  .capability-item--online-available .capability-status {
    color: var(--green-600, #059669);
  }

  .capability-item--offline-available .capability-status {
    color: var(--blue-600, #2563eb);
  }

  .capability-item--offline-unavailable .capability-status {
    color: var(--amber-600, #d97706);
  }

  .capability-action {
    padding: 10px 12px; /* Increased from 6px 12px */
    background-color: var(--blue-500, #3b82f6);
    color: var(--white, #ffffff);
    border: none;
    border-radius: 4px;
    font-size: 14px; /* Increased from 12px for better readability */
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px; /* WCAG 2.1 AA touch target */
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .capability-action:hover {
    background-color: var(--blue-600, #2563eb);
  }

  .capability-action:focus {
    outline: 2px solid var(--blue-500, #3b82f6);
    outline-offset: 2px;
  }

  /* Detailed Variant */
  .offline-capabilities--detailed {
    padding: 20px;
  }

  .capabilities-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .capabilities-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
  }

  .status-online {
    color: var(--green-600, #059669);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .status-offline {
    color: var(--amber-600, #d97706);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .connection-status svg {
    width: 16px;
    height: 16px;
  }

  .capabilities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .capability-card {
    background-color: var(--white, #ffffff);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
  }

  .capability-card:hover {
    border-color: var(--border-hover, #cbd5e1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .capability-card--offline-unavailable {
    background-color: var(--gray-50, #f9fafb);
    opacity: 0.8;
  }

  .capability-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .capability-main {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }

  .capability-card .capability-icon {
    width: 24px;
    height: 24px;
    color: var(--blue-500, #3b82f6);
  }

  .capability-info {
    flex: 1;
  }

  .capability-card .capability-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
    margin: 0 0 4px 0;
  }

  .capability-description {
    font-size: 14px;
    color: var(--text-secondary, #64748b);
    line-height: 1.4;
    margin: 0;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-bottom: 4px;
  }

  .status-indicator--green {
    background-color: var(--green-100, #dcfce7);
    color: var(--green-600, #059669);
  }

  .status-indicator--blue {
    background-color: var(--blue-100, #dbeafe);
    color: var(--blue-600, #2563eb);
  }

  .status-indicator--amber {
    background-color: var(--amber-100, #fef3c7);
    color: var(--amber-600, #d97706);
  }

  .status-indicator svg {
    width: 12px;
    height: 12px;
  }

  .status-text {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
  }

  .capability-fallback {
    background-color: var(--amber-50, #fffbeb);
    border: 1px solid var(--amber-200, #fde68a);
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 12px;
  }

  .capability-fallback p {
    margin: 0;
    font-size: 13px;
    color: var(--amber-700, #b45309);
  }

  .capability-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .capability-primary-action {
    flex: 1;
    padding: 12px 16px; /* Increased from 8px 16px */
    background-color: var(--blue-500, #3b82f6);
    color: var(--white, #ffffff);
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px; /* WCAG 2.1 AA touch target */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .capability-primary-action:hover {
    background-color: var(--blue-600, #2563eb);
  }

  .capability-primary-action:focus {
    outline: 2px solid var(--blue-500, #3b82f6);
    outline-offset: 2px;
  }

  .capability-details-toggle {
    padding: 12px; /* Increased from 8px 12px for square touch target */
    background-color: transparent;
    color: var(--text-secondary, #64748b);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 6px;
    font-size: 14px; /* Increased from 12px for better readability */
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px; /* WCAG 2.1 AA touch target */
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .capability-details-toggle:hover {
    background-color: var(--gray-50, #f9fafb);
    border-color: var(--border-hover, #cbd5e1);
  }

  .capability-details {
    border-top: 1px solid var(--border-light, #e2e8f0);
    padding-top: 12px;
    margin-top: 12px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .detail-item:last-child {
    margin-bottom: 0;
  }

  .detail-item strong {
    color: var(--text-primary, #1e293b);
  }

  .detail-item span {
    color: var(--text-secondary, #64748b);
  }

  .offline-notice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background-color: var(--amber-50, #fffbeb);
    border: 1px solid var(--amber-200, #fde68a);
    border-radius: 8px;
    padding: 16px;
  }

  .offline-notice svg {
    width: 20px;
    height: 20px;
    color: var(--amber-600, #d97706);
    margin-top: 2px;
    flex-shrink: 0;
  }

  .notice-content p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: var(--amber-800, #92400e);
  }

  .notice-content p:last-child {
    margin-bottom: 0;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .capabilities-grid {
      grid-template-columns: 1fr;
    }

    .capabilities-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .capability-actions {
      flex-direction: column;
    }

    .offline-notice {
      flex-direction: column;
      gap: 8px;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .offline-capabilities--compact {
      background-color: var(--bg-secondary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
    }

    .offline-capabilities--list {
      border-color: var(--border-dark, #374151);
    }

    .capability-item {
      border-color: var(--border-dark, #374151);
    }

    .capability-card {
      background-color: var(--bg-secondary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
    }

    .capability-card--offline-unavailable {
      background-color: var(--gray-800, #1f2937);
    }

    .capability-name,
    .capabilities-header h3 {
      color: var(--text-primary-dark, #f1f5f9);
    }

    .capability-description,
    .summary-label {
      color: var(--text-secondary-dark, #94a3b8);
    }

    .capability-details-toggle {
      background-color: transparent;
      color: var(--text-secondary-dark, #94a3b8);
      border-color: var(--border-dark, #374151);
    }

    .capability-details-toggle:hover {
      background-color: var(--gray-700, #374151);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .capability-card,
    .capability-action,
    .capability-primary-action,
    .capability-details-toggle {
      transition: none;
    }
  }
`;

export default OfflineCapabilities;
