// AI-powered mood detection and analysis service

import React from 'react';

export interface MoodAnalysis {
  primary: MoodType;
  secondary?: MoodType;
  intensity: number; // 0-1
  confidence: number; // 0-1
  keywords: string[];
  suggestions: string[];
  timestamp: number;
}

export type MoodType = 
  | 'happy' | 'sad' | 'anxious' | 'angry' | 'excited' | 'calm' 
  | 'frustrated' | 'hopeful' | 'lonely' | 'grateful' | 'overwhelmed'
  | 'peaceful' | 'worried' | 'content' | 'stressed' | 'optimistic';

export interface MoodPattern {
  period: 'daily' | 'weekly' | 'monthly';
  dominant_moods: { mood: MoodType; frequency: number }[];
  trends: {
    improving: boolean;
    stability: number; // 0-1
    volatility: number; // 0-1
  };
  triggers: string[];
  recommendations: string[];
}

export interface PersonalizedRecommendation {
  type: 'activity' | 'resource' | 'technique' | 'professional';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'immediate' | 'daily' | 'weekly' | 'long_term';
  reasoning: string;
}

class MoodAnalysisService {
  private moodKeywords: Record<MoodType, string[]> = {
    happy: ['joy', 'excited', 'cheerful', 'delighted', 'elated', 'upbeat', 'positive', 'bright'],
    sad: ['down', 'depressed', 'melancholy', 'blue', 'gloomy', 'dejected', 'sorrowful', 'tearful'],
    anxious: ['worried', 'nervous', 'uneasy', 'tense', 'restless', 'apprehensive', 'fearful', 'panic'],
    angry: ['mad', 'furious', 'irritated', 'annoyed', 'rage', 'frustrated', 'hostile', 'livid'],
    excited: ['thrilled', 'enthusiastic', 'energetic', 'pumped', 'eager', 'animated', 'exhilarated'],
    calm: ['peaceful', 'serene', 'tranquil', 'relaxed', 'composed', 'centered', 'balanced', 'still'],
    frustrated: ['annoyed', 'exasperated', 'aggravated', 'vexed', 'irked', 'bothered', 'fed up'],
    hopeful: ['optimistic', 'confident', 'positive', 'encouraged', 'uplifted', 'inspired', 'motivated'],
    lonely: ['isolated', 'alone', 'disconnected', 'abandoned', 'solitary', 'empty', 'withdrawn'],
    grateful: ['thankful', 'appreciative', 'blessed', 'fortunate', 'indebted', 'humble', 'content'],
    overwhelmed: ['stressed', 'swamped', 'buried', 'exhausted', 'drowning', 'overloaded', 'burnt out'],
    peaceful: ['serene', 'tranquil', 'harmonious', 'quiet', 'undisturbed', 'placid', 'zen'],
    worried: ['concerned', 'troubled', 'distressed', 'bothered', 'preoccupied', 'anxious', 'uneasy'],
    content: ['satisfied', 'fulfilled', 'at peace', 'comfortable', 'pleased', 'happy', 'settled'],
    stressed: ['pressured', 'tense', 'strained', 'overwhelmed', 'anxious', 'frazzled', 'wound up'],
    optimistic: ['hopeful', 'positive', 'confident', 'upbeat', 'encouraging', 'bright', 'sunny']
  };

  private moodSuggestions: Record<MoodType, string[]> = {
    happy: [
      'Share your joy with others - it\'s contagious!',
      'Capture this moment in your journal',
      'Use this positive energy for something creative',
      'Practice gratitude to maintain this feeling'
    ],
    sad: [
      'It\'s okay to feel sad - allow yourself to process these emotions',
      'Try gentle movement like a short walk',
      'Reach out to a trusted friend or family member',
      'Consider talking to a counselor if this persists'
    ],
    anxious: [
      'Practice deep breathing exercises',
      'Try the 5-4-3-2-1 grounding technique',
      'Limit caffeine and get some fresh air',
      'Consider meditation or mindfulness practices'
    ],
    angry: [
      'Take deep breaths before responding',
      'Try physical exercise to release tension',
      'Journal about what triggered this feeling',
      'Practice assertive communication when ready'
    ],
    excited: [
      'Channel this energy into something productive',
      'Share your enthusiasm with supportive people',
      'Set realistic expectations to avoid disappointment',
      'Use this motivation to tackle important tasks'
    ],
    calm: [
      'Enjoy this peaceful moment',
      'Practice mindfulness to maintain this state',
      'Use this clarity for important decisions',
      'Share techniques that work for you with others'
    ],
    frustrated: [
      'Step back and identify the root cause',
      'Break down the problem into smaller parts',
      'Take a short break to reset your perspective',
      'Ask for help if you need it'
    ],
    hopeful: [
      'Use this optimism to set meaningful goals',
      'Share your hope with others who might need it',
      'Take concrete steps toward your aspirations',
      'Document what\'s making you feel hopeful'
    ],
    lonely: [
      'Reach out to someone you care about',
      'Join a community activity or online group',
      'Practice self-compassion',
      'Consider volunteering to connect with others'
    ],
    grateful: [
      'Write down what you\'re grateful for',
      'Express thanks to someone who made a difference',
      'Use this positive energy to help others',
      'Practice gratitude meditation'
    ],
    overwhelmed: [
      'Prioritize your tasks - what\'s truly urgent?',
      'Delegate or ask for help where possible',
      'Take regular breaks throughout your day',
      'Practice saying no to non-essential commitments'
    ],
    peaceful: [
      'Savor this tranquil moment',
      'Practice mindfulness to extend this feeling',
      'Use this clarity for reflection or planning',
      'Share what brings you peace with others'
    ],
    worried: [
      'Identify what you can and cannot control',
      'Write down your concerns to externalize them',
      'Practice relaxation techniques',
      'Talk to someone you trust about your worries'
    ],
    content: [
      'Appreciate this sense of satisfaction',
      'Reflect on what contributed to this feeling',
      'Use this stability to support others',
      'Maintain healthy routines that support this state'
    ],
    stressed: [
      'Identify your stress triggers',
      'Practice stress-reduction techniques',
      'Ensure you\'re getting enough sleep and exercise',
      'Consider if you need to adjust your workload'
    ],
    optimistic: [
      'Use this positive outlook to set goals',
      'Share your optimism to inspire others',
      'Take action on opportunities you see',
      'Document what\'s fueling your optimism'
    ]
  };

  private intensityWords = {
    high: ['extremely', 'very', 'incredibly', 'absolutely', 'completely', 'totally', 'utterly'],
    medium: ['quite', 'fairly', 'pretty', 'somewhat', 'rather', 'moderately'],
    low: ['slightly', 'a bit', 'a little', 'mildly', 'barely', 'hardly']
  };

  public analyzeMood(text: string): MoodAnalysis {
    const words = this.tokenize(text.toLowerCase());
    const moodScores: Record<MoodType, number> = {} as Record<MoodType, number>;
    const detectedKeywords: string[] = [];
    
    // Initialize scores
    Object.keys(this.moodKeywords).forEach(mood => {
      moodScores[mood as MoodType] = 0;
    });

    // Analyze sentiment and mood indicators
    words.forEach((word, index) => {
      Object.entries(this.moodKeywords).forEach(([mood, keywords]) => {
        if (keywords.includes(word)) {
          let score = 1;
          
          // Check for intensity modifiers
          if (index > 0) {
            const prevWord = words[index - 1];
            if (this.intensityWords.high.includes(prevWord)) score *= 2;
            else if (this.intensityWords.medium.includes(prevWord)) score *= 1.5;
            else if (this.intensityWords.low.includes(prevWord)) score *= 0.5;
          }
          
          moodScores[mood as MoodType] += score;
          detectedKeywords.push(word);
        }
      });
    });

    // Find primary and secondary moods
    const sortedMoods = Object.entries(moodScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    if (sortedMoods.length === 0) {
      // Default neutral analysis
      return {
        primary: 'content',
        intensity: 0.3,
        confidence: 0.2,
        keywords: [],
        suggestions: ['Consider sharing more about how you\'re feeling'],
        timestamp: Date.now()
      };
    }

    const [primaryMood, primaryScore] = sortedMoods[0];
    const secondaryMood = sortedMoods.length > 1 ? sortedMoods[1][0] : undefined;
    
    // Calculate intensity and confidence
    const totalScore = Object.values(moodScores).reduce((sum, score) => sum + score, 0);
    const intensity = Math.min(primaryScore / words.length, 1);
    const confidence = primaryScore / totalScore;

    return {
      primary: primaryMood as MoodType,
      secondary: secondaryMood as MoodType,
      intensity,
      confidence,
      keywords: detectedKeywords,
      suggestions: this.moodSuggestions[primaryMood as MoodType] || [],
      timestamp: Date.now()
    };
  }

  public analyzePattern(analyses: MoodAnalysis[]): MoodPattern {
    if (analyses.length === 0) {
      return {
        period: 'weekly',
        dominant_moods: [],
        trends: { improving: true, stability: 0.5, volatility: 0.5 },
        triggers: [],
        recommendations: []
      };
    }

    // Count mood frequencies
    const moodCounts: Record<string, number> = {};
    analyses.forEach(analysis => {
      moodCounts[analysis.primary] = (moodCounts[analysis.primary] || 0) + 1;
      if (analysis.secondary) {
        moodCounts[analysis.secondary] = (moodCounts[analysis.secondary] || 0) + 0.5;
      }
    });

    const dominant_moods = Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood: mood as MoodType, frequency: count / analyses.length }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    // Analyze trends
    const recentAnalyses = analyses.slice(-7); // Last 7 entries
    const olderAnalyses = analyses.slice(-14, -7); // Previous 7 entries
    
    const getAverageIntensity = (items: MoodAnalysis[]) => 
      items.reduce((sum, item) => sum + item.intensity, 0) / items.length;

    const recentIntensity = getAverageIntensity(recentAnalyses);
    const olderIntensity = olderAnalyses.length > 0 ? getAverageIntensity(olderAnalyses) : recentIntensity;
    
    const improving = recentIntensity >= olderIntensity;
    
    // Calculate stability (consistency of mood)
    const intensityVariance = this.calculateVariance(analyses.map(a => a.intensity));
    const stability = Math.max(0, 1 - intensityVariance);
    
    // Calculate volatility (frequency of mood changes)
    let moodChanges = 0;
    for (let i = 1; i < analyses.length; i++) {
      if (analyses[i].primary !== analyses[i - 1].primary) {
        moodChanges++;
      }
    }
    const volatility = Math.min(1, moodChanges / analyses.length);

    return {
      period: 'weekly',
      dominant_moods,
      trends: { improving, stability, volatility },
      triggers: this.identifyTriggers(analyses),
      recommendations: this.generateRecommendations(dominant_moods, { improving, stability, volatility })
    };
  }

  public generatePersonalizedRecommendations(
    moodPattern: MoodPattern,
    _userPreferences?: any
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];
    
    // Based on dominant moods
    moodPattern.dominant_moods.forEach(({ mood, frequency }) => {
      if (frequency > 0.3) { // If mood appears in >30% of entries
        switch (mood) {
          case 'anxious':
          case 'worried':
          case 'stressed':
            recommendations.push({
              type: 'technique',
              title: 'Daily Mindfulness Practice',
              description: 'Practice 10 minutes of mindfulness meditation each morning',
              priority: 'high',
              category: 'daily',
              reasoning: `You've been experiencing ${mood} feelings frequently. Mindfulness can help manage anxiety.`
            });
            break;
            
          case 'sad':
          case 'lonely':
            recommendations.push({
              type: 'activity',
              title: 'Social Connection',
              description: 'Reach out to a friend or join a community activity',
              priority: 'medium',
              category: 'weekly',
              reasoning: `Your mood patterns suggest you might benefit from more social connection.`
            });
            break;
            
          case 'angry':
          case 'frustrated':
            recommendations.push({
              type: 'activity',
              title: 'Physical Exercise',
              description: 'Try 20-30 minutes of physical activity to release tension',
              priority: 'high',
              category: 'daily',
              reasoning: `Physical activity can help process and release feelings of ${mood}.`
            });
            break;
        }
      }
    });

    // Based on trends
    if (moodPattern.trends.volatility > 0.7) {
      recommendations.push({
        type: 'technique',
        title: 'Mood Tracking',
        description: 'Keep a detailed mood journal to identify patterns and triggers',
        priority: 'medium',
        category: 'daily',
        reasoning: 'Your mood patterns show high volatility. Tracking can help identify triggers.'
      });
    }

    if (moodPattern.trends.stability < 0.3) {
      recommendations.push({
        type: 'professional',
        title: 'Professional Support',
        description: 'Consider speaking with a mental health professional',
        priority: 'high',
        category: 'immediate',
        reasoning: 'Your mood patterns suggest you might benefit from professional guidance.'
      });
    }

    return recommendations;
  }

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  private identifyTriggers(analyses: MoodAnalysis[]): string[] {
    // This would analyze keywords that commonly appear before negative moods
    
    // Simple implementation - look for common keywords in negative mood entries
    const negativeMoods = ['sad', 'anxious', 'angry', 'frustrated', 'overwhelmed', 'stressed'];
    const negativeEntries = analyses.filter(a => negativeMoods.includes(a.primary));
    
    const keywordCounts: Record<string, number> = {};
    negativeEntries.forEach(entry => {
      entry.keywords.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    });

    return Object.entries(keywordCounts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }

  private generateRecommendations(
    dominantMoods: { mood: MoodType; frequency: number }[],
    trends: { improving: boolean; stability: number; volatility: number }
  ): string[] {
    const recommendations: string[] = [];
    
    if (!trends.improving) {
      recommendations.push('Consider reaching out for support from friends, family, or professionals');
    }
    
    if (trends.stability < 0.5) {
      recommendations.push('Focus on establishing consistent daily routines');
    }
    
    if (trends.volatility > 0.6) {
      recommendations.push('Practice grounding techniques during emotional transitions');
    }

    // Add mood-specific recommendations
    dominantMoods.forEach(({ mood }) => {
      if (mood === 'stressed' || mood === 'overwhelmed') {
        recommendations.push('Consider time management and stress reduction techniques');
      }
      if (mood === 'lonely' || mood === 'sad') {
        recommendations.push('Prioritize social connections and community involvement');
      }
    });

    return recommendations;
  }

  // Storage methods
  public async saveMoodAnalysis(analysis: MoodAnalysis) {
    const { getSecureStorage } = await import('./secureStorageService');
    const secureStorage = getSecureStorage();
    
    const stored = await this.getMoodHistory();
    stored.push(analysis);
    
    // Keep only last 100 analyses
    if (stored.length > 100) {
      stored.splice(0, stored.length - 100);
    }
    
    await secureStorage.setItem('mood_analyses', JSON.stringify(stored));
  }

  public async getMoodHistory(): Promise<MoodAnalysis[]> {
    const { getSecureStorage } = await import('./secureStorageService');
    const secureStorage = getSecureStorage();
    
    const stored = await secureStorage.getItem('mood_analyses');
    return stored ? JSON.parse(stored) : [];
  }

  public async clearMoodHistory() {
    const { getSecureStorage } = await import('./secureStorageService');
    const secureStorage = getSecureStorage();
    
    secureStorage.removeItem('mood_analyses');
  }
}

// React hooks
export const useMoodAnalysis = () => {
  const [service] = React.useState(() => new MoodAnalysisService());
  const [moodHistory, setMoodHistory] = React.useState<MoodAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    service.getMoodHistory().then(setMoodHistory);
  }, [service]);

  const analyzeMood = React.useCallback(async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = service.analyzeMood(text);
      await service.saveMoodAnalysis(analysis);
      const updatedHistory = await service.getMoodHistory();
      setMoodHistory(updatedHistory);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [service]);

  const getMoodPattern = React.useCallback(() => {
    return service.analyzePattern(moodHistory);
  }, [service, moodHistory]);

  const getRecommendations = React.useCallback(() => {
    const pattern = getMoodPattern();
    return service.generatePersonalizedRecommendations(pattern);
  }, [service, getMoodPattern]);

  return {
    analyzeMood,
    getMoodPattern,
    getRecommendations,
    moodHistory,
    isAnalyzing,
    error,
    clearHistory: async () => {
      await service.clearMoodHistory();
      setMoodHistory([]);
    }
  };
};

// Singleton instance
let moodAnalysisServiceInstance: MoodAnalysisService | null = null;

export const getMoodAnalysisService = () => {
  if (!moodAnalysisServiceInstance) {
    moodAnalysisServiceInstance = new MoodAnalysisService();
  }
  return moodAnalysisServiceInstance;
};

export default MoodAnalysisService;