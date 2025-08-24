import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WellnessVideo, ViewProps } from '../types';
import { HeartIcon, ShareIcon, BookmarkIcon, SparkleIcon, PlayIcon, VolumeIcon, MicOffIcon, CommentIcon, BackIcon } from '../components/icons.dynamic';
import { useNotification } from '../contexts/NotificationContext';
import ErrorState from '../components/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';

// Local videos from the Videos folder
const localVideos: WellnessVideo[] = [
  {
    id: 'local-1',
    title: 'Be Yourself',
    description: 'Inspirational message from Ted Lasso about being authentic',
    videoUrl: '/Videos/Be%20Yourself%20%20Ted%20Lasso.mp4',
    thumbnailUrl: '',
    duration: '0:30',
    category: 'Inspiration',
    tags: ['motivation', 'authenticity', 'self-love'],
    uploadedBy: 'Local Content',
    uploadedAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 'local-2',
    title: 'Mindfulness Meditation',
    description: 'A gentle introduction to mindfulness practice',
    videoUrl: '/Videos/mindfulness-intro.mp4',
    thumbnailUrl: '',
    duration: '10:00',
    category: 'Meditation',
    tags: ['mindfulness', 'meditation', 'relaxation'],
    uploadedBy: 'Wellness Team',
    uploadedAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 'local-3',
    title: 'Breathing Exercises',
    description: 'Simple breathing techniques for anxiety relief',
    videoUrl: '/Videos/breathing-exercises.mp4',
    thumbnailUrl: '',
    duration: '5:00',
    category: 'Anxiety Relief',
    tags: ['breathing', 'anxiety', 'coping'],
    uploadedBy: 'Therapy Team',
    uploadedAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    isLiked: false,
    isBookmarked: false
  }
];

interface WellnessVideosViewProps extends ViewProps {
  onVideoSelect?: (video: WellnessVideo) => void;
}

const WellnessVideosView: React.FC<WellnessVideosViewProps> = ({ onVideoSelect }) => {
  const [videos, setVideos] = useState<WellnessVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<WellnessVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showNotification } = useNotification();

  const categories = ['all', 'Inspiration', 'Meditation', 'Anxiety Relief', 'Sleep', 'Motivation'];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      // Start with local videos
      let allVideos = [...localVideos];
      
      // Try to fetch from API if available
      try {
        const response = await fetch('/api/wellness-videos');
        if (response.ok) {
          const apiVideos = await response.json();
          allVideos = [...allVideos, ...apiVideos];
        }
      } catch (apiError) {
        console.log('API videos not available, using local videos only');
      }
      
      setVideos(allVideos);
      setError(null);
    } catch (err) {
      setError('Failed to load wellness videos');
      console.error('Error loading videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVideoSelect = (video: WellnessVideo) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const handleLike = async (videoId: string) => {
    try {
      const updatedVideos = videos.map(video => {
        if (video.id === videoId) {
          return {
            ...video,
            isLiked: !video.isLiked,
            likes: video.isLiked ? video.likes - 1 : video.likes + 1
          };
        }
        return video;
      });
      setVideos(updatedVideos);
      
      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo(updatedVideos.find(v => v.id === videoId) || null);
      }
      
      showNotification('success', 'Video preference updated');
    } catch (err) {
      showNotification('error', 'Failed to update video preference');
    }
  };

  const handleBookmark = async (videoId: string) => {
    try {
      const updatedVideos = videos.map(video => {
        if (video.id === videoId) {
          return {
            ...video,
            isBookmarked: !video.isBookmarked
          };
        }
        return video;
      });
      setVideos(updatedVideos);
      
      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo(updatedVideos.find(v => v.id === videoId) || null);
      }
      
      showNotification('success', 'Bookmark updated');
    } catch (err) {
      showNotification('error', 'Failed to update bookmark');
    }
  };

  const handleShare = async (video: WellnessVideo) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('success', 'Link copied to clipboard');
      }
    } catch (err) {
      showNotification('error', 'Failed to share video');
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  if (isLoading) {
    return (
      <div className="wellness-videos-view">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="wellness-videos-view">
        <ErrorState 
          title="Unable to Load Videos"
          message={error}
          onRetry={loadVideos}
        />
      </div>
    );
  }

  return (
    <div className="wellness-videos-view">
      {selectedVideo ? (
        <div className="video-player-container">
          <div className="video-header">
            <button 
              className="back-button"
              onClick={() => setSelectedVideo(null)}
              aria-label="Back to video list"
            >
              <BackIcon />
            </button>
            <h2>{selectedVideo.title}</h2>
          </div>

          <div className="video-player">
            <video
              ref={videoRef}
              src={selectedVideo.videoUrl}
              poster={selectedVideo.thumbnailUrl}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.muted = isMuted;
                }
              }}
            />
            
            <div className="video-controls">
              <button onClick={togglePlay} className="play-button">
                <PlayIcon />
              </button>
              <button onClick={toggleMute} className="mute-button">
                {isMuted ? <MicOffIcon /> : <VolumeIcon />}
              </button>
            </div>
          </div>

          <div className="video-info">
            <div className="video-meta">
              <h3>{selectedVideo.title}</h3>
              <p className="video-description">{selectedVideo.description}</p>
              <div className="video-stats">
                <span className="duration">{formatDuration(selectedVideo.duration)}</span>
                <span className="views">{selectedVideo.views} views</span>
                <span className="category">{selectedVideo.category}</span>
              </div>
            </div>

            <div className="video-actions">
              <button 
                className={`action-button ${selectedVideo.isLiked ? 'active' : ''}`}
                onClick={() => handleLike(selectedVideo.id)}
              >
                <HeartIcon />
                <span>{selectedVideo.likes}</span>
              </button>
              
              <button 
                className={`action-button ${selectedVideo.isBookmarked ? 'active' : ''}`}
                onClick={() => handleBookmark(selectedVideo.id)}
              >
                <BookmarkIcon />
              </button>
              
              <button 
                className="action-button"
                onClick={() => handleShare(selectedVideo)}
              >
                <ShareIcon />
              </button>
              
              <button 
                className={`action-button ${showComments ? 'active' : ''}`}
                onClick={() => setShowComments(!showComments)}
              >
                <CommentIcon />
              </button>
            </div>

            <div className="video-tags">
              {selectedVideo.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </div>

          {showComments && (
            <div className="comments-section">
              <h4>Comments</h4>
              <div className="comments-placeholder">
                <p>Comments feature coming soon!</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="video-library">
          <div className="library-header">
            <h1>
              <SparkleIcon />
              Wellness Videos
            </h1>
            <p>Discover videos to support your mental health journey</p>
          </div>

          <div className="search-and-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Videos' : category}
                </button>
              ))}
            </div>
          </div>

          <div className="videos-grid">
            {filteredVideos.length === 0 ? (
              <div className="no-videos">
                <p>No videos found matching your criteria.</p>
                <button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredVideos.map(video => (
                <div 
                  key={video.id} 
                  className="video-card"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="video-thumbnail">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <PlayIcon />
                      </div>
                    )}
                    <div className="duration-badge">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <div className="video-card-info">
                    <h3>{video.title}</h3>
                    <p className="video-description">{video.description}</p>
                    <div className="video-meta">
                      <span className="category">{video.category}</span>
                      <span className="views">{video.views} views</span>
                    </div>
                    <div className="video-actions-mini">
                      <button 
                        className={`mini-action ${video.isLiked ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(video.id);
                        }}
                      >
                        <HeartIcon />
                        <span>{video.likes}</span>
                      </button>
                      <button 
                        className={`mini-action ${video.isBookmarked ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(video.id);
                        }}
                      >
                        <BookmarkIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessVideosView;