/**
 * @fileoverview Floating Button Manager Component
 * Manages and organizes multiple floating action buttons to prevent overlap
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AccessibilityButton } from './AccessibilityButton';
import { AlertCircleIcon, ActivityIcon, SparkleIcon, CloseIcon } from './icons.dynamic';
import { useDilemmaStore } from '../stores/dilemmaStore';
import { useReflectionStore } from '../stores/reflectionStore';

interface FloatingButton {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    badge?: number | boolean;
    color?: string;
}

interface FloatingButtonManagerProps {
    onShowAIChat?: () => void;
}

export const FloatingButtonManager: React.FC<FloatingButtonManagerProps> = ({ onShowAIChat }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    
    // Get stats from stores
    const { visibleDilemmas } = useDilemmaStore();
    const { reflections } = useReflectionStore();
    
    const totalPosts = visibleDilemmas.length;
    const totalReflections = reflections.length;
    const totalReactions = reflections.reduce((sum, r) => 
        sum + Object.values(r.reactions).reduce((a, b) => a + b, 0), 0
    );

    const handleAIChatClick = () => {
        if (onShowAIChat) {
            onShowAIChat();
        } else {
            // Fallback: redirect to ai-chat view if no callback provided
            window.location.hash = '#ai-chat';
        }
        setIsExpanded(false);
    };

    const floatingButtons: FloatingButton[] = [
        {
            id: 'help',
            icon: <AlertCircleIcon />,
            label: 'Need Help Now',
            onClick: () => setShowHelpModal(true),
            color: '#ef4444'
        },
        {
            id: 'stats',
            icon: <ActivityIcon />,
            label: 'Site Statistics',
            onClick: () => setShowStatsModal(true),
            badge: totalPosts + totalReflections,
            color: '#10b981'
        },
        {
            id: 'ai-chat',
            icon: <SparkleIcon />,
            label: 'AI Companion',
            onClick: handleAIChatClick,
            color: '#8b5cf6'
        }
    ];

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.shiftKey) {
                switch (e.key.toLowerCase()) {
                    case 'h':
                        e.preventDefault();
                        setShowHelpModal(true);
                        break;
                    case 's':
                        e.preventDefault();
                        setShowStatsModal(true);
                        break;
                    case 'a':
                        e.preventDefault();
                        handleAIChatClick();
                        break;
                    case 'x':
                        e.preventDefault();
                        setIsExpanded(!isExpanded);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded, onShowAIChat]);

    return (
        <>
            {/* Get Help Now Button - Always Visible */}
            <button 
                className="help-now-button"
                onClick={() => setShowHelpModal(true)}
                aria-label="Get Help Now - Crisis Support"
                style={{
                    position: 'fixed',
                    bottom: '120px',
                    right: '24px',
                    zIndex: 9990,
                    background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '28px',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4), 0 0 80px rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)';
                }}
            >
                <span style={{ fontSize: '1.1rem' }}>🆘</span>
                {' '}Get Help Now
            </button>

            <style>{`
                .floating-button-manager {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 9988;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 1rem;
                }

                .fab-container {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.75rem;
                }

                .fab-main {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    font-size: 1.5rem;
                }

                .fab-main:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
                }

                .fab-main.expanded {
                    transform: rotate(45deg);
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                }

                .fab-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    opacity: 0;
                    transform: scale(0.8) translateY(20px);
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .fab-menu.expanded {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    pointer-events: all;
                }

                .fab-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .fab-item:hover {
                    transform: translateX(-5px);
                }

                .fab-label {
                    background: var(--card-bg);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    white-space: nowrap;
                    color: var(--text-primary);
                    font-weight: 500;
                    opacity: 0;
                    transform: translateX(10px);
                    transition: all 0.3s ease;
                }

                .fab-menu.expanded .fab-label {
                    opacity: 1;
                    transform: translateX(0);
                }

                .fab-button {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    color: white;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .fab-button:hover {
                    transform: scale(1.1);
                }

                .fab-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #fbbf24;
                    color: #000;
                    border-radius: 10px;
                    padding: 2px 6px;
                    font-size: 0.7rem;
                    font-weight: bold;
                    border: 2px solid white;
                    min-width: 20px;
                    text-align: center;
                }

                .powered-by {
                    position: fixed;
                    bottom: 1rem;
                    right: 8rem;
                    background: var(--card-bg);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    opacity: 0.8;
                    transition: all 0.3s ease;
                }

                .powered-by:hover {
                    opacity: 1;
                    transform: translateY(-2px);
                }

                .powered-by-logo {
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc04 100%);
                    border-radius: 50%;
                }

                /* Stats Modal */
                .stats-modal {
                    position: fixed;
                    bottom: 6rem;
                    right: 2rem;
                    width: 320px;
                    background: var(--card-bg);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .stats-modal.open {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    pointer-events: all;
                }

                .stats-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .stats-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .stats-close {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .stats-close:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .stat-card {
                    background: var(--bg-secondary);
                    padding: 1rem;
                    border-radius: 12px;
                    text-align: center;
                    border: 1px solid var(--border-color);
                }

                .stat-value {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .stats-footer {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }

                /* Help Modal */
                .help-modal {
                    position: fixed;
                    bottom: 6rem;
                    right: 2rem;
                    width: 320px;
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 40px rgba(239, 68, 68, 0.2);
                    z-index: 10000;
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                    pointer-events: none;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .dark-mode .help-modal {
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
                }

                .help-modal.open {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    pointer-events: all;
                }

                .help-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .help-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #dc2626;
                }

                .help-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .help-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    color: inherit;
                }

                .dark-mode .help-item {
                    background: var(--card-bg);
                }

                .help-item:hover {
                    transform: translateX(-5px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .help-icon {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 8px;
                    color: #ef4444;
                }

                .help-text {
                    flex: 1;
                }

                .help-number {
                    font-weight: bold;
                    color: #dc2626;
                }

                .help-desc {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                @media (max-width: 768px) {
                    .floating-button-manager {
                        bottom: 1rem;
                        right: 1rem;
                    }

                    .powered-by {
                        display: none;
                    }

                    .stats-modal,
                    .help-modal {
                        width: calc(100vw - 2rem);
                        right: 1rem;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .fab-main,
                    .fab-menu,
                    .fab-item,
                    .fab-label,
                    .stats-modal,
                    .help-modal {
                        transition: none;
                    }
                }
            `}</style>

            <div className="floating-button-manager">
                {/* Accessibility Button (separate component) */}
                <AccessibilityButton />

                {/* Main FAB Menu */}
                <div className="fab-container">
                    <div className={isExpanded ? 'fab-menu expanded' : 'fab-menu'}>
                        {floatingButtons.map((button, index) => (
                            <div key={button.id} className="fab-item" style={{
                                transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
                            }}>
                                <span className="fab-label">{button.label}</span>
                                <button
                                    className="fab-button"
                                    onClick={button.onClick}
                                    style={{ background: button.color || '#667eea' }}
                                    aria-label={button.label}
                                >
                                    {button.icon}
                                    {button.badge && (
                                        <span className="fab-badge">
                                            {typeof button.badge === 'number' ? button.badge : '!'}
                                        </span>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        className={isExpanded ? 'fab-main expanded' : 'fab-main'}
                        onClick={() => setIsExpanded(!isExpanded)}
                        aria-label={isExpanded ? 'Close menu' : 'Open menu'}
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? <CloseIcon /> : '✨'}
                    </button>
                </div>
            </div>

            {/* Powered by Google Gemini */}
            <div className="powered-by">
                <div className="powered-by-logo"></div>
                <span>Powered by Google Gemini</span>
            </div>

            {/* Stats Modal */}
            <div className={showStatsModal ? 'stats-modal open' : 'stats-modal'}>
                <div className="stats-header">
                    <h3 className="stats-title">Site Statistics</h3>
                    <button
                        className="stats-close"
                        onClick={() => setShowStatsModal(false)}
                        aria-label="Close stats"
                    >
                        ✕
                    </button>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{totalPosts}</div>
                        <div className="stat-label">Community Posts</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalReflections}</div>
                        <div className="stat-label">Reflections</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalReactions}</div>
                        <div className="stat-label">Reactions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">24/7</div>
                        <div className="stat-label">Support Available</div>
                    </div>
                </div>
                <div className="stats-footer">
                    Growing stronger together, every day
                </div>
            </div>

            {/* Help Modal */}
            <div className={showHelpModal ? 'help-modal open' : 'help-modal'}>
                <div className="help-header">
                    <h3 className="help-title">Need Help Now?</h3>
                    <button
                        className="stats-close"
                        onClick={() => setShowHelpModal(false)}
                        aria-label="Close help"
                    >
                        ✕
                    </button>
                </div>
                <div className="help-content">
                    <a href="tel:988" className="help-item">
                        <div className="help-icon">📞</div>
                        <div className="help-text">
                            <div className="help-number">988</div>
                            <div className="help-desc">Crisis Lifeline</div>
                        </div>
                    </a>
                    <a href="sms:741741&body=HOME" className="help-item">
                        <div className="help-icon">💬</div>
                        <div className="help-text">
                            <div className="help-number">Text HOME to 741741</div>
                            <div className="help-desc">Crisis Text Line</div>
                        </div>
                    </a>
                    <a href="#/crisis-resources" className="help-item">
                        <div className="help-icon">🆘</div>
                        <div className="help-text">
                            <div className="help-number">View All Resources</div>
                            <div className="help-desc">More support options</div>
                        </div>
                    </a>
                    <a href="#/quiet-space" className="help-item">
                        <div className="help-icon">🧘</div>
                        <div className="help-text">
                            <div className="help-number">Quiet Space</div>
                            <div className="help-desc">Breathing exercises</div>
                        </div>
                    </a>
                </div>
            </div>
        </>
    );
};

export default FloatingButtonManager;