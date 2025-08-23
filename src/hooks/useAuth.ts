import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Return a default value if context is not available (for testing)
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      isAnonymous: false,
      helperProfile: null,
      isNewUser: false,
      isLoading: false,
      userToken: null,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      reloadProfile: () => Promise.resolve(),
      updateHelperProfile: () => Promise.resolve(),
      authState: {
        user: null,
        isAnonymous: false,
        helperProfile: null,
        userToken: null
      }
    };
  }
  
  return context;
};