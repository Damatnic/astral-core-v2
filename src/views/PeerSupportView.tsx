import React, { useState, useEffect } from 'react';
import { ViewHeader } from '../components/ViewHeader';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { UsersIcon, HeartIcon, MessageCircleIcon, StarIcon, ShieldIcon  } from '../components/icons.dynamic';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface PeerMatch {
  id: string;
  userToken: string;
  displayName: string;
  bio: string;
  interests: string[];
  matchScore: number;
  isOnline: boolean;
  lastActive: string;
}

export const PeerSupportView: React.FC<{ userToken?: string | null }> = ({ userToken: propUserToken }) => {
    const { userToken: contextUserToken } = useAuth();
    const userToken = propUserToken ?? contextUserToken;
  const [matches, setMatches] = useState<PeerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_selectedMatch, setSelectedMatch] = useState<PeerMatch | null>(null);
  const { addToast } = useNotification();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      // For now, using mock data
      const mockMatches: PeerMatch[] = [
        {
          id: '1',
          userToken: 'peer-1',
          displayName: 'Alex',
          bio: 'Here to listen and share experiences about anxiety and stress management.',
          interests: ['Anxiety', 'Stress', 'Mindfulness'],
          matchScore: 0.95,
          isOnline: true,
          lastActive: new Date().toISOString()
        },
        {
          id: '2',
          userToken: 'peer-2',
          displayName: 'Jordan',
          bio: 'Recovered from depression and want to help others on their journey.',
          interests: ['Depression', 'Recovery', 'Self-care'],
          matchScore: 0.87,
          isOnline: false,
          lastActive: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          userToken: 'peer-3',
          displayName: 'Sam',
          bio: 'Passionate about mental health awareness and breaking stigmas.',
          interests: ['Mental Health', 'Support Groups', 'Wellness'],
          matchScore: 0.82,
          isOnline: true,
          lastActive: new Date().toISOString()
        }
      ];
      setMatches(mockMatches);
    } catch (error) {
      console.error('Failed to load peer matches:', error);
      addToast('Failed to load peer matches', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWithPeer = async (peer: PeerMatch) => {
    try {
      addToast(`Connecting with ${peer.displayName}...`, 'info');
      
      // Send connection request to the peer
      const response = await fetch('/api/peer-support/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          peerId: peer.id,
          message: `Hi ${peer.displayName}, I'd like to connect with you for peer support.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedMatch(peer);
        addToast(`Connected with ${peer.displayName}!`, 'success');
        
        // Store connection details for chat/tether features
        sessionStorage.setItem('activePeerConnection', JSON.stringify({
          peer,
          connectionId: data.connectionId,
          timestamp: new Date().toISOString()
        }));
      } else {
        throw new Error('Connection request failed');
      }
    } catch (error) {
      console.error('Failed to connect with peer:', error);
      addToast('Failed to connect with peer', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="peer-support-view">
        <ViewHeader
          title="Peer Support"
          subtitle="Connect with others who understand your journey"
        />
        <div className="loading-spinner" style={{ margin: '3rem auto' }}></div>
      </div>
    );
  }

  return (
    <div className="peer-support-view">
      <ViewHeader
        title="Peer Support"
        subtitle="Connect with others who understand your journey"
      />

      <div className="peer-support-content">
        {/* Safety Notice */}
        <Card className="safety-notice">
          <div className="safety-notice-header">
            <ShieldIcon />
            <h3>Peer Support Guidelines</h3>
          </div>
          <ul className="safety-guidelines">
            <li>Peers are not professional therapists or counselors</li>
            <li>Share only what you're comfortable sharing</li>
            <li>Respect boundaries and privacy</li>
            <li>Report any inappropriate behavior</li>
            <li>For crisis support, use "Get Help Now" resources</li>
          </ul>
        </Card>

        {/* Peer Matches */}
        <div className="peer-matches-section">
          <h2>Suggested Peers</h2>
          {matches.length === 0 ? (
            <EmptyState
              icon={<UsersIcon />}
              title="No matches available"
              message="Check back later for new peer connections"
            />
          ) : (
            <div className="peer-matches-grid">
              {matches.map(peer => (
                <Card key={peer.id} className="peer-match-card">
                  <div className="peer-match-header">
                    <div className="peer-avatar">
                      <UsersIcon />
                      {peer.isOnline && <span className="online-indicator"></span>}
                    </div>
                    <div className="peer-info">
                      <h3>{peer.displayName}</h3>
                      <p className="peer-status">
                        {peer.isOnline ? 'Online now' : `Last seen ${new Date(peer.lastActive).toLocaleTimeString()}`}
                      </p>
                    </div>
                    <div className="match-score">
                      <StarIcon />
                      <span>{Math.round(peer.matchScore * 100)}% match</span>
                    </div>
                  </div>
                  
                  <p className="peer-bio">{peer.bio}</p>
                  
                  <div className="peer-interests">
                    {peer.interests.map(interest => (
                      <span key={interest} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                  
                  <div className="peer-actions">
                    <AppButton
                      onClick={() => connectWithPeer(peer)}
                      variant="primary"
                      size="sm"
                      disabled={!peer.isOnline}
                    >
                      <MessageCircleIcon />
                      {peer.isOnline ? 'Connect Now' : 'Offline'}
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="sm"
                      onClick={() => console.log('Saving peer:', peer.id)}
                    >
                      <HeartIcon />
                      Save
                    </AppButton>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Active Connections */}
        <div className="active-connections-section">
          <h2>Your Connections</h2>
          <EmptyState
            icon={<MessageCircleIcon />}
            title="No active connections"
            message="Connect with a peer to start supporting each other"
          />
        </div>
      </div>
    </div>
  );
};

export default PeerSupportView;