import { Helper } from '../types';

let _updateHelperProfile: (profile: Helper) => void;

export const authService = {
    setUpdater(updater: (profile: Helper) => void) {
        _updateHelperProfile = updater;
    },
    updateHelperProfile(profile: Helper) {
        if (_updateHelperProfile) {
            _updateHelperProfile(profile);
        } else {
            console.error("AuthService updater not set. Cannot update helper profile.");
        }
    }
};
