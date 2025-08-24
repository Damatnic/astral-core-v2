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
  format: 'webp' | 'jpeg' | 'png' | 'avif';
  width: number;
  height: number;
  quality?: number;
  fileSize?: number;
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
  category: 'thumbnail' | 'hero' | 'content' | 'avatar';
  metadata?: ImageMetadata;
}

export interface ImageMetadata {
  originalWidth: number;
  originalHeight: number;
  fileSize: number;
  lastModified: Date;
  colorPalette?: string[];
  dominantColor?: string;
}

export interface ImageOptimizationConfig {
  // Responsive breakpoints
  breakpoints: {
    thumbnail: { width: 320, height: 180 };
    small: { width: 480, height: 270 };
    medium: { width: 720, height: 405 };
    large: { width: 1280, height: 720 };
    xlarge: { width: 1920, height: 1080 };
  };
  
  // Quality settings
  quality: {
    webp: number;
    jpeg: number;
    png: number;
    avif: number;
  };
  
  // Format preferences
  formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
  
  // Lazy loading options
  lazyLoading: {
    enabled: boolean;
    rootMargin: string;
    threshold: number;
    placeholderQuality: number;
  };
  
  // Performance options
  performance: {
    enableWebP: boolean;
    enableAVIF: boolean;
    enableProgressiveJPEG: boolean;
    maxFileSize: number; // bytes
    compressionLevel: number; // 1-9
  };
  
  // CDN settings
  cdn: {
    baseUrl?: string;
    enableCaching: boolean;
    cacheMaxAge: number; // seconds
    enableBrotli: boolean;
  };
}

export interface LazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  enableBlurUp?: boolean;
  fadeInDuration?: number;
}

export interface ImageLoadResult {
  success: boolean;
  url: string;
  format: string;
  loadTime: number;
  fromCache: boolean;
  error?: string;
}

class ImageOptimizationService {
  private config: ImageOptimizationConfig;
  private intersectionObserver?: IntersectionObserver;
  private loadedImages = new Set<string>();
  private imageCache = new Map<string, OptimizedImage>();
  private loadingPromises = new Map<string, Promise<ImageLoadResult>>();

  constructor(config?: Partial<ImageOptimizationConfig>) {
    this.config = {
      breakpoints: {
        thumbnail: { width: 320, height: 180 },
        small: { width: 480, height: 270 },
        medium: { width: 720, height: 405 },
        large: { width: 1280, height: 720 },
        xlarge: { width: 1920, height: 1080 }
      },
      quality: {
        webp: 80,
        jpeg: 85,
        png: 90,
        avif: 75
      },
      formats: ['avif', 'webp', 'jpeg'],
      lazyLoading: {
        enabled: true,
        rootMargin: '50px',
        threshold: 0.1,
        placeholderQuality: 20
      },
      performance: {
        enableWebP: true,
        enableAVIF: true,
        enableProgressiveJPEG: true,
        maxFileSize: 2 * 1024 * 1024, // 2MB
        compressionLevel: 7
      },
      cdn: {
        enableCaching: true,
        cacheMaxAge: 31536000, // 1 year
        enableBrotli: true
      },
      ...config
    };

    this.initializeLazyLoading();
  }

  /**
   * Create optimized image with multiple formats and sizes
   */
  public async createOptimizedImage(
    originalUrl: string,
    options: {
      alt: string;
      priority?: number;
      category?: OptimizedImage['category'];
      loading?: 'lazy' | 'eager';
    }
  ): Promise<OptimizedImage> {
    const id = this.generateImageId(originalUrl);
    
    // Check cache first
    if (this.imageCache.has(id)) {
      return this.imageCache.get(id)!;
    }

    try {
      // Get original image metadata
      const metadata = await this.getImageMetadata(originalUrl);
      
      // Generate formats for different breakpoints
      const formats = await this.generateImageFormats(originalUrl, metadata);
      
      // Create placeholder
      const placeholder = await this.generatePlaceholder(originalUrl);
      
      // Calculate aspect ratio
      const aspectRatio = metadata.originalWidth / metadata.originalHeight;

      const optimizedImage: OptimizedImage = {
        id,
        originalUrl,
        formats,
        aspectRatio,
        placeholder,
        alt: options.alt,
        loading: options.loading || 'lazy',
        priority: options.priority || 5,
        category: options.category || 'content',
        metadata
      };

      // Cache the result
      this.imageCache.set(id, optimizedImage);
      
      return optimizedImage;

    } catch (error) {
      console.error('Failed to create optimized image:', error);
      throw new Error(`Image optimization failed: ${error}`);
    }
  }

  /**
   * Generate responsive image HTML
   */
  public generateResponsiveHTML(image: OptimizedImage, className?: string): string {
    const sources = this.generateSourceElements(image);
    const imgElement = this.generateImgElement(image, className);
    
    return `
      <picture${className ? ` class="${className}"` : ''}>
        ${sources.join('\n        ')}
        ${imgElement}
      </picture>
    `.trim();
  }

  /**
   * Generate source elements for picture tag
   */
  private generateSourceElements(image: OptimizedImage): string[] {
    const sources: string[] = [];
    const breakpoints = Object.entries(this.config.breakpoints);
    
    // Group formats by breakpoint
    const formatsByBreakpoint = this.groupFormatsByBreakpoint(image.formats);
    
    // Generate sources for each format and breakpoint
    this.config.formats.forEach(format => {
      breakpoints.forEach(([breakpointName, dimensions], index) => {
        const formats = formatsByBreakpoint[breakpointName]?.filter(f => f.format === format) || [];
        
        if (formats.length === 0) return;
        
        const srcset = formats.map(f => `${f.url} ${f.width}w`).join(', ');
        const mediaQuery = index < breakpoints.length - 1 
          ? `(max-width: ${dimensions.width}px)` 
          : '';
        
        const sourceAttrs = [
          `srcset="${srcset}"`,
          `type="image/${format}"`,
          mediaQuery ? `media="${mediaQuery}"` : '',
          `sizes="(max-width: ${dimensions.width}px) 100vw, ${dimensions.width}px"`
        ].filter(Boolean).join(' ');
        
        sources.push(`<source ${sourceAttrs}>`);
      });
    });
    
    return sources;
  }

  /**
   * Generate img element
   */
  private generateImgElement(image: OptimizedImage, className?: string): string {
    const fallbackFormat = image.formats.find(f => f.format === 'jpeg') || image.formats[0];
    
    const attributes = [
      `src="${image.loading === 'lazy' ? image.placeholder : fallbackFormat.url}"`,
      `data-src="${fallbackFormat.url}"`,
      `alt="${image.alt}"`,
      `width="${fallbackFormat.width}"`,
      `height="${fallbackFormat.height}"`,
      `loading="${image.loading}"`,
      `decoding="async"`,
      className ? `class="${className}"` : '',
      image.loading === 'lazy' ? 'data-lazy' : '',
      `data-aspect-ratio="${image.aspectRatio.toFixed(3)}"`
    ].filter(Boolean).join(' ');
    
    return `<img ${attributes}>`;
  }

  /**
   * Initialize lazy loading with intersection observer
   */
  private initializeLazyLoading(): void {
    if (!this.config.lazyLoading.enabled || typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadLazyImage(entry.target as HTMLImageElement);
            this.intersectionObserver?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: this.config.lazyLoading.rootMargin,
        threshold: this.config.lazyLoading.threshold
      }
    );

    // Observe existing lazy images
    this.observeLazyImages();
  }

  /**
   * Observe lazy images
   */
  public observeLazyImages(): void {
    const lazyImages = document.querySelectorAll('img[data-lazy]');
    lazyImages.forEach(img => {
      this.intersectionObserver?.observe(img);
    });
  }

  /**
   * Load lazy image
   */
  private async loadLazyImage(img: HTMLImageElement): Promise<void> {
    const dataSrc = img.getAttribute('data-src');
    if (!dataSrc || this.loadedImages.has(dataSrc)) {
      return;
    }

    try {
      // Start loading the actual image
      const loadPromise = this.loadImageWithFallback(img);
      this.loadingPromises.set(dataSrc, loadPromise);

      const result = await loadPromise;
      
      if (result.success) {
        // Apply fade-in effect
        this.applyFadeInEffect(img, result.url);
        this.loadedImages.add(dataSrc);
      }

    } catch (error) {
      console.error('Failed to load lazy image:', error);
      this.handleImageLoadError(img);
    } finally {
      this.loadingPromises.delete(dataSrc);
    }
  }

  /**
   * Load image with format fallback
   */
  private async loadImageWithFallback(img: HTMLImageElement): Promise<ImageLoadResult> {
    const picture = img.closest('picture');
    const sources = picture?.querySelectorAll('source') || [];
    
    // Try each source in order
    for (const source of Array.from(sources)) {
      const srcset = source.getAttribute('srcset');
      if (!srcset) continue;

      const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
      
      for (const url of urls) {
        try {
          const result = await this.loadSingleImage(url);
          if (result.success) {
            return result;
          }
        } catch (error) {
          continue; // Try next format
        }
      }
    }

    // Fallback to img src
    const fallbackSrc = img.getAttribute('data-src') || img.src;
    return this.loadSingleImage(fallbackSrc);
  }

  /**
   * Load single image
   */
  private loadSingleImage(url: string): Promise<ImageLoadResult> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const img = new Image();
      
      img.onload = () => {
        resolve({
          success: true,
          url,
          format: this.getImageFormat(url),
          loadTime: performance.now() - startTime,
          fromCache: false // Could be enhanced to detect cache
        });
      };
      
      img.onerror = () => {
        resolve({
          success: false,
          url,
          format: this.getImageFormat(url),
          loadTime: performance.now() - startTime,
          fromCache: false,
          error: 'Failed to load image'
        });
      };
      
      img.src = url;
    });
  }

  /**
   * Apply fade-in effect
   */
  private applyFadeInEffect(img: HTMLImageElement, newSrc: string): void {
    img.style.transition = 'opacity 0.3s ease-in-out';
    img.style.opacity = '0';
    
    img.onload = () => {
      img.style.opacity = '1';
      img.removeAttribute('data-lazy');
    };
    
    img.src = newSrc;
  }

  /**
   * Handle image load error
   */
  private handleImageLoadError(img: HTMLImageElement): void {
    // Show fallback image or placeholder
    img.src = this.generateErrorPlaceholder(img.width, img.height);
    img.alt = 'Image failed to load';
    img.removeAttribute('data-lazy');
  }

  /**
   * Generate image formats for different breakpoints
   */
  private async generateImageFormats(url: string, metadata: ImageMetadata): Promise<ImageFormat[]> {
    const formats: ImageFormat[] = [];
    
    for (const [breakpointName, dimensions] of Object.entries(this.config.breakpoints)) {
      for (const format of this.config.formats) {
        if (!this.isFormatSupported(format)) continue;
        
        const optimizedUrl = this.generateOptimizedUrl(url, {
          width: dimensions.width,
          height: dimensions.height,
          format,
          quality: this.config.quality[format]
        });
        
        formats.push({
          url: optimizedUrl,
          format,
          width: dimensions.width,
          height: dimensions.height,
          quality: this.config.quality[format]
        });
      }
    }
    
    return formats;
  }

  /**
   * Generate optimized URL (would integrate with CDN/image service)
   */
  private generateOptimizedUrl(
    originalUrl: string, 
    options: { width: number; height: number; format: string; quality: number }
  ): string {
    // This would integrate with a CDN like Cloudinary, ImageKit, or custom service
    const baseUrl = this.config.cdn.baseUrl || '';
    const params = new URLSearchParams({
      w: options.width.toString(),
      h: options.height.toString(),
      f: options.format,
      q: options.quality.toString(),
      fit: 'cover'
    });
    
    // For now, return original URL with parameters
    // In production, this would transform to CDN URLs
    return `${baseUrl}${originalUrl}?${params.toString()}`;
  }

  /**
   * Generate placeholder image
   */
  private async generatePlaceholder(url: string): Promise<string> {
    // Generate a low-quality, small version for blur-up effect
    // This would typically be done server-side or with a service
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 40;
    canvas.height = 30;
    
    // Create a simple gradient placeholder
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 40, 30);
      gradient.addColorStop(0, '#f0f0f0');
      gradient.addColorStop(1, '#e0e0e0');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 40, 30);
    }
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }

  /**
   * Generate error placeholder
   */
  private generateErrorPlaceholder(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width || 300;
    canvas.height = height || 200;
    
    if (ctx) {
      // Gray background
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Error icon/text
      ctx.fillStyle = '#999';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Image not available', canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Get image metadata
   */
  private async getImageMetadata(url: string): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          fileSize: 0, // Would need server-side info
          lastModified: new Date()
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for metadata'));
      };
      
      img.src = url;
    });
  }

  /**
   * Group formats by breakpoint
   */
  private groupFormatsByBreakpoint(formats: ImageFormat[]): Record<string, ImageFormat[]> {
    const grouped: Record<string, ImageFormat[]> = {};
    
    formats.forEach(format => {
      const breakpoint = this.getBreakpointForSize(format.width);
      if (!grouped[breakpoint]) {
        grouped[breakpoint] = [];
      }
      grouped[breakpoint].push(format);
    });
    
    return grouped;
  }

  /**
   * Get breakpoint name for size
   */
  private getBreakpointForSize(width: number): string {
    const breakpoints = Object.entries(this.config.breakpoints);
    
    for (const [name, dimensions] of breakpoints) {
      if (width <= dimensions.width) {
        return name;
      }
    }
    
    return 'xlarge';
  }

  /**
   * Check if format is supported
   */
  private isFormatSupported(format: string): boolean {
    switch (format) {
      case 'webp':
        return this.config.performance.enableWebP;
      case 'avif':
        return this.config.performance.enableAVIF;
      case 'jpeg':
      case 'png':
        return true;
      default:
        return false;
    }
  }

  /**
   * Get image format from URL
   */
  private getImageFormat(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  /**
   * Generate image ID
   */
  private generateImageId(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Preload critical images
   */
  public preloadCriticalImages(images: OptimizedImage[]): void {
    const criticalImages = images
      .filter(img => img.priority >= 8 || img.loading === 'eager')
      .slice(0, 3); // Limit to 3 critical images

    criticalImages.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = image.formats[0].url;
      
      // Add responsive preload
      if (image.formats.length > 1) {
        link.setAttribute('imagesrcset', 
          image.formats.map(f => `${f.url} ${f.width}w`).join(', ')
        );
      }
      
      document.head.appendChild(link);
    });
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    totalImages: number;
    loadedImages: number;
    averageLoadTime: number;
    cacheHitRate: number;
  } {
    const totalPromises = Array.from(this.loadingPromises.values());
    
    return {
      totalImages: this.imageCache.size,
      loadedImages: this.loadedImages.size,
      averageLoadTime: 0, // Would need to track this
      cacheHitRate: this.imageCache.size > 0 ? this.loadedImages.size / this.imageCache.size : 0
    };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.imageCache.clear();
    this.loadedImages.clear();
    this.loadingPromises.clear();
  }

  /**
   * Destroy service
   */
  public destroy(): void {
    this.intersectionObserver?.disconnect();
    this.clearCache();
  }
}

// Export singleton instance and factory
export const imageOptimizationService = new ImageOptimizationService();

export const createImageOptimizer = (config?: Partial<ImageOptimizationConfig>) =>
  new ImageOptimizationService(config);

// Utility functions
export const optimizeImage = async (
  url: string, 
  options: { alt: string; priority?: number; category?: OptimizedImage['category'] }
) => {
  return imageOptimizationService.createOptimizedImage(url, options);
};

export const generateResponsiveImage = (image: OptimizedImage, className?: string) => {
  return imageOptimizationService.generateResponsiveHTML(image, className);
};

export const initializeLazyLoading = () => {
  imageOptimizationService.observeLazyImages();
};
