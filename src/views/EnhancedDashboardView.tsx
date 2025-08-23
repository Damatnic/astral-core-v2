import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  UsersIcon, 
  ShieldIcon, 
  SparkleIcon, 
  TrendingUpIcon, 
  BookIcon,
  CalendarIcon,
  ActivityIcon,
  SmileIcon,
  MoonIcon,
  SunIcon,
  CloudIcon
} from '../components/icons.dynamic';
import '../styles/modern-therapeutic-design.css';

interface WellnessStat {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.FC<any>;
  gradient: string;
  delay: number;
}

interface MoodData {
  mood: string;
  emoji: string;
  color: string;
  gradient: string;
}

const EnhancedDashboardView: React.FC = () => {
  const [userName, setUserName] = useState('Friend');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setAnimateCards(true), 100);
    }, 1000);

    // Get time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('Good morning');
    } else if (hour < 17) {
      setTimeOfDay('Good afternoon');
    } else if (hour < 22) {
      setTimeOfDay('Good evening');
    } else {
      setTimeOfDay('Good night');
    }

    // Get current date
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(new Date().toLocaleDateString(undefined, options));

    // Get user name from auth/storage
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, []);

  const wellnessStats: WellnessStat[] = [
    {
      label: 'Wellness Score',
      value: '82%',
      change: 5,
      trend: 'up',
      color: 'var(--gradient-wellness)'
    },
    {
      label: 'Check-ins This Week',
      value: 5,
      change: 2,
      trend: 'up',
      color: 'var(--gradient-calm)'
    },
    {
      label: 'Mood Average',
      value: '7.2/10',
      change: 0,
      trend: 'stable',
      color: 'var(--gradient-peaceful)'
    },
    {
      label: 'Active Streak',
      value: '12 days',
      change: 1,
      trend: 'up',
      color: 'var(--gradient-sunset)'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'crisis-support',
      title: 'Crisis Support',
      description: 'Get immediate help when you need it most',
      icon: ShieldIcon,
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
      delay: 0
    },
    {
      id: 'peer-support',
      title: 'Peer Support',
      description: 'Connect with others who understand',
      icon: UsersIcon,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      delay: 100
    },
    {
      id: 'mood-tracker',
      title: 'Track Mood',
      description: 'Record how you\'re feeling today',
      icon: HeartIcon,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      delay: 200
    },
    {
      id: 'ai-companion',
      title: 'AI Companion',
      description: 'Chat with your supportive AI friend',
      icon: SparkleIcon,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      delay: 300
    },
    {
      id: 'reflections',
      title: 'Journal',
      description: 'Write your thoughts and reflections',
      icon: BookIcon,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      delay: 400
    },
    {
      id: 'insights',
      title: 'Insights',
      description: 'View your wellness journey',
      icon: TrendingUpIcon,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      delay: 500
    }
  ];

  const moods: MoodData[] = [
    { mood: 'Happy', emoji: '😊', color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' },
    { mood: 'Calm', emoji: '😌', color: '#87CEEB', gradient: 'linear-gradient(135deg, #87CEEB, #4682B4)' },
    { mood: 'Energetic', emoji: '⚡', color: '#FF6347', gradient: 'linear-gradient(135deg, #FF6347, #FF4500)' },
    { mood: 'Anxious', emoji: '😰', color: '#DDA0DD', gradient: 'linear-gradient(135deg, #DDA0DD, #9370DB)' },
    { mood: 'Sad', emoji: '😔', color: '#4169E1', gradient: 'linear-gradient(135deg, #4169E1, #1E90FF)' },
    { mood: 'Grateful', emoji: '🙏', color: '#98D8C8', gradient: 'linear-gradient(135deg, #98D8C8, #6BB6A5)' }
  ];

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return <SunIcon className="w-6 h-6" />;
    if (hour >= 12 && hour < 18) return <CloudIcon className="w-6 h-6" />;
    return <MoonIcon className="w-6 h-6" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="therapy-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Animated Welcome Header */}
        <div className={`glass-card mb-8 p-8 ${animateCards ? 'animate-slideIn' : 'opacity-0'}`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {getTimeIcon()}
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {timeOfDay}, {userName}!
                </h1>
              </div>
              <p className="text-gray-600 text-lg mb-2">
                Welcome back to your wellness sanctuary
              </p>
              <p className="text-sm text-gray-500">
                {currentDate}
              </p>
            </div>
            
            {/* Quick Mood Check */}
            <div className="glass-card p-4">
              <p className="text-sm text-gray-600 mb-3">How are you feeling?</p>
              <div className="flex gap-2">
                {moods.slice(0, 3).map((mood) => (
                  <button
                    key={mood.mood}
                    onClick={() => setSelectedMood(mood.mood)}
                    className={`mood-option ${selectedMood === mood.mood ? 'selected' : ''}`}
                    style={{
                      background: selectedMood === mood.mood ? mood.gradient : undefined
                    }}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {wellnessStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`wellness-stat-card ${animateCards ? 'animate-slideIn' : 'opacity-0'}`}
              style={{
                animationDelay: `${index * 100}ms`,
                background: 'white'
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: stat.color }}
                >
                  {stat.trend === 'up' && (
                    <TrendingUpIcon className="w-6 h-6 text-white" />
                  )}
                  {stat.trend === 'stable' && (
                    <ActivityIcon className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-xs text-gray-500">from last week</span>
              </div>
              
              {/* Progress bar */}
              <div className="wellness-progress mt-4">
                <div 
                  className="wellness-progress-bar"
                  style={{ 
                    width: typeof stat.value === 'string' && stat.value.includes('%') 
                      ? stat.value 
                      : '70%',
                    background: stat.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <SparkleIcon className="w-6 h-6 text-purple-600" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  className={`therapy-card group ${animateCards ? 'animate-slideIn' : 'opacity-0'}`}
                  style={{
                    animationDelay: `${action.delay}ms`
                  }}
                  onClick={() => console.log(`Navigate to ${action.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:animate-breathe"
                      style={{ background: action.gradient }}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                    
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Today's Journey
              </h3>
              
              <div className="space-y-4">
                {[
                  { time: '9:00 AM', activity: 'Morning meditation', type: 'meditation', completed: true },
                  { time: '11:30 AM', activity: 'Mood check-in', type: 'mood', completed: true },
                  { time: '2:00 PM', activity: 'Peer support session', type: 'support', completed: false },
                  { time: '6:00 PM', activity: 'Evening reflection', type: 'journal', completed: false }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      item.completed 
                        ? 'bg-green-50 border-l-4 border-green-500' 
                        : 'bg-gray-50 border-l-4 border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {item.completed ? (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                        {item.activity}
                      </p>
                      <p className="text-sm text-gray-500">{item.time}</p>
                    </div>
                    
                    {!item.completed && (
                      <button className="glass-button py-2 px-4 text-sm">
                        Start
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Wellness Tips */}
          <div>
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <SmileIcon className="w-5 h-5 text-purple-600" />
                Daily Tip
              </h3>
              
              <div className="neumorph-card">
                <div className="text-center">
                  <div className="text-4xl mb-3">🌱</div>
                  <p className="text-gray-700 mb-2 font-medium">
                    Remember to breathe
                  </p>
                  <p className="text-sm text-gray-600">
                    Take 3 deep breaths whenever you feel overwhelmed. 
                    It's a simple way to reset your nervous system.
                  </p>
                  
                  <button className="glass-button w-full mt-4">
                    Try Breathing Exercise
                  </button>
                </div>
              </div>
              
              {/* Achievements */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Recent Achievements</p>
                <div className="space-y-2">
                  {[
                    { badge: '🏆', title: '7-Day Streak' },
                    { badge: '💪', title: 'Wellness Warrior' },
                    { badge: '🌟', title: 'Mood Master' }
                  ].map((achievement, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                    >
                      <span className="text-2xl">{achievement.badge}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {achievement.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboardView;