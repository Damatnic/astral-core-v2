import React from 'react';
import HelperApplicationView from '../views/HelperApplicationView';
import { useNavigate } from 'react-router-dom';

/**
 * Route wrapper for HelperApplicationView that provides required props
 */
const HelperApplicationRoute: React.FC = () => {
  const navigate = useNavigate();

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
    
    const route = routeMap[view] || '/helper/application';
    navigate(route);
  };

  return (
    <HelperApplicationView 
      setActiveView={handleSetActiveView}
    />
  );
};

export default HelperApplicationRoute;
