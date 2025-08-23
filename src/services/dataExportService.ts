// Data export service for GDPR compliance and user data portability

import React from 'react';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includePersonalData: boolean;
  includeMoodData: boolean;
  includeActivityData: boolean;
  includeChatHistory: boolean;
  includeReflections: boolean;
  includeSettings: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface UserDataExport {
  metadata: {
    exportDate: string;
    userId?: string;
    version: string;
    format: string;
    dataTypes: string[];
  };
  personalData?: {
    preferences: any;
    settings: any;
    profile: any;
  };
  moodData?: {
    analyses: unknown[];
    patterns: any;
    trends: any;
  };
  activityData?: {
    posts: unknown[];
    interactions: unknown[];
    gamification: any;
  };
  chatHistory?: {
    aiSessions: unknown[];
    peerChats: unknown[];
  };
  reflections?: unknown[];
}

class DataExportService {
  private readonly EXPORT_VERSION = '1.0.0';

  public async exportUserData(options: ExportOptions): Promise<Blob> {
    const exportData = await this.gatherUserData(options);
    
    switch (options.format) {
      case 'json':
        return this.exportAsJSON(exportData);
      case 'csv':
        return this.exportAsCSV(exportData);
      case 'pdf':
        return this.exportAsPDF(exportData);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private async gatherUserData(options: ExportOptions): Promise<UserDataExport> {
    const exportData: UserDataExport = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: this.EXPORT_VERSION,
        format: options.format,
        dataTypes: []
      }
    };

    // Add user ID if available
    const userId = localStorage.getItem('userId');
    if (userId && options.includePersonalData) {
      exportData.metadata.userId = userId;
    }

    // Gather personal data
    if (options.includePersonalData) {
      exportData.personalData = {
        preferences: this.getStoredData('userPreferences'),
        settings: this.getStoredData('userSettings'),
        profile: this.getStoredData('userProfile')
      };
      exportData.metadata.dataTypes.push('personal');
    }

    // Gather mood data
    if (options.includeMoodData) {
      const moodAnalyses = this.getStoredData('mood_analyses') || [];
      const filteredMoodData = this.filterByDateRange(moodAnalyses, options.dateRange);
      
      exportData.moodData = {
        analyses: filteredMoodData,
        patterns: this.calculateMoodPatterns(filteredMoodData),
        trends: this.calculateMoodTrends(filteredMoodData)
      };
      exportData.metadata.dataTypes.push('mood');
    }

    // Gather activity data
    if (options.includeActivityData) {
      exportData.activityData = {
        posts: this.getStoredData('userPosts') || [],
        interactions: this.getStoredData('userInteractions') || [],
        gamification: this.getStoredData('userStats')
      };
      exportData.metadata.dataTypes.push('activity');
    }

    // Gather chat history
    if (options.includeChatHistory) {
      exportData.chatHistory = {
        aiSessions: this.getStoredData('aiChatHistory') || [],
        peerChats: this.getStoredData('peerChatHistory') || []
      };
      exportData.metadata.dataTypes.push('chat');
    }

    // Gather reflections
    if (options.includeReflections) {
      const reflections = this.getStoredData('userReflections') || [];
      exportData.reflections = this.filterByDateRange(reflections, options.dateRange);
      exportData.metadata.dataTypes.push('reflections');
    }

    return exportData;
  }

  private getStoredData(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`Failed to parse stored data for ${key}:`, error);
      return null;
    }
  }

  private filterByDateRange(data: unknown[], dateRange?: { start: Date; end: Date }): unknown[] {
    if (!dateRange || !Array.isArray(data)) return data;

    return data.filter(item => {
      const record = item as any;
      const itemDate = new Date(record.timestamp || record.createdAt || record.date);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }

  private calculateMoodPatterns(moodData: unknown[]): any {
    if (!moodData.length) return null;

    const moodCounts: Record<string, number> = {};
    moodData.forEach(analysis => {
      const mood = analysis as any;
      moodCounts[mood.primary] = (moodCounts[mood.primary] || 0) + 1;
    });

    return {
      dominantMoods: Object.entries(moodCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([mood, count]) => ({ mood, frequency: count / moodData.length })),
      totalEntries: moodData.length,
      dateRange: {
        start: Math.min(...moodData.map(d => (d as any).timestamp)),
        end: Math.max(...moodData.map(d => (d as any).timestamp))
      }
    };
  }

  private calculateMoodTrends(moodData: unknown[]): any {
    if (moodData.length < 2) return null;

    const sortedData = [...moodData].sort((a, b) => (a as any).timestamp - (b as any).timestamp);
    const recentData = sortedData.slice(-7); // Last 7 entries
    const olderData = sortedData.slice(-14, -7); // Previous 7 entries

    const getAverageIntensity = (data: unknown[]) => 
      data.reduce((sum: number, item) => sum + ((item as any).intensity || 0), 0) / data.length;

    return {
      recentAverageIntensity: getAverageIntensity(recentData),
      previousAverageIntensity: olderData.length ? getAverageIntensity(olderData) : null,
      trendDirection: this.calculateTrendDirection(sortedData),
      volatility: this.calculateVolatility(sortedData)
    };
  }

  private calculateTrendDirection(data: unknown[]): 'improving' | 'declining' | 'stable' {
    if (data.length < 4) return 'stable';

    const first_half = data.slice(0, Math.floor(data.length / 2));
    const second_half = data.slice(Math.floor(data.length / 2));

    const firstAvg = first_half.reduce((sum: number, item) => sum + ((item as any).intensity || 0), 0) / first_half.length;
    const secondAvg = second_half.reduce((sum: number, item) => sum + ((item as any).intensity || 0), 0) / second_half.length;

    const difference = secondAvg - firstAvg;
    
    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }

  private calculateVolatility(data: unknown[]): number {
    if (data.length < 2) return 0;

    let changes = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] as any).primary !== (data[i - 1] as any).primary) {
        changes++;
      }
    }

    return changes / (data.length - 1);
  }

  private exportAsJSON(data: UserDataExport): Blob {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  private exportAsCSV(data: UserDataExport): Blob {
    let csvContent = 'Data Export - Astral Core\n';
    csvContent += `Export Date: ${data.metadata.exportDate}\n`;
    csvContent += `Version: ${data.metadata.version}\n`;
    csvContent += `Data Types: ${data.metadata.dataTypes.join(', ')}\n\n`;

    // Export mood data as CSV
    if (data.moodData?.analyses) {
      csvContent += 'Mood Analysis Data\n';
      csvContent += 'Date,Primary Mood,Secondary Mood,Intensity,Confidence,Keywords\n';
      
      data.moodData.analyses.forEach(analysis => {
        const mood = analysis as any;
        const date = new Date(mood.timestamp).toISOString().split('T')[0];
        const keywords = (mood.keywords || []).join('; ');
        csvContent += `${date},${mood.primary},${mood.secondary || ''},${mood.intensity},${mood.confidence},"${keywords}"\n`;
      });
      csvContent += '\n';
    }

    // Export activity data as CSV
    if (data.activityData?.posts) {
      csvContent += 'Posts Data\n';
      csvContent += 'Date,Content,Mood,Support Count\n';
      
      data.activityData.posts.forEach(post => {
        const postData = post as any;
        const date = new Date(postData.timestamp || postData.createdAt).toISOString().split('T')[0];
        const content = (postData.content || '').replace(/"/g, '""').substring(0, 100);
        csvContent += `${date},"${content}",${postData.mood || ''},${postData.supportCount || 0}\n`;
      });
      csvContent += '\n';
    }

    return new Blob([csvContent], { type: 'text/csv' });
  }

  private async exportAsPDF(data: UserDataExport): Promise<Blob> {
    // Create a simple PDF-like text format
    // In production, you'd use a proper PDF library like jsPDF
    let pdfContent = `ASTRAL CORE - DATA EXPORT REPORT\n`;
    pdfContent += `${'='.repeat(50)}\n\n`;
    pdfContent += `Export Date: ${new Date(data.metadata.exportDate).toLocaleDateString()}\n`;
    pdfContent += `Export Version: ${data.metadata.version}\n`;
    pdfContent += `Data Types: ${data.metadata.dataTypes.join(', ')}\n\n`;

    // Mood Data Summary
    if (data.moodData) {
      pdfContent += `MOOD ANALYSIS SUMMARY\n`;
      pdfContent += `${'-'.repeat(25)}\n`;
      pdfContent += `Total Mood Entries: ${data.moodData.analyses?.length || 0}\n`;
      
      if (data.moodData.patterns?.dominantMoods) {
        pdfContent += `\nDominant Moods:\n`;
        data.moodData.patterns.dominantMoods.forEach((mood: any, index: number) => {
          pdfContent += `${index + 1}. ${mood.mood}: ${(mood.frequency * 100).toFixed(1)}%\n`;
        });
      }

      if (data.moodData.trends) {
        pdfContent += `\nMood Trends:\n`;
        pdfContent += `Recent Average Intensity: ${(data.moodData.trends.recentAverageIntensity * 100).toFixed(1)}%\n`;
        pdfContent += `Trend Direction: ${data.moodData.trends.trendDirection}\n`;
        pdfContent += `Volatility: ${(data.moodData.trends.volatility * 100).toFixed(1)}%\n`;
      }
      pdfContent += '\n';
    }

    // Activity Summary
    if (data.activityData) {
      pdfContent += `ACTIVITY SUMMARY\n`;
      pdfContent += `${'-'.repeat(16)}\n`;
      pdfContent += `Posts Shared: ${data.activityData.posts?.length || 0}\n`;
      pdfContent += `Interactions: ${data.activityData.interactions?.length || 0}\n`;
      
      if (data.activityData.gamification) {
        pdfContent += `Level: ${data.activityData.gamification.level || 'N/A'}\n`;
        pdfContent += `Total Points: ${data.activityData.gamification.totalPoints || 0}\n`;
      }
      pdfContent += '\n';
    }

    // Chat History Summary
    if (data.chatHistory) {
      pdfContent += `CHAT HISTORY SUMMARY\n`;
      pdfContent += `${'-'.repeat(20)}\n`;
      pdfContent += `AI Chat Sessions: ${data.chatHistory.aiSessions?.length || 0}\n`;
      pdfContent += `Peer Conversations: ${data.chatHistory.peerChats?.length || 0}\n\n`;
    }

    // Reflections Summary
    if (data.reflections) {
      pdfContent += `REFLECTIONS SUMMARY\n`;
      pdfContent += `${'-'.repeat(19)}\n`;
      pdfContent += `Total Reflections: ${data.reflections.length}\n`;
      
      if (data.reflections.length > 0) {
        const dateRange = {
          start: new Date(Math.min(...data.reflections.map((r: any) => new Date(r.timestamp || r.date).getTime()))),
          end: new Date(Math.max(...data.reflections.map((r: any) => new Date(r.timestamp || r.date).getTime())))
        };
        pdfContent += `Date Range: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}\n`;
      }
      pdfContent += '\n';
    }

    pdfContent += `\nThis export was generated on ${new Date().toLocaleString()}\n`;
    pdfContent += `For questions about your data, please contact support.\n`;

    return new Blob([pdfContent], { type: 'text/plain' });
  }

  public downloadExport(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public generateFilename(format: string, userId?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const userPart = userId ? `_${userId}` : '';
    return `astral_core_export${userPart}_${timestamp}.${format}`;
  }

  // Data deletion methods for GDPR compliance
  public deleteAllUserData(): Promise<void> {
    return new Promise((resolve) => {
      const keysToDelete = [
        'userPreferences',
        'userSettings',
        'userProfile',
        'mood_analyses',
        'userPosts',
        'userInteractions',
        'userStats',
        'aiChatHistory',
        'peerChatHistory',
        'userReflections',
        'security_logs',
        'analytics_events',
        'onboardingCompleted',
        'userToken',
        'userId'
      ];

      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear any session storage
      sessionStorage.clear();

      // Clear any IndexedDB data (if used)
      if ('indexedDB' in window) {
        // This would require specific implementation based on your IndexedDB usage
      }

      resolve();
    });
  }

  public deleteSpecificDataType(dataType: string): Promise<void> {
    return new Promise((resolve) => {
      const dataTypeKeys: Record<string, string[]> = {
        mood: ['mood_analyses'],
        activity: ['userPosts', 'userInteractions', 'userStats'],
        chat: ['aiChatHistory', 'peerChatHistory'],
        reflections: ['userReflections'],
        personal: ['userPreferences', 'userSettings', 'userProfile'],
        analytics: ['analytics_events', 'security_logs']
      };

      const keysToDelete = dataTypeKeys[dataType] || [];
      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
      });

      resolve();
    });
  }

  // Privacy compliance methods
  public getDataInventory(): Record<string, any> {
    const inventory: Record<string, any> = {};
    
    const dataKeys = [
      'userPreferences',
      'userSettings', 
      'userProfile',
      'mood_analyses',
      'userPosts',
      'userInteractions',
      'userStats',
      'aiChatHistory',
      'peerChatHistory',
      'userReflections'
    ];

    dataKeys.forEach(key => {
      const data = this.getStoredData(key);
      if (data) {
        inventory[key] = {
          type: typeof data,
          size: JSON.stringify(data).length,
          lastModified: data.lastModified || 'Unknown',
          recordCount: Array.isArray(data) ? data.length : 1
        };
      }
    });

    return inventory;
  }

  public getDataRetentionInfo(): Record<string, string> {
    return {
      'mood_analyses': '2 years or until user deletion',
      'userPosts': '2 years or until user deletion',
      'userInteractions': '1 year or until user deletion',
      'aiChatHistory': '1 year or until user deletion',
      'peerChatHistory': '6 months or until user deletion',
      'userReflections': '2 years or until user deletion',
      'analytics_events': '1 year or until user deletion',
      'security_logs': '2 years for security purposes'
    };
  }
}

// React hooks
export const useDataExport = () => {
  const [service] = React.useState(() => new DataExportService());
  const [isExporting, setIsExporting] = React.useState(false);

  const exportData = React.useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      const blob = await service.exportUserData(options);
      const filename = service.generateFilename(options.format, localStorage.getItem('userId') || undefined);
      service.downloadExport(blob, filename);
      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsExporting(false);
    }
  }, [service]);

  const deleteAllData = React.useCallback(async () => {
    await service.deleteAllUserData();
  }, [service]);

  const deleteDataType = React.useCallback(async (dataType: string) => {
    await service.deleteSpecificDataType(dataType);
  }, [service]);

  const getDataInventory = React.useCallback(() => {
    return service.getDataInventory();
  }, [service]);

  return {
    exportData,
    deleteAllData,
    deleteDataType,
    getDataInventory,
    getDataRetentionInfo: service.getDataRetentionInfo.bind(service),
    isExporting
  };
};

// Singleton instance
let dataExportServiceInstance: DataExportService | null = null;

export const getDataExportService = () => {
  dataExportServiceInstance ??= new DataExportService();
  return dataExportServiceInstance;
};

export default DataExportService;