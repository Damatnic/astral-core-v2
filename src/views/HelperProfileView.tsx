import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiClient } from '../utils/ApiClient';
import { AppButton } from '../components/AppButton';
import { AppInput, AppTextArea } from '../components/AppInput';
import { View } from '../types';
import { Card } from '../components/Card';
import { isError } from '../types/common';

const EXPERTISE_OPTIONS = [
    'Anxiety & Stress',
    'Depression',
    'Grief & Loss',
    'Relationships',
    'Family Issues',
    'Loneliness',
    'Self-Esteem',
    'Academic/Work Stress'
];

export const HelperProfileView: React.FC<{ 
    onProfileUpdated: () => void; 
    setActiveView: (view: View) => void;
}> = ({ onProfileUpdated, setActiveView }) => {
    const { helperProfile, reloadProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [expertise, setExpertise] = useState<string[]>([]);
    const [bio, setBio] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (helperProfile) {
            setDisplayName(helperProfile.displayName);
            setExpertise(helperProfile.expertise || []);
            setBio(helperProfile.bio || '');
        }
    }, [helperProfile]);

    const handleExpertiseChange = (option: string) => {
        setExpertise(prev =>
            prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
        );
    };

    const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!helperProfile) return;
        setError('');
        if (!displayName.trim()) {
            setError('Display name cannot be empty.');
            return;
        }
        setIsSubmitting(true);
        try {
            await ApiClient.helpers.updateProfile(helperProfile.id, { displayName, expertise, bio });
            await reloadProfile(); // Reload profile in context
            onProfileUpdated(); // Notify parent
            setIsEditing(false);
        } catch (err) {
            const errorMessage = isError(err) ? err.message : 'Failed to update profile.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCancel = () => {
        if(helperProfile) {
            setDisplayName(helperProfile.displayName);
            setExpertise(helperProfile.expertise);
            setBio(helperProfile.bio || '');
        }
        setIsEditing(false);
        setError('');
    }

    if (!helperProfile) {
        return <div className="loading-spinner" style={{ margin: '5rem auto' }}></div>;
    }

    return (
        <>
            <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>My Helper Profile</h1>
                    <p className="view-subheader">Manage your public information.</p>
                </div>
                {!isEditing && (
                    <AppButton onClick={() => setIsEditing(true)}>Edit Profile</AppButton>
                )}
            </div>
            
            {helperProfile.helperType !== 'Certified' && (
                 <Card className="setting-item" style={{marginBottom: '1.5rem'}}>
                     <div>
                        <h3 style={{margin: '0 0 0.25rem 0'}}>Become a Certified Helper</h3>
                        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '1rem'}}>
                            Complete our training to build trust within the community and qualify to help with more sensitive cases.
                        </p>
                    </div>
                    <AppButton variant="success" onClick={() => setActiveView('helper-application')}>
                        View Application
                    </AppButton>
                </Card>
            )}

            <Card>
                <form>
                    <AppInput
                        label="Public Display Name"
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={!isEditing}
                    />

                     <AppTextArea
                        label="Public Bio"
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        maxLength={500}
                    />

                    <div className="form-group">
                        <label>Areas of Expertise</label>
                        <div className="expertise-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {EXPERTISE_OPTIONS.map(option => (
                                <div key={option} className="radio-group">
                                    <input
                                        type="checkbox"
                                        id={`expertise-edit-${option}`}
                                        name="expertise"
                                        value={option}
                                        checked={expertise.includes(option)}
                                        onChange={() => isEditing && handleExpertiseChange(option)}
                                        disabled={!isEditing}
                                    />
                                    <label htmlFor={`expertise-edit-${option}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Helper Tier</label>
                        <p style={{ padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)' }}>{helperProfile.helperType}</p>
                    </div>

                     <div className="form-group">
                        <label>Reputation Score</label>
                        <p style={{ padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)' }}>{helperProfile.reputation.toFixed(2)}</p>
                    </div>

                    {error && <p className="api-error" style={{ marginBottom: '1rem' }}>{error}</p>}

                    {isEditing && (
                        <div className="form-actions">
                             <AppButton variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                                Cancel
                            </AppButton>
                           <div className="form-actions-group">
                                <AppButton type="submit" onClick={handleSave} isLoading={isSubmitting} disabled={isSubmitting}>
                                    Save Changes
                                </AppButton>
                            </div>
                        </div>
                    )}
                </form>
            </Card>
        </>
    );
};

export default HelperProfileView;