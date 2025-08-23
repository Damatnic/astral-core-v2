/**
 * Astral Tether View Component
 * 
 * Bidirectional crisis support feature that creates meaningful digital presence 
 * between users during difficult moments. Either party can initiate - whether 
 * someone is reaching out for help or checking in on a friend.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ViewHeader } from '../components/ViewHeader';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { AppInput } from '../components/AppInput';
import { AppTextArea } from '../components/AppInput';
import { 
  HeartIcon, 
  UsersIcon, 
  ShieldIcon,
  AlertCircleIcon,
  ActivityIcon,
  LinkIcon,
  ClockIcon,
  SettingsIcon,
  CheckCircleIcon,
  XCircleIcon
} from '../components/icons.dynamic';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { getAstralTetherService } from '../services/astralTetherService';
import { AstralTetherDemo } from '../components/AstralTetherDemo';
import { GuidedTetherExperience } from '../components/GuidedTetherExperience';
import './TetherView.css';

interface TetherCircleMember {
  id: string;
  displayName: string;
  isAvailable: boolean;
  lastActive: Date;
  trustLevel: 'new' | 'trusted' | 'verified';
  profilePicture?: string;
}

interface ActiveTether {
  id: string;
  partnerId: string;
  partnerName: string;
  startTime: Date;
  connectionStrength: number;
  isBreathingSynced: boolean;
  isHapticEnabled: boolean;
  status: 'connecting' | 'active' | 'ending';
}

interface TetherProfile {
  vibrationPattern: 'heartbeat' | 'wave' | 'pulse' | 'custom';
  customPattern?: number[];
  colorTheme: 'aurora' | 'sunset' | 'ocean' | 'forest';
  comfortMessages: string[];
  autoEscalationMinutes: number;
  silentMode: boolean;
  breathingPattern: '4-7-8' | 'box' | 'coherent';
}

const TetherView: React.FC<{ userToken?: string | null; setActiveView?: (view: any) => void }> = ({ 
  userToken: propUserToken, 
  setActiveView 
}) => {
  const { user, userToken: contextUserToken } = useAuth();
  const userToken = propUserToken ?? contextUserToken;
  const { addToast } = useNotification();
  const tetherService = useRef(getAstralTetherService());
  
  // State management
  const [activeTether, setActiveTether] = useState<ActiveTether | null>(null);
  const [tetherCircle, setTetherCircle] = useState<TetherCircleMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [tetherProfile, setTetherProfile] = useState<TetherProfile>({
    vibrationPattern: 'heartbeat',
    colorTheme: 'aurora',
    comfortMessages: ["I'm here", "You're safe", "Breathe with me"],
    autoEscalationMinutes: 5,
    silentMode: false,
    breathingPattern: '4-7-8'
  });
  
  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [_showCircleModal, setShowCircleModal] = useState(false);
  const [_showInsightsModal, setShowInsightsModal] = useState(false);
  
  // Tether request form
  const [requestMessage, setRequestMessage] = useState('');
  const [requestUrgency, setRequestUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  
  // Breathing sync state
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [breathingProgress, setBreathingProgress] = useState(0);
  
  // Connection strength visualization
  const animationRef = useRef<number>();

  useEffect(() => {
    loadTetherCircle();
    loadPendingRequests();
    setupTetherListeners();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      tetherService.current.removeAllListeners();
    };
  }, []);

  const loadTetherCircle = async () => {
    try {
      const response = await fetch('/api/tether/circle', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTetherCircle(data.members || []);
      }
    } catch (error) {
      console.error('Failed to load tether circle:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await fetch('/api/tether/requests/pending', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  const setupTetherListeners = () => {
    const service = tetherService.current;
    
    service.on('tetherRequest', (request: any) => {
      setPendingRequests(prev => [...prev, request]);
      addToast(`New tether request from ${request.fromName}`, 'info');
      
      // Vibrate if enabled
      if ('vibrate' in navigator && !tetherProfile.silentMode) {
        navigator.vibrate([200, 100, 200]);
      }
    });

    service.on('tetherAccepted', (session: any) => {
      setActiveTether({
        id: session.id,
        partnerId: session.partnerId,
        partnerName: session.partnerName,
        startTime: new Date(),
        connectionStrength: 0,
        isBreathingSynced: false,
        isHapticEnabled: true,
        status: 'connecting'
      });
      addToast('Tether connection established!', 'success');
    });

    service.on('connectionStrengthChanged', ({ strength }: any) => {
      setActiveTether(prev => prev ? { ...prev, connectionStrength: strength } : null);
    });

    service.on('breathingSync', (data: any) => {
      if (data && typeof data === 'object' && 'phase' in data && 'progress' in data) {
        setBreathingPhase(data.phase);
        setBreathingProgress(data.progress);
      }
    });
  };

  const initiateTetherRequest = async () => {
    if (!requestMessage.trim()) {
      addToast('Please add a message for your tether request', 'error');
      return;
    }

    try {
      await tetherService.current.initiateTether({
        fromUserId: user?.sub || '',
        toUserId: selectedMemberId,
        tetherType: 'conversation',
        message: requestMessage,
        urgency: requestUrgency
      });

      addToast('Tether request sent', 'success');
      setShowRequestModal(false);
      setRequestMessage('');
      
      // Start auto-escalation timer if high urgency
      if (requestUrgency === 'high' || requestUrgency === 'critical') {
        setTimeout(() => {
          if (!activeTether) {
            handleAutoEscalation();
          }
        }, tetherProfile.autoEscalationMinutes * 60 * 1000);
      }
    } catch (error) {
      console.error('Failed to initiate tether:', error);
      addToast('Failed to send tether request', 'error');
    }
  };

  const acceptTetherRequest = async (requestId: string) => {
    try {
      const success = await tetherService.current.acceptTether(requestId, user?.sub || '');
      
      if (success) {
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        addToast('Tether connection started', 'success');
      }
    } catch (error) {
      console.error('Failed to accept tether:', error);
      addToast('Failed to accept tether request', 'error');
    }
  };

  const updateConnectionStrength = (delta: number) => {
    if (!activeTether) return;
    
    const newStrength = Math.max(0, Math.min(1, activeTether.connectionStrength + delta));
    tetherService.current.updateConnectionStrength(activeTether.id, newStrength);
  };

  const endTether = async () => {
    if (!activeTether) return;

    setActiveTether(prev => prev ? { ...prev, status: 'ending' } : null);
    
    try {
      await tetherService.current.endTether(activeTether.id, user?.sub || '');
      
      // Show gratitude prompt
      setTimeout(() => {
        if (window.confirm('Would you like to send a thank you message to your tether partner?')) {
          sendGratitudeMessage();
        }
      }, 2000);
      
      setActiveTether(null);
      addToast('Tether session ended', 'info');
    } catch (error) {
      console.error('Failed to end tether:', error);
    }
  };

  const sendGratitudeMessage = async () => {
    const message = prompt('Write a thank you message:');
    if (message) {
      try {
        await fetch('/api/tether/gratitude', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: activeTether?.id,
            message
          })
        });
        addToast('Thank you message sent', 'success');
      } catch (error) {
        console.error('Failed to send gratitude:', error);
      }
    }
  };

  const handleAutoEscalation = () => {
    addToast('No response received. Escalating to emergency contacts...', 'warning');
    
    // Trigger emergency escalation
    tetherService.current.emit('emergencyEscalation', {
      userId: user?.sub,
      reason: 'No response to high urgency tether request'
    });
    
    // Optionally redirect to crisis resources
    if (requestUrgency === 'critical') {
      setActiveView?.({ view: 'crisis' });
    }
  };

  const toggleBreathingSync = () => {
    if (!activeTether) return;
    
    setActiveTether(prev => prev ? {
      ...prev,
      isBreathingSynced: !prev.isBreathingSynced
    } : null);
    
    if (!activeTether.isBreathingSynced) {
      startBreathingAnimation();
    }
  };

  const startBreathingAnimation = () => {
    const breathingPatterns = {
      '4-7-8': { inhale: 4000, hold: 7000, exhale: 8000, pause: 1000 },
      'box': { inhale: 4000, hold: 4000, exhale: 4000, pause: 4000 },
      'coherent': { inhale: 5000, hold: 0, exhale: 5000, pause: 0 }
    };
    
    const pattern = breathingPatterns[tetherProfile.breathingPattern];
    let phase: 'inhale' | 'hold' | 'exhale' | 'pause' = 'inhale';
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const phaseDuration = pattern[phase];
      
      if (phaseDuration > 0) {
        const progress = Math.min(elapsed / phaseDuration, 1);
        setBreathingProgress(progress);
        
        if (progress >= 1) {
          // Move to next phase
          const phases: Array<'inhale' | 'hold' | 'exhale' | 'pause'> = ['inhale', 'hold', 'exhale', 'pause'];
          const currentIndex = phases.indexOf(phase);
          phase = phases[(currentIndex + 1) % 4];
          setBreathingPhase(phase);
          startTime = Date.now();
        }
      } else {
        // Skip phases with 0 duration
        const phases: Array<'inhale' | 'hold' | 'exhale' | 'pause'> = ['inhale', 'hold', 'exhale', 'pause'];
        const currentIndex = phases.indexOf(phase);
        phase = phases[(currentIndex + 1) % 4];
        setBreathingPhase(phase);
      }
      
      if (activeTether?.isBreathingSynced) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const renderActiveTether = () => {
    if (!activeTether) return null;

    return (
      <Card className="active-tether-card">
        <div className="tether-header">
          <div className="tether-status">
            <ActivityIcon className="pulse-animation" />
            <span>Connected with {activeTether.partnerName}</span>
          </div>
          <div className="tether-timer">
            <ClockIcon />
            <span>{formatDuration(Date.now() - activeTether.startTime.getTime())}</span>
          </div>
        </div>

        {/* Connection Strength Visualization */}
        <div className="connection-strength">
          <label>Connection Strength</label>
          <div className="strength-bar">
            <div 
              className="strength-fill"
              style={{ 
                width: `${activeTether.connectionStrength * 100}%`,
                backgroundColor: getStrengthColor(activeTether.connectionStrength)
              }}
            />
          </div>
          <div className="strength-controls">
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => updateConnectionStrength(-0.1)}
            >
              Lighter
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => updateConnectionStrength(0.1)}
            >
              Stronger
            </AppButton>
          </div>
        </div>

        {/* Breathing Sync */}
        <div className="breathing-sync-section">
          <div className="breathing-header">
            <h3>Synchronized Breathing</h3>
            <AppButton
              variant={activeTether.isBreathingSynced ? 'primary' : 'secondary'}
              size="sm"
              onClick={toggleBreathingSync}
            >
              {activeTether.isBreathingSynced ? 'Synced' : 'Start Sync'}
            </AppButton>
          </div>
          
          {activeTether.isBreathingSynced && (
            <div className="breathing-visualization">
              <div className={`breathing-circle ${breathingPhase}`}>
                <div 
                  className="breathing-progress"
                  style={{ transform: `scale(${0.5 + breathingProgress * 0.5})` }}
                />
              </div>
              <p className="breathing-instruction">
                {breathingPhase === 'inhale' && 'Breathe In'}
                {breathingPhase === 'hold' && 'Hold'}
                {breathingPhase === 'exhale' && 'Breathe Out'}
                {breathingPhase === 'pause' && 'Rest'}
              </p>
            </div>
          )}
        </div>

        {/* Comfort Messages */}
        <div className="comfort-messages">
          <h3>Comfort Messages</h3>
          <div className="message-bubbles">
            {tetherProfile.comfortMessages.map((msg, idx) => (
              <div key={idx} className="comfort-bubble">
                {msg}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tether-actions">
          <AppButton
            variant="secondary"
            onClick={() => {
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200, 100, 200]);
              }
              addToast('Sending comfort vibration...', 'info');
            }}
          >
            <HeartIcon />
            Send Warmth
          </AppButton>
          
          <AppButton
            variant="danger"
            onClick={endTether}
          >
            End Tether
          </AppButton>
        </div>
      </Card>
    );
  };

  const renderTetherCircle = () => {
    return (
      <Card className="tether-circle-card">
        <div className="card-header">
          <h2>Your Tether Circle</h2>
          <AppButton
            variant="ghost"
            size="sm"
            onClick={() => setShowCircleModal(true)}
          >
            <SettingsIcon />
            Manage
          </AppButton>
        </div>

        {tetherCircle.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title="No circle members yet"
            message="Add trusted friends and family to your tether circle"
            action={
              <AppButton onClick={() => setShowCircleModal(true)}>
                Add Members
              </AppButton>
            }
          />
        ) : (
          <div className="circle-members">
            {tetherCircle.map(member => (
              <div key={member.id} className="circle-member">
                <div className="member-avatar">
                  {member.profilePicture ? (
                    <img src={member.profilePicture} alt={member.displayName} />
                  ) : (
                    <UsersIcon />
                  )}
                  {member.isAvailable && (
                    <span className="availability-indicator online" />
                  )}
                </div>
                <div className="member-info">
                  <h4>{member.displayName}</h4>
                  <p className="member-status">
                    {member.isAvailable ? 'Available' : `Last seen ${formatTimeAgo(member.lastActive)}`}
                  </p>
                  <span className={`trust-badge ${member.trustLevel}`}>
                    {member.trustLevel}
                  </span>
                </div>
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedMemberId(member.id);
                    setShowRequestModal(true);
                  }}
                  disabled={!member.isAvailable}
                >
                  <LinkIcon />
                  Tether
                </AppButton>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const renderPendingRequests = () => {
    if (pendingRequests.length === 0) return null;

    return (
      <Card className="pending-requests-card">
        <h2>Pending Tether Requests</h2>
        <div className="requests-list">
          {pendingRequests.map(request => (
            <div key={request.id} className="tether-request">
              <div className="request-info">
                <h4>{request.fromName}</h4>
                <p>{request.message}</p>
                <span className={`urgency-badge ${request.urgency}`}>
                  {request.urgency}
                </span>
              </div>
              <div className="request-actions">
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={() => acceptTetherRequest(request.id)}
                >
                  <CheckCircleIcon />
                  Accept
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPendingRequests(prev => prev.filter(r => r.id !== request.id));
                  }}
                >
                  <XCircleIcon />
                  Decline
                </AppButton>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderQuickActions = () => {
    return (
      <Card className="quick-actions-card">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <AppButton
            variant="primary"
            onClick={() => setShowRequestModal(true)}
            disabled={!!activeTether}
          >
            <LinkIcon />
            Request Tether
          </AppButton>
          
          <AppButton
            variant="secondary"
            onClick={() => {
              setRequestUrgency('critical');
              setShowRequestModal(true);
            }}
            disabled={!!activeTether}
          >
            <AlertCircleIcon />
            Crisis Tether
          </AppButton>
          
          <AppButton
            variant="ghost"
            onClick={() => setShowInsightsModal(true)}
          >
            <ActivityIcon />
            View Insights
          </AppButton>
          
          <AppButton
            variant="ghost"
            onClick={() => setShowSettingsModal(true)}
          >
            <SettingsIcon />
            Settings
          </AppButton>
        </div>
      </Card>
    );
  };

  // Utility functions
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 0.3) return '#ff6b6b';
    if (strength < 0.7) return '#ffd93d';
    return '#6bcf7f';
  };

  // Add demo mode state
  const [isDemoMode, setIsDemoMode] = useState(true);

  return (
    <div className="tether-view">
      <ViewHeader
        title="Astral Tether"
        subtitle="Create meaningful connections during difficult moments"
      />

      {/* Toggle between demo and real mode */}
      <div className="tether-mode-toggle">
        <AppButton 
          variant={isDemoMode ? "primary" : "ghost"}
          onClick={() => setIsDemoMode(true)}
        >
          Demo Experience
        </AppButton>
        <AppButton 
          variant={!isDemoMode ? "primary" : "ghost"}
          onClick={() => setIsDemoMode(false)}
        >
          Live Tether
        </AppButton>
      </div>

      {isDemoMode ? (
        <AstralTetherDemo />
      ) : (
      <div className="tether-content">
        {/* Safety Notice */}
        <Card className="safety-notice">
          <div className="notice-header">
            <ShieldIcon />
            <h3>Tether Guidelines</h3>
          </div>
          <ul>
            <li>Tether connects you with trusted support during difficult times</li>
            <li>Either person can initiate or end the connection</li>
            <li>For emergencies, use "Get Help Now" or call emergency services</li>
            <li>Connections are private and encrypted</li>
          </ul>
        </Card>

        {/* Guided Tether Experiences */}
        <Card className="guided-experiences-section">
          <GuidedTetherExperience
            partnerName={activeTether?.partnerName}
            isConnected={!!activeTether}
            onExperienceComplete={(experienceId) => {
              addToast(`Completed ${experienceId} experience!`, 'success');
            }}
          />
        </Card>

        {/* Active Tether Session */}
        {activeTether && renderActiveTether()}

        {/* Pending Requests */}
        {!activeTether && renderPendingRequests()}

        {/* Quick Actions */}
        {!activeTether && renderQuickActions()}

        {/* Tether Circle */}
        {!activeTether && renderTetherCircle()}
      </div>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Tether Support"
      >
        <div className="tether-request-form">
          <div className="form-group">
            <label>Select Circle Member (Optional)</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="form-select"
            >
              <option value="">Any available member</option>
              {tetherCircle.filter(m => m.isAvailable).map(member => (
                <option key={member.id} value={member.id}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </div>

          <AppTextArea
            label="Message"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Let them know how you're feeling or what you need..."
            rows={4}
          />

          <div className="urgency-selector">
            <label>Urgency Level</label>
            <div className="urgency-options">
              {(['low', 'medium', 'high', 'critical'] as const).map(level => (
                <button
                  key={level}
                  className={`urgency-option ${level} ${requestUrgency === level ? 'selected' : ''}`}
                  onClick={() => setRequestUrgency(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <AppButton
              variant="primary"
              onClick={initiateTetherRequest}
            >
              Send Request
            </AppButton>
            <AppButton
              variant="ghost"
              onClick={() => setShowRequestModal(false)}
            >
              Cancel
            </AppButton>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Tether Settings"
      >
        <div className="tether-settings">
          <div className="form-group">
            <label>Vibration Pattern</label>
            <select
              value={tetherProfile.vibrationPattern}
              onChange={(e) => setTetherProfile(prev => ({
                ...prev,
                vibrationPattern: e.target.value as 'heartbeat' | 'wave' | 'pulse' | 'custom'
              }))}
              className="form-select"
            >
              <option value="heartbeat">Heartbeat</option>
              <option value="wave">Wave</option>
              <option value="pulse">Pulse</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="form-group">
            <label>Color Theme</label>
            <div className="color-options">
              {(['aurora', 'sunset', 'ocean', 'forest'] as const).map(theme => (
                <button
                  key={theme}
                  className={`color-option ${theme} ${tetherProfile.colorTheme === theme ? 'selected' : ''}`}
                  onClick={() => setTetherProfile(prev => ({ ...prev, colorTheme: theme }))}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Breathing Pattern</label>
            <select
              value={tetherProfile.breathingPattern}
              onChange={(e) => setTetherProfile(prev => ({
                ...prev,
                breathingPattern: e.target.value as '4-7-8' | 'box' | 'coherent'
              }))}
              className="form-select"
            >
              <option value="4-7-8">4-7-8 Breathing</option>
              <option value="box">Box Breathing</option>
              <option value="coherent">Coherent Breathing</option>
            </select>
          </div>

          <div className="form-group">
            <label>Auto-Escalation (minutes)</label>
            <AppInput
              type="number"
              value={tetherProfile.autoEscalationMinutes.toString()}
              onChange={(e) => setTetherProfile(prev => ({
                ...prev,
                autoEscalationMinutes: parseInt(e.target.value) || 5
              }))}
              min="1"
              max="30"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={tetherProfile.silentMode}
                onChange={(e) => setTetherProfile(prev => ({
                  ...prev,
                  silentMode: e.target.checked
                }))}
              />
              Silent Mode (no sounds or vibrations)
            </label>
          </div>

          <div className="form-group">
            <label>Comfort Messages</label>
            {tetherProfile.comfortMessages.map((msg, idx) => (
              <AppInput
                key={idx}
                value={msg}
                onChange={(e) => {
                  const newMessages = [...tetherProfile.comfortMessages];
                  newMessages[idx] = e.target.value;
                  setTetherProfile(prev => ({ ...prev, comfortMessages: newMessages }));
                }}
                placeholder="Enter comfort message"
              />
            ))}
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => setTetherProfile(prev => ({
                ...prev,
                comfortMessages: [...prev.comfortMessages, '']
              }))}
            >
              Add Message
            </AppButton>
          </div>

          <div className="modal-actions">
            <AppButton
              variant="primary"
              onClick={() => {
                // Save settings
                tetherService.current.saveComfortProfile(user?.sub || '', tetherProfile);
                setShowSettingsModal(false);
                addToast('Settings saved', 'success');
              }}
            >
              Save Settings
            </AppButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TetherView;