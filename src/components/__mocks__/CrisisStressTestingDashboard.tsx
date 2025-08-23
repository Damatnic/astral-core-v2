/**
 * Mock Crisis Stress Testing Dashboard Component
 * 
 * This mock prevents the actual stress testing dashboard from running tests
 * during unit testing, avoiding timeouts and interference.
 */

import React from 'react';

interface CrisisStressTestingDashboardProps {
  onEmergencyBreak?: (reason: string) => void;
  onTestComplete?: (results: any[]) => void;
  className?: string;
}

export const CrisisStressTestingDashboard: React.FC<CrisisStressTestingDashboardProps> = ({
  className = ''
}) => {
  return (
    <div className={className} data-testid="mock-crisis-stress-testing-dashboard">
      <h2>Crisis Stress Testing Dashboard (Mocked)</h2>
      <p>Stress testing is disabled in test environment</p>
    </div>
  );
};

export default CrisisStressTestingDashboard;