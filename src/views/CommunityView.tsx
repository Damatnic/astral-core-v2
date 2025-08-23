import React, { useState, useEffect } from 'react';
import { UsersIcon, HeartIcon, MessageCircleIcon, StarIcon, ShieldIcon, PlusIcon } from '../components/icons.dynamic';

interface CommunityPost {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  responses: number;
  isAnonymous: boolean;
  category: 'support' | 'celebration' | 'question' | 'resource';
  isCrisisSupport?: boolean;
}

interface CommunityHelper {
  id: string;
  name: string;
  expertise: string[];
  rating: number;
  helpedCount: number;
  isOnline: boolean;
  isCertified: boolean;
}

const CommunityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'helpers' | 'groups'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [helpers, setHelpers] = useState<CommunityHelper[]>([]);

  useEffect(() => {
    // Mock data - in real app this would come from API
    setPosts([
      {
        id: '1',
        author: 'Anonymous Friend',
        content: 'Had a really tough day but managed to use some breathing techniques I learned here. Small wins count too! 💙',
        timestamp: '2 hours ago',
        likes: 12,
        responses: 3,
        isAnonymous: true,
        category: 'celebration'
      },
      {
        id: '2',
        author: 'MindfulMoments',
        content: 'Does anyone have tips for managing anxiety at work? I\'ve been struggling with presentations lately.',
        timestamp: '4 hours ago',
        likes: 8,
        responses: 7,
        isAnonymous: false,
        category: 'question'
      },
      {
        id: '3',
        author: 'HealingJourney',
        content: 'Sharing this article about mindfulness techniques that really helped me: [link would be here]',
        timestamp: '6 hours ago',
        likes: 15,
        responses: 2,
        isAnonymous: false,
        category: 'resource'
      }
    ]);

    setHelpers([
      {
        id: '1',
        name: 'Sarah M.',
        expertise: ['Anxiety', 'Mindfulness', 'Work Stress'],
        rating: 4.9,
        helpedCount: 127,
        isOnline: true,
        isCertified: true
      },
      {
        id: '2',
        name: 'Alex R.',
        expertise: ['Depression', 'Life Transitions', 'LGBTQ+ Support'],
        rating: 4.8,
        helpedCount: 89,
        isOnline: false,
        isCertified: true
      },
      {
        id: '3',
        name: 'Jordan T.',
        expertise: ['Students', 'Academic Stress', 'Social Anxiety'],
        rating: 4.7,
        helpedCount: 64,
        isOnline: true,
        isCertified: false
      }
    ]);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors = {
      support: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
      celebration: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
      question: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
      resource: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[category as keyof typeof colors] || colors.support;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      support: 'Support',
      celebration: 'Celebration',
      question: 'Question',
      resource: 'Resource'
    };
    return labels[category as keyof typeof labels] || 'Support';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Community Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Connect with others on their mental health journey
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <UsersIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,247</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <HeartIcon className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">89</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Certified Helpers</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <MessageCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3,456</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Conversations</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <ShieldIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">24/7</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Crisis Support</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'feed'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('feed')}
            >
              Community Feed
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'helpers'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('helpers')}
            >
              Find Helpers
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'groups'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('groups')}
            >
              Support Groups
            </button>
          </div>
        </div>

        {/* Community Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Create Post */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">You</span>
                </div>
                <button className="flex-1 text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Share your thoughts, ask for support, or celebrate a win...
                </button>
                <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                      {post.author.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {post.author}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {post.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <button className="flex items-center space-x-1 hover:text-pink-500 transition-colors">
                        <HeartIcon className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                        <MessageCircleIcon className="w-4 h-4" />
                        <span>{post.responses}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helpers Tab */}
        {activeTab === 'helpers' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {helpers.map((helper) => (
              <div key={helper.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">
                        {helper.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {helper.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {helper.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {helper.helpedCount} helped
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    {helper.isCertified && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                        Certified
                      </span>
                    )}
                    <div className={`w-3 h-3 rounded-full ${
                      helper.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Specializes in:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {helper.expertise.map((skill) => (
                      <span
                        key={`${helper.id}-${skill}`}
                        className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Support Groups Tab */}
        {activeTab === 'groups' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Anxiety Support Circle
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                A safe space to share experiences and coping strategies for anxiety management.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>47 members • Daily check-ins</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Join Group
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Student Mental Health
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Support for students dealing with academic stress, transitions, and campus life.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>23 members • Weekly sessions</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Join Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Support Banner */}
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Crisis Support Available
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  If you're in crisis, trained counselors are available 24/7
                </p>
              </div>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Get Crisis Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
