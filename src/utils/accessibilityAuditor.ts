/**
 * Mobile Accessibility Audit Utility
 * 
 * Comprehensive accessibility testing and reporting system for mobile web applications.
 * Performs automated WCAG 2.1 Level AA compliance checks with mobile-specific considerations.
 */

// Type definitions for accessibility audit
export interface AccessibilityAuditResult {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  compliantAreas: string[];
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'perceivable' | 'operable' | 'understandable' | 'robust';
  description: string;
  element?: string;
  wcagCriterion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix?: string;
}

// Audit configuration interface
interface AccessibilityAuditConfig {
  checkLevel: 'AA' | 'AAA';
  includeWarnings: boolean;
  mobileOptimized: boolean;
  skipElementsWithAriaHidden: boolean;
  customRules: AccessibilityRule[];
}

// Custom rule interface
interface AccessibilityRule {
  id: string;
  description: string;
  wcagCriterion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  check: (element: Element) => boolean;
  fix?: string;
}

// Color contrast checker
interface ColorContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
    aaLarge: boolean;
    aaaLarge: boolean;
  };
}

export class MobileAccessibilityAuditor {
  private readonly config: AccessibilityAuditConfig;
  private issues: AccessibilityIssue[] = [];

  constructor(config: Partial<AccessibilityAuditConfig> = {}) {
    this.config = {
      checkLevel: 'AA',
      includeWarnings: true,
      mobileOptimized: true,
      skipElementsWithAriaHidden: true,
      customRules: [],
      ...config
    };
  }

  // Main audit function
  public auditPage(): AccessibilityAuditResult {
    this.issues = [];
    
    // Run all audit checks
    this.checkImageAlternatives();
    this.checkFormLabels();
    this.checkHeadingStructure();
    this.checkColorContrast();
    this.checkFocusIndicators();
    this.checkKeyboardNavigation();
    this.checkTouchTargets();
    this.checkLandmarks();
    this.checkAriaUsage();
    this.checkTextAlternatives();
    this.checkLanguageSpecification();
    this.checkErrorIdentification();
    this.checkLabelsAndInstructions();
    this.checkFocusManagement();
    this.checkMobileSpecificChecks();
    
    // Run custom rules
    this.runCustomRules();
    
    // Calculate score and generate report
    return this.generateReport();
  }

  // Check image alternatives (1.1.1)
  private checkImageAlternatives(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      const isDecorative = img.getAttribute('aria-hidden') === 'true' || 
                          img.getAttribute('role') === 'presentation' ||
                          img.alt === '';
      
      if (!isDecorative && !img.alt) {
        this.addIssue({
          type: 'error',
          category: 'perceivable',
          description: 'Image missing alternative text',
          element: `img[src="${img.src}"]`,
          wcagCriterion: '1.1.1',
          severity: 'high',
          fix: 'Add descriptive alt attribute or mark as decorative with alt=""'
        });
      }
      
      // Check for redundant alt text
      if (img.alt && img.alt.toLowerCase().includes('image') || img.alt.toLowerCase().includes('picture')) {
        this.addIssue({
          type: 'warning',
          category: 'perceivable',
          description: 'Alt text contains redundant words like "image" or "picture"',
          element: `img[alt="${img.alt}"]`,
          wcagCriterion: '1.1.1',
          severity: 'low',
          fix: 'Remove redundant words from alt text'
        });
      }
    });
    
    // Check for background images that convey information
    const elementsWithBgImages = document.querySelectorAll('*');
    elementsWithBgImages.forEach(element => {
      const bgImage = window.getComputedStyle(element).backgroundImage;
      if (bgImage && bgImage !== 'none' && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
        this.addIssue({
          type: 'warning',
          category: 'perceivable',
          description: 'Background image may convey information without alternative text',
          element: element.tagName.toLowerCase(),
          wcagCriterion: '1.1.1',
          severity: 'medium',
          fix: 'Add aria-label or ensure background image is purely decorative'
        });
      }
    });
  }

  // Check form labels (1.3.1, 3.3.2)
  private checkFormLabels(): void {
    const formControls = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    
    formControls.forEach(control => {
      const element = control as HTMLInputElement;
      const hasLabel = element.labels && element.labels.length > 0;
      const hasAriaLabel = element.getAttribute('aria-label');
      const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
      const hasTitle = element.title;
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
        this.addIssue({
          type: 'error',
          category: 'perceivable',
          description: 'Form control missing accessible name',
          element: `${element.tagName.toLowerCase()}[${element.name ? 'name="' + element.name + '"' : 'id="' + element.id + '"'}]`,
          wcagCriterion: '1.3.1',
          severity: 'high',
          fix: 'Add label element, aria-label, or aria-labelledby'
        });
      }
      
      // Check for placeholder as label antipattern
      if (element.placeholder && !hasLabel && !hasAriaLabel) {
        this.addIssue({
          type: 'warning',
          category: 'understandable',
          description: 'Using placeholder as label',
          element: `${element.tagName.toLowerCase()}[placeholder="${element.placeholder}"]`,
          wcagCriterion: '3.3.2',
          severity: 'medium',
          fix: 'Add proper label in addition to placeholder'
        });
      }
    });
  }

  // Check heading structure (1.3.1)
  private checkHeadingStructure(): void {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    if (headings.length === 0) {
      this.addIssue({
        type: 'warning',
        category: 'understandable',
        description: 'No headings found on page',
        wcagCriterion: '1.3.1',
        severity: 'medium',
        fix: 'Add heading structure to organize content'
      });
      return;
    }
    
    // Check for h1
    const h1Elements = headings.filter(h => h.tagName === 'H1');
    if (h1Elements.length === 0) {
      this.addIssue({
        type: 'warning',
        category: 'understandable',
        description: 'No H1 heading found',
        wcagCriterion: '1.3.1',
        severity: 'medium',
        fix: 'Add H1 heading as main page title'
      });
    } else if (h1Elements.length > 1) {
      this.addIssue({
        type: 'warning',
        category: 'understandable',
        description: 'Multiple H1 headings found',
        wcagCriterion: '1.3.1',
        severity: 'low',
        fix: 'Use only one H1 per page'
      });
    }
    
    // Check heading hierarchy
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level > previousLevel + 1) {
        this.addIssue({
          type: 'warning',
          category: 'understandable',
          description: `Heading level jumps from H${previousLevel} to H${level}`,
          element: heading.textContent?.substring(0, 50) || `Heading ${index + 1}`,
          wcagCriterion: '1.3.1',
          severity: 'medium',
          fix: 'Use sequential heading levels (H1, H2, H3, etc.)'
        });
      }
      
      // Check for empty headings
      if (!heading.textContent?.trim()) {
        this.addIssue({
          type: 'error',
          category: 'understandable',
          description: 'Empty heading found',
          element: `${heading.tagName.toLowerCase()}`,
          wcagCriterion: '1.3.1',
          severity: 'high',
          fix: 'Add descriptive text to heading or remove if unnecessary'
        });
      }
      
      previousLevel = level;
    });
  }

  // Check color contrast (1.4.3, 1.4.6)
  private checkColorContrast(): void {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, li');
    
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const text = element.textContent?.trim();
      
      if (text && text.length > 0) {
        const contrast = this.calculateColorContrast(element);
        
        if (contrast) {
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = style.fontWeight;
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
          
          const minRatio = this.config.checkLevel === 'AAA' ? (isLargeText ? 4.5 : 7) : (isLargeText ? 3 : 4.5);
          
          if (contrast.ratio < minRatio) {
            this.addIssue({
              type: 'error',
              category: 'perceivable',
              description: `Insufficient color contrast (${contrast.ratio.toFixed(2)}:1, needs ${minRatio}:1)`,
              element: `${element.tagName.toLowerCase()} with text "${text.substring(0, 30)}..."`,
              wcagCriterion: this.config.checkLevel === 'AAA' ? '1.4.6' : '1.4.3',
              severity: 'high',
              fix: `Increase contrast between text (${contrast.foreground}) and background (${contrast.background})`
            });
          }
        }
      }
    });
  }

  // Calculate color contrast ratio
  private calculateColorContrast(element: Element): ColorContrastResult | null {
    const style = window.getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    
    if (!color || !backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)') {
      return null;
    }
    
    const foregroundLuminance = this.getLuminance(color);
    const backgroundLuminance = this.getLuminance(backgroundColor);
    
    const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / 
                 (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
    
    return {
      foreground: color,
      background: backgroundColor,
      ratio,
      passes: {
        aa: ratio >= 4.5,
        aaa: ratio >= 7,
        aaLarge: ratio >= 3,
        aaaLarge: ratio >= 4.5
      }
    };
  }

  // Get relative luminance of a color
  private getLuminance(color: string): number {
    const rgb = this.parseColor(color);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Parse color string to RGB values
  private parseColor(color: string): [number, number, number] | null {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    
    return [r, g, b];
  }

  // Check focus indicators (2.4.7)
  private checkFocusIndicators(): void {
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    let hasGlobalFocusStyle = false;
    
    // Check for global focus styles
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule && rule.selectorText?.includes(':focus')) {
            hasGlobalFocusStyle = true;
          }
        });
      } catch (e) {
        // Skip cross-origin stylesheets
      }
    });
    
    if (!hasGlobalFocusStyle) {
      this.addIssue({
        type: 'error',
        category: 'operable',
        description: 'No global focus styles detected',
        wcagCriterion: '2.4.7',
        severity: 'high',
        fix: 'Add CSS focus styles for all interactive elements'
      });
    }
    
    // Test individual elements
    focusableElements.forEach((element, index) => {
      const testFocus = () => {
        (element as HTMLElement).focus();
        const activeElement = document.activeElement;
        const style = window.getComputedStyle(activeElement || element, ':focus');
        
        const hasVisibleFocus = style.outline !== 'none' || 
                               style.boxShadow !== 'none' ||
                               style.border !== style.getPropertyValue('border') ||
                               style.backgroundColor !== window.getComputedStyle(element).backgroundColor;
        
        if (!hasVisibleFocus) {
          this.addIssue({
            type: 'warning',
            category: 'operable',
            description: 'Element missing visible focus indicator',
            element: `${element.tagName.toLowerCase()}[${element.id ? 'id="' + element.id + '"' : `index="${index}"`}]`,
            wcagCriterion: '2.4.7',
            severity: 'medium',
            fix: 'Add visible focus styles (outline, border, shadow, etc.)'
          });
        }
        
        // Restore previous focus
        if (document.activeElement !== activeElement) {
          (document.activeElement as HTMLElement)?.blur();
        }
      };
      
      // Only test first few elements to avoid affecting user experience
      if (index < 5) {
        testFocus();
      }
    });
  }

  // Check keyboard navigation (2.1.1)
  private checkKeyboardNavigation(): void {
    const interactiveElements = document.querySelectorAll(
      'button, a[href], input, select, textarea, [onclick], [onkeydown], [tabindex]:not([tabindex="-1"])'
    );
    
    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      
      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.addIssue({
          type: 'warning',
          category: 'operable',
          description: 'Positive tabindex found (anti-pattern)',
          element: `${element.tagName.toLowerCase()}[tabindex="${tabIndex}"]`,
          wcagCriterion: '2.1.1',
          severity: 'medium',
          fix: 'Use tabindex="0" or rely on natural tab order'
        });
      }
      
      // Check for click handlers without keyboard support
      if (element.getAttribute('onclick') && 
          !element.getAttribute('onkeydown') && 
          !element.getAttribute('onkeypress') &&
          element.tagName !== 'BUTTON' &&
          element.tagName !== 'A') {
        this.addIssue({
          type: 'warning',
          category: 'operable',
          description: 'Click handler without keyboard support',
          element: element.tagName.toLowerCase(),
          wcagCriterion: '2.1.1',
          severity: 'high',
          fix: 'Add keyboard event handlers or use button/link elements'
        });
      }
    });
  }

  // Check touch targets (2.5.5) - Mobile specific
  private checkTouchTargets(): void {
    if (!this.config.mobileOptimized) return;
    
    const MIN_TARGET_SIZE = 44; // WCAG recommendation for mobile
    const interactiveElements = document.querySelectorAll(
      'button, a[href], input, select, textarea, [onclick], [tabindex]:not([tabindex="-1"])'
    );
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      
      // Include padding in touch target calculation
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      const paddingRight = parseFloat(computedStyle.paddingRight);
      
      const effectiveWidth = rect.width + paddingLeft + paddingRight;
      const effectiveHeight = rect.height + paddingTop + paddingBottom;
      
      if (effectiveWidth < MIN_TARGET_SIZE || effectiveHeight < MIN_TARGET_SIZE) {
        this.addIssue({
          type: 'warning',
          category: 'operable',
          description: `Touch target too small (${Math.round(effectiveWidth)}x${Math.round(effectiveHeight)}px, needs ${MIN_TARGET_SIZE}x${MIN_TARGET_SIZE}px)`,
          element: `${element.tagName.toLowerCase()}`,
          wcagCriterion: '2.5.5',
          severity: 'medium',
          fix: 'Increase padding or size to meet minimum touch target requirements'
        });
      }
    });
  }

  // Check landmarks (1.3.1)
  private checkLandmarks(): void {
    const landmarks = {
      main: document.querySelectorAll('main, [role="main"]'),
      navigation: document.querySelectorAll('nav, [role="navigation"]'),
      banner: document.querySelectorAll('header[role="banner"], [role="banner"]'),
      contentinfo: document.querySelectorAll('footer[role="contentinfo"], [role="contentinfo"]'),
      complementary: document.querySelectorAll('aside, [role="complementary"]')
    };
    
    // Check for main landmark
    if (landmarks.main.length === 0) {
      this.addIssue({
        type: 'error',
        category: 'understandable',
        description: 'Missing main landmark',
        wcagCriterion: '1.3.1',
        severity: 'high',
        fix: 'Add <main> element or role="main"'
      });
    } else if (landmarks.main.length > 1) {
      this.addIssue({
        type: 'warning',
        category: 'understandable',
        description: 'Multiple main landmarks found',
        wcagCriterion: '1.3.1',
        severity: 'medium',
        fix: 'Use only one main landmark per page'
      });
    }
    
    // Check for navigation landmark
    if (landmarks.navigation.length === 0) {
      this.addIssue({
        type: 'warning',
        category: 'understandable',
        description: 'No navigation landmark found',
        wcagCriterion: '1.3.1',
        severity: 'low',
        fix: 'Add <nav> element or role="navigation" for site navigation'
      });
    }
  }

  // Check ARIA usage (4.1.2)
  private checkAriaUsage(): void {
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    
    elementsWithAria.forEach(element => {
      // Check for empty aria-label
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel === '') {
        this.addIssue({
          type: 'warning',
          category: 'robust',
          description: 'Empty aria-label attribute',
          element: element.tagName.toLowerCase(),
          wcagCriterion: '4.1.2',
          severity: 'low',
          fix: 'Remove empty aria-label or provide descriptive text'
        });
      }
      
      // Check aria-labelledby references
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      if (ariaLabelledBy) {
        const ids = ariaLabelledBy.split(' ');
        ids.forEach(id => {
          if (!document.getElementById(id)) {
            this.addIssue({
              type: 'error',
              category: 'robust',
              description: `aria-labelledby references non-existent ID: ${id}`,
              element: element.tagName.toLowerCase(),
              wcagCriterion: '4.1.2',
              severity: 'high',
              fix: 'Ensure referenced element exists or fix the ID reference'
            });
          }
        });
      }
      
      // Check aria-describedby references
      const ariaDescribedBy = element.getAttribute('aria-describedby');
      if (ariaDescribedBy) {
        const ids = ariaDescribedBy.split(' ');
        ids.forEach(id => {
          if (!document.getElementById(id)) {
            this.addIssue({
              type: 'error',
              category: 'robust',
              description: `aria-describedby references non-existent ID: ${id}`,
              element: element.tagName.toLowerCase(),
              wcagCriterion: '4.1.2',
              severity: 'high',
              fix: 'Ensure referenced element exists or fix the ID reference'
            });
          }
        });
      }
    });
  }

  // Check text alternatives (1.1.1)
  private checkTextAlternatives(): void {
    // Check SVG elements
    const svgElements = document.querySelectorAll('svg');
    svgElements.forEach(svg => {
      const hasTitle = svg.querySelector('title');
      const hasAriaLabel = svg.getAttribute('aria-label');
      const hasAriaLabelledBy = svg.getAttribute('aria-labelledby');
      const isDecorative = svg.getAttribute('aria-hidden') === 'true';
      
      if (!isDecorative && !hasTitle && !hasAriaLabel && !hasAriaLabelledBy) {
        this.addIssue({
          type: 'warning',
          category: 'perceivable',
          description: 'SVG missing accessible name',
          element: 'svg',
          wcagCriterion: '1.1.1',
          severity: 'medium',
          fix: 'Add <title> element, aria-label, or mark as decorative with aria-hidden="true"'
        });
      }
    });
    
    // Check canvas elements
    const canvasElements = document.querySelectorAll('canvas');
    canvasElements.forEach(canvas => {
      if (!canvas.textContent?.trim() && !canvas.getAttribute('aria-label')) {
        this.addIssue({
          type: 'warning',
          category: 'perceivable',
          description: 'Canvas missing alternative content',
          element: 'canvas',
          wcagCriterion: '1.1.1',
          severity: 'medium',
          fix: 'Add fallback content inside canvas element or aria-label'
        });
      }
    });
  }

  // Check language specification (3.1.1)
  private checkLanguageSpecification(): void {
    const htmlElement = document.documentElement;
    if (!htmlElement.getAttribute('lang')) {
      this.addIssue({
        type: 'error',
        category: 'understandable',
        description: 'Page missing language declaration',
        wcagCriterion: '3.1.1',
        severity: 'high',
        fix: 'Add lang attribute to <html> element'
      });
    }
  }

  // Check error identification (3.3.1)
  private checkErrorIdentification(): void {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
      
      requiredFields.forEach(field => {
        const hasErrorMessage = field.getAttribute('aria-describedby') || 
                               field.getAttribute('aria-invalid') === 'true';
        
        if (!hasErrorMessage) {
          // This is more of a warning since errors might be shown dynamically
          this.addIssue({
            type: 'info',
            category: 'understandable',
            description: 'Required field may need error handling',
            element: `${field.tagName.toLowerCase()}[required]`,
            wcagCriterion: '3.3.1',
            severity: 'low',
            fix: 'Ensure error messages are associated with fields using aria-describedby'
          });
        }
      });
    });
  }

  // Check labels and instructions (3.3.2)
  private checkLabelsAndInstructions(): void {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
      const labels = (field as HTMLInputElement).labels;
      const hasRequiredIndicator = labels && Array.from(labels).some(label => 
        label.textContent?.includes('*') || label.textContent?.toLowerCase().includes('required')
      );
      
      if (!hasRequiredIndicator && !field.getAttribute('aria-label')?.toLowerCase().includes('required')) {
        this.addIssue({
          type: 'warning',
          category: 'understandable',
          description: 'Required field not clearly marked',
          element: `${field.tagName.toLowerCase()}[required]`,
          wcagCriterion: '3.3.2',
          severity: 'medium',
          fix: 'Add visual and programmatic indication that field is required'
        });
      }
    });
  }

  // Check focus management (2.4.3)
  private checkFocusManagement(): void {
    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    const hasSkipToMain = Array.from(skipLinks).some(link => 
      link.textContent?.toLowerCase().includes('skip') && 
      link.textContent?.toLowerCase().includes('main')
    );
    
    if (!hasSkipToMain) {
      this.addIssue({
        type: 'warning',
        category: 'operable',
        description: 'Missing skip to main content link',
        wcagCriterion: '2.4.1',
        severity: 'medium',
        fix: 'Add skip link to main content at the beginning of the page'
      });
    }
  }

  // Mobile-specific accessibility checks
  private checkMobileSpecificChecks(): void {
    if (!this.config.mobileOptimized) return;
    
    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      this.addIssue({
        type: 'warning',
        category: 'operable',
        description: 'Missing viewport meta tag',
        wcagCriterion: '1.4.4',
        severity: 'medium',
        fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
      });
    } else {
      const content = viewportMeta.getAttribute('content');
      if (content?.includes('user-scalable=no') || content?.includes('maximum-scale=1')) {
        this.addIssue({
          type: 'error',
          category: 'operable',
          description: 'Viewport prevents zooming',
          wcagCriterion: '1.4.4',
          severity: 'high',
          fix: 'Remove user-scalable=no and maximum-scale restrictions'
        });
      }
    }
    
    // Check for horizontal scrolling
    if (document.body.scrollWidth > window.innerWidth) {
      this.addIssue({
        type: 'warning',
        category: 'operable',
        description: 'Content causes horizontal scrolling',
        wcagCriterion: '1.4.10',
        severity: 'medium',
        fix: 'Ensure content fits within viewport width'
      });
    }
  }

  // Run custom rules
  private runCustomRules(): void {
    this.config.customRules.forEach(rule => {
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        if (!rule.check(element)) {
          this.addIssue({
            type: 'warning',
            category: 'robust',
            description: rule.description,
            element: element.tagName.toLowerCase(),
            wcagCriterion: rule.wcagCriterion,
            severity: rule.severity,
            fix: rule.fix
          });
        }
      });
    });
  }

  // Add issue to list
  private addIssue(issue: AccessibilityIssue): void {
    if (!this.config.includeWarnings && issue.type === 'warning') {
      return;
    }
    
    if (this.config.skipElementsWithAriaHidden && issue.element) {
      const element = document.querySelector(issue.element);
      if (element?.getAttribute('aria-hidden') === 'true') {
        return;
      }
    }
    
    this.issues.push(issue);
  }

  // Generate final report
  private generateReport(): AccessibilityAuditResult {
    const errorCount = this.issues.filter(i => i.type === 'error').length;
    const warningCount = this.issues.filter(i => i.type === 'warning').length;
    const infoCount = this.issues.filter(i => i.type === 'info').length;
    
    // Calculate score (0-100)
    const totalChecks = 25; // Approximate number of different checks
    const errorWeight = 4;
    const warningWeight = 2;
    const infoWeight = 0.5;
    
    const penaltyPoints = (errorCount * errorWeight) + (warningCount * warningWeight) + (infoCount * infoWeight);
    const score = Math.max(0, Math.round(((totalChecks - penaltyPoints) / totalChecks) * 100));
    
    // Generate suggestions
    const suggestions: string[] = [];
    if (errorCount > 0) {
      suggestions.push('Fix critical accessibility errors first');
    }
    if (warningCount > 0) {
      suggestions.push('Address accessibility warnings to improve experience');
    }
    if (score < 60) {
      suggestions.push('Consider a comprehensive accessibility review');
    }
    if (this.config.mobileOptimized) {
      suggestions.push('Test with real mobile devices and assistive technology');
    }
    
    // Identify compliant areas
    const compliantAreas: string[] = [];
    if (errorCount === 0) {
      compliantAreas.push('No critical accessibility errors found');
    }
    if (this.issues.filter(i => i.wcagCriterion.startsWith('1.1')).length === 0) {
      compliantAreas.push('Image alternatives properly implemented');
    }
    if (this.issues.filter(i => i.wcagCriterion.startsWith('2.4')).length === 0) {
      compliantAreas.push('Navigation and focus management working well');
    }
    
    return {
      score,
      issues: this.issues,
      suggestions,
      compliantAreas
    };
  }

  // Static method to run quick audit
  static quickAudit(mobileOptimized: boolean = true): AccessibilityAuditResult {
    const auditor = new MobileAccessibilityAuditor({ 
      mobileOptimized,
      includeWarnings: true 
    });
    return auditor.auditPage();
  }
  
  // Static method to run comprehensive audit
  static comprehensiveAudit(config?: Partial<AccessibilityAuditConfig>): AccessibilityAuditResult {
    const auditor = new MobileAccessibilityAuditor(config);
    return auditor.auditPage();
  }
}

export default MobileAccessibilityAuditor;
