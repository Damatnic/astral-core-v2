const fs = require('fs');
const path = require('path');

/**
 * Service Worker Build Verification Script
 * 
 * Verifies that:
 * 1. Service worker file exists and is properly generated
 * 2. Crisis resources are included in precache
 * 3. Offline pages are available
 * 4. PWA manifest is properly configured
 */

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SW_PATH = path.join(DIST_DIR, 'sw.js');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

// Critical files that must be cached for offline functionality
const CRITICAL_FILES = [
    'crisis-resources.json',
    'offline-coping-strategies.json', 
    'emergency-contacts.json',
    'offline.html',
    'offline-crisis.html'
];

// PWA manifest requirements
const REQUIRED_MANIFEST_FIELDS = [
    'name',
    'short_name',
    'start_url',
    'display',
    'theme_color',
    'background_color',
    'icons'
];

function verifyServiceWorker() {
    console.log('🔍 Verifying Service Worker Build...\n');
    
    let hasErrors = false;
    
    // Check if service worker exists
    if (!fs.existsSync(SW_PATH)) {
        console.error('❌ Service worker not found at:', SW_PATH);
        hasErrors = true;
    } else {
        console.log('✅ Service worker file exists');
        
        // Read and analyze service worker content
        const swContent = fs.readFileSync(SW_PATH, 'utf8');
        
        // Check for Workbox integration
        if (swContent.includes('workbox')) {
            console.log('✅ Workbox integration detected');
        } else {
            console.warn('⚠️  Workbox integration not detected in service worker');
        }
        
        // Check for crisis resources in precache
        let crisisResourcesFound = 0;
        CRITICAL_FILES.forEach(file => {
            if (swContent.includes(file)) {
                console.log(`✅ Crisis resource included: ${file}`);
                crisisResourcesFound++;
            } else {
                console.warn(`⚠️  Crisis resource missing from cache: ${file}`);
            }
        });
        
        if (crisisResourcesFound === CRITICAL_FILES.length) {
            console.log('✅ All crisis resources included in service worker');
        } else {
            console.warn(`⚠️  Only ${crisisResourcesFound}/${CRITICAL_FILES.length} crisis resources found`);
        }
        
        // Check for background sync
        if (swContent.includes('background-sync') || swContent.includes('backgroundSync')) {
            console.log('✅ Background sync capability detected');
        } else {
            console.warn('⚠️  Background sync not detected');
        }
        
        console.log(`📊 Service worker size: ${(swContent.length / 1024).toFixed(2)}KB`);
    }
    
    // Verify critical files exist in dist
    console.log('\n🔍 Verifying Critical Files...');
    CRITICAL_FILES.forEach(file => {
        const filePath = path.join(DIST_DIR, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`✅ ${file} (${(stats.size / 1024).toFixed(2)}KB)`);
        } else {
            console.error(`❌ Missing critical file: ${file}`);
            hasErrors = true;
        }
    });
    
    // Verify PWA manifest
    console.log('\n🔍 Verifying PWA Manifest...');
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ PWA manifest not found at:', MANIFEST_PATH);
        hasErrors = true;
    } else {
        try {
            const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
            
            // Check required fields
            REQUIRED_MANIFEST_FIELDS.forEach(field => {
                if (manifest[field]) {
                    console.log(`✅ Manifest field: ${field}`);
                } else {
                    console.error(`❌ Missing manifest field: ${field}`);
                    hasErrors = true;
                }
            });
            
            // Check icons
            if (manifest.icons && manifest.icons.length > 0) {
                console.log(`✅ ${manifest.icons.length} icon(s) configured`);
                
                // Verify icon files exist
                manifest.icons.forEach(icon => {
                    const iconPath = path.join(DIST_DIR, icon.src);
                    if (fs.existsSync(iconPath)) {
                        console.log(`✅ Icon exists: ${icon.src} (${icon.sizes})`);
                    } else {
                        console.error(`❌ Missing icon file: ${icon.src}`);
                        hasErrors = true;
                    }
                });
            } else {
                console.error('❌ No icons configured in manifest');
                hasErrors = true;
            }
            
            // Check shortcuts for crisis access
            if (manifest.shortcuts && manifest.shortcuts.length > 0) {
                console.log(`✅ ${manifest.shortcuts.length} shortcut(s) configured`);
                
                const crisisShortcut = manifest.shortcuts.find(s => 
                    s.name.toLowerCase().includes('crisis'));
                if (crisisShortcut) {
                    console.log('✅ Crisis shortcut configured');
                } else {
                    console.warn('⚠️  No crisis shortcut found in manifest');
                }
            } else {
                console.warn('⚠️  No shortcuts configured in manifest');
            }
            
        } catch (error) {
            console.error('❌ Invalid JSON in manifest file:', error.message);
            hasErrors = true;
        }
    }
    
    // Check build output structure
    console.log('\n🔍 Verifying Build Output Structure...');
    const buildFiles = fs.readdirSync(DIST_DIR);
    
    const jsFiles = buildFiles.filter(f => f.endsWith('.js')).length;
    const cssFiles = buildFiles.filter(f => f.endsWith('.css')).length;
    const htmlFiles = buildFiles.filter(f => f.endsWith('.html')).length;
    const jsonFiles = buildFiles.filter(f => f.endsWith('.json')).length;
    
    console.log(`📊 Build output: ${jsFiles} JS, ${cssFiles} CSS, ${htmlFiles} HTML, ${jsonFiles} JSON files`);
    
    if (buildFiles.includes('index.html')) {
        console.log('✅ Main index.html exists');
    } else {
        console.error('❌ Missing index.html');
        hasErrors = true;
    }
    
    // Final verification result
    console.log('\n' + '='.repeat(50));
    if (hasErrors) {
        console.error('❌ Service Worker verification FAILED');
        console.error('Please fix the issues above before deploying.');
        process.exit(1);
    } else {
        console.log('✅ Service Worker verification PASSED');
        console.log('🚀 Ready for deployment with offline capabilities!');
    }
}

// Performance analysis
function analyzePerformance() {
    console.log('\n📊 Performance Analysis...');
    
    try {
        const indexPath = path.join(DIST_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            const jsMatches = indexContent.match(/<script[^>]*src="[^"]*"[^>]*>/g) || [];
            const cssMatches = indexContent.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
            
            console.log(`📦 Initial page loads: ${jsMatches.length} JS files, ${cssMatches.length} CSS files`);
            
            // Calculate total size of initial assets
            let totalJSSize = 0;
            let totalCSSSize = 0;
            
            jsMatches.forEach(match => {
                const srcMatch = match.match(/src="([^"]*)/);
                if (srcMatch) {
                    const fileName = path.basename(srcMatch[1]);
                    const filePath = path.join(DIST_DIR, 'assets', 'js', fileName);
                    if (fs.existsSync(filePath)) {
                        totalJSSize += fs.statSync(filePath).size;
                    }
                }
            });
            
            cssMatches.forEach(match => {
                const hrefMatch = match.match(/href="([^"]*)/);
                if (hrefMatch) {
                    const fileName = path.basename(hrefMatch[1]);
                    const filePath = path.join(DIST_DIR, 'assets', 'css', fileName);
                    if (fs.existsSync(filePath)) {
                        totalCSSSize += fs.statSync(filePath).size;
                    }
                }
            });
            
            console.log(`📊 Estimated initial load: ${(totalJSSize / 1024).toFixed(2)}KB JS, ${(totalCSSSize / 1024).toFixed(2)}KB CSS`);
            
            const totalSize = totalJSSize + totalCSSSize;
            if (totalSize < 500 * 1024) { // 500KB target
                console.log('✅ Initial bundle size within mobile target');
            } else {
                console.warn(`⚠️  Initial bundle size ${(totalSize / 1024).toFixed(2)}KB exceeds 500KB mobile target`);
            }
        }
    } catch (error) {
        console.warn('⚠️  Could not analyze performance:', error.message);
    }
}

// Run verification
if (require.main === module) {
    verifyServiceWorker();
    analyzePerformance();
}

module.exports = { verifyServiceWorker, analyzePerformance };
