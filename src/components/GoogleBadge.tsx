import React from 'react';
import { GoogleIcon, SparkleIcon } from './icons.dynamic';

export const GoogleBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`google-badge ${className}`}>
      <div className="google-badge-content">
        <GoogleIcon />
        <div className="google-badge-text">
          <span className="google-badge-powered">Powered by</span>
          <span className="google-badge-gemini">Google Gemini</span>
        </div>
        <SparkleIcon />
      </div>
    </div>
  );
};

export const FloatingGoogleBadge: React.FC = () => {
  return (
    <div className="floating-google-badge">
      <div className="google-badge-floating-content">
        <GoogleIcon />
        <span>Powered by Google Gemini AI</span>
      </div>
    </div>
  );
};
