import React, { useState, useEffect } from 'react';
import { Helper, ActiveView } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { CertifiedIcon, HeartIcon, KudosIcon, SparkleIcon  } from '../components/icons.dynamic';
import { Modal } from '../components/Modal';
import { AppTextArea } from '../components/AppInput';
import { CATEGORIES } from '../constants';
import { useNotification } from '../contexts/NotificationContext';
import { useDilemmaStore } from '../stores/dilemmaStore';
import { useAuth } from '../contexts/AuthContext';

export const PublicHelperProfileView: React.FC<{
    helperId: string;
    onClose: () => void;
    setActiveView: (view: ActiveView) => void;
}> = ({ helperId, onClose, setActiveView }) => {
    const [helper, setHelper] = useState<Helper | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [requestCategory, setRequestCategory] = useState(CATEGORIES[0]);
    const { addToast } = useNotification();
    const { createDirectRequest } = useDilemmaStore();
    const { userToken } = useAuth();

    useEffect(() => {
        ApiClient.helpers.getById(helperId)
            .then(setHelper)
            .catch(err => {
                console.error("Failed to fetch helper profile", err);
                addToast("Could not load helper profile.", 'error');
                onClose();
            })
            .finally(() => setIsLoading(false));
    }, [helperId, onClose, addToast]);
    
    const handleSubmitRequest = async () => {
        if (!userToken) {
            addToast('You must have an anonymous ID to make a request.', 'error');
            return;
        }
        if (helper && requestMessage.trim()) {
            try {
                await createDirectRequest({ content: requestMessage, category: requestCategory }, userToken, helper.id);
                addToast(`Your request has been sent to the helper.`, 'success');
                setIsModalOpen(false);
                setRequestMessage('');
                setActiveView({ view: 'my-activity' });
            } catch(err) {
                console.error("Failed to submit direct request", err);
                addToast("Failed to send your request.", 'error');
            }
        }
    };


    if (isLoading || !helper) {
        return <div className="loading-spinner" style={{ margin: '5rem auto' }}></div>;
    }

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Request a chat with ${helper.displayName}`}>
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

            <div className="view-header" style={{position: 'relative', paddingBottom: '1rem'}}>
                <AppButton variant="secondary" onClick={onClose} style={{position: 'absolute', top: 0, left: 0}}>Back</AppButton>
            </div>
            
            <Card className="helper-public-profile">
                <div className="profile-header">
                    <div className={`avatar avatar-color-${(helper.displayName.charCodeAt(0) % 8)}`}></div>
                    <div className="profile-header-info">
                        <h1>{helper.displayName}</h1>
                        <div className="profile-tier">
                            <CertifiedIcon /> <span>{helper.helperType} Helper</span>
                        </div>
                        <p>Joined {new Date(helper.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                    </div>
                     <AppButton variant={helper.isAvailable ? 'success' : 'secondary'} onClick={() => {if (helper.isAvailable) setIsModalOpen(true)}} disabled={!helper.isAvailable}>
                        {helper.isAvailable ? 'Request Chat' : 'Offline'}
                    </AppButton>
                </div>

                <div className="profile-bio">
                    <h3>About {helper.displayName}</h3>
                    <p>{helper.bio || 'This helper has not written a bio yet.'}</p>
                </div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <HeartIcon />
                        <strong>{helper.reputation.toFixed(1)} / 5.0</strong>
                        <span>Reputation</span>
                    </div>
                     <div className="stat-item">
                        <KudosIcon />
                        <strong>{helper.kudosCount || 0}</strong>
                        <span>Kudos Received</span>
                    </div>
                     <div className="stat-item">
                        <SparkleIcon />
                        <strong>{helper.achievements?.length || 0}</strong>
                        <span>Achievements</span>
                    </div>
                </div>

                 <div className="profile-expertise">
                    <h3>Areas of Expertise</h3>
                    <div className="expertise-tags">
                        {helper.expertise.map(exp => <span key={exp} className="tag">{exp}</span>)}
                    </div>
                </div>
            </Card>
        </>
    );
};

export default PublicHelperProfileView;