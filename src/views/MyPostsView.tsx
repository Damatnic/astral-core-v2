import React, { useMemo } from 'react';
import { PostCard } from '../components/PostCard';
import { ActiveView } from '../types';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { useDilemmaStore } from '../stores/dilemmaStore';
import { useChatStore } from '../stores/chatStore';
import { EmptyState } from '../components/EmptyState';
import { ShareIcon  } from '../components/icons.dynamic';

export const MyPostsView: React.FC<{
    userToken: string | null;
    setActiveView: (view: ActiveView) => void;
}> = ({ userToken, setActiveView }) => {
    const { allDilemmas, resolveDilemma, openReportModal } = useDilemmaStore();
    const { chatSessions, startChat } = useChatStore();

    const myDilemmas = useMemo(() => {
        if (!userToken) return [];
        return allDilemmas.filter(d => d.userToken === userToken).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allDilemmas, userToken]);

    const handleResolve = (dilemmaId: string) => {
        if(userToken) {
            resolveDilemma(dilemmaId, userToken);
        }
    }

    const handleShareClick = () => {
        setActiveView({ view: 'share' });
    };

    return (
        <Card>
            {myDilemmas.length > 0 ? (
                <ul className="posts-list">
                    {myDilemmas.map(dilemma => (
                        <PostCard
                            key={dilemma.id}
                            dilemma={dilemma}
                            onStartChat={(id) => startChat(id, 'seeker')}
                            onReport={openReportModal}
                            onResolve={handleResolve}
                            hasUnread={chatSessions[dilemma.id]?.unread ?? false}
                            isMyPostView={true}
                        />
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={<ShareIcon />}
                    title="You haven't shared anything yet."
                    message="Your voice matters. Click below to share what's on your mind anonymously with the community."
                >
                    <AppButton variant="primary" onClick={handleShareClick}>Share a Dilemma</AppButton>
                </EmptyState>
            )}
        </Card>
    );
};

export default MyPostsView;