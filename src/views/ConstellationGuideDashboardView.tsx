import React, { useState } from 'react';
import { ActiveView } from '../types';
import { 
    AlertTriangle, 
    UsersIcon, 
    ShieldIcon, 
    BookIcon,
    MessageCircleIcon,
    SettingsIcon,
    CheckIcon,
    PostsIcon
} from '../components/icons.dynamic';
import { AppButton } from '../components/AppButton';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/Modal';

interface CrisisAlertItem {
    id: string;
    userId: string;
    username: string;
    severity: 'high' | 'medium' | 'low';
    type: 'self-harm' | 'suicide-ideation' | 'panic-attack' | 'crisis-escalation';
    timestamp: string;
    status: 'active' | 'responded' | 'escalated';
    description: string;
    location?: string;
}

interface AssignedUser {
    id: string;
    username: string;
    lastContact: string;
    status: 'active' | 'at-risk' | 'stable' | 'needs-attention';
    caseType: 'ongoing-support' | 'crisis-follow-up' | 'weekly-check-in' | 'escalated-case';
    nextSession?: string;
    unreadMessages: number;
}

interface ModerationCase {
    id: string;
    type: 'content-review' | 'user-report' | 'boundary-violation' | 'policy-breach';
    reportedBy: string;
    targetUser: string;
    description: string;
    timestamp: string;
    priority: 'urgent' | 'high' | 'normal';
    status: 'pending' | 'reviewed' | 'action-taken';
    relatedContent?: string;
}

interface ProfessionalResource {
    id: string;
    title: string;
    type: 'training' | 'guideline' | 'protocol' | 'continuing-education';
    category: 'crisis-intervention' | 'communication' | 'boundaries' | 'self-care';
    duration?: string;
    completed?: boolean;
    dueDate?: string;
}

export const ConstellationGuideDashboardView: React.FC<{
    setActiveView: (view: ActiveView) => void;
}> = ({ setActiveView }) => {
    const { helperProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'active-cases' | 'crisis-alerts' | 'moderation' | 'resources'>('overview');
    const [selectedAlert, setSelectedAlert] = useState<CrisisAlertItem | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    // Sample data - in real app, this would come from API
    const crisisAlerts: CrisisAlertItem[] = [
        {
            id: 'alert-001',
            userId: 'user-789',
            username: 'StarSeeker23',
            severity: 'high',
            type: 'suicide-ideation',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            status: 'active',
            description: 'User expressed thoughts of self-harm in journal entry. AI detection flagged for immediate review.',
            location: 'Personal Journal'
        },
        {
            id: 'alert-002',
            userId: 'user-456',
            username: 'HopeSeeker',
            severity: 'medium',
            type: 'panic-attack',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            status: 'responded',
            description: 'User reported severe panic attack and requested immediate support.',
            location: 'Crisis Chat'
        },
        {
            id: 'alert-003',
            userId: 'user-321',
            username: 'QuietStorm',
            severity: 'medium',
            type: 'crisis-escalation',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'escalated',
            description: 'Session escalated due to mention of substance use with safety concerns.',
            location: 'Support Session'
        }
    ];

    const assignedUsers: AssignedUser[] = [
        {
            id: 'case-001',
            username: 'LunaLight',
            lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            caseType: 'ongoing-support',
            nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            unreadMessages: 2
        },
        {
            id: 'case-002',
            username: 'StarSeeker23',
            lastContact: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            status: 'at-risk',
            caseType: 'crisis-follow-up',
            nextSession: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
            unreadMessages: 0
        },
        {
            id: 'case-003',
            username: 'CalmSeeker',
            lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'needs-attention',
            caseType: 'weekly-check-in',
            unreadMessages: 0
        },
        {
            id: 'case-004',
            username: 'BrightPath',
            lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'stable',
            caseType: 'ongoing-support',
            nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            unreadMessages: 1
        }
    ];

    const moderationCases: ModerationCase[] = [
        {
            id: 'mod-001',
            type: 'boundary-violation',
            reportedBy: 'StarLight88',
            targetUser: 'Helper_Alex',
            description: 'Helper requested personal contact information outside platform guidelines',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            priority: 'urgent',
            status: 'pending',
            relatedContent: 'Chat Session #447'
        },
        {
            id: 'mod-002',
            type: 'content-review',
            reportedBy: 'CommunityBot',
            targetUser: 'TroubledSoul',
            description: 'Post contains potential self-harm content requiring review',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            status: 'pending',
            relatedContent: 'Forum Post #1247'
        },
        {
            id: 'mod-003',
            type: 'user-report',
            reportedBy: 'SafeSpace',
            targetUser: 'RandomUser123',
            description: 'User reported inappropriate comments in group discussion',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            priority: 'normal',
            status: 'reviewed',
            relatedContent: 'Group Discussion #89'
        }
    ];

    const professionalResources: ProfessionalResource[] = [
        {
            id: 'res-001',
            title: 'Advanced Crisis Intervention Techniques',
            type: 'training',
            category: 'crisis-intervention',
            duration: '2 hours',
            completed: false,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'res-002',
            title: 'Maintaining Professional Boundaries',
            type: 'guideline',
            category: 'boundaries',
            completed: true
        },
        {
            id: 'res-003',
            title: 'Trauma-Informed Communication Protocols',
            type: 'protocol',
            category: 'communication',
            duration: '45 minutes',
            completed: false
        },
        {
            id: 'res-004',
            title: 'Helper Self-Care & Burnout Prevention',
            type: 'continuing-education',
            category: 'self-care',
            duration: '1.5 hours',
            completed: true
        }
    ];

    const handleAlertClick = (alert: CrisisAlertItem) => {
        setSelectedAlert(alert);
        setIsAlertModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'active': return 'var(--accent-success)';
            case 'at-risk': return 'var(--accent-warning)';
            case 'needs-attention': return 'var(--accent-primary)';
            case 'stable': return 'var(--text-secondary)';
            default: return 'var(--text-secondary)';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch(severity) {
            case 'high': return 'var(--accent-error)';
            case 'medium': return 'var(--accent-warning)';
            case 'low': return 'var(--accent-primary)';
            default: return 'var(--text-secondary)';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'urgent': return 'var(--accent-error)';
            case 'high': return 'var(--accent-warning)';
            case 'normal': return 'var(--accent-primary)';
            default: return 'var(--text-secondary)';
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="constellation-overview">
                        <div className="overview-stats">
                            <div className="card stat-card">
                                <div className="stat-header">
                                    <UsersIcon />
                                    <h3>Active Cases</h3>
                                </div>
                                <div className="stat-number">
                                    <AnimatedNumber value={assignedUsers.length} />
                                </div>
                                <p>{assignedUsers.filter(u => u.status === 'at-risk').length} require immediate attention</p>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-header">
                                    <AlertTriangle />
                                    <h3>Crisis Alerts</h3>
                                </div>
                                <div className="stat-number">
                                    <AnimatedNumber value={crisisAlerts.filter(a => a.status === 'active').length} />
                                </div>
                                <p>Active crisis situations requiring response</p>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-header">
                                    <ShieldIcon />
                                    <h3>Moderation Queue</h3>
                                </div>
                                <div className="stat-number">
                                    <AnimatedNumber value={moderationCases.filter(m => m.status === 'pending').length} />
                                </div>
                                <p>Cases pending review and action</p>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-header">
                                    <BookIcon />
                                    <h3>Training Progress</h3>
                                </div>
                                <div className="stat-number">
                                    <AnimatedNumber value={Math.round((professionalResources.filter(r => r.completed).length / professionalResources.length) * 100)} />
                                    <span style={{fontSize: '1.5rem', color: 'var(--text-secondary)'}}>%</span>
                                </div>
                                <p>Professional development completion</p>
                            </div>
                        </div>
                        
                        <div className="quick-actions">
                            <div className="card">
                                <h3>Quick Actions</h3>
                                <div className="action-buttons">
                                    <AppButton variant="primary" onClick={() => setActiveTab('crisis-alerts')}>
                                        <AlertTriangle />
                                        Review Crisis Alerts
                                    </AppButton>
                                    <AppButton variant="secondary" onClick={() => setActiveTab('active-cases')}>
                                        <MessageCircleIcon />
                                        Check Active Cases
                                    </AppButton>
                                    <AppButton variant="secondary" onClick={() => setActiveTab('moderation')}>
                                        <ShieldIcon />
                                        Moderation Queue
                                    </AppButton>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'active-cases':
                return (
                    <div className="active-cases">
                        <div className="cases-list">
                            {assignedUsers.map(user => (
                                <div key={user.id} className="card case-item">
                                    <div className="case-header">
                                        <div className="case-info">
                                            <h4>{user.username}</h4>
                                            <span className="case-type">{user.caseType.replace('-', ' ')}</span>
                                        </div>
                                        <div className="case-status">
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(user.status) }}
                                            >
                                                {user.status.replace('-', ' ')}
                                            </span>
                                            {user.unreadMessages > 0 && (
                                                <span className="unread-badge">{user.unreadMessages}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="case-details">
                                        <p>🕒 Last Contact: {new Date(user.lastContact).toLocaleDateString()}</p>
                                        {user.nextSession && (
                                            <p>📅 Next Session: {new Date(user.nextSession).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                    <div className="case-actions">
                                        <AppButton variant="primary" className="btn-sm" onClick={() => {/* Open chat */}}>
                                            <MessageCircleIcon />
                                            Open Chat
                                        </AppButton>
                                        <AppButton variant="secondary" className="btn-sm" onClick={() => {/* View history */}}>
                                            View History
                                        </AppButton>
                                        {user.status === 'at-risk' && (
                                            <AppButton variant="danger" className="btn-sm" onClick={() => {/* Escalate */}}>
                                                <AlertTriangle />
                                                Escalate
                                            </AppButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'crisis-alerts':
                return (
                    <div className="crisis-alerts">
                        <div className="alerts-list">
                            {crisisAlerts.map(alert => (
                                <button 
                                    key={alert.id} 
                                    className="card alert-item"
                                    onClick={() => handleAlertClick(alert)}
                                    style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left', width: '100%' }}
                                >
                                    <div className="alert-header">
                                        <div className="alert-info">
                                            <h4>{alert.username}</h4>
                                            <span className="alert-type">{alert.type.replace('-', ' ')}</span>
                                        </div>
                                        <div className="alert-status">
                                            <span 
                                                className="severity-badge"
                                                style={{ backgroundColor: getSeverityColor(alert.severity) }}
                                            >
                                                {alert.severity} priority
                                            </span>
                                            <span className={`status-badge ${alert.status}`}>
                                                {alert.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="alert-details">
                                        <p>{alert.description}</p>
                                        <div className="alert-meta">
                                            <span>🕒 {new Date(alert.timestamp).toLocaleString()}</span>
                                            <span>📍 {alert.location}</span>
                                        </div>
                                    </div>
                                    <div className="alert-actions">
                                        {alert.status === 'active' && (
                                            <>
                                                <AppButton variant="primary" className="btn-sm" onClick={(e) => { e.stopPropagation(); /* Respond */ }}>
                                                    <CheckIcon />
                                                    Respond
                                                </AppButton>
                                                <AppButton variant="danger" className="btn-sm" onClick={(e) => { e.stopPropagation(); /* Escalate */ }}>
                                                    <AlertTriangle />
                                                    Escalate to Admin
                                                </AppButton>
                                            </>
                                        )}
                                        {alert.status === 'responded' && (
                                            <AppButton variant="secondary" className="btn-sm" onClick={(e) => { e.stopPropagation(); /* View response */ }}>
                                                <PostsIcon />
                                                View Response
                                            </AppButton>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'moderation':
                return (
                    <div className="moderation-queue">
                        <div className="moderation-list">
                            {moderationCases.map(caseItem => (
                                <div key={caseItem.id} className="card moderation-item">
                                    <div className="moderation-header">
                                        <div className="moderation-info">
                                            <h4>{caseItem.type.replace('-', ' ')}</h4>
                                            <span className="reported-by">Reported by: {caseItem.reportedBy}</span>
                                        </div>
                                        <div className="moderation-status">
                                            <span 
                                                className="priority-badge"
                                                style={{ backgroundColor: getPriorityColor(caseItem.priority) }}
                                            >
                                                {caseItem.priority}
                                            </span>
                                            <span className={`status-badge ${caseItem.status}`}>
                                                {caseItem.status.replace('-', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="moderation-details">
                                        <p><strong>Target:</strong> {caseItem.targetUser}</p>
                                        <p>{caseItem.description}</p>
                                        {caseItem.relatedContent && (
                                            <p><strong>Related:</strong> {caseItem.relatedContent}</p>
                                        )}
                                        <p>🕒 {new Date(caseItem.timestamp).toLocaleString()}</p>
                                    </div>
                                    {caseItem.status === 'pending' && (
                                        <div className="moderation-actions">
                                            <AppButton variant="primary" className="btn-sm" onClick={() => {/* Approve */}}>
                                                <CheckIcon />
                                                Approve
                                            </AppButton>
                                            <AppButton variant="secondary" className="btn-sm" onClick={() => {/* Flag */}}>
                                                <PostsIcon />
                                                Flag for Review
                                            </AppButton>
                                            <AppButton variant="danger" className="btn-sm" onClick={() => {/* Take action */}}>
                                                <AlertTriangle />
                                                Take Action
                                            </AppButton>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'resources':
                return (
                    <div className="professional-resources">
                        <div className="resources-grid">
                            {professionalResources.map(resource => (
                                <div key={resource.id} className="card resource-item">
                                    <div className="resource-header">
                                        <h4>{resource.title}</h4>
                                        <span className={`resource-type ${resource.type}`}>
                                            {resource.type.replace('-', ' ')}
                                        </span>
                                    </div>
                                    <div className="resource-details">
                                        <p><strong>Category:</strong> {resource.category.replace('-', ' ')}</p>
                                        {resource.duration && (
                                            <p>🕒 Duration: {resource.duration}</p>
                                        )}
                                        {resource.dueDate && (
                                            <p>📅 Due: {new Date(resource.dueDate).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                    <div className="resource-actions">
                                        {resource.completed ? (
                                            <AppButton variant="success" className="btn-sm" disabled onClick={() => {}}>
                                                <CheckIcon />
                                                Completed
                                            </AppButton>
                                        ) : (
                                            <AppButton variant="primary" className="btn-sm" onClick={() => {/* Start resource */}}>
                                                {resource.type === 'training' ? 'Start Training' : 'View Resource'}
                                            </AppButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!helperProfile) {
        return <div className="loading-spinner" style={{margin: '5rem auto'}}></div>;
    }

    return (
        <>
            <Modal 
                isOpen={isAlertModalOpen} 
                onClose={() => setIsAlertModalOpen(false)} 
                title="Crisis Alert Details"
            >
                {selectedAlert && (
                    <div className="alert-details-modal">
                        <div className="alert-summary">
                            <h3>{selectedAlert.username}</h3>
                            <p><strong>Type:</strong> {selectedAlert.type.replace('-', ' ')}</p>
                            <p><strong>Severity:</strong> {selectedAlert.severity} priority</p>
                            <p><strong>Status:</strong> {selectedAlert.status}</p>
                            <p><strong>Location:</strong> {selectedAlert.location}</p>
                            <p><strong>Time:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="alert-description">
                            <h4>Description</h4>
                            <p>{selectedAlert.description}</p>
                        </div>
                        <div className="alert-actions">
                            <AppButton variant="primary" onClick={() => {/* Open chat */}}>
                                <MessageCircleIcon />
                                Open Direct Chat
                            </AppButton>
                            <AppButton variant="danger" onClick={() => {/* Escalate */}}>
                                <AlertTriangle />
                                Escalate to Crisis Team
                            </AppButton>
                        </div>
                    </div>
                )}
            </Modal>

            <div className="view-header">
                <div>
                    <h1>Constellation Guide Dashboard</h1>
                    <p className="view-subheader">Support Center • Level {helperProfile.level} Guide</p>
                </div>
                <AppButton onClick={() => setActiveView({ view: 'helper-profile' })}>
                    Edit Profile
                </AppButton>
            </div>

            <div className="dashboard-tabs constellation-tabs">
                <AppButton 
                    className={activeTab === 'overview' ? 'active' : ''} 
                    onClick={() => setActiveTab('overview')}
                >
                    <SettingsIcon />
                    Overview
                </AppButton>
                <AppButton 
                    className={activeTab === 'active-cases' ? 'active' : ''} 
                    onClick={() => setActiveTab('active-cases')}
                >
                    <UsersIcon />
                    Active Cases ({assignedUsers.filter(u => u.status !== 'stable').length})
                </AppButton>
                <AppButton 
                    className={activeTab === 'crisis-alerts' ? 'active' : ''} 
                    onClick={() => setActiveTab('crisis-alerts')}
                >
                    <AlertTriangle />
                    Crisis Alerts ({crisisAlerts.filter(a => a.status === 'active').length})
                </AppButton>
                <AppButton 
                    className={activeTab === 'moderation' ? 'active' : ''} 
                    onClick={() => setActiveTab('moderation')}
                >
                    <ShieldIcon />
                    Moderation ({moderationCases.filter(m => m.status === 'pending').length})
                </AppButton>
                <AppButton 
                    className={activeTab === 'resources' ? 'active' : ''} 
                    onClick={() => setActiveTab('resources')}
                >
                    <BookIcon />
                    Resources
                </AppButton>
            </div>

            <div className="dashboard-content constellation-content">
                {renderTabContent()}
            </div>
        </>
    );
};

export default ConstellationGuideDashboardView;
