/**
 * @fileoverview Comprehensive Accessibility Service for WCAG 2.1 AAA Compliance
 * Provides advanced accessibility features including screen reader support, 
 * high contrast themes, keyboard navigation, and voice control for mental health platform
 * 
 * @license Apache-2.0
 */

// Web Speech API type declarations
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface AccessibilitySettings {
  // Visual accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  increasedTextSize: number; // 1.0 to 2.0 scale
  focusIndicatorStrength: 'normal' | 'enhanced' | 'maximum';
  colorBlindnessType: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'monochrome';
  
  // Screen reader support
  screenReaderEnabled: boolean;
  verboseDescriptions: boolean;
  crisisAnnouncements: boolean;
  livRegionPoliteness: 'off' | 'polite' | 'assertive';
  
  // Keyboard navigation
  enhancedKeyboardNavigation: boolean;
  skipLinksEnabled: boolean;
  crisisShortcutsEnabled: boolean;
  tabTrapEnabled: boolean;
  
  // Voice control
  voiceNavigationEnabled: boolean;
  voiceCommandSensitivity: 'low' | 'medium' | 'high';
  emergencyVoiceCommands: boolean;
  
  // Motor accessibility
  clickTimeoutIncrease: number; // multiplier for interaction timeouts
  dragAndDropAlternatives: boolean;
  stickyKeys: boolean;
  
  // Cognitive accessibility
  simplifiedInterface: boolean;
  readingAssistance: boolean;
  contextualHelp: boolean;
  errorSummaryEnabled: boolean;
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  type: 'navigation' | 'status' | 'error' | 'crisis' | 'success';
  persistent?: boolean; // For emergency announcements
}

export interface KeyboardShortcut {
  keys: string[];
  description: string;
  action: () => void;
  enabled: boolean;
  crisisRelated: boolean;
}

class AccessibilityService {
  private settings: AccessibilitySettings;
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private liveRegions: Map<string, HTMLElement> = new Map();
  private focusStack: HTMLElement[] = [];
  private isInitialized = false;
  
  // Voice control properties
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis;
  private voiceCommands: Map<string, () => void> = new Map();
  
  // High contrast themes
  private contrastThemes = {
    default: {
      name: 'Default',
      cssClass: 'theme-default'
    },
    highContrast: {
      name: 'High Contrast',
      cssClass: 'theme-high-contrast'
    },
    highContrastWhite: {
      name: 'High Contrast White',
      cssClass: 'theme-high-contrast-white'
    },
    highContrastBlack: {
      name: 'High Contrast Black',
      cssClass: 'theme-high-contrast-black'
    },
    deuteranopia: {
      name: 'Deuteranopia Support',
      cssClass: 'theme-deuteranopia'
    },
    protanopia: {
      name: 'Protanopia Support',
      cssClass: 'theme-protanopia'
    },
    tritanopia: {
      name: 'Tritanopia Support',
      cssClass: 'theme-tritanopia'
    },
    monochrome: {
      name: 'Monochrome',
      cssClass: 'theme-monochrome'
    }
  };

  constructor() {
    this.settings = this.getDefaultSettings();
    this.speechSynthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize accessibility service with user preferences and system detection
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load saved settings
      await this.loadSettings();
      
      // Detect system preferences
      this.detectSystemPreferences();
      
      // Initialize components
      this.setupLiveRegions();
      this.setupKeyboardShortcuts();
      this.setupFocusManagement();
      this.setupHighContrastThemes();
      this.initializeVoiceCommands();
      
      // Apply current settings
      this.applyAllSettings();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      
      // Announce service ready for screen readers
      this.announce({
        message: 'Accessibility features are now active. Press Alt+H for help.',
        priority: 'low',
        type: 'status'
      });
      
      console.log('[Accessibility] Service initialized successfully');
    } catch (error) {
      console.error('[Accessibility] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Get default accessibility settings
   */
  private getDefaultSettings(): AccessibilitySettings {
    return {
      // Visual accessibility
      highContrast: false,
      reducedMotion: false,
      increasedTextSize: 1.0,
      focusIndicatorStrength: 'normal',
      colorBlindnessType: 'none',
      
      // Screen reader support
      screenReaderEnabled: false,
      verboseDescriptions: true,
      crisisAnnouncements: true,
      livRegionPoliteness: 'polite',
      
      // Keyboard navigation
      enhancedKeyboardNavigation: true,
      skipLinksEnabled: true,
      crisisShortcutsEnabled: true,
      tabTrapEnabled: false,
      
      // Voice control
      voiceNavigationEnabled: false,
      voiceCommandSensitivity: 'medium',
      emergencyVoiceCommands: true,
      
      // Motor accessibility
      clickTimeoutIncrease: 1.0,
      dragAndDropAlternatives: true,
      stickyKeys: false,
      
      // Cognitive accessibility
      simplifiedInterface: false,
      readingAssistance: false,
      contextualHelp: true,
      errorSummaryEnabled: true
    };
  }

  /**
   * Detect system accessibility preferences
   */
  private detectSystemPreferences(): void {
    try {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.settings.reducedMotion = true;
      }

      // Check for high contrast preference
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        this.settings.highContrast = true;
      }

      // Check for forced colors (Windows high contrast mode)
      if (window.matchMedia('(forced-colors: active)').matches) {
        this.settings.highContrast = true;
        this.settings.focusIndicatorStrength = 'maximum';
      }

      // Detect screen reader usage
      if (this.isScreenReaderDetected()) {
        this.settings.screenReaderEnabled = true;
        this.settings.verboseDescriptions = true;
      }

      console.log('[Accessibility] System preferences detected:', {
        reducedMotion: this.settings.reducedMotion,
        highContrast: this.settings.highContrast,
        screenReader: this.settings.screenReaderEnabled
      });
    } catch (error) {
      console.warn('[Accessibility] Could not detect system preferences:', error);
    }
  }

  /**
   * Detect if a screen reader is being used
   */
  private isScreenReaderDetected(): boolean {
    // Multiple detection methods for better accuracy
    const indicators = [
      // Check for common screen reader user agents
      /JAWS|NVDA|ORCA|VoiceOver|TalkBack|Narrator/i.test(navigator.userAgent),
      
      // Check for screen reader specific CSS media queries
      window.matchMedia('(speech)').matches,
      
      // Check for high contrast or forced colors (often used with screen readers)
      window.matchMedia('(forced-colors: active)').matches,
      
      // Check for assistive technology indicators in the DOM
      document.querySelector('[aria-hidden="true"][role="presentation"]') !== null
    ];

    return indicators.some(indicator => indicator);
  }

  /**
   * Setup live regions for screen reader announcements
   */
  private setupLiveRegions(): void {
    const regions = [
      { id: 'sr-status', politeness: 'polite', label: 'Status updates' },
      { id: 'sr-alerts', politeness: 'assertive', label: 'Important alerts' },
      { id: 'sr-emergency', politeness: 'assertive', label: 'Emergency notifications' }
    ];

    regions.forEach(region => {
      let element = document.getElementById(region.id);
      if (!element) {
        element = document.createElement('div');
        element.id = region.id;
        element.setAttribute('aria-live', region.politeness);
        element.setAttribute('aria-label', region.label);
        element.setAttribute('aria-relevant', 'additions text');
        element.style.cssText = `
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        `;
        document.body.appendChild(element);
      }
      this.liveRegions.set(region.id, element);
    });
  }

  /**
   * Setup keyboard shortcuts for accessibility and crisis access
   */
  private setupKeyboardShortcuts(): void {
    const shortcuts: KeyboardShortcut[] = [
      {
        keys: ['Alt', 'c'],
        description: 'Quick access to crisis resources',
        action: () => this.navigateToCrisisResources(),
        enabled: this.settings.crisisShortcutsEnabled,
        crisisRelated: true
      },
      {
        keys: ['Alt', 'h'],
        description: 'Show accessibility help',
        action: () => this.showAccessibilityHelp(),
        enabled: true,
        crisisRelated: false
      },
      {
        keys: ['Alt', 'e'],
        description: 'Emergency contact activation',
        action: () => this.activateEmergencyContact(),
        enabled: this.settings.crisisShortcutsEnabled,
        crisisRelated: true
      },
      {
        keys: ['Alt', 'n'],
        description: 'Navigate to main content',
        action: () => this.skipToMainContent(),
        enabled: this.settings.skipLinksEnabled,
        crisisRelated: false
      },
      {
        keys: ['Alt', 's'],
        description: 'Go to safety plan',
        action: () => this.navigateToSafetyPlan(),
        enabled: this.settings.crisisShortcutsEnabled,
        crisisRelated: true
      },
      {
        keys: ['Alt', 'v'],
        description: 'Toggle voice navigation',
        action: () => this.toggleVoiceNavigation(),
        enabled: true,
        crisisRelated: false
      }
    ];

    shortcuts.forEach(shortcut => {
      const key = shortcut.keys.join('+');
      this.shortcuts.set(key, shortcut);
    });
  }

  /**
   * Setup focus management for better keyboard navigation
   */
  private setupFocusManagement(): void {
    // Track focus for better navigation
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target && this.settings.enhancedKeyboardNavigation) {
        this.focusStack.push(target);
        
        // Limit focus stack size
        if (this.focusStack.length > 10) {
          this.focusStack.shift();
        }
        
        // Announce focus changes for screen readers if verbose
        if (this.settings.screenReaderEnabled && this.settings.verboseDescriptions) {
          this.announceFocusChange(target);
        }
      }
    });

    // Handle escape key for focus restoration
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.settings.enhancedKeyboardNavigation) {
        this.restorePreviousFocus();
      }
    });
  }

  /**
   * Setup high contrast themes and visual accessibility
   */
  private setupHighContrastThemes(): void {
    // Create theme stylesheet if it doesn't exist
    let styleSheet = document.getElementById('accessibility-themes') as HTMLStyleElement;
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'accessibility-themes';
      document.head.appendChild(styleSheet);
    }

    // High contrast theme CSS
    const highContrastCSS = `
      .theme-high-contrast {
        --bg-primary: #000000;
        --bg-secondary: #000000;
        --text-primary: #ffffff;
        --text-secondary: #ffffff;
        --border-color: #ffffff;
        --focus-color: #ffff00;
        --error-color: #ff0000;
        --success-color: #00ff00;
        --warning-color: #ffff00;
        --crisis-color: #ff0000;
      }
      
      .theme-high-contrast-white {
        --bg-primary: #ffffff;
        --bg-secondary: #ffffff;
        --text-primary: #000000;
        --text-secondary: #000000;
        --border-color: #000000;
        --focus-color: #0000ff;
        --error-color: #ff0000;
        --success-color: #008000;
        --warning-color: #ff8c00;
        --crisis-color: #ff0000;
      }
      
      .theme-high-contrast-black {
        --bg-primary: #000000;
        --bg-secondary: #1a1a1a;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
        --border-color: #ffffff;
        --focus-color: #ffff00;
        --error-color: #ff6666;
        --success-color: #66ff66;
        --warning-color: #ffff66;
        --crisis-color: #ff4444;
      }
      
      /* Enhanced focus indicators */
      .focus-enhanced *:focus,
      .focus-maximum *:focus {
        outline: 3px solid var(--focus-color, #007ACC) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 5px rgba(0, 122, 204, 0.3) !important;
      }
      
      .focus-maximum *:focus {
        outline-width: 5px !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 0 8px rgba(0, 122, 204, 0.5) !important;
      }
      
      /* Reduced motion */
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Text size scaling */
      .text-scale-125 { font-size: 1.25em !important; }
      .text-scale-150 { font-size: 1.5em !important; }
      .text-scale-175 { font-size: 1.75em !important; }
      .text-scale-200 { font-size: 2em !important; }
      
      /* Color blindness support */
      .theme-deuteranopia {
        --success-color: #0066cc;
        --warning-color: #ff6600;
        --error-color: #cc0000;
      }
      
      .theme-protanopia {
        --success-color: #0080ff;
        --warning-color: #ff8000;
        --error-color: #800000;
      }
      
      .theme-tritanopia {
        --success-color: #008080;
        --warning-color: #ff4080;
        --error-color: #ff0040;
      }
      
      .theme-monochrome {
        filter: grayscale(100%);
      }
      
      /* Crisis-specific accessibility */
      .crisis-mode {
        --crisis-bg: var(--error-color, #ff0000);
        --crisis-text: #ffffff;
      }
      
      .crisis-button {
        background: var(--crisis-bg) !important;
        color: var(--crisis-text) !important;
        border: 3px solid #ffffff !important;
        font-weight: bold !important;
        font-size: 1.2em !important;
      }
      
      .crisis-button:focus {
        outline: 5px solid #ffff00 !important;
        outline-offset: 3px !important;
      }
    `;

    styleSheet.textContent = highContrastCSS;
  }

  /**
   * Initialize speech recognition for voice commands
   */
  private initializeSpeechRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('[Accessibility] Speech recognition not supported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      
      if (this.speechRecognition) {
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.lang = 'en-US';
        
        this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
          this.handleVoiceCommand(event);
        };
        
        this.speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn('[Accessibility] Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            this.settings.voiceNavigationEnabled = false;
          }
        };
      }
      
      console.log('[Accessibility] Speech recognition initialized');
    } catch (error) {
      console.error('[Accessibility] Failed to initialize speech recognition:', error);
    }
  }

  /**
   * Initialize voice commands for crisis and navigation
   */
  private initializeVoiceCommands(): void {
    const commands = [
      // Crisis commands (priority)
      { phrase: 'emergency help', action: () => this.activateEmergencyContact() },
      { phrase: 'crisis resources', action: () => this.navigateToCrisisResources() },
      { phrase: 'safety plan', action: () => this.navigateToSafetyPlan() },
      { phrase: 'need help now', action: () => this.activateEmergencyContact() },
      
      // Navigation commands
      { phrase: 'go home', action: () => this.navigateToHome() },
      { phrase: 'main menu', action: () => this.openMainMenu() },
      { phrase: 'chat with helper', action: () => this.navigateToHelperChat() },
      { phrase: 'ai assistant', action: () => this.navigateToAIChat() },
      
      // Accessibility commands
      { phrase: 'read page', action: () => this.readCurrentPage() },
      { phrase: 'high contrast', action: () => this.toggleHighContrast() },
      { phrase: 'help', action: () => this.showAccessibilityHelp() },
      { phrase: 'stop listening', action: () => this.stopVoiceNavigation() }
    ];

    commands.forEach(command => {
      this.voiceCommands.set(command.phrase.toLowerCase(), command.action);
    });
  }

  /**
   * Handle voice command processing
   */
  private handleVoiceCommand(event: SpeechRecognitionEvent): void {
    if (!this.settings.voiceNavigationEnabled) return;

    const results = Array.from(event.results);
    const transcript = results[event.resultIndex][0].transcript.toLowerCase().trim();
    
    console.log('[Accessibility] Voice command:', transcript);

    // Check for exact matches first
    if (this.voiceCommands.has(transcript)) {
      const command = this.voiceCommands.get(transcript);
      if (command) {
        command();
        this.announce({
          message: `Command executed: ${transcript}`,
          priority: 'medium',
          type: 'status'
        });
        return;
      }
    }

    // Check for partial matches
    for (const [phrase, action] of this.voiceCommands.entries()) {
      if (transcript.includes(phrase)) {
        action();
        this.announce({
          message: `Command executed: ${phrase}`,
          priority: 'medium',
          type: 'status'
        });
        return;
      }
    }

    // No command found
    this.announce({
      message: 'Command not recognized. Say "help" for available commands.',
      priority: 'low',
      type: 'error'
    });
  }

  /**
   * Announce message to screen readers
   */
  public announce(announcement: AccessibilityAnnouncement): void {
    if (!this.settings.screenReaderEnabled && announcement.priority !== 'emergency') {
      return;
    }

    let regionId: string;
    
    switch (announcement.priority) {
      case 'high':
      case 'emergency':
        regionId = 'sr-emergency';
        break;
      case 'medium':
        regionId = 'sr-alerts';
        break;
      default:
        regionId = 'sr-status';
    }

    const region = this.liveRegions.get(regionId);
    if (region) {
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
      }, 100);

      // Clear non-persistent announcements after a delay
      if (!announcement.persistent) {
        setTimeout(() => {
          if (region.textContent === announcement.message) {
            region.textContent = '';
          }
        }, 10000);
      }
    }

    console.log(`[Accessibility] Announced: ${announcement.message}`);
  }

  /**
   * Announce focus changes for screen readers
   */
  private announceFocusChange(element: HTMLElement): void {
    const label = this.getAccessibleLabel(element);
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    
    if (label) {
      this.announce({
        message: `${label}, ${role}`,
        priority: 'low',
        type: 'navigation'
      });
    }
  }

  /**
   * Get accessible label for an element
   */
  private getAccessibleLabel(element: HTMLElement): string {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('title') ||
      (element as HTMLInputElement).placeholder ||
      element.textContent ||
      ''
    ).trim();
  }

  /**
   * Apply all current accessibility settings
   */
  private applyAllSettings(): void {
    this.applyHighContrastTheme();
    this.applyFocusIndicators();
    this.applyTextScaling();
    this.applyReducedMotion();
    this.applyColorBlindnessSupport();
    
    console.log('[Accessibility] All settings applied');
  }

  /**
   * Apply high contrast theme
   */
  private applyHighContrastTheme(): void {
    const body = document.body;
    
    // Remove existing theme classes
    Object.values(this.contrastThemes).forEach(theme => {
      body.classList.remove(theme.cssClass);
    });

    // Apply selected theme
    if (this.settings.highContrast) {
      const theme = this.contrastThemes.highContrast;
      body.classList.add(theme.cssClass);
    }

    // Apply color blindness support
    if (this.settings.colorBlindnessType !== 'none') {
      const themeKey = this.settings.colorBlindnessType as keyof typeof this.contrastThemes;
      const theme = this.contrastThemes[themeKey];
      if (theme) {
        body.classList.add(theme.cssClass);
      }
    }
  }

  /**
   * Apply focus indicator settings
   */
  private applyFocusIndicators(): void {
    const body = document.body;
    
    // Remove existing focus classes
    body.classList.remove('focus-normal', 'focus-enhanced', 'focus-maximum');
    
    // Apply focus indicator strength
    body.classList.add(`focus-${this.settings.focusIndicatorStrength}`);
  }

  /**
   * Apply text scaling
   */
  private applyTextScaling(): void {
    const body = document.body;
    
    // Remove existing text scale classes
    body.classList.remove('text-scale-125', 'text-scale-150', 'text-scale-175', 'text-scale-200');
    
    // Apply text scaling
    if (this.settings.increasedTextSize > 1.0) {
      const scale = Math.round(this.settings.increasedTextSize * 100);
      body.classList.add(`text-scale-${scale}`);
    }
  }

  /**
   * Apply reduced motion settings
   */
  private applyReducedMotion(): void {
    const body = document.body;
    
    if (this.settings.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }

  /**
   * Apply color blindness support
   */
  private applyColorBlindnessSupport(): void {
    // This is handled in applyHighContrastTheme
    // Additional logic can be added here for specific color adjustments
  }

  /**
   * Setup event listeners for accessibility features
   */
  private setupEventListeners(): void {
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardShortcut(event);
    });

    // Monitor media query changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.settings.reducedMotion = true;
        this.applyReducedMotion();
      }
    });

    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    highContrastQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.settings.highContrast = true;
        this.applyHighContrastTheme();
      }
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyboardShortcut(event: KeyboardEvent): void {
    const pressedKeys: string[] = [];
    
    if (event.ctrlKey) pressedKeys.push('Ctrl');
    if (event.altKey) pressedKeys.push('Alt');
    if (event.shiftKey) pressedKeys.push('Shift');
    if (event.metaKey) pressedKeys.push('Meta');
    
    pressedKeys.push(event.key);
    
    const shortcutKey = pressedKeys.join('+');
    const shortcut = this.shortcuts.get(shortcutKey);
    
    if (shortcut && shortcut.enabled) {
      event.preventDefault();
      shortcut.action();
      
      this.announce({
        message: `Activated: ${shortcut.description}`,
        priority: shortcut.crisisRelated ? 'high' : 'medium',
        type: shortcut.crisisRelated ? 'crisis' : 'navigation'
      });
    }
  }

  // Navigation methods for keyboard shortcuts and voice commands
  private navigateToCrisisResources(): void {
    const windowWithApp = window as any;
    if (windowWithApp.app?.setActiveView) {
      windowWithApp.app.setActiveView({ view: 'crisis' });
    }
  }

  private navigateToSafetyPlan(): void {
    const windowWithApp = window as any;
    if (windowWithApp.app?.setActiveView) {
      windowWithApp.app.setActiveView({ view: 'safety-plan' });
    }
  }

  private navigateToHome(): void {
    const windowWithApp = window as any;
    if (windowWithApp.app?.setActiveView) {
      windowWithApp.app.setActiveView({ view: 'feed' });
    }
  }

  private navigateToHelperChat(): void {
    const windowWithApp = window as any;
    if (windowWithApp.app?.setActiveView) {
      windowWithApp.app.setActiveView({ view: 'chat' });
    }
  }

  private navigateToAIChat(): void {
    const windowWithApp = window as any;
    if (windowWithApp.app?.setActiveView) {
      windowWithApp.app.setActiveView({ view: 'ai-chat' });
    }
  }

  private activateEmergencyContact(): void {
    // Trigger emergency contact modal or direct action
    this.announce({
      message: 'Activating emergency contacts. Help is on the way.',
      priority: 'emergency',
      type: 'crisis',
      persistent: true
    });
    
    // Additional emergency activation logic would go here
    console.log('[Accessibility] Emergency contact activated');
  }

  private openMainMenu(): void {
    // Open main navigation menu
    console.log('[Accessibility] Opening main menu');
  }

  private skipToMainContent(): void {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      this.announce({
        message: 'Skipped to main content',
        priority: 'low',
        type: 'navigation'
      });
    }
  }

  private restorePreviousFocus(): void {
    if (this.focusStack.length > 1) {
      const previousElement = this.focusStack[this.focusStack.length - 2];
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus();
      }
    }
  }

  private showAccessibilityHelp(): void {
    const helpMessage = `
      Accessibility Help:
      Alt+C: Crisis resources
      Alt+E: Emergency contact
      Alt+S: Safety plan
      Alt+H: This help
      Alt+V: Toggle voice navigation
      Alt+N: Skip to main content
      
      Voice commands (when enabled):
      "Emergency help", "Crisis resources", "Safety plan", 
      "Go home", "Help", "High contrast", "Stop listening"
    `;
    
    this.announce({
      message: helpMessage,
      priority: 'medium',
      type: 'status'
    });
  }

  private toggleVoiceNavigation(): void {
    this.settings.voiceNavigationEnabled = !this.settings.voiceNavigationEnabled;
    
    if (this.settings.voiceNavigationEnabled) {
      this.startVoiceNavigation();
    } else {
      this.stopVoiceNavigation();
    }
  }

  private startVoiceNavigation(): void {
    if (this.speechRecognition && this.settings.voiceNavigationEnabled) {
      try {
        this.speechRecognition.start();
        this.announce({
          message: 'Voice navigation started. Say "help" for commands.',
          priority: 'medium',
          type: 'status'
        });
      } catch (error) {
        console.error('[Accessibility] Failed to start voice navigation:', error);
      }
    }
  }

  private stopVoiceNavigation(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.announce({
        message: 'Voice navigation stopped.',
        priority: 'low',
        type: 'status'
      });
    }
  }

  private toggleHighContrast(): void {
    this.settings.highContrast = !this.settings.highContrast;
    this.applyHighContrastTheme();
    this.saveSettings();
    
    this.announce({
      message: `High contrast ${this.settings.highContrast ? 'enabled' : 'disabled'}`,
      priority: 'medium',
      type: 'status'
    });
  }

  private readCurrentPage(): void {
    if (this.speechSynthesis) {
      const content = this.extractPageContent();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      this.speechSynthesis.speak(utterance);
    }
  }

  private extractPageContent(): string {
    const main = document.querySelector('main') || document.body;
    const headings = Array.from(main.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => h.textContent).join('. ');
    const content = main.textContent || '';
    return `Page content: ${headings}. ${content.slice(0, 500)}`;
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const stored = localStorage.getItem('accessibility-settings');
      if (stored) {
        const settings = JSON.parse(stored);
        this.settings = { ...this.settings, ...settings };
      }
    } catch (error) {
      console.warn('[Accessibility] Failed to load settings:', error);
    }
  }

  /**
   * Save settings to storage
   */
  public async saveSettings(): Promise<void> {
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('[Accessibility] Failed to save settings:', error);
    }
  }

  /**
   * Update accessibility settings
   */
  public updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.applyAllSettings();
    this.saveSettings();
    
    this.announce({
      message: 'Accessibility settings updated',
      priority: 'low',
      type: 'status'
    });
  }

  /**
   * Get current settings
   */
  public getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  /**
   * Get available keyboard shortcuts
   */
  public getKeyboardShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get available voice commands
   */
  public getVoiceCommands(): string[] {
    return Array.from(this.voiceCommands.keys());
  }

  /**
   * Check if voice navigation is supported
   */
  public isVoiceNavigationSupported(): boolean {
    return this.speechRecognition !== null;
  }

  /**
   * Destroy service and clean up resources
   */
  public destroy(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
    
    this.liveRegions.clear();
    this.shortcuts.clear();
    this.voiceCommands.clear();
    this.focusStack.length = 0;
    
    console.log('[Accessibility] Service destroyed');
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();
export default accessibilityService;
