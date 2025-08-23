import React, { useState, useEffect } from 'react';
import { AIChatMessage } from '../types';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { 
  HistoryIcon, 
  TrashIcon, 
  DownloadIcon, 
  SearchIcon,
  FilterIcon,
  ChevronRightIcon
} from './icons.dynamic';
import './AIChatHistory.css';

interface ChatSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  messages: AIChatMessage[];
  summary?: string;
  tags?: string[];
  crisisFlags?: number;
}

interface AIChatHistoryProps {
  userId: string;
  onSelectSession?: (session: ChatSession) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const AIChatHistory: React.FC<AIChatHistoryProps> = ({
  userId,
  onSelectSession,
  onDeleteSession
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    loadSessions();
  }, [userId]);
  
  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, filterTag]);
  
  const loadSessions = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage for demo (replace with API call in production)
      const storedSessions = localStorage.getItem(`chat_sessions_${userId}`);
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        setSessions(parsed);
      } else {
        // Create demo sessions
        const demoSessions: ChatSession[] = [
          {
            id: 'session-1',
            userId,
            startTime: new Date(Date.now() - 86400000).toISOString(),
            endTime: new Date(Date.now() - 85000000).toISOString(),
            messages: [
              {
                id: '1',
                sender: 'user',
                text: "I've been feeling anxious lately",
                timestamp: new Date(Date.now() - 86400000).toISOString()
              },
              {
                id: '2',
                sender: 'ai',
                text: "I understand that anxiety can be really challenging. Would you like to talk about what's been causing these feelings?",
                timestamp: new Date(Date.now() - 86300000).toISOString()
              }
            ],
            summary: 'Discussion about anxiety management',
            tags: ['anxiety', 'coping'],
            crisisFlags: 0
          },
          {
            id: 'session-2',
            userId,
            startTime: new Date(Date.now() - 172800000).toISOString(),
            endTime: new Date(Date.now() - 171000000).toISOString(),
            messages: [
              {
                id: '3',
                sender: 'user',
                text: "I need help with stress management",
                timestamp: new Date(Date.now() - 172800000).toISOString()
              },
              {
                id: '4',
                sender: 'ai',
                text: "I'm here to help you with stress management. Let's explore some techniques that might work for you.",
                timestamp: new Date(Date.now() - 172700000).toISOString()
              }
            ],
            summary: 'Stress management techniques',
            tags: ['stress', 'mindfulness'],
            crisisFlags: 0
          }
        ];
        setSessions(demoSessions);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterSessions = () => {
    let filtered = [...sessions];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        session.messages.some(msg => 
          msg.text.toLowerCase().includes(query)
        ) ||
        session.summary?.toLowerCase().includes(query) ||
        session.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Tag filter
    if (filterTag) {
      filtered = filtered.filter(session => 
        session.tags?.includes(filterTag)
      );
    }
    
    // Sort by most recent
    filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    
    setFilteredSessions(filtered);
  };
  
  const handleSelectSession = (session: ChatSession) => {
    setSelectedSessionId(session.id);
    onSelectSession?.(session);
  };
  
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    
    try {
      // Remove from state
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      // Update localStorage
      localStorage.setItem(`chat_sessions_${userId}`, JSON.stringify(updatedSessions));
      
      onDeleteSession?.(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };
  
  const exportSession = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const content = {
      session: {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        summary: session.summary,
        tags: session.tags
      },
      messages: session.messages
    };
    
    const blob = new Blob([JSON.stringify(content, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-session-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    sessions.forEach(session => {
      session.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };
  
  if (isLoading) {
    return (
      <div className="ai-chat-history loading">
        <div className="history-loading-spinner"></div>
        <p>Loading conversation history...</p>
      </div>
    );
  }
  
  return (
    <div className="ai-chat-history">
      <div className="history-header">
        <h3>
          <HistoryIcon /> Conversation History
        </h3>
        <span className="history-count">{sessions.length} sessions</span>
      </div>
      
      <div className="history-controls">
        <div className="history-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="history-filters">
          <FilterIcon />
          <select 
            value={filterTag || ''} 
            onChange={(e) => setFilterTag(e.target.value || null)}
          >
            <option value="">All tags</option>
            {getAllTags().map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="history-empty">
          <HistoryIcon />
          <p>No conversations found</p>
          {searchQuery || filterTag ? (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setFilterTag(null);
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="history-sessions">
          {filteredSessions.map(session => (
            <div 
              key={session.id}
              className={`history-session ${selectedSessionId === session.id ? 'selected' : ''}`}
              onClick={() => handleSelectSession(session)}
            >
              <div className="session-header">
                <div className="session-info">
                  <span className="session-time">
                    {formatTimeAgo(session.startTime)}
                  </span>
                  {session.crisisFlags && session.crisisFlags > 0 && (
                    <span className="session-crisis-badge">
                      Crisis detected
                    </span>
                  )}
                </div>
                <div className="session-actions">
                  <button 
                    className="session-action-btn"
                    onClick={(e) => exportSession(session, e)}
                    aria-label="Export session"
                  >
                    <DownloadIcon />
                  </button>
                  <button 
                    className="session-action-btn delete"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    aria-label="Delete session"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
              
              {session.summary && (
                <p className="session-summary">{session.summary}</p>
              )}
              
              <div className="session-preview">
                {session.messages.slice(0, 2).map((msg, idx) => (
                  <div key={idx} className={`preview-message ${msg.sender}`}>
                    <span className="preview-sender">
                      {msg.sender === 'user' ? 'You' : 'AI'}:
                    </span>
                    <span className="preview-text">
                      {msg.text.length > 100 ? 
                        msg.text.substring(0, 100) + '...' : 
                        msg.text
                      }
                    </span>
                  </div>
                ))}
              </div>
              
              {session.tags && session.tags.length > 0 && (
                <div className="session-tags">
                  {session.tags.map(tag => (
                    <span key={tag} className="session-tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="session-footer">
                <span className="session-message-count">
                  {session.messages.length} messages
                </span>
                <ChevronRightIcon />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIChatHistory;