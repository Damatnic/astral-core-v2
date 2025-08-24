/**
 * PWA Install Banner Component
 * Prompts users to install the Progressive Web App
 */

import React, { useState, useEffect } from 'react';
import { pwaService, PWAStatus } from '../services/pwaService';
import "./PWAInstallBanner.css";

interface PWAInstallBannerProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onInstall,
  onDismiss,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>('not-supported');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check PWA installation status
    const checkPWAStatus = async () => {
      const status = await pwaService.getInstallStatus();
      setPwaStatus(status);
      
      // Show banner if PWA is installable
      if (status === 'installable') {
        setIsVisible(true);
      }
    };

    checkPWAStatus();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaStatus('installable');
      setIsVisible(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setPwaStatus('installed');
      setIsVisible(false);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        onInstall?.();
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsVisible(false);
    } else {
      // Fallback: try to install via PWA service
      try {
        await pwaService.promptInstall();
        onInstall?.();
        setIsVisible(false);
      } catch (error) {
        console.error('Failed to install PWA:', error);
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible || pwaStatus !== 'installable') {
    return null;
  }

  return (
    <div className={`pwa-install-banner ${className}`}>
      <div className="pwa-install-banner__content">
        <div className="pwa-install-banner__icon">
          📱
        </div>
        <div className="pwa-install-banner__text">
          <h3 className="pwa-install-banner__title">
            Install CoreV2 App
          </h3>
          <p className="pwa-install-banner__description">
            Get quick access to mental health support with our mobile app experience.
          </p>
        </div>
        <div className="pwa-install-banner__actions">
          <button
            className="pwa-install-banner__button pwa-install-banner__button--primary"
            onClick={handleInstallClick}
          >
            Install
          </button>
          <button
            className="pwa-install-banner__button pwa-install-banner__button--secondary"
            onClick={handleDismiss}
          >
            Not Now
          </button>
        </div>
      </div>
      <button
        className="pwa-install-banner__close"
        onClick={handleDismiss}
        aria-label="Close install banner"
      >
        ×
      </button>
    </div>
  );
};

export default PWAInstallBanner;