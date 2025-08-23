import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppButton } from '../components/AppButton';
import { GoogleIcon, AppleIcon } from '../components/icons.dynamic';
import { Card } from '../components/Card';
import { demoDataService } from '../services/demoDataService';
import { ActiveView } from '../types';
import i18n from '../i18n';

interface LoginViewProps {
    setActiveView?: (view: ActiveView) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ setActiveView }) => {
    const { login, isLoading } = useAuth();

    const handleLoginClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        login();
    };

    // Demo login functions for testing different user types
    const handleDemoLogin = (userType: 'user' | 'helper' | 'admin') => {
        // Create mock user data based on type
        const mockUsers = {
            user: {
                sub: 'demo-user-001',
                email: 'demo.starkeeper@astralcore.com',
                name: 'Demo Starkeeper',
                userType: 'seeker'
            },
            helper: {
                sub: 'demo-helper-001', 
                email: 'demo.guide@astralcore.com',
                name: 'Demo Constellation Guide',
                userType: 'helper',
                helperProfile: {
                    id: 'helper-001',
                    name: 'Demo Constellation Guide',
                    role: 'Community',
                    specializations: ['anxiety', 'depression'],
                    bio: 'Demo constellation guide for testing purposes',
                    isVerified: true,
                    isAvailable: true
                }
            },
            admin: {
                sub: 'demo-admin-001',
                email: 'demo.admin@astralcore.com', 
                name: 'Demo Astral Admin',
                userType: 'admin',
                role: 'Admin',
                helperProfile: {
                    id: 'admin-001',
                    name: 'Demo Astral Admin',
                    role: 'Admin',
                    specializations: ['administration'],
                    bio: 'Demo astral admin for testing purposes',
                    isVerified: true,
                    isAvailable: true
                }
            }
        };

        // Store mock user data in localStorage for demo purposes
        const mockUser = mockUsers[userType];
        localStorage.setItem('demo_user', JSON.stringify(mockUser));
        localStorage.setItem('demo_token', `demo-token-${userType}-${Date.now()}`);
        
        // Initialize comprehensive demo data for this user type
        demoDataService.initializeDemoData(userType, mockUser.sub);
        
        // Trigger a page reload to apply the demo login
        window.location.reload();
    };

    return (
        <>
            <style>{`
                .login-container {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 2rem;
                    animation: fadeIn 0.5s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    padding: 2rem;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
                    border-radius: 20px;
                    position: relative;
                    overflow: hidden;
                }

                .login-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
                    animation: rotate 20s linear infinite;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .login-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    position: relative;
                    z-index: 1;
                }

                .login-header p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    position: relative;
                    z-index: 1;
                }

                .auth-card {
                    background: var(--card-bg);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid var(--border-color);
                }

                .auth-intro {
                    text-align: center;
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
                    border-radius: 12px;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                }

                .auth-intro-icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }

                .demo-login-container {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: var(--bg-secondary);
                    border-radius: 16px;
                    border: 2px dashed var(--border-color);
                }

                .demo-login-title {
                    text-align: center;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .demo-login-buttons {
                    display: grid;
                    gap: 1rem;
                }

                .demo-login-btn {
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    background: var(--card-bg);
                }

                .demo-login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                }

                .demo-login-btn.starkeeper:hover {
                    border-color: #667eea;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
                }

                .demo-login-btn.guide:hover {
                    border-color: #10b981;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%);
                }

                .demo-login-btn.admin:hover {
                    border-color: #f59e0b;
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(251, 146, 60, 0.05) 100%);
                }

                .demo-user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .demo-user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .demo-user-details {
                    text-align: left;
                }

                .demo-user-name {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .demo-user-role {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .demo-user-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: white;
                }

                .badge-starkeeper {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .badge-guide {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .badge-admin {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }

                .divider {
                    display: flex;
                    align-items: center;
                    margin: 2rem 0;
                    color: var(--text-secondary);
                }

                .divider::before,
                .divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: var(--border-color);
                }

                .divider span {
                    padding: 0 1rem;
                    font-size: 0.9rem;
                }

                .auth-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .auth-button {
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    border: 2px solid var(--border-color);
                }

                .auth-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }

                .auth-button.google {
                    background: white;
                    color: #333;
                }

                .auth-button.google:hover {
                    border-color: #4285f4;
                    background: linear-gradient(135deg, rgba(66, 133, 244, 0.05) 0%, rgba(66, 133, 244, 0.1) 100%);
                }

                .auth-button.apple {
                    background: #000;
                    color: white;
                    border-color: #000;
                }

                .auth-button.apple:hover {
                    background: #333;
                    border-color: #333;
                }

                .privacy-note {
                    margin-top: 2rem;
                    padding: 1rem;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%);
                    border-radius: 12px;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .privacy-note-icon {
                    color: #10b981;
                    margin-right: 0.5rem;
                }

                @media (max-width: 768px) {
                    .login-container {
                        padding: 1rem;
                    }

                    .login-header h1 {
                        font-size: 2rem;
                    }

                    .auth-card {
                        padding: 1.5rem;
                    }
                }
            `}</style>

            <div className="login-container">
                <div className="login-header">
                    <h1>{i18n.t('helper_signin_signup')}</h1>
                    <p>
                        {i18n.t('helper_dashboard_access')}
                    </p>
                </div>
            <Card className="auth-card">
                <p style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                    Our helpers use a secure, external provider for authentication. This keeps your helper identity separate from the anonymous peer support system.
                </p>

                {/* Demo Login Buttons for Testing */}
                <div className="demo-login-container">
                    <h4 className="demo-login-title">
                        🧪 Demo Login (Testing Only)
                    </h4>
                    <div className="demo-login-buttons">
                        <AppButton
                            onClick={() => handleDemoLogin('user')}
                            variant="secondary"
                            className="demo-login-btn starkeeper"
                        >
                            ⭐ Login as Starkeeper
                        </AppButton>
                        <AppButton
                            onClick={() => handleDemoLogin('helper')}
                            variant="secondary"
                            className="demo-login-btn guide"
                        >
                            🌌 Login as Constellation Guide
                        </AppButton>
                        <AppButton
                            onClick={() => handleDemoLogin('admin')}
                            variant="secondary"
                            className="demo-login-btn admin"
                        >
                            ✨ Login as Astral Admin
                        </AppButton>
                    </div>
                    
                    {setActiveView && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <AppButton
                                onClick={() => setActiveView({ view: 'workflow-demo' })}
                                variant="secondary"
                                className="workflow-demo-btn"
                            >
                                🔄 View Platform Workflow Demo
                            </AppButton>
                        </div>
                    )}
                </div>
                
                <div className="auth-separator">Or use real authentication</div>
                
                <p style={{textAlign: 'center', marginBottom: '1.5rem', fontSize: '14px', color: '#666'}}>
                    Real authentication for production use:
                </p>
                
                <AppButton
                    onClick={handleLoginClick}
                    isLoading={isLoading}
                    className="btn-full-width"
                >
                    {i18n.t('signin_signup_email')}
                </AppButton>
                
                <div className="auth-separator">{i18n.t('continue_with')}</div>
                
                <div className="social-login-buttons">
                    <AppButton onClick={handleLoginClick} variant="secondary" className="btn-social" icon={<GoogleIcon/>}>
                        <span>{i18n.t('signin_google')}</span>
                    </AppButton>
                    <AppButton onClick={handleLoginClick} variant="secondary" className="btn-social" icon={<AppleIcon/>}>
                        <span>{i18n.t('signin_apple')}</span>
                    </AppButton>
                </div>

                 <p className="auth-toggle" style={{marginTop: '2rem'}}>
                    {i18n.t('signin_agreement')}
                </p>
            </Card>

            {/* Demo Credentials Card */}
            <Card style={{
                marginTop: '2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none'
            }}>
                <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span>🎭</span> Demo Accounts Available
                </h3>
                <p style={{marginBottom: '1rem', opacity: 0.9}}>
                    Try Astral Core with our demo accounts:
                </p>
                <div style={{
                    display: 'grid',
                    gap: '1rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <strong style={{display: 'block', marginBottom: '0.5rem'}}>
                            👤 Regular User
                        </strong>
                        <code style={{fontSize: '0.875rem'}}>
                            demo@user.com<br/>
                            password: Demo123!
                        </code>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <strong style={{display: 'block', marginBottom: '0.5rem'}}>
                            💚 Helper
                        </strong>
                        <code style={{fontSize: '0.875rem'}}>
                            demo@helper.com<br/>
                            password: Helper123!
                        </code>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <strong style={{display: 'block', marginBottom: '0.5rem'}}>
                            ⚙️ Admin
                        </strong>
                        <code style={{fontSize: '0.875rem'}}>
                            demo@admin.com<br/>
                            password: Admin123!
                        </code>
                    </div>
                </div>
                <p style={{marginTop: '1rem', fontSize: '0.875rem', opacity: 0.8}}>
                    Note: Demo accounts reset every 24 hours with fresh sample data.
                </p>
            </Card>
            </div>
        </>
    );
};

export default LoginView;