// AI Services Lazy Loading Configuration
// Optimizes heavy AI/ML dependencies for better performance

// Import enhanced crisis detection service
import { enhancedCrisisKeywordDetectionService } from './enhancedCrisisKeywordDetectionService';
// Import crisis escalation workflow service
import { crisisEscalationWorkflowService } from './crisisEscalationWorkflowService';

// Lazy-loaded AI service modules
export const createLazyAIService = () => {
  let tensorflowPromise: Promise<unknown> | null = null;

  return {
    // Lazy load TensorFlow.js only when needed
    async loadTensorFlow() {
      tensorflowPromise ??= import('@tensorflow/tfjs-core').then(async (tf) => {
        // WebGL backend not installed - using default backend
        // await import('@tensorflow/tfjs-backend-webgl');
        await tf.ready();
        return tf;
      }).catch(error => {
        console.warn('Failed to load TensorFlow:', error);
        return null;
      });
      return tensorflowPromise;
    },

    // Lazy load Natural NLP with specific modules only
    async loadNaturalNLP() {
      // Natural library not installed - returning null
      console.warn('Natural NLP library not installed - using fallback');
      return null;
    },

    // Lazy load sentiment analysis (disabled due to missing types)
    async loadSentimentAnalysis() {
      return null; // Fallback for missing sentiment library
    },

    // Enhanced crisis detection with comprehensive analysis and escalation workflow
    async getCrisisDetectionService() {
      // Use the enhanced crisis keyword detection service for better accuracy
      return {
        analyze: async (text: string, userContext?: any) => {
          try {
            // Use the comprehensive enhanced crisis detection
            const enhancedResult = await enhancedCrisisKeywordDetectionService.analyzeEnhancedCrisisKeywords(text);
            
            // Fallback to basic sentiment analysis if enhanced service fails
            if (!enhancedResult) {
              const [sentiment] = await Promise.all([
                this.loadSentimentAnalysis()
              ]);
              const sentimentModule = sentiment as { default?: (text: string) => { score: number; comparative: number } } | null;
              if (sentimentModule?.default) {
                const basicResult = sentimentModule.default(text);
                return {
                  score: basicResult.score,
                  comparative: basicResult.comparative,
                  isCrisis: basicResult.score < -3 || basicResult.comparative < -0.5,
                  severity: 'low',
                  enhanced: false
                };
              } else {
                // Fallback when sentiment analysis is unavailable
                return {
                  score: 0,
                  comparative: 0,
                  isCrisis: false,
                  severity: 'low',
                  enhanced: false
                };
              }
            }

            // Trigger crisis escalation workflow for severe cases
            let escalationResponse = null;
            if (enhancedResult.escalationRequired && userContext) {
              try {
                escalationResponse = await this.triggerCrisisEscalation(enhancedResult, userContext, text);
              } catch (escalationError) {
                console.error('Crisis escalation failed:', escalationError);
                // Continue with analysis even if escalation fails
              }
            }

            // Return enhanced result with additional context
            return {
              score: enhancedResult.riskAssessment.immediateRisk,
              comparative: enhancedResult.riskAssessment.confidenceScore / 100,
              isCrisis: enhancedResult.hasCrisisIndicators,
              severity: enhancedResult.overallSeverity,
              riskAssessment: enhancedResult.riskAssessment,
              keywordMatches: enhancedResult.keywordMatches,
              interventionRecommendations: enhancedResult.interventionRecommendations,
              escalationRequired: enhancedResult.escalationRequired,
              emergencyServicesRequired: enhancedResult.emergencyServicesRequired,
              escalationResponse: escalationResponse,
              enhanced: true
            };
          } catch (error) {
            console.error('Enhanced crisis detection failed, falling back to basic:', error);
            // Fallback to basic sentiment analysis
            const [sentiment] = await Promise.all([
              this.loadSentimentAnalysis()
            ]);
            const sentimentModule = sentiment as { default?: (text: string) => { score: number; comparative: number } } | null;
            if (sentimentModule?.default) {
              const basicResult = sentimentModule.default(text);
              return {
                score: basicResult.score,
                comparative: basicResult.comparative,
                isCrisis: basicResult.score < -3 || basicResult.comparative < -0.5,
                severity: 'low',
                enhanced: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            } else {
              return {
                score: 0,
                comparative: 0,
                isCrisis: false,
                severity: 'low',
                enhanced: false,
                error: 'Sentiment analysis unavailable'
              };
            }
          }
        }
      };
    },

    // Helper method to trigger crisis escalation workflow
    async triggerCrisisEscalation(crisisAnalysis: any, userContext: any, _originalText: string) {
      try {
        // Prepare user context for escalation
        const escalationUserContext = {
          languageCode: userContext.languageCode || 'en',
          culturalContext: userContext.culturalContext,
          accessibilityNeeds: userContext.accessibilityNeeds || [],
          preferredContactMethod: userContext.preferredContactMethod || 'chat',
          timeZone: userContext.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: userContext.location
        };

        // Prepare session data for escalation
        const escalationSessionData = {
          conversationId: userContext.conversationId || 'unknown',
          messagesSent: userContext.messagesSent || 1,
          sessionDuration: userContext.sessionDuration || 0,
          previousEscalations: userContext.previousEscalations || 0,
          riskTrend: userContext.riskTrend || 'increasing'
        };

        // Initiate crisis escalation with correct parameters
        return await crisisEscalationWorkflowService.initiateCrisisEscalation(
          crisisAnalysis,
          userContext.userId || 'anonymous',
          escalationUserContext,
          escalationSessionData
        );
      } catch (error) {
        console.error('Failed to trigger crisis escalation:', error);
        throw error;
      }
    },

    // Advanced AI features with TensorFlow (lazy loaded)
    async getAdvancedAIService() {
      const tf = await this.loadTensorFlow();
      
      return {
        // Only load when advanced AI features are actually needed
        analyzeComplexPatterns: async (data: number[]) => {
          // Simplified TensorFlow usage
          if (!tf || typeof tf !== 'object' || !('tensor1d' in tf)) {
            throw new Error('TensorFlow not properly loaded');
          }
          const tfTyped = tf as any; // Type assertion for TensorFlow
          const tensor = tfTyped.tensor1d(data);
          const normalized = tfTyped.div(tensor, tfTyped.max(tensor));
          const result = await normalized.data();
          tensor.dispose();
          normalized.dispose();
          return Array.from(result);
        }
      };
    }
  };
};

// Service worker optimization for AI caching
export const aiCacheStrategy = {
  // Cache AI model results for offline use
  cacheAIResults: async (key: string, result: any) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('ai-results-v1');
        const response = new Response(JSON.stringify(result));
        await cache.put(key, response);
      } catch (error) {
        console.warn('Failed to cache AI result:', error);
      }
    }
  },

  // Retrieve cached AI results
  getCachedAIResult: async (key: string) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('ai-results-v1');
        const response = await cache.match(key);
        if (response) {
          return await response.json();
        }
      } catch (error) {
        console.warn('Failed to retrieve cached AI result:', error);
      }
    }
    return null;
  }
};

// Progressive enhancement for AI features
export const progressiveAIEnhancement = {
  // Check if AI features should be enabled based on device capabilities
  shouldEnableAI: () => {
    // Extended Navigator interface for device capabilities
    const navigatorExt = navigator as Navigator & { 
      memory?: number; 
      hardwareConcurrency?: number 
    };
    const { memory, hardwareConcurrency } = navigatorExt;
    const hasGoodMemory = !memory || memory >= 4; // 4GB+ RAM
    const hasMultipleCores = !hardwareConcurrency || hardwareConcurrency >= 2;
    const isOnline = navigator.onLine;
    
    return hasGoodMemory && hasMultipleCores && isOnline;
  },

  // Fallback implementations for low-powered devices
  getBasicCrisisDetection: () => {
    // Simple keyword-based detection for fallback
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'want to die',
      'hurt myself', 'self harm', 'overdose', 'can\'t go on'
    ];

    return {
      analyze: (text: string) => {
        const lowerText = text.toLowerCase();
        const foundKeywords = crisisKeywords.filter(keyword => 
          lowerText.includes(keyword)
        );
        
        return {
          score: foundKeywords.length > 0 ? -5 : 0,
          comparative: foundKeywords.length * -0.8,
          isCrisis: foundKeywords.length > 0,
          method: 'keyword-based'
        };
      }
    };
  }
};

// AI Service Manager with smart loading
export class AIServiceManager {
  private readonly services: any = {};
  private readonly lazyLoader = createLazyAIService();

  async getCrisisDetectionService(useAdvanced = true) {
    const cacheKey = `crisis-detection-${useAdvanced ? 'enhanced' : 'basic'}`;
    
    // Check cache first
    let cached = await aiCacheStrategy.getCachedAIResult(cacheKey);
    if (cached?.timestamp && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return cached.service;
    }

    // Always try to use enhanced crisis detection first for safety
    if (useAdvanced) {
      try {
        if (!this.services.enhancedCrisis) {
          this.services.enhancedCrisis = await this.lazyLoader.getCrisisDetectionService();
        }
        // Cache the service
        await aiCacheStrategy.cacheAIResults(cacheKey, this.services.enhancedCrisis);
        return this.services.enhancedCrisis;
      } catch (error) {
        console.error('Enhanced crisis detection unavailable, falling back to basic:', error);
        // Fall back to basic detection
      }
    }
    
    // Use basic fallback for low-powered devices or when enhanced fails
    if (!this.services.basicCrisis) {
      this.services.basicCrisis = progressiveAIEnhancement.getBasicCrisisDetection();
    }
    // Cache the fallback service
    await aiCacheStrategy.cacheAIResults(`crisis-detection-basic`, this.services.basicCrisis);
    return this.services.basicCrisis;
  }

  async getAdvancedAIService() {
    if (!progressiveAIEnhancement.shouldEnableAI()) {
      throw new Error('Advanced AI features not available on this device');
    }

    if (!this.services.advancedAI) {
      this.services.advancedAI = await this.lazyLoader.getAdvancedAIService();
    }
    return this.services.advancedAI;
  }

  // Preload critical AI services during idle time
  preloadCriticalServices() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        try {
          // Preload enhanced crisis detection (with fallback to basic)
          await this.getCrisisDetectionService(true);
          
          // Preload advanced services only on capable devices
          if (progressiveAIEnhancement.shouldEnableAI()) {
            setTimeout(() => {
              this.lazyLoader.loadSentimentAnalysis().catch(() => {
                // Silently fail for preloading
              });
            }, 2000);
          }
        } catch (error) {
          console.debug('Preload failed for AI services:', error);
        }
      });
    }
  }
}

// Export singleton instance
export const aiServiceManager = new AIServiceManager();

// Initialize preloading
if (typeof window !== 'undefined') {
  aiServiceManager.preloadCriticalServices();
}

export default {
  createLazyAIService,
  aiCacheStrategy,
  progressiveAIEnhancement,
  AIServiceManager,
  aiServiceManager
};
