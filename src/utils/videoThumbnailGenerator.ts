/**
 * Video Thumbnail Generator
 * 
 * Generates optimized thumbnails from video files for wellness videos
 * Features:
 * - Extract frames from video sources
 * - Generate multiple thumbnail sizes
 * - Create placeholder images
 * - Optimize for mobile performance
 */

export interface VideoThumbnailOptions {
  frameTime?: number; // Time in seconds to extract frame (default: 1)
  quality?: number; // JPEG quality 0-100 (default: 85)
  sizes?: Array<{ width: number; height: number; suffix: string }>;
  generatePlaceholder?: boolean;
}

export interface GeneratedThumbnail {
  original: string;
  sizes: Record<string, string>; // suffix -> base64 URL
  placeholder?: string;
  aspectRatio: number;
  duration?: number;
}

const DEFAULT_SIZES = [
  { width: 320, height: 180, suffix: 'small' },
  { width: 480, height: 270, suffix: 'medium' },
  { width: 720, height: 405, suffix: 'large' },
  { width: 1280, height: 720, suffix: 'xl' }
];

/**
 * Video Thumbnail Generator Class
 */
export class VideoThumbnailGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to create canvas 2D context');
    }
    this.ctx = context;
  }

  /**
   * Generate thumbnails from video source
   */
  async generateThumbnails(
    videoSrc: string,
    options: VideoThumbnailOptions = {}
  ): Promise<GeneratedThumbnail> {
    const {
      frameTime = 1,
      quality = 85,
      sizes = DEFAULT_SIZES,
      generatePlaceholder = true
    } = options;

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(frameTime, video.duration / 2);
      };

      video.onseeked = async () => {
        try {
          const aspectRatio = video.videoWidth / video.videoHeight;
          
          // Generate thumbnails for all sizes
          const thumbnailSizes: Record<string, string> = {};
          
          for (const size of sizes) {
            const thumbnailUrl = this.generateThumbnailAtSize(
              video,
              size.width,
              size.height,
              quality
            );
            thumbnailSizes[size.suffix] = thumbnailUrl;
          }

          // Generate placeholder if requested
          let placeholder: string | undefined;
          if (generatePlaceholder) {
            placeholder = this.generatePlaceholder(video, aspectRatio);
          }

          resolve({
            original: videoSrc,
            sizes: thumbnailSizes,
            placeholder,
            aspectRatio,
            duration: video.duration
          });
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => {
        reject(new Error(`Failed to load video: ${videoSrc}`));
      };

      video.src = videoSrc;
    });
  }

  /**
   * Generate thumbnail at specific size
   */
  private generateThumbnailAtSize(
    video: HTMLVideoElement,
    width: number,
    height: number,
    quality: number
  ): string {
    this.canvas.width = width;
    this.canvas.height = height;

    // Draw video frame to canvas
    this.ctx.drawImage(video, 0, 0, width, height);

    // Convert to optimized JPEG
    return this.canvas.toDataURL('image/jpeg', quality / 100);
  }

  /**
   * Generate low-quality placeholder for blur effect
   */
  private generatePlaceholder(
    video: HTMLVideoElement,
    aspectRatio: number
  ): string {
    const placeholderWidth = 40;
    const placeholderHeight = Math.round(placeholderWidth / aspectRatio);

    this.canvas.width = placeholderWidth;
    this.canvas.height = placeholderHeight;

    // Draw low-res frame
    this.ctx.drawImage(video, 0, 0, placeholderWidth, placeholderHeight);

    return this.canvas.toDataURL('image/jpeg', 0.1);
  }

  /**
   * Generate thumbnail from video element currently in DOM
   */
  generateThumbnailFromElement(
    videoElement: HTMLVideoElement,
    options: VideoThumbnailOptions = {}
  ): GeneratedThumbnail | null {
    if (videoElement.readyState < 2) {
      // Video not ready
      return null;
    }

    try {
      const {
        quality = 85,
        sizes = DEFAULT_SIZES,
        generatePlaceholder = true
      } = options;

      const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
      const thumbnailSizes: Record<string, string> = {};

      // Generate thumbnails for all sizes
      for (const size of sizes) {
        const thumbnailUrl = this.generateThumbnailAtSize(
          videoElement,
          size.width,
          size.height,
          quality
        );
        thumbnailSizes[size.suffix] = thumbnailUrl;
      }

      // Generate placeholder if requested
      let placeholder: string | undefined;
      if (generatePlaceholder) {
        placeholder = this.generatePlaceholder(videoElement, aspectRatio);
      }

      return {
        original: videoElement.src,
        sizes: thumbnailSizes,
        placeholder,
        aspectRatio,
        duration: videoElement.duration
      };
    } catch (error) {
      console.error('Error generating thumbnail from element:', error);
      return null;
    }
  }

  /**
   * Batch generate thumbnails for multiple videos
   */
  async generateBatchThumbnails(
    videoSources: string[],
    options: VideoThumbnailOptions = {}
  ): Promise<GeneratedThumbnail[]> {
    const results: GeneratedThumbnail[] = [];
    
    // Process videos in batches to avoid overwhelming the browser
    const batchSize = 3;
    
    for (let i = 0; i < videoSources.length; i += batchSize) {
      const batch = videoSources.slice(i, i + batchSize);
      
      const batchPromises = batch.map(videoSrc =>
        this.generateThumbnails(videoSrc, options)
          .catch(error => {
            console.error(`Failed to generate thumbnail for ${videoSrc}:`, error);
            return null;
          })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter((result): result is GeneratedThumbnail => result !== null));

      // Small delay between batches to prevent blocking UI
      if (i + batchSize < videoSources.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Save generated thumbnails to cache/storage
   */
  saveThumbnailsToCache(thumbnails: GeneratedThumbnail[]): void {
    try {
      const cacheData = {
        timestamp: Date.now(),
        thumbnails: thumbnails.map(thumb => ({
          videoSrc: thumb.original,
          sizes: thumb.sizes,
          placeholder: thumb.placeholder,
          aspectRatio: thumb.aspectRatio,
          duration: thumb.duration
        }))
      };

      localStorage.setItem('video-thumbnails-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save thumbnails to cache:', error);
    }
  }

  /**
   * Load thumbnails from cache
   */
  loadThumbnailsFromCache(): GeneratedThumbnail[] {
    try {
      const cached = localStorage.getItem('video-thumbnails-cache');
      if (!cached) return [];

      const cacheData = JSON.parse(cached);
      
      // Check if cache is still valid (24 hours)
      const isExpired = Date.now() - cacheData.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        localStorage.removeItem('video-thumbnails-cache');
        return [];
      }

      return cacheData.thumbnails.map((thumb: any) => ({
        original: thumb.videoSrc,
        sizes: thumb.sizes,
        placeholder: thumb.placeholder,
        aspectRatio: thumb.aspectRatio,
        duration: thumb.duration
      }));
    } catch (error) {
      console.warn('Failed to load thumbnails from cache:', error);
      return [];
    }
  }

  /**
   * Clear thumbnail cache
   */
  clearCache(): void {
    localStorage.removeItem('video-thumbnails-cache');
  }

  /**
   * Get thumbnail URL for specific size or best available
   */
  getThumbnailUrl(
    thumbnail: GeneratedThumbnail,
    preferredSize: 'small' | 'medium' | 'large' | 'xl' = 'medium'
  ): string {
    return thumbnail.sizes[preferredSize] || 
           thumbnail.sizes.medium || 
           thumbnail.sizes.small || 
           Object.values(thumbnail.sizes)[0] || 
           '';
  }

  /**
   * Generate fallback thumbnail for videos that fail to load
   */
  generateFallbackThumbnail(
    width: number = 480,
    height: number = 270,
    text: string = 'Video'
  ): string {
    this.canvas.width = width;
    this.canvas.height = height;

    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Add text
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${Math.min(width, height) / 10}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, width / 2, height / 2);

    // Add play icon
    const iconSize = Math.min(width, height) / 4;
    this.ctx.beginPath();
    this.ctx.moveTo(width / 2 - iconSize / 3, height / 2 - iconSize / 2);
    this.ctx.lineTo(width / 2 + iconSize / 2, height / 2);
    this.ctx.lineTo(width / 2 - iconSize / 3, height / 2 + iconSize / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fill();

    return this.canvas.toDataURL('image/jpeg', 0.9);
  }
}

// Export singleton instance
export const videoThumbnailGenerator = new VideoThumbnailGenerator();
