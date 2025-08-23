import React, { useState, useEffect, useCallback } from 'react';
import { WellnessVideo } from '../types';
import { VideoThumbnail } from './OptimizedImage';
import { videoThumbnailGenerator, GeneratedThumbnail } from '../utils/videoThumbnailGenerator';
import { HeartIcon, ShareIcon, BookmarkIcon, PlayIcon, PauseIcon } from './icons.dynamic';

interface EnhancedVideoCardProps {
  video: WellnessVideo;
  isActive: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  isSaved: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  onTogglePlay: () => void;
  onToggleLike: (videoId: string) => void;
  onToggleSave: (videoId: string) => void;
  onShare: (video: WellnessVideo) => void;
  priority?: number;
}

/**
 * Enhanced Video Card with Optimized Thumbnails
 * 
 * Features:
 * - Auto-generated thumbnails from video content
 * - Optimized image loading with responsive sizes
 * - Progressive loading with blur placeholders
 * - Mobile-optimized touch targets
 * - Accessibility improvements
 */
export const EnhancedVideoCard: React.FC<EnhancedVideoCardProps> = ({
  video,
  isActive,
  isPlaying,
  isLiked,
  isSaved,
  videoRef,
  onTogglePlay,
  onToggleLike,
  onToggleSave,
  onShare,
  priority = 5
}) => {
  const [thumbnail, setThumbnail] = useState<GeneratedThumbnail | null>(null);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

  // Generate thumbnail when video loads
  useEffect(() => {
    const generateThumbnail = async () => {
      if (!video.videoUrl || thumbnailError || thumbnail) return;

      setIsGeneratingThumbnail(true);
      
      try {
        // Check cache first
        const cachedThumbnails = videoThumbnailGenerator.loadThumbnailsFromCache();
        const cachedThumbnail = cachedThumbnails.find(t => t.original === video.videoUrl);
        
        if (cachedThumbnail) {
          setThumbnail(cachedThumbnail);
          setIsGeneratingThumbnail(false);
          return;
        }

        // Generate new thumbnail
        const generatedThumbnail = await videoThumbnailGenerator.generateThumbnails(
          video.videoUrl,
          {
            frameTime: 2, // Extract frame at 2 seconds
            quality: 85,
            generatePlaceholder: true
          }
        );

        setThumbnail(generatedThumbnail);
        
        // Save to cache
        const updatedCache = [...cachedThumbnails, generatedThumbnail];
        videoThumbnailGenerator.saveThumbnailsToCache(updatedCache);
        
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
        setThumbnailError(true);
      } finally {
        setIsGeneratingThumbnail(false);
      }
    };

    generateThumbnail();
  }, [video.videoUrl, thumbnail, thumbnailError]);

  // Handle like action
  const handleLike = useCallback(() => {
    onToggleLike(video.id);
  }, [onToggleLike, video.id]);

  // Handle save action
  const handleSave = useCallback(() => {
    onToggleSave(video.id);
  }, [onToggleSave, video.id]);

  // Handle share action
  const handleShare = useCallback(() => {
    onShare(video);
  }, [onShare, video]);

  // Handle video error
  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoEl = e.currentTarget;
    const fallbackUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
    if (videoEl.src !== fallbackUrl) {
      videoEl.src = fallbackUrl;
    }
  }, []);

  // Get thumbnail URL or fallback
  const getThumbnailSrc = (): string => {
    if (thumbnail) {
      return videoThumbnailGenerator.getThumbnailUrl(thumbnail, 'medium');
    }
    
    // Generate fallback thumbnail
    return videoThumbnailGenerator.generateFallbackThumbnail(
      480,
      270,
      'Wellness Video'
    );
  };

  // Get thumbnail alt text
  const getThumbnailAlt = (): string => {
    return `Thumbnail for ${video.description || 'wellness video'}`;
  };

  const videoTitle = video.description.split(':')[0] || 'Wellness Video';
  const videoDescription = video.description.split(':').slice(1).join(':').trim() || '';

  return (
    <div className="enhanced-video-card" data-video-id={video.id}>
      {/* Video Element (hidden when showing thumbnail) */}
      <video
        ref={videoRef}
        className={`enhanced-video-player ${isActive ? 'active' : 'hidden'}`}
        src={video.videoUrl}
        loop
        muted
        playsInline
        preload={isActive ? "auto" : "none"}
        onError={handleVideoError}
        aria-label={`Wellness video: ${video.description}`}
      />

      {/* Optimized Thumbnail (shown when video not active) */}
      {!isActive && (
        <VideoThumbnail
          src={getThumbnailSrc()}
          alt={getThumbnailAlt()}
          className="enhanced-video-thumbnail"
          videoId={video.id}
          videoDuration={undefined} // Duration not available in WellnessVideo interface
          isPlaying={false}
          showPlayButton={true}
          priority={priority}
          loading={priority >= 8 ? 'eager' : 'lazy'}
          onClick={onTogglePlay}
          overlayContent={
            isGeneratingThumbnail ? (
              <div className="thumbnail-generating">
                <div className="loading-spinner" />
                <span>Generating thumbnail...</span>
              </div>
            ) : null
          }
        />
      )}
      
      {/* Video Overlay */}
      <div className="enhanced-video-overlay">
        {/* Play/Pause Indicator */}
        {isActive && (
          <button
            className="enhanced-play-indicator"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        )}
        
        {/* Video Info */}
        <div className="enhanced-video-info">
          <div className="video-info-header">
            <h3 className="video-title">{videoTitle}</h3>
            <span className="video-creator">@{video.userToken}</span>
          </div>
          {videoDescription && (
            <p className="video-description">{videoDescription}</p>
          )}
          <div className="video-stats">
            <span>{video.likes?.toLocaleString() || 0} likes</span>
            <span>{video.comments || 0} comments</span>
            <span>{video.shares || 0} shares</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="enhanced-video-actions">
          <button
            className={`enhanced-action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? "Unlike video" : "Like video"}
          >
            <HeartIcon />
            <span className="action-count">{video.likes?.toLocaleString() || 0}</span>
          </button>

          <button
            className={`enhanced-action-btn save-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? "Remove from saved" : "Save video"}
          >
            <BookmarkIcon />
            <span className="action-label">Save</span>
          </button>

          <button
            className="enhanced-action-btn share-btn"
            onClick={handleShare}
            aria-label="Share video"
          >
            <ShareIcon />
            <span className="action-label">Share</span>
          </button>
        </div>
      </div>

      {/* Accessibility enhancements */}
      <div className="sr-only">
        Video by {video.userToken}, {video.likes || 0} likes
      </div>
    </div>
  );
};

/**
 * Video Grid Component for multiple enhanced video cards
 */
interface VideoGridProps {
  videos: WellnessVideo[];
  likedVideos: Set<string>;
  savedVideos: Set<string>;
  currentVideoIndex: number;
  isPlaying: boolean;
  videoRefs: React.MutableRefObject<(HTMLVideoElement | null)[]>;
  onTogglePlay: () => void;
  onToggleLike: (videoId: string) => void;
  onToggleSave: (videoId: string) => void;
  onShare: (video: WellnessVideo) => void;
}

export const EnhancedVideoGrid: React.FC<VideoGridProps> = ({
  videos,
  likedVideos,
  savedVideos,
  currentVideoIndex,
  isPlaying,
  videoRefs,
  onTogglePlay,
  onToggleLike,
  onToggleSave,
  onShare
}) => {
  return (
    <div className="enhanced-video-grid">
      {videos.map((video, index) => (
        <EnhancedVideoCard
          key={video.id}
          video={video}
          isActive={index === currentVideoIndex}
          isPlaying={isPlaying && index === currentVideoIndex}
          isLiked={likedVideos.has(video.id)}
          isSaved={savedVideos.has(video.id)}
          videoRef={{ 
            current: videoRefs.current[index] 
          } as React.RefObject<HTMLVideoElement>}
          onTogglePlay={onTogglePlay}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          onShare={onShare}
          priority={index < 3 ? 8 : 5} // High priority for first 3 videos
        />
      ))}
    </div>
  );
};

export default EnhancedVideoCard;
