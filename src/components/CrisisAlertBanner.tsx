import React, { useState, useEffect } from 'react';
import { getCrisisResources } from '../utils/crisisDetection';
import { PhoneIcon, ChatIcon, CloseIcon, ShieldIcon, AlertIcon } from './icons.dynamic';

export const CrisisAlertBanner: React.FC<{
  show?: boolean;
  severity?: 'low' | 'medium' | 'high';
  onClose?: () => void;
}> = ({ show = true, severity = 'medium', onClose }) => {
  const [isVisible, setIsVisible] = useState(show);
  const resources = getCrisisResources();
  
  useEffect(() => {
    setIsVisible(show);
  }, [show]);
  
  const handleClose = () => {
    try {
      setIsVisible(false);
      onClose?.();
    } catch (error) {
      console.error('Error closing crisis alert:', error);
      // Still hide the banner even if callback fails
      setIsVisible(false);
    }
  };
  
  if (!isVisible) return null;
  
  const getBannerClass = () => {
    const base = 'crisis-alert-banner';
    if (severity === 'high') return `${base} ${base}--urgent`;
    if (severity === 'low') return `${base} ${base}--info`;
    return base;
  };
  
  return (
    <div className={getBannerClass()} data-testid="crisis-alert-banner">
      <div className="crisis-alert-content">
        <div className="crisis-alert-header">
          <h3>You&apos;re Not Alone - Help is Available 24/7</h3>
          {onClose && (
            <button 
              className="crisis-alert-close" 
              onClick={handleClose}
              aria-label="Close crisis alert"
            >
              <CloseIcon />
            </button>
          )}
        </div>
        
        <div className="crisis-alert-resources">
          <a href={`tel:${resources.number}`} className="crisis-resource-item">
            <PhoneIcon />
            <div>
              <strong>Call {resources.name}</strong>
              <span>{resources.number}</span>
            </div>
          </a>
          
          <div className="crisis-resource-item">
            <ChatIcon />
            <div>
              <strong>Text Support</strong>
              <span>{resources.text}</span>
            </div>
          </div>
        </div>
        
        <p className="crisis-alert-message">
          If you&apos;re thinking about suicide, are worried about a friend or loved one, 
          or would like emotional support, help is available.
        </p>
        
        <div className="crisis-alert-actions">
          <a 
            href={resources.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="crisis-action-primary"
          >
            Get Help Now
          </a>
          <button 
            className="crisis-action-secondary"
            onClick={() => window.location.href = '#crisis'}
          >
            View All Resources
          </button>
        </div>
      </div>
    </div>
  );
};

// Floating Crisis Button - Always visible
export const FloatingCrisisButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleExpand = () => {
    try {
      setIsExpanded(true);
    } catch (error) {
      console.error('Error expanding crisis help:', error);
    }
  };

  const handleClose = () => {
    try {
      setIsExpanded(false);
    } catch (error) {
      console.error('Error closing crisis help:', error);
    }
  };

  const handleEmergencyCall = (number: string) => {
    try {
      window.location.href = `tel:${number}`;
    } catch (error) {
      console.error('Error initiating call:', error);
      // Fallback: copy number to clipboard
      navigator.clipboard?.writeText(number);
    }
  };
  
  return (
    <div className={isExpanded ? 'floating-crisis-button expanded' : 'floating-crisis-button'}>
      {!isExpanded ? (
        <button 
          className="crisis-help-trigger urgent-pulse"
          onClick={handleExpand}
          aria-label="Get immediate help - Crisis support available 24/7"
        >
          <ShieldIcon />
          <span className="crisis-text">Need Help Now?</span>
        </button>
      ) : (
        <div className="crisis-help-expanded">
          <div className="crisis-header">
            <AlertIcon />
            <h4>Immediate Help Available 24/7</h4>
            <button 
              className="crisis-close-btn"
              onClick={handleClose}
              aria-label="Close crisis help menu"
            >
              ×
            </button>
          </div>
          
          <div className="crisis-emergency-options">
            <button 
              onClick={() => handleEmergencyCall('911')}
              className="crisis-emergency-btn crisis-call-btn priority"
            >
              <div className="emergency-icon">🚨</div>
              <div className="emergency-text">
                <strong>Emergency: 911</strong>
                <span>Life-threatening emergency</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleEmergencyCall('988')}
              className="crisis-emergency-btn crisis-call-btn"
            >
              <PhoneIcon />
              <div className="emergency-text">
                <strong>Crisis Lifeline: 988</strong>
                <span>Suicide & crisis support</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleEmergencyCall('741741')}
              className="crisis-emergency-btn crisis-text-btn"
            >
              <ChatIcon />
              <div className="emergency-text">
                <strong>Crisis Text Line</strong>
                <span>Text HOME to 741741</span>
              </div>
            </button>
            
            <a 
              href="/crisis" 
              className="crisis-emergency-btn crisis-professional-btn"
              onClick={handleClose}
            >
              <ShieldIcon />
              <div className="emergency-text">
                <strong>Licensed Counselor</strong>
                <span>Professional support</span>
              </div>
            </a>
          </div>
          
          <div className="crisis-additional-help">
            <a 
              href="/crisis" 
              className="crisis-more-link"
              onClick={handleClose}
            >
              View All Resources & Safety Plan →
            </a>
          </div>
          
          <div className="crisis-safety-plan">
            <div className="crisis-safety-reminder">
              <strong>Remember:</strong> You are not alone. Help is always available.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
