import React from 'react';
import { TrendingUpIcon, HeartIcon, UsersIcon } from '../components/icons.dynamic';

const AnalyticsView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your Wellness Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track your mental health progress and insights
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUpIcon className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Mood Trend
              </h3>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">↗ Improving</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              7.2/10 average this week
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HeartIcon className="w-8 h-8 text-pink-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Check-in Streak
              </h3>
            </div>
            <p className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">14 days</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personal best: 21 days
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <UsersIcon className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Support Given
              </h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">8 people</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Weekly Progress
          </h2>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Analytics charts coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
