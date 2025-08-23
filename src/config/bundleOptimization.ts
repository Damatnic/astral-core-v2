/**
 * Bundle Optimization Configuration
 * 
 * Advanced webpack/rollup configuration for optimal bundle splitting
 * and performance optimization for the Astral Core platform.
 */

import { Plugin } from 'vite';
import { advancedChunkSplitting } from './advancedBundleSplitting';
import { logger } from '../utils/logger';

// Bundle analysis configuration
export const bundleAnalyzerConfig = {
  analyzerMode: 'static' as const,
  reportFilename: 'bundle-analysis.html',
  openAnalyzer: false,
  generateStatsFile: true,
  statsFilename: 'bundle-stats.json'
};

// Enhanced optimal chunk splitting strategy using advanced splitting
export const optimizedChunks = advancedChunkSplitting;

// Asset optimization configuration
export const assetOptimization = {
  // Inline small assets
  assetsInlineLimit: 4096,
  
  // Asset file naming strategy
  assetFileNames: (assetInfo: any) => {
    const info = assetInfo.name?.split('.') ?? [];
    const ext = info[info.length - 1];
    
    // Crisis resources get priority naming
    if (assetInfo.name?.includes('crisis') || assetInfo.name?.includes('emergency')) {
      return `assets/crisis/[name]-[hash][extname]`;
    }
    
    // Organize by file type
    if (ext === 'css') {
      return 'assets/css/[name]-[hash][extname]';
    }
    
    if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'avif'].includes(ext)) {
      return 'assets/images/[name]-[hash][extname]';
    }
    
    if (['woff', 'woff2', 'eot', 'ttf', 'otf'].includes(ext)) {
      return 'assets/fonts/[name]-[hash][extname]';
    }
    
    if (['mp3', 'wav', 'ogg'].includes(ext)) {
      return 'assets/audio/[name]-[hash][extname]';
    }
    
    return 'assets/[name]-[hash][extname]';
  },
  
  // Chunk file naming
  chunkFileNames: (chunkInfo: any) => {
    // Crisis chunks get priority naming
    if (chunkInfo.name?.includes('crisis') || chunkInfo.name?.includes('emergency')) {
      return 'assets/js/crisis/[name]-[hash].js';
    }
    
    // Vendor chunks
    if (chunkInfo.name?.includes('vendor')) {
      return 'assets/js/vendor/[name]-[hash].js';
    }
    
    return 'assets/js/[name]-[hash].js';
  },
  
  entryFileNames: 'assets/js/[name]-[hash].js'
};

// Tree shaking configuration
export const treeShakingConfig = {
  // Preserve side effects for mental health libraries
  sideEffects: [
    '**/*.css',
    '**/*.scss',
    '**/*.sass',
    '**/*.less',
    '**/crisis-resources.json',
    '**/emergency-contacts.json',
    '**/offline-coping-strategies.json'
  ],
  
  // External dependencies to exclude from tree shaking
  external: [
    // Keep these as external for CDN loading if needed
  ]
};

// Performance budget configuration
export const performanceBudget = {
  // Initial bundle size limits
  maxEntrypointSize: 512000, // 500KB for initial JS
  maxAssetSize: 1048576, // 1MB for any single asset
  
  // Bundle size warnings
  hints: 'warning' as const,
  
  // Crisis resources are exempt from size limits
  assetFilter: (assetFilename: string) => {
    return !assetFilename.includes('crisis') && 
           !assetFilename.includes('emergency') &&
           !assetFilename.includes('offline-coping');
  }
};

// Terser optimization for production
export const terserConfig = {
  compress: {
    // Remove console logs in production but keep crisis-related logs
    drop_console: false, // We handle this through logger utility
    drop_debugger: true,
    pure_funcs: [], // Removed console functions as we use logger utility
    // Keep crisis intervention function names for debugging
    keep_fnames: /crisis|emergency|safety/,
    passes: 2
  },
  mangle: {
    // Don't mangle crisis-related function names
    reserved: ['crisis', 'emergency', 'safety', 'offline'],
    properties: false
  },
  format: {
    comments: false
  }
};

// Preload strategy configuration
export const preloadStrategy = {
  // Critical resources to preload immediately
  critical: [
    '/crisis-resources.json',
    '/emergency-contacts.json',
    '/offline-coping-strategies.json'
  ],
  
  // High priority routes to preload after critical
  high: [
    '/assets/js/crisis-resources-*.js',
    '/assets/js/crisis-views-*.js',
    '/assets/js/crisis-components-*.js'
  ],
  
  // Medium priority for authenticated users
  medium: [
    '/assets/js/core-views-*.js',
    '/assets/js/components-*.js',
    '/assets/js/state-*.js'
  ],
  
  // Low priority for admin features
  low: [
    '/assets/js/admin-views-*.js',
    '/assets/js/monitoring-vendor-*.js'
  ]
};

// Code splitting optimization plugin
export const codeSplittingPlugin = (): Plugin => {
  return {
    name: 'code-splitting-optimization',
    generateBundle(_options, bundle) {
      // Analyze bundle and provide optimization suggestions
      const chunks = Object.values(bundle).filter(item => item.type === 'chunk');
      const totalSize = chunks.reduce((sum, chunk) => sum + (chunk as any).code?.length || 0, 0);
      
      logger.info(`\n📦 Bundle Analysis:`, undefined, 'bundleOptimization');
      logger.info(`   Total chunks: ${chunks.length}`, undefined, 'bundleOptimization');
      logger.info(`   Total size: ${(totalSize / 1024).toFixed(2)}KB`, undefined, 'bundleOptimization');
      
      // Find largest chunks
      const largeChunks = chunks
        .map(chunk => ({
          name: chunk.fileName,
          size: (chunk as any).code?.length || 0
        }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 5);
      
      logger.info(`   Largest chunks:`, undefined, 'bundleOptimization');
      largeChunks.forEach(chunk => {
        logger.info(`     ${chunk.name}: ${(chunk.size / 1024).toFixed(2)}KB`, undefined, 'bundleOptimization');
      });
      
      // Crisis resource optimization check
      const crisisChunks = chunks.filter(chunk => 
        chunk.fileName.includes('crisis') || 
        chunk.fileName.includes('emergency')
      );
      
      if (crisisChunks.length > 0) {
        logger.info(`\n🆘 Crisis Resources Optimized:`, undefined, 'bundleOptimization');
        crisisChunks.forEach(chunk => {
          logger.info(`     ${chunk.fileName}: ${((chunk as any).code?.length / 1024).toFixed(2)}KB`, undefined, 'bundleOptimization');
        });
      }
    }
  };
};

// Dynamic import optimization
export const dynamicImportConfig = {
  // Chunk naming for dynamic imports
  webpackChunkName: (importPath: string) => {
    if (importPath.includes('crisis') || importPath.includes('emergency')) {
      return 'crisis-[name]';
    }
    if (importPath.includes('views/')) {
      return 'view-[name]';
    }
    if (importPath.includes('components/')) {
      return 'component-[name]';
    }
    return '[name]';
  },
  
  // Preload hints for dynamic imports
  webpackPreload: (importPath: string) => {
    // Preload crisis resources
    return importPath.includes('crisis') || importPath.includes('emergency');
  },
  
  // Prefetch hints for dynamic imports  
  webpackPrefetch: (importPath: string) => {
    // Prefetch common components
    return importPath.includes('components/') && !importPath.includes('admin');
  }
};

export default {
  bundleAnalyzerConfig,
  optimizedChunks,
  assetOptimization,
  treeShakingConfig,
  performanceBudget,
  terserConfig,
  preloadStrategy,
  codeSplittingPlugin,
  dynamicImportConfig
};
