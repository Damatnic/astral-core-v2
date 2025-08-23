import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiClient } from '../utils/ApiClient';
import { ForumThread, ForumPost, CommunityProposal } from '../types';
import { AppButton } from '../components/AppButton';
import { AppInput, AppTextArea } from '../components/AppInput';
import { formatTimeAgo } from '../utils/formatTimeAgo';

export const HelperCommunityView: React.FC = () => {
    const { helperProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'forum' | 'proposals'>('forum');
    
    // Forum State
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    
    // Proposal State
    const [proposals, setProposals] = useState<CommunityProposal[]>([]);
    const [newProposalTitle, setNewProposalTitle] = useState('');
    const [newProposalDescription, setNewProposalDescription] = useState('');
    
    // Common State
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    const isCouncilMember = (helperProfile?.reputation ?? 0) >= 4.0; // Mock eligibility for creating proposals

    useEffect(() => {
        setIsLoading(true);
        if (activeTab === 'forum') {
            ApiClient.helperCommunity.getThreads().then(data => {
                setThreads(data);
                setIsLoading(false);
            });
        } else if (activeTab === 'proposals') {
            ApiClient.helperCommunity.getProposals().then(data => {
                setProposals(data);
                setIsLoading(false);
            });
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedThread) {
            setIsLoading(true);
            ApiClient.helperCommunity.getPosts(selectedThread.id).then(data => {
                setPosts(data);
                setIsLoading(false);
            });
        }
    }, [selectedThread]);

    const handleCreateThread = async () => {
        if (!newThreadTitle.trim() || !newPostContent.trim() || !helperProfile) return;
        setIsPosting(true);
        try {
            const newThread = await ApiClient.helperCommunity.createThread(
                { title: newThreadTitle.trim(), authorId: helperProfile.id, authorName: helperProfile.displayName },
                newPostContent.trim()
            );
            setThreads(prev => [newThread, ...prev].sort((a,b) => new Date(b.lastReply).getTime() - new Date(a.lastReply).getTime()));
            setNewThreadTitle('');
            setNewPostContent('');
        } catch (e) {
            console.error(e);
            alert("Failed to create thread.");
        } finally {
            setIsPosting(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !helperProfile || !selectedThread) return;
        setIsPosting(true);
        try {
            const newPost = await ApiClient.helperCommunity.createPost({
                threadId: selectedThread.id,
                authorId: helperProfile.id,
                authorName: helperProfile.displayName,
                content: newPostContent.trim()
            });
            setPosts(prev => [...prev, newPost]);
            setNewPostContent('');
            setThreads(prev => prev.map(t => t.id === selectedThread.id ? {...t, postCount: t.postCount + 1, lastReply: new Date().toISOString()} : t)
                .sort((a,b) => new Date(b.lastReply).getTime() - new Date(a.lastReply).getTime()));
        } catch (e) {
            console.error(e);
            alert("Failed to create post.");
        } finally {
            setIsPosting(false);
        }
    };

    const handleCreateProposal = async () => {
        if (!newProposalTitle.trim() || !newProposalDescription.trim() || !helperProfile) return;
        setIsPosting(true);
        try {
            const newProposal = await ApiClient.helperCommunity.createProposal({
                title: newProposalTitle.trim(),
                description: newProposalDescription.trim(),
                authorId: helperProfile.id,
                authorName: helperProfile.displayName,
            });
            setProposals(prev => [newProposal, ...prev]);
            setNewProposalTitle('');
            setNewProposalDescription('');
        } catch(e) {
            console.error(e);
            alert("Failed to create proposal.");
        } finally {
            setIsPosting(false);
        }
    }

    const handleVote = async (proposalId: string, vote: 'for' | 'against' | 'abstain') => {
        if (!helperProfile) return;
        try {
            const updatedProposal = await ApiClient.helperCommunity.voteOnProposal(proposalId, helperProfile.id, vote);
            setProposals(prev => prev.map(p => p.id === proposalId ? updatedProposal : p));
        } catch (e) {
            console.error(e);
            alert("Failed to cast vote.");
        }
    }

    const renderForum = () => {
        if (selectedThread) {
            return (
                <>
                    <div className="view-header" style={{position: 'relative', paddingBottom: '1rem'}}>
                         <AppButton variant="secondary" onClick={() => setSelectedThread(null)} style={{position: 'absolute', top: 0, left: 0}}>Back to Threads</AppButton>
                        <h1>{selectedThread.title}</h1>
                        <p className="view-subheader">Started by {selectedThread.authorName}</p>
                    </div>
                    <div className="posts-list" style={{listStyle: 'none'}}>
                        {posts.map(post => (
                            <div key={post.id} className="card" style={{marginBottom: '1rem'}}>
                                <p>{post.content}</p>
                                <small>by <strong>{post.authorName}</strong> • {formatTimeAgo(post.timestamp)}</small>
                            </div>
                        ))}
                    </div>
                    <div className="card">
                        <h3>Reply to this thread</h3>
                        <AppTextArea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Share your thoughts..." rows={4} />
                        <div className="form-actions"><AppButton onClick={handleCreatePost} isLoading={isPosting}>Post Reply</AppButton></div>
                    </div>
                </>
            )
        }
        return (
            <>
                <div className="card">
                    <h3>Start a New Discussion</h3>
                    <AppInput label="Thread Title" value={newThreadTitle} onChange={e => setNewThreadTitle(e.target.value)} placeholder="What's your discussion about?" />
                    <AppTextArea label="Your first post" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Start the conversation..." rows={4} />
                    <div className="form-actions"><AppButton onClick={handleCreateThread} isLoading={isPosting}>Create Thread</AppButton></div>
                </div>
                <div className="card">
                    <h3>Active Threads</h3>
                    {threads.map(thread => (
                        <div key={thread.id} style={{borderBottom: '1px solid var(--border-color)', padding: '1rem 0', cursor: 'pointer'}} onClick={() => setSelectedThread(thread)}>
                            <h4 style={{fontSize: '1.2rem', marginBottom: '0.25rem'}}>{thread.title}</h4>
                            <small>by <strong>{thread.authorName}</strong> • {thread.postCount} posts • Last reply {formatTimeAgo(thread.lastReply)}</small>
                        </div>
                    ))}
                     {threads.length === 0 && <p>No threads yet. Be the first to start a discussion!</p>}
                </div>
            </>
        )
    };

    const renderProposals = () => (
        <>
            {isCouncilMember && (
                 <div className="card">
                    <h3>Submit a New Proposal</h3>
                    <AppInput label="Proposal Title" value={newProposalTitle} onChange={e => setNewProposalTitle(e.target.value)} placeholder="e.g., Change to Helper Onboarding" />
                    <AppTextArea label="Proposal Description" value={newProposalDescription} onChange={e => setNewProposalDescription(e.target.value)} placeholder="Explain your proposal in detail..." rows={5} />
                    <div className="form-actions"><AppButton onClick={handleCreateProposal} isLoading={isPosting}>Submit Proposal</AppButton></div>
                </div>
            )}
             <div className="card">
                <h3>Open Proposals</h3>
                {proposals.map(p => (
                    <div key={p.id} className="card" style={{border: '1px solid var(--border-color)', marginBottom: '1rem'}}>
                        <h4>{p.title}</h4>
                        <p>{p.description}</p>
                        <small>Proposed by <strong>{p.authorName}</strong> • Ends {formatTimeAgo(p.endsAt)}</small>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                            <div style={{display: 'flex', gap: '1.5rem'}}>
                                <span>For: <strong>{p.votes.for}</strong></span>
                                <span>Against: <strong>{p.votes.against}</strong></span>
                                <span>Abstain: <strong>{p.votes.abstain}</strong></span>
                            </div>
                            <div className="form-actions-group">
                                <AppButton variant="success" onClick={() => handleVote(p.id, 'for')}>For</AppButton>
                                <AppButton variant="danger" onClick={() => handleVote(p.id, 'against')}>Against</AppButton>
                                <AppButton variant="secondary" onClick={() => handleVote(p.id, 'abstain')}>Abstain</AppButton>
                            </div>
                        </div>
                    </div>
                ))}
                 {proposals.length === 0 && <p>No open proposals.</p>}
            </div>
        </>
    );

    return (
        <>
            <div className="view-header">
                <h1>Helper Community</h1>
                <p className="view-subheader">A private space to connect, share experiences, and shape the community.</p>
            </div>
            <div className="dashboard-tabs">
                <AppButton className={activeTab === 'forum' ? 'active' : ''} onClick={() => setActiveTab('forum')}>Forum</AppButton>
                <AppButton className={activeTab === 'proposals' ? 'active' : ''} onClick={() => setActiveTab('proposals')}>Proposals</AppButton>
            </div>
             <div className="dashboard-content">
                {isLoading ? (
                     <div className="loading-spinner" style={{ margin: '5rem auto' }}></div>
                ) : activeTab === 'forum' ? renderForum() : renderProposals()}
            </div>
        </>
    );
};

export default HelperCommunityView;