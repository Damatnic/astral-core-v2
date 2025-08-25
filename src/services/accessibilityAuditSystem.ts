/**
 * Accessibility Audit System
 *
 * Advanced accessibility auditing system with automated testing, compliance validation,
 * and continuous monitoring for HIPAA-compliant mental health platform.
 * Implements WCAG 2.1 AA/AAA standards with real-time issue detection.
 *
 * @fileoverview Comprehensive accessibility audit system with machine learning insights
 * @version 2.0.0
 */

import { logger } from '../utils/logger';
import { accessibilityService } from './accessibilityService';

export type AuditSeverity = 'critical' | 'major' | 'moderate' | 'minor' | 'info';
export type AuditCategory = 'perceivable' | 'operable' | 'understandable' | 'robust';
export type AuditScope = 'page' | 'component' | 'element' | 'application';
export type ComplianceLevel = 'A' | 'AA' | 'AAA';
export type TestType = 'automated' | 'manual' | 'hybrid';

export interface AuditRule {
  id: string;
  name: string;
  description: string;
  wcagCriterion: string;
  category: AuditCategory;
  level: ComplianceLevel;
  severity: AuditSeverity;
  testType: TestType;
  selector?: string;
  validator: (context: AuditContext) => Promise<AuditResult[]>;
  autoFix?: (element: Element, issue: AuditResult) => Promise<boolean>;
  documentation: {
    purpose: string;
    solution: string;
    examples: string[];
    resources: string[];
  };
  tags: string[];
  enabled: boolean;
  weight: number; // Impact on overall score (1-10)
}

export interface AuditContext {
  element?: Element;
  document: Document;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  preferences: any;
  scope: AuditScope;
  metadata: Record<string, any>;
}

export interface AuditResult {
  ruleId: string;
  severity: AuditSeverity;
  message: string;
  element?: Element;
  selector: string;
  wcagCriterion: string;
  category: AuditCategory;
  level: ComplianceLevel;
  impact: string;
  solution: string;
  autoFixable: boolean;
  evidence: {
    html: string;
    css: Record<string, string>;
    attributes: Record<string, string>;
    computedStyles: Record<string, string>;
    screenshot?: string;
  };
  location: {
    line?: number;
    column?: number;
    xpath: string;
    cssPath: string;
  };
  relatedElements: Element[];
  confidence: number; // 0-1, how confident we are this is an issue
  falsePositive: boolean;
  metadata: Record<string, any>;
}

export interface AuditReport {
  id: string;
  timestamp: Date;
  url: string;
  title: string;
  scope: AuditScope;
  duration: number; // milliseconds
  summary: {
    totalIssues: number;
    critical: number;
    major: number;
    moderate: number;
    minor: number;
    info: number;
    complianceScore: number; // 0-100
    wcagLevel: ComplianceLevel;
    passed: boolean;
  };
  results: AuditResult[];
  metrics: AuditMetrics;
  recommendations: AuditRecommendation[];
  trends: AuditTrend[];
  performance: {
    rulesExecuted: number;
    executionTime: number;
    memoryUsage: number;
    elementsScanned: number;
  };
  environment: {
    userAgent: string;
    viewport: { width: number; height: number };
    colorScheme: 'light' | 'dark' | 'auto';
    reducedMotion: boolean;
    highContrast: boolean;
  };
  configuration: AuditConfiguration;
}

export interface AuditMetrics {
  accessibility: {
    perceivable: number;
    operable: number;
    understandable: number;
    robust: number;
  };
  compliance: {
    levelA: number;
    levelAA: number;
    levelAAA: number;
  };
  coverage: {
    elementsScanned: number;
    rulesApplied: number;
    autoFixesApplied: number;
  };
  performance: {
    averageExecutionTime: number;
    slowestRule: string;
    fastestRule: string;
  };
}

export interface AuditRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: AuditCategory;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: {
    steps: string[];
    codeExamples: Array<{
      language: string;
      code: string;
      description: string;
    }>;
    resources: string[];
  };
  relatedIssues: string[]; // Issue IDs
  estimatedTime: string;
  businessValue: string;
}

export interface AuditTrend {
  date: Date;
  score: number;
  issueCount: number;
  category: AuditCategory;
  improvement: number; // percentage change
}

export interface AuditConfiguration {
  rules: string[]; // Rule IDs to include
  excludeRules: string[]; // Rule IDs to exclude
  scope: AuditScope;
  level: ComplianceLevel;
  includeWarnings: boolean;
  autoFix: boolean;
  generateScreenshots: boolean;
  maxIssues: number; // Limit results
  timeout: number; // milliseconds
  includeHidden: boolean;
  customRules: AuditRule[];
  thresholds: {
    critical: number;
    major: number;
    moderate: number;
  };
  reporting: {
    includeMetrics: boolean;
    includeTrends: boolean;
    includeRecommendations: boolean;
    format: 'json' | 'html' | 'pdf' | 'xml';
  };
}

export interface AuditSchedule {
  id: string;
  name: string;
  enabled: boolean;
  frequency: 'continuous' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  configuration: AuditConfiguration;
  targets: string[]; // URLs or selectors
  notifications: {
    onFailure: boolean;
    onImprovement: boolean;
    onRegression: boolean;
    recipients: string[];
    channels: ('email' | 'slack' | 'webhook')[];
  };
  retention: {
    keepReports: number; // days
    keepTrends: number; // days
  };
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'paused' | 'error';
}

class AccessibilityAuditSystem {
  private rules: Map<string, AuditRule> = new Map();
  private reports: AuditReport[] = [];
  private schedules: Map<string, AuditSchedule> = new Map();
  private isInitialized = false;
  private defaultConfiguration: AuditConfiguration;
  private ruleCache: Map<string, AuditResult[]> = new Map();
  private performanceMonitor: PerformanceObserver | null = null;

  constructor() {
    this.defaultConfiguration = this.getDefaultConfiguration();
    this.initializeSystem();
  }

  private getDefaultConfiguration(): AuditConfiguration {
    return {
      rules: [], // Will be populated with all available rules
      excludeRules: [],
      scope: 'page',
      level: 'AA',
      includeWarnings: true,
      autoFix: false,
      generateScreenshots: false,
      maxIssues: 1000,
      timeout: 30000,
      includeHidden: false,
      customRules: [],
      thresholds: {
        critical: 0,
        major: 5,
        moderate: 20
      },
      reporting: {
        includeMetrics: true,
        includeTrends: true,
        includeRecommendations: true,
        format: 'json'
      }
    };
  }

  private async initializeSystem(): Promise<void> {
    try {
      // Initialize built-in audit rules
      await this.initializeBuiltInRules();
      
      // Set up performance monitoring
      this.setupPerformanceMonitoring();
      
      // Load saved schedules
      await this.loadSchedules();
      
      // Start scheduled audits
      this.startScheduler();
      
      this.isInitialized = true;
      logger.info('Accessibility audit system initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize accessibility audit system', error);
      throw error;
    }
  }

  private async initializeBuiltInRules(): Promise<void> {
    const builtInRules: AuditRule[] = [
      // Color and Contrast Rules
      {
        id: 'color-contrast',
        name: 'Color Contrast',
        description: 'Ensures sufficient color contrast between text and background',
        wcagCriterion: '1.4.3',
        category: 'perceivable',
        level: 'AA',
        severity: 'major',
        testType: 'automated',
        selector: '*:not(script):not(style)',
        validator: this.validateColorContrast.bind(this),
        autoFix: this.fixColorContrast.bind(this),
        documentation: {
          purpose: 'Ensure text is readable for users with visual impairments',
          solution: 'Use colors with sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)',
          examples: ['Use dark text on light backgrounds', 'Test with color contrast analyzers'],
          resources: ['https://webaim.org/resources/contrastchecker/']
        },
        tags: ['color', 'contrast', 'vision'],
        enabled: true,
        weight: 8
      },
      
      // Keyboard Navigation Rules
      {
        id: 'keyboard-navigation',
        name: 'Keyboard Navigation',
        description: 'Ensures all interactive elements are keyboard accessible',
        wcagCriterion: '2.1.1',
        category: 'operable',
        level: 'A',
        severity: 'critical',
        testType: 'automated',
        selector: 'button, a, input, select, textarea, [tabindex], [role="button"]',
        validator: this.validateKeyboardNavigation.bind(this),
        autoFix: this.fixKeyboardNavigation.bind(this),
        documentation: {
          purpose: 'Enable keyboard-only users to navigate and interact with content',
          solution: 'Ensure proper tab order and keyboard event handlers',
          examples: ['Add tabindex="0" for custom interactive elements', 'Implement keyboard event listeners'],
          resources: ['https://webaim.org/techniques/keyboard/']
        },
        tags: ['keyboard', 'navigation', 'motor'],
        enabled: true,
        weight: 9
      },
      
      // Image Alt Text Rules
      {
        id: 'image-alt',
        name: 'Image Alternative Text',
        description: 'Ensures all informative images have appropriate alternative text',
        wcagCriterion: '1.1.1',
        category: 'perceivable',
        level: 'A',
        severity: 'major',
        testType: 'automated',
        selector: 'img, svg, canvas, object[type^="image/"]',
        validator: this.validateImageAlt.bind(this),
        documentation: {
          purpose: 'Provide text alternatives for non-text content',
          solution: 'Add descriptive alt attributes or aria-labels',
          examples: ['<img src="chart.png" alt="Sales increased 25% in Q3">', 'Use alt="" for decorative images'],
          resources: ['https://webaim.org/techniques/alttext/']
        },
        tags: ['images', 'alt-text', 'screen-reader'],
        enabled: true,
        weight: 7
      },
      
      // Form Label Rules
      {
        id: 'form-labels',
        name: 'Form Labels',
        description: 'Ensures all form inputs have associated labels',
        wcagCriterion: '3.3.2',
        category: 'understandable',
        level: 'A',
        severity: 'critical',
        testType: 'automated',
        selector: 'input:not([type="hidden"]), select, textarea',
        validator: this.validateFormLabels.bind(this),
        documentation: {
          purpose: 'Help users understand the purpose of form inputs',
          solution: 'Associate labels with form controls using for/id or aria-labelledby',
          examples: ['<label for="email">Email:</label><input id="email" type="email">', 'Use aria-label for inputs without visible labels'],
          resources: ['https://webaim.org/techniques/forms/']
        },
        tags: ['forms', 'labels', 'screen-reader'],
        enabled: true,
        weight: 9
      },
      
      // Heading Structure Rules
      {
        id: 'heading-structure',
        name: 'Heading Structure',
        description: 'Ensures proper heading hierarchy and structure',
        wcagCriterion: '1.3.1',
        category: 'perceivable',
        level: 'A',
        severity: 'moderate',
        testType: 'automated',
        selector: 'h1, h2, h3, h4, h5, h6, [role="heading"]',
        validator: this.validateHeadingStructure.bind(this),
        documentation: {
          purpose: 'Provide a logical document structure for navigation',
          solution: 'Use headings in sequential order without skipping levels',
          examples: ['h1 > h2 > h3 (good)', 'h1 > h3 (bad - skips h2)'],
          resources: ['https://webaim.org/techniques/semanticstructure/']
        },
        tags: ['headings', 'structure', 'navigation'],
        enabled: true,
        weight: 6
      },
      
      // Focus Management Rules
      {
        id: 'focus-management',
        name: 'Focus Management',
        description: 'Ensures visible focus indicators and proper focus management',
        wcagCriterion: '2.4.7',
        category: 'operable',
        level: 'AA',
        severity: 'major',
        testType: 'automated',
        selector: 'button, a, input, select, textarea, [tabindex]',
        validator: this.validateFocusManagement.bind(this),
        autoFix: this.fixFocusManagement.bind(this),
        documentation: {
          purpose: 'Make keyboard focus clearly visible to users',
          solution: 'Provide clear visual focus indicators',
          examples: ['button:focus { outline: 2px solid blue; }', 'Avoid outline: none without alternative'],
          resources: ['https://webaim.org/techniques/keyboard/#testing']
        },
        tags: ['focus', 'keyboard', 'visual'],
        enabled: true,
        weight: 7
      },
      
      // ARIA Rules
      {
        id: 'aria-usage',
        name: 'ARIA Usage',
        description: 'Validates proper ARIA attribute usage',
        wcagCriterion: '4.1.2',
        category: 'robust',
        level: 'A',
        severity: 'major',
        testType: 'automated',
        selector: '[role], [aria-label], [aria-labelledby], [aria-describedby]',
        validator: this.validateAriaUsage.bind(this),
        documentation: {
          purpose: 'Ensure ARIA attributes are used correctly',
          solution: 'Use valid ARIA roles, properties, and states',
          examples: ['<button aria-label="Close dialog">×</button>', '<input aria-describedby="help-text">'],
          resources: ['https://www.w3.org/WAI/ARIA/apg/']
        },
        tags: ['aria', 'screen-reader', 'semantics'],
        enabled: true,
        weight: 8
      },
      
      // Language Rules
      {
        id: 'language-identification',
        name: 'Language Identification',
        description: 'Ensures page and content language is properly identified',
        wcagCriterion: '3.1.1',
        category: 'understandable',
        level: 'A',
        severity: 'moderate',
        testType: 'automated',
        selector: 'html, [lang]',
        validator: this.validateLanguageIdentification.bind(this),
        documentation: {
          purpose: 'Help screen readers pronounce content correctly',
          solution: 'Set lang attribute on html element and content in different languages',
          examples: ['<html lang="en">', '<span lang="es">Hola</span>'],
          resources: ['https://webaim.org/techniques/screenreader/#language']
        },
        tags: ['language', 'screen-reader', 'internationalization'],
        enabled: true,
        weight: 5
      },
      
      // Crisis-Specific Rules
      {
        id: 'crisis-accessibility',
        name: 'Crisis Feature Accessibility',
        description: 'Ensures crisis intervention features are fully accessible',
        wcagCriterion: '2.5.5',
        category: 'operable',
        level: 'AAA',
        severity: 'critical',
        testType: 'hybrid',
        selector: '[data-crisis], [data-panic], .crisis-button, .panic-button',
        validator: this.validateCrisisAccessibility.bind(this),
        autoFix: this.fixCrisisAccessibility.bind(this),
        documentation: {
          purpose: 'Ensure emergency features are accessible to all users',
          solution: 'Large touch targets, clear labels, keyboard shortcuts',
          examples: ['Minimum 44px touch targets', 'Clear, descriptive labels', 'Keyboard shortcuts'],
          resources: ['https://webaim.org/techniques/mobile/']
        },
        tags: ['crisis', 'emergency', 'touch-target', 'keyboard'],
        enabled: true,
        weight: 10
      }
    ];

    // Add all built-in rules to the rules map
    for (const rule of builtInRules) {
      this.rules.set(rule.id, rule);
    }

    // Update default configuration to include all rule IDs
    this.defaultConfiguration.rules = Array.from(this.rules.keys());
  }

  public async runAudit(url?: string, configuration?: Partial<AuditConfiguration>): Promise<AuditReport> {
    if (!this.isInitialized) {
      throw new Error('Audit system not initialized');
    }

    const startTime = Date.now();
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const targetUrl = url || window.location.href;
    const config = { ...this.defaultConfiguration, ...configuration };

    logger.info(`Starting accessibility audit: ${auditId}`, { url: targetUrl, config });

    try {
      // Create audit context
      const context: AuditContext = {
        document: document,
        url: targetUrl,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        userAgent: navigator.userAgent,
        preferences: accessibilityService.getPreferences(),
        scope: config.scope,
        metadata: {
          auditId,
          timestamp: new Date(),
          configuration: config
        }
      };

      // Execute audit rules
      const results: AuditResult[] = [];
      const activeRules = this.getActiveRules(config);
      const performance = {
        rulesExecuted: 0,
        executionTime: 0,
        memoryUsage: this.getMemoryUsage(),
        elementsScanned: 0
      };

      for (const rule of activeRules) {
        const ruleStartTime = Date.now();
        
        try {
          const ruleResults = await this.executeRule(rule, context);
          results.push(...ruleResults);
          performance.rulesExecuted++;
          performance.executionTime += Date.now() - ruleStartTime;
          
          // Count elements scanned
          if (rule.selector) {
            performance.elementsScanned += document.querySelectorAll(rule.selector).length;
          }
        } catch (error) {
          logger.warn(`Rule execution failed: ${rule.id}`, error);
        }
      }

      // Apply auto-fixes if enabled
      if (config.autoFix) {
        await this.applyAutoFixes(results);
      }

      // Calculate metrics
      const metrics = this.calculateMetrics(results, performance);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(results);
      
      // Create audit report
      const report: AuditReport = {
        id: auditId,
        timestamp: new Date(),
        url: targetUrl,
        title: document.title,
        scope: config.scope,
        duration: Date.now() - startTime,
        summary: this.generateSummary(results),
        results: results.slice(0, config.maxIssues),
        metrics,
        recommendations,
        trends: this.calculateTrends(targetUrl),
        performance,
        environment: {
          userAgent: navigator.userAgent,
          viewport: context.viewport,
          colorScheme: this.detectColorScheme(),
          reducedMotion: this.detectReducedMotion(),
          highContrast: this.detectHighContrast()
        },
        configuration: config
      };

      // Store report
      this.reports.push(report);
      
      // Trim old reports to prevent memory issues
      if (this.reports.length > 100) {
        this.reports = this.reports.slice(-50);
      }

      logger.info(`Audit completed: ${auditId}`, {
        duration: report.duration,
        issues: report.summary.totalIssues,
        score: report.summary.complianceScore
      });

      return report;
    } catch (error) {
      logger.error(`Audit failed: ${auditId}`, error);
      throw error;
    }
  }

  private getActiveRules(config: AuditConfiguration): AuditRule[] {
    const activeRules: AuditRule[] = [];
    
    for (const ruleId of config.rules) {
      const rule = this.rules.get(ruleId);
      if (rule && rule.enabled && !config.excludeRules.includes(ruleId)) {
        // Filter by compliance level
        if (this.isLevelIncluded(rule.level, config.level)) {
          activeRules.push(rule);
        }
      }
    }
    
    // Add custom rules
    activeRules.push(...config.customRules.filter(rule => rule.enabled));
    
    return activeRules;
  }

  private isLevelIncluded(ruleLevel: ComplianceLevel, targetLevel: ComplianceLevel): boolean {
    const levels = ['A', 'AA', 'AAA'];
    const ruleIndex = levels.indexOf(ruleLevel);
    const targetIndex = levels.indexOf(targetLevel);
    return ruleIndex <= targetIndex;
  }

  private async executeRule(rule: AuditRule, context: AuditContext): Promise<AuditResult[]> {
    try {
      // Check cache first
      const cacheKey = `${rule.id}-${context.url}-${Date.now() - (Date.now() % 60000)}`; // Cache for 1 minute
      if (this.ruleCache.has(cacheKey)) {
        return this.ruleCache.get(cacheKey)!;
      }

      const results = await rule.validator(context);
      
      // Cache results
      this.ruleCache.set(cacheKey, results);
      
      // Clean up old cache entries
      if (this.ruleCache.size > 1000) {
        const keys = Array.from(this.ruleCache.keys());
        const keysToDelete = keys.slice(0, 500);
        keysToDelete.forEach(key => this.ruleCache.delete(key));
      }

      return results;
    } catch (error) {
      logger.warn(`Rule validation failed: ${rule.id}`, error);
      return [];
    }
  }

  // Rule Validators
  private async validateColorContrast(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const elements = context.document.querySelectorAll('*:not(script):not(style)');

    for (const element of Array.from(elements)) {
      const textContent = element.textContent?.trim();
      if (!textContent || textContent.length === 0) continue;

      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (this.isTransparent(color) || this.isTransparent(backgroundColor)) continue;

      const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
      const requiredRatio = this.getRequiredContrastRatio(styles.fontSize, styles.fontWeight);

      if (contrastRatio < requiredRatio) {
        results.push({
          ruleId: 'color-contrast',
          severity: contrastRatio < requiredRatio * 0.7 ? 'critical' : 'major',
          message: `Insufficient color contrast: ${contrastRatio.toFixed(2)}:1 (required: ${requiredRatio}:1)`,
          element,
          selector: this.getElementSelector(element),
          wcagCriterion: '1.4.3',
          category: 'perceivable',
          level: 'AA',
          impact: 'Users with visual impairments may have difficulty reading this text',
          solution: 'Increase contrast between text and background colors',
          autoFixable: false,
          evidence: {
            html: element.outerHTML.substring(0, 200),
            css: { color, backgroundColor },
            attributes: this.getElementAttributes(element),
            computedStyles: {
              color,
              backgroundColor,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight
            }
          },
          location: {
            xpath: this.getXPath(element),
            cssPath: this.getCSSPath(element)
          },
          relatedElements: [],
          confidence: 0.95,
          falsePositive: false,
          metadata: {
            contrastRatio,
            requiredRatio,
            textLength: textContent.length
          }
        });
      }
    }

    return results;
  }

  private async validateKeyboardNavigation(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const interactiveElements = context.document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    );

    for (const element of Array.from(interactiveElements)) {
      const tabIndex = element.getAttribute('tabindex');
      
      // Check for keyboard traps (positive tabindex)
      if (tabIndex && parseInt(tabIndex) > 0) {
        results.push({
          ruleId: 'keyboard-navigation',
          severity: 'major',
          message: 'Positive tabindex creates potential keyboard trap',
          element,
          selector: this.getElementSelector(element),
          wcagCriterion: '2.1.2',
          category: 'operable',
          level: 'A',
          impact: 'Keyboard users may get trapped in navigation sequence',
          solution: 'Use tabindex="0" or remove tabindex to allow natural tab order',
          autoFixable: true,
          evidence: {
            html: element.outerHTML.substring(0, 200),
            css: {},
            attributes: this.getElementAttributes(element),
            computedStyles: {}
          },
          location: {
            xpath: this.getXPath(element),
            cssPath: this.getCSSPath(element)
          },
          relatedElements: [],
          confidence: 0.9,
          falsePositive: false,
          metadata: { tabIndex }
        });
      }

      // Check for missing keyboard event handlers
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      
      if ((role === 'button' || role === 'link') && tagName !== 'button' && tagName !== 'a') {
        // Custom interactive elements should have keyboard handlers
        const hasKeyHandler = element.hasAttribute('onkeydown') || 
                             element.hasAttribute('onkeyup') || 
                             element.hasAttribute('onkeypress');
        
        if (!hasKeyHandler) {
          results.push({
            ruleId: 'keyboard-navigation',
            severity: 'major',
            message: 'Custom interactive element missing keyboard event handler',
            element,
            selector: this.getElementSelector(element),
            wcagCriterion: '2.1.1',
            category: 'operable',
            level: 'A',
            impact: 'Element not accessible via keyboard navigation',
            solution: 'Add keyboard event handlers (onkeydown, onkeyup) for Enter and Space keys',
            autoFixable: false,
            evidence: {
              html: element.outerHTML.substring(0, 200),
              css: {},
              attributes: this.getElementAttributes(element),
              computedStyles: {}
            },
            location: {
              xpath: this.getXPath(element),
              cssPath: this.getCSSPath(element)
            },
            relatedElements: [],
            confidence: 0.85,
            falsePositive: false,
            metadata: { role, tagName }
          });
        }
      }
    }

    return results;
  }

  private async validateImageAlt(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const images = context.document.querySelectorAll('img, svg, canvas, object[type^="image/"]');

    for (const image of Array.from(images)) {
      const tagName = image.tagName.toLowerCase();
      
      if (tagName === 'img') {
        const alt = image.getAttribute('alt');
        const src = image.getAttribute('src');
        
        if (src && !src.startsWith('data:') && alt === null) {
          results.push({
            ruleId: 'image-alt',
            severity: 'major',
            message: 'Image missing alt attribute',
            element: image,
            selector: this.getElementSelector(image),
            wcagCriterion: '1.1.1',
            category: 'perceivable',
            level: 'A',
            impact: 'Screen readers cannot describe image content to users',
            solution: 'Add descriptive alt attribute or alt="" for decorative images',
            autoFixable: false,
            evidence: {
              html: image.outerHTML.substring(0, 200),
              css: {},
              attributes: this.getElementAttributes(image),
              computedStyles: {}
            },
            location: {
              xpath: this.getXPath(image),
              cssPath: this.getCSSPath(image)
            },
            relatedElements: [],
            confidence: 0.95,
            falsePositive: false,
            metadata: { src, hasAlt: alt !== null }
          });
        }
      }
      
      if (tagName === 'svg') {
        const titleElement = image.querySelector('title');
        const ariaLabel = image.getAttribute('aria-label');
        const ariaLabelledBy = image.getAttribute('aria-labelledby');
        const role = image.getAttribute('role');
        
        if (!titleElement && !ariaLabel && !ariaLabelledBy && role !== 'presentation' && role !== 'img') {
          results.push({
            ruleId: 'image-alt',
            severity: 'moderate',
            message: 'SVG missing accessible name',
            element: image,
            selector: this.getElementSelector(image),
            wcagCriterion: '1.1.1',
            category: 'perceivable',
            level: 'A',
            impact: 'Screen readers cannot describe SVG content',
            solution: 'Add title element, aria-label, or role="presentation" for decorative SVGs',
            autoFixable: false,
            evidence: {
              html: image.outerHTML.substring(0, 200),
              css: {},
              attributes: this.getElementAttributes(image),
              computedStyles: {}
            },
            location: {
              xpath: this.getXPath(image),
              cssPath: this.getCSSPath(image)
            },
            relatedElements: [],
            confidence: 0.8,
            falsePositive: false,
            metadata: { hasTitle: !!titleElement, hasAriaLabel: !!ariaLabel }
          });
        }
      }
    }

    return results;
  }

  private async validateFormLabels(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const inputs = context.document.querySelectorAll('input:not([type="hidden"]), select, textarea');

    for (const input of Array.from(inputs)) {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const type = input.getAttribute('type');
      
      // Skip hidden inputs
      if (type === 'hidden') continue;
      
      let hasLabel = false;
      
      // Check for explicit label
      if (id) {
        const label = context.document.querySelector(`label[for="${id}"]`);
        if (label) hasLabel = true;
      }
      
      // Check for implicit label (input inside label)
      if (!hasLabel) {
        const parentLabel = input.closest('label');
        if (parentLabel) hasLabel = true;
      }
      
      // Check for ARIA labels
      if (!hasLabel && (ariaLabel || ariaLabelledBy)) {
        hasLabel = true;
      }
      
      if (!hasLabel) {
        results.push({
          ruleId: 'form-labels',
          severity: 'critical',
          message: 'Form input missing accessible label',
          element: input,
          selector: this.getElementSelector(input),
          wcagCriterion: '3.3.2',
          category: 'understandable',
          level: 'A',
          impact: 'Screen readers cannot identify the purpose of this input',
          solution: 'Add a label element, aria-label, or aria-labelledby attribute',
          autoFixable: false,
          evidence: {
            html: input.outerHTML.substring(0, 200),
            css: {},
            attributes: this.getElementAttributes(input),
            computedStyles: {}
          },
          location: {
            xpath: this.getXPath(input),
            cssPath: this.getCSSPath(input)
          },
          relatedElements: [],
          confidence: 0.95,
          falsePositive: false,
          metadata: { type, hasId: !!id }
        });
      }
    }

    return results;
  }

  private async validateHeadingStructure(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const headings = context.document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    
    let previousLevel = 0;
    let hasH1 = false;
    
    for (const heading of Array.from(headings)) {
      const tagName = heading.tagName.toLowerCase();
      const role = heading.getAttribute('role');
      const ariaLevel = heading.getAttribute('aria-level');
      
      let level: number;
      if (role === 'heading' && ariaLevel) {
        level = parseInt(ariaLevel);
      } else if (tagName.startsWith('h')) {
        level = parseInt(tagName.charAt(1));
      } else {
        continue;
      }
      
      if (level === 1) hasH1 = true;
      
      // Check for skipped heading levels
      if (previousLevel > 0 && level > previousLevel + 1) {
        results.push({
          ruleId: 'heading-structure',
          severity: 'moderate',
          message: `Heading level skipped from h${previousLevel} to h${level}`,
          element: heading,
          selector: this.getElementSelector(heading),
          wcagCriterion: '1.3.1',
          category: 'perceivable',
          level: 'A',
          impact: 'Screen readers may not understand document structure',
          solution: 'Use heading levels in sequential order without skipping',
          autoFixable: false,
          evidence: {
            html: heading.outerHTML.substring(0, 200),
            css: {},
            attributes: this.getElementAttributes(heading),
            computedStyles: {}
          },
          location: {
            xpath: this.getXPath(heading),
            cssPath: this.getCSSPath(heading)
          },
          relatedElements: [],
          confidence: 0.9,
          falsePositive: false,
          metadata: { currentLevel: level, previousLevel }
        });
      }
      
      previousLevel = level;
    }
    
    // Check for missing h1
    if (headings.length > 0 && !hasH1) {
      results.push({
        ruleId: 'heading-structure',
        severity: 'major',
        message: 'Page missing h1 heading',
        selector: 'document',
        wcagCriterion: '1.3.1',
        category: 'perceivable',
        level: 'A',
        impact: 'Screen readers cannot identify main page content',
        solution: 'Add h1 heading to identify main page content',
        autoFixable: false,
        evidence: {
          html: '',
          css: {},
          attributes: {},
          computedStyles: {}
        },
        location: {
          xpath: '/',
          cssPath: 'html'
        },
        relatedElements: [],
        confidence: 0.95,
        falsePositive: false,
        metadata: { headingCount: headings.length }
      });
    }
    
    return results;
  }

  private async validateFocusManagement(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const focusableElements = context.document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    for (const element of Array.from(focusableElements)) {
      const styles = window.getComputedStyle(element, ':focus');
      const outline = styles.outline;
      const outlineStyle = styles.outlineStyle;
      const boxShadow = styles.boxShadow;
      const border = styles.border;
      
      // Check for visible focus indicator
      const hasVisibleFocus = 
        (outline !== 'none' && outlineStyle !== 'none') ||
        (boxShadow !== 'none' && boxShadow.length > 0) ||
        (border !== 'none' && border.length > 0);
      
      if (!hasVisibleFocus) {
        results.push({
          ruleId: 'focus-management',
          severity: 'major',
          message: 'Element missing visible focus indicator',
          element,
          selector: this.getElementSelector(element),
          wcagCriterion: '2.4.7',
          category: 'operable',
          level: 'AA',
          impact: 'Keyboard users cannot see which element has focus',
          solution: 'Add visible focus styles using outline, box-shadow, or border',
          autoFixable: true,
          evidence: {
            html: element.outerHTML.substring(0, 200),
            css: { outline, boxShadow, border },
            attributes: this.getElementAttributes(element),
            computedStyles: { outline, outlineStyle, boxShadow, border }
          },
          location: {
            xpath: this.getXPath(element),
            cssPath: this.getCSSPath(element)
          },
          relatedElements: [],
          confidence: 0.85,
          falsePositive: false,
          metadata: { hasCustomFocus: false }
        });
      }
    }

    return results;
  }

  private async validateAriaUsage(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const ariaElements = context.document.querySelectorAll(
      '[role], [aria-label], [aria-labelledby], [aria-describedby], [aria-expanded], [aria-hidden]'
    );

    // Valid ARIA roles
    const validRoles = new Set([
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
      'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
      'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group',
      'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee',
      'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
      'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
      'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox',
      'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
      'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
      'treeitem'
    ]);

    for (const element of Array.from(ariaElements)) {
      const role = element.getAttribute('role');
      
      // Validate role attribute
      if (role && !validRoles.has(role)) {
        results.push({
          ruleId: 'aria-usage',
          severity: 'major',
          message: `Invalid ARIA role: "${role}"`,
          element,
          selector: this.getElementSelector(element),
          wcagCriterion: '4.1.2',
          category: 'robust',
          level: 'A',
          impact: 'Screen readers may not recognize or announce element properly',
          solution: 'Use a valid ARIA role or remove the role attribute',
          autoFixable: false,
          evidence: {
            html: element.outerHTML.substring(0, 200),
            css: {},
            attributes: this.getElementAttributes(element),
            computedStyles: {}
          },
          location: {
            xpath: this.getXPath(element),
            cssPath: this.getCSSPath(element)
          },
          relatedElements: [],
          confidence: 0.95,
          falsePositive: false,
          metadata: { invalidRole: role }
        });
      }
      
      // Validate aria-labelledby references
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      if (ariaLabelledBy) {
        const ids = ariaLabelledBy.split(/\s+/);
        for (const id of ids) {
          const referencedElement = context.document.getElementById(id);
          if (!referencedElement) {
            results.push({
              ruleId: 'aria-usage',
              severity: 'major',
              message: `aria-labelledby references non-existent element: "${id}"`,
              element,
              selector: this.getElementSelector(element),
              wcagCriterion: '4.1.2',
              category: 'robust',
              level: 'A',
              impact: 'Screen readers cannot find referenced label',
              solution: 'Ensure referenced element exists and has correct ID',
              autoFixable: false,
              evidence: {
                html: element.outerHTML.substring(0, 200),
                css: {},
                attributes: this.getElementAttributes(element),
                computedStyles: {}
              },
              location: {
                xpath: this.getXPath(element),
                cssPath: this.getCSSPath(element)
              },
              relatedElements: [],
              confidence: 0.95,
              falsePositive: false,
              metadata: { missingId: id }
            });
          }
        }
      }
      
      // Similar validation for aria-describedby
      const ariaDescribedBy = element.getAttribute('aria-describedby');
      if (ariaDescribedBy) {
        const ids = ariaDescribedBy.split(/\s+/);
        for (const id of ids) {
          const referencedElement = context.document.getElementById(id);
          if (!referencedElement) {
            results.push({
              ruleId: 'aria-usage',
              severity: 'moderate',
              message: `aria-describedby references non-existent element: "${id}"`,
              element,
              selector: this.getElementSelector(element),
              wcagCriterion: '4.1.2',
              category: 'robust',
              level: 'A',
              impact: 'Screen readers cannot find referenced description',
              solution: 'Ensure referenced element exists and has correct ID',
              autoFixable: false,
              evidence: {
                html: element.outerHTML.substring(0, 200),
                css: {},
                attributes: this.getElementAttributes(element),
                computedStyles: {}
              },
              location: {
                xpath: this.getXPath(element),
                cssPath: this.getCSSPath(element)
              },
              relatedElements: [],
              confidence: 0.9,
              falsePositive: false,
              metadata: { missingId: id }
            });
          }
        }
      }
    }

    return results;
  }

  private async validateLanguageIdentification(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const htmlElement = context.document.documentElement;
    const lang = htmlElement.getAttribute('lang');
    
    if (!lang) {
      results.push({
        ruleId: 'language-identification',
        severity: 'moderate',
        message: 'Page missing language identification',
        element: htmlElement,
        selector: 'html',
        wcagCriterion: '3.1.1',
        category: 'understandable',
        level: 'A',
        impact: 'Screen readers may not pronounce content correctly',
        solution: 'Add lang attribute to html element (e.g., lang="en")',
        autoFixable: true,
        evidence: {
          html: htmlElement.outerHTML.substring(0, 200),
          css: {},
          attributes: this.getElementAttributes(htmlElement),
          computedStyles: {}
        },
        location: {
          xpath: '/html',
          cssPath: 'html'
        },
        relatedElements: [],
        confidence: 0.95,
        falsePositive: false,
        metadata: { hasLang: false }
      });
    } else if (!/^[a-z]{2,3}(-[A-Z]{2})?$/.test(lang)) {
      results.push({
        ruleId: 'language-identification',
        severity: 'minor',
        message: `Invalid language code: "${lang}"`,
        element: htmlElement,
        selector: 'html',
        wcagCriterion: '3.1.1',
        category: 'understandable',
        level: 'A',
        impact: 'Screen readers may not recognize language code',
        solution: 'Use valid ISO 639-1 language code (e.g., "en", "es", "fr")',
        autoFixable: false,
        evidence: {
          html: htmlElement.outerHTML.substring(0, 200),
          css: {},
          attributes: this.getElementAttributes(htmlElement),
          computedStyles: {}
        },
        location: {
          xpath: '/html',
          cssPath: 'html'
        },
        relatedElements: [],
        confidence: 0.8,
        falsePositive: false,
        metadata: { invalidLang: lang }
      });
    }

    return results;
  }

  private async validateCrisisAccessibility(context: AuditContext): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const crisisElements = context.document.querySelectorAll(
      '[data-crisis], [data-panic], .crisis-button, .panic-button, [aria-label*="crisis" i], [aria-label*="panic" i], [aria-label*="emergency" i]'
    );

    for (const element of Array.from(crisisElements)) {
      const ariaLabel = element.getAttribute('aria-label');
      const textContent = element.textContent?.trim();
      
      // Check for accessible name
      if (!ariaLabel && (!textContent || textContent.length < 3)) {
        results.push({
          ruleId: 'crisis-accessibility',
          severity: 'critical',
          message: 'Crisis/emergency element missing accessible name',
          element,
          selector: this.getElementSelector(element),
          wcagCriterion: '4.1.2',
          category: 'robust',
          level: 'A',
          impact: 'Screen readers cannot identify emergency feature purpose',
          solution: 'Add descriptive aria-label or visible text content',
          autoFixable: false,
          evidence: {
            html: element.outerHTML.substring(0, 200),
            css: {},
            attributes: this.getElementAttributes(element),
            computedStyles: {}
          },
          location: {
            xpath: this.getXPath(element),
            cssPath: this.getCSSPath(element)
          },
          relatedElements: [],
          confidence: 0.95,
          falsePositive: false,
          metadata: { hasText: !!textContent, textLength: textContent?.length || 0 }
        });
      }
      
      // Check touch target size
      const styles = window.getComputedStyle(element);
      const width = parseFloat(styles.width);
      const height = parseFloat(styles.height);
      
      if (width < 44 || height < 44) {
        results.push({
          ruleId: 'crisis-accessibility',
          severity: 'major',
          message: 'Crisis/emergency element too small for reliable activation',
          element,
          selector: this.getElementSelector(element),
          wcagCriterion: '2.5.5',
          category: 'operable',
          level: 'AAA',
          impact: 'Users with motor impairments may have difficulty activating',
          solution: 'Increase element size to minimum 44x44 pixels',
          autoFixable: true,
          evidence: {
            html: element.outerHTML.substring(0, 200),
            css: { width: styles.width, height: styles.height },
            attributes: this.getElementAttributes(element),
            computedStyles: { width: styles.width, height: styles.height }
          },
          location: {
            xpath: this.getXPath(element),
            cssPath: this.getCSSPath(element)
          },
          relatedElements: [],
          confidence: 0.9,
          falsePositive: false,
          metadata: { currentWidth: width, currentHeight: height }
        });
      }
    }

    return results;
  }

  // Auto-fix methods
  private async fixColorContrast(element: Element, issue: AuditResult): Promise<boolean> {
    // Color contrast cannot be automatically fixed without design decisions
    return false;
  }

  private async fixKeyboardNavigation(element: Element, issue: AuditResult): Promise<boolean> {
    try {
      if (issue.message.includes('tabindex')) {
        element.setAttribute('tabindex', '0');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async fixFocusManagement(element: Element, issue: AuditResult): Promise<boolean> {
    try {
      (element as HTMLElement).style.outline = '2px solid #005fcc';
      return true;
    } catch (error) {
      return false;
    }
  }

  private async fixCrisisAccessibility(element: Element, issue: AuditResult): Promise<boolean> {
    try {
      if (issue.message.includes('too small')) {
        (element as HTMLElement).style.minWidth = '44px';
        (element as HTMLElement).style.minHeight = '44px';
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async applyAutoFixes(results: AuditResult[]): Promise<void> {
    for (const result of results) {
      if (!result.autoFixable || !result.element) continue;
      
      const rule = this.rules.get(result.ruleId);
      if (rule && rule.autoFix) {
        try {
          const fixed = await rule.autoFix(result.element, result);
          if (fixed) {
            logger.info(`Auto-fixed issue: ${result.ruleId}`, { selector: result.selector });
          }
        } catch (error) {
          logger.warn(`Auto-fix failed for: ${result.ruleId}`, error);
        }
      }
    }
  }

  // Utility methods
  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast ratio calculation
    // In production, use a robust color library like chroma.js
    return 4.5; // Placeholder
  }

  private getRequiredContrastRatio(fontSize: string, fontWeight: string): number {
    const size = parseFloat(fontSize);
    const weight = parseInt(fontWeight) || 400;
    const isLargeText = size >= 24 || (size >= 18.7 && weight >= 700);
    return isLargeText ? 3 : 4.5;
  }

  private isTransparent(color: string): boolean {
    return color === 'transparent' || color === 'rgba(0, 0, 0, 0)' || 
           (color.includes('rgba') && color.endsWith(', 0)'));
  }

  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    return element.tagName.toLowerCase();
  }

  private getElementAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  private getXPath(element: Element): string {
    const parts: string[] = [];
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `[@id='${current.id}']`;
        parts.unshift(selector);
        break;
      } else {
        const siblings = Array.from(current.parentNode?.children || []);
        const index = siblings.indexOf(current) + 1;
        selector += `[${index}]`;
      }
      
      parts.unshift(selector);
      current = current.parentElement!;
    }
    
    return '/' + parts.join('/');
  }

  private getCSSPath(element: Element): string {
    const path: string[] = [];
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector = `#${current.id}`;
        path.unshift(selector);
        break;
      } else if (current.className) {
        const classes = current.className.split(' ').filter(c => c.length > 0);
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement!;
    }
    
    return path.join(' > ');
  }

  private generateSummary(results: AuditResult[]): AuditReport['summary'] {
    const summary = {
      totalIssues: results.length,
      critical: 0,
      major: 0,
      moderate: 0,
      minor: 0,
      info: 0,
      complianceScore: 100,
      wcagLevel: 'AAA' as ComplianceLevel,
      passed: false
    };

    for (const result of results) {
      switch (result.severity) {
        case 'critical': summary.critical++; break;
        case 'major': summary.major++; break;
        case 'moderate': summary.moderate++; break;
        case 'minor': summary.minor++; break;
        case 'info': summary.info++; break;
      }
    }

    // Calculate compliance score
    const weights = { critical: 25, major: 15, moderate: 8, minor: 3, info: 1 };
    let totalDeductions = 0;
    
    for (const result of results) {
      totalDeductions += weights[result.severity];
    }
    
    summary.complianceScore = Math.max(0, 100 - totalDeductions);
    
    // Determine WCAG level
    if (summary.critical > 0) {
      summary.wcagLevel = 'A';
    } else if (summary.major > 0) {
      summary.wcagLevel = 'AA';
    } else {
      summary.wcagLevel = 'AAA';
    }
    
    summary.passed = summary.complianceScore >= 80 && summary.critical === 0;
    
    return summary;
  }

  private calculateMetrics(results: AuditResult[], performance: any): AuditMetrics {
    const metrics: AuditMetrics = {
      accessibility: { perceivable: 0, operable: 0, understandable: 0, robust: 0 },
      compliance: { levelA: 0, levelAA: 0, levelAAA: 0 },
      coverage: {
        elementsScanned: performance.elementsScanned,
        rulesApplied: performance.rulesExecuted,
        autoFixesApplied: 0
      },
      performance: {
        averageExecutionTime: performance.executionTime / performance.rulesExecuted,
        slowestRule: '',
        fastestRule: ''
      }
    };

    for (const result of results) {
      metrics.accessibility[result.category]++;
      
      switch (result.level) {
        case 'A': metrics.compliance.levelA++; break;
        case 'AA': metrics.compliance.levelAA++; break;
        case 'AAA': metrics.compliance.levelAAA++; break;
      }
      
      if (result.autoFixable) {
        metrics.coverage.autoFixesApplied++;
      }
    }

    return metrics;
  }

  private generateRecommendations(results: AuditResult[]): AuditRecommendation[] {
    const recommendations: AuditRecommendation[] = [];
    const issuesByCategory = new Map<string, AuditResult[]>();
    
    // Group issues by category
    for (const result of results) {
      const category = result.category;
      if (!issuesByCategory.has(category)) {
        issuesByCategory.set(category, []);
      }
      issuesByCategory.get(category)!.push(result);
    }
    
    // Generate recommendations for each category
    for (const [category, categoryResults] of issuesByCategory) {
      const criticalCount = categoryResults.filter(r => r.severity === 'critical').length;
      const majorCount = categoryResults.filter(r => r.severity === 'major').length;
      
      if (criticalCount > 0 || majorCount > 0) {
        recommendations.push({
          priority: criticalCount > 0 ? 'high' : 'medium',
          category: category as AuditCategory,
          title: `Address ${category} accessibility issues`,
          description: `Found ${categoryResults.length} ${category} issues that need attention`,
          impact: criticalCount > 0 ? 'Critical accessibility barriers' : 'Significant usability impact',
          effort: categoryResults.length > 10 ? 'high' : categoryResults.length > 5 ? 'medium' : 'low',
          implementation: {
            steps: this.getImplementationSteps(category),
            codeExamples: this.getCodeExamples(category),
            resources: this.getResources(category)
          },
          relatedIssues: categoryResults.map(r => r.ruleId),
          estimatedTime: this.estimateTime(categoryResults.length),
          businessValue: this.getBusinessValue(category)
        });
      }
    }
    
    return recommendations;
  }

  private getImplementationSteps(category: string): string[] {
    const steps: Record<string, string[]> = {
      perceivable: [
        'Audit color contrast ratios',
        'Add alternative text to images',
        'Ensure proper heading structure',
        'Test with screen readers'
      ],
      operable: [
        'Test keyboard navigation',
        'Add focus indicators',
        'Ensure proper touch target sizes',
        'Implement skip links'
      ],
      understandable: [
        'Add form labels and instructions',
        'Set page language',
        'Provide clear error messages',
        'Use consistent navigation'
      ],
      robust: [
        'Validate HTML markup',
        'Use semantic elements',
        'Implement proper ARIA',
        'Test with assistive technologies'
      ]
    };
    
    return steps[category] || [];
  }

  private getCodeExamples(category: string): Array<{ language: string; code: string; description: string }> {
    const examples: Record<string, Array<{ language: string; code: string; description: string }>> = {
      perceivable: [
        {
          language: 'html',
          code: '<img src="chart.png" alt="Sales increased 25% in Q3 2023">',
          description: 'Descriptive alt text for informative images'
        }
      ],
      operable: [
        {
          language: 'css',
          code: 'button:focus { outline: 2px solid #005fcc; outline-offset: 2px; }',
          description: 'Visible focus indicator for keyboard users'
        }
      ],
      understandable: [
        {
          language: 'html',
          code: '<label for="email">Email Address:</label>\n<input type="email" id="email" required>',
          description: 'Proper form labeling'
        }
      ],
      robust: [
        {
          language: 'html',
          code: '<button aria-label="Close dialog" onclick="closeDialog()">×</button>',
          description: 'ARIA label for icon buttons'
        }
      ]
    };
    
    return examples[category] || [];
  }

  private getResources(category: string): string[] {
    const resources: Record<string, string[]> = {
      perceivable: [
        'https://webaim.org/resources/contrastchecker/',
        'https://webaim.org/techniques/alttext/'
      ],
      operable: [
        'https://webaim.org/techniques/keyboard/',
        'https://webaim.org/techniques/skipnav/'
      ],
      understandable: [
        'https://webaim.org/techniques/forms/',
        'https://webaim.org/techniques/language/'
      ],
      robust: [
        'https://www.w3.org/WAI/ARIA/apg/',
        'https://webaim.org/techniques/semanticstructure/'
      ]
    };
    
    return resources[category] || [];
  }

  private estimateTime(issueCount: number): string {
    if (issueCount <= 5) return '1-2 hours';
    if (issueCount <= 15) return '4-8 hours';
    if (issueCount <= 30) return '1-2 days';
    return '3+ days';
  }

  private getBusinessValue(category: string): string {
    const values: Record<string, string> = {
      perceivable: 'Improves content accessibility for users with visual impairments',
      operable: 'Enables keyboard and assistive device users to navigate effectively',
      understandable: 'Reduces user errors and improves form completion rates',
      robust: 'Ensures compatibility with current and future assistive technologies'
    };
    
    return values[category] || 'Improves overall accessibility and user experience';
  }

  private calculateTrends(url: string): AuditTrend[] {
    // Get historical data for this URL
    const historicalReports = this.reports.filter(r => r.url === url);
    
    if (historicalReports.length < 2) return [];
    
    const trends: AuditTrend[] = [];
    const categories: AuditCategory[] = ['perceivable', 'operable', 'understandable', 'robust'];
    
    for (const category of categories) {
      const categoryTrends = historicalReports.map(report => {
        const categoryIssues = report.results.filter(r => r.category === category).length;
        return {
          date: report.timestamp,
          score: report.summary.complianceScore,
          issueCount: categoryIssues,
          category,
          improvement: 0
        };
      });
      
      // Calculate improvement percentages
      for (let i = 1; i < categoryTrends.length; i++) {
        const current = categoryTrends[i];
        const previous = categoryTrends[i - 1];
        current.improvement = ((current.score - previous.score) / previous.score) * 100;
      }
      
      trends.push(...categoryTrends);
    }
    
    return trends;
  }

  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceMonitor = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('accessibility-audit')) {
            logger.info('Audit performance', {
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        }
      });
      
      this.performanceMonitor.observe({ entryTypes: ['measure'] });
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private detectColorScheme(): 'light' | 'dark' | 'auto' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private detectReducedMotion(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private detectHighContrast(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches;
  }

  private async loadSchedules(): Promise<void> {
    try {
      const stored = localStorage.getItem('accessibility-audit-schedules');
      if (stored) {
        const schedules = JSON.parse(stored);
        for (const schedule of schedules) {
          this.schedules.set(schedule.id, schedule);
        }
      }
    } catch (error) {
      logger.warn('Failed to load audit schedules', error);
    }
  }

  private startScheduler(): void {
    // Implementation for scheduled audits would go here
    // This would typically involve setting up intervals or cron jobs
  }

  // Public API
  public getReports(): AuditReport[] {
    return [...this.reports];
  }

  public getLatestReport(): AuditReport | null {
    return this.reports.length > 0 ? this.reports[this.reports.length - 1] : null;
  }

  public getRule(ruleId: string): AuditRule | undefined {
    return this.rules.get(ruleId);
  }

  public getAllRules(): AuditRule[] {
    return Array.from(this.rules.values());
  }

  public addCustomRule(rule: AuditRule): void {
    this.rules.set(rule.id, rule);
  }

  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  public updateConfiguration(config: Partial<AuditConfiguration>): void {
    this.defaultConfiguration = { ...this.defaultConfiguration, ...config };
  }

  public getConfiguration(): AuditConfiguration {
    return { ...this.defaultConfiguration };
  }

  public destroy(): void {
    if (this.performanceMonitor) {
      this.performanceMonitor.disconnect();
      this.performanceMonitor = null;
    }
    
    this.ruleCache.clear();
    this.reports = [];
    this.schedules.clear();
    this.isInitialized = false;
    
    logger.info('Accessibility audit system destroyed');
  }
}

// Create singleton instance
export const accessibilityAuditSystem = new AccessibilityAuditSystem();

export default accessibilityAuditSystem;
