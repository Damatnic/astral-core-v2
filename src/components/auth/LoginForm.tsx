import React, { useState } from 'react';
import simpleAuthService from '../../services/simpleAuthService';
import { useNavigate } from 'react-router-dom';
import { isError } from '../../types/common';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onSwitchToRegister 
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await simpleAuthService.login(email, password);
      
      if (response.success) {
        // Clear form
        setEmail('');
        setPassword('');
        
        // Call success callback or navigate
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError(isError(err) ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    setError('');
    setIsLoading(true);

    try {
      const response = await simpleAuthService.login('demo@example.com', 'demo123');
      
      if (response.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Demo login failed. Please try again.');
      }
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container smooth-transition">
      <form onSubmit={handleSubmit} className="auth-form glass-card animate-float">
        <h2 className="auth-form-title gradient-text">Welcome Back</h2>
        <p className="auth-form-subtitle">Sign in to continue to your wellness journey</p>

        {error && (
          <div className="auth-error-message glass-card animate-breathe" role="alert">
            {error}
          </div>
        )}

        <div className="form-group smooth-transition">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="form-input glass-input smooth-transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div className="form-group smooth-transition">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-input glass-input smooth-transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
            autoComplete="current-password"
            minLength={6}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="glass-button btn-primary-therapeutic smooth-transition ripple-button animate-glow"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-dots">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </div>
            ) : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="glass-button btn-secondary-therapeutic smooth-transition ripple-button"
            disabled={isLoading}
          >
            Try Demo Account
          </button>
        </div>

        <div className="auth-form-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="link-button smooth-transition gradient-text"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </form>

      <style>{`
        .auth-form-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .auth-form {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .auth-form-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .auth-form-subtitle {
          color: #718096;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .auth-error-message {
          background-color: #fed7d7;
          color: #c53030;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #4a5568;
          font-size: 0.875rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input:disabled {
          background-color: #f7fafc;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #edf2f7;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-form-footer {
          margin-top: 1.5rem;
          text-align: center;
          color: #718096;
          font-size: 0.875rem;
        }

        .link-button {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .link-button:hover:not(:disabled) {
          color: #764ba2;
        }

        .link-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .auth-form {
            padding: 1.5rem;
          }

          .auth-form-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;