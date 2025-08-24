import React, { useState, useEffect, useMemo } from 'react';
import { PostCard } from '../components/PostCard';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ViewHeader } from '../components/ViewHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Dilemma } from '../types';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { EditIcon, TrashIcon, ShareIcon, ArchiveIcon } from '../components/icons.dynamic';

interface MyPost extends Dilemma {
  status: 'published' | 'draft' | 'archived';
  editedAt?: Date;
  views?: number;
  engagementRate?: number;
}

interface PostStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageEngagement: number;
}

const MyPostsView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<MyPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'drafts' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'engagement'>('recent');
  const [stats, setStats] = useState<PostStats | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadMyPosts();
    loadPostStats();
  }, [user]);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, selectedTab, sortBy]);

  const loadMyPosts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockPosts: MyPost[] = [
        {
          id: '1',
          title: 'My Journey with Anxiety',
          description: 'How I learned to manage my anxiety through mindfulness',
          author: user.username || 'Me',
          authorId: user.id,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          category: 'personal-story',
          likes: 45,
          comments: 12,
          isAnonymous: false,
          content: 'It started when I was in college...',
          status: 'published',
          editedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          views: 234,
          engagementRate: 0.15
        },
        {
          id: '2',
          title: 'Tips for Better Sleep',
          description: 'What worked for me when insomnia was ruining my life',
          author: user.username || 'Me',
          authorId: user.id,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          category: 'wellness',
          likes: 32,
          comments: 8,
          isAnonymous: false,
          content: 'After months of sleepless nights...',
          status: 'published',
          views: 156,
          engagementRate: 0.12
        },
        {
          id: '3',
          title: 'Draft: Dealing with Work Stress',
          description: 'Strategies for managing workplace anxiety',
          author: user.username || 'Me',
          authorId: user.id,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          category: 'coping',
          likes: 0,
          comments: 0,
          isAnonymous: false,
          content: 'Work has been overwhelming lately...',
          status: 'draft',
          views: 0,
          engagementRate: 0
        }
      ];

      setPosts(mockPosts);
      
    } catch (error) {
      console.error('Error loading posts:', error);
      showNotification('error', 'Failed to load your posts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPostStats = async () => {
    if (!user) return;
    
    try {
      // Mock stats
      const mockStats: PostStats = {
        totalPosts: 12,
        publishedPosts: 8,
        draftPosts: 3,
        totalViews: 1234,
        totalLikes: 89,
        totalComments: 34,
        averageEngagement: 0.13
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    // Apply tab filter
    switch (selectedTab) {
      case 'published':
        filtered = filtered.filter(post => post.status === 'published');
        break;
      case 'drafts':
        filtered = filtered.filter(post => post.status === 'draft');
        break;
      case 'archived':
        filtered = filtered.filter(post => post.status === 'archived');
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'engagement':
        filtered.sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
        break;
    }

    setFilteredPosts(filtered);
  };

  const handleEditPost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      showNotification('info', 'Opening editor for: ' + post.title);
      // Navigate to edit view or open edit modal
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPosts(prev => prev.filter(post => post.id !== postId));
      showNotification('success', 'Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('error', 'Failed to delete post');
    }
  };

  const handleArchivePost = async (postId: string) => {
    try {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            status: post.status === 'archived' ? 'published' : 'archived'
          };
        }
        return post;
      }));
      
      const post = posts.find(p => p.id === postId);
      if (post) {
        showNotification(
          'success',
          post.status === 'archived' ? 'Post unarchived' : 'Post archived'
        );
      }
    } catch (error) {
      console.error('Error archiving post:', error);
      showNotification('error', 'Failed to archive post');
    }
  };

  const handleBulkAction = async (action: 'delete' | 'archive' | 'publish') => {
    if (selectedPosts.size === 0) {
      showNotification('warning', 'No posts selected');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedPosts.size} posts?`;
    if (!confirm(confirmMessage)) return;

    try {
      // Simulate bulk operation
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (action) {
        case 'delete':
          setPosts(prev => prev.filter(post => !selectedPosts.has(post.id)));
          break;
        case 'archive':
          setPosts(prev => prev.map(post => {
            if (selectedPosts.has(post.id)) {
              return { ...post, status: 'archived' };
            }
            return post;
          }));
          break;
        case 'publish':
          setPosts(prev => prev.map(post => {
            if (selectedPosts.has(post.id) && post.status === 'draft') {
              return { ...post, status: 'published' };
            }
            return post;
          }));
          break;
      }

      setSelectedPosts(new Set());
      setIsEditMode(false);
      showNotification('success', `Successfully ${action}d ${selectedPosts.size} posts`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      showNotification('error', `Failed to ${action} posts`);
    }
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const selectAllPosts = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading your posts...</p>
      </div>
    );
  }

  return (
    <div className="my-posts-view">
      <ViewHeader
        title="My Posts"
        subtitle="Manage your stories and contributions"
      />

      {stats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-value">{stats.totalPosts}</div>
            <div className="stat-label">Total Posts</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.totalViews}</div>
            <div className="stat-label">Total Views</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.totalLikes}</div>
            <div className="stat-label">Total Likes</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{(stats.averageEngagement * 100).toFixed(1)}%</div>
            <div className="stat-label">Avg Engagement</div>
          </Card>
        </div>
      )}

      <div className="posts-controls">
        <div className="tabs">
          <button
            className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTab('all')}
          >
            All Posts
          </button>
          <button
            className={`tab ${selectedTab === 'published' ? 'active' : ''}`}
            onClick={() => setSelectedTab('published')}
          >
            Published
          </button>
          <button
            className={`tab ${selectedTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setSelectedTab('drafts')}
          >
            Drafts
          </button>
          <button
            className={`tab ${selectedTab === 'archived' ? 'active' : ''}`}
            onClick={() => setSelectedTab('archived')}
          >
            Archived
          </button>
        </div>

        <div className="controls-right">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="engagement">Highest Engagement</option>
          </select>

          <AppButton
            variant={isEditMode ? 'danger' : 'secondary'}
            size="small"
            onClick={() => {
              setIsEditMode(!isEditMode);
              setSelectedPosts(new Set());
            }}
          >
            {isEditMode ? 'Cancel' : 'Edit Mode'}
          </AppButton>

          <AppButton
            variant="primary"
            size="small"
            onClick={() => showNotification('info', 'Opening new post editor')}
          >
            <ShareIcon /> New Post
          </AppButton>
        </div>
      </div>

      {isEditMode && selectedPosts.size > 0 && (
        <Card className="bulk-actions">
          <span>{selectedPosts.size} selected</span>
          <div className="actions">
            <AppButton
              variant="secondary"
              size="small"
              onClick={selectAllPosts}
            >
              {selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}
            </AppButton>
            <AppButton
              variant="primary"
              size="small"
              onClick={() => handleBulkAction('publish')}
            >
              Publish
            </AppButton>
            <AppButton
              variant="secondary"
              size="small"
              onClick={() => handleBulkAction('archive')}
            >
              Archive
            </AppButton>
            <AppButton
              variant="danger"
              size="small"
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </AppButton>
          </div>
        </Card>
      )}

      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <EmptyState
            title={selectedTab === 'drafts' ? 'No drafts' : 'No posts yet'}
            description={
              selectedTab === 'drafts'
                ? 'Start writing a new post to see it here'
                : 'Share your story to help others in the community'
            }
          />
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className="post-item">
              {isEditMode && (
                <input
                  type="checkbox"
                  checked={selectedPosts.has(post.id)}
                  onChange={() => togglePostSelection(post.id)}
                  className="post-checkbox"
                />
              )}
              
              <div className="post-content">
                <div className="post-header">
                  <h3>{post.title}</h3>
                  <span className={`status-badge ${post.status}`}>
                    {post.status}
                  </span>
                </div>
                
                <p className="post-description">{post.description}</p>
                
                <div className="post-meta">
                  <span>{formatTimeAgo(post.timestamp)}</span>
                  {post.editedAt && (
                    <span>• Edited {formatTimeAgo(post.editedAt)}</span>
                  )}
                  <span>• {post.views || 0} views</span>
                  <span>• {post.likes} likes</span>
                  <span>• {post.comments} comments</span>
                </div>
                
                {!isEditMode && (
                  <div className="post-actions">
                    <AppButton
                      variant="secondary"
                      size="small"
                      onClick={() => handleEditPost(post.id)}
                    >
                      <EditIcon /> Edit
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="small"
                      onClick={() => handleArchivePost(post.id)}
                    >
                      <ArchiveIcon /> {post.status === 'archived' ? 'Unarchive' : 'Archive'}
                    </AppButton>
                    <AppButton
                      variant="danger"
                      size="small"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <TrashIcon /> Delete
                    </AppButton>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPostsView;
