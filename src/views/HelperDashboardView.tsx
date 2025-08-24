import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LazyMarkdown } from '../components/LazyMarkdown';
import { Dilemma, ActiveView, Achievement } from '../types';
import { PostCard } from '../components/PostCard';
import { ThumbsUpIcon, PostsIcon, CertifiedIcon, KudosIcon, HeartIcon } from '../components/icons.dynamic';
import { AppButton } from '../components/AppButton';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { ApiClient } from '../utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { XPBar } from '../components/XPBar';
import { Card } from '../components/Card';
import { useNotification } from '../contexts/NotificationContext';

interface HelperStats {
  totalSessions: number;
  totalHelpfulVotes: number;
  averageRating: number;
  completedTraining: number;
  xpPoints: number;
  level: number;
  nextLevelXP: number;
  currentStreak: number;
  longestStreak: number;
  responseTime: string;
}

interface SessionRequest {
  id: string;
  userId: string;
  username: string;
  requestedAt: string;
  urgency: 'low' | 'medium' | 'high';
  topic: string;
  preferredTime?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
}

interface HelperNotification {
  id: string;
  type: 'session_request' | 'kudos' | 'training' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
}

const HelperDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'training' | 'community'>('overview');
  const [stats, setStats] = useState<HelperStats>({
    totalSessions: 0,
    totalHelpfulVotes: 0,
    averageRating: 0,
    completedTraining: 0,
    xpPoints: 0,
    level: 1,
    nextLevelXP: 1000,
    currentStreak: 0,
    longestStreak: 0,
    responseTime: 'N/A'
  });
  
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [notifications, setNotifications] = useState<HelperNotification[]>([]);
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockStats: HelperStats = {
        totalSessions: 47,
        totalHelpfulVotes: 156,
        averageRating: 4.8,
        completedTraining: 85,
        xpPoints: 2340,
        level: 3,
        nextLevelXP: 3000,
        currentStreak: 12,
        longestStreak: 28,
        responseTime: '< 2 hours'
      };

      const mockRequests: SessionRequest[] = [
        {
          id: '1',
          userId: 'user1',
          username: 'Alex M.',
          requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          urgency: 'high',
          topic: 'Anxiety Support',
          preferredTime: 'ASAP',
          notes: 'Having a panic attack, need immediate support',
          status: 'pending'
        },
        {
          id: '2',
          userId: 'user2',
          username: 'Sarah K.',
          requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          urgency: 'medium',
          topic: 'Depression',
          preferredTime: 'This evening',
          notes: 'Feeling very low today, could use someone to talk to',
          status: 'pending'
        }
      ];

      const mockNotifications: HelperNotification[] = [
        {
          id: '1',
          type: 'session_request',
          title: 'New Session Request',
          message: 'Alex M. has requested a session for anxiety support',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isRead: false,
          actionRequired: true
        },
        {
          id: '2',
          type: 'kudos',
          title: 'Kudos Received!',
          message: 'You received 5 kudos from your recent session with Jamie',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          isRead: false
        }
      ];

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Session',
          description: 'Complete your first helping session',
          icon: '🎯',
          unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          xpReward: 100
        },
        {
          id: '2',
          title: 'Streak Master',
          description: 'Maintain a 7-day helping streak',
          icon: '🔥',
          unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          xpReward: 250
        }
      ];

      setStats(mockStats);
      setSessionRequests(mockRequests);
      setNotifications(mockNotifications);
      setAchievements(mockAchievements);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showNotification('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionRequest = useCallback(async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setSessionRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'accept' ? 'accepted' : 'declined' }
          : req
      ));
      
      showNotification('success', `Session request ${action}ed successfully`);
      
      // Update notifications
      setNotifications(prev => prev.map(notif => 
        notif.type === 'session_request' && notif.message.includes(requestId)
          ? { ...notif, isRead: true, actionRequired: false }
          : notif
      ));
      
    } catch (error) {
      console.error('Error handling session request:', error);
      showNotification('error', `Failed to ${action} session request`);
    }
  }, [showNotification]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  }, []);

  const urgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const progressToNextLevel = useMemo(() => {
    const currentLevelXP = (stats.level - 1) * 1000;
    const progressXP = stats.xpPoints - currentLevelXP;
    const levelXPRange = stats.nextLevelXP - currentLevelXP;
    return (progressXP / levelXPRange) * 100;
  }, [stats]);

  if (isLoading) {
    return (
      <div className="helper-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your helper dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="helper-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.firstName || 'Helper'}! 👋</h1>
          <p>Ready to make a difference today?</p>
        </div>
        
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <HeartIcon />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                <AnimatedNumber value={stats.totalSessions} />
              </div>
              <div className="stat-label">Sessions</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <ThumbsUpIcon />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                <AnimatedNumber value={stats.totalHelpfulVotes} />
              </div>
              <div className="stat-label">Helpful Votes</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CertifiedIcon />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <KudosIcon />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                <AnimatedNumber value={stats.xpPoints} />
              </div>
              <div className="stat-label">XP Points</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions ({sessionRequests.filter(req => req.status === 'pending').length})
        </button>
        <button
          className={`tab ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          Training
        </button>
        <button
          className={`tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Community
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-grid">
              <Card title="Level Progress" className="level-card">
                <div className="level-info">
                  <div className="level-badge">Level {stats.level}</div>
                  <XPBar 
                    currentXP={stats.xpPoints} 
                    nextLevelXP={stats.nextLevelXP}
                    level={stats.level}
                  />
                  <div className="xp-text">
                    {stats.xpPoints} / {stats.nextLevelXP} XP
                  </div>
                </div>
              </Card>

              <Card title="Recent Notifications" className="notifications-card">
                <div className="notifications-list">
                  {notifications.slice(0, 3).map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{formatTimeAgo(notification.timestamp)}</div>
                      </div>
                      {notification.actionRequired && (
                        <div className="action-required-badge">Action Required</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Achievements" className="achievements-card">
                <div className="achievements-grid">
                  {achievements.slice(0, 4).map(achievement => (
                    <div key={achievement.id} className="achievement-item">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-info">
                        <div className="achievement-title">{achievement.title}</div>
                        <div className="achievement-xp">+{achievement.xpReward} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Helper Stats" className="stats-card">
                <div className="detailed-stats">
                  <div className="stat-row">
                    <span>Current Streak</span>
                    <span className="stat-value">{stats.currentStreak} days</span>
                  </div>
                  <div className="stat-row">
                    <span>Longest Streak</span>
                    <span className="stat-value">{stats.longestStreak} days</span>
                  </div>
                  <div className="stat-row">
                    <span>Response Time</span>
                    <span className="stat-value">{stats.responseTime}</span>
                  </div>
                  <div className="stat-row">
                    <span>Training Progress</span>
                    <span className="stat-value">{stats.completedTraining}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="sessions-section">
            <div className="section-header">
              <h2>Session Requests</h2>
              <p>Manage incoming session requests from community members</p>
            </div>

            {sessionRequests.filter(req => req.status === 'pending').length === 0 ? (
              <Card className="empty-state">
                <div className="empty-content">
                  <h3>No pending session requests</h3>
                  <p>New requests will appear here when community members reach out for help.</p>
                </div>
              </Card>
            ) : (
              <div className="session-requests">
                {sessionRequests
                  .filter(req => req.status === 'pending')
                  .map(request => (
                    <Card key={request.id} className="session-request-card">
                      <div className="request-header">
                        <div className="request-info">
                          <div className="username">{request.username}</div>
                          <div className="request-time">{formatTimeAgo(request.requestedAt)}</div>
                        </div>
                        <div 
                          className="urgency-badge"
                          style={{ backgroundColor: urgencyColor(request.urgency) }}
                        >
                          {request.urgency.toUpperCase()}
                        </div>
                      </div>

                      <div className="request-content">
                        <div className="request-topic">
                          <strong>Topic:</strong> {request.topic}
                        </div>
                        {request.preferredTime && (
                          <div className="preferred-time">
                            <strong>Preferred Time:</strong> {request.preferredTime}
                          </div>
                        )}
                        {request.notes && (
                          <div className="request-notes">
                            <strong>Notes:</strong> {request.notes}
                          </div>
                        )}
                      </div>

                      <div className="request-actions">
                        <AppButton
                          variant="secondary"
                          onClick={() => handleSessionRequest(request.id, 'decline')}
                        >
                          Decline
                        </AppButton>
                        <AppButton
                          onClick={() => handleSessionRequest(request.id, 'accept')}
                        >
                          Accept Session
                        </AppButton>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <div className="training-section">
            <Card title="Training Progress" className="training-card">
              <div className="training-content">
                <div className="progress-overview">
                  <div className="progress-circle">
                    <div className="progress-value">{stats.completedTraining}%</div>
                    <div className="progress-label">Complete</div>
                  </div>
                </div>
                
                <div className="training-modules">
                  <h3>Available Training Modules</h3>
                  <div className="modules-list">
                    <div className="module-item completed">
                      <div className="module-icon">✅</div>
                      <div className="module-info">
                        <div className="module-title">Crisis Intervention Basics</div>
                        <div className="module-status">Completed</div>
                      </div>
                    </div>
                    
                    <div className="module-item in-progress">
                      <div className="module-icon">🔄</div>
                      <div className="module-info">
                        <div className="module-title">Active Listening Techniques</div>
                        <div className="module-status">In Progress (75%)</div>
                      </div>
                    </div>
                    
                    <div className="module-item">
                      <div className="module-icon">📚</div>
                      <div className="module-info">
                        <div className="module-title">Trauma-Informed Care</div>
                        <div className="module-status">Not Started</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="community-section">
            <Card title="Helper Community" className="community-card">
              <div className="community-content">
                <h3>Connect with Other Helpers</h3>
                <p>Share experiences, get support, and learn from fellow helpers.</p>
                
                <div className="community-actions">
                  <AppButton>Join Discussion Forum</AppButton>
                  <AppButton variant="secondary">View Helper Resources</AppButton>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelperDashboardView;
