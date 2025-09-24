const fs = require('fs');
const path = require('path');

// Function to recursively find all JS/JSX files
function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Function to fix API endpoints in a file
function fixApiEndpoints(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern to match API calls with /api/ prefix
    const patterns = [
      {
        regex: /API\.(get|post|put|patch|delete)\(['"]\/api\/([^'"]*)['"]/g,
        replacement: "API.$1('/$2'"
      },
      {
        regex: /api\.(get|post|put|patch|delete)\(['"]\/api\/([^'"]*)['"]/g,
        replacement: "api.$1('/$2'"
      },
      {
        regex: /fetch\(['"]\/api\/([^'"]*)['"]/g,
        replacement: "fetch('/$1'"
      },
      {
        regex: /endpoints\.([^:]+):\s*['"]\/api\/([^'"]*)['"]/g,
        replacement: "endpoints.$1: '/$2'"
      }
    ];
    
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.regex, pattern.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);
let fixedCount = 0;

console.log(`Found ${files.length} files to check...`);

files.forEach(file => {
  if (fixApiEndpoints(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with API endpoint issues`);
