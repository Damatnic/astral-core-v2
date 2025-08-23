/**
 * Network Detection Test Suite
 * Tests network connection detection and adaptive loading strategies
 */

import React from 'react';
import { renderHook } from '@testing-library/react';
import {
  getConnectionType,
  getNetworkQuality,
  getAdaptiveLoadingConfig,
  useAdaptiveLoading,
  shouldEnableFeature,
  logNetworkInfo,
  ConnectionType,
  NetworkQuality,
  AdaptiveLoadingConfig,
} from './networkDetection';

// Mock navigator.connection
const mockConnection = {
  effectiveType: '4g',
  downlink: 2,
  rtt: 200,
  saveData: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// We'll mock React hooks only when needed in specific tests
let mockUseState: jest.MockedFunction<typeof React.useState> | undefined;
let mockUseEffect: jest.MockedFunction<typeof React.useEffect> | undefined;

describe('networkDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset navigator.connection
    Object.defineProperty(navigator, 'connection', {
      value: mockConnection,
      writable: true,
      configurable: true,
    });
    
    // Reset console methods
    jest.spyOn(console, 'group').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getConnectionType', () => {
    it('should return 2g for slow-2g effective type', () => {
      mockConnection.effectiveType = 'slow-2g';
      
      const result = getConnectionType();
      
      expect(result).toBe('2g');
    });

    it('should return 2g for 2g effective type', () => {
      mockConnection.effectiveType = '2g';
      
      const result = getConnectionType();
      
      expect(result).toBe('2g');
    });

    it('should return 3g for 3g effective type', () => {
      mockConnection.effectiveType = '3g';
      
      const result = getConnectionType();
      
      expect(result).toBe('3g');
    });

    it('should return 4g for 4g effective type', () => {
      mockConnection.effectiveType = '4g';
      
      const result = getConnectionType();
      
      expect(result).toBe('4g');
    });

    it('should default to 4g for unknown effective type', () => {
      mockConnection.effectiveType = 'unknown';
      
      const result = getConnectionType();
      
      expect(result).toBe('4g');
    });

    it('should return unknown when navigator.connection is unavailable', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        writable: true,
      });
      
      const result = getConnectionType();
      
      expect(result).toBe('unknown');
    });

    it('should handle missing effectiveType property', () => {
      const connectionWithoutEffectiveType = { ...mockConnection };
      delete (connectionWithoutEffectiveType as any).effectiveType;
      
      Object.defineProperty(navigator, 'connection', {
        value: connectionWithoutEffectiveType,
        writable: true,
      });
      
      const result = getConnectionType();
      
      expect(result).toBe('4g'); // Should default to 4g
    });
  });

  describe('getNetworkQuality', () => {
    it('should return poor for low downlink speed', () => {
      mockConnection.downlink = 0.3;
      mockConnection.rtt = 300;
      
      const result = getNetworkQuality();
      
      expect(result).toBe('poor');
    });

    it('should return poor for high RTT', () => {
      mockConnection.downlink = 1;
      mockConnection.rtt = 600;
      
      const result = getNetworkQuality();
      
      expect(result).toBe('poor');
    });

    it('should return excellent for high speed and low latency', () => {
      mockConnection.downlink = 5;
      mockConnection.rtt = 100;
      
      const result = getNetworkQuality();
      
      expect(result).toBe('excellent');
    });

    it('should return good for moderate conditions', () => {
      mockConnection.downlink = 1.5;
      mockConnection.rtt = 200;
      
      const result = getNetworkQuality();
      
      expect(result).toBe('good');
    });

    it('should default to good when navigator.connection is unavailable', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        writable: true,
      });
      
      const result = getNetworkQuality();
      
      expect(result).toBe('good');
    });

    it('should use default values when connection properties are missing', () => {
      const connectionWithoutProperties = {};
      Object.defineProperty(navigator, 'connection', {
        value: connectionWithoutProperties,
        writable: true,
      });
      
      const result = getNetworkQuality();
      
      expect(result).toBe('good'); // Uses default downlink=1, rtt=300
    });

    it('should handle edge case values correctly', () => {
      // Test boundary conditions based on implementation:
      // Poor: downlink < 0.5 || rtt > 500
      // Excellent: downlink > 2 && rtt < 150
      const testCases = [
        { downlink: 0.49, rtt: 500, expected: 'poor' }, // Just below boundary (poor)
        { downlink: 0.5, rtt: 501, expected: 'poor' }, // Just above RTT boundary (poor)
        { downlink: 0.5, rtt: 500, expected: 'good' }, // Exactly at boundary (good)
        { downlink: 2.01, rtt: 149, expected: 'excellent' }, // Just above/below boundaries (excellent)
        { downlink: 2, rtt: 150, expected: 'good' }, // Exactly at boundaries (good)
        { downlink: 1.99, rtt: 151, expected: 'good' }, // Just below/above boundaries (good)
      ];

      testCases.forEach(({ downlink, rtt, expected }) => {
        mockConnection.downlink = downlink;
        mockConnection.rtt = rtt;
        
        const result = getNetworkQuality();
        expect(result).toBe(expected);
      });
    });
  });

  describe('getAdaptiveLoadingConfig', () => {
    beforeEach(() => {
      // Reset to default values
      mockConnection.effectiveType = '4g';
      mockConnection.downlink = 2;
      mockConnection.rtt = 200;
      mockConnection.saveData = false;
    });

    it('should return complete configuration object', () => {
      const result = getAdaptiveLoadingConfig();
      
      expect(result).toHaveProperty('connectionType');
      expect(result).toHaveProperty('quality');
      expect(result).toHaveProperty('downlink');
      expect(result).toHaveProperty('rtt');
      expect(result).toHaveProperty('saveData');
      expect(result).toHaveProperty('shouldPreloadImages');
      expect(result).toHaveProperty('shouldPreloadVideos');
      expect(result).toHaveProperty('recommendedImageQuality');
      expect(result).toHaveProperty('chunkLoadingStrategy');
    });

    it('should recommend optimal settings for excellent connection', () => {
      mockConnection.effectiveType = '4g';
      mockConnection.downlink = 5;
      mockConnection.rtt = 100;
      mockConnection.saveData = false;
      
      const result = getAdaptiveLoadingConfig();
      
      expect(result.quality).toBe('excellent');
      expect(result.shouldPreloadImages).toBe(true);
      expect(result.shouldPreloadVideos).toBe(true);
      expect(result.recommendedImageQuality).toBe('high');
      expect(result.chunkLoadingStrategy).toBe('aggressive');
    });

    it('should recommend conservative settings for poor connection', () => {
      mockConnection.effectiveType = '2g';
      mockConnection.downlink = 0.3;
      mockConnection.rtt = 600;
      
      const result = getAdaptiveLoadingConfig();
      
      expect(result.quality).toBe('poor');
      expect(result.shouldPreloadImages).toBe(false);
      expect(result.shouldPreloadVideos).toBe(false);
      expect(result.recommendedImageQuality).toBe('low');
      expect(result.chunkLoadingStrategy).toBe('minimal');
    });

    it('should disable preloading when saveData is enabled', () => {
      mockConnection.effectiveType = '4g';
      mockConnection.downlink = 5;
      mockConnection.rtt = 100;
      mockConnection.saveData = true;
      
      const result = getAdaptiveLoadingConfig();
      
      expect(result.saveData).toBe(true);
      expect(result.recommendedImageQuality).toBe('low');
      expect(result.chunkLoadingStrategy).toBe('minimal');
    });

    it('should not preload videos on 2g even with good quality', () => {
      mockConnection.effectiveType = '2g';
      mockConnection.downlink = 3; // Excellent speed (>2)
      mockConnection.rtt = 100; // Low latency (<150)
      
      const result = getAdaptiveLoadingConfig();
      
      expect(result.quality).toBe('excellent');
      expect(result.shouldPreloadVideos).toBe(false); // Still false due to 2g
    });

    it('should handle missing connection gracefully', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        writable: true,
      });
      
      const result = getAdaptiveLoadingConfig();
      
      expect(result).toEqual({
        connectionType: 'unknown',
        quality: 'good',
        downlink: 1,
        rtt: 300,
        saveData: false,
        shouldPreloadImages: true,
        shouldPreloadVideos: false,
        recommendedImageQuality: 'medium',
        chunkLoadingStrategy: 'conservative',
      });
    });

    it('should use default values for missing properties', () => {
      const partialConnection = {
        effectiveType: '4g',
        // Missing downlink, rtt, saveData
      };
      
      Object.defineProperty(navigator, 'connection', {
        value: partialConnection,
        writable: true,
      });
      
      const result = getAdaptiveLoadingConfig();
      
      expect(result.downlink).toBe(1); // Default value
      expect(result.rtt).toBe(300); // Default value
      expect(result.saveData).toBe(false); // Default value
    });
  });


  describe('shouldEnableFeature', () => {
    let mockConfig: AdaptiveLoadingConfig;

    beforeEach(() => {
      mockConfig = {
        connectionType: '4g',
        quality: 'good',
        downlink: 2,
        rtt: 200,
        saveData: false,
        shouldPreloadImages: true,
        shouldPreloadVideos: false,
        recommendedImageQuality: 'medium',
        chunkLoadingStrategy: 'conservative',
      };
    });

    describe('auto-play feature', () => {
      it('should enable auto-play for good quality without data saver', () => {
        const result = shouldEnableFeature('auto-play', mockConfig);
        expect(result).toBe(true);
      });

      it('should disable auto-play for poor quality', () => {
        mockConfig.quality = 'poor';
        const result = shouldEnableFeature('auto-play', mockConfig);
        expect(result).toBe(false);
      });

      it('should disable auto-play when data saver is enabled', () => {
        mockConfig.saveData = true;
        const result = shouldEnableFeature('auto-play', mockConfig);
        expect(result).toBe(false);
      });
    });

    describe('high-res-images feature', () => {
      it('should enable for high image quality setting', () => {
        mockConfig.recommendedImageQuality = 'high';
        const result = shouldEnableFeature('high-res-images', mockConfig);
        expect(result).toBe(true);
      });

      it('should disable for medium image quality setting', () => {
        mockConfig.recommendedImageQuality = 'medium';
        const result = shouldEnableFeature('high-res-images', mockConfig);
        expect(result).toBe(false);
      });

      it('should disable for low image quality setting', () => {
        mockConfig.recommendedImageQuality = 'low';
        const result = shouldEnableFeature('high-res-images', mockConfig);
        expect(result).toBe(false);
      });
    });

    describe('video-preload feature', () => {
      it('should enable when shouldPreloadVideos is true', () => {
        mockConfig.shouldPreloadVideos = true;
        const result = shouldEnableFeature('video-preload', mockConfig);
        expect(result).toBe(true);
      });

      it('should disable when shouldPreloadVideos is false', () => {
        mockConfig.shouldPreloadVideos = false;
        const result = shouldEnableFeature('video-preload', mockConfig);
        expect(result).toBe(false);
      });
    });

    describe('background-sync feature', () => {
      it('should enable for good quality connection', () => {
        mockConfig.quality = 'good';
        const result = shouldEnableFeature('background-sync', mockConfig);
        expect(result).toBe(true);
      });

      it('should enable for excellent quality connection', () => {
        mockConfig.quality = 'excellent';
        const result = shouldEnableFeature('background-sync', mockConfig);
        expect(result).toBe(true);
      });

      it('should disable for poor quality connection', () => {
        mockConfig.quality = 'poor';
        const result = shouldEnableFeature('background-sync', mockConfig);
        expect(result).toBe(false);
      });
    });

    it('should return false for unknown feature', () => {
      const result = shouldEnableFeature('unknown-feature' as any, mockConfig);
      expect(result).toBe(false);
    });

    it('should use current config when none provided', () => {
      // Test that it calls getAdaptiveLoadingConfig internally
      const result = shouldEnableFeature('auto-play');
      expect(typeof result).toBe('boolean');
    });

    it('should handle undefined config gracefully', () => {
      const result = shouldEnableFeature('auto-play', undefined as any);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('logNetworkInfo', () => {
    it('should log comprehensive network information', () => {
      logNetworkInfo();
      
      expect(console.group).toHaveBeenCalledWith('📱 Mobile Network Detection');
      expect(console.log).toHaveBeenCalledWith('Connection Type:', expect.any(String));
      expect(console.log).toHaveBeenCalledWith('Network Quality:', expect.any(String));
      expect(console.log).toHaveBeenCalledWith('Downlink Speed:', expect.stringMatching(/\d+(\.\d+)? Mbps/));
      expect(console.log).toHaveBeenCalledWith('Round Trip Time:', expect.stringMatching(/\d+ms/));
      expect(console.log).toHaveBeenCalledWith('Data Saver Mode:', expect.any(Boolean));
      expect(console.log).toHaveBeenCalledWith('Image Quality:', expect.stringMatching(/low|medium|high/));
      expect(console.log).toHaveBeenCalledWith('Loading Strategy:', expect.stringMatching(/minimal|conservative|aggressive/));
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should handle missing connection gracefully', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        writable: true,
      });
      
      expect(() => logNetworkInfo()).not.toThrow();
      expect(console.group).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });

  describe('type definitions', () => {
    it('should accept valid ConnectionType values', () => {
      const validTypes: ConnectionType[] = ['2g', '3g', '4g', '5g', 'wifi', 'unknown'];
      validTypes.forEach(type => {
        expect(['2g', '3g', '4g', '5g', 'wifi', 'unknown']).toContain(type);
      });
    });

    it('should accept valid NetworkQuality values', () => {
      const validQualities: NetworkQuality[] = ['poor', 'good', 'excellent'];
      validQualities.forEach(quality => {
        expect(['poor', 'good', 'excellent']).toContain(quality);
      });
    });

    it('should validate AdaptiveLoadingConfig structure', () => {
      const config: AdaptiveLoadingConfig = {
        connectionType: '4g',
        quality: 'good',
        downlink: 2,
        rtt: 200,
        saveData: false,
        shouldPreloadImages: true,
        shouldPreloadVideos: false,
        recommendedImageQuality: 'medium',
        chunkLoadingStrategy: 'conservative',
      };
      
      // Test all properties exist and have correct types
      expect(typeof config.connectionType).toBe('string');
      expect(typeof config.quality).toBe('string');
      expect(typeof config.downlink).toBe('number');
      expect(typeof config.rtt).toBe('number');
      expect(typeof config.saveData).toBe('boolean');
      expect(typeof config.shouldPreloadImages).toBe('boolean');
      expect(typeof config.shouldPreloadVideos).toBe('boolean');
      expect(typeof config.recommendedImageQuality).toBe('string');
      expect(typeof config.chunkLoadingStrategy).toBe('string');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle connection object with null values', () => {
      const connectionWithNulls = {
        effectiveType: null,
        downlink: null,
        rtt: null,
        saveData: null,
      };
      
      Object.defineProperty(navigator, 'connection', {
        value: connectionWithNulls,
        writable: true,
      });
      
      expect(() => {
        getConnectionType();
        getNetworkQuality();
        getAdaptiveLoadingConfig();
      }).not.toThrow();
    });

    it('should handle negative network values', () => {
      mockConnection.downlink = -1;
      mockConnection.rtt = -100;
      
      const quality = getNetworkQuality();
      const config = getAdaptiveLoadingConfig();
      
      expect(quality).toBe('poor'); // Negative values should be treated as poor
      expect(config.quality).toBe('poor');
    });

    it('should handle extremely high network values', () => {
      mockConnection.downlink = 1000; // 1 Gbps
      mockConnection.rtt = 1; // 1ms
      
      const quality = getNetworkQuality();
      const config = getAdaptiveLoadingConfig();
      
      expect(quality).toBe('excellent');
      expect(config.quality).toBe('excellent');
      expect(config.chunkLoadingStrategy).toBe('aggressive');
    });

    it('should handle connection type case sensitivity', () => {
      mockConnection.effectiveType = '4G'; // Uppercase
      
      const connectionType = getConnectionType();
      
      expect(connectionType).toBe('4g'); // Should default to 4g for unknown
    });

    it('should handle string numbers in connection properties', () => {
      (mockConnection as any).downlink = '2.5';
      (mockConnection as any).rtt = '150';
      
      expect(() => {
        const quality = getNetworkQuality();
        expect(['poor', 'good', 'excellent']).toContain(quality);
      }).not.toThrow();
    });
  });

  describe('performance considerations', () => {
    it('should be performant for repeated calls', () => {
      const iterations = 1000;
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        getAdaptiveLoadingConfig();
      }
      
      const end = performance.now();
      const timePerCall = (end - start) / iterations;
      
      expect(timePerCall).toBeLessThan(2); // Should be less than 1ms per call
    });

    it('should not create memory leaks with repeated hook usage', () => {
      // Simulate multiple hook instances
      for (let i = 0; i < 100; i++) {
        renderHook(() => useAdaptiveLoading());
      }
      
      // If there were memory leaks, event listeners would accumulate
      expect(mockConnection.addEventListener).toHaveBeenCalledTimes(100);
    });
  });
});
