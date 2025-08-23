/**
 * Crisis Alert Component
 * 
 * Displays crisis detection alerts with appropriate urgency levels,
 * emergency actions, and resource connections.
 */

import React, { useState, useEffect } from 'react';
import './CrisisAlert.css';

interface CrisisAlertProps {
  show?: boolean;
  severity?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  actions?: string[];
  resources?: string[];
  emergencyMode?: boolean;
  onDismiss?: () => void;
  onEmergencyCall?: () => void;
  onCrisisChat?: () => void;
  userType?: 'seeker' | 'helper';
}

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
  available: string;
  type: 'call' | 'text' | 'chat';
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: 'crisis-lifeline',
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    description: 'Free, confidential crisis counseling',
    available: '24/7',
    type: 'call'
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    number: '741741',
    description: 'Text HOME for immediate support',
    available: '24/7',
    type: 'text'
  },
  {
    id: 'emergency-services',
    name: 'Emergency Services',
    number: '911',
    description: 'Immediate emergency assistance',
    available: '24/7',
    type: 'call'
  }
];

export function CrisisAlert({
  show = false,
  severity = 'none',
  message = '',
  actions = [],
  resources = [],
  emergencyMode = false,
  onDismiss = () => {},
  onEmergencyCall,
  onCrisisChat,
  userType = 'seeker'
}: CrisisAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeShown, setTimeShown] = useState<Date | null>(null);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setTimeShown(new Date());
      
      // Auto-focus for screen readers with a small delay to ensure element is rendered
      setTimeout(() => {
        const alertElement = document.getElementById('crisis-alert');
        if (alertElement) {
          alertElement.focus();
        }
      }, 0);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleDismiss = () => {
    onDismiss();
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    if (onEmergencyCall) {
      onEmergencyCall();
    }
    
    // For web, we can try to open the phone app
    if (contact.type === 'call') {
      window.open(`tel:${contact.number}`, '_self');
    } else if (contact.type === 'text') {
      window.open(`sms:${contact.number}`, '_self');
    }
  };

  const handleCrisisChat = () => {
    if (onCrisisChat) {
      onCrisisChat();
    } else {
      // Open crisis chat website
      window.open('https://suicidepreventionlifeline.org/chat/', '_blank');
    }
  };

  const handleBackdropClick = () => {
    if (!emergencyMode) {
      handleDismiss();
    }
  };

  const handleBackdropKeyDown = (event: React.KeyboardEvent) => {
    if (!emergencyMode && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleDismiss();
    }
  };

  const getSeverityConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          className: 'crisis-alert--critical',
          color: '#dc2626',
          pulse: true,
          title: 'IMMEDIATE ATTENTION NEEDED'
        };
      case 'high':
        return {
          className: 'crisis-alert--high',
          color: '#ea580c',
          pulse: true,
          title: 'Crisis Support Needed'
        };
      case 'medium':
        return {
          className: 'crisis-alert--medium',
          color: '#d97706',
          pulse: false,
          title: 'Support Recommended'
        };
      case 'low':
        return {
          className: 'crisis-alert--low',
          color: '#059669',
          pulse: false,
          title: 'Resources Available'
        };
      default:
        return {
          className: 'crisis-alert--none',
          color: '#6b7280',
          pulse: false,
          title: 'Support Available'
        };
    }
  };

  const getContactClassName = (contactType: string) => {
    if (contactType === 'call') return 'crisis-alert__emergency-contact--call';
    if (contactType === 'text') return 'crisis-alert__emergency-contact--text';
    return 'crisis-alert__emergency-contact--chat';
  };

  const config = getSeverityConfig();

  if (!isVisible) return null;

  return (
    <div 
      className={[
        'crisis-alert',
        config.className,
        show ? 'crisis-alert--show' : 'crisis-alert--hide'
      ].join(' ')}
      role="alert"
      aria-live="assertive"
      aria-labelledby="crisis-alert-title"
      id="crisis-alert"
      tabIndex={-1}
    >
      <div 
        className="crisis-alert__backdrop" 
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role="button"
        tabIndex={emergencyMode ? -1 : 0}
        aria-label={emergencyMode ? undefined : "Close alert backdrop"}
      />
      
      <div className="crisis-alert__container">
        {/* Header */}
        <div className="crisis-alert__header">
          <div className="crisis-alert__icon-container">
            <div 
              className={config.pulse ? 'crisis-alert__icon crisis-alert__icon--pulse' : 'crisis-alert__icon'}
              style={{ color: config.color }}
              aria-hidden="true"
            >
              ⚠️
            </div>
          </div>
          
          <div className="crisis-alert__title-container">
            <h2 id="crisis-alert-title" className="crisis-alert__title">
              {config.title}
            </h2>
            {timeShown && (
              <div className="crisis-alert__timestamp">
                🕐 <span>{timeShown.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {!emergencyMode && (
            <button
              className="crisis-alert__close"
              onClick={handleDismiss}
              aria-label="Close alert"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Message */}
        <div className="crisis-alert__content">
          <p className="crisis-alert__message">{message}</p>
        </div>

        {/* Emergency Contacts (for critical/high severity) */}
        {(severity === 'critical' || severity === 'high') && (
          <div className="crisis-alert__emergency-section">
            <h3 className="crisis-alert__section-title">Immediate Help Available</h3>
            <div className="crisis-alert__emergency-contacts">
              {emergencyContacts.map((contact) => (
                <button
                  key={contact.id}
                  className={`crisis-alert__emergency-contact ${getContactClassName(contact.type)}`}
                  onClick={() => handleEmergencyCall(contact)}
                  type="button"
                >
                  <div className="crisis-alert__contact-icon">
                    {contact.type === 'call' && '📞'}
                    {contact.type === 'text' && '💬'}
                    {contact.type === 'chat' && '💬'}
                  </div>
                  <div className="crisis-alert__contact-info">
                    <div className="crisis-alert__contact-name">{contact.name}</div>
                    <div className="crisis-alert__contact-number">{contact.number}</div>
                    <div className="crisis-alert__contact-description">{contact.description}</div>
                    <div className="crisis-alert__contact-availability">{contact.available}</div>
                  </div>
                  <div className="crisis-alert__contact-external">🔗</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="crisis-alert__actions-section">
            <h3 className="crisis-alert__section-title">Recommended Actions</h3>
            <ul className="crisis-alert__actions-list">
              {actions.map((action, index) => (
                <li key={`action-${index}`} className="crisis-alert__action-item">
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Crisis Chat Button */}
        <div className="crisis-alert__chat-section">
          <button
            className="crisis-alert__chat-button"
            onClick={handleCrisisChat}
            type="button"
          >
            💬 <span>Start Crisis Chat</span>
          </button>
        </div>

        {/* Resources */}
        {resources.length > 0 && (
          <div className="crisis-alert__resources-section">
            <h3 className="crisis-alert__section-title">Additional Resources</h3>
            <ul className="crisis-alert__resources-list">
              {resources.map((resource, index) => (
                <li key={`resource-${index}`} className="crisis-alert__resource-item">
                  {resource}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer for helpers */}
        {userType === 'helper' && (
          <div className="crisis-alert__helper-footer">
            <div className="crisis-alert__helper-note">
              <strong>Helper Guidance:</strong> This situation requires professional intervention. 
              Do not attempt to handle this crisis alone. Connect the person with professional crisis services immediately.
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!emergencyMode && (
          <div className="crisis-alert__footer">
            <button
              className="crisis-alert__dismiss-button"
              onClick={handleDismiss}
              type="button"
            >
              I understand
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CrisisAlert;
