#!/usr/bin/env node

/**
 * Emergency fix script for critical syntax errors preventing Netlify deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// List of critically corrupted files that need to be replaced with minimal versions
const criticalFiles = [
  'src/views/LandingView.tsx',
  'netlify/functions/analytics.ts'
];

// Simple working LandingView component
const workingLandingView = `import React from 'react';
import { Link } from 'react-router-dom';

const LandingView: React.FC = () => {
  return (
    <div className="landing-view min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            You're Not Alone
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            A safe, anonymous space for mental health support, crisis help, and healing.
            Available 24/7, completely free, and always here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/crisis"
              className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚨 Get Crisis Help Now
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Your Journey
            </Link>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
            <p className="text-sm text-gray-600 mb-3">If you're in immediate danger:</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="tel:988" className="flex items-center gap-2 text-red-600 font-bold hover:underline">
                <span>📞</span> Call 988 (Crisis Lifeline)
              </a>
              <a href="sms:741741" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                <span>💬</span> Text HOME to 741741
              </a>
              <a href="tel:911" className="flex items-center gap-2 text-gray-700 font-bold hover:underline">
                <span>🚑</span> Call 911 (Emergency)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingView;
`;

console.log('🚨 Running emergency fixes for Netlify deployment...\n');

// Fix LandingView.tsx
const landingViewPath = path.join(rootDir, 'src/views/LandingView.tsx');
try {
  fs.writeFileSync(landingViewPath, workingLandingView);
  console.log('✅ Fixed src/views/LandingView.tsx');
} catch (error) {
  console.error('❌ Failed to fix LandingView.tsx:', error.message);
}

// Check if analytics.ts exists and remove it (we already have analytics.js)
const analyticsPath = path.join(rootDir, 'netlify/functions/analytics.ts');
if (fs.existsSync(analyticsPath)) {
  try {
    fs.unlinkSync(analyticsPath);
    console.log('✅ Removed corrupted netlify/functions/analytics.ts');
  } catch (error) {
    console.error('❌ Failed to remove analytics.ts:', error.message);
  }
}

console.log('\n✅ Emergency fixes applied!');
console.log('📦 Ready to push to GitHub for Netlify deployment.');


/**
 * Emergency fix script for critical syntax errors preventing Netlify deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// List of critically corrupted files that need to be replaced with minimal versions
const criticalFiles = [
  'src/views/LandingView.tsx',
  'netlify/functions/analytics.ts'
];

// Simple working LandingView component
const workingLandingView = `import React from 'react';
import { Link } from 'react-router-dom';

const LandingView: React.FC = () => {
  return (
    <div className="landing-view min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            You're Not Alone
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            A safe, anonymous space for mental health support, crisis help, and healing.
            Available 24/7, completely free, and always here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/crisis"
              className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚨 Get Crisis Help Now
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Your Journey
            </Link>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
            <p className="text-sm text-gray-600 mb-3">If you're in immediate danger:</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="tel:988" className="flex items-center gap-2 text-red-600 font-bold hover:underline">
                <span>📞</span> Call 988 (Crisis Lifeline)
              </a>
              <a href="sms:741741" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                <span>💬</span> Text HOME to 741741
              </a>
              <a href="tel:911" className="flex items-center gap-2 text-gray-700 font-bold hover:underline">
                <span>🚑</span> Call 911 (Emergency)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingView;
`;

console.log('🚨 Running emergency fixes for Netlify deployment...\n');

// Fix LandingView.tsx
const landingViewPath = path.join(rootDir, 'src/views/LandingView.tsx');
try {
  fs.writeFileSync(landingViewPath, workingLandingView);
  console.log('✅ Fixed src/views/LandingView.tsx');
} catch (error) {
  console.error('❌ Failed to fix LandingView.tsx:', error.message);
}

// Check if analytics.ts exists and remove it (we already have analytics.js)
const analyticsPath = path.join(rootDir, 'netlify/functions/analytics.ts');
if (fs.existsSync(analyticsPath)) {
  try {
    fs.unlinkSync(analyticsPath);
    console.log('✅ Removed corrupted netlify/functions/analytics.ts');
  } catch (error) {
    console.error('❌ Failed to remove analytics.ts:', error.message);
  }
}

console.log('\n✅ Emergency fixes applied!');
console.log('📦 Ready to push to GitHub for Netlify deployment.');
