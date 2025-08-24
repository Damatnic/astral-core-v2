import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ViewHeader } from '../components/ViewHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { 
  HeartIcon, 
  MessageIcon, 
  StarIcon, 
  UserIcon, 
  ClockIcon,
  SearchIcon,
  FilterIcon,
  SortIcon
} from '../components/icons.dynamic';

interface FavoriteHelper {
  id: string;
  name: string;
  bio: string;
  specializations: string[];
  rating: number;
  totalReviews: number;
  totalSessions: number;
  isOnline: boolean;
  lastActive: Date;
  responseTime: string;
  languages: string[];
  profileImage?: string;
  addedToFavoritesAt: Date;
  lastSessionAt?: Date;
  totalSessionsWithUser: number;
  isVerified: boolean;
  badges: string[];
}

interface FavoriteHelperStats {
  totalFavorites: number;
  totalSessionsWithFavorites: number;
  averageRating: number;
  mostHelpfulSpecialization: string;
}

const FavoriteHelpersView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [favoriteHelpers, setFavoriteHelpers] = useState<FavoriteHelper[]>([]);
  const [filteredHelpers, setFilteredHelpers] = useState<FavoriteHelper[]>([]);
  const [stats, setStats] = useState<FavoriteHelperStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'sessions' | 'alphabetical'>('recent');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    loadFavoriteHelpers();
    loadStats();
  }, [user]);

  useEffect(() => {
    filterAndSortHelpers();
  }, [favoriteHelpers, searchQuery, selectedSpecialization, sortBy, showOnlineOnly]);

  const loadFavoriteHelpers = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Mock favorite helpers data
      const mockFavorites: FavoriteHelper[] = [
        {
          id: '1',
          name: 'Sarah Thompson',
          bio: 'Licensed counselor with 5 years of experience helping people overcome anxiety and depression.',
          specializations: ['Anxiety', 'Depression', 'Stress Management'],
          rating: 4.9,
          totalReviews: 127,
          totalSessions: 234,
          isOnline: true,
          lastActive: new Date(Date.now() - 15 * 60 * 1000),
          responseTime: 'Within 1 hour',
          languages: ['English', 'Spanish'],
          addedToFavoritesAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastSessionAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          totalSessionsWithUser: 8,
          isVerified: true,
          badges: ['Top Rated', 'Quick Responder']
        },
        {
          id: '2',
          name: 'Michael Chen',
          bio: 'Peer support specialist focusing on addiction recovery and trauma healing.',
          specializations: ['Addiction Recovery', 'PTSD', 'Trauma'],
          rating: 4.8,
          totalReviews: 89,
          totalSessions: 156,
          isOnline: false,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          responseTime: 'Within 2 hours',
          languages: ['English', 'Mandarin'],
          addedToFavoritesAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          lastSessionAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          totalSessionsWithUser: 12,
          isVerified: true,
          badges: ['Experienced Helper', 'Trauma Specialist']
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
          lastActive: new Date(Date.now() - 5 * 60 * 1000),
          responseTime: 'Within 30 minutes',
          languages: ['English', 'Spanish', 'Portuguese'],
          addedToFavoritesAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          lastSessionAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalSessionsWithUser: 5,
          isVerified: false,
          badges: ['Rising Star', 'Youth Specialist']
        },
        {
          id: '4',
          name: 'David Park',
          bio: 'Mindfulness coach and meditation instructor with expertise in stress reduction.',
          specializations: ['Mindfulness', 'Stress Management', 'Meditation'],
          rating: 4.6,
          totalReviews: 45,
          totalSessions: 67,
          isOnline: false,
          lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
          responseTime: 'Within 4 hours',
          languages: ['English', 'Korean'],
          addedToFavoritesAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lastSessionAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          totalSessionsWithUser: 3,
          isVerified: true,
          badges: ['Mindfulness Expert']
        }
      ];

      setFavoriteHelpers(mockFavorites);
      
    } catch (error) {
      console.error('Error loading favorite helpers:', error);
      showNotification('error', 'Failed to load favorite helpers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Mock stats
      const mockStats: FavoriteHelperStats = {
        totalFavorites: 4,
        totalSessionsWithFavorites: 28,
        averageRating: 4.75,
        mostHelpfulSpecialization: 'Anxiety'
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterAndSortHelpers = () => {
    let filtered = [...favoriteHelpers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(helper => 
        helper.name.toLowerCase().includes(query) ||
        helper.bio.toLowerCase().includes(query) ||
        helper.specializations.some(spec => spec.toLowerCase().includes(query))
      );
    }

    // Apply specialization filter
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(helper => 
        helper.specializations.includes(selectedSpecialization)
      );
    }

    // Apply online filter
    if (showOnlineOnly) {
      filtered = filtered.filter(helper => helper.isOnline);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.addedToFavoritesAt).getTime() - new Date(a.addedToFavoritesAt).getTime()
        );
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'sessions':
        filtered.sort((a, b) => b.totalSessionsWithUser - a.totalSessionsWithUser);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredHelpers(filtered);
  };

  const handleRemoveFromFavorites = async (helperId: string) => {
    const helper = favoriteHelpers.find(h => h.id === helperId);
    if (!helper) return;

    if (!confirm(`Remove ${helper.name} from your favorites?`)) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFavoriteHelpers(prev => prev.filter(h => h.id !== helperId));
      showNotification('success', `${helper.name} removed from favorites`);
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          totalFavorites: prev.totalFavorites - 1,
          totalSessionsWithFavorites: prev.totalSessionsWithFavorites - helper.totalSessionsWithUser
        } : null);
      }
      
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showNotification('error', 'Failed to remove from favorites');
    }
  };

  const handleStartChat = async (helperId: string) => {
    const helper = favoriteHelpers.find(h => h.id === helperId);
    if (helper) {
      showNotification('info', `Starting chat with ${helper.name}...`);
      // Navigate to chat or open chat modal
    }
  };

  const handleViewProfile = async (helperId: string) => {
    const helper = favoriteHelpers.find(h => h.id === helperId);
    if (helper) {
      showNotification('info', `Viewing ${helper.name}'s profile`);
      // Navigate to helper profile
    }
  };

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
    const allSpecs = favoriteHelpers.flatMap(h => h.specializations);
    return [...new Set(allSpecs)];
  };

  const getTimeSinceLastSession = (lastSession?: Date) => {
    if (!lastSession) return 'No sessions yet';
    return `Last session ${formatTimeAgo(lastSession)}`;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading your favorite helpers...</p>
      </div>
    );
  }

  return (
    <div className="favorite-helpers-view">
      <ViewHeader
        title="Favorite Helpers"
        subtitle="Your trusted support network"
      />

      {/* Stats Overview */}
      {stats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-value">{stats.totalFavorites}</div>
            <div className="stat-label">Favorite Helpers</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.totalSessionsWithFavorites}</div>
            <div className="stat-label">Total Sessions</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
            <div className="stat-label">Average Rating</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.mostHelpfulSpecialization}</div>
            <div className="stat-label">Top Specialization</div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="filters-card">
        <div className="search-and-filters">
          <div className="search-bar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search favorite helpers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <option value="all">All Specializations</option>
              {getSpecializations().map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="recent">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="sessions">Most Sessions</option>
              <option value="alphabetical">Alphabetical</option>
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
        </div>
      </Card>

      {/* Favorite Helpers List */}
      <div className="helpers-list">
        {filteredHelpers.length === 0 ? (
          <Card className="empty-state">
            {favoriteHelpers.length === 0 ? (
              <>
                <h3>No Favorite Helpers Yet</h3>
                <p>Start exploring helpers and add your favorites to see them here!</p>
                <AppButton variant="primary">
                  Browse Helpers
                </AppButton>
              </>
            ) : (
              <>
                <h3>No Results Found</h3>
                <p>Try adjusting your search or filters</p>
              </>
            )}
          </Card>
        ) : (
          filteredHelpers.map(helper => (
            <Card key={helper.id} className="helper-card">
              <div className="helper-header">
                <div className="helper-avatar">
                  {helper.profileImage ? (
                    <img src={helper.profileImage} alt={helper.name} />
                  ) : (
                    <UserIcon />
                  )}
                  <div className={`status-indicator ${helper.isOnline ? 'online' : 'offline'}`} />
                </div>

                <div className="helper-info">
                  <div className="helper-name-section">
                    <h3>{helper.name}</h3>
                    {helper.isVerified && <span className="verified-badge">✓ Verified</span>}
                    <div className="helper-badges">
                      {helper.badges.map(badge => (
                        <span key={badge} className="badge">{badge}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="helper-status">
                    <span className={`status ${helper.isOnline ? 'online' : 'offline'}`}>
                      {helper.isOnline ? 'Online' : `Last seen ${formatTimeAgo(helper.lastActive)}`}
                    </span>
                  </div>
                </div>

                <div className="helper-actions">
                  <AppButton
                    variant="primary"
                    size="small"
                    onClick={() => handleStartChat(helper.id)}
                    disabled={!helper.isOnline}
                  >
                    <MessageIcon /> Chat
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    size="small"
                    onClick={() => handleViewProfile(helper.id)}
                  >
                    View Profile
                  </AppButton>
                  <AppButton
                    variant="danger"
                    size="small"
                    onClick={() => handleRemoveFromFavorites(helper.id)}
                  >
                    <HeartIcon /> Remove
                  </AppButton>
                </div>
              </div>

              <div className="helper-content">
                <p className="helper-bio">{helper.bio}</p>

                <div className="helper-specializations">
                  {helper.specializations.map(spec => (
                    <span key={spec} className="specialization-tag">{spec}</span>
                  ))}
                </div>

                <div className="helper-stats">
                  <div className="stat-group">
                    <div className="rating-section">
                      <div className="stars">
                        {renderStars(Math.round(helper.rating))}
                      </div>
                      <span>{helper.rating.toFixed(1)} ({helper.totalReviews} reviews)</span>
                    </div>
                  </div>

                  <div className="stat-group">
                    <div className="stat-item">
                      <span className="stat-value">{helper.totalSessionsWithUser}</span>
                      <span className="stat-label">Sessions with you</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{helper.totalSessions}</span>
                      <span className="stat-label">Total sessions</span>
                    </div>
                  </div>
                </div>

                <div className="helper-meta">
                  <div className="meta-item">
                    <ClockIcon />
                    <span>Responds {helper.responseTime.toLowerCase()}</span>
                  </div>
                  <div className="meta-item">
                    <span>Languages: {helper.languages.join(', ')}</span>
                  </div>
                  <div className="meta-item">
                    <span>{getTimeSinceLastSession(helper.lastSessionAt)}</span>
                  </div>
                  <div className="meta-item">
                    <span>Added {formatTimeAgo(helper.addedToFavoritesAt)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {filteredHelpers.length > 0 && (
        <div className="results-summary">
          <p>
            Showing {filteredHelpers.length} of {favoriteHelpers.length} favorite helpers
            {selectedSpecialization !== 'all' && ` specializing in ${selectedSpecialization}`}
            {showOnlineOnly && ` who are currently online`}
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoriteHelpersView;
