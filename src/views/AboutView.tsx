import React from 'react';
import { HeartIcon, ShieldIcon, UsersIcon, SparkleIcon } from '../components/icons.dynamic';

const AboutView: React.FC = () => {
  const features = [
    {
      icon: HeartIcon,
      title: 'Wellness Tracking',
      description: 'Monitor your mental health with daily check-ins and mood tracking'
    },
    {
      icon: UsersIcon,
      title: 'Peer Support',
      description: 'Connect with trained helpers and supportive community members'
    },
    {
      icon: SparkleIcon,
      title: 'AI Companion',
      description: 'Get support from our intelligent mental health assistant'
    },
    {
      icon: ShieldIcon,
      title: 'Crisis Support',
      description: '24/7 access to crisis resources and emergency contacts'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            About Astral Core
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A safe, anonymous platform dedicated to mental health support and peer-to-peer care
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            Astral Core exists to provide a safe, supportive space where people can seek help, 
            share experiences, and support each other through mental health challenges. We believe 
            that everyone deserves access to mental health resources and a community that cares.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Privacy & Safety */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
            Privacy & Safety First
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                Anonymous by Design
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Your identity is protected at every level. No real names required, 
                no identifying information stored.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                Crisis Detection
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Our AI systems monitor for crisis indicators and immediately 
                connect users with appropriate resources.
              </p>
            </div>
          </div>
        </div>

        {/* Team & Values */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Our Values
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <HeartIcon className="w-12 h-12 text-pink-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Compassion
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Every interaction is guided by empathy and understanding
              </p>
            </div>
            
            <div className="text-center">
              <ShieldIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Safety
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                User safety and privacy are our highest priorities
              </p>
            </div>
            
            <div className="text-center">
              <UsersIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Together, we create a supportive network of care
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Get Help or Get Involved
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Need Immediate Help?
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>• Crisis Support: Available 24/7 in the app</p>
                <p>• National Suicide Prevention Lifeline: 988</p>
                <p>• Crisis Text Line: Text HOME to 741741</p>
                <p>• Emergency Services: 911</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Want to Help Others?
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>• Become a peer support helper</p>
                <p>• Join our volunteer crisis response team</p>
                <p>• Share your story to help others</p>
                <p>• Provide feedback to improve the platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>Astral Core v1.0.0</p>
          <p>Built with care for mental health support</p>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
