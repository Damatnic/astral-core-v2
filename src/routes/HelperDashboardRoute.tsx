import React from 'react';
import HelperDashboardView from '../views/HelperDashboardView';
import { useNavigate } from 'react-router-dom';

/**
 * Route wrapper for HelperDashboardView that provides required props
 */
const HelperDashboardRoute: React.FC = () => {
  const navigate = useNavigate();

  const handleSetActiveView = (view: any) => {
    // In a routing context, we navigate to the appropriate route
    // Map view to route paths
    const routeMap: Record<string, string> = {
      'dashboard': '/helper/dashboard',
      'profile': '/helper/profile', 
      'training': '/helper/training',
      'application': '/helper/application',
      'community': '/helper/community',
      'settings': '/settings'
    };
    
    const route = routeMap[view] || '/helper/dashboard';
    navigate(route);
  };

  return (
    <HelperDashboardView 
      setActiveView={handleSetActiveView}
    />
  );
};

export default HelperDashboardRoute;
