/**
 * Accessibility Dashboard Component
 * 
 * Real-time accessibility monitoring dashboard for the Astral Core mental health platform.
 * Displays accessibility audit results, WCAG compliance status, and mental health-specific
 * accessibility metrics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AccessibilityAuditResult, 
  AccessibilityIssue, 
  WCAGLevel,
  accessibilityAuditSystem 
} from '../services/accessibilityAuditSystem';

interface AccessibilityDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  onIssueClick?: (issue: AccessibilityIssue) => void;
  className?: string;
}

export const AccessibilityDashboard: React.FC<AccessibilityDashboardProps> = ({
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  onIssueClick,
  className = ''
}) => {
  const [auditResult, setAuditResult] = useState<AccessibilityAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<WCAGLevel>(WCAGLevel.AA);

  // Run accessibility audit
  const runAudit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await accessibilityAuditSystem.runAccessibilityAudit(selectedLevel);
      setAuditResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Accessibility audit failed');
      console.error('Accessibility audit error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLevel]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && auditResult) {
      const interval = setInterval(runAudit, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, runAudit, auditResult]);

  // Initial audit on mount
  useEffect(() => {
    runAudit();
  }, [runAudit]);

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get compliance badge
  const getComplianceBadge = (isCompliant: boolean): JSX.Element => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isCompliant 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isCompliant ? '✓ Compliant' : '✗ Non-compliant'}
      </span>
    );
  };

  if (error) {
    return (
      <div className={`accessibility-dashboard ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Accessibility Audit Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={runAudit}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Retry Audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`accessibility-dashboard space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Accessibility Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Mental health platform WCAG 2.1 compliance monitoring
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* WCAG Level Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="wcag-level" className="text-sm font-medium text-gray-700">
                WCAG Level:
              </label>
              <select
                id="wcag-level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as WCAGLevel)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={WCAGLevel.A}>Level A</option>
                <option value={WCAGLevel.AA}>Level AA</option>
                <option value={WCAGLevel.AAA}>Level AAA</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={runAudit}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Run Audit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {auditResult && (
        <>
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(auditResult.score.overall)}`}>
                    {Math.round(auditResult.score.overall)}%
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {getComplianceBadge(auditResult.isCompliant)}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Crisis Accessibility</p>
                  <p className={`text-3xl font-bold ${getScoreColor(auditResult.score.crisisAccessibility)}`}>
                    {Math.round(auditResult.score.crisisAccessibility)}%
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-2xl">🚨</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mental Health Optimized</p>
                  <p className={`text-3xl font-bold ${getScoreColor(auditResult.score.mentalHealthOptimized)}`}>
                    {Math.round(auditResult.score.mentalHealthOptimized)}%
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-2xl">🧠</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Issues Found</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {auditResult.issues.length}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
            </div>
          </div>

          {/* WCAG Principle Scores */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">WCAG 2.1 Principle Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Perceivable</p>
                <div className={`text-2xl font-bold ${getScoreColor(auditResult.score.perceivable)}`}>
                  {Math.round(auditResult.score.perceivable)}%
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Operable</p>
                <div className={`text-2xl font-bold ${getScoreColor(auditResult.score.operable)}`}>
                  {Math.round(auditResult.score.operable)}%
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Understandable</p>
                <div className={`text-2xl font-bold ${getScoreColor(auditResult.score.understandable)}`}>
                  {Math.round(auditResult.score.understandable)}%
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Robust</p>
                <div className={`text-2xl font-bold ${getScoreColor(auditResult.score.robust)}`}>
                  {Math.round(auditResult.score.robust)}%
                </div>
              </div>
            </div>
          </div>

          {/* Mental Health Compliance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mental Health Accessibility Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <span className={auditResult.mentalHealthCompliance.crisisButtonAccessibility ? 'text-green-600' : 'text-red-600'}>
                  {auditResult.mentalHealthCompliance.crisisButtonAccessibility ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">Crisis Button Accessibility</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={auditResult.mentalHealthCompliance.cognitiveLoadReduction ? 'text-green-600' : 'text-red-600'}>
                  {auditResult.mentalHealthCompliance.cognitiveLoadReduction ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">Cognitive Load Reduction</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={auditResult.mentalHealthCompliance.reducedVisualOverstimulation ? 'text-green-600' : 'text-red-600'}>
                  {auditResult.mentalHealthCompliance.reducedVisualOverstimulation ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">Reduced Visual Overstimulation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={auditResult.mentalHealthCompliance.chatAccessibility ? 'text-green-600' : 'text-red-600'}>
                  {auditResult.mentalHealthCompliance.chatAccessibility ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">Chat Accessibility</span>
              </div>
            </div>
          </div>

          {/* Issues List */}
          {auditResult.issues.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Accessibility Issues ({auditResult.issues.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {auditResult.issues.map((issue, index) => (
                  <div
                    key={`${issue.id}-${index}`}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${getSeverityColor(issue.severity)}`}
                    onClick={() => onIssueClick?.(issue)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          {issue.isCrisisRelated && (
                            <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-medium">
                              CRISIS
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            WCAG {issue.wcagLevel} - {issue.guideline}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{issue.criterion}</h4>
                        <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Recommendation:</span> {issue.recommendation}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Mental Health Impact:</span> {issue.mentalHealthImpact}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Affects:</span>
                          {issue.assistiveTechImpact.map((tech) => (
                            <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {auditResult.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-2">
                {auditResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assistive Technology Support */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assistive Technology Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <span className={auditResult.assistiveTechSupport.screenReader ? 'text-green-600' : 'text-red-600'}>
                  {auditResult.assistiveTechSupport.screenReader ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">Screen Reader</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={auditResult.assistiveTechSupport.keyboardNavigation ? 'text-green-600' : 'text-red-600'}>
                  {auditResult.assistiveTechSupport.keyboardNavigation ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">Keyboard Navigation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={auditResult.assistiveTechSupport.voiceControl ? 'text-green-600' : 'text-red-600'}>
                  {auditResult.assistiveTechSupport.voiceControl ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">Voice Control</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={auditResult.assistiveTechSupport.eyeTracking ? 'text-green-600' : 'text-red-600'}>
                  {auditResult.assistiveTechSupport.eyeTracking ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">Eye Tracking</span>
              </div>
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>
                Last audit: {new Date(auditResult.timestamp).toLocaleString()}
              </span>
              <span>
                Tested {auditResult.passedTests}/{auditResult.totalTests} checks
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccessibilityDashboard;
