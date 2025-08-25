/**
 * Gamification Service
 *
 * Comprehensive gamification system for mental health engagement with
 * achievements, progress tracking, rewards, and motivational features.
 * Designed to encourage consistent engagement with therapeutic activities.
 *
 * @fileoverview Gamification system with achievements, progress tracking, and rewards
 * @version 2.0.0
 */

import { logger } from '../utils/logger';
import { secureStorage } from './secureStorageService';

export type AchievementType = 
  | 'milestone'
  | 'streak'
  | 'challenge'
  | 'social'
  | 'wellness'
  | 'learning'
  | 'crisis-recovery'
  | 'self-care';

export type RewardType = 
  | 'badge'
  | 'points'
  | 'unlock'
  | 'customization'
  | 'certificate'
  | 'milestone-reward';

export type ActivityType = 
  | 'mood-check'
  | 'journal-entry'
  | 'breathing-exercise'
  | 'meditation'
  | 'therapy-session'
  | 'peer-support'
  | 'safety-plan-update'
  | 'crisis-resource-access'
  | 'goal-completion'
  | 'reflection'
  | 'assessment'
  | 'learning-module';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  icon: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  category: string;
  isSecret?: boolean;
  prerequisites?: string[];
}

export interface AchievementRequirement {
  type: 'count' | 'streak' | 'time' | 'score' | 'completion';
  activity: ActivityType;
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  conditions?: Record<string, any>;
}

export interface UserProgress {
  userId: string;
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  pointsToNextLevel: number;
  unlockedAchievements: string[];
  currentStreaks: Record<ActivityType, StreakData>;
  activityStats: Record<ActivityType, ActivityStats>;
  badges: Badge[];
  customizations: UserCustomizations;
  weeklyGoals: WeeklyGoal[];
  lastActivity: Date;
  joinDate: Date;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActivity: Date;
  isActive: boolean;
}

export interface ActivityStats {
  totalCount: number;
  thisWeek: number;
  thisMonth: number;
  averagePerWeek: number;
  bestStreak: number;
  lastActivity?: Date;
  qualityScore?: number;
}

export interface Badge {
  id: string;
  achievementId: string;
  earnedAt: Date;
  level?: number;
  metadata?: Record<string, any>;
}

export interface UserCustomizations {
  theme: string;
  avatarParts: string[];
  unlockedThemes: string[];
  unlockedAvatarParts: string[];
  preferredRewardTypes: RewardType[];
}

export interface WeeklyGoal {
  id: string;
  activity: ActivityType;
  target: number;
  current: number;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  pointsReward: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'community';
  activity: ActivityType;
  target: number;
  duration: number; // in days
  pointsReward: number;
  startDate: Date;
  endDate: Date;
  participants?: string[];
  leaderboard?: ChallengeEntry[];
  isActive: boolean;
}

export interface ChallengeEntry {
  userId: string;
  username: string;
  progress: number;
  points: number;
  rank: number;
}

export interface GamificationEvent {
  type: 'achievement-unlocked' | 'level-up' | 'streak-milestone' | 'challenge-completed' | 'badge-earned';
  data: any;
  timestamp: Date;
  userId: string;
}

class GamificationService {
  private achievements: Map<string, Achievement> = new Map();
  private userProgress: UserProgress | null = null;
  private activeChallenges: Map<string, Challenge> = new Map();
  private eventListeners: ((event: GamificationEvent) => void)[] = [];
  private initialized = false;

  constructor() {
    this.initializeAchievements();
  }

  public async initialize(userId: string): Promise<void> {
    try {
      await this.loadUserProgress(userId);
      await this.loadActiveChallenges();
      this.initialized = true;
      logger.info('GamificationService initialized for user:', userId);
    } catch (error) {
      logger.error('Failed to initialize GamificationService:', error);
      throw error;
    }
  }

  private initializeAchievements() {
    const defaultAchievements: Achievement[] = [
      // Milestone Achievements
      {
        id: 'first-mood-check',
        name: 'First Steps',
        description: 'Complete your first mood check-in',
        type: 'milestone',
        icon: '🌱',
        points: 10,
        rarity: 'common',
        requirements: [{ type: 'count', activity: 'mood-check', target: 1 }],
        category: 'Getting Started'
      },
      {
        id: 'journal-writer',
        name: 'Journal Writer',
        description: 'Write 10 journal entries',
        type: 'milestone',
        icon: '📝',
        points: 50,
        rarity: 'uncommon',
        requirements: [{ type: 'count', activity: 'journal-entry', target: 10 }],
        category: 'Self-Reflection'
      },
      {
        id: 'mindful-moment',
        name: 'Mindful Moment',
        description: 'Complete 5 breathing exercises',
        type: 'wellness',
        icon: '🧘',
        points: 30,
        rarity: 'common',
        requirements: [{ type: 'count', activity: 'breathing-exercise', target: 5 }],
        category: 'Mindfulness'
      },

      // Streak Achievements
      {
        id: 'daily-warrior',
        name: 'Daily Warrior',
        description: 'Maintain a 7-day mood check streak',
        type: 'streak',
        icon: '🔥',
        points: 100,
        rarity: 'rare',
        requirements: [{ type: 'streak', activity: 'mood-check', target: 7 }],
        category: 'Consistency'
      },
      {
        id: 'meditation-master',
        name: 'Meditation Master',
        description: 'Meditate for 30 consecutive days',
        type: 'streak',
        icon: '🕉️',
        points: 300,
        rarity: 'epic',
        requirements: [{ type: 'streak', activity: 'meditation', target: 30 }],
        category: 'Mindfulness'
      },

      // Crisis Recovery Achievements
      {
        id: 'crisis-survivor',
        name: 'Crisis Survivor',
        description: 'Successfully use crisis resources during a difficult time',
        type: 'crisis-recovery',
        icon: '🛡️',
        points: 200,
        rarity: 'rare',
        requirements: [{ type: 'count', activity: 'crisis-resource-access', target: 1 }],
        category: 'Crisis Support'
      },
      {
        id: 'safety-planner',
        name: 'Safety Planner',
        description: 'Update your safety plan 3 times',
        type: 'crisis-recovery',
        icon: '🗂️',
        points: 75,
        rarity: 'uncommon',
        requirements: [{ type: 'count', activity: 'safety-plan-update', target: 3 }],
        category: 'Crisis Support'
      },

      // Social Achievements
      {
        id: 'peer-supporter',
        name: 'Peer Supporter',
        description: 'Participate in 5 peer support sessions',
        type: 'social',
        icon: '🤝',
        points: 150,
        rarity: 'rare',
        requirements: [{ type: 'count', activity: 'peer-support', target: 5 }],
        category: 'Community'
      },

      // Learning Achievements
      {
        id: 'knowledge-seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 3 learning modules',
        type: 'learning',
        icon: '📚',
        points: 120,
        rarity: 'uncommon',
        requirements: [{ type: 'count', activity: 'learning-module', target: 3 }],
        category: 'Education'
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  public async recordActivity(
    activity: ActivityType,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!this.initialized || !this.userProgress) {
      logger.warn('GamificationService not initialized');
      return;
    }

    try {
      // Update activity stats
      if (!this.userProgress.activityStats[activity]) {
        this.userProgress.activityStats[activity] = {
          totalCount: 0,
          thisWeek: 0,
          thisMonth: 0,
          averagePerWeek: 0,
          bestStreak: 0
        };
      }

      const stats = this.userProgress.activityStats[activity];
      stats.totalCount++;
      stats.lastActivity = new Date();
      
      // Update weekly/monthly counts
      this.updateTimeBasedStats(activity);

      // Update streaks
      this.updateStreaks(activity);

      // Check for achievements
      await this.checkAchievements(activity, metadata);

      // Update weekly goals
      this.updateWeeklyGoals(activity);

      // Save progress
      await this.saveUserProgress();

      logger.debug(`Recorded activity: ${activity}`, metadata);
    } catch (error) {
      logger.error('Failed to record activity:', error);
    }
  }

  private updateTimeBasedStats(activity: ActivityType) {
    if (!this.userProgress) return;

    const stats = this.userProgress.activityStats[activity];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Reset weekly count if new week
    if (stats.lastActivity && stats.lastActivity < weekStart) {
      stats.thisWeek = 0;
    }

    // Reset monthly count if new month
    if (stats.lastActivity && stats.lastActivity < monthStart) {
      stats.thisMonth = 0;
    }

    stats.thisWeek++;
    stats.thisMonth++;

    // Calculate average per week
    const weeksActive = Math.max(1, Math.floor(
      (now.getTime() - this.userProgress.joinDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ));
    stats.averagePerWeek = stats.totalCount / weeksActive;
  }

  private updateStreaks(activity: ActivityType) {
    if (!this.userProgress) return;

    if (!this.userProgress.currentStreaks[activity]) {
      this.userProgress.currentStreaks[activity] = {
        current: 0,
        longest: 0,
        lastActivity: new Date(),
        isActive: true
      };
    }

    const streak = this.userProgress.currentStreaks[activity];
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    // Check if streak continues
    if (streak.lastActivity && streak.lastActivity >= yesterday) {
      // Same day or consecutive day
      if (streak.lastActivity.toDateString() !== now.toDateString()) {
        streak.current++;
      }
    } else {
      // Streak broken, start new
      streak.current = 1;
      streak.isActive = true;
    }

    streak.lastActivity = now;
    
    // Update longest streak
    if (streak.current > streak.longest) {
      streak.longest = streak.current;
      this.userProgress.activityStats[activity].bestStreak = streak.current;
    }

    // Check for streak milestones
    if ([3, 7, 14, 30, 60, 100].includes(streak.current)) {
      this.emitEvent({
        type: 'streak-milestone',
        data: { activity, streak: streak.current },
        timestamp: now,
        userId: this.userProgress.userId
      });
    }
  }

  private async checkAchievements(activity: ActivityType, metadata: Record<string, any>) {
    if (!this.userProgress) return;

    for (const [id, achievement] of this.achievements) {
      if (this.userProgress.unlockedAchievements.includes(id)) {
        continue; // Already unlocked
      }

      // Check prerequisites
      if (achievement.prerequisites) {
        const hasPrereqs = achievement.prerequisites.every(prereqId =>
          this.userProgress!.unlockedAchievements.includes(prereqId)
        );
        if (!hasPrereqs) continue;
      }

      // Check requirements
      const meetsRequirements = achievement.requirements.every(req => 
        this.checkRequirement(req, activity, metadata)
      );

      if (meetsRequirements) {
        await this.unlockAchievement(id);
      }
    }
  }

  private checkRequirement(
    requirement: AchievementRequirement,
    activity: ActivityType,
    metadata: Record<string, any>
  ): boolean {
    if (!this.userProgress) return false;

    // Must be the right activity type
    if (requirement.activity !== activity) return false;

    const stats = this.userProgress.activityStats[activity];
    const streaks = this.userProgress.currentStreaks[activity];

    switch (requirement.type) {
      case 'count':
        return stats?.totalCount >= requirement.target;
      
      case 'streak':
        return streaks?.current >= requirement.target;
      
      case 'time':
        // Check if activity duration meets requirement
        return metadata.duration >= requirement.target;
      
      case 'score':
        // Check if activity score meets requirement
        return metadata.score >= requirement.target;
      
      case 'completion':
        // Check if activity was completed successfully
        return metadata.completed === true;
      
      default:
        return false;
    }
  }

  private async unlockAchievement(achievementId: string) {
    if (!this.userProgress) return;

    const achievement = this.achievements.get(achievementId);
    if (!achievement) return;

    // Add to unlocked achievements
    this.userProgress.unlockedAchievements.push(achievementId);
    
    // Award points
    this.awardPoints(achievement.points);

    // Create badge
    const badge: Badge = {
      id: `badge-${achievementId}-${Date.now()}`,
      achievementId,
      earnedAt: new Date()
    };
    this.userProgress.badges.push(badge);

    // Mark achievement as unlocked
    achievement.unlockedAt = new Date();

    // Emit event
    this.emitEvent({
      type: 'achievement-unlocked',
      data: { achievement, badge },
      timestamp: new Date(),
      userId: this.userProgress.userId
    });

    logger.info(`Achievement unlocked: ${achievement.name}`, { userId: this.userProgress.userId });
  }

  private awardPoints(points: number) {
    if (!this.userProgress) return;

    this.userProgress.totalPoints += points;
    this.userProgress.currentLevelPoints += points;

    // Check for level up
    const pointsForNextLevel = this.getPointsForLevel(this.userProgress.level + 1);
    if (this.userProgress.currentLevelPoints >= pointsForNextLevel) {
      this.levelUp();
    } else {
      this.userProgress.pointsToNextLevel = pointsForNextLevel - this.userProgress.currentLevelPoints;
    }
  }

  private levelUp() {
    if (!this.userProgress) return;

    this.userProgress.level++;
    const pointsUsed = this.getPointsForLevel(this.userProgress.level);
    this.userProgress.currentLevelPoints -= pointsUsed;
    this.userProgress.pointsToNextLevel = this.getPointsForLevel(this.userProgress.level + 1) - this.userProgress.currentLevelPoints;

    // Emit event
    this.emitEvent({
      type: 'level-up',
      data: { newLevel: this.userProgress.level },
      timestamp: new Date(),
      userId: this.userProgress.userId
    });

    logger.info(`Level up! New level: ${this.userProgress.level}`, { userId: this.userProgress.userId });
  }

  private getPointsForLevel(level: number): number {
    // Exponential point requirements: 100 * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  private updateWeeklyGoals(activity: ActivityType) {
    if (!this.userProgress) return;

    const now = new Date();
    this.userProgress.weeklyGoals.forEach(goal => {
      if (goal.activity === activity && !goal.completed && now <= goal.endDate) {
        goal.current++;
        if (goal.current >= goal.target) {
          goal.completed = true;
          this.awardPoints(goal.pointsReward);
          
          this.emitEvent({
            type: 'challenge-completed',
            data: { goal },
            timestamp: now,
            userId: this.userProgress!.userId
          });
        }
      }
    });
  }

  public async createWeeklyGoals(): Promise<WeeklyGoal[]> {
    if (!this.userProgress) return [];

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Create personalized goals based on user's activity history
    const goals: WeeklyGoal[] = [
      {
        id: `goal-mood-${now.getTime()}`,
        activity: 'mood-check',
        target: 5,
        current: 0,
        startDate: weekStart,
        endDate: weekEnd,
        completed: false,
        pointsReward: 50
      },
      {
        id: `goal-journal-${now.getTime()}`,
        activity: 'journal-entry',
        target: 3,
        current: 0,
        startDate: weekStart,
        endDate: weekEnd,
        completed: false,
        pointsReward: 75
      }
    ];

    this.userProgress.weeklyGoals = goals;
    await this.saveUserProgress();

    return goals;
  }

  public getUserProgress(): UserProgress | null {
    return this.userProgress;
  }

  public getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  public getUnlockedAchievements(): Achievement[] {
    if (!this.userProgress) return [];
    
    return this.userProgress.unlockedAchievements
      .map(id => this.achievements.get(id))
      .filter((achievement): achievement is Achievement => achievement !== undefined);
  }

  public addEventListener(listener: (event: GamificationEvent) => void) {
    this.eventListeners.push(listener);
  }

  public removeEventListener(listener: (event: GamificationEvent) => void) {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private emitEvent(event: GamificationEvent) {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in gamification event listener:', error);
      }
    });
  }

  private async loadUserProgress(userId: string): Promise<void> {
    try {
      const saved = await secureStorage.getItem(`gamification-progress-${userId}`);
      if (saved) {
        this.userProgress = JSON.parse(saved);
        // Convert date strings back to Date objects
        if (this.userProgress) {
          this.userProgress.lastActivity = new Date(this.userProgress.lastActivity);
          this.userProgress.joinDate = new Date(this.userProgress.joinDate);
          
          // Convert streak dates
          Object.values(this.userProgress.currentStreaks).forEach(streak => {
            streak.lastActivity = new Date(streak.lastActivity);
          });
        }
      } else {
        // Create new user progress
        this.userProgress = {
          userId,
          level: 1,
          totalPoints: 0,
          currentLevelPoints: 0,
          pointsToNextLevel: this.getPointsForLevel(2),
          unlockedAchievements: [],
          currentStreaks: {},
          activityStats: {},
          badges: [],
          customizations: {
            theme: 'default',
            avatarParts: [],
            unlockedThemes: ['default'],
            unlockedAvatarParts: [],
            preferredRewardTypes: ['badge', 'points']
          },
          weeklyGoals: [],
          lastActivity: new Date(),
          joinDate: new Date()
        };
        
        await this.saveUserProgress();
      }
    } catch (error) {
      logger.error('Failed to load user progress:', error);
      throw error;
    }
  }

  private async saveUserProgress(): Promise<void> {
    if (!this.userProgress) return;

    try {
      await secureStorage.setItem(
        `gamification-progress-${this.userProgress.userId}`,
        JSON.stringify(this.userProgress)
      );
    } catch (error) {
      logger.error('Failed to save user progress:', error);
    }
  }

  private async loadActiveChallenges(): Promise<void> {
    try {
      const saved = await secureStorage.getItem('gamification-challenges');
      if (saved) {
        const challenges: Challenge[] = JSON.parse(saved);
        challenges.forEach(challenge => {
          this.activeChallenges.set(challenge.id, challenge);
        });
      }
    } catch (error) {
      logger.error('Failed to load active challenges:', error);
    }
  }

  public async reset(): Promise<void> {
    if (!this.userProgress) return;

    try {
      await secureStorage.removeItem(`gamification-progress-${this.userProgress.userId}`);
      this.userProgress = null;
      this.activeChallenges.clear();
      logger.info('Gamification data reset');
    } catch (error) {
      logger.error('Failed to reset gamification data:', error);
    }
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
