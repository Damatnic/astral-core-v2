/**
 * Updated App Routes with Simple Auth Support
 * Includes login/register routes
 */;

import React, { lazy, Suspense } from 'react';'
import { Routes, Route, Navigate  } from 'react-router-dom';'
import { LoadingSpinner  } from '../components/LoadingSpinner';'
import { useSimpleAuth  } from '../contexts/SimpleAuthContext';'

// Auth Page
const AuthPage = lazy(() => import('../views/AuthPage'));'

// Lazy load all views for better performance
const DashboardView = lazy(() => import('../views/DashboardView'));'
const WellnessDashboard = lazy(() => import('../views/WellnessView'));'
const ProfileView = lazy(() => import('../views/ProfileView'));'
const SettingsView = lazy(() => import('../views/SettingsView'));'
const FeedView = lazy(() => import('../views/FeedView'));'
const CommunityView = lazy(() => import('../views/CommunityView'));'
const ChatRoute = lazy(() => import('./ChatRoute'));'
const AIChatView = lazy(() => import('../views/AIChatView'));'
const AssessmentsView = lazy(() => import('../views/AssessmentsView'));'
const WellnessView = lazy(() => import('../views/WellnessView'));'
const ReflectionsView = lazy(() => import('../views/ReflectionsView'));'
const SafetyPlanView = lazy(() => import('../views/SafetyPlanView'));'
const QuietSpaceView = lazy(() => import('../views/QuietSpaceView'));'
const CrisisView = lazy(() => import('../views/CrisisView'));'
const CrisisResourcesView = lazy(() => import('../views/CrisisResourcesView'));'
const AboutView = lazy(() => import('../views/AboutView'));'
const HelpView = lazy(() => import('../views/HelpView'));'
const LegalView = lazy(() => import('../views/LegalView'));'
const PeerSupportView = lazy(() => import('../views/PeerSupportView'));'
const TetherView = lazy(() => import('../views/TetherView'));'
const WellnessVideosView = lazy(() => import('../views/WellnessVideosView'));'

// Helper-specific views
const HelperDashboardRoute = lazy(() => import('./HelperDashboardRoute'));'
const HelperProfileRoute = lazy(() => import('./HelperProfileRoute'));'
const HelperTrainingRoute = lazy(() => import('./HelperTrainingRoute'));'
const HelperApplicationRoute = lazy(() => import('./HelperApplicationRoute'));'
const HelperCommunityView = lazy(() => import('../views/HelperCommunityView'));'

// Admin views
const AdminDashboardRoute = lazy(() => import('./AdminDashboardRoute'));'
const ModerationView = lazy(() => import('../views/ModerationView'));'
const AnalyticsView = lazy(() => import('../views/AnalyticsView'));'

// Loading fallback component
const RouteLoading: React.FC = () => (
  <div className="route-loading">"
    <LoadingSpinner  />
    <p>Loading page...</p>
  </div>
)
// Simple Auth Guard Component

 SimpleAuthGuard: React.FC<{
  children: React.ReactNode
  requireRoles?: string[]
  }> = ({ children, requireRoles }) => {,
{ isAuthenticated, user } = useSimpleAuth();

  if (!isAuthenticated) { return <Navigate to="/auth" replace  /> }"

  if (requireRoles && requireRoles.length > 0) { ;
const hasRequiredRole = requireRoles.includes(user?.role || ''  );'
    if (!hasRequiredRole) {
      return <Navigate to="/" replace  /> };"

  return <>{children}</>;
  };
export const AppRoutesWithAuth: React.FC = () => {,
{ isAuthenticated } = useSimpleAuth();

  return (
    <Suspense fallback={<RouteLoading  />}>
      <Routes>
        {/* Auth Route */}
        <Route path="/auth" element={ isAuthenticated ? <Navigate to="/dashboard" replace  /> : <AuthPage  /> } />"

        {/* Default Route - Wellness Dashboard */}
        <Route path="/" element={<WellnessDashboard  />} />"

        {/* Public Routes */}
        <Route path="/about" element={<AboutView  />} />"
        <Route path="/legal" element={<LegalView  />} />"
        <Route path="/help" element={<HelpView  />} />"

        {/* Crisis Routes - Always Accessible */}
        <Route path="/crisis" element={<CrisisView  />} />"
        <Route path="/crisis-resources" element={<CrisisResourcesView  />} />"

        <Route path="/dashboard" element={<DashboardView  />} />"

        <Route path="/profile" element={"
          <SimpleAuthGuard>
            <ProfileView  />
          </$1>} />

        <Route path="/settings" element={"
          <SimpleAuthGuard>
            <SettingsView  />
          </$1>} />

        <Route path="/feed" element={"
          <SimpleAuthGuard>
            <FeedView  />
          </$1>} />

        <Route path="/community" element={"
          <SimpleAuthGuard>
            <CommunityView  />
          </$1>} />

        <Route path="/chat" element={"
          <SimpleAuthGuard>
            <ChatRoute  />
          </$1>} />

        <Route path="/ai-chat" element={"
          <SimpleAuthGuard>
            <AIChatView  />
          </$1>} />

        <Route path="/assessments" element={"
          <SimpleAuthGuard>
            <AssessmentsView  />
          </$1>} />

        <Route path="/wellness" element={<WellnessView  />} />"

        <Route path="/wellness-videos" element={"
          <SimpleAuthGuard>
            <WellnessVideosView  />
          </$1>} />

        <Route path="/reflections" element={"
          <SimpleAuthGuard>
            <ReflectionsView  />
          </$1>} />

        <Route path="/safety-plan" element={"
          <SimpleAuthGuard>
            <SafetyPlanView  />
          </$1>} />

        <Route path="/quiet-space" element={"
          <SimpleAuthGuard>
            <QuietSpaceView  />
          </$1>} />

        <Route path="/peer-support" element={"
          <SimpleAuthGuard>
            <PeerSupportView  />
          </$1>} />

        <Route path="/tether" element={"
          <SimpleAuthGuard>
            <TetherView  />
          </$1>} />

        {/* Helper Routes */}
        <Route path="/helper/dashboard" element={"
          <SimpleAuthGuard requireRoles={['helper', 'admin']}>'
            <HelperDashboardRoute  />
          </$1>} />

        <Route path="/helper/profile" element={"
          <SimpleAuthGuard requireRoles={['helper', 'admin']}>'
            <HelperProfileRoute  />
          </$1>} />

        <Route path="/helper/training" element={"
          <SimpleAuthGuard>
            <HelperTrainingRoute  />
          </$1>} />

        <Route path="/helper/application" element={"
          <SimpleAuthGuard>
            <HelperApplicationRoute  />
          </$1>} />

        <Route path="/helper/community" element={"
          <SimpleAuthGuard requireRoles={['helper', 'admin']}>'
            <HelperCommunityView  />
          </$1>} />

        {/* Admin Routes */}
        <Route path="/admin" element={"
          <SimpleAuthGuard requireRoles={['admin']}>'
            <AdminDashboardRoute  />
          </$1>} />

        <Route path="/admin/moderation" element={"
          <SimpleAuthGuard requireRoles={['admin', 'moderator']}>'
            <ModerationView  />
          </$1>} />

        <Route path="/admin/analytics" element={"
          <SimpleAuthGuard requireRoles={['admin']}>'
            <AnalyticsView  />
          </$1>} />

        {/* 404 Fallback - Redirect to wellness dashboard */}
        <Route path="*" element={<Navigate to="/" replace  />} />"
      </Routes>
    </Suspense>
  );
  };
export default AppRoutesWithAuth;