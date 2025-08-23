import React, { useState, useEffect } from 'react';
import { AICompanionIcon, CheckIcon, WarningIcon, RefreshIcon } from './icons.dynamic';
import './AIChatStatus.css';

interface AIChatStatusProps {
  userId?: string;
  className?: string;
}

interface ProviderStatus {
  name: string;
  available: boolean;
  responseTime?: number;
  lastChecked: Date;
}

export const AIChatStatus: React.FC<AIChatStatusProps> = ({ className = '' }) => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  
  useEffect(() => {
    checkProviderStatus();
    const interval = setInterval(checkProviderStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);
  
  const checkProviderStatus = async () => {
    setIsChecking(true);
    try {
      const startTime = Date.now();
      const response = await fetch('/.netlify/functions/api-ai/providers');
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const providerStatuses: ProviderStatus[] = [
          {
            name: 'OpenAI',
            available: data.providers.includes('openai'),
            responseTime,
            lastChecked: new Date()
          },
          {
            name: 'Claude',
            available: data.providers.includes('claude'),
            responseTime,
            lastChecked: new Date()
          }
        ];
        
        setProviders(providerStatuses);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Failed to check provider status:', error);
      setConnectionStatus('error');
    } finally {
      setIsChecking(false);
    }
  };
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'var(--color-success)';
      case 'connecting':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-error)';
      default:
        return 'var(--text-secondary)';
    }
  };
  
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'AI Services Online';
      case 'connecting':
        return 'Connecting to AI...';
      case 'error':
        return 'AI Services Unavailable';
      default:
        return 'Unknown Status';
    }
  };
  
  return (
    <div className={`ai-chat-status-component ${className}`}>
      <div className="ai-status-header">
        <div className="ai-status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
        <span className="ai-status-text">{getStatusText()}</span>
        <button 
          className="ai-status-refresh"
          onClick={checkProviderStatus}
          disabled={isChecking}
          aria-label="Refresh status"
        >
          <RefreshIcon className={isChecking ? 'spinning' : ''} />
        </button>
      </div>
      
      {providers.length > 0 && (
        <div className="ai-status-providers">
          {providers.map((provider) => (
            <div key={provider.name} className="ai-status-provider">
              <span className="provider-name">{provider.name}</span>
              <span className="provider-status">
                {provider.available ? (
                  <><CheckIcon /> Available</>  
                ) : (
                  <><WarningIcon /> Unavailable</>
                )}
              </span>
              {provider.responseTime && (
                <span className="provider-latency">{provider.responseTime}ms</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="ai-status-footer">
        <AICompanionIcon />
        <span>Powered by advanced AI for mental health support</span>
      </div>
    </div>
  );
};

export default AIChatStatus;