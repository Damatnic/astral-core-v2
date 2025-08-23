

import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { View } from '../types';
import { AppButton } from '../components/AppButton';
import { ApiClient } from '../utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { ViewHeader } from '../components/ViewHeader';
import { usePreferenceStore } from '../stores/preferenceStore';
import { PreferencesManager } from '../components/PreferencesManager';

export const SettingsView: React.FC<{ 
    userToken?: string | null; 
    onResetId?: () => void;
    setActiveView?: (view: View) => void;
}> = ({ userToken: propUserToken, onResetId, setActiveView }) => {
    const { user, userToken: contextUserToken } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { contentFilters, setFilters } = usePreferenceStore();
    
    // Use userToken from props or context
    const userToken = propUserToken ?? contextUserToken;
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [researchConsent, setResearchConsent] = useState(false);
    
    useEffect(() => {
        const currentUserId = user?.sub || userToken;
        if (currentUserId) {
            ApiClient.preferences.getPreferences(currentUserId).then(prefs => {
                setResearchConsent(prefs.researchConsent);
            });
        }
    }, [user, userToken]);

    const handleReset = () => {
        onResetId?.();
        setIsResetModalOpen(false);
    }

    const handleConsentChange = (consent: boolean) => {
        const currentUserId = user?.sub || userToken;
        if (currentUserId) {
            setResearchConsent(consent);
            ApiClient.preferences.updatePreferences(currentUserId, { researchConsent: consent });
        }
    }

    const handleFilterChange = (category: string) => {
        const newFilters = contentFilters.includes(category)
            ? contentFilters.filter(c => c !== category)
            : [...contentFilters, category];
        setFilters(newFilters);
    };

    return (
        <div className="settings-view">
            <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Confirm ID Reset">
                <p>Are you sure you want to reset your anonymous ID? This action cannot be undone. You will appear as a new user to the community.</p>
                <div className="modal-actions">
                    <AppButton variant="secondary" onClick={() => setIsResetModalOpen(false)}>Cancel</AppButton>
                    <AppButton variant="danger" onClick={handleReset}>Yes, Reset ID</AppButton>
                </div>
            </Modal>

            <Modal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} title="Public Health Research">
                <p>By opting in, you agree to contribute your fully anonymized and aggregated data for public health research. This helps researchers understand mental health trends and improve support systems globally.</p>
                <ul>
                    <li><strong>What's shared:</strong> General data like dilemma categories (e.g., "Anxiety"), mood trends, and resource usage statistics.</li>
                    <li><strong>What's NOT shared:</strong> Your post content, chat messages, or any personal identifiers.</li>
                </ul>
                <p>Your contribution is valuable and completely voluntary. You can opt-out at any time.</p>
                <div className="modal-actions">
                    <AppButton variant="primary" onClick={() => setIsPrivacyModalOpen(false)}>Got it</AppButton>
                </div>
            </Modal>

            <ViewHeader title="Settings" />
            
            <div className="settings-section">
                <h2>Appearance</h2>
                <div className="setting-item">
                    <div className="setting-info">
                        <label htmlFor="theme-toggle">Dark Mode</label>
                        <p>Switch between light and dark themes for comfortable viewing</p>
                    </div>
                    <div className="theme-toggle">
                        <input 
                            type="checkbox" 
                            id="theme-toggle"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                        />
                        <label htmlFor="theme-toggle" className="slider"></label>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2>Content Preferences</h2>
                <p>Hide or blur content from categories you find triggering to create a safer browsing experience.</p>
                <div className="expertise-options">
                    {CATEGORIES.map(option => (
                        <div key={option} className="radio-group">
                            <input
                                type="checkbox"
                                id={`filter-${option}`}
                                name="filter"
                                value={option}
                                checked={contentFilters.includes(option)}
                                onChange={() => handleFilterChange(option)}
                            />
                            <label htmlFor={`filter-${option}`}>{option}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="settings-section">
                <h2>Data & Privacy</h2>
                <div className="setting-item">
                    <div className="setting-info">
                        <label htmlFor="research-consent-toggle">Contribute to Public Health Research</label>
                        <p>Help researchers by contributing your fully anonymized data to improve mental health support systems globally.</p>
                    </div>
                    <div className="theme-toggle">
                        <input 
                            type="checkbox" 
                            id="research-consent-toggle"
                            checked={researchConsent}
                            onChange={e => handleConsentChange(e.target.checked)}
                        />
                        <label htmlFor="research-consent-toggle" className="slider"></label>
                    </div>
                </div>
                <div style={{textAlign: 'right', marginTop: '0.5rem'}}>
                    <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setIsPrivacyModalOpen(true); }} 
                        className="privacy-link"
                    >
                        Learn More
                    </a>
                </div>
            </div>

            <div className="settings-section">
                <h2>Account Management</h2>
                <div className="account-actions">
                    <div className="account-action-item">
                        <div className="setting-item">
                            <div className="setting-info">
                                <label>Blocked Users</label>
                                <p>Permanently block communication with specific users for your safety and peace of mind.</p>
                            </div>
                            <AppButton variant="secondary" onClick={() => setActiveView?.('blocked-users')}>
                                Manage Blocked Users
                            </AppButton>
                        </div>
                    </div>
                    
                    <div className="account-action-item danger">
                        <div className="setting-item">
                            <div className="setting-info">
                                <label>Reset Anonymous ID</label>
                                <p>Reset your anonymous ID for a fresh start. This action cannot be undone and you will appear as a new user to the community.</p>
                            </div>
                            <AppButton variant="danger" onClick={() => setIsResetModalOpen(true)}>
                                Reset Anonymous ID
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="settings-section">
                <h2>Advanced Settings</h2>
                <PreferencesManager />
            </div>
        </div>
    );
}


export default SettingsView;