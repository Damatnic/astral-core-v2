/**
 * Peer Support Dashboard Component
 * 
 * Provides a comprehensive interface for managing peer support activities
 * including finding matches, managing sessions, and accessing community features.
 * 
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePeerSupport } from '../../hooks/usePeerSupport';
import type { 
  PeerSupportRequest, 
  PeerMatch
} from '../../services/peerSupportNetworkService';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal } from '../Modal';
import { AppButton } from '../AppButton';

export const PeerSupportDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const token = 'mock-token'; // Temporary for demo
  
  const {
    findPeerSupport,
    createSupportSession,
    peerMatches,
    communityGroups,
    peerStatistics,
    isLoading,
    isFindingMatches,
    error
  } = usePeerSupport(token, i18n.language);

  const [showSupportRequestModal, setShowSupportRequestModal] = useState(false);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [sessionType, setSessionType] = useState<'text-chat' | 'voice-call' | 'video-call'>('text-chat');
  const [supportDescription, setSupportDescription] = useState('');

  const experienceAreas: string[] = [
    'anxiety', 'depression', 'trauma', 'grief-loss', 'relationship-issues',
    'work-stress', 'academic-pressure', 'family-issues', 'identity-struggles',
    'substance-abuse', 'eating-disorders', 'self-harm', 'suicidal-thoughts',
    'LGBTQ+-issues', 'cultural-adjustment', 'financial-stress'
  ];

  /**
   * Handle support request submission
   */
  const handleSupportRequest = async () => {
    let maxWaitTime = 60; // default for low urgency
    if (urgencyLevel === 'high') {
      maxWaitTime = 10;
    } else if (urgencyLevel === 'medium') {
      maxWaitTime = 30;
    }

    const request: PeerSupportRequest = {
      id: Date.now().toString(),
      seekerToken: token,
      language: i18n.language,
      experienceNeeded: selectedExperiences,
      urgencyLevel,
      preferredSupportStyle: [],
      sessionType,
      description: supportDescription,
      timestamp: Date.now(),
      maxWaitTime
    };

    await findPeerSupport(request);
    setShowSupportRequestModal(false);
  };

  /**
   * Handle creating a session with a matched peer
   */
  const handleCreateSession = async (match: PeerMatch) => {
    const sessionId = await createSupportSession(
      Date.now().toString(),
      match.peerId
    );
    
    if (sessionId) {
      console.log(`Created session: ${sessionId}`);
    }
  };

  return (
    <div className="peer-support-dashboard p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="dashboard-header mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('peerSupport.dashboard.title', 'Peer Support Network')}
        </h1>
        <p className="text-gray-600">
          {t('peerSupport.dashboard.subtitle', 'Connect with peers who understand your journey')}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AppButton
          onClick={() => setShowSupportRequestModal(true)}
          variant="primary"
          className="p-6 h-auto flex flex-col items-center"
          disabled={isLoading}
        >
          <div className="text-2xl mb-2">🤝</div>
          <div className="text-lg font-semibold">
            {t('peerSupport.actions.findSupport', 'Find Support')}
          </div>
          <div className="text-sm text-gray-600">
            {t('peerSupport.actions.findSupportDesc', 'Connect with a peer supporter')}
          </div>
        </AppButton>

        <AppButton
          onClick={() => {}}
          variant="secondary"
          className="p-6 h-auto flex flex-col items-center"
        >
          <div className="text-2xl mb-2">👥</div>
          <div className="text-lg font-semibold">
            {t('peerSupport.actions.communityGroups', 'Community Groups')}
          </div>
          <div className="text-sm text-gray-600">
            {t('peerSupport.actions.communityGroupsDesc', 'Join cultural communities')}
          </div>
        </AppButton>
      </div>

      {/* Statistics Panel */}
      {peerStatistics && (
        <div className="statistics-panel bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t('peerSupport.statistics.title', 'Network Statistics')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-item text-center">
              <div className="text-2xl font-bold text-blue-600">
                {peerStatistics.totalPeers || 0}
              </div>
              <div className="text-sm text-gray-600">
                {t('peerSupport.statistics.totalPeers', 'Total Peers')}
              </div>
            </div>
            <div className="stat-item text-center">
              <div className="text-2xl font-bold text-green-600">
                {peerStatistics.activePeers || 0}
              </div>
              <div className="text-sm text-gray-600">
                {t('peerSupport.statistics.activePeers', 'Active Now')}
              </div>
            </div>
            <div className="stat-item text-center">
              <div className="text-2xl font-bold text-purple-600">
                {peerStatistics.totalSessions || 0}
              </div>
              <div className="text-sm text-gray-600">
                {t('peerSupport.statistics.totalSessions', 'Total Sessions')}
              </div>
            </div>
            <div className="stat-item text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {peerStatistics.averageRating ? peerStatistics.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-600">
                {t('peerSupport.statistics.averageRating', 'Avg Rating')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Peer Matches */}
      {peerMatches.length > 0 && (
        <div className="peer-matches mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t('peerSupport.matches.title', 'Available Peer Supporters')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {peerMatches.map((match) => (
              <div
                key={match.peerId}
                className="match-card bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t('peerSupport.matches.anonymousSupporter', 'Anonymous Supporter')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Compatibility: {(match.compatibilityScore * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="compatibility-score text-center">
                    <div className="text-lg font-bold text-green-600">
                      {(match.compatibilityScore * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('peerSupport.matches.compatibility', 'Match')}
                    </div>
                  </div>
                </div>
                
                <div className="match-details mb-4">
                  <p className="text-sm text-gray-600">
                    {t('peerSupport.matches.waitTime', 'Estimated wait time')}: {match.estimatedWaitTime} min
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('peerSupport.matches.reason', 'Match reason')}: {match.matchReason}
                  </p>
                </div>

                <AppButton
                  onClick={() => handleCreateSession(match)}
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                >
                  {t('peerSupport.matches.connect', 'Connect Now')}
                </AppButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Groups */}
      {communityGroups.length > 0 && (
        <div className="community-groups mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t('peerSupport.community.title', 'Community Groups')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {communityGroups.map((group) => (
              <div
                key={group.id}
                className="group-card bg-white border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {group.memberCount} members
                  </span>
                  <AppButton
                    onClick={() => {}}
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                  >
                    {t('peerSupport.community.join', 'Join')}
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading States */}
      {(isLoading || isFindingMatches) && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Support Request Modal */}
      <Modal
        isOpen={showSupportRequestModal}
        onClose={() => setShowSupportRequestModal(false)}
        title={t('peerSupport.request.title', 'Request Peer Support')}
      >
        <div className="support-request-form space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('peerSupport.request.experienceAreas', 'Experience Areas Needed')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {experienceAreas.map((area) => (
                <label key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedExperiences.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExperiences([...selectedExperiences, area]);
                      } else {
                        setSelectedExperiences(selectedExperiences.filter(exp => exp !== area));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{t(`experiences.${area}`, area)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('peerSupport.request.urgency', 'Urgency Level')}
            </label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="low">{t('peerSupport.urgency.low', 'Low - Within an hour')}</option>
              <option value="medium">{t('peerSupport.urgency.medium', 'Medium - Within 30 minutes')}</option>
              <option value="high">{t('peerSupport.urgency.high', 'High - Within 10 minutes')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('peerSupport.request.sessionType', 'Preferred Session Type')}
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as 'text-chat' | 'voice-call' | 'video-call')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="text-chat">{t('peerSupport.sessionType.textChat', 'Text Chat')}</option>
              <option value="voice-call">{t('peerSupport.sessionType.voiceCall', 'Voice Call')}</option>
              <option value="video-call">{t('peerSupport.sessionType.videoCall', 'Video Call')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('peerSupport.request.description', 'Brief Description (Optional)')}
            </label>
            <textarea
              value={supportDescription}
              onChange={(e) => setSupportDescription(e.target.value)}
              placeholder={t('peerSupport.request.descriptionPlaceholder', 'What kind of support are you looking for?')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <AppButton
              onClick={() => setShowSupportRequestModal(false)}
              variant="secondary"
            >
              {t('common.cancel', 'Cancel')}
            </AppButton>
            <AppButton
              onClick={handleSupportRequest}
              variant="primary"
              disabled={selectedExperiences.length === 0 || isFindingMatches}
            >
              {isFindingMatches ? (
                <LoadingSpinner size="small" />
              ) : (
                t('peerSupport.request.submit', 'Find Matches')
              )}
            </AppButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
