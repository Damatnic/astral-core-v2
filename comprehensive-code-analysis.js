/**
 * COMPREHENSIVE CODE ANALYSIS TOOL
 * Performs extensive analysis of the entire CoreV2 codebase
 * to identify all remaining issues, errors, and improvement areas
 */

const fs = require('fs');
const path = require('path');

class CodeAnalyzer {
  constructor() {
    this.results = {
      syntaxErrors: [],
      importErrors: [],
      typeErrors: [],
      logicErrors: [],
      performanceIssues: [],
      securityConcerns: [],
      codeSmells: [],
      dependencies: [],
      buildIssues: [],
      testingNeeds: [],
      documentationGaps: [],
      accessibilityIssues: []
    };
    
    this.fileStats = {
      totalFiles: 0,
      analyzedFiles: 0,
      skipeedFiles: 0,
      errorCount: 0
    };
  }

  analyzeFile(filePath, content) {
    const relativePath = path.relative(process.cwd(), filePath);
    const extension = path.extname(filePath);
    
    console.log(`Analyzing: ${relativePath}`);
    
    try {
      // Syntax Error Detection
      this.checkSyntaxErrors(relativePath, content);
      
      // Import/Export Analysis
      this.analyzeImports(relativePath, content);
      
      // TypeScript Specific Issues
      if (extension === '.ts' || extension === '.tsx') {
        this.analyzeTypeScript(relativePath, content);
      }
      
      // React Specific Issues
      if (extension === '.tsx' || extension === '.jsx') {
        this.analyzeReact(relativePath, content);
      }
      
      // Logic and Structure Analysis
      this.analyzeLogic(relativePath, content);
      
      // Performance Analysis
      this.analyzePerformance(relativePath, content);
      
      // Security Analysis
      this.analyzeSecurity(relativePath, content);
      
      // Code Quality Analysis
      this.analyzeCodeQuality(relativePath, content);
      
      this.fileStats.analyzedFiles++;
    } catch (error) {
      this.results.syntaxErrors.push({
        file: relativePath,
        line: 0,
        type: 'ANALYSIS_ERROR',
        message: `Failed to analyze file: ${error.message}`,
        severity: 'HIGH'
      });
      this.fileStats.errorCount++;
    }
  }

  checkSyntaxErrors(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for unterminated strings
      const stringMatches = line.match(/["'`]/g);
      if (stringMatches && stringMatches.length % 2 !== 0) {
        // More sophisticated check for actual unterminated strings
        const quotes = line.match(/(?<!\\)["'`]/g);
        if (quotes && quotes.length % 2 !== 0) {
          this.results.syntaxErrors.push({
            file: filePath,
            line: lineNum,
            type: 'UNTERMINATED_STRING',
            message: `Potential unterminated string literal`,
            code: line.trim(),
            severity: 'HIGH'
          });
        }
      }
      
      // Check for malformed objects
      if (line.includes('return {;') || line.includes('= {;')) {
        this.results.syntaxErrors.push({
          file: filePath,
          line: lineNum,
          type: 'MALFORMED_OBJECT',
          message: 'Malformed object literal with semicolon',
          code: line.trim(),
          severity: 'HIGH'
        });
      }
      
      // Check for malformed arrow functions
      if (line.includes('= > {') || line.includes('=> >{')) {
        this.results.syntaxErrors.push({
          file: filePath,
          line: lineNum,
          type: 'MALFORMED_ARROW_FUNCTION',
          message: 'Malformed arrow function syntax',
          code: line.trim(),
          severity: 'HIGH'
        });
      }
      
      // Check for double quotes corruption
      if (line.includes('""') && !line.includes('""""')) {
        const doubleQuotePattern = /""/g;
        if (doubleQuotePattern.test(line)) {
          this.results.syntaxErrors.push({
            file: filePath,
            line: lineNum,
            type: 'DOUBLE_QUOTE_CORRUPTION',
            message: 'Potential double quote corruption',
            code: line.trim(),
            severity: 'MEDIUM'
          });
        }
      }
      
      // Check for template literal corruption
      if (line.includes('`;') || line.includes('`"')) {
        this.results.syntaxErrors.push({
          file: filePath,
          line: lineNum,
          type: 'TEMPLATE_LITERAL_CORRUPTION',
          message: 'Potential template literal corruption',
          code: line.trim(),
          severity: 'HIGH'
        });
      }
      
      // Check for missing semicolons in critical places
      if (line.match(/^\s*(import|export).*[^;]$/)) {
        this.results.syntaxErrors.push({
          file: filePath,
          line: lineNum,
          type: 'MISSING_SEMICOLON',
          message: 'Missing semicolon in import/export statement',
          code: line.trim(),
          severity: 'MEDIUM'
        });
      }
    });
  }

  analyzeImports(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for import statement issues
      if (line.trim().startsWith('import')) {
        // Check for malformed import paths
        if (line.includes('"../') && !line.includes('.ts') && !line.includes('.tsx') && !line.includes('.js') && !line.includes('.jsx') && !line.includes('.json')) {
          const importMatch = line.match(/from\s+["']([^"']+)["']/);
          if (importMatch) {
            const importPath = importMatch[1];
            if (importPath.startsWith('./') || importPath.startsWith('../')) {
              this.results.importErrors.push({
                file: filePath,
                line: lineNum,
                type: 'MISSING_EXTENSION',
                message: `Import path may be missing file extension: ${importPath}`,
                code: line.trim(),
                severity: 'MEDIUM'
              });
            }
          }
        }
        
        // Check for unused imports (basic check)
        const importMatch = line.match(/import\s+\{([^}]+)\}/);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(i => i.trim());
          imports.forEach(importName => {
            if (importName && !content.includes(importName)) {
              this.results.importErrors.push({
                file: filePath,
                line: lineNum,
                type: 'UNUSED_IMPORT',
                message: `Potentially unused import: ${importName}`,
                code: line.trim(),
                severity: 'LOW'
              });
            }
          });
        }
      }
    });
  }

  analyzeTypeScript(filePath, content) {
    // Check for TypeScript specific issues
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for any type assertions
      if (line.includes(' as ') || line.includes('<') && line.includes('>')) {
        this.results.typeErrors.push({
          file: filePath,
          line: lineNum,
          type: 'TYPE_ASSERTION',
          message: 'Type assertion detected - review for type safety',
          code: line.trim(),
          severity: 'LOW'
        });
      }
      
      // Check for implicit any
      if (line.includes(': any') || line.includes('any[]')) {
        this.results.typeErrors.push({
          file: filePath,
          line: lineNum,
          type: 'EXPLICIT_ANY',
          message: 'Explicit any type - consider more specific typing',
          code: line.trim(),
          severity: 'MEDIUM'
        });
      }
      
      // Check for missing return types on functions
      if (line.match(/function\s+\w+\([^)]*\)\s*\{/) && !line.includes(': ')) {
        this.results.typeErrors.push({
          file: filePath,
          line: lineNum,
          type: 'MISSING_RETURN_TYPE',
          message: 'Function missing explicit return type',
          code: line.trim(),
          severity: 'LOW'
        });
      }
    });
  }

  analyzeReact(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for missing keys in map operations
      if (line.includes('.map(') && !line.includes('key=')) {
        this.results.logicErrors.push({
          file: filePath,
          line: lineNum,
          type: 'MISSING_REACT_KEY',
          message: 'Map operation potentially missing key prop',
          code: line.trim(),
          severity: 'MEDIUM'
        });
      }
      
      // Check for inline styles (performance concern)
      if (line.includes('style={{')) {
        this.results.performanceIssues.push({
          file: filePath,
          line: lineNum,
          type: 'INLINE_STYLES',
          message: 'Inline styles can impact performance',
          code: line.trim(),
          severity: 'LOW'
        });
      }
      
      // Check for accessibility issues
      if (line.includes('<img') && !line.includes('alt=')) {
        this.results.accessibilityIssues.push({
          file: filePath,
          line: lineNum,
          type: 'MISSING_ALT_TEXT',
          message: 'Image missing alt attribute',
          code: line.trim(),
          severity: 'MEDIUM'
        });
      }
      
      if (line.includes('<button') && !line.includes('aria-label') && !line.includes('aria-describedby')) {
        this.results.accessibilityIssues.push({
          file: filePath,
          line: lineNum,
          type: 'MISSING_ARIA_LABEL',
          message: 'Button potentially missing aria-label',
          code: line.trim(),
          severity: 'MEDIUM'
        });
      }
    });
  }

  analyzeLogic(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for console.log statements
      if (line.includes('console.log')) {
        this.results.codeSmells.push({
          file: filePath,
          line: lineNum,
          type: 'CONSOLE_LOG',
          message: 'Console.log statement found - remove before production',
          code: line.trim(),
          severity: 'LOW'
        });
      }
      
      // Check for TODO/FIXME comments
      if (line.includes('TODO') || line.includes('FIXME') || line.includes('HACK')) {
        this.results.codeSmells.push({
          file: filePath,
          line: lineNum,
          type: 'TODO_COMMENT',
          message: 'TODO/FIXME comment found',
          code: line.trim(),
          severity: 'LOW'
        });
      }
      
      // Check for empty catch blocks
      if (line.includes('catch') && line.includes('{}')) {
        this.results.logicErrors.push({
          file: filePath,
          line: lineNum,
          type: 'EMPTY_CATCH',
          message: 'Empty catch block - should handle errors',
          code: line.trim(),
          severity: 'MEDIUM'
        });
      }
    });
  }

  analyzePerformance(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for inefficient array operations
      if (line.includes('.indexOf(') && content.includes('.includes(')) {
        this.results.performanceIssues.push({
          file: filePath,
          line: lineNum,
          type: 'INEFFICIENT_ARRAY_SEARCH',
          message: 'Consider using .includes() instead of .indexOf()',
          code: line.trim(),
          severity: 'LOW'
        });
      }
      
      // Check for potential memory leaks
      if (line.includes('setInterval') && !content.includes('clearInterval')) {
        this.results.performanceIssues.push({
          file: filePath,
          line: lineNum,
          type: 'POTENTIAL_MEMORY_LEAK',
          message: 'setInterval without clearInterval may cause memory leak',
          code: line.trim(),
          severity: 'MEDIUM'
        });
      }
    });
  }

  analyzeSecurity(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for dangerous HTML insertion
      if (line.includes('dangerouslySetInnerHTML') || line.includes('innerHTML')) {
        this.results.securityConcerns.push({
          file: filePath,
          line: lineNum,
          type: 'XSS_RISK',
          message: 'Potential XSS vulnerability with HTML insertion',
          code: line.trim(),
          severity: 'HIGH'
        });
      }
      
      // Check for eval usage
      if (line.includes('eval(')) {
        this.results.securityConcerns.push({
          file: filePath,
          line: lineNum,
          type: 'EVAL_USAGE',
          message: 'eval() usage is dangerous and should be avoided',
          code: line.trim(),
          severity: 'HIGH'
        });
      }
      
      // Check for hardcoded credentials patterns
      if (line.match(/(password|secret|key|token)\s*[=:]\s*["'][^"']+["']/i)) {
        this.results.securityConcerns.push({
          file: filePath,
          line: lineNum,
          type: 'HARDCODED_SECRET',
          message: 'Potential hardcoded secret or credential',
          code: line.trim(),
          severity: 'HIGH'
        });
      }
    });
  }

  analyzeCodeQuality(filePath, content) {
    const lines = content.split('\n');
    
    // Check function length
    let functionLines = 0;
    let inFunction = false;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      if (line.match(/function\s+\w+|=>\s*\{|:\s*\([^)]*\)\s*=>/)) {
        inFunction = true;
        functionLines = 0;
      }
      
      if (inFunction) {
        functionLines++;
        if (line.includes('}') && !line.includes('{')) {
          if (functionLines > 50) {
            this.results.codeSmells.push({
              file: filePath,
              line: lineNum - functionLines,
              type: 'LONG_FUNCTION',
              message: `Function is ${functionLines} lines long - consider breaking it down`,
              severity: 'MEDIUM'
            });
          }
          inFunction = false;
        }
      }
      
      // Check line length
      if (line.length > 120) {
        this.results.codeSmells.push({
          file: filePath,
          line: lineNum,
          type: 'LONG_LINE',
          message: `Line is ${line.length} characters long`,
          code: line.substring(0, 100) + '...',
          severity: 'LOW'
        });
      }
    });
  }

  async scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        // Skip certain directories
        if (['node_modules', '.git', 'dist', 'build', '.vscode'].includes(item.name)) {
          continue;
        }
        await this.scanDirectory(fullPath);
      } else if (item.isFile()) {
        this.fileStats.totalFiles++;
        
        // Only analyze relevant file types
        const ext = path.extname(item.name);
        if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            this.analyzeFile(fullPath, content);
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error.message);
            this.fileStats.skipeedFiles++;
          }
        } else {
          this.fileStats.skipeedFiles++;
        }
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalIssues: Object.values(this.results).reduce((sum, arr) => sum + arr.length, 0),
        criticalIssues: Object.values(this.results).reduce((sum, arr) => 
          sum + arr.filter(issue => issue.severity === 'HIGH').length, 0),
        fileStats: this.fileStats
      },
      issues: this.results
    };
    
    return report;
  }
}

async function main() {
  console.log('🔍 Starting Comprehensive Code Analysis...\n');
  
  const analyzer = new CodeAnalyzer();
  
  try {
    await analyzer.scanDirectory('./src');
    const report = analyzer.generateReport();
    
    // Save detailed report
    fs.writeFileSync('comprehensive-analysis-report.json', JSON.stringify(report, null, 2));
    
    // Generate summary
    console.log('\n📊 ANALYSIS COMPLETE');
    console.log('='.repeat(50));
    console.log(`Total Files Scanned: ${report.summary.fileStats.totalFiles}`);
    console.log(`Files Analyzed: ${report.summary.fileStats.analyzedFiles}`);
    console.log(`Files Skipped: ${report.summary.fileStats.skipeedFiles}`);
    console.log(`Analysis Errors: ${report.summary.fileStats.errorCount}`);
    console.log(`\nTotal Issues Found: ${report.summary.totalIssues}`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    
    console.log('\n📋 Issues By Category:');
    Object.entries(report.issues).forEach(([category, issues]) => {
      if (issues.length > 0) {
        console.log(`  ${category}: ${issues.length}`);
      }
    });
    
    console.log('\n📄 Detailed report saved to: comprehensive-analysis-report.json');
    
  } catch (error) {
    console.error('Analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CodeAnalyzer;
