import React from 'react';
import { ShieldIcon, AlertIcon, UsersIcon } from '../components/icons.dynamic';

const ModerationView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Community Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Help keep our community safe and supportive
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertIcon className="w-8 h-8 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Pending Reports
              </h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">3</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Require review
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldIcon className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Actions Taken
              </h3>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This week
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <UsersIcon className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Community Health
              </h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">98%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Positive interactions
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Moderation Dashboard
          </h2>
          <div className="text-center py-12">
            <ShieldIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Advanced moderation tools coming soon
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Report system, AI content filtering, and community guidelines enforcement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationView;
