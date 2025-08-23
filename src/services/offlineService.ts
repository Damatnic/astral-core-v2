/**
 * Offline Service
 * Manages offline functionality for the mental health platform
 */;

import { logger } from '../utils/logger';
import { localStorageService } from './localStorageService';

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: 'distraction' | 'self-soothe' | 'emotional-release' | 'mindfulness' | 'social';
  steps: string[];
  duration?: number
  }

export interface SafetyPlan {
  id: string;
  warningSignals: string[];
  copingStrategies: string[];
  socialContacts: { name: string; phone: string; }[];
  safeEnvironments: string[];
  reasonsToLive: string[];
  lastUpdated: Date
  }

export interface MoodEntry {
  id: string;
  mood: number;
  emotions: string[];
  notes?: string;
  timestamp: Date
  }

class OfflineService {
  private isOnline: boolean = navigator.onLine;
  private syncQueue: any[] = [];
  private offlineData: any;
  private readonly OFFLINE_DATA_KEY = 'offline_data';

  constructor() {
    this.initializeService();
    this.setupEventListeners();
    logger.info("OfflineService initialized", undefined, "OfflineService")
  }

  private initializeService(): void {
    const savedData = localStorageService.getItem(this.OFFLINE_DATA_KEY);
    if (savedData) {
      try {
        this.offlineData = JSON.parse(savedData)
  } catch (error) {
        logger.error("Failed to load offline data", error, "OfflineService");
        this.offlineData = this.getDefaultData()
  }
  } else {
      this.offlineData = this.getDefaultData()
  }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info("Connection restored", undefined, "OfflineService");
      this.processSyncQueue()
  });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info("Offline mode activated", undefined, "OfflineService")
  })
  }

  private getDefaultData(): any {
    return {
      copingStrategies: [
        {
          id: 'cs1',
          title: 'Deep Breathing',
          description: 'Calm your mind through controlled breathing',
          category: 'mindfulness',
          steps: [
            'Find a comfortable position',
            'Breathe in slowly for 4 counts',
            'Hold for 4 counts',
            'Exhale slowly for 6 counts',
            'Repeat 5-10 times'
          ],
          duration: 5
  },
        {
          id: 'cs2',
          title: '5-4-3-2-1 Grounding',
          description: 'Ground yourself using your senses',
          category: 'mindfulness',
          steps: [
            'Name 5 things you can see',
            'Name 4 things you can touch',
            'Name 3 things you can hear',
            'Name 2 things you can smell',
            'Name 1 thing you can taste'
          ],
          duration: 3
  }
      ],
      safetyPlan: null,
      recentMoodEntries: [],
      lastSyncTime: new Date()
  }

  getOnlineStatus(): boolean {
    return this.isOnline
  }

  getCopingStrategies(): CopingStrategy[] {
    return this.offlineData.copingStrategies || []
  }

  getSafetyPlan(): SafetyPlan | null {
    return this.offlineData.safetyPlan
  }

  saveSafetyPlan(plan: SafetyPlan): void {
    this.offlineData.safetyPlan = plan;
    this.saveOfflineData()
  }

  addMoodEntry(entry: Omit<MoodEntry, 'id'>): MoodEntry {
    const newEntry: MoodEntry = {
      ...entry,
      id: `mood_${Date.now()}`,
      timestamp: new Date()
  };

    this.offlineData.recentMoodEntries.unshift(newEntry);
    if (this.offlineData.recentMoodEntries.length > 30) {
      this.offlineData.recentMoodEntries = this.offlineData.recentMoodEntries.slice(0, 30)
  }

    this.saveOfflineData();

    if (!this.isOnline) {
      this.addToSyncQueue({
        type: 'mood_entry',
        data: newEntry,
        timestamp: new Date()
  };
  };
    }

    return newEntry
  }

  getRecentMoodEntries(limit: number = 10): MoodEntry[] {
    return this.offlineData.recentMoodEntries.slice(0, limit)
  }

  private addToSyncQueue(item: any): void {
    this.syncQueue.push(item);
    localStorageService.setItem('offline_sync_queue', JSON.stringify(this.syncQueue))
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    const failedItems = [];
    for (const item of this.syncQueue) {
      try {
        // In production, sync with API
        logger.info("Syncing item", { type: item.type }, "OfflineService")
  } catch (error) {
        failedItems.push(item)
  }
    }

    this.syncQueue = failedItems;
    localStorageService.setItem('offline_sync_queue', JSON.stringify(this.syncQueue))
  }

  private saveOfflineData(): void {
    localStorageService.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(this.offlineData))
  }

  clearOfflineData(): void {
    this.offlineData = this.getDefaultData();
    this.syncQueue = [];
    this.saveOfflineData()
  }

  getSyncQueueStatus(): { itemsInQueue: number; isOnline: boolean } {
    return {
      itemsInQueue: this.syncQueue.length,
      isOnline: this.isOnline
  }
}

export const offlineService = new OfflineService();
export default offlineService;
 * Offline Service
 * Manages offline functionality for the mental health platform
 */;

import { logger } from '../utils/logger';
import { localStorageService } from './localStorageService';

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: 'distraction' | 'self-soothe' | 'emotional-release' | 'mindfulness' | 'social';
  steps: string[];
  duration?: number
  }

export interface SafetyPlan {
  id: string;
  warningSignals: string[];
  copingStrategies: string[];
  socialContacts: { name: string; phone: string; }[];
  safeEnvironments: string[];
  reasonsToLive: string[];
  lastUpdated: Date
  }

export interface MoodEntry {
  id: string;
  mood: number;
  emotions: string[];
  notes?: string;
  timestamp: Date
  }

class OfflineService {
  private isOnline: boolean = navigator.onLine;
  private syncQueue: any[] = [];
  private offlineData: any;
  private readonly OFFLINE_DATA_KEY = 'offline_data';

  constructor() {
    this.initializeService();
    this.setupEventListeners();
    logger.info("OfflineService initialized", undefined, "OfflineService")
  }

  private initializeService(): void {
    const savedData = localStorageService.getItem(this.OFFLINE_DATA_KEY);
    if (savedData) {
      try {
        this.offlineData = JSON.parse(savedData)
  } catch (error) {
        logger.error("Failed to load offline data", error, "OfflineService");
        this.offlineData = this.getDefaultData()
  }
  } else {
      this.offlineData = this.getDefaultData()
  }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info("Connection restored", undefined, "OfflineService");
      this.processSyncQueue()
  };
  };
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info("Offline mode activated", undefined, "OfflineService")
  })
  }

  private getDefaultData(): any {
    return {
      copingStrategies: [
        {
          id: 'cs1',
          title: 'Deep Breathing',
          description: 'Calm your mind through controlled breathing',
          category: 'mindfulness',
          steps: [
            'Find a comfortable position',
            'Breathe in slowly for 4 counts',
            'Hold for 4 counts',
            'Exhale slowly for 6 counts',
            'Repeat 5-10 times'
          ],
          duration: 5
  },
        {
          id: 'cs2',
          title: '5-4-3-2-1 Grounding',
          description: 'Ground yourself using your senses',
          category: 'mindfulness',
          steps: [
            'Name 5 things you can see',
            'Name 4 things you can touch',
            'Name 3 things you can hear',
            'Name 2 things you can smell',
            'Name 1 thing you can taste'
          ],
          duration: 3
  }
      ],
      safetyPlan: null,
      recentMoodEntries: [],
      lastSyncTime: new Date()
  }

  getOnlineStatus(): boolean {
    return this.isOnline
  }

  getCopingStrategies(): CopingStrategy[] {
    return this.offlineData.copingStrategies || []
  }

  getSafetyPlan(): SafetyPlan | null {
    return this.offlineData.safetyPlan
  }

  saveSafetyPlan(plan: SafetyPlan): void {
    this.offlineData.safetyPlan = plan;
    this.saveOfflineData()
  }

  addMoodEntry(entry: Omit<MoodEntry, 'id'>): MoodEntry {
    const newEntry: MoodEntry = {
      ...entry,
      id: `mood_${Date.now()}`,
      timestamp: new Date()
  };

    this.offlineData.recentMoodEntries.unshift(newEntry);
    if (this.offlineData.recentMoodEntries.length > 30) {
      this.offlineData.recentMoodEntries = this.offlineData.recentMoodEntries.slice(0, 30)
  }

    this.saveOfflineData();

    if (!this.isOnline) {
      this.addToSyncQueue({
        type: 'mood_entry',
        data: newEntry,
        timestamp: new Date()
  };
  };
    }

    return newEntry
  }

  getRecentMoodEntries(limit: number = 10): MoodEntry[] {
    return this.offlineData.recentMoodEntries.slice(0, limit)
  }

  private addToSyncQueue(item: any): void {
    this.syncQueue.push(item);
    localStorageService.setItem('offline_sync_queue', JSON.stringify(this.syncQueue))
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    const failedItems = [];
    for (const item of this.syncQueue) {
      try {
        // In production, sync with API
        logger.info("Syncing item", { type: item.type }, "OfflineService")
  } catch (error) {
        failedItems.push(item)
  }
    }

    this.syncQueue = failedItems;
    localStorageService.setItem('offline_sync_queue', JSON.stringify(this.syncQueue))
  }

  private saveOfflineData(): void {
    localStorageService.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(this.offlineData))
  }

  clearOfflineData(): void {
    this.offlineData = this.getDefaultData();
    this.syncQueue = [];
    this.saveOfflineData()
  }

  getSyncQueueStatus(): { itemsInQueue: number; isOnline: boolean } {
    return {
      itemsInQueue: this.syncQueue.length,
      isOnline: this.isOnline
  }
}

export const offlineService = new OfflineService();
export default offlineService;