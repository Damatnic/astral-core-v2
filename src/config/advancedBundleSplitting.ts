// Enhanced Bundle Splitting Strategy
// Advanced code splitting optimization for maximum performance impact

// Route-based code splitting configuration
export const routeBasedSplitting = {
  // Critical routes - load immediately
  critical: [
    'src/views/CrisisSupport',
    'src/views/EmergencyResources',
    'src/views/OfflineSupport'
  ],
  
  // Core routes - load on navigation
  core: [
    'src/views/Dashboard',
    'src/views/Community',
    'src/views/Profile',
    'src/views/Chat'
  ],
  
  // Feature routes - lazy load
  features: [
    'src/views/Wellness',
    'src/views/Goals',
    'src/views/Insights',
    'src/views/Settings'
  ],
  
  // Admin routes - lazy load with preload on auth
  admin: [
    'src/views/AdminDashboard',
    'src/views/Moderation',
    'src/views/Analytics'
  ]
};

// Feature-based code splitting
export const featureBasedSplitting = {
  // Crisis intervention system
  crisis: {
    components: [
      'src/components/CrisisAlert',
      'src/components/CrisisResourcesModal',
      'src/components/CrisisDetection',
      'src/components/EmergencyContacts'
    ],
    services: [
      'src/services/crisisDetection',
      'src/services/emergencyContacts'
    ],
    stores: [
      'src/stores/crisisStore'
    ]
  },
  
  // Chat and communication
  communication: {
    components: [
      'src/components/ChatInterface',
      'src/components/VideoCall',
      'src/components/PeerConnection'
    ],
    services: [
      'src/services/chatService',
      'src/services/webRTCService'
    ],
    stores: [
      'src/stores/chatStore',
      'src/stores/connectionStore'
    ]
  },
  
  // Wellness tracking
  wellness: {
    components: [
      'src/components/MoodTracker',
      'src/components/WellnessInsights',
      'src/components/GoalTracker'
    ],
    services: [
      'src/services/wellnessService',
      'src/services/analyticsService'
    ],
    stores: [
      'src/stores/wellnessStore'
    ]
  },
  
  // Admin and moderation
  admin: {
    components: [
      'src/components/AdminDashboard',
      'src/components/ModerationPanel',
      'src/components/UserManagement'
    ],
    services: [
      'src/services/adminService',
      'src/services/moderationService'
    ],
    stores: [
      'src/stores/adminStore'
    ]
  }
};

// Vendor chunk optimization strategy
export const vendorChunkStrategy = (id: string) => {
  // React core - highest priority, smallest chunk
  if (id.includes('react/') && !id.includes('react-dom')) {
    return 'react-core';
  }
  
  if (id.includes('react-dom')) {
    return 'react-dom';
  }
  
  // State management - separate for better caching
  if (id.includes('zustand') || id.includes('@reduxjs/toolkit')) {
    return 'state-management';
  }
  
  // UI libraries - group together
  if (id.includes('lucide-react') || 
      id.includes('react-icons') || 
      id.includes('styled-components') ||
      id.includes('@emotion')) {
    return 'ui-framework';
  }
  
  // Utility libraries - frequently used together
  if (id.includes('date-fns') || 
      id.includes('lodash') || 
      id.includes('uuid') ||
      id.includes('classnames')) {
    return 'utilities';
  }
  
  // Form handling
  if (id.includes('react-hook-form') || 
      id.includes('yup') || 
      id.includes('@hookform')) {
    return 'forms';
  }
  
  // Routing
  if (id.includes('react-router') || id.includes('@reach/router')) {
    return 'routing';
  }
  
  // Testing libraries (dev only)
  if (id.includes('@testing-library') || 
      id.includes('jest') || 
      id.includes('vitest')) {
    return 'testing';
  }
  
  // Large libraries that should be separate
  if (id.includes('recharts') || 
      id.includes('chart.js') || 
      id.includes('d3')) {
    return 'charts';
  }
  
  // Markdown and rich text
  if (id.includes('react-markdown') || 
      id.includes('remark') || 
      id.includes('rehype')) {
    return 'markdown';
  }
  
  // All other vendor code
  if (id.includes('node_modules')) {
    return 'vendor-misc';
  }
  
  return null;
};

// Helper functions to reduce cognitive complexity
const isCrisisRelated = (id: string): boolean => {
  return id.includes('crisis') || 
         id.includes('emergency') || 
         id.includes('safety') ||
         id.includes('offline');
};

const getCriticalViewChunk = (id: string): string | null => {
  if (id.includes('Crisis') || 
      id.includes('Emergency') || 
      id.includes('Safety') ||
      id.includes('Offline')) {
    return 'views-critical';
  }
  return null;
};

const getCoreViewChunk = (id: string): string | null => {
  if (id.includes('Dashboard') || 
      id.includes('Community') || 
      id.includes('Profile') ||
      id.includes('Chat')) {
    return 'views-core';
  }
  return null;
};

const getWellnessViewChunk = (id: string): string | null => {
  if (id.includes('Wellness') || 
      id.includes('Goals') || 
      id.includes('Insights') ||
      id.includes('Mood')) {
    return 'views-wellness';
  }
  return null;
};

const getAdminViewChunk = (id: string): string | null => {
  if (id.includes('Admin') || 
      id.includes('Moderation') || 
      id.includes('Analytics')) {
    return 'views-admin';
  }
  return null;
};

const getViewChunk = (id: string): string => {
  return getCriticalViewChunk(id) ||
         getCoreViewChunk(id) ||
         getWellnessViewChunk(id) ||
         getAdminViewChunk(id) ||
         'views-misc';
};

const getComponentChunk = (id: string): string => {
  if (isCrisisRelated(id)) {
    return 'components-critical';
  }
  
  if (id.includes('Dashboard') || 
      id.includes('Monitor') || 
      id.includes('Analytics') ||
      id.includes('Performance')) {
    return 'components-dashboard';
  }
  
  if (id.includes('Chat') || 
      id.includes('Message') || 
      id.includes('Video') ||
      id.includes('Call')) {
    return 'components-communication';
  }
  
  if (id.includes('Form') || 
      id.includes('Input') || 
      id.includes('Button') ||
      id.includes('Modal')) {
    return 'components-ui';
  }
  
  return 'components-misc';
};

const getServiceChunk = (id: string): string => {
  if (isCrisisRelated(id)) {
    return 'services-critical';
  }
  if (id.includes('auth') || id.includes('user')) {
    return 'services-auth';
  }
  if (id.includes('chat') || id.includes('communication')) {
    return 'services-communication';
  }
  return 'services-misc';
};

const getStateChunk = (id: string): string => {
  if (isCrisisRelated(id)) {
    return 'state-critical';
  }
  if (id.includes('auth') || id.includes('user')) {
    return 'state-auth';
  }
  return 'state-misc';
};

// Advanced chunk splitting with size optimization
export const advancedChunkSplitting = (id: string) => {
  // Crisis intervention - highest priority
  if (isCrisisRelated(id)) {
    return 'crisis-intervention';
  }
  
  // Vendor libraries with specific strategy
  const vendorChunk = vendorChunkStrategy(id);
  if (vendorChunk) {
    return vendorChunk;
  }
  
  // Route-based splitting
  if (id.includes('/views/')) {
    return getViewChunk(id);
  }
  
  // Component-based splitting
  if (id.includes('/components/')) {
    return getComponentChunk(id);
  }
  
  // Service layer splitting
  if (id.includes('/services/')) {
    return getServiceChunk(id);
  }
  
  // State management splitting
  if (id.includes('/stores/') || id.includes('/contexts/')) {
    return getStateChunk(id);
  }
  
  // Utility functions
  if (id.includes('/utils/') || id.includes('/hooks/')) {
    return 'utils';
  }
  
  return null; // Let Vite decide for everything else
};

// Bundle size monitoring and optimization
export const bundleSizeOptimization = {
  // Target sizes for different chunk types (in KB)
  targets: {
    'crisis-intervention': 150,     // Critical - keep small for fast loading
    'react-core': 50,              // React core - minimal
    'react-dom': 130,              // React DOM - standard size
    'ui-framework': 200,           // UI components - moderate size
    'views-core': 300,             // Core views - larger is acceptable
    'components-dashboard': 250,   // Dashboard components - heavy but lazy
    'vendor-misc': 400             // Misc vendor - can be larger
  },
  
  // Optimization strategies per chunk type
  strategies: {
    'crisis-intervention': ['aggressive-minify', 'inline-small-modules'],
    'react-core': ['preserve-names', 'minimal-polyfills'],
    'ui-framework': ['tree-shake-unused', 'split-large-components'],
    'vendor-misc': ['standard-minify', 'gzip-optimize']
  }
};

// Preload strategy based on chunk priorities
export const chunkPreloadStrategy = {
  immediate: [
    'crisis-intervention',
    'react-core',
    'react-dom',
    'state-critical'
  ],
  
  high: [
    'components-critical',
    'services-critical',
    'views-critical'
  ],
  
  medium: [
    'views-core',
    'components-ui',
    'state-auth',
    'services-auth'
  ],
  
  low: [
    'views-admin',
    'components-dashboard',
    'vendor-misc'
  ],
  
  // Conditional preloading based on user context
  conditional: {
    authenticated: ['views-core', 'state-auth'],
    admin: ['views-admin', 'services-admin'],
    crisis_mode: ['crisis-intervention', 'components-critical']
  }
};

export default {
  routeBasedSplitting,
  featureBasedSplitting,
  vendorChunkStrategy,
  advancedChunkSplitting,
  bundleSizeOptimization,
  chunkPreloadStrategy
};
