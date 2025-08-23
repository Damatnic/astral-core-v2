import { Helper, View } from '../types';

export type UserRole = 'Starkeeper' | 'Community' | 'Certified' | 'Moderator' | 'Admin';

export interface RolePermissions {
  role: UserRole;
  allowedViews: View[];
  deniedViews: View[];
  features: {
    canModerate: boolean;
    canAdminister: boolean;
    canAccessCrisisTools: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canCreateContent: boolean;
    canParticipateInCommunity: boolean;
  };
}

// Define comprehensive role permissions
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  Starkeeper: {
    role: 'Starkeeper',
    allowedViews: [
      'starkeeper-dashboard',
      'share',
      'feed',
      'crisis',
      'ai-chat',
      'safety-plan',
      'quiet-space',
      'my-activity',
      'wellness-tracking',
      'wellness-videos',
      'reflections',
      'assessments',
      'assessment-history',
      'assessment-detail',
      'tether',
      'peer-support',
      'donation',
      'settings',
      'guidelines',
      'legal',
      'moderation-history',
      'blocked-users'
    ],
    deniedViews: [
      'constellation-guide-dashboard',
      'helper-profile',
      'helper-training',
      'helper-community',
      'helper-application',
      'moderation-dashboard',
      'admin-dashboard',
      'workflow-demo',
      'create-profile'
    ],
    features: {
      canModerate: false,
      canAdminister: false,
      canAccessCrisisTools: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canCreateContent: true,
      canParticipateInCommunity: true
    }
  },
  Community: {
    role: 'Community',
    allowedViews: [
      'constellation-guide-dashboard',
      'helper-profile',
      'helper-training',
      'helper-community',
      'helper-application',
      'feed',
      'crisis',
      'settings',
      'guidelines',
      'legal',
      'workflow-demo'
    ],
    deniedViews: [
      'starkeeper-dashboard',
      'moderation-dashboard',
      'admin-dashboard'
    ],
    features: {
      canModerate: false,
      canAdminister: false,
      canAccessCrisisTools: true,
      canManageUsers: false,
      canViewAnalytics: false,
      canCreateContent: true,
      canParticipateInCommunity: true
    }
  },
  Certified: {
    role: 'Certified',
    allowedViews: [
      'constellation-guide-dashboard',
      'helper-profile',
      'helper-training',
      'helper-community',
      'helper-application',
      'feed',
      'crisis',
      'settings',
      'guidelines',
      'legal',
      'workflow-demo'
    ],
    deniedViews: [
      'starkeeper-dashboard',
      'moderation-dashboard',
      'admin-dashboard'
    ],
    features: {
      canModerate: false,
      canAdminister: false,
      canAccessCrisisTools: true,
      canManageUsers: false,
      canViewAnalytics: false,
      canCreateContent: true,
      canParticipateInCommunity: true
    }
  },
  Moderator: {
    role: 'Moderator',
    allowedViews: [
      'constellation-guide-dashboard',
      'helper-profile',
      'helper-training',
      'helper-community',
      'helper-application',
      'moderation-dashboard',
      'feed',
      'crisis',
      'settings',
      'guidelines',
      'legal',
      'workflow-demo'
    ],
    deniedViews: [
      'starkeeper-dashboard',
      'admin-dashboard'
    ],
    features: {
      canModerate: true,
      canAdminister: false,
      canAccessCrisisTools: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canCreateContent: true,
      canParticipateInCommunity: true
    }
  },
  Admin: {
    role: 'Admin',
    allowedViews: [
      'constellation-guide-dashboard',
      'helper-profile',
      'helper-training',
      'helper-community',
      'helper-application',
      'moderation-dashboard',
      'admin-dashboard',
      'feed',
      'crisis',
      'settings',
      'guidelines',
      'legal',
      'workflow-demo'
    ],
    deniedViews: [
      'starkeeper-dashboard'
    ],
    features: {
      canModerate: true,
      canAdminister: true,
      canAccessCrisisTools: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canCreateContent: true,
      canParticipateInCommunity: true
    }
  }
};

// Helper functions for role-based access control
export const getRolePermissions = (role: UserRole): RolePermissions => {
  // Return a deep clone to ensure immutability
  const permissions = ROLE_PERMISSIONS[role];
  return {
    ...permissions,
    allowedViews: [...permissions.allowedViews],
    deniedViews: [...permissions.deniedViews],
    features: { ...permissions.features }
  };
};

export const canAccessView = (userRole: UserRole | undefined, view: View): boolean => {
  if (!userRole) {
    // Unauthenticated users get Starkeeper permissions
    return ROLE_PERMISSIONS.Starkeeper.allowedViews.includes(view);
  }
  
  const permissions = getRolePermissions(userRole);
  return permissions.allowedViews.includes(view);
};

export const isViewDenied = (userRole: UserRole | undefined, view: View): boolean => {
  if (!userRole) {
    // Unauthenticated users get Starkeeper permissions
    return ROLE_PERMISSIONS.Starkeeper.deniedViews.includes(view);
  }
  
  const permissions = getRolePermissions(userRole);
  return permissions.deniedViews.includes(view);
};

export const getUserRole = (helper: Helper | null): UserRole => {
  if (!helper || !helper.role) {
    return 'Starkeeper';
  }
  
  return helper.role as UserRole;
};

export const hasPermission = (
  userRole: UserRole | undefined, 
  permission: keyof RolePermissions['features']
): boolean => {
  if (!userRole) {
    return ROLE_PERMISSIONS.Starkeeper.features[permission];
  }
  
  const permissions = getRolePermissions(userRole);
  return permissions.features[permission];
};

export const getDefaultViewForRole = (userRole: UserRole): View => {
  switch (userRole) {
    case 'Starkeeper':
      return 'starkeeper-dashboard';
    case 'Community':
    case 'Certified':
      return 'constellation-guide-dashboard';
    case 'Moderator':
      return 'constellation-guide-dashboard';
    case 'Admin':
      return 'admin-dashboard';
    default:
      return 'feed';
  }
};

export const validateViewAccess = (
  userRole: UserRole | undefined,
  requestedView: View
): { allowed: boolean; redirectTo?: View; reason?: string } => {
  if (canAccessView(userRole, requestedView)) {
    return { allowed: true };
  }
  
  const fallbackView = userRole ? getDefaultViewForRole(userRole) : 'feed';
  
  return {
    allowed: false,
    redirectTo: fallbackView,
    reason: `Access denied: You do not have permission to view this page. Required role: ${
      Object.values(ROLE_PERMISSIONS).find(p => p.allowedViews.includes(requestedView))?.role || 'unknown'
    }`
  };
};
