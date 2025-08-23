import React from 'react';
import { HeartIcon, MessageCircleIcon, ShieldIcon, BookIcon } from '../components/icons.dynamic';

const HelpView: React.FC = () => {
  const helpSections = [
    {
      title: 'Getting Started',
      icon: HeartIcon,
      topics: [
        'Creating your anonymous profile',
        'Taking your first wellness check-in',
        'Understanding safety features',
        'Navigating the community'
      ]
    },
    {
      title: 'Community Support',
      icon: MessageCircleIcon,
      topics: [
        'How to find peer helpers',
        'Posting in community feed',
        'Joining support groups',
        'Giving support to others'
      ]
    },
    {
      title: 'Crisis Resources',
      icon: ShieldIcon,
      topics: [
        'When to use crisis support',
        'Emergency contact numbers',
        'Safety planning basics',
        'Getting immediate help'
      ]
    },
    {
      title: 'Privacy & Safety',
      icon: BookIcon,
      topics: [
        'How we protect your identity',
        'Managing your privacy settings',
        'Reporting inappropriate content',
        'Understanding our safety features'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Help & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Find answers and learn how to make the most of Astral Core
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <button className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-left hover:shadow-md transition-shadow">
            <ShieldIcon className="w-8 h-8 text-red-600 dark:text-red-400 mb-3" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Crisis Support
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Get immediate help and crisis resources
            </p>
          </button>
          
          <button className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-left hover:shadow-md transition-shadow">
            <MessageCircleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Contact Support
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Get help with technical issues
            </p>
          </button>
          
          <button className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-left hover:shadow-md transition-shadow">
            <BookIcon className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              User Guide
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Learn how to use all features
            </p>
          </button>
        </div>

        {/* Help Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {helpSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div key={section.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h3>
                </div>
                
                <ul className="space-y-2">
                  {section.topics.map((topic) => (
                    <li key={topic}>
                      <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm text-left transition-colors">
                        • {topic}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Is Astral Core really anonymous?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, we're designed with privacy first. No real names required, no identifying 
                information stored, and all conversations are encrypted.
              </p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                What happens if I'm in crisis?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Our AI monitors for crisis indicators and will immediately offer resources. 
                You can also access 24/7 crisis support at any time through the crisis button.
              </p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                How are peer helpers trained?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All peer helpers complete mental health first aid training and ongoing education. 
                They're volunteers with lived experience who want to help others.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
            Emergency Resources
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-red-700 dark:text-red-300 font-medium">
                Suicide & Crisis Lifeline
              </p>
              <p className="text-red-600 dark:text-red-400 text-lg font-bold">988</p>
            </div>
            <div>
              <p className="text-red-700 dark:text-red-300 font-medium">
                Crisis Text Line
              </p>
              <p className="text-red-600 dark:text-red-400 text-lg font-bold">Text HOME to 741741</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
