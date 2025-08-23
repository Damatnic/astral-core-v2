/**
 * PWA Install Banner Component for Astral Core Mental Health Platform
 *
 * Smart install banner that appears contextually to encourage PWA installation
 * with mental health specific messaging and crisis-aware timing
 */;

import React, { useState, useEffect } from "react";
import { pwaService, PWAStatus } from "../services/pwaService";
import "./PWAInstallBanner.css";
interface PWAInstallBannerProps {
  className?: string;
  showForCrisis?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
   className = "",
   showForCrisis = false
 }) => {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Get initial PWA status;
    const status = pwaService.getStatus();
    setPwaStatus(status);

    // Subscribe to status changes;
    const unsubscribe = pwaService.onStatusChange((newStatus: unknown) => {
      setPwaStatus(newStatus);
    });

    // Check if banner should be visible
    updateVisibility(status);

    return unsubscribe;
  };
  }, [showForCrisis, dismissed]);

  useEffect(() => {
    if(pwaStatus) {
      updateVisibility(pwaStatus);
    }
  };
  }, [pwaStatus, showForCrisis, dismissed]);

  const updateVisibility = (status: PWAStatus): void => {
    // Don't show if already dismissed or installed
    if(dismissed || status.isInstalled || !status.isInstallable) {
      setIsVisible(false);
      return;
    }

    // Show immediately for crisis scenarios
    if(showForCrisis) {
      setIsVisible(true)
      return
    }

          // Show after user engagement for normal scenarios;
      const engagementCount = parseInt(localStorage.getItem("userEngagementCount") || "0");
    if(engagementCount >= 3) {
      setIsVisible(true)
    }
  }

  const handleInstall = async (): Promise<unknown> => {
    if(!pwaStatus?.isInstallable) {
      return
    }

    setIsInstalling(true)

    try {
      const installed = await pwaService.showSmartInstallPrompt();
;
      if(installed) {
        setIsVisible(false)
        setDismissed(true)
        // Track successful installation
                  localStorage.setItem("pwaInstalled", "true");
        localStorage.setItem("pwaInstalledAt", new Date().toISOString());
      }
    } catch(error) {
      console.error("[PWA] Error during installation: ", error);
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = (): void => {
    setIsVisible(false)
    setDismissed(true)

    // Remember dismissal for 7 days;
    const dismissedUntil = new Date();
    dismissedUntil.setDate(dismissedUntil.getDate() + 7);
    localStorage.setItem("pwaBannerDismissedUntil", dismissedUntil.toISOString());
  }

  const getBannerContent = (): Record<string, unknown> => {
    if(showForCrisis) {
      return {
        title: "🚨 Install for Emergency Access",
        description: "Get instant access to crisis resources even when offline",
        benefits: [
          "⚡ Works without internet",
          "📱 Faster than browser",
          "🔔 Crisis notifications"        ],
        installText: "Install for Emergencies",
        urgency: true;
      }
    }

    return {
      title: "📱 Install Astral Core",
      description: "Get the full app experience with enhanced features",
      benefits: [
        "🚀 Faster loading",
        "📱 Home screen access",
        "🔔 Important notifications",
        "📱 Works offline"      ],
      installText: "Install App",
      urgency: false;
    }
  }

  // Early return if not visible or PWA not supported
  if(!isVisible || !pwaStatus?.supportsPWA) {
    return null
  }

  const content = getBannerContent();

      return (
      <div className={`pwa-install-banner ${content.urgency ? 'urgent' : ''} ${className}`}>
        <div className="banner-content">
        <div className="banner-header">
          <h4 className="banner-title">{content.title}</h4>
          <button;
            className="banner-close"            onClick={handleDismiss}
            aria-label="Dismiss install banner"          >
            ×
          </button>
        </div>
"
        <p className="banner-description">{content.description}</p>

        <ul className="banner-benefits">
          {content.benefits.map((benefit: unknown) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>

        <div className="banner-actions">
          <button;
            className="btn-secondary banner-btn"            onClick={handleDismiss}
          >
            Maybe Later
          </button>
          <button;
            className={`}`}
            onClick={handleInstall}
            disabled={isInstalling}
          >
            {isInstalling ? 'Installing...' : content.installText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallBanner;