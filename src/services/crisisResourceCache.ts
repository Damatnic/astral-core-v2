/**
 * Crisis Resource Cache Service for Astral Core
 * Ensures critical mental health resources are cached and available offline
 */

import apiService from './apiService';
import notificationService from './notificationService';
import { astralCoreAnalytics } from './analyticsService';

export interface CrisisResource {
  id: string;
  name: string;
  type: 'hotline' | 'text' | 'chat' | 'app' | 'website' | 'facility' | 'guide';
  category: 'suicide' | 'crisis' | 'substance' | 'domestic' | 'youth' | 'veteran' | 'lgbtq' | 'general';
  priority: 'immediate' | 'urgent' | 'standard';
  availability: '24/7' | 'business' | 'limited';
  contact: {
    phone?: string;
    text?: string;
    chat?: string;
    website?: string;
    email?: string;
    address?: string;
  };
  description: string;
  languages: string[];
  region: string;
  features: string[];
  lastUpdated: Date;
  verified: boolean;
}

export interface CrisisGuide {
  id: string;
  title: string;
  type: 'safety-plan' | 'coping-strategies' | 'warning-signs' | 'de-escalation' | 'support';
  content: string;
  steps?: string[];
  keywords: string[];
  lastUpdated: Date;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expires: number;
  version: string;
}

class CrisisResourceCacheService {
  private readonly CACHE_VERSION = '1.0.0';
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly CRITICAL_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days for critical resources
  private readonly DB_NAME = 'AstralCoreCrisisCache';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;
  private memoryCache: Map<string, any> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;

  // Critical resources that must always be cached
  private readonly criticalResources: CrisisResource[] = [
    {
      id: '988',
      name: '988 Suicide & Crisis Lifeline',
      type: 'hotline',
      category: 'suicide',
      priority: 'immediate',
      availability: '24/7',
      contact: {
        phone: '988',
        text: '988',
        chat: 'https://988lifeline.org/chat',
        website: 'https://988lifeline.org'
      },
      description: 'Free, confidential 24/7 support for people in distress',
      languages: ['English', 'Spanish'],
      region: 'USA',
      features: ['Immediate support', 'Trained counselors', 'Text available', 'Chat available'],
      lastUpdated: new Date(),
      verified: true
    },
    {
      id: 'crisis-text',
      name: 'Crisis Text Line',
      type: 'text',
      category: 'crisis',
      priority: 'immediate',
      availability: '24/7',
      contact: {
        text: '741741',
        website: 'https://www.crisistextline.org'
      },
      description: 'Free 24/7 support via text message',
      languages: ['English', 'Spanish'],
      region: 'USA',
      features: ['Anonymous', 'Text-based', 'Trained volunteers'],
      lastUpdated: new Date(),
      verified: true
    },
    {
      id: 'trevor-project',
      name: 'The Trevor Project',
      type: 'hotline',
      category: 'lgbtq',
      priority: 'immediate',
      availability: '24/7',
      contact: {
        phone: '1-866-488-7386',
        text: 'START to 678-678',
        chat: 'https://www.thetrevorproject.org/get-help',
        website: 'https://www.thetrevorproject.org'
      },
      description: 'Crisis intervention for LGBTQ youth',
      languages: ['English'],
      region: 'USA',
      features: ['LGBTQ specialized', 'Youth focused', 'Multiple contact methods'],
      lastUpdated: new Date(),
      verified: true
    },
    {
      id: 'veterans-crisis',
      name: 'Veterans Crisis Line',
      type: 'hotline',
      category: 'veteran',
      priority: 'immediate',
      availability: '24/7',
      contact: {
        phone: '988 then Press 1',
        text: '838255',
        chat: 'https://www.veteranscrisisline.net/get-help/chat',
        website: 'https://www.veteranscrisisline.net'
      },
      description: 'Confidential crisis support for Veterans and their families',
      languages: ['English', 'Spanish'],
      region: 'USA',
      features: ['Veteran specialized', 'Military understanding', 'Family support'],
      lastUpdated: new Date(),
      verified: true
    }
  ];

  // Essential crisis guides
  private readonly essentialGuides: CrisisGuide[] = [
    {
      id: 'safety-plan',
      title: 'Create Your Safety Plan',
      type: 'safety-plan',
      content: 'A safety plan is a personalized, practical plan to help you avoid a crisis and cope when experiencing suicidal thoughts.',
      steps: [
        'Recognize your personal warning signs',
        'Use internal coping strategies',
        'Reach out to social contacts for distraction',
        'Contact family or friends who can help',
        'Contact mental health professionals',
        'Ensure your environment is safe'
      ],
      keywords: ['safety', 'plan', 'suicide', 'prevention', 'coping'],
      lastUpdated: new Date()
    },
    {
      id: 'grounding-techniques',
      title: 'Grounding Techniques for Crisis',
      type: 'coping-strategies',
      content: 'Grounding techniques help you stay present and manage overwhelming emotions.',
      steps: [
        '5-4-3-2-1 Technique: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste',
        'Deep breathing: Inhale for 4, hold for 4, exhale for 4',
        'Progressive muscle relaxation',
        'Hold an ice cube or splash cold water on your face',
        'Focus on a calming image or memory'
      ],
      keywords: ['grounding', 'anxiety', 'panic', 'coping', 'techniques'],
      lastUpdated: new Date()
    },
    {
      id: 'warning-signs',
      title: 'Recognize Crisis Warning Signs',
      type: 'warning-signs',
      content: 'Learn to identify warning signs that indicate you or someone else may be in crisis.',
      steps: [
        'Talking about wanting to die or kill oneself',
        'Looking for ways to kill oneself',
        'Talking about feeling hopeless or having no purpose',
        'Talking about feeling trapped or in unbearable pain',
        'Talking about being a burden to others',
        'Increasing use of alcohol or drugs',
        'Acting anxious, agitated, or reckless',
        'Sleeping too little or too much',
        'Withdrawing or feeling isolated',
        'Showing rage or talking about seeking revenge',
        'Displaying extreme mood swings'
      ],
      keywords: ['warning', 'signs', 'suicide', 'crisis', 'recognition'],
      lastUpdated: new Date()
    }
  ];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the cache service
   */
  private async initialize() {
    try {
      // Initialize IndexedDB
      await this.initializeDB();
      
      // Load critical resources into cache
      await this.cacheCriticalResources();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start periodic updates
      this.startPeriodicUpdates();
      
      // Track initialization
      astralCoreAnalytics.track('crisis_cache_initialized', 'crisis_intervention', {
        cachedResources: this.criticalResources.length,
        cachedGuides: this.essentialGuides.length
      });
    } catch (error) {
      console.error('Failed to initialize crisis resource cache:', error);
      // Fall back to localStorage if IndexedDB fails
      this.fallbackToLocalStorage();
    }
  }

  /**
   * Initialize IndexedDB for robust offline storage
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Crisis cache database initialized');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('resources')) {
          const resourceStore = db.createObjectStore('resources', { keyPath: 'id' });
          resourceStore.createIndex('category', 'category', { unique: false });
          resourceStore.createIndex('priority', 'priority', { unique: false });
          resourceStore.createIndex('type', 'type', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('guides')) {
          const guideStore = db.createObjectStore('guides', { keyPath: 'id' });
          guideStore.createIndex('type', 'type', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Cache critical resources
   */
  private async cacheCriticalResources() {
    // Cache in IndexedDB
    for (const resource of this.criticalResources) {
      await this.cacheResource(resource, true);
    }
    
    // Cache essential guides
    for (const guide of this.essentialGuides) {
      await this.cacheGuide(guide);
    }
    
    // Also cache in memory for instant access
    this.criticalResources.forEach(resource => {
      this.memoryCache.set(`resource_${resource.id}`, resource);
    });
    
    this.essentialGuides.forEach(guide => {
      this.memoryCache.set(`guide_${guide.id}`, guide);
    });
  }

  /**
   * Cache a resource in IndexedDB
   */
  async cacheResource(resource: CrisisResource, isCritical: boolean = false): Promise<void> {
    if (!this.db) {
      this.cacheInLocalStorage('resource', resource);
      return;
    }
    
    const cached: CachedData<CrisisResource> = {
      data: resource,
      timestamp: Date.now(),
      expires: Date.now() + (isCritical ? this.CRITICAL_CACHE_DURATION : this.CACHE_DURATION),
      version: this.CACHE_VERSION
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['resources'], 'readwrite');
      const store = transaction.objectStore('resources');
      const request = store.put(cached.data);
      
      request.onsuccess = () => {
        // Also update memory cache
        this.memoryCache.set(`resource_${resource.id}`, resource);
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to cache resource:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Cache a guide in IndexedDB
   */
  async cacheGuide(guide: CrisisGuide): Promise<void> {
    if (!this.db) {
      this.cacheInLocalStorage('guide', guide);
      return;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['guides'], 'readwrite');
      const store = transaction.objectStore('guides');
      const request = store.put(guide);
      
      request.onsuccess = () => {
        // Also update memory cache
        this.memoryCache.set(`guide_${guide.id}`, guide);
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to cache guide:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get resource from cache
   */
  async getResource(id: string): Promise<CrisisResource | null> {
    // Check memory cache first
    const memCached = this.memoryCache.get(`resource_${id}`);
    if (memCached) return memCached;
    
    // Check IndexedDB
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['resources'], 'readonly');
        const store = transaction.objectStore('resources');
        const request = store.get(id);
        
        request.onsuccess = () => {
          const resource = request.result;
          if (resource) {
            // Update memory cache
            this.memoryCache.set(`resource_${id}`, resource);
          }
          resolve(resource || null);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
    
    // Fall back to localStorage
    return this.getFromLocalStorage('resource', id);
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(category: string): Promise<CrisisResource[]> {
    if (!this.db) {
      return this.getAllResourcesFromLocalStorage().filter(r => r.category === category);
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['resources'], 'readonly');
      const store = transaction.objectStore('resources');
      const index = store.index('category');
      const request = index.getAll(category);
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get immediate priority resources
   */
  async getImmediateResources(): Promise<CrisisResource[]> {
    if (!this.db) {
      return this.getAllResourcesFromLocalStorage().filter(r => r.priority === 'immediate');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['resources'], 'readonly');
      const store = transaction.objectStore('resources');
      const index = store.index('priority');
      const request = index.getAll('immediate');
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get guide from cache
   */
  async getGuide(id: string): Promise<CrisisGuide | null> {
    // Check memory cache first
    const memCached = this.memoryCache.get(`guide_${id}`);
    if (memCached) return memCached;
    
    // Check IndexedDB
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['guides'], 'readonly');
        const store = transaction.objectStore('guides');
        const request = store.get(id);
        
        request.onsuccess = () => {
          const guide = request.result;
          if (guide) {
            // Update memory cache
            this.memoryCache.set(`guide_${id}`, guide);
          }
          resolve(guide || null);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
    
    // Fall back to localStorage
    return this.getFromLocalStorage('guide', id);
  }

  /**
   * Update resources from server
   */
  async updateResourcesFromServer() {
    if (!this.isOnline) return;
    
    try {
      // Fetch latest resources
      const resources = await apiService.get<CrisisResource[]>('/crisis/resources');
      const guides = await apiService.get<CrisisGuide[]>('/crisis/guides');
      
      // Update cache
      for (const resource of resources) {
        await this.cacheResource(resource);
      }
      
      for (const guide of guides) {
        await this.cacheGuide(guide);
      }
      
      // Update metadata
      await this.updateMetadata('lastUpdate', Date.now());
      
      // Track update
      astralCoreAnalytics.track('crisis_cache_updated', 'crisis_intervention', {
        resourceCount: resources.length,
        guideCount: guides.length
      });
      
      console.log('Crisis resources updated successfully');
    } catch (error) {
      console.error('Failed to update crisis resources:', error);
      // Continue using cached data
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateResourcesFromServer();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      notificationService.addToast('Offline mode: Crisis resources available from cache', 'info');
    });
    
    // Listen for storage events (sync across tabs)
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('crisis_cache_')) {
        // Invalidate memory cache for changed items
        const id = event.key.replace('crisis_cache_', '');
        this.memoryCache.delete(id);
      }
    });
  }

  /**
   * Start periodic updates
   */
  private startPeriodicUpdates() {
    // Update every 6 hours
    this.updateInterval = setInterval(() => {
      this.updateResourcesFromServer();
    }, 6 * 60 * 60 * 1000);
    
    // Also update when app becomes active
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        const lastUpdate = this.memoryCache.get('lastUpdate') || 0;
        const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate > 1) {
          this.updateResourcesFromServer();
        }
      }
    });
  }

  /**
   * Fallback to localStorage if IndexedDB fails
   */
  private fallbackToLocalStorage() {
    console.warn('Falling back to localStorage for crisis cache');
    
    // Cache critical resources in localStorage
    this.criticalResources.forEach(resource => {
      this.cacheInLocalStorage('resource', resource);
    });
    
    this.essentialGuides.forEach(guide => {
      this.cacheInLocalStorage('guide', guide);
    });
  }

  /**
   * Cache in localStorage
   */
  private cacheInLocalStorage(type: 'resource' | 'guide', data: any) {
    const key = `crisis_cache_${type}_${data.id}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache in localStorage:', error);
      // Clear old items if storage is full
      this.clearOldLocalStorageItems();
    }
  }

  /**
   * Get from localStorage
   */
  private getFromLocalStorage(type: 'resource' | 'guide', id: string): any {
    const key = `crisis_cache_${type}_${id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Get all resources from localStorage
   */
  private getAllResourcesFromLocalStorage(): CrisisResource[] {
    const resources: CrisisResource[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('crisis_cache_resource_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          resources.push(JSON.parse(stored));
        }
      }
    }
    
    return resources;
  }

  /**
   * Clear old localStorage items
   */
  private clearOldLocalStorageItems() {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('crisis_cache_')) {
        keys.push(key);
      }
    }
    
    // Remove oldest items (keep critical resources)
    keys.forEach(key => {
      const isCritical = this.criticalResources.some(r => 
        key.includes(r.id)
      );
      
      if (!isCritical) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Update metadata
   */
  private async updateMetadata(key: string, value: any): Promise<void> {
    this.memoryCache.set(key, value);
    
    if (!this.db) {
      localStorage.setItem(`crisis_cache_meta_${key}`, JSON.stringify(value));
      return;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key, value });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached data
   */
  async clearCache() {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['resources', 'guides', 'metadata'], 'readwrite');
      
      transaction.objectStore('resources').clear();
      transaction.objectStore('guides').clear();
      transaction.objectStore('metadata').clear();
    }
    
    // Clear localStorage
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('crisis_cache_')) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    
    // Re-cache critical resources
    await this.cacheCriticalResources();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalResources: number;
    totalGuides: number;
    memorySize: number;
    lastUpdate: number;
    isOnline: boolean;
  }> {
    let totalResources = 0;
    let totalGuides = 0;
    
    if (this.db) {
      const resourceTx = this.db.transaction(['resources'], 'readonly');
      const resourceCount = await new Promise<number>((resolve) => {
        const request = resourceTx.objectStore('resources').count();
        request.onsuccess = () => resolve(request.result);
      });
      totalResources = resourceCount;
      
      const guideTx = this.db.transaction(['guides'], 'readonly');
      const guideCount = await new Promise<number>((resolve) => {
        const request = guideTx.objectStore('guides').count();
        request.onsuccess = () => resolve(request.result);
      });
      totalGuides = guideCount;
    }
    
    return {
      totalResources,
      totalGuides,
      memorySize: this.memoryCache.size,
      lastUpdate: this.memoryCache.get('lastUpdate') || 0,
      isOnline: this.isOnline
    };
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    if (this.db) {
      this.db.close();
    }
    
    this.memoryCache.clear();
  }
}

// Create and export singleton instance
const crisisResourceCache = new CrisisResourceCacheService();

export default crisisResourceCache;