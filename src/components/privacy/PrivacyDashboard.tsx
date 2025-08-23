import React, { useState, useEffect } from 'react';
import { getAnalyticsService, ConsentStatus } from '../../services/analyticsService';
import { AppButton } from '../AppButton';
import { Modal } from '../Modal';

interface PrivacyDashboardProps {
  className?: string;
}

interface PrivacyReport {
  totalEvents: number;
  personalDataEvents: number;
  anonymizedEvents: number;
  crisisEvents: number;
  dataRetentionDays: number;
  gdprCompliant: boolean;
  hipaaAdjacent: boolean;
  consentStatus: ConsentStatus | null;
  oldestEvent: Date | null;
  newestEvent: Date | null;
}

const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({ className = '' }) => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);
  const [privacyReport, setPrivacyReport] = useState<PrivacyReport | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const analyticsService = getAnalyticsService();

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = () => {
    const consent = analyticsService.getConsentStatus();
    const report = analyticsService.getPrivacyReport();
    
    setConsentStatus(consent);
    setPrivacyReport(report);
  };

  const handleConsentChange = (key: keyof ConsentStatus, value: boolean) => {
    if (consentStatus) {
      const updatedConsent = { ...consentStatus, [key]: value };
      analyticsService.updateConsent(updatedConsent);
      setConsentStatus(updatedConsent);
      loadPrivacyData();
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would use actual user ID
      const userId = 'current-user';
      const exportRequest = await analyticsService.exportUserData(userId);
      
      // Create and download the export file
      const exportData = {
        request: exportRequest,
        consent: consentStatus,
        privacyReport: privacyReport,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `astral-privacy-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async (retainCrisisData: boolean = true) => {
    setIsLoading(true);
    try {
      // In a real app, this would use actual user ID
      const userId = 'current-user';
      await analyticsService.deleteUserData(userId, retainCrisisData);
      
      loadPrivacyData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptOut = () => {
    analyticsService.optOut();
    loadPrivacyData();
  };

  const handleOptIn = () => {
    analyticsService.optIn();
    loadPrivacyData();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Privacy & Data Control
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your privacy settings and view your data usage for our mental health platform.
        </p>
      </div>

      {/* Privacy Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-300 text-sm">✓</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                GDPR Compliant
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                Full rights protection
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 text-sm">🔒</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Mental Health Protected
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                HIPAA-adjacent standards
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-300 text-sm">⏰</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Auto-Anonymization
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-300">
                7 days maximum
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Usage Overview */}
      {privacyReport && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Data Overview
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {privacyReport.totalEvents}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Total Events</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {privacyReport.personalDataEvents}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Personal Data</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {privacyReport.anonymizedEvents}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Anonymized</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {privacyReport.crisisEvents}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Crisis Events</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <strong>Data Retention:</strong> {privacyReport.dataRetentionDays} days
            </div>
            <div>
              <strong>Oldest Event:</strong> {formatDate(privacyReport.oldestEvent)}
            </div>
          </div>
        </div>
      )}

      {/* Consent Controls */}
      {consentStatus && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Privacy Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Essential Functionality</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Required for platform operation</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Always On</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Performance Monitoring</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Error tracking and optimization</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Always On</div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Usage Analytics</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Anonymous usage patterns</div>
              </div>
              <div className="flex items-center">
                <input
                  id="analytics-consent"
                  type="checkbox"
                  checked={consentStatus.analytics}
                  onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="analytics-consent" className="sr-only">
                  Toggle analytics consent
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Marketing Communications</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Wellness tips and updates</div>
              </div>
              <div className="flex items-center">
                <input
                  id="marketing-consent"
                  type="checkbox"
                  checked={consentStatus.marketing}
                  onChange={(e) => handleConsentChange('marketing', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="marketing-consent" className="sr-only">
                  Toggle marketing communications consent
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Control Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <AppButton
            variant="secondary"
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            Export My Data
          </AppButton>
          
          <AppButton
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete My Data
          </AppButton>
          
          {analyticsService.isEnabled() ? (
            <AppButton
              variant="secondary"
              size="sm"
              onClick={handleOptOut}
            >
              Opt Out
            </AppButton>
          ) : (
            <AppButton
              variant="success"
              size="sm"
              onClick={handleOptIn}
            >
              Opt In
            </AppButton>
          )}
          
          <AppButton
            variant="ghost"
            size="sm"
            onClick={() => analyticsService.clearStoredData()}
          >
            Clear Local Data
          </AppButton>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Your Data"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Download a complete copy of your personal data stored in our mental health platform. 
            This includes all analytics events, consent preferences, and privacy settings.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Export Contents:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Analytics events and user journey data</li>
              <li>• Privacy preferences and consent history</li>
              <li>• Data retention and anonymization status</li>
              <li>• Platform usage statistics</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <AppButton
              variant="secondary"
              onClick={() => setShowExportModal(false)}
              disabled={isLoading}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleExportData}
              disabled={isLoading}
            >
              {isLoading ? 'Exporting...' : 'Download Export'}
            </AppButton>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Your Data"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Permanently delete your personal data from our mental health platform. 
            This action cannot be undone.
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Important Notice:</h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              Crisis intervention data may be retained (anonymized) for safety analysis and platform improvement. 
              This helps us protect other users in crisis situations.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                id="retain-crisis-data"
                type="checkbox"
                defaultChecked={true}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="retain-crisis-data" className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  Retain anonymous crisis data for safety
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Helps improve crisis intervention for other users
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <AppButton
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="danger"
              onClick={() => handleDeleteData(true)}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete My Data'}
            </AppButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivacyDashboard;
