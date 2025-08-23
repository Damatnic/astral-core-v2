import React, { useState, useEffect } from 'react';

// Custom SVG Icon Components
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// Date utility functions
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  });
};

const getMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  return result;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Types for anonymous group sessions
interface AnonymousSession {
  id: string;
  title: string;
  description: string;
  scheduledTime: Date;
  duration: number; // minutes
  maxParticipants: number;
  currentParticipants: number;
  facilitatorAlias: string; // Anonymous facilitator name
  sessionType: 'support' | 'therapy' | 'wellness' | 'crisis-followup';
  isJoined: boolean;
  anonymousToken?: string; // For joining without identity exposure
  requiresVerification: boolean; // For crisis follow-up sessions
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  sessions: AnonymousSession[];
}

const GroupSessionView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<AnonymousSession[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<Set<string>>(new Set());
  const [showAnonymousProfile, setShowAnonymousProfile] = useState(false);
  const [anonymousAlias, setAnonymousAlias] = useState('');
  const [loading, setLoading] = useState(true);

  // Generate anonymous alias on component mount
  useEffect(() => {
    if (!anonymousAlias) {
      generateAnonymousAlias();
    }
    loadGroupSessions();
  }, []);

  const generateAnonymousAlias = () => {
    const adjectives = ['Calm', 'Peaceful', 'Strong', 'Brave', 'Kind', 'Gentle', 'Wise', 'Bright'];
    const nouns = ['River', 'Mountain', 'Star', 'Ocean', 'Forest', 'Dawn', 'Light', 'Garden'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999);
    setAnonymousAlias(`${randomAdjective}${randomNoun}${randomNumber}`);
  };

  const loadGroupSessions = async () => {
    try {
      setLoading(true);
      // Simulate API call - in real implementation, this would fetch from backend
      const mockSessions: AnonymousSession[] = [
        {
          id: 'session-1',
          title: 'Morning Support Circle',
          description: 'A safe space to share and support each other through daily challenges',
          scheduledTime: addDays(new Date(), 1),
          duration: 60,
          maxParticipants: 8,
          currentParticipants: 5,
          facilitatorAlias: 'GuideLight42',
          sessionType: 'support',
          isJoined: false,
          requiresVerification: false
        },
        {
          id: 'session-2',
          title: 'Anxiety Management Workshop',
          description: 'Learn and practice coping strategies for managing anxiety',
          scheduledTime: addDays(new Date(), 3),
          duration: 90,
          maxParticipants: 6,
          currentParticipants: 3,
          facilitatorAlias: 'CalmWaters',
          sessionType: 'therapy',
          isJoined: false,
          requiresVerification: true
        },
        {
          id: 'session-3',
          title: 'Wellness Wednesday',
          description: 'Focus on self-care practices and mindfulness exercises',
          scheduledTime: addDays(new Date(), 5),
          duration: 45,
          maxParticipants: 12,
          currentParticipants: 7,
          facilitatorAlias: 'SereneForest',
          sessionType: 'wellness',
          isJoined: false,
          requiresVerification: false
        }
      ];
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load group sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (session: AnonymousSession) => {
    if (!anonymousAlias.trim()) {
      alert('Please set your anonymous alias first');
      return;
    }

    try {
      // Simulate API call
      // Joining session anonymously
      
      // Update local state
      setJoinedSessions(prev => new Set([...prev, session.id]));
      
      // Update session participant count
      setSessions(prev => prev.map(s => 
        s.id === session.id 
          ? { ...s, currentParticipants: s.currentParticipants + 1, isJoined: true }
          : s
      ));

      alert(`Successfully joined "${session.title}" as ${anonymousAlias}`);
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session. Please try again.');
    }
  };

  const leaveSession = async (sessionId: string) => {
    try {
      // Simulate API call
      // Leaving session
      
      // Update local state
      setJoinedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
      
      // Update session participant count
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, currentParticipants: Math.max(0, s.currentParticipants - 1), isJoined: false }
          : s
      ));

    } catch (error) {
      console.error('Failed to leave session:', error);
      alert('Failed to leave session. Please try again.');
    }
  };

  const getSessionTypeColor = (type: AnonymousSession['sessionType']) => {
    switch (type) {
      case 'support': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'therapy': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'wellness': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'crisis-followup': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const startDate = startOfWeek(currentDate);
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 42; i++) { // 6 weeks
      const date = addDays(startDate, i);
      const daySessions = sessions.filter(session => 
        isSameDay(session.scheduledTime, date)
      );
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        sessions: daySessions
      });
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading group sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Anonymous Group Sessions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Join supportive group sessions while maintaining complete anonymity
              </p>
            </div>
            
            {/* Anonymous Profile Section */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ShieldIcon />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {anonymousAlias}
                  </span>
                  <button
                    onClick={() => setShowAnonymousProfile(!showAnonymousProfile)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    aria-label={showAnonymousProfile ? "Hide profile" : "Show profile"}
                  >
                    {showAnonymousProfile ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              
              <button
                onClick={generateAnonymousAlias}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
              >
                New Alias
              </button>
            </div>
          </div>
          
          {/* Privacy Notice */}
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ShieldIcon />
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Your Privacy is Protected
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  All sessions use anonymous aliases. Your real identity is never shared with other participants. 
                  Facilitators are verified professionals who respect anonymity protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar View */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Session Calendar
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentDate(addWeeks(currentDate, -1))}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Previous week"
                  >
                    ←
                  </button>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getMonthYear(currentDate)}
                  </span>
                  <button
                    onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Next week"
                  >
                    →
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => (
                  <button
                    key={`${day.date.toISOString()}-${index}`}
                    className={`p-2 min-h-[60px] border border-gray-100 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-left ${
                      !day.isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                    }`}
                    onClick={() => {/* Date selected */}}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        // Date selected
                      }
                    }}
                    aria-label={`${formatDate(day.date)} - ${day.sessions.length} sessions`}
                  >
                    <div className="text-sm">{day.date.getDate()}</div>
                    {day.sessions.length > 0 && (
                      <div className="text-xs mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Upcoming Sessions
              </h2>
              
              <div className="space-y-4">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {session.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSessionTypeColor(session.sessionType)}`}>
                            {session.sessionType}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {session.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon />
                            <span>{formatDate(session.scheduledTime)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon />
                            <span>{formatTime(session.scheduledTime)} ({session.duration}m)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UsersIcon />
                            <span>{session.currentParticipants}/{session.maxParticipants}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Facilitated by: <span className="font-medium">{session.facilitatorAlias}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {joinedSessions.has(session.id) ? (
                          <button
                            onClick={() => leaveSession(session.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 text-sm font-medium"
                          >
                            Leave
                          </button>
                        ) : (
                          <button
                            onClick={() => joinSession(session)}
                            disabled={session.currentParticipants >= session.maxParticipants}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              session.currentParticipants >= session.maxParticipants
                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                            }`}
                          >
                            {session.currentParticipants >= session.maxParticipants ? 'Full' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSessionView;
