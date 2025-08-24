import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ViewHeader } from '../components/ViewHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { 
  StarIcon, 
  MessageIcon, 
  UserGroupIcon, 
  TrendingUpIcon, 
  BookIcon, 
  CalendarIcon,
  SearchIcon,
  FilterIcon 
} from '../components/icons.dynamic';

interface Helper {
  id: string;
  name: string;
  bio: string;
  specializations: string[];
  rating: number;
  totalReviews: number;
  totalSessions: number;
  isOnline: boolean;
  responseTime: string;
  languages: string[];
  joinedDate: Date;
  lastActive: Date;
  isVerified: boolean;
  avatar?: string;
}

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'discussion' | 'resource' | 'success-story' | 'question' | 'announcement';
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  isPinned: boolean;
  tags: string[];
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'training' | 'support-group' | 'webinar' | 'social';
  date: Date;
  duration: number; // in minutes
  maxParticipants?: number;
  currentParticipants: number;
  isRegistered: boolean;
  facilitator: string;
  location: 'online' | 'in-person';
}

interface CommunityStats {
  totalHelpers: number;
  onlineHelpers: number;
  totalSessions: number;
  averageRating: number;
  totalPosts: number;
  activeDiscussions: number;
}

const HelperCommunityView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'helpers' | 'discussions' | 'events' | 'resources'>('helpers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [postFilter, setPostFilter] = useState<'all' | 'discussion' | 'resource' | 'question'>('all');

  useEffect(() => {
    loadCommunityData();
    loadCommunityStats();
  }, []);

  const loadCommunityData = async () => {
    try {
      setIsLoading(true);
      
      // Mock helpers data
      const mockHelpers: Helper[] = [
        {
          id: '1',
          name: 'Sarah Thompson',
          bio: 'Licensed counselor with 5 years of experience in anxiety and depression support.',
          specializations: ['Anxiety', 'Depression', 'Stress Management'],
          rating: 4.9,
          totalReviews: 127,
          totalSessions: 234,
          isOnline: true,
          responseTime: 'Within 1 hour',
          languages: ['English', 'Spanish'],
          joinedDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 15 * 60 * 1000),
          isVerified: true
        },
        {
          id: '2',
          name: 'Michael Chen',
          bio: 'Peer support specialist focusing on addiction recovery and mental wellness.',
          specializations: ['Addiction Recovery', 'PTSD', 'Trauma'],
          rating: 4.8,
          totalReviews: 89,
          totalSessions: 156,
          isOnline: false,
          responseTime: 'Within 2 hours',
          languages: ['English', 'Mandarin'],
          joinedDate: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isVerified: true
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          bio: 'Youth counselor specializing in teen mental health and family support.',
          specializations: ['Teen Mental Health', 'Family Therapy', 'Eating Disorders'],
          rating: 4.7,
          totalReviews: 64,
          totalSessions: 98,
          isOnline: true,
          responseTime: 'Within 30 minutes',
          languages: ['English', 'Spanish', 'Portuguese'],
          joinedDate: new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 5 * 60 * 1000),
          isVerified: false
        }
      ];

      // Mock posts data
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          authorId: '1',
          authorName: 'Sarah Thompson',
          title: 'New Techniques for Managing Panic Attacks',
          content: 'I wanted to share some effective breathing techniques that have been working well with my clients...',
          category: 'resource',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likes: 23,
          comments: 8,
          isLiked: false,
          isPinned: true,
          tags: ['anxiety', 'techniques', 'breathing']
        },
        {
          id: '2',
          authorId: '2',
          authorName: 'Michael Chen',
          title: 'Question about handling resistant clients',
          content: 'Has anyone dealt with clients who are resistant to opening up? Looking for advice...',
          category: 'question',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          likes: 15,
          comments: 12,
          isLiked: true,
          isPinned: false,
          tags: ['advice', 'client-relations']
        },
        {
          id: '3',
          authorId: '3',
          authorName: 'Emily Rodriguez',
          title: 'Success Story: Teen Overcomes Social Anxiety',
          content: 'Wanted to share a heartwarming success story from this week...',
          category: 'success-story',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          likes: 45,
          comments: 18,
          isLiked: false,
          isPinned: false,
          tags: ['success', 'teens', 'anxiety']
        }
      ];

      // Mock events data
      const mockEvents: CommunityEvent[] = [
        {
          id: '1',
          title: 'Crisis Intervention Workshop',
          description: 'Learn advanced techniques for handling crisis situations safely and effectively.',
          type: 'workshop',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          duration: 120,
          maxParticipants: 25,
          currentParticipants: 18,
          isRegistered: false,
          facilitator: 'Dr. Jennifer Walsh',
          location: 'online'
        },
        {
          id: '2',
          title: 'Monthly Helper Support Group',
          description: 'Connect with fellow helpers, share experiences, and get support.',
          type: 'support-group',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          duration: 90,
          currentParticipants: 12,
          isRegistered: true,
          facilitator: 'Community Team',
          location: 'online'
        },
        {
          id: '3',
          title: 'Understanding Trauma-Informed Care',
          description: 'Webinar on implementing trauma-informed approaches in peer support.',
          type: 'webinar',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          duration: 60,
          maxParticipants: 100,
          currentParticipants: 67,
          isRegistered: false,
          facilitator: 'Dr. Marcus Johnson',
          location: 'online'
        }
      ];

      setHelpers(mockHelpers);
      setPosts(mockPosts);
      setEvents(mockEvents);
      
    } catch (error) {
      console.error('Error loading community data:', error);
      showNotification('error', 'Failed to load community data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommunityStats = async () => {
    try {
      // Mock stats
      const mockStats: CommunityStats = {
        totalHelpers: 156,
        onlineHelpers: 23,
        totalSessions: 2847,
        averageRating: 4.7,
        totalPosts: 89,
        activeDiscussions: 12
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleConnectWithHelper = async (helperId: string) => {
    const helper = helpers.find(h => h.id === helperId);
    if (helper) {
      showNotification('info', `Connecting with ${helper.name}...`);
      // Navigate to chat or connection flow
    }
  };

  const handleLikePost = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleRegisterForEvent = async (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const isRegistering = !event.isRegistered;
        return {
          ...event,
          isRegistered: isRegistering,
          currentParticipants: isRegistering 
            ? event.currentParticipants + 1 
            : event.currentParticipants - 1
        };
      }
      return event;
    }));

    const event = events.find(e => e.id === eventId);
    if (event) {
      showNotification(
        'success',
        event.isRegistered ? 'Unregistered from event' : 'Registered for event!'
      );
    }
  };

  const filteredHelpers = helpers.filter(helper => {
    if (showOnlineOnly && !helper.isOnline) return false;
    if (selectedSpecialization !== 'all' && !helper.specializations.includes(selectedSpecialization)) return false;
    if (searchQuery && !helper.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !helper.bio.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredPosts = posts.filter(post => {
    if (postFilter !== 'all' && post.category !== postFilter) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
        size="small"
      />
    ));
  };

  const getSpecializations = () => {
    const allSpecs = helpers.flatMap(h => h.specializations);
    return [...new Set(allSpecs)];
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading helper community...</p>
      </div>
    );
  }

  return (
    <div className="helper-community-view">
      <ViewHeader
        title="Helper Community"
        subtitle="Connect with fellow helpers, share knowledge, and grow together"
      />

      {/* Community Stats */}
      {stats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-value">{stats.totalHelpers}</div>
            <div className="stat-label">Total Helpers</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.onlineHelpers}</div>
            <div className="stat-label">Online Now</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.totalSessions}</div>
            <div className="stat-label">Total Sessions</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
            <div className="stat-label">Avg Rating</div>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'helpers' ? 'active' : ''}`}
          onClick={() => setActiveTab('helpers')}
        >
          <UserGroupIcon /> Helpers
        </button>
        <button
          className={`tab ${activeTab === 'discussions' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussions')}
        >
          <MessageIcon /> Discussions
        </button>
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <CalendarIcon /> Events
        </button>
        <button
          className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <BookIcon /> Resources
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="filters-card">
        <div className="search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'helpers' && (
          <div className="helper-filters">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <option value="all">All Specializations</option>
              {getSpecializations().map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
              />
              Online only
            </label>
          </div>
        )}

        {activeTab === 'discussions' && (
          <div className="post-filters">
            <select
              value={postFilter}
              onChange={(e) => setPostFilter(e.target.value as any)}
            >
              <option value="all">All Posts</option>
              <option value="discussion">Discussions</option>
              <option value="resource">Resources</option>
              <option value="question">Questions</option>
            </select>
          </div>
        )}
      </Card>

      {/* Helpers Tab */}
      {activeTab === 'helpers' && (
        <div className="helpers-content">
          <div className="helpers-grid">
            {filteredHelpers.map(helper => (
              <Card key={helper.id} className="helper-card">
                <div className="helper-header">
                  <div className="helper-info">
                    <h3>{helper.name}</h3>
                    <div className="helper-status">
                      <div className={`status-dot ${helper.isOnline ? 'online' : 'offline'}`} />
                      <span>{helper.isOnline ? 'Online' : 'Offline'}</span>
                      {helper.isVerified && <span className="verified">✓ Verified</span>}
                    </div>
                  </div>
                </div>

                <p className="helper-bio">{helper.bio}</p>

                <div className="helper-specializations">
                  {helper.specializations.map(spec => (
                    <span key={spec} className="specialization-tag">{spec}</span>
                  ))}
                </div>

                <div className="helper-stats">
                  <div className="stat-item">
                    <div className="stars">
                      {renderStars(Math.round(helper.rating))}
                    </div>
                    <span>{helper.rating.toFixed(1)} ({helper.totalReviews} reviews)</span>
                  </div>
                  <div className="stat-item">
                    <span>{helper.totalSessions} sessions completed</span>
                  </div>
                  <div className="stat-item">
                    <span>Responds {helper.responseTime.toLowerCase()}</span>
                  </div>
                </div>

                <div className="helper-languages">
                  <strong>Languages:</strong> {helper.languages.join(', ')}
                </div>

                <div className="helper-actions">
                  <AppButton
                    variant="primary"
                    size="small"
                    onClick={() => handleConnectWithHelper(helper.id)}
                  >
                    <MessageIcon /> Connect
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    size="small"
                    onClick={() => showNotification('info', `Viewing ${helper.name}'s profile`)}
                  >
                    View Profile
                  </AppButton>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="discussions-content">
          <div className="posts-list">
            {filteredPosts.map(post => (
              <Card key={post.id} className={`post-card ${post.isPinned ? 'pinned' : ''}`}>
                <div className="post-header">
                  <div className="post-info">
                    <h3>{post.title}</h3>
                    <div className="post-meta">
                      <span className="author">by {post.authorName}</span>
                      <span className="timestamp">{formatTimeAgo(post.timestamp)}</span>
                      <span className={`category ${post.category}`}>{post.category}</span>
                      {post.isPinned && <span className="pinned-badge">📌 Pinned</span>}
                    </div>
                  </div>
                </div>

                <p className="post-content">{post.content}</p>

                <div className="post-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>

                <div className="post-actions">
                  <AppButton
                    variant={post.isLiked ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => handleLikePost(post.id)}
                  >
                    ❤️ {post.likes}
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    size="small"
                    onClick={() => showNotification('info', 'Opening comments')}
                  >
                    💬 {post.comments}
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    size="small"
                    onClick={() => showNotification('info', 'Sharing post')}
                  >
                    🔗 Share
                  </AppButton>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="events-content">
          <div className="events-list">
            {events.map(event => (
              <Card key={event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <div className="event-type">{event.type}</div>
                </div>

                <p className="event-description">{event.description}</p>

                <div className="event-details">
                  <div className="detail-item">
                    <strong>Date:</strong> {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
                  </div>
                  <div className="detail-item">
                    <strong>Duration:</strong> {event.duration} minutes
                  </div>
                  <div className="detail-item">
                    <strong>Facilitator:</strong> {event.facilitator}
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong> {event.location}
                  </div>
                  {event.maxParticipants && (
                    <div className="detail-item">
                      <strong>Participants:</strong> {event.currentParticipants}/{event.maxParticipants}
                    </div>
                  )}
                </div>

                <div className="event-actions">
                  <AppButton
                    variant={event.isRegistered ? 'danger' : 'primary'}
                    onClick={() => handleRegisterForEvent(event.id)}
                    disabled={event.maxParticipants ? event.currentParticipants >= event.maxParticipants : false}
                  >
                    {event.isRegistered ? 'Unregister' : 'Register'}
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    size="small"
                    onClick={() => showNotification('info', 'Adding to calendar')}
                  >
                    <CalendarIcon /> Add to Calendar
                  </AppButton>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="resources-content">
          <Card className="resources-placeholder">
            <h3>Community Resources</h3>
            <p>This section will contain shared resources, guides, and helpful materials from the helper community.</p>
            <AppButton variant="primary">
              <BookIcon /> Browse Resources
            </AppButton>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HelperCommunityView;
