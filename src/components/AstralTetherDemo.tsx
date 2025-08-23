import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { AppButton } from './AppButton';
import { 
  HeartIcon, 
  ActivityIcon, 
  SparkleIcon,
  ShieldIcon,
  LinkIcon,
  ClockIcon
} from './icons.dynamic';
import { useNotification } from '../contexts/NotificationContext';
import { astralTetherDemo } from '../data/sampleData';
import './AstralTetherDemo.css';

interface TetherMode {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const AstralTetherDemo: React.FC = () => {
  const { addToast } = useNotification();
  const [isActive, setIsActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<TetherMode>(astralTetherDemo.availableModes[0]);
  const [energyLevel, setEnergyLevel] = useState(astralTetherDemo.energyLevel);
  const [resonanceStrength, setResonanceStrength] = useState(astralTetherDemo.resonanceStrength);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
        // Simulate energy fluctuation
        setEnergyLevel(prev => Math.min(100, prev + (Math.random() * 2 - 0.5)));
        setResonanceStrength(prev => Math.min(100, prev + (Math.random() * 3 - 1)));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setSessionTime(0);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const startTetherSession = () => {
    setIsActive(true);
    setPulseAnimation(true);
    addToast(`Starting ${selectedMode.name} session...`, 'success');
  };

  const endTetherSession = () => {
    setIsActive(false);
    setPulseAnimation(false);
    const minutes = Math.floor(sessionTime / 60);
    const seconds = sessionTime % 60;
    addToast(`Session ended. Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`, 'info');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="astral-tether-demo">
      {/* Main Tether Interface */}
      <Card className="tether-main-card">
        <div className="tether-header">
          <h2 className="tether-title">
            <SparkleIcon className="tether-icon" />
            Astral Tether Experience
          </h2>
          <p className="tether-subtitle">
            Connect with calming energy and find your balance
          </p>
        </div>

        {/* Energy Visualization */}
        <div className="tether-visualization">
          <div className={`tether-orb${isActive ? ' active' : ''}${pulseAnimation ? ' pulsing' : ''}`}
               style={{ backgroundColor: selectedMode.color }}>
            <div className="tether-orb-inner">
              <span className="tether-orb-icon">{selectedMode.icon}</span>
              {isActive && (
                <div className="tether-timer">{formatTime(sessionTime)}</div>
              )}
            </div>
          </div>
          
          {isActive && (
            <div className="tether-waves">
              <div className="wave wave-1" style={{ borderColor: selectedMode.color }}></div>
              <div className="wave wave-2" style={{ borderColor: selectedMode.color }}></div>
              <div className="wave wave-3" style={{ borderColor: selectedMode.color }}></div>
            </div>
          )}
        </div>

        {/* Energy Meters */}
        <div className="tether-meters">
          <div className="meter-group">
            <label className="meter-label">
              <ActivityIcon className="meter-icon" />
              Energy Level
            </label>
            <div className="meter-bar">
              <div className="meter-fill energy-fill" 
                   style={{ width: `${energyLevel}%` }}></div>
            </div>
            <span className="meter-value">{Math.round(energyLevel)}%</span>
          </div>
          
          <div className="meter-group">
            <label className="meter-label">
              <LinkIcon className="meter-icon" />
              Resonance Strength
            </label>
            <div className="meter-bar">
              <div className="meter-fill resonance-fill" 
                   style={{ width: `${resonanceStrength}%` }}></div>
            </div>
            <span className="meter-value">{Math.round(resonanceStrength)}%</span>
          </div>
        </div>

        {/* Mode Selection */}
        {!isActive && (
          <div className="tether-modes">
            <h3 className="modes-title">Select Your Energy Mode</h3>
            <div className="modes-grid">
              {astralTetherDemo.availableModes.map((mode) => (
                <button
                  key={mode.name}
                  className={selectedMode.name === mode.name ? 'mode-card selected' : 'mode-card'}
                  onClick={() => setSelectedMode(mode)}
                  style={{ borderColor: selectedMode.name === mode.name ? mode.color : 'transparent' }}
                >
                  <span className="mode-icon">{mode.icon}</span>
                  <span className="mode-name">{mode.name}</span>
                  <span className="mode-description">{mode.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="tether-actions">
          {!isActive ? (
            <AppButton
              variant="primary"
              size="lg"
              onClick={startTetherSession}
              className="tether-start-btn"
              style={{ backgroundColor: selectedMode.color }}
            >
              <SparkleIcon />
              Start {selectedMode.name} Session
            </AppButton>
          ) : (
            <AppButton
              variant="secondary"
              size="lg"
              onClick={endTetherSession}
              className="tether-end-btn"
            >
              End Session
            </AppButton>
          )}
        </div>
      </Card>

      {/* Recent Sessions */}
      <Card className="tether-history-card">
        <h3 className="history-title">
          <ClockIcon className="history-icon" />
          Recent Sessions
        </h3>
        <div className="sessions-list">
          {astralTetherDemo.recentSessions.map((session) => (
            <div key={session.id} className="session-item">
              <div className="session-info">
                <span className="session-type">{session.type}</span>
                <span className="session-duration">{session.duration}</span>
                <span className="session-time">
                  {new Date(session.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="session-effectiveness">
                <div className="effectiveness-bar">
                  <div className="effectiveness-fill" 
                       style={{ width: `${session.effectiveness}%` }}></div>
                </div>
                <span className="effectiveness-value">{session.effectiveness}%</span>
              </div>
              {session.notes && (
                <p className="session-notes">{session.notes}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Connection Stats */}
      <Card className="tether-stats-card">
        <h3 className="stats-title">
          <ShieldIcon className="stats-icon" />
          Your Tether Stats
        </h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{astralTetherDemo.activeConnections}</span>
            <span className="stat-label">Active Connections</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">15</span>
            <span className="stat-label">Total Sessions</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">4.2h</span>
            <span className="stat-label">Total Time</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">85%</span>
            <span className="stat-label">Avg. Effectiveness</span>
          </div>
        </div>
      </Card>

      {/* Testimonials */}
      <Card className="tether-testimonials-card">
        <h3 className="testimonials-title">
          <HeartIcon className="testimonials-icon" />
          Community Experiences
        </h3>
        <div className="testimonials-list">
          {astralTetherDemo.testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-item">
              <p className="testimonial-text">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="testimonial-footer">
                <span className="testimonial-author">- {testimonial.author}</span>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < testimonial.rating ? 'star filled' : 'star'}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="tether-instructions-card">
        <h3 className="instructions-title">How to Use Astral Tether</h3>
        <ol className="instructions-list">
          <li>Choose an energy mode that matches your current needs</li>
          <li>Find a comfortable, quiet space where you won&apos;t be disturbed</li>
          <li>Start your session and focus on the pulsing visualization</li>
          <li>Breathe deeply and allow the energy to flow through you</li>
          <li>Continue for as long as feels comfortable (5-20 minutes recommended)</li>
          <li>End the session when you feel balanced and centered</li>
        </ol>
        <p className="instructions-note">
          <strong>Note:</strong> Astral Tether is a complementary wellness tool. 
          For immediate crisis support, please use the &ldquo;Need Help Now?&rdquo; button or call 988.
        </p>
      </Card>
    </div>
  );
};