/**
 * Enhanced Offline Service for AstralCore
 * 
 * Provides comprehensive offline functionality with multilingual crisis resources,
 * optimized for low-connectivity environments common in underserved communities.
 * 
 * Features:
 * - Multilingual crisis resources (8 languages)
 * - Offline AI crisis detection capabilities
 * - Cultural context preservation
 * - Progressive data synchronization
 * - Emergency protocol activation
 * 
 * @license Apache-2.0
 */

import { culturalContextService } from './culturalContextService';
import { enhancedAICrisisDetectionService } from './enhancedAiCrisisDetectionService';

type SeverityLevel = 'low' | 'medium' | 'high';

interface OfflineResource {
  id: string;
  type: 'crisis-contact' | 'coping-strategy' | 'safety-plan' | 'guidance' | 'emergency-protocol';
  language: string;
  culturalContext: string;
  title: string;
  content: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  tags: string[];
  lastUpdated: number;
  emergencyContact?: {
    phone: string;
    text: string;
    chat?: string;
  };
}

interface OfflineCapabilities {
  hasStorage: boolean;
  hasIndexedDB: boolean;
  storageQuota: number;
  isOnline: boolean;
  networkType?: string;
  downloadSpeed?: number;
  hasServiceWorker: boolean;
  cacheStatus: {
    staticResources: boolean;
    crisisResources: boolean;
    translations: boolean;
    culturalContent: boolean;
    aiModels: boolean;
  };
}

interface SyncQueueItem {
  id: string;
  type: 'crisis-event' | 'session-data' | 'analytics' | 'safety-plan';
  data: any;
  timestamp: number;
  priority: number;
  retryCount: number;
  culturalContext: string;
  language: string;
}

class EnhancedOfflineService {
  private dbName = 'AstralCoreOfflineDB';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private syncQueue: SyncQueueItem[] = [];
  private capabilities: OfflineCapabilities | null = null;
  private statusListeners: Array<(status: OfflineCapabilities) => void> = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the offline service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[Enhanced Offline] Initializing offline service...');

    try {
      // Detect offline capabilities
      this.capabilities = await this.detectCapabilities();
      
      // Initialize IndexedDB
      await this.initializeDatabase();
      
      // Load multilingual crisis resources
      await this.loadCrisisResources();
      
      // Setup network monitoring
      this.setupNetworkMonitoring();
      
      // Initialize sync queue processing
      this.initializeSyncQueue();
      
      // Setup emergency protocols
      this.setupEmergencyProtocols();
      
      this.isInitialized = true;
      console.log('[Enhanced Offline] Service initialized successfully');
      this.notifyStatusChange();
      
    } catch (error) {
      console.error('[Enhanced Offline] Failed to initialize:', error);
      // Fallback to basic offline mode
      this.initializeFallbackMode();
    }
  }

  /**
   * Detect device offline capabilities
   */
  private async detectCapabilities(): Promise<OfflineCapabilities> {
    const capabilities: OfflineCapabilities = {
      hasStorage: 'localStorage' in window,
      hasIndexedDB: 'indexedDB' in window,
      storageQuota: 0,
      isOnline: navigator.onLine,
      hasServiceWorker: 'serviceWorker' in navigator,
      cacheStatus: {
        staticResources: false,
        crisisResources: false,
        translations: false,
        culturalContent: false,
        aiModels: false
      }
    };

    // Check storage quota
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        capabilities.storageQuota = estimate.quota || 0;
      }
    } catch (error) {
      console.warn('[Enhanced Offline] Could not estimate storage:', error);
    }

    // Check network information
    try {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        capabilities.networkType = connection.effectiveType;
        capabilities.downloadSpeed = connection.downlink;
      }
    } catch (error) {
      console.warn('[Enhanced Offline] Could not get network info:', error);
    }

    // Check cache status
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        capabilities.cacheStatus.staticResources = cacheNames.some(name => name.includes('static'));
        capabilities.cacheStatus.crisisResources = cacheNames.some(name => name.includes('crisis'));
        capabilities.cacheStatus.translations = cacheNames.some(name => name.includes('i18n'));
      } catch (error) {
        console.warn('[Enhanced Offline] Could not check cache status:', error);
      }
    }

    return capabilities;
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crisis resources store
        if (!db.objectStoreNames.contains('crisisResources')) {
          const crisisStore = db.createObjectStore('crisisResources', { keyPath: 'id' });
          crisisStore.createIndex('language', 'language', { unique: false });
          crisisStore.createIndex('culturalContext', 'culturalContext', { unique: false });
          crisisStore.createIndex('priority', 'priority', { unique: false });
          crisisStore.createIndex('type', 'type', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('priority', 'priority', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Translations store
        if (!db.objectStoreNames.contains('translations')) {
          const translationStore = db.createObjectStore('translations', { keyPath: 'id' });
          translationStore.createIndex('language', 'language', { unique: false });
        }

        // Cultural content store
        if (!db.objectStoreNames.contains('culturalContent')) {
          const culturalStore = db.createObjectStore('culturalContent', { keyPath: 'id' });
          culturalStore.createIndex('culturalContext', 'culturalContext', { unique: false });
        }

        // User data store (encrypted)
        if (!db.objectStoreNames.contains('userData')) {
          const userStore = db.createObjectStore('userData', { keyPath: 'id' });
          userStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  /**
   * Load comprehensive multilingual crisis resources
   */
  private async loadCrisisResources(): Promise<void> {
    const languages = ['en', 'es', 'pt-BR', 'pt', 'ar', 'zh', 'vi', 'tl'];
    const culturalContexts = [
      'western', 'hispanic-latino', 'brazilian', 'portuguese',
      'arabic', 'chinese', 'vietnamese', 'filipino'
    ];

    for (const language of languages) {
      for (const culturalContext of culturalContexts) {
        const resources = await this.generateCrisisResourcesForContext(language, culturalContext);
        await this.storeCrisisResources(resources);
      }
    }

    console.log(`[Enhanced Offline] Loaded crisis resources for ${languages.length} languages`);
  }

  /**
   * Generate culturally-appropriate crisis resources for a specific context
   */
  private async generateCrisisResourcesForContext(
    language: string, 
    culturalContext: string
  ): Promise<OfflineResource[]> {
    const contextInfo = culturalContextService.getCulturalContext(culturalContext);
    
    const resources: OfflineResource[] = [
      // Emergency contacts
      {
        id: `crisis-contact-${language}-${culturalContext}`,
        type: 'crisis-contact',
        language,
        culturalContext,
        title: this.getLocalizedText(language, 'crisis.emergency.title'),
        content: this.getLocalizedText(language, 'crisis.emergency.description'),
        priority: 'critical',
        category: 'emergency',
        tags: ['emergency', 'crisis', 'immediate-help'],
        lastUpdated: Date.now(),
        emergencyContact: this.getEmergencyContactsForRegion(language, culturalContext)
      },

      // Coping strategies
      {
        id: `coping-${language}-${culturalContext}`,
        type: 'coping-strategy',
        language,
        culturalContext,
        title: this.getLocalizedText(language, 'coping.strategies.title'),
        content: this.getCulturalCopingStrategies(language, culturalContext),
        priority: 'high',
        category: 'coping',
        tags: ['coping', 'strategies', 'self-help'],
        lastUpdated: Date.now()
      },

      // Safety planning
      {
        id: `safety-plan-${language}-${culturalContext}`,
        type: 'safety-plan',
        language,
        culturalContext,
        title: this.getLocalizedText(language, 'safety.plan.title'),
        content: this.getCulturalSafetyPlan(language, culturalContext),
        priority: 'high',
        category: 'safety-planning',
        tags: ['safety', 'planning', 'prevention'],
        lastUpdated: Date.now()
      },

      // Cultural guidance
      {
        id: `guidance-${language}-${culturalContext}`,
        type: 'guidance',
        language,
        culturalContext,
        title: this.getLocalizedText(language, 'cultural.guidance.title'),
        content: this.getCulturalGuidance(language, culturalContext, contextInfo),
        priority: 'medium',
        category: 'cultural-support',
        tags: ['cultural', 'guidance', 'family', 'community'],
        lastUpdated: Date.now()
      },

      // Emergency protocols
      {
        id: `emergency-protocol-${language}-${culturalContext}`,
        type: 'emergency-protocol',
        language,
        culturalContext,
        title: this.getLocalizedText(language, 'emergency.protocol.title'),
        content: this.getEmergencyProtocol(language, culturalContext),
        priority: 'critical',
        category: 'emergency-protocol',
        tags: ['emergency', 'protocol', 'steps'],
        lastUpdated: Date.now()
      }
    ];

    return resources;
  }

  /**
   * Get emergency contacts for specific region/culture
   */
  private getEmergencyContactsForRegion(_language: string, culturalContext: string): {
    phone: string;
    text: string;
    chat?: string;
  } {
    // Regional emergency contacts based on cultural context
    const contacts: { [key: string]: any } = {
      'western': {
        phone: '988', // US/Canada Suicide & Crisis Lifeline
        text: '741741', // Crisis Text Line
        chat: 'https://suicidepreventionlifeline.org/chat/'
      },
      'hispanic-latino': {
        phone: '1-888-628-9454', // Spanish National Suicide Prevention Lifeline
        text: 'HABLANOS to 741741',
        chat: 'https://suicidepreventionlifeline.org/chat/'
      },
      'brazilian': {
        phone: '188', // Centro de Valorização da Vida (CVV)
        text: '(11) 96363-4111',
        chat: 'https://www.cvv.org.br/fale-conosco/'
      },
      'portuguese': {
        phone: '213 544 545', // SOS Voz Amiga
        text: '(+351) 96 898 21 61',
        chat: 'https://sosvozamiga.org/contactos/'
      },
      'arabic': {
        phone: '1-800-273-8255', // International - many Arabic countries use this
        text: 'HELP to 741741',
        chat: 'https://suicidepreventionlifeline.org/chat/'
      },
      'chinese': {
        phone: '400-161-9995', // Beijing Crisis Intervention
        text: '+86-400-161-9995',
        chat: 'https://www.crisis.org.cn/'
      },
      'vietnamese': {
        phone: '1-800-273-8255', // International access
        text: 'HELLO to 741741',
        chat: 'https://suicidepreventionlifeline.org/chat/'
      },
      'filipino': {
        phone: '(02) 804-4673', // In Touch Crisis Line Philippines
        text: '0917-800-1123',
        chat: 'https://www.hopeline.ph/'
      }
    };

    return contacts[culturalContext] || contacts['western'];
  }

  /**
   * Store crisis resources in IndexedDB
   */
  private async storeCrisisResources(resources: OfflineResource[]): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['crisisResources'], 'readwrite');
    const store = transaction.objectStore('crisisResources');

    for (const resource of resources) {
      await new Promise<void>((resolve, reject) => {
        const request = store.put(resource);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Setup network monitoring for intelligent sync
   */
  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      console.log('[Enhanced Offline] Network restored - starting sync');
      this.capabilities!.isOnline = true;
      this.processSyncQueue();
      this.notifyStatusChange();
    });

    window.addEventListener('offline', () => {
      console.log('[Enhanced Offline] Network lost - activating offline mode');
      this.capabilities!.isOnline = false;
      this.activateOfflineMode();
      this.notifyStatusChange();
    });

    // Monitor connection quality
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        this.updateNetworkCapabilities();
      });
    }
  }

  /**
   * Get offline crisis resources
   */
  async getCrisisResources(
    language: string = 'en',
    culturalContext: string = 'western',
    type?: string
  ): Promise<OfflineResource[]> {
    if (!this.db) {
      return this.getFallbackCrisisResources(language, culturalContext);
    }

    const transaction = this.db.transaction(['crisisResources'], 'readonly');
    const store = transaction.objectStore('crisisResources');
    
    // Get all resources for language and cultural context
    const languageIndex = store.index('language');
    const languageRequest = languageIndex.getAll(language);
    
    return new Promise((resolve, reject) => {
      languageRequest.onsuccess = () => {
        const resources = languageRequest.result.filter(resource => 
          resource.culturalContext === culturalContext &&
          (type ? resource.type === type : true)
        );
        
        // Sort by priority
        resources.sort((a: any, b: any) => {
          const priorityOrder: { [key: string]: number } = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        resolve(resources);
      };
      languageRequest.onerror = () => reject(languageRequest.error);
    });
  }

  /**
   * Perform offline crisis detection
   */
  async detectCrisisOffline(text: string, language: string, culturalContext: string): Promise<{
    isCrisis: boolean;
    severity: SeverityLevel;
    keywords: string[];
    recommendations: OfflineResource[];
    confidence: number;
  }> {
    try {
      // Use enhanced AI crisis detection service if available
      const analysis = await enhancedAICrisisDetectionService.analyzeCrisisWithML(
        text, 
        { language, culturalContext }
      );

      // Get offline recommendations based on analysis
      const recommendations = await this.getCrisisResources(
        language,
        culturalContext,
        (analysis.realTimeRisk?.immediateRisk || 0) > 7 ? 'crisis-contact' : 'coping-strategy'
      );

      // Determine severity based on risk level
      let severity: SeverityLevel = 'low';
      const immediateRisk = analysis.realTimeRisk?.immediateRisk || 0;
      if (immediateRisk > 7) {
        severity = 'high';
      } else if (immediateRisk > 5) {
        severity = 'medium';
      }

      return {
        isCrisis: immediateRisk > 5,
        severity,
        keywords: [], // ML analysis doesn't provide specific trigger words
        recommendations: recommendations.slice(0, 3),
        confidence: analysis.confidence
      };
    } catch (error) {
      console.warn('[Enhanced Offline] ML crisis detection failed, using fallback:', error);
      return this.fallbackCrisisDetection(text, language, culturalContext);
    }
  }

  /**
   * Add item to sync queue for when online
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(syncItem);

    // Store in IndexedDB for persistence
    if (this.db) {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      store.put(syncItem);
    }

    // Process immediately if online
    if (this.capabilities?.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Initialize fallback mode for basic offline functionality
   */
  private initializeFallbackMode(): void {
    console.log('[Enhanced Offline] Initializing fallback mode');
    
    // Store basic crisis resources in localStorage
    const fallbackResources = this.getFallbackCrisisResources('en', 'western');
    localStorage.setItem('astral_offline_crisis_resources', JSON.stringify(fallbackResources));
    
    this.capabilities = {
      hasStorage: true,
      hasIndexedDB: false,
      storageQuota: 0,
      isOnline: navigator.onLine,
      hasServiceWorker: false,
      cacheStatus: {
        staticResources: false,
        crisisResources: true, // We have fallback resources
        translations: false,
        culturalContent: false,
        aiModels: false
      }
    };
    
    this.isInitialized = true;
    this.notifyStatusChange();
  }

  /**
   * Helper methods for localized content
   */
  private getLocalizedText(language: string, key: string): string {
    const translations: { [key: string]: { [lang: string]: string } } = {
      'crisis.emergency.title': {
        'en': 'Emergency Crisis Support',
        'es': 'Apoyo de Crisis de Emergencia',
        'pt-BR': 'Suporte de Crise de Emergência',
        'pt': 'Apoio de Crise de Emergência',
        'ar': 'دعم الأزمات الطارئة',
        'zh': '紧急危机支持',
        'vi': 'Hỗ trợ Khủng hoảng Khẩn cấp',
        'tl': 'Emergency Crisis Support'
      },
      'crisis.emergency.description': {
        'en': 'If you are in immediate danger or having thoughts of self-harm, please contact emergency services or a crisis hotline immediately.',
        'es': 'Si estás en peligro inmediato o tienes pensamientos de autolesión, por favor contacta servicios de emergencia o una línea de crisis inmediatamente.',
        'pt-BR': 'Se você está em perigo imediato ou tendo pensamentos de autolesão, por favor contate serviços de emergência ou uma linha de crise imediatamente.',
        'pt': 'Se está em perigo imediato ou tem pensamentos de autolesão, por favor contacte serviços de emergência ou uma linha de crise imediatamente.',
        'ar': 'إذا كنت في خطر فوري أو لديك أفكار إيذاء النفس، يرجى الاتصال بخدمات الطوارئ أو خط الأزمات على الفور.',
        'zh': '如果您处于紧急危险中或有自我伤害的想法，请立即联系紧急服务或危机热线。',
        'vi': 'Nếu bạn đang gặp nguy hiểm trực tiếp hoặc có ý nghĩ tự làm hại bản thân, vui lòng liên hệ dịch vụ cấp cứu hoặc đường dây nóng khủng hoảng ngay lập tức.',
        'tl': 'Kung ikaw ay nasa agarang panganib o may mga isipin ng pagsakit sa sarili, mangyaring makipag-ugnayan sa mga serbisyong pang-emergency o crisis hotline kaagad.'
      }
      // Add more translations as needed
    };

    return translations[key]?.[language] || translations[key]?.['en'] || key;
  }

  private getCulturalCopingStrategies(language: string, _culturalContext: string): string {
    // Return culturally-appropriate coping strategies
    // This would be expanded with actual content
    return this.getLocalizedText(language, 'coping.strategies.content');
  }

  private getCulturalSafetyPlan(language: string, _culturalContext: string): string {
    // Return culturally-appropriate safety planning guidance
    return this.getLocalizedText(language, 'safety.plan.content');
  }

  private getCulturalGuidance(language: string, _culturalContext: string, _contextInfo: any): string {
    // Return cultural guidance considering family involvement, stigma, etc.
    return this.getLocalizedText(language, 'cultural.guidance.content');
  }

  private getEmergencyProtocol(language: string, _culturalContext: string): string {
    // Return step-by-step emergency protocol
    return this.getLocalizedText(language, 'emergency.protocol.content');
  }

  private getFallbackCrisisResources(language: string, culturalContext: string): OfflineResource[] {
    // Basic crisis resources as fallback
    return [
      {
        id: 'fallback-crisis-contact',
        type: 'crisis-contact',
        language,
        culturalContext,
        title: 'Emergency Support',
        content: 'If you are in immediate danger, please contact emergency services.',
        priority: 'critical',
        category: 'emergency',
        tags: ['emergency'],
        lastUpdated: Date.now(),
        emergencyContact: this.getEmergencyContactsForRegion(language, culturalContext)
      }
    ];
  }

  private fallbackCrisisDetection(text: string, language: string, culturalContext: string): any {
    // Basic keyword-based crisis detection as fallback
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hopeless', 'can\'t go on'];
    const foundKeywords = crisisKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );

    // Determine severity based on keyword count
    let severity: SeverityLevel = 'low';
    if (foundKeywords.length > 2) {
      severity = 'high';
    } else if (foundKeywords.length > 0) {
      severity = 'medium';
    }

    return {
      isCrisis: foundKeywords.length > 0,
      severity,
      keywords: foundKeywords,
      recommendations: this.getFallbackCrisisResources(language, culturalContext),
      confidence: foundKeywords.length > 0 ? 0.8 : 0.2
    };
  }

  private async processSyncQueue(): Promise<void> {
    // Process sync queue when online
    console.log(`[Enhanced Offline] Processing ${this.syncQueue.length} queued items`);
    // Implementation would handle actual syncing
  }

  private activateOfflineMode(): void {
    console.log('[Enhanced Offline] Activating enhanced offline mode');
    // Activate offline-specific features
  }

  private updateNetworkCapabilities(): void {
    if ('connection' in navigator && this.capabilities) {
      const connection = (navigator as any).connection;
      this.capabilities.networkType = connection.effectiveType;
      this.capabilities.downloadSpeed = connection.downlink;
      this.notifyStatusChange();
    }
  }

  private initializeSyncQueue(): void {
    // Load sync queue from IndexedDB and setup processing
    if (this.db) {
      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        this.syncQueue = request.result;
        console.log(`[Enhanced Offline] Loaded ${this.syncQueue.length} queued items`);
      };
    }
  }

  private setupEmergencyProtocols(): void {
    // Setup protocols for emergency situations when offline
    console.log('[Enhanced Offline] Emergency protocols activated');
  }

  private notifyStatusChange(): void {
    if (this.capabilities) {
      this.statusListeners.forEach(listener => listener(this.capabilities!));
    }
  }

  /**
   * Public API methods
   */
  async getOfflineCapabilities(): Promise<OfflineCapabilities | null> {
    return this.capabilities;
  }

  onStatusChange(callback: (status: OfflineCapabilities) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index > -1) this.statusListeners.splice(index, 1);
    };
  }

  async clearOfflineData(): Promise<void> {
    if (this.db) {
      const transaction = this.db.transaction(['crisisResources', 'syncQueue', 'translations', 'culturalContent'], 'readwrite');
      await Promise.all([
        transaction.objectStore('crisisResources').clear(),
        transaction.objectStore('syncQueue').clear(),
        transaction.objectStore('translations').clear(),
        transaction.objectStore('culturalContent').clear()
      ]);
    }
    localStorage.removeItem('astral_offline_crisis_resources');
  }

  async updateOfflineResources(): Promise<void> {
    console.log('[Enhanced Offline] Updating offline resources...');
    await this.loadCrisisResources();
  }
}

export const enhancedOfflineService = new EnhancedOfflineService();
export type { OfflineResource, OfflineCapabilities, SyncQueueItem };
