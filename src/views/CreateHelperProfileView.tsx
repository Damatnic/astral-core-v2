import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiClient } from '../utils/ApiClient';
import { AppButton } from '../components/AppButton';
import { AppInput, AppTextArea } from '../components/AppInput';
import { View } from '../types';
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

export const CreateHelperProfileView: React.FC<{ 
    onProfileCreated: () => void; 
    setActiveView: (view: View) => void;
}> = ({ onProfileCreated, setActiveView }) => {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [expertise, setExpertise] = useState<string[]>([]);
    const [bio, setBio] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleExpertiseChange = (option: string) => {
        setExpertise(prev => 
            prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Enhanced validation with focus management
        if (!displayName.trim()) {
            setError('Display name cannot be empty.');
            document.getElementById('displayName')?.focus();
            return;
        }
        if (displayName.trim().length < 3) {
            setError('Display name must be at least 3 characters long.');
            document.getElementById('displayName')?.focus();
            return;
        }
        if (!bio.trim()) {
            setError('Bio is required to help seekers understand how you can help.');
            document.getElementById('bio')?.focus();
            return;
        }
        if (bio.length > 500) {
            setError('Bio must be under 500 characters.');
            document.getElementById('bio')?.focus();
            return;
        }
        if (bio.trim().length < 20) {
            setError('Bio must be at least 20 characters to provide meaningful information.');
            document.getElementById('bio')?.focus();
            return;
        }
        if (expertise.length === 0) {
            setError('Please select at least one area of expertise.');
            return;
        }
        if (!agreedToTerms) {
            setError('You must agree to the Helper Community Guidelines.');
            document.getElementById('agree-terms')?.focus();
            return;
        }

        setIsSubmitting(true);
        
        try {
            await ApiClient.helpers.createProfile({
                auth0UserId: user.sub,
                displayName: displayName.trim(),
                expertise: expertise,
                bio: bio.trim(),
            });
            
            // Profile is created, trigger a reload in the parent component
            onProfileCreated();
        } catch (err) {
            console.error("Profile creation error:", err);
            
            // Provide specific error messages based on error type
            let errorMessage = 'An error occurred while creating your profile.';
            
            if (isError(err)) {
                if (err.message?.includes('duplicate') || err.message?.includes('exists')) {
                    errorMessage = 'This display name is already taken. Please choose a different one.';
                    document.getElementById('displayName')?.focus();
                } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else if (err.message?.includes('unauthorized') || err.message?.includes('401')) {
                    errorMessage = 'Your session has expired. Please log in again.';
                } else if (err.message?.includes('rate') || err.message?.includes('429')) {
                    errorMessage = 'Too many attempts. Please wait a moment and try again.';
                } else if (err.message) {
                    errorMessage = err.message;
                }
            }
            
            setError(errorMessage);
            setIsSubmitting(false);
            
            // Scroll to error message for visibility
            setTimeout(() => {
                document.querySelector('.api-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    return (
        <>
            <div className="view-header">
                <h1>Create Your Helper Profile</h1>
                <p className="view-subheader">Welcome! Let's set up your public-facing helper identity.</p>
            </div>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <p style={{marginBottom: '1rem'}}>
                        This information helps seekers connect with you. Your display name will be public, but your real identity remains private.
                    </p>
                    
                    <AppInput
                        label="Public Display Name (Pseudonym)"
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g., CompassionateCat, Listener_Alex"
                        required
                    />

                    <AppTextArea
                        label="Bio (Public)"
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a short bio about your support style or what brings you here (max 500 characters)."
                        maxLength={500}
                        rows={4}
                        required
                    />

                    <div className="form-group">
                        <label>Areas of Expertise (Choose at least one)</label>
                        <div className="expertise-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {EXPERTISE_OPTIONS.map(option => (
                                <div key={option} className="radio-group">
                                    <input
                                        type="checkbox"
                                        id={`expertise-${option}`}
                                        name="expertise"
                                        value={option}
                                        checked={expertise.includes(option)}
                                        onChange={() => handleExpertiseChange(option)}
                                    />
                                    <label htmlFor={`expertise-${option}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group-checkbox">
                        <input
                            type="checkbox"
                            id="agree-terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                        />
                         <label htmlFor="agree-terms">
                            I have read and agree to the <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('guidelines'); }}>Helper Community Guidelines</a>.
                        </label>
                    </div>

                    {error && <p className="api-error" style={{marginBottom: '1rem'}}>{error}</p>}

                    <div className="form-actions">
                        <AppButton type="submit" onClick={() => {}} isLoading={isSubmitting} disabled={isSubmitting}>
                            Create Profile and Continue
                        </AppButton>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateHelperProfileView;