import React, { useState, useEffect } from 'react';
import { SafetyPlan } from '../types';
import { AppButton } from '../components/AppButton';
import { AppTextArea } from '../components/AppInput';
import { Card } from '../components/Card';
import { useNotification } from '../contexts/NotificationContext';
import { HeartIcon, PhoneIcon, ShieldIcon, SparkleIcon, BookmarkIcon } from '../components/icons.dynamic';
import { useAuth } from '../contexts/AuthContext';

const defaultPlan: SafetyPlan = {
  triggers: '',
  copingStrategies: '',
  supportContacts: [],
  professionalContacts: [],
  safeEnvironment: '',
  emergencyContacts: [],
  reasonsToLive: '',
  lastUpdated: new Date().toISOString()
};

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isEmergency?: boolean;
}

const SafetyPlanView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [plan, setPlan] = useState<SafetyPlan>(defaultPlan);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadSafetyPlan();
  }, []);

  const loadSafetyPlan = async () => {
    try {
      // Simulate API call to load existing safety plan
      const savedPlan = localStorage.getItem(`safetyPlan_${user?.id}`);
      if (savedPlan) {
        setPlan(JSON.parse(savedPlan));
      } else {
        // Initialize with default plan if none exists
        setPlan(defaultPlan);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading safety plan:', error);
      showNotification('error', 'Failed to load safety plan');
    }
  };

  const saveSafetyPlan = async () => {
    try {
      setIsSaving(true);
      
      const updatedPlan = {
        ...plan,
        lastUpdated: new Date().toISOString()
      };
      
      // Save to localStorage (replace with API call in production)
      localStorage.setItem(`safetyPlan_${user?.id}`, JSON.stringify(updatedPlan));
      
      setPlan(updatedPlan);
      setIsEditing(false);
      showNotification('success', 'Safety plan saved successfully');
    } catch (error) {
      console.error('Error saving safety plan:', error);
      showNotification('error', 'Failed to save safety plan');
    } finally {
      setIsSaving(false);
    }
  };

  const addContact = (type: 'support' | 'professional' | 'emergency') => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      relationship: '',
      isEmergency: type === 'emergency'
    };

    setPlan(prev => ({
      ...prev,
      [`${type}Contacts`]: [...(prev[`${type}Contacts` as keyof SafetyPlan] as Contact[] || []), newContact]
    }));
  };

  const updateContact = (type: 'support' | 'professional' | 'emergency', contactId: string, field: keyof Contact, value: string) => {
    setPlan(prev => ({
      ...prev,
      [`${type}Contacts`]: (prev[`${type}Contacts` as keyof SafetyPlan] as Contact[] || []).map(contact =>
        contact.id === contactId ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeContact = (type: 'support' | 'professional' | 'emergency', contactId: string) => {
    setPlan(prev => ({
      ...prev,
      [`${type}Contacts`]: (prev[`${type}Contacts` as keyof SafetyPlan] as Contact[] || []).filter(contact => contact.id !== contactId)
    }));
  };

  const sections = [
    { id: 'overview', title: 'Overview', icon: <SparkleIcon /> },
    { id: 'triggers', title: 'Warning Signs', icon: <ShieldIcon /> },
    { id: 'coping', title: 'Coping Strategies', icon: <HeartIcon /> },
    { id: 'contacts', title: 'Support Contacts', icon: <PhoneIcon /> },
    { id: 'environment', title: 'Safe Environment', icon: <BookmarkIcon /> },
    { id: 'reasons', title: 'Reasons to Live', icon: <HeartIcon /> }
  ];

  const renderContactSection = (
    title: string,
    type: 'support' | 'professional' | 'emergency',
    description: string
  ) => {
    const contacts = (plan[`${type}Contacts` as keyof SafetyPlan] as Contact[] || []);

    return (
      <Card title={title} className="contact-section">
        <p className="section-description">{description}</p>
        
        {contacts.map(contact => (
          <div key={contact.id} className="contact-item">
            {isEditing ? (
              <div className="contact-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) => updateContact(type, contact.id, 'name', e.target.value)}
                  className="contact-input"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={contact.phone}
                  onChange={(e) => updateContact(type, contact.id, 'phone', e.target.value)}
                  className="contact-input"
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={contact.relationship}
                  onChange={(e) => updateContact(type, contact.id, 'relationship', e.target.value)}
                  className="contact-input"
                />
                <button
                  onClick={() => removeContact(type, contact.id)}
                  className="remove-contact-btn"
                  type="button"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="contact-display">
                <div className="contact-info">
                  <div className="contact-name">{contact.name || 'Unnamed Contact'}</div>
                  <div className="contact-details">
                    <span className="contact-phone">{contact.phone}</span>
                    {contact.relationship && (
                      <span className="contact-relationship">({contact.relationship})</span>
                    )}
                  </div>
                </div>
                <a href={`tel:${contact.phone}`} className="call-button">
                  <PhoneIcon />
                </a>
              </div>
            )}
          </div>
        ))}
        
        {isEditing && (
          <AppButton
            variant="secondary"
            size="small"
            onClick={() => addContact(type)}
          >
            Add Contact
          </AppButton>
        )}
      </Card>
    );
  };

  return (
    <div className="safety-plan-view">
      <div className="safety-plan-header">
        <h1>
          <ShieldIcon />
          My Safety Plan
        </h1>
        <p>A personalized plan to help you stay safe during difficult times</p>
        
        <div className="header-actions">
          {!isEditing ? (
            <AppButton onClick={() => setIsEditing(true)}>
              Edit Plan
            </AppButton>
          ) : (
            <div className="edit-actions">
              <AppButton 
                variant="secondary" 
                onClick={() => {
                  setIsEditing(false);
                  loadSafetyPlan(); // Reset changes
                }}
              >
                Cancel
              </AppButton>
              <AppButton 
                onClick={saveSafetyPlan}
                loading={isSaving}
              >
                Save Plan
              </AppButton>
            </div>
          )}
        </div>
      </div>

      <div className="safety-plan-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon}
            <span>{section.title}</span>
          </button>
        ))}
      </div>

      <div className="safety-plan-content">
        {activeSection === 'overview' && (
          <div className="overview-section">
            <Card title="About Your Safety Plan" className="info-card">
              <p>
                A safety plan is a personalized, practical plan that can help you avoid dangerous situations 
                and know how to react when you're in crisis. It includes your personal warning signs, 
                coping strategies, people and social settings that provide distraction, people you can ask for help, 
                professionals you can contact during a crisis, and ways to make your environment safe.
              </p>
              
              {plan.lastUpdated && (
                <div className="last-updated">
                  <strong>Last updated:</strong> {new Date(plan.lastUpdated).toLocaleDateString()}
                </div>
              )}
            </Card>

            <Card title="Emergency Resources" className="emergency-resources">
              <div className="emergency-grid">
                <div className="emergency-item">
                  <h3>National Suicide Prevention Lifeline</h3>
                  <a href="tel:988" className="emergency-number">988</a>
                  <p>24/7, free and confidential support</p>
                </div>
                
                <div className="emergency-item">
                  <h3>Crisis Text Line</h3>
                  <div className="emergency-number">Text HOME to 741741</div>
                  <p>Free, 24/7 crisis support via text</p>
                </div>
                
                <div className="emergency-item">
                  <h3>Emergency Services</h3>
                  <a href="tel:911" className="emergency-number">911</a>
                  <p>For immediate medical emergencies</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'triggers' && (
          <Card title="Warning Signs & Triggers" className="section-card">
            <p className="section-description">
              Identify personal warning signs that a crisis may be developing. These might include 
              thoughts, images, mood, situation, or behaviors that indicate you may be moving toward a crisis.
            </p>
            
            {isEditing ? (
              <AppTextArea
                value={plan.triggers}
                onChange={(e) => setPlan(prev => ({ ...prev, triggers: e.target.value }))}
                placeholder="Describe your warning signs and triggers..."
                rows={6}
                className="plan-textarea"
              />
            ) : (
              <div className="plan-content">
                {plan.triggers || <em>No warning signs recorded yet.</em>}
              </div>
            )}
          </Card>
        )}

        {activeSection === 'coping' && (
          <Card title="Coping Strategies" className="section-card">
            <p className="section-description">
              List internal coping strategies - things you can do to take your mind off your problems 
              without contacting another person (relaxation techniques, physical activity, hobbies, etc.).
            </p>
            
            {isEditing ? (
              <AppTextArea
                value={plan.copingStrategies}
                onChange={(e) => setPlan(prev => ({ ...prev, copingStrategies: e.target.value }))}
                placeholder="Describe your coping strategies..."
                rows={6}
                className="plan-textarea"
              />
            ) : (
              <div className="plan-content">
                {plan.copingStrategies || <em>No coping strategies recorded yet.</em>}
              </div>
            )}
          </Card>
        )}

        {activeSection === 'contacts' && (
          <div className="contacts-section">
            {renderContactSection(
              'Support People',
              'support',
              'People and social settings that provide distraction and support.'
            )}
            
            {renderContactSection(
              'Professional Contacts',
              'professional',
              'Mental health professionals or agencies to contact during a crisis.'
            )}
            
            {renderContactSection(
              'Emergency Contacts',
              'emergency',
              'People to contact in case of emergency.'
            )}
          </div>
        )}

        {activeSection === 'environment' && (
          <Card title="Making the Environment Safe" className="section-card">
            <p className="section-description">
              Ways to make your environment safe. This might include removing or securing potential 
              means of harm, or identifying safe places to go.
            </p>
            
            {isEditing ? (
              <AppTextArea
                value={plan.safeEnvironment}
                onChange={(e) => setPlan(prev => ({ ...prev, safeEnvironment: e.target.value }))}
                placeholder="Describe how to make your environment safe..."
                rows={6}
                className="plan-textarea"
              />
            ) : (
              <div className="plan-content">
                {plan.safeEnvironment || <em>No environment safety plan recorded yet.</em>}
              </div>
            )}
          </Card>
        )}

        {activeSection === 'reasons' && (
          <Card title="Reasons for Living" className="section-card">
            <p className="section-description">
              The most important reason to live or the most important thing that would be lost 
              by dying. This is something that is dear to the person and would be gravely impacted if they died.
            </p>
            
            {isEditing ? (
              <AppTextArea
                value={plan.reasonsToLive}
                onChange={(e) => setPlan(prev => ({ ...prev, reasonsToLive: e.target.value }))}
                placeholder="List your reasons for living..."
                rows={6}
                className="plan-textarea"
              />
            ) : (
              <div className="plan-content">
                {plan.reasonsToLive || <em>No reasons for living recorded yet.</em>}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default SafetyPlanView;
