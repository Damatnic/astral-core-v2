import React, { useState, useEffect } from 'react';
import ChatView from '../views/ChatView';
import { useAuth } from '../contexts/AuthContext';
import { ChatSession, Dilemma } from '../types';

/**
 * Route wrapper for ChatView that provides default props
 * This handles the routing requirements while maintaining component reusability
 */
const ChatRoute: React.FC = () => {
  const { user } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [dilemma, setDilemma] = useState<Dilemma | null>(null);

  useEffect(() => {
    // Create a default session if none exists
    // In a real implementation, this would fetch from API or context
    if (!session && user) {
      const defaultSession: ChatSession = {
        dilemmaId: `dilemma-${Date.now()}`,
        messages: [],
        unread: false,
        isTyping: false,
        perspective: 'seeker',
        helpSessionId: undefined,
        helper: undefined
      };
      setSession(defaultSession);
    }
  }, [user, session]);

  useEffect(() => {
    // Create a default dilemma or fetch from context/API
    if (!dilemma) {
      const defaultDilemma: Dilemma = {
        id: `dilemma-${Date.now()}`,
        content: 'General support conversation',
        category: 'general',
        timestamp: new Date().toISOString(),
        userToken: user?.sub || '',
        supportCount: 0,
        isSupported: false,
        isReported: false,
        reportReason: '',
        status: 'active',
        assignedHelperId: undefined,
        resolved_by_seeker: false,
        requestedHelperId: undefined,
        summary: undefined,
        summaryLoading: false,
        moderation: undefined,
        aiMatchReason: undefined
      };
      setDilemma(defaultDilemma);
    }
  }, [dilemma, user]);

  const handleViewHelperProfile = (helperId: string) => {
    console.log('Viewing helper profile:', helperId);
    // Handle navigation to helper profile
    // In a real implementation, this would navigate to /helper/profile/${helperId}
  };

  if (!session || !dilemma) {
    return <div>Loading chat...</div>;
  }

  return (
    <ChatView
      session={session}
      dilemma={dilemma}
      onViewHelperProfile={handleViewHelperProfile}
    />
  );
};

export default ChatRoute;
