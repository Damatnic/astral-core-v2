import React from 'react';
import { HelperGuidance } from '../types';

interface GuidancePanelProps {
  guidance: HelperGuidance;
  onDismiss: () => void;
  className?: string;
}

const GuidancePanel: React.FC<GuidancePanelProps> = ({ 
  guidance,
  onDismiss,
  className = ''
}) => {
  const variant = guidance.isCrisis ? 'warning' : 'info';
  
  return (
    <div className={`guidance-panel guidance-panel-${variant} ${className}`}>
      <div className="guidance-panel-content">
        <div className="guidance-panel-header">
          <h4>AI Guidance</h4>
          <button onClick={onDismiss} className="guidance-panel-close">×</button>
        </div>
        {guidance.isCrisis && (
          <p className="guidance-panel-crisis-warning">
            <strong>Crisis Detected:</strong> {guidance.flagReason}
          </p>
        )}
        {guidance.suggestedResponses.length > 0 && (
          <div className="guidance-panel-responses">
            <h5>Suggested Responses:</h5>
            <ul>
              {guidance.suggestedResponses.map((response, index) => (
                <li key={index}>{response}</li>
              ))}
            </ul>
          </div>
        )}
        {guidance.suggestedResources.length > 0 && (
          <div className="guidance-panel-resources">
            <h5>Recommended Resources:</h5>
            <ul>
              {guidance.suggestedResources.map((resource, index) => (
                <li key={index}>
                  <strong>{resource.title}</strong>: {resource.contact}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export { GuidancePanel };
export default GuidancePanel;