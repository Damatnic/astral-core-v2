import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { AppButton } from './AppButton';
import { ShieldIcon, HeartIcon, LockIcon, AlertIcon } from './icons.dynamic';

export const SafetyTipsModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    // Disabled - using WelcomeScreen instead to avoid duplicate popups
    // Check if user has seen safety tips before
    // const hasSeenTips = localStorage.getItem('astral-safety-tips-seen');
    // if (!hasSeenTips) {
    //   setShowModal(true);
    // }
  }, []);
  
  const handleClose = () => {
    localStorage.setItem('astral-safety-tips-seen', 'true');
    setShowModal(false);
  };
  
  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title="Welcome to Your Safe Space"
      isDismissible={false}
    >
      <div className="safety-tips-content">
        <p className="safety-intro">
          Astral Core is designed to be a supportive, anonymous space for peer connection. 
          Here are some important things to know:
        </p>
        
        <div className="safety-tip">
          <div className="tip-icon">
            <LockIcon />
          </div>
          <div className="tip-content">
            <h3>Your Privacy is Protected</h3>
            <p>
              You're completely anonymous here. We don't collect any personal information. 
              Your identity is safe, allowing you to share freely without fear of judgment.
            </p>
          </div>
        </div>
        
        <div className="safety-tip">
          <div className="tip-icon">
            <HeartIcon />
          </div>
          <div className="tip-content">
            <h3>Human Connection First</h3>
            <p>
              While AI helps you articulate your thoughts, real humans provide the support. 
              Our vetted helpers are here to listen and understand, not to judge or diagnose.
            </p>
          </div>
        </div>
        
        <div className="safety-tip">
          <div className="tip-icon">
            <AlertIcon />
          </div>
          <div className="tip-content">
            <h3>Crisis Resources Available</h3>
            <p>
              If you're in immediate danger or having thoughts of self-harm, please use the 
              "Need Help Now?" button for immediate professional crisis support. We're here to 
              support you, but some situations need professional intervention.
            </p>
          </div>
        </div>
        
        <div className="safety-tip">
          <div className="tip-icon">
            <ShieldIcon />
          </div>
          <div className="tip-content">
            <h3>Report Concerns</h3>
            <p>
              If someone makes you uncomfortable or violates our community guidelines, 
              use the report feature. We take safety seriously and review all reports promptly.
            </p>
          </div>
        </div>
        
        <div className="safety-reminder">
          <p>
            <strong>Remember:</strong> This is peer support, not professional therapy. 
            For medical emergencies, always call emergency services.
          </p>
        </div>
        
        <div className="modal-actions">
          <AppButton onClick={handleClose} variant="primary">
            I Understand - Enter Safe Space
          </AppButton>
        </div>
      </div>
    </Modal>
  );
};
