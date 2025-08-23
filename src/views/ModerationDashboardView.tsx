import React, { useState } from 'react';
import { UserStatus } from '../types';
import { PostCard } from '../components/PostCard';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ApiClient } from '../utils/ApiClient';
import { Card } from '../components/Card';
import { useDilemmaStore } from '../stores/dilemmaStore';
import { useNotification } from '../contexts/NotificationContext';
import { isError } from '../types/common';

export const ModerationDashboardView: React.FC = () => {
    const { reportedDilemmas, dismissReport, removePost } = useDilemmaStore();
    const { addToast } = useNotification();
    const [activeTab, setActiveTab] = useState<'content' | 'users'>('content');
    
    const [searchUserId, setSearchUserId] = useState('');
    const [searchedUserStatus, setSearchedUserStatus] = useState<UserStatus | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const handleDismissReport = async (dilemmaId: string) => {
        try {
            await dismissReport(dilemmaId);
            addToast('Report dismissed.', 'info');
        } catch (error) {
            console.error(error);
            const errorMessage = isError(error) ? error.message : 'Failed to dismiss report. Please try again.';
            addToast(errorMessage, 'error');
        }
    };

    const handleRemovePost = async (dilemmaId: string) => {
        try {
            await removePost(dilemmaId);
            addToast('Post removed.', 'success');
        } catch (error) {
            console.error(error);
            const errorMessage = isError(error) ? error.message : 'Failed to remove post. Please try again.';
            addToast(errorMessage, 'error');
        }
    };

    const handleUserSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchUserId.trim()) return;
        setIsSearching(true);
        setSearchError('');
        setSearchedUserStatus(null);
        try {
            const status = await ApiClient.moderation.getUserStatus(searchUserId.trim());
            setSearchedUserStatus(status);
        } catch (err) {
            const errorMessage = isError(err) ? err.message : "Failed to find user.";
            setSearchError(errorMessage);
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleIssueWarning = async (userId: string) => {
        if (!window.confirm("Are you sure you want to issue a formal warning to this user?")) return;
        try {
            const updatedStatus = await ApiClient.moderation.issueWarning(userId);
            setSearchedUserStatus(updatedStatus);
            alert("Warning issued.");
        } catch (err) {
            const errorMessage = isError(err) ? err.message : "Failed to issue warning.";
            alert(errorMessage);
        }
    }
    
    const handleBanUser = async (userId: string) => {
        const reason = prompt("Please provide a reason for the ban:");
        if (!reason) return;
        const duration = prompt("Enter ban duration in hours (e.g., 24 for 1 day, 720 for 30 days). Leave blank for permanent.", "720");
        
        try {
            const updatedStatus = await ApiClient.moderation.banUser(userId, reason, duration ? parseInt(duration) : undefined);
            setSearchedUserStatus(updatedStatus);
            alert("User has been banned.");
        } catch (err) {
            const errorMessage = isError(err) ? err.message : "Failed to ban user.";
            alert(errorMessage);
        }
    }

    const renderContentTab = () => (
        reportedDilemmas.length > 0 ? (
            <ul className="posts-list">
                {reportedDilemmas.map(d => 
                    <PostCard 
                        key={d.id} 
                        dilemma={d} 
                        isHelperView={true} 
                        onRemovePost={handleRemovePost} 
                        onDismissReport={handleDismissReport} 
                    />
                )}
            </ul>
        ) : (
            <Card className="empty-state">
                <h2>No reported content.</h2>
                <p>The community feed is currently clear of reported posts.</p>
            </Card>
        )
    );

    const renderUsersTab = () => (
        <>
            <Card>
                <form onSubmit={handleUserSearch}>
                    <AppInput 
                        label="Find User by ID"
                        id="user-search"
                        value={searchUserId}
                        onChange={(e) => setSearchUserId(e.target.value)}
                        placeholder="Enter anonymous User ID or Helper ID"
                    />
                    <div className="form-actions">
                        <AppButton type="submit" onClick={()=>{}} isLoading={isSearching} disabled={isSearching || !searchUserId.trim()}>
                            Search User
                        </AppButton>
                    </div>
                </form>
            </Card>

            {searchError && <p className="api-error">{searchError}</p>}

            {searchedUserStatus && (
                <Card>
                    <h3>Status for User: {searchedUserStatus.userId.substring(0, 12)}...</h3>
                    <div style={{marginTop: '1rem'}}>
                        <p><strong>Warnings:</strong> {searchedUserStatus.warnings}</p>
                        <p><strong>Ban Status:</strong> {searchedUserStatus.isBanned ? `Banned for "${searchedUserStatus.banReason}"` : 'Not Banned'}</p>
                        {searchedUserStatus.isBanned && searchedUserStatus.banExpires && <p><strong>Ban Expires:</strong> {new Date(searchedUserStatus.banExpires).toLocaleString()}</p>}
                    </div>
                     <div className="form-actions" style={{marginTop: '2rem'}}>
                        <AppButton variant="secondary" onClick={() => handleIssueWarning(searchedUserStatus.userId)}>Issue Warning</AppButton>
                        <AppButton variant="danger" onClick={() => handleBanUser(searchedUserStatus.userId)}>
                            {searchedUserStatus.isBanned ? 'Update Ban' : 'Ban User'}
                        </AppButton>
                    </div>
                </Card>
            )}
        </>
    );

    return (
        <>
            <div className="view-header">
                <h1>Moderation Dashboard</h1>
                <p className="view-subheader">Review content and manage user actions to ensure community safety.</p>
            </div>
            <div className="dashboard-tabs">
                <AppButton className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>Reported Content ({reportedDilemmas.length})</AppButton>
                <AppButton className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>User Management</AppButton>
            </div>
            <div className="dashboard-content">
                {activeTab === 'content' ? renderContentTab() : renderUsersTab()}
            </div>
        </>
    );
};

export default ModerationDashboardView;