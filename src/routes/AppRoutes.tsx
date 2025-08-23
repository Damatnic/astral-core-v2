/**
 * Centralized Route Configuration for CoreV2
 * All application routes with lazy loading
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
// Auth is now optional - all routes are accessible
// import { AuthGuard } from '../components/auth/AuthGuard';
// import { UserRole } from '../services/auth0Service';

// Lazy load all views for better performance
const DashboardView = lazy(() => import('../views/DashboardView'));
const ProfileView = lazy(() => import('../views/ProfileView'));
const SettingsView = lazy(() => import('../views/SettingsView'));
const FeedView = lazy(() => import('../views/FeedView'));
const CommunityView = lazy(() => import('../views/CommunityView'));
const ChatRoute = lazy(() => import('./ChatRoute'));
const AIChatView = lazy(() => import('../views/AIChatView'));
const AssessmentsView = lazy(() => import('../views/AssessmentsView'));
const WellnessView = lazy(() => import('../views/WellnessView'));
const ReflectionsView = lazy(() => import('../views/ReflectionsView'));
const SafetyPlanView = lazy(() => import('../views/SafetyPlanView'));
const QuietSpaceView = lazy(() => import('../views/QuietSpaceView'));
const CrisisView = lazy(() => import('../views/CrisisView'));
const CrisisResourcesView = lazy(() => import('../views/CrisisResourcesView'));
const AboutView = lazy(() => import('../views/AboutView'));
const HelpView = lazy(() => import('../views/HelpView'));
const LegalView = lazy(() => import('../views/LegalView'));
const PeerSupportView = lazy(() => import('../views/PeerSupportView'));
const TetherView = lazy(() => import('../views/TetherView'));
const WellnessVideosView = lazy(() => import('../views/WellnessVideosView'));

// Helper-specific views
const HelperDashboardRoute = lazy(() => import('./HelperDashboardRoute'));
const HelperProfileRoute = lazy(() => import('./HelperProfileRoute'));
const HelperTrainingRoute = lazy(() => import('./HelperTrainingRoute'));
const HelperApplicationRoute = lazy(() => import('./HelperApplicationRoute'));
const HelperCommunityView = lazy(() => import('../views/HelperCommunityView'));

// Admin views
const AdminDashboardRoute = lazy(() => import('./AdminDashboardRoute'));
const ModerationView = lazy(() => import('../views/ModerationView'));
const AnalyticsView = lazy(() => import('../views/AnalyticsView'));

// Loading fallback component
const RouteLoading: React.FC = () => (
  <div className="route-loading">
    <LoadingSpinner />
    <p>Loading page...</p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* Default Route - Wellness Dashboard */}
        <Route path="/" element={<DashboardView />} />
        
        {/* Public Routes */}
        <Route path="/about" element={<AboutView />} />
        <Route path="/legal" element={<LegalView />} />
        <Route path="/help" element={<HelpView />} />
        
        {/* Crisis Routes - Always Accessible */}
        <Route path="/crisis" element={<CrisisView />} />
        <Route path="/crisis-resources" element={<CrisisResourcesView />} />
        
        <Route path="/dashboard" element={<DashboardView />} />
        
        <Route path="/profile" element={<ProfileView />} />
        
        <Route path="/settings" element={<SettingsView />} />
        
        <Route path="/feed" element={<FeedView />} />
        
        <Route path="/community" element={<CommunityView />} />
        
        <Route path="/chat" element={<ChatRoute />} />
        
        <Route path="/ai-chat" element={<AIChatView />} />
        
        <Route path="/assessments" element={<AssessmentsView />} />
        
        <Route path="/wellness" element={<WellnessView />} />
        
        <Route path="/wellness-videos" element={<WellnessVideosView />} />
        
        <Route path="/reflections" element={<ReflectionsView />} />
        
        <Route path="/safety-plan" element={<SafetyPlanView />} />
        
        <Route path="/quiet-space" element={<QuietSpaceView />} />
        
        <Route path="/peer-support" element={<PeerSupportView />} />
        
        <Route path="/tether" element={<TetherView />} />
        
        {/* Helper Routes - Optional Authentication */}
        <Route path="/helper/dashboard" element={<HelperDashboardRoute />} />
        
        <Route path="/helper/profile" element={<HelperProfileRoute />} />
        
        <Route path="/helper/training" element={<HelperTrainingRoute />} />
        
        <Route path="/helper/application" element={<HelperApplicationRoute />} />
        
        <Route path="/helper/community" element={<HelperCommunityView />} />
        
        {/* Admin Routes - Optional Authentication */}
        <Route path="/admin" element={<AdminDashboardRoute />} />
        
        <Route path="/admin/moderation" element={<ModerationView />} />
        
        <Route path="/admin/analytics" element={<AnalyticsView />} />
        
        {/* 404 Fallback - Redirect to main dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;