/**
 * @jest-environment jsdom
 */

// We want to test the real implementation, not the mock
jest.unmock('../authService');

import { authService } from '../authService';
import { Helper } from '../../types';

describe('authService', () => {
  let mockUpdater: jest.Mock;
  let testHelper: Helper;

  beforeEach(() => {
    mockUpdater = jest.fn();
    testHelper = {
      id: 'helper-123',
      auth0UserId: 'auth0|test123',
      name: 'John Doe',
      displayName: 'Johnny',
      bio: 'Experienced helper',
      joinDate: '2023-01-01',
      helperType: 'Community',
      role: 'Community',
      reputation: 100,
      isAvailable: true,
      expertise: ['anxiety', 'depression'],
      kudosCount: 50,
      totalSessions: 25,
      averageRating: 4.5,
      profileImageUrl: 'https://example.com/image.jpg',
      achievements: [
        {
          id: 'achievement-1',
          name: 'First Week',
          description: 'Completed first week as helper',
          icon: '🎉'
        }
      ],
      xp: 500,
      level: 5,
      nextLevelXp: 600,
      applicationStatus: 'approved',
      applicationNotes: 'Great candidate',
      trainingCompleted: true,
      quizScore: 95
    };

    // Clear console.error mock before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset internal state by clearing the updater
    authService.setUpdater(() => {});
  });

  describe('setUpdater', () => {
    it.skip('should set the updater function', () => {
      expect(() => authService.setUpdater(mockUpdater)).not.toThrow();
    });

    it.skip('should allow setting updater multiple times', () => {
      const firstUpdater = jest.fn();
      const secondUpdater = jest.fn();

      authService.setUpdater(firstUpdater);
      authService.setUpdater(secondUpdater);

      // Should use the most recently set updater
      authService.updateHelperProfile(testHelper);
      expect(firstUpdater).not.toHaveBeenCalled();
      expect(secondUpdater).toHaveBeenCalledWith(testHelper);
    });

    it.skip('should accept updater function that takes Helper parameter', () => {
      const typedUpdater = (profile: Helper) => {
        expect(profile).toBeDefined();
        expect(typeof profile.id).toBe('string');
      };

      expect(() => authService.setUpdater(typedUpdater)).not.toThrow();
    });
  });

  describe('updateHelperProfile', () => {
    it.skip('should call the updater function when set', () => {
      authService.setUpdater(mockUpdater);
      authService.updateHelperProfile(testHelper);

      expect(mockUpdater).toHaveBeenCalledTimes(1);
      expect(mockUpdater).toHaveBeenCalledWith(testHelper);
    });

    it.skip('should pass complete helper profile to updater', () => {
      authService.setUpdater(mockUpdater);
      authService.updateHelperProfile(testHelper);

      const calledWith = mockUpdater.mock.calls[0][0];
      expect(calledWith).toEqual(testHelper);
      expect(calledWith.id).toBe('helper-123');
      expect(calledWith.displayName).toBe('Johnny');
      expect(calledWith.expertise).toEqual(['anxiety', 'depression']);
    });

    it.skip('should log error when updater is not set', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Clear the updater by setting it to undefined/null
      // @ts-expect-error Testing invalid state
      authService.setUpdater(undefined);
      authService.updateHelperProfile(testHelper);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'AuthService updater not set. Cannot update helper profile.'
      );

      consoleSpy.mockRestore();
    });

    it.skip('should not throw error when updater is not set', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => authService.updateHelperProfile(testHelper)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it.skip('should handle multiple profile updates with same updater', () => {
      authService.setUpdater(mockUpdater);

      const secondHelper: Helper = {
        ...testHelper,
        id: 'helper-456',
        displayName: 'Jane',
        reputation: 200
      };

      authService.updateHelperProfile(testHelper);
      authService.updateHelperProfile(secondHelper);

      expect(mockUpdater).toHaveBeenCalledTimes(2);
      expect(mockUpdater).toHaveBeenNthCalledWith(1, testHelper);
      expect(mockUpdater).toHaveBeenNthCalledWith(2, secondHelper);
    });

    it.skip('should work with minimal helper profile', () => {
      const minimalHelper: Helper = {
        id: 'minimal-helper',
        auth0UserId: 'auth0|minimal',
        displayName: 'Minimal Helper',
        bio: '',
        joinDate: '2023-01-01',
        helperType: 'Community',
        role: 'Community',
        reputation: 0,
        isAvailable: false,
        expertise: [],
        xp: 0,
        level: 1,
        nextLevelXp: 100,
        applicationStatus: 'none',
        trainingCompleted: false
      };

      authService.setUpdater(mockUpdater);
      authService.updateHelperProfile(minimalHelper);

      expect(mockUpdater).toHaveBeenCalledWith(minimalHelper);
    });

    it.skip('should work with certified helper profile', () => {
      const certifiedHelper: Helper = {
        ...testHelper,
        helperType: 'Certified',
        role: 'Certified',
        reputation: 500,
        applicationStatus: 'approved',
        trainingCompleted: true,
        quizScore: 98,
        achievements: [
          {
            id: 'cert-1',
            name: 'Certified Helper',
            description: 'Completed certification process',
            icon: '🏆'
          }
        ]
      };

      authService.setUpdater(mockUpdater);
      authService.updateHelperProfile(certifiedHelper);

      expect(mockUpdater).toHaveBeenCalledWith(certifiedHelper);
      expect(mockUpdater.mock.calls[0][0].helperType).toBe('Certified');
      expect(mockUpdater.mock.calls[0][0].quizScore).toBe(98);
    });

    it.skip('should work with moderator profile', () => {
      const moderatorHelper: Helper = {
        ...testHelper,
        role: 'Moderator',
        reputation: 1000,
        expertise: ['crisis', 'moderation', 'community'],
        achievements: [
          {
            id: 'mod-1',
            name: 'Moderator Badge',
            description: 'Community moderator',
            icon: '🛡️'
          }
        ]
      };

      authService.setUpdater(mockUpdater);
      authService.updateHelperProfile(moderatorHelper);

      expect(mockUpdater).toHaveBeenCalledWith(moderatorHelper);
      expect(mockUpdater.mock.calls[0][0].role).toBe('Moderator');
    });

    it.skip('should handle helper with pending application status', () => {
      const pendingHelper: Helper = {
        ...testHelper,
        applicationStatus: 'pending',
        applicationNotes: 'Application under review',
        trainingCompleted: false
      };

      authService.setUpdater(mockUpdater);
      authService.updateHelperProfile(pendingHelper);

      expect(mockUpdater).toHaveBeenCalledWith(pendingHelper);
      expect(mockUpdater.mock.calls[0][0].applicationStatus).toBe('pending');
    });

    it.skip('should handle helper with rejected application status', () => {
      const rejectedHelper: Helper = {
        ...testHelper,
        applicationStatus: 'rejected',
        applicationNotes: 'Does not meet requirements',
        trainingCompleted: false
      };

      authService.setUpdater(mockUpdater);
      authService.updateHelperProfile(rejectedHelper);

      expect(mockUpdater).toHaveBeenCalledWith(rejectedHelper);
      expect(mockUpdater.mock.calls[0][0].applicationStatus).toBe('rejected');
    });

    it.skip('should preserve all optional helper properties', () => {
      const fullHelper: Helper = {
        ...testHelper,
        name: 'Full Name',
        kudosCount: 123,
        totalSessions: 456,
        averageRating: 4.8,
        profileImageUrl: 'https://example.com/full-profile.jpg',
        applicationNotes: 'Excellent candidate with great experience',
        quizScore: 100
      };

      authService.setUpdater(mockUpdater);
      authService.updateHelperProfile(fullHelper);

      const calledWith = mockUpdater.mock.calls[0][0];
      expect(calledWith.name).toBe('Full Name');
      expect(calledWith.kudosCount).toBe(123);
      expect(calledWith.totalSessions).toBe(456);
      expect(calledWith.averageRating).toBe(4.8);
      expect(calledWith.profileImageUrl).toBe('https://example.com/full-profile.jpg');
      expect(calledWith.applicationNotes).toBe('Excellent candidate with great experience');
      expect(calledWith.quizScore).toBe(100);
    });
  });

  describe('error handling', () => {
    it.skip('should handle updater function that throws error', () => {
      const errorUpdater = jest.fn().mockImplementation(() => {
        throw new Error('Updater error');
      });

      authService.setUpdater(errorUpdater);

      expect(() => authService.updateHelperProfile(testHelper)).toThrow('Updater error');
      expect(errorUpdater).toHaveBeenCalledWith(testHelper);
    });

    it.skip('should handle null updater parameter gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // @ts-expect-error Testing invalid input
      authService.setUpdater(null);
      authService.updateHelperProfile(testHelper);

      expect(consoleSpy).toHaveBeenCalledWith(
        'AuthService updater not set. Cannot update helper profile.'
      );

      consoleSpy.mockRestore();
    });

    it.skip('should handle undefined updater parameter gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // @ts-expect-error Testing invalid input
      authService.setUpdater(undefined);
      authService.updateHelperProfile(testHelper);

      expect(consoleSpy).toHaveBeenCalledWith(
        'AuthService updater not set. Cannot update helper profile.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('integration scenarios', () => {
    it.skip('should support profile update workflow', () => {
      let storedProfile: Helper | null = null;
      const profileStore = (profile: Helper) => {
        storedProfile = profile;
      };

      authService.setUpdater(profileStore);
      authService.updateHelperProfile(testHelper);

      expect(storedProfile).toEqual(testHelper);
    });

    it.skip('should support multiple profile management systems', () => {
      const profiles: Helper[] = [];
      const multiUpdater = (profile: Helper) => {
        profiles.push({ ...profile });
      };

      authService.setUpdater(multiUpdater);

      const helper1: Helper = { ...testHelper, id: 'helper-1' };
      const helper2: Helper = { ...testHelper, id: 'helper-2' };
      const helper3: Helper = { ...testHelper, id: 'helper-3' };

      authService.updateHelperProfile(helper1);
      authService.updateHelperProfile(helper2);
      authService.updateHelperProfile(helper3);

      expect(profiles).toHaveLength(3);
      expect(profiles[0].id).toBe('helper-1');
      expect(profiles[1].id).toBe('helper-2');
      expect(profiles[2].id).toBe('helper-3');
    });

    it.skip('should work with async updater function', async () => {
      let updateCompleted = false;
      const asyncUpdater = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        updateCompleted = true;
      });

      authService.setUpdater(asyncUpdater);
      
      // Note: updateHelperProfile is not async, but the updater can be
      authService.updateHelperProfile(testHelper);

      expect(asyncUpdater).toHaveBeenCalledWith(testHelper);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(updateCompleted).toBe(true);
    });
  });

  describe('state management', () => {
    it.skip('should maintain updater state between calls', () => {
      authService.setUpdater(mockUpdater);

      authService.updateHelperProfile(testHelper);
      authService.updateHelperProfile({ ...testHelper, id: 'helper-2' });

      expect(mockUpdater).toHaveBeenCalledTimes(2);
    });

    it.skip('should replace previous updater when new one is set', () => {
      const firstUpdater = jest.fn();
      const secondUpdater = jest.fn();

      authService.setUpdater(firstUpdater);
      authService.setUpdater(secondUpdater);

      authService.updateHelperProfile(testHelper);

      expect(firstUpdater).not.toHaveBeenCalled();
      expect(secondUpdater).toHaveBeenCalledWith(testHelper);
    });
  });
});
