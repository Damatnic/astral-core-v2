/**
 * Crisis Resource Cache Service for Astral Core
 * Manages offline-first caching of critical crisis resources for immediate access
 */

import { apiClient } from './apiClient';
import { astralCoreErrorService } from './astralCoreErrorService';
import { astralCoreAnalytics } from './analyticsService';

// Resource Types
export interface CrisisResource {
  id: string;
  type: ResourceType;
  priority: ResourcePriority;
  title: string;
  content: string;
  phoneNumbers?: string[];
  textNumbers?: string[];
  websites?: string[];
  location?: ResourceLocation;
  availability: ResourceAvailability;
  languages: string[];
  specializations?: string[];
  lastUpdated: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export enum ResourceType {
  HOTLINE = 'hotline',
  TEXT_LINE = 'text_line',
  CHAT_SERVICE = 'chat_service',
  EMERGENCY_CONTACT = 'emergency_contact',
  HOSPITAL = 'hospital',
  CRISIS_CENTER = 'crisis_center',
  SAFETY_PLAN = 'safety_plan',
  COPING_STRATEGY = 'coping_strategy',
  GROUNDING_TECHNIQUE = 'grounding_technique',
  BREATHING_EXERCISE = 'breathing_exercise',
  MEDITATION = 'meditation',
  SELF_CARE_GUIDE = 'self_care_guide',
}

export enum ResourcePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface ResourceLocation {
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  serviceArea?: string;
}

export interface ResourceAvailability {
  always: boolean;
  hours?: {
    [day: string]: { open: string; close: string };
  };
  holidays?: boolean;
  notes?: string;
}

export interface CacheConfig {
  maxSize: number; // Maximum cache size in MB
  ttl: number; // Time to live in milliseconds
  criticalResourcesTTL: number; // Longer TTL for critical resources
  updateInterval: number; // How often to check for updates
  offlineFirst: boolean; // Prioritize cached content
  encryptSensitive: boolean; // Encrypt sensitive resources
}

export interface CacheStats {
  totalResources: number;
  cacheSize: number;
  lastUpdate: Date;
  hitRate: number;
  missRate: number;
  criticalResourcesCount: number;
  expiringResourcesCount: number;
}

/**
 * Astral Core Crisis Resource Cache Service
 */
class AstralCoreCrisisResourceCache {
  private cache: Map<string, CrisisResource>;
  private config: CacheConfig;
  private db: IDBDatabase | null = null;
  private updateTimer: NodeJS.Timeout | null = null;
  private stats: CacheStats;
  private readonly DB_NAME = 'AstralCoreCrisisCache';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'crisis_resources';

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: 50, // 50MB default
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      criticalResourcesTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
      updateInterval: 60 * 60 * 1000, // 1 hour
      offlineFirst: true,
      encryptSensitive: true,
      ...config,
    };

    this.cache = new Map();
    this.stats = {
      totalResources: 0,
      cacheSize: 0,
      lastUpdate: new Date(),
      hitRate: 0,
      missRate: 0,
      criticalResourcesCount: 0,
      expiringResourcesCount: 0,
    };

    this.initialize();
  }

  /**
   * Initialize the cache service
   */
  private async initialize(): Promise<void> {
    try {
      // Initialize IndexedDB
      await this.initializeDB();

      // Load cached resources
      await this.loadFromDB();

      // Load default critical resources
      await this.loadDefaultResources();

      // Start update timer
      this.startUpdateTimer();

      console.log('Astral Core Crisis Cache: Initialized successfully');
    } catch (error) {
      astralCoreErrorService.handle(error as Error, {
        notify: false,
        log: true,
      });
    }
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for crisis resources
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
      };
    });
  }

  /**
   * Load resources from IndexedDB
   */
  private async loadFromDB(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const resources = request.result as CrisisResource[];
        resources.forEach(resource => {
          if (!this.isExpired(resource)) {
            this.cache.set(resource.id, resource);
          }
        });
        this.updateStats();
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to load resources from IndexedDB'));
      };
    });
  }

  /**
   * Load default critical resources
   */
  private async loadDefaultResources(): Promise<void> {
    const defaultResources: CrisisResource[] = [
      {
        id: 'crisis_988',
        type: ResourceType.HOTLINE,
        priority: ResourcePriority.CRITICAL,
        title: '988 Suicide & Crisis Lifeline',
        content: 'Free, confidential 24/7 crisis support for anyone in suicidal crisis or emotional distress.',
        phoneNumbers: ['988', '1-800-273-8255'],
        textNumbers: ['988'],
        websites: ['https://988lifeline.org'],
        availability: { always: true },
        languages: ['English', 'Spanish'],
        lastUpdated: new Date(),
      },
      {
        id: 'crisis_text',
        type: ResourceType.TEXT_LINE,
        priority: ResourcePriority.CRITICAL,
        title: 'Crisis Text Line',
        content: 'Free, 24/7 crisis support via text message. Text HOME to 741741.',
        textNumbers: ['741741'],
        websites: ['https://www.crisistextline.org'],
        availability: { always: true },
        languages: ['English', 'Spanish'],
        lastUpdated: new Date(),
      },
      {
        id: 'emergency_911',
        type: ResourceType.EMERGENCY_CONTACT,
        priority: ResourcePriority.CRITICAL,
        title: 'Emergency Services',
        content: 'For immediate life-threatening emergencies, call 911.',
        phoneNumbers: ['911'],
        availability: { always: true },
        languages: ['English', 'Spanish'],
        lastUpdated: new Date(),
      },
      {
        id: 'grounding_54321',
        type: ResourceType.GROUNDING_TECHNIQUE,
        priority: ResourcePriority.HIGH,
        title: '5-4-3-2-1 Grounding Technique',
        content: `When feeling overwhelmed, use your senses to ground yourself:
        • 5 things you can see
        • 4 things you can touch
        • 3 things you can hear
        • 2 things you can smell
        • 1 thing you can taste`,
        availability: { always: true },
        languages: ['English'],
        lastUpdated: new Date(),
      },
      {
        id: 'breathing_box',
        type: ResourceType.BREATHING_EXERCISE,
        priority: ResourcePriority.HIGH,
        title: 'Box Breathing Exercise',
        content: `A calming breathing technique:
        1. Breathe in for 4 counts
        2. Hold for 4 counts
        3. Breathe out for 4 counts
        4. Hold for 4 counts
        5. Repeat 4-8 times`,
        availability: { always: true },
        languages: ['English'],
        lastUpdated: new Date(),
      },
    ];

    for (const resource of defaultResources) {
      await this.cacheResource(resource);
    }
  }

  /**
   * Cache a crisis resource
   */
  async cacheResource(resource: CrisisResource): Promise<void> {
    // Set appropriate TTL based on priority
    if (!resource.expiresAt) {
      const ttl = resource.priority === ResourcePriority.CRITICAL
        ? this.config.criticalResourcesTTL
        : this.config.ttl;
      resource.expiresAt = new Date(Date.now() + ttl);
    }

    // Add to memory cache
    this.cache.set(resource.id, resource);

    // Persist to IndexedDB
    await this.saveToB(resource);

    // Update stats
    this.updateStats();

    // Track caching
    astralCoreAnalytics.track('crisis_resource_cached', 'crisis_intervention', {
      resourceId: resource.id,
      type: resource.type,
      priority: resource.priority,
    });
  }

  /**
   * Save resource to IndexedDB
   */
  private async saveToB(resource: CrisisResource): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(resource);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save resource to IndexedDB'));
    });
  }

  /**
   * Get a crisis resource by ID
   */
  async getResource(id: string): Promise<CrisisResource | null> {
    // Check memory cache first
    if (this.cache.has(id)) {
      const resource = this.cache.get(id)!;
      if (!this.isExpired(resource)) {
        this.stats.hitRate++;
        return resource;
      } else {
        // Remove expired resource
        this.cache.delete(id);
        await this.removeFromDB(id);
      }
    }

    this.stats.missRate++;

    // Try to fetch from server
    try {
      const resource = await this.fetchResource(id);
      if (resource) {
        await this.cacheResource(resource);
        return resource;
      }
    } catch (error) {
      console.error('Astral Core Crisis Cache: Failed to fetch resource', error);
    }

    return null;
  }

  /**
   * Get resources by type
   */
  async getResourcesByType(type: ResourceType): Promise<CrisisResource[]> {
    const resources: CrisisResource[] = [];

    for (const resource of this.cache.values()) {
      if (resource.type === type && !this.isExpired(resource)) {
        resources.push(resource);
      }
    }

    // Sort by priority
    return resources.sort((a, b) => {
      const priorityOrder = {
        [ResourcePriority.CRITICAL]: 0,
        [ResourcePriority.HIGH]: 1,
        [ResourcePriority.MEDIUM]: 2,
        [ResourcePriority.LOW]: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get critical resources for immediate crisis
   */
  async getCriticalResources(): Promise<CrisisResource[]> {
    const critical: CrisisResource[] = [];

    for (const resource of this.cache.values()) {
      if (resource.priority === ResourcePriority.CRITICAL && !this.isExpired(resource)) {
        critical.push(resource);
      }
    }

    // Ensure we have essential resources
    if (critical.length === 0) {
      await this.loadDefaultResources();
      return this.getCriticalResources();
    }

    return critical;
  }

  /**
   * Get resources for specific location
   */
  async getResourcesByLocation(location: ResourceLocation): Promise<CrisisResource[]> {
    const resources: CrisisResource[] = [];

    for (const resource of this.cache.values()) {
      if (this.matchesLocation(resource, location) && !this.isExpired(resource)) {
        resources.push(resource);
      }
    }

    return resources;
  }

  /**
   * Update cached resources from server
   */
  async updateResources(): Promise<void> {
    try {
      const updates = await apiClient.get<CrisisResource[]>('/crisis/resources/updates', {
        lastUpdate: this.stats.lastUpdate.toISOString(),
      });

      for (const resource of updates) {
        await this.cacheResource(resource);
      }

      this.stats.lastUpdate = new Date();

      // Track update
      astralCoreAnalytics.track('crisis_cache_updated', 'crisis_intervention', {
        resourcesUpdated: updates.length,
      });
    } catch (error) {
      console.error('Astral Core Crisis Cache: Failed to update resources', error);
    }
  }

  /**
   * Fetch a specific resource from server
   */
  private async fetchResource(id: string): Promise<CrisisResource | null> {
    try {
      const resource = await apiClient.get<CrisisResource>(`/crisis/resources/${id}`);
      return resource;
    } catch (error) {
      astralCoreErrorService.handle(error as Error, {
        notify: false,
        log: true,
      });
      return null;
    }
  }

  /**
   * Check if resource matches location
   */
  private matchesLocation(resource: CrisisResource, location: ResourceLocation): boolean {
    if (!resource.location) return true; // Global resource

    if (location.country && resource.location.country !== location.country) {
      return false;
    }

    if (location.state && resource.location.state !== location.state) {
      return false;
    }

    if (location.city && resource.location.city !== location.city) {
      return false;
    }

    return true;
  }

  /**
   * Check if resource is expired
   */
  private isExpired(resource: CrisisResource): boolean {
    if (!resource.expiresAt) return false;
    return new Date() > new Date(resource.expiresAt);
  }

  /**
   * Remove resource from IndexedDB
   */
  private async removeFromDB(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove resource from IndexedDB'));
    });
  }

  /**
   * Clear expired resources
   */
  async clearExpired(): Promise<void> {
    const expired: string[] = [];

    for (const [id, resource] of this.cache.entries()) {
      if (this.isExpired(resource)) {
        expired.push(id);
      }
    }

    for (const id of expired) {
      this.cache.delete(id);
      await this.removeFromDB(id);
    }

    this.updateStats();
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.totalResources = this.cache.size;
    this.stats.cacheSize = this.estimateCacheSize();
    
    let criticalCount = 0;
    let expiringCount = 0;
    const now = Date.now();
    const expiringThreshold = 60 * 60 * 1000; // 1 hour

    for (const resource of this.cache.values()) {
      if (resource.priority === ResourcePriority.CRITICAL) {
        criticalCount++;
      }

      if (resource.expiresAt) {
        const timeToExpire = new Date(resource.expiresAt).getTime() - now;
        if (timeToExpire < expiringThreshold) {
          expiringCount++;
        }
      }
    }

    this.stats.criticalResourcesCount = criticalCount;
    this.stats.expiringResourcesCount = expiringCount;
  }

  /**
   * Estimate cache size in MB
   */
  private estimateCacheSize(): number {
    let size = 0;
    for (const resource of this.cache.values()) {
      size += JSON.stringify(resource).length;
    }
    return size / (1024 * 1024); // Convert to MB
  }

  /**
   * Start update timer
   */
  private startUpdateTimer(): void {
    this.stopUpdateTimer();

    this.updateTimer = setInterval(async () => {
      await this.clearExpired();
      await this.updateResources();
    }, this.config.updateInterval);
  }

  /**
   * Stop update timer
   */
  private stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all cached resources
   */
  async clearCache(): Promise<void> {
    this.cache.clear();

    if (this.db) {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      await store.clear();
    }

    this.updateStats();
  }

  /**
   * Preload critical resources
   */
  async preloadCriticalResources(): Promise<void> {
    try {
      const resources = await apiClient.get<CrisisResource[]>('/crisis/resources/critical');
      
      for (const resource of resources) {
        await this.cacheResource(resource);
      }

      console.log(`Astral Core Crisis Cache: Preloaded ${resources.length} critical resources`);
    } catch (error) {
      console.error('Astral Core Crisis Cache: Failed to preload critical resources', error);
      // Fall back to default resources
      await this.loadDefaultResources();
    }
  }

  /**
   * Export cached resources for backup
   */
  async exportCache(): Promise<string> {
    const resources = Array.from(this.cache.values());
    return JSON.stringify(resources, null, 2);
  }

  /**
   * Import resources from backup
   */
  async importCache(data: string): Promise<void> {
    try {
      const resources = JSON.parse(data) as CrisisResource[];
      
      for (const resource of resources) {
        await this.cacheResource(resource);
      }

      console.log(`Astral Core Crisis Cache: Imported ${resources.length} resources`);
    } catch (error) {
      astralCoreErrorService.handle(error as Error, {
        notify: true,
        log: true,
      });
    }
  }

  /**
   * Cleanup and shutdown
   */
  destroy(): void {
    this.stopUpdateTimer();
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.cache.clear();
  }
}

// Export singleton instance
export const astralCoreCrisisResourceCache = new AstralCoreCrisisResourceCache();

// Auto-preload critical resources on initialization
astralCoreCrisisResourceCache.preloadCriticalResources();

export default astralCoreCrisisResourceCache;