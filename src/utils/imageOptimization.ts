/**
 * Image Optimization Utilities for Wellness Video Thumbnails
 * 
 * Provides comprehensive image optimization including:
 * - Responsive image loading with multiple sizes
 * - Lazy loading with intersection observer
 * - WebP format conversion with fallbacks
 * - Progressive loading with blur-up technique
 * - Bandwidth-aware image serving
 */

export interface ImageFormat {
  url: string;
  format: 'webp' | 'jpeg' | 'png';
  width: number;
  height: number;
  quality?: number;
}

export interface OptimizedImage {
  id: string;
  originalUrl: string;
  formats: ImageFormat[];
  aspectRatio: number;
  placeholder: string; // Base64 blur placeholder
  alt: string;
  loading: 'lazy' | 'eager';
  priority: number; // 1-10, higher = more important
}

export interface ImageOptimizationConfig {
  // Responsive breakpoints
  breakpoints: {
    thumbnail: { width: 320, height: 180 };
    small: { width: 480, height: 270 };
    medium: { width: 720, height: 405 };
    large: { width: 1280, height: 720 };
  };
  
  // Quality settings
  quality: {
    webp: 85;
    jpeg: 80;
    png: 95;
  };
  
  // Lazy loading settings
  lazyLoadingOffset: 100; // px before element comes into view
  
  // Cache settings
  cacheExpiry: 86400000; // 24 hours in ms
  
  // Bandwidth detection
  connectionThresholds: {
    slow: number; // < 1 Mbps
    medium: number; // < 5 Mbps
    fast: number; // >= 5 Mbps
  };
}

export const defaultImageConfig: ImageOptimizationConfig = {
  breakpoints: {
    thumbnail: { width: 320, height: 180 },
    small: { width: 480, height: 270 },
    medium: { width: 720, height: 405 },
    large: { width: 1280, height: 720 }
  },
  quality: {
    webp: 85,
    jpeg: 80,
    png: 95
  },
  lazyLoadingOffset: 100,
  cacheExpiry: 86400000,
  connectionThresholds: {
    slow: 1,
    medium: 5,
    fast: Infinity
  }
};

/**
 * Image Optimization Manager
 */
export class ImageOptimizer {
  private config: ImageOptimizationConfig;
  private cache: Map<string, OptimizedImage>;
  private intersectionObserver?: IntersectionObserver;
  private connectionType: 'slow' | 'medium' | 'fast' = 'medium';

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = { ...defaultImageConfig, ...config };
    this.cache = new Map();
    this.initConnectionDetection();
    this.initIntersectionObserver();
  }

  /**
   * Detect network connection speed
   */
  private initConnectionDetection(): void {
    if ('connection' in navigator) {
      const navigatorWithConnection = navigator as any & { 
        connection?: { 
          downlink?: number;
          addEventListener?: (event: string, handler: () => void) => void;
        } 
      };
      const connection = navigatorWithConnection.connection;
      if (connection) {
        const updateConnectionType = () => {
          const downlink = connection.downlink || 1;
          if (downlink < this.config.connectionThresholds.slow) {
            this.connectionType = 'slow';
          } else if (downlink < this.config.connectionThresholds.medium) {
            this.connectionType = 'medium';
          } else {
            this.connectionType = 'fast';
          }
        };
        
        updateConnectionType();
        if (connection.addEventListener) {
          connection.addEventListener('change', updateConnectionType);
        }
      }
    }
  }

  /**
   * Initialize intersection observer for lazy loading
   */
  private initIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadOptimizedImage(img);
              this.intersectionObserver?.unobserve(img);
            }
          });
        },
        {
          rootMargin: `${this.config.lazyLoadingOffset}px`
        }
      );
    }
  }

  /**
   * Generate optimized image configurations for a source image
   */
  generateOptimizedImages(
    sourceUrl: string,
    options: {
      alt: string;
      priority?: number;
      loading?: 'lazy' | 'eager';
    }
  ): OptimizedImage {
    const id = this.generateImageId(sourceUrl);
    
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    const formats: ImageFormat[] = [];
    const { breakpoints, quality } = this.config;

    // Generate responsive images for each breakpoint
    Object.entries(breakpoints).forEach(([_size, dimensions]) => {
      // WebP format (modern browsers)
      formats.push({
        url: this.generateOptimizedUrl(sourceUrl, dimensions.width, dimensions.height, 'webp', quality.webp),
        format: 'webp',
        width: dimensions.width,
        height: dimensions.height,
        quality: quality.webp
      });

      // JPEG fallback
      formats.push({
        url: this.generateOptimizedUrl(sourceUrl, dimensions.width, dimensions.height, 'jpeg', quality.jpeg),
        format: 'jpeg',
        width: dimensions.width,
        height: dimensions.height,
        quality: quality.jpeg
      });
    });

    const optimizedImage: OptimizedImage = {
      id,
      originalUrl: sourceUrl,
      formats,
      aspectRatio: 16 / 9, // Standard video aspect ratio
      placeholder: this.generatePlaceholder(sourceUrl),
      alt: options.alt,
      loading: options.loading || 'lazy',
      priority: options.priority || 5
    };

    // Cache the result
    this.cache.set(id, optimizedImage);
    
    return optimizedImage;
  }

  /**
   * Generate optimized URL for image processing service
   * In production, this would integrate with a service like Cloudinary, ImageKit, or custom image processing
   */
  private generateOptimizedUrl(
    sourceUrl: string,
    width: number,
    height: number,
    format: 'webp' | 'jpeg' | 'png',
    quality: number
  ): string {
    // For now, return original URL with query params that could be processed by a CDN/image service
    const url = new URL(sourceUrl, window.location.origin);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', height.toString());
    url.searchParams.set('f', format);
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fit', 'cover');
    url.searchParams.set('auto', 'compress');
    
    return url.toString();
  }

  /**
   * Generate a unique ID for image caching
   */
  private generateImageId(sourceUrl: string): string {
    return btoa(sourceUrl).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Generate base64 blur placeholder
   */
  private generatePlaceholder(_sourceUrl: string): string {
    // Simple base64 placeholder - in production, this would be generated during image processing
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 23; // 16:9 aspect ratio
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, 40, 23);
      gradient.addColorStop(0, '#E5E7EB');
      gradient.addColorStop(1, '#F3F4F6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 40, 23);
    }
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }

  /**
   * Get optimal image format based on connection speed and browser support
   */
  getOptimalFormat(optimizedImage: OptimizedImage): ImageFormat {
    const { formats } = optimizedImage;
    
    // Check browser support for WebP
    const supportsWebP = this.supportsWebP();
    
    // Filter formats based on browser support
    const supportedFormats = formats.filter(format => 
      supportsWebP || format.format !== 'webp'
    );

    // Choose size based on connection speed
    let targetWidth: number;
    switch (this.connectionType) {
      case 'slow':
        targetWidth = this.config.breakpoints.thumbnail.width;
        break;
      case 'medium':
        targetWidth = this.config.breakpoints.small.width;
        break;
      case 'fast':
        targetWidth = this.config.breakpoints.medium.width;
        break;
    }

    // Find the best matching format
    const bestFormat = supportedFormats
      .filter(format => format.width <= targetWidth)
      .sort((a, b) => b.width - a.width)[0] || supportedFormats[0];

    return bestFormat;
  }

  /**
   * Check WebP support
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(images: OptimizedImage[]): void {
    const criticalImages = images
      .filter(img => img.priority >= 8 || img.loading === 'eager')
      .slice(0, 3); // Limit to first 3 critical images

    criticalImages.forEach(image => {
      const optimalFormat = this.getOptimalFormat(image);
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimalFormat.url;
      document.head.appendChild(link);
    });
  }

  /**
   * Setup lazy loading for an image element
   */
  setupLazyLoading(imgElement: HTMLImageElement): void {
    if (this.intersectionObserver) {
      imgElement.loading = 'lazy';
      this.intersectionObserver.observe(imgElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadOptimizedImage(imgElement);
    }
  }

  /**
   * Load optimized image into element
   */
  private loadOptimizedImage(imgElement: HTMLImageElement): void {
    const imageId = imgElement.dataset.imageId;
    if (!imageId) return;

    const optimizedImage = this.cache.get(imageId);
    if (!optimizedImage) return;

    const optimalFormat = this.getOptimalFormat(optimizedImage);
    
    // Create a new image to test loading
    const testImg = new Image();
    testImg.onload = () => {
      imgElement.src = optimalFormat.url;
      imgElement.classList.add('loaded');
    };
    testImg.onerror = () => {
      // Fallback to original or next best format
      const fallback = optimizedImage.formats.find(f => f.format === 'jpeg');
      if (fallback) {
        imgElement.src = fallback.url;
      } else {
        imgElement.src = optimizedImage.originalUrl;
      }
      imgElement.classList.add('loaded');
    };
    testImg.src = optimalFormat.url;
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Generate responsive srcset for picture element
   */
  generateSrcSet(optimizedImage: OptimizedImage, format: 'webp' | 'jpeg'): string {
    return optimizedImage.formats
      .filter(f => f.format === format)
      .map(f => `${f.url} ${f.width}w`)
      .join(', ');
  }

  /**
   * Generate sizes attribute for responsive images
   */
  generateSizes(): string {
    return [
      '(max-width: 480px) 320px',
      '(max-width: 768px) 480px',
      '(max-width: 1024px) 720px',
      '1280px'
    ].join(', ');
  }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer();

/**
 * i18n Module
 */