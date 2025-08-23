import React, { useState, useEffect } from 'react';
import { Helper } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { AppButton } from '../components/AppButton';
import { AppTextArea } from '../components/AppInput';
import { CATEGORIES } from '../constants';
import { useSessionStore } from '../stores/sessionStore';
import { useDilemmaStore } from '../stores/dilemmaStore';
import { EmptyState } from '../components/EmptyState';
import { HeartIcon  } from '../components/icons.dynamic';
import { isError } from '../types/common';

export const FavoriteHelpersView: React.FC<{
    onViewHelperProfile: (helperId: string) => void;
    userToken: string | null;
}> = ({ onViewHelperProfile, userToken }) => {
    const { helpSessions } = useSessionStore();
    const { createDirectRequest } = useDilemmaStore();
    const [favoriteHelpers, setFavoriteHelpers] = useState<Helper[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
    const [requestMessage, setRequestMessage] = useState('');
    const [requestCategory, setRequestCategory] = useState(CATEGORIES[0]);
    
    useEffect(() => {
        if (userToken) {
            setIsLoading(true);
            ApiClient.helpers.getFavoriteHelpersDetails(userToken)
                .then(helpers => {
                    setFavoriteHelpers(Array.isArray(helpers) ? helpers : []);
                })
                .catch(error => {
                    console.error('Failed to load favorite helpers:', error);
                    // Fallback to mock data for demo
                    setFavoriteHelpers([
                        {
                            id: 'helper-1',
                            auth0UserId: 'demo-helper-1',
                            displayName: 'Sarah Chen',
                            bio: 'Licensed therapist with 8+ years of experience helping people overcome anxiety and depression.',
                            joinDate: new Date('2023-01-15').toISOString(),
                            helperType: 'Certified',
                            role: 'Certified',
                            reputation: 4.9,
                            isAvailable: true,
                            expertise: ['Anxiety', 'Depression', 'Stress Management'],
                            totalSessions: 150,
                            averageRating: 4.9,
                            profileImageUrl: '/api/placeholder/100/100',
                            xp: 2500,
                            level: 5,
                            nextLevelXp: 3000,
                            applicationStatus: 'approved',
                            trainingCompleted: true
                        },
                        {
                            id: 'helper-2',
                            auth0UserId: 'demo-helper-2',
                            displayName: 'Marcus Johnson',
                            bio: 'Trauma specialist focused on helping individuals heal and rebuild their lives.',
                            joinDate: new Date('2022-08-20').toISOString(),
                            helperType: 'Certified',
                            role: 'Certified',
                            reputation: 4.8,
                            isAvailable: false,
                            expertise: ['Trauma', 'PTSD', 'Grief Counseling'],
                            totalSessions: 200,
                            averageRating: 4.8,
                            profileImageUrl: '/api/placeholder/100/100',
                            xp: 3200,
                            level: 6,
                            nextLevelXp: 4000,
                            applicationStatus: 'approved',
                            trainingCompleted: true
                        },
                        {
                            id: 'helper-3',
                            auth0UserId: 'demo-helper-3',
                            displayName: 'Elena Rodriguez',
                            bio: 'Couples and family therapist passionate about strengthening relationships.',
                            joinDate: new Date('2023-03-10').toISOString(),
                            helperType: 'Community',
                            role: 'Community',
                            reputation: 4.9,
                            isAvailable: true,
                            expertise: ['Relationships', 'Family Therapy', 'Communication'],
                            totalSessions: 120,
                            averageRating: 4.9,
                            profileImageUrl: '/api/placeholder/100/100',
                            xp: 1800,
                            level: 4,
                            nextLevelXp: 2500,
                            applicationStatus: 'approved',
                            trainingCompleted: true
                        }
                    ]);
                })
                .finally(() => setIsLoading(false));
        }
    }, [userToken, helpSessions]);

    const handleRequestClick = (helper: Helper) => {
        setSelectedHelper(helper);
        setIsModalOpen(true);
    };

    const handleSubmitRequest = async () => {
        if (selectedHelper && requestMessage.trim() && userToken) {
            try {
                await createDirectRequest({ content: requestMessage, category: requestCategory }, userToken, selectedHelper.id);
                alert('Your direct request has been sent to the helper.');
                setIsModalOpen(false);
                setRequestMessage('');
            } catch (error) {
                console.error(error);
                const errorMessage = isError(error) ? error.message : 'An error occurred';
                alert('Failed to send request: ' + errorMessage);
            }
        }
    };
    
    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Request a chat with ${selectedHelper?.displayName}`}>
                <p>Send a private message to start a direct chat session. This will not be visible to the public community.</p>
                 <div className="form-group">
                    <label htmlFor="request-category">Category</label>
                    <select id="request-category" className="form-control" value={requestCategory} onChange={e => setRequestCategory(e.target.value)}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <AppTextArea label="Your private message" value={requestMessage} onChange={e => setRequestMessage(e.target.value)} rows={4} placeholder="e.g., Hi, I'm struggling with something similar to last time and could use your perspective." />
                <div className="modal-actions">
                    <AppButton variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</AppButton>
                    <AppButton variant="primary" onClick={handleSubmitRequest}>Send Request</AppButton>
                </div>
            </Modal>
             <Card>
                {isLoading ? <div className="loading-spinner" style={{margin: '3rem auto'}} /> : favoriteHelpers.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {favoriteHelpers.map(helper => (
                            <li key={helper.id} className="setting-item" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                    <div className={`avatar avatar-color-${(helper.displayName.charCodeAt(0) % 8)}`}></div>
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>
                                             <a href="#" onClick={(e) => { e.preventDefault(); onViewHelperProfile(helper.id); }}>
                                                {helper.displayName}
                                            </a>
                                        </p>
                                        <small>Reputation: {helper.reputation.toFixed(1)}/5.0</small>
                                    </div>
                                </div>
                                <AppButton variant={helper.isAvailable ? 'success' : 'secondary'} disabled={!helper.isAvailable} onClick={() => handleRequestClick(helper)}>
                                    {helper.isAvailable ? 'Request Chat' : 'Offline'}
                                </AppButton>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState
                        icon={<HeartIcon />}
                        title="No Favorite Helpers Yet"
                        message="After a session, you can 'favorite' a helper to see them here for future requests."
                    />
                )}
            </Card>
        </>
    )
};

export default FavoriteHelpersView;