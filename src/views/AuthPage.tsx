import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    // Navigate to dashboard after successful auth
    navigate('/dashboard');
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className="auth-page">
      {isLogin ? (
        <LoginForm 
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={switchToRegister}
        />
      ) : (
        <RegisterForm 
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </div>
  );
};

export default AuthPage;