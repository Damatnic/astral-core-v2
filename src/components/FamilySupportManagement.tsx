/**
 * Family Support Management Component
 * 
 * Provides culturally-appropriate family support configuration and management
 * for crisis intervention situations. Respects different cultural approaches
 * to family involvement in mental health crises.
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { culturalFamilySupportService, FamilySupport, FamilyMember } from '../services/culturalFamilySupportService';
import { culturalContextService } from '../services/culturalContextService';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { Modal } from './Modal';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';

interface FamilySupportManagementProps {
  userId: string;
  currentLanguage: string;
  onSupportConfigured?: (support: FamilySupport) => void;
}

export const FamilySupportManagement: React.FC<FamilySupportManagementProps> = ({
  userId,
  currentLanguage,
  onSupportConfigured
}) => {
  const { t } = useTranslation();
  const [familySupport, setFamilySupport] = useState<FamilySupport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  // Form states
  const [familyStructure, setFamilyStructure] = useState<FamilySupport['familyStructure']>('nuclear');
  const [supportLevel, setSupportLevel] = useState<FamilySupport['supportLevel']>('family_aware');
  const [emergencyProtocolEnabled, setEmergencyProtocolEnabled] = useState(false);

  // New member form state
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: '',
    relationship: 'parent',
    contactMethod: 'phone',
    culturalRole: 'emotional_support',
    languages: [currentLanguage],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emergencyContact: false,
    consentGiven: false,
    notificationPreferences: {
      dailyWellness: false,
      crisisAlerts: true,
      progressUpdates: false,
      emergencyOnly: false
    },
    culturalConsiderations: {
      preferredCommunicationStyle: 'respectful'
    }
  });

  useEffect(() => {
    loadFamilySupport();
  }, [userId]);

  /**
   * Load existing family support configuration
   */
  const loadFamilySupport = async () => {
    try {
      setLoading(true);
      const existingSupport = culturalFamilySupportService.getFamilySupport(userId);
      if (existingSupport) {
        setFamilySupport(existingSupport);
        setFamilyStructure(existingSupport.familyStructure);
        setSupportLevel(existingSupport.supportLevel);
        setEmergencyProtocolEnabled(existingSupport.emergencyProtocol.enabled);
      } else {
        setShowSetupModal(true);
      }
    } catch (error) {
      console.error('Failed to load family support:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create initial family support configuration
   */
  const createFamilySupport = async () => {
    try {
      setLoading(true);
      const culturalContext = culturalContextService.getCulturalContext(currentLanguage);
      
      const newSupport = await culturalFamilySupportService.createFamilySupport(
        userId,
        culturalContext,
        currentLanguage,
        familyStructure,
        supportLevel
      );

      if (emergencyProtocolEnabled) {
        newSupport.emergencyProtocol.enabled = true;
      }

      setFamilySupport(newSupport);
      setShowSetupModal(false);
      
      if (onSupportConfigured) {
        onSupportConfigured(newSupport);
      }
    } catch (error) {
      console.error('Failed to create family support:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add new family member
   */
  const addFamilyMember = async () => {
    if (!familySupport || !newMember.name || !newMember.relationship) {
      return;
    }

    try {
      setLoading(true);
      await culturalFamilySupportService.addFamilyMember(userId, newMember as Omit<FamilyMember, 'id'>);
      
      // Refresh family support data
      const updatedSupport = culturalFamilySupportService.getFamilySupport(userId);
      if (updatedSupport) {
        setFamilySupport(updatedSupport);
      }
      
      // Reset form
      setNewMember({
        name: '',
        relationship: 'parent',
        contactMethod: 'phone',
        culturalRole: 'emotional_support',
        languages: [currentLanguage],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        emergencyContact: false,
        consentGiven: false,
        notificationPreferences: {
          dailyWellness: false,
          crisisAlerts: true,
          progressUpdates: false,
          emergencyOnly: false
        },
        culturalConsiderations: {
          preferredCommunicationStyle: 'respectful'
        }
      });
      
      setShowAddMemberModal(false);
    } catch (error) {
      console.error('Failed to add family member:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get cultural guidance for current context
   */
  const getCulturalGuidance = () => {
    if (!familySupport) return null;
    return culturalFamilySupportService.getCulturalGuidance(familySupport.culturalContext.region);
  };

  /**
   * Get relationship options based on cultural context
   */
  const getRelationshipOptions = () => {
    const baseOptions = [
      { value: 'parent', label: t('family.relationships.parent', 'Parent') },
      { value: 'sibling', label: t('family.relationships.sibling', 'Sibling') },
      { value: 'spouse', label: t('family.relationships.spouse', 'Spouse/Partner') },
      { value: 'child', label: t('family.relationships.child', 'Child') },
      { value: 'grandparent', label: t('family.relationships.grandparent', 'Grandparent') },
      { value: 'aunt_uncle', label: t('family.relationships.aunt_uncle', 'Aunt/Uncle') },
      { value: 'cousin', label: t('family.relationships.cousin', 'Cousin') },
      { value: 'guardian', label: t('family.relationships.guardian', 'Guardian') },
      { value: 'other', label: t('family.relationships.other', 'Other') }
    ];

    return baseOptions;
  };

  /**
   * Get cultural role options based on context
   */
  const getCulturalRoleOptions = () => {
    return [
      { value: 'primary_decision_maker', label: t('family.roles.primary_decision_maker', 'Primary Decision Maker') },
      { value: 'emotional_support', label: t('family.roles.emotional_support', 'Emotional Support') },
      { value: 'practical_support', label: t('family.roles.practical_support', 'Practical Support') },
      { value: 'spiritual_guide', label: t('family.roles.spiritual_guide', 'Spiritual Guide') },
      { value: 'community_liaison', label: t('family.roles.community_liaison', 'Community Liaison') },
      { value: 'backup_contact', label: t('family.roles.backup_contact', 'Backup Contact') }
    ];
  };

  if (loading && !familySupport) {
    return (
      <div className="family-support-loading">
        <LoadingSpinner />
        <p>{t('family.loading', 'Loading family support configuration...')}</p>
      </div>
    );
  }

  const guidance = getCulturalGuidance();

  return (
    <div className="family-support-management">
      {/* Setup Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title={t('family.setup.title', 'Family Support Setup')}
        isDismissible={false}
      >
        <div className="family-setup-form space-y-4">
          <div className="cultural-context-info p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">
              {t('family.setup.culturalContext', 'Cultural Context')}
            </h4>
            <p className="text-sm text-gray-600">
              {t('family.setup.culturalDescription', 'We respect different cultural approaches to family involvement in mental health support.')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('family.setup.familyStructure', 'Family Structure')}
            </label>
            <select 
              value={familyStructure} 
              onChange={(e) => setFamilyStructure(e.target.value as FamilySupport['familyStructure'])}
              className="w-full p-2 border rounded-lg"
            >
              <option value="nuclear">{t('family.structure.nuclear', 'Nuclear Family')}</option>
              <option value="extended">{t('family.structure.extended', 'Extended Family')}</option>
              <option value="multigenerational">{t('family.structure.multigenerational', 'Multigenerational')}</option>
              <option value="single_parent">{t('family.structure.single_parent', 'Single Parent')}</option>
              <option value="communal">{t('family.structure.communal', 'Communal/Community')}</option>
              <option value="chosen_family">{t('family.structure.chosen_family', 'Chosen Family')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('family.setup.supportLevel', 'Support Level')}
            </label>
            <select 
              value={supportLevel} 
              onChange={(e) => setSupportLevel(e.target.value as FamilySupport['supportLevel'])}
              className="w-full p-2 border rounded-lg"
            >
              <option value="individual_only">{t('family.support.individual_only', 'Individual Only')}</option>
              <option value="family_aware">{t('family.support.family_aware', 'Family Aware')}</option>
              <option value="family_involved">{t('family.support.family_involved', 'Family Involved')}</option>
              <option value="community_centered">{t('family.support.community_centered', 'Community Centered')}</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="emergency-protocol"
              checked={emergencyProtocolEnabled}
              onChange={(e) => setEmergencyProtocolEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="emergency-protocol" className="text-sm">
              {t('family.setup.enableEmergencyProtocol', 'Enable emergency notification protocol')}
            </label>
          </div>

          <div className="flex space-x-3">
            <AppButton onClick={createFamilySupport} variant="primary" className="flex-1">
              {t('family.setup.create', 'Create Family Support')}
            </AppButton>
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title={t('family.addMember.title', 'Add Family Member')}
      >
        <div className="add-member-form space-y-4">
          <AppInput
            label={t('family.addMember.name', 'Name')}
            value={newMember.name || ''}
            onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t('family.addMember.namePlaceholder', 'Enter family member name')}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('family.addMember.relationship', 'Relationship')}
            </label>
            <select 
              value={newMember.relationship || 'parent'} 
              onChange={(e) => setNewMember(prev => ({ ...prev, relationship: e.target.value as FamilyMember['relationship'] }))}
              className="w-full p-2 border rounded-lg"
            >
              {getRelationshipOptions().map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('family.addMember.culturalRole', 'Cultural Role')}
            </label>
            <select 
              value={newMember.culturalRole || 'emotional_support'} 
              onChange={(e) => setNewMember(prev => ({ ...prev, culturalRole: e.target.value as FamilyMember['culturalRole'] }))}
              className="w-full p-2 border rounded-lg"
            >
              {getCulturalRoleOptions().map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('family.addMember.contactMethod', 'Contact Method')}
            </label>
            <select 
              value={newMember.contactMethod || 'phone'} 
              onChange={(e) => setNewMember(prev => ({ ...prev, contactMethod: e.target.value as FamilyMember['contactMethod'] }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="phone">{t('family.contact.phone', 'Phone')}</option>
              <option value="email">{t('family.contact.email', 'Email')}</option>
              <option value="sms">{t('family.contact.sms', 'SMS')}</option>
              <option value="emergency_only">{t('family.contact.emergency_only', 'Emergency Only')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">{t('family.addMember.notifications', 'Notification Preferences')}</h4>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="crisis-alerts"
                checked={newMember.notificationPreferences?.crisisAlerts || false}
                onChange={(e) => setNewMember(prev => ({
                  ...prev,
                  notificationPreferences: {
                    ...prev.notificationPreferences!,
                    crisisAlerts: e.target.checked
                  }
                }))}
                className="rounded"
              />
              <label htmlFor="crisis-alerts" className="text-sm">
                {t('family.notifications.crisisAlerts', 'Crisis Alerts')}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emergency-contact"
                checked={newMember.emergencyContact || false}
                onChange={(e) => setNewMember(prev => ({ ...prev, emergencyContact: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="emergency-contact" className="text-sm">
                {t('family.notifications.emergencyContact', 'Emergency Contact')}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="consent-given"
                checked={newMember.consentGiven || false}
                onChange={(e) => setNewMember(prev => ({ ...prev, consentGiven: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="consent-given" className="text-sm">
                {t('family.notifications.consentGiven', 'Consent to receive notifications')}
              </label>
            </div>
          </div>

          <div className="flex space-x-3">
            <AppButton onClick={() => setShowAddMemberModal(false)} variant="secondary" className="flex-1">
              {t('common.cancel', 'Cancel')}
            </AppButton>
            <AppButton onClick={addFamilyMember} variant="primary" className="flex-1">
              {t('family.addMember.add', 'Add Member')}
            </AppButton>
          </div>
        </div>
      </Modal>

      {/* Main Family Support Display */}
      {familySupport && (
        <div className="family-support-dashboard space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {t('family.dashboard.title', 'Family Support Network')}
            </h3>
            <AppButton onClick={() => setShowAddMemberModal(true)} variant="primary">
              {t('family.dashboard.addMember', 'Add Member')}
            </AppButton>
          </div>

          {/* Cultural Guidance Card */}
          {guidance && (
            <Card className="cultural-guidance-card">
              <h4 className="font-medium mb-3">
                {t('family.guidance.title', 'Cultural Guidance')} - {familySupport.culturalContext.region}
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>{t('family.guidance.familyInvolvement', 'Family Involvement')}:</strong>
                  <p className="text-gray-600 mt-1">
                    {guidance.familyInvolvementGuidelines.whenToInvolveFamily.join(', ')}
                  </p>
                </div>
                <div>
                  <strong>{t('family.guidance.communicationTips', 'Communication Tips')}:</strong>
                  <p className="text-gray-600 mt-1">
                    {guidance.familyInvolvementGuidelines.communicationTips.join(', ')}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Family Members List */}
          <Card className="family-members-card">
            <h4 className="font-medium mb-4">
              {t('family.members.title', 'Family Members')} ({familySupport.familyMembers.length})
            </h4>
            
            {familySupport.familyMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('family.members.empty', 'No family members added yet.')}</p>
                <p className="text-sm mt-2">
                  {t('family.members.addFirst', 'Add your first family member to get started.')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {familySupport.familyMembers.map((member) => (
                  <div key={member.id} className="family-member-item p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium">{member.name}</h5>
                        <p className="text-sm text-gray-600 capitalize">
                          {member.relationship.replace('_', ' ')} • {member.culturalRole.replace('_', ' ')}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {member.contactMethod}
                          </span>
                          {member.emergencyContact && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {t('family.member.emergency', 'Emergency')}
                            </span>
                          )}
                          {member.consentGiven && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {t('family.member.consented', 'Consented')}
                            </span>
                          )}
                        </div>
                      </div>
                      <AppButton
                        onClick={() => console.log('Edit member:', member.id)}
                        variant="secondary"
                      >
                        {t('common.edit', 'Edit')}
                      </AppButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Emergency Protocol Status */}
          <Card className="emergency-protocol-card">
            <h4 className="font-medium mb-3">
              {t('family.emergency.title', 'Emergency Protocol')}
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {familySupport.emergencyProtocol.enabled 
                    ? t('family.emergency.enabled', 'Emergency notifications are enabled')
                    : t('family.emergency.disabled', 'Emergency notifications are disabled')
                  }
                </p>
                {familySupport.emergencyProtocol.enabled && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('family.emergency.levels', 'Escalation levels')}: {familySupport.emergencyProtocol.escalationLevels.length}
                  </p>
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${familySupport.emergencyProtocol.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FamilySupportManagement;
