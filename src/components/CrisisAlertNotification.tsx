import React, { useEffect, useState } from 'react';
import { AlertIcon, PhoneIcon, MessageIcon, HeartIcon } from './icons.dynamic';
import { pushNotificationService } from '../services/pushNotificationService';
import './CrisisAlertNotification.css';

interface CrisisContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

interface CrisisAlertConfig {
  enabled: boolean;
  autoAlert: boolean;
  alertThreshold: 'low' | 'medium' | 'high';
  contacts: CrisisContact[];
  alertMessage: string;
  locationSharing: boolean;
}

export const CrisisAlertNotification: React.FC = () => {
  const [config, setConfig] = useState<CrisisAlertConfig>({
    enabled: false,
    autoAlert: false,
    alertThreshold: 'high',
    contacts: [],
    alertMessage: "I'm experiencing a mental health crisis and need support.",
    locationSharing: false
  });
  
  const [isInCrisis, setIsInCrisis] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    loadConfiguration();
    setupCrisisDetection();
  }, []);

  const loadConfiguration = () => {
    const saved = localStorage.getItem('crisis_alert_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      } catch (error) {
        console.error('Failed to load crisis alert config:', error);
      }
    }
  };

  const saveConfiguration = () => {
    localStorage.setItem('crisis_alert_config', JSON.stringify(config));
    
    // Subscribe to crisis alerts if enabled
    if (config.enabled) {
      const userId = localStorage.getItem('userId') || 'default';
      pushNotificationService.subscribeToCrisisAlerts(userId);
    }
  };

  const setupCrisisDetection = () => {
    // Listen for crisis detection events from other components
    window.addEventListener('crisis-detected', handleCrisisDetected);
    
    // Listen for manual crisis trigger
    window.addEventListener('crisis-trigger', handleManualCrisis);
    
    return () => {
      window.removeEventListener('crisis-detected', handleCrisisDetected);
      window.removeEventListener('crisis-trigger', handleManualCrisis);
    };
  };

  const handleCrisisDetected = (event: Event) => {
    const { severity, confidence, indicators } = (event as CustomEvent).detail || {};
    
    console.log('[Crisis Alert] Crisis detected:', { severity, confidence, indicators });
    
    // Check if auto-alert is enabled and threshold is met
    if (config.enabled && config.autoAlert) {
      const shouldAlert = checkAlertThreshold(severity, confidence);
      if (shouldAlert) {
        triggerCrisisAlert('auto', indicators);
      }
    } else if (config.enabled) {
      // Show manual trigger option
      setIsInCrisis(true);
    }
  };

  const handleManualCrisis = () => {
    if (config.enabled) {
      triggerCrisisAlert('manual');
    }
  };

  const checkAlertThreshold = (severity: string, confidence: number): boolean => {
    switch (config.alertThreshold) {
      case 'low':
        return confidence >= 0.3;
      case 'medium':
        return confidence >= 0.5 && severity !== 'low';
      case 'high':
        return confidence >= 0.7 && severity === 'high';
      default:
        return false;
    }
  };

  const triggerCrisisAlert = async (triggerType: 'auto' | 'manual', indicators?: string[]) => {
    if (alertSent) {
      console.log('[Crisis Alert] Alert already sent recently');
      return;
    }
    
    setLoading(true);
    
    try {
      // Send push notification to support team
      await sendPushNotification(triggerType, indicators);
      
      // Send SMS to emergency contacts
      await sendSMSAlerts();
      
      // Update local state
      setAlertSent(true);
      setIsInCrisis(true);
      
      // Log crisis event
      logCrisisEvent(triggerType, indicators);
      
      // Reset alert sent flag after 30 minutes
      setTimeout(() => {
        setAlertSent(false);
      }, 30 * 60 * 1000);
      
    } catch (error) {
      console.error('[Crisis Alert] Failed to send crisis alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPushNotification = async (triggerType: string, indicators?: string[]) => {
    const userId = localStorage.getItem('userId') || 'default';
    const userName = localStorage.getItem('userName') || 'User';
    
    const notification = {
      type: 'crisis',
      message: `${userName} is experiencing a mental health crisis and needs immediate support.`,
      urgency: 'high',
      triggerType,
      indicators,
      timestamp: Date.now()
    };
    
    // Send to support team
    await pushNotificationService.sendCrisisNotification(userId, notification);
    
    // Also send to user for confirmation
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification('Crisis Alert Sent', {
        body: 'Your crisis alert has been sent to your support team.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'crisis-alert-confirmation',
        requireInteraction: false
      });
    }
  };

  const sendSMSAlerts = async () => {
    if (!config.contacts || config.contacts.length === 0) {
      console.log('[Crisis Alert] No emergency contacts configured');
      return;
    }
    
    const location = config.locationSharing ? await getCurrentLocation() : null;
    
    // Send SMS via backend API
    const response = await fetch('/.netlify/functions/api-safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_crisis_alert',
        contacts: config.contacts,
        message: config.alertMessage,
        location
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send SMS alerts');
    }
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  };

  const logCrisisEvent = (triggerType: string, indicators?: string[]) => {
    const event = {
      type: 'crisis_alert',
      triggerType,
      indicators,
      timestamp: Date.now(),
      alertSent: true,
      contactsNotified: config.contacts.length
    };
    
    // Store in local storage for history
    const history = JSON.parse(localStorage.getItem('crisis_history') || '[]');
    history.push(event);
    localStorage.setItem('crisis_history', JSON.stringify(history.slice(-50))); // Keep last 50 events
  };

  const cancelCrisisAlert = () => {
    setIsInCrisis(false);
    setAlertSent(false);
  };

  const addEmergencyContact = () => {
    const newContact: CrisisContact = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      relationship: '',
      isPrimary: config.contacts.length === 0
    };
    
    setConfig(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  const updateContact = (id: string, field: keyof CrisisContact, value: any) => {
    setConfig(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeContact = (id: string) => {
    setConfig(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== id)
    }));
  };

  const testCrisisAlert = async () => {
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId') || 'default';
      
      await pushNotificationService.sendCrisisNotification(userId, {
        type: 'test',
        message: 'This is a test crisis alert. No action needed.',
        urgency: 'low'
      });
      
      alert('Test crisis alert sent successfully!');
    } catch (error) {
      console.error('Failed to send test alert:', error);
      alert('Failed to send test alert. Please check your notification settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Crisis Alert Button (Always Visible) */}
      <button
        className={`crisis-alert-button ${isInCrisis ? 'active' : ''}`}
        onClick={() => setShowConfig(!showConfig)}
        aria-label="Crisis Alert Settings"
      >
        <AlertIcon />
        {isInCrisis && <span className="crisis-indicator">Crisis Mode Active</span>}
      </button>

      {/* Crisis Alert Panel */}
      {showConfig && (
        <div className="crisis-alert-panel">
          <div className="panel-header">
            <h2>
              <AlertIcon />
              Crisis Alert System
            </h2>
            <button 
              className="close-btn"
              onClick={() => setShowConfig(false)}
            >
              ✕
            </button>
          </div>

          {/* Quick Actions */}
          {config.enabled && !alertSent && (
            <div className="quick-actions">
              <button
                className="btn-crisis-now"
                onClick={() => triggerCrisisAlert('manual')}
                disabled={loading}
              >
                <AlertIcon />
                {loading ? 'Sending Alert...' : 'Send Crisis Alert Now'}
              </button>
              
              <div className="action-buttons">
                <button className="btn-call-hotline">
                  <PhoneIcon />
                  Call Hotline
                </button>
                <button className="btn-chat-support">
                  <MessageIcon />
                  Chat Support
                </button>
              </div>
            </div>
          )}

          {alertSent && (
            <div className="alert-sent-confirmation">
              <HeartIcon />
              <h3>Alert Sent Successfully</h3>
              <p>Your support team has been notified.</p>
              <button onClick={cancelCrisisAlert}>Cancel Alert</button>
            </div>
          )}

          {/* Configuration */}
          <div className="configuration-section">
            <h3>Configuration</h3>
            
            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                />
                Enable Crisis Alert System
              </label>
            </div>

            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.autoAlert}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoAlert: e.target.checked }))}
                  disabled={!config.enabled}
                />
                Auto-send alerts when crisis is detected
              </label>
            </div>

            <div className="config-item">
              <label>Alert Threshold</label>
              <select
                value={config.alertThreshold}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  alertThreshold: e.target.value as 'low' | 'medium' | 'high'
                }))}
                disabled={!config.enabled || !config.autoAlert}
              >
                <option value="low">Low (More Sensitive)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Less Sensitive)</option>
              </select>
            </div>

            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.locationSharing}
                  onChange={(e) => setConfig(prev => ({ ...prev, locationSharing: e.target.checked }))}
                  disabled={!config.enabled}
                />
                Share location with emergency contacts
              </label>
            </div>

            <div className="config-item">
              <label>Alert Message</label>
              <textarea
                value={config.alertMessage}
                onChange={(e) => setConfig(prev => ({ ...prev, alertMessage: e.target.value }))}
                disabled={!config.enabled}
                rows={3}
              />
            </div>

            {/* Emergency Contacts */}
            <div className="emergency-contacts">
              <div className="contacts-header">
                <h4>Emergency Contacts</h4>
                <button 
                  className="btn-add-contact"
                  onClick={addEmergencyContact}
                  disabled={!config.enabled}
                >
                  Add Contact
                </button>
              </div>
              
              {config.contacts.map(contact => (
                <div key={contact.id} className="contact-item">
                  <input
                    type="text"
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                    disabled={!config.enabled}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={contact.phone}
                    onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                    disabled={!config.enabled}
                  />
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={contact.relationship}
                    onChange={(e) => updateContact(contact.id, 'relationship', e.target.value)}
                    disabled={!config.enabled}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={contact.isPrimary}
                      onChange={(e) => updateContact(contact.id, 'isPrimary', e.target.checked)}
                      disabled={!config.enabled}
                    />
                    Primary
                  </label>
                  <button
                    className="btn-remove-contact"
                    onClick={() => removeContact(contact.id)}
                    disabled={!config.enabled}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Save and Test */}
            <div className="config-actions">
              <button 
                className="btn-save"
                onClick={saveConfiguration}
              >
                Save Configuration
              </button>
              <button 
                className="btn-test"
                onClick={testCrisisAlert}
                disabled={!config.enabled || loading}
              >
                Send Test Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};