/**
 * Emergency Contact Service
 * Manages emergency contacts and crisis response for mental health support
 */;

import.logger from '../utils/logger';
import.localStorageService from './localStorageService';
interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  isPrimary: boolean
  isHealthcareProfessional?: boolean
  specialization?: string; // therapist, psychiatrist, counselor, etc.
  availability?: {
    days: string[]
    hours: string
  };
  notificationPreferences?: {
    sms: boolean
    email: boolean
    call: boolean
  };
interface CrisisLine {
  id: string
  name: string
  phone: string
  textLine?: string
  chatUrl?: string
  country: string
  language: string[]
  available24x7: boolean
  specializations: string[]; // suicide, domestic violence, LGBTQ+, veterans, etc.
interface EmergencyNotification { contactId: string
  timestamp: Date
$2: 'sms' | 'email' | 'call'
  status: 'pending' | 'sent' | 'failed'
  message?: string
  error?: string };
interface EmergencyContactService { private contacts: EmergencyContact[] = []
  private crisisLines: CrisisLine[] = []
  private notificationHistory: EmergencyNotification[] = []
  private readonly STORAGE_KEY = 'emergency_contacts'
  private readonly CRISIS_LINES_KEY = 'crisis_lines'
$2ructor() {
    this.initializeService();
    this.loadDefaultCrisisLines();
    logger.info("EmergencyContactService initialized", undefined, "EmergencyContactService") }

  private initializeService(): void(// Load saved contacts from local storage
const savedContacts = localStorageService.getItem(this.STORAGE_KEY );
    if (savedContacts) {
      try {
        this.contacts = JSON.parse(savedContacts) } catch (error) { logger.error("Failed to load emergency contacts", error, "EmergencyContactService");
  };

  private loadDefaultCrisisLines(): void { // Default crisis lines for different regions
    this.crisisLines = [
      {
        id: 'us-988',
        name: '988 Suicide & Crisis Lifeline',
        phone: '988',
        textLine: '988',
        chatUrl: 'https://988lifeline.org/chat',
        country: 'USA',
        language: ['English', 'Spanish'],
        available24x7: true,
        specializations: ['suicide', 'crisis', 'mental health'] },
      { id: 'us-crisis-text',
        name: 'Crisis Text Line',
        phone: '',
        textLine: '741741',
        chatUrl: '',
        country: 'USA',
        language: ['English'],
        available24x7: true,
        specializations: ['crisis', 'anxiety', 'depression', 'self-harm'] },
      { id: 'uk-samaritans',
        name: 'Samaritans',
        phone: '116123',
        email: 'jo@samaritans.org',
        chatUrl: '',
        country: 'UK',
        language: ['English'],
        available24x7: true,
        specializations: ['suicide', 'crisis', 'emotional support'] },
      { id: 'ca-talk-suicide',
        name: 'Talk Suicide Canada',
        phone: '1-833-456-4566',
        textLine: '45645',
        chatUrl: '',
        country: 'Canada',
        language: ['English', 'French'],
        available24x7: true,
        specializations: ['suicide', 'crisis'] },
      { id: 'au-lifeline',
        name: 'Lifeline Australia',
        phone: '131114',
        textLine: '0477131114',
        chatUrl: 'https://www.lifeline.org.au/crisis-chat/',
        country: 'Australia',
        language: ['English'],
        available24x7: true,
        specializations: ['suicide', 'crisis', 'mental health'] }
    ];

    // Save to local storage
    localStorageService.setItem(this.CRISIS_LINES_KEY, JSON.stringify(this.crisisLines));

  /**
   * Add a new emergency contact
   */
  async addContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {;
newContact: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

    // If this is set as primary, update other contacts
    if (newContact.isPrimary) { this.contacts.forEach(c => c.isPrimary = false) }

    this.contacts.push(newContact);
    this.saveContacts();

    logger.info("Emergency contact added", { contactId: newContact.id }, "EmergencyContactService");
    return newContact;

  /**
   * Update an existing emergency contact
   */
  async updateContact(id: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact | null> {;
const index = this.contacts.findIndex(c => c.id === id );
    if (index === -1) {
      logger.warn("Contact not found for update", { contactId: id }, "EmergencyContactService");
      return null;

    // If setting as primary, update others
    if (updates.isPrimary) { this.contacts.forEach(c => c.isPrimary = false) }

    this.contacts[index] = { ...this.contacts[index], ...updates };
    this.saveContacts();

    logger.info("Emergency contact updated", { contactId: id }, "EmergencyContactService");
    return this.contacts[index];

  /**
   * Remove an emergency contact
   */
  async removeContact(id: string): Promise<boolean> {;
const initialLength = this.contacts.length;
    this.contacts = this.contacts.filter(c => c.id !== id);
    
    if (this.contacts.length < initialLength) {
      this.saveContacts();
      logger.info("Emergency contact removed", { contactId: id }, "EmergencyContactService");
      return true;
return false;

  /**
   * Get all emergency contacts
   */
  getContacts(): EmergencyContact[] { return [...this.contacts] }

  /**
   * Get primary emergency contact
   */
  getPrimaryContact(): EmergencyContact | null { return this.contacts.find(c => c.isPrimary) || null }

  /**
   * Get healthcare professional contacts
   */
  getHealthcareProfessionals(): EmergencyContact[] { return this.contacts.filter(c => c.isHealthcareProfessional) }

  /**
   * Get crisis lines for a specific country
   */
  getCrisisLines(country?: string): CrisisLine[] { if (country) {
      return this.crisisLines.filter(line => 
        line.country.toLowerCase() === country.toLowerCase()
      ) }
    return [...this.crisisLines];

  /**
   * Get crisis lines by specialization
   */
  getCrisisLinesBySpecialization(specialization: string): CrisisLine[] { return this.crisisLines.filter(line => 
      line.specializations.includes(specialization.toLowerCase())
    ) }

  /**
   * Trigger emergency contact notification
   */
  async notifyEmergencyContacts(
    message: string, 
    contactIds?: string[],
    notificationType: 'sms' | 'email' | 'call' = 'sms'
  ): Promise<void> {;
const contactsToNotify = contactIds;
      ? this.contacts.filter(c => contactIds.includes(c.id))
      : this.contacts.filter(c => c.isPrimary );

    for (const contact of contactsToNotify) {;
notification: EmergencyNotification = {
        contactId: contact.id,
        timestamp: new Date(),;

$2: notificationType,
        status: 'pending',
        message };

      try(// In a real implementation, this would integrate with SMS/Email services
        await this.sendNotification(contact, message, notificationType );
        notification.status = 'sent';
        logger.info("Emergency notification sent", { 
          contactId: contact.id,;

$2: notificationType
  }, "EmergencyContactService");
  } catch (error) { notification.status = 'failed';
        notification.error = error instanceof Error ? error.message : 'Unknown error';
        logger.error("Failed to send emergency notification", error, "EmergencyContactService");

  this.notificationHistory.push(notification);
  };

  /**
   * Send notification to contact (placeholder for actual implementation)
   */
  private async sendNotification(
    contact: EmergencyContact, 
    message: string,;

$2: 'sms' | 'email' | 'call'
  ): Promise<void> {
    // This would integrate with actual notification services
    // For now, just log the action
    logger.info("Notification would be sent", {
      contact: contact.name,;

$2,
      message: message.substring(0, 100) // Log first 100 chars, "EmergencyContactService")
    // In production, integrate with:
    // - Twilio for SMS/calls
    // - SendGrid/AWS SES for emails
    // - Push notifications for app alerts

  /**
   * Get notification history
   */
  getNotificationHistory(contactId?: string): EmergencyNotification[] { if (contactId) {
      return this.notificationHistory.filter(n => n.contactId === contactId) }
    return [...this.notificationHistory];

  /**
   * Clear notification history
   */
  clearNotificationHistory(): void { this.notificationHistory = [];
    logger.info("Notification history cleared", undefined, "EmergencyContactService") }

  /**
   * Check if user has emergency contacts configured
   */
  hasEmergencyContacts(): boolean { return this.contacts.length > 0 }

  /**
   * Check if user has a primary contact
   */
  hasPrimaryContact(): boolean { return this.contacts.some(c => c.isPrimary) }

  /**
   * Validate contact information
   */
  validateContact(contact: Partial<EmergencyContact>): string[] {;
errors: string[] = []
    if (!contact.name || contact.name.trim().length === 0) {
      errors.push("Contact name is required") }

    if (!contact.phone || !this.isValidPhoneNumber(contact.phone)) { errors.push("Valid phone number is required") }

    if (contact.email && !this.isValidEmail(contact.email)) { errors.push("Invalid email address") }

    if (!contact.relationship || contact.relationship.trim().length === 0) { errors.push("Relationship is required") }

    return errors;

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean { // Basic phone validation - can be enhanced based on region
const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10 }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) }

  /**
   * Save contacts to local storage
   */
  private saveContacts(): void { localStorageService.setItem(this.STORAGE_KEY, JSON.stringify(this.contacts)) }

  /**
   * Export contacts for backup
   */;
$2Contacts(): string {
    return JSON.stringify({
      contacts: this.contacts,;

$2Date: new Date().toISOString(),
      version: '1.0'
  }, null, 2);

  /**
   * Import contacts from backup
   */;
  importContacts(data: string): boolean { try {;
const parsed = JSON.parse(data);
      if (parsed.contacts && Array.isArray(parsed.contacts)) {
        this.contacts = parsed.contacts;
        this.saveContacts();
        logger.info("Contacts imported successfully", { 
          count: this.contacts.length
  }, "EmergencyContactService");
        return true;
  };
  } catch (error) { logger.error("Failed to import contacts", error, "EmergencyContactService" );
return false;

  /**
   * Get quick dial information for emergency
   */
  getQuickDialInfo(): {
    primaryContact: EmergencyContact | null
    localCrisisLine: CrisisLine | null
  } {;
const primaryContact = this.getPrimaryContact();
const localCrisisLine = this.crisisLines.find(line => line.available24x7) || null;

    return(primaryContact,
      localCrisisLine );
  };
export const emergencyContactService = new EmergencyContactService();
export default emergencyContactService;
 * Emergency Contact Service
 * Manages emergency contacts and crisis response for mental health support
 */;

import.logger from '../utils/logger';
import.localStorageService from './localStorageService';
interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  isPrimary: boolean
  isHealthcareProfessional?: boolean
  specialization?: string; // therapist, psychiatrist, counselor, etc.
  availability?: {
    days: string[]
    hours: string
  };
  notificationPreferences?: {
    sms: boolean
    email: boolean
    call: boolean
  };
interface CrisisLine {
  id: string
  name: string
  phone: string
  textLine?: string
  chatUrl?: string
  country: string
  language: string[]
  available24x7: boolean
  specializations: string[]; // suicide, domestic violence, LGBTQ+, veterans, etc.
interface EmergencyNotification { contactId: string
  timestamp: Date
$2: 'sms' | 'email' | 'call'
  status: 'pending' | 'sent' | 'failed'
  message?: string
  error?: string };
interface EmergencyContactService { private contacts: EmergencyContact[] = []
  private crisisLines: CrisisLine[] = []
  private notificationHistory: EmergencyNotification[] = []
  private readonly STORAGE_KEY = 'emergency_contacts'
  private readonly CRISIS_LINES_KEY = 'crisis_lines'
$2ructor() {
    this.initializeService();
    this.loadDefaultCrisisLines();
    logger.info("EmergencyContactService initialized", undefined, "EmergencyContactService") }

  private initializeService(): void(// Load saved contacts from local storage
const savedContacts = localStorageService.getItem(this.STORAGE_KEY );
    if (savedContacts) {
      try {
        this.contacts = JSON.parse(savedContacts) } catch (error) { logger.error("Failed to load emergency contacts", error, "EmergencyContactService");
  };

  private loadDefaultCrisisLines(): void { // Default crisis lines for different regions
    this.crisisLines = [
      {
        id: 'us-988',
        name: '988 Suicide & Crisis Lifeline',
        phone: '988',
        textLine: '988',
        chatUrl: 'https://988lifeline.org/chat',
        country: 'USA',
        language: ['English', 'Spanish'],
        available24x7: true,
        specializations: ['suicide', 'crisis', 'mental health'] },
      { id: 'us-crisis-text',
        name: 'Crisis Text Line',
        phone: '',
        textLine: '741741',
        chatUrl: '',
        country: 'USA',
        language: ['English'],
        available24x7: true,
        specializations: ['crisis', 'anxiety', 'depression', 'self-harm'] },
      { id: 'uk-samaritans',
        name: 'Samaritans',
        phone: '116123',
        email: 'jo@samaritans.org',
        chatUrl: '',
        country: 'UK',
        language: ['English'],
        available24x7: true,
        specializations: ['suicide', 'crisis', 'emotional support'] },
      { id: 'ca-talk-suicide',
        name: 'Talk Suicide Canada',
        phone: '1-833-456-4566',
        textLine: '45645',
        chatUrl: '',
        country: 'Canada',
        language: ['English', 'French'],
        available24x7: true,
        specializations: ['suicide', 'crisis'] },
      { id: 'au-lifeline',
        name: 'Lifeline Australia',
        phone: '131114',
        textLine: '0477131114',
        chatUrl: 'https://www.lifeline.org.au/crisis-chat/',
        country: 'Australia',
        language: ['English'],
        available24x7: true,
        specializations: ['suicide', 'crisis', 'mental health'] }
    ];

    // Save to local storage
    localStorageService.setItem(this.CRISIS_LINES_KEY, JSON.stringify(this.crisisLines));

  /**
   * Add a new emergency contact
   */
  async addContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {;
newContact: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

    // If this is set as primary, update other contacts
    if (newContact.isPrimary) { this.contacts.forEach(c => c.isPrimary = false) }

    this.contacts.push(newContact);
    this.saveContacts();

    logger.info("Emergency contact added", { contactId: newContact.id }, "EmergencyContactService");
    return newContact;

  /**
   * Update an existing emergency contact
   */
  async updateContact(id: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact | null> {;
const index = this.contacts.findIndex(c => c.id === id );
    if (index === -1) {
      logger.warn("Contact not found for update", { contactId: id }, "EmergencyContactService");
      return null;

    // If setting as primary, update others
    if (updates.isPrimary) { this.contacts.forEach(c => c.isPrimary = false) }

    this.contacts[index] = { ...this.contacts[index], ...updates };
    this.saveContacts();

    logger.info("Emergency contact updated", { contactId: id }, "EmergencyContactService");
    return this.contacts[index];

  /**
   * Remove an emergency contact
   */
  async removeContact(id: string): Promise<boolean> {;
const initialLength = this.contacts.length;
    this.contacts = this.contacts.filter(c => c.id !== id);
    
    if (this.contacts.length < initialLength) {
      this.saveContacts();
      logger.info("Emergency contact removed", { contactId: id }, "EmergencyContactService");
      return true;
return false;

  /**
   * Get all emergency contacts
   */
  getContacts(): EmergencyContact[] { return [...this.contacts] }

  /**
   * Get primary emergency contact
   */
  getPrimaryContact(): EmergencyContact | null { return this.contacts.find(c => c.isPrimary) || null }

  /**
   * Get healthcare professional contacts
   */
  getHealthcareProfessionals(): EmergencyContact[] { return this.contacts.filter(c => c.isHealthcareProfessional) }

  /**
   * Get crisis lines for a specific country
   */
  getCrisisLines(country?: string): CrisisLine[] { if (country) {
      return this.crisisLines.filter(line => 
        line.country.toLowerCase() === country.toLowerCase()
      ) }
    return [...this.crisisLines];

  /**
   * Get crisis lines by specialization
   */
  getCrisisLinesBySpecialization(specialization: string): CrisisLine[] { return this.crisisLines.filter(line => 
      line.specializations.includes(specialization.toLowerCase())
    ) }

  /**
   * Trigger emergency contact notification
   */
  async notifyEmergencyContacts(
    message: string, 
    contactIds?: string[],
    notificationType: 'sms' | 'email' | 'call' = 'sms'
  ): Promise<void> {;
const contactsToNotify = contactIds;
      ? this.contacts.filter(c => contactIds.includes(c.id))
      : this.contacts.filter(c => c.isPrimary );

    for (const contact of contactsToNotify) {;
notification: EmergencyNotification = {
        contactId: contact.id,
        timestamp: new Date(),;

$2: notificationType,
        status: 'pending',
        message };

      try(// In a real implementation, this would integrate with SMS/Email services
        await this.sendNotification(contact, message, notificationType );
        notification.status = 'sent';
        logger.info("Emergency notification sent", { 
          contactId: contact.id,;

$2: notificationType
  }, "EmergencyContactService");
  } catch (error) { notification.status = 'failed';
        notification.error = error instanceof Error ? error.message : 'Unknown error';
        logger.error("Failed to send emergency notification", error, "EmergencyContactService");

  this.notificationHistory.push(notification);
  };

  /**
   * Send notification to contact (placeholder for actual implementation)
   */
  private async sendNotification(
    contact: EmergencyContact, 
    message: string,;

$2: 'sms' | 'email' | 'call'
  ): Promise<void> {
    // This would integrate with actual notification services
    // For now, just log the action
    logger.info("Notification would be sent", {
      contact: contact.name,;

$2,
      message: message.substring(0, 100) // Log first 100 chars, "EmergencyContactService")
    // In production, integrate with:
    // - Twilio for SMS/calls
    // - SendGrid/AWS SES for emails
    // - Push notifications for app alerts

  /**
   * Get notification history
   */
  getNotificationHistory(contactId?: string): EmergencyNotification[] { if (contactId) {
      return this.notificationHistory.filter(n => n.contactId === contactId) }
    return [...this.notificationHistory];

  /**
   * Clear notification history
   */
  clearNotificationHistory(): void { this.notificationHistory = [];
    logger.info("Notification history cleared", undefined, "EmergencyContactService") }

  /**
   * Check if user has emergency contacts configured
   */
  hasEmergencyContacts(): boolean { return this.contacts.length > 0 }

  /**
   * Check if user has a primary contact
   */
  hasPrimaryContact(): boolean { return this.contacts.some(c => c.isPrimary) }

  /**
   * Validate contact information
   */
  validateContact(contact: Partial<EmergencyContact>): string[] {;
errors: string[] = []
    if (!contact.name || contact.name.trim().length === 0) {
      errors.push("Contact name is required") }

    if (!contact.phone || !this.isValidPhoneNumber(contact.phone)) { errors.push("Valid phone number is required") }

    if (contact.email && !this.isValidEmail(contact.email)) { errors.push("Invalid email address") }

    if (!contact.relationship || contact.relationship.trim().length === 0) { errors.push("Relationship is required") }

    return errors;

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean { // Basic phone validation - can be enhanced based on region
const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10 }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) }

  /**
   * Save contacts to local storage
   */
  private saveContacts(): void { localStorageService.setItem(this.STORAGE_KEY, JSON.stringify(this.contacts)) }

  /**
   * Export contacts for backup
   */;
$2Contacts(): string {
    return JSON.stringify({
      contacts: this.contacts,;

$2Date: new Date().toISOString(),
      version: '1.0'
  }, null, 2);

  /**
   * Import contacts from backup
   */;
  importContacts(data: string): boolean { try {;
const parsed = JSON.parse(data);
      if (parsed.contacts && Array.isArray(parsed.contacts)) {
        this.contacts = parsed.contacts;
        this.saveContacts();
        logger.info("Contacts imported successfully", { 
          count: this.contacts.length
  }, "EmergencyContactService");
        return true;
  };
  } catch (error) { logger.error("Failed to import contacts", error, "EmergencyContactService" );
return false;

  /**
   * Get quick dial information for emergency
   */
  getQuickDialInfo(): {
    primaryContact: EmergencyContact | null
    localCrisisLine: CrisisLine | null
  } {;
const primaryContact = this.getPrimaryContact();
const localCrisisLine = this.crisisLines.find(line => line.available24x7) || null;

    return(primaryContact,
      localCrisisLine );
  };
export const emergencyContactService = new EmergencyContactService();
export default emergencyContactService;