import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTetherStore } from '../stores/tetherStore';
import { useNotification } from '../contexts/NotificationContext';
import { Card } from '../components/Card';
import { ViewHeader } from '../components/ViewHeader';
import { AppButton } from '../components/AppButton';
import './EnhancedTetherView.css';

interface BreathingGuideProps {
  pattern: 'box' | '478' | 'coherent' | 'custom';
  isActive: boolean;
}

const BreathingGuide: React.FC<BreathingGuideProps> = ({ pattern, isActive }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const patterns = {
      box: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
      '478': { inhale: 4, hold: 7, exhale: 8, pause: 0 },
      coherent: { inhale: 5, hold: 0, exhale: 5, pause: 0 },
      custom: { inhale: 4, hold: 2, exhale: 6, pause: 2 }
    };

    const currentPattern = patterns[pattern];
    let currentPhase = 'inhale';
    let timer: NodeJS.Timeout;

    const cyclePhases = () => {
      const phases = ['inhale', 'hold', 'exhale', 'pause'].filter(
        p => currentPattern[p as keyof typeof currentPattern] > 0
      );
      
      const currentIndex = phases.indexOf(currentPhase);
      const nextIndex = (currentIndex + 1) % phases.length;
      currentPhase = phases[nextIndex];
      setPhase(currentPhase as 'inhale' | 'hold' | 'exhale' | 'pause');
      
      const duration = currentPattern[currentPhase as keyof typeof currentPattern] * 1000;
      
      // Animate progress
      let start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        setProgress(Math.min(elapsed / duration, 1));
        if (elapsed < duration) {
          requestAnimationFrame(animate);
        }
      };
      animate();
      
      timer = setTimeout(cyclePhases, duration);
    };

    cyclePhases();
    return () => clearTimeout(timer);
  }, [pattern, isActive]);

  if (!isActive) return null;

  return (
    <div className="breathing-guide">
      <div className={`breathing-circle ${phase}`} style={{
        transform: `scale(${phase === 'inhale' ? 1.5 : phase === 'exhale' ? 0.8 : 1})`
      }}>
        <span className="breathing-text">{phase}</span>
      </div>
      <div className="breathing-progress">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
};

interface DrawingCanvasProps {
  sessionId: string;
  isEnabled: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ sessionId, isEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    // Connect to drawing WebSocket
    wsRef.current = new WebSocket(`wss://api.astralcore.app/tether/draw/${sessionId}`);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'draw' && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = data.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(data.from.x, data.from.y);
          ctx.lineTo(data.to.x, data.to.y);
          ctx.stroke();
        }
      }
    };

    return () => {
      wsRef.current?.close();
    };
  }, [sessionId, isEnabled]);

  const handleDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !isEnabled) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const point = 'touches' in e ? e.touches[0] : e;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#6B46C1';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (e.type === 'mousedown' || e.type === 'touchstart') {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Send to partner
      wsRef.current?.send(JSON.stringify({
        type: 'draw',
        from: { x, y },
        to: { x, y },
        color: '#6B46C1'
      }));
    }
  }, [isDrawing, isEnabled]);

  if (!isEnabled) return null;

  return (
    <div className="drawing-canvas-container">
      <canvas
        ref={canvasRef}
        width={300}
        height={200}
        className="drawing-canvas"
        onMouseDown={() => setIsDrawing(true)}
        onMouseUp={() => setIsDrawing(false)}
        onMouseMove={handleDraw}
        onTouchStart={() => setIsDrawing(true)}
        onTouchEnd={() => setIsDrawing(false)}
        onTouchMove={handleDraw}
      />
      <button
        className="clear-canvas-btn"
        onClick={() => {
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }}
      >
        Clear
      </button>
    </div>
  );
};

const EnhancedTetherView: React.FC = () => {
  const { addToast } = useNotification();
  const {
    activeTether,
    tetherCircle,
    tetherProfile,
    pendingRequests,
    silentMode,
    autoEscalation,
    initiateTether,
    acceptTether,
    declineTether,
    endTether,
    sendHapticPulse,
    toggleDrawing,
    updateAvailability,
    triggerWellnessCheck,
    escalateToCrisis
  } = useTetherStore();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(5);
  const [pressIntensity, setPressIntensity] = useState(0);
  const touchStartRef = useRef<number>(0);

  // Handle incoming tether requests
  useEffect(() => {
    if (pendingRequests.length > 0) {
      const latest = pendingRequests[pendingRequests.length - 1];
      addToast(
        `${latest.fromName} wants to connect with you`,
        'info'
      );
    }
  }, [pendingRequests, addToast]);

  // Handle pressure sensitivity for haptic feedback
  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    touchStartRef.current = Date.now();
    setPressIntensity(0);
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - touchStartRef.current;
      const intensity = Math.min(elapsed / 1000, 10); // Max 10 intensity
      setPressIntensity(intensity);
      
      if (activeTether && intensity > 0) {
        sendHapticPulse(intensity);
      }
    }, 100);

    const cleanup = () => {
      clearInterval(interval);
      setPressIntensity(0);
    };

    if ('touches' in e) {
      e.currentTarget.addEventListener('touchend', cleanup, { once: true });
    } else {
      window.addEventListener('mouseup', cleanup, { once: true });
    }
  };

  const handleQuickTether = async () => {
    // Find first available member in circle
    const available = tetherCircle.find(m => m.availability === 'available');
    if (available) {
      await initiateTether(available.id, 'crisis');
      addToast(`Connecting with ${available.name}...`, 'info');
    } else {
      addToast('No one available in your circle right now', 'warning');
      // Trigger escalation if enabled
      if (autoEscalation) {
        setTimeout(() => {
          escalateToCrisis();
          addToast('Notifying emergency contacts...', 'info');
        }, 3000);
      }
    }
  };

  const handleEndTether = async () => {
    await endTether(sessionNotes, sessionRating);
    setShowEndDialog(false);
    setSessionNotes('');
    setSessionRating(5);
    addToast('Tether session ended', 'success');
  };

  if (activeTether) {
    return (
      <div className="tether-view active-session">
        <ViewHeader
          title="Astral Tether"
          subtitle={`Connected with ${activeTether.partnerName}`}
        />

        <div className="tether-content">
          {/* Connection Strength Indicator */}
          <div className="connection-indicator">
            <div className="strength-bar">
              <div 
                className="strength-fill"
                style={{ width: `${activeTether.connectionStrength}%` }}
              />
            </div>
            <span className="strength-label">
              Connection: {activeTether.connectionStrength}%
            </span>
          </div>

          {/* Breathing Guide */}
          <BreathingGuide
            pattern={tetherProfile?.breathingPattern || 'box'}
            isActive={true}
          />

          {/* Haptic Touch Area */}
          <div 
            className="haptic-touch-area"
            onTouchStart={handlePressStart}
            onMouseDown={handlePressStart}
            style={{
              backgroundColor: tetherProfile?.color || '#6B46C1',
              opacity: 0.1 + (pressIntensity * 0.09)
            }}
          >
            <div className="touch-indicator">
              <span>Press and hold to send comfort</span>
              {pressIntensity > 0 && (
                <div className="intensity-display">
                  Intensity: {Math.round(pressIntensity)}
                </div>
              )}
            </div>
          </div>

          {/* Comfort Messages */}
          {tetherProfile?.comfortMessages && (
            <div className="comfort-messages">
              {tetherProfile.comfortMessages.map((msg, idx) => (
                <button
                  key={idx}
                  className="comfort-msg-btn"
                  onClick={() => {
                    // Send comfort message
                    fetch('/api/tether/message', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
                      },
                      body: JSON.stringify({
                        sessionId: activeTether.id,
                        message: msg
                      })
                    });
                    addToast('Message sent', 'success');
                  }}
                >
                  {msg}
                </button>
              ))}
            </div>
          )}

          {/* Drawing Canvas */}
          <DrawingCanvas
            sessionId={activeTether.id}
            isEnabled={activeTether.drawingEnabled}
          />

          {/* Session Controls */}
          <div className="session-controls">
            <AppButton
              variant="secondary"
              onClick={toggleDrawing}
            >
              {activeTether.drawingEnabled ? 'Hide' : 'Show'} Drawing
            </AppButton>

            <AppButton
              variant="secondary"
              onClick={() => {
                const newMode = silentMode ? 'normal' : 'silent';
                useTetherStore.setState({ silentMode: !silentMode });
                addToast(`Switched to ${newMode} mode`, 'info');
              }}
            >
              {silentMode ? 'Enable' : 'Disable'} Sound
            </AppButton>

            <AppButton
              variant="danger"
              onClick={() => setShowEndDialog(true)}
            >
              End Tether
            </AppButton>
          </div>

          {/* Session Timer */}
          <div className="session-timer">
            Session Duration: {Math.floor((Date.now() - activeTether.startTime.getTime()) / 60000)} minutes
          </div>
        </div>

        {/* End Session Dialog */}
        {showEndDialog && (
          <div className="modal-overlay">
            <Card className="end-dialog">
              <h3>End Tether Session?</h3>
              
              <div className="form-group">
                <label>How helpful was this session?</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sessionRating}
                  onChange={(e) => setSessionRating(Number(e.target.value))}
                />
                <span>{sessionRating}/10</span>
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="What helped? Any thoughts to remember?"
                  rows={3}
                />
              </div>

              <div className="dialog-actions">
                <AppButton
                  variant="secondary"
                  onClick={() => setShowEndDialog(false)}
                >
                  Continue Session
                </AppButton>
                <AppButton
                  variant="primary"
                  onClick={handleEndTether}
                >
                  End Session
                </AppButton>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // No active tether - show circle and options
  return (
    <div className="tether-view">
      <ViewHeader
        title="Astral Tether"
        subtitle="Create meaningful connections during difficult moments"
      />

      <div className="tether-content">
        {/* Quick Tether Button */}
        <Card className="quick-tether-card">
          <h3>Need Support Now?</h3>
          <p>Connect instantly with someone from your tether circle</p>
          <AppButton
            variant="primary"
            size="lg"
            onClick={handleQuickTether}
            className="quick-tether-btn"
          >
            Quick Tether
          </AppButton>
        </Card>

        {/* Tether Circle */}
        <Card className="tether-circle-card">
          <h3>Your Tether Circle</h3>
          {tetherCircle.length === 0 ? (
            <div className="empty-circle">
              <p>Your tether circle is empty</p>
              <AppButton
                variant="secondary"
                onClick={() => {
                  // Navigate to add members
                  window.location.href = '/settings#tether-circle';
                }}
              >
                Add Trusted Contacts
              </AppButton>
            </div>
          ) : (
            <div className="circle-members">
              {tetherCircle.map(member => (
                <div
                  key={member.id}
                  className={`circle-member ${member.availability}`}
                  onClick={() => setSelectedMember(member.id)}
                >
                  <div className="member-avatar">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {member.name[0]}
                      </div>
                    )}
                    <span className={`status-indicator ${member.availability}`} />
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
                    <span className="member-status">{member.availability}</span>
                  </div>
                  {selectedMember === member.id && (
                    <div className="member-actions">
                      <AppButton
                        variant="primary"
                        size="sm"
                        onClick={() => initiateTether(member.id, 'support')}
                        disabled={member.availability !== 'available'}
                      >
                        Request Tether
                      </AppButton>
                      <AppButton
                        variant="secondary"
                        size="sm"
                        onClick={() => triggerWellnessCheck(member.id)}
                      >
                        Check In
                      </AppButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Availability Status */}
        <Card className="availability-card">
          <h3>Your Availability</h3>
          <div className="availability-options">
            {(['available', 'busy', 'offline'] as const).map(status => (
              <button
                key={status}
                className={`availability-btn ${status}`}
                onClick={() => {
                  updateAvailability(status);
                  addToast(`Status updated to ${status}`, 'success');
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </Card>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="pending-requests">
            <h3>Tether Requests</h3>
            {pendingRequests.map(request => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <span className="requester-name">{request.fromName}</span>
                  <span className="request-message">{request.message}</span>
                  <span className="request-time">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="request-actions">
                  <AppButton
                    variant="primary"
                    size="sm"
                    onClick={() => acceptTether(request.id)}
                  >
                    Accept
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    size="sm"
                    onClick={() => declineTether(request.id)}
                  >
                    Decline
                  </AppButton>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedTetherView;