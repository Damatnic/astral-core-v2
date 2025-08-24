/**
 * Crisis Alert Component
 *
 * Displays crisis detection alerts with appropriate urgency levels,
 * emergency actions, and resource connections.
 */

import React, { useState, useEffect } from 'react';
import "./CrisisAlert.css";

interface CrisisAlertProps { show?: boolean;
  severity?: "none" | "low" | "medium" | "high" | "critical";
  message?: string;
  actions?: string[];
  resources?: string[];
  emergencyMode?: boolean;
  onDismiss?: () => void;
  onEmergencyCall?: () => void;
  onCrisisChat?: () => void;
  userType?: "seeker" | "helper" }

interface EmergencyContact {
  id: string;,
  name: string
  number: string;,
  description: string
  available: string
};

type: "call" | "text" | "chat"
}

const emergencyContacts: EmergencyContact[] = [
  {
  id: "crisis-lifeline",
    name: "988 Suicide & Crisis Lifeline",
    number: "988",
    description: "24/7 free and confidential support",
    available: "24/7",
};

type: "call"
  },
  {
  id: "crisis-text",
    name: "Crisis Text Line",
    number: "741741",
    description: "Text HOME to 741741",
    available: "24/7",
};

type: "text"
  },
  {
  id: "emergency",
    name: "Emergency Services",
    number: "911",
    description: "For immediate life-threatening emergencies",
    available: "24/7",
};

type: "call"
  }
];

const CrisisAlertFixed: React.FC<CrisisAlertProps> = ({
  show = false,
  severity = "none",
  message = "We detected you might be going through a difficult time.",
  actions = [],
  resources = [],
  emergencyMode = false,
  onDismiss,
  onEmergencyCall,
  onCrisisChat,
};

userType = "seeker"
}) => { const [isVisible, setIsVisible] = useState(show);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    setIsVisible(show) }, [show]);

  const handleDismiss = () => { setIsVisible(false);
    onDismiss?.() };

  const handleEmergencyCall = () => {
    onEmergencyCall?.();
    // Open phone dialer
    window.location.href = "tel:988"
  };

  const handleCrisisChat = () => { onCrisisChat?.() };

  const getSeverityColor = (level: string) => {
    switch (level) {
  case "critical":
        return "#dc2626"; // red-600
      case "high":
        return "#ea580c"; // orange-600
      case "medium":
        return "#d97706"; // amber-600
      case "low":
        return "#059669"; // emerald-600
};

default:
        return "#6b7280"; // gray-500
    }
  };

  const getSeverityIcon = (level: string) => {
    switch (level) {
  case "critical":
        return "🚨";
      case "high":
        return "⚠️";
      case "medium":
        return "⚡";
      case "low":
        return "💙";
};

default:
        return "ℹ️"
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`crisis-alert crisis-alert--${severity} ${emergencyMode ? 'crisis-alert--emergency' : ''}`}>
      <div className="crisis-alert__header">
        <div className="crisis-alert__icon">
          {getSeverityIcon(severity)}
        </div>
        <div className="crisis-alert__title">
          <h3 style={{ color: getSeverityColor(severity) }}>
            {emergencyMode ? "Emergency Support Available" : "Crisis Support"}
          </h3>
        </div>
        <button 
          className="crisis-alert__close"
          onClick={handleDismiss}
          aria-label="Close alert"
        >
          ×
        </button>
      </div>

      <div className="crisis-alert__content">
        <p className="crisis-alert__message">{message}</p>
        
        {emergencyMode && (
          <div className="crisis-alert__emergency">
            <p className="crisis-alert__emergency-text">
              If you're having thoughts of self-harm or suicide, please reach out for immediate help:
            </p>}
    <div className="crisis-alert__contacts">
              {
  emergencyContacts.map((contact) => (}
    <button
};

key={contact.id}
                  className="crisis-alert__contact"
                  onClick={() => {
                    if (contact.type === "call") {
                      window.location.href = `tel:${contact.number}`;
                    } else if (contact.type === "text") {
                      window.location.href = `sms:${contact.number}`;
                    }
                  }}
                >
                  <div className="crisis-alert__contact-name">{contact.name}</div>
                  <div className="crisis-alert__contact-number">{contact.number}</div>
                  <div className="crisis-alert__contact-desc">{contact.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className="crisis-alert__actions">
            <h4>Suggested Actions:</h4>}
    <ul>
              {actions.map((action, index) => (}
    <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        )}

        {resources && resources.length > 0 && (
          <div className="crisis-alert__resources">
            <h4>Available Resources:</h4>}
    <ul>
              {resources.map((resource, index) => (}
    <li key={index}>{resource}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="crisis-alert__footer">
        <div className="crisis-alert__buttons">
          <button
            className="crisis-alert__button crisis-alert__button--primary"
            onClick={handleEmergencyCall}
          >
            Call 988 Now
          </button>
          <button
            className="crisis-alert__button crisis-alert__button--secondary"
            onClick={handleCrisisChat}
          >
            Start Crisis Chat
          </button>
          {
  !emergencyMode && (}
    <button
              className="crisis-alert__button crisis-alert__button--tertiary"
};

onClick={handleDismiss}
            >
              I'm Safe Right Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrisisAlertFixed;