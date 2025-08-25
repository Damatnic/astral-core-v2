import React from 'react';
import { Helper, ActiveView } from '../types';

interface HelperSidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  isCollapsed: boolean;
  userToken?: string | null;
}

const HelperSidebar: React.FC<HelperSidebarProps> = ({
  activeView,
  onViewChange,
  isCollapsed,
  userToken
}) => {
  const navigationItems = [
    {
      id: 'dashboard' as ActiveView,
      label: 'Helper Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Your helper dashboard and statistics',
      badge: null
    },
    {
      id: 'community' as ActiveView,
      label: 'Active Sessions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      description: 'Manage your current support sessions',
      badge: '3' // This would come from real data
    },
    {
      id: 'journal' as ActiveView,
      label: 'Client Messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Review and respond to client messages',
      badge: '7' // This would come from real data
    },
    {
      id: 'crisis-support' as ActiveView,
      label: 'Crisis Alerts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      description: 'Urgent crisis intervention needed',
      badge: '1',
      urgent: true
    },
    {
      id: 'resources' as ActiveView,
      label: 'Resource Library',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Access helper resources and guidelines',
      badge: null
    },
    {
      id: 'mood-tracker' as ActiveView,
      label: 'Client Progress',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Track client mood and progress trends',
      badge: null
    },
    {
      id: 'profile' as ActiveView,
      label: 'Helper Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Manage your helper profile and certifications',
      badge: null
    },
    {
      id: 'settings' as ActiveView,
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Configure your helper preferences',
      badge: null
    }
  ];

  const handleNavigation = (viewId: ActiveView) => {
    onViewChange(viewId);
  };

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {/* Helper Status */}
      {!isCollapsed && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Helper Active
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-green-700 dark:text-green-300 font-medium">4.9</span>
            </div>
          </div>
          <div className="text-xs text-green-600 dark:text-green-300 space-y-1">
            <div>🎯 156 sessions completed</div>
            <div>⏰ Available: 9 AM - 6 PM EST</div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      {navigationItems.map((item) => {
        const isActive = activeView === item.id;
        const baseClasses = `
          flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative
          ${isCollapsed ? 'justify-center' : 'justify-start'}
        `;
        
        const activeClasses = isActive
          ? 'bg-green-600 text-white shadow-md'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
        
        const urgentClasses = item.urgent && !isActive
          ? 'ring-2 ring-red-500 ring-opacity-50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
          : '';

        return (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className={`${baseClasses} ${activeClasses} ${urgentClasses}`}
            title={isCollapsed ? item.label : undefined}
            aria-label={item.label}
          >
            <span className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}>
              {item.icon}
            </span>
            
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        item.urgent 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.urgent && !isActive && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
                <p className={`text-xs mt-1 ${
                  isActive 
                    ? 'text-green-100' 
                    : item.urgent 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.description}
                </p>
              </div>
            )}

            {/* Badge for collapsed state */}
            {isCollapsed && item.badge && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center ${
                item.urgent 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-blue-500 text-white'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* Helper Performance Summary */}
      {!isCollapsed && (
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            This Week's Impact
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Sessions</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">12</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Avg Rating</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">4.9 ⭐</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">< 2 min</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Crisis Handled</span>
              <span className="font-medium text-red-600 dark:text-red-400">3 🚨</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="mt-6 space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3">
            Quick Actions
          </h4>
          <button
            onClick={() => onViewChange('community')}
            className="w-full flex items-center px-3 py-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Join Group Session
          </button>
          <button
            onClick={() => onViewChange('resources')}
            className="w-full flex items-center px-3 py-2 text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create Resource
          </button>
        </div>
      )}

      {/* Emergency Protocol */}
      {!isCollapsed && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-semibold text-red-800 dark:text-red-200">
              Emergency Protocol
            </span>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300 mb-3">
            If you encounter a crisis situation:
          </p>
          <div className="space-y-1 text-xs text-red-800 dark:text-red-200">
            <div>1. 🚨 Activate crisis protocol</div>
            <div>2. 📞 Contact supervisor immediately</div>
            <div>3. 📋 Document everything</div>
          </div>
          <button
            onClick={() => onViewChange('crisis-support')}
            className="w-full mt-3 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Access Crisis Tools
          </button>
        </div>
      )}
    </nav>
  );
};

export default HelperSidebar;
