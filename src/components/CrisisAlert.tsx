/**
 * Crisis Alert Component
 * 
 * Displays crisis detection alerts with appropriate urgency levels,
 * emergency actions, and resource connections.
 */

import { useState, useEffect } from 'react';
import { ShieldIcon,
  Clock,
  X,
  Phone,
  MessageCircle,
  ExternalLink,
  AlertTriangle
 } from './icons.dynamic';
import './CrisisAlert.css';

export interface CrisisAlertProps {
  show: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actions: string[];
  resources: string[];
  emergencyMode: boolean;
  onDismiss: () => void;
  onEmergencyCall?: () => void;
  onCrisisChat?: () => void;
  userType?: 'seeker' | 'helper';
  onClose?: () => void; // Added for backward compatibility
  variant?: string; // Added for backward compatibility
}

interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  available: string;
  type: 'call' | 'text' | 'chat';
}

const emergencyContacts: EmergencyContact[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    description: 'Free, confidential crisis counseling',
    available: '24/7',
    type: 'call'
  },
  {
    name: 'Crisis Text Line',
    number: '741741',
    description: 'Text HOME for immediate support',
    available: '24/7',
    type: 'text'
  },
  {
    name: 'Emergency Services',
    number: '911',
    description: 'Immediate emergency assistance',
    available: '24/7',
    type: 'call'
  }
];

export function CrisisAlert({
  show,
  severity,
  message,
  actions,
  resources,
  emergencyMode,
  onDismiss,
  onEmergencyCall,
  onCrisisChat,
  userType = 'seeker',
  onClose
  // variant prop available if needed for styling variations
}: CrisisAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeShown, setTimeShown] = useState<Date | null>(null);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setTimeShown(new Date());
      
      // Auto-focus for screen readers
      const alertElement = document.getElementById('crisis-alert');
      if (alertElement) {
        alertElement.focus();
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleDismiss = () => {
    onDismiss();
    // Call onClose if provided for backward compatibility
    if (onClose) {
      onClose();
    }
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

  const getSeverityConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          className: 'crisis-alert--critical',
          icon: AlertTriangle,
          color: '#dc2626',
          pulse: true,
          title: 'IMMEDIATE ATTENTION NEEDED'
        };
      case 'high':
        return {
          className: 'crisis-alert--high',
          icon: AlertTriangle,
          color: '#ea580c',
          pulse: true,
          title: 'Crisis Support Needed'
        };
      case 'medium':
        return {
          className: 'crisis-alert--medium',
          icon: ShieldIcon,
          color: '#d97706',
          pulse: false,
          title: 'Support Recommended'
        };
      case 'low':
        return {
          className: 'crisis-alert--low',
          icon: ShieldIcon,
          color: '#059669',
          pulse: false,
          title: 'Resources Available'
        };
      default:
        return {
          className: 'crisis-alert--none',
          icon: ShieldIcon,
          color: '#6b7280',
          pulse: false,
          title: 'Support Available'
        };
    }
  };

  const config = getSeverityConfig();
  const IconComponent = config.icon;

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
      <div className="crisis-alert__backdrop" onClick={emergencyMode ? undefined : handleDismiss} />
      
      <div className="crisis-alert__container">
        {/* Header */}
        <div className="crisis-alert__header">
          <div className="crisis-alert__icon-container">
            <IconComponent 
              className={config.pulse ? 'crisis-alert__icon crisis-alert__icon--pulse' : 'crisis-alert__icon'}
              style={{ color: config.color }}
              size={24}
              aria-hidden="true"
            />
          </div>
          
          <div className="crisis-alert__title-container">
            <h2 id="crisis-alert-title" className="crisis-alert__title">
              {config.title}
            </h2>
            {timeShown && (
              <div className="crisis-alert__timestamp">
                <Clock size={14} />
                <span>{timeShown.toLocaleTimeString()}</span>
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
              <X size={20} />
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
              {emergencyContacts.map((contact, index) => (
                <button
                  key={index}
                  className={`crisis-alert__emergency-contact ${
                    contact.type === 'call' ? 'crisis-alert__emergency-contact--call' : 
                    contact.type === 'text' ? 'crisis-alert__emergency-contact--text' : 
                    'crisis-alert__emergency-contact--chat'
                  }`}
                  onClick={() => handleEmergencyCall(contact)}
                  type="button"
                >
                  <div className="crisis-alert__contact-icon">
                    {contact.type === 'call' && <Phone size={20} />}
                    {contact.type === 'text' && <MessageCircle size={20} />}
                    {contact.type === 'chat' && <MessageCircle size={20} />}
                  </div>
                  <div className="crisis-alert__contact-info">
                    <div className="crisis-alert__contact-name">{contact.name}</div>
                    <div className="crisis-alert__contact-number">{contact.number}</div>
                    <div className="crisis-alert__contact-description">{contact.description}</div>
                    <div className="crisis-alert__contact-availability">{contact.available}</div>
                  </div>
                  <ExternalLink size={16} className="crisis-alert__contact-external" />
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
                <li key={index} className="crisis-alert__action-item">
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
            <MessageCircle size={20} />
            <span>Start Crisis Chat</span>
          </button>
        </div>

        {/* Resources */}
        {resources.length > 0 && (
          <div className="crisis-alert__resources-section">
            <h3 className="crisis-alert__section-title">Additional Resources</h3>
            <ul className="crisis-alert__resources-list">
              {resources.map((resource, index) => (
                <li key={index} className="crisis-alert__resource-item">
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDismiss();
                }
              }}
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
