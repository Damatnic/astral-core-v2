// Component-Level Lazy Loading Optimization
// Implements lazy loading for heavy components to reduce initial bundle size
import { LoadingSpinner  } from './LoadingSpinner';'
import { createEnhancedLazyComponent  } from './EnhancedLazyComponent';'

// High Priority Components (>15KB or heavy dependencies)
export const ComprehensivePerformanceMonitor = createEnhancedLazyComponent(
  () => import('./ComprehensivePerformanceMonitor'),'
  {
  strategy: 'interaction','
    componentName: 'ComprehensivePerformanceMonitor','
    priority: 'high','
    fallback: () => (
      <div className="dashboard-skeleton" style={{ minHeight: '400px' '
}>
        <LoadingSpinner  />
        <p>Loading Performance Monitor...</p>
      </div>
    );

);
export const MobileAccessibilityProvider = createEnhancedLazyComponent(
  () => import('./MobileAccessibilityProvider'),'
  {
    strategy: 'immediate','
    componentName: 'MobileAccessibilityProvider','
    priority: 'high','
    fallback: () => <div>Initializing accessibility features...</$1>}
);
export const MobileAccessibilityDashboard = createEnhancedLazyComponent(
  () => import('./MobileAccessibilityDashboard'),'
  { strategy: 'viewport','
    componentName: 'MobileAccessibilityDashboard','
    priority: 'high','
    rootMargin: '50px''

) }

 const MobileFormComponents = createEnhancedLazyComponent(
  () => import('./MobileFormComponents'),'
  { strategy: 'network-aware','
    componentName: 'MobileFormComponents','
    priority: 'high''

) }

 const FamilySupportManagement = createEnhancedLazyComponent(
  () => import('./FamilySupportManagement'),'
  { strategy: 'interaction','
    componentName: 'FamilySupportManagement','
    priority: 'high''

) }

 const AccessibilitySettings = createEnhancedLazyComponent(
  () => import('./AccessibilitySettings'),'
  { strategy: 'viewport','
    componentName: 'AccessibilitySettings','
    priority: 'high''

) }

 const ThemeCustomizationDashboard = createEnhancedLazyComponent(
  () => import('./ThemeCustomizationDashboard'),'
  { strategy: 'viewport','
    componentName: 'ThemeCustomizationDashboard','
    priority: 'medium''

) }

 const OfflineCapabilities = createEnhancedLazyComponent(
  () => import('./OfflineCapabilities'),'
  { strategy: 'interaction','
    componentName: 'OfflineCapabilities','
    priority: 'medium''

) }

 const PrivacyAnalyticsDashboard = createEnhancedLazyComponent(
  () => import('./PrivacyAnalyticsDashboard'),'
  { strategy: 'interaction','
    componentName: 'PrivacyAnalyticsDashboard','
    priority: 'high''

)
// Medium Priority Components (8-15KB) }

 const ErrorBoundary = createEnhancedLazyComponent(
  () => import('./ErrorBoundary'),'
  { strategy: 'immediate','
    componentName: 'ErrorBoundary','
    priority: 'high''

) }

 const CrisisStressTestingDashboard = createEnhancedLazyComponent(
  () => import('./CrisisStressTestingDashboard'),'
  { strategy: 'interaction','
    componentName: 'CrisisStressTestingDashboard','
    priority: 'medium''

) }

 const LoadingSkeletons = createEnhancedLazyComponent(
  () => import('./LoadingSkeletons'),'
  { strategy: 'immediate','
    componentName: 'LoadingSkeletons','
    priority: 'high''

) }

 const MobilePerformanceProvider = createEnhancedLazyComponent(
  () => import('./MobilePerformanceProvider'),'
  { strategy: 'immediate','
    componentName: 'MobilePerformanceProvider','
    priority: 'medium''

) }

 const ThemeProvider = createEnhancedLazyComponent(
  () => import('./ThemeProvider'),'
  { strategy: 'immediate','
    componentName: 'ThemeProvider','
    priority: 'medium''

) }

 const PerformanceMonitor = createEnhancedLazyComponent(
  () => import('./PerformanceMonitor'),'
  { strategy: 'network-aware','
    componentName: 'PerformanceMonitor','
    priority: 'medium''

) }

 const CrisisDetectionDashboard = createEnhancedLazyComponent(
  () => import('./CrisisDetectionDashboard'),'
  { strategy: 'interaction','
    componentName: 'CrisisDetectionDashboard','
    priority: 'medium''

) }

 const FormInput = createEnhancedLazyComponent(
  () => import('./FormInput'),'
  { strategy: 'network-aware','
    componentName: 'FormInput','
    priority: 'medium''

) }

 const ProgressiveLoading = createEnhancedLazyComponent(
  () => import('./ProgressiveLoading'),'
  { strategy: 'viewport','
    componentName: 'ProgressiveLoading','
    priority: 'high''

) }

 const ResourceHintsOptimizer = createEnhancedLazyComponent(
  () => import('./ResourceHintsOptimizer'),'
  { strategy: 'network-aware','
    componentName: 'ResourceHintsOptimizer','
    priority: 'high''

)
// Crisis Components - Special handling }

 const CrisisResourcesModal = createEnhancedLazyComponent(
  () => import('./CrisisResourcesModal'),'
  {
  strategy: 'immediate','
    componentName: 'CrisisResourcesModal','
    priority: 'high','
    fallback: () => (
      <div className="crisis-loading" style={{ "
        padding: '20px', '
        textAlign: 'center','
        border: '2px solid #ff6b6b''
}>
        <p>Loading crisis resources...</p>
        <p>If this is an emergency, please call 911</p>
      </div>
    );

);
export const CrisisAlert = createEnhancedLazyComponent(
  () => import('./CrisisAlert'),'
  { strategy: 'immediate','
    componentName: 'CrisisAlert','
    priority: 'high''

)
// Sidebar Components }

 const SeekerSidebar = createEnhancedLazyComponent(
  () => import('./SeekerSidebar'),'
  { strategy: 'network-aware','
    componentName: 'SeekerSidebar','
    priority: 'high''

)
// Network and Offline Components }

 const NetworkBanner = createEnhancedLazyComponent(
  () => import('./NetworkBanner'),'
  { strategy: 'immediate','
    componentName: 'NetworkBanner','
    priority: 'medium''

) }

 const OfflineIndicator = createEnhancedLazyComponent(
  () => import('./OfflineIndicator'),'
  { strategy: 'immediate','
    componentName: 'OfflineIndicator','
    priority: 'medium''

) }

 const OfflineStatusIndicator = createEnhancedLazyComponent(
  () => import('./OfflineStatusIndicator'),'
  { strategy: 'immediate','
    componentName: 'OfflineStatusIndicator','
    priority: 'medium''

)
// Lower Priority Components (Hover/Interaction loading) }

 const AccessibilityDashboard = createEnhancedLazyComponent(
  () => import('./AccessibilityDashboard'),'
  { strategy: 'interaction','
    componentName: 'AccessibilityDashboard','
    priority: 'medium''

) }

 const CulturalCrisisDetectionTestRunner = createEnhancedLazyComponent(
  () => import('./CulturalCrisisDetectionTestRunner'),'
  { strategy: 'interaction','
    componentName: 'CulturalCrisisDetectionTestRunner','
    priority: 'low''

) }

 const SpecializedErrorBoundaries = createEnhancedLazyComponent(
  () => import('./SpecializedErrorBoundaries'),'
  { strategy: 'network-aware','
    componentName: 'SpecializedErrorBoundaries','
    priority: 'medium''

)
// Utility function to preload critical components }

 const preloadCriticalComponents = () => { // Preload crisis-related components immediately
const criticalComponents = [;
    () => import('./CrisisResourcesModal'),'
    () => import('./CrisisAlert'),'
    () => import('./ErrorBoundary'),'
    () => import('./LoadingSkeletons'),'
    () => import('./MobileAccessibilityProvider')'
  ];

  criticalComponents.forEach(importFn => {
    if ('requestIdleCallback' in window) {'
      requestIdleCallback(() => importFn()) } else(setTimeout(() => importFn(), 100) );
  });
  };

// Bundle analysis for development
export const analyzeLazyComponents = () => { if (process.env.NODE_ENV !== 'development') return;'

  console.group('🔍 Lazy Component Analysis');'
  console.log('Critical components preloaded' );'
  console.log('Medium priority components: network-aware loading')'
  console.log('Low priority components: interaction loading')'
  console.groupEnd();
interface default(preloadCriticalComponents,
  analyzeLazyComponents  );
