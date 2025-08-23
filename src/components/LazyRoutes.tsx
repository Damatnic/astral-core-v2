/**
 * Optimized Route Components with Code Splitting
 * 
 * Lazy-loaded route components for the Astral Core mental health platform
 * with intelligent preloading and performance optimization.
 */

import { createLazyComponent, createLazyRoute } from './LazyComponent';

// Crisis intervention routes - highest priority (immediate loading)
export const CrisisView = createLazyRoute(
  () => import('../views/CrisisView'),
  {
    skeleton: 'dashboard',
    preloadStrategy: 'immediate',
    title: 'Crisis Support',
    breadcrumb: 'Crisis',
    requiresAuth: false
  }
);

export const SafetyPlanView = createLazyRoute(
  () => import('../views/SafetyPlanView'),
  {
    skeleton: 'form',
    preloadStrategy: 'immediate',
    title: 'Safety Plan',
    breadcrumb: 'Safety Plan',
    requiresAuth: false
  }
);

// Core platform routes - high priority (idle preloading)
export const DashboardView = createLazyRoute(
  () => import('../views/DashboardView'),
  {
    skeleton: 'dashboard',
    preloadStrategy: 'idle',
    title: 'Dashboard',
    breadcrumb: 'Dashboard',
    requiresAuth: true
  }
);

export const CommunityView = createLazyRoute(
  () => import('../views/CommunityView'),
  {
    skeleton: 'list',
    preloadStrategy: 'idle',
    title: 'Community',
    breadcrumb: 'Community',
    requiresAuth: true
  }
);

export const ChatView = createLazyRoute(
  () => import('../views/ChatView'),
  {
    skeleton: 'chat',
    preloadStrategy: 'hover',
    title: 'Helper Chat',
    breadcrumb: 'Chat',
    requiresAuth: true
  }
);

export const AIAssistantView = createLazyRoute(
  () => import('../views/AIAssistantView'),
  {
    skeleton: 'chat',
    preloadStrategy: 'hover',
    title: 'AI Assistant',
    breadcrumb: 'AI Assistant',
    requiresAuth: true
  }
);

// Secondary routes - medium priority (visible preloading)
export const ProfileView = createLazyRoute(
  () => import('../views/ProfileView'),
  {
    skeleton: 'form',
    preloadStrategy: 'visible',
    title: 'Profile',
    breadcrumb: 'Profile',
    requiresAuth: true
  }
);

export const SettingsView = createLazyRoute(
  () => import('../views/SettingsView'),
  {
    skeleton: 'form',
    preloadStrategy: 'visible',
    title: 'Settings',
    breadcrumb: 'Settings',
    requiresAuth: true
  }
);

export const WellnessView = createLazyRoute(
  () => import('../views/WellnessView'),
  {
    skeleton: 'dashboard',
    preloadStrategy: 'visible',
    title: 'Wellness Tracking',
    breadcrumb: 'Wellness',
    requiresAuth: true
  }
);

// Helper-specific routes - medium priority
export const HelperDashboardView = createLazyRoute(
  () => import('../views/HelperDashboardView'),
  {
    skeleton: 'dashboard',
    preloadStrategy: 'visible',
    title: 'Helper Dashboard',
    breadcrumb: 'Helper Dashboard',
    requiresAuth: true
  }
);

export const ModerationView = createLazyRoute(
  () => import('../views/ModerationView'),
  {
    skeleton: 'list',
    preloadStrategy: 'visible',
    title: 'Moderation',
    breadcrumb: 'Moderation',
    requiresAuth: true
  }
);

// Administrative routes - low priority (hover preloading)
export const AdminDashboardView = createLazyRoute(
  () => import('../views/AdminDashboardView'),
  {
    skeleton: 'dashboard',
    preloadStrategy: 'hover',
    title: 'Admin Dashboard',
    breadcrumb: 'Admin',
    requiresAuth: true
  }
);

export const AnalyticsView = createLazyRoute(
  () => import('../views/AnalyticsView'),
  {
    skeleton: 'dashboard',
    preloadStrategy: 'hover',
    title: 'Analytics',
    breadcrumb: 'Analytics',
    requiresAuth: true
  }
);

// Legal and static routes - low priority (hover preloading)
export const LegalView = createLazyRoute(
  () => import('../views/LegalView'),
  {
    skeleton: 'default',
    preloadStrategy: 'hover',
    title: 'Legal',
    breadcrumb: 'Legal',
    requiresAuth: false
  }
);

export const AboutView = createLazyRoute(
  () => import('../views/AboutView'),
  {
    skeleton: 'default',
    preloadStrategy: 'hover',
    title: 'About',
    breadcrumb: 'About',
    requiresAuth: false
  }
);

export const HelpView = createLazyRoute(
  () => import('../views/HelpView'),
  {
    skeleton: 'default',
    preloadStrategy: 'hover',
    title: 'Help',
    breadcrumb: 'Help',
    requiresAuth: false
  }
);

// Lazy-loaded components (non-route)
export const CrisisResourcesModal = createLazyComponent(
  () => import('./CrisisResourcesModal'),
  {
    skeleton: 'card',
    preloadStrategy: 'idle'
  }
);

export const OfflineCapabilities = createLazyComponent(
  () => import('./OfflineCapabilities'),
  {
    skeleton: 'list',
    preloadStrategy: 'idle'
  }
);



// Route metadata for navigation and SEO
export const routeMetadata = {
  '/': {
    component: DashboardView,
    title: 'Mental Health Support Platform',
    description: 'Anonymous peer-to-peer mental health support with crisis intervention',
    priority: 'high'
  },
  '/crisis': {
    component: CrisisView,
    title: 'Crisis Support - Immediate Help Available',
    description: 'Emergency mental health resources and crisis intervention support',
    priority: 'critical'
  },
  '/safety-plan': {
    component: SafetyPlanView,
    title: 'Personal Safety Plan',
    description: 'Create and manage your personal mental health safety plan',
    priority: 'critical'
  },
  '/community': {
    component: CommunityView,
    title: 'Community Support',
    description: 'Connect with peers and share experiences in a safe environment',
    priority: 'high'
  },
  '/chat': {
    component: ChatView,
    title: 'Helper Chat',
    description: 'One-on-one support with certified mental health helpers',
    priority: 'high'
  },
  '/ai-assistant': {
    component: AIAssistantView,
    title: 'AI Mental Health Assistant',
    description: 'AI-powered mental health support and guidance',
    priority: 'medium'
  },
  '/wellness': {
    component: WellnessView,
    title: 'Wellness Tracking',
    description: 'Track your mental health journey and progress',
    priority: 'medium'
  },
  '/profile': {
    component: ProfileView,
    title: 'Profile',
    description: 'Manage your profile and preferences',
    priority: 'low'
  },
  '/settings': {
    component: SettingsView,
    title: 'Settings',
    description: 'Configure your platform settings and privacy',
    priority: 'low'
  },
  '/helper': {
    component: HelperDashboardView,
    title: 'Helper Dashboard',
    description: 'Manage your helper activities and support requests',
    priority: 'medium'
  },
  '/moderation': {
    component: ModerationView,
    title: 'Content Moderation',
    description: 'Review and moderate community content',
    priority: 'medium'
  },
  '/admin': {
    component: AdminDashboardView,
    title: 'Admin Dashboard',
    description: 'Platform administration and management',
    priority: 'low'
  },
  '/analytics': {
    component: AnalyticsView,
    title: 'Platform Analytics',
    description: 'Usage analytics and platform insights',
    priority: 'low'
  },
  '/legal': {
    component: LegalView,
    title: 'Legal Information',
    description: 'Terms of service, privacy policy, and legal information',
    priority: 'low'
  },
  '/about': {
    component: AboutView,
    title: 'About Us',
    description: 'Learn about our mission and mental health platform',
    priority: 'low'
  },
  '/help': {
    component: HelpView,
    title: 'Help & Support',
    description: 'Get help using the platform and find resources',
    priority: 'low'
  }
};

// Helper function to safely preload a component
const safePreload = (component: any) => {
  try {
    if (component && 'preload' in component && typeof component.preload === 'function') {
      component.preload();
    }
  } catch (error) {
    console.warn('Failed to preload component:', error);
  }
};

// Preload critical routes based on user state
export const preloadCriticalRoutes = () => {
  // Always preload crisis resources
  safePreload(CrisisView);
  safePreload(SafetyPlanView);
  
  // Preload based on authentication status
  if (typeof window !== 'undefined' && localStorage.getItem('userToken')) {
    safePreload(DashboardView);
    safePreload(CommunityView);
  }
};

// Route-specific performance monitoring
export const getRoutePerformance = (routePath: string) => {
  const metadata = routeMetadata[routePath as keyof typeof routeMetadata];
  if (!metadata) return null;

  const performanceEntries = performance.getEntriesByType('navigation');
  const currentEntry = performanceEntries[0];

  return {
    route: routePath,
    priority: metadata.priority,
    loadTime: currentEntry?.loadEventEnd - currentEntry?.loadEventStart,
    domContentLoaded: currentEntry?.domContentLoadedEventEnd - currentEntry?.domContentLoadedEventStart,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime
  };
};

export default {
  CrisisView,
  SafetyPlanView,
  DashboardView,
  CommunityView,
  ChatView,
  AIAssistantView,
  ProfileView,
  SettingsView,
  WellnessView,
  HelperDashboardView,
  ModerationView,
  AdminDashboardView,
  AnalyticsView,
  LegalView,
  AboutView,
  HelpView,
  routeMetadata,
  preloadCriticalRoutes,
  getRoutePerformance
};
