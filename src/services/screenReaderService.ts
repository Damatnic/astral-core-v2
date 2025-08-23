/**
 * @fileoverview Advanced Screen Reader Service
 * Enhanced screen reader support with mental health-specific features
 * Provides live regions, descriptive announcements, and crisis-aware messaging
 * 
 * @license Apache-2.0
 */

export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  type: 'navigation' | 'status' | 'error' | 'crisis' | 'success' | 'warning';
  context?: string; // Additional context for the announcement
  persistent?: boolean; // Keep the announcement in the live region
  delay?: number; // Delay before announcement (ms)
}

export interface ElementDescription {
  element: HTMLElement;
  role: string;
  name: string;
  description?: string;
  state?: string;
  position?: string; // "1 of 5" style position info
  shortcuts?: string[]; // Available keyboard shortcuts
}

class ScreenReaderService {
  private isInitialized = false;
  private liveRegions: Map<string, HTMLElement> = new Map();
  private announcementQueue: ScreenReaderAnnouncement[] = [];
  private isProcessingQueue = false;
  private lastAnnouncement = '';
  private announcementHistory: string[] = [];
  
  // Mental health specific contexts
  private crisisContext = {
    isActive: false,
    severity: 'low' as 'low' | 'medium' | 'high',
    interventionType: 'none' as 'none' | 'helper' | 'ai' | 'emergency'
  };

  /**
   * Initialize screen reader service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.setupLiveRegions();
      this.setupElementDescriptions();
      this.setupNavigationAnnouncements();
      this.setupCrisisAnnouncements();
      
      this.isInitialized = true;
      console.log('[ScreenReader] Service initialized');
      
      // Welcome announcement
      this.announce({
        message: 'Screen reader enhanced. Mental health support features are active.',
        priority: 'medium',
        type: 'status',
        delay: 1000
      });
    } catch (error) {
      console.error('[ScreenReader] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup enhanced live regions for different announcement types
   */
  private setupLiveRegions(): void {
    const regions = [
      {
        id: 'sr-navigation',
        politeness: 'polite',
        label: 'Navigation announcements',
        description: 'Page navigation and location updates'
      },
      {
        id: 'sr-status',
        politeness: 'polite',
        label: 'Status updates',
        description: 'General status and progress information'
      },
      {
        id: 'sr-alerts',
        politeness: 'assertive',
        label: 'Important alerts',
        description: 'Important notifications and warnings'
      },
      {
        id: 'sr-crisis',
        politeness: 'assertive',
        label: 'Crisis notifications',
        description: 'Emergency and crisis-related announcements'
      },
      {
        id: 'sr-forms',
        politeness: 'polite',
        label: 'Form assistance',
        description: 'Form validation and input assistance'
      }
    ];

    regions.forEach(region => {
      let element = document.getElementById(region.id);
      if (!element) {
        element = document.createElement('div');
        element.id = region.id;
        element.setAttribute('aria-live', region.politeness);
        element.setAttribute('aria-label', region.label);
        element.setAttribute('aria-description', region.description);
        element.setAttribute('aria-relevant', 'additions text');
        element.setAttribute('aria-atomic', 'false');
        element.style.cssText = `
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        `;
        document.body.appendChild(element);
      }
      this.liveRegions.set(region.id, element);
    });
  }

  /**
   * Enhanced element descriptions with mental health context
   */
  private setupElementDescriptions(): void {
    // Add aria-descriptions to critical elements
    this.enhanceElementsWithDescriptions();
    
    // Monitor DOM changes for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.enhanceElementWithDescription(node as HTMLElement);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Enhance elements with descriptive aria labels
   */
  private enhanceElementsWithDescriptions(): void {
    // Crisis buttons
    const crisisButtons = document.querySelectorAll('[data-crisis], .crisis-button, .emergency-button');
    crisisButtons.forEach((button) => {
      this.enhanceElementWithDescription(button as HTMLElement, {
        role: 'button',
        context: 'crisis',
        urgency: 'high'
      });
    });

    // Helper chat elements
    const chatElements = document.querySelectorAll('[data-chat], .chat-message, .helper-message');
    chatElements.forEach((element) => {
      this.enhanceElementWithDescription(element as HTMLElement, {
        role: 'chat',
        context: 'support',
        dynamic: true
      });
    });

    // Navigation elements
    const navElements = document.querySelectorAll('nav, [role="navigation"], .sidebar, .menu');
    navElements.forEach((element) => {
      this.enhanceElementWithDescription(element as HTMLElement, {
        role: 'navigation',
        context: 'main'
      });
    });

    // Form elements
    const formElements = document.querySelectorAll('input, textarea, select, button[type="submit"]');
    formElements.forEach((element) => {
      this.enhanceFormElement(element as HTMLElement);
    });
  }

  /**
   * Enhance individual element with appropriate description
   */
  private enhanceElementWithDescription(
    element: HTMLElement,
    options: {
      role?: string;
      context?: string;
      urgency?: 'low' | 'medium' | 'high';
      dynamic?: boolean;
    } = {}
  ): void {
    if (!element || element.hasAttribute('aria-description')) return;

    const { role, context, urgency, dynamic } = options;
    let description = '';

    // Generate context-aware descriptions
    switch (context) {
      case 'crisis':
        description = this.generateCrisisDescription(element, urgency);
        break;
      case 'support':
        description = this.generateSupportDescription(element);
        break;
      case 'main':
        description = this.generateNavigationDescription(element);
        break;
      default:
        description = this.generateGeneralDescription(element, role);
    }

    if (description) {
      element.setAttribute('aria-description', description);
      
      // Add role if not present
      if (role && !element.getAttribute('role')) {
        element.setAttribute('role', role);
      }

      // Mark dynamic content
      if (dynamic) {
        element.setAttribute('aria-live', 'polite');
      }
    }
  }

  /**
   * Generate crisis-specific descriptions
   */
  private generateCrisisDescription(element: HTMLElement, urgency = 'medium'): string {
    const baseText = element.textContent?.trim() || '';
    const urgencyText = urgency === 'high' ? 'Emergency action: ' : 'Crisis support: ';
    
    if (element.classList.contains('crisis-button') || element.dataset.crisis) {
      return `${urgencyText}${baseText}. Provides immediate access to crisis resources and emergency support.`;
    }
    
    if (element.classList.contains('emergency-button')) {
      return `Emergency action: ${baseText}. Connects you directly to emergency services and crisis counselors.`;
    }
    
    return `${urgencyText}${baseText}. Part of the crisis support system.`;
  }

  /**
   * Generate support-specific descriptions
   */
  private generateSupportDescription(element: HTMLElement): string {
    const baseText = element.textContent?.trim() || '';
    
    if (element.classList.contains('helper-message')) {
      return `Helper message: ${baseText}. From a trained peer support specialist.`;
    }
    
    if (element.classList.contains('ai-message')) {
      return `AI assistant: ${baseText}. Supportive guidance from our mental health AI.`;
    }
    
    if (element.classList.contains('chat-message')) {
      return `Support message: ${baseText}. Part of your ongoing conversation.`;
    }
    
    return `Support element: ${baseText}. Provides mental health assistance.`;
  }

  /**
   * Generate navigation descriptions
   */
  private generateNavigationDescription(element: HTMLElement): string {
    if (element.tagName === 'NAV' || element.getAttribute('role') === 'navigation') {
      return 'Main navigation menu. Use arrow keys to navigate between options.';
    }
    
    if (element.classList.contains('sidebar')) {
      return 'Sidebar navigation. Contains main application features and crisis resources.';
    }
    
    return 'Navigation element. Use Tab and arrow keys to navigate.';
  }

  /**
   * Generate general element descriptions
   */
  private generateGeneralDescription(element: HTMLElement, role?: string): string {
    const tag = element.tagName.toLowerCase();
    const actualRole = role || element.getAttribute('role') || tag;
    const text = element.textContent?.trim() || '';
    
    switch (actualRole) {
      case 'button':
        return `Button: ${text}. Press Enter or Space to activate.`;
      case 'link':
        return `Link: ${text}. Press Enter to follow.`;
      case 'tab':
        return `Tab: ${text}. Use arrow keys to navigate between tabs.`;
      case 'dialog':
        return `Dialog window: ${text}. Press Escape to close.`;
      case 'alert':
        return `Alert: ${text}. Important information.`;
      default:
        return text ? `${actualRole}: ${text}` : '';
    }
  }

  /**
   * Enhance form elements with helpful descriptions
   */
  private enhanceFormElement(element: HTMLElement): void {
    const input = element as HTMLInputElement;
    const type = input.type || element.tagName.toLowerCase();
    
    let description = '';
    let instructions = '';

    switch (type) {
      case 'email':
        instructions = 'Enter a valid email address.';
        break;
      case 'password':
        instructions = 'Enter your password. Characters will be hidden for security.';
        break;
      case 'tel':
        instructions = 'Enter a phone number for emergency contact.';
        break;
      case 'textarea':
        instructions = 'Enter detailed information. Use Ctrl+Enter to submit.';
        break;
      case 'select':
        instructions = 'Use arrow keys to browse options, Enter to select.';
        break;
      case 'checkbox':
        instructions = 'Press Space to toggle. Current state will be announced.';
        break;
      case 'radio':
        instructions = 'Use arrow keys to select from options in this group.';
        break;
      case 'submit':
        instructions = 'Press Enter or Space to submit the form.';
        break;
    }

    // Add crisis-specific form guidance
    if (element.closest('.crisis-form, .emergency-form')) {
      description = 'Crisis support form. ';
      instructions += ' This information helps us provide appropriate support.';
    } else if (element.closest('.safety-plan')) {
      description = 'Safety plan form. ';
      instructions += ' This creates your personal crisis management plan.';
    }

    const fullDescription = description + instructions;
    if (fullDescription.trim()) {
      element.setAttribute('aria-description', fullDescription);
    }

    // Add form validation announcements
    this.setupFormValidation(input);
  }

  /**
   * Setup form validation announcements
   */
  private setupFormValidation(input: HTMLInputElement): void {
    input.addEventListener('invalid', (event) => {
      const element = event.target as HTMLInputElement;
      const message = element.validationMessage || 'Invalid input';
      const fieldName = this.getFieldName(element);
      
      this.announce({
        message: `${fieldName}: ${message}`,
        priority: 'medium',
        type: 'error',
        context: 'form_validation'
      });
    });

    input.addEventListener('input', (event) => {
      const element = event.target as HTMLInputElement;
      if (element.checkValidity() && element.hasAttribute('aria-invalid')) {
        element.removeAttribute('aria-invalid');
        const fieldName = this.getFieldName(element);
        
        this.announce({
          message: `${fieldName}: Input is now valid`,
          priority: 'low',
          type: 'success',
          context: 'form_validation'
        });
      }
    });
  }

  /**
   * Get human-readable field name
   */
  private getFieldName(element: HTMLElement): string {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('placeholder') ||
      (element.previousElementSibling as HTMLElement)?.textContent ||
      (element as HTMLInputElement).name ||
      'Field'
    ).trim();
  }

  /**
   * Setup navigation announcements
   */
  private setupNavigationAnnouncements(): void {
    // Monitor page/view changes
    let lastUrl = location.href;
    let lastTitle = document.title;

    const announcePageChange = () => {
      if (location.href !== lastUrl || document.title !== lastTitle) {
        const pageName = this.getPageName();
        const pageDescription = this.getPageDescription();
        
        this.announce({
          message: `Navigated to ${pageName}. ${pageDescription}`,
          priority: 'medium',
          type: 'navigation',
          context: 'page_change'
        });

        lastUrl = location.href;
        lastTitle = document.title;
      }
    };

    // Monitor for programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(announcePageChange, 100);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(announcePageChange, 100);
    };

    window.addEventListener('popstate', () => {
      setTimeout(announcePageChange, 100);
    });

    // Monitor focus changes for navigation feedback
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target && this.shouldAnnounceElement(target)) {
        this.announceFocusedElement(target);
      }
    });
  }

  /**
   * Get user-friendly page name
   */
  private getPageName(): string {
    // Try to extract from main heading
    const mainHeading = document.querySelector('h1, [role="heading"][aria-level="1"]');
    if (mainHeading?.textContent) {
      return mainHeading.textContent.trim();
    }

    // Try document title
    if (document.title && document.title !== 'Astral Core') {
      return document.title;
    }

    // Extract from URL or view state
    const path = location.pathname;
    const pathSegments = path.split('/').filter(Boolean);
    
    if (pathSegments.length > 0) {
      return pathSegments[pathSegments.length - 1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }

    return 'Main Page';
  }

  /**
   * Get page description with mental health context
   */
  private getPageDescription(): string {
    const path = location.pathname;
    const descriptions: Record<string, string> = {
      '/crisis': 'Emergency crisis resources and immediate support options.',
      '/safety-plan': 'Personal safety plan creation and management.',
      '/chat': 'Live chat with trained peer support helpers.',
      '/ai-chat': 'AI-powered mental health assistance and guidance.',
      '/helpers': 'Connect with trained peer support specialists.',
      '/resources': 'Mental health resources and educational materials.',
      '/settings': 'Application settings and accessibility options.',
      '/wellness': 'Wellness tracking and mood monitoring tools.',
      '/': 'Main feed with community support and resources.'
    };

    return descriptions[path] || 'Mental health support platform page.';
  }

  /**
   * Determine if element focus should be announced
   */
  private shouldAnnounceElement(element: HTMLElement): boolean {
    // Always announce crisis elements
    if (element.dataset.crisis || element.classList.contains('crisis-button') || element.classList.contains('emergency-button')) {
      return true;
    }

    // Announce interactive elements
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const hasInteractiveRole = ['button', 'link', 'tab', 'menuitem'].includes(
      element.getAttribute('role') || ''
    );

    return interactiveTags.includes(element.tagName.toLowerCase()) || hasInteractiveRole;
  }

  /**
   * Announce focused element with context
   */
  private announceFocusedElement(element: HTMLElement): void {
    const description = this.generateElementAnnouncement(element);
    if (description) {
      this.announce({
        message: description,
        priority: 'low',
        type: 'navigation',
        context: 'focus_change'
      });
    }
  }

  /**
   * Generate comprehensive element announcement
   */
  private generateElementAnnouncement(element: HTMLElement): string {
    const parts: string[] = [];

    // Element name/text
    const name = this.getElementName(element);
    if (name) parts.push(name);

    // Element role
    const role = this.getElementRole(element);
    if (role) parts.push(role);

    // Element state
    const state = this.getElementState(element);
    if (state) parts.push(state);

    // Position information
    const position = this.getElementPosition(element);
    if (position) parts.push(position);

    // Available shortcuts
    const shortcuts = this.getElementShortcuts(element);
    if (shortcuts.length > 0) {
      parts.push(`Shortcut: ${shortcuts.join(', ')}`);
    }

    return parts.join(', ');
  }

  /**
   * Get element name/label
   */
  private getElementName(element: HTMLElement): string {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('title') ||
      (element as HTMLInputElement).placeholder ||
      element.textContent?.trim() ||
      ''
    );
  }

  /**
   * Get element role
   */
  private getElementRole(element: HTMLElement): string {
    const explicitRole = element.getAttribute('role');
    if (explicitRole) return explicitRole;

    const tagName = element.tagName.toLowerCase();
    const typeAttribute = (element as HTMLInputElement).type;

    if (tagName === 'input' && typeAttribute) {
      return `${typeAttribute} input`;
    }

    return tagName;
  }

  /**
   * Get element state information
   */
  private getElementState(element: HTMLElement): string {
    const states: string[] = [];

    // Checked state
    if (element.hasAttribute('aria-checked')) {
      states.push(element.getAttribute('aria-checked') === 'true' ? 'checked' : 'unchecked');
    } else if ((element as HTMLInputElement).checked !== undefined) {
      states.push((element as HTMLInputElement).checked ? 'checked' : 'unchecked');
    }

    // Selected state
    if (element.getAttribute('aria-selected') === 'true') {
      states.push('selected');
    }

    // Expanded state
    if (element.hasAttribute('aria-expanded')) {
      states.push(element.getAttribute('aria-expanded') === 'true' ? 'expanded' : 'collapsed');
    }

    // Disabled state
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      states.push('disabled');
    }

    // Required state
    if (element.hasAttribute('required') || element.getAttribute('aria-required') === 'true') {
      states.push('required');
    }

    return states.join(', ');
  }

  /**
   * Get element position information
   */
  private getElementPosition(element: HTMLElement): string {
    // Try aria-setsize and aria-posinset first
    const posInSet = element.getAttribute('aria-posinset');
    const setSize = element.getAttribute('aria-setsize');
    
    if (posInSet && setSize) {
      return `${posInSet} of ${setSize}`;
    }

    // Calculate position in parent container
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === element.tagName
      );
      const index = siblings.indexOf(element);
      
      if (index >= 0 && siblings.length > 1) {
        return `${index + 1} of ${siblings.length}`;
      }
    }

    return '';
  }

  /**
   * Get available keyboard shortcuts for element
   */
  private getElementShortcuts(element: HTMLElement): string[] {
    const shortcuts: string[] = [];

    // Check for accesskey
    const accessKey = element.getAttribute('accesskey');
    if (accessKey) {
      shortcuts.push(`Alt+${accessKey}`);
    }

    // Crisis-specific shortcuts
    if (element.dataset.crisis || element.classList.contains('crisis-button')) {
      shortcuts.push('Alt+C');
    }

    if (element.classList.contains('emergency-button')) {
      shortcuts.push('Alt+E');
    }

    // Tab-specific shortcuts
    if (element.getAttribute('role') === 'tab') {
      shortcuts.push('Arrow keys to navigate tabs');
    }

    return shortcuts;
  }

  /**
   * Setup crisis-specific announcements
   */
  private setupCrisisAnnouncements(): void {
    // Monitor crisis state changes
    document.addEventListener('crisis-state-change', ((event: CustomEvent) => {
      const { isActive, severity, interventionType } = event.detail;
      
      this.crisisContext = { isActive, severity, interventionType };
      
      if (isActive) {
        this.announceCrisisActivation(severity, interventionType);
      } else {
        this.announceCrisisResolution();
      }
    }) as EventListener);

    // Monitor for crisis buttons
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.crisis || target.classList.contains('crisis-button') || target.classList.contains('emergency-button')) {
        this.announceCrisisAction(target);
      }
    });
  }

  /**
   * Announce crisis activation
   */
  private announceCrisisActivation(severity: string, interventionType: string): void {
    let message = 'Crisis support activated. ';
    
    switch (severity) {
      case 'high':
        message += 'High priority crisis detected. Emergency resources are being prepared.';
        break;
      case 'medium':
        message += 'Crisis support is ready. Trained helpers are available.';
        break;
      default:
        message += 'Support resources are now active.';
    }

    if (interventionType !== 'none') {
      message += ` ${interventionType} support is being connected.`;
    }

    this.announce({
      message,
      priority: 'emergency',
      type: 'crisis',
      persistent: true
    });
  }

  /**
   * Announce crisis resolution
   */
  private announceCrisisResolution(): void {
    this.announce({
      message: 'Crisis support session ended. Regular support resources remain available.',
      priority: 'medium',
      type: 'status'
    });
  }

  /**
   * Announce crisis action taken
   */
  private announceCrisisAction(element: HTMLElement): void {
    const action = element.textContent?.trim() || 'Crisis action';
    const isEmergency = element.classList.contains('emergency-button');
    
    let message = `${action} activated. `;
    
    if (isEmergency) {
      message += 'Emergency services are being contacted. Stay on the line.';
    } else {
      message += 'Crisis resources are loading. Help is on the way.';
    }

    this.announce({
      message,
      priority: 'emergency',
      type: 'crisis',
      persistent: true
    });
  }

  /**
   * Queue and process announcements
   */
  public announce(announcement: ScreenReaderAnnouncement): void {
    // Add to queue
    this.announcementQueue.push(announcement);
    
    // Start processing if not already processing
    if (!this.isProcessingQueue) {
      this.processAnnouncementQueue();
    }
  }

  /**
   * Process announcement queue
   */
  private async processAnnouncementQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.announcementQueue.length > 0) {
      const announcement = this.announcementQueue.shift()!;
      
      // Skip duplicate announcements
      if (this.lastAnnouncement === announcement.message) {
        continue;
      }

      // Apply delay if specified
      if (announcement.delay) {
        await new Promise(resolve => setTimeout(resolve, announcement.delay));
      }

      await this.deliverAnnouncement(announcement);
      this.lastAnnouncement = announcement.message;
      this.announcementHistory.push(announcement.message);

      // Keep history manageable
      if (this.announcementHistory.length > 50) {
        this.announcementHistory.shift();
      }

      // Brief pause between announcements
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Deliver announcement to appropriate live region
   */
  private async deliverAnnouncement(announcement: ScreenReaderAnnouncement): Promise<void> {
    let regionId: string;

    switch (announcement.type) {
      case 'crisis':
        regionId = 'sr-crisis';
        break;
      case 'navigation':
        regionId = 'sr-navigation';
        break;
      case 'error':
      case 'warning':
        regionId = 'sr-alerts';
        break;
      case 'status':
      case 'success':
      default:
        regionId = announcement.priority === 'high' ? 'sr-alerts' : 'sr-status';
    }

    const region = this.liveRegions.get(regionId);
    if (!region) return;

    // Clear previous content if not persistent
    if (!announcement.persistent) {
      region.textContent = '';
    }

    // Add new announcement
    setTimeout(() => {
      if (announcement.persistent) {
        region.textContent += ` ${announcement.message}`;
      } else {
        region.textContent = announcement.message;
      }
    }, 50);

    // Clear non-persistent announcements after delay
    if (!announcement.persistent) {
      setTimeout(() => {
        if (region.textContent === announcement.message) {
          region.textContent = '';
        }
      }, 8000);
    }

    console.log(`[ScreenReader] Announced: ${announcement.message}`);
  }

  /**
   * Get announcement history
   */
  public getAnnouncementHistory(): string[] {
    return [...this.announcementHistory];
  }

  /**
   * Clear announcement history
   */
  public clearAnnouncementHistory(): void {
    this.announcementHistory.length = 0;
  }

  /**
   * Set crisis context
   */
  public setCrisisContext(context: Partial<typeof this.crisisContext>): void {
    this.crisisContext = { ...this.crisisContext, ...context };
  }

  /**
   * Get crisis context
   */
  public getCrisisContext(): typeof this.crisisContext {
    return { ...this.crisisContext };
  }

  /**
   * Announce form validation errors
   */
  public announceFormValidation(field: string, error: string | null): void {
    if (error) {
      this.announce({
        message: `Validation error for ${field}: ${error}`,
        priority: 'medium',
        type: 'error',
        context: 'form-validation'
      });
    } else {
      this.announce({
        message: `${field} is valid`,
        priority: 'low',
        type: 'success',
        context: 'form-validation'
      });
    }
  }

  /**
   * Announce focus change
   */
  public announceFocusChange(element: HTMLElement, context?: string): void {
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    const label = element.getAttribute('aria-label') || element.textContent || 'Unnamed element';
    
    this.announce({
      message: `Focus moved to ${role}: ${label}`,
      priority: 'low',
      type: 'navigation',
      context: context || 'focus-change'
    });
  }

  /**
   * Announce loading state
   */
  public announceLoadingState(isLoading: boolean, context?: string): void {
    this.announce({
      message: isLoading ? 'Loading content, please wait' : 'Content loaded',
      priority: 'medium',
      type: 'status',
      context: context || 'loading'
    });
  }

  /**
   * Announce success message
   */
  public announceSuccess(message: string, context?: string): void {
    this.announce({
      message,
      priority: 'medium',
      type: 'success',
      context: context || 'success'
    });
  }

  /**
   * Announce error message
   */
  public announceError(message: string, context?: string): void {
    this.announce({
      message,
      priority: 'high',
      type: 'error',
      context: context || 'error'
    });
  }

  /**
   * Announce page change
   */
  public announcePageChange(pageName: string, context?: string): void {
    this.announce({
      message: `Navigated to ${pageName}`,
      priority: 'medium',
      type: 'navigation',
      context: context || 'page-change'
    });
  }

  /**
   * Announce keyboard shortcuts
   */
  public announceKeyboardShortcuts(shortcuts: string[]): void {
    const message = `Available keyboard shortcuts: ${shortcuts.join(', ')}`;
    this.announce({
      message,
      priority: 'low',
      type: 'status',
      context: 'keyboard-shortcuts'
    });
  }

  /**
   * Announce crisis escalation
   */
  public announceCrisisEscalation(level: string, action: string): void {
    this.announce({
      message: `Crisis support activated. Level: ${level}. Action: ${action}`,
      priority: 'emergency',
      type: 'crisis',
      context: 'crisis-escalation',
      persistent: true
    });
  }

  /**
   * Destroy service and clean up
   */
  public destroy(): void {
    this.liveRegions.clear();
    this.announcementQueue.length = 0;
    this.announcementHistory.length = 0;
    this.isProcessingQueue = false;
    
    console.log('[ScreenReader] Service destroyed');
  }
}

// Export singleton instance
export default ScreenReaderService;
export const screenReaderService = new ScreenReaderService();
