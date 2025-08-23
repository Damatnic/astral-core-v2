import React, { useState, useCallback } from 'react';
import { PostCard } from '../components/PostCard';
import { SkeletonPostCard } from '../components/SkeletonPostCard';
import { SearchIcon } from '../components/icons.dynamic';
import { CATEGORIES } from '../constants';
import { AppButton } from '../components/AppButton';
import { useDilemmaStore } from '../stores/dilemmaStore';
import { useChatStore } from '../stores/chatStore';
import { ViewHeader } from '../components/ViewHeader';
import { ErrorState } from '../components/ErrorState';
import { Card } from '../components/Card';
import { usePreferenceStore } from '../stores/preferenceStore';
import { usePullToRefresh } from '../hooks/useSwipeGesture';

export const FeedView: React.FC = () => {
    const { 
        visibleDilemmas, 
        forYouDilemmas,
        isLoading, 
        toggleSupport, 
        filter, 
        setFilter, 
        sort, 
        setSort, 
        searchTerm, 
        setSearchTerm, 
        loadMore, 
        hasMore,
        openReportModal,
        fetchDilemmas,
        fetchForYouFeed
    } = useDilemmaStore();
    const { chatSessions, startChat } = useChatStore();
    const { contentFilters } = usePreferenceStore();

    const [activeTab, setActiveTab] = useState<'forYou' | 'community'>('forYou');
    const dilemmasToDisplay = activeTab === 'forYou' ? forYouDilemmas : visibleDilemmas;

    // Pull-to-refresh functionality
    const handleRefresh = useCallback(async () => {
        try {
            if (activeTab === 'forYou') {
                await fetchForYouFeed();
            } else {
                await fetchDilemmas();
            }
        } catch (error) {
            console.error('Failed to refresh feed:', error);
        }
    }, [activeTab, fetchForYouFeed, fetchDilemmas]);

    const {
        ref: pullToRefreshRef,
        isPulling,
        isRefreshing,
        pullProgress
    } = usePullToRefresh(handleRefresh, {
        threshold: 80,
        enabled: !isLoading
    });

    return (
      <div ref={pullToRefreshRef} className="feed-view-container">
        {/* Pull-to-refresh indicator */}
        <div 
          className={`pull-to-refresh ${isPulling ? 'active' : ''} ${isRefreshing ? 'refreshing' : ''}`}
          style={{ opacity: pullProgress }}
        >
          {isRefreshing ? '⟳' : '↓'}
        </div>

        <ViewHeader 
          title="Community Feed"
          subtitle="A place to connect and find support."
        />

        <div className="dashboard-tabs">
            <AppButton className={activeTab === 'forYou' ? 'active' : ''} onClick={() => setActiveTab('forYou')}>For You</AppButton>
            <AppButton className={activeTab === 'community' ? 'active' : ''} onClick={() => setActiveTab('community')}>Community</AppButton>
        </div>

        <div className="card filter-sort-bar">
            <div className="search-group">
                <SearchIcon />
                <input
                    type="search"
                    placeholder="Search posts..."
                    className="search-input"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="filter-group">
                <label>Filter by:</label>
                <div className="filter-buttons">
                    <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
                    {CATEGORIES.map(cat => (
                         <button key={cat} className={filter === cat ? 'active' : ''} onClick={() => setFilter(cat)}>{cat}</button>
                    ))}
                </div>
            </div>
            <div className="sort-group">
                <label htmlFor="sort-select">Sort by:</label>
                <select id="sort-select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                    <option value="newest">Newest</option>
                    <option value="most-support">Most Support</option>
                    <option value="needs-support">Needs Support</option>
                </select>
            </div>
        </div>
        
        {isLoading ? (
            <ul className="posts-list">
                {[...Array(3)].map((_, i) => <SkeletonPostCard key={i} />)}
            </ul>
        ) : dilemmasToDisplay.length > 0 ? (
          <ul className="posts-list">
            {dilemmasToDisplay.map(dilemma => (
                <PostCard
                    key={dilemma.id}
                    dilemma={dilemma}
                    onToggleSupport={toggleSupport}
                    onStartChat={(dilemmaId) => startChat(dilemmaId, 'seeker')}
                    onReport={openReportModal}
                    hasUnread={chatSessions[dilemma.id]?.unread ?? false}
                    filteredCategories={contentFilters}
                />
            ))}
          </ul>
        ) : (
          <Card>
            <ErrorState
                title="No Posts Found"
                message="Try adjusting your search or filter settings to find what you're looking for."
            />
          </Card>
        )}
        {hasMore && !isLoading && activeTab === 'community' && (
            <div className="load-more-container">
                <button className="btn btn-secondary" onClick={loadMore}>Load More</button>
            </div>
        )}
      </div>
    );
};


export default FeedView;