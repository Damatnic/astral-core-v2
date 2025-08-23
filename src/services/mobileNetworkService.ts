/**
 * Mobile Network Detection Service
 * 
 * Detects mobile network connection quality and adapts loading strategies
 * for optimal performance on varying network conditions.
 * 
 * Features:
 * - Network Information API integration
 * - Connection quality assessment
 * - Adaptive loading recommendations
 * - Real-time network change detection
 */

import React from 'react';

export type NetworkType = '2g' | '3g' | '4g' | '5g' | 'wifi' | 'ethernet' | 'unknown';
export type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
export type Speed = 'slow' | 'medium' | 'fast';
export type Quality = 'poor' | 'good' | 'excellent';
export type ImageQuality = 'low' | 'medium' | 'high';
export type PreloadLevel = 'minimal' | 'selective' | 'aggressive';
export type CompressionLevel = 'high' | 'medium' | 'low';

export interface NetworkConnection {
  type: NetworkType;
  effectiveType: EffectiveType;
  speed: Speed;
  quality: Quality;
  downlink: number; // Mbps
  rtt: number; // milliseconds
  saveData: boolean;
}

export interface AdaptiveLoadingStrategy {
  imageQuality: ImageQuality;
  preloadLevel: PreloadLevel;
  animationsEnabled: boolean;
  lazyLoadThreshold: number;
  maxConcurrentRequests: number;
  enableVideoAutoplay: boolean;
  compressionLevel: CompressionLevel;
}

class MobileNetworkService {
  private connection: NavigatorConnection | null = null;
  private currentConnection: NetworkConnection | null = null;
  private listeners: ((connection: NetworkConnection) => void)[] = [];
  private strategy: AdaptiveLoadingStrategy | null = null;

  constructor() {
    this.initializeConnection();
    this.setupNetworkMonitoring();
  }

  private initializeConnection(): void {
    // Get network connection info (Chrome/Edge support)
    this.connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection || 
                      null;

    this.updateConnectionInfo();
  }

  private setupNetworkMonitoring(): void {
    if (this.connection) {
      this.connection.addEventListener('change', this.handleNetworkChange.bind(this));
    }

    // Fallback: Monitor online/offline events
    window.addEventListener('online', this.handleNetworkChange.bind(this));
    window.addEventListener('offline', this.handleNetworkChange.bind(this));

    // Performance-based detection as fallback
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring(): void {
    // Monitor resource loading times to estimate connection quality
    if ('performance' in window && 'getEntriesByType' in performance) {
      setInterval(() => {
        this.analyzePerformanceMetrics();
      }, 30000); // Check every 30 seconds
    }
  }

  private analyzePerformanceMetrics(): void {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entries.length === 0) return;

    const entry = entries[0];
    const loadTime = entry.loadEventEnd - entry.loadEventStart;
    const connectTime = entry.connectEnd - entry.connectStart;

    // Estimate connection quality based on performance
    let estimatedQuality: 'poor' | 'good' | 'excellent' = 'good';
    let estimatedSpeed: 'slow' | 'medium' | 'fast' = 'medium';

    if (loadTime > 3000 || connectTime > 1000) {
      estimatedQuality = 'poor';
      estimatedSpeed = 'slow';
    } else if (loadTime < 1000 && connectTime < 200) {
      estimatedQuality = 'excellent';
      estimatedSpeed = 'fast';
    }

    // Update connection info if no native API available
    if (!this.connection && this.currentConnection) {
      this.currentConnection.quality = estimatedQuality;
      this.currentConnection.speed = estimatedSpeed;
      this.updateAdaptiveStrategy();
    }
  }

  private handleNetworkChange(): void {
    this.updateConnectionInfo();
    this.notifyListeners();
  }

  private updateConnectionInfo(): void {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      this.currentConnection = {
        type: 'unknown',
        effectiveType: 'unknown',
        speed: 'slow',
        quality: 'poor',
        downlink: 0,
        rtt: Infinity,
        saveData: true
      };
    } else if (this.connection) {
      // Use Network Information API
      this.currentConnection = {
        type: this.mapConnectionType(this.connection.type || 'unknown'),
        effectiveType: this.connection.effectiveType || 'unknown',
        speed: this.getSpeedFromEffectiveType(this.connection.effectiveType || 'unknown'),
        quality: this.getQualityFromConnection(),
        downlink: this.connection.downlink || 0,
        rtt: this.connection.rtt || 0,
        saveData: this.connection.saveData || false
      };
    } else {
      // Fallback estimation
      this.currentConnection = {
        type: 'unknown',
        effectiveType: 'unknown',
        speed: 'medium',
        quality: 'good',
        downlink: 1,
        rtt: 100,
        saveData: false
      };
    }

    this.updateAdaptiveStrategy();
  }

  private mapConnectionType(type: string): NetworkType {
    switch (type) {
      case 'cellular': return '4g'; // Default for cellular
      case 'wifi': return 'wifi';
      case 'ethernet': return 'ethernet';
      case 'bluetooth': return 'unknown';
      default: return 'unknown';
    }
  }

  private getSpeedFromEffectiveType(effectiveType: string): Speed {
    switch (effectiveType) {
      case 'slow-2g':
      case '2g': return 'slow';
      case '3g': return 'medium';
      case '4g': return 'fast';
      default: return 'medium';
    }
  }

  private getQualityFromConnection(): Quality {
    if (!this.connection) return 'good';

    const downlink = this.connection.downlink || 0;
    const rtt = this.connection.rtt || 0;

    if (downlink < 1.5 || rtt > 300) return 'poor';
    if (downlink > 10 && rtt < 50) return 'excellent';
    return 'good';
  }

  private updateAdaptiveStrategy(): void {
    if (!this.currentConnection) return;

    const { quality, speed, saveData, effectiveType } = this.currentConnection;

    // Define strategy based on connection quality
    if (quality === 'poor' || speed === 'slow' || saveData) {
      this.strategy = {
        imageQuality: 'low',
        preloadLevel: 'minimal',
        animationsEnabled: false,
        lazyLoadThreshold: 0.1, // Load very close to viewport
        maxConcurrentRequests: 2,
        enableVideoAutoplay: false,
        compressionLevel: 'high'
      };
    } else if (quality === 'excellent' || speed === 'fast') {
      this.strategy = {
        imageQuality: 'high',
        preloadLevel: 'aggressive',
        animationsEnabled: true,
        lazyLoadThreshold: 0.5, // Load well before viewport
        maxConcurrentRequests: 6,
        enableVideoAutoplay: true,
        compressionLevel: 'low'
      };
    } else {
      // Good quality - balanced approach
      this.strategy = {
        imageQuality: 'medium',
        preloadLevel: 'selective',
        animationsEnabled: true,
        lazyLoadThreshold: 0.2,
        maxConcurrentRequests: 4,
        enableVideoAutoplay: effectiveType === '4g',
        compressionLevel: 'medium'
      };
    }
  }

  private notifyListeners(): void {
    if (this.currentConnection) {
      this.listeners.forEach(listener => listener(this.currentConnection!));
    }
  }

  // Public API
  public getCurrentConnection(): NetworkConnection | null {
    return this.currentConnection;
  }

  public getCurrentAdaptiveStrategy(): AdaptiveLoadingStrategy | null {
    return this.strategy;
  }

  public onConnectionChange(callback: (connection: NetworkConnection) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  public shouldLoadResource(resourceType: 'image' | 'video' | 'script' | 'css'): boolean {
    if (!this.currentConnection || !this.strategy) return true;

    const { quality, saveData } = this.currentConnection;
    const { preloadLevel } = this.strategy;

    // Always load critical resources
    if (resourceType === 'script' || resourceType === 'css') return true;

    // Respect user's data saving preference
    if (saveData && resourceType === 'video') return false;

    // Apply loading strategy
    switch (preloadLevel) {
      case 'minimal':
        return resourceType !== 'video'; // Only load images, not videos
      case 'selective':
        return quality !== 'poor' || resourceType === 'image';
      case 'aggressive':
        return true;
      default:
        return true;
    }
  }

  public getOptimalImageFormat(supportsWebP: boolean, supportsAVIF: boolean): 'avif' | 'webp' | 'jpeg' {
    if (!this.strategy) return 'jpeg';

    const { imageQuality, compressionLevel } = this.strategy;

    // For poor connections, prefer maximum compression
    if (compressionLevel === 'high') {
      if (supportsAVIF) return 'avif'; // Best compression
      if (supportsWebP) return 'webp'; // Good compression
      return 'jpeg';
    }

    // For good connections, prefer quality
    if (imageQuality === 'high') {
      if (supportsAVIF) return 'avif'; // Best quality + compression
      if (supportsWebP) return 'webp'; // Good quality
      return 'jpeg';
    }

    return 'jpeg'; // Safe fallback
  }

  public getImageQualitySettings(): { width: number; quality: number } {
    if (!this.strategy) return { width: 800, quality: 80 };

    const { imageQuality } = this.strategy;

    switch (imageQuality) {
      case 'low':
        return { width: 600, quality: 60 };
      case 'medium':
        return { width: 800, quality: 75 };
      case 'high':
        return { width: 1200, quality: 90 };
      default:
        return { width: 800, quality: 80 };
    }
  }

  public getRequestConcurrency(): number {
    return this.strategy?.maxConcurrentRequests || 4;
  }

  public shouldEnableAnimations(): boolean {
    return this.strategy?.animationsEnabled !== false;
  }

  public shouldAutoplayVideo(): boolean {
    return this.strategy?.enableVideoAutoplay || false;
  }

  public getLazyLoadThreshold(): number {
    return this.strategy?.lazyLoadThreshold || 0.2;
  }
}

// Singleton instance
export const mobileNetworkService = new MobileNetworkService();

// React hook for using network detection
export const useMobileNetwork = () => {
  const [connection, setConnection] = React.useState<NetworkConnection | null>(
    mobileNetworkService.getCurrentConnection()
  );
  const [strategy, setStrategy] = React.useState<AdaptiveLoadingStrategy | null>(
    mobileNetworkService.getCurrentAdaptiveStrategy()
  );

  React.useEffect(() => {
    const unsubscribe = mobileNetworkService.onConnectionChange((newConnection) => {
      setConnection(newConnection);
      setStrategy(mobileNetworkService.getCurrentAdaptiveStrategy());
    });

    return unsubscribe;
  }, []);

  return {
    connection,
    strategy,
    shouldLoadResource: mobileNetworkService.shouldLoadResource.bind(mobileNetworkService),
    getOptimalImageFormat: mobileNetworkService.getOptimalImageFormat.bind(mobileNetworkService),
    getImageQualitySettings: mobileNetworkService.getImageQualitySettings.bind(mobileNetworkService),
    shouldEnableAnimations: mobileNetworkService.shouldEnableAnimations.bind(mobileNetworkService),
    shouldAutoplayVideo: mobileNetworkService.shouldAutoplayVideo.bind(mobileNetworkService),
    getLazyLoadThreshold: mobileNetworkService.getLazyLoadThreshold.bind(mobileNetworkService)
  };
};

// Type declaration for Navigator interface extension
declare global {
  interface Navigator {
    connection?: NavigatorConnection;
  }

  interface NavigatorConnection extends EventTarget {
    type?: string;
    effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }
}

export default mobileNetworkService;
