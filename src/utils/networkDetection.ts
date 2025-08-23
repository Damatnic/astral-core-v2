/**
 * Mobile Network Detection Utility
 * Detects connection type and quality for adaptive loading strategies
 * Optimizes mobile performance based on network conditions
 */

// Network connection types
export type ConnectionType = '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown';

// Network quality levels
export type NetworkQuality = 'poor' | 'good' | 'excellent';

// Adaptive loading configuration
export interface AdaptiveLoadingConfig {
  connectionType: ConnectionType;
  quality: NetworkQuality;
  downlink: number; // Mbps
  rtt: number; // Round trip time in ms
  saveData: boolean; // Data saver mode
  shouldPreloadImages: boolean;
  shouldPreloadVideos: boolean;
  recommendedImageQuality: 'low' | 'medium' | 'high';
  chunkLoadingStrategy: 'aggressive' | 'conservative' | 'minimal';
}

/**
 * Detects network connection type from navigator.connection
 */
export const getConnectionType = (): ConnectionType => {
  const navigatorWithConnection = navigator as any & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    }
  };
  const connection = navigatorWithConnection.connection;
  if (!connection) {
    return 'unknown';
  }

  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return '2g';
    case '3g':
      return '3g';
    case '4g':
      return '4g';
    default:
      // Assume 4g for better performance if unknown
      return '4g';
  }
};

/**
 * Determines network quality based on downlink and RTT
 */
export const getNetworkQuality = (): NetworkQuality => {
  const navigatorWithConnection = navigator as any & {
    connection?: {
      downlink?: number;
      rtt?: number;
    }
  };
  const connection = navigatorWithConnection.connection;
  if (!connection) {
    return 'good'; // Default assumption
  }

  const { downlink = 1, rtt = 300 } = connection;
  
  // Poor: Slow speeds or high latency
  if (downlink < 0.5 || rtt > 500) {
    return 'poor';
  }
  
  // Excellent: Fast speeds and low latency
  if (downlink > 2 && rtt < 150) {
    return 'excellent';
  }
  
  // Good: Moderate speeds
  return 'good';
};

/**
 * Gets comprehensive adaptive loading configuration
 */
export const getAdaptiveLoadingConfig = (): AdaptiveLoadingConfig => {
  const connectionType = getConnectionType();
  const quality = getNetworkQuality();
  const navigatorWithConnection = navigator as any & {
    connection?: {
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
      addEventListener?: (event: string, handler: () => void) => void;
      removeEventListener?: (event: string, handler: () => void) => void;
    }
  };
  const connection = navigatorWithConnection.connection;
  const downlink = connection?.downlink || 1;
  const rtt = connection?.rtt || 300;
  const saveData = connection?.saveData || false;

  // Determine loading strategies based on network conditions
  const shouldPreloadImages = quality !== 'poor' && !saveData;
  const shouldPreloadVideos = quality === 'excellent' && !saveData && connectionType !== '2g';
  
  let recommendedImageQuality: 'low' | 'medium' | 'high' = 'medium';
  let chunkLoadingStrategy: 'aggressive' | 'conservative' | 'minimal' = 'conservative';

  // Adjust quality based on network
  switch (quality) {
    case 'poor':
      recommendedImageQuality = 'low';
      chunkLoadingStrategy = 'minimal';
      break;
    case 'excellent':
      recommendedImageQuality = 'high';
      chunkLoadingStrategy = 'aggressive';
      break;
    default:
      // Keep defaults for 'good'
      break;
  }

  // Override for data saver mode
  if (saveData) {
    recommendedImageQuality = 'low';
    chunkLoadingStrategy = 'minimal';
  }

  return {
    connectionType,
    quality,
    downlink,
    rtt,
    saveData,
    shouldPreloadImages,
    shouldPreloadVideos,
    recommendedImageQuality,
    chunkLoadingStrategy
  };
};

/**
 * React hook for adaptive loading configuration
 */
export const useAdaptiveLoading = () => {
  const [config, setConfig] = React.useState<AdaptiveLoadingConfig>(
    getAdaptiveLoadingConfig()
  );

  React.useEffect(() => {
    // Update config when connection changes
    const updateConfig = () => {
      setConfig(getAdaptiveLoadingConfig());
    };

    const navigatorWithConnection = navigator as any & {
      connection?: {
        addEventListener?: (event: string, handler: () => void) => void;
        removeEventListener?: (event: string, handler: () => void) => void;
      }
    };
    const connection = navigatorWithConnection.connection;
    if (connection && connection.addEventListener && connection.removeEventListener) {
      connection.addEventListener('change', updateConfig);
      return () => {
        connection.removeEventListener('change', updateConfig);
      };
    }
  }, []);

  return config;
};

/**
 * Utility to determine if feature should be enabled based on network
 */
export const shouldEnableFeature = (
  feature: 'auto-play' | 'high-res-images' | 'video-preload' | 'background-sync',
  config?: AdaptiveLoadingConfig
): boolean => {
  const networkConfig = config || getAdaptiveLoadingConfig();

  switch (feature) {
    case 'auto-play':
      return networkConfig.quality !== 'poor' && !networkConfig.saveData;
    
    case 'high-res-images':
      return networkConfig.recommendedImageQuality === 'high';
    
    case 'video-preload':
      return networkConfig.shouldPreloadVideos;
    
    case 'background-sync':
      return networkConfig.quality !== 'poor';
    
    default:
      return false;
  }
};

/**
 * Log network information for debugging
 */
export const logNetworkInfo = (): void => {
  const config = getAdaptiveLoadingConfig();
  
  console.group('📱 Mobile Network Detection');
  console.log('Connection Type:', config.connectionType);
  console.log('Network Quality:', config.quality);
  console.log('Downlink Speed:', `${config.downlink} Mbps`);
  console.log('Round Trip Time:', `${config.rtt}ms`);
  console.log('Data Saver Mode:', config.saveData);
  console.log('Image Quality:', config.recommendedImageQuality);
  console.log('Loading Strategy:', config.chunkLoadingStrategy);
  console.groupEnd();
};

// Export React import for the hook
import React from 'react';
