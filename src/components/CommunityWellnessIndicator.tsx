import React from 'react';
import { HeartIcon, SparkleIcon, TrendingUpIcon } from './icons.dynamic';
import './CommunityWellnessIndicator.css';

interface CommunityWellnessIndicatorProps {
  activeUsers: number;
  supportGiven: number;
  postsToday: number;
  overallMood: 'positive' | 'neutral' | 'needsSupport';
}

export const CommunityWellnessIndicator: React.FC<CommunityWellnessIndicatorProps> = ({
  activeUsers,
  supportGiven,
  postsToday,
  overallMood
}) => {
  const getMoodColor = () => {
    switch (overallMood) {
      case 'positive':
        return '#4CAF50';
      case 'neutral':
        return '#FFC107';
      case 'needsSupport':
        return '#FF5722';
      default:
        return '#667eea';
    }
  };

  const getMoodMessage = () => {
    switch (overallMood) {
      case 'positive':
        return 'The community is thriving today! 🌟';
      case 'neutral':
        return 'The community is here for each other 💙';
      case 'needsSupport':
        return 'The community needs extra support today 🤗';
      default:
        return 'Welcome to our supportive community';
    }
  };

  return (
    <div className="community-wellness-card">
      <div className="wellness-header">
        <h3 className="wellness-title">
          <SparkleIcon className="wellness-icon" />
          Community Wellness
        </h3>
        <div className="wellness-mood" style={{ backgroundColor: getMoodColor() }}>
          <span className="mood-indicator"></span>
        </div>
      </div>

      <p className="wellness-message">{getMoodMessage()}</p>

      <div className="wellness-stats">
        <div className="wellness-stat">
          <div className="stat-icon-wrapper">
            <HeartIcon className="stat-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activeUsers}</span>
            <span className="stat-label">Active Now</span>
          </div>
        </div>

        <div className="wellness-stat">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <HeartIcon className="stat-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{supportGiven}</span>
            <span className="stat-label">Support Given</span>
          </div>
        </div>

        <div className="wellness-stat">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <TrendingUpIcon className="stat-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{postsToday}</span>
            <span className="stat-label">Posts Today</span>
          </div>
        </div>
      </div>

      <div className="wellness-pulse">
        <div className="pulse-ring pulse-ring-1"></div>
        <div className="pulse-ring pulse-ring-2"></div>
        <div className="pulse-ring pulse-ring-3"></div>
      </div>
    </div>
  );
};