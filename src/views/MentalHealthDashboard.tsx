import React, { useState } from 'react';
import { BreathingExercise } from '../components/BreathingExercise';
import { GroundingTechnique } from '../components/GroundingTechnique';
import { SafetyPlanBuilder } from '../components/SafetyPlan';
import { MeditationTimer } from '../components/MeditationTimer';
// import { CrisisHelpWidget } from '../components/CrisisSupport/CrisisHelpWidget'; // Already in App.tsx

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  component?: React.ReactNode;
  comingSoon?: boolean;
}

export const MentalHealthDashboard: React.FC = () => {
  const [_activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showSafetyPlan, setShowSafetyPlan] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);

  const features: DashboardCard[] = [
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      description: 'Guided breathing patterns for anxiety and stress relief',
      icon: '🧘',
      color: 'blue',
      component: <BreathingExercise onComplete={() => setShowBreathing(false)} />
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 Grounding',
      description: 'Sensory grounding technique for anxiety and panic',
      icon: '🌳',
      color: 'green',
      component: <GroundingTechnique onComplete={() => setShowGrounding(false)} />
    },
    {
      id: 'mood',
      title: 'Mood Tracker',
      description: 'Track your mood patterns with AI insights',
      icon: '📊',
      color: 'purple',
      comingSoon: false
    },
    {
      id: 'journal',
      title: 'Guided Journaling',
      description: 'Therapeutic writing prompts and reflection',
      icon: '📝',
      color: 'indigo',
      comingSoon: true
    },
    {
      id: 'meditation',
      title: 'Meditation Timer',
      description: 'Customizable meditation sessions with ambient sounds',
      icon: '🔔',
      color: 'orange',
      component: <MeditationTimer onComplete={() => setShowMeditation(false)} />,
      comingSoon: false
    },
    {
      id: 'safety',
      title: 'Safety Plan',
      description: 'Create and maintain your personal safety plan',
      icon: '🛡️',
      color: 'red',
      component: <SafetyPlanBuilder />,
      comingSoon: false
    },
    {
      id: 'selfcare',
      title: 'Self-Care Reminders',
      description: 'Personalized reminders for wellness activities',
      icon: '💝',
      color: 'pink',
      comingSoon: true
    },
    {
      id: 'resources',
      title: 'Resource Library',
      description: 'Curated mental health resources and articles',
      icon: '📚',
      color: 'teal',
      comingSoon: true
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    if (featureId === 'breathing') {
      setShowBreathing(true);
      setActiveFeature('breathing');
    } else if (featureId === 'grounding') {
      setShowGrounding(true);
      setActiveFeature('grounding');
    } else if (featureId === 'safety') {
      setShowSafetyPlan(true);
      setActiveFeature('safety');
    } else if (featureId === 'meditation') {
      setShowMeditation(true);
      setActiveFeature('meditation');
    } else if (featureId === 'mood') {
      // Navigate to wellness view
      window.location.href = '#/wellness';
    } else {
      setActiveFeature(featureId);
    }
  };

  return (
    <div className="mental-health-dashboard">
      <style>{`
        .mental-health-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          color: white;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }

        .dashboard-header h1 {
          margin: 0 0 10px 0;
          font-size: 36px;
          font-weight: 700;
        }

        .dashboard-header p {
          margin: 0;
          font-size: 18px;
          opacity: 0.95;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          text-align: center;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #8b5cf6;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--card-color) 0%, var(--card-color-light) 100%);
        }

        .feature-card.blue { --card-color: #3b82f6; --card-color-light: #60a5fa; }
        .feature-card.green { --card-color: #10b981; --card-color-light: #34d399; }
        .feature-card.purple { --card-color: #8b5cf6; --card-color-light: #a78bfa; }
        .feature-card.indigo { --card-color: #6366f1; --card-color-light: #818cf8; }
        .feature-card.orange { --card-color: #f97316; --card-color-light: #fb923c; }
        .feature-card.red { --card-color: #ef4444; --card-color-light: #f87171; }
        .feature-card.pink { --card-color: #ec4899; --card-color-light: #f472b6; }
        .feature-card.teal { --card-color: #14b8a6; --card-color-light: #2dd4bf; }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .feature-card.coming-soon {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .feature-card.coming-soon:hover {
          transform: none;
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .feature-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .feature-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .coming-soon-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #fbbf24;
          color: #78350f;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .active-feature {
          background: #f9fafb;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 40px;
          animation: slideIn 0.3s ease-out;
        }

        .active-feature-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .active-feature-title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        .close-feature-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .close-feature-btn:hover {
          background: #dc2626;
        }

        .motivational-quote {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin-bottom: 40px;
        }

        .quote-text {
          font-size: 18px;
          font-style: italic;
          color: #78350f;
          margin-bottom: 10px;
        }

        .quote-author {
          font-size: 14px;
          color: #92400e;
          font-weight: 600;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .stat-card,
          .feature-card {
            background: #1f2937;
          }

          .feature-title,
          .active-feature-title {
            color: #f3f4f6;
          }

          .feature-description,
          .stat-label {
            color: #9ca3af;
          }

          .active-feature {
            background: #111827;
          }

          .motivational-quote {
            background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
          }

          .quote-text {
            color: #fef3c7;
          }

          .quote-author {
            color: #fde68a;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .dashboard-header h1 {
            font-size: 28px;
          }

          .dashboard-header p {
            font-size: 16px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .quick-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-header">
        <h1>Your Mental Wellness Hub</h1>
        <p>Take a moment for yourself. Every step counts.</p>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-value">7</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">😊</div>
          <div className="stat-label">Current Mood</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">15</div>
          <div className="stat-label">Minutes Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">92%</div>
          <div className="stat-label">Weekly Goal</div>
        </div>
      </div>

      <div className="motivational-quote">
        <div className="quote-text">
          "You don't have to control your thoughts. You just have to stop letting them control you."
        </div>
        <div className="quote-author">— Dan Millman</div>
      </div>

      {(showBreathing || showGrounding || showSafetyPlan || showMeditation) && (
        <div className="active-feature">
          <div className="active-feature-header">
            <h2 className="active-feature-title">
              {showBreathing ? 'Breathing Exercise' : 
               showGrounding ? 'Grounding Technique' :
               showSafetyPlan ? 'Safety Plan Builder' :
               'Meditation Timer'}
            </h2>
            <button 
              className="close-feature-btn"
              onClick={() => {
                setShowBreathing(false);
                setShowGrounding(false);
                setShowSafetyPlan(false);
                setShowMeditation(false);
                setActiveFeature(null);
              }}
            >
              Close
            </button>
          </div>
          {showBreathing && <BreathingExercise onComplete={() => setShowBreathing(false)} />}
          {showGrounding && <GroundingTechnique onComplete={() => setShowGrounding(false)} />}
          {showSafetyPlan && <SafetyPlanBuilder />}
          {showMeditation && <MeditationTimer onComplete={() => setShowMeditation(false)} />}
        </div>
      )}

      <div className="features-grid">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`feature-card ${feature.color} ${feature.comingSoon ? 'coming-soon' : ''}`}
            onClick={() => !feature.comingSoon && handleFeatureClick(feature.id)}
          >
            {feature.comingSoon && <div className="coming-soon-badge">Coming Soon</div>}
            <div className="feature-icon">{feature.icon}</div>
            <div className="feature-title">{feature.title}</div>
            <div className="feature-description">{feature.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentalHealthDashboard;