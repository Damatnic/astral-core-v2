import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ViewHeader } from '../components/ViewHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { ShieldIcon, CheckIcon, XIcon, AlertIcon, SearchIcon } from '../components/icons.dynamic';

interface ModerationAction {
  id: string;
  type: 'approve' | 'reject' | 'warn' | 'ban' | 'unban' | 'delete' | 'restore';
  targetType: 'post' | 'comment' | 'user' | 'report';
  targetId: string;
  targetTitle?: string;
  targetUser?: string;
  reason: string;
  notes?: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: Date;
  appealStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  relatedReportId?: string;
}

interface ModerationStats {
  totalActions: number;
  approvals: number;
  rejections: number;
  warnings: number;
  bans: number;
  averageResponseTime: number;
  appealRate: number;
  overturnRate: number;
}

interface FilterOptions {
  actionType: string;
  targetType: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
  moderator: string;
  searchQuery: string;
}

const ModerationHistoryView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [history, setHistory] = useState<ModerationAction[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ModerationAction[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    actionType: 'all',
    targetType: 'all',
    dateRange: 'week',
    moderator: 'all',
    searchQuery: ''
  });
  const [selectedAction, setSelectedAction] = useState<ModerationAction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadModerationHistory();
    loadModerationStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, filters]);

  const loadModerationHistory = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockHistory: ModerationAction[] = [
        {
          id: '1',
          type: 'approve',
          targetType: 'post',
          targetId: 'post-123',
          targetTitle: 'Seeking advice on anxiety management',
          targetUser: 'AnxiousUser',
          reason: 'Content meets community guidelines',
          notes: 'Helpful resource for community',
          moderatorId: 'mod-1',
          moderatorName: 'ModeratorAlpha',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          appealStatus: 'none'
        },
        {
          id: '2',
          type: 'reject',
          targetType: 'comment',
          targetId: 'comment-456',
          targetUser: 'TrollUser',
          reason: 'Inappropriate language',
          notes: 'Multiple violations of community guidelines',
          moderatorId: 'mod-1',
          moderatorName: 'ModeratorAlpha',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          appealStatus: 'pending',
          relatedReportId: 'report-789'
        },
        {
          id: '3',
          type: 'warn',
          targetType: 'user',
          targetId: 'user-789',
          targetUser: 'ProblematicUser',
          reason: 'Repeated off-topic posts',
          notes: 'First warning issued',
          moderatorId: 'mod-2',
          moderatorName: 'ModeratorBeta',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          appealStatus: 'none'
        },
        {
          id: '4',
          type: 'ban',
          targetType: 'user',
          targetId: 'user-999',
          targetUser: 'SpammerUser',
          reason: 'Spam and self-promotion',
          notes: '7-day temporary ban',
          moderatorId: 'mod-1',
          moderatorName: 'ModeratorAlpha',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          appealStatus: 'rejected'
        }
      ];

      setHistory(mockHistory);
      
    } catch (error) {
      console.error('Error loading moderation history:', error);
      showNotification('error', 'Failed to load moderation history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadModerationStats = async () => {
    try {
      // Mock stats
      const mockStats: ModerationStats = {
        totalActions: 156,
        approvals: 89,
        rejections: 34,
        warnings: 23,
        bans: 10,
        averageResponseTime: 2.5, // hours
        appealRate: 0.15,
        overturnRate: 0.08
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Apply action type filter
    if (filters.actionType !== 'all') {
      filtered = filtered.filter(action => action.type === filters.actionType);
    }

    // Apply target type filter
    if (filters.targetType !== 'all') {
      filtered = filtered.filter(action => action.targetType === filters.targetType);
    }

    // Apply date range filter
    const now = Date.now();
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(action => 
          now - action.timestamp.getTime() < 24 * 60 * 60 * 1000
        );
        break;
      case 'week':
        filtered = filtered.filter(action => 
          now - action.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
        );
        break;
      case 'month':
        filtered = filtered.filter(action => 
          now - action.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000
        );
        break;
    }

    // Apply moderator filter
    if (filters.moderator !== 'all') {
      filtered = filtered.filter(action => action.moderatorId === filters.moderator);
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(action => 
        action.targetTitle?.toLowerCase().includes(query) ||
        action.targetUser?.toLowerCase().includes(query) ||
        action.reason.toLowerCase().includes(query) ||
        action.notes?.toLowerCase().includes(query)
      );
    }

    // Sort by most recent
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredHistory(filtered);
  };

  const handleViewDetails = (action: ModerationAction) => {
    setSelectedAction(action);
    setShowDetails(true);
  };

  const handleAppealDecision = async (actionId: string, decision: 'approve' | 'reject') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHistory(prev => prev.map(action => {
        if (action.id === actionId) {
          return {
            ...action,
            appealStatus: decision === 'approve' ? 'approved' : 'rejected'
          };
        }
        return action;
      }));
      
      showNotification('success', `Appeal ${decision === 'approve' ? 'approved' : 'rejected'}`);
      setShowDetails(false);
    } catch (error) {
      console.error('Error processing appeal:', error);
      showNotification('error', 'Failed to process appeal');
    }
  };

  const handleExportHistory = () => {
    try {
      const csvContent = [
        ['Date', 'Action', 'Target Type', 'Target', 'Reason', 'Moderator', 'Appeal Status'],
        ...filteredHistory.map(action => [
          action.timestamp.toISOString(),
          action.type,
          action.targetType,
          action.targetUser || action.targetId,
          action.reason,
          action.moderatorName,
          action.appealStatus || 'none'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moderation-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('success', 'History exported successfully');
    } catch (error) {
      console.error('Error exporting history:', error);
      showNotification('error', 'Failed to export history');
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'approve':
        return <CheckIcon className="text-green-500" />;
      case 'reject':
      case 'delete':
        return <XIcon className="text-red-500" />;
      case 'warn':
        return <AlertIcon className="text-yellow-500" />;
      case 'ban':
        return <ShieldIcon className="text-red-600" />;
      default:
        return <ShieldIcon className="text-gray-500" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'approve':
      case 'restore':
        return 'success';
      case 'reject':
      case 'delete':
      case 'ban':
        return 'danger';
      case 'warn':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading moderation history...</p>
      </div>
    );
  }

  return (
    <div className="moderation-history-view">
      <ViewHeader
        title="Moderation History"
        subtitle="Review past moderation actions and appeals"
      />

      {stats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-value">{stats.totalActions}</div>
            <div className="stat-label">Total Actions</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.approvals}</div>
            <div className="stat-label">Approvals</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.rejections}</div>
            <div className="stat-label">Rejections</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.warnings}</div>
            <div className="stat-label">Warnings</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.bans}</div>
            <div className="stat-label">Bans</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.averageResponseTime.toFixed(1)}h</div>
            <div className="stat-label">Avg Response</div>
          </Card>
        </div>
      )}

      <Card className="filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Action Type</label>
            <select
              value={filters.actionType}
              onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
            >
              <option value="all">All Actions</option>
              <option value="approve">Approvals</option>
              <option value="reject">Rejections</option>
              <option value="warn">Warnings</option>
              <option value="ban">Bans</option>
              <option value="delete">Deletions</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Target Type</label>
            <select
              value={filters.targetType}
              onChange={(e) => setFilters(prev => ({ ...prev, targetType: e.target.value }))}
            >
              <option value="all">All Targets</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
              <option value="user">Users</option>
              <option value="report">Reports</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search</label>
            <div className="search-input">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search history..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <AppButton
          variant="secondary"
          size="small"
          onClick={handleExportHistory}
        >
          Export History
        </AppButton>
      </Card>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <Card className="empty-state">
            <p>No moderation actions found matching your filters</p>
          </Card>
        ) : (
          filteredHistory.map(action => (
            <Card key={action.id} className="history-item">
              <div className="action-header">
                <div className="action-type">
                  {getActionIcon(action.type)}
                  <span className={`action-label ${action.type}`}>
                    {action.type.toUpperCase()}
                  </span>
                </div>
                <span className="action-time">
                  {formatTimeAgo(action.timestamp)}
                </span>
              </div>

              <div className="action-content">
                <div className="action-target">
                  <strong>{action.targetType}:</strong>
                  {action.targetTitle ? (
                    <span> "{action.targetTitle}"</span>
                  ) : (
                    <span> {action.targetId}</span>
                  )}
                  {action.targetUser && (
                    <span className="target-user"> by @{action.targetUser}</span>
                  )}
                </div>

                <div className="action-reason">
                  <strong>Reason:</strong> {action.reason}
                </div>

                {action.notes && (
                  <div className="action-notes">
                    <strong>Notes:</strong> {action.notes}
                  </div>
                )}

                <div className="action-meta">
                  <span>Moderator: {action.moderatorName}</span>
                  {action.appealStatus && action.appealStatus !== 'none' && (
                    <span className={`appeal-status ${action.appealStatus}`}>
                      Appeal: {action.appealStatus}
                    </span>
                  )}
                </div>

                <div className="action-buttons">
                  <AppButton
                    variant="secondary"
                    size="small"
                    onClick={() => handleViewDetails(action)}
                  >
                    View Details
                  </AppButton>
                  
                  {action.appealStatus === 'pending' && (
                    <>
                      <AppButton
                        variant="success"
                        size="small"
                        onClick={() => handleAppealDecision(action.id, 'approve')}
                      >
                        Approve Appeal
                      </AppButton>
                      <AppButton
                        variant="danger"
                        size="small"
                        onClick={() => handleAppealDecision(action.id, 'reject')}
                      >
                        Reject Appeal
                      </AppButton>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showDetails && selectedAction && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <Card className="details-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Action Details</h2>
            
            <div className="detail-row">
              <strong>Action ID:</strong> {selectedAction.id}
            </div>
            <div className="detail-row">
              <strong>Type:</strong> {selectedAction.type}
            </div>
            <div className="detail-row">
              <strong>Target:</strong> {selectedAction.targetType} - {selectedAction.targetId}
            </div>
            <div className="detail-row">
              <strong>Timestamp:</strong> {selectedAction.timestamp.toLocaleString()}
            </div>
            <div className="detail-row">
              <strong>Moderator:</strong> {selectedAction.moderatorName} ({selectedAction.moderatorId})
            </div>
            
            {selectedAction.relatedReportId && (
              <div className="detail-row">
                <strong>Related Report:</strong> {selectedAction.relatedReportId}
              </div>
            )}
            
            <AppButton
              variant="secondary"
              onClick={() => setShowDetails(false)}
            >
              Close
            </AppButton>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModerationHistoryView;
