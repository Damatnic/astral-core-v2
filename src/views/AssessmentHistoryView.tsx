import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ViewHeader } from '../components/ViewHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { 
  ChartIcon, 
  ClockIcon, 
  CheckIcon, 
  AlertIcon, 
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  FilterIcon,
  SearchIcon,
  DownloadIcon,
  ShareIcon
} from '../components/icons.dynamic';

interface AssessmentResult {
  id: string;
  assessmentType: 'mood' | 'anxiety' | 'depression' | 'stress' | 'wellness' | 'custom';
  title: string;
  completedAt: Date;
  score: number;
  maxScore: number;
  percentage: number;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  responses: {
    questionId: string;
    question: string;
    answer: string | number;
    score: number;
  }[];
  recommendations: string[];
  followUpRequired: boolean;
  notes?: string;
  tags: string[];
}

interface AssessmentStats {
  totalAssessments: number;
  averageScore: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
  lastAssessment: Date;
  streakDays: number;
  completionRate: number;
  byType: {
    [key: string]: {
      count: number;
      averageScore: number;
      lastCompleted: Date;
    };
  };
}

interface AssessmentTrend {
  date: Date;
  score: number;
  type: string;
}

const AssessmentHistoryView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [trends, setTrends] = useState<AssessmentTrend[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentResult[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    loadAssessmentHistory();
    loadAssessmentStats();
    loadTrendData();
  }, [user]);

  useEffect(() => {
    filterAssessments();
  }, [assessments, selectedType, selectedPeriod, searchQuery, sortBy, sortOrder]);

  const loadAssessmentHistory = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Mock assessment history data
      const mockAssessments: AssessmentResult[] = [
        {
          id: '1',
          assessmentType: 'mood',
          title: 'Daily Mood Check',
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          score: 7,
          maxScore: 10,
          percentage: 70,
          severity: 'moderate',
          responses: [
            { questionId: '1', question: 'How are you feeling today?', answer: 'Good', score: 7 },
            { questionId: '2', question: 'Energy level?', answer: 6, score: 6 },
            { questionId: '3', question: 'Sleep quality?', answer: 8, score: 8 }
          ],
          recommendations: ['Continue current wellness routine', 'Consider light exercise'],
          followUpRequired: false,
          tags: ['daily', 'routine']
        },
        {
          id: '2',
          assessmentType: 'anxiety',
          title: 'Anxiety Assessment',
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          score: 12,
          maxScore: 21,
          percentage: 57,
          severity: 'moderate',
          responses: [
            { questionId: '1', question: 'Feeling nervous or anxious?', answer: 2, score: 2 },
            { questionId: '2', question: 'Unable to control worrying?', answer: 2, score: 2 },
            { questionId: '3', question: 'Worrying about different things?', answer: 3, score: 3 }
          ],
          recommendations: ['Practice deep breathing exercises', 'Consider mindfulness meditation'],
          followUpRequired: true,
          tags: ['anxiety', 'follow-up']
        },
        {
          id: '3',
          assessmentType: 'depression',
          title: 'PHQ-9 Depression Screening',
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          score: 8,
          maxScore: 27,
          percentage: 30,
          severity: 'low',
          responses: [
            { questionId: '1', question: 'Little interest in activities?', answer: 1, score: 1 },
            { questionId: '2', question: 'Feeling down or hopeless?', answer: 2, score: 2 },
            { questionId: '3', question: 'Sleep problems?', answer: 2, score: 2 }
          ],
          recommendations: ['Maintain social connections', 'Regular exercise routine'],
          followUpRequired: false,
          tags: ['depression', 'screening']
        },
        {
          id: '4',
          assessmentType: 'stress',
          title: 'Stress Level Assessment',
          completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          score: 15,
          maxScore: 20,
          percentage: 75,
          severity: 'high',
          responses: [
            { questionId: '1', question: 'Feeling overwhelmed?', answer: 4, score: 4 },
            { questionId: '2', question: 'Difficulty concentrating?', answer: 3, score: 3 },
            { questionId: '3', question: 'Physical tension?', answer: 4, score: 4 }
          ],
          recommendations: ['Stress management techniques', 'Consider professional support'],
          followUpRequired: true,
          notes: 'High stress levels detected - recommend immediate intervention',
          tags: ['stress', 'high-priority']
        },
        {
          id: '5',
          assessmentType: 'wellness',
          title: 'Overall Wellness Check',
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          score: 85,
          maxScore: 100,
          percentage: 85,
          severity: 'low',
          responses: [
            { questionId: '1', question: 'Physical health rating?', answer: 8, score: 8 },
            { questionId: '2', question: 'Mental health rating?', answer: 9, score: 9 },
            { questionId: '3', question: 'Social connections?', answer: 7, score: 7 }
          ],
          recommendations: ['Maintain current wellness practices', 'Continue regular check-ins'],
          followUpRequired: false,
          tags: ['wellness', 'monthly']
        }
      ];

      setAssessments(mockAssessments);
      
    } catch (error) {
      console.error('Error loading assessment history:', error);
      showNotification('error', 'Failed to load assessment history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssessmentStats = async () => {
    if (!user) return;
    
    try {
      // Mock stats data
      const mockStats: AssessmentStats = {
        totalAssessments: 5,
        averageScore: 65,
        improvementTrend: 'improving',
        lastAssessment: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        streakDays: 7,
        completionRate: 85,
        byType: {
          mood: { count: 1, averageScore: 70, lastCompleted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
          anxiety: { count: 1, averageScore: 57, lastCompleted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          depression: { count: 1, averageScore: 30, lastCompleted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          stress: { count: 1, averageScore: 75, lastCompleted: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          wellness: { count: 1, averageScore: 85, lastCompleted: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading assessment stats:', error);
    }
  };

  const loadTrendData = async () => {
    try {
      // Mock trend data
      const mockTrends: AssessmentTrend[] = [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 85, type: 'wellness' },
        { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), score: 75, type: 'stress' },
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), score: 30, type: 'depression' },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), score: 57, type: 'anxiety' },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), score: 70, type: 'mood' }
      ];
      
      setTrends(mockTrends);
    } catch (error) {
      console.error('Error loading trend data:', error);
    }
  };

  const filterAssessments = () => {
    let filtered = [...assessments];

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(assessment => assessment.assessmentType === selectedType);
    }

    // Apply period filter
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const periodStart = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          periodStart.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(assessment => 
        new Date(assessment.completedAt) >= periodStart
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assessment => 
        assessment.title.toLowerCase().includes(query) ||
        assessment.assessmentType.toLowerCase().includes(query) ||
        assessment.tags.some(tag => tag.toLowerCase().includes(query)) ||
        assessment.notes?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
          break;
        case 'score':
          comparison = a.percentage - b.percentage;
          break;
        case 'type':
          comparison = a.assessmentType.localeCompare(b.assessmentType);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredAssessments(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'severe': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'mood': return '😊';
      case 'anxiety': return '😰';
      case 'depression': return '😔';
      case 'stress': return '😤';
      case 'wellness': return '🌟';
      default: return '📋';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUpIcon className="text-green-500" />;
      case 'declining': return <TrendingDownIcon className="text-red-500" />;
      default: return <ChartIcon className="text-gray-500" />;
    }
  };

  const exportData = () => {
    const csvData = assessments.map(assessment => ({
      Date: assessment.completedAt.toLocaleDateString(),
      Type: assessment.assessmentType,
      Title: assessment.title,
      Score: assessment.score,
      Percentage: assessment.percentage,
      Severity: assessment.severity,
      'Follow-up Required': assessment.followUpRequired ? 'Yes' : 'No'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessment-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification('success', 'Assessment history exported successfully');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading assessment history...</p>
      </div>
    );
  }

  return (
    <div className="assessment-history-view">
      <ViewHeader
        title="Assessment History"
        subtitle="Track your mental health assessments and progress over time"
      />

      {/* Stats Overview */}
      {stats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <ChartIcon />
              </div>
              <div className="stat-details">
                <div className="stat-value">{stats.totalAssessments}</div>
                <div className="stat-label">Total Assessments</div>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                {getTrendIcon(stats.improvementTrend)}
              </div>
              <div className="stat-details">
                <div className="stat-value">{stats.averageScore}%</div>
                <div className="stat-label">Average Score</div>
                <div className="stat-trend">{stats.improvementTrend}</div>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <CalendarIcon />
              </div>
              <div className="stat-details">
                <div className="stat-value">{stats.streakDays}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">
                <CheckIcon />
              </div>
              <div className="stat-details">
                <div className="stat-value">{stats.completionRate}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <Card className="filters-card">
        <div className="filters-header">
          <h3>Filter & Sort</h3>
          <div className="filter-actions">
            <AppButton
              variant="secondary"
              size="small"
              onClick={exportData}
            >
              <DownloadIcon /> Export
            </AppButton>
          </div>
        </div>

        <div className="filters-content">
          <div className="search-bar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="mood">Mood</option>
              <option value="anxiety">Anxiety</option>
              <option value="depression">Depression</option>
              <option value="stress">Stress</option>
              <option value="wellness">Wellness</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort as any);
                setSortOrder(order as any);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="score-desc">Highest Score</option>
              <option value="score-asc">Lowest Score</option>
              <option value="type-asc">Type A-Z</option>
              <option value="type-desc">Type Z-A</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assessment List */}
      <div className="assessments-list">
        {filteredAssessments.length === 0 ? (
          <Card className="empty-state">
            <h3>No Assessments Found</h3>
            <p>
              {assessments.length === 0 
                ? "You haven't completed any assessments yet. Start with a quick mood check!"
                : "No assessments match your current filters. Try adjusting your search criteria."
              }
            </p>
            <AppButton variant="primary">
              Take Assessment
            </AppButton>
          </Card>
        ) : (
          filteredAssessments.map(assessment => (
            <Card 
              key={assessment.id} 
              className={`assessment-card ${assessment.followUpRequired ? 'follow-up-required' : ''}`}
              onClick={() => setSelectedAssessment(assessment)}
            >
              <div className="assessment-header">
                <div className="assessment-type">
                  <span className="type-icon">{getAssessmentTypeIcon(assessment.assessmentType)}</span>
                  <div className="type-info">
                    <h4>{assessment.title}</h4>
                    <span className="assessment-type-label">{assessment.assessmentType}</span>
                  </div>
                </div>

                <div className="assessment-meta">
                  <div className="assessment-date">
                    <ClockIcon />
                    <span>{formatTimeAgo(assessment.completedAt)}</span>
                  </div>
                  {assessment.followUpRequired && (
                    <div className="follow-up-badge">
                      <AlertIcon />
                      <span>Follow-up Required</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="assessment-content">
                <div className="score-section">
                  <div className="score-display">
                    <div className="score-value">{assessment.score}/{assessment.maxScore}</div>
                    <div className="score-percentage">{assessment.percentage}%</div>
                  </div>
                  
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${assessment.percentage}%` }}
                    />
                  </div>
                  
                  <span className={`severity-badge ${getSeverityColor(assessment.severity)}`}>
                    {assessment.severity}
                  </span>
                </div>

                <div className="assessment-details">
                  <div className="recommendations">
                    <h5>Recommendations:</h5>
                    <ul>
                      {assessment.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                      {assessment.recommendations.length > 2 && (
                        <li>+{assessment.recommendations.length - 2} more...</li>
                      )}
                    </ul>
                  </div>

                  {assessment.notes && (
                    <div className="assessment-notes">
                      <strong>Notes:</strong> {assessment.notes}
                    </div>
                  )}
                </div>

                <div className="assessment-tags">
                  {assessment.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="assessment-actions">
                <AppButton variant="secondary" size="small">
                  View Details
                </AppButton>
                <AppButton variant="secondary" size="small">
                  <ShareIcon /> Share
                </AppButton>
                {assessment.followUpRequired && (
                  <AppButton variant="primary" size="small">
                    Schedule Follow-up
                  </AppButton>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <div className="modal-overlay" onClick={() => setSelectedAssessment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedAssessment.title}</h3>
              <button onClick={() => setSelectedAssessment(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="assessment-detail">
                <div className="detail-section">
                  <h4>Assessment Results</h4>
                  <div className="result-summary">
                    <div className="score-large">
                      <span className="score">{selectedAssessment.score}</span>
                      <span className="max-score">/{selectedAssessment.maxScore}</span>
                    </div>
                    <div className="percentage-large">{selectedAssessment.percentage}%</div>
                    <span className={`severity-large ${getSeverityColor(selectedAssessment.severity)}`}>
                      {selectedAssessment.severity}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Individual Responses</h4>
                  <div className="responses-list">
                    {selectedAssessment.responses.map((response, index) => (
                      <div key={index} className="response-item">
                        <div className="question">{response.question}</div>
                        <div className="answer-score">
                          <span className="answer">{response.answer}</span>
                          <span className="score">({response.score} points)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Recommendations</h4>
                  <ul className="recommendations-full">
                    {selectedAssessment.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {selectedAssessment.notes && (
                  <div className="detail-section">
                    <h4>Additional Notes</h4>
                    <p>{selectedAssessment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <AppButton variant="secondary" onClick={() => setSelectedAssessment(null)}>
                Close
              </AppButton>
              <AppButton variant="primary">
                Retake Assessment
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {filteredAssessments.length > 0 && (
        <div className="results-summary">
          <p>
            Showing {filteredAssessments.length} of {assessments.length} assessments
            {selectedType !== 'all' && ` • Type: ${selectedType}`}
            {selectedPeriod !== 'all' && ` • Period: ${selectedPeriod}`}
            {searchQuery && ` • Search: "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistoryView;
