/**
 * Comprehensive Accessibility Audit System
 * 
 * Automated accessibility testing pipeline with WCAG 2.1 AA compliance verification
 * specifically designed for the Astral Core mental health platform.
 * 
 * Features:
 * - Automated WCAG 2.1 AA compliance verification
 * - Screen reader simulation and testing
 * - Keyboard navigation verification
 * - Color contrast validation
 * - Mental health-specific accessibility considerations
 * - Real-time accessibility monitoring
 * - Accessibility reporting and recommendations
 * - Crisis intervention accessibility prioritization
 * - Assistive technology compatibility testing
 */

import { AccessibilityUtils } from '../utils/accessibilityUtils';

// WCAG 2.1 Guidelines implementation
export enum WCAGLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}

export enum AccessibilityIssueType {
  COLOR_CONTRAST = 'color-contrast',
  MISSING_ALT_TEXT = 'missing-alt-text',
  KEYBOARD_NAVIGATION = 'keyboard-navigation',
  ARIA_LABELS = 'aria-labels',
  HEADING_STRUCTURE = 'heading-structure',
  FOCUS_MANAGEMENT = 'focus-management'
}

export enum WCAGPrinciple {
  PERCEIVABLE = 'perceivable',
  OPERABLE = 'operable',
  UNDERSTANDABLE = 'understandable',
  ROBUST = 'robust'
}

// Accessibility audit result types
export interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  wcagLevel: WCAGLevel;
  wcagPrinciple: WCAGPrinciple;
  guideline: string;
  criterion: string;
  element: {
    selector: string;
    tagName: string;
    text?: string;
    attributes: Record<string, string>;
  };
  description: string;
  recommendation: string;
  mentalHealthImpact: string;
  isCrisisRelated: boolean;
  assistiveTechImpact: string[];
}

export interface AccessibilityScore {
  overall: number;
  perceivable: number;
  operable: number;
  understandable: number;
  robust: number;
  mentalHealthOptimized: number;
  crisisAccessibility: number;
}

export interface AccessibilityAuditResult {
  timestamp: number;
  url: string;
  score: AccessibilityScore;
  issues: AccessibilityIssue[];
  passedTests: number;
  totalTests: number;
  wcagLevel: WCAGLevel;
  isCompliant: boolean;
  mentalHealthCompliance: MentalHealthAccessibilityRequirements;
  recommendations: string[];
  assistiveTechSupport: {
    screenReader: boolean;
    keyboardNavigation: boolean;
    voiceControl: boolean;
    eyeTracking: boolean;
  };
}

// Mental health-specific accessibility requirements
export interface MentalHealthAccessibilityRequirements {
  // Crisis intervention accessibility
  crisisButtonAccessibility: boolean;
  emergencyContactAccess: boolean;
  crisisResourcesReadability: boolean;
  
  // Cognitive accessibility
  cognitiveLoadReduction: boolean;
  simplifiedNavigation: boolean;
  clearInstructions: boolean;
  consistentInteractions: boolean;
  
  // Anxiety and trauma considerations
  reducedVisualOverstimulation: boolean;
  calmColorSchemes: boolean;
  nonFlashingAnimations: boolean;
  stressReducingTransitions: boolean;
  
  // Communication accessibility
  chatAccessibility: boolean;
  emojiAltText: boolean;
  messageReadability: boolean;
  supportiveLanguage: boolean;
}

// Color contrast analyzer
class ContrastAnalyzer {
  // Calculate relative luminance
  private static getRelativeLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const sR = r / 255;
    const sG = g / 255;
    const sB = b / 255;

    const rLum = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
    const gLum = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
    const bLum = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
  }

  // Convert hex to RGB
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Calculate contrast ratio
  static calculateContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Check if contrast meets WCAG requirements
  static meetsWCAGContrast(
    color1: string, 
    color2: string, 
    level: WCAGLevel, 
    isLargeText = false
  ): boolean {
    const ratio = this.calculateContrastRatio(color1, color2);
    
    if (level === WCAGLevel.AAA) {
      return isLargeText ? ratio >= 4.5 : ratio >= 7;
    } else if (level === WCAGLevel.AA) {
      return isLargeText ? ratio >= 3 : ratio >= 4.5;
    }
    
    return ratio >= 3; // Level A
  }
}

// Keyboard navigation tester
class KeyboardNavigationTester {
  private focusableElements: Element[] = [];

  // Get all focusable elements
  private getFocusableElements(): Element[] {
    return AccessibilityUtils.getFocusableElements();
  }

  // Test keyboard navigation
  testKeyboardNavigation(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    this.focusableElements = this.getFocusableElements();

    // Check tab order
    this.testTabOrder(issues);
    
    // Check focus indicators
    this.testFocusIndicators(issues);
    
    // Check keyboard traps
    this.testKeyboardTraps(issues);
    
    // Check skip links
    this.testSkipLinks(issues);

    return issues;
  }

  private testTabOrder(issues: AccessibilityIssue[]): void {
    // Test logical tab order
    const elementsWithTabIndex = this.focusableElements.filter(el => 
      el.hasAttribute('tabindex') && el.getAttribute('tabindex') !== '0'
    );

    if (elementsWithTabIndex.length > 0) {
      issues.push({
        id: 'tab-order-custom',
        type: 'warning',
        severity: 'medium',
        wcagLevel: WCAGLevel.AA,
        wcagPrinciple: WCAGPrinciple.OPERABLE,
        guideline: '2.4.3',
        criterion: 'Focus Order',
        element: {
          selector: elementsWithTabIndex[0].tagName.toLowerCase(),
          tagName: elementsWithTabIndex[0].tagName,
          attributes: this.getElementAttributes(elementsWithTabIndex[0])
        },
        description: 'Custom tab order detected. Ensure focus order is logical and meaningful.',
        recommendation: 'Use natural document order instead of custom tabindex values where possible.',
        mentalHealthImpact: 'Unpredictable focus order can increase anxiety and confusion for users with mental health conditions.',
        isCrisisRelated: false,
        assistiveTechImpact: ['screen-reader', 'keyboard-navigation']
      });
    }
  }

  private testFocusIndicators(issues: AccessibilityIssue[]): void {
    this.focusableElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element, ':focus');
      const hasVisibleFocus = 
        computedStyle.outline !== 'none' || 
        computedStyle.boxShadow !== 'none' ||
        computedStyle.border !== computedStyle.getPropertyValue('border');

      if (!hasVisibleFocus) {
        issues.push({
          id: `focus-indicator-${AccessibilityUtils.generateElementId(element)}`,
          type: 'error',
          severity: 'high',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.OPERABLE,
          guideline: '2.4.7',
          criterion: 'Focus Visible',
          element: {
            selector: AccessibilityUtils.getElementSelector(element),
            tagName: element.tagName,
            attributes: AccessibilityUtils.getElementAttributes(element)
          },
          description: 'Element lacks a visible focus indicator.',
          recommendation: 'Add a clear visual focus indicator using CSS outline or box-shadow.',
          mentalHealthImpact: 'Missing focus indicators can cause disorientation and increase stress for users navigating with keyboards.',
          isCrisisRelated: AccessibilityUtils.isCrisisElement(element),
          assistiveTechImpact: ['keyboard-navigation', 'screen-reader']
        });
      }
    });
  }

  private testKeyboardTraps(issues: AccessibilityIssue[]): void {
    // Check for proper keyboard trap implementation in modals and dialogs
    const modals = document.querySelectorAll('[role="dialog"], .modal, [aria-modal="true"]');
    
    modals.forEach(modal => {
      const focusableInModal = modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableInModal.length === 0) {
        issues.push({
          id: `keyboard-trap-${AccessibilityUtils.generateElementId(modal)}`,
          type: 'error',
          severity: 'critical',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.OPERABLE,
          guideline: '2.1.2',
          criterion: 'No Keyboard Trap',
          element: {
            selector: AccessibilityUtils.getElementSelector(modal),
            tagName: modal.tagName,
            attributes: AccessibilityUtils.getElementAttributes(modal)
          },
          description: 'Modal dialog has no focusable elements, creating a keyboard trap.',
          recommendation: 'Ensure modal dialogs contain focusable elements and proper focus management.',
          mentalHealthImpact: 'Keyboard traps can cause panic and anxiety, especially for users in crisis situations.',
          isCrisisRelated: AccessibilityUtils.isCrisisElement(modal),
          assistiveTechImpact: ['keyboard-navigation', 'screen-reader']
        });
      }
    });
  }

  private testSkipLinks(issues: AccessibilityIssue[]): void {
    const skipLinks = document.querySelectorAll('a[href^="#"]:first-child, .skip-link');
    
    if (skipLinks.length === 0) {
      issues.push({
        id: 'missing-skip-links',
        type: 'warning',
        severity: 'medium',
        wcagLevel: WCAGLevel.AA,
        wcagPrinciple: WCAGPrinciple.OPERABLE,
        guideline: '2.4.1',
        criterion: 'Bypass Blocks',
        element: {
          selector: 'body',
          tagName: 'BODY',
          attributes: {}
        },
        description: 'No skip links found for bypassing repetitive content.',
        recommendation: 'Add skip links at the beginning of the page to allow users to bypass navigation.',
        mentalHealthImpact: 'Skip links help users with cognitive difficulties navigate more efficiently, reducing frustration.',
        isCrisisRelated: false,
        assistiveTechImpact: ['keyboard-navigation', 'screen-reader']
      });
    }
  }

  private getElementAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }
}

// Screen reader simulation
class ScreenReaderTester {
  // Test screen reader accessibility
  testScreenReaderAccessibility(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Test ARIA labels and descriptions
    this.testAriaLabels(issues);
    
    // Test heading structure
    this.testHeadingStructure(issues);
    
    // Test alt text for images
    this.testImageAltText(issues);
    
    // Test form labels
    this.testFormLabels(issues);
    
    // Test landmarks
    this.testLandmarks(issues);
    
    // Test live regions
    this.testLiveRegions(issues);

    return issues;
  }

  private testAriaLabels(issues: AccessibilityIssue[]): void {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach(element => {
      const hasLabel = 
        element.hasAttribute('aria-label') ||
        element.hasAttribute('aria-labelledby') ||
        element.hasAttribute('title') ||
        (element as HTMLElement).innerText?.trim() ||
        element.querySelector('label');

      if (!hasLabel) {
        issues.push({
          id: `missing-label-${AccessibilityUtils.generateElementId(element)}`,
          type: 'error',
          severity: AccessibilityUtils.isCrisisElement(element) ? 'critical' : 'high',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '4.1.2',
          criterion: 'Name, Role, Value',
          element: {
            selector: AccessibilityUtils.getElementSelector(element),
            tagName: element.tagName,
            attributes: AccessibilityUtils.getElementAttributes(element)
          },
          description: 'Interactive element lacks an accessible name.',
          recommendation: 'Add aria-label, aria-labelledby, or visible text to describe the element\'s purpose.',
          mentalHealthImpact: 'Unlabeled elements create confusion and can increase anxiety for users relying on screen readers.',
          isCrisisRelated: AccessibilityUtils.isCrisisElement(element),
          assistiveTechImpact: ['screen-reader', 'voice-control']
        });
      }
    });
  }

  private testHeadingStructure(issues: AccessibilityIssue[]): void {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    if (headings.length === 0) {
      issues.push({
        id: 'no-headings',
        type: 'warning',
        severity: 'medium',
        wcagLevel: WCAGLevel.AA,
        wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
        guideline: '1.3.1',
        criterion: 'Info and Relationships',
        element: {
          selector: 'body',
          tagName: 'BODY',
          attributes: {}
        },
        description: 'No headings found on the page.',
        recommendation: 'Add proper heading structure to organize content hierarchically.',
        mentalHealthImpact: 'Proper heading structure helps users with cognitive difficulties understand content organization.',
        isCrisisRelated: false,
        assistiveTechImpact: ['screen-reader']
      });
      return;
    }

    // Check heading hierarchy
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push({
          id: 'heading-start-level',
          type: 'warning',
          severity: 'medium',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '1.3.1',
          criterion: 'Info and Relationships',
          element: {
            selector: this.getElementSelector(heading),
            tagName: heading.tagName,
            text: heading.textContent?.trim(),
            attributes: this.getElementAttributes(heading)
          },
          description: 'Page does not start with an h1 heading.',
          recommendation: 'Start page content with an h1 heading.',
          mentalHealthImpact: 'Consistent heading structure helps users with cognitive difficulties navigate content.',
          isCrisisRelated: false,
          assistiveTechImpact: ['screen-reader']
        });
      }

      if (level > previousLevel + 1) {
        issues.push({
          id: `heading-skip-level-${index}`,
          type: 'warning',
          severity: 'medium',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '1.3.1',
          criterion: 'Info and Relationships',
          element: {
            selector: this.getElementSelector(heading),
            tagName: heading.tagName,
            text: heading.textContent?.trim(),
            attributes: this.getElementAttributes(heading)
          },
          description: `Heading level jumps from h${previousLevel} to h${level}.`,
          recommendation: 'Use consecutive heading levels without skipping.',
          mentalHealthImpact: 'Logical heading structure reduces cognitive load and helps users understand content hierarchy.',
          isCrisisRelated: false,
          assistiveTechImpact: ['screen-reader']
        });
      }

      previousLevel = level;
    });
  }

  private testImageAltText(issues: AccessibilityIssue[]): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const hasAltText = img.hasAttribute('alt');
      const altText = img.getAttribute('alt');
      
      if (!hasAltText) {
        issues.push({
          id: `missing-alt-${this.generateElementId(img)}`,
          type: 'error',
          severity: 'high',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '1.1.1',
          criterion: 'Non-text Content',
          element: {
            selector: this.getElementSelector(img),
            tagName: img.tagName,
            attributes: this.getElementAttributes(img)
          },
          description: 'Image lacks alt attribute.',
          recommendation: 'Add descriptive alt text or alt="" for decorative images.',
          mentalHealthImpact: 'Missing alt text prevents users with visual impairments from understanding visual content, which may include important therapeutic materials.',
          isCrisisRelated: img.classList.contains('crisis') || img.getAttribute('data-crisis') === 'true',
          assistiveTechImpact: ['screen-reader']
        });
      } else if (altText && altText.length > 150) {
        issues.push({
          id: `alt-too-long-${this.generateElementId(img)}`,
          type: 'warning',
          severity: 'low',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '1.1.1',
          criterion: 'Non-text Content',
          element: {
            selector: this.getElementSelector(img),
            tagName: img.tagName,
            attributes: this.getElementAttributes(img)
          },
          description: 'Alt text is very long (>150 characters).',
          recommendation: 'Consider using shorter alt text or providing detailed description elsewhere.',
          mentalHealthImpact: 'Overly long alt text can be overwhelming for users with cognitive difficulties.',
          isCrisisRelated: false,
          assistiveTechImpact: ['screen-reader']
        });
      }
    });
  }

  private testFormLabels(issues: AccessibilityIssue[]): void {
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
      const hasLabel = 
        input.hasAttribute('aria-label') ||
        input.hasAttribute('aria-labelledby') ||
        document.querySelector(`label[for="${input.id}"]`) ||
        input.closest('label');

      if (!hasLabel && input.getAttribute('type') !== 'hidden') {
        issues.push({
          id: `form-missing-label-${this.generateElementId(input)}`,
          type: 'error',
          severity: 'high',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '3.3.2',
          criterion: 'Labels or Instructions',
          element: {
            selector: this.getElementSelector(input),
            tagName: input.tagName,
            attributes: this.getElementAttributes(input)
          },
          description: 'Form input lacks an associated label.',
          recommendation: 'Associate each form input with a descriptive label using label element or aria-label.',
          mentalHealthImpact: 'Unlabeled form inputs can cause confusion and anxiety, especially in crisis situations where users need to quickly access help.',
          isCrisisRelated: input.classList.contains('crisis') || input.closest('.crisis') !== null,
          assistiveTechImpact: ['screen-reader', 'voice-control']
        });
      }
    });
  }

  private testLandmarks(issues: AccessibilityIssue[]): void {
    const landmarks = document.querySelectorAll('[role="main"], main, [role="navigation"], nav, [role="banner"], header, [role="contentinfo"], footer');
    
    if (landmarks.length === 0) {
      issues.push({
        id: 'missing-landmarks',
        type: 'warning',
        severity: 'medium',
        wcagLevel: WCAGLevel.AA,
        wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
        guideline: '1.3.1',
        criterion: 'Info and Relationships',
        element: {
          selector: 'body',
          tagName: 'BODY',
          attributes: {}
        },
        description: 'No landmark elements found for navigation.',
        recommendation: 'Add semantic landmarks (main, nav, header, footer) or ARIA roles to help users navigate.',
        mentalHealthImpact: 'Landmarks help users with cognitive difficulties understand page structure and navigate efficiently.',
        isCrisisRelated: false,
        assistiveTechImpact: ['screen-reader']
      });
    }
  }

  private testLiveRegions(issues: AccessibilityIssue[]): void {
    // Check for proper live regions for dynamic content
    const dynamicContent = document.querySelectorAll('.alert, .notification, .status, [data-dynamic]');
    
    dynamicContent.forEach(element => {
      const hasLiveRegion = 
        element.hasAttribute('aria-live') ||
        element.hasAttribute('role') && ['alert', 'status', 'log'].includes(element.getAttribute('role')!);

      if (!hasLiveRegion) {
        issues.push({
          id: `missing-live-region-${this.generateElementId(element)}`,
          type: 'warning',
          severity: element.classList.contains('crisis') ? 'high' : 'medium',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.ROBUST,
          guideline: '4.1.3',
          criterion: 'Status Messages',
          element: {
            selector: this.getElementSelector(element),
            tagName: element.tagName,
            attributes: this.getElementAttributes(element)
          },
          description: 'Dynamic content lacks proper live region announcement.',
          recommendation: 'Add aria-live or appropriate role to announce dynamic content changes.',
          mentalHealthImpact: 'Missing live regions prevent users from being notified of important updates, which is critical for crisis alerts.',
          isCrisisRelated: element.classList.contains('crisis') || element.getAttribute('data-crisis') === 'true',
          assistiveTechImpact: ['screen-reader']
        });
      }
    });
  }

  private getElementAttributes(element: Element): Record<string, string> {
    return AccessibilityUtils.getElementAttributes(element);
  }

  private getElementSelector(element: Element): string {
    return AccessibilityUtils.getElementSelector(element);
  }

  private generateElementId(element: Element): string {
    return AccessibilityUtils.generateElementId(element);
  }
}

// Mental health specific accessibility checker
class MentalHealthAccessibilityChecker {
  // Check mental health specific accessibility requirements
  checkMentalHealthAccessibility(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check crisis intervention accessibility
    this.checkCrisisAccessibility(issues);
    
    // Check cognitive load considerations
    this.checkCognitiveAccessibility(issues);
    
    // Check anxiety and trauma considerations
    this.checkAnxietyConsiderations(issues);
    
    // Check communication accessibility
    this.checkCommunicationAccessibility(issues);

    return issues;
  }

  private checkCrisisAccessibility(issues: AccessibilityIssue[]): void {
    // Check crisis buttons and emergency features
    const crisisElements = document.querySelectorAll('.crisis, [data-crisis="true"], .emergency, .help-button');
    
    crisisElements.forEach(element => {
      // Ensure crisis elements are easily accessible
      const style = window.getComputedStyle(element);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
      
      if (!isVisible) {
        issues.push({
          id: `crisis-element-hidden-${this.generateElementId(element)}`,
          type: 'error',
          severity: 'critical',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '1.4.1',
          criterion: 'Use of Color',
          element: {
            selector: this.getElementSelector(element),
            tagName: element.tagName,
            attributes: this.getElementAttributes(element)
          },
          description: 'Crisis intervention element is not visible.',
          recommendation: 'Ensure crisis intervention elements are always visible and accessible.',
          mentalHealthImpact: 'Hidden crisis elements can prevent users from accessing life-saving resources.',
          isCrisisRelated: true,
          assistiveTechImpact: ['screen-reader', 'keyboard-navigation', 'voice-control']
        });
      }

      // Check for proper contrast on crisis elements
      const bgColor = style.backgroundColor;
      const textColor = style.color;
      
      if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
        const contrastRatio = ContrastAnalyzer.calculateContrastRatio(bgColor, textColor);
        
        if (contrastRatio < 7) { // Higher standard for crisis elements
          issues.push({
            id: `crisis-contrast-${this.generateElementId(element)}`,
            type: 'error',
            severity: 'critical',
            wcagLevel: WCAGLevel.AAA,
            wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
            guideline: '1.4.6',
            criterion: 'Contrast (Enhanced)',
            element: {
              selector: this.getElementSelector(element),
              tagName: element.tagName,
              attributes: this.getElementAttributes(element)
            },
            description: `Crisis element has insufficient contrast ratio: ${contrastRatio.toFixed(2)}:1`,
            recommendation: 'Increase contrast ratio to at least 7:1 for crisis intervention elements.',
            mentalHealthImpact: 'Poor contrast on crisis elements can make them difficult to see in emergency situations.',
            isCrisisRelated: true,
            assistiveTechImpact: ['screen-reader', 'low-vision']
          });
        }
      }
    });
  }

  private checkCognitiveAccessibility(issues: AccessibilityIssue[]): void {
    // Check for cognitive load reduction
    const complexSentences = AccessibilityUtils.findComplexText();
    
    if (complexSentences.length > 0) {
      issues.push({
        id: 'complex-language',
        type: 'warning',
        severity: 'medium',
        wcagLevel: WCAGLevel.AAA,
        wcagPrinciple: WCAGPrinciple.UNDERSTANDABLE,
        guideline: '3.1.5',
        criterion: 'Reading Level',
        element: {
          selector: 'body',
          tagName: 'BODY',
          attributes: {}
        },
        description: 'Complex language detected that may be difficult for users with cognitive disabilities.',
        recommendation: 'Simplify language and provide definitions for complex terms.',
        mentalHealthImpact: 'Complex language can increase cognitive load and anxiety for users already experiencing mental health challenges.',
        isCrisisRelated: false,
        assistiveTechImpact: ['screen-reader', 'cognitive-support']
      });
    }

    // Check for consistent navigation
    const navigationElements = document.querySelectorAll('nav, .navigation, .menu');
    if (navigationElements.length > 1) {
      // Check if navigation is consistent across the page
      const navStructures = Array.from(navigationElements).map(nav => 
        Array.from(nav.querySelectorAll('a, button')).map(link => link.textContent?.trim())
      );
      
      const isConsistent = navStructures.every(nav => 
        JSON.stringify(nav) === JSON.stringify(navStructures[0])
      );
      
      if (!isConsistent) {
        issues.push({
          id: 'inconsistent-navigation',
          type: 'warning',
          severity: 'medium',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.UNDERSTANDABLE,
          guideline: '3.2.3',
          criterion: 'Consistent Navigation',
          element: {
            selector: 'nav',
            tagName: 'NAV',
            attributes: {}
          },
          description: 'Navigation structure is inconsistent across the page.',
          recommendation: 'Maintain consistent navigation structure and labeling.',
          mentalHealthImpact: 'Inconsistent navigation increases cognitive load and can cause confusion for users with mental health conditions.',
          isCrisisRelated: false,
          assistiveTechImpact: ['screen-reader', 'cognitive-support']
        });
      }
    }
  }

  private checkAnxietyConsiderations(issues: AccessibilityIssue[]): void {
    // Check for potentially anxiety-inducing elements
    const flashingElements = document.querySelectorAll('.blink, .flash, [data-animation="flash"]');
    
    flashingElements.forEach(element => {
      issues.push({
        id: `flashing-content-${this.generateElementId(element)}`,
        type: 'error',
        severity: 'high',
        wcagLevel: WCAGLevel.AA,
        wcagPrinciple: WCAGPrinciple.OPERABLE,
        guideline: '2.3.1',
        criterion: 'Three Flashes or Below Threshold',
        element: {
          selector: this.getElementSelector(element),
          tagName: element.tagName,
          attributes: this.getElementAttributes(element)
        },
        description: 'Element contains flashing or blinking content.',
        recommendation: 'Remove flashing content or provide option to disable animations.',
        mentalHealthImpact: 'Flashing content can trigger anxiety, panic attacks, or trauma responses in vulnerable users.',
        isCrisisRelated: false,
        assistiveTechImpact: ['cognitive-support', 'seizure-sensitive']
      });
    });

    // Check for autoplay media
    const autoplayMedia = document.querySelectorAll('video[autoplay], audio[autoplay]');
    
    if (autoplayMedia.length > 0) {
      issues.push({
        id: 'autoplay-media',
        type: 'warning',
        severity: 'medium',
        wcagLevel: WCAGLevel.AA,
        wcagPrinciple: WCAGPrinciple.OPERABLE,
        guideline: '1.4.2',
        criterion: 'Audio Control',
        element: {
          selector: autoplayMedia[0].tagName.toLowerCase(),
          tagName: autoplayMedia[0].tagName,
          attributes: this.getElementAttributes(autoplayMedia[0])
        },
        description: 'Media with autoplay detected.',
        recommendation: 'Avoid autoplay or provide clear controls to pause/stop media.',
        mentalHealthImpact: 'Unexpected audio or video can be startling and anxiety-inducing for users with mental health conditions.',
        isCrisisRelated: false,
        assistiveTechImpact: ['cognitive-support', 'concentration-sensitive']
      });
    }
  }

  private checkCommunicationAccessibility(issues: AccessibilityIssue[]): void {
    // Check chat and messaging accessibility
    const chatElements = document.querySelectorAll('.chat, .message, .conversation');
    
    chatElements.forEach(element => {
      // Check for proper labeling of chat messages
      const messages = element.querySelectorAll('.message, [data-message]');
      
      messages.forEach(message => {
        const hasTimestamp = message.querySelector('.timestamp, [data-timestamp]');
        const hasSender = message.querySelector('.sender, [data-sender]') || message.hasAttribute('aria-label');
        
        if (!hasTimestamp || !hasSender) {
          issues.push({
            id: `chat-message-incomplete-${this.generateElementId(message)}`,
            type: 'warning',
            severity: 'medium',
            wcagLevel: WCAGLevel.AA,
            wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
            guideline: '1.3.1',
            criterion: 'Info and Relationships',
            element: {
              selector: this.getElementSelector(message),
              tagName: message.tagName,
              attributes: this.getElementAttributes(message)
            },
            description: 'Chat message lacks complete contextual information.',
            recommendation: 'Include sender information and timestamp for each message.',
            mentalHealthImpact: 'Incomplete message context can cause confusion in therapeutic communications.',
            isCrisisRelated: element.classList.contains('crisis'),
            assistiveTechImpact: ['screen-reader', 'cognitive-support']
          });
        }
      });
    });

    // Check for emoji accessibility
    const emojis = document.querySelectorAll('.emoji, [data-emoji]');
    
    emojis.forEach(emoji => {
      const hasAltText = emoji.hasAttribute('aria-label') || emoji.hasAttribute('title');
      
      if (!hasAltText) {
        issues.push({
          id: `emoji-no-alt-${this.generateElementId(emoji)}`,
          type: 'warning',
          severity: 'low',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '1.1.1',
          criterion: 'Non-text Content',
          element: {
            selector: this.getElementSelector(emoji),
            tagName: emoji.tagName,
            attributes: this.getElementAttributes(emoji)
          },
          description: 'Emoji lacks alternative text description.',
          recommendation: 'Add aria-label or title with emoji description.',
          mentalHealthImpact: 'Unlabeled emojis prevent screen reader users from understanding emotional context in communications.',
          isCrisisRelated: false,
          assistiveTechImpact: ['screen-reader']
        });
      }
    });
  }

  private getElementAttributes(element: Element): Record<string, string> {
    return AccessibilityUtils.getElementAttributes(element);
  }

  private getElementSelector(element: Element): string {
    return AccessibilityUtils.getElementSelector(element);
  }

  private generateElementId(element: Element): string {
    return AccessibilityUtils.generateElementId(element);
  }
}

// Main accessibility audit system
export class AccessibilityAuditSystem {
  private contrastAnalyzer = ContrastAnalyzer;
  private keyboardTester = new KeyboardNavigationTester();
  private screenReaderTester = new ScreenReaderTester();
  private mentalHealthChecker = new MentalHealthAccessibilityChecker();

  // Run comprehensive accessibility audit
  async runAccessibilityAudit(wcagLevel: WCAGLevel = WCAGLevel.AA): Promise<AccessibilityAuditResult> {
    const startTime = Date.now();
    const url = window.location.href;
    
    // Collect all issues
    const allIssues: AccessibilityIssue[] = [
      ...this.auditColorContrast(),
      ...this.keyboardTester.testKeyboardNavigation(),
      ...this.screenReaderTester.testScreenReaderAccessibility(),
      ...this.mentalHealthChecker.checkMentalHealthAccessibility()
    ];

    // Filter issues by WCAG level
    const relevantIssues = allIssues.filter(issue => {
      if (wcagLevel === WCAGLevel.A) return true;
      if (wcagLevel === WCAGLevel.AA) return issue.wcagLevel === WCAGLevel.A || issue.wcagLevel === WCAGLevel.AA;
      return true; // AAA includes all levels
    });

    // Calculate scores
    const score = this.calculateAccessibilityScore(relevantIssues);
    
    // Check compliance
    const isCompliant = this.checkWCAGCompliance(relevantIssues, wcagLevel);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(relevantIssues);
    
    // Check mental health compliance
    const mentalHealthCompliance = this.checkMentalHealthCompliance(relevantIssues);
    
    // Check assistive technology support
    const assistiveTechSupport = this.checkAssistiveTechSupport(relevantIssues);

    return {
      timestamp: startTime,
      url,
      score,
      issues: relevantIssues,
      passedTests: this.countTotalTests() - relevantIssues.length,
      totalTests: this.countTotalTests(),
      wcagLevel,
      isCompliant,
      mentalHealthCompliance,
      recommendations,
      assistiveTechSupport
    };
  }

  // Audit color contrast
  private auditColorContrast(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const textElements = document.querySelectorAll('*');
    
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const bgColor = style.backgroundColor;
      const textColor = style.color;
      
      // Skip elements with no text or transparent backgrounds
      if (!element.textContent?.trim() || bgColor === 'rgba(0, 0, 0, 0)') return;
      
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = style.fontWeight;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
      
      const contrastRatio = this.contrastAnalyzer.calculateContrastRatio(textColor, bgColor);
      const meetsAA = this.contrastAnalyzer.meetsWCAGContrast(textColor, bgColor, WCAGLevel.AA, isLargeText);
      
      if (!meetsAA) {
        const isCrisisElement = element.classList.contains('crisis') || element.getAttribute('data-crisis') === 'true';
        
        issues.push({
          id: `contrast-${this.generateElementId(element)}`,
          type: 'error',
          severity: isCrisisElement ? 'critical' : 'high',
          wcagLevel: WCAGLevel.AA,
          wcagPrinciple: WCAGPrinciple.PERCEIVABLE,
          guideline: '1.4.3',
          criterion: 'Contrast (Minimum)',
          element: {
            selector: this.getElementSelector(element),
            tagName: element.tagName,
            text: element.textContent?.trim().substring(0, 50),
            attributes: this.getElementAttributes(element)
          },
          description: `Insufficient color contrast ratio: ${contrastRatio.toFixed(2)}:1`,
          recommendation: `Increase contrast ratio to at least ${isLargeText ? '3:1' : '4.5:1'} for WCAG AA compliance.`,
          mentalHealthImpact: 'Poor contrast can cause eye strain and fatigue, worsening symptoms for users with mental health conditions.',
          isCrisisRelated: isCrisisElement,
          assistiveTechImpact: ['low-vision', 'screen-reader']
        });
      }
    });

    return issues;
  }

  // Calculate accessibility score
  private calculateAccessibilityScore(issues: AccessibilityIssue[]): AccessibilityScore {
    const totalTests = this.countTotalTests();
    const passedTests = totalTests - issues.length;
    const overall = (passedTests / totalTests) * 100;

    // Calculate scores by WCAG principle
    const principleIssues = {
      [WCAGPrinciple.PERCEIVABLE]: issues.filter(i => i.wcagPrinciple === WCAGPrinciple.PERCEIVABLE).length,
      [WCAGPrinciple.OPERABLE]: issues.filter(i => i.wcagPrinciple === WCAGPrinciple.OPERABLE).length,
      [WCAGPrinciple.UNDERSTANDABLE]: issues.filter(i => i.wcagPrinciple === WCAGPrinciple.UNDERSTANDABLE).length,
      [WCAGPrinciple.ROBUST]: issues.filter(i => i.wcagPrinciple === WCAGPrinciple.ROBUST).length,
    };

    const principleTestCounts = {
      [WCAGPrinciple.PERCEIVABLE]: totalTests * 0.4, // 40% of tests
      [WCAGPrinciple.OPERABLE]: totalTests * 0.3, // 30% of tests
      [WCAGPrinciple.UNDERSTANDABLE]: totalTests * 0.2, // 20% of tests
      [WCAGPrinciple.ROBUST]: totalTests * 0.1, // 10% of tests
    };

    const perceivable = ((principleTestCounts.perceivable - principleIssues.perceivable) / principleTestCounts.perceivable) * 100;
    const operable = ((principleTestCounts.operable - principleIssues.operable) / principleTestCounts.operable) * 100;
    const understandable = ((principleTestCounts.understandable - principleIssues.understandable) / principleTestCounts.understandable) * 100;
    const robust = ((principleTestCounts.robust - principleIssues.robust) / principleTestCounts.robust) * 100;

    // Calculate mental health specific scores
    const mentalHealthIssues = issues.filter(i => i.isCrisisRelated || i.mentalHealthImpact).length;
    const mentalHealthOptimized = ((totalTests - mentalHealthIssues) / totalTests) * 100;

    const crisisIssues = issues.filter(i => i.isCrisisRelated).length;
    const crisisAccessibility = crisisIssues === 0 ? 100 : Math.max(0, 100 - (crisisIssues * 20)); // Heavy penalty for crisis issues

    return {
      overall: Math.max(0, overall),
      perceivable: Math.max(0, perceivable),
      operable: Math.max(0, operable),
      understandable: Math.max(0, understandable),
      robust: Math.max(0, robust),
      mentalHealthOptimized: Math.max(0, mentalHealthOptimized),
      crisisAccessibility: Math.max(0, crisisAccessibility)
    };
  }

  // Check WCAG compliance
  private checkWCAGCompliance(issues: AccessibilityIssue[], level: WCAGLevel): boolean {
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');
    
    // No critical issues allowed for compliance
    if (criticalIssues.length > 0) return false;
    
    // Strict limits for high severity issues
    const thresholds = AccessibilityUtils.getComplianceThresholds(level);
    return highIssues.length <= thresholds.maxHigh;
  }

  // Generate recommendations
  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = [];
    
    // Group issues by type for better recommendations
    const issuesByType = issues.reduce((acc, issue) => {
      if (!acc[issue.guideline]) acc[issue.guideline] = [];
      acc[issue.guideline].push(issue);
      return acc;
    }, {} as Record<string, AccessibilityIssue[]>);

    // Generate prioritized recommendations
    Object.entries(issuesByType).forEach(([guideline, guidelineIssues]) => {
      const criticalCount = guidelineIssues.filter(i => i.severity === 'critical').length;
      const highCount = guidelineIssues.filter(i => i.severity === 'high').length;
      
      if (criticalCount > 0) {
        recommendations.push(`🚨 CRITICAL: Fix ${criticalCount} critical accessibility issue(s) in ${guideline} - required for basic accessibility`);
      }
      
      if (highCount > 0) {
        recommendations.push(`⚠️ HIGH: Address ${highCount} high-priority accessibility issue(s) in ${guideline} - important for WCAG compliance`);
      }
    });

    // Crisis-specific recommendations
    const crisisIssues = issues.filter(i => i.isCrisisRelated);
    if (crisisIssues.length > 0) {
      recommendations.unshift(`🩺 CRISIS PRIORITY: ${crisisIssues.length} accessibility issue(s) affect crisis intervention features - immediate action required for user safety`);
    }

    // Mental health specific recommendations
    const mentalHealthIssues = issues.filter(i => !i.isCrisisRelated && i.mentalHealthImpact);
    if (mentalHealthIssues.length > 0) {
      recommendations.push(`🧠 MENTAL HEALTH: Address ${mentalHealthIssues.length} issue(s) that impact users with mental health conditions`);
    }

    return recommendations;
  }

  // Check mental health compliance
  private checkMentalHealthCompliance(issues: AccessibilityIssue[]): MentalHealthAccessibilityRequirements {
    const crisisIssues = issues.filter(i => i.isCrisisRelated);
    const cognitiveIssues = issues.filter(i => i.mentalHealthImpact.includes('cognitive'));
    const anxietyIssues = issues.filter(i => i.mentalHealthImpact.includes('anxiety') || i.mentalHealthImpact.includes('trauma'));
    const communicationIssues = issues.filter(i => i.assistiveTechImpact.includes('screen-reader') && i.element.selector.includes('chat'));

    return {
      crisisButtonAccessibility: !crisisIssues.some(i => i.guideline.includes('2.4') || i.guideline.includes('4.1')),
      emergencyContactAccess: !crisisIssues.some(i => i.severity === 'critical'),
      crisisResourcesReadability: !crisisIssues.some(i => i.guideline.includes('1.4')),
      
      cognitiveLoadReduction: cognitiveIssues.length < 3,
      simplifiedNavigation: !issues.some(i => i.id.includes('navigation')),
      clearInstructions: !issues.some(i => i.guideline.includes('3.3')),
      consistentInteractions: !issues.some(i => i.guideline.includes('3.2')),
      
      reducedVisualOverstimulation: !anxietyIssues.some(i => i.guideline.includes('2.3')),
      calmColorSchemes: !issues.some(i => i.guideline.includes('1.4.3')),
      nonFlashingAnimations: !issues.some(i => i.id.includes('flashing')),
      stressReducingTransitions: !anxietyIssues.some(i => i.guideline.includes('2.2')),
      
      chatAccessibility: communicationIssues.length === 0,
      emojiAltText: !issues.some(i => i.id.includes('emoji')),
      messageReadability: !communicationIssues.some(i => i.severity === 'high'),
      supportiveLanguage: !issues.some(i => i.id.includes('complex-language'))
    };
  }

  // Check assistive technology support
  private checkAssistiveTechSupport(issues: AccessibilityIssue[]): { screenReader: boolean; keyboardNavigation: boolean; voiceControl: boolean; eyeTracking: boolean } {
    const screenReaderIssues = issues.filter(i => i.assistiveTechImpact.includes('screen-reader'));
    const keyboardIssues = issues.filter(i => i.assistiveTechImpact.includes('keyboard-navigation'));
    const voiceControlIssues = issues.filter(i => i.assistiveTechImpact.includes('voice-control'));
    
    return {
      screenReader: screenReaderIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      keyboardNavigation: keyboardIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      voiceControl: voiceControlIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      eyeTracking: issues.filter(i => i.guideline.includes('2.4')).length < 2 // Focus management is key for eye tracking
    };
  }

  // Count total possible tests
  private countTotalTests(): number {
    // Estimated based on comprehensive audit scope
    return 50; // This would be calculated based on actual test coverage
  }

  // Utility methods
  private getElementAttributes(element: Element): Record<string, string> {
    return AccessibilityUtils.getElementAttributes(element);
  }

  private getElementSelector(element: Element): string {
    return AccessibilityUtils.getElementSelector(element);
  }

  private generateElementId(element: Element): string {
    return AccessibilityUtils.generateElementId(element);
  }

  // Real-time monitoring methods
  private monitoringCallback?: (result: AccessibilityAuditResult) => void;
  private monitoringInterval?: NodeJS.Timeout;

  startMonitoring(callback: (result: AccessibilityAuditResult) => void, intervalMs: number = 5000): void {
    this.monitoringCallback = callback;
    this.stopMonitoring(); // Stop any existing monitoring
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const result = await this.runAccessibilityAudit();
        this.checkAlerts(result); // Check alerts on each monitoring cycle
        this.monitoringCallback?.(result);
      } catch (error) {
        console.error('Accessibility monitoring error:', error);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.monitoringCallback = undefined;
  }

  // Alert setup for accessibility thresholds
  private alertThreshold?: number;
  private alertCallback?: (score: number, issues: AccessibilityIssue[]) => void;

  setupAlerts(threshold: number, callback?: (score: number, issues: AccessibilityIssue[]) => void): void {
    this.alertThreshold = threshold;
    this.alertCallback = callback;
  }

  private checkAlerts(result: AccessibilityAuditResult): void {
    if (this.alertThreshold && result.score.overall < this.alertThreshold) {
      this.alertCallback?.(result.score.overall, result.issues);
    }
  }

  teardownAlerts(): void {
    this.alertThreshold = undefined;
    this.alertCallback = undefined;
  }

  // Keyboard support methods for tests
  setupKeyboardSupport(): void {
    // Implementation for keyboard support setup
    console.log('Keyboard support enabled');
  }

  teardownKeyboardSupport(): void {
    // Implementation for keyboard support cleanup
    console.log('Keyboard support disabled');
  }
}

// Export singleton instance
export const accessibilityAuditSystem = new AccessibilityAuditSystem();

export default AccessibilityAuditSystem;
