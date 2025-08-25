/**
 * Screen Reader Service
 *
 * Provides comprehensive screen reader support and accessibility features
 * for the mental health platform. Includes ARIA live regions, semantic
 * announcements, crisis-specific accessibility features, and real-time
 * communication with assistive technologies.
 *
 * @fileoverview Screen reader integration and accessibility support
 * @version 2.0.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/logger';

export type AnnouncementPriority = 'polite' | 'assertive' | 'off';
export type AnnouncementType = 'status' | 'alert' | 'log' | 'marquee' | 'timer';

export interface AccessibilityAnnouncement {
  id: string;
  message: string;
  priority: AnnouncementPriority;
  type: AnnouncementType;
  timestamp: number;
  delay?: number;
  interrupt?: boolean;
  repeat?: number;
}

export interface ScreenReaderCapabilities {
  supportsAriaLive: boolean;
  supportsAriaAtomic: boolean;
  supportsAriaRelevant: boolean;
  supportsRoleAlert: boolean;
  supportsRoleStatus: boolean;
  supportsRoleLog: boolean;
  screenReaderDetected: boolean;
  screenReaderName?: string;
}

export interface CrisisAccessibilityConfig {
  enableCrisisAnnouncements: boolean;
  crisisAnnouncementDelay: number;
  enableEmergencyShortcuts: boolean;
  emergencyShortcutKey: string;
  enableHighContrastMode: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
}

class ScreenReaderService {
  private liveRegions: Map<AnnouncementPriority, HTMLElement> = new Map();
  private announcementQueue: AccessibilityAnnouncement[] = [];
  private isProcessingQueue = false;
  private capabilities: ScreenReaderCapabilities;
  private crisisConfig: CrisisAccessibilityConfig;
  private listeners: Set<(announcement: AccessibilityAnnouncement) => void> = new Set();

  constructor() {
    this.capabilities = this.detectScreenReaderCapabilities();
    this.crisisConfig = {
      enableCrisisAnnouncements: true,
      crisisAnnouncementDelay: 500,
      enableEmergencyShortcuts: true,
      emergencyShortcutKey: 'F1',
      enableHighContrastMode: false,
      enableReducedMotion: false,
      enableLargeText: false,
    };
    this.init();
  }

  private init() {
    if (typeof document !== 'undefined') {
      this.createLiveRegions();
      this.setupEventListeners();
      this.setupCrisisAccessibilityFeatures();
    }
    logger.info('ScreenReaderService initialized with capabilities:', this.capabilities);
  }

  private detectScreenReaderCapabilities(): ScreenReaderCapabilities {
    if (typeof window === 'undefined') {
      return {
        supportsAriaLive: false,
        supportsAriaAtomic: false,
        supportsAriaRelevant: false,
        supportsRoleAlert: false,
        supportsRoleStatus: false,
        supportsRoleLog: false,
        screenReaderDetected: false,
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const screenReaderDetected = 
      'speechSynthesis' in window ||
      userAgent.includes('nvda') ||
      userAgent.includes('jaws') ||
      userAgent.includes('voiceover') ||
      userAgent.includes('talkback') ||
      window.navigator.maxTouchPoints > 0;

    let screenReaderName: string | undefined;
    if (userAgent.includes('nvda')) screenReaderName = 'NVDA';
    else if (userAgent.includes('jaws')) screenReaderName = 'JAWS';
    else if (userAgent.includes('voiceover')) screenReaderName = 'VoiceOver';
    else if (userAgent.includes('talkback')) screenReaderName = 'TalkBack';

    return {
      supportsAriaLive: true,
      supportsAriaAtomic: true,
      supportsAriaRelevant: true,
      supportsRoleAlert: true,
      supportsRoleStatus: true,
      supportsRoleLog: true,
      screenReaderDetected,
      screenReaderName,
    };
  }

  private createLiveRegions() {
    const priorities: AnnouncementPriority[] = ['polite', 'assertive'];
    
    priorities.forEach(priority => {
      const region = document.createElement('div');
      region.id = `sr-live-region-${priority}`;
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.setAttribute('aria-relevant', 'additions text');
      region.style.position = 'absolute';
      region.style.left = '-10000px';
      region.style.width = '1px';
      region.style.height = '1px';
      region.style.overflow = 'hidden';
      region.style.clipPath = 'inset(50%)';
      
      document.body.appendChild(region);
      this.liveRegions.set(priority, region);
    });

    logger.debug('Screen reader live regions created');
  }

  private setupEventListeners() {
    if ('matchMedia' in window) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
      
      prefersReducedMotion.addEventListener('change', (e) => {
        this.crisisConfig.enableReducedMotion = e.matches;
        this.announceConfigChange('Reduced motion preference updated');
      });

      prefersHighContrast.addEventListener('change', (e) => {
        this.crisisConfig.enableHighContrastMode = e.matches;
        this.announceConfigChange('High contrast preference updated');
      });
    }

    if (this.crisisConfig.enableEmergencyShortcuts) {
      document.addEventListener('keydown', this.handleEmergencyShortcuts);
    }
  }

  private setupCrisisAccessibilityFeatures() {
    if (this.crisisConfig.enableHighContrastMode) {
      document.documentElement.classList.add('high-contrast-mode');
    }
    
    if (this.crisisConfig.enableReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }

    if (this.crisisConfig.enableLargeText) {
      document.documentElement.classList.add('large-text-mode');
    }
  }

  private handleEmergencyShortcuts = (event: KeyboardEvent) => {
    if (event.key === this.crisisConfig.emergencyShortcutKey) {
      event.preventDefault();
      this.announceCrisisShortcut();
    }
    
    if (event.ctrlKey && event.altKey) {
      switch (event.key) {
        case 'h':
          this.announceHelp();
          break;
        case 'c':
          this.announceCrisisResources();
          break;
        case 's':
          this.announceSkipToMain();
          break;
      }
    }
  };

  public announce(message: string, priority: AnnouncementPriority = 'polite', options?: Partial<AccessibilityAnnouncement>): string {
    const announcement: AccessibilityAnnouncement = {
      id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      priority,
      type: 'status',
      timestamp: Date.now(),
      delay: 0,
      interrupt: false,
      repeat: 1,
      ...options,
    };

    this.announcementQueue.push(announcement);
    this.processAnnouncementQueue();
    
    this.listeners.forEach(listener => listener(announcement));
    
    logger.debug(`Screen reader announcement queued: "${message}" (${priority})`);
    return announcement.id;
  }

  public announceCrisis(message: string, emergencyContact?: string): string {
    const fullMessage = emergencyContact 
      ? `CRISIS ALERT: ${message}. Emergency contact available: ${emergencyContact}`
      : `CRISIS ALERT: ${message}`;

    return this.announce(fullMessage, 'assertive', {
      type: 'alert',
      delay: this.crisisConfig.crisisAnnouncementDelay,
      interrupt: true,
      repeat: 2,
    });
  }

  public announceNavigation(destination: string, context?: string): string {
    const message = context 
      ? `Navigating to ${destination}. ${context}`
      : `Navigating to ${destination}`;
    
    return this.announce(message, 'polite', { type: 'status' });
  }

  public announceFormValidation(fieldName: string, error: string): string {
    const message = `${fieldName}: ${error}`;
    return this.announce(message, 'assertive', { type: 'alert' });
  }

  public announceProgress(operation: string, percentage: number): string {
    const message = `${operation} progress: ${percentage}% complete`;
    return this.announce(message, 'polite', { type: 'status' });
  }

  public announceConnectionStatus(isOnline: boolean): string {
    const message = isOnline 
      ? 'Connection restored. All features are now available.'
      : 'Connection lost. Some features may be limited. Crisis resources remain available offline.';
    
    return this.announce(message, 'assertive', { type: 'alert' });
  }

  private async processAnnouncementQueue() {
    if (this.isProcessingQueue || this.announcementQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.announcementQueue.length > 0) {
      const announcement = this.announcementQueue.shift()!;
      
      if (announcement.interrupt) {
        this.clearLiveRegions();
      }

      if (announcement.delay && announcement.delay > 0) {
        await this.delay(announcement.delay);
      }

      for (let i = 0; i < (announcement.repeat || 1); i++) {
        await this.performAnnouncement(announcement);
        if (i < (announcement.repeat || 1) - 1) {
          await this.delay(1000);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private async performAnnouncement(announcement: AccessibilityAnnouncement) {
    const liveRegion = this.liveRegions.get(announcement.priority);
    if (!liveRegion) {
      logger.warn(`Live region not found for priority: ${announcement.priority}`);
      return;
    }

    liveRegion.textContent = '';
    await this.delay(50);

    liveRegion.textContent = announcement.message;
    
    logger.debug(`Screen reader announcement made: "${announcement.message}" (${announcement.priority})`);

    setTimeout(() => {
      if (liveRegion.textContent === announcement.message) {
        liveRegion.textContent = '';
      }
    }, 10000);
  }

  private clearLiveRegions() {
    this.liveRegions.forEach(region => {
      region.textContent = '';
    });
  }

  private announceConfigChange(message: string) {
    this.announce(`Accessibility setting changed: ${message}`, 'polite');
  }

  private announceCrisisShortcut() {
    this.announce(
      'Emergency shortcut activated. Press Ctrl+Alt+C for crisis resources, Ctrl+Alt+H for help, or contact emergency services if in immediate danger.',
      'assertive',
      { type: 'alert', interrupt: true }
    );
  }

  private announceHelp() {
    this.announce(
      'Help available. Use Tab to navigate, Enter to activate, Escape to close dialogs. Press F1 for emergency shortcuts.',
      'polite',
      { type: 'status' }
    );
  }

  private announceCrisisResources() {
    this.announce(
      'Crisis resources available. Safety plan, emergency contacts, and coping strategies accessible in main menu.',
      'assertive',
      { type: 'alert' }
    );
  }

  private announceSkipToMain() {
    const mainContent = document.querySelector('main') || document.querySelector('#main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      this.announce('Skipped to main content', 'polite');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public updateCrisisConfig(config: Partial<CrisisAccessibilityConfig>) {
    this.crisisConfig = { ...this.crisisConfig, ...config };
    this.setupCrisisAccessibilityFeatures();
    logger.info('Crisis accessibility config updated:', config);
  }

  public getCapabilities(): ScreenReaderCapabilities {
    return { ...this.capabilities };
  }

  public getCrisisConfig(): CrisisAccessibilityConfig {
    return { ...this.crisisConfig };
  }

  public subscribe(listener: (announcement: AccessibilityAnnouncement) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public clearQueue(): void {
    this.announcementQueue.length = 0;
    this.clearLiveRegions();
    logger.debug('Screen reader announcement queue cleared');
  }

  public destroy() {
    document.removeEventListener('keydown', this.handleEmergencyShortcuts);
    
    this.liveRegions.forEach(region => {
      if (region.parentNode) {
        region.parentNode.removeChild(region);
      }
    });
    
    this.liveRegions.clear();
    this.listeners.clear();
    this.clearQueue();
    
    logger.info('ScreenReaderService destroyed');
  }
}

export const screenReaderService = new ScreenReaderService();

export const useScreenReader = () => {
  const [announcements, setAnnouncements] = React.useState<AccessibilityAnnouncement[]>([]);

  useEffect(() => {
    const unsubscribe = screenReaderService.subscribe((announcement) => {
      setAnnouncements(prev => [...prev.slice(-9), announcement]);
    });

    return unsubscribe;
  }, []);

  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite', options?: Partial<AccessibilityAnnouncement>) => {
    return screenReaderService.announce(message, priority, options);
  }, []);

  const announceCrisis = useCallback((message: string, emergencyContact?: string) => {
    return screenReaderService.announceCrisis(message, emergencyContact);
  }, []);

  const announceNavigation = useCallback((destination: string, context?: string) => {
    return screenReaderService.announceNavigation(destination, context);
  }, []);

  return {
    announce,
    announceCrisis,
    announceNavigation,
    announcements,
    capabilities: screenReaderService.getCapabilities(),
    crisisConfig: screenReaderService.getCrisisConfig(),
    updateCrisisConfig: screenReaderService.updateCrisisConfig.bind(screenReaderService),
    clearQueue: screenReaderService.clearQueue.bind(screenReaderService),
  };
};

export const ScreenReaderLiveRegion: React.FC<{
  priority: AnnouncementPriority;
  children?: React.ReactNode;
}> = ({ priority, children }) => {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && children) {
      const text = regionRef.current.textContent || '';
      if (text.trim()) {
        screenReaderService.announce(text, priority);
      }
    }
  }, [children, priority]);

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic="true"
      aria-relevant="additions text"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clipPath: 'inset(50%)',
      }}
    >
      {children}
    </div>
  );
};

export default screenReaderService;
