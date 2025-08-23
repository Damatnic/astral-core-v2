/**
 * @jest-environment jsdom
 */

import {
  UserRole,
  RolePermissions,
  ROLE_PERMISSIONS,
  getRolePermissions,
  canAccessView,
  isViewDenied,
  getUserRole,
  hasPermission,
  getDefaultViewForRole,
  validateViewAccess,
} from './roleAccess';
import { Helper, View } from '../types';

describe('roleAccess', () => {
  // Helper to create mock helper objects
  const createMockHelper = (role: UserRole, id = 'test-helper-123'): Helper => ({
    id,
    auth0UserId: 'auth0|123456789',
    displayName: 'Test Helper',
    expertise: ['mental-health'],
    bio: 'Test bio',
    role: role as 'Community' | 'Certified' | 'Moderator' | 'Admin',
    // isOnline: true, // Not part of Helper interface
    isAvailable: true,
    averageRating: 4.5,
    totalSessions: 10,
    profileImageUrl: 'test-image.jpg',
    kudosCount: 5,
    achievements: [],
    applicationStatus: 'approved',
    joinDate: '2023-01-01',
    helperType: role === 'Certified' ? 'Certified' : 'Community',
    reputation: 100,
    xp: 1000,
    level: 5,
    nextLevelXp: 1500,
    trainingCompleted: true,
  });

  describe('ROLE_PERMISSIONS constant', () => {
    test('should contain all required user roles', () => {
      const expectedRoles: UserRole[] = ['Starkeeper', 'Community', 'Certified', 'Moderator', 'Admin'];
      const actualRoles = Object.keys(ROLE_PERMISSIONS) as UserRole[];
      
      expect(actualRoles).toEqual(expect.arrayContaining(expectedRoles));
      expect(actualRoles).toHaveLength(expectedRoles.length);
    });

    test('should have consistent permission structure for all roles', () => {
      Object.values(ROLE_PERMISSIONS).forEach(permission => {
        expect(permission).toHaveProperty('role');
        expect(permission).toHaveProperty('allowedViews');
        expect(permission).toHaveProperty('deniedViews');
        expect(permission).toHaveProperty('features');
        
        expect(Array.isArray(permission.allowedViews)).toBe(true);
        expect(Array.isArray(permission.deniedViews)).toBe(true);
        
        // Check feature permissions structure
        expect(permission.features).toHaveProperty('canModerate');
        expect(permission.features).toHaveProperty('canAdminister');
        expect(permission.features).toHaveProperty('canAccessCrisisTools');
        expect(permission.features).toHaveProperty('canManageUsers');
        expect(permission.features).toHaveProperty('canViewAnalytics');
        expect(permission.features).toHaveProperty('canCreateContent');
        expect(permission.features).toHaveProperty('canParticipateInCommunity');
      });
    });

    test('should have hierarchical permissions (Admin > Moderator > Certified/Community > Starkeeper)', () => {
      const adminPerms = ROLE_PERMISSIONS.Admin;
      const moderatorPerms = ROLE_PERMISSIONS.Moderator;
      const certifiedPerms = ROLE_PERMISSIONS.Certified;
      const communityPerms = ROLE_PERMISSIONS.Community;
      const starkeeperPerms = ROLE_PERMISSIONS.Starkeeper;

      // Admin should have most permissions
      expect(adminPerms.features.canAdminister).toBe(true);
      expect(adminPerms.features.canModerate).toBe(true);
      expect(adminPerms.features.canManageUsers).toBe(true);
      expect(adminPerms.features.canViewAnalytics).toBe(true);

      // Moderator should have moderation permissions
      expect(moderatorPerms.features.canModerate).toBe(true);
      expect(moderatorPerms.features.canAdminister).toBe(false);
      expect(moderatorPerms.features.canManageUsers).toBe(true);
      expect(moderatorPerms.features.canViewAnalytics).toBe(true);

      // Community and Certified should have similar permissions
      expect(certifiedPerms.features.canModerate).toBe(false);
      expect(certifiedPerms.features.canAdminister).toBe(false);
      expect(certifiedPerms.features.canAccessCrisisTools).toBe(true);

      expect(communityPerms.features.canModerate).toBe(false);
      expect(communityPerms.features.canAdminister).toBe(false);
      expect(communityPerms.features.canAccessCrisisTools).toBe(true);

      // Starkeeper should have most limited permissions
      expect(starkeeperPerms.features.canModerate).toBe(false);
      expect(starkeeperPerms.features.canAdminister).toBe(false);
      expect(starkeeperPerms.features.canAccessCrisisTools).toBe(false);
      expect(starkeeperPerms.features.canManageUsers).toBe(false);
      expect(starkeeperPerms.features.canViewAnalytics).toBe(false);
    });

    test('should have proper view segregation', () => {
      const starkeeperPerms = ROLE_PERMISSIONS.Starkeeper;
      const adminPerms = ROLE_PERMISSIONS.Admin;

      // Starkeeper should be able to access starkeeper-dashboard but not admin areas
      expect(starkeeperPerms.allowedViews).toContain('starkeeper-dashboard');
      expect(starkeeperPerms.deniedViews).toContain('admin-dashboard');
      expect(starkeeperPerms.deniedViews).toContain('moderation-dashboard');

      // Admin should not access starkeeper-dashboard but can access admin areas
      expect(adminPerms.deniedViews).toContain('starkeeper-dashboard');
      expect(adminPerms.allowedViews).toContain('admin-dashboard');
      expect(adminPerms.allowedViews).toContain('moderation-dashboard');
    });
  });

  describe('getRolePermissions', () => {
    test('should return correct permissions for each role', () => {
      const roles: UserRole[] = ['Starkeeper', 'Community', 'Certified', 'Moderator', 'Admin'];
      
      roles.forEach(role => {
        const permissions = getRolePermissions(role);
        expect(permissions).toEqual(ROLE_PERMISSIONS[role]);
        expect(permissions.role).toBe(role);
      });
    });

    test('should return immutable permissions object', () => {
      const permissions = getRolePermissions('Starkeeper');
      const originalFeatures = { ...permissions.features };
      
      // Attempt to modify (should not affect the original)
      permissions.features.canModerate = true;
      
      // Original should remain unchanged
      expect(ROLE_PERMISSIONS.Starkeeper.features).toEqual(originalFeatures);
    });
  });

  describe('canAccessView', () => {
    test('should allow access to views in allowedViews array', () => {
      expect(canAccessView('Starkeeper', 'starkeeper-dashboard')).toBe(true);
      expect(canAccessView('Admin', 'admin-dashboard')).toBe(true);
      expect(canAccessView('Moderator', 'moderation-dashboard')).toBe(true);
      expect(canAccessView('Community', 'constellation-guide-dashboard')).toBe(true);
    });

    test('should deny access to views not in allowedViews array', () => {
      expect(canAccessView('Starkeeper', 'admin-dashboard')).toBe(false);
      expect(canAccessView('Community', 'starkeeper-dashboard')).toBe(false);
      expect(canAccessView('Certified', 'admin-dashboard')).toBe(false);
    });

    test('should handle undefined userRole by using Starkeeper permissions', () => {
      expect(canAccessView(undefined, 'starkeeper-dashboard')).toBe(true);
      expect(canAccessView(undefined, 'admin-dashboard')).toBe(false);
      expect(canAccessView(undefined, 'feed')).toBe(true);
    });

    test('should handle common views accessible to multiple roles', () => {
      const commonViews: View[] = ['feed', 'crisis', 'settings', 'guidelines', 'legal'];
      
      commonViews.forEach(view => {
        expect(canAccessView('Community', view)).toBe(true);
        expect(canAccessView('Certified', view)).toBe(true);
        expect(canAccessView('Moderator', view)).toBe(true);
        expect(canAccessView('Admin', view)).toBe(true);
      });
    });

    test('should be case-sensitive for view names', () => {
      expect(canAccessView('Starkeeper', 'starkeeper-dashboard')).toBe(true);
      expect(canAccessView('Starkeeper', 'STARKEEPER-DASHBOARD' as View)).toBe(false);
      expect(canAccessView('Starkeeper', 'Starkeeper-Dashboard' as View)).toBe(false);
    });
  });

  describe('isViewDenied', () => {
    test('should return true for views in deniedViews array', () => {
      expect(isViewDenied('Starkeeper', 'admin-dashboard')).toBe(true);
      expect(isViewDenied('Community', 'starkeeper-dashboard')).toBe(true);
      expect(isViewDenied('Admin', 'starkeeper-dashboard')).toBe(true);
    });

    test('should return false for views not in deniedViews array', () => {
      expect(isViewDenied('Starkeeper', 'starkeeper-dashboard')).toBe(false);
      expect(isViewDenied('Admin', 'admin-dashboard')).toBe(false);
      expect(isViewDenied('Moderator', 'moderation-dashboard')).toBe(false);
    });

    test('should handle undefined userRole by using Starkeeper permissions', () => {
      expect(isViewDenied(undefined, 'admin-dashboard')).toBe(true);
      expect(isViewDenied(undefined, 'starkeeper-dashboard')).toBe(false);
    });

    test('should work in conjunction with canAccessView', () => {
      const testCases = [
        { role: 'Starkeeper' as UserRole, view: 'admin-dashboard' as View },
        { role: 'Admin' as UserRole, view: 'starkeeper-dashboard' as View },
        { role: 'Community' as UserRole, view: 'starkeeper-dashboard' as View },
      ];

      testCases.forEach(({ role, view }) => {
        const canAccess = canAccessView(role, view);
        const isDenied = isViewDenied(role, view);
        
        // If a view is denied, it should not be accessible
        if (isDenied) {
          expect(canAccess).toBe(false);
        }
      });
    });
  });

  describe('getUserRole', () => {
    test('should return Starkeeper for null helper', () => {
      expect(getUserRole(null)).toBe('Starkeeper');
    });

    test('should return correct role from helper object', () => {
      const roles: UserRole[] = ['Community', 'Certified', 'Moderator', 'Admin'];
      
      roles.forEach(role => {
        const helper = createMockHelper(role);
        expect(getUserRole(helper)).toBe(role);
      });
    });

    test('should handle helper with undefined role', () => {
      const helper = createMockHelper('Community');
      delete (helper as any).role;
      
      expect(getUserRole(helper)).toBe('Starkeeper');
    });

    test('should type-cast role correctly', () => {
      const helper = createMockHelper('Admin');
      const role = getUserRole(helper);
      
      expect(typeof role).toBe('string');
      expect(['Starkeeper', 'Community', 'Certified', 'Moderator', 'Admin']).toContain(role);
    });
  });

  describe('hasPermission', () => {
    test('should return correct permissions for each role', () => {
      const testCases = [
        { role: 'Admin' as UserRole, permission: 'canAdminister' as const, expected: true },
        { role: 'Admin' as UserRole, permission: 'canModerate' as const, expected: true },
        { role: 'Moderator' as UserRole, permission: 'canModerate' as const, expected: true },
        { role: 'Moderator' as UserRole, permission: 'canAdminister' as const, expected: false },
        { role: 'Community' as UserRole, permission: 'canAccessCrisisTools' as const, expected: true },
        { role: 'Community' as UserRole, permission: 'canModerate' as const, expected: false },
        { role: 'Starkeeper' as UserRole, permission: 'canCreateContent' as const, expected: true },
        { role: 'Starkeeper' as UserRole, permission: 'canAccessCrisisTools' as const, expected: false },
      ];

      testCases.forEach(({ role, permission, expected }) => {
        expect(hasPermission(role, permission)).toBe(expected);
      });
    });

    test('should handle undefined userRole by using Starkeeper permissions', () => {
      expect(hasPermission(undefined, 'canCreateContent')).toBe(true);
      expect(hasPermission(undefined, 'canModerate')).toBe(false);
      expect(hasPermission(undefined, 'canAdminister')).toBe(false);
      expect(hasPermission(undefined, 'canAccessCrisisTools')).toBe(false);
    });

    test('should work with all available permission types', () => {
      const permissions = [
        'canModerate',
        'canAdminister', 
        'canAccessCrisisTools',
        'canManageUsers',
        'canViewAnalytics',
        'canCreateContent',
        'canParticipateInCommunity',
      ] as const;

      permissions.forEach(permission => {
        expect(() => hasPermission('Admin', permission)).not.toThrow();
        expect(typeof hasPermission('Admin', permission)).toBe('boolean');
      });
    });

    test('should maintain permission hierarchy', () => {
      // Admin should have all permissions that Moderator has
      const moderatorPerms = ROLE_PERMISSIONS.Moderator.features;
      Object.entries(moderatorPerms).forEach(([perm, hasIt]) => {
        if (hasIt) {
          expect(hasPermission('Admin', perm as keyof RolePermissions['features'])).toBe(true);
        }
      });
    });
  });

  describe('getDefaultViewForRole', () => {
    test('should return correct default views for each role', () => {
      const expectedDefaults = {
        'Starkeeper': 'starkeeper-dashboard',
        'Community': 'constellation-guide-dashboard',
        'Certified': 'constellation-guide-dashboard',
        'Moderator': 'constellation-guide-dashboard',
        'Admin': 'admin-dashboard',
      };

      Object.entries(expectedDefaults).forEach(([role, expectedView]) => {
        expect(getDefaultViewForRole(role as UserRole)).toBe(expectedView);
      });
    });

    test('should handle invalid role by returning feed', () => {
      // This tests the default case in the switch statement
      expect(getDefaultViewForRole('InvalidRole' as UserRole)).toBe('feed');
    });

    test('should ensure default views are accessible to the role', () => {
      const roles: UserRole[] = ['Starkeeper', 'Community', 'Certified', 'Moderator', 'Admin'];
      
      roles.forEach(role => {
        const defaultView = getDefaultViewForRole(role);
        expect(canAccessView(role, defaultView)).toBe(true);
      });
    });
  });

  describe('validateViewAccess', () => {
    test('should allow access to permitted views', () => {
      const result = validateViewAccess('Admin', 'admin-dashboard');
      
      expect(result.allowed).toBe(true);
      expect(result.redirectTo).toBeUndefined();
      expect(result.reason).toBeUndefined();
    });

    test('should deny access and provide redirect for forbidden views', () => {
      const result = validateViewAccess('Starkeeper', 'admin-dashboard');
      
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe('starkeeper-dashboard');
      expect(result.reason).toContain('Access denied');
      expect(result.reason).toContain('do not have permission');
    });

    test('should handle undefined userRole', () => {
      const result = validateViewAccess(undefined, 'admin-dashboard');
      
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe('feed');
      expect(result.reason).toContain('Access denied');
    });

    test('should provide appropriate redirect views', () => {
      const testCases = [
        { role: 'Starkeeper' as UserRole, redirectTo: 'starkeeper-dashboard' },
        { role: 'Community' as UserRole, redirectTo: 'constellation-guide-dashboard' },
        { role: 'Admin' as UserRole, redirectTo: 'admin-dashboard' },
      ];

      testCases.forEach(({ role, redirectTo }) => {
        const result = validateViewAccess(role, 'invalid-view' as View);
        expect(result.redirectTo).toBe(redirectTo);
      });
    });

    test('should include required role in reason message when possible', () => {
      const result = validateViewAccess('Starkeeper', 'admin-dashboard');
      
      expect(result.reason).toContain('Admin');
    });

    test('should handle views that no role can access', () => {
      const result = validateViewAccess('Admin', 'nonexistent-view' as View);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('unknown');
    });

    test('should work with edge cases', () => {
      // Test with empty string
      const result1 = validateViewAccess('Admin', '' as View);
      expect(result1.allowed).toBe(false);

      // Test with undefined view (type-wise this shouldn't happen but test defensive programming)
      const result2 = validateViewAccess('Admin', undefined as any);
      expect(result2.allowed).toBe(false);
    });
  });

  describe('Role-based feature access integration', () => {
    test('should maintain consistency between view access and feature permissions', () => {
      // Admin dashboard should only be accessible to users with canAdminister
      const adminDashboardAccessors: UserRole[] = [];
      const adminPermissionHolders: UserRole[] = [];

      (['Starkeeper', 'Community', 'Certified', 'Moderator', 'Admin'] as UserRole[]).forEach(role => {
        if (canAccessView(role, 'admin-dashboard')) {
          adminDashboardAccessors.push(role);
        }
        if (hasPermission(role, 'canAdminister')) {
          adminPermissionHolders.push(role);
        }
      });

      expect(adminDashboardAccessors).toEqual(adminPermissionHolders);
    });

    test('should maintain consistency between moderation dashboard and canModerate permission', () => {
      const moderationDashboardAccessors: UserRole[] = [];
      const moderationPermissionHolders: UserRole[] = [];

      (['Starkeeper', 'Community', 'Certified', 'Moderator', 'Admin'] as UserRole[]).forEach(role => {
        if (canAccessView(role, 'moderation-dashboard')) {
          moderationDashboardAccessors.push(role);
        }
        if (hasPermission(role, 'canModerate')) {
          moderationPermissionHolders.push(role);
        }
      });

      expect(moderationDashboardAccessors).toEqual(moderationPermissionHolders);
    });
  });

  describe('Boundary conditions and error handling', () => {
    test('should handle null and undefined inputs gracefully', () => {
      expect(() => canAccessView(null as any, 'feed')).not.toThrow();
      expect(() => isViewDenied(null as any, 'feed')).not.toThrow();
      expect(() => hasPermission(null as any, 'canCreateContent')).not.toThrow();
      expect(() => validateViewAccess(null as any, 'feed')).not.toThrow();
    });

    test('should handle malformed helper objects', () => {
      const malformedHelpers = [
        {},
        { role: null },
        { role: '' },
        { id: 'test' }, // missing role
      ];

      malformedHelpers.forEach(helper => {
        expect(() => getUserRole(helper as unknown as Helper)).not.toThrow();
        expect(getUserRole(helper as unknown as Helper)).toBe('Starkeeper');
      });
    });

    test('should handle case variations in role names defensively', () => {
      // The function should be case-sensitive, these should default to Starkeeper
      const variations = ['admin', 'ADMIN', 'Admin', 'moderator', 'MODERATOR'];
      
      variations.forEach(variation => {
        const helper = { ...createMockHelper('Admin'), role: variation as UserRole };
        // This should return the role as-is (type casting), but permissions would default
        expect(getUserRole(helper as Helper)).toBe(variation);
      });
    });
  });

  describe('Performance considerations', () => {
    test('should handle rapid successive permission checks efficiently', () => {
      const startTime = performance.now();
      
      // Simulate rapid permission checks
      for (let i = 0; i < 1000; i++) {
        hasPermission('Admin', 'canModerate');
        canAccessView('Starkeeper', 'feed');
        validateViewAccess('Community', 'constellation-guide-dashboard');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 operations in reasonable time (< 50ms)
      expect(duration).toBeLessThan(50);
    });

    test('should not create memory leaks with repeated calls', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize;
      
      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        const helper = createMockHelper('Admin', `helper-${i}`);
        getUserRole(helper);
        getRolePermissions('Community');
      }
      
      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize;
      
      // Memory shouldn't grow significantly (this is a rough check)
      if (initialMemory && finalMemory) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth
      }
    });
  });

  describe('Real-world usage scenarios', () => {
    test('should handle navigation guard scenario', () => {
      const mockHelper = createMockHelper('Community');
      const userRole = getUserRole(mockHelper);
      
      // Simulate checking multiple routes
      const routes = [
        'feed',
        'constellation-guide-dashboard', 
        'helper-profile',
        'admin-dashboard',
        'starkeeper-dashboard'
      ] as View[];
      
      routes.forEach(route => {
        const validation = validateViewAccess(userRole, route);
        
        if (validation.allowed) {
          expect(canAccessView(userRole, route)).toBe(true);
        } else {
          expect(validation.redirectTo).toBeTruthy();
          expect(canAccessView(userRole, validation.redirectTo!)).toBe(true);
        }
      });
    });

    test('should handle feature toggle scenario', () => {
      const roles: UserRole[] = ['Starkeeper', 'Community', 'Certified', 'Moderator', 'Admin'];
      const features = [
        'canModerate',
        'canAdminister',
        'canAccessCrisisTools',
        'canManageUsers',
        'canViewAnalytics',
        'canCreateContent',
        'canParticipateInCommunity'
      ] as const;
      
      roles.forEach(role => {
        features.forEach(feature => {
          const hasFeature = hasPermission(role, feature);
          expect(typeof hasFeature).toBe('boolean');
          
          // Verify against static permissions
          expect(hasFeature).toBe(ROLE_PERMISSIONS[role].features[feature]);
        });
      });
    });

    test('should handle user registration and role assignment flow', () => {
      // New user starts as Starkeeper
      let currentRole: UserRole = 'Starkeeper';
      expect(canAccessView(currentRole, 'starkeeper-dashboard')).toBe(true);
      expect(hasPermission(currentRole, 'canAccessCrisisTools')).toBe(false);
      
      // User applies to become a helper and gets Community role
      currentRole = 'Community';
      expect(canAccessView(currentRole, 'constellation-guide-dashboard')).toBe(true);
      expect(hasPermission(currentRole, 'canAccessCrisisTools')).toBe(true);
      
      // User gets certified
      currentRole = 'Certified';
      expect(canAccessView(currentRole, 'constellation-guide-dashboard')).toBe(true);
      expect(hasPermission(currentRole, 'canAccessCrisisTools')).toBe(true);
      
      // User becomes moderator
      currentRole = 'Moderator';
      expect(hasPermission(currentRole, 'canModerate')).toBe(true);
      expect(canAccessView(currentRole, 'moderation-dashboard')).toBe(true);
      
      // User becomes admin
      currentRole = 'Admin';
      expect(hasPermission(currentRole, 'canAdminister')).toBe(true);
      expect(canAccessView(currentRole, 'admin-dashboard')).toBe(true);
    });
  });
});