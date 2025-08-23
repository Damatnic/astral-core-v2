import React, { useState, useEffect, useRef } from 'react';
import { HeartIcon, SparkleIcon, BookIcon, PlayIcon, PauseIcon  } from '../components/icons.dynamic';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { CalmingBackground } from '../components/CalmingBackground';
import { MeditationTimer } from '../components/MeditationTimer';
import { BreathingWidget } from '../components/BreathingWidget';
import './QuietSpaceView.css';

type BreathingPattern = {
    name: string;
    description: string;
    phases: Array<{phase: 'inhale' | 'hold' | 'exhale' | 'pause', duration: number, text: string}>;
};

const breathingPatterns: BreathingPattern[] = [
    {
        name: '4-7-8 Breathing',
        description: 'Calming technique for anxiety and sleep',
        phases: [
            { phase: 'inhale', duration: 4000, text: 'Inhale... 4' },
            { phase: 'hold', duration: 7000, text: 'Hold... 7' },
            { phase: 'exhale', duration: 8000, text: 'Exhale... 8' },
            { phase: 'pause', duration: 2000, text: 'Rest' }
        ]
    },
    {
        name: 'Box Breathing',
        description: 'Navy SEAL technique for focus and calm',
        phases: [
            { phase: 'inhale', duration: 4000, text: 'Inhale... 4' },
            { phase: 'hold', duration: 4000, text: 'Hold... 4' },
            { phase: 'exhale', duration: 4000, text: 'Exhale... 4' },
            { phase: 'pause', duration: 4000, text: 'Hold... 4' }
        ]
    },
    {
        name: 'Coherent Breathing',
        description: 'Balance your nervous system',
        phases: [
            { phase: 'inhale', duration: 5000, text: 'Inhale... 5' },
            { phase: 'exhale', duration: 5000, text: 'Exhale... 5' }
        ]
    }
];

const stressReliefResources = [
    {
        title: 'Headspace',
        description: 'Guided meditation and mindfulness',
        url: 'https://www.headspace.com',
        icon: '🧘'
    },
    {
        title: 'Calm',
        description: 'Sleep stories and relaxation',
        url: 'https://www.calm.com',
        icon: '😴'
    },
    {
        title: 'Insight Timer',
        description: 'Free meditation community',
        url: 'https://insighttimer.com',
        icon: '⏰'
    },
    {
        title: 'Progressive Muscle Relaxation',
        description: 'Physical tension release technique',
        url: 'https://www.healthline.com/health/progressive-muscle-relaxation',
        icon: '💪'
    },
    {
        title: '7 Cups',
        description: 'Anonymous emotional support',
        url: 'https://www.7cups.com',
        icon: '☕'
    },
    {
        title: 'Nature Sounds',
        description: 'Calming ambient sounds',
        url: 'https://www.noisli.com',
        icon: '🌿'
    }
];

export const QuietSpaceView: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState(0);
    const [showChimes, setShowChimes] = useState(true);

    const chimeRef = useRef<HTMLAudioElement | null>(null);
    const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('pause');
    const [breathingText, setBreathingText] = useState('Begin');
    const [phaseProgress, setPhaseProgress] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const phaseTimeoutRef = useRef<number | null>(null);
    const [backgroundTheme, setBackgroundTheme] = useState<'ocean' | 'forest' | 'sky' | 'aurora'>('ocean');
    const [showMeditation, setShowMeditation] = useState(false);

    // Initialize Audio on mount
    useEffect(() => {
        // Create chime sound using Web Audio API
        if (!chimeRef.current && typeof AudioContext !== 'undefined') {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Create a simple chime sound
            const createChime = () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            };
            
            // Store the function to create chimes
            (window as any).playChime = createChime;
        }
        
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (phaseTimeoutRef.current) {
                clearTimeout(phaseTimeoutRef.current);
            }
        };
    }, []);

    const toggleBreathing = () => {
        if (isPlaying) {
            stopBreathing();
        } else {
            startBreathingCycle();
        }
        setIsPlaying(!isPlaying);
    };
    
    const stopBreathing = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
        setBreathingPhase('pause');
        setBreathingText('Begin');
        setPhaseProgress(0);
    };
    
    const startBreathingCycle = () => {
        const pattern = breathingPatterns[selectedPattern];
        let currentPhaseIndex = 0;
        
        const runPhase = () => {
            const currentPhase = pattern.phases[currentPhaseIndex];
            setBreathingPhase(currentPhase.phase);
            setBreathingText(currentPhase.text);
            setPhaseProgress(0);
            
            // Play chime at the start of each phase if enabled
            if (showChimes && (window as any).playChime) {
                (window as any).playChime();
            }
            
            // Animate progress
            let progress = 0;
            const progressInterval = 50; // Update every 50ms
            const steps = currentPhase.duration / progressInterval;
            const increment = 100 / steps;
            
            intervalRef.current = window.setInterval(() => {
                progress += increment;
                setPhaseProgress(Math.min(progress, 100));
                
                if (progress >= 100) {
                    clearInterval(intervalRef.current!);
                }
            }, progressInterval);
            
            // Move to next phase
            phaseTimeoutRef.current = window.setTimeout(() => {
                currentPhaseIndex = (currentPhaseIndex + 1) % pattern.phases.length;
                runPhase();
            }, currentPhase.duration);
        };
        
        runPhase();
    };

    return (
        <div className="quiet-space-container">
            {/* Calming animated background */}
            <CalmingBackground theme={backgroundTheme} intensity={0.3} />
            
            <div className="view-header">
                <h1>Astral Quiet Space</h1>
                <p className="view-subheader">Your sanctuary for calm and mindfulness</p>
                
                {/* Theme Selector */}
                <div className="theme-selector" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    justifyContent: 'center',
                    marginTop: '1rem'
                }}>
                    <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Ambiance:</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[
                            { theme: 'ocean', emoji: '🌊', title: 'Ocean waves' },
                            { theme: 'forest', emoji: '🌲', title: 'Forest' },
                            { theme: 'sky', emoji: '☁️', title: 'Sky' },
                            { theme: 'aurora', emoji: '🌌', title: 'Aurora' }
                        ].map(({ theme, emoji, title }) => (
                            <button 
                                key={theme}
                                className={`theme-btn ${backgroundTheme === theme ? 'active' : ''}`}
                                onClick={() => setBackgroundTheme(theme as 'ocean' | 'forest' | 'sky' | 'aurora')}
                                title={title}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: backgroundTheme === theme ? '2px solid #667eea' : '2px solid transparent',
                                    background: backgroundTheme === theme ? 'white' : 'rgba(255, 255, 255, 0.8)',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: backgroundTheme === theme ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Meditation Timer */}
            {showMeditation && (
                <MeditationTimer onComplete={() => setShowMeditation(false)} />
            )}
            
            {/* Toggle for meditation timer */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => setShowMeditation(!showMeditation)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {showMeditation ? '🧘 Hide Meditation Timer' : '🧘 Open Meditation Timer'}
                </button>
            </div>
            
            {/* Enhanced Breathing Widget */}
            <div style={{ marginBottom: '2rem' }}>
                <BreathingWidget />
            </div>

            {/* Breathing Exercise Section */}
            <Card className="breathing-section">
                <h2 className="section-title">
                    <SparkleIcon />
                    <span>Breathing Exercises</span>
                </h2>
                
                {/* Pattern Selection */}
                <div className="breathing-patterns">
                    {breathingPatterns.map((pattern, index) => (
                        <button
                            key={index}
                            className={`pattern-card ${selectedPattern === index ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedPattern(index);
                                if (isPlaying) {
                                    stopBreathing();
                                }
                                // Add visual feedback for pattern change
                                const allCards = document.querySelectorAll('.pattern-card');
                                allCards.forEach(card => card.classList.add('transitioning'));
                                setTimeout(() => {
                                    allCards.forEach(card => card.classList.remove('transitioning'));
                                }, 300);
                            }}
                        >
                            <h3>{pattern.name}</h3>
                            <p>{pattern.description}</p>
                        </button>
                    ))}
                </div>

                {/* Breathing Circle */}
                <div className="breathing-circle-container">
                    <div className={`breathing-circle ${breathingPhase}`}>
                        <div className="breathing-text">{breathingText}</div>
                        <div className="phase-progress" style={{
                            width: `${phaseProgress}%`,
                            transition: 'width 0.1s linear'
                        }} />
                    </div>
                </div>
                
                <p className="quiet-space-instructions">
                    {isPlaying 
                        ? `Following ${breathingPatterns[selectedPattern].name} pattern` 
                        : 'Select a pattern and press start to begin'}
                </p>

                {/* Controls */}
                <div className="breathing-controls">
                    <AppButton 
                        className="quiet-space-button" 
                        onClick={toggleBreathing}
                        variant="primary"
                    >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        <span>{isPlaying ? 'Stop' : 'Start'} Breathing</span>
                    </AppButton>
                    
                    <label className="chime-toggle">
                        <input 
                            type="checkbox" 
                            checked={showChimes} 
                            onChange={(e) => setShowChimes(e.target.checked)}
                        />
                        <span>Play chimes</span>
                    </label>
                </div>
            </Card>

            {/* Stress Relief Resources */}
            <Card className="resources-section">
                <h2 className="section-title">
                    <HeartIcon />
                    <span>Stress Relief Resources</span>
                </h2>
                <p className="section-description">
                    Explore these helpful tools and communities for additional support
                </p>
                
                <div className="resource-grid">
                    {stressReliefResources.map((resource, index) => (
                        <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-card"
                        >
                            <span className="resource-icon">{resource.icon}</span>
                            <div className="resource-info">
                                <h3>{resource.title}</h3>
                                <p>{resource.description}</p>
                            </div>
                            <span className="resource-arrow">→</span>
                        </a>
                    ))}
                </div>
            </Card>

            {/* Additional Resources */}
            <Card className="additional-section">
                <h2 className="section-title">
                    <BookIcon />
                    <span>Learn More</span>
                </h2>
                <div className="learn-more-buttons">
                    <AppButton 
                        variant="secondary" 
                        onClick={() => window.open('https://www.healthline.com/health/breathing-exercises-for-anxiety', '_blank')}
                    >
                        Breathing Techniques Guide
                    </AppButton>
                    <AppButton 
                        variant="secondary" 
                        onClick={() => window.open('https://www.mindful.org/meditation/mindfulness-getting-started/', '_blank')}
                    >
                        Mindfulness for Beginners
                    </AppButton>
                    <AppButton 
                        variant="secondary" 
                        onClick={() => window.open('https://www.sleepfoundation.org/sleep-hygiene', '_blank')}
                    >
                        Better Sleep Tips
                    </AppButton>
                </div>
            </Card>
        </div>
    );
};

export default QuietSpaceView;