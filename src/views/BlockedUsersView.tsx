import React, { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../utils/ApiClient';
import { Block } from '../types';
import { AppButton } from '../components/AppButton';
import { formatTimeAgo } from '../utils/formatTimeAgo';

export const BlockedUsersView: React.FC<{ userId: string | null; }> = ({ userId }) => {
    const [blockedUsers, setBlockedUsers] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBlockedUsers = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const blocks = await ApiClient.userBlocking.getBlockedUsers(userId);
            setBlockedUsers(blocks);
        } catch (error) {
            console.error("Failed to fetch blocked users:", error);
            alert("Could not load your blocked users list.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchBlockedUsers();
    }, [fetchBlockedUsers]);

    const handleUnblock = async (blockedId: string) => {
        if (!userId) return;
        if (!window.confirm("Are you sure you want to unblock this user?")) return;

        try {
            await ApiClient.userBlocking.unblockUser(userId, blockedId);
            // Refresh the list after unblocking
            fetchBlockedUsers();
        } catch (error) {
            console.error("Failed to unblock user:", error);
            alert("Could not unblock the user.");
        }
    };

    return (
        <>
            <div className="view-header">
                <h1>Manage Blocked Users</h1>
                <p className="view-subheader">Review and unblock users you have previously blocked.</p>
            </div>
            <div className="card">
                {isLoading ? (
                    <div className="loading-spinner" style={{ margin: '3rem auto' }}></div>
                ) : blockedUsers.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {blockedUsers.map(block => (
                            <li key={block.blockedId} className="setting-item" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                                <div>
                                    <p style={{ fontWeight: 'bold' }}>User ID: {block.blockedId.substring(0, 12)}...</p>
                                    <small>Blocked {formatTimeAgo(block.timestamp)}</small>
                                </div>
                                <AppButton variant="secondary" onClick={() => handleUnblock(block.blockedId)}>
                                    Unblock
                                </AppButton>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You have not blocked any users.</p>
                )}
            </div>
        </>
    );
};


export default BlockedUsersView;