import React, { useState } from 'react';
import { HeartIcon, ShieldIcon, CheckIcon } from './icons.dynamic';

export const WelcomeScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  
  const handleContinue = () => {
    setFadeOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 500);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className={`welcome-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="welcome-overlay"></div>
      
      <div className="welcome-container">
        <div className="welcome-header">
          <div className="welcome-icon">
            <HeartIcon />
          </div>
          <h1 className="welcome-title">Welcome to Your Safe Space</h1>
          <p className="welcome-subtitle">
            A supportive community for mental health and wellbeing
          </p>
        </div>

        <div className="welcome-features">
          <div className="welcome-feature">
            <div className="feature-icon">
              <ShieldIcon />
            </div>
            <h3>100% Anonymous</h3>
            <p>No personal data collected, ever</p>
          </div>
          <div className="welcome-feature">
            <div className="feature-icon">
              <HeartIcon />
            </div>
            <h3>Peer Support</h3>
            <p>Connect with people who understand</p>
          </div>
          <div className="welcome-feature">
            <div className="feature-icon">
              <CheckIcon />
            </div>
            <h3>24/7 Resources</h3>
            <p>Crisis support always available</p>
          </div>
        </div>

        <div className="welcome-terms-section">
          <h2>Important Information</h2>
          <div className="terms-box">
            <p>
              <strong>Privacy First:</strong> Your conversations are encrypted and anonymous. 
              We never collect personal information or track your identity.
            </p>
            <p>
              <strong>Peer Support:</strong> This is a peer support platform, not professional medical care. 
              In emergencies, call 911 or 988 (Crisis Lifeline).
            </p>
            <p>
              <strong>Community Guidelines:</strong> Be respectful, supportive, and kind. 
              Report any harmful content immediately.
            </p>
          </div>
          <p className="terms-agreement">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <button 
          className="welcome-continue-btn"
          onClick={handleContinue}
        >
          <CheckIcon />
          Enter Safe Space
        </button>
      </div>
    </div>
  );
};
