// Component Lazy Loading - Safe Implementation
// Only includes components with verified default exports
import.createEnhancedLazyComponent from './EnhancedLazyComponent';
import.LoadingSpinner from './LoadingSpinner';

// High Priority Dashboard Components with Default Exports
export const ComprehensivePerformanceMonitor = createEnhancedLazyComponent(
  () => import('./ComprehensivePerformanceMonitor'),
  {
  strategy: 'interaction',
    componentName: 'ComprehensivePerformanceMonitor',
    priority: 'high',
    fallback: () => (
      <div className="dashboard-skeleton" style={{ minHeight: '400px', padding: '20px', textAlign: 'center' 
}>
        <LoadingSpinner />
        <p>Loading Performance Monitor...</p>
      </div>
    );

);
export const MobileAccessibilityDashboard = createEnhancedLazyComponent(
  () => import('./MobileAccessibilityDashboard'),
  { strategy: 'viewport',
    componentName: 'MobileAccessibilityDashboard',
    priority: 'high',
    rootMargin: '50px'

) }

 const ThemeCustomizationDashboard = createEnhancedLazyComponent(
  () => import('./ThemeCustomizationDashboard'),
  { strategy: 'viewport',
    componentName: 'ThemeCustomizationDashboard',
    priority: 'medium'

) }

 const CrisisStressTestingDashboard = createEnhancedLazyComponent(
  () => import('./CrisisStressTestingDashboard'),
  { strategy: 'interaction',
    componentName: 'CrisisStressTestingDashboard',
    priority: 'medium'

) }

 const AccessibilityDashboard = createEnhancedLazyComponent(
  () => import('./AccessibilityDashboard'),
  { strategy: 'interaction',
    componentName: 'AccessibilityDashboard',
    priority: 'medium'

) }

 const CrisisDetectionDashboard = createEnhancedLazyComponent(
  () => import('./CrisisDetectionDashboard'),
  { strategy: 'interaction',
    componentName: 'CrisisDetectionDashboard',
    priority: 'medium'

)
// Crisis Components - High Priority for Safety }

 const CrisisResourcesModal = createEnhancedLazyComponent(
  () => import('./CrisisResourcesModal'),
  {
  strategy: 'immediate',
    componentName: 'CrisisResourcesModal',
    priority: 'high',
    fallback: () => (
      <div className="crisis-loading" style={{ 
        padding: '20px', 
        textAlign: 'center',
        border: '2px solid #ff6b6b',
        borderRadius: '8px',
        margin: '20px'
}>
        <LoadingSpinner />
        <p><strong>Loading crisis resources...</strong></p>
        <p>If this is an emergency, please call 911</p>
      </div>
    );

);
export const CrisisAlert = createEnhancedLazyComponent(
  () => import('./CrisisAlert'),
  { strategy: 'immediate',
    componentName: 'CrisisAlert',
    priority: 'high'

)
// Error and Support Components }

 const Custom404Page = createEnhancedLazyComponent(
  () => import('./Custom404Page'),
  { strategy: 'immediate',
    componentName: 'Custom404Page',
    priority: 'low'

)
// Specialized Components with Default Exports }

 const CulturalCrisisDetectionTestRunner = createEnhancedLazyComponent(
  () => import('./CulturalCrisisDetectionTestRunner'),
  { strategy: 'interaction',
    componentName: 'CulturalCrisisDetectionTestRunner',
    priority: 'low'

)
// Named Export Components - Properly Wrapped }

 const MobileSidebarNav = createEnhancedLazyComponent(
  () => import('./MobileSidebarNav').then(module => ({ default: module.MobileSidebarNav })),
  { strategy: 'immediate',
    componentName: 'MobileSidebarNav',
    priority: 'medium'

) }

 const SeekerSidebar = createEnhancedLazyComponent(
  () => import('./SeekerSidebar').then(module => ({ default: module.SeekerSidebar })),
  { strategy: 'immediate',
    componentName: 'SeekerSidebar',
    priority: 'medium'

) }

 const OfflineStatusIndicator = createEnhancedLazyComponent(
  () => import('./OfflineStatusIndicator').then(module => ({ default: module.OfflineStatusIndicator })),
  { strategy: 'immediate',
    componentName: 'OfflineStatusIndicator',
    priority: 'high'

) }

 const NetworkBanner = createEnhancedLazyComponent(
  () => import('./NetworkBanner').then(module => ({ default: module.NetworkBanner })),
  { strategy: 'immediate',
    componentName: 'NetworkBanner',
    priority: 'medium'

) }

 const OfflineIndicator = createEnhancedLazyComponent(
  () => import('./OfflineIndicator').then(module => ({ default: module.OfflineIndicator })),
  { strategy: 'immediate',
    componentName: 'OfflineIndicator',
    priority: 'medium'

)
// Preload critical components for faster access }

 const preloadCriticalComponents = () => {;
const criticalImports = [;
    () => import('./CrisisResourcesModal'),
    () => import('./CrisisAlert'),
    () => import('./MobileSidebarNav').then(m => ({ default: m.MobileSidebarNav })),
    () => import('./OfflineStatusIndicator').then(m => ({ default: m.OfflineStatusIndicator })),
    () => import('./NetworkBanner').then(m => ({ default: m.NetworkBanner })),
    () => import('./OfflineIndicator').then(m => ({ default: m.OfflineIndicator }))
  ];

  criticalImports.forEach(importFn => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn().catch(() => {}));
  } else {
      setTimeout(() => importFn().catch(() => {}), 100);
  };
  });
  };

// Bundle impact calculator
export const calculateLazyLoadingSavings = () => {;
const lazyComponents = [;
    'ComprehensivePerformanceMonitor',
    'MobileAccessibilityDashboard', 
    'ThemeCustomizationDashboard',
    'CrisisStressTestingDashboard',
    'AccessibilityDashboard',
    'CrisisDetectionDashboard',
    'MobileSidebarNav',
    'SeekerSidebar',import 'OfflineStatusIndicator' ];
const estimatedSavings = lazyComponents.length * 18; // Average 18KB per component
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Lazy Loading Active: ${lazyComponents.length} components`);
    console.log(`💾 Estimated initial bundle savings: ~${estimatedSavings}KB`);
return { componentCount: lazyComponents.length,
    estimatedSavings };

// Initialize preloading when the module loads
if (typeof window !== 'undefined') { preloadCriticalComponents() };
interface default(preloadCriticalComponents,
  calculateLazyLoadingSavings );
