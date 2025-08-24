import React, { useState, useEffect, useCallback } from 'react';
import { Helper, CommunityStats } from '../types';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { AppTextArea } from '../components/AppInput';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { useNotification } from '../contexts/NotificationContext';

interface AdminDashboardViewProps {
  onUpdateApplicationStatus: (helperId: string, status: Helper['applicationStatus'], notes?: string) => void;
}

interface SystemMetric {
  id: string;
  name: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface ModerationAction {
  id: string;
  type: 'warning' | 'suspension' | 'ban' | 'content_removal';
  userId: string;
  username: string;
  reason: string;
  moderatorId: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'appealed';
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ 
  onUpdateApplicationStatus 
}) => {
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'moderation' | 'analytics' | 'system'>('overview');
  const [applications, setApplications] = useState<Helper[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Helper | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockApplications: Helper[] = [
        {
          id: 'helper-1',
          userId: 'user-1',
          displayName: 'Dr. Sarah Johnson',
          bio: 'Licensed therapist with 10 years of experience in cognitive behavioral therapy.',
          specializations: ['anxiety', 'depression', 'trauma'],
          certifications: ['LCSW', 'CBT Certified'],
          languages: ['English', 'Spanish'],
          availability: {
            timezone: 'EST',
            schedule: {
              monday: [{ start: '09:00', end: '17:00' }],
              tuesday: [{ start: '09:00', end: '17:00' }],
              wednesday: [{ start: '09:00', end: '17:00' }],
              thursday: [{ start: '09:00', end: '17:00' }],
              friday: [{ start: '09:00', end: '15:00' }],
              saturday: [],
              sunday: []
            }
          },
          rating: 0,
          totalSessions: 0,
          responseTime: 'N/A',
          isVerified: false,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          applicationStatus: 'pending',
          applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          yearsOfExperience: 10,
          education: ['PhD Psychology - Harvard University', 'MA Clinical Psychology - Boston University']
        },
        {
          id: 'helper-2',
          userId: 'user-2',
          displayName: 'Michael Chen',
          bio: 'Peer counselor with lived experience in addiction recovery.',
          specializations: ['addiction', 'recovery', 'peer-support'],
          certifications: ['Certified Peer Recovery Specialist'],
          languages: ['English', 'Mandarin'],
          availability: {
            timezone: 'PST',
            schedule: {
              monday: [{ start: '18:00', end: '22:00' }],
              tuesday: [{ start: '18:00', end: '22:00' }],
              wednesday: [{ start: '18:00', end: '22:00' }],
              thursday: [{ start: '18:00', end: '22:00' }],
              friday: [{ start: '18:00', end: '22:00' }],
              saturday: [{ start: '10:00', end: '16:00' }],
              sunday: [{ start: '10:00', end: '16:00' }]
            }
          },
          rating: 0,
          totalSessions: 0,
          responseTime: 'N/A',
          isVerified: false,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          applicationStatus: 'pending',
          applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          yearsOfExperience: 3,
          education: ['BA Social Work - UC Berkeley']
        }
      ];

      const mockStats: CommunityStats = {
        totalUsers: 1247,
        activeUsers: 892,
        totalHelpers: 34,
        activeHelpers: 28,
        totalSessions: 2156,
        averageRating: 4.7,
        responseTime: '< 2 hours'
      };

      const mockMetrics: SystemMetric[] = [
        {
          id: '1',
          name: 'Server Uptime',
          value: '99.9%',
          trend: 'stable',
          description: 'System availability over the last 30 days'
        },
        {
          id: '2',
          name: 'Active Sessions',
          value: 47,
          trend: 'up',
          description: 'Currently active support sessions'
        },
        {
          id: '3',
          name: 'Response Time',
          value: '1.2s',
          trend: 'stable',
          description: 'Average API response time'
        },
        {
          id: '4',
          name: 'Error Rate',
          value: '0.03%',
          trend: 'down',
          description: 'System error rate over the last 24 hours'
        }
      ];

      const mockModerationActions: ModerationAction[] = [
        {
          id: '1',
          type: 'warning',
          userId: 'user-123',
          username: 'TroublerUser',
          reason: 'Inappropriate language in community chat',
          moderatorId: 'mod-1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'content_removal',
          userId: 'user-456',
          username: 'SpamAccount',
          reason: 'Posting spam content in forums',
          moderatorId: 'mod-2',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ];

      setApplications(mockApplications);
      setCommunityStats(mockStats);
      setSystemMetrics(mockMetrics);
      setModerationActions(mockModerationActions);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showNotification('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationReview = useCallback(async (
    helper: Helper, 
    status: Helper['applicationStatus']
  ) => {
    try {
      await onUpdateApplicationStatus(helper.id, status, reviewNotes);
      
      setApplications(prev => prev.map(app => 
        app.id === helper.id 
          ? { ...app, applicationStatus: status }
          : app
      ));
      
      showNotification('success', `Application ${status} successfully`);
      setShowApplicationModal(false);
      setSelectedApplication(null);
      setReviewNotes('');
      
    } catch (error) {
      console.error('Error updating application status:', error);
      showNotification('error', 'Failed to update application status');
    }
  }, [onUpdateApplicationStatus, reviewNotes, showNotification]);

  const openApplicationModal = (helper: Helper) => {
    setSelectedApplication(helper);
    setShowApplicationModal(true);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage the CoreV2 Mental Health Platform</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications ({applications.filter(app => app.applicationStatus === 'pending').length})
        </button>
        <button
          className={`tab ${activeTab === 'moderation' ? 'active' : ''}`}
          onClick={() => setActiveTab('moderation')}
        >
          Moderation
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <Card title="Community Stats" className="stats-card">
                {communityStats && (
                  <div className="stats-content">
                    <div className="stat-item">
                      <span className="stat-label">Total Users</span>
                      <span className="stat-value">{communityStats.totalUsers.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Active Users</span>
                      <span className="stat-value">{communityStats.activeUsers.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Helpers</span>
                      <span className="stat-value">{communityStats.totalHelpers}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Active Helpers</span>
                      <span className="stat-value">{communityStats.activeHelpers}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Sessions</span>
                      <span className="stat-value">{communityStats.totalSessions.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Rating</span>
                      <span className="stat-value">{communityStats.averageRating}</span>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="System Health" className="system-health-card">
                <div className="metrics-grid">
                  {systemMetrics.map(metric => (
                    <div key={metric.id} className="metric-item">
                      <div className="metric-header">
                        <span className="metric-name">{metric.name}</span>
                        <span 
                          className="metric-trend"
                          style={{ color: getTrendColor(metric.trend) }}
                        >
                          {getTrendIcon(metric.trend)}
                        </span>
                      </div>
                      <div className="metric-value">{metric.value}</div>
                      <div className="metric-description">{metric.description}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="recent-activity">
              <Card title="Recent Activity" className="activity-card">
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">👥</div>
                    <div className="activity-content">
                      <div className="activity-title">New Helper Application</div>
                      <div className="activity-description">Dr. Sarah Johnson submitted an application</div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-icon">⚠️</div>
                    <div className="activity-content">
                      <div className="activity-title">Moderation Action</div>
                      <div className="activity-description">Warning issued to user for inappropriate content</div>
                      <div className="activity-time">4 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-icon">📊</div>
                    <div className="activity-content">
                      <div className="activity-title">System Update</div>
                      <div className="activity-description">Platform updated to version 2.1.3</div>
                      <div className="activity-time">1 day ago</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <div className="section-header">
              <h2>Helper Applications</h2>
              <p>Review and approve new helper applications</p>
            </div>

            {applications.filter(app => app.applicationStatus === 'pending').length === 0 ? (
              <Card className="empty-state">
                <div className="empty-content">
                  <h3>No pending applications</h3>
                  <p>New helper applications will appear here for review.</p>
                </div>
              </Card>
            ) : (
              <div className="applications-list">
                {applications
                  .filter(app => app.applicationStatus === 'pending')
                  .map(application => (
                    <Card key={application.id} className="application-card">
                      <div className="application-header">
                        <div className="applicant-info">
                          <h3>{application.displayName}</h3>
                          <p>Applied {formatTimeAgo(application.applicationDate || '')}</p>
                        </div>
                        <div className="application-status">
                          <span className="status-badge pending">Pending Review</span>
                        </div>
                      </div>

                      <div className="application-content">
                        <div className="bio-section">
                          <h4>Bio</h4>
                          <p>{application.bio}</p>
                        </div>

                        <div className="details-grid">
                          <div className="detail-section">
                            <h4>Specializations</h4>
                            <div className="tags">
                              {application.specializations.map(spec => (
                                <span key={spec} className="tag">{spec}</span>
                              ))}
                            </div>
                          </div>

                          <div className="detail-section">
                            <h4>Certifications</h4>
                            <ul>
                              {application.certifications.map((cert, index) => (
                                <li key={index}>{cert}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="detail-section">
                            <h4>Languages</h4>
                            <div className="tags">
                              {application.languages.map(lang => (
                                <span key={lang} className="tag">{lang}</span>
                              ))}
                            </div>
                          </div>

                          <div className="detail-section">
                            <h4>Experience</h4>
                            <p>{application.yearsOfExperience} years</p>
                          </div>
                        </div>

                        {application.education && (
                          <div className="education-section">
                            <h4>Education</h4>
                            <ul>
                              {application.education.map((edu, index) => (
                                <li key={index}>{edu}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="application-actions">
                        <AppButton
                          variant="secondary"
                          onClick={() => openApplicationModal(application)}
                        >
                          Review Application
                        </AppButton>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="moderation-section">
            <Card title="Recent Moderation Actions" className="moderation-card">
              <div className="moderation-list">
                {moderationActions.map(action => (
                  <div key={action.id} className="moderation-item">
                    <div className="action-info">
                      <div className="action-type">{action.type.replace('_', ' ').toUpperCase()}</div>
                      <div className="action-user">User: {action.username}</div>
                      <div className="action-reason">{action.reason}</div>
                      <div className="action-time">{formatTimeAgo(action.timestamp)}</div>
                    </div>
                    <div className="action-status">
                      <span className={`status-badge ${action.status}`}>
                        {action.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <Card title="Platform Analytics" className="analytics-card">
              <div className="analytics-content">
                <h3>Coming Soon</h3>
                <p>Detailed analytics and reporting features will be available here.</p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="system-section">
            <Card title="System Management" className="system-card">
              <div className="system-content">
                <h3>System Tools</h3>
                <div className="system-actions">
                  <AppButton>Database Backup</AppButton>
                  <AppButton variant="secondary">Clear Cache</AppButton>
                  <AppButton variant="secondary">View Logs</AppButton>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Application Review Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedApplication(null);
          setReviewNotes('');
        }}
        title="Review Helper Application"
      >
        {selectedApplication && (
          <div className="application-review-modal">
            <div className="applicant-summary">
              <h3>{selectedApplication.displayName}</h3>
              <p>{selectedApplication.bio}</p>
            </div>

            <div className="review-section">
              <AppTextArea
                label="Review Notes (optional)"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this application..."
                rows={4}
              />
            </div>

            <div className="modal-actions">
              <AppButton
                variant="danger"
                onClick={() => handleApplicationReview(selectedApplication, 'rejected')}
              >
                Reject Application
              </AppButton>
              <AppButton
                onClick={() => handleApplicationReview(selectedApplication, 'approved')}
              >
                Approve Application
              </AppButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
