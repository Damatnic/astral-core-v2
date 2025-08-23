/**
 * Role-Based Access Control (RBAC) Service
 * Manages permissions and access control for CoreV2
 */

import { UserRole } from './auth0Service';

// Permission types
export enum Permission {
  // User permissions
  VIEW_PROFILE = 'view_profile',
  EDIT_PROFILE = 'edit_profile',
  DELETE_ACCOUNT = 'delete_account',
  
  // Content permissions
  VIEW_CONTENT = 'view_content',
  CREATE_CONTENT = 'create_content',
  EDIT_CONTENT = 'edit_content',
  DELETE_CONTENT = 'delete_content',
  PUBLISH_CONTENT = 'publish_content',
  
  // Chat permissions
  VIEW_CHAT = 'view_chat',
  SEND_MESSAGE = 'send_message',
  DELETE_MESSAGE = 'delete_message',
  MODERATE_CHAT = 'moderate_chat',
  
  // Assessment permissions
  VIEW_ASSESSMENT = 'view_assessment',
  TAKE_ASSESSMENT = 'take_assessment',
  CREATE_ASSESSMENT = 'create_assessment',
  VIEW_ALL_ASSESSMENTS = 'view_all_assessments',
  
  // Crisis permissions
  VIEW_CRISIS_RESOURCES = 'view_crisis_resources',
  TRIGGER_CRISIS_ALERT = 'trigger_crisis_alert',
  RESPOND_TO_CRISIS = 'respond_to_crisis',
  MANAGE_CRISIS_RESOURCES = 'manage_crisis_resources',
  OVERRIDE_CRISIS_LIMITS = 'override_crisis_limits',
  
  // Helper permissions
  VIEW_HELPER_DASHBOARD = 'view_helper_dashboard',
  ACCEPT_HELP_REQUESTS = 'accept_help_requests',
  PROVIDE_SUPPORT = 'provide_support',
  ACCESS_HELPER_TOOLS = 'access_helper_tools',
  
  // Moderation permissions
  VIEW_REPORTS = 'view_reports',
  MODERATE_USERS = 'moderate_users',
  BAN_USERS = 'ban_users',
  REVIEW_CONTENT = 'review_content',
  
  // Admin permissions
  VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_PERMISSIONS = 'manage_permissions',
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  ACCESS_DEBUG_TOOLS = 'access_debug_tools',
  
  // Data permissions
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  DELETE_DATA = 'delete_data',
  VIEW_SENSITIVE_DATA = 'view_sensitive_data',
  
  // API permissions
  ACCESS_API = 'access_api',
  MANAGE_API_KEYS = 'manage_api_keys',
  VIEW_API_LOGS = 'view_api_logs',
}

// Resource types
export enum Resource {
  PROFILE = 'profile',
  CONTENT = 'content',
  CHAT = 'chat',
  ASSESSMENT = 'assessment',
  CRISIS = 'crisis',
  HELPER = 'helper',
  ADMIN = 'admin',
  SYSTEM = 'system',
  API = 'api',
}

// Action types
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  MANAGE = 'manage',
}

// Role-Permission mapping
const userPermissions = [
  Permission.VIEW_PROFILE,
  Permission.EDIT_PROFILE,
  Permission.VIEW_CONTENT,
  Permission.VIEW_CHAT,
  Permission.SEND_MESSAGE,
  Permission.VIEW_ASSESSMENT,
  Permission.TAKE_ASSESSMENT,
  Permission.VIEW_CRISIS_RESOURCES,
  Permission.TRIGGER_CRISIS_ALERT,
  Permission.ACCESS_API,
];

const helperPermissions = [
  ...userPermissions,
  Permission.VIEW_HELPER_DASHBOARD,
  Permission.ACCEPT_HELP_REQUESTS,
  Permission.PROVIDE_SUPPORT,
  Permission.ACCESS_HELPER_TOOLS,
  Permission.CREATE_CONTENT,
  Permission.EDIT_CONTENT,
];

const moderatorPermissions = [
  ...helperPermissions,
  Permission.VIEW_REPORTS,
  Permission.MODERATE_USERS,
  Permission.REVIEW_CONTENT,
  Permission.DELETE_MESSAGE,
  Permission.MODERATE_CHAT,
  Permission.DELETE_CONTENT,
];

const crisisResponderPermissions = [
  ...userPermissions,
  Permission.RESPOND_TO_CRISIS,
  Permission.MANAGE_CRISIS_RESOURCES,
  Permission.OVERRIDE_CRISIS_LIMITS,
  Permission.VIEW_HELPER_DASHBOARD,
  Permission.PROVIDE_SUPPORT,
];

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.USER]: userPermissions,
  
  [UserRole.HELPER]: helperPermissions,
  
  [UserRole.MODERATOR]: moderatorPermissions,
  
  [UserRole.CRISIS_RESPONDER]: crisisResponderPermissions,
  
  [UserRole.ADMIN]: [
    // Has all permissions
    ...Object.values(Permission),
  ],
};

class RBACService {
  private readonly permissionCache = new Map<string, boolean>();

  /**
   * Check if role has permission
   */
  roleHasPermission(role: UserRole, permission: Permission): boolean {
    const cacheKey = `${role}:${permission}`;
    
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const hasPermission = rolePermissions[role]?.includes(permission) || false;
    this.permissionCache.set(cacheKey, hasPermission);
    
    return hasPermission;
  }

  /**
   * Check if user has permission
   */
  userHasPermission(userRoles: UserRole[], permission: Permission): boolean {
    return userRoles.some(role => this.roleHasPermission(role, permission));
  }

  /**
   * Check if user can perform action on resource
   */
  canPerformAction(
    userRoles: UserRole[],
    resource: Resource,
    action: Action,
    resourceData?: any
  ): boolean {
    // Admin can do anything
    if (userRoles.includes(UserRole.ADMIN)) {
      return true;
    }

    // Map resource-action to permissions
    const requiredPermission = this.getRequiredPermission(resource, action);
    if (!requiredPermission) {
      return false;
    }

    // Check if user has the required permission
    const hasPermission = this.userHasPermission(userRoles, requiredPermission);
    
    // Apply resource-specific conditions
    if (hasPermission && resourceData) {
      return this.checkResourceConditions(userRoles, resource, action, resourceData);
    }

    return hasPermission;
  }

  /**
   * Get required permission for resource-action combination
   */
  private getRequiredPermission(resource: Resource, action: Action): Permission | null {
    const permissionMap: Record<string, Permission> = {
      [`${Resource.PROFILE}:${Action.READ}`]: Permission.VIEW_PROFILE,
      [`${Resource.PROFILE}:${Action.UPDATE}`]: Permission.EDIT_PROFILE,
      [`${Resource.PROFILE}:${Action.DELETE}`]: Permission.DELETE_ACCOUNT,
      
      [`${Resource.CONTENT}:${Action.READ}`]: Permission.VIEW_CONTENT,
      [`${Resource.CONTENT}:${Action.CREATE}`]: Permission.CREATE_CONTENT,
      [`${Resource.CONTENT}:${Action.UPDATE}`]: Permission.EDIT_CONTENT,
      [`${Resource.CONTENT}:${Action.DELETE}`]: Permission.DELETE_CONTENT,
      
      [`${Resource.CHAT}:${Action.READ}`]: Permission.VIEW_CHAT,
      [`${Resource.CHAT}:${Action.CREATE}`]: Permission.SEND_MESSAGE,
      [`${Resource.CHAT}:${Action.DELETE}`]: Permission.DELETE_MESSAGE,
      [`${Resource.CHAT}:${Action.MANAGE}`]: Permission.MODERATE_CHAT,
      
      [`${Resource.ASSESSMENT}:${Action.READ}`]: Permission.VIEW_ASSESSMENT,
      [`${Resource.ASSESSMENT}:${Action.CREATE}`]: Permission.TAKE_ASSESSMENT,
      [`${Resource.ASSESSMENT}:${Action.MANAGE}`]: Permission.CREATE_ASSESSMENT,
      
      [`${Resource.CRISIS}:${Action.READ}`]: Permission.VIEW_CRISIS_RESOURCES,
      [`${Resource.CRISIS}:${Action.CREATE}`]: Permission.TRIGGER_CRISIS_ALERT,
      [`${Resource.CRISIS}:${Action.MANAGE}`]: Permission.MANAGE_CRISIS_RESOURCES,
      [`${Resource.CRISIS}:${Action.EXECUTE}`]: Permission.RESPOND_TO_CRISIS,
      
      [`${Resource.HELPER}:${Action.READ}`]: Permission.VIEW_HELPER_DASHBOARD,
      [`${Resource.HELPER}:${Action.EXECUTE}`]: Permission.PROVIDE_SUPPORT,
      
      [`${Resource.ADMIN}:${Action.READ}`]: Permission.VIEW_ADMIN_DASHBOARD,
      [`${Resource.ADMIN}:${Action.MANAGE}`]: Permission.MANAGE_USERS,
      
      [`${Resource.SYSTEM}:${Action.MANAGE}`]: Permission.MANAGE_SYSTEM_SETTINGS,
      [`${Resource.SYSTEM}:${Action.READ}`]: Permission.VIEW_AUDIT_LOGS,
      
      [`${Resource.API}:${Action.READ}`]: Permission.ACCESS_API,
      [`${Resource.API}:${Action.MANAGE}`]: Permission.MANAGE_API_KEYS,
    };

    const key = `${resource}:${action}`;
    return permissionMap[key] || null;
  }

  /**
   * Check resource-specific conditions
   */
  private checkResourceConditions(
    userRoles: UserRole[],
    resource: Resource,
    action: Action,
    resourceData: any
  ): boolean {
    // Users can only edit their own profile
    if (resource === Resource.PROFILE && action === Action.UPDATE) {
      return resourceData.userId === resourceData.currentUserId;
    }

    // Users can only delete their own content
    if (resource === Resource.CONTENT && action === Action.DELETE) {
      if (userRoles.includes(UserRole.MODERATOR)) {
        return true; // Moderators can delete any content
      }
      return resourceData.authorId === resourceData.currentUserId;
    }

    // Users can only delete their own messages
    if (resource === Resource.CHAT && action === Action.DELETE) {
      if (userRoles.includes(UserRole.MODERATOR)) {
        return true; // Moderators can delete any message
      }
      return resourceData.senderId === resourceData.currentUserId;
    }

    // Default to permission check
    return true;
  }

  /**
   * Get all permissions for roles
   */
  getPermissionsForRoles(roles: UserRole[]): Permission[] {
    const permissions = new Set<Permission>();
    
    roles.forEach(role => {
      rolePermissions[role]?.forEach(permission => {
        permissions.add(permission);
      });
    });

    return Array.from(permissions);
  }

  /**
   * Check if user is owner of resource
   */
  isResourceOwner(userId: string, resource: any): boolean {
    return resource.userId === userId || 
           resource.ownerId === userId || 
           resource.authorId === userId ||
           resource.createdBy === userId;
  }

  /**
   * Apply data filtering based on permissions
   */
  filterDataByPermissions<T extends object>(
    data: T[],
    userRoles: UserRole[],
    filterFn?: (item: T) => boolean
  ): T[] {
    // Admin sees everything
    if (userRoles.includes(UserRole.ADMIN)) {
      return data;
    }

    // Apply custom filter if provided
    if (filterFn) {
      return data.filter(filterFn);
    }

    // Default filtering based on common patterns
    return data.filter(item => {
      // Type-safe property checks
      const itemWithProps = item as any & {
        isPrivate?: boolean;
        currentUserId?: string;
        isFlagged?: boolean;
        isDeleted?: boolean;
      };
      
      // Check if item has privacy settings
      if ('isPrivate' in itemWithProps && itemWithProps.isPrivate) {
        // Only owner or admin can see private items
        return this.isResourceOwner(itemWithProps.currentUserId, item);
      }

      // Check if item is flagged
      if ('isFlagged' in itemWithProps && itemWithProps.isFlagged) {
        // Only moderators and above can see flagged items
        return userRoles.includes(UserRole.MODERATOR);
      }

      // Check if item is deleted
      if ('isDeleted' in itemWithProps && itemWithProps.isDeleted) {
        // Only admins can see deleted items
        return false;
      }

      return true;
    });
  }

  /**
   * Create permission string for caching
   */
  createPermissionKey(roles: UserRole[], permission: Permission): string {
    return `${roles.sort().join(',')}:${permission}`;
  }

  /**
   * Clear permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Validate permission configuration
   */
  validatePermissions(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for orphaned permissions
    const allDefinedPermissions = new Set(Object.values(Permission));
    const allAssignedPermissions = new Set<Permission>();
    
    Object.values(rolePermissions).forEach(permissions => {
      permissions.forEach(p => allAssignedPermissions.add(p));
    });

    allDefinedPermissions.forEach(permission => {
      if (!allAssignedPermissions.has(permission)) {
        errors.push(`Permission ${permission} is not assigned to any role`);
      }
    });

    // Check for role hierarchy violations
    const roleHierarchy = [
      UserRole.USER,
      UserRole.HELPER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
    ];

    for (let i = 0; i < roleHierarchy.length - 1; i++) {
      const lowerRole = roleHierarchy[i];
      const higherRole = roleHierarchy[i + 1];
      
      const lowerPerms = new Set(rolePermissions[lowerRole] || []);
      const higherPerms = new Set(rolePermissions[higherRole] || []);
      
      lowerPerms.forEach(perm => {
        if (!higherPerms.has(perm) && higherRole !== UserRole.ADMIN) {
          errors.push(`Role ${higherRole} is missing permission ${perm} from ${lowerRole}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const rbacService = new RBACService();

// Export helper functions
export const hasPermission = (userRoles: UserRole[], permission: Permission): boolean => {
  return rbacService.userHasPermission(userRoles, permission);
};

export const canAccess = (
  userRoles: UserRole[],
  resource: Resource,
  action: Action,
  resourceData?: any
): boolean => {
  return rbacService.canPerformAction(userRoles, resource, action, resourceData);
};

export default rbacService;