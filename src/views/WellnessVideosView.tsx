import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WellnessVideo, View } from '../types';
import { HeartIcon, ShareIcon, BookmarkIcon, SparkleIcon, PlayIcon, VolumeIcon, MicOffIcon, CommentIcon, BackIcon  } from '../components/icons.dynamic';
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
        likes: 0
    },
    {
        id: 'local-2',
        title: 'The Best Quote Ever',
        description: 'A powerful quote to inspire and motivate',
        videoUrl: '/Videos/The%20Best%20Quote%20Ever.mp4',
        thumbnailUrl: '',
        duration: '0:45',
        category: 'Inspiration',
        tags: ['quotes', 'wisdom', 'motivation'],
        uploadedBy: 'Local Content',
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0
    },
    {
        id: 'local-3',
        title: 'Wellness Video 1',
        description: 'Calming content for mental wellness',
        videoUrl: '/Videos/videoplayback%20(2).mp4',
        thumbnailUrl: '',
        duration: '1:00',
        category: 'Wellness',
        tags: ['calm', 'relaxation', 'peace'],
        uploadedBy: 'Local Content',
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0
    },
    {
        id: 'local-4',
        title: 'Wellness Video 2',
        description: 'Mindfulness and meditation guidance',
        videoUrl: '/Videos/videoplayback%20(3).mp4',
        thumbnailUrl: '',
        duration: '1:00',
        category: 'Meditation',
        tags: ['mindfulness', 'meditation', 'breathing'],
        uploadedBy: 'Local Content',
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0
    },
    {
        id: 'local-5',
        title: 'Wellness Video 3',
        description: 'Stress relief and relaxation techniques',
        videoUrl: '/Videos/videoplayback%20(4).mp4',
        thumbnailUrl: '',
        duration: '1:00',
        category: 'Stress Relief',
        tags: ['stress', 'relaxation', 'techniques'],
        uploadedBy: 'Local Content',
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0
    }
];

export const WellnessVideosView: React.FC<{
    setActiveView?: (view: View) => void;
}> = ({ setActiveView }) => {
    const [videos, setVideos] = useState<WellnessVideo[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
    const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
    const [_showControls, _setShowControls] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef<number>(0);
    const { addToast } = useNotification();

    const fetchVideos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Only use local videos - no demo/sample videos from API
            setVideos(localVideos);
        } catch (error) {
            console.error("Failed to load wellness videos:", error);
            setVideos(localVideos);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Handle scroll for video switching (TikTok style)
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollPosition = container.scrollTop;
        const videoHeight = container.clientHeight;
        const newIndex = Math.round(scrollPosition / videoHeight);
        
        if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < videos.length) {
            setCurrentVideoIndex(newIndex);
            // Pause all videos immediately
            videoRefs.current.forEach((video) => {
                if (video) {
                    video.pause();
                    video.currentTime = 0; // Reset to beginning
                }
            });
            // Play current video after a brief delay
            setTimeout(() => {
                const newVideo = videoRefs.current[newIndex];
                if (newVideo && isPlaying) {
                    newVideo.play().catch((err) => console.error('Video play failed:', err));
                }
            }, 100);
        }
    }, [currentVideoIndex, videos.length, isPlaying]);

    // Touch handlers for mobile swipe navigation
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentVideoIndex < videos.length - 1) {
                // Swipe up - next video
                goToVideo(currentVideoIndex + 1);
            } else if (diff < 0 && currentVideoIndex > 0) {
                // Swipe down - previous video
                goToVideo(currentVideoIndex - 1);
            }
        }
    };

    const goToVideo = (index: number) => {
        if (index >= 0 && index < videos.length && containerRef.current) {
            setCurrentVideoIndex(index);
            containerRef.current.scrollTo({
                top: index * containerRef.current.clientHeight,
                behavior: 'smooth'
            });
        }
    };

    // Toggle play/pause
    const togglePlayPause = () => {
        const currentVideo = videoRefs.current[currentVideoIndex];
        if (currentVideo) {
            if (isPlaying) {
                currentVideo.pause();
                setIsPlaying(false);
            } else {
                currentVideo.play().catch((err) => console.error('Video play failed:', err));
                setIsPlaying(true);
            }
        }
    };

    // Toggle mute/unmute
    const toggleMute = () => {
        const currentVideo = videoRefs.current[currentVideoIndex];
        if (currentVideo) {
            currentVideo.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Auto-play current video when it changes
    useEffect(() => {
        const currentVideo = videoRefs.current[currentVideoIndex];
        if (currentVideo && isPlaying) {
            currentVideo.play().catch((err) => console.error('Video play failed:', err));
        }
    }, [currentVideoIndex, isPlaying]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    exitVideoPlayer();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentVideoIndex > 0) {
                        goToVideo(currentVideoIndex - 1);
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentVideoIndex < videos.length - 1) {
                        goToVideo(currentVideoIndex + 1);
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    toggleMute();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentVideoIndex, videos.length]);

    // Like video
    const toggleLike = (videoId: string) => {
        const newLikedVideos = new Set(likedVideos);
        if (newLikedVideos.has(videoId)) {
            newLikedVideos.delete(videoId);
            addToast('Removed from liked videos', 'info');
        } else {
            newLikedVideos.add(videoId);
            addToast('Added to liked videos! 💜', 'success');
        }
        setLikedVideos(newLikedVideos);
    };

    // Save video
    const toggleSave = (videoId: string) => {
        const newSavedVideos = new Set(savedVideos);
        if (newSavedVideos.has(videoId)) {
            newSavedVideos.delete(videoId);
            addToast('Removed from saved videos', 'info');
        } else {
            newSavedVideos.add(videoId);
            addToast('Video saved! 🌟', 'success');
        }
        setSavedVideos(newSavedVideos);
    };

    // Share video
    const shareVideo = (video: WellnessVideo) => {
        if (navigator.share) {
            navigator.share({
                title: video.description.split(':')[0],
                text: video.description,
                url: window.location.href
            }).catch(() => {
                addToast('Share cancelled', 'info');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            addToast('Link copied to clipboard!', 'success');
        }
    };

    const exitVideoPlayer = () => {
        // Pause all videos
        videoRefs.current.forEach((video) => {
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
        setActiveView?.('wellness-tracking');
    };

    return (
        <div className="tiktok-video-container">
            <div 
                ref={containerRef}
                className="tiktok-video-scroll"
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {videos.map((video, index) => (
                    <div key={video.id} className="tiktok-video-item">
                        <video
                            ref={el => videoRefs.current[index] = el}
                            src={video.videoUrl}
                            className="tiktok-video-player"
                            loop
                            muted={isMuted}
                            playsInline
                            autoPlay={index === 0}
                            onClick={togglePlayPause}
                            onLoadedData={() => {
                                if (index === currentVideoIndex && isPlaying) {
                                    videoRefs.current[index]?.play().catch((err) => console.error('Video play failed:', err));
                                }
                            }}
                            onError={(e) => {
                                console.error(`Video failed to load: ${video.videoUrl}`, e);
                                addToast('Video temporarily unavailable', 'warning');
                            }}
                            onLoadStart={() => {
                                // Optional: Add loading state per video
                            }}
                        />
                        
                        {/* Video Overlay - TikTok Style */}
                        <div className="tiktok-video-overlay">
                            {/* Back Button */}
                            <button 
                                className="video-back-button"
                                onClick={exitVideoPlayer}
                                aria-label="Go back to wellness videos"
                            >
                                <BackIcon />
                            </button>
                            {/* Center play/pause indicator */}
                            {!isPlaying && index === currentVideoIndex && (
                                <div className="tiktok-play-indicator">
                                    <PlayIcon />
                                </div>
                            )}
                            
                            {/* Top controls */}
                            <div className="tiktok-top-controls">
                                <button 
                                    className="tiktok-control-btn"
                                    onClick={toggleMute}
                                >
                                    {isMuted ? <MicOffIcon /> : <VolumeIcon />}
                                </button>
                            </div>
                            
                            {/* Bottom info section */}
                            <div className="tiktok-bottom-info">
                                <div className="tiktok-video-info">
                                    <div className="tiktok-creator">
                                        <SparkleIcon />
                                        <span>@{video.userToken}</span>
                                    </div>
                                    <h3 className="tiktok-video-title">{video.description.split(':')[0]}</h3>
                                    <p className="tiktok-video-description">
                                        {video.description.split(':')[1] || video.description}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Right side action buttons - TikTok style */}
                            <div className="tiktok-actions-sidebar">
                                <button 
                                    className={`tiktok-action-btn ${likedVideos.has(video.id) ? 'liked' : ''}`}
                                    onClick={() => toggleLike(video.id)}
                                >
                                    <div className="tiktok-action-icon">
                                        <HeartIcon />
                                    </div>
                                    <span className="tiktok-action-count">
                                        {video.likes + (likedVideos.has(video.id) ? 1 : 0)}
                                    </span>
                                </button>
                                
                                <button 
                                    className="tiktok-action-btn"
                                    onClick={() => addToast('Comments coming soon!', 'info')}
                                >
                                    <div className="tiktok-action-icon">
                                        <CommentIcon />
                                    </div>
                                    <span className="tiktok-action-count">{video.comments}</span>
                                </button>
                                
                                <button 
                                    className="tiktok-action-btn"
                                    onClick={() => shareVideo(video)}
                                >
                                    <div className="tiktok-action-icon">
                                        <ShareIcon />
                                    </div>
                                    <span className="tiktok-action-count">{video.shares}</span>
                                </button>
                                
                                <button 
                                    className={`tiktok-action-btn ${savedVideos.has(video.id) ? 'saved' : ''}`}
                                    onClick={() => toggleSave(video.id)}
                                >
                                    <div className="tiktok-action-icon">
                                        <BookmarkIcon />
                                    </div>
                                    <span className="tiktok-action-count">Save</span>
                                </button>
                            </div>
                            
                            {/* Video progress indicators */}
                            <div className="tiktok-progress-indicators">
                                {videos.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`tiktok-progress-dot ${idx === currentVideoIndex ? 'active' : ''}`}
                                        onClick={() => goToVideo(idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Loading State */}
            {isLoading && (
                <div className="tiktok-loading-overlay">
                    <LoadingSpinner size="large" message="Loading wellness videos" />
                </div>
            )}
            
            {/* Error State */}
            {error && (
                <div className="tiktok-error-overlay">
                    <ErrorState 
                        message={error}
                        onRetry={fetchVideos}
                    />
                </div>
            )}
        </div>
    );
};

export default WellnessVideosView;