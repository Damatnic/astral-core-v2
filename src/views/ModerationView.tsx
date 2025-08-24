import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { Modal } from '../components/Modal';
import { AppInput, AppTextArea } from '../components/AppInput';
import { ViewHeader } from '../components/ViewHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import {
  ShieldIcon,
  AlertTriangleIcon,
  FlagIcon,
  UserIcon,
  MessageSquareIcon,
  EyeIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  TrendingUpIcon,
  BarChart3Icon,
  FilterIcon
} from '../components/icons.dynamic';

interface ModerationReport {
  id: string;
  type: 'harassment' | 'inappropriate_content' | 'spam' | 'safety_concern' | 'misinformation' | 'other';
  reportedContent: {
    id: string;
    type: 'message' | 'post' | 'profile' | 'comment';
    content: string;
    author: string;
    timestamp: Date;
  };
  reporter: {
    id: string;
    name: string;
    isHelper: boolean;
  };
  reason: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  actionsTaken: Array<{
    action: string;
    moderator: string;
    timestamp: Date;
    notes?: string;
  }>;
  resolution?: {
    decision: 'warning' | 'temporary_ban' | 'permanent_ban' | 'content_removed' | 'no_action';
    reason: string;
    duration?: number; // in days for bans
    moderator: string;
    timestamp: Date;
  };
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  averageResolutionTime: number; // in hours
  reportsByType: Record<string, number>;
  reportsByPriority: Record<string, number>;
  moderatorActivity: Array<{
    moderator: string;
    reportsHandled: number;
    averageTime: number;
  }>;
}

interface ContentFilter {
  type: ModerationReport['type'] | 'all';
  status: ModerationReport['status'] | 'all';
  priority: ModerationReport['priority'] | 'all';
  dateRange: 'today' | 'week' | 'month' | 'all';
}

export const ModerationView: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ContentFilter>({
    type: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [actionNotes, setActionNotes] = useState('');
  const [resolutionDecision, setResolutionDecision] = useState<ModerationReport['resolution']['decision'] | ''>('');

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real app, this would be API calls
      const mockReports: ModerationReport[] = [
        {
          id: '1',
          type: 'harassment',
          reportedContent: {
            id: 'msg_123',
            type: 'message',
            content: 'This is an example of reported inappropriate content that needs moderation review.',
            author: 'user_456',
            timestamp: new Date('2024-01-16T10:30:00')
          },
          reporter: {
            id: 'user_789',
            name: 'Sarah M.',
            isHelper: true
          },
          reason: 'User is being consistently hostile and using inappropriate language',
          status: 'pending',
          priority: 'high',
          createdAt: new Date('2024-01-16T11:00:00'),
          updatedAt: new Date('2024-01-16T11:00:00'),
          actionsTaken: []
        },
        {
          id: '2',
          type: 'safety_concern',
          reportedContent: {
            id: 'post_456',
            type: 'post',
            content: 'User expressing concerning thoughts that may indicate self-harm risk.',
            author: 'user_321',
            timestamp: new Date('2024-01-15T14:20:00')
          },
          reporter: {
            id: 'helper_456',
            name: 'Mike Chen',
            isHelper: true
          },
          reason: 'User expressing thoughts of self-harm, needs immediate attention',
          status: 'escalated',
          priority: 'critical',
          assignedTo: 'crisis_team',
          createdAt: new Date('2024-01-15T14:30:00'),
          updatedAt: new Date('2024-01-16T09:15:00'),
          actionsTaken: [
            {
              action: 'Escalated to crisis intervention team',
              moderator: 'admin_1',
              timestamp: new Date('2024-01-15T14:35:00'),
              notes: 'User showing clear signs of distress, immediate intervention required'
            },
            {
              action: 'Crisis team contacted user directly',
              moderator: 'crisis_team',
              timestamp: new Date('2024-01-16T09:15:00'),
              notes: 'Professional counselor reached out, user is receiving appropriate support'
            }
          ]
        },
        {
          id: '3',
          type: 'spam',
          reportedContent: {
            id: 'post_789',
            type: 'post',
            content: 'Check out this amazing product that will solve all your problems! Click here now!',
            author: 'user_spam',
            timestamp: new Date('2024-01-16T08:45:00')
          },
          reporter: {
            id: 'user_111',
            name: 'Anonymous User',
            isHelper: false
          },
          reason: 'Promotional content not related to mental health support',
          status: 'resolved',
          priority: 'low',
          createdAt: new Date('2024-01-16T09:00:00'),
          updatedAt: new Date('2024-01-16T10:30:00'),
          actionsTaken: [
            {
              action: 'Content reviewed and removed',
              moderator: 'mod_2',
              timestamp: new Date('2024-01-16T10:30:00'),
              notes: 'Clear spam content, removed and user warned'
            }
          ],
          resolution: {
            decision: 'content_removed',
            reason: 'Promotional spam content not appropriate for support community',
            moderator: 'mod_2',
            timestamp: new Date('2024-01-16T10:30:00')
          }
        }
      ];

      const mockStats: ModerationStats = {
        totalReports: 45,
        pendingReports: 8,
        resolvedToday: 12,
        averageResolutionTime: 4.2,
        reportsByType: {
          harassment: 15,
          inappropriate_content: 12,
          spam: 8,
          safety_concern: 6,
          misinformation: 3,
          other: 1
        },
        reportsByPriority: {
          low: 18,
          medium: 15,
          high: 8,
          critical: 4
        },
        moderatorActivity: [
          { moderator: 'mod_1', reportsHandled: 15, averageTime: 3.8 },
          { moderator: 'mod_2', reportsHandled: 12, averageTime: 4.5 },
          { moderator: 'crisis_team', reportsHandled: 4, averageTime: 1.2 }
        ]
      };

      setReports(mockReports);
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
      addNotification('Failed to load moderation data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: string, notes?: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? {
              ...report,
              actionsTaken: [
                ...report.actionsTaken,
                {
                  action,
                  moderator: user?.displayName || 'Current User',
                  timestamp: new Date(),
                  notes
                }
              ],
              updatedAt: new Date(),
              status: action.includes('resolve') ? 'resolved' : 
                     action.includes('escalate') ? 'escalated' : 
                     'investigating'
            }
          : report
      ));

      addNotification('Action recorded successfully', 'success');
      setIsReportModalOpen(false);
      setSelectedReport(null);
      setActionNotes('');
    } catch (error) {
      console.error('Failed to record action:', error);
      addNotification('Failed to record action', 'error');
    }
  };

  const handleResolveReport = async (reportId: string, decision: ModerationReport['resolution']['decision'], reason: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? {
              ...report,
              status: 'resolved',
              resolution: {
                decision,
                reason,
                moderator: user?.displayName || 'Current User',
                timestamp: new Date()
              },
              updatedAt: new Date()
            }
          : report
      ));

      addNotification('Report resolved successfully', 'success');
      setIsReportModalOpen(false);
      setSelectedReport(null);
      setResolutionDecision('');
      setActionNotes('');
    } catch (error) {
      console.error('Failed to resolve report:', error);
      addNotification('Failed to resolve report', 'error');
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter.type !== 'all' && report.type !== filter.type) return false;
    if (filter.status !== 'all' && report.status !== filter.status) return false;
    if (filter.priority !== 'all' && report.priority !== filter.priority) return false;
    
    if (filter.dateRange !== 'all') {
      const now = new Date();
      const reportDate = report.createdAt;
      const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (filter.dateRange === 'today' && daysDiff > 1) return false;
      if (filter.dateRange === 'week' && daysDiff > 7) return false;
      if (filter.dateRange === 'month' && daysDiff > 30) return false;
    }
    
    return true;
  });

  const getPriorityColor = (priority: ModerationReport['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: ModerationReport['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'dismissed': return 'text-gray-600 bg-gray-100';
      case 'escalated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <ViewHeader
          title="Community Moderation"
          subtitle="Monitor and manage community safety and content quality"
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalReports}</p>
              </div>
              <FlagIcon className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingReports}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.resolvedToday}</p>
              </div>
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Completed cases</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resolution</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.averageResolutionTime}h</p>
              </div>
              <TrendingUpIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Response time</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-4 flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>
            
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as ContentFilter['type'] }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="spam">Spam</option>
              <option value="safety_concern">Safety Concern</option>
              <option value="misinformation">Misinformation</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as ContentFilter['status'] }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
              <option value="escalated">Escalated</option>
            </select>

            <select
              value={filter.priority}
              onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as ContentFilter['priority'] }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filter.dateRange}
              onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as ContentFilter['dateRange'] }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card className="p-8 text-center">
              <ShieldIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports found</h3>
              <p className="text-gray-500">No moderation reports match your current filters.</p>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {report.type.replace('_', ' ').toUpperCase()}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Reported {report.reportedContent.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          by {report.reportedContent.author} • {formatTimeAgo(report.reportedContent.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm">
                        {report.reportedContent.content}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reported by</p>
                        <p className="font-medium">
                          {report.reporter.name} {report.reporter.isHelper && '(Helper)'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reported</p>
                        <p className="font-medium">{formatTimeAgo(report.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reason</p>
                      <p className="text-gray-800 dark:text-gray-200">{report.reason}</p>
                    </div>

                    {report.actionsTaken.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Actions Taken:</p>
                        <div className="space-y-2">
                          {report.actionsTaken.map((action, index) => (
                            <div key={index} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{action.action}</span>
                                <span className="text-xs text-gray-500">
                                  {action.moderator} • {formatTimeAgo(action.timestamp)}
                                </span>
                              </div>
                              {action.notes && (
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{action.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.resolution && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-green-800 dark:text-green-200">
                            Resolution: {report.resolution.decision.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {report.resolution.moderator} • {formatTimeAgo(report.resolution.timestamp)}
                          </span>
                        </div>
                        <p className="text-green-700 dark:text-green-300 text-sm">{report.resolution.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <AppButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsReportModalOpen(true);
                      }}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Review
                    </AppButton>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Report Action Modal */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedReport(null);
            setActionNotes('');
            setResolutionDecision('');
          }}
          title={`Moderate Report: ${selectedReport?.type.replace('_', ' ').toUpperCase()}`}
        >
          {selectedReport && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reported Content</h4>
                <p className="text-gray-800 dark:text-gray-200 text-sm mb-2">
                  {selectedReport.reportedContent.content}
                </p>
                <p className="text-xs text-gray-500">
                  by {selectedReport.reportedContent.author} • {formatTimeAgo(selectedReport.reportedContent.timestamp)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Report Details</h4>
                <p className="text-gray-800 dark:text-gray-200 text-sm">{selectedReport.reason}</p>
              </div>

              {selectedReport.status !== 'resolved' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resolution Decision
                    </label>
                    <select
                      value={resolutionDecision}
                      onChange={(e) => setResolutionDecision(e.target.value as ModerationReport['resolution']['decision'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select action...</option>
                      <option value="no_action">No Action Required</option>
                      <option value="warning">Issue Warning</option>
                      <option value="content_removed">Remove Content</option>
                      <option value="temporary_ban">Temporary Ban</option>
                      <option value="permanent_ban">Permanent Ban</option>
                    </select>
                  </div>

                  <AppTextArea
                    label="Action Notes"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Explain your decision and any actions taken..."
                    rows={4}
                  />

                  <div className="flex justify-end space-x-3">
                    <AppButton
                      variant="outline"
                      onClick={() => {
                        setIsReportModalOpen(false);
                        setSelectedReport(null);
                        setActionNotes('');
                        setResolutionDecision('');
                      }}
                    >
                      Cancel
                    </AppButton>
                    
                    {selectedReport.priority === 'critical' && (
                      <AppButton
                        variant="danger"
                        onClick={() => handleReportAction(selectedReport.id, 'Escalated to crisis team', actionNotes)}
                      >
                        Escalate
                      </AppButton>
                    )}
                    
                    <AppButton
                      onClick={() => handleResolveReport(selectedReport.id, resolutionDecision, actionNotes)}
                      disabled={!resolutionDecision || !actionNotes.trim()}
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Resolve
                    </AppButton>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ModerationView;
