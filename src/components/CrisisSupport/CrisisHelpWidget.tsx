import React, { useState, useEffect } from 'react';
import './CrisisHelpWidget.css';

interface CrisisResource {
  name: string;
  number: string;
  description: string;
  available: string;
  type: 'hotline' | 'text' | 'chat' | 'emergency';
}

const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    description: 'Free, confidential crisis support 24/7',
    available: '24/7',
    type: 'hotline'
  },
  {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    description: 'Free 24/7 text support',
    available: '24/7',
    type: 'text'
  },
  {
    name: 'Emergency Services',
    number: '911',
    description: 'Immediate emergency response',
    available: '24/7',
    type: 'emergency'
  },
  {
    name: 'SAMHSA National Helpline',
    number: '1-800-662-4357',
    description: 'Treatment referral and information',
    available: '24/7',
    type: 'hotline'
  },
  {
    name: 'Veterans Crisis Line',
    number: '1-800-273-8255',
    description: 'Support for veterans and families',
    available: '24/7',
    type: 'hotline'
  },
  {
    name: 'LGBTQ National Hotline',
    number: '1-888-843-4564',
    description: 'Support for LGBTQ individuals',
    available: 'Mon-Fri 1pm-9pm PT',
    type: 'hotline'
  }
];

export const CrisisHelpWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    // Add pulse animation every 10 seconds if widget is closed
    if (!isExpanded) {
      const interval = setInterval(() => {
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 2000);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isExpanded]);

  const handleCallNumber = (number: string) => {
    // Format number for tel: link
    const telNumber = number.replace(/[^\d]/g, '');
    if (telNumber.length > 3) {
      window.location.href = `tel:${telNumber}`;
    }
  };

  const handleTextSupport = () => {
    // For Crisis Text Line
    window.open('sms:741741?body=HOME', '_blank');
  };

  const getResourcesByUrgency = () => {
    if (urgencyLevel === 'high') {
      return CRISIS_RESOURCES.filter(r => r.type === 'emergency' || r.number === '988');
    }
    if (urgencyLevel === 'medium') {
      return CRISIS_RESOURCES.filter(r => r.type !== 'emergency');
    }
    return CRISIS_RESOURCES;
  };

  const filteredResources = urgencyLevel ? getResourcesByUrgency() : CRISIS_RESOURCES;

  return (
    <div className={`crisis-help-widget ${isExpanded ? 'expanded' : ''} ${pulseAnimation ? 'pulse' : ''}`}>
      {!isExpanded ? (
        <button 
          className="crisis-help-button"
          onClick={() => setIsExpanded(true)}
          aria-label="Get crisis help"
        >
          <span className="crisis-icon">🆘</span>
          <span className="crisis-text">Need Help?</span>
        </button>
      ) : (
        <div className="crisis-help-panel">
          <div className="crisis-header">
            <h2>Crisis Support</h2>
            <button 
              className="close-button"
              onClick={() => {
                setIsExpanded(false);
                setUrgencyLevel(null);
              }}
              aria-label="Close crisis panel"
            >
              ✕
            </button>
          </div>

          <div className="crisis-content">
            <div className="urgency-selector">
              <p className="urgency-question">How urgent is your situation?</p>
              <div className="urgency-buttons">
                <button 
                  className={`urgency-btn low ${urgencyLevel === 'low' ? 'active' : ''}`}
                  onClick={() => setUrgencyLevel('low')}
                >
                  I need support
                </button>
                <button 
                  className={`urgency-btn medium ${urgencyLevel === 'medium' ? 'active' : ''}`}
                  onClick={() => setUrgencyLevel('medium')}
                >
                  I&apos;m struggling
                </button>
                <button 
                  className={`urgency-btn high ${urgencyLevel === 'high' ? 'active' : ''}`}
                  onClick={() => setUrgencyLevel('high')}
                >
                  Emergency
                </button>
              </div>
            </div>

            <div className="resources-list">
              {filteredResources.map((resource, index) => (
                <div key={index} className={`resource-card ${resource.type}`}>
                  <div className="resource-header">
                    <h3>{resource.name}</h3>
                    <span className="availability">{resource.available}</span>
                  </div>
                  <p className="resource-description">{resource.description}</p>
                  <div className="resource-actions">
                    {resource.type === 'text' ? (
                      <button 
                        className="action-btn text-btn"
                        onClick={handleTextSupport}
                      >
                        📱 {resource.number}
                      </button>
                    ) : (
                      <button 
                        className="action-btn call-btn"
                        onClick={() => handleCallNumber(resource.number)}
                      >
                        📞 {resource.number}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="crisis-footer">
              <p className="safety-note">
                💙 You are not alone. These services are confidential and here to help.
              </p>
              <p className="emergency-note">
                If you are in immediate danger, please call 911 or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrisisHelpWidget;