/**
 * Global Store Manager for Astral Core V4
 * Integrates all Zustand stores with service layer
 */;

import { create } from "zustand";
import { subscribeWithSelector, devtools } from "zustand/middleware";
import { integrationService } from "../services/integrationService";
import { supabase, realtimeManager } from '../lib/supabase';// Import individual store types;
import type { User } from '@supabase/supabase-js'
// Global application state interface;
interface GlobalState {
  // Authentication state
  user: User | null,
  isAuthenticated: boolean,
  authLoading: boolean,
  
  // Service integration state
  servicesReady: boolean,
  criticalServicesReady: boolean,
  serviceErrors: string[],
  
  // App state
  isOnline: boolean,
  isOfflineMode: boolean,
  appReady: boolean,
  
  // Crisis state
  crisisMode: boolean,
  emergencyContacts: unknown[],
  
  // Real-time connections
  realtimeConnected: boolean,
  activeSubscriptions: Set<string>
  
  // Performance metrics
  performanceMetrics: {
    pageLoadTime: number,
    criticalResourcesLoaded: boolean,
    errorCount: number
  },
  
  // UI State
  sidebarOpen: boolean,
  mobileMenuOpen: boolean,
  modalStack: string[],
  notifications: unknown[]
  }

// Global actions interface;
interface GlobalActions {
  // Authentication actions
  setUser: (user: User | null) => void,
  setAuthLoading: (loading: boolean) => void,
  signOut: () => Promise<void>
  
  // Service actions
  initializeServices: () => Promise<void>
  setServiceError: (error: string) => void,
  clearServiceErrors: () => void,
  
  // App actions
  setOnlineStatus: (isOnline: boolean) => void,
  toggleOfflineMode: () => void,
  setAppReady: (ready: boolean) => void,
  
  // Crisis actions
  activateCrisisMode: () => void,
  deactivateCrisisMode: () => void,
  addEmergencyContact: (contact: unknown) => void,
  
  // Real-time actions
  setRealtimeConnected: (connected: boolean) => void,
  addSubscription: (subId: string) => void,
  removeSubscription: (subId: string) => void,
  
  // Performance actions
  updatePerformanceMetrics: (metrics: Partial<GlobalState['performanceMetrics']>) => void'
  incrementErrorCount: () => void,
  
  // UI actions
  toggleSidebar: () => void,
  toggleMobileMenu: () => void,
  openModal: (modalId: string) => void,
  closeModal: (modalId ? : string) => void,
  addNotification: (notification: Notification) => void,
  removeNotification: (id: string) => void
  }

// Combined store type;
type GlobalStore = GlobalState & GlobalActions',

// Initial state;
const initialState: GlobalState={
  user: null,
  isAuthenticated: false,
  authLoading: true,
  servicesReady: false,
  criticalServicesReady: false,
  serviceErrors: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isOfflineMode: false,
  appReady: false,
  crisisMode: false,
  emergencyContacts: [],
  realtimeConnected: false,
  activeSubscriptions: new Set(),
  performanceMetrics: {
    pageLoadTime: 0,
    criticalResourcesLoaded: false,
    errorCount: 0
  },
  sidebarOpen: false,
  mobileMenuOpen: false,
  modalStack: [],
  notifications: []
  }

// Create the global store;
export const useGlobalStore = create<GlobalStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Authentication actions
      setUser: (user) => {
        set((state) => ({
          user,
          isAuthenticated: !!user,
          authLoading: false
  }))
        
        // Set up user-specific subscriptions if authenticated
        if(user) {
          get().setupUserSubscriptions(user.id)
        }
      },
      setAuthLoading: (authLoading) => set({ authLoading }),
      signOut: async () => {
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            isAuthenticated: false,
            authLoading: false
  })
          
          // Clean up subscriptions
          realtimeManager.unsubscribeAll()
          set({ activeSubscriptions: new Set() })
          
        } catch(error) {

          get().setServiceError('Failed to sign out')
        }
      },

      // Service actions
      initializeServices: async () => {
        try {

          const result = await integrationService.initialize()',;
          ;
          set({
            servicesReady: result.valid,
            criticalServicesReady: result.services.crisis && result.services.emergency,
            serviceErrors: [...result.errors, ...result.security]
          })
          
          if(result.valid) {
            set({ appReady: true })

          }
          
        } catch(error) {

          get().setServiceError(error instanceof Error ? error.message : 'Service initialization failed')
        }
      },
      setServiceError: (error) => set((state) => ({
        serviceErrors: [...state.serviceErrors, error]
      })),
      clearServiceErrors: () => set({ serviceErrors: [] }),

      // App actions
      setOnlineStatus: (isOnline) => {
        set({ isOnline })
        
        if (!isOnline && !get().isOfflineMode) {

          set({ isOfflineMode: true })
  } else if (isOnline && get().isOfflineMode) {

          // Trigger data sync when back online
          get().syncOfflineData()
        }
      },
      toggleOfflineMode: () => set((state) => ({
        isOfflineMode: !state.isOfflineMode
  })),
      setAppReady: (appReady) => set({ appReady }),

      // Crisis actions
      activateCrisisMode: () => {
        set({ crisisMode: true })
        
        // Store in localStorage for persistence
        localStorage.setItem('astralcore_crisis_mode', 'true')
        
        // Trigger crisis protocols
        integrationService.emit('crisisModeActivated', {
          timestamp: new Date().toISOString(),
          userId: get().user?.id
  })
      },
      deactivateCrisisMode: () => {
        set({ crisisMode: false })
        localStorage.removeItem('astralcore_crisis_mode')
        
        integrationService.emit('crisisModeDeactivated', {
          timestamp: new Date().toISOString(),
          userId: get().user?.id
  })
      },
      addEmergencyContact: (contact) => set((state) => ({
        emergencyContacts: [...state.emergencyContacts, contact]
      })),

      // Real-time actions
      setRealtimeConnected: (realtimeConnected) => set({ realtimeConnected }),
      addSubscription: (subId) => set((state) => ({
        activeSubscriptions: new Set([...state.activeSubscriptions, subId])
      })),
      removeSubscription: (subId) => set((state) => {
        const newSubs = new Set(state.activeSubscriptions)',;
        newSubs.delete(subId);
        return { activeSubscriptions: newSubs }
      }),

      // Performance actions
      updatePerformanceMetrics: (metrics) => set((state) => ({
        performanceMetrics: { ...state.performanceMetrics, ...metrics }
      };
  }),
      incrementErrorCount: () => set((state) => ({
        performanceMetrics: {
          ...state.performanceMetrics,
          errorCount: state.performanceMetrics.errorCount + 1
  }
      })),

      // UI actions
      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
  })),
      toggleMobileMenu: () => set((state) => ({
        mobileMenuOpen: !state.mobileMenuOpen
  })),
      openModal: (modalId) => set((state) => ({
        modalStack: [...state.modalStack, modalId]
      })),
      closeModal: (modalId) => set((state) => ({
        modalStack: modalId 
          ? state.modalStack.filter(id => id !== modalId)
          : state.modalStack.slice(0, -1)
      })),
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          ...notification,
          id: notification.id || `notif_${Date.now()},
          timestamp: notification.timestamp || new Date().toISOString()
  }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id`
  })),

      // Helper methods
      setupUserSubscriptions: (userId: string) => {
        // Subscribe to crisis events;
        const crisisSub = realtimeManager.subscribeToCrisisEvents(userId, (payload: unknown) => {
          integrationService.emit('crisisDetected', payload)
        })
        
        // Subscribe to mood updates;
        const moodSub = realtimeManager.subscribeToMoodUpdates(userId, (payload: unknown) => {
          integrationService.emit('wellnessDataUpdated', payload)
        })
        
        get().addSubscription(`crisis-${userId})
        get().addSubscription(`mood-${userId}
        set({ realtimeConnected: true })
      },
      syncOfflineData: async () => {
        try {

          // Trigger offline service sync
          integrationService.emit('syncOfflineData')
        } catch(error) {

        }
      }
    })),
    {
      name: astral-core-global-store",
      partialize: (state) => ({
        // Only persist certain parts of the state
        isOfflineMode: state.isOfflineMode,
        emergencyContacts: state.emergencyContacts,
        crisisMode: state.crisisMode
  })
    }
  )
)

// Selectors for common state combinations;
export const useAuthState = () => useGlobalStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  authLoading: state.authLoading
  }));

export const useServiceState = () => useGlobalStore((state) => ({
  servicesReady: state.servicesReady,
  criticalServicesReady: state.criticalServicesReady,
  serviceErrors: state.serviceErrors
  }));

export const useAppState = () => useGlobalStore((state) => ({
  isOnline: state.isOnline,
  isOfflineMode: state.isOfflineMode,
  appReady: state.appReady,
  crisisMode: state.crisisMode
  }));

export const useUIState = () => useGlobalStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  mobileMenuOpen: state.mobileMenuOpen,
  modalStack: state.modalStack,
  notifications: state.notifications
  }))

// Initialize store on app startup;
export const initializeGlobalStore = (): void => {
  const store = useGlobalStore.getState()',;
  
  // Set up online/offline detection;
  if(typeof window !== 'undefined') {
    window.addEventListener('online', () => store.setOnlineStatus(true))
    window.addEventListener('offline', () => store.setOnlineStatus(false))
  }
  
  // Check for persisted crisis mode
  if(typeof localStorage !== 'undefined') {
    const crisisMode = localStorage.getItem('astralcore_crisis_mode') === 'true';
    if(crisisMode) {
      store.activateCrisisMode()
    }
  }
  
  // Initialize services
  store.initializeServices()
  
  // Set up auth state listener
  supabase.auth.onAuthStateChange((event, session) => {
    store.setUser(session?.user || null)
  })
  
  // Set up integration service listeners
  integrationService.on('initialized', (state) => {'}
  })
  
  integrationService.on('error', ({ error, state }) => {
    store.setServiceError(error.message || 'Integration service error')
  })
  
  // Performance monitoring
  if(typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now()';
      store.updatePerformanceMetrics({
        pageLoadTime: loadTime,
        criticalResourcesLoaded: true
  })
    })
    
    window.addEventListener('error () => {'}
      store.incrementErrorCount()
    })
  }
}

export default useGlobalStore"