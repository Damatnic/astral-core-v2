import React from 'react';
import HelperProfileView from '../views/HelperProfileView';
import { useNavigate } from 'react-router-dom';

/**
 * Route wrapper for HelperProfileView that provides required props
 */
const HelperProfileRoute: React.FC = () => {
  const navigate = useNavigate();

  const handleProfileUpdated = () => {
    // Handle profile update - could show toast, refresh data, etc.
    console.log('Helper profile updated');
  };

  const handleSetActiveView = (view: any) => {
    // In a routing context, we navigate to the appropriate route
    const routeMap: Record<string, string> = {
      'dashboard': '/helper/dashboard',
      'profile': '/helper/profile', 
      'training': '/helper/training',
      'application': '/helper/application',
      'community': '/helper/community',
      'settings': '/settings'
    };
    
    const route = routeMap[view] || '/helper/profile';
    navigate(route);
  };

  return (
    <HelperProfileView 
      onProfileUpdated={handleProfileUpdated}
      setActiveView={handleSetActiveView}
    />
  );
};

export default HelperProfileRoute;
