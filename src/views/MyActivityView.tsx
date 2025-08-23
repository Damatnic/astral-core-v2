import React, { useState } from 'react';
import { ActiveView } from '../types';
import { AppButton } from '../components/AppButton';
import { MyPostsView } from './MyPostsView';
import { PastSessionsView } from './PastSessionsView';
import { FavoriteHelpersView } from './FavoriteHelpersView';

export const MyActivityView: React.FC<{
    setActiveView: (view: ActiveView) => void;
    onViewHelperProfile: (helperId: string) => void;
    userToken: string | null;
}> = (props) => {
    const [activeTab, setActiveTab] = useState<'my-posts' | 'past-sessions' | 'favorite-helpers'>('my-posts');

    const renderTabContent = () => {
        switch(activeTab) {
            case 'my-posts':
                return <MyPostsView userToken={props.userToken} setActiveView={props.setActiveView} />;
            case 'past-sessions':
                return <PastSessionsView />;
            case 'favorite-helpers':
                return <FavoriteHelpersView onViewHelperProfile={props.onViewHelperProfile} userToken={props.userToken} />;
            default:
                return null;
        }
    }

    return (
        <>
            <div className="view-header">
                <h1>My Activity</h1>
                <p className="view-subheader">Review your posts, past conversations, and favorite helpers.</p>
            </div>
             <div className="dashboard-tabs">
                <AppButton className={activeTab === 'my-posts' ? 'active' : ''} onClick={() => setActiveTab('my-posts')}>My Posts</AppButton>
                <AppButton className={activeTab === 'past-sessions' ? 'active' : ''} onClick={() => setActiveTab('past-sessions')}>Past Sessions</AppButton>
                <AppButton className={activeTab === 'favorite-helpers' ? 'active' : ''} onClick={() => setActiveTab('favorite-helpers')}>My Favorite Helpers</AppButton>
            </div>
             <div className="dashboard-content">
               {renderTabContent()}
            </div>
        </>
    );
};

export default MyActivityView;