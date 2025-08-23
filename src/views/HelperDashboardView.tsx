import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LazyMarkdown } from '../components/LazyMarkdown';
import { Dilemma, ActiveView, Achievement } from '../types';
import { PostCard } from '../components/PostCard';
import { ThumbsUpIcon, PostsIcon, CertifiedIcon, KudosIcon, HeartIcon  } from '../components/icons.dynamic';
import { AppButton } from '../components/AppButton';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { ApiClient } from '../utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { XPBar } from '../components/XPBar';
import { Modal } from '../components/Modal';
import { truncateText } from '../utils/truncateText';
import { useDilemmaStore } from '../stores/dilemmaStore';
import { useSessionStore } from '../stores/sessionStore';
import { useChatStore } from '../stores/chatStore';
import { EmptyState } from '../components/EmptyState';

const iconMap: { [key: string]: React.FC } = {
    HeartIcon,
    PostsIcon,
    KudosIcon
};

export const HelperDashboardView: React.FC<{
    setActiveView: (view: ActiveView) => void;
}> = ({ setActiveView }) => {
    const { helperProfile, updateHelperProfile } = useAuth();
    const { allDilemmas, acceptDilemma, summarizeDilemma, declineRequest } = useDilemmaStore();
    const { helpSessions, generateHelperPerformanceSummary, startVideoChat } = useSessionStore();
    const { startChat } = useChatStore();

    const [activeTab, setActiveTab] = useState<'forYou' | 'requests' | 'available' | 'myDilemmas' | 'history' | 'stats' | 'achievements'>('forYou');
    const [feedbackCount, setFeedbackCount] = useState(0);
    const [_isLoadingFeedback, setIsLoadingFeedback] = useState(true);
    const [matchedDilemmas, setMatchedDilemmas] = useState<Dilemma[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedSummary, setSelectedSummary] = useState('');

    const helperId = helperProfile?.id;
    const isAvailable = helperProfile?.isAvailable || false;
    
    const onToggleAvailability = async (isAvailable: boolean) => {
        if (!helperProfile?.id) return;
        try {
            const updatedProfile = await ApiClient.helpers.setAvailability(helperProfile.id, isAvailable);
            updateHelperProfile(updatedProfile);
        } catch(error) {
            console.error("Failed to set helper availability", error);
        }
    };

    const handleSummarize = async (dilemmaId: string) => {
        await summarizeDilemma(dilemmaId);
    };

    useEffect(() => {
        if (helperId && activeTab === 'stats') {
            setIsLoadingFeedback(true);
            ApiClient.feedback.getFeedbackForHelper(helperId)
                .then(feedback => setFeedbackCount(feedback.length))
                .catch(err => console.error("Failed to load feedback count", err))
                .finally(() => setIsLoadingFeedback(false));
        }
    }, [helperId, activeTab]);
    
    useEffect(() => {
        if (helperId && activeTab === 'achievements') {
            setIsLoadingAchievements(true);
            ApiClient.helpers.getHelperAchievements(helperId)
                .then(setAchievements)
                .catch(err => console.error("Failed to load achievements", err))
                .finally(() => setIsLoadingAchievements(false));
        }
    }, [helperId, activeTab]);

    const fetchMatchedDilemmas = useCallback(async () => {
        if (helperProfile && isAvailable) {
            try {
                const matched = await ApiClient.ai.getAiMatchedDilemmas(helperProfile, allDilemmas);
                setMatchedDilemmas(matched);
            } catch (error) {
                console.error("Failed to fetch matched dilemmas", error);
            }
        } else {
            setMatchedDilemmas([]);
        }
    }, [helperProfile, isAvailable, allDilemmas]);

    useEffect(() => {
        if (activeTab === 'forYou') {
            fetchMatchedDilemmas();
        }
    }, [activeTab, fetchMatchedDilemmas]);

    const directRequests = useMemo(() => 
        allDilemmas.filter(d => d.status === 'direct_request' && d.requestedHelperId === helperId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
    [allDilemmas, helperId]);

    const availableDilemmas = useMemo(() => 
        allDilemmas.filter(d => d.status === 'active' && !d.isReported && !d.assignedHelperId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
    [allDilemmas]);
    
    const myDilemmas = useMemo(() => 
        allDilemmas.filter(d => d.assignedHelperId === helperId && d.status === 'in_progress').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
    [allDilemmas, helperId]);
    
    const myPastSessions = useMemo(() =>
        helpSessions.filter(s => s.helperId === helperId && s.endedAt).sort((a,b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime()),
    [helpSessions, helperId]);

    const supportedPostsCount = useMemo(() => 
        helpSessions.filter(s => s.helperId === helperId).length,
    [helpSessions, helperId]);

    const viewSummary = (summary: string) => {
        setSelectedSummary(summary);
        setIsSummaryModalOpen(true);
    };


    if (!helperProfile) {
        return <div className="loading-spinner" style={{margin: '5rem auto'}}></div>
    }

    const renderTabContent = () => {
        if (!isAvailable && ['forYou', 'requests', 'available'].includes(activeTab)) {
            return <div className="card"><EmptyState title="You are Offline" message="Go online to see and accept new dilemmas from the community."/></div>;
        }

        switch (activeTab) {
            case 'forYou':
                return <ul className="posts-list">{matchedDilemmas.length > 0 ? matchedDilemmas.map(d => <PostCard key={d.id} dilemma={d} isHelperView={true} onAcceptDilemma={acceptDilemma} aiMatchReason={d.aiMatchReason} onSummarize={handleSummarize} />) : <div className="card"><EmptyState title="No Matches Found" message="No specific dilemmas match your expertise right now. Check the 'Available' tab for all posts."/></div>}</ul>;
            case 'requests':
                return <ul className="posts-list">{directRequests.length > 0 ? directRequests.map(d => <PostCard key={d.id} dilemma={d} isHelperView={true} onAcceptDilemma={acceptDilemma} onDeclineRequest={declineRequest} onSummarize={handleSummarize} />) : <div className="card"><EmptyState title="No Direct Requests" message="You have no direct requests from seekers right now."/></div>}</ul>;
            case 'available':
                 return <ul className="posts-list">{availableDilemmas.length > 0 ? availableDilemmas.map(d => <PostCard key={d.id} dilemma={d} isHelperView={true} onAcceptDilemma={acceptDilemma} onSummarize={handleSummarize} />) : <div className="card"><EmptyState title="All Caught Up!" message="No dilemmas currently need support. Great job, team!"/></div>}</ul>;
            case 'myDilemmas':
                return <ul className="posts-list">{myDilemmas.length > 0 ? myDilemmas.map(d => <PostCard key={d.id} dilemma={d} isHelperView={true} onStartChat={() => startChat(d.id, 'helper')} onStartVideoChat={startVideoChat} />) : <div className="card"><EmptyState title="No Active Dilemmas" message='Accept one from the "Available" tab to start a conversation!'/></div>}</ul>;
            case 'history':
                 return <div className="card"><ul style={{ listStyle: 'none', padding: 0 }}>{myPastSessions.length > 0 ? myPastSessions.map(session => (<li key={session.id} className="setting-item" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)'}}><div><p style={{ fontWeight: 'bold' }}>Chat with Seeker ({truncateText(session.seekerId, 12)})</p><small>Ended on {new Date(session.endedAt!).toLocaleDateString()}</small></div><div className="form-actions-group">{
                    session.helperSummaryLoading 
                        ? <div className="loading-spinner" style={{width: '16px', height: '16px', margin: '0 0.5rem'}}></div>
                        : session.helperSummary 
                            ? <AppButton variant="secondary" className="btn-sm" onClick={() => viewSummary(session.helperSummary!)}>View Feedback</AppButton>
                            : <AppButton variant="ghost" className="btn-sm" onClick={() => generateHelperPerformanceSummary(session.id)}>Get AI Feedback</AppButton>
                 }</div></li>)) : <p>You have no completed sessions yet.</p>}</ul></div>;
            case 'stats':
                 return <div className="stats-grid"><div className="card stat-card"><div className="stat-header"><ThumbsUpIcon/><h3>Reputation Score</h3></div><div className="stat-number"><AnimatedNumber value={helperProfile.reputation} /><span style={{fontSize: '1.5rem', color: 'var(--text-secondary)'}}>/ 5.0</span></div><p>Based on {feedbackCount} user feedback ratings.</p></div><div className="card stat-card"><div className="stat-header"><PostsIcon/><h3>Posts Supported</h3></div><div className="stat-number"><AnimatedNumber value={supportedPostsCount} /></div><p>Total posts you've engaged with.</p></div><div className="card stat-card"><div className="stat-header"><KudosIcon/><h3>Kudos Received</h3></div><div className="stat-number"><AnimatedNumber value={helperProfile.kudosCount || 0} /></div><p>Total "Kudos" from seekers you've helped.</p></div><div className="card stat-card"><div className="stat-header"><CertifiedIcon/><h3>Tier</h3></div><div className="stat-number text">{helperProfile.helperType}</div><p>Completed training & verification</p></div></div>;
            case 'achievements':
                return <div className="card"><h2>My Achievements</h2>{isLoadingAchievements ? <div className="loading-spinner"></div> : achievements.length > 0 ? (<div className="stats-grid">{achievements.map(ach => { const Icon = iconMap[ach.icon] || HeartIcon; return (<div key={ach.id} className="card stat-card"><div className="stat-header"><Icon /><h3>{ach.name}</h3></div><p>{ach.description}</p></div>)})}</div>) : (<p>You haven't earned any achievements yet. Keep supporting the community!</p>)}</div>;
            default: return null;
        }
    };

    return (
        <>
            <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Your Private Performance Feedback"><div className="markdown-content"><LazyMarkdown autoLoad={true}>{selectedSummary}</LazyMarkdown></div></Modal>
            <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}><div><h1>Helper Dashboard</h1><p className="view-subheader">Welcome, {helperProfile.displayName}. Your current level is {helperProfile.level}.</p></div><AppButton onClick={() => setActiveView({ view: 'helper-profile' })}>Edit Profile</AppButton></div>
            <XPBar currentXp={helperProfile.xp} nextLevelXp={helperProfile.nextLevelXp} level={helperProfile.level} />
            <div className="card setting-item" style={{marginBottom: '1.5rem'}}><label htmlFor="availability-toggle" style={{fontWeight: 700, fontSize: '1.1rem', color: isAvailable ? 'var(--accent-success)' : 'var(--text-secondary)'}}>{isAvailable ? 'You are Online' : 'You are Offline'}</label><div className="theme-toggle"><input type="checkbox" id="availability-toggle" checked={isAvailable} onChange={e => onToggleAvailability(e.target.checked)} /><label htmlFor="availability-toggle" className="slider"></label></div></div>
            <div className="dashboard-tabs"><AppButton className={activeTab === 'forYou' ? 'active' : ''} onClick={() => setActiveTab('forYou')}>For You</AppButton><AppButton className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Requests ({directRequests.length})</AppButton><AppButton className={activeTab === 'available' ? 'active' : ''} onClick={() => setActiveTab('available')}>Available ({availableDilemmas.length})</AppButton><AppButton className={activeTab === 'myDilemmas' ? 'active' : ''} onClick={() => setActiveTab('myDilemmas')}>My Active ({myDilemmas.length})</AppButton><AppButton className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>Session History</AppButton><AppButton className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>My Stats</AppButton><AppButton className={activeTab === 'achievements' ? 'active' : ''} onClick={() => setActiveTab('achievements')}>Achievements</AppButton></div>
            <div className="dashboard-content">{renderTabContent()}</div>
        </>
    );
}

export default HelperDashboardView;