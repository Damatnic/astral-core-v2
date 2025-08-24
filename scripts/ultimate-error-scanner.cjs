const fs = require('fs');
const path = require('path');

// Ultimate comprehensive error patterns to fix
const ultimateFixes = [
  // Fix all $2 and similar replacement artifacts (enhanced)
  {
    name: 'Fix $2 export patterns',
    pattern: /\$2 default (\w+)/g,
    replacement: 'export default $1'
  },
  {
    name: 'Fix $2 const patterns',
    pattern: /\$2 const (\w+)/g,
    replacement: 'export const $1'
  },
  {
    name: 'Fix $2 class patterns',
    pattern: /\$2 (\w+): React\.FC/g,
    replacement: 'const $1: React.FC'
  },
  {
    name: 'Fix $2 variable patterns',
    pattern: /\$2 (\w+) = /g,
    replacement: 'const $1 = '
  },
  {
    name: 'Fix $2 function patterns',
    pattern: /\$2 (\w+)\(/g,
    replacement: 'const $1 = ('
  },
  {
    name: 'Fix $2Name patterns in JSX',
    pattern: /\$2Name=/g,
    replacement: 'className='
  },
  {
    name: 'Fix useState destructuring',
    pattern: /\$2 \[(\w+), (\w+)\] = useState/g,
    replacement: 'const [$1, $2] = useState'
  },
  {
    name: 'Fix useRef patterns',
    pattern: /\$2 (\w+) = useRef/g,
    replacement: 'const $1 = useRef'
  },
  {
    name: 'Fix $2 interface patterns',
    pattern: /\$2 (\w+) {/g,
    replacement: 'interface $1 {'
  },
  {
    name: 'Fix $2 type patterns',
    pattern: /\$2 (\w+) =/g,
    replacement: 'type $1 ='
  },
  {
    name: 'Fix $2 class declaration patterns',
    pattern: /\$2 (\w+) { private/g,
    replacement: 'class $1 {\n  private'
  },
  {
    name: 'Fix any remaining $2 patterns',
    pattern: /\$2 /g,
    replacement: ''
  },
  
  // Fix double semicolons
  {
    name: 'Remove double semicolons',
    pattern: /;\s*;\s*$/gm,
    replacement: ';'
  },
  
  // Fix malformed object properties
  {
    name: 'Fix semicolons in object properties',
    pattern: /(\w+:\s*[^,;{}]+);\s*$/gm,
    replacement: '$1'
  },
  
  // Fix malformed JSX closing tags
  {
    name: 'Fix malformed JSX closing',
    pattern: /}><\/\$1>/g,
    replacement: '}>'
  },
  
  // Fix comment semicolons
  {
    name: 'Fix comment ending semicolons',
    pattern: /\/\/.*?;\s*$/gm,
    replacement: (match) => match.replace(/;\s*$/, '')
  },
  
  // Fix export/import statement issues
  {
    name: 'Fix export statement semicolons',
    pattern: /export\s+{\s*([^}]+);\s*}/g,
    replacement: 'export { $1 }'
  },
  
  // Fix object literal semicolons
  {
    name: 'Fix object literal ending semicolons',
    pattern: /(\w+:\s*[^,;{}]+);\s*\n\s*}/g,
    replacement: '$1\n  }'
  },
  
  // Fix function parameter semicolons
  {
    name: 'Fix function parameter semicolons',
    pattern: /\(([^)]+);\)/g,
    replacement: '($1)'
  },
  
  // Fix array/object destructuring
  {
    name: 'Fix destructuring semicolons',
    pattern: /{\s*([^}]+);\s*}/g,
    replacement: '{ $1 }'
  },
  
  // Fix malformed if statements
  {
    name: 'Fix if statement conditions',
    pattern: /if\(\s*;\s*/g,
    replacement: 'if('
  },
  
  // Fix extra spaces and formatting
  {
    name: 'Fix extra spaces before semicolons',
    pattern: /\s+;\s*$/gm,
    replacement: ';'
  },
  
  // Fix malformed return statements
  {
    name: 'Fix return statement formatting',
    pattern: /return\s+{\s*([^}]+);\s*}/g,
    replacement: 'return { $1 }'
  },
  
  // Fix missing closing braces in objects
  {
    name: 'Fix missing closing braces in object literals',
    pattern: /{\s*([^{}]+)\s*\n\s*([a-zA-Z_$][\w$]*\s*[:=])/g,
    replacement: '{\n  $1\n};\n\n$2'
  },
  
  // Fix malformed type declarations
  {
    name: 'Fix malformed type declarations',
    pattern: /const\s+(\w+)\s+=\s+"([^"]+)"\s+\|\s+"([^"]+)"/g,
    replacement: 'type $1 = "$2" | "$3"'
  },
  
  // Fix missing semicolons in interface properties
  {
    name: 'Fix missing semicolons in interface properties',
    pattern: /(\w+:\s*\w+)\s*\n\s*(\w+:)/g,
    replacement: '$1;\n  $2'
  },
  
  // Fix malformed class declarations
  {
    name: 'Fix malformed class declarations with missing opening brace',
    pattern: /class\s+(\w+)\s+{\s*private/g,
    replacement: 'class $1 {\n  private'
  },
  
  // Fix missing closing braces in functions
  {
    name: 'Fix missing closing braces in function declarations',
    pattern: /(function\s+\w+\([^)]*\)\s*{[^}]+)\n\s*(export|const|function|class|interface)/g,
    replacement: '$1\n}\n\n$2'
  },
  
  // Fix missing closing braces in arrow functions
  {
    name: 'Fix missing closing braces in arrow functions',
    pattern: /(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]+)\n\s*(export|const|function|class|interface)/g,
    replacement: '$1\n};\n\n$2'
  },
  
  // Fix malformed useEffect cleanup
  {
    name: 'Fix malformed useEffect cleanup functions',
    pattern: /return\s*\(\)\s*=>\s*{\s*([^}]+)\s*\n\s*},\s*\[/g,
    replacement: 'return () => {\n      $1\n    };\n  }, ['
  },
  
  // Fix missing closing braces in JSX
  {
    name: 'Fix missing closing braces in JSX expressions',
    pattern: /{([^{}]+)\n\s*</g,
    replacement: '{$1}\n    <'
  },
  
  // Fix malformed import statements
  {
    name: 'Fix malformed import statements',
    pattern: /import\s*{\s*([^}]+);\s*}/g,
    replacement: 'import { $1 }'
  },
  
  // Fix missing colons in object properties
  {
    name: 'Fix missing colons in object properties',
    pattern: /(\w+)\s+(['"]\w+['"]|[\d.]+|true|false|null|undefined)\s*,/g,
    replacement: '$1: $2,'
  },
  
  // Fix missing commas in object literals
  {
    name: 'Fix missing commas in object literals',
    pattern: /(\w+:\s*[^,\n}]+)\s*\n\s*(\w+:)/g,
    replacement: '$1,\n  $2'
  },
  
  // Fix comment syntax errors
  {
    name: 'Fix comment ending with semicolons',
    pattern: /\/\/.*?;\s*$/gm,
    replacement: (match) => match.replace(/;\s*$/, '')
  },
  
  // Fix malformed conditional statements
  {
    name: 'Fix malformed if statements with missing opening parenthesis',
    pattern: /if\s*;\s*\(/g,
    replacement: 'if ('
  },
  
  // Fix missing closing parentheses
  {
    name: 'Fix missing closing parentheses in function calls',
    pattern: /(\w+\([^)]+)\s*\n\s*([;}])/g,
    replacement: '$1)\n$2'
  }
];

function scanAndFixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;
    
    ultimateFixes.forEach(fix => {
      const originalContent = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== originalContent) {
        modified = true;
        const matches = originalContent.match(fix.pattern);
        if (matches) {
          fixCount += matches.length;
          console.log(`  ✓ ${fix.name}: ${matches.length} fixes`);
        }
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return fixCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function scanDirectory(dirPath) {
  let totalFixes = 0;
  let filesProcessed = 0;
  
  function processDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
        processDirectory(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        console.log(`\nProcessing: ${fullPath}`);
        const fixes = scanAndFixFile(fullPath);
        if (fixes > 0) {
          totalFixes += fixes;
          filesProcessed++;
          console.log(`  → ${fixes} total fixes applied`);
        }
      }
    });
  }
  
  processDirectory(dirPath);
  return { totalFixes, filesProcessed };
}

console.log('🔍 Starting Ultimate Error Scanner...\n');
console.log('Scanning patterns:');
ultimateFixes.forEach((fix, index) => {
  console.log(`${index + 1}. ${fix.name}`);
});
console.log('\n' + '='.repeat(50) + '\n');

const srcPath = path.join(process.cwd(), 'src');
const { totalFixes, filesProcessed } = scanDirectory(srcPath);

console.log('\n' + '='.repeat(50));
console.log(`🎉 Ultimate Error Scanner Complete!`);
console.log(`📊 Total fixes applied: ${totalFixes}`);
console.log(`📁 Files modified: ${filesProcessed}`);
console.log('='.repeat(50));
