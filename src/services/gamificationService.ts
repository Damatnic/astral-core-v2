// Gamification service for achievements and progress tracking
import React from 'react';

// Extend Window interface to include custom showToast function
declare global {
  interface Window {
    showToast?: (options: {
      type: 'success' | 'error' | 'info' | 'warning';
      title: string;
      message: string;
      duration?: number;
    }) => void;
  }
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'wellness' | 'community' | 'progress' | 'milestone';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

export interface UserStats {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  currentLevelPoints: number;
  streak: {
    current: number;
    longest: number;
    type: 'daily_checkin' | 'wellness_activity' | 'community_support';
  };
  achievements: Achievement[];
  badges: string[];
  activities: {
    postsShared: number;
    supportGiven: number;
    wellnessActivities: number;
    daysActive: number;
    aiChatSessions: number;
    reflectionsWritten: number;
  };
}

export interface LevelInfo {
  level: number;
  title: string;
  pointsRequired: number;
  perks: string[];
  color: string;
}

const LEVEL_TITLES: LevelInfo[] = [
  { level: 1, title: 'New Journey', pointsRequired: 0, perks: ['Basic features'], color: '#94a3b8' },
  { level: 2, title: 'First Steps', pointsRequired: 100, perks: ['Custom themes'], color: '#60a5fa' },
  { level: 3, title: 'Finding Balance', pointsRequired: 300, perks: ['Priority support'], color: '#34d399' },
  { level: 4, title: 'Growing Strong', pointsRequired: 600, perks: ['Advanced AI features'], color: '#fbbf24' },
  { level: 5, title: 'Wellness Warrior', pointsRequired: 1000, perks: ['Exclusive content'], color: '#f472b6' },
  { level: 6, title: 'Community Champion', pointsRequired: 1500, perks: ['Mentor badge'], color: '#a78bfa' },
  { level: 7, title: 'Healing Guide', pointsRequired: 2200, perks: ['Special recognition'], color: '#fb7185' },
  { level: 8, title: 'Mindful Master', pointsRequired: 3000, perks: ['Beta features'], color: '#06b6d4' },
  { level: 9, title: 'Serenity Sage', pointsRequired: 4000, perks: ['Custom achievements'], color: '#84cc16' },
  { level: 10, title: 'Astral Guardian', pointsRequired: 5500, perks: ['All features unlocked'], color: '#eab308' }
];

const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Welcome achievements
  {
    id: 'first_post',
    title: 'First Share',
    description: 'Share your first thought with the community',
    icon: '✨',
    category: 'milestone',
    points: 50,
    rarity: 'common'
  },
  {
    id: 'welcome_aboard',
    title: 'Welcome Aboard',
    description: 'Complete your profile setup',
    icon: '🎉',
    category: 'milestone',
    points: 25,
    rarity: 'common'
  },
  
  // Community achievements
  {
    id: 'first_support',
    title: 'Helping Hand',
    description: 'Give your first support to someone',
    icon: '🤝',
    category: 'community',
    points: 30,
    rarity: 'common'
  },
  {
    id: 'support_streak_7',
    title: 'Weekly Supporter',
    description: 'Support others for 7 days in a row',
    icon: '💪',
    category: 'community',
    points: 100,
    rarity: 'rare',
    progress: { current: 0, target: 7 }
  },
  {
    id: 'community_hero',
    title: 'Community Hero',
    description: 'Receive 100 appreciations from others',
    icon: '🦸',
    category: 'community',
    points: 500,
    rarity: 'epic',
    progress: { current: 0, target: 100 }
  },
  
  // Wellness achievements
  {
    id: 'first_reflection',
    title: 'Inner Voice',
    description: 'Write your first reflection',
    icon: '📝',
    category: 'wellness',
    points: 40,
    rarity: 'common'
  },
  {
    id: 'meditation_master',
    title: 'Meditation Master',
    description: 'Complete 30 meditation sessions',
    icon: '🧘',
    category: 'wellness',
    points: 300,
    rarity: 'rare',
    progress: { current: 0, target: 30 }
  },
  {
    id: 'wellness_streak_30',
    title: 'Wellness Warrior',
    description: 'Complete wellness activities for 30 days',
    icon: '🌟',
    category: 'wellness',
    points: 400,
    rarity: 'epic',
    progress: { current: 0, target: 30 }
  },
  
  // Progress achievements
  {
    id: 'level_up_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'progress',
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'point_collector',
    title: 'Point Collector',
    description: 'Earn 1000 total points',
    icon: '💎',
    category: 'progress',
    points: 100,
    rarity: 'rare',
    progress: { current: 0, target: 1000 }
  },
  {
    id: 'legendary_status',
    title: 'Legendary Status',
    description: 'Reach the maximum level',
    icon: '👑',
    category: 'progress',
    points: 1000,
    rarity: 'legendary'
  }
];

class GamificationService {
  private userStats: UserStats;
  private achievements: Achievement[];
  private readonly listeners = new Set<(stats: UserStats) => void>();

  constructor() {
    this.userStats = this.loadUserStats();
    this.achievements = this.initializeAchievements();
  }

  private loadUserStats(): UserStats {
    const saved = localStorage.getItem('userStats');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      totalPoints: 0,
      level: 1,
      nextLevelPoints: 100,
      currentLevelPoints: 0,
      streak: {
        current: 0,
        longest: 0,
        type: 'daily_checkin'
      },
      achievements: [],
      badges: [],
      activities: {
        postsShared: 0,
        supportGiven: 0,
        wellnessActivities: 0,
        daysActive: 0,
        aiChatSessions: 0,
        reflectionsWritten: 0
      }
    };
  }

  private saveUserStats() {
    localStorage.setItem('userStats', JSON.stringify(this.userStats));
    this.notifyListeners();
  }

  private initializeAchievements(): Achievement[] {
    return DEFAULT_ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: false,
      unlockedAt: undefined
    }));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.userStats);
      } catch (error) {
        console.error('Error in gamification listener:', error);
      }
    });
  }

  private calculateLevel(points: number): { level: number; currentLevelPoints: number; nextLevelPoints: number } {
    let level = 1;
    let currentLevelPoints = points;
    
    for (const levelInfo of LEVEL_TITLES) {
      if (points >= levelInfo.pointsRequired) {
        level = levelInfo.level;
        currentLevelPoints = points - levelInfo.pointsRequired;
      } else {
        const nextLevelPoints = levelInfo.pointsRequired - points;
        return { level, currentLevelPoints, nextLevelPoints };
      }
    }
    
    return { level, currentLevelPoints, nextLevelPoints: 0 };
  }

  private checkAchievements() {
    const newlyUnlocked: Achievement[] = [];
    
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_post':
          shouldUnlock = this.userStats.activities.postsShared >= 1;
          break;
        case 'first_support':
          shouldUnlock = this.userStats.activities.supportGiven >= 1;
          break;
        case 'first_reflection':
          shouldUnlock = this.userStats.activities.reflectionsWritten >= 1;
          break;
        case 'level_up_5':
          shouldUnlock = this.userStats.level >= 5;
          break;
        case 'legendary_status':
          shouldUnlock = this.userStats.level >= 10;
          break;
        case 'point_collector':
          shouldUnlock = this.userStats.totalPoints >= 1000;
          if (achievement.progress) {
            achievement.progress.current = this.userStats.totalPoints;
          }
          break;
        case 'community_hero':
          // This would be updated from external events
          break;
        case 'meditation_master':
          // This would be updated from wellness activities
          break;
        case 'wellness_streak_30':
          // This would be updated from daily activities
          break;
      }
      
      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);
        this.awardPoints(achievement.points, `Achievement: ${achievement.title}`);
      }
    });
    
    return newlyUnlocked;
  }

  // Public API
  awardPoints(points: number, reason: string) {
    this.userStats.totalPoints += points;
    
    const levelInfo = this.calculateLevel(this.userStats.totalPoints);
    const oldLevel = this.userStats.level;
    
    this.userStats.level = levelInfo.level;
    this.userStats.currentLevelPoints = levelInfo.currentLevelPoints;
    this.userStats.nextLevelPoints = levelInfo.nextLevelPoints;
    
    // Check for level up
    if (levelInfo.level > oldLevel) {
      this.onLevelUp(levelInfo.level);
    }
    
    // Check achievements after awarding points
    const newAchievements = this.checkAchievements();
    
    this.saveUserStats();
    
    // Show notifications for new achievements
    newAchievements.forEach(achievement => {
      this.showAchievementNotification(achievement);
    });
    
    console.log(`Awarded ${points} points for: ${reason}`);
  }

  private onLevelUp(newLevel: number) {
    const levelInfo = LEVEL_TITLES.find(l => l.level === newLevel);
    if (levelInfo) {
      this.showLevelUpNotification(levelInfo);
    }
  }

  private showAchievementNotification(achievement: Achievement) {
    // This would integrate with your notification system
    console.log(`🎉 Achievement Unlocked: ${achievement.title}`);
    
    // Show toast notification
    if (window.showToast) {
      window.showToast({
        type: 'success',
        title: 'Achievement Unlocked!',
        message: `${achievement.icon} ${achievement.title}`,
        duration: 5000
      });
    }
  }

  private showLevelUpNotification(levelInfo: LevelInfo) {
    console.log(`🎊 Level Up! You're now ${levelInfo.title}`);
    
    if (window.showToast) {
      window.showToast({
        type: 'success',
        title: 'Level Up!',
        message: `You're now ${levelInfo.title}!`,
        duration: 5000
      });
    }
  }

  // Activity tracking methods
  trackPostShared() {
    this.userStats.activities.postsShared++;
    this.awardPoints(10, 'Shared a post');
  }

  trackSupportGiven() {
    this.userStats.activities.supportGiven++;
    this.awardPoints(15, 'Gave support to someone');
  }

  trackReflectionWritten() {
    this.userStats.activities.reflectionsWritten++;
    this.awardPoints(20, 'Wrote a reflection');
  }

  trackWellnessActivity() {
    this.userStats.activities.wellnessActivities++;
    this.awardPoints(25, 'Completed wellness activity');
  }

  trackAIChatSession() {
    this.userStats.activities.aiChatSessions++;
    this.awardPoints(5, 'AI chat session');
  }

  trackDailyLogin() {
    this.userStats.activities.daysActive++;
    this.awardPoints(5, 'Daily login');
  }

  // Getters
  getUserStats(): UserStats {
    return { ...this.userStats };
  }

  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  getLevelInfo(level?: number): LevelInfo | undefined {
    const targetLevel = level || this.userStats.level;
    return LEVEL_TITLES.find(l => l.level === targetLevel);
  }

  getProgressToNextLevel(): number {
    if (this.userStats.nextLevelPoints === 0) return 100; // Max level
    return (this.userStats.currentLevelPoints / (this.userStats.currentLevelPoints + this.userStats.nextLevelPoints)) * 100;
  }

  // Event subscription
  subscribe(callback: (stats: UserStats) => void) {
    this.listeners.add(callback);
    
    // Send current stats immediately
    callback(this.userStats);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Reset for testing
  reset() {
    localStorage.removeItem('userStats');
    this.userStats = this.loadUserStats();
    this.achievements = this.initializeAchievements();
    this.saveUserStats();
  }
}

// React hooks
export const useGamification = () => {
  const [service] = React.useState(() => new GamificationService());
  const [stats, setStats] = React.useState<UserStats>(service.getUserStats());

  React.useEffect(() => {
    const unsubscribe = service.subscribe(setStats);
    return unsubscribe;
  }, [service]);

  return {
    stats,
    awardPoints: service.awardPoints.bind(service),
    trackPostShared: service.trackPostShared.bind(service),
    trackSupportGiven: service.trackSupportGiven.bind(service),
    trackReflectionWritten: service.trackReflectionWritten.bind(service),
    trackWellnessActivity: service.trackWellnessActivity.bind(service),
    trackAIChatSession: service.trackAIChatSession.bind(service),
    trackDailyLogin: service.trackDailyLogin.bind(service),
    getAchievements: service.getAchievements.bind(service),
    getLevelInfo: service.getLevelInfo.bind(service),
    getProgressToNextLevel: service.getProgressToNextLevel.bind(service)
  };
};

// Singleton instance
let gamificationServiceInstance: GamificationService | null = null;

export const getGamificationService = () => {
  gamificationServiceInstance ??= new GamificationService();
  return gamificationServiceInstance;
};

export default GamificationService;