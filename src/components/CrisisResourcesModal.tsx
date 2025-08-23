/**
 * Crisis Resources Modal Component
 * 
 * Emergency offline access to crisis intervention resources
 * for the Astral Core mental health platform.
 */

import React, { useState, useEffect } from 'react';
import { useOffline } from '../contexts/OfflineProvider';
import { Modal } from './Modal';
import { PhoneIcon, AlertIcon, CloseIcon  } from './icons.dynamic';

export interface CrisisResource {
  id: string;
  name: string;
  number?: string;
  textKeyword?: string;
  description: string;
  availability: string;
  region: string;
  priority: 'critical' | 'high' | 'medium';
  type: 'emergency' | 'mental_health' | 'text_support' | 'treatment_referral' | 'specialized';
  services?: string[];
}

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  steps: string[];
  category: 'breathing' | 'grounding' | 'distraction' | 'self_soothing' | 'cognitive';
  duration: string;
  difficulty: 'easy' | 'moderate' | 'advanced';
}

export interface CrisisResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'emergency' | 'support' | 'coping' | 'safety';
}

export const CrisisResourcesModal: React.FC<CrisisResourcesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'emergency'
}) => {
  const { connectionStatus } = useOffline();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);
  const [copingStrategies, setCopingStrategies] = useState<CopingStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load crisis resources from cache or network
  useEffect(() => {
    if (!isOpen) return;

    const loadResources = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to load from cache first (offline-first approach)
        const [resourcesResponse, copingResponse] = await Promise.all([
          fetch('/crisis-resources.json'),
          fetch('/offline-coping-strategies.json')
        ]);

        if (!resourcesResponse.ok || !copingResponse.ok) {
          throw new Error('Failed to load crisis resources');
        }

        const [resourcesData, copingData] = await Promise.all([
          resourcesResponse.json(),
          copingResponse.json()
        ]);

        // Combine emergency and support contacts
        const allResources: CrisisResource[] = [
          ...(resourcesData.emergencyContacts || []),
          ...(resourcesData.supportContacts || [])
        ];

        setCrisisResources(allResources);
        setCopingStrategies(copingData.strategies || []);
      } catch (err) {
        console.error('Failed to load crisis resources:', err);
        setError('Unable to load crisis resources. Please try again.');
        
        // Fallback to basic emergency contacts
        setCrisisResources([
          {
            id: 'emergency-911',
            name: 'Emergency Services',
            number: '911',
            description: 'For immediate life-threatening emergencies',
            availability: '24/7',
            region: 'US',
            priority: 'critical',
            type: 'emergency'
          },
          {
            id: 'suicide-prevention-988',
            name: 'National Suicide Prevention Lifeline',
            number: '988',
            description: 'Free, confidential support for people in suicidal crisis or distress',
            availability: '24/7',
            region: 'US',
            priority: 'critical',
            type: 'mental_health'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [isOpen]);

  // Filter resources by type
  const emergencyContacts = crisisResources.filter(r => r.type === 'emergency' || r.priority === 'critical');
  const supportContacts = crisisResources.filter(r => r.type !== 'emergency' && r.priority !== 'critical');

  // Emergency contact card
  const EmergencyContactCard: React.FC<{ contact: CrisisResource }> = ({ contact }) => (
    <div className="crisis-contact">
      <div className="crisis-contact__header">
        <div className="crisis-contact__icon">
          <PhoneIcon />
        </div>
        <div className="crisis-contact__info">
          <h3 className="crisis-contact__name">{contact.name}</h3>
          <div className="crisis-contact__number">
            {contact.number && (
              <a href={`tel:${contact.number}`} className="crisis-contact__phone">
                {contact.number}
              </a>
            )}
            {contact.textKeyword && (
              <span className="crisis-contact__text">
                Text &ldquo;{contact.textKeyword}&rdquo; to {contact.number}
              </span>
            )}
          </div>
        </div>
        <div className={`crisis-contact__priority crisis-contact__priority--${contact.priority}`}>
          {contact.priority}
        </div>
      </div>
      <p className="crisis-contact__description">{contact.description}</p>
      <div className="crisis-contact__meta">
        <span className="crisis-contact__availability">{contact.availability}</span>
        <span className="crisis-contact__region">{contact.region}</span>
      </div>
    </div>
  );

  // Coping strategy card
  const CopingStrategyCard: React.FC<{ strategy: CopingStrategy }> = ({ strategy }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="coping-strategy">
        <div className="coping-strategy__header">
          <h3 className="coping-strategy__title">{strategy.title}</h3>
          <div className="coping-strategy__meta">
            <span className={`coping-strategy__difficulty coping-strategy__difficulty--${strategy.difficulty}`}>
              {strategy.difficulty}
            </span>
            <span className="coping-strategy__duration">{strategy.duration}</span>
          </div>
        </div>
        <p className="coping-strategy__description">{strategy.description}</p>
        <button
          className="coping-strategy__toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide Steps' : 'Show Steps'}
        </button>
        {expanded && (
          <ol className="coping-strategy__steps">
            {strategy.steps.map((step, index) => (
              <li key={index} className="coping-strategy__step">
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  };

  // Safety planning content
  const SafetyPlanContent = () => (
    <div className="safety-plan">
      <div className="safety-plan__section">
        <h3>Warning Signs</h3>
        <p>Recognize when you might be in crisis:</p>
        <ul>
          <li>Thoughts of suicide or self-harm</li>
          <li>Feeling hopeless or trapped</li>
          <li>Intense emotional pain</li>
          <li>Substance use to cope</li>
          <li>Withdrawing from others</li>
        </ul>
      </div>
      
      <div className="safety-plan__section">
        <h3>Internal Coping Strategies</h3>
        <p>Things you can do without contacting others:</p>
        <ul>
          <li>Deep breathing exercises</li>
          <li>Listen to calming music</li>
          <li>Take a warm bath or shower</li>
          <li>Go for a walk</li>
          <li>Practice mindfulness</li>
        </ul>
      </div>
      
      <div className="safety-plan__section">
        <h3>People and Social Settings</h3>
        <p>Contact trusted friends, family, or go to safe places</p>
      </div>
      
      <div className="safety-plan__section">
        <h3>Professional Contacts</h3>
        <p>Mental health professionals and crisis lines are available 24/7</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg"
        title="Loading Crisis Resources"
      >
        <div className="crisis-modal__loading">
          <div className="loading-spinner" />
          <p>Loading crisis resources...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      title="Crisis Resources"
    >
      <div className="crisis-modal">
        <div className="crisis-modal__header">
          <div className="crisis-modal__title">
            <AlertIcon />
            <h2>Crisis Resources</h2>
          </div>
          <div className="crisis-modal__status">
            {!connectionStatus.isOnline && (
              <span className="offline-indicator">
                Available offline
              </span>
            )}
          </div>
          <button
            className="crisis-modal__close"
            onClick={onClose}
            aria-label="Close crisis resources"
          >
            <CloseIcon />
          </button>
        </div>

        {error && (
          <div className="crisis-modal__error">
            <AlertIcon />
            <p>{error}</p>
          </div>
        )}

        <div className="crisis-modal__tabs">
          <button
            className={activeTab === 'emergency' ? 'crisis-tab crisis-tab--active' : 'crisis-tab'}
            onClick={() => setActiveTab('emergency')}
          >
            Emergency
          </button>
          <button
            className={activeTab === 'support' ? 'crisis-tab crisis-tab--active' : 'crisis-tab'}
            onClick={() => setActiveTab('support')}
          >
            Support
          </button>
          <button
            className={activeTab === 'coping' ? 'crisis-tab crisis-tab--active' : 'crisis-tab'}
            onClick={() => setActiveTab('coping')}
          >
            Coping
          </button>
          <button
            className={activeTab === 'safety' ? 'crisis-tab crisis-tab--active' : 'crisis-tab'}
            onClick={() => setActiveTab('safety')}
          >
            Safety Plan
          </button>
        </div>

        <div className="crisis-modal__content">
          {activeTab === 'emergency' && (
            <div className="crisis-content">
              <h3>Emergency Contacts</h3>
              <p>For immediate life-threatening situations</p>
              <div className="crisis-contacts">
                {emergencyContacts.map(contact => (
                  <EmergencyContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="crisis-content">
              <h3>Support Resources</h3>
              <p>Mental health support and treatment referrals</p>
              <div className="crisis-contacts">
                {supportContacts.map(contact => (
                  <EmergencyContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coping' && (
            <div className="crisis-content">
              <h3>Coping Strategies</h3>
              <p>Techniques to help manage difficult emotions</p>
              <div className="coping-strategies">
                {copingStrategies.map(strategy => (
                  <CopingStrategyCard key={strategy.id} strategy={strategy} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="crisis-content">
              <h3>Safety Planning</h3>
              <p>Steps to help you stay safe during a crisis</p>
              <SafetyPlanContent />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CrisisResourcesModal;
