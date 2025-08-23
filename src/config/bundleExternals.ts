// Bundle Externals Configuration
// Prevents heavy server-side dependencies from being included in browser bundle

// Dependencies that should be excluded from browser bundle
export const browserExternals = [
  // Database clients (should be server-side only)
  'pg',
  'pg-connection-string',
  'pgpass',
  'postgres-bytea',
  'postgres-array',
  'postgres-date',
  'postgres-interval',
  
  // Redis clients
  'redis',
  '@redis/client',
  '@redis/graph',
  '@redis/json',
  '@redis/search',
  '@redis/time-series',
  
  // Memcached
  'memjs',
  
  // Node.js specific modules
  'fs',
  'path',
  'os',
  'crypto',
  'net',
  'tls',
  'dns',
  'stream',
  'buffer',
  'url',
  'querystring',
  'util',
  
  // Heavy AI/ML libraries (will be lazy loaded)
  // Keep core modules available but exclude heavy ones
  'natural/lib/natural/classifiers',
  'natural/lib/natural/brill_pos_tagger',
  'natural/lib/natural/wordnet',
  
  // Server-side utilities
  'dotenv',
  'bcrypt',
  'jsonwebtoken',
  'nodemailer',
  
  // Test utilities (should not be in production bundle)
  'jest',
  '@testing-library',
  'vitest'
];

// Conditional externals based on environment
export const getConditionalExternals = (isDevelopment: boolean) => {
  const baseExternals = [...browserExternals];
  
  if (!isDevelopment) {
    // Add development-only externals in production
    baseExternals.push(
      '@storybook/react',
      '@storybook/react-vite',
      'eslint',
      'typescript'
    );
  }
  
  return baseExternals;
};

// Vite-specific externals configuration
export const viteExternalsConfig = {
  external: (id: string) => {
    // Check if the id is in our externals list
    return browserExternals.some(external => {
      if (typeof external === 'string') {
        return id.includes(external);
      }
      return false;
    });
  },
  
  // Define how externals should be handled
  output: {
    globals: {
      // Define globals for externalized dependencies if needed
      'react': 'React',
      'react-dom': 'ReactDOM'
    }
  }
};

// Rollup-specific externals configuration
export const rollupExternalsConfig = (id: string) => {
  // Return true for modules that should be external
  return browserExternals.some(external => id.includes(external));
};

// AI-specific optimization configuration
export const aiOptimizationConfig = {
  // TensorFlow.js optimization
  tensorflow: {
    // Only include core and specific backends
    include: [
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-backend-webgl'
    ],
    exclude: [
      '@tensorflow/tfjs-backend-cpu',
      '@tensorflow/tfjs-backend-webgpu',
      '@tensorflow/tfjs-node',
      '@tensorflow/tfjs-react-native'
    ]
  },
  
  // Natural NLP optimization
  natural: {
    // Only include modules actually used
    include: [
      'natural/lib/natural/tokenizers',
      'natural/lib/natural/sentiment',
      'natural/lib/natural/distance'
    ],
    exclude: [
      'natural/lib/natural/classifiers',
      'natural/lib/natural/brill_pos_tagger',
      'natural/lib/natural/wordnet',
      'natural/lib/natural/spellcheck'
    ]
  }
};

// Tree-shaking configuration for better optimization
export const treeShakingConfig = {
  // Packages known to be tree-shakable
  treeShakable: [
    'lodash-es',
    'date-fns/esm',
    'lucide-react',
    'uuid'
  ],
  
  // Configure module resolution for better tree-shaking
  moduleResolution: {
    'lodash': 'lodash-es',
    'date-fns': 'date-fns/esm'
  },
  
  // Side effects configuration
  sideEffects: [
    '**/*.css',
    '**/*.scss',
    '**/*.sass',
    '**/*.less',
    '**/crisis-resources.json',
    '**/polyfills.js'
  ]
};

// Progressive loading configuration
export const progressiveLoadingConfig = {
  // Critical modules that should be in main bundle
  critical: [
    'react',
    'react-dom',
    './src/components/CrisisAlert',
    './src/services/crisisDetection',
    './src/contexts/AuthContext'
  ],
  
  // Modules that can be lazy loaded
  lazyLoad: [
    '@tensorflow/tfjs',
    'natural',
    './src/components/AdminDashboard',
    './src/components/Analytics',
    './src/views/Settings'
  ],
  
  // Preload hints for important modules
  preload: [
    './src/services/optimizedAIService',
    './src/components/MoodTracker'
  ]
};

// Bundle size optimization configuration
export const bundleSizeOptimization = {
  // Maximum sizes for different chunk types (in KB)
  maxSizes: {
    critical: 150,
    vendor: 400,
    async: 250
  },
  
  // Compression settings
  compression: {
    gzip: true,
    brotli: true,
    threshold: 1024 // Only compress files larger than 1KB
  },
  
  // Asset optimization
  assets: {
    inlineLimit: 4096, // Inline assets smaller than 4KB
    imageOptimization: true,
    svgOptimization: true
  }
};

export default {
  browserExternals,
  getConditionalExternals,
  viteExternalsConfig,
  rollupExternalsConfig,
  aiOptimizationConfig,
  treeShakingConfig,
  progressiveLoadingConfig,
  bundleSizeOptimization
};
