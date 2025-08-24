import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ViewHeader } from '../components/ViewHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, EyeIcon, TrendingUpIcon } from '../components/icons.dynamic';

interface ActivityItem {
  id: string;
  type: 'post_created' | 'post_liked' | 'comment_made' | 'post_shared' | 'post_bookmarked' | 'profile_viewed' | 'session_joined' | 'achievement_earned';
  title: string;
  description: string;
  timestamp: Date;
  relatedId?: string;
  relatedTitle?: string;
  metadata?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    category?: string;
    achievement?: string;
  };
}

interface ActivityStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  profileViews: number;
  sessionsJoined: number;
  achievementsEarned: number;
  streakDays: number;
}

interface ActivityFilters {
  type: string;
  timeRange: 'today' | 'week' | 'month' | 'all';
  category: string;
}

const MyActivityView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    type: 'all',
    timeRange: 'week',
    category: 'all'
  });
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    loadActivityData();
    loadActivityStats();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const loadActivityData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Mock activity data
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'post_created',
          title: 'Created a new post',
          description: 'Shared your experience with anxiety management',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          relatedId: 'post-123',
          relatedTitle: 'My Journey with Anxiety',
          metadata: {
            likes: 15,
            comments: 3,
            views: 45,
            category: 'personal-story'
          }
        },
        {
          id: '2',
          type: 'comment_made',
          title: 'Commented on a post',
          description: 'Offered support to someone struggling with depression',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          relatedId: 'post-456',
          relatedTitle: 'Feeling overwhelmed lately',
          metadata: {
            likes: 8
          }
        },
        {
          id: '3',
          type: 'post_liked',
          title: 'Liked a post',
          description: 'Found helpful advice on sleep hygiene',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          relatedId: 'post-789',
          relatedTitle: 'Tips for Better Sleep',
          metadata: {
            category: 'wellness'
          }
        },
        {
          id: '4',
          type: 'session_joined',
          title: 'Joined a group session',
          description: 'Participated in morning meditation session',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          relatedId: 'session-101',
          relatedTitle: 'Morning Mindfulness',
          metadata: {
            category: 'meditation'
          }
        },
        {
          id: '5',
          type: 'achievement_earned',
          title: 'Achievement unlocked',
          description: 'Earned the "Supportive Community Member" badge',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          metadata: {
            achievement: 'Supportive Community Member'
          }
        },
        {
          id: '6',
          type: 'post_bookmarked',
          title: 'Bookmarked a post',
          description: 'Saved a helpful resource about coping strategies',
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
          relatedId: 'post-999',
          relatedTitle: 'Effective Coping Strategies',
          metadata: {
            category: 'coping'
          }
        }
      ];

      setActivities(mockActivities);
      
    } catch (error) {
      console.error('Error loading activity data:', error);
      showNotification('error', 'Failed to load activity data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivityStats = async () => {
    if (!user) return;
    
    try {
      // Mock stats
      const mockStats: ActivityStats = {
        totalPosts: 12,
        totalLikes: 89,
        totalComments: 34,
        totalShares: 15,
        profileViews: 156,
        sessionsJoined: 8,
        achievementsEarned: 5,
        streakDays: 7
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    // Apply time range filter
    const now = Date.now();
    switch (filters.timeRange) {
      case 'today':
        filtered = filtered.filter(activity => 
          now - activity.timestamp.getTime() < 24 * 60 * 60 * 1000
        );
        break;
      case 'week':
        filtered = filtered.filter(activity => 
          now - activity.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
        );
        break;
      case 'month':
        filtered = filtered.filter(activity => 
          now - activity.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000
        );
        break;
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(activity => 
        activity.metadata?.category === filters.category
      );
    }

    // Sort by most recent
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post_created':
        return <ShareIcon className="text-blue-500" />;
      case 'post_liked':
        return <HeartIcon className="text-red-500" />;
      case 'comment_made':
        return <CommentIcon className="text-green-500" />;
      case 'post_shared':
        return <ShareIcon className="text-purple-500" />;
      case 'post_bookmarked':
        return <BookmarkIcon className="text-yellow-500" />;
      case 'profile_viewed':
        return <EyeIcon className="text-gray-500" />;
      case 'session_joined':
        return <TrendingUpIcon className="text-indigo-500" />;
      case 'achievement_earned':
        return <TrendingUpIcon className="text-gold-500" />;
      default:
        return <ShareIcon className="text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'post_created':
        return 'Post Created';
      case 'post_liked':
        return 'Post Liked';
      case 'comment_made':
        return 'Comment Made';
      case 'post_shared':
        return 'Post Shared';
      case 'post_bookmarked':
        return 'Post Bookmarked';
      case 'profile_viewed':
        return 'Profile Viewed';
      case 'session_joined':
        return 'Session Joined';
      case 'achievement_earned':
        return 'Achievement Earned';
      default:
        return 'Activity';
    }
  };

  const handleViewRelated = (activityId: string, relatedId?: string) => {
    if (relatedId) {
      showNotification('info', `Opening related content: ${relatedId}`);
      // Navigate to related content
    }
  };

  const handleExportActivity = () => {
    try {
      const csvContent = [
        ['Date', 'Type', 'Title', 'Description', 'Related Content'],
        ...filteredActivities.map(activity => [
          activity.timestamp.toISOString(),
          getActivityTypeLabel(activity.type),
          activity.title,
          activity.description,
          activity.relatedTitle || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-activity-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Activity exported successfully');
    } catch (error) {
      console.error('Error exporting activity:', error);
      showNotification('error', 'Failed to export activity');
    }
  };

  const activityTypeOptions = useMemo(() => [
    { value: 'all', label: 'All Activities' },
    { value: 'post_created', label: 'Posts Created' },
    { value: 'post_liked', label: 'Posts Liked' },
    { value: 'comment_made', label: 'Comments Made' },
    { value: 'post_shared', label: 'Posts Shared' },
    { value: 'post_bookmarked', label: 'Posts Bookmarked' },
    { value: 'session_joined', label: 'Sessions Joined' },
    { value: 'achievement_earned', label: 'Achievements Earned' }
  ], []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading your activity...</p>
      </div>
    );
  }

  return (
    <div className="my-activity-view">
      <ViewHeader
        title="My Activity"
        subtitle="Track your engagement and contributions"
      />

      {stats && showStats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-value">{stats.totalPosts}</div>
            <div className="stat-label">Posts Created</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.totalLikes}</div>
            <div className="stat-label">Likes Given</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.totalComments}</div>
            <div className="stat-label">Comments Made</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.sessionsJoined}</div>
            <div className="stat-label">Sessions Joined</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.achievementsEarned}</div>
            <div className="stat-label">Achievements</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.streakDays}</div>
            <div className="stat-label">Day Streak</div>
          </Card>
        </div>
      )}

      <Card className="filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Activity Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              {activityTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Time Range</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All Categories</option>
              <option value="personal-story">Personal Stories</option>
              <option value="wellness">Wellness</option>
              <option value="coping">Coping</option>
              <option value="meditation">Meditation</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <AppButton
            variant="secondary"
            size="small"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </AppButton>
          <AppButton
            variant="secondary"
            size="small"
            onClick={handleExportActivity}
          >
            Export Activity
          </AppButton>
        </div>
      </Card>

      <div className="activity-list">
        {filteredActivities.length === 0 ? (
          <Card className="empty-state">
            <p>No activity found for the selected filters</p>
            <p>Start engaging with the community to see your activity here!</p>
          </Card>
        ) : (
          filteredActivities.map(activity => (
            <Card key={activity.id} className="activity-item">
              <div className="activity-header">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <h3>{activity.title}</h3>
                  <p>{activity.description}</p>
                  {activity.relatedTitle && (
                    <div className="related-content">
                      <span>Related: "{activity.relatedTitle}"</span>
                    </div>
                  )}
                </div>
                <div className="activity-time">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>

              {activity.metadata && (
                <div className="activity-metadata">
                  {activity.metadata.likes !== undefined && (
                    <span className="meta-item">
                      <HeartIcon /> {activity.metadata.likes}
                    </span>
                  )}
                  {activity.metadata.comments !== undefined && (
                    <span className="meta-item">
                      <CommentIcon /> {activity.metadata.comments}
                    </span>
                  )}
                  {activity.metadata.views !== undefined && (
                    <span className="meta-item">
                      <EyeIcon /> {activity.metadata.views}
                    </span>
                  )}
                  {activity.metadata.category && (
                    <span className="meta-category">
                      {activity.metadata.category}
                    </span>
                  )}
                  {activity.metadata.achievement && (
                    <span className="meta-achievement">
                      🏆 {activity.metadata.achievement}
                    </span>
                  )}
                </div>
              )}

              {activity.relatedId && (
                <div className="activity-actions">
                  <AppButton
                    variant="secondary"
                    size="small"
                    onClick={() => handleViewRelated(activity.id, activity.relatedId)}
                  >
                    View Related
                  </AppButton>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {filteredActivities.length > 0 && (
        <div className="activity-summary">
          <p>Showing {filteredActivities.length} activities</p>
        </div>
      )}
    </div>
  );
};

export default MyActivityView;
