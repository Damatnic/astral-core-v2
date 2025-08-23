/**
 * Mock Auth Service for testing
 */

let _updateHelperProfile: ((profile: any) => void) | undefined;

export const authService = {
  login: jest.fn(() => Promise.resolve({
    token: 'mock-token',
    user: { id: 'test-user', email: 'test@example.com' }
  })),
  logout: jest.fn(() => Promise.resolve()),
  register: jest.fn(() => Promise.resolve({
    token: 'mock-token',
    user: { id: 'test-user', email: 'test@example.com' }
  })),
  refreshToken: jest.fn(() => Promise.resolve('new-mock-token')),
  getCurrentUser: jest.fn(() => ({
    id: 'test-user',
    email: 'test@example.com'
  })),
  isAuthenticated: jest.fn(() => true),
  getToken: jest.fn(() => 'mock-token'),
  verifyToken: jest.fn(() => Promise.resolve(true)),
  resetPassword: jest.fn(() => Promise.resolve()),
  changePassword: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
  deleteAccount: jest.fn(() => Promise.resolve()),
  // Add the missing methods for helper profile management
  setUpdater: jest.fn((updater: (profile: any) => void) => {
    _updateHelperProfile = updater;
  }),
  updateHelperProfile: jest.fn((profile: any) => {
    if (_updateHelperProfile) {
      _updateHelperProfile(profile);
    } else {
      console.error("AuthService updater not set. Cannot update helper profile.");
    }
  }),
};