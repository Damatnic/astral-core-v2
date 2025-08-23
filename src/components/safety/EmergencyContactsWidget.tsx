/**
 * EmergencyContactsWidget Component
 * Displays emergency contact list with quick access functionality
 */

import React, { useState, useEffect } from 'react';
import { PhoneIcon, ChatIcon, CloseIcon, PlusIcon } from '../icons.dynamic';

export interface EmergencyContactWidget {
  id: string;
  name: string;
  phone: string;
  type: 'hotline' | 'professional' | 'personal' | 'emergency';
  available: string;
  priority: number;
  lastContacted?: number;
}

export interface EmergencyContactsWidgetProps {
  contacts?: EmergencyContactWidget[];
  loading?: boolean;
  editable?: boolean;
  collapsible?: boolean;
  compact?: boolean;
  initialDisplay?: number;
  onContactUsed?: (data: { contactId: string; action: string; timestamp: number }) => void;
  onAddContact?: () => void;
  onRemoveContact?: (contactId: string) => void;
  onReorder?: (contactIds: string[]) => void;
}

export const EmergencyContactsWidget: React.FC<EmergencyContactsWidgetProps> = ({
  contacts = [],
  loading = false,
  editable = false,
  collapsible = false,
  compact = false,
  initialDisplay = 3,
  onContactUsed,
  onAddContact,
  onRemoveContact,
  onReorder
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [displayedContacts, setDisplayedContacts] = useState<EmergencyContactWidget[]>([]);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Sort contacts by priority
  const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority);

  useEffect(() => {
    const shouldLimitDisplay = collapsible && !isExpanded;
    const limitedContacts = shouldLimitDisplay 
      ? sortedContacts.slice(0, initialDisplay)
      : sortedContacts;
    setDisplayedContacts(limitedContacts);
  }, [contacts, isExpanded, collapsible, initialDisplay, sortedContacts]);

  const handleCall = (contact: EmergencyContactWidget) => {
    try {
      if (!contact.phone || contact.phone === 'invalid') {
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Unable to initiate call';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translateX(-50%)';
        errorDiv.style.background = '#f44336';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.zIndex = '9999';
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
        return;
      }
      window.location.href = `tel:${contact.phone}`;
      onContactUsed?.({
        contactId: contact.id,
        action: 'call',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  const handleText = (contact: EmergencyContactWidget) => {
    try {
      window.location.href = `sms:${contact.phone}`;
      onContactUsed?.({
        contactId: contact.id,
        action: 'text',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to initiate text:', error);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...sortedContacts];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      onReorder?.(newOrder.map(c => c.id));
    }
  };

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch (error) {
      console.error('Failed to copy phone number:', error);
    }
  };

  const formatLastContacted = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Less than 1 hour ago';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="emergency-contacts-widget" data-testid="emergency-contacts-widget">
        <div data-testid="loading-skeleton">Loading...</div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="emergency-contacts-widget" data-testid="emergency-contacts-widget">
        <h3>Emergency Contacts</h3>
        <div className="empty-state">
          <p>No emergency contacts added yet.</p>
          {editable && (
            <button 
              onClick={onAddContact}
              className="add-first-contact-btn"
            >
              Add your first contact
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section 
      className={`emergency-contacts-widget ${compact ? 'compact' : ''} ${window.innerWidth <= 768 ? 'mobile-layout' : ''}`}
      data-testid="emergency-contacts-widget"
      aria-label="Emergency contacts"
      role="region"
    >
      <div className="widget-header">
        <h3>Emergency Contacts</h3>
        {editable && (
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="edit-btn"
          >
            <span>📝</span>
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      {isEditMode && (
        <div className="edit-header">
          <h4>Edit Contacts</h4>
          {onAddContact && (
            <button onClick={onAddContact} className="add-contact-btn">
              <PlusIcon size={16} />
              Add Contact
            </button>
          )}
        </div>
      )}

      <div className="contacts-list">
        {displayedContacts.map((contact, index) => (
          <div
            key={contact.id}
            data-testid={`contact-${index}`}
            className={`contact-item ${contact.priority === 1 ? 'high-priority' : ''} ${
              window.innerWidth <= 768 ? 'touch-target' : ''
            }`}
          >
            <div className="contact-info">
              <div className="contact-header">
                <span data-testid="contact-name" className="contact-name">
                  {contact.name}
                </span>
                <span className="contact-type" data-testid={`icon-${contact.type}`}>
                  {contact.type}
                </span>
              </div>
              
              {!compact && (
                <div className="contact-details">
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="contact-phone" aria-label={contact.phone}>
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="contact-phone">No phone number</span>
                  )}
                  <span className="contact-availability" aria-label={`Available ${contact.available}`}>
                    {contact.available}
                  </span>
                  {contact.lastContacted && (
                    <span className="last-contacted">
                      Last contacted: {formatLastContacted(contact.lastContacted)}
                    </span>
                  )}
                </div>
              )}

              {compact && (
                <span className="contact-phone">
                  {contact.phone || 'No phone number'}
                </span>
              )}
            </div>

            <div className="contact-actions">
              {isEditMode ? (
                <>
                  {index > 0 && (
                    <button
                      onClick={() => handleMoveUp(index)}
                      className="move-up-btn"
                      aria-label="Move up"
                    >
                      <span>⬆️</span>
                    </button>
                  )}
                  {onRemoveContact && (
                    <button
                      onClick={() => onRemoveContact(contact.id)}
                      className="remove-btn"
                      aria-label="Remove"
                    >
                      <CloseIcon size={16} />
                      Remove
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleCall(contact)}
                    className="call-btn touch-target"
                    aria-label={`Call ${contact.name}`}
                  >
                    <PhoneIcon size={16} />
                    Call
                  </button>
                  
                  {contact.type === 'hotline' && (
                    <button
                      onClick={() => handleText(contact)}
                      className="text-btn"
                      aria-label={`Text ${contact.name}`}
                    >
                      <ChatIcon size={16} />
                      Text
                    </button>
                  )}
                  
                  {contact.phone && (
                    <button
                      onClick={() => handleCopyPhone(contact.phone)}
                      className="copy-btn"
                      aria-label={`Copy phone number`}
                    >
                      {copiedPhone === contact.phone ? (
                        <span>Copied!</span>
                      ) : (
                        <span>Copy</span>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {collapsible && contacts.length > initialDisplay && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-btn"
        >
          {isExpanded ? (
            <>
              <span>⬆️</span>{' '}
              Show less
            </>
          ) : (
            <>
              <span>⬇️</span>{' '}
              Show all ({contacts.length - initialDisplay} more)
            </>
          )}
        </button>
      )}
    </section>
  );
};

export default EmergencyContactsWidget;
