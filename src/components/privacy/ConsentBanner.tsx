import React, { useState, useEffect } from 'react';
import { getAnalyticsService, ConsentStatus } from '../../services/analyticsService';
import { AppButton } from '../AppButton';
import { Modal } from '../Modal';

interface ConsentBannerProps {
  onConsentChange?: (consent: ConsentStatus) => void;
}

interface ConsentPreferences {
  analytics: boolean;
  performance: boolean;
  functionality: boolean;
  marketing: boolean;
}

const ConsentBanner: React.FC<ConsentBannerProps> = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    performance: true,
    functionality: true,
    marketing: false
  });

  const analyticsService = getAnalyticsService();

  useEffect(() => {
    // Check if user has already made consent choices
    const consentStatus = analyticsService.getConsentStatus();
    
    if (!consentStatus || !consentStatus.timestamp) {
      setShowBanner(true);
    } else {
      setPreferences({
        analytics: consentStatus.analytics,
        performance: consentStatus.performance,
        functionality: consentStatus.functionality,
        marketing: consentStatus.marketing
      });
    }
  }, [analyticsService]);

  const handleAcceptAll = () => {
    const consent: ConsentStatus = {
      analytics: true,
      performance: true,
      functionality: true,
      marketing: true,
      timestamp: Date.now(),
      version: '1.0.0'
    };

    analyticsService.updateConsent(consent);
    onConsentChange?.(consent);
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    const consent: ConsentStatus = {
      analytics: false,
      performance: true,
      functionality: true,
      marketing: false,
      timestamp: Date.now(),
      version: '1.0.0'
    };

    analyticsService.updateConsent(consent);
    onConsentChange?.(consent);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const consent: ConsentStatus = {
      ...preferences,
      timestamp: Date.now(),
      version: '1.0.0'
    };

    analyticsService.updateConsent(consent);
    onConsentChange?.(consent);
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Privacy & Mental Health Data Protection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                We use privacy-compliant analytics to improve our mental health platform while protecting your sensitive information. 
                All data is anonymized after 7 days, and crisis intervention data is handled with the highest security standards.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                GDPR & HIPAA-adjacent compliant • Data retention: 30 days • Automatic anonymization: 7 days
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-max">
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="text-xs"
              >
                Customize Preferences
              </AppButton>
              
              <AppButton
                variant="secondary"
                size="sm"
                onClick={handleAcceptEssential}
                className="text-xs"
              >
                Essential Only
              </AppButton>
              
              <AppButton
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs"
              >
                Accept All
              </AppButton>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        title="Privacy Preferences"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p className="mb-4">
              Your privacy is our priority. Customize how we collect and use data to improve your mental health platform experience.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                🔒 Mental Health Data Protection: Crisis intervention data is encrypted, anonymized after use, and retained only for safety analysis.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Functionality - Required */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                id="functionality"
                checked={true}
                disabled={true}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 opacity-50"
              />
              <div className="flex-1">
                <label htmlFor="functionality" className="text-sm font-medium text-gray-900 dark:text-white">
                  Essential Functionality
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Required
                  </span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Core platform features, user sessions, and security. Cannot be disabled.
                </p>
              </div>
            </div>

            {/* Performance - Required */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                id="performance"
                checked={true}
                disabled={true}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 opacity-50"
              />
              <div className="flex-1">
                <label htmlFor="performance" className="text-sm font-medium text-gray-900 dark:text-white">
                  Performance Monitoring
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Required
                  </span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Load times, error tracking, and platform optimization. Essential for mental health platform reliability.
                </p>
              </div>
            </div>

            {/* Analytics - Optional */}
            <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <input
                type="checkbox"
                id="analytics"
                checked={preferences.analytics}
                onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="analytics" className="text-sm font-medium text-gray-900 dark:text-white">
                  Usage Analytics
                  <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Optional
                  </span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Anonymous usage patterns to improve mental health features. Data anonymized after 7 days.
                </p>
              </div>
            </div>

            {/* Marketing - Optional */}
            <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <input
                type="checkbox"
                id="marketing"
                checked={preferences.marketing}
                onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="marketing" className="text-sm font-medium text-gray-900 dark:text-white">
                  Marketing Communications
                  <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Optional
                  </span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Personalized wellness tips and platform updates. No sensitive health data used.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• All data is processed according to GDPR and mental health privacy standards</p>
              <p>• Crisis intervention data is encrypted and anonymized immediately after use</p>
              <p>• You can change these preferences anytime in your privacy settings</p>
              <p>• Data is automatically purged after 90 days maximum</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <AppButton
              variant="secondary"
              onClick={() => setShowPreferences(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleSavePreferences}
            >
              Save Preferences
            </AppButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConsentBanner;
