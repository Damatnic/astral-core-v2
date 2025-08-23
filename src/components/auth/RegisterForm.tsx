import React, { useState } from 'react';
import simpleAuthService from '../../services/simpleAuthService';
import { useNavigate } from 'react-router-dom';
import { isError } from '../../types/common';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'seeker' as 'seeker' | 'helper'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.name) {
      return 'All fields are required';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await simpleAuthService.register(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.role
      );
      
      if (response.success) {
        // Clear form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          role: 'seeker'
        });
        
        // Call success callback or navigate
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError(isError(err) ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container smooth-transition">
      <form onSubmit={handleSubmit} className="auth-form glass-card animate-float">
        <h2 className="auth-form-title gradient-text">Create Account</h2>
        <p className="auth-form-subtitle">Join our supportive wellness community</p>

        {error && (
          <div className="auth-error-message glass-card animate-breathe" role="alert">
            {error}
          </div>
        )}

        <div className="form-group smooth-transition">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input glass-input smooth-transition"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            disabled={isLoading}
            autoComplete="name"
          />
        </div>

        <div className="form-group smooth-transition">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input glass-input smooth-transition"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div className="form-group smooth-transition">
          <label htmlFor="role" className="form-label">
            I want to
          </label>
          <select
            id="role"
            name="role"
            className="form-input glass-input smooth-transition"
            value={formData.role}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="seeker">Seek mental health support</option>
            <option value="helper">Provide peer support as a helper</option>
          </select>
        </div>

        <div className="form-group smooth-transition">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input glass-input smooth-transition"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
            disabled={isLoading}
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <div className="form-group smooth-transition">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input glass-input smooth-transition"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            disabled={isLoading}
            autoComplete="new-password"
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
            ) : 'Create Account'}
          </button>
        </div>

        <div className="auth-form-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="link-button smooth-transition gradient-text"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              Sign in
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

        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
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

export default RegisterForm;