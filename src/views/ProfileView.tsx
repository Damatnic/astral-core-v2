import React, { useState } from 'react';
import { HeartIcon, ShieldIcon, UsersIcon, BookIcon, StarIcon } from '../components/icons.dynamic';

const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'privacy' | 'preferences'>('overview');

  // Mock user data
  const userData = {
    name: 'Anonymous User',
    joinDate: 'March 2024',
    streak: 14,
    checkIns: 42,
    connectionsHelped: 8,
    badgesEarned: 5,
    privacy: {
      profileVisibility: 'anonymous',
      shareProgress: false,
      crisisContacts: ['Emergency Contact 1', 'Family Member']
    },
    preferences: {
      notifications: true,
      reminders: true,
      darkMode: false,
      language: 'English'
    }
  };

  const badges = [
    { id: '1', name: 'First Check-in', description: 'Completed your first wellness check-in', earned: true },
    { id: '2', name: 'Week Warrior', description: 'Maintained a 7-day check-in streak', earned: true },
    { id: '3', name: 'Helper Hand', description: 'Provided support to 5 community members', earned: true },
    { id: '4', name: 'Reflection Master', description: 'Completed 10 journal entries', earned: false },
    { id: '5', name: 'Crisis Advocate', description: 'Completed crisis safety planning', earned: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">AU</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {userData.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Member since {userData.joinDate}
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <HeartIcon className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {userData.streak} day streak
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {userData.badgesEarned} badges earned
                  </span>
                </div>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <HeartIcon className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.checkIns}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Check-ins</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <UsersIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.connectionsHelped}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">People Helped</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <BookIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Journal Entries</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <ShieldIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Safe</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Safety Plan</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'privacy'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy & Safety
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'preferences'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Achievements & Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Achievements & Badges
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border ${
                      badge.earned
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        badge.earned
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-400'
                      }`}>
                        <StarIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          badge.earned
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {badge.name}
                        </h3>
                        <p className={`text-sm ${
                          badge.earned
                            ? 'text-gray-600 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {badge.description}
                        </p>
                      </div>
                      {badge.earned && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                          Earned
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <HeartIcon className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Completed wellness check-in
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Today, 9:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <UsersIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Helped a community member
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Yesterday, 3:15 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BookIcon className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Added new journal reflection
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">2 days ago, 7:45 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Privacy & Safety Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Profile Visibility
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="anonymous"
                      defaultChecked
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Anonymous - Your identity is completely protected
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="pseudonym"
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Pseudonym - Use a chosen username
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Crisis Contacts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  People who can be contacted in case of emergency
                </p>
                <div className="space-y-2">
                  {userData.privacy.crisisContacts.map((contact) => (
                    <div key={contact} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-900 dark:text-gray-100">{contact}</span>
                      <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                    </div>
                  ))}
                  <button className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                    + Add Crisis Contact
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Data & Privacy
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Share progress with community helpers
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={userData.privacy.shareProgress}
                      className="toggle"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Allow anonymous usage analytics
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              App Preferences
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Notifications
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Daily check-in reminders
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={userData.preferences.reminders}
                      className="toggle"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Community support notifications
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={userData.preferences.notifications}
                      className="toggle"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Crisis alert notifications
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Appearance
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Dark mode
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={userData.preferences.darkMode}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Language & Region
                </h3>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
