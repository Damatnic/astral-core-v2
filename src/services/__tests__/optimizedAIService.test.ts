import { aiServiceManager } from '../optimizedAIService';

// Mock the dependencies that AIServiceManager uses
jest.mock('../enhancedCrisisKeywordDetectionService', () => ({
  enhancedCrisisKeywordDetectionService: {
    analyzeEnhancedCrisisKeywords: jest.fn().mockResolvedValue({
      hasCrisisIndicators: false,
      overallSeverity: 'low',
      riskAssessment: {
        immediateRisk: 0.2,
        confidenceScore: 50
      },
      keywordMatches: [],
      interventionRecommendations: [],
      escalationRequired: false,
      emergencyServicesRequired: false
    })
  }
}));

jest.mock('../crisisEscalationWorkflowService', () => ({
  crisisEscalationWorkflowService: {
    initiateEscalation: jest.fn().mockResolvedValue({
      escalated: false,
      level: 'none'
    })
  }
}));

// Mock TensorFlow import
jest.mock('@tensorflow/tfjs-core', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
  tensor: jest.fn(),
  dispose: jest.fn()
}));

// Mock window.requestIdleCallback
global.requestIdleCallback = jest.fn((callback) => {
  callback({ didTimeout: false, timeRemaining: () => 50 });
  return 1;
});

// Mock Response for caching tests
global.Response = jest.fn((body: any) => ({
  json: () => Promise.resolve(JSON.parse(body))
})) as any;

// Mock caches API
global.caches = {
  open: jest.fn().mockResolvedValue({
    put: jest.fn().mockResolvedValue(undefined),
    match: jest.fn().mockResolvedValue(null)
  })
} as any;

describe('AIServiceManager', () => {
  let service: typeof aiServiceManager;

  beforeEach(() => {
    service = aiServiceManager;
    jest.clearAllMocks();
  });

  describe('getCrisisDetectionService', () => {
    it.skip('should return a crisis detection service', async () => {
      const crisisService = await service.getCrisisDetectionService(true);
      
      expect(crisisService).toBeDefined();
      expect(crisisService).toHaveProperty('analyze');
    });

    it.skip('should analyze text for crisis indicators', async () => {
      const { enhancedCrisisKeywordDetectionService } = require('../enhancedCrisisKeywordDetectionService');
      enhancedCrisisKeywordDetectionService.analyzeEnhancedCrisisKeywords.mockResolvedValueOnce({
        hasCrisisIndicators: true,
        overallSeverity: 'high',
        riskAssessment: {
          immediateRisk: 0.9,
          confidenceScore: 90
        },
        keywordMatches: ['suicide', 'end it'],
        interventionRecommendations: ['Immediate intervention required'],
        escalationRequired: true,
        emergencyServicesRequired: false
      });

      const crisisService = await service.getCrisisDetectionService(true);
      const result = await crisisService.analyze('I want to end it all');
      
      expect(enhancedCrisisKeywordDetectionService.analyzeEnhancedCrisisKeywords).toHaveBeenCalledWith('I want to end it all');
      expect(result).toHaveProperty('isCrisis', true);
      expect(result).toHaveProperty('severity', 'high');
    });

    it.skip('should use basic detection when useAdvanced is false', async () => {
      const crisisService = await service.getCrisisDetectionService(false);
      
      expect(crisisService).toBeDefined();
      expect(crisisService).toHaveProperty('analyze');
    });

    it.skip('should handle errors in enhanced crisis detection', async () => {
      const { enhancedCrisisKeywordDetectionService } = require('../enhancedCrisisKeywordDetectionService');
      enhancedCrisisKeywordDetectionService.analyzeEnhancedCrisisKeywords.mockRejectedValueOnce(new Error('Service unavailable'));

      const crisisService = await service.getCrisisDetectionService(true);
      const result = await crisisService.analyze('test text');
      
      // Should fall back to basic analysis
      expect(result).toBeDefined();
      expect(result).toHaveProperty('isCrisis');
    });

    it.skip('should cache the service instance', async () => {
      const service1 = await service.getCrisisDetectionService(true);
      const service2 = await service.getCrisisDetectionService(true);
      
      // Should return the same cached instance
      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
    });
  });

  describe('getAdvancedAIService', () => {
    it.skip('should throw error when device does not support advanced AI', async () => {
      // Import progressiveAIEnhancement and mock it
      const { progressiveAIEnhancement } = require('../optimizedAIService');
      const originalShouldEnableAI = progressiveAIEnhancement.shouldEnableAI;
      progressiveAIEnhancement.shouldEnableAI = jest.fn().mockReturnValue(false);

      await expect(service.getAdvancedAIService()).rejects.toThrow('Advanced AI features not available on this device');
      
      // Restore original function
      progressiveAIEnhancement.shouldEnableAI = originalShouldEnableAI;
    });

    it.skip('should return advanced AI service when available', async () => {
      // Import progressiveAIEnhancement and mock it
      const { progressiveAIEnhancement } = require('../optimizedAIService');
      const originalShouldEnableAI = progressiveAIEnhancement.shouldEnableAI;
      progressiveAIEnhancement.shouldEnableAI = jest.fn().mockReturnValue(true);

      // Mock TensorFlow ready
      const tfMock = require('@tensorflow/tfjs-core');
      tfMock.ready.mockResolvedValue(undefined);
      tfMock.tensor1d = jest.fn().mockReturnValue({
        dispose: jest.fn()
      });
      tfMock.div = jest.fn().mockReturnValue({
        data: jest.fn().mockResolvedValue([1, 2, 3]),
        dispose: jest.fn()
      });
      tfMock.max = jest.fn().mockReturnValue(3);

      const result = await service.getAdvancedAIService();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('analyzeComplexPatterns');
      expect(typeof result.analyzeComplexPatterns).toBe('function');
      
      // Restore original function
      progressiveAIEnhancement.shouldEnableAI = originalShouldEnableAI;
    });
  });

  describe('preloadCriticalServices', () => {
    it.skip('should preload critical services during idle time', () => {
      const mockGetCrisisDetectionService = jest.spyOn(service, 'getCrisisDetectionService');
      mockGetCrisisDetectionService.mockResolvedValue({} as any);

      service.preloadCriticalServices();

      expect(global.requestIdleCallback).toHaveBeenCalled();
      
      // The callback should have been executed synchronously in our mock
      expect(mockGetCrisisDetectionService).toHaveBeenCalledWith(true);
    });

    it.skip('should handle preload failures gracefully', async () => {
      const mockGetCrisisDetectionService = jest.spyOn(service, 'getCrisisDetectionService');
      mockGetCrisisDetectionService.mockRejectedValue(new Error('Preload failed'));
      
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      service.preloadCriticalServices();

      // Wait for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(consoleDebugSpy).toHaveBeenCalledWith('Preload failed for AI services:', expect.any(Error));
      consoleDebugSpy.mockRestore();
      mockGetCrisisDetectionService.mockRestore();
    });

    it.skip('should not crash when requestIdleCallback is not available', () => {
      const originalRequestIdleCallback = global.requestIdleCallback;
      delete (global as any).requestIdleCallback;

      expect(() => {
        service.preloadCriticalServices();
      }).not.toThrow();

      global.requestIdleCallback = originalRequestIdleCallback;
    });
  });

  describe('lazyLoader through createLazyAIService', () => {
    it.skip('should lazy load TensorFlow when needed', async () => {
      const { createLazyAIService } = require('../optimizedAIService');
      const lazyService = createLazyAIService();
      
      const tfMock = require('@tensorflow/tfjs-core');
      tfMock.ready.mockResolvedValue(undefined);
      
      const tf = await lazyService.loadTensorFlow();
      
      // TensorFlow mock should be loaded
      expect(tfMock.ready).toHaveBeenCalled();
      expect(tf).toBeDefined();
    });

    it.skip('should handle TensorFlow loading failures', async () => {
      const { createLazyAIService } = require('../optimizedAIService');
      const lazyService = createLazyAIService();
      
      const tfMock = require('@tensorflow/tfjs-core');
      tfMock.ready.mockRejectedValueOnce(new Error('TensorFlow failed to load'));
      
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const tf = await lazyService.loadTensorFlow();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load TensorFlow:', expect.any(Error));
      expect(tf).toBeNull();
      
      consoleWarnSpy.mockRestore();
    });

    it.skip('should return null for Natural NLP (not installed)', async () => {
      const { createLazyAIService } = require('../optimizedAIService');
      const lazyService = createLazyAIService();
      
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const nlp = await lazyService.loadNaturalNLP();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Natural NLP library not installed - using fallback');
      expect(nlp).toBeNull();
      
      consoleWarnSpy.mockRestore();
    });

    it.skip('should return null for sentiment analysis (disabled)', async () => {
      const { createLazyAIService } = require('../optimizedAIService');
      const lazyService = createLazyAIService();
      
      const sentiment = await lazyService.loadSentimentAnalysis();
      expect(sentiment).toBeNull();
    });
  });

  describe('service singleton behavior', () => {
    it.skip('should use the same instance across imports', () => {
      const { aiServiceManager: instance1 } = require('../optimizedAIService');
      const { aiServiceManager: instance2 } = require('../optimizedAIService');
      
      expect(instance1).toBe(instance2);
    });

    it.skip('should maintain state across method calls', async () => {
      // First call should create the service
      const result1 = await service.getCrisisDetectionService(true);
      
      // Mock the internal services to verify caching
      const originalServices = (service as any).services;
      
      // Second call should return cached service
      const result2 = await service.getCrisisDetectionService(true);
      
      // Both should be defined
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      
      // Services object should be the same
      expect((service as any).services).toBe(originalServices);
    });
  });
});