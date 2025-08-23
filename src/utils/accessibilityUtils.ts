/**
 * Accessibility Utilities
 * 
 * Shared utility functions for the accessibility audit system
 * to eliminate code duplication and improve maintainability.
 */

// Utility functions for DOM element manipulation and analysis
export class AccessibilityUtils {
  // Get element attributes as a record
  static getElementAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  // Generate a CSS selector for an element
  static getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.trim().split(/\s+/);
      if (classes.length > 0 && classes[0]) {
        return `.${classes[0]}`;
      }
    }
    return element.tagName.toLowerCase();
  }

  // Generate a unique ID for an element
  static generateElementId(element: Element): string {
    return `${element.tagName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if an element is visible
  static isVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  // Get all focusable elements
  static getFocusableElements(): Element[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return Array.from(document.querySelectorAll(focusableSelectors.join(', ')))
      .filter(el => this.isVisible(el));
  }

  // Check if element has adequate text content
  static hasTextContent(element: Element): boolean {
    return Boolean(element.textContent?.trim());
  }

  // Check if element is crisis-related
  static isCrisisElement(element: Element): boolean {
    return element.classList.contains('crisis') || 
           element.getAttribute('data-crisis') === 'true' ||
           element.closest('.crisis') !== null;
  }

  // Get WCAG compliance thresholds
  static getComplianceThresholds(level: string): { maxCritical: number; maxHigh: number } {
    switch (level) {
      case 'AAA':
        return { maxCritical: 0, maxHigh: 0 };
      case 'AA':
        return { maxCritical: 0, maxHigh: 2 };
      default: // A
        return { maxCritical: 0, maxHigh: 5 };
    }
  }

  // Find complex text (simple heuristic)
  static findComplexText(): string[] {
    const textElements = document.querySelectorAll('p, div, span, li');
    const complexSentences: string[] = [];
    
    textElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text) {
        // Handle multiple sentence terminators and preserve spacing
        const sentences = text.split(/([.!?]+)/);
        let currentSentence = '';
        
        for (let i = 0; i < sentences.length; i++) {
          if (i % 2 === 0) {
            // This is sentence content
            currentSentence = sentences[i];
          } else {
            // This is a terminator
            if (currentSentence) {
              const trimmed = currentSentence.trim();
              const wordCount = trimmed.split(/\s+/).length;
              if (wordCount > 20) {
                complexSentences.push(trimmed);
              }
            }
          }
        }
        
        // Check last sentence if no terminator
        if (currentSentence && !text.match(/[.!?]$/)) {
          const trimmed = currentSentence.trim();
          const wordCount = trimmed.split(/\s+/).length;
          if (wordCount > 20) {
            complexSentences.push(trimmed);
          }
        }
      }
    });
    
    return complexSentences;
  }

  // Extract text content safely
  static getTextContent(element: Element, maxLength = 50): string | undefined {
    return element.textContent?.trim().substring(0, maxLength);
  }
}

export default AccessibilityUtils;
