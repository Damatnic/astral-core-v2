/**
 * Privacy-Preserving Analytics Dashboard
 * 
 * Displays crisis intervention effectiveness analytics across languages and cultures
 * while maintaining strict privacy standards and showing compl                     <div className="cultural-analysis">
      <div className="cultural-metrics-grid">
        {culturalMetrics.map((metrics) => (
          <Card key={`${metrics.language}-${metrics.culturalGroup}`} className="cultural-metric-card">
            <div className="cultural-header">
              <h4>{t(`languages.${metrics.language}`)} - {metrics.culturalGroup}</h4>
              <span className="sample-size">assName="cultural-analysis">
      <div className="cultural-metrics-grid">
        {culturalMetrics.map((metrics) => (
          <Card key={`${metrics.language}-${metrics.culturalGroup}`} className="cultural-metric-card">
            <div className="cultural-header">
              <h4>{t(`languages.${metrics.language}`)} - {metrics.culturalGroup}</h4>
              <span className="sample-size">lassName="cultural-analysis">
      <div className="cultural-metrics-grid">
        {culturalMetrics.map((metrics) => (
          <Card key={`${metrics.language}-${metrics.culturalGroup}`} className="cultural-metric-card">
            <div className="cultural-header">
              <h4>{t(`languages.${metrics.language}`)} - {metrics.culturalGroup}</h4> className="cultural-analysis">
      <div className="cultural-metrics-grid">
        {culturalMetrics.map((metrics) => (
          <Card key={`${metrics.language}-${metrics.culturalGroup}`} className="cultural-metric-card">
            <div className="cultural-header"> metrics.
 * 
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePrivacyAnalytics } from '../hooks/usePrivacyAnalytics';
import { LoadingSpinner } from './LoadingSpinner';
import { AppButton } from './AppButton';
import { Card } from './Card';
import { AnimatedNumber } from './AnimatedNumber';

interface PrivacyAnalyticsDashboardProps {
  userRole?: 'Admin' | 'Moderator' | 'Helper';
  className?: string;
}

export const PrivacyAnalyticsDashboard: React.FC<PrivacyAnalyticsDashboardProps> = ({
  userRole = 'Helper',
  className = ''
}) => {
  const { t } = useTranslation();
  const {
    insights,
    culturalMetrics,
    privacyBudget,
    isLoading,
    error,
    generateReport,
    exportData,
    refreshInsights,
    resetPrivacyBudget
  } = usePrivacyAnalytics();

  const [activeTab, setActiveTab] = useState<'overview' | 'cultural' | 'privacy' | 'report'>('overview');
  const [reportData, setReportData] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  /**
   * Handle report generation
   */
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateReport();
      setReportData(report);
      setActiveTab('report');
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  /**
   * Handle data export
   */
  const handleExportData = async () => {
    try {
      const exportedData = await exportData();
      if (exportedData) {
        // Create download link
        const blob = new Blob([JSON.stringify(exportedData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `astralcore-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  if (isLoading && !insights) {
    return (
      <div className="privacy-analytics-dashboard loading">
        <LoadingSpinner />
        <p>{t('analytics.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="privacy-analytics-dashboard error">
        <h3>{t('analytics.error.title')}</h3>
        <p>{error}</p>
        <AppButton onClick={refreshInsights} variant="primary">
          {t('analytics.actions.retry')}
        </AppButton>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="analytics-overview">
      <div className="analytics-grid">
        <Card className="metric-card">
          <h4>{t('analytics.metrics.totalInterventions')}</h4>
          <div className="metric-value">
            <AnimatedNumber 
              value={insights?.globalMetrics.totalInterventions || 0} 
              formatter={(n) => Math.round(n).toString()}
            />
          </div>
          <p className="metric-description">
            {t('analytics.metrics.totalInterventions.description')}
          </p>
        </Card>

        <Card className="metric-card">
          <h4>{t('analytics.metrics.averageEffectiveness')}</h4>
          <div className="metric-value">
            <AnimatedNumber 
              value={(insights?.globalMetrics.averageEffectiveness || 0) * 100} 
              formatter={(n) => `${n.toFixed(1)}%`}
            />
          </div>
          <p className="metric-description">
            {t('analytics.metrics.averageEffectiveness.description')}
          </p>
        </Card>

        <Card className="metric-card">
          <h4>{t('analytics.metrics.languagesSupported')}</h4>
          <div className="metric-value">
            <AnimatedNumber 
              value={Object.keys(insights?.globalMetrics.languageDistribution || {}).length} 
              formatter={(n) => Math.round(n).toString()}
            />
          </div>
          <p className="metric-description">
            {t('analytics.metrics.languagesSupported.description')}
          </p>
        </Card>

        <Card className="metric-card">
          <h4>{t('analytics.metrics.culturalContexts')}</h4>
          <div className="metric-value">
            <AnimatedNumber 
              value={Object.keys(insights?.globalMetrics.culturalDistribution || {}).length} 
              formatter={(n) => Math.round(n).toString()}
            />
          </div>
          <p className="metric-description">
            {t('analytics.metrics.culturalContexts.description')}
          </p>
        </Card>
      </div>

      {/* Language Distribution */}
      <Card className="distribution-card">
        <h4>{t('analytics.distribution.languages')}</h4>
        <div className="distribution-chart">
          {Object.entries(insights?.globalMetrics.languageDistribution || {}).map(([lang, count]) => (
            <div key={lang} className="distribution-item">
              <span className="language-label">{t(`languages.${lang}`)}</span>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill"
                  style={{ 
                    width: `${(count / Math.max(...Object.values(insights?.globalMetrics.languageDistribution || {}))) * 100}%` 
                  }}
                />
              </div>
              <span className="distribution-count">{Math.round(count)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Intervention Type Effectiveness */}
      <Card className="effectiveness-card">
        <h4>{t('analytics.effectiveness.interventionTypes')}</h4>
        <div className="effectiveness-grid">
          {Object.entries(insights?.interventionTypeEffectiveness || {}).map(([type, effectiveness]) => (
            <div key={type} className="effectiveness-item">
              <span className="intervention-type">{t(`interventions.${type}`)}</span>
              <div className="effectiveness-score">
                <AnimatedNumber 
                  value={effectiveness * 100} 
                  formatter={(n) => `${n.toFixed(1)}%`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderCulturalAnalysis = () => (
    <div className="cultural-analysis">
      <div className="cultural-metrics-grid">
        {culturalMetrics.map((metrics) => (
          <Card key={`${metrics.language}-${metrics.culturalGroup}`} className="cultural-metric-card">
            <div className="cultural-header">
              <h4>{t(`languages.${metrics.language}`)} - {metrics.culturalGroup}</h4>
              <span className="sample-size">
                {t('analytics.sampleSize', { count: metrics.totalInterventions })}
              </span>
            </div>
            
            <div className="cultural-stats">
              <div className="stat-item">
                <span className="stat-label">{t('analytics.cultural.successRate')}</span>
                <span className="stat-value">
                  <AnimatedNumber 
                    value={metrics.successRate} 
                    formatter={(n) => `${n.toFixed(1)}%`}
                  />
                </span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">{t('analytics.cultural.riskReduction')}</span>
                <span className="stat-value">
                  {metrics.averageRiskReduction.toFixed(2)}
                </span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">{t('analytics.cultural.sessionDuration')}</span>
                <span className="stat-value">
                  {Math.round(metrics.averageSessionDuration)} {t('analytics.units.minutes')}
                </span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">{t('analytics.cultural.followUpRate')}</span>
                <span className="stat-value">
                  <AnimatedNumber 
                    value={metrics.followUpRate} 
                    formatter={(n) => `${n.toFixed(1)}%`}
                  />
                </span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">{t('analytics.cultural.satisfaction')}</span>
                <span className="stat-value">
                  {metrics.satisfactionScore.toFixed(1)}/5.0
                </span>
              </div>
            </div>
            
            <div className="confidence-interval">
              <span className="confidence-label">{t('analytics.confidenceInterval')}</span>
              <span className="confidence-range">
                {metrics.confidenceInterval[0].toFixed(1)}% - {metrics.confidenceInterval[1].toFixed(1)}%
              </span>
            </div>
          </Card>
        ))}
      </div>
      
      {culturalMetrics.length === 0 && (
        <div className="no-data">
          <p>{t('analytics.cultural.noData')}</p>
        </div>
      )}
    </div>
  );

  const renderPrivacyMetrics = () => (
    <div className="privacy-metrics">
      <Card className="privacy-overview-card">
        <h4>{t('analytics.privacy.overview')}</h4>
        <div className="privacy-stats">
          <div className="privacy-stat">
            <span className="stat-label">{t('analytics.privacy.budgetUsed')}</span>
            <div className="budget-bar">
              <div 
                className="budget-fill"
                style={{ width: `${(privacyBudget.used / 10) * 100}%` }}
              />
            </div>
            <span className="stat-value">
              {privacyBudget.used.toFixed(2)} / 10.0
            </span>
          </div>
          
          <div className="privacy-stat">
            <span className="stat-label">{t('analytics.privacy.dataPoints')}</span>
            <span className="stat-value">{privacyBudget.dataPoints}</span>
          </div>
          
          <div className="privacy-stat">
            <span className="stat-label">{t('analytics.privacy.retentionCompliance')}</span>
            <span className={`compliance-status ${privacyBudget.retentionCompliant ? 'compliant' : 'non-compliant'}`}>
              {privacyBudget.retentionCompliant ? t('analytics.privacy.compliant') : t('analytics.privacy.nonCompliant')}
            </span>
          </div>
        </div>
      </Card>

      <Card className="privacy-features-card">
        <h4>{t('analytics.privacy.features')}</h4>
        <ul className="privacy-features-list">
          <li className="feature-item">
            <span className="feature-icon">🔒</span>
            <div className="feature-content">
              <span className="feature-title">{t('analytics.privacy.differentialPrivacy')}</span>
              <span className="feature-description">
                {t('analytics.privacy.differentialPrivacy.description')}
              </span>
            </div>
          </li>
          
          <li className="feature-item">
            <span className="feature-icon">🔄</span>
            <div className="feature-content">
              <span className="feature-title">{t('analytics.privacy.dataAnonymization')}</span>
              <span className="feature-description">
                {t('analytics.privacy.dataAnonymization.description')}
              </span>
            </div>
          </li>
          
          <li className="feature-item">
            <span className="feature-icon">⏰</span>
            <div className="feature-content">
              <span className="feature-title">{t('analytics.privacy.autoExpiry')}</span>
              <span className="feature-description">
                {t('analytics.privacy.autoExpiry.description')}
              </span>
            </div>
          </li>
          
          <li className="feature-item">
            <span className="feature-icon">📊</span>
            <div className="feature-content">
              <span className="feature-title">{t('analytics.privacy.minimumCohort')}</span>
              <span className="feature-description">
                {t('analytics.privacy.minimumCohort.description')}
              </span>
            </div>
          </li>
        </ul>
      </Card>

      {userRole === 'Admin' && (
        <Card className="privacy-admin-card">
          <h4>{t('analytics.privacy.adminControls')}</h4>
          <div className="admin-controls">
            <AppButton 
              onClick={resetPrivacyBudget}
              variant="secondary"
              disabled={privacyBudget.used === 0}
            >
              {t('analytics.actions.resetBudget')}
            </AppButton>
          </div>
        </Card>
      )}
    </div>
  );

  const renderReport = () => (
    <div className="analytics-report">
      {reportData ? (
        <Card className="report-card">
          <h4>{t('analytics.report.title')}</h4>
          
          <div className="report-section">
            <h5>{t('analytics.report.summary')}</h5>
            <p>{reportData.summary}</p>
          </div>
          
          <div className="report-section">
            <h5>{t('analytics.report.culturalInsights')}</h5>
            <ul>
              {reportData.culturalInsights.map((insight: string, index: number) => (
                <li key={`insight-${insight.slice(0, 20).replace(/\s+/g, '-')}-${index}`}>{insight}</li>
              ))}
            </ul>
          </div>
          
          <div className="report-section">
            <h5>{t('analytics.report.recommendations')}</h5>
            <ul>
              {reportData.recommendations.map((recommendation: string, index: number) => (
                <li key={`recommendation-${recommendation.slice(0, 20).replace(/\s+/g, '-')}-${index}`}>{recommendation}</li>
              ))}
            </ul>
          </div>
          
          <div className="report-section">
            <h5>{t('analytics.report.limitations')}</h5>
            <ul>
              {reportData.limitations.map((limitation: string, index: number) => (
                <li key={`limitation-${limitation.slice(0, 20).replace(/\s+/g, '-')}-${index}`}>{limitation}</li>
              ))}
            </ul>
          </div>
        </Card>
      ) : (
        <div className="no-report">
          <p>{t('analytics.report.noData')}</p>
          <AppButton 
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            variant="primary"
          >
            {isGeneratingReport ? t('analytics.actions.generating') : t('analytics.actions.generateReport')}
          </AppButton>
        </div>
      )}
    </div>
  );

  return (
    <div className={`privacy-analytics-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>{t('analytics.title')}</h2>
        <div className="dashboard-actions">
          <AppButton onClick={refreshInsights} variant="secondary" disabled={isLoading}>
            {t('analytics.actions.refresh')}
          </AppButton>
          <AppButton onClick={handleGenerateReport} variant="primary" disabled={isGeneratingReport}>
            {isGeneratingReport ? t('analytics.actions.generating') : t('analytics.actions.generateReport')}
          </AppButton>
          {userRole === 'Admin' && (
            <AppButton onClick={handleExportData} variant="secondary">
              {t('analytics.actions.export')}
            </AppButton>
          )}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {t('analytics.tabs.overview')}
        </button>
        <button
          className={`tab-button ${activeTab === 'cultural' ? 'active' : ''}`}
          onClick={() => setActiveTab('cultural')}
        >
          {t('analytics.tabs.cultural')}
        </button>
        <button
          className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          {t('analytics.tabs.privacy')}
        </button>
        <button
          className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          {t('analytics.tabs.report')}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'cultural' && renderCulturalAnalysis()}
        {activeTab === 'privacy' && renderPrivacyMetrics()}
        {activeTab === 'report' && renderReport()}
      </div>
    </div>
  );
};

export default PrivacyAnalyticsDashboard;
