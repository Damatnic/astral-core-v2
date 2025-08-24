import React, { useState, useEffect, useRef } from 'react';
import { LazyMarkdown } from '../components/LazyMarkdown';
import { AIChatMessage } from '../types';
import { MAX_CONTENT_LENGTH, CATEGORIES } from '../constants';
import { AppTextArea, AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { SendIcon, AICompanionIcon } from '../components/icons.dynamic';
import { TypingIndicator } from '../components/TypingIndicator';
import { Card } from '../components/Card';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface ShareableContent {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  visibility: 'public' | 'community' | 'private';
}

interface ContentDraft {
  title: string;
  content: string;
  category: string;
  tags: string[];
  visibility: 'public' | 'community' | 'private';
}

const ShareView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'create' | 'browse' | 'my-posts'>('create');
  const [draft, setDraft] = useState<ContentDraft>({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    visibility: 'community'
  });
  const [newTag, setNewTag] = useState('');
  const [posts, setPosts] = useState<ShareableContent[]>([]);
  const [myPosts, setMyPosts] = useState<ShareableContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableCategories = [
    'general', 'wellness', 'coping-strategies', 'personal-story', 
    'resources', 'inspiration', 'support-request', 'achievement'
  ];

  useEffect(() => {
    loadPosts();
    loadMyPosts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      const mockPosts: ShareableContent[] = [
        {
          id: '1',
          title: 'My Journey with Anxiety',
          content: 'I wanted to share my experience with managing anxiety over the past year. It\'s been challenging but I\'ve learned some valuable techniques...',
          category: 'personal-story',
          author: {
            id: 'user1',
            username: 'WellnessWarrior',
            avatar: undefined
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 15,
          isLiked: false,
          isBookmarked: false,
          tags: ['anxiety', 'personal-growth', 'recovery'],
          visibility: 'community'
        },
        {
          id: '2',
          title: 'Breathing Techniques That Actually Work',
          content: 'After trying many different breathing exercises, here are the ones that have made the biggest difference for me...',
          category: 'coping-strategies',
          author: {
            id: 'user2',
            username: 'MindfulMoments',
            avatar: undefined
          },
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          likes: 23,
          isLiked: true,
          isBookmarked: true,
          tags: ['breathing', 'techniques', 'anxiety-relief'],
          visibility: 'public'
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      showNotification('error', 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyPosts = async () => {
    try {
      // Simulate API call for user's posts
      const mockMyPosts: ShareableContent[] = [
        {
          id: 'my1',
          title: 'Finding Hope in Dark Times',
          content: 'This is a post I shared about overcoming a difficult period...',
          category: 'inspiration',
          author: {
            id: user?.id || 'current-user',
            username: user?.username || 'You',
            avatar: user?.avatar
          },
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes: 8,
          isLiked: false,
          isBookmarked: false,
          tags: ['hope', 'recovery', 'inspiration'],
          visibility: 'community'
        }
      ];
      setMyPosts(mockMyPosts);
    } catch (error) {
      console.error('Error loading my posts:', error);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!draft.title.trim() || !draft.content.trim()) {
      showNotification('error', 'Please fill in both title and content');
      return;
    }

    if (draft.content.length > MAX_CONTENT_LENGTH) {
      showNotification('error', `Content must be under ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const newPost: ShareableContent = {
        id: Date.now().toString(),
        title: draft.title.trim(),
        content: draft.content.trim(),
        category: draft.category,
        author: {
          id: user?.id || 'current-user',
          username: user?.username || 'Anonymous',
          avatar: user?.avatar
        },
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        isBookmarked: false,
        tags: draft.tags,
        visibility: draft.visibility
      };

      // Add to posts and my posts
      setPosts(prev => [newPost, ...prev]);
      setMyPosts(prev => [newPost, ...prev]);
      
      // Reset draft
      setDraft({
        title: '',
        content: '',
        category: 'general',
        tags: [],
        visibility: 'community'
      });
      
      showNotification('success', 'Post shared successfully!');
      setActiveTab('browse');
      
    } catch (error) {
      console.error('Error submitting post:', error);
      showNotification('error', 'Failed to share post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !draft.tags.includes(newTag.trim())) {
      setDraft(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDraft(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleLikePost = async (postId: string) => {
    try {
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
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleBookmarkPost = async (postId: string) => {
    try {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isBookmarked: !post.isBookmarked
          };
        }
        return post;
      }));
      showNotification('success', 'Bookmark updated');
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleAiMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      content: aiInput,
      sender: 'user',
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsAiTyping(true);

    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: AIChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I understand you\'d like help with sharing your thoughts. That takes courage! Consider starting with what feels most important to you right now. Would you like suggestions for how to structure your post?',
          sender: 'ai',
          timestamp: new Date()
        };
        setAiMessages(prev => [...prev, aiResponse]);
        setIsAiTyping(false);
      }, 2000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsAiTyping(false);
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="share-view">
      <div className="share-header">
        <h1>Share Your Story</h1>
        <p>Connect with others by sharing your experiences, insights, and support</p>
      </div>

      <div className="share-tabs">
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Post
        </button>
        <button
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Posts
        </button>
        <button
          className={`tab ${activeTab === 'my-posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-posts')}
        >
          My Posts ({myPosts.length})
        </button>
      </div>

      <div className="share-content">
        {activeTab === 'create' && (
          <div className="create-post-section">
            <div className="create-post-main">
              <Card title="Share Your Story" className="create-post-card">
                <form onSubmit={handleSubmitPost} className="post-form">
                  <div className="form-group">
                    <AppInput
                      label="Title"
                      value={draft.title}
                      onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Give your post a meaningful title..."
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={draft.category}
                      onChange={(e) => setDraft(prev => ({ ...prev, category: e.target.value }))}
                      className="category-select"
                    >
                      {availableCategories.map(category => (
                        <option key={category} value={category}>
                          {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <AppTextArea
                      label="Content"
                      value={draft.content}
                      onChange={(e) => setDraft(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts, experiences, or advice..."
                      rows={8}
                      maxLength={MAX_CONTENT_LENGTH}
                      required
                    />
                    <div className="character-count">
                      {draft.content.length}/{MAX_CONTENT_LENGTH}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <div className="tags-input">
                      <AppInput
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <AppButton
                        type="button"
                        size="small"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                      >
                        Add
                      </AppButton>
                    </div>
                    <div className="tags-list">
                      {draft.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="remove-tag"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Visibility</label>
                    <div className="visibility-options">
                      <label className="radio-option">
                        <input
                          type="radio"
                          value="public"
                          checked={draft.visibility === 'public'}
                          onChange={(e) => setDraft(prev => ({ ...prev, visibility: e.target.value as any }))}
                        />
                        <span>Public - Anyone can see</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          value="community"
                          checked={draft.visibility === 'community'}
                          onChange={(e) => setDraft(prev => ({ ...prev, visibility: e.target.value as any }))}
                        />
                        <span>Community - Members only</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          value="private"
                          checked={draft.visibility === 'private'}
                          onChange={(e) => setDraft(prev => ({ ...prev, visibility: e.target.value as any }))}
                        />
                        <span>Private - Only you can see</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <AppButton
                      type="button"
                      variant="secondary"
                      onClick={() => setDraft({
                        title: '',
                        content: '',
                        category: 'general',
                        tags: [],
                        visibility: 'community'
                      })}
                    >
                      Clear
                    </AppButton>
                    <AppButton
                      type="submit"
                      loading={isSubmitting}
                      disabled={!draft.title.trim() || !draft.content.trim()}
                    >
                      <SendIcon />
                      Share Post
                    </AppButton>
                  </div>
                </form>
              </Card>
            </div>

            <div className="ai-helper">
              <Card title="AI Writing Assistant" className="ai-helper-card">
                <div className="ai-messages">
                  {aiMessages.length === 0 ? (
                    <div className="ai-welcome">
                      <AICompanionIcon />
                      <p>Hi! I'm here to help you craft your post. What would you like to share?</p>
                    </div>
                  ) : (
                    aiMessages.map(message => (
                      <div key={message.id} className={`message ${message.sender}`}>
                        <div className="message-content">
                          <LazyMarkdown content={message.content} />
                        </div>
                      </div>
                    ))
                  )}
                  {isAiTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                <div className="ai-input">
                  <AppInput
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask for help with your post..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAiMessage();
                      }
                    }}
                  />
                  <AppButton
                    onClick={handleAiMessage}
                    disabled={!aiInput.trim() || isAiTyping}
                    size="small"
                  >
                    <SendIcon />
                  </AppButton>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="browse-posts-section">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : (
              <div className="posts-list">
                {posts.map(post => (
                  <Card key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="post-author">
                        <div className="author-avatar">
                          {post.author.avatar ? (
                            <img src={post.author.avatar} alt={post.author.username} />
                          ) : (
                            <div className="avatar-placeholder">
                              {post.author.username[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="author-info">
                          <div className="author-name">{post.author.username}</div>
                          <div className="post-time">{formatTimeAgo(post.timestamp)}</div>
                        </div>
                      </div>
                      <div className={`visibility-badge ${post.visibility}`}>
                        {post.visibility}
                      </div>
                    </div>

                    <div className="post-content">
                      <h3>{post.title}</h3>
                      <div className="post-text">
                        <LazyMarkdown content={post.content} />
                      </div>
                      <div className="post-tags">
                        {post.tags.map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="post-actions">
                      <button
                        className={`action-button ${post.isLiked ? 'liked' : ''}`}
                        onClick={() => handleLikePost(post.id)}
                      >
                        ❤️ {post.likes}
                      </button>
                      <button
                        className={`action-button ${post.isBookmarked ? 'bookmarked' : ''}`}
                        onClick={() => handleBookmarkPost(post.id)}
                      >
                        🔖 {post.isBookmarked ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-posts' && (
          <div className="my-posts-section">
            {myPosts.length === 0 ? (
              <div className="empty-state">
                <h3>No posts yet</h3>
                <p>Share your first story to connect with the community!</p>
                <AppButton onClick={() => setActiveTab('create')}>
                  Create Your First Post
                </AppButton>
              </div>
            ) : (
              <div className="posts-list">
                {myPosts.map(post => (
                  <Card key={post.id} className="post-card my-post">
                    <div className="post-header">
                      <div className="post-meta">
                        <div className="post-time">{formatTimeAgo(post.timestamp)}</div>
                        <div className={`visibility-badge ${post.visibility}`}>
                          {post.visibility}
                        </div>
                      </div>
                    </div>

                    <div className="post-content">
                      <h3>{post.title}</h3>
                      <div className="post-text">
                        <LazyMarkdown content={post.content} />
                      </div>
                      <div className="post-tags">
                        {post.tags.map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="post-stats">
                      <span>❤️ {post.likes} likes</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareView;
