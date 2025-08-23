import React from 'react';
import HelperTrainingView from '../views/HelperTrainingView';
import { useNavigate } from 'react-router-dom';

/**
 * Route wrapper for HelperTrainingView that provides required props
 */
const HelperTrainingRoute: React.FC = () => {
  const navigate = useNavigate();

  const handleTrainingComplete = () => {
    // Handle training completion - could navigate to dashboard, show success message
    console.log('Helper training completed');
    navigate('/helper/dashboard');
  };

  return (
    <HelperTrainingView 
      onTrainingComplete={handleTrainingComplete}
    />
  );
};

export default HelperTrainingRoute;
