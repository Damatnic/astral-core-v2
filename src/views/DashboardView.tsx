import React, { useState, useEffect } from 'react';
import { HeartIcon, UsersIcon, ShieldIcon, SparkleIcon, TrendingUpIcon, BookIcon } from '../components/icons.dynamic';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.FC<any>;
  color: string;
  href: string;
  stats?: {
    label: string;
    value: string;
  };
}

const DashboardView: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    // Get time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Good morning');
    else if (hour < 17) setTimeOfDay('Good afternoon');
    else setTimeOfDay('Good evening');

    // Get user name (this would come from auth context in real app)
    setUserName('Friend');
  }, []);

  const dashboardCards: DashboardCard[] = [
    {
      id: 'crisis-support',
      title: 'Crisis Support',
      description: 'Immediate help and resources',
      icon: ShieldIcon,
      color: 'red',
      href: '/crisis',
      stats: {
        label: '24/7 Available',
        value: 'Always'
      }
    },
    {
      id: 'peer-support',
      title: 'Peer Support',
      description: 'Connect with others',
      icon: UsersIcon,
      color: 'blue',
      href: '/peer-support',
      stats: {
        label: 'Active Helpers',
        value: '200+'
      }
    },
    {
      id: 'wellness-tracking',
      title: 'Wellness Tracking',
      description: 'Monitor your mental health',
      icon: HeartIcon,
      color: 'pink',
      href: '/wellness',
      stats: {
        label: 'Current Streak',
        value: '5 days'
      }
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      description: 'Talk to our AI companion',
      icon: SparkleIcon,
      color: 'purple',
      href: '/ai-assistant',
      stats: {
        label: 'Conversations',
        value: '12'
      }
    },
    {
      id: 'reflections',
      title: 'Reflections',
      description: 'Daily journaling and insights',
      icon: BookIcon,
      color: 'green',
      href: '/reflections',
      stats: {
        label: 'This Week',
        value: '3 entries'
      }
    },
    {
      id: 'progress',
      title: 'Progress Insights',
      description: 'View your wellness trends',
      icon: TrendingUpIcon,
      color: 'indigo',
      href: '/analytics',
      stats: {
        label: 'Overall Trend',
        value: '↗ Improving'
      }
    }
  ];

  const getGradientClass = (color: string) => {
    const gradientMap: { [key: string]: string } = {
      red: 'gradient-sunset',
      blue: 'gradient-peaceful',
      pink: 'gradient-wellness',
      purple: 'gradient-calm',
      green: 'gradient-forest',
      indigo: 'gradient-aurora'
    };
    return gradientMap[color] || 'gradient-ocean';
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-primary-50 to-therapy-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8 glass-card p-6 animate-float">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {timeOfDay}, {userName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Welcome to your mental wellness dashboard. How are you feeling today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="wellness-stat-card glass-card smooth-transition animate-breathe">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Check-ins This Week
            </h3>
            <p className="text-2xl font-bold gradient-text">5</p>
            <p className="text-sm text-green-600 dark:text-green-400 animate-glow">+2 from last week</p>
          </div>
          
          <div className="wellness-stat-card glass-card smooth-transition animate-breathe" style={{animationDelay: '0.2s'}}>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Mood Average
            </h3>
            <p className="text-2xl font-bold gradient-text">7.2/10</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Stable trend</p>
          </div>
          
          <div className="wellness-stat-card glass-card smooth-transition animate-breathe" style={{animationDelay: '0.4s'}}>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Support Connections
            </h3>
            <p className="text-2xl font-bold gradient-text">18</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Active helpers</p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <button
                key={card.id}
                className={`therapy-card smooth-transition-slow cursor-pointer text-left ${getGradientClass(card.color)} animate-gradient`}
                onClick={() => {
                  // In a real app, this would use React Router
                  console.log(`Navigate to ${card.href}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log(`Navigate to ${card.href}`);
                  }
                }}
                style={{
                  background: `var(--${getGradientClass(card.color)})`,
                  backgroundSize: '200% 200%',
                  animationDelay: `${dashboardCards.indexOf(card) * 0.1}s`
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="glass-card p-3 animate-float">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  {card.stats && (
                    <div className="text-right text-white">
                      <p className="text-xs opacity-90">{card.stats.label}</p>
                      <p className="text-sm font-semibold">{card.stats.value}</p>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {card.title}
                </h3>
                
                <p className="text-sm text-white opacity-90">
                  {card.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 glass-card smooth-transition p-6">
          <h2 className="text-xl font-semibold gradient-text mb-4">
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 glass-card smooth-transition animate-float" style={{animationDelay: '0.1s'}}>
              <div className="neumorph-card p-2">
                <HeartIcon className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Wellness check-in completed
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 glass-card smooth-transition animate-float" style={{animationDelay: '0.2s'}}>
              <div className="neumorph-card p-2">
                <SparkleIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  AI conversation: Stress management tips
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Yesterday</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 glass-card smooth-transition animate-float" style={{animationDelay: '0.3s'}}>
              <div className="neumorph-card p-2">
                <UsersIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Connected with new peer support helper
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">2 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Section */}
        <div className="mt-8 crisis-indicator glass-card animate-breathe">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Need Immediate Help?
              </h3>
              <p className="text-red-700 dark:text-red-300">
                Crisis support is available 24/7. You're not alone.
              </p>
            </div>
            <button 
              className="crisis-button smooth-transition ripple-button"
              onClick={() => console.log('Navigate to /crisis')}
            >
              Get Help Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
