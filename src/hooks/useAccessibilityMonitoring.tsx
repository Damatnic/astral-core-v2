/**
 * Accessibility Monitoring Hooks
 * 
 * React hooks for integrating accessibility audit functionality throughout the
 * Astral Core mental health platform with real-time monitoring and alerts.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AccessibilityAuditResult, 
  AccessibilityIssue, 
  WCAGLevel,
  accessibilityAuditSystem 
} from '../services/accessibilityAuditSystem';

// Hook for running accessibility audits
export const useAccessibilityAudit = (wcagLevel: WCAGLevel = WCAGLevel.AA) => {
  const [auditResult, setAuditResult] = useState<AccessibilityAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await accessibilityAuditSystem.runAccessibilityAudit(wcagLevel);
      setAuditResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Accessibility audit failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wcagLevel]);

  useEffect(() => {
    runAudit();
  }, [runAudit]);

  return {
    auditResult,
    isLoading,
    error,
    runAudit
  };
};

// Hook for real-time accessibility monitoring
export const useAccessibilityMonitoring = (
  enabledOrOptions?: boolean | {
    autoRefresh?: boolean;
    interval?: number; // in milliseconds
    wcagLevel?: WCAGLevel;
    onIssueDetected?: (issues: AccessibilityIssue[]) => void;
    onComplianceChange?: (isCompliant: boolean) => void;
  },
  callback?: (result: AccessibilityAuditResult) => void
) => {
  // Handle both the old signature (enabled, callback) and new signature (options)
  const isOldSignature = typeof enabledOrOptions === 'boolean';
  const enabled = isOldSignature ? enabledOrOptions : true;
  const monitoringCallback = isOldSignature ? callback : undefined;
  
  const options = isOldSignature 
    ? { autoRefresh: enabled }
    : (enabledOrOptions || {});

  const {
    autoRefresh = enabled,
    interval = 30000, // 30 seconds
    wcagLevel = WCAGLevel.AA,
    onIssueDetected,
    onComplianceChange
  } = options;

  const [auditResult, setAuditResult] = useState<AccessibilityAuditResult | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousComplianceRef = useRef<boolean | null>(null);

  const runAudit = useCallback(async () => {
    try {
      const result = await accessibilityAuditSystem.runAccessibilityAudit(wcagLevel);
      setAuditResult(result);
      setError(null);

      // Check for new issues
      if (onIssueDetected && result.issues.length > 0) {
        onIssueDetected(result.issues);
      }

      // Check for compliance changes
      if (onComplianceChange && previousComplianceRef.current !== result.isCompliant) {
        onComplianceChange(result.isCompliant);
        previousComplianceRef.current = result.isCompliant;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Accessibility monitoring failed';
      setError(errorMessage);
      throw err;
    }
  }, [wcagLevel, onIssueDetected, onComplianceChange]);

  const startMonitoring = useCallback(() => {
    if (isOldSignature && monitoringCallback && enabled) {
      // For old signature, use the audit system's monitoring directly
      accessibilityAuditSystem.startMonitoring(monitoringCallback);
    } else if (autoRefresh && !isMonitoring) {
      // For new signature, use internal monitoring
      setIsMonitoring(true);
      intervalRef.current = setInterval(runAudit, interval);
    }
  }, [isOldSignature, monitoringCallback, enabled, autoRefresh, isMonitoring, interval, runAudit]);

  const stopMonitoring = useCallback(() => {
    if (isOldSignature) {
      // For old signature, use the audit system's stop monitoring
      accessibilityAuditSystem.stopMonitoring();
    } else {
      // For new signature, use internal monitoring
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsMonitoring(false);
    }
  }, [isOldSignature]);

  useEffect(() => {
    if (!isOldSignature) {
      runAudit(); // Initial audit for new signature only
    }
  }, [runAudit, isOldSignature]);

  useEffect(() => {
    if (isOldSignature && enabled) {
      startMonitoring();
    } else if (autoRefresh) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isOldSignature, enabled, autoRefresh, startMonitoring, stopMonitoring]);

  return {
    auditResult,
    isMonitoring,
    error,
    runAudit,
    startMonitoring,
    stopMonitoring
  };
};

// Hook for crisis-specific accessibility monitoring
export const useCrisisAccessibilityMonitoring = () => {
  const [crisisIssues, setCrisisIssues] = useState<AccessibilityIssue[]>([]);
  const [crisisCompliant, setCrisisCompliant] = useState<boolean>(true);
  const [lastCrisisCheck, setLastCrisisCheck] = useState<number>(0);

  const checkCrisisAccessibility = useCallback(async () => {
    try {
      const result = await accessibilityAuditSystem.runAccessibilityAudit(WCAGLevel.AA);
      const crisisRelatedIssues = result.issues.filter(issue => issue.isCrisisRelated);
      
      setCrisisIssues(crisisRelatedIssues);
      setCrisisCompliant(crisisRelatedIssues.length === 0);
      setLastCrisisCheck(Date.now());

      // Log critical crisis issues
      const criticalCrisisIssues = crisisRelatedIssues.filter(issue => 
        issue.severity === 'critical'
      );
      
      if (criticalCrisisIssues.length > 0) {
        console.error('CRITICAL: Crisis accessibility issues detected:', criticalCrisisIssues);
      }

      return {
        issues: crisisRelatedIssues,
        isCompliant: crisisRelatedIssues.length === 0,
        criticalCount: criticalCrisisIssues.length
      };
    } catch (err) {
      console.error('Crisis accessibility check failed:', err);
      throw err;
    }
  }, []);

  // Auto-check crisis accessibility every 10 seconds
  useEffect(() => {
    const interval = setInterval(checkCrisisAccessibility, 10000);
    checkCrisisAccessibility(); // Initial check

    return () => clearInterval(interval);
  }, [checkCrisisAccessibility]);

  return {
    crisisIssues,
    crisisCompliant,
    lastCrisisCheck,
    checkCrisisAccessibility
  };
};

// Hook for accessibility issue filtering and management
export const useAccessibilityIssueManager = (auditResult: AccessibilityAuditResult | null) => {
  const [filteredIssues, setFilteredIssues] = useState<AccessibilityIssue[]>([]);
  const [filters, setFilters] = useState({
    severity: [] as string[],
    wcagPrinciple: [] as string[],
    isCrisisRelated: false,
    assistiveTech: [] as string[]
  });

  // Apply filters to issues
  useEffect(() => {
    if (!auditResult) {
      setFilteredIssues([]);
      return;
    }

    let filtered = auditResult.issues;

    // Filter by severity
    if (filters.severity.length > 0) {
      filtered = filtered.filter(issue => filters.severity.includes(issue.severity));
    }

    // Filter by WCAG principle
    if (filters.wcagPrinciple.length > 0) {
      filtered = filtered.filter(issue => filters.wcagPrinciple.includes(issue.wcagPrinciple));
    }

    // Filter by crisis-related
    if (filters.isCrisisRelated) {
      filtered = filtered.filter(issue => issue.isCrisisRelated);
    }

    // Filter by assistive technology impact
    if (filters.assistiveTech.length > 0) {
      filtered = filtered.filter(issue => 
        issue.assistiveTechImpact.some(tech => filters.assistiveTech.includes(tech))
      );
    }

    setFilteredIssues(filtered);
  }, [auditResult, filters]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      severity: [],
      wcagPrinciple: [],
      isCrisisRelated: false,
      assistiveTech: []
    });
  }, []);

  // Get issue statistics
  const getIssueStats = useCallback(() => {
    if (!auditResult) return null;

    const stats = {
      total: auditResult.issues.length,
      critical: auditResult.issues.filter(i => i.severity === 'critical').length,
      high: auditResult.issues.filter(i => i.severity === 'high').length,
      medium: auditResult.issues.filter(i => i.severity === 'medium').length,
      low: auditResult.issues.filter(i => i.severity === 'low').length,
      crisisRelated: auditResult.issues.filter(i => i.isCrisisRelated).length,
      byPrinciple: {
        perceivable: auditResult.issues.filter(i => i.wcagPrinciple === 'perceivable').length,
        operable: auditResult.issues.filter(i => i.wcagPrinciple === 'operable').length,
        understandable: auditResult.issues.filter(i => i.wcagPrinciple === 'understandable').length,
        robust: auditResult.issues.filter(i => i.wcagPrinciple === 'robust').length
      }
    };

    return stats;
  }, [auditResult]);

  return {
    filteredIssues,
    filters,
    updateFilters,
    clearFilters,
    getIssueStats
  };
};

// Hook for accessibility alerts and notifications
export const useAccessibilityAlerts = (threshold?: number, enabled: boolean = true) => {
  const [alerts, setAlerts] = useState<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: number;
    issue?: AccessibilityIssue;
  }[]>([]);

  // Setup alerts when threshold is provided
  useEffect(() => {
    if (threshold && enabled) {
      const alertCallback = (score: number, _issues: AccessibilityIssue[]) => {
        addAlert('critical', `Accessibility score (${score}) below threshold (${threshold})`);
      };
      accessibilityAuditSystem.setupAlerts(threshold, alertCallback);
    }

    return () => {
      if (threshold) {
        accessibilityAuditSystem.teardownAlerts();
      }
    };
  }, [threshold, enabled]);

  const addAlert = useCallback((
    type: 'critical' | 'warning' | 'info',
    message: string,
    issue?: AccessibilityIssue
  ) => {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now(),
      issue
    };

    setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts

    // Auto-remove non-critical alerts after 5 seconds
    if (type !== 'critical') {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      }, 5000);
    }

    return alert.id;
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Monitor for new critical issues
  const monitorCriticalIssues = useCallback((auditResult: AccessibilityAuditResult | null) => {
    if (!auditResult) return;

    const criticalIssues = auditResult.issues.filter(issue => issue.severity === 'critical');
    const crisisCriticalIssues = criticalIssues.filter(issue => issue.isCrisisRelated);

    // Alert for crisis-related critical issues
    crisisCriticalIssues.forEach(issue => {
      addAlert(
        'critical',
        `Critical accessibility issue affecting crisis features: ${issue.description}`,
        issue
      );
    });

    // Alert for other critical issues
    const otherCriticalIssues = criticalIssues.filter(issue => !issue.isCrisisRelated);
    if (otherCriticalIssues.length > 0) {
      addAlert(
        'critical',
        `${otherCriticalIssues.length} critical accessibility issue(s) detected`
      );
    }
  }, [addAlert]);

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    monitorCriticalIssues
  };
};

// Hook for keyboard navigation testing
export const useKeyboardNavigationTest = () => {
  const [isTestingKeyboard, setIsTestingKeyboard] = useState(false);
  const [keyboardIssues, setKeyboardIssues] = useState<AccessibilityIssue[]>([]);

  const testKeyboardNavigation = useCallback(async () => {
    setIsTestingKeyboard(true);
    
    try {
      const result = await accessibilityAuditSystem.runAccessibilityAudit(WCAGLevel.AA);
      const keyboardRelatedIssues = result.issues.filter(issue => 
        issue.assistiveTechImpact.includes('keyboard-navigation')
      );
      
      setKeyboardIssues(keyboardRelatedIssues);
      return keyboardRelatedIssues;
    } catch (err) {
      console.error('Keyboard navigation test failed:', err);
      throw err;
    } finally {
      setIsTestingKeyboard(false);
    }
  }, []);

  return {
    isTestingKeyboard,
    keyboardIssues,
    testKeyboardNavigation
  };
};

// Hook for screen reader compatibility testing
export const useScreenReaderTest = () => {
  const [isTestingScreenReader, setIsTestingScreenReader] = useState(false);
  const [screenReaderIssues, setScreenReaderIssues] = useState<AccessibilityIssue[]>([]);

  const testScreenReaderCompatibility = useCallback(async () => {
    setIsTestingScreenReader(true);
    
    try {
      const result = await accessibilityAuditSystem.runAccessibilityAudit(WCAGLevel.AA);
      const screenReaderRelatedIssues = result.issues.filter(issue => 
        issue.assistiveTechImpact.includes('screen-reader')
      );
      
      setScreenReaderIssues(screenReaderRelatedIssues);
      return screenReaderRelatedIssues;
    } catch (err) {
      console.error('Screen reader test failed:', err);
      throw err;
    } finally {
      setIsTestingScreenReader(false);
    }
  }, []);

  return {
    isTestingScreenReader,
    screenReaderIssues,
    testScreenReaderCompatibility
  };
};

// Hook for keyboard support accessibility features
export const useAccessibilityKeyboardSupport = (enabled: boolean = true) => {
  const [keyboardNavigationEnabled, setKeyboardNavigationEnabled] = useState(true);
  const [focusVisible] = useState(false);
  const [tabOrder, setTabOrder] = useState<HTMLElement[]>([]);

  // Setup keyboard support based on enabled parameter
  useEffect(() => {
    if (enabled) {
      accessibilityAuditSystem.setupKeyboardSupport();
      setKeyboardNavigationEnabled(true);
    } else {
      accessibilityAuditSystem.teardownKeyboardSupport();
      setKeyboardNavigationEnabled(false);
    }

    return () => {
      accessibilityAuditSystem.teardownKeyboardSupport();
    };
  }, [enabled]);

  const enableKeyboardNavigation = useCallback(() => {
    setKeyboardNavigationEnabled(true);
  }, []);

  const disableKeyboardNavigation = useCallback(() => {
    setKeyboardNavigationEnabled(false);
  }, []);

  const updateTabOrder = useCallback(() => {
    const focusableElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
    
    setTabOrder(focusableElements);
  }, []);

  useEffect(() => {
    updateTabOrder();
    window.addEventListener('resize', updateTabOrder);
    return () => window.removeEventListener('resize', updateTabOrder);
  }, [updateTabOrder]);

  return {
    keyboardNavigationEnabled,
    focusVisible,
    tabOrder,
    enableKeyboardNavigation,
    disableKeyboardNavigation,
    updateTabOrder
  };
};

export default {
  useAccessibilityAudit,
  useAccessibilityMonitoring,
  useCrisisAccessibilityMonitoring,
  useAccessibilityIssueManager,
  useAccessibilityAlerts,
  useKeyboardNavigationTest,
  useScreenReaderTest,
  useAccessibilityKeyboardSupport
};
