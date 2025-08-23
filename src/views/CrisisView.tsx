import React, { useState, useEffect } from 'react';
import { AlertIcon, PhoneIcon, MessageCircleIcon, HeartIcon, ShieldIcon } from '../components/icons.dynamic';

interface CrisisResource {
  id: string;
  name: string;
  phone: string;
  description: string;
  available24h: boolean;
}

const CrisisView: React.FC = () => {
  const [emergencyContacted, setEmergencyContacted] = useState(false);
  
  const crisisResources: CrisisResource[] = [
    {
      id: 'suicide-prevention',
      name: '988 Suicide & Crisis Lifeline',
      phone: '988',
      description: 'Free and confidential emotional support 24/7',
      available24h: true
    },
    {
      id: 'crisis-text',
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: 'Text-based crisis support',
      available24h: true
    },
    {
      id: 'emergency',
      name: 'Emergency Services',
      phone: '911',
      description: 'For immediate medical emergencies',
      available24h: true
    }
  ];

  const handleEmergencyCall = (phone: string) => {
    if (phone === '911' || phone === '988') {
      setEmergencyContacted(true);
      // In a real app, this would integrate with device calling capabilities
      window.open(`tel:${phone}`, '_self');
    } else if (phone.includes('741741')) {
      window.open('sms:741741?body=HOME', '_self');
    }
  };

  useEffect(() => {
    // Log crisis view access for safety monitoring
    console.log('Crisis view accessed at:', new Date().toISOString());
  }, []);

  return (
    <div className="min-h-screen bg-red-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Crisis Alert Header */}
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <AlertIcon className="w-8 h-8 text-red-600 dark:text-red-400 mr-3" />
            <h1 className="text-2xl font-bold text-red-800 dark:text-red-200">
              Crisis Support Resources
            </h1>
          </div>
          <p className="text-red-700 dark:text-red-300 text-lg">
            If you're experiencing a mental health crisis, you're not alone. Help is available 24/7.
          </p>
        </div>

        {/* Immediate Action Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <ShieldIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Immediate Support
            </h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {crisisResources.map((resource) => (
              <div
                key={resource.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {resource.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {resource.phone}
                  </span>
                  <button
                    onClick={() => handleEmergencyCall(resource.phone)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {resource.phone.includes('Text') ? (
                      <MessageCircleIcon className="w-4 h-4" />
                    ) : (
                      <PhoneIcon className="w-4 h-4" />
                    )}
                    {resource.phone.includes('Text') ? 'Text' : 'Call'}
                  </button>
                </div>
                {resource.available24h && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ✓ Available 24/7
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Planning */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <HeartIcon className="w-6 h-6 text-pink-600 dark:text-pink-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Safety & Coping Strategies
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Immediate Coping Techniques
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Take slow, deep breaths</li>
                <li>• Ground yourself - notice 5 things you can see, 4 you can touch, 3 you can hear</li>
                <li>• Call a trusted friend or family member</li>
                <li>• Remove yourself from harmful situations</li>
                <li>• Use ice or cold water on your face/hands</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                When to Seek Emergency Help
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Thoughts of hurting yourself or others</li>
                <li>• Unable to care for yourself</li>
                <li>• Severe panic or anxiety attacks</li>
                <li>• Hearing voices or seeing things</li>
                <li>• Feeling completely hopeless</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Follow-up Resources */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
            Follow-up Support
          </h2>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            After the immediate crisis passes, consider these ongoing support options:
          </p>
          <ul className="space-y-2 text-blue-600 dark:text-blue-400">
            <li>• Schedule an appointment with a mental health professional</li>
            <li>• Contact your primary care doctor</li>
            <li>• Join a support group in your area</li>
            <li>• Use the Astral Core wellness tracking features</li>
            <li>• Create a safety plan with your support network</li>
          </ul>
        </div>

        {emergencyContacted && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
            Help is on the way. Stay safe.
          </div>
        )}
      </div>
    </div>
  );
};

export default CrisisView;
