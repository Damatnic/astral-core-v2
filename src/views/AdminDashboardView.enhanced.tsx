import React, { useState, useEffect, useCallback } from 'react';
import { Helper, CommunityStats } from '../types';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { AppTextArea } from '../components/AppInput';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { demoDataService } from '../services/demoDataService';

export const AdminDashboardView: React.FC<{
    onUpdateApplicationStatus: (helperId: string, status: Helper['applicationStatus'], notes?: string) => void;
}> = ({ onUpdateApplicationStatus }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'moderation' | 'analytics' | 'system'>('overview');
    const [applications, setApplications] = useState<Helper[]>([]);
    const [adminData, setAdminData] = useState<any>(null);
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState<Helper | null>(null);
    const [applicantDetails, setApplicantDetails] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rejectionNotes, setRejectionNotes] = useState('');

    const fetchAdminData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Get demo data for admin role
            const demoData = demoDataService.getDemoData('admin');
            setAdminData(demoData);
            setApplications(demoData.helperApplications || []);
            setStats(demoData.communityStats);
        } catch(err) {
            console.error(err);
            alert("Failed to load admin data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const handleViewApplicant = async (applicant: Helper) => {
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
        setApplicantDetails(applicant);
    };

    const handleApprove = () => {
        if (selectedApplicant) {
            onUpdateApplicationStatus(selectedApplicant.id, 'approved');
            setIsModalOpen(false);
            fetchAdminData();
        }
    };

    const handleReject = () => {
        if (selectedApplicant && rejectionNotes.trim()) {
            onUpdateApplicationStatus(selectedApplicant.id, 'rejected', rejectionNotes);
            setIsModalOpen(false);
            setRejectionNotes('');
            fetchAdminData();
        } else {
            alert("Please provide rejection notes.");
        }
    };

    const renderOverviewTab = () => (
        <div className="admin-overview">
            {adminData?.profile && (
                <Card className="admin-profile-card">
                    <h3>👨‍💼 {adminData.profile.name}</h3>
                    <p><strong>Role:</strong> {adminData.profile.role}</p>
                    <p><strong>Department:</strong> {adminData.profile.department}</p>
                    <p><strong>Clearance:</strong> {adminData.profile.clearanceLevel}</p>
                    <p><strong>Experience:</strong> {adminData.profile.yearsWithPlatform} years</p>
                </Card>
            )}
            
            <div className="overview-metrics">
                {adminData?.analytics && (
                    <>
                        <Card className="metric-card">
                            <h4>👥 Platform Users</h4>
                            <div className="metric-number">{adminData.analytics.userMetrics.totalActiveUsers.toLocaleString()}</div>
                            <small>+{adminData.analytics.userMetrics.newRegistrationsToday} today</small>
                        </Card>
                        <Card className="metric-card">
                            <h4>🌟 Active Helpers</h4>
                            <div className="metric-number">{adminData.analytics.helperMetrics.totalActiveHelpers}</div>
                            <small>{adminData.analytics.helperMetrics.helpersOnline} online now</small>
                        </Card>
                        <Card className="metric-card crisis">
                            <h4>🚨 Crisis Alerts Today</h4>
                            <div className="metric-number">{adminData.analytics.crisisMetrics.crisisAlertsToday}</div>
                            <small>{adminData.analytics.crisisMetrics.crisisResolutionRate}% resolved</small>
                        </Card>
                        <Card className="metric-card">
                            <h4>📊 System Health</h4>
                            <div className="metric-number">{adminData.analytics.platformHealth.systemUptime}%</div>
                            <small>Uptime • {adminData.analytics.platformHealth.performanceScore}/100 score</small>
                        </Card>
                    </>
                )}
            </div>

            {adminData?.escalatedCases && adminData.escalatedCases.length > 0 && (
                <Card className="urgent-alerts">
                    <h3>🚨 Urgent Items Requiring Attention</h3>
                    {adminData.escalatedCases.filter((caseItem: any) => caseItem.status === 'urgent_intervention' || caseItem.priority === 'urgent').map((urgentCase: any) => (
                        <div key={urgentCase.id} className="urgent-item">
                            <strong>{urgentCase.type.replace(/_/g, ' ').toUpperCase()}</strong>
                            <p>{urgentCase.description}</p>
                            <small>Escalated: {new Date(urgentCase.escalationTime).toLocaleString()}</small>
                        </div>
                    ))}
                </Card>
            )}

            {adminData?.recentActions && (
                <Card>
                    <h3>📋 Recent Administrative Actions</h3>
                    {adminData.recentActions.slice(0, 5).map((action: any) => (
                        <div key={action.id} className="action-item">
                            <strong>{action.type.replace(/_/g, ' ')}</strong>: {action.description}
                            <small>{new Date(action.timestamp).toLocaleString()}</small>
                        </div>
                    ))}
                </Card>
            )}
        </div>
    );

    const renderApplicationsTab = () => (
        <Card>
            <h3>Helper Applications Review</h3>
            {isLoading ? <div className="loading-spinner" /> : adminData?.profile?.helperApplications?.length > 0 ? (
                <div className="applications-grid">
                    {adminData.profile.helperApplications.map((app: any) => (
                        <Card key={app.id} className={`application-card ${app.priority}`}>
                            <div className="app-header">
                                <h4>{app.applicantName}</h4>
                                <span className={`status-badge ${app.status}`}>{app.status.replace(/_/g, ' ')}</span>
                            </div>
                            <p><strong>Type:</strong> {app.applicationType}</p>
                            <p><strong>Specialties:</strong> {app.specialties.join(', ')}</p>
                            <p><strong>Background Check:</strong> <span className={`status ${app.backgroundCheckStatus}`}>{app.backgroundCheckStatus}</span></p>
                            <p><strong>References:</strong> {app.referencesVerified ? '✅ Verified' : '⏳ Pending'}</p>
                            <p><strong>Risk:</strong> <span className={`risk ${app.riskAssessment}`}>{app.riskAssessment}</span></p>
                            {app.reviewNotes && <p><strong>Notes:</strong> {app.reviewNotes}</p>}
                            <small>Submitted: {new Date(app.submissionDate).toLocaleDateString()}</small>
                            <div className="app-actions">
                                {app.status === 'pending_review' && (
                                    <>
                                        <AppButton variant="success" className="btn-sm" onClick={() => {}}>Approve</AppButton>
                                        <AppButton variant="danger" className="btn-sm" onClick={() => {}}>Reject</AppButton>
                                    </>
                                )}
                                <AppButton className="btn-sm" onClick={() => {}}>View Details</AppButton>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : applications.length > 0 ? (
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{borderBottom: '2px solid var(--border-color)'}}>
                            <th style={{padding: '0.75rem', textAlign: 'left'}}>Display Name</th>
                            <th style={{padding: '0.75rem', textAlign: 'left'}}>Application Date</th>
                            <th style={{padding: '0.75rem', textAlign: 'left'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                <td style={{padding: '0.75rem'}}>{app.displayName}</td>
                                <td style={{padding: '0.75rem'}}>{new Date(app.joinDate).toLocaleDateString()}</td>
                                <td style={{padding: '0.75rem'}}><AppButton className="btn-sm" onClick={() => handleViewApplicant(app)}>Review</AppButton></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p>No pending applications.</p>}
        </Card>
    );

    const renderModerationTab = () => (
        <div className="moderation-section">
            {adminData?.profile?.escalatedCases && (
                <Card>
                    <h3>🚨 Escalated Moderation Cases</h3>
                    <div className="cases-grid">
                        {adminData.profile.escalatedCases.map((caseItem: any) => (
                            <Card key={caseItem.id} className={`case-card ${caseItem.status}`}>
                                <div className="case-header">
                                    <h4>{caseItem.type.replace(/_/g, ' ')}</h4>
                                    <span className={`status-badge ${caseItem.status}`}>{caseItem.status.replace(/_/g, ' ')}</span>
                                </div>
                                <p>{caseItem.description}</p>
                                <p><strong>Reported by:</strong> {caseItem.reportedBy}</p>
                                <p><strong>Escalated:</strong> {new Date(caseItem.escalationTime).toLocaleString()}</p>
                                {caseItem.actionsTaken.length > 0 && (
                                    <div>
                                        <strong>Actions Taken:</strong>
                                        <ul>
                                            {caseItem.actionsTaken.map((action: string, actionIndex: number) => (
                                                <li key={`${caseItem.id}-action-${actionIndex}`}>{action}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="case-actions">
                                    <AppButton className="btn-sm" onClick={() => {}}>View Details</AppButton>
                                    {caseItem.followUpRequired && <AppButton variant="secondary" className="btn-sm" onClick={() => {}}>Follow Up</AppButton>}
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>
            )}

            {adminData?.communityHealth && (
                <Card>
                    <h3>📊 Community Health Metrics</h3>
                    <div className="health-metrics">
                        <div className="metric-item">
                            <span>Total Posts:</span>
                            <strong>{adminData.communityHealth.totalPosts}</strong>
                        </div>
                        <div className="metric-item">
                            <span>Flagged Content:</span>
                            <strong className="warning">{adminData.communityHealth.flaggedContent}</strong>
                        </div>
                        <div className="metric-item">
                            <span>Positive Sentiment:</span>
                            <strong className="success">{adminData.communityHealth.positiveSentimentRate}%</strong>
                        </div>
                        <div className="metric-item">
                            <span>Engagement Rate:</span>
                            <strong>{adminData.communityHealth.engagementRate}%</strong>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
    
    const renderAnalyticsTab = () => (
        adminData?.analytics ? (
            <div className="analytics-section">
                <Card>
                    <h3>👥 User Analytics</h3>
                    <div className="analytics-grid">
                        <div className="analytic-item">
                            <span>Total Active Users</span>
                            <strong>{adminData.analytics.userMetrics.totalActiveUsers.toLocaleString()}</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Daily Active Users</span>
                            <strong>{adminData.analytics.userMetrics.dailyActiveUsers.toLocaleString()}</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Weekly Active Users</span>
                            <strong>{adminData.analytics.userMetrics.weeklyActiveUsers.toLocaleString()}</strong>
                        </div>
                        <div className="analytic-item">
                            <span>User Retention Rate</span>
                            <strong>{adminData.analytics.userMetrics.userRetentionRate}%</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Avg Session Duration</span>
                            <strong>{adminData.analytics.userMetrics.averageSessionDuration} min</strong>
                        </div>
                        <div className="analytic-item">
                            <span>New Today</span>
                            <strong>{adminData.analytics.userMetrics.newRegistrationsToday}</strong>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3>🌟 Helper Analytics</h3>
                    <div className="analytics-grid">
                        <div className="analytic-item">
                            <span>Total Active Helpers</span>
                            <strong>{adminData.analytics.helperMetrics.totalActiveHelpers}</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Average Response Time</span>
                            <strong>{adminData.analytics.helperMetrics.averageResponseTime} min</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Helpers Online</span>
                            <strong>{adminData.analytics.helperMetrics.helpersOnline}</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Sessions Today</span>
                            <strong>{adminData.analytics.helperMetrics.totalSessionsToday}</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Satisfaction Rating</span>
                            <strong>{adminData.analytics.helperMetrics.helperSatisfactionRating}/5.0</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Utilization Rate</span>
                            <strong>{adminData.analytics.helperMetrics.helperUtilizationRate}%</strong>
                        </div>
                    </div>
                </Card>

                <Card className="crisis-analytics">
                    <h3>🚨 Crisis Support Analytics</h3>
                    <div className="analytics-grid">
                        <div className="analytic-item">
                            <span>Crisis Alerts Today</span>
                            <strong className="crisis">{adminData.analytics.crisisMetrics.crisisAlertsToday}</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Avg Response Time</span>
                            <strong>{adminData.analytics.crisisMetrics.averageResponseTimeToCrisis} min</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Resolution Rate</span>
                            <strong className="success">{adminData.analytics.crisisMetrics.crisisResolutionRate}%</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Prevention Success</span>
                            <strong className="success">{adminData.analytics.crisisMetrics.preventionSuccessRate}%</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Escalation Rate</span>
                            <strong className="warning">{adminData.analytics.crisisMetrics.escalationRate}%</strong>
                        </div>
                        <div className="analytic-item">
                            <span>Emergency Contacts</span>
                            <strong>{adminData.analytics.crisisMetrics.emergencyContactsActivated}</strong>
                        </div>
                    </div>
                </Card>
            </div>
        ) : (
            isLoading ? <div className="loading-spinner" /> : (
                <div className="stats-grid">
                    <Card className="stat-card"><h3>Active Dilemmas</h3><div className="stat-number">{stats?.activeDilemmas}</div></Card>
                    <Card className="stat-card"><h3>Avg. Time to Support</h3><div className="stat-number text">{stats?.avgTimeToFirstSupport}</div></Card>
                    <Card className="stat-card"><h3>Total Helpers</h3><div className="stat-number">{stats?.totalHelpers}</div></Card>
                    <Card className="stat-card"><h3>Most Common Category</h3><div className="stat-number text">{stats?.mostCommonCategory}</div></Card>
                </div>
            )
        )
    );

    const renderSystemTab = () => (
        <div className="system-section">
            {adminData?.analytics?.platformHealth && (
                <Card>
                    <h3>🔧 System Health</h3>
                    <div className="health-grid">
                        <div className="health-item">
                            <span>System Uptime</span>
                            <strong className="success">{adminData.analytics.platformHealth.systemUptime}%</strong>
                        </div>
                        <div className="health-item">
                            <span>Avg Page Load</span>
                            <strong>{adminData.analytics.platformHealth.averagePageLoadTime}s</strong>
                        </div>
                        <div className="health-item">
                            <span>Error Rate</span>
                            <strong className="success">{adminData.analytics.platformHealth.errorRate}%</strong>
                        </div>
                        <div className="health-item">
                            <span>Performance Score</span>
                            <strong>{adminData.analytics.platformHealth.performanceScore}/100</strong>
                        </div>
                        <div className="health-item">
                            <span>Security Incidents</span>
                            <strong className="success">{adminData.analytics.platformHealth.securityIncidents}</strong>
                        </div>
                        <div className="health-item">
                            <span>Backup Status</span>
                            <strong className="success">{adminData.analytics.platformHealth.dataBackupStatus}</strong>
                        </div>
                    </div>
                </Card>
            )}

            {adminData?.profile?.systemAlerts && (
                <Card>
                    <h3>⚠️ System Alerts</h3>
                    {adminData.profile.systemAlerts.map((alert: any) => (
                        <div key={alert.id} className={`alert-item ${alert.severity}`}>
                            <div className="alert-header">
                                <strong>{alert.type.toUpperCase()}</strong>
                                <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                            </div>
                            <p>{alert.message}</p>
                            <small>
                                {new Date(alert.timestamp).toLocaleString()} • 
                                Status: <span className={`status ${alert.status}`}>{alert.status}</span>
                            </small>
                        </div>
                    ))}
                </Card>
            )}

            {adminData?.qualityMetrics && (
                <Card>
                    <h3>📈 Quality Metrics</h3>
                    <div className="quality-metrics">
                        <div className="metric-item">
                            <span>User Satisfaction</span>
                            <strong>{adminData.qualityMetrics.userSatisfactionScore}/5.0</strong>
                        </div>
                        <div className="metric-item">
                            <span>Helper Reviews</span>
                            <strong>{adminData.qualityMetrics.helperPerformanceReviews}</strong>
                        </div>
                        <div className="metric-item">
                            <span>Completed Audits</span>
                            <strong>{adminData.qualityMetrics.completedAudits}</strong>
                        </div>
                        <div className="metric-item">
                            <span>Pending Audits</span>
                            <strong className="warning">{adminData.qualityMetrics.pendingAudits}</strong>
                        </div>
                    </div>
                    
                    <h4>Feature Usage</h4>
                    <div className="feature-usage">
                        {Object.entries(adminData.qualityMetrics.platformFeatureUsage).map(([feature, usage]: [string, any]) => (
                            <div key={feature} className="usage-item">
                                <span>{feature.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                                <div className="usage-bar">
                                    <div className="usage-fill" style={{width: `${usage}%`}}></div>
                                </div>
                                <strong>{usage}%</strong>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Review Application: ${selectedApplicant?.displayName}`}>
                {applicantDetails ? (
                    <div>
                        <h3>Applicant Details</h3>
                        <p><strong>Bio:</strong> {applicantDetails.bio}</p>
                        <p><strong>Expertise:</strong> {applicantDetails.expertise?.join(', ') || 'Not specified'}</p>
                        <p><strong>Joined:</strong> {formatTimeAgo(applicantDetails.joinDate)}</p>
                        <hr style={{margin: '1rem 0'}} />
                        <h3>Performance Stats</h3>
                        <p><strong>Training Completed:</strong> {applicantDetails.trainingCompleted ? 'Yes' : 'No'}</p>
                        <p><strong>Reputation:</strong> {applicantDetails.reputation?.toFixed(2) || 'N/A'} / 5.0</p>
                        <p><strong>Training Quiz Score:</strong> {applicantDetails.quizScore || 0}%</p>
                         <hr style={{margin: '1rem 0'}} />
                         <h3>Actions</h3>
                         <AppTextArea label="Rejection Notes (if rejecting)" value={rejectionNotes} onChange={(e) => setRejectionNotes(e.target.value)} rows={3} />
                        <div className="modal-actions">
                            <AppButton variant="danger" onClick={handleReject}>Reject</AppButton>
                            <AppButton variant="success" onClick={handleApprove}>Approve</AppButton>
                        </div>
                    </div>
                ) : <div className="loading-spinner"/>}
            </Modal>
            
            <div className="view-header">
                <h1>🛡️ Astral Admin Dashboard</h1>
                <p className="view-subheader">Platform oversight, safety management, and community health monitoring.</p>
            </div>
            <div className="dashboard-tabs">
                <AppButton className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>📊 Overview</AppButton>
                <AppButton className={activeTab === 'applications' ? 'active' : ''} onClick={() => setActiveTab('applications')}>📝 Applications {adminData?.profile?.helperApplications?.length > 0 ? `(${adminData.profile.helperApplications.length})` : applications.length > 0 ? `(${applications.length})` : ''}</AppButton>
                <AppButton className={activeTab === 'moderation' ? 'active' : ''} onClick={() => setActiveTab('moderation')}>🚨 Moderation</AppButton>
                <AppButton className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>📈 Analytics</AppButton>
                <AppButton className={activeTab === 'system' ? 'active' : ''} onClick={() => setActiveTab('system')}>⚙️ System</AppButton>
            </div>
            <div className="dashboard-content">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'applications' && renderApplicationsTab()}
                {activeTab === 'moderation' && renderModerationTab()}
                {activeTab === 'analytics' && renderAnalyticsTab()}
                {activeTab === 'system' && renderSystemTab()}
            </div>
        </>
    );
};

export default AdminDashboardView;
