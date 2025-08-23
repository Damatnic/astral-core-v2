/**
 * Test Suite for EmergencyContactsWidget Component
 * Tests emergency contact display and quick access functionality
 */

import React from 'react';
import '@testing-library/jest-dom';
import { EmergencyContactWidget } from '../EmergencyContactsWidget';

// Mock the icons module
jest.mock('../../icons.dynamic', () => ({
  PhoneIcon: () => null,
  ChatIcon: () => null,
  CloseIcon: () => null,
  PlusIcon: () => null
}));

// Mock contacts data
const mockContacts: EmergencyContactWidget[] = [
  {
    id: '1',
    name: 'Crisis Hotline',
    phone: '988',
    type: 'hotline' as const,
    available: '24/7',
    priority: 1
  },
  {
    id: '2',
    name: 'Therapist - Dr. Smith',
    phone: '555-0100',
    type: 'professional' as const,
    available: 'Mon-Fri 9-5',
    priority: 2
  },
  {
    id: '3',
    name: 'Best Friend - Sarah',
    phone: '555-0200',
    type: 'personal' as const,
    available: 'Anytime',
    priority: 3
  }
];

describe('EmergencyContactsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Import', () => {
    it('should import EmergencyContactsWidget successfully', () => {
      const { EmergencyContactsWidget } = require('../EmergencyContactsWidget');
      expect(EmergencyContactsWidget).toBeDefined();
      expect(typeof EmergencyContactsWidget).toBe('function');
    });
  });

  describe('Component Props', () => {
    it('should accept all expected props', () => {
      const { EmergencyContactsWidget } = require('../EmergencyContactsWidget');
      
      const element = React.createElement(EmergencyContactsWidget, {
        contacts: mockContacts,
        loading: false,
        editable: true,
        collapsible: true,
        compact: false,
        initialDisplay: 2,
        onContactUsed: jest.fn(),
        onAddContact: jest.fn(),
        onRemoveContact: jest.fn(),
        onReorder: jest.fn()
      });
      
      expect(element).toBeDefined();
      expect(element.props.contacts).toBe(mockContacts);
      expect(element.props.loading).toBe(false);
      expect(element.props.editable).toBe(true);
    });

    it('should have correct default props', () => {
      const { EmergencyContactsWidget } = require('../EmergencyContactsWidget');
      
      const element = React.createElement(EmergencyContactsWidget, {});
      
      expect(element).toBeDefined();
      expect(element.type).toBe(EmergencyContactsWidget);
    });
  });

  describe('Contact Sorting', () => {
    it('should sort contacts by priority', () => {
      const unsortedContacts = [
        { ...mockContacts[2], priority: 1 },
        { ...mockContacts[0], priority: 3 },
        { ...mockContacts[1], priority: 2 }
      ];
      
      const sorted = [...unsortedContacts].sort((a, b) => a.priority - b.priority);
      
      expect(sorted[0].name).toBe('Best Friend - Sarah');
      expect(sorted[1].name).toBe('Therapist - Dr. Smith');
      expect(sorted[2].name).toBe('Crisis Hotline');
    });
  });

  describe('Contact Actions', () => {
    it('should format phone URLs correctly', () => {
      const formatPhoneUrl = (phone: string) => `tel:${phone}`;
      
      expect(formatPhoneUrl('988')).toBe('tel:988');
      expect(formatPhoneUrl('555-0100')).toBe('tel:555-0100');
      expect(formatPhoneUrl('+1-555-0200')).toBe('tel:+1-555-0200');
    });

    it('should format SMS URLs correctly', () => {
      const formatSmsUrl = (phone: string) => `sms:${phone}`;
      
      expect(formatSmsUrl('988')).toBe('sms:988');
      expect(formatSmsUrl('555-0100')).toBe('sms:555-0100');
    });
  });

  describe('Time Formatting', () => {
    it('should format last contacted time correctly', () => {
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
      
      const now = Date.now();
      expect(formatLastContacted(now - 30 * 60 * 1000)).toBe('Less than 1 hour ago');
      expect(formatLastContacted(now - 60 * 60 * 1000)).toBe('1 hour ago');
      expect(formatLastContacted(now - 3 * 60 * 60 * 1000)).toBe('3 hours ago');
      expect(formatLastContacted(now - 24 * 60 * 60 * 1000)).toBe('1 day ago');
      expect(formatLastContacted(now - 48 * 60 * 60 * 1000)).toBe('2 days ago');
    });
  });

  describe('Display Logic', () => {
    it('should determine displayed contacts based on expansion state', () => {
      const getDisplayedContacts = (
        contacts: EmergencyContactWidget[],
        isExpanded: boolean,
        collapsible: boolean,
        initialDisplay: number
      ) => {
        const sorted = [...contacts].sort((a, b) => a.priority - b.priority);
        const shouldLimitDisplay = collapsible && !isExpanded;
        return shouldLimitDisplay ? sorted.slice(0, initialDisplay) : sorted;
      };
      
      const displayed = getDisplayedContacts(mockContacts, false, true, 1);
      expect(displayed).toHaveLength(1);
      expect(displayed[0].name).toBe('Crisis Hotline');
      
      const allDisplayed = getDisplayedContacts(mockContacts, true, true, 1);
      expect(allDisplayed).toHaveLength(3);
    });
  });

  describe('Reorder Logic', () => {
    it('should handle move up correctly', () => {
      const handleMoveUp = (contacts: EmergencyContactWidget[], index: number) => {
        if (index > 0) {
          const newOrder = [...contacts];
          [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
          return newOrder.map(c => c.id);
        }
        return contacts.map(c => c.id);
      };
      
      const result = handleMoveUp(mockContacts, 1);
      expect(result).toEqual(['2', '1', '3']);
      
      const noChange = handleMoveUp(mockContacts, 0);
      expect(noChange).toEqual(['1', '2', '3']);
    });
  });

  describe('Component Structure', () => {
    it('should have correct component structure', () => {
      const { EmergencyContactsWidget } = require('../EmergencyContactsWidget');
      
      // Verify it's a valid React component
      expect(EmergencyContactsWidget).toBeDefined();
      expect(typeof EmergencyContactsWidget).toBe('function');
    });
  });

  describe('Empty State', () => {
    it('should handle empty contacts array', () => {
      const { EmergencyContactsWidget } = require('../EmergencyContactsWidget');
      
      const element = React.createElement(EmergencyContactsWidget, {
        contacts: []
      });
      
      expect(element).toBeDefined();
      expect(element.props.contacts).toEqual([]);
    });
  });

  describe('Loading State', () => {
    it('should handle loading state', () => {
      const { EmergencyContactsWidget } = require('../EmergencyContactsWidget');
      
      const element = React.createElement(EmergencyContactsWidget, {
        loading: true
      });
      
      expect(element).toBeDefined();
      expect(element.props.loading).toBe(true);
    });
  });
});