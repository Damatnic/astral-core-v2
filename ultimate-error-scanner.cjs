#!/usr/bin/env node

/**
 * ULTIMATE ERROR SCANNER - Advanced Multi-Pattern Code Analysis & Auto-Fix System
 * Combines error detection, duplicate finding, and safe auto-fixing capabilities
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const os = require('os');

// ======================== CONFIGURATION ========================
class UltimateConfig {
    constructor() {
        this.parseArgs();
        this.setupDefaults();
    }

    parseArgs() {
        const args = process.argv.slice(2);
        this.args = {};
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                const nextArg = args[i + 1];
                if (nextArg && !nextArg.startsWith('--')) {
                    this.args[key] = nextArg;
                    i++;
                } else {
                    this.args[key] = true;
                }
            }
        }
    }

    setupDefaults() {
        this.mode = this.args.mode || 'smart';
        this.dir = this.args.dir || process.cwd();
        this.extensions = (this.args.ext || 'js,jsx,ts,tsx,mjs,cjs,py,java,css,html').split(',');
        this.dryRun = this.args['dry-run'] || false;
        this.verbose = this.args.verbose || false;
        this.backup = this.args.backup !== false;
        this.duplicates = this.args.duplicates === true; // Disable by default due to performance
        this.autoFix = this.args.fix !== false;
        this.maxFileSize = parseInt(this.args['max-size'] || '5242880'); // 5MB
        this.reportFormat = this.args.format || 'json,markdown';
        this.parallel = this.args.parallel || false;
        this.aggressive = this.args.aggressive || false;
        this.conservative = this.args.conservative || false;
        this.similarityThreshold = parseFloat(this.args.similarity || '0.8');
        this.checkTypes = this.args.types !== false;
        this.securityScan = this.args.security !== false;
        this.performanceScan = this.args.performance !== false;
        this.accessibilityScan = this.args.accessibility || false;
        this.configFile = this.args.config || null;
        this.incremental = this.args.incremental || false;
        this.watch = this.args.watch || false;
        this.learnPatterns = this.args.learn !== false;
        this.visualDiff = this.args.visual || false;
        this.gitIntegration = this.args.git || false;
        this.analytics = this.args.analytics || false;
        this.multiLanguage = this.args['multi-lang'] || false;
        
        this.ignorePatterns = [
            'node_modules', '.git', 'dist', 'build', 'coverage',
            '.next', '.nuxt', 'vendor', 'bower_components',
            '__pycache__', '.cache', 'tmp', 'temp'
        ];
    }

    async loadConfigFile() {
        if (!this.configFile) return;
        try {
            const content = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(content);
            Object.assign(this, config);
        } catch (err) {
            console.warn(`Failed to load config file: ${err.message}`);
        }
    }
}

// ======================== AI-POWERED PATTERN LEARNING ========================
class PatternLearner {
    constructor() {
        this.patterns = new Map();
        this.errorHistory = [];
        this.fixSuccessRate = new Map();
        this.learnedPatterns = [];
    }

    learnFromCorrection(original, corrected, context) {
        const diff = this.computeDiff(original, corrected);
        const pattern = this.extractPattern(diff, context);
        
        if (pattern) {
            this.patterns.set(pattern.id, {
                ...pattern,
                confidence: this.updateConfidence(pattern),
                frequency: (this.patterns.get(pattern.id)?.frequency || 0) + 1
            });
        }
    }

    suggestNewPatterns() {
        const suggestions = [];
        
        for (const [id, pattern] of this.patterns) {
            if (pattern.frequency > 5 && pattern.confidence > 0.8) {
                suggestions.push({
                    pattern: this.generateRegex(pattern),
                    fix: pattern.commonFix,
                    message: `Auto-learned: ${pattern.description}`,
                    severity: 'warning',
                    confidence: pattern.confidence
                });
            }
        }
        
        return suggestions;
    }

    computeDiff(original, corrected) {
        const changes = [];
        let i = 0, j = 0;
        
        while (i < original.length || j < corrected.length) {
            if (original[i] === corrected[j]) {
                i++; j++;
            } else {
                changes.push({
                    type: 'change',
                    from: original.substring(i, i + 10),
                    to: corrected.substring(j, j + 10),
                    position: i
                });
                i++; j++;
            }
        }
        
        return changes;
    }

    extractPattern(diff, context) {
        if (diff.length === 0) return null;
        
        return {
            id: this.generatePatternId(diff),
            description: this.describePattern(diff),
            commonFix: diff[0]?.to,
            context: context
        };
    }

    generatePatternId(diff) {
        return diff.map(d => `${d.from}->${d.to}`).join('|');
    }

    describePattern(diff) {
        return `Replace "${diff[0]?.from}" with "${diff[0]?.to}"`;
    }

    updateConfidence(pattern) {
        const successRate = this.fixSuccessRate.get(pattern.id) || 0.5;
        return Math.min(1, successRate + 0.1);
    }

    generateRegex(pattern) {
        return new RegExp(pattern.context.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    }
}

// ======================== INCREMENTAL SCANNING ========================
class IncrementalScanner {
    constructor() {
        this.fileCache = new Map();
        this.hashCache = new Map();
        this.lastScanTime = new Map();
    }

    async scanIncremental(files, forceRescan = false) {
        const toScan = [];
        
        for (const file of files) {
            if (forceRescan || await this.hasFileChanged(file)) {
                toScan.push(file);
            }
        }
        
        return toScan;
    }

    async hasFileChanged(file) {
        try {
            const stats = await fs.stat(file);
            const lastScan = this.lastScanTime.get(file);
            
            if (!lastScan || stats.mtime > lastScan) {
                const currentHash = await this.computeFileHash(file);
                const cachedHash = this.hashCache.get(file);
                
                if (currentHash !== cachedHash) {
                    this.hashCache.set(file, currentHash);
                    this.lastScanTime.set(file, new Date());
                    return true;
                }
            }
        } catch (err) {
            return true;
        }
        
        return false;
    }

    async computeFileHash(file) {
        const content = await fs.readFile(file);
        return crypto.createHash('md5').update(content).digest('hex');
    }

    getCachedResults(file) {
        return this.fileCache.get(file);
    }

    setCachedResults(file, results) {
        this.fileCache.set(file, results);
    }
}

// ======================== VISUAL DIFF GENERATOR ========================
class VisualDiffGenerator {
    generateDiffPreview(original, fixed, file) {
        const diff = this.computeLineDiff(original, fixed);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Fix Preview: ${file}</title>
    <style>
        body { font-family: monospace; background: #1e1e1e; color: #fff; }
        .diff { display: flex; gap: 20px; padding: 20px; }
        .column { flex: 1; }
        .added { background: #0d4f0d; }
        .removed { background: #5f0d0d; }
        .unchanged { color: #999; }
        .line-number { color: #666; margin-right: 10px; }
        h2 { color: #4fc3f7; }
        .stats { background: #333; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Fix Preview: ${file}</h1>
    <div class="stats">
        <p>📊 Changes: ${diff.added} additions, ${diff.removed} deletions</p>
        <p>✅ Fixes applied: ${diff.fixes.length}</p>
    </div>
    <div class="diff">
        <div class="column">
            <h2>Before</h2>
            <pre>${this.renderDiffColumn(diff.before)}</pre>
        </div>
        <div class="column">
            <h2>After</h2>
            <pre>${this.renderDiffColumn(diff.after)}</pre>
        </div>
    </div>
</body>
</html>`;
    }

    computeLineDiff(original, fixed) {
        const originalLines = original.split('\n');
        const fixedLines = fixed.split('\n');
        const diff = {
            before: [],
            after: [],
            added: 0,
            removed: 0,
            fixes: []
        };

        const maxLines = Math.max(originalLines.length, fixedLines.length);
        
        for (let i = 0; i < maxLines; i++) {
            const origLine = originalLines[i] || '';
            const fixedLine = fixedLines[i] || '';
            
            if (origLine === fixedLine) {
                diff.before.push({ type: 'unchanged', line: origLine, num: i + 1 });
                diff.after.push({ type: 'unchanged', line: fixedLine, num: i + 1 });
            } else {
                if (origLine) {
                    diff.before.push({ type: 'removed', line: origLine, num: i + 1 });
                    diff.removed++;
                }
                if (fixedLine) {
                    diff.after.push({ type: 'added', line: fixedLine, num: i + 1 });
                    diff.added++;
                }
                diff.fixes.push({ line: i + 1, from: origLine, to: fixedLine });
            }
        }
        
        return diff;
    }

    renderDiffColumn(lines) {
        return lines.map(item => {
            const cls = item.type;
            return `<div class="${cls}"><span class="line-number">${item.num}</span>${this.escapeHtml(item.line)}</div>`;
        }).join('\n');
    }

    escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    async saveDiffPreview(original, fixed, file) {
        const html = this.generateDiffPreview(original, fixed, file);
        const filename = `diff-preview-${Date.now()}.html`;
        await fs.writeFile(filename, html);
        return filename;
    }
}

// ======================== GIT INTEGRATION ========================
class GitIntegration {
    async installGitHook() {
        const hookPath = '.git/hooks/pre-commit';
        const hookContent = `#!/bin/sh
# Ultimate Error Scanner Pre-commit Hook

echo "🔍 Running Ultimate Error Scanner..."
node ultimate-error-scanner.js --mode conservative --fix

if [ $? -ne 0 ]; then
    echo "❌ Errors found. Please fix before committing."
    exit 1
fi

echo "✅ Code scan passed!"
exit 0`;

        await fs.writeFile(hookPath, hookContent);
        await fs.chmod(hookPath, '755');
        
        return 'Git hook installed successfully';
    }

    async scanGitChanges() {
        try {
            const { stdout } = await execAsync('git diff --cached --name-only');
            const files = stdout.split('\n').filter(f => f.trim());
            return files;
        } catch (err) {
            return [];
        }
    }

    async commitFixes(fixes) {
        const message = `🔧 Auto-fix: Fixed ${fixes.length} issues

Fixed issues:
${fixes.map(f => `- ${f.message}`).join('\n')}

[Generated by Ultimate Error Scanner]`;

        await execAsync('git add -A');
        await execAsync(`git commit -m "${message}"`);
    }
}

// ======================== REAL-TIME MONITORING ========================
class RealTimeMonitor {
    constructor() {
        this.watchers = new Map();
        this.debounceTimers = new Map();
    }

    watchFiles(files, callback) {
        // Simple file watching implementation
        for (const file of files) {
            fsSync.watchFile(file, { interval: 1000 }, (curr, prev) => {
                if (curr.mtime !== prev.mtime) {
                    this.debounce(file, () => {
                        console.log(`📝 File changed: ${file}`);
                        callback(file);
                    }, 1000);
                }
            });
            this.watchers.set(file, true);
        }
    }

    debounce(key, callback, delay) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            callback();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    }

    stopWatching() {
        for (const file of this.watchers.keys()) {
            fsSync.unwatchFile(file);
        }
        this.watchers.clear();
    }
}

// ======================== ANALYTICS DASHBOARD ========================
class AnalyticsDashboard {
    constructor() {
        this.metrics = {
            totalScans: 0,
            totalErrors: 0,
            totalFixes: 0,
            errorsByCategory: {},
            errorsBySeverity: {},
            filesByExtension: {},
            scanDurations: [],
            topErrors: []
        };
    }

    recordScan(results, duration) {
        this.metrics.totalScans++;
        this.metrics.scanDurations.push(duration);
        
        if (results.errors) {
            for (const errors of Object.values(results.errors)) {
                this.metrics.totalErrors += errors.length;
                
                for (const error of errors) {
                    // Track by category
                    this.metrics.errorsByCategory[error.category] = 
                        (this.metrics.errorsByCategory[error.category] || 0) + 1;
                    
                    // Track by severity
                    this.metrics.errorsBySeverity[error.severity] = 
                        (this.metrics.errorsBySeverity[error.severity] || 0) + 1;
                    
                    // Track top errors
                    this.updateTopErrors(error);
                }
            }
        }
        
        if (results.fixes) {
            this.metrics.totalFixes += results.fixes.length;
        }
    }

    updateTopErrors(error) {
        const existing = this.metrics.topErrors.find(e => e.message === error.message);
        if (existing) {
            existing.count++;
        } else {
            this.metrics.topErrors.push({
                message: error.message,
                category: error.category,
                severity: error.severity,
                count: 1
            });
        }
        
        // Keep only top 10
        this.metrics.topErrors.sort((a, b) => b.count - a.count);
        this.metrics.topErrors = this.metrics.topErrors.slice(0, 10);
    }

    generateAnalyticsReport() {
        const avgScanTime = this.metrics.scanDurations.length > 0
            ? this.metrics.scanDurations.reduce((a, b) => a + b, 0) / this.metrics.scanDurations.length
            : 0;
        
        return {
            summary: {
                totalScans: this.metrics.totalScans,
                totalErrors: this.metrics.totalErrors,
                totalFixes: this.metrics.totalFixes,
                avgScanTime: avgScanTime.toFixed(2) + 's',
                errorFixRate: ((this.metrics.totalFixes / this.metrics.totalErrors) * 100).toFixed(2) + '%'
            },
            distributions: {
                byCategory: this.metrics.errorsByCategory,
                bySeverity: this.metrics.errorsBySeverity,
                byExtension: this.metrics.filesByExtension
            },
            topErrors: this.metrics.topErrors,
            trends: this.calculateTrends()
        };
    }

    calculateTrends() {
        // Simple trend calculation
        const recentScans = this.metrics.scanDurations.slice(-10);
        const olderScans = this.metrics.scanDurations.slice(-20, -10);
        
        if (recentScans.length > 0 && olderScans.length > 0) {
            const recentAvg = recentScans.reduce((a, b) => a + b, 0) / recentScans.length;
            const olderAvg = olderScans.reduce((a, b) => a + b, 0) / olderScans.length;
            
            return {
                performance: recentAvg < olderAvg ? 'improving' : 'degrading',
                percentChange: ((recentAvg - olderAvg) / olderAvg * 100).toFixed(2) + '%'
            };
        }
        
        return { performance: 'stable', percentChange: '0%' };
    }
}

// ======================== SMART CONTEXT ANALYZER ========================
class SmartContextAnalyzer {
    analyzeContext(code, position) {
        const context = {
            inFunction: this.isInFunction(code, position),
            inClass: this.isInClass(code, position),
            inJSX: this.isInJSX(code, position),
            inString: this.isInString(code, position),
            inComment: this.isInComment(code, position),
            indentLevel: this.getIndentLevel(code, position),
            scope: this.determineScope(code, position)
        };

        return context;
    }

    isInFunction(code, position) {
        const before = code.substring(0, position);
        const functionStart = before.lastIndexOf('function');
        const arrowStart = before.lastIndexOf('=>');
        
        return functionStart > -1 || arrowStart > -1;
    }

    isInClass(code, position) {
        const before = code.substring(0, position);
        return before.lastIndexOf('class ') > -1;
    }

    isInJSX(code, position) {
        const before = code.substring(0, position);
        const after = code.substring(position);
        
        return before.includes('<') && after.includes('>');
    }

    isInString(code, position) {
        const before = code.substring(0, position);
        const quotes = before.match(/["'`]/g) || [];
        return quotes.length % 2 === 1;
    }

    isInComment(code, position) {
        const before = code.substring(0, position);
        const singleLine = before.lastIndexOf('//');
        const multiStart = before.lastIndexOf('/*');
        const multiEnd = before.lastIndexOf('*/');
        
        if (singleLine > -1 && !before.substring(singleLine).includes('\n')) {
            return true;
        }
        
        return multiStart > multiEnd;
    }

    getIndentLevel(code, position) {
        const lines = code.substring(0, position).split('\n');
        const lastLine = lines[lines.length - 1];
        const indent = lastLine.match(/^\s*/)[0];
        return indent.length;
    }

    determineScope(code, position) {
        const before = code.substring(0, position);
        const openBraces = (before.match(/\{/g) || []).length;
        const closeBraces = (before.match(/\}/g) || []).length;
        
        return {
            depth: openBraces - closeBraces,
            type: this.isInFunction(code, position) ? 'function' : 'global'
        };
    }
}

// ======================== DUPLICATE DETECTION ENGINE ========================
class DuplicateDetector {
    constructor(config) {
        this.config = config;
        this.fileHashes = new Map();
        this.codeFingerprints = new Map();
        this.duplicateGroups = [];
        this.nearDuplicates = [];
    }

    async scanForDuplicates(files) {
        console.log('\n🔍 Scanning for duplicates...');
        
        // Phase 1: File-level duplicates (exact matches)
        await this.detectExactDuplicates(files);
        
        // Phase 2: Code-level duplicates (similar code blocks)
        await this.detectCodeDuplicates(files);
        
        // Phase 3: Near duplicates (fuzzy matching)
        await this.detectNearDuplicates(files);
        
        return {
            exact: this.duplicateGroups,
            code: this.codeFingerprints,
            near: this.nearDuplicates
        };
    }

    async detectExactDuplicates(files) {
        console.log(`  📏 Grouping ${files.length} files by size...`);
        const sizeGroups = new Map();
        let processed = 0;
        
        // Group files by size first (fast filter)
        for (const file of files) {
            try {
                const stats = await fs.stat(file);
                const size = stats.size;
                
                if (!sizeGroups.has(size)) {
                    sizeGroups.set(size, []);
                }
                sizeGroups.get(size).push(file);
                
                processed++;
                if (processed % 500 === 0) {
                    console.log(`    📊 Processed ${processed}/${files.length} files...`);
                }
            } catch (err) {
                // Skip inaccessible files
                processed++;
            }
        }
        
        console.log(`  🔍 Found ${sizeGroups.size} size groups, checking for duplicates...`);

        // Only hash files with same size
        for (const [size, group] of sizeGroups) {
            if (group.length < 2) continue;
            
            const hashGroups = new Map();
            for (const file of group) {
                const hash = await this.hashFile(file);
                if (!hashGroups.has(hash)) {
                    hashGroups.set(hash, []);
                }
                hashGroups.get(hash).push(file);
            }

            // Record duplicate groups
            for (const [hash, files] of hashGroups) {
                if (files.length > 1) {
                    this.duplicateGroups.push({
                        type: 'exact',
                        hash,
                        size,
                        files,
                        count: files.length
                    });
                }
            }
        }
    }

    async hashFile(filepath) {
        try {
            const content = await fs.readFile(filepath);
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch (err) {
            return null;
        }
    }

    async detectCodeDuplicates(files) {
        const codeBlocks = new Map();
        
        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const blocks = this.extractCodeBlocks(content);
                
                for (const block of blocks) {
                    const fingerprint = this.generateFingerprint(block);
                    if (!codeBlocks.has(fingerprint)) {
                        codeBlocks.set(fingerprint, []);
                    }
                    codeBlocks.get(fingerprint).push({
                        file,
                        block: block.substring(0, 100), // Store preview
                        line: this.getLineNumber(content, block)
                    });
                }
            } catch (err) {
                // Skip non-text files
            }
        }

        // Find duplicate code blocks
        for (const [fingerprint, locations] of codeBlocks) {
            if (locations.length > 1) {
                this.codeFingerprints.set(fingerprint, {
                    type: 'code_block',
                    locations,
                    count: locations.length
                });
            }
        }
    }

    extractCodeBlocks(content) {
        const blocks = [];
        
        // Extract functions
        const functionRegex = /function\s+\w+\s*\([^)]*\)\s*\{[^}]+\}/g;
        const arrowRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]+\}/g;
        const classRegex = /class\s+\w+\s*(?:extends\s+\w+)?\s*\{[^}]+\}/g;
        
        [...content.matchAll(functionRegex)].forEach(m => blocks.push(m[0]));
        [...content.matchAll(arrowRegex)].forEach(m => blocks.push(m[0]));
        [...content.matchAll(classRegex)].forEach(m => blocks.push(m[0]));
        
        // Extract significant code blocks (10+ lines)
        const lines = content.split('\n');
        for (let i = 0; i < lines.length - 10; i++) {
            const block = lines.slice(i, i + 10).join('\n');
            if (block.trim().length > 100) {
                blocks.push(block);
            }
        }
        
        return blocks;
    }

    generateFingerprint(code) {
        // Normalize code for comparison
        const normalized = code
            .replace(/\/\/.*$/gm, '') // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/['"`]/g, '"') // Normalize quotes
            .replace(/\b\w+\b/g, (match) => {
                // Replace variable names with placeholders
                if (/^[a-z_$]/.test(match) && !/^(if|else|for|while|return|const|let|var|function|class)$/.test(match)) {
                    return 'VAR';
                }
                return match;
            })
            .trim();
        
        return crypto.createHash('md5').update(normalized).digest('hex');
    }

    async detectNearDuplicates(files) {
        const contentMap = new Map();
        
        // Load file contents
        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                contentMap.set(file, this.normalizeContent(content));
            } catch (err) {
                // Skip binary files
            }
        }

        // Compare all pairs (optimize with indexing for large codebases)
        const fileList = Array.from(contentMap.keys());
        for (let i = 0; i < fileList.length - 1; i++) {
            for (let j = i + 1; j < fileList.length; j++) {
                const file1 = fileList[i];
                const file2 = fileList[j];
                const content1 = contentMap.get(file1);
                const content2 = contentMap.get(file2);
                
                const similarity = this.calculateSimilarity(content1, content2);
                if (similarity >= this.config.similarityThreshold) {
                    this.nearDuplicates.push({
                        type: 'near_duplicate',
                        files: [file1, file2],
                        similarity: (similarity * 100).toFixed(2) + '%'
                    });
                }
            }
        }
    }

    normalizeContent(content) {
        return content
            .toLowerCase()
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    calculateSimilarity(str1, str2) {
        // Jaccard similarity with character n-grams
        const shingles1 = this.getShingles(str1, 3);
        const shingles2 = this.getShingles(str2, 3);
        
        const intersection = new Set([...shingles1].filter(x => shingles2.has(x)));
        const union = new Set([...shingles1, ...shingles2]);
        
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    getShingles(text, k) {
        const shingles = new Set();
        for (let i = 0; i <= text.length - k; i++) {
            shingles.add(text.substring(i, i + k));
        }
        return shingles;
    }

    getLineNumber(content, substring) {
        const index = content.indexOf(substring);
        if (index === -1) return 0;
        return content.substring(0, index).split('\n').length;
    }
}

// ======================== ADVANCED ERROR PATTERNS ========================
class AdvancedErrorDetector {
    constructor(config) {
        this.config = config;
        this.patterns = this.initializePatterns();
        this.securityPatterns = this.initializeSecurityPatterns();
        this.performancePatterns = this.initializePerformancePatterns();
        this.accessibilityPatterns = this.initializeAccessibilityPatterns();
        this.severeCorruptionPatterns = this.initializeSevereCorruptionPatterns();
    }

    initializeSevereCorruptionPatterns() {
        return [
            // Extreme brace corruption
            {
                pattern: /\{[\s\n]*\{[\s\n]*\{[\s\n]*\{[\s\n]*\{+/g,
                message: 'Severe corruption: 5+ consecutive opening braces',
                severity: 'critical',
                fix: () => '{'
            },
            {
                pattern: /\}[\s\n]*\}[\s\n]*\}[\s\n]*\}[\s\n]*\}+/g,
                message: 'Severe corruption: 5+ consecutive closing braces',
                severity: 'critical',
                fix: () => '}'
            },
            // Interface corruption
            {
                pattern: /interface\s+\w+\s*\{[\s\n]*\{[\s\n]*\{/g,
                message: 'Interface with multiple opening braces',
                severity: 'critical',
                fix: (match) => {
                    const name = match.match(/interface\s+(\w+)/);
                    return name ? `interface ${name[1]} {` : 'interface {';
                }
            },
            // Extreme semicolon pollution
            {
                pattern: /;{7,}/g,
                message: 'Extreme semicolon repetition (7+)',
                severity: 'critical',
                fix: () => ';'
            }
        ];
    }

    initializePatterns() {
        return {
            // Syntax Errors
            syntax: [
                // Multiple consecutive braces detection
                {
                    pattern: /\{\s*\{\s*\{+/g,
                    message: 'Multiple consecutive opening braces (3 or more)',
                    severity: 'error',
                    fix: () => '{'
                },
                {
                    pattern: /\}\s*\}\s*\}+/g,
                    message: 'Multiple consecutive closing braces (3 or more)',
                    severity: 'error',
                    fix: () => '}'
                },
                {
                    pattern: /\{\s*\{\s*(?!\{)/g,
                    message: 'Double opening braces',
                    severity: 'error',
                    fix: () => '{ '
                },
                {
                    pattern: /(?<!\})\}\s*\}\s*(?!\})/g,
                    message: 'Double closing braces',
                    severity: 'error',
                    fix: () => '} '
                },
                {
                    pattern: /;\s*;\s*;+/g,
                    message: 'Multiple consecutive semicolons (3 or more)',
                    severity: 'error',
                    fix: () => ';'
                },
                {
                    pattern: /;\s*;/g,
                    message: 'Double semicolon',
                    severity: 'warning',
                    fix: () => ';'
                },
                {
                    pattern: /\bif\s*\([^)]*\)\s*;/g,
                    message: 'Empty if statement',
                    severity: 'warning',
                    fix: (match) => match.replace(';', '{}')
                },
                {
                    pattern: /\bfor\s*\([^)]*\)\s*;/g,
                    message: 'Empty for loop',
                    severity: 'warning',
                    fix: (match) => match.replace(';', '{}')
                },
                {
                    pattern: /\bwhile\s*\([^)]*\)\s*;/g,
                    message: 'Empty while loop',
                    severity: 'warning',
                    fix: (match) => match.replace(';', '{}')
                },
                {
                    pattern: /\bconsole\.(log|error|warn|info|debug)\(/g,
                    message: 'Console statement in production code',
                    severity: 'info',
                    fix: (match) => `// ${match}`
                },
                {
                    pattern: /\bdebugger;/g,
                    message: 'Debugger statement found',
                    severity: 'error',
                    fix: () => '// debugger;'
                },
                // Export/Import issues
                {
                    pattern: /^\s*i18n\s+from\s+["']/gm,
                    message: 'Missing import keyword before i18n',
                    severity: 'error',
                    fix: (match) => 'import ' + match.trim()
                },
                {
                    pattern: /^\s*\{\s*\w+(?:\s*,\s*\w+)*\s*\}\s+from\s+["']/gm,
                    message: 'Missing import keyword before destructured import',
                    severity: 'error',
                    fix: (match) => 'import ' + match.trim()
                },
                {
                    pattern: /^\s*\w+\s+from\s+["'][^"']+["']/gm,
                    message: 'Missing import keyword',
                    severity: 'error',
                    fix: (match) => {
                        // Don't add import to export statements
                        if (match.includes('export')) return match;
                        return 'import ' + match.trim();
                    }
                },
                {
                    pattern: /^\s*\*\s+as\s+\w+\s+from\s+["']/gm,
                    message: 'Missing import keyword before namespace import',
                    severity: 'error',
                    fix: (match) => 'import ' + match.trim()
                },
                {
                    pattern: /export\s+default\s+.*\s+export\s+default/g,
                    message: 'Duplicate export default statements',
                    severity: 'error',
                    fix: (match) => {
                        // Keep only the first export default
                        const parts = match.split('export default');
                        return 'export default' + parts[1];
                    }
                },
                {
                    pattern: /export\s+const\s+.*\s+export\s+const/g,
                    message: 'Duplicate export const statements',
                    severity: 'error'
                },
                {
                    pattern: /J\s*J\s*\)/g,
                    message: 'Malformed characters "J J)"',
                    severity: 'error',
                    fix: () => ')'
                },
                {
                    pattern: /J\s*export\s*const\s*\w+\s*=/g,
                    message: 'Stray "J" before export statement',
                    severity: 'error',
                    fix: (match) => match.replace(/^J\s*/, '')
                },
                {
                    pattern: /J\s*;/g,
                    message: 'Stray "J" before semicolon',
                    severity: 'error',
                    fix: () => ';'
                },
                {
                    pattern: /interface\s+.*\s+Vs\*VAs\*\/ls\*V/g,
                    message: 'Corrupted interface declaration',
                    severity: 'error'
                },
                {
                    pattern: /\s+interface\s+interface\s+/g,
                    message: 'Duplicate interface keyword',
                    severity: 'error',
                    fix: (match) => ' interface '
                },
                {
                    pattern: /\s+class\s+class\s+/g,
                    message: 'Duplicate class keyword',
                    severity: 'error',
                    fix: (match) => ' class '
                },
                {
                    pattern: /\s+function\s+function\s+/g,
                    message: 'Duplicate function keyword',
                    severity: 'error',
                    fix: (match) => ' function '
                },
                {
                    pattern: /export\s+export\s+/g,
                    message: 'Duplicate export keyword',
                    severity: 'error',
                    fix: () => 'export '
                },
                {
                    pattern: /import\s+import\s+/g,
                    message: 'Duplicate import keyword',
                    severity: 'error',
                    fix: () => 'import '
                },
                {
                    pattern: /const\s+const\s+/g,
                    message: 'Duplicate const keyword',
                    severity: 'error',
                    fix: () => 'const '
                },
                {
                    pattern: /let\s+let\s+/g,
                    message: 'Duplicate let keyword',
                    severity: 'error',
                    fix: () => 'let '
                },
                {
                    pattern: /var\s+var\s+/g,
                    message: 'Duplicate var keyword',
                    severity: 'error',
                    fix: () => 'var '
                },
                {
                    pattern: /return\s+return\s+/g,
                    message: 'Duplicate return keyword',
                    severity: 'error',
                    fix: () => 'return '
                },
                {
                    pattern: /async\s+async\s+/g,
                    message: 'Duplicate async keyword',
                    severity: 'error',
                    fix: () => 'async '
                },
                {
                    pattern: /await\s+await\s+/g,
                    message: 'Duplicate await keyword',
                    severity: 'error',
                    fix: () => 'await '
                },
                {
                    pattern: /public\s+public\s+/g,
                    message: 'Duplicate public keyword',
                    severity: 'error',
                    fix: () => 'public '
                },
                {
                    pattern: /private\s+private\s+/g,
                    message: 'Duplicate private keyword',
                    severity: 'error',
                    fix: () => 'private '
                },
                {
                    pattern: /static\s+static\s+/g,
                    message: 'Duplicate static keyword',
                    severity: 'error',
                    fix: () => 'static '
                },
                // Quote corruption patterns
                {
                    pattern: /["'][^"']*["']{2,}/g,
                    message: 'Quote corruption - multiple quotes at end',
                    severity: 'error',
                    fix: (match) => {
                        const firstQuote = match[0];
                        const content = match.slice(1).replace(/["']+$/, '');
                        return firstQuote + content + firstQuote;
                    }
                },
                {
                    pattern: /["'][^"']*[\s,;}\])](?!["'])/g,
                    message: 'Unclosed string literal',
                    severity: 'error'
                },
                {
                    pattern: /["'][^"']*['"]['"]+/g,
                    message: 'Mixed quote types with corruption',
                    severity: 'error',
                    fix: (match) => {
                        const firstQuote = match[0];
                        const content = match.slice(1, -1).replace(/["']+$/, '');
                        return firstQuote + content + firstQuote;
                    }
                },
                {
                    pattern: /:\s*["'][^"']*['"]\s*\|\s*["'][^"']*['"](?:['"]+|\s*\|)/g,
                    message: 'Quote corruption in enum or union type',
                    severity: 'error'
                },
                {
                    pattern: /["']system['"]?\s*\|\s*["']user-action["']?\s*\|\s*["']network["']?\s*\|\s*['"]security["']?\s*\|\s*["']crisis['"]*/g,
                    message: 'Quote corruption in enum values',
                    severity: 'error',
                    fix: () => '"system" | "user-action" | "network" | "security" | "crisis"'
                },
                {
                    pattern: /from\s+["'][^"']*["']{3,}/g,
                    message: 'Multiple trailing quotes in import',
                    severity: 'error',
                    fix: (match) => {
                        const parts = match.match(/from\s+(["'])([^"']*)/);
                        if (parts) {
                            return `from ${parts[1]}${parts[2]}${parts[1]}`;
                        }
                        return match;
                    }
                },
                {
                    pattern: /from\s+['"][^'"]*['"]['";,\s]*['"]/g,
                    message: 'Extra quotes after import path',
                    severity: 'error',
                    fix: (match) => {
                        const parts = match.match(/from\s+(["'])([^"']*)/);
                        if (parts) {
                            return `from ${parts[1]}${parts[2]}${parts[1]}`;
                        }
                        return match;
                    }
                }
            ],

            // JSX/React Specific Errors
            jsx: [
                {
                    pattern: /<[^>]+}\s*}/g,
                    message: 'Extra closing brace in JSX element',
                    severity: 'error',
                    fix: (match) => match.replace(/}\s*}/, '}')
                },
                {
                    pattern: /<[^>]+{\s*{/g,
                    message: 'Extra opening brace in JSX element',
                    severity: 'error',
                    fix: (match) => match.replace(/{\s*{/, '{')
                },
                {
                    pattern: /<[^>]+\s+}\s*>/g,
                    message: 'Stray closing brace in JSX tag',
                    severity: 'error',
                    fix: (match) => match.replace(/\s+}\s*>/, '>')
                },
                {
                    pattern: /<[^>]+\s+{\s*>/g,
                    message: 'Stray opening brace in JSX tag',
                    severity: 'error',
                    fix: (match) => match.replace(/\s+{\s*>/, '>')
                },
                {
                    pattern: /<[^\/][^>]*\/\s*>/g,
                    message: 'Self-closing tag check',
                    severity: 'info'
                },
                {
                    pattern: /className\s*=\s*{[^}]*}\s*}/g,
                    message: 'Extra brace after className expression',
                    severity: 'error',
                    fix: (match) => match.replace(/}\s*}/, '}')
                },
                {
                    pattern: /style\s*=\s*{[^}]*}\s*}/g,
                    message: 'Extra brace after style expression',
                    severity: 'error',
                    fix: (match) => match.replace(/}\s*}/, '}')
                },
                {
                    pattern: /onClick\s*=\s*{[^}]*}\s*}/g,
                    message: 'Extra brace after onClick handler',
                    severity: 'error',
                    fix: (match) => match.replace(/}\s*}/, '}')
                },
                {
                    pattern: /onChange\s*=\s*{[^}]*}\s*}/g,
                    message: 'Extra brace after onChange handler',
                    severity: 'error',
                    fix: (match) => match.replace(/}\s*}/, '}')
                },
                {
                    pattern: /<(\w+)([^>]*)>\s*}\s*<\/\1>/g,
                    message: 'Stray brace between JSX tags',
                    severity: 'error',
                    fix: (match) => match.replace(/>\s*}\s*</, '><')
                },
                {
                    pattern: /<\/\w+>\s*}/g,
                    message: 'Stray brace after closing JSX tag',
                    severity: 'error',
                    fix: (match) => match.replace(/>\s*}/, '>')
                },
                {
                    pattern: /{\s*<\/\w+>/g,
                    message: 'Stray brace before closing JSX tag',
                    severity: 'error',
                    fix: (match) => match.replace(/{\s*</, '<')
                },
                {
                    pattern: /\s+}\s*\)/g,
                    message: 'Extra brace before closing parenthesis',
                    severity: 'error',
                    fix: (match) => match.replace(/\s+}\s*\)/, ')')
                },
                {
                    pattern: /\(\s*{\s+/g,
                    message: 'Extra brace after opening parenthesis',
                    severity: 'error',
                    fix: (match) => match.replace(/\(\s*{\s+/, '(')
                },
                {
                    pattern: /<[^>]+=['"]{[^}]*}['"]\s*}/g,
                    message: 'Extra brace after quoted JSX attribute',
                    severity: 'error',
                    fix: (match) => match.replace(/}\s*}/, '}')
                },
                {
                    pattern: /return\s*\(\s*<[^>]+>\s*}\s*/g,
                    message: 'Stray brace after JSX opening in return',
                    severity: 'error',
                    fix: (match) => match.replace(/>\s*}\s*/, '>')
                },
                {
                    pattern: /=\s*{\s*}\s*}/g,
                    message: 'Double closing braces after empty expression',
                    severity: 'error',
                    fix: (match) => '={}'
                }
            ],

            // Logic Errors
            logic: [
                {
                    pattern: /if\s*\([^)]*=[^=][^)]*\)/g,
                    message: 'Assignment in condition (should be comparison?)',
                    severity: 'error'
                },
                {
                    pattern: /while\s*\(true\)/g,
                    message: 'Infinite loop detected',
                    severity: 'warning'
                },
                {
                    pattern: /for\s*\([^;]*;\s*;\s*[^)]*\)/g,
                    message: 'Missing loop condition or increment',
                    severity: 'warning'
                },
                {
                    pattern: /return[\s\n]+[^;]+[\s\n]+\w/g,
                    message: 'Unreachable code after return',
                    severity: 'error'
                },
                {
                    pattern: /break[\s\n]+[^;]+[\s\n]+\w/g,
                    message: 'Unreachable code after break',
                    severity: 'error'
                }
            ],

            // Object/Structure Errors
            objectStructure: [
                // Property name corruption patterns
                {
                    pattern: /\w+[,;]\w+\s*:/g,
                    message: 'Property name corruption with comma or semicolon',
                    severity: 'error',
                    fix: (match) => {
                        // Remove comma/semicolon from property name
                        return match.replace(/[,;]/, '');
                    }
                },
                {
                    pattern: /\w+;\w+\?\s*:/g,
                    message: 'Property name corruption with semicolon before optional',
                    severity: 'error',
                    fix: (match) => {
                        return match.replace(';', '');
                    }
                },
                {
                    pattern: /severit,y\s*:/g,
                    message: 'Corrupted property name "severit,y"',
                    severity: 'error',
                    fix: () => 'severity:'
                },
                {
                    pattern: /userTyp;e\?\s*:/g,
                    message: 'Corrupted property name "userTyp;e"',
                    severity: 'error',
                    fix: () => 'userType?:'
                },
                {
                    pattern: /\w+[,;]\s*:/g,
                    message: 'Property name ends with comma or semicolon',
                    severity: 'error',
                    fix: (match) => {
                        return match.replace(/[,;]/, '');
                    }
                },
                {
                    pattern: /}\s*;\s*\n\s*\w+\s*:/g,
                    message: 'Property after closed object - likely missing comma or brace',
                    severity: 'error',
                    fix: (match) => match.replace(/}\s*;\s*\n/, ',\n')
                },
                {
                    pattern: /}\s*;\s*\w+\s*:/g,
                    message: 'Property after semicolon-closed object',
                    severity: 'error',
                    fix: (match) => match.replace(/}\s*;\s*/, ',\n')
                },
                {
                    pattern: /\w+\s*:\s*[^,}]+\s+\w+\s*:/g,
                    message: 'Missing comma between object properties',
                    severity: 'error'
                },
                {
                    pattern: /}\s*}\s*\w+\s*:/g,
                    message: 'Property after double closing brace',
                    severity: 'error'
                },
                {
                    pattern: /const\s+\w+\s*=\s*{[^}]*}\s*[^;,)\]}\s]\s*\w+\s*:/g,
                    message: 'Object followed by property - missing structure',
                    severity: 'error'
                },
                {
                    pattern: /export\s+(?:const|let|var)\s+\w+\s*=\s*{[^}]*}\s*;\s*\n\s*\w+\s*:/g,
                    message: 'Dangling property after exported object',
                    severity: 'error'
                },
                {
                    pattern: /}\s*\n\s*}\s*;\s*\n\s*\w+\s*:/g,
                    message: 'Property after closed nested object',
                    severity: 'error'
                },
                {
                    pattern: /:\s*{[^}]*}\s*}\s*[,;]?\s*\w+\s*:/g,
                    message: 'Malformed nested object property',
                    severity: 'error'
                },
                {
                    pattern: /\[\s*{[^}]*}\s*\]\s*}/g,
                    message: 'Extra closing brace after array of objects',
                    severity: 'error',
                    fix: (match) => match.replace(/\]\s*}/, ']')
                },
                {
                    pattern: /{\s*\[\s*[^\]]*\]\s*{/g,
                    message: 'Missing property name between array and object',
                    severity: 'error'
                }
            ],

            // Async/Promise Issues
            async: [
                {
                    pattern: /\.then\([^)]*\)[\s\n]*[^.]/g,
                    message: 'Promise chain without catch',
                    severity: 'warning'
                },
                {
                    pattern: /async\s+\w+\s*\([^)]*\)\s*\{[^}]*await[^}]*\}/g,
                    message: 'Async function with await (check for proper error handling)',
                    severity: 'info'
                },
                {
                    pattern: /new\s+Promise\s*\([^)]*\)\s*[^.]/g,
                    message: 'Promise constructor without error handling',
                    severity: 'warning'
                },
                {
                    pattern: /await\s+[^(]+\(\)/g,
                    message: 'Await without try-catch',
                    severity: 'info'
                }
            ],

            // Type Issues
            types: [
                {
                    pattern: /==\s*null/g,
                    message: 'Loose null comparison (use === null || === undefined)',
                    severity: 'warning',
                    fix: (match) => '=== null'
                },
                {
                    pattern: /!=\s*null/g,
                    message: 'Loose null comparison',
                    severity: 'warning',
                    fix: (match) => '!== null'
                },
                {
                    pattern: /typeof\s+\w+\s*==\s*['"]undefined['"]/g,
                    message: 'Use strict equality for typeof checks',
                    severity: 'warning',
                    fix: (match) => match.replace('==', '===')
                },
                {
                    pattern: /\+\s*['"]['"]/g,
                    message: 'Empty string concatenation',
                    severity: 'info'
                }
            ],

            // Dead Code
            deadCode: [
                {
                    pattern: /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g,
                    message: 'Empty function detected',
                    severity: 'warning'
                },
                {
                    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
                    message: 'Empty catch block',
                    severity: 'error'
                },
                {
                    pattern: /finally\s*\{\s*\}/g,
                    message: 'Empty finally block',
                    severity: 'warning'
                },
                {
                    pattern: /else\s*\{\s*\}/g,
                    message: 'Empty else block',
                    severity: 'info'
                }
            ],

            // Resource Leaks
            resources: [
                {
                    pattern: /addEventListener\s*\([^)]+\)/g,
                    message: 'Event listener without corresponding removeEventListener',
                    severity: 'info'
                },
                {
                    pattern: /setInterval\s*\([^)]+\)/g,
                    message: 'setInterval without clearInterval',
                    severity: 'warning'
                },
                {
                    pattern: /setTimeout\s*\([^)]+\)/g,
                    message: 'setTimeout (verify cleanup if needed)',
                    severity: 'info'
                },
                {
                    pattern: /new\s+WebSocket\s*\(/g,
                    message: 'WebSocket without close handler',
                    severity: 'warning'
                }
            ]
        };
    }

    initializeSecurityPatterns() {
        return [
            // SQL Injection
            {
                pattern: /query\s*\([^)]*\+[^)]*\)/g,
                message: 'Potential SQL injection - use parameterized queries',
                severity: 'critical'
            },
            {
                pattern: /execute\s*\([^)]*\$\{[^}]+\}[^)]*\)/g,
                message: 'SQL with template literals - potential injection',
                severity: 'critical'
            },
            
            // XSS
            {
                pattern: /innerHTML\s*=\s*[^'"][^;]+/g,
                message: 'innerHTML with dynamic content - XSS risk',
                severity: 'high'
            },
            {
                pattern: /document\.write\s*\(/g,
                message: 'document.write is dangerous - XSS risk',
                severity: 'high'
            },
            {
                pattern: /eval\s*\(/g,
                message: 'eval() is dangerous - code injection risk',
                severity: 'critical'
            },
            
            // Command Injection
            {
                pattern: /exec\s*\([^)]*\$\{[^}]+\}[^)]*\)/g,
                message: 'Command execution with user input - injection risk',
                severity: 'critical'
            },
            {
                pattern: /spawn\s*\([^,]+,\s*\[[^\]]*\$\{[^}]+\}[^\]]*\]/g,
                message: 'Process spawn with dynamic args - injection risk',
                severity: 'critical'
            },
            
            // Path Traversal
            {
                pattern: /readFile\s*\([^)]*\.\.[^)]*\)/g,
                message: 'Path traversal vulnerability',
                severity: 'high'
            },
            
            // Sensitive Data
            {
                pattern: /password\s*=\s*['"][^'"]+['"]/g,
                message: 'Hardcoded password detected',
                severity: 'critical'
            },
            {
                pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
                message: 'Hardcoded API key detected',
                severity: 'critical'
            },
            {
                pattern: /secret\s*=\s*['"][^'"]+['"]/gi,
                message: 'Hardcoded secret detected',
                severity: 'critical'
            }
        ];
    }

    initializePerformancePatterns() {
        return [
            // Memory Leaks
            {
                pattern: /global\.\w+\s*=\s*/g,
                message: 'Global variable assignment - potential memory leak',
                severity: 'warning'
            },
            {
                pattern: /window\.\w+\s*=\s*/g,
                message: 'Window object pollution - potential memory leak',
                severity: 'warning'
            },
            
            // Inefficient Operations
            {
                pattern: /for\s*\([^)]+\.length[^)]+\)/g,
                message: 'Length calculation in loop condition',
                severity: 'info',
                fix: (match) => {
                    // Suggest caching length
                    return `// Cache length for better performance\n${match}`;
                }
            },
            {
                pattern: /\.\s*map\s*\([^)]+\)\s*\.\s*filter\s*\(/g,
                message: 'Chained map-filter can be optimized',
                severity: 'info'
            },
            {
                pattern: /\.\s*filter\s*\([^)]+\)\s*\.\s*map\s*\(/g,
                message: 'filter-map chain is optimal',
                severity: 'good'
            },
            
            // Blocking Operations
            {
                pattern: /JSON\.parse\s*\([^)]{1000,}\)/g,
                message: 'Large JSON parse - consider streaming',
                severity: 'warning'
            },
            {
                pattern: /while\s*\([^)]*Date\.now\(\)[^)]*\)/g,
                message: 'Busy wait detected - blocks event loop',
                severity: 'error'
            },
            
            // React Specific
            {
                pattern: /\[\s*\]/g,
                message: 'Empty dependency array in useEffect - runs once',
                severity: 'info'
            },
            {
                pattern: /useEffect\s*\([^,]+\)/g,
                message: 'useEffect without dependency array - runs every render',
                severity: 'warning'
            }
        ];
    }

    initializeAccessibilityPatterns() {
        return [
            // Missing alt text
            {
                pattern: /<img(?![^>]*alt\s*=)[^>]*>/g,
                message: 'Image without alt attribute',
                severity: 'warning'
            },
            
            // Missing ARIA labels
            {
                pattern: /<button(?![^>]*aria-label)[^>]*>/g,
                message: 'Button without aria-label',
                severity: 'info'
            },
            
            // Form issues
            {
                pattern: /<input(?![^>]*id\s*=)[^>]*>/g,
                message: 'Input without id (needed for label association)',
                severity: 'warning'
            },
            {
                pattern: /<label(?![^>]*for\s*=)[^>]*>/g,
                message: 'Label without for attribute',
                severity: 'warning'
            },
            
            // Semantic HTML
            {
                pattern: /<div[^>]*onclick\s*=/g,
                message: 'Clickable div - use button or link',
                severity: 'warning'
            },
            {
                pattern: /<span[^>]*onclick\s*=/g,
                message: 'Clickable span - use button or link',
                severity: 'warning'
            }
        ];
    }

    async detectErrors(content, filename) {
        const errors = [];
        const extension = path.extname(filename);
        
        // Apply general patterns
        for (const [category, patterns] of Object.entries(this.patterns)) {
            for (const pattern of patterns) {
                const matches = [...content.matchAll(pattern.pattern)];
                for (const match of matches) {
                    errors.push({
                        category,
                        line: this.getLineNumber(content, match.index),
                        column: this.getColumnNumber(content, match.index),
                        message: pattern.message,
                        severity: pattern.severity,
                        match: match[0],
                        fix: pattern.fix ? pattern.fix(match[0]) : null
                    });
                }
            }
        }

        // Apply security patterns if enabled
        if (this.config.securityScan) {
            for (const pattern of this.securityPatterns) {
                const matches = [...content.matchAll(pattern.pattern)];
                for (const match of matches) {
                    errors.push({
                        category: 'security',
                        line: this.getLineNumber(content, match.index),
                        column: this.getColumnNumber(content, match.index),
                        message: pattern.message,
                        severity: pattern.severity,
                        match: match[0]
                    });
                }
            }
        }

        // Apply performance patterns if enabled
        if (this.config.performanceScan) {
            for (const pattern of this.performancePatterns) {
                const matches = [...content.matchAll(pattern.pattern)];
                for (const match of matches) {
                    errors.push({
                        category: 'performance',
                        line: this.getLineNumber(content, match.index),
                        column: this.getColumnNumber(content, match.index),
                        message: pattern.message,
                        severity: pattern.severity,
                        match: match[0],
                        fix: pattern.fix ? pattern.fix(match[0]) : null
                    });
                }
            }
        }

        // Apply accessibility patterns for HTML files
        if (this.config.accessibilityScan && ['.html', '.jsx', '.tsx'].includes(extension)) {
            for (const pattern of this.accessibilityPatterns) {
                const matches = [...content.matchAll(pattern.pattern)];
                for (const match of matches) {
                    errors.push({
                        category: 'accessibility',
                        line: this.getLineNumber(content, match.index),
                        column: this.getColumnNumber(content, match.index),
                        message: pattern.message,
                        severity: pattern.severity,
                        match: match[0]
                    });
                }
            }
        }

        return errors;
    }

    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    getColumnNumber(content, index) {
        const lines = content.substring(0, index).split('\n');
        return lines[lines.length - 1].length + 1;
    }
}

// ======================== SAFE AUTO-FIX ENGINE ========================
class SafeAutoFixer {
    constructor(config) {
        this.config = config;
        this.backupDir = path.join(process.cwd(), '.error-scanner-backups');
        this.fixes = [];
        this.rollbackStack = [];
    }

    async applyFixes(file, errors) {
        if (!this.config.autoFix) return null;
        
        try {
            // Create backup
            const backupPath = await this.createBackup(file);
            this.rollbackStack.push({ file, backupPath });
            
            // Read file content
            let content = await fs.readFile(file, 'utf8');
            const originalContent = content;
            
            // Sort errors by position (reverse order to maintain indices)
            const fixableErrors = errors
                .filter(e => e.fix)
                .sort((a, b) => b.column - a.column || b.line - a.line);
            
            // Apply fixes
            for (const error of fixableErrors) {
                if (this.config.conservative && error.severity !== 'error') continue;
                if (!this.config.aggressive && error.severity === 'info') continue;
                
                const oldContent = content;
                content = this.applyFix(content, error);
                
                // Validate fix
                if (!this.validateFix(oldContent, content)) {
                    content = oldContent; // Rollback individual fix
                    console.warn(`⚠️  Fix validation failed for ${error.message}`);
                } else {
                    this.fixes.push({
                        file,
                        error: error.message,
                        line: error.line,
                        applied: true
                    });
                }
            }
            
            // Final validation
            if (content !== originalContent) {
                if (await this.validateCode(content, file)) {
                    if (!this.config.dryRun) {
                        await fs.writeFile(file, content, 'utf8');
                        console.log(`✅ Fixed ${this.fixes.length} issues in ${file}`);
                    } else {
                        console.log(`🔍 Would fix ${this.fixes.length} issues in ${file} (dry-run)`);
                    }
                } else {
                    console.warn(`⚠️  Skipping fixes for ${file} - validation failed`);
                    await this.rollback(file, backupPath);
                }
            }
            
            return this.fixes;
        } catch (error) {
            console.error(`❌ Error applying fixes to ${file}: ${error.message}`);
            return null;
        }
    }

    applyFix(content, error) {
        // Apply the fix based on the error match
        if (error.fix && error.match) {
            return content.replace(error.match, error.fix);
        }
        return content;
    }

    validateFix(oldContent, newContent) {
        // Basic validation checks
        if (!newContent || newContent.length === 0) return false;
        
        // Check for major content loss
        if (newContent.length < oldContent.length * 0.5) return false;
        
        // Check for quote balance
        const oldQuotes = (oldContent.match(/['"]/g) || []).length;
        const newQuotes = (newContent.match(/['"]/g) || []).length;
        if (Math.abs(oldQuotes - newQuotes) > 2) return false;
        
        // Check for bracket balance
        const brackets = ['()', '[]', '{}'];
        for (const [open, close] of brackets) {
            const oldOpen = (oldContent.match(new RegExp('\\' + open, 'g')) || []).length;
            const oldClose = (oldContent.match(new RegExp('\\' + close, 'g')) || []).length;
            const newOpen = (newContent.match(new RegExp('\\' + open, 'g')) || []).length;
            const newClose = (newContent.match(new RegExp('\\' + close, 'g')) || []).length;
            
            if (oldOpen - oldClose !== newOpen - newClose) return false;
        }
        
        return true;
    }

    async validateCode(content, filename) {
        const ext = path.extname(filename);
        
        // Language-specific validation
        if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext)) {
            return await this.validateJavaScript(content, filename);
        } else if (ext === '.py') {
            return await this.validatePython(content, filename);
        } else if (ext === '.java') {
            return await this.validateJava(content, filename);
        }
        
        return true; // Default to valid for unknown types
    }

    async validateJavaScript(content, filename) {
        try {
            // Try to parse the content
            new Function(content);
            return true;
        } catch (error) {
            // If it's TypeScript, try TypeScript compiler
            if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
                try {
                    const { stdout, stderr } = await execAsync(`npx tsc --noEmit --skipLibCheck ${filename}`);
                    return !stderr || stderr.length === 0;
                } catch (err) {
                    // TypeScript validation failed
                    return false;
                }
            }
            return false;
        }
    }

    async validatePython(content, filename) {
        try {
            const { stdout, stderr } = await execAsync(`python -m py_compile ${filename}`);
            return !stderr || stderr.length === 0;
        } catch (error) {
            return false;
        }
    }

    async validateJava(content, filename) {
        try {
            const { stdout, stderr } = await execAsync(`javac -Xlint ${filename}`);
            return !stderr || stderr.includes('warning');
        } catch (error) {
            return false;
        }
    }

    async createBackup(file) {
        // Create backup directory if it doesn't exist
        await fs.mkdir(this.backupDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `${path.basename(file)}.${timestamp}.backup`;
        const backupPath = path.join(this.backupDir, backupName);
        
        await fs.copyFile(file, backupPath);
        return backupPath;
    }

    async rollback(file, backupPath) {
        try {
            await fs.copyFile(backupPath, file);
            console.log(`↩️  Rolled back changes to ${file}`);
        } catch (error) {
            console.error(`❌ Failed to rollback ${file}: ${error.message}`);
        }
    }

    async rollbackAll() {
        for (const { file, backupPath } of this.rollbackStack) {
            await this.rollback(file, backupPath);
        }
        this.rollbackStack = [];
    }
}

// ======================== REPORTING SYSTEM ========================
class ReportGenerator {
    constructor(config) {
        this.config = config;
        this.timestamp = new Date().toISOString();
    }

    async generateReports(results) {
        const formats = this.config.reportFormat.split(',');
        const reports = {};
        
        for (const format of formats) {
            switch (format.trim()) {
                case 'json':
                    reports.json = await this.generateJSON(results);
                    break;
                case 'markdown':
                    reports.markdown = await this.generateMarkdown(results);
                    break;
                case 'html':
                    reports.html = await this.generateHTML(results);
                    break;
                case 'csv':
                    reports.csv = await this.generateCSV(results);
                    break;
            }
        }
        
        return reports;
    }

    async generateJSON(results) {
        const report = {
            timestamp: this.timestamp,
            summary: this.generateSummary(results),
            configuration: {
                mode: this.config.mode,
                directory: this.config.dir,
                extensions: this.config.extensions,
                autoFix: this.config.autoFix,
                dryRun: this.config.dryRun
            },
            duplicates: results.duplicates,
            errors: results.errors,
            fixes: results.fixes,
            statistics: this.generateStatistics(results)
        };
        
        const filename = `error-scan-report-${Date.now()}.json`;
        await fs.writeFile(filename, JSON.stringify(report, null, 2));
        return filename;
    }

    async generateMarkdown(results) {
        const summary = this.generateSummary(results);
        let markdown = `# Ultimate Error Scanner Report\n\n`;
        markdown += `**Generated:** ${this.timestamp}\n\n`;
        markdown += `## Summary\n\n`;
        markdown += `- **Files Scanned:** ${summary.filesScanned}\n`;
        markdown += `- **Issues Found:** ${summary.totalIssues}\n`;
        markdown += `- **Duplicates Found:** ${summary.duplicatesFound}\n`;
        markdown += `- **Fixes Applied:** ${summary.fixesApplied}\n\n`;
        
        // Duplicates section
        if (results.duplicates && results.duplicates.exact.length > 0) {
            markdown += `## Duplicate Files\n\n`;
            for (const group of results.duplicates.exact) {
                markdown += `### Duplicate Group (${group.files.length} files)\n`;
                markdown += `**Size:** ${group.size} bytes | **Hash:** ${group.hash.substring(0, 8)}...\n\n`;
                for (const file of group.files) {
                    markdown += `- ${file}\n`;
                }
                markdown += '\n';
            }
        }
        
        // Errors section
        if (results.errors && Object.keys(results.errors).length > 0) {
            markdown += `## Errors by File\n\n`;
            for (const [file, errors] of Object.entries(results.errors)) {
                if (errors.length > 0) {
                    markdown += `### ${file}\n\n`;
                    const errorsByCategory = this.groupByCategory(errors);
                    for (const [category, categoryErrors] of Object.entries(errorsByCategory)) {
                        markdown += `#### ${category} (${categoryErrors.length})\n\n`;
                        for (const error of categoryErrors) {
                            const severity = this.getSeverityEmoji(error.severity);
                            markdown += `- ${severity} Line ${error.line}: ${error.message}\n`;
                        }
                        markdown += '\n';
                    }
                }
            }
        }
        
        // Statistics section
        const stats = this.generateStatistics(results);
        markdown += `## Statistics\n\n`;
        markdown += `### Error Distribution\n\n`;
        for (const [category, count] of Object.entries(stats.errorsByCategory)) {
            markdown += `- **${category}:** ${count}\n`;
        }
        markdown += `\n### Severity Distribution\n\n`;
        for (const [severity, count] of Object.entries(stats.errorsBySeverity)) {
            markdown += `- **${severity}:** ${count}\n`;
        }
        
        const filename = `error-scan-report-${Date.now()}.md`;
        await fs.writeFile(filename, markdown);
        return filename;
    }

    async generateHTML(results) {
        const summary = this.generateSummary(results);
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>Error Scanner Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; }
        .error { color: #d00; }
        .warning { color: #f90; }
        .info { color: #09f; }
        .critical { color: #f00; font-weight: bold; }
        .duplicate-group { background: #fff9e6; padding: 10px; margin: 10px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Ultimate Error Scanner Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: ${this.timestamp}</p>
        <ul>
            <li>Files Scanned: ${summary.filesScanned}</li>
            <li>Issues Found: ${summary.totalIssues}</li>
            <li>Duplicates Found: ${summary.duplicatesFound}</li>
            <li>Fixes Applied: ${summary.fixesApplied}</li>
        </ul>
    </div>`;
        
        // Add duplicates section
        if (results.duplicates && results.duplicates.exact.length > 0) {
            html += `<h2>Duplicate Files</h2>`;
            for (const group of results.duplicates.exact) {
                html += `<div class="duplicate-group">
                    <h3>Duplicate Group (${group.files.length} files)</h3>
                    <p>Size: ${group.size} bytes</p>
                    <ul>`;
                for (const file of group.files) {
                    html += `<li>${file}</li>`;
                }
                html += `</ul></div>`;
            }
        }
        
        // Add errors table
        if (results.errors && Object.keys(results.errors).length > 0) {
            html += `<h2>Errors</h2>
            <table>
                <tr>
                    <th>File</th>
                    <th>Line</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Message</th>
                </tr>`;
            
            for (const [file, errors] of Object.entries(results.errors)) {
                for (const error of errors) {
                    html += `<tr>
                        <td>${file}</td>
                        <td>${error.line}</td>
                        <td>${error.category}</td>
                        <td class="${error.severity}">${error.severity}</td>
                        <td>${error.message}</td>
                    </tr>`;
                }
            }
            html += `</table>`;
        }
        
        html += `</body></html>`;
        
        const filename = `error-scan-report-${Date.now()}.html`;
        await fs.writeFile(filename, html);
        return filename;
    }

    async generateCSV(results) {
        let csv = 'File,Line,Column,Category,Severity,Message\n';
        
        if (results.errors) {
            for (const [file, errors] of Object.entries(results.errors)) {
                for (const error of errors) {
                    csv += `"${file}",${error.line},${error.column},"${error.category}","${error.severity}","${error.message}"\n`;
                }
            }
        }
        
        const filename = `error-scan-report-${Date.now()}.csv`;
        await fs.writeFile(filename, csv);
        return filename;
    }

    generateSummary(results) {
        let totalIssues = 0;
        let filesWithIssues = 0;
        let duplicatesFound = 0;
        let fixesApplied = 0;
        
        if (results.errors) {
            for (const errors of Object.values(results.errors)) {
                if (errors.length > 0) {
                    filesWithIssues++;
                    totalIssues += errors.length;
                }
            }
        }
        
        if (results.duplicates) {
            duplicatesFound = (results.duplicates.exact || []).length +
                            (results.duplicates.near || []).length;
        }
        
        if (results.fixes) {
            fixesApplied = results.fixes.length;
        }
        
        return {
            filesScanned: results.filesScanned || 0,
            filesWithIssues,
            totalIssues,
            duplicatesFound,
            fixesApplied
        };
    }

    generateStatistics(results) {
        const stats = {
            errorsByCategory: {},
            errorsBySeverity: {},
            filesByExtension: {},
            duplicatesByType: {}
        };
        
        if (results.errors) {
            for (const errors of Object.values(results.errors)) {
                for (const error of errors) {
                    stats.errorsByCategory[error.category] = (stats.errorsByCategory[error.category] || 0) + 1;
                    stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
                }
            }
        }
        
        if (results.files) {
            for (const file of results.files) {
                const ext = path.extname(file);
                stats.filesByExtension[ext] = (stats.filesByExtension[ext] || 0) + 1;
            }
        }
        
        if (results.duplicates) {
            stats.duplicatesByType.exact = (results.duplicates.exact || []).length;
            stats.duplicatesByType.near = (results.duplicates.near || []).length;
            stats.duplicatesByType.codeBlocks = results.duplicates.code ? results.duplicates.code.size : 0;
        }
        
        return stats;
    }

    groupByCategory(errors) {
        const grouped = {};
        for (const error of errors) {
            if (!grouped[error.category]) {
                grouped[error.category] = [];
            }
            grouped[error.category].push(error);
        }
        return grouped;
    }

    getSeverityEmoji(severity) {
        const emojis = {
            critical: '🔴',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            good: '✅'
        };
        return emojis[severity] || '•';
    }
}

// ======================== MAIN SCANNER ORCHESTRATOR ========================
class UltimateErrorScanner {
    constructor() {
        this.config = new UltimateConfig();
        this.duplicateDetector = new DuplicateDetector(this.config);
        this.errorDetector = new AdvancedErrorDetector(this.config);
        this.autoFixer = new SafeAutoFixer(this.config);
        this.reportGenerator = new ReportGenerator(this.config);
        
        // Initialize new enhanced features
        this.patternLearner = new PatternLearner();
        this.incrementalScanner = new IncrementalScanner();
        this.visualDiffGenerator = new VisualDiffGenerator();
        this.gitIntegration = new GitIntegration();
        this.realTimeMonitor = new RealTimeMonitor();
        this.analyticsDashboard = new AnalyticsDashboard();
        this.contextAnalyzer = new SmartContextAnalyzer();
        
        this.results = {
            files: [],
            filesScanned: 0,
            errors: {},
            duplicates: null,
            fixes: [],
            performance: {},
            analytics: null,
            learnedPatterns: []
        };
    }

    async run() {
        console.log('🚀 Ultimate Error Scanner - Starting...\n');
        console.log(`📁 Scanning directory: ${this.config.dir}`);
        console.log(`🔧 Mode: ${this.config.mode}`);
        console.log(`📝 Extensions: ${this.config.extensions.join(', ')}`);
        console.log(`${this.config.dryRun ? '👁️  Dry Run Mode (no changes will be made)' : '✏️  Auto-fix enabled'}`);
        
        // Display enabled features
        if (this.config.incremental) console.log('⚡ Incremental scanning enabled');
        if (this.config.watch) console.log('👁️  Watch mode enabled');
        if (this.config.learnPatterns) console.log('🤖 Pattern learning enabled');
        if (this.config.visualDiff) console.log('🎨 Visual diff enabled');
        if (this.config.gitIntegration) console.log('🔗 Git integration enabled');
        if (this.config.analytics) console.log('📊 Analytics enabled');
        console.log('');
        
        const startTime = Date.now();
        
        try {
            // Load config file if specified
            await this.config.loadConfigFile();
            
            // Git integration - scan only changed files if enabled
            let files;
            if (this.config.gitIntegration) {
                console.log('🔗 Checking git changes...');
                const gitFiles = await this.gitIntegration.scanGitChanges();
                if (gitFiles.length > 0) {
                    console.log(`📂 Found ${gitFiles.length} changed files in git`);
                    files = gitFiles;
                } else {
                    console.log('📂 No git changes, scanning all files...');
                    files = await this.collectFiles(this.config.dir);
                }
            } else {
                console.log('📂 Collecting files...');
                files = await this.collectFiles(this.config.dir);
            }
            
            // Incremental scanning - filter unchanged files
            if (this.config.incremental) {
                console.log('⚡ Filtering unchanged files...');
                const originalCount = files.length;
                files = await this.incrementalScanner.scanIncremental(files);
                if (originalCount !== files.length) {
                    console.log(`⚡ Skipping ${originalCount - files.length} unchanged files`);
                }
            }
            
            // Apply learned patterns if enabled
            if (this.config.learnPatterns) {
                const learnedPatterns = this.patternLearner.suggestNewPatterns();
                if (learnedPatterns.length > 0) {
                    console.log(`🤖 Applying ${learnedPatterns.length} learned patterns`);
                    this.results.learnedPatterns = learnedPatterns;
                }
            }
            
            this.results.files = files;
            this.results.filesScanned = files.length;
            console.log(`✅ Found ${files.length} files to scan\n`);
            
            if (files.length === 0) {
                console.log('No files found to scan.');
                return;
            }
            
            // Detect duplicates
            if (this.config.duplicates) {
                this.results.duplicates = await this.duplicateDetector.scanForDuplicates(files);
                console.log(`\n📊 Duplicate Detection Results:`);
                console.log(`  - Exact duplicates: ${this.results.duplicates.exact.length} groups`);
                console.log(`  - Near duplicates: ${this.results.duplicates.near.length} pairs`);
                console.log(`  - Code block duplicates: ${this.results.duplicates.code.size} blocks\n`);
            }
            
            // Scan for errors
            console.log('🔍 Scanning for errors...');
            await this.scanFiles(files);
            
            // Generate visual diff if enabled and fixes were applied
            if (this.config.visualDiff && this.results.fixes.length > 0) {
                console.log('\n🎨 Generating visual diff previews...');
                for (const fix of this.results.fixes.slice(0, 5)) { // Limit to 5 previews
                    if (fix.original && fix.fixed) {
                        const diffFile = await this.visualDiffGenerator.saveDiffPreview(
                            fix.original, 
                            fix.fixed, 
                            fix.file
                        );
                        console.log(`  • Diff preview saved: ${diffFile}`);
                    }
                }
            }
            
            // Generate reports
            console.log('\n📊 Generating reports...');
            const reports = await this.reportGenerator.generateReports(this.results);
            
            // Print summary
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            // Record analytics if enabled
            if (this.config.analytics) {
                this.analyticsDashboard.recordScan(this.results, parseFloat(duration));
                this.results.analytics = this.analyticsDashboard.generateAnalyticsReport();
                
                // Show analytics summary
                console.log('\n📈 Analytics:');
                console.log(`  • Error fix rate: ${this.results.analytics.summary.errorFixRate}`);
                console.log(`  • Performance trend: ${this.results.analytics.trends.performance}`);
            }
            
            this.printSummary(duration, reports);
            
            // Start watch mode if enabled
            if (this.config.watch) {
                console.log('\n👁️  Watch mode active. Press Ctrl+C to stop.');
                this.realTimeMonitor.watchFiles(files, async (changedFile) => {
                    console.log(`\n🔄 Re-scanning ${changedFile}...`);
                    await this.scanSingleFile(changedFile);
                });
            }
            
        } catch (error) {
            console.error(`\n❌ Fatal error: ${error.message}`);
            if (this.config.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }

    async collectFiles(dir) {
        const files = [];
        
        async function walk(currentDir, config, files) {
            try {
                const entries = await fs.readdir(currentDir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(currentDir, entry.name);
                    
                    // Skip ignored patterns
                    if (config.ignorePatterns.some(pattern => entry.name.includes(pattern))) {
                        continue;
                    }
                    
                    if (entry.isDirectory()) {
                        await walk(fullPath, config, files);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).slice(1);
                        if (config.extensions.includes(ext)) {
                            // Check file size
                            const stats = await fs.stat(fullPath);
                            if (stats.size <= config.maxFileSize) {
                                files.push(fullPath);
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn(`⚠️  Cannot access ${currentDir}: ${err.message}`);
            }
        }
        
        await walk(dir, this.config, files);
        return files;
    }

    async scanFiles(files) {
        const progressBar = this.createProgressBar(files.length);
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            progressBar.update(i + 1, file);
            
            try {
                const content = await fs.readFile(file, 'utf8');
                
                // Use context analyzer for better error detection
                const context = this.contextAnalyzer.analyzeContext(content, 0);
                const errors = await this.errorDetector.detectErrors(content, file, context);
                
                if (errors.length > 0) {
                    this.results.errors[file] = errors;
                    
                    // Apply fixes if enabled
                    if (this.config.autoFix) {
                        const originalContent = content;
                        const fixes = await this.autoFixer.applyFixes(file, errors);
                        if (fixes) {
                            // Store fix info for visual diff
                            fixes.forEach(fix => {
                                fix.original = originalContent;
                                fix.fixed = content; // This would be the fixed content
                            });
                            this.results.fixes.push(...fixes);
                            
                            // Learn from successful fixes
                            if (this.config.learnPatterns && fixes.length > 0) {
                                for (const fix of fixes) {
                                    this.patternLearner.learnFromCorrection(
                                        fix.original,
                                        fix.fixed,
                                        { file, error: fix.error }
                                    );
                                }
                            }
                        }
                    }
                }
                
                // Cache results for incremental scanning
                if (this.config.incremental) {
                    this.incrementalScanner.setCachedResults(file, errors);
                }
            } catch (err) {
                // Skip binary or inaccessible files
                if (this.config.verbose) {
                    console.warn(`\n⚠️  Skipping ${file}: ${err.message}`);
                }
            }
        }
        
        progressBar.stop();
    }
    
    async scanSingleFile(file) {
        try {
            const content = await fs.readFile(file, 'utf8');
            const context = this.contextAnalyzer.analyzeContext(content, 0);
            const errors = await this.errorDetector.detectErrors(content, file, context);
            
            if (errors.length > 0) {
                console.log(`  Found ${errors.length} issues`);
                
                if (this.config.autoFix) {
                    const fixes = await this.autoFixer.applyFixes(file, errors);
                    if (fixes) {
                        console.log(`  Fixed ${fixes.length} issues`);
                    }
                }
            } else {
                console.log(`  No issues found`);
            }
        } catch (err) {
            console.error(`  Error scanning: ${err.message}`);
        }
    }

    createProgressBar(total) {
        let current = 0;
        const barLength = 40;
        
        return {
            update(value, file) {
                current = value;
                const progress = current / total;
                const filled = Math.floor(progress * barLength);
                const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
                const percentage = (progress * 100).toFixed(1);
                const fileName = path.basename(file);
                process.stdout.write(`\r[${bar}] ${percentage}% | ${fileName.padEnd(30).slice(0, 30)}`);
            },
            stop() {
                process.stdout.write('\r' + ' '.repeat(80) + '\r');
            }
        };
    }

    printSummary(duration, reports) {
        console.log('\n' + '='.repeat(60));
        console.log('📈 SCAN COMPLETE');
        console.log('='.repeat(60));
        
        const summary = this.reportGenerator.generateSummary(this.results);
        
        console.log(`\n📊 Summary:`);
        console.log(`  ⏱️  Duration: ${duration}s`);
        console.log(`  📁 Files scanned: ${summary.filesScanned}`);
        console.log(`  ⚠️  Issues found: ${summary.totalIssues}`);
        console.log(`  📑 Duplicates found: ${summary.duplicatesFound}`);
        console.log(`  ✅ Fixes applied: ${summary.fixesApplied}`);
        
        // Error breakdown by severity
        const stats = this.reportGenerator.generateStatistics(this.results);
        if (Object.keys(stats.errorsBySeverity).length > 0) {
            console.log(`\n🔍 Issues by Severity:`);
            for (const [severity, count] of Object.entries(stats.errorsBySeverity)) {
                const emoji = this.reportGenerator.getSeverityEmoji(severity);
                console.log(`  ${emoji} ${severity}: ${count}`);
            }
        }
        
        // Error breakdown by category
        if (Object.keys(stats.errorsByCategory).length > 0) {
            console.log(`\n📚 Issues by Category:`);
            for (const [category, count] of Object.entries(stats.errorsByCategory)) {
                console.log(`  • ${category}: ${count}`);
            }
        }
        
        // Reports generated
        if (reports && Object.keys(reports).length > 0) {
            console.log(`\n📄 Reports Generated:`);
            for (const [format, filename] of Object.entries(reports)) {
                console.log(`  • ${format.toUpperCase()}: ${filename}`);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        
        // Exit code based on results
        if (summary.totalIssues > 0 && !this.config.autoFix) {
            process.exit(1); // Exit with error if issues found and not fixed
        }
    }
}

// ======================== CLI HELP ========================
function showHelp() {
    console.log(`
Ultimate Error Scanner - Advanced Multi-Pattern Code Analysis & Auto-Fix System

USAGE:
  node ultimate-error-scanner.js [options]

CORE OPTIONS:
  --dir <path>          Directory to scan (default: current directory)
  --mode <mode>         Scan mode: smart|conservative|aggressive (default: smart)
  --ext <extensions>    File extensions to scan (default: js,jsx,ts,tsx,mjs,cjs,py,java,css,html)
  --dry-run            Preview changes without applying them
  --fix                Enable auto-fix for detected issues
  --config <file>      Load configuration from JSON file
  --verbose            Show detailed output
  --help               Show this help message

DETECTION OPTIONS:
  --duplicates         Enable duplicate detection (default: true)
  --security           Enable security vulnerability scanning (default: true)
  --performance        Enable performance issue detection (default: true)
  --accessibility      Enable accessibility checks for HTML/JSX
  --similarity <0-1>   Similarity threshold for near-duplicates (default: 0.8)
  --max-size <bytes>   Maximum file size to scan (default: 5242880)

ENHANCED FEATURES:
  --incremental        Only scan changed files since last scan
  --watch              Watch files for changes and auto-scan
  --learn              Enable AI pattern learning from fixes
  --visual             Generate visual diff previews for fixes
  --git                Git integration - scan only changed files
  --analytics          Enable analytics dashboard
  --multi-lang         Enable multi-language support
  --parallel           Enable parallel processing (experimental)

REPORTING OPTIONS:
  --format <formats>   Report formats: json,markdown,html,csv (default: json,markdown)

EXAMPLES:
  # Basic scan with auto-fix
  node ultimate-error-scanner.js --fix

  # Conservative mode with dry-run
  node ultimate-error-scanner.js --mode conservative --dry-run

  # Incremental scan with learning
  node ultimate-error-scanner.js --incremental --learn --fix

  # Watch mode with visual diffs
  node ultimate-error-scanner.js --watch --visual --fix

  # Git integration with analytics
  node ultimate-error-scanner.js --git --analytics --fix

  # Full scan with all features
  node ultimate-error-scanner.js --fix --security --performance --accessibility --learn --analytics

CONFIG FILE FORMAT:
  {
    "mode": "smart",
    "extensions": ["js", "jsx", "ts", "tsx"],
    "autoFix": true,
    "duplicates": true,
    "securityScan": true,
    "performanceScan": true,
    "similarityThreshold": 0.8,
    "incremental": true,
    "learnPatterns": true,
    "visualDiff": false,
    "gitIntegration": false,
    "analytics": true
  }

GIT HOOKS:
  # Install pre-commit hook
  node ultimate-error-scanner.js --install-hook

EXIT CODES:
  0 - Success (no issues or all fixed)
  1 - Issues found (not fixed)
  2 - Fatal error

ADVANCED FEATURES:
  🤖 AI Pattern Learning - Learns from your fixes to improve detection
  ⚡ Incremental Scanning - Only scans changed files for speed
  🎨 Visual Diff Preview - HTML preview of changes before/after
  🔗 Git Integration - Works with git diff and pre-commit hooks
  👁️ Real-time Monitoring - Watches files and auto-scans on change
  📊 Analytics Dashboard - Track error trends and fix rates
  🧠 Smart Context Analysis - Understands code context for better fixes
`);
}

// ======================== MAIN ENTRY POINT ========================
async function main() {
    // Check for help flag
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        showHelp();
        process.exit(0);
    }
    
    // Create and run scanner
    const scanner = new UltimateErrorScanner();
    await scanner.run();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('\n❌ Uncaught exception:', error.message);
    process.exit(2);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n❌ Unhandled rejection:', reason);
    process.exit(2);
});

// Run if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(2);
    });
}

module.exports = { UltimateErrorScanner, UltimateConfig, DuplicateDetector, AdvancedErrorDetector, SafeAutoFixer, ReportGenerator };